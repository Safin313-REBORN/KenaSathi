const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/home/safin313/.gemini/antigravity-ide/brain/7b7821c1-77cd-4a92-a410-7e79dd7431b8';
const PORT = 9222;
const APP_URL = 'http://127.0.0.1:4175/';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getWebSocketDebuggerUrl() {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${PORT}/json/list`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          if (list.length > 0 && list[0].webSocketDebuggerUrl) {
            resolve(list[0].webSocketDebuggerUrl);
          } else {
            reject(new Error('No target page available'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
  }

  init() {
    return new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (msg) => {
        const data = JSON.parse(msg.toString());
        if (data.id && this.callbacks.has(data.id)) {
          const cb = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) cb.reject(data.error);
          else cb.resolve(data.result);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : null;
  }

  async screenshot(filename, clip = null) {
    const params = { format: 'png' };
    if (clip) params.clip = clip;
    const res = await this.send('Page.captureScreenshot', params);
    const filepath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${filename} (${(res.data.length * 0.75 / 1024).toFixed(1)} KB)`);
  }

  async setViewport(width, height, isMobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: isMobile
    });
  }
}

async function run() {
  console.log('Launching headless Chrome with debugging on port 9222...');
  const chromeProcess = spawn('google-chrome', [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--hide-scrollbars',
    APP_URL
  ], { stdio: 'ignore' });

  // Wait for Chrome to listen
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      wsUrl = await getWebSocketDebuggerUrl();
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('Failed to get WebSocket URL from Chrome');
    chromeProcess.kill();
    process.exit(1);
  }

  console.log('Connected to Chrome DevTools Protocol at:', wsUrl);
  const cdp = new CDPClient(wsUrl);
  await cdp.init();

  await cdp.send('Page.enable');
  await cdp.send('DOM.enable');
  await cdp.send('Runtime.enable');

  // Navigate to APP_URL
  await cdp.send('Page.navigate', { url: APP_URL });
  await sleep(2000);

  // 1. Bengali Homepage — Desktop (1280x850)
  console.log('\n--- 1. Capturing Bengali Homepage (Desktop) ---');
  await cdp.setViewport(1280, 850, false);
  await sleep(1000);
  await cdp.screenshot('01_homepage_bn_desktop.png');

  // 2. Bengali Homepage — Mobile (390x844)
  console.log('\n--- 2. Capturing Bengali Homepage (Mobile 390px) ---');
  await cdp.setViewport(390, 844, true);
  await sleep(1000);
  await cdp.screenshot('02_homepage_bn_mobile.png');

  // Switch back to Desktop
  await cdp.setViewport(1280, 850, false);
  await sleep(500);

  // 3. English Homepage — Desktop
  console.log('\n--- 3. Capturing English Homepage (Desktop) ---');
  // Click on language switch button in header
  await cdp.evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const engBtn = buttons.find(b => b.textContent.includes('English') || b.textContent.includes('Eng'));
    if (engBtn) engBtn.click();
  })()`);
  await sleep(1000);
  await cdp.screenshot('03_homepage_en_desktop.png');

  // Switch back to Bengali
  await cdp.evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bnBtn = buttons.find(b => b.textContent.includes('বাংলা') || b.textContent.includes('বাং'));
    if (bnBtn) bnBtn.click();
  })()`);
  await sleep(1000);

  // 4. Services Page (Desktop)
  console.log('\n--- 4. Capturing Services Page ---');
  await cdp.evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const srvBtn = buttons.find(b => b.textContent.includes('সেবাসমূহ') || b.textContent.includes('Services'));
    if (srvBtn) srvBtn.click();
  })()`);
  await sleep(1200);
  await cdp.screenshot('04_services_page.png');

  // 5. Purchase Intake Form Modal
  console.log('\n--- 5. Capturing Purchase Intake Form Modal ---');
  await cdp.evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const intakeBtn = buttons.find(b => b.textContent.includes('অভিযোগ প্রস্তুত করুন') || b.textContent.includes('নতুন অভিযোগ প্রস্তুত করুন'));
    if (intakeBtn) intakeBtn.click();
  })()`);
  await sleep(1200);
  await cdp.screenshot('05_purchase_intake_modal.png');

  // Close the intake modal or cancel
  await cdp.evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cancelBtn = buttons.find(b => b.textContent.trim() === 'বাতিল' || b.getAttribute('aria-label') === 'Close');
    if (cancelBtn) cancelBtn.click();
  })()`);
  await sleep(800);

  // 6. Load Demo Scenario & Inspect Results
  console.log('\n--- 6. Capturing Purchase Inspection Results ---');
  // Navigate to Home or use command palette or demo card
  await cdp.evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const homeBtn = buttons.find(b => b.textContent.includes('হোম'));
    if (homeBtn) homeBtn.click();
  })()`);
  await sleep(800);

  // Click on the fictional demo card button
  await cdp.evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const demoBtn = buttons.find(b => b.textContent.includes('নমুনা বিরোধ পর্যালোচনা করুন') || b.textContent.includes('নমুনা ডেমো'));
    if (demoBtn) demoBtn.click();
  })()`);
  await sleep(1500);
  await cdp.screenshot('06_purchase_inspection_results.png');

  // 7. My Cases Workspace
  console.log('\n--- 7. Capturing My Cases Workspace ---');
  await cdp.evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const casesBtn = buttons.find(b => b.textContent.includes('আমার বিরোধ'));
    if (casesBtn) casesBtn.click();
  })()`);
  await sleep(1200);
  await cdp.screenshot('07_my_cases_view.png');

  // 8. Complaint Draft Tab inside Case
  console.log('\n--- 8. Capturing Complaint Draft ---');
  await cdp.evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const draftTab = buttons.find(b => b.textContent.includes('নালিশনামা') || b.textContent.includes('অভিযোগের খসড়া') || b.textContent.includes('আইনি খসড়া'));
    if (draftTab) draftTab.click();
  })()`);
  await sleep(1500);
  await cdp.screenshot('08_complaint_draft_view.png');

  // 9. Documents Page
  console.log('\n--- 9. Capturing My Documents Page ---');
  await cdp.evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const docsBtn = buttons.find(b => b.textContent.includes('আমার নথিপত্র'));
    if (docsBtn) docsBtn.click();
  })()`);
  await sleep(1200);
  await cdp.screenshot('09_documents_page.png');

  // 10. Consumer Rights Guide
  console.log('\n--- 10. Capturing Consumer Rights Guide ---');
  await cdp.evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const guideBtn = buttons.find(b => b.textContent.includes('ভোক্তা অধিকার') && !b.textContent.includes('সহায়তা'));
    if (guideBtn) guideBtn.click();
  })()`);
  await sleep(1200);
  await cdp.screenshot('10_consumer_guide_directory.png');

  console.log('\nAll 10 required QA screenshots successfully captured!');
  chromeProcess.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Error in capture script:', err);
  process.exit(1);
});
