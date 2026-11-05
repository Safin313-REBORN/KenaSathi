import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { HELP_FAQS } from './helpFaqs.mjs';

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '127.0.0.1';
const dbPath = resolve(process.env.KENASATHI_HELP_DB || 'data/kenasathi-help.sqlite');
const distPath = resolve('dist');
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS help_faqs (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    question_bn TEXT NOT NULL,
    question_en TEXT NOT NULL,
    answer_bn TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    keywords_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const seed = db.prepare(`
  INSERT INTO help_faqs (id, category, question_bn, question_en, answer_bn, answer_en, keywords_json)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    category=excluded.category, question_bn=excluded.question_bn,
    question_en=excluded.question_en, answer_bn=excluded.answer_bn,
    answer_en=excluded.answer_en, keywords_json=excluded.keywords_json,
    updated_at=CURRENT_TIMESTAMP
`);
db.exec('BEGIN');
try {
  for (const faq of HELP_FAQS) {
    seed.run(faq.id, faq.category, faq.questionBn, faq.questionEn, faq.answerBn, faq.answerEn, JSON.stringify(faq.keywords));
  }
  db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (1)').run();
  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
}

const rateWindows = new Map();
const MAX_BODY_BYTES = 4096;
const MAX_REQUESTS_PER_MINUTE = 30;
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'content-security-policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  });
  res.end(body);
}

async function serveFrontend(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    send(res, 400, { error: 'Invalid path' });
    return true;
  }

  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  let filePath = resolve(distPath, relativePath);
  if (filePath !== distPath && !filePath.startsWith(`${distPath}${sep}`)) {
    send(res, 400, { error: 'Invalid path' });
    return true;
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error('Not a file');
  } catch {
    if (extname(decodedPath)) {
      send(res, 404, { error: 'Not found' });
      return true;
    }
    filePath = resolve(distPath, 'index.html');
  }

  try {
    const content = await readFile(filePath);
    const extension = extname(filePath).toLowerCase();
    const isHashedAsset = decodedPath.startsWith('/assets/');
    res.writeHead(200, {
      'content-type': MIME_TYPES[extension] || 'application/octet-stream',
      'content-length': content.length,
      'cache-control': isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {
    send(res, 503, { error: 'Frontend build is missing. Run npm run build before starting the production server.' });
  }
  return true;
}

function rateLimited(req) {
  const now = Date.now();
  const address = req.socket.remoteAddress || 'unknown';
  const current = rateWindows.get(address);
  if (!current || now - current.startedAt >= 60_000) {
    rateWindows.set(address, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_MINUTE;
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Request too large'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { status: 400 });
  }
}

function listFaqs(lang, search = '') {
  const rows = db.prepare('SELECT * FROM help_faqs ORDER BY rowid').all();
  const query = search.trim().toLocaleLowerCase();
  return rows.filter((row) => {
    if (!query) return true;
    return [row.question_bn, row.question_en, row.answer_bn, row.answer_en, ...JSON.parse(row.keywords_json)]
      .some((value) => value.toLocaleLowerCase().includes(query));
  }).map((row) => ({
    id: row.id,
    category: row.category,
    question: lang === 'bn' ? row.question_bn : row.question_en,
    answer: lang === 'bn' ? row.answer_bn : row.answer_en,
  }));
}

function selectAnswer(message, lang) {
  const normalized = message.toLocaleLowerCase().replace(/[?!।,.:;]+/g, ' ').trim();
  const tokens = normalized.split(/\s+/).filter((token) => token.length > 1);
  const rows = db.prepare('SELECT * FROM help_faqs').all();
  const ranked = rows.map((row) => {
    const searchText = [row.question_bn, row.question_en, row.answer_bn, row.answer_en, ...JSON.parse(row.keywords_json)]
      .join(' ').toLocaleLowerCase();
    const keywordScore = JSON.parse(row.keywords_json).reduce((score, keyword) =>
      score + (normalized.includes(keyword.toLocaleLowerCase()) ? 3 : 0), 0);
    const tokenScore = tokens.reduce((score, token) => score + (searchText.includes(token) ? 1 : 0), 0);
    return { row, score: keywordScore + tokenScore };
  }).sort((a, b) => b.score - a.score);
  const top = ranked[0];
  if (top && top.score >= 3) {
    return {
      answer: lang === 'bn' ? top.row.answer_bn : top.row.answer_en,
      related: ranked.filter((item) => item.score >= 2).slice(0, 3).map(({ row }) => ({
        id: row.id,
        question: lang === 'bn' ? row.question_bn : row.question_en,
      })),
      matched: true,
    };
  }
  return {
    answer: lang === 'bn'
      ? 'এই প্রশ্নের নির্ভরযোগ্য উত্তর সহায়িকা থেকে খুঁজে পাইনি। আপনার জাতীয় পরিচয়পত্র, ফোন নম্বর, ঠিকানা বা কেসের নথি এখানে লিখবেন না। সরকারি নির্দেশনার জন্য DNCRP হটলাইন ১৬১২১-এ যোগাযোগ করুন অথবা নিচের প্রশ্নোত্তরগুলো দেখুন।'
      : 'I could not find a reliable answer in this help guide. Please do not share your NID, phone number, address, or case documents here. Contact the DNCRP helpline at 16121 for official guidance, or browse the FAQs below.',
    related: rows.slice(0, 3).map((row) => ({
      id: row.id,
      question: lang === 'bn' ? row.question_bn : row.question_en,
    })),
    matched: false,
  };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'OPTIONS') return send(res, 405, { error: 'Method not allowed' });
  if (url.pathname === '/api/health' && req.method === 'GET') {
    return send(res, 200, { status: 'ok', service: 'kenasathi-help', database: 'sqlite' });
  }
  if (url.pathname === '/api/help/faqs' && req.method === 'GET') {
    const lang = url.searchParams.get('lang') === 'bn' ? 'bn' : 'en';
    const search = (url.searchParams.get('q') || '').slice(0, 120);
    return send(res, 200, { faqs: listFaqs(lang, search) });
  }
  if (url.pathname === '/api/help/chat' && req.method === 'POST') {
    if (rateLimited(req)) return send(res, 429, { error: 'Too many questions. Try again in a minute.' });
    if (!req.headers['content-type']?.includes('application/json')) {
      return send(res, 415, { error: 'JSON is required' });
    }
    try {
      const body = await readJson(req);
      if (!body || typeof body.message !== 'string' || body.message.trim().length < 2 || body.message.length > 500) {
        return send(res, 400, { error: 'Enter a question between 2 and 500 characters.' });
      }
      const lang = body.lang === 'bn' ? 'bn' : 'en';
      return send(res, 200, selectAnswer(body.message.trim(), lang));
    } catch (error) {
      return send(res, error.status || 400, { error: error.message || 'Invalid request' });
    }
  }
  if (!url.pathname.startsWith('/api/')) {
    if (await serveFrontend(req, res, url.pathname)) return;
  }
  return send(res, 404, { error: 'Not found' });
});

server.listen(port, host, () => {
  console.log(`KenaSathi server listening at http://${host}:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => {
    db.close();
    process.exit(0);
  }));
}
