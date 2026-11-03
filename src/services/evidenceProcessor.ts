import { EvidenceItem, ExtractedFact } from '../types/consumer';
import { EvidenceBlobStorage } from './evidenceDb';

export interface ProcessedEvidenceResult {
  evidenceItems: EvidenceItem[];
  detectedFacts: ExtractedFact[];
  rawTextExtracted: string;
  detectedTrxId?: string;
  detectedAmountBdt?: number;
  detectedSeller?: string;
  detectedPromise?: string;
  unknownFields: string[];
}

// Format bytes into human-readable string
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Convert a File into a Data URL for preview and base64 multimodal transmission
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Robust PDF text extraction using pdfjs-dist with page-by-page bounds (Max 10 pages)
export async function extractTextFromPdfBuffer(file: File): Promise<{
  text: string;
  pageCount: number;
  isScannedOrEmpty: boolean;
}> {
  // Max size limit: 10MB to prevent browser crash
  if (file.size > 10 * 1024 * 1024) {
    return {
      text: '',
      pageCount: 0,
      isScannedOrEmpty: true,
    };
  }

  try {
    const buffer = await file.arrayBuffer();
    // Dynamic import to support both Vite browser bundling and Node tests
    const pdfjs = await import('pdfjs-dist');
    const getDocument = pdfjs.getDocument || (pdfjs as unknown as { default: { getDocument: typeof pdfjs.getDocument } }).default?.getDocument;

    if (typeof getDocument === 'function') {
      const loadingTask = getDocument({ data: new Uint8Array(buffer) });
      const pdfDoc = await loadingTask.promise;
      const maxPages = Math.min(pdfDoc.numPages, 10);
      const textChunks: string[] = [];

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items
          .map((item) => ('str' in item ? (item as { str: string }).str : ''))
          .filter((s) => s.trim().length > 0);
        if (pageStrings.length > 0) {
          textChunks.push(`[Page ${pageNum}] ${pageStrings.join(' ')}`);
        }
      }

      const combinedText = textChunks.join('\n').trim();
      return {
        text: combinedText,
        pageCount: pdfDoc.numPages,
        isScannedOrEmpty: combinedText.length < 15,
      };
    }
  } catch (err) {
    console.warn('pdfjs-dist extraction failed or unavailable:', err);
  }

  // If pdfjs-dist failed or returned empty text, report unreadable/scanned truthfully
  // Never simulate text by scanning raw binary bytes
  return { text: '', pageCount: 0, isScannedOrEmpty: true };
}

// Extract regex patterns strictly from a single document's own verified text
export function extractTextPatterns(
  docText: string,
  fileId: string,
  fileName: string
): {
  facts: ExtractedFact[];
  trxId?: string;
  amountBdt?: number;
  seller?: string;
  promise?: string;
} {
  const facts: ExtractedFact[] = [];
  let trxId: string | undefined;
  let amountBdt: number | undefined;
  let seller: string | undefined;
  let promise: string | undefined;

  // 1. Regex for bKash / Nagad / Upay TrxID (strict 8-12 alphanumeric characters)
  const trxMatch =
    docText.match(/(?:TrxID|Transaction\s*ID|TxnID|রেফারেন্স)[:\s]*([A-Za-z0-9]{8,12})/i) ||
    docText.match(/\b([B][K][0-9A-Z]{8,10})\b/);

  if (trxMatch && trxMatch[1]) {
    trxId = trxMatch[1].toUpperCase();
    facts.push({
      id: `fact_${fileId}_trx`,
      field: 'transactionRef',
      labelBn: 'লেনদেন রেফারেন্স / TrxID (প্যাটার্ন শনাক্ত)',
      labelEn: 'Transaction Reference / TrxID (Pattern Candidate)',
      value: trxId,
      sourceDocId: fileId,
      sourceDocName: fileName,
      verified: false, // Never claim regex match is independently verified
      factStatus: 'pattern_extracted',
      confidenceLabel: 'pattern_matched',
      extractionMethod: 'regex_heuristic',
      sourceSnippet: trxMatch[0],
    });
  }

  // 2. Regex for BDT currency amounts (e.g., ৳8,500, Tk. 8500, 8500 BDT)
  const amountMatch =
    docText.match(/(?:৳|Tk\.?|BDT|টাকা)\s*([0-9,]{3,9})/i) ||
    docText.match(/([0-9,]{3,9})\s*(?:৳|Tk\.?|BDT|টাকা)/i) ||
    docText.match(/(?:Amount|Total|মূল্য)[:\s]*([0-9,]{3,9})/i);

  if (amountMatch && amountMatch[1]) {
    const rawNum = amountMatch[1].replace(/,/g, '');
    const num = parseInt(rawNum, 10);
    if (!isNaN(num) && num > 50 && num < 10000000) {
      amountBdt = num;
      facts.push({
        id: `fact_${fileId}_amt`,
        field: 'paidAmount',
        labelBn: 'পরিশোধিত মূল্য (প্যাটার্ন শনাক্ত)',
        labelEn: 'Paid Consideration (Pattern Candidate)',
        value: `৳${num.toLocaleString()}`,
        sourceDocId: fileId,
        sourceDocName: fileName,
        verified: false,
        factStatus: 'pattern_extracted',
        confidenceLabel: 'pattern_matched',
        extractionMethod: 'regex_heuristic',
        sourceSnippet: amountMatch[0],
      });
    }
  }

  // 3. Regex for delivery promises (e.g., Delivery within 3 days, ৩ দিনের মধ্যে, 24 hours delivery)
  const deliveryMatch =
    docText.match(/(?:delivery|ডেলিভারি)\s*(?:within|in|মেয়াদ)?\s*([0-9১-৯]+)\s*(?:days?|দিনের|দিন|hours?|ঘণ্টা)/i) ||
    docText.match(/([0-9১-৯]+)\s*(?:days?|দিনের|ঘণ্টার|hours?)\s*(?:home\s*delivery|delivery|ডেলিভারি|মধ্যে)?/i);

  if (deliveryMatch) {
    promise = deliveryMatch[0].trim();
    facts.push({
      id: `fact_${fileId}_del`,
      field: 'deliveryPromise',
      labelBn: 'প্রতিশ্রুত ডেলিভারি মেয়াদ (বিজ্ঞাপন পাঠ)',
      labelEn: 'Promised Delivery Timeframe (Ad Candidate)',
      value: promise,
      sourceDocId: fileId,
      sourceDocName: fileName,
      verified: false,
      factStatus: 'pattern_extracted',
      confidenceLabel: 'pattern_matched',
      extractionMethod: 'regex_heuristic',
      sourceSnippet: deliveryMatch[0],
    });
  }

  // 4. Regex for Seller / Shop name mentions
  const sellerMatch = docText.match(/(?:seller|shop|মার্চেন্ট|পেজ|দোকান)[:\s]*([A-Za-z0-9\s.]{3,30})/i);
  if (sellerMatch && sellerMatch[1]) {
    seller = sellerMatch[1].trim();
    facts.push({
      id: `fact_${fileId}_sel`,
      field: 'sellerName',
      labelBn: 'বিক্রেতা বা পেজের নাম (উল্লেখিত)',
      labelEn: 'Seller / Merchant Name (Referenced)',
      value: seller,
      sourceDocId: fileId,
      sourceDocName: fileName,
      verified: false,
      factStatus: 'pattern_extracted',
      confidenceLabel: 'pattern_matched',
      extractionMethod: 'regex_heuristic',
      sourceSnippet: sellerMatch[0],
    });
  }

  return { facts, trxId, amountBdt, seller, promise };
}

// Process an array of uploaded genuine files individually
export async function processUploadedEvidenceFiles(
  files: File[],
  userDescription: string
): Promise<ProcessedEvidenceResult> {
  const evidenceItems: EvidenceItem[] = [];
  const allDetectedFacts: ExtractedFact[] = [];
  let combinedExtractedText = '';
  let bestTrxId: string | undefined;
  let bestAmount: number | undefined;
  let bestSeller: string | undefined;
  let bestPromise: string | undefined;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileId = `ev_${Date.now()}_${i + 1}`;
    const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
    const sizeStr = formatFileSize(file.size);

    // Determine category based on filename and type
    let docType: EvidenceItem['type'] = 'image';
    if (ext === 'pdf') {
      docType = 'pdf';
    } else if (/receipt|payment|statement|bkash|nagad|চালান|রসিদ/i.test(file.name)) {
      docType = 'receipt';
    } else if (/chat|message|messenger|inbox|হিস্ট্রি/i.test(file.name)) {
      docType = 'chat_screenshot';
    } else if (/ad|post|offer|ফেসবুক|বিজ্ঞাপন/i.test(file.name)) {
      docType = 'advertisement';
    } else if (/courier|slip|steadfast|redx|চালান/i.test(file.name)) {
      docType = 'courier_slip';
    }

    let dataUrl: string | undefined;
    let docExtractedText = '';
    let textExtractionStatus: EvidenceItem['textExtractionStatus'] = 'filename_metadata_only';
    let extractionNoticeBn: string | undefined;
    let extractionNoticeEn: string | undefined;

    try {
      if (file.type.startsWith('image/')) {
        dataUrl = await readFileAsDataUrl(file);
        // Persist binary blob to IndexedDB
        await EvidenceBlobStorage.saveBlob(fileId, file.name, file.type, dataUrl);
        // Local mode does NOT run OCR on images; state this clearly and honestly
        textExtractionStatus = 'ocr_not_run_in_local_mode';
        extractionNoticeBn =
          'স্থানীয় অফলাইন মোডে ইমেজ সংরক্ষিত; ক্লায়েন্ট-সাইড ওসিআর নিষ্ক্রিয়। বিস্তারিত বিশ্লেষণের জন্য ক্লাউড ভিশন এনালাইসিস প্রয়োজন।';
        extractionNoticeEn =
          'Image preview stored in local IndexedDB. Local OCR is not performed; vision AI analysis required for textual extraction.';
      } else if (ext === 'pdf') {
        dataUrl = await readFileAsDataUrl(file);
        await EvidenceBlobStorage.saveBlob(fileId, file.name, 'application/pdf', dataUrl);

        const pdfResult = await extractTextFromPdfBuffer(file);
        if (pdfResult.text && !pdfResult.isScannedOrEmpty) {
          docExtractedText = pdfResult.text;
          textExtractionStatus = 'text_extracted_from_pdf';
          extractionNoticeBn = `পিডিএফ হতে ${pdfResult.pageCount} পৃষ্ঠার টেক্সট সফলভাবে নিষ্কাশন করা হয়েছে।`;
          extractionNoticeEn = `Successfully extracted text from ${pdfResult.pageCount} PDF pages.`;
        } else {
          textExtractionStatus = 'unreadable';
          extractionNoticeBn =
            'স্ক্যানকৃত বা সুরক্ষিত পিডিএফ; নির্বাচনযোগ্য টেক্সট অনুপস্থিত। টেক্সট বিশ্লেষণের জন্য ক্লাউড ভিশন আবশ্যক।';
          extractionNoticeEn =
            'Scanned or secured PDF without selectable text stream. Cloud Vision required.';
        }
      }
    } catch (e) {
      console.warn('Could not read or parse file data for', file.name, e);
      textExtractionStatus = 'unreadable';
      extractionNoticeBn = 'ফাইলটি পড়তে ত্রুটি হয়েছে।';
      extractionNoticeEn = 'Error reading file data.';
    }

    // Inspect verified text ONLY when text was actually extracted (from PDF or text file)
    // NEVER simulate text extraction from images by parsing file.name!
    const textToScan = docExtractedText;
    const patternResult = textToScan
      ? extractTextPatterns(textToScan, fileId, file.name)
      : { facts: [], trxId: undefined, amountBdt: undefined, seller: undefined, promise: undefined };

    if (patternResult.trxId && !bestTrxId) bestTrxId = patternResult.trxId;
    if (patternResult.amountBdt && !bestAmount) bestAmount = patternResult.amountBdt;
    if (patternResult.seller && !bestSeller) bestSeller = patternResult.seller;
    if (patternResult.promise && !bestPromise) bestPromise = patternResult.promise;

    allDetectedFacts.push(...patternResult.facts);

    // Specific verifiable anomaly conditions (Non-accusatory, neutral observation)
    let anomalyDetected = false;
    let anomalyDescriptionBn: string | undefined;
    let anomalyDescriptionEn: string | undefined;

    // Neutral observation: Personal MFS wallet used for payment instead of merchant gateway
    if (docType === 'receipt' && /personal|send\s*money|ব্যক্তিগত/i.test(docExtractedText || file.name)) {
      anomalyDetected = true;
      anomalyDescriptionBn =
        'ব্যক্তিগত মোবাইল ওয়ালেটে অর্থ স্থানান্তর (পিয়ার-টু-পিয়ার চ্যানেল; অফিশিয়াল মার্চেন্ট ইনভয়েসবিহীন লেনদেন)।';
      anomalyDescriptionEn =
        'Peer-to-peer personal mobile wallet transfer noted (lacks official merchant invoice).';
    }

    combinedExtractedText += `\n[নথি ${i + 1}: ${file.name}] ${docExtractedText || '(ছবি ফাইল - স্থানীয় মোডে কোনো ওসিআর টেক্সট নেই)'}`;

    evidenceItems.push({
      id: fileId,
      name: file.name,
      type: docType,
      fileFormat: ext,
      size: sizeStr,
      previewUrl: dataUrl,
      dataUrl, // in-memory for immediate session use
      blobId: fileId, // IndexedDB reference
      uploadedAt: new Date().toISOString().split('T')[0],
      anomalyDetected,
      anomalyDescriptionBn,
      anomalyDescriptionEn,
      forensicStatus: patternResult.facts.length > 0 ? 'pattern_matched' : 'no_signals_detected',
      rawTextSnippet: docExtractedText ? docExtractedText.slice(0, 150) : undefined,
      extractedFacts: patternResult.facts,
      textExtractionStatus,
      extractionNoticeBn,
      extractionNoticeEn,
    });
  }

  // Also extract candidate facts from user's entered description (explicitly tagged as user_reported)
  if (userDescription && userDescription.trim().length > 0) {
    const userPatterns = extractTextPatterns(userDescription, 'user_desc', 'ব্যবহারকারীর লিখিত বিবরণ');
    for (const fact of userPatterns.facts) {
      fact.factStatus = 'user_reported';
      fact.verified = false;
      fact.labelBn += ' (গ্রাহকের তথ্যানুসারে)';
      fact.labelEn += ' (User-reported)';
      // Only add if not already captured from document
      if (!allDetectedFacts.some((f) => f.field === fact.field)) {
        allDetectedFacts.push(fact);
        if (fact.field === 'transactionRef' && !bestTrxId) bestTrxId = fact.value;
        if (fact.field === 'paidAmount' && !bestAmount)
          bestAmount = parseInt(fact.value.replace(/[^0-9]/g, ''), 10);
      }
    }
  }

  // Explicitly identify unknown fields
  const unknownFields: string[] = [];
  if (!allDetectedFacts.some((f) => f.field === 'sellerName')) {
    unknownFields.push('বিক্রেতার নিবন্ধিত নাম বা ট্রেড লাইসেন্স (অজ্ঞাত)');
  }
  if (!allDetectedFacts.some((f) => f.field === 'transactionRef')) {
    unknownFields.push('পেমেন্ট ট্রানজেকশন আইডি / ব্যাংক রেফারেন্স (সংযুক্ত নথিতে অনুপস্থিত)');
  }
  if (!allDetectedFacts.some((f) => f.field === 'deliveryPromise')) {
    unknownFields.push('নির্দিষ্ট ডেলিভারি সময়সীমার লিখিত প্রতিশ্রুতি (বিজ্ঞাপনে অনির্ধারিত)');
  }

  return {
    evidenceItems,
    detectedFacts: allDetectedFacts,
    rawTextExtracted: combinedExtractedText,
    detectedTrxId: bestTrxId,
    detectedAmountBdt: bestAmount,
    detectedSeller: bestSeller,
    detectedPromise: bestPromise,
    unknownFields,
  };
}
