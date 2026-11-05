import test from 'node:test';
import assert from 'node:assert/strict';

// Polyfill localStorage for Node test runner
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => store.set(key, String(val)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
}

import {
  extractTextPatterns,
} from '../src/services/evidenceProcessor.ts';
import {
  calculateSection60Limitation,
} from '../src/services/limitationService.ts';
import {
  runKenaSathiAiAnalysis,
  STATUTE_MAP,
  ModelAnalysisOutputSchema,
  sanitizePiiForCloud,
} from '../src/services/aiService.ts';
import {
  KenaSathiStorage,
  FICTIONAL_HEADPHONE_DEMO_CASE,
  sanitizeCaseForLocalStorage,
} from '../src/services/storageService.ts';
import {
  loadAccessibilityPreferences,
  saveAccessibilityPreferences,
  resetAccessibilityPreferences,
  applyAccessibilityToDOM,
  normalizeAccessibilityPreferences,
  STORAGE_KEY_A11Y,
} from '../src/services/accessibilityPreferences.ts';

// Timezone-safe helper for Bangladesh Standard Time (Asia/Dhaka) calendar dates
function getDhakaDateString(offsetDays: number = 0): string {
  const now = new Date();
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = dtf.format(now).split('-').map(Number);
  const targetUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]) - offsetDays * 86400000;
  const target = new Date(targetUtc);
  return target.toISOString().split('T')[0];
}

// ============================================================================
// TEST SUITE 1: EVIDENCE EXTRACTION & PROVENANCE (P0 Evidence Processing)
// ============================================================================
test('EvidenceProcessor: Extracts bKash TrxID, Nagad TrxID, BDT amount with pattern_extracted status and provenance', () => {
  const adSnippet = 'Flash sale on Sony WH-1000XM5. Price Tk 8,500 only. Delivery within 3 days.';
  const receiptSnippet = 'bKash Send Money Successful. Amount: ৳8500. TrxID: BK9X81729L. Merchant: Gadget Vault.';
  const nagadSnippet = 'Nagad Payment Successful. Amount: Tk. 4,500.00. TrxID: 71A9XZ2K.';

  const adFacts = extractTextPatterns(adSnippet, 'doc_01', 'Facebook Ad.png').facts;
  const receiptFacts = extractTextPatterns(receiptSnippet, 'doc_02', 'bKash Statement.jpg').facts;
  const nagadFacts = extractTextPatterns(nagadSnippet, 'doc_03', 'Nagad Statement.png').facts;

  // Verify bKash TrxID
  const trxFact = receiptFacts.find((f) => f.field === 'transactionRef');
  assert.ok(trxFact, 'bKash TrxID fact must be extracted');
  assert.equal(trxFact.value, 'BK9X81729L');
  assert.equal(trxFact.sourceDocId, 'doc_02', 'Must link directly to source document ID');
  assert.equal(trxFact.sourceDocName, 'bKash Statement.jpg');
  assert.equal(trxFact.factStatus, 'pattern_extracted', 'Regex matches must be tagged pattern_extracted');
  assert.equal(trxFact.verified, false, 'Pattern extraction must NOT be falsely marked verified');

  // Verify Nagad TrxID
  const nagadTrxFact = nagadFacts.find((f) => f.field === 'transactionRef');
  assert.ok(nagadTrxFact, 'Nagad TrxID fact must be extracted');
  assert.equal(nagadTrxFact.value, '71A9XZ2K');
  assert.equal(nagadTrxFact.factStatus, 'pattern_extracted');

  // Verify Consideration (BDT Amount)
  const amountFact = receiptFacts.find((f) => f.field === 'paidAmount');
  assert.ok(amountFact, 'Paid amount fact must be extracted');
  assert.match(amountFact.value, /8,?500/);

  // Verify Delivery Promise
  const deliveryFact = adFacts.find((f) => f.field === 'deliveryPromise');
  assert.ok(deliveryFact, 'Delivery promise must be captured');
  assert.match(deliveryFact.value, /3\s*days/i);
});

// ============================================================================
// TEST SUITE 2: CASE CLASSIFICATION & STATUTORY ACCURACY UNDER CRPA 2009
// ============================================================================
test('AI Classification: CRPA 2009 statutory mapping elements and qualifications', () => {
  const nonDeliveryStatute = STATUTE_MAP['product_not_delivered'];
  assert.ok(nonDeliveryStatute, 'Must return applicable statutory provisions');
  assert.match(nonDeliveryStatute.section, /ধারা ৪৫/, 'Non-delivery must cite Section 45');
  assert.match(nonDeliveryStatute.titleBn, /প্রতিশ্রুত/);

  // Section 50 is specifically for counterfeit goods
  const counterfeitStatute = STATUTE_MAP['counterfeit_product'];
  assert.match(counterfeitStatute.section, /ধারা ৫০/, 'Counterfeiting must cite Section 50');

  // Price gouging is Section 40
  const priceStatute = STATUTE_MAP['payment_dispute'];
  assert.match(priceStatute.section, /ধারা ৪০/, 'Price disputes must cite Section 40');

  // False advertising is Section 44
  const adStatute = STATUTE_MAP['misleading_ad'];
  assert.match(adStatute.section, /ধারা ৪৪/, 'Misleading ads must cite Section 44');
});

// ============================================================================
// TEST SUITE 3: SECTION 60 LIMITATION COUNTDOWN & DATE MATH
// ============================================================================
test('Section 60 Limitation Math: Verifies countdown from incident date, expiration, and missing date handling', async () => {
  const fiveDaysAgo = getDhakaDateString(5);
  const fortyDaysAgo = getDhakaDateString(40);

  // Case A: Recent incident (5 days ago) -> 25 days remaining
  const activeCase = await runKenaSathiAiAnalysis({
    productName: 'Sony WH-1000XM5',
    productBrand: 'Sony',
    sellerName: 'Gadget Vault BD',
    platform: 'facebook_page',
    grievanceType: 'product_not_delivered',
    claimedPurchasePriceBdt: 8500,
    fairMarketPriceBdt: 38000,
    transactionRef: 'BK9X81729L',
    incidentDate: fiveDaysAgo,
    complainantName: 'মুহাম্মদ তানভীর আহমেদ',
    complainantPhone: '01712-345678',
    complainantAddress: 'মিরপুর-১০, ঢাকা-১২১৬',
    incidentDetail: 'Paid 8,500 BDT for headphones 5 days ago. Seller blocked me.',
    evidenceItems: [],
    detectedFacts: [],
  });

  assert.equal(activeCase.complaintDossier.limitationRemainingDays, 25);
  assert.equal(activeCase.complaintDossier.isTimeBarred, false);

  // Case B: Time-barred incident (40 days ago) -> 0 remaining, isTimeBarred: true
  const expiredCase = await runKenaSathiAiAnalysis({
    productName: 'Smart Watch',
    productBrand: 'Generic',
    sellerName: 'Fake Shop',
    platform: 'facebook_page',
    grievanceType: 'product_not_delivered',
    claimedPurchasePriceBdt: 2000,
    fairMarketPriceBdt: 2500,
    transactionRef: 'TRX1234',
    incidentDate: fortyDaysAgo,
    complainantName: 'গ্রাহক',
    complainantPhone: '01700-000000',
    complainantAddress: 'ঢাকা',
    incidentDetail: 'Ordered 40 days ago.',
    evidenceItems: [],
    detectedFacts: [],
  });

  assert.equal(expiredCase.complaintDossier.limitationRemainingDays, 0);
  assert.equal(expiredCase.complaintDossier.isTimeBarred, true);

  // Case C: Missing incident date -> limitationRemainingDays: null (does NOT invent a date)
  const unknownDateCase = await runKenaSathiAiAnalysis({
    productName: 'Headphones',
    productBrand: 'Sony',
    sellerName: 'Shop',
    platform: 'facebook_page',
    grievanceType: 'product_not_delivered',
    claimedPurchasePriceBdt: 3000,
    fairMarketPriceBdt: 5000,
    transactionRef: '',
    incidentDate: undefined,
    complainantName: 'গ্রাহক',
    complainantPhone: '',
    complainantAddress: '',
    incidentDetail: 'No date specified in input.',
    evidenceItems: [],
    detectedFacts: [],
  });

  assert.equal(unknownDateCase.complaintDossier.limitationRemainingDays, null);
});

// ============================================================================
// TEST SUITE 4: STORAGE ISOLATION, PROVABLE EMPTY STATE & DEMO PRESET
// ============================================================================
test('StorageService: Clean empty state, delete-last-case, and demo preset isolation', () => {
  localStorage.clear();
  KenaSathiStorage.initialize();

  // 1. Clean empty state check: Initial storage MUST be empty array []
  const initialCases = KenaSathiStorage.getCases();
  assert.equal(initialCases.length, 0, 'Clean installation must have 0 custom cases');

  // 2. Save a custom case
  const customCase = {
    ...FICTIONAL_HEADPHONE_DEMO_CASE,
    id: 'case_user_dispute_101',
    productName: 'Mechanical Keyboard ৳৩,৫০০',
  };
  KenaSathiStorage.saveCase(customCase);

  const storedAfterSave = KenaSathiStorage.getCases();
  assert.equal(storedAfterSave.length, 1);
  assert.equal(storedAfterSave[0].id, 'case_user_dispute_101');

  // 3. Delete the last case -> Store MUST return [] and NOT resurrect sample demo
  KenaSathiStorage.deleteCase('case_user_dispute_101');
  const storedAfterDelete = KenaSathiStorage.getCases();
  assert.equal(storedAfterDelete.length, 0, 'Deleting last case must leave genuine empty state');

  // 4. Demo preset is loaded only upon explicit method call
  const demoCase = KenaSathiStorage.loadFictionalDemo();
  assert.ok(demoCase.id.startsWith('case_demo_'));
  assert.equal(KenaSathiStorage.getCases().length, 1);
});

// ============================================================================
// TEST SUITE 5: COMPLAINT DRAFT INTEGRITY & DYNAMIC ATTACHMENTS
// ============================================================================
test('Complaint Drafting: Dynamic attachments match actual evidence and avoids simulated facts', async () => {
  const mockEvidence = [
    {
      id: 'mock_receipt_01',
      name: 'bKash_Cashout_Statement.jpg',
      type: 'receipt' as const,
      fileFormat: 'jpg',
      size: '450 KB',
      uploadedAt: '2026-11-03',
      anomalyDetected: false,
    },
  ];

  const analysis = await runKenaSathiAiAnalysis({
    productName: 'Air Fryer',
    productBrand: 'BrandX',
    sellerName: 'Kitchen Shop BD',
    platform: 'facebook_page',
    grievanceType: 'product_not_delivered',
    claimedPurchasePriceBdt: 6000,
    fairMarketPriceBdt: 8000,
    transactionRef: 'BK992211',
    incidentDate: new Date().toISOString().split('T')[0],
    complainantName: 'রাহেলা বেগম',
    complainantPhone: '01812-345678',
    complainantAddress: 'উত্তরা, ঢাকা',
    incidentDetail: 'Paid 6000 BDT. Air fryer was never dispatched.',
    evidenceItems: mockEvidence,
    detectedFacts: [],
  });

  const dossier = analysis.complaintDossier;

  // Verify dynamic attachments list contains only uploaded receipt
  assert.ok(dossier.attachedEvidenceNames, 'Should contain attachedEvidenceNames');
  assert.equal(dossier.attachedEvidenceNames?.length, 1);
  assert.match(dossier.attachedEvidenceNames[0], /bKash_Cashout_Statement\.jpg/);

  // Verify official contact points
  assert.equal(dossier.submissionEmail, 'nccc@dncrp.gov.bd');
  assert.equal(dossier.helpline, '16121');
  assert.match(dossier.complaintDraftId || dossier.complaintId, /KS-DRAFT/);

  // Verify non-delivery dispute does not allege counterfeit offences
  assert.equal(dossier.grievanceType, 'product_not_delivered');
  assert.ok(!dossier.factualSummaryBn.includes('নকল পণ্য'));
});

// ============================================================================
// TEST SUITE 6: GEMINI 3.8 FLASH PROVIDER MODES & HONEST ERROR HANDLING
// ============================================================================
test('Gemini 3.8 Flash: Explicit status handling when API key is missing or provider fails', async () => {
  // Case A: Cloud AI requested without API key -> missing_credentials mode
  const missingKeyResult = await runKenaSathiAiAnalysis({
    productName: 'Samsung Earbuds',
    productBrand: 'Samsung',
    sellerName: 'FB Shop',
    platform: 'facebook_page',
    grievanceType: 'product_not_delivered',
    claimedPurchasePriceBdt: 3000,
    fairMarketPriceBdt: 8000,
    transactionRef: 'TRX998877',
    incidentDetail: 'Non-delivery of earbuds.',
    evidenceItems: [],
    detectedFacts: [],
    preferredProvider: 'gemini',
    userConsentedToCloud: true,
    ephemeralApiKey: '', // empty key
  });

  assert.equal(missingKeyResult.processingMode, 'missing_credentials');
  assert.ok(missingKeyResult.providerError, 'Must report missing credentials');
  assert.match(missingKeyResult.providerError || '', /missing.*api.*key/i);
  assert.notEqual(missingKeyResult.processingMode, 'live_ai_success', 'Must never claim live AI success without key');

  // Case B: Local deterministic fallback must always be robust and available
  const localResult = await runKenaSathiAiAnalysis({
    productName: 'Keyboard',
    productBrand: 'Keychron',
    sellerName: 'Tech BD',
    platform: 'standalone_website',
    grievanceType: 'product_not_delivered',
    claimedPurchasePriceBdt: 7000,
    fairMarketPriceBdt: 9000,
    transactionRef: 'TRX112233',
    incidentDetail: 'Did not deliver item.',
    evidenceItems: [],
    detectedFacts: [],
    preferredProvider: 'local_deterministic',
    userConsentedToCloud: false,
  });

  assert.equal(localResult.processingMode, 'local_deterministic');
  assert.equal(localResult.providerError, undefined);
  assert.ok(localResult.complaintDossier.complaintId || localResult.complaintDossier.complaintDraftId);
});

// ============================================================================
// TEST SUITE 7: RUNTIME SCHEMA VALIDATION WITH ZOD (ModelAnalysisOutputSchema)
// ============================================================================
test('Zod Runtime Schema: Rejects invalid model outputs and validates conforming payloads', () => {
  // Valid model payload
  const validPayload = {
    summaryBn: 'পণ্য সরবরাহে ব্যর্থতার প্রামাণ্য লক্ষণ বিদ্যমান',
    summaryEn: 'Substantial non-delivery indicators present in evidence',
    trustScore: 40,
    statuteSection: 'ধারা ৪৫',
    statutoryReasoningBn: 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৪৫ এর সুস্পষ্ট লঙ্ঘন।',
    extractedFacts: [
      {
        labelBn: 'লেনদেন আইডি',
        labelEn: 'Transaction Reference',
        value: 'BK9X81729L',
      },
    ],
    unknownFields: ['ট্রেড লাইসেন্স নম্বর'],
  };

  const parsedValid = ModelAnalysisOutputSchema.safeParse(validPayload);
  assert.equal(parsedValid.success, true, 'Valid payload must pass schema validation');

  // Invalid payload A: trustScore out of bounds (> 100)
  const invalidTrustScore = {
    ...validPayload,
    trustScore: 150,
  };
  const parsedInvalidA = ModelAnalysisOutputSchema.safeParse(invalidTrustScore);
  assert.equal(parsedInvalidA.success, false, 'Score > 100 must fail schema validation');

  // Invalid payload B: missing required summaryBn
  const missingSummary = {
    ...validPayload,
    summaryBn: '',
  };
  const parsedInvalidB = ModelAnalysisOutputSchema.safeParse(missingSummary);
  assert.equal(parsedInvalidB.success, false, 'Empty required summary must fail schema validation');

  // Invalid payload C: trustScore < 0
  const negativeScore = {
    ...validPayload,
    trustScore: -10,
  };
  const parsedInvalidC = ModelAnalysisOutputSchema.safeParse(negativeScore);
  assert.equal(parsedInvalidC.success, false, 'Negative trust score must fail schema validation');
});

// ============================================================================
// TEST SUITE 8: HONEST PROVENANCE TRACKING & PII SANITIZATION
// ============================================================================
test('Provenance & Privacy: Tags user input honestly and scrubs sensitive PII before transmission', async () => {
  // 1. Check PII scrubbing
  const rawTextWithPii = 'আমার নাম রহিম, ফোন 01712-345678, NID 1987123456789, email rahim@example.com। দারাজ সেলার টাকা নিয়ে পণ্য দেয়নি।';
  const sanitized = sanitizePiiForCloud(rawTextWithPii);
  assert.ok(!sanitized.includes('01712-345678'), 'Phone number must be scrubbed');
  assert.ok(!sanitized.includes('1987123456789'), 'NID number must be scrubbed');
  assert.ok(!sanitized.includes('rahim@example.com'), 'Email must be scrubbed');
  assert.ok(sanitized.includes('[PHONE_REDACTED]'));
  assert.ok(sanitized.includes('[NID_REDACTED]'));
  assert.ok(sanitized.includes('[EMAIL_REDACTED]'));

  // 2. Check user input provenance in analyzed case
  const analysis = await runKenaSathiAiAnalysis({
    productName: 'Smart TV',
    productBrand: 'Sony',
    sellerName: 'Online Electronics',
    platform: 'facebook_page',
    grievanceType: 'product_not_delivered',
    claimedPurchasePriceBdt: 45000,
    fairMarketPriceBdt: 60000,
    transactionRef: 'USER_TRX_999',
    incidentDate: '2026-10-25',
    incidentDetail: 'TV was not delivered.',
    evidenceItems: [],
    detectedFacts: [],
  });

  const trxFact = analysis.extractedFacts.find((f) => f.field === 'transactionRef');
  assert.ok(trxFact, 'Trx fact should be present in extractedFacts');
  assert.equal(trxFact.factStatus, 'user_reported', 'User entered TrxID must be tagged user_reported');
  assert.equal(trxFact.verified, false, 'User reported TrxID must NOT be tagged verified');
  assert.equal(trxFact.provenance, 'user_reported');
});

// ============================================================================
// TEST SUITE 9: STORAGE SAFETY & BASE64 DATAURL STRIPPING
// ============================================================================
test('Storage Safety: Strips large base64 dataUrls before persisting to prevent quota crashes', () => {
  const largeMockBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(50000);
  const testCase = {
    ...FICTIONAL_HEADPHONE_DEMO_CASE,
    id: 'case_storage_safety_test',
    evidenceItems: [
      {
        id: 'ev_large_blob_1',
        name: 'receipt_photo.jpg',
        type: 'receipt' as const,
        fileFormat: 'jpg',
        size: '1.2 MB',
        uploadedAt: '2026-11-03',
        anomalyDetected: false,
        dataUrl: largeMockBase64,
        blobId: 'blob_key_123',
      },
    ],
  };

  // Direct sanitizer test
  const sanitized = sanitizeCaseForLocalStorage(testCase);
  assert.equal(sanitized.evidenceItems[0].dataUrl, undefined, 'dataUrl must be completely stripped');
  assert.equal(sanitized.evidenceItems[0].blobId, 'blob_key_123', 'blobId reference must be preserved');

  // Persistence roundtrip test
  KenaSathiStorage.saveCase(testCase);
  const retrieved = KenaSathiStorage.getCaseById('case_storage_safety_test');
  assert.ok(retrieved);
  assert.equal(retrieved.evidenceItems[0].dataUrl, undefined, 'Retrieved case must not contain dataUrl');
  assert.equal(retrieved.evidenceItems[0].blobId, 'blob_key_123');

  // Cleanup
  KenaSathiStorage.deleteCase('case_storage_safety_test');
});

// ============================================================================
// TEST SUITE 10: VERIFIABLE WORKSPACE EMPTY STATE & DELETE LIFECYCLE
// ============================================================================
test('Workspace Lifecycle: Transition to authentic empty state upon deleting last dispute', () => {
  localStorage.clear();
  KenaSathiStorage.initialize();

  assert.equal(KenaSathiStorage.getCases().length, 0, 'Clean workspace has zero cases');

  // Save two cases
  const caseA = { ...FICTIONAL_HEADPHONE_DEMO_CASE, id: 'case_lifecycle_A' };
  const caseB = { ...FICTIONAL_HEADPHONE_DEMO_CASE, id: 'case_lifecycle_B' };
  KenaSathiStorage.saveCase(caseA);
  KenaSathiStorage.saveCase(caseB);
  assert.equal(KenaSathiStorage.getCases().length, 2);

  // Delete first case
  KenaSathiStorage.deleteCase('case_lifecycle_A');
  assert.equal(KenaSathiStorage.getCases().length, 1);
  assert.equal(KenaSathiStorage.getCaseById('case_lifecycle_A'), null);
  assert.ok(KenaSathiStorage.getCaseById('case_lifecycle_B'));

  // Delete second (last) case
  KenaSathiStorage.deleteCase('case_lifecycle_B');
  assert.equal(KenaSathiStorage.getCases().length, 0, 'Must cleanly return 0 cases');
  assert.equal(KenaSathiStorage.getCaseById('case_lifecycle_B'), null);
});

// ============================================================================
// TEST SUITE 11: SECTION 60 LIMITATION ENGINE MATRIX (P0 Statutory Exactness)
// ============================================================================
test('Section 60 Limitation Engine: Comprehensive calendar-day matrix & timezone safety', () => {
  // 1. Missing date (undefined, null, empty string)
  const missingUndef = calculateSection60Limitation(undefined);
  assert.equal(missingUndef.limitationRemainingDays, null, 'Undefined date must yield null days');
  assert.equal(missingUndef.isTimeBarred, false, 'Missing date cannot be declared time-barred');
  assert.equal(missingUndef.isExpiringSoon, false);
  assert.match(missingUndef.statusBn, /তারিখ দেওয়া হয়নি/);
  assert.ok(missingUndef.statutoryWarningBn.includes('১৬১২১'));

  const missingNull = calculateSection60Limitation(null);
  assert.equal(missingNull.limitationRemainingDays, null);

  const missingEmpty = calculateSection60Limitation('');
  assert.equal(missingEmpty.limitationRemainingDays, null);

  // 2. Incident occurred today (0 days elapsed) -> exactly 30 calendar days remaining
  const todayStr = getDhakaDateString(0);
  const todayResult = calculateSection60Limitation(todayStr);
  assert.equal(todayResult.limitationRemainingDays, 30);
  assert.equal(todayResult.isTimeBarred, false);

  // 3. Incident occurred 5 days ago -> exactly 25 calendar days remaining
  const fiveDaysAgo = getDhakaDateString(5);
  const fiveDaysResult = calculateSection60Limitation(fiveDaysAgo);
  assert.equal(fiveDaysResult.limitationRemainingDays, 25);
  assert.equal(fiveDaysResult.isTimeBarred, false);
  assert.equal(fiveDaysResult.isExpiringSoon, false);

  // 4. Incident occurred 30 days ago -> boundary: 0 days remaining, last day to file
  const thirtyDaysAgo = getDhakaDateString(30);
  const thirtyDaysResult = calculateSection60Limitation(thirtyDaysAgo);
  assert.equal(thirtyDaysResult.limitationRemainingDays, 0);
  assert.equal(thirtyDaysResult.isTimeBarred, false, 'Day 30 is still within statutory window');
  assert.equal(thirtyDaysResult.isExpiringSoon, true);

  // 5. Incident occurred 31 days ago -> time-barred
  const thirtyOneDaysAgo = getDhakaDateString(31);
  const thirtyOneDaysResult = calculateSection60Limitation(thirtyOneDaysAgo);
  assert.equal(thirtyOneDaysResult.limitationRemainingDays, 0);
  assert.equal(thirtyOneDaysResult.isTimeBarred, true, 'Day 31 must be time-barred under Section 60');
  assert.match(thirtyOneDaysResult.statusBn, /তামাদি.*উত্তীর্ণ/);

  // 6. Invalid date strings
  const invalidResult1 = calculateSection60Limitation('invalid-date-string');
  assert.equal(invalidResult1.limitationRemainingDays, null);
  assert.equal(invalidResult1.isTimeBarred, false);
  assert.match(invalidResult1.statusBn, /অকার্যকর/);

  const invalidResult2 = calculateSection60Limitation('2026-15-99');
  assert.equal(invalidResult2.limitationRemainingDays, null);

  // 7. Future date
  const tomorrow = getDhakaDateString(-1);
  const futureResult = calculateSection60Limitation(tomorrow);
  assert.equal(futureResult.isFutureDate, true);
  assert.equal(futureResult.limitationRemainingDays, null);
  assert.match(futureResult.statusBn, /ভবিষ্যত/);
});

// ============================================================================
// TEST SUITE 12: GRIEVANCE-ADAPTED EVIDENCE-DRIVEN TIMELINE
// ============================================================================
test('Evidence-Driven Timeline: Adapts specifically to grievance category and preserves unknown fields', async () => {
  // Case A: Counterfeit product dispute must cite Section 50 and counterfeit reception
  const counterfeitAnalysis = await runKenaSathiAiAnalysis({
    productName: 'AirPods Pro 2',
    productBrand: 'Apple',
    sellerName: 'Apple Gadgets Clone',
    platform: 'facebook_page',
    grievanceType: 'counterfeit_product',
    claimedPurchasePriceBdt: 2500,
    fairMarketPriceBdt: 28000,
    transactionRef: '',
    incidentDetail: 'Received cheap counterfeit duplicate without serial verification.',
    evidenceItems: [],
    detectedFacts: [],
  });

  const timelineA = counterfeitAnalysis.complaintDossier.timeline;
  assert.ok(timelineA.length >= 3, 'Must have at least 3 timeline events');
  const incidentEventA = timelineA.find((e) => e.id === 'tl_ev_2');
  assert.ok(incidentEventA);
  assert.match(incidentEventA.titleBn, /নকল/);
  assert.match(incidentEventA.detailBn, /ধারা ৫০/);
  assert.ok(!incidentEventA.detailBn.includes('প্রতিশ্রুত সময়সীমা'));

  // Case B: Non-delivery dispute without extracted delivery promise shows honest unknown notice
  const nonDeliveryAnalysis = await runKenaSathiAiAnalysis({
    productName: 'Smart Ring',
    productBrand: 'Ultrahuman',
    sellerName: 'Ring Vault',
    platform: 'facebook_page',
    grievanceType: 'product_not_delivered',
    claimedPurchasePriceBdt: 12000,
    fairMarketPriceBdt: 35000,
    transactionRef: 'TRX_RING_123',
    incidentDetail: 'Paid in advance, merchant never dispatched the ring.',
    evidenceItems: [],
    detectedFacts: [],
  });

  const timelineB = nonDeliveryAnalysis.complaintDossier.timeline;
  const incidentEventB = timelineB.find((e) => e.id === 'tl_ev_2');
  assert.ok(incidentEventB);
  assert.match(incidentEventB.detailBn, /এই তথ্যটি এখনো দেওয়া হয়নি/);

  // Case C: Missing payment transaction details reflects honest missing notice
  const paymentEventB = timelineB.find((e) => e.id === 'tl_ev_1');
  assert.ok(paymentEventB);
  assert.match(paymentEventB.detailBn, /TRX_RING_123/);
});

// ============================================================================
// TEST SUITE 13: SECTION 76(4) STATUTORY REWARD REFLECTION & NEUTRALITY
// ============================================================================
test('Section 76(4) Neutrality: Rejects projected cash rewards and emphasizes fine realization condition', async () => {
  const analysis = await runKenaSathiAiAnalysis({
    productName: 'Leather Bag',
    productBrand: 'Generic',
    sellerName: 'Bag Shop',
    platform: 'facebook_page',
    grievanceType: 'payment_dispute',
    claimedPurchasePriceBdt: 3000,
    fairMarketPriceBdt: 3000,
    transactionRef: 'TRX_BAG',
    incidentDetail: 'Charged extra 500 BDT over stated price.',
    evidenceItems: [],
    detectedFacts: [],
  });

  const dossier = analysis.complaintDossier;
  // Whistleblower reward must NEVER be projected from maxFine * 0.25 as guaranteed money
  assert.equal(dossier.whistleblowerRewardBdt, 0, 'Projected reward must be 0 BDT');
  assert.ok(dossier.statutoryConditionsBn, 'Must contain statutory conditions explanation');
  assert.match(dossier.statutoryConditionsBn, /ধারা ৭৬\(৪\)/);
  assert.match(dossier.statutoryConditionsBn, /আদায়কৃত জরিমানা সাপেক্ষে/);
});

// ============================================================================
// TEST SUITE 14: BANGLADESHI PII REDACTION (PHONE, NID, EMAIL, NAMES)
// ============================================================================
test('PII Sanitization: Comprehensive scrubbing of Bangladeshi phone formats, smart/legacy NIDs and emails', () => {
  const samples = [
    { raw: 'Call me at 01712-345678 immediately.', expectedClean: true },
    { raw: 'My number is +8801819123456.', expectedClean: true },
    { raw: 'Contact 01911 223344 for delivery.', expectedClean: true },
    { raw: 'NID: 1234567890 (Smart Card)', expectedClean: true },
    { raw: 'Old 13-digit NID: 1985123456789', expectedClean: true },
    { raw: '17-digit NID: 19851234567890123', expectedClean: true },
    { raw: 'Email me at citizen_protest@gmail.com', expectedClean: true },
  ];

  for (const s of samples) {
    const cleaned = sanitizePiiForCloud(s.raw);
    assert.ok(!cleaned.includes('01712-345678'));
    assert.ok(!cleaned.includes('+8801819123456'));
    assert.ok(!cleaned.includes('01911 223344'));
    assert.ok(!cleaned.includes('1234567890'));
    assert.ok(!cleaned.includes('1985123456789'));
    assert.ok(!cleaned.includes('19851234567890123'));
    assert.ok(!cleaned.includes('citizen_protest@gmail.com'));
  }
});

// ============================================================================
// TEST SUITE 15: MOCKED GEMINI 3.8 FLASH LIVE REQUEST INTEGRITY & ERROR RESILIENCE
// ============================================================================
test('Gemini 3.8 Flash Request: Verifies header authentication, payload structure, and error mapping', async () => {
  const originalFetch = globalThis.fetch;
  let capturedUrl = '';
  let capturedHeaders: Record<string, string> = {};
  let capturedBody: any = null;

  try {
    // 1. Mock successful Gemini 3.8 Flash response
    (globalThis as any).fetch = async (url: string, init: any) => {
      capturedUrl = url;
      capturedHeaders = init.headers;
      capturedBody = JSON.parse(init.body);

      const mockResponseData = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    summaryBn: 'মডেল বিশ্লেষণে প্রতিশ্রুত পণ্য সরবরাহে ব্যর্থতার প্রমাণ পাওয়া গেছে',
                    summaryEn: 'Model analysis observed evidence of non-delivery breach',
                    statuteSection: 'ধারা ৪৫',
                    statutoryReasoningBn: 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৪৫ এর সুস্পষ্ট লঙ্ঘন।',
                    extractedFacts: [
                      {
                        labelBn: 'লেনদেন নম্বর',
                        labelEn: 'Transaction Reference',
                        value: 'BK9X81729L',
                        sourceDocId: 'mock_pdf_doc_1',
                        sourceSnippet: 'TrxID: BK9X81729L',
                      },
                    ],
                    unknownFields: ['ট্রেড লাইসেন্স নম্বর'],
                  }),
                },
              ],
            },
          },
        ],
      };

      return {
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      };
    };

    const mockPdfDoc = {
      id: 'mock_pdf_doc_1',
      name: 'bKash_Invoice.pdf',
      type: 'receipt' as const,
      fileFormat: 'pdf',
      size: '220 KB',
      uploadedAt: '2026-11-03',
      anomalyDetected: false,
      textExtractionStatus: 'text_extracted_from_pdf' as const,
      rawTextSnippet: 'bKash Payment Completed. TrxID: BK9X81729L. Amount ৳8,500.',
    };

    const successResult = await runKenaSathiAiAnalysis({
      productName: 'Sony WH-1000XM5',
      productBrand: 'Sony',
      sellerName: 'Gadget Vault BD',
      platform: 'facebook_page',
      grievanceType: 'product_not_delivered',
      claimedPurchasePriceBdt: 8500,
      fairMarketPriceBdt: 38000,
      transactionRef: 'BK9X81729L',
      incidentDetail: 'Headphones never delivered.',
      evidenceItems: [mockPdfDoc],
      detectedFacts: [
        {
          id: 'df_1',
          field: 'transactionRef',
          labelBn: 'লেনদেন আইডি',
          labelEn: 'Transaction Reference',
          value: 'BK9X81729L',
          sourceDocId: 'mock_pdf_doc_1',
          sourceDocName: 'bKash_Invoice.pdf',
          confidence: 95,
          verified: false,
          factStatus: 'pattern_extracted',
          provenance: 'pattern_extracted',
          extractionMethod: 'regex_pattern',
        },
      ],
      preferredProvider: 'gemini',
      userConsentedToCloud: true,
      ephemeralApiKey: 'AIzaSyMockTestKey12345',
    });

    // Check request construction
    assert.equal(successResult.processingMode, 'live_ai_success', 'Successful model parse yields live_ai_success');
    assert.ok(capturedUrl.includes('gemini-3.8-flash:generateContent'), 'Must target gemini-3.8-flash model');
    assert.ok(!capturedUrl.includes('key='), 'API key must NEVER be in URL query string');
    assert.equal(capturedHeaders['x-goog-api-key'], 'AIzaSyMockTestKey12345', 'Must use x-goog-api-key header');
    assert.equal(capturedBody.generationConfig?.responseMimeType, 'application/json', 'Must request JSON');
    assert.equal(capturedBody.generationConfig?.temperature, undefined, 'Must not include deprecated temperature');

    // Check prompt inclusion of extracted PDF text and candidate facts
    const promptPart = capturedBody.contents[0].parts.find((p: any) => p.text);
    assert.ok(promptPart, 'Prompt text must exist');
    assert.ok(promptPart.text.includes('bKash Payment Completed'), 'Must include extracted PDF text in prompt');
    assert.ok(promptPart.text.includes('BK9X81729L'), 'Must include candidate facts in prompt');

    // 2. Mock 401 Unauthorized
    (globalThis as any).fetch = async () => ({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: { message: 'API key not valid.' } }),
    });

    const authFailResult = await runKenaSathiAiAnalysis({
      productName: 'Watch',
      sellerName: 'Shop',
      platform: 'facebook_page',
      grievanceType: 'product_not_delivered',
      claimedPurchasePriceBdt: 1000,
      fairMarketPriceBdt: 1000,
      incidentDetail: 'No delivery',
      evidenceItems: [],
      detectedFacts: [],
      preferredProvider: 'gemini',
      userConsentedToCloud: true,
      ephemeralApiKey: 'invalid-key',
    });

    assert.equal(authFailResult.processingMode, 'local_rules_fallback');
    assert.match(authFailResult.providerError || '', /Authentication error \(401\)/);

    // 3. Mock 429 Rate Limit
    (globalThis as any).fetch = async () => ({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({ error: { message: 'Quota exceeded.' } }),
    });

    const rateLimitResult = await runKenaSathiAiAnalysis({
      productName: 'Watch',
      sellerName: 'Shop',
      platform: 'facebook_page',
      grievanceType: 'product_not_delivered',
      claimedPurchasePriceBdt: 1000,
      fairMarketPriceBdt: 1000,
      incidentDetail: 'No delivery',
      evidenceItems: [],
      detectedFacts: [],
      preferredProvider: 'gemini',
      userConsentedToCloud: true,
      ephemeralApiKey: 'test-key',
    });

    assert.equal(rateLimitResult.processingMode, 'local_rules_fallback');
    assert.match(rateLimitResult.providerError || '', /Rate limit exceeded \(429\)/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ============================================================================
// TEST SUITE 16: PUBLIC SERVICE PORTAL INTEGRITY & ZERO COMPETITION REFERENCES
// ============================================================================
test('Public Portal Integrity: Verifies zero competition references across all human-maintained docs and code', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  const rootDir = process.cwd();
  const srcDir = path.resolve(rootDir, 'src');
  const docsDir = path.resolve(rootDir, 'docs');
  const gsdDir = path.resolve(rootDir, '.gsd');
  const indexHtmlPath = path.resolve(rootDir, 'index.html');
  const readmePath = path.resolve(rootDir, 'README.md');

  // Check index.html
  const indexHtml = await fs.readFile(indexHtmlPath, 'utf-8');
  assert.ok(!indexHtml.includes('Buildathon'), 'index.html must not contain Buildathon');
  assert.ok(!indexHtml.includes('Ostad'), 'index.html must not contain Ostad');
  assert.ok(!indexHtml.includes('AIgnite'), 'index.html must not contain AIgnite');
  assert.ok(indexHtml.includes('কেনাসাথী'), 'index.html must include Bengali brand name');

  // Verify PitchDeckModal has been deleted
  const pitchDeckPath = path.resolve(srcDir, 'components', 'PitchDeckModal.tsx');
  let pitchDeckExists = false;
  try {
    await fs.access(pitchDeckPath);
    pitchDeckExists = true;
  } catch {
    pitchDeckExists = false;
  }
  assert.equal(pitchDeckExists, false, 'PitchDeckModal.tsx must be completely deleted from codebase');

  // Recursive search in a directory for text files matching extensions
  async function searchFiles(dir: string, validExts: string[]): Promise<string[]> {
    let entries: import('node:fs').Dirent[] = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return [];
    }
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await searchFiles(fullPath, validExts)));
      } else if (entry.isFile() && validExts.some((ext) => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const allSrcFiles = await searchFiles(srcDir, ['.ts', '.tsx', '.css']);
  const allDocFiles = await searchFiles(docsDir, ['.md']);
  const allGsdFiles = await searchFiles(gsdDir, ['.md']);
  const allFilesToCheck = [...allSrcFiles, ...allDocFiles, ...allGsdFiles, readmePath];

  const forbiddenRegex = /Ostad Presents|YUNet|AIgnite|Buildathon 2026|PitchDeckModal/i;

  for (const file of allFilesToCheck) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      assert.ok(
        !forbiddenRegex.test(content),
        `File ${path.relative(rootDir, file)} must not contain competition or event references`
      );
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }
});

// ============================================================================
// TEST SUITE 17: AUTHENTIC EMPTY STATE & USER JOURNEYS (P0 User Requirement)
// ============================================================================
test('Authentic Empty State: New visitor, delete-last-case, and page refresh produce genuine empty state without fake case fallback', () => {
  // Clear all storage to simulate first-time visitor
  KenaSathiStorage.clearAllCases();

  // 1. First-time visitor has 0 cases and no automatic fallback
  const firstVisitorCases = KenaSathiStorage.getAllCases();
  assert.deepEqual(firstVisitorCases, {}, 'First-time visitor must have completely empty case map');
  assert.equal(Object.keys(firstVisitorCases).length, 0);

  // Verify getCaseById returns null for undefined/unselected case
  assert.equal(KenaSathiStorage.getCaseById('non_existent_case'), null);

  // 2. Add real user dispute
  const userCase = {
    ...FICTIONAL_HEADPHONE_DEMO_CASE,
    id: 'case_real_user_01',
    complainantName: 'মাহমুদুল হক',
    titleBn: 'দারাজ থেকে ত্রুটিপূর্ণ স্মার্টওয়াচ প্রাপ্তি',
    titleEn: 'Defective Smartwatch Delivery Dispute',
    facts: [
      {
        id: 'fact_01',
        field: 'transactionRef',
        labelBn: 'লেনদেন নম্বর',
        labelEn: 'Transaction Ref',
        value: 'TRX998877',
        sourceDocId: 'doc_user_01',
        sourceDocName: 'Nagad_Receipt.pdf',
        factStatus: 'user_reported' as const,
        verified: false,
      },
    ],
  };

  KenaSathiStorage.saveCase(userCase);
  const storedAfterSave = KenaSathiStorage.getAllCases();
  assert.ok(storedAfterSave['case_real_user_01'], 'Real user case must be saved in storage');
  assert.equal(storedAfterSave['case_real_user_01'].complainantName, 'মাহমুদুল হক');

  // 3. User deletes their last case
  KenaSathiStorage.deleteCase('case_real_user_01');
  const storedAfterDelete = KenaSathiStorage.getAllCases();
  assert.deepEqual(storedAfterDelete, {}, 'Deleting last case must result in strictly empty store');
  assert.equal(KenaSathiStorage.getCaseById('case_real_user_01'), null);

  // 4. Page refresh after deleting last case
  // Simulate page reload by reading directly from storage
  const reloadedCases = KenaSathiStorage.getAllCases();
  assert.deepEqual(reloadedCases, {}, 'Refreshing page after delete must preserve authentic empty state');

  // 5. Verify explicit demo loading is purely optional and manual
  const explicitDemo = KenaSathiStorage.loadFictionalDemo();
  assert.ok(explicitDemo, 'Demo must load when explicitly invoked');
  assert.ok(explicitDemo.id.startsWith('case_demo_'), 'Demo ID must start with case_demo_ prefix');
  assert.ok(KenaSathiStorage.getAllCases()[explicitDemo.id], 'Demo exists after explicit load');

  // Clean up
  KenaSathiStorage.clearAllCases();
  assert.deepEqual(KenaSathiStorage.getAllCases(), {});
});

// ============================================================================
// TEST SUITE 18: NATIONAL HELPLINES & DNCRP DIRECTORY RECORDS
// ============================================================================
test('Helplines & Office Directory: Checks current helplines and DNCRP directory metadata', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  const guideFile = path.resolve(process.cwd(), 'src', 'components', 'ConsumerGuideDirectory.tsx');
  const guideContent = await fs.readFile(guideFile, 'utf-8');

  // 1. National Helplines
  assert.ok(guideContent.includes('16121'), 'Must include 16121 DNCRP helpline');
  assert.ok(guideContent.includes('999'), 'Must include 999 Emergency helpline');
  assert.ok(guideContent.includes('16699'), 'Must include 16699 primary NLASO toll-free legal aid helpline');
  assert.ok(guideContent.includes('Toll-Free'), 'Must identify 16699 as toll-free without claiming unverified service hours');
  assert.ok(guideContent.includes('https://nlaso.gov.bd'), 'Must link to official NLASO portal');
  assert.ok(guideContent.includes('https://dncrp.gov.bd'), 'Must link to official DNCRP portal');
  assert.ok(guideContent.includes('https://ccms.dncrp.com'), 'Must link to official CCMS portal');
  assert.ok(guideContent.includes('https://police.gov.bd'), 'Must link to official Police portal');

  // 2. Import the live verified DNCRP_OFFICES data structure
  const { DNCRP_OFFICES } = await import('../src/data/dncrpOffices');
  assert.ok(Array.isArray(DNCRP_OFFICES), 'DNCRP_OFFICES must be an exported array');
  assert.equal(DNCRP_OFFICES.length, 11, 'Must contain all 11 verified office records');

  // 3. Strict distinction between Head Office, NCCC, Dhaka Divisional, and Dhaka District
  const headOffice = DNCRP_OFFICES.find((o) => o.id === 'head-office');
  const nccc = DNCRP_OFFICES.find((o) => o.id === 'nccc-dhaka');
  const dhakaDivisional = DNCRP_OFFICES.find((o) => o.id === 'dhaka-divisional');
  const dhakaDistrict = DNCRP_OFFICES.find((o) => o.id === 'dhaka-district');

  assert.ok(headOffice, 'Head Office record must exist');
  assert.ok(nccc, 'NCCC record must exist');
  assert.ok(dhakaDivisional, 'Dhaka Divisional Office must exist as separate verified record');
  assert.ok(dhakaDistrict, 'Dhaka District Office must exist as separate verified record');

  // Confirm distinct identities, portals, and emails
  assert.notEqual(headOffice.id, dhakaDivisional.id);
  assert.notEqual(nccc.id, dhakaDivisional.id);
  assert.equal(headOffice.sourceUrl, 'https://dncrp.gov.bd');
  assert.equal(nccc.sourceUrl, 'https://ccms.dncrp.com');
  assert.equal(dhakaDivisional.sourceUrl, 'https://dncrp.dhakadiv.gov.bd');
  assert.equal(dhakaDistrict.sourceUrl, 'https://dhaka.gov.bd');

  assert.equal(dhakaDivisional.email, 'dd-dhaka@dncrp.gov.bd');
  assert.equal(dhakaDistrict.email, 'ad-dhaka@dncrp.gov.bd');

  // 4. Independent Mymensingh Divisional Office verification
  const mymensingh = DNCRP_OFFICES.find((o) => o.id === 'mymensingh');
  assert.ok(mymensingh, 'Mymensingh Divisional Office must exist');
  assert.ok(mymensingh.nameBn.includes('ময়মনসিংহ') || mymensingh.nameBn.includes('ময়মনসিংহ'));
  assert.equal(mymensingh.sourceUrl, 'https://dncrp.mymensinghdiv.gov.bd');
  assert.equal(mymensingh.email, 'dd-mymensingh@dncrp.gov.bd');
  assert.ok(mymensingh.phone.includes('০২৯৯৭৭১০৭০৩'));
  assert.ok(mymensingh.verificationStatusBn.includes('নিশ্চিতকৃত'));

  // 5. Verification of remaining regional divisional offices
  const regionalExpected = [
    { id: 'chattogram', url: 'https://dncrp.chittagongdiv.gov.bd/pages/officers', email: 'dd-chattogram@dncrp.gov.bd' },
    { id: 'rajshahi', url: 'https://dncrp.rajshahidiv.gov.bd', email: 'dd-rajshahi@dncrp.gov.bd' },
    { id: 'khulna', url: 'https://dncrp.khulnadiv.gov.bd/pages/static-pages/6981241ca31054345f1e3ed4', email: 'dd-khulna@dncrp.gov.bd' },
    { id: 'barishal', url: 'https://dncrp.barisaldiv.gov.bd', email: 'dd-barishal@dncrp.gov.bd' },
    { id: 'sylhet', url: 'https://dncrp.sylhetdiv.gov.bd', email: 'dd-sylhet@dncrp.gov.bd' },
    { id: 'rangpur', url: 'https://dncrp.rangpurdiv.gov.bd', email: 'dd-rangpur@dncrp.gov.bd' },
  ];

  for (const reg of regionalExpected) {
    const office = DNCRP_OFFICES.find((o) => o.id === reg.id);
    assert.ok(office, `Regional office ${reg.id} must exist`);
    assert.equal(office.sourceUrl, reg.url, `Office ${reg.id} must have verified portal URL: ${reg.url}`);
    assert.equal(office.email, reg.email, `Office ${reg.id} must have verified email: ${reg.email}`);
    assert.ok(office.verificationStatusBn.includes('নিশ্চিতকৃত'));
    assert.ok(office.lastVerifiedBn, `Office ${reg.id} must have last-verified date`);
  }

  // 6. Guarantee that no regional office uses a lazy root https://dncrp.gov.bd URL
  const regionalOffices = DNCRP_OFFICES.filter((o) => o.id !== 'head-office');
  for (const ro of regionalOffices) {
    assert.notEqual(
      ro.sourceUrl,
      'https://dncrp.gov.bd',
      `Regional office ${ro.id} must NOT use blanket head office URL https://dncrp.gov.bd`
    );
  }

  // 7. Verify rendered file contains unverified fallback notice support
  assert.ok(
    guideContent.includes('তথ্যটি বর্তমানে নিশ্চিত করা যায়নি।'),
    'Must support fallback notice for unconfirmed details'
  );

  // 8. Assert false official-portal branding is removed
  assert.ok(
    !guideContent.includes('অফিসিয়াল তথ্য বাতায়ন'),
    'Must not claim to be the official government portal'
  );
  assert.ok(
    guideContent.includes('সরকারি দপ্তর ও ভোক্তা অধিকার নির্দেশিকা'),
    'Must use accurate directory heading'
  );
});

// ============================================================================
// TEST SUITE 19: CONSUMER GUIDE SEARCH & PRACTICAL UNBOXING GUIDANCE
// ============================================================================
test('Guide Search & Advice Integrity: Verifies full-text search capability and practical parcel unboxing guidance', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  const guideFile = path.resolve(process.cwd(), 'src', 'components', 'ConsumerGuideDirectory.tsx');
  const guideContent = await fs.readFile(guideFile, 'utf-8');

  // Verify interactive search input is implemented
  assert.ok(guideContent.includes('searchQuery'), 'Must include searchQuery state for directory');
  assert.ok(guideContent.includes('filteredOffices'), 'Must implement filteredOffices search logic');
  assert.ok(guideContent.includes('filteredStatutes'), 'Must implement filteredStatutes search logic');
  assert.ok(guideContent.includes('filteredFaqs'), 'Must implement filteredFaqs search logic');

  // Verify real search filtering behavior across verified records
  const { DNCRP_OFFICES } = await import('../src/data/dncrpOffices');
  const norm = (s: string) => s.toLowerCase().normalize('NFC').replace(/\u09AF\u09BC/g, '\u09DF').trim();
  const searchFilter = (query: string) => {
    const q = norm(query);
    return DNCRP_OFFICES.filter((o) =>
      norm(o.nameBn).includes(q) ||
      norm(o.nameEn).includes(q) ||
      norm(o.divisionBn).includes(q) ||
      norm(o.divisionEn).includes(q) ||
      norm(o.addressBn).includes(q) ||
      norm(o.addressEn).includes(q) ||
      norm(o.phone).includes(q) ||
      norm(o.email).includes(q)
    );
  };

  const mymensinghMatches = searchFilter('ময়মনসিংহ');
  assert.equal(mymensinghMatches.length, 1);
  assert.equal(mymensinghMatches[0].id, 'mymensingh');

  const sylhetMatches = searchFilter('Sylhet');
  assert.equal(sylhetMatches.length, 1);
  assert.equal(sylhetMatches[0].id, 'sylhet');

  const ncccMatches = searchFilter('NCCC');
  assert.equal(ncccMatches.length, 1);
  assert.equal(ncccMatches[0].id, 'nccc-dhaka');

  const dhakaMatches = searchFilter('Dhaka');
  assert.ok(dhakaMatches.length >= 3, 'Must match Head Office, NCCC, and Dhaka Divisional/District');

  const emptyMatches = searchFilter('xyz-nonexistent-query-999');
  assert.equal(emptyMatches.length, 0);

  // Verify practical unboxing advice replaces false statutory right
  assert.ok(
    guideContent.includes('ব্যবহারিক প্রমাণ সংরক্ষণ পরামর্শ'),
    'Must frame COD unboxing as practical evidence preservation guidance'
  );
  assert.ok(
    !guideContent.includes('ভিডিও ধারণ করা ক্রেতার আইনি অধিকার'),
    'Must NOT claim unboxing video is an invented statutory right'
  );
});

// ============================================================================
// TEST SUITE 20: COMPLAINT BUILDER STATE ISOLATION (Zero Contamination)
// ============================================================================
test('ComplaintBuilder State Isolation: Editing Case A does not contaminate Case B', () => {
  KenaSathiStorage.clearAllCases();

  const caseA = {
    ...FICTIONAL_HEADPHONE_DEMO_CASE,
    id: 'case_dispute_alpha',
    complaintDossier: {
      ...FICTIONAL_HEADPHONE_DEMO_CASE.complaintDossier,
      complaintId: 'DNCRP-ALPHA-01',
      complainantName: 'আব্দুল করিম',
      complainantAddress: 'ধানমন্ডি, ঢাকা',
      complainantNidPhone: '01711000001',
      sellerShopName: 'গেজেট মার্ট',
      sellerLocation: 'মিরপুর, ঢাকা',
      factualSummaryBn: 'ফোনের পরিবর্তে সাবান পাঠানো হয়েছে।',
      factualSummaryEn: 'Soap delivered instead of phone.',
    },
  };

  const caseB = {
    ...FICTIONAL_HEADPHONE_DEMO_CASE,
    id: 'case_dispute_beta',
    complaintDossier: {
      ...FICTIONAL_HEADPHONE_DEMO_CASE.complaintDossier,
      complaintId: 'DNCRP-BETA-02',
      complainantName: 'ফাতিমা বেগম',
      complainantAddress: 'জিইসি মোড়, চট্টগ্রাম',
      complainantNidPhone: '01811000002',
      sellerShopName: 'ফ্যাশন প্যালেস',
      sellerLocation: 'আগ্রাবাদ, চট্টগ্রাম',
      factualSummaryBn: 'ছেঁড়া কাপড় পাঠিয়ে বিক্রেতা ফেসবুক পেজে ব্লক করে দিয়েছে।',
      factualSummaryEn: 'Torn dress delivered and seller blocked consumer.',
    },
  };

  // Save both cases
  KenaSathiStorage.saveCase(caseA);
  KenaSathiStorage.saveCase(caseB);

  // Retrieve both and verify distinctness
  const loadedA = KenaSathiStorage.getCaseById('case_dispute_alpha');
  const loadedB = KenaSathiStorage.getCaseById('case_dispute_beta');

  assert.ok(loadedA && loadedB);
  assert.equal(loadedA.complaintDossier.complainantName, 'আব্দুল করিম');
  assert.equal(loadedB.complaintDossier.complainantName, 'ফাতিমা বেগম');
  assert.equal(loadedA.complaintDossier.sellerShopName, 'গেজেট মার্ট');
  assert.equal(loadedB.complaintDossier.sellerShopName, 'ফ্যাশন প্যালেস');

  // Edit Case A
  const updatedDossierA = {
    ...loadedA.complaintDossier,
    complainantName: 'আব্দুল করিম চৌধুরী (সংশোধিত)',
    factualSummaryBn: 'সংশোধিত বিবরণ: নকল হেডফোন সরবরাহ ও প্রতারণা।',
  };
  KenaSathiStorage.saveCase({
    ...loadedA,
    complaintDossier: updatedDossierA,
  });

  // Re-fetch both cases
  const refetchedA = KenaSathiStorage.getCaseById('case_dispute_alpha');
  const refetchedB = KenaSathiStorage.getCaseById('case_dispute_beta');

  assert.ok(refetchedA && refetchedB);
  assert.equal(refetchedA.complaintDossier.complainantName, 'আব্দুল করিম চৌধুরী (সংশোধিত)');
  assert.equal(refetchedA.complaintDossier.factualSummaryBn, 'সংশোধিত বিবরণ: নকল হেডফোন সরবরাহ ও প্রতারণা।');

  // Assert Case B remains completely untouched
  assert.equal(
    refetchedB.complaintDossier.complainantName,
    'ফাতিমা বেগম',
    'Case B complainantName must not be modified by Case A edits'
  );
  assert.equal(
    refetchedB.complaintDossier.sellerShopName,
    'ফ্যাশন প্যালেস',
    'Case B sellerShopName must not be contaminated'
  );
  assert.equal(
    refetchedB.complaintDossier.factualSummaryBn,
    'ছেঁড়া কাপড় পাঠিয়ে বিক্রেতা ফেসবুক পেজে ব্লক করে দিয়েছে।',
    'Case B factualSummary must remain completely isolated'
  );

  // Clean up
  KenaSathiStorage.clearAllCases();
});

// ============================================================================
// TEST SUITE 21: ACCESSIBILITY PREFERENCES ARCHITECTURE & CIVIC INTEGRITY
// ============================================================================
test('Accessibility Preferences: Default loading, persistent storage, safe fallback, and non-destructive reset', () => {
  // 1. Initial State: Clean storage returns defaults
  localStorage.removeItem(STORAGE_KEY_A11Y);
  const initialPrefs = loadAccessibilityPreferences();
  assert.equal(initialPrefs.textSize, 'normal', 'Default text size must be normal');
  assert.equal(initialPrefs.highContrast, false, 'Default high contrast must be false');
  assert.equal(initialPrefs.underlineLinks, false, 'Default underline links must be false');
  assert.ok(typeof initialPrefs.reduceMotion === 'boolean', 'reduceMotion must be a boolean');

  // 2. Storage Persistence: Save custom preferences and reload
  saveAccessibilityPreferences({
    textSize: 'largest',
    highContrast: true,
    reduceMotion: true,
    underlineLinks: true,
  });

  const storedRaw = localStorage.getItem(STORAGE_KEY_A11Y);
  assert.ok(storedRaw, 'Storage key must be present in localStorage');
  const parsed = JSON.parse(storedRaw as string);
  assert.equal(parsed.textSize, 'largest');
  assert.equal(parsed.highContrast, true);
  assert.equal(parsed.reduceMotion, true);
  assert.equal(parsed.underlineLinks, true);

  const reloaded = loadAccessibilityPreferences();
  assert.equal(reloaded.textSize, 'largest');
  assert.equal(reloaded.highContrast, true);
  assert.equal(reloaded.reduceMotion, true);
  assert.equal(reloaded.underlineLinks, true);

  // 3. Resilient Fallback on Corrupt Storage & Malformed Values
  localStorage.setItem(STORAGE_KEY_A11Y, '{"corrupt":true, "textSize":"invalid_size"}');
  const fallback = loadAccessibilityPreferences();
  assert.equal(fallback.textSize, 'normal', 'Must fall back safely on invalid textSize');
  assert.equal(fallback.highContrast, false, 'Must fall back safely to boolean false');

  // Verify that "false" string or numbers are NOT coerced into truthy booleans
  localStorage.setItem(STORAGE_KEY_A11Y, '{"highContrast":"false","reduceMotion":123,"underlineLinks":"true"}');
  const stringCoercionFallback = loadAccessibilityPreferences();
  assert.equal(stringCoercionFallback.highContrast, false, '"false" string must not evaluate to boolean true');
  assert.equal(stringCoercionFallback.underlineLinks, false, '"true" string must not evaluate to boolean true without being a real boolean');

  // Direct Schema Normalizer Unit Tests
  const norm1 = normalizeAccessibilityPreferences({ highContrast: 'false', textSize: 'giant' });
  assert.equal(norm1.highContrast, false, 'String "false" must normalize to boolean false');
  assert.equal(norm1.textSize, 'normal', 'Invalid text size must normalize to "normal"');

  const normNull = normalizeAccessibilityPreferences(null);
  assert.equal(normNull.textSize, 'normal', 'null must return fallback preferences');
  assert.equal(normNull.highContrast, false);

  const normNumbers = normalizeAccessibilityPreferences({ highContrast: 1, reduceMotion: 0 });
  assert.equal(normNumbers.highContrast, false, 'Numbers must not be treated as booleans');

  const normMissing = normalizeAccessibilityPreferences({ textSize: 'large' });
  assert.equal(normMissing.textSize, 'large');
  assert.equal(normMissing.highContrast, false);
  assert.equal(normMissing.underlineLinks, false);

  localStorage.setItem(STORAGE_KEY_A11Y, 'not-valid-json{{{');
  const parseFallback = loadAccessibilityPreferences();
  assert.equal(parseFallback.textSize, 'normal', 'Must fall back on malformed JSON without crashing');

  // 4. Non-Destructive Reset: Resetting preferences MUST NEVER touch consumer cases or drafts
  KenaSathiStorage.clearAllCases();
  const testCase = {
    ...FICTIONAL_HEADPHONE_DEMO_CASE,
    id: 'case_user_vault_preserve',
    disputeTitleBn: 'ব্যবহারকারীর সংরক্ষিত অভিযোগ যা রিসেটে ডিলিট হবে না',
  };
  KenaSathiStorage.saveCase(testCase);
  assert.equal(KenaSathiStorage.getCases().length, 1, 'Pre-condition: User case must exist');

  // Apply modified accessibility preferences
  saveAccessibilityPreferences({
    textSize: 'large',
    highContrast: true,
    reduceMotion: false,
    underlineLinks: true,
  });

  // Perform reset
  const resetResult = resetAccessibilityPreferences();
  assert.equal(resetResult.textSize, 'normal', 'Reset text size must be normal');
  assert.equal(resetResult.highContrast, false, 'Reset high contrast must be false');
  assert.equal(resetResult.underlineLinks, false, 'Reset underline links must be false');

  // Verify stored accessibility preferences are back to defaults
  const afterReset = loadAccessibilityPreferences();
  assert.equal(afterReset.textSize, 'normal');
  assert.equal(afterReset.highContrast, false);

  // CRITICAL INTEGRITY CHECK: User cases MUST remain intact
  const remainingCases = KenaSathiStorage.getCases();
  assert.equal(
    remainingCases.length,
    1,
    'Accessibility reset must NEVER delete user consumer cases or evidence'
  );
  assert.equal(
    remainingCases[0].id,
    'case_user_vault_preserve',
    'User case ID must be preserved intact'
  );
  assert.equal(
    remainingCases[0].disputeTitleBn,
    'ব্যবহারকারীর সংরক্ষিত অভিযোগ যা রিসেটে ডিলিট হবে না',
    'User case title must be preserved intact'
  );

  // Clean up
  KenaSathiStorage.clearAllCases();
  localStorage.removeItem(STORAGE_KEY_A11Y);
});

test('Accessibility DOM Synchronization: Correctly sets HTML data attributes and high-contrast class', () => {
  // Mock document and documentElement
  const attributes: Record<string, string> = {};
  const classList = new Set<string>();

  const mockDoc = {
    documentElement: {
      setAttribute: (k: string, v: string) => {
        attributes[k] = v;
      },
      classList: {
        add: (c: string) => classList.add(c),
        remove: (c: string) => classList.delete(c),
        contains: (c: string) => classList.has(c),
      },
    },
  };

  (globalThis as unknown as { document: unknown }).document = mockDoc;

  try {
    // Apply preferences
    applyAccessibilityToDOM({
      textSize: 'largest',
      highContrast: true,
      reduceMotion: true,
      underlineLinks: true,
    });

    assert.equal(attributes['data-text-size'], 'largest');
    assert.equal(attributes['data-high-contrast'], 'true');
    assert.equal(attributes['data-reduce-motion'], 'true');
    assert.equal(attributes['data-underline-links'], 'true');
    assert.ok(classList.has('high-contrast'), 'Must add high-contrast class when enabled');

    // Test switching off high contrast and normal text size
    applyAccessibilityToDOM({
      textSize: 'normal',
      highContrast: false,
      reduceMotion: false,
      underlineLinks: false,
    });

    assert.equal(attributes['data-text-size'], 'normal');
    assert.equal(attributes['data-high-contrast'], 'false');
    assert.equal(attributes['data-reduce-motion'], 'false');
    assert.equal(attributes['data-underline-links'], 'false');
    assert.ok(!classList.has('high-contrast'), 'Must remove high-contrast class when disabled');
  } finally {
    // Cleanup global document mock
    delete (globalThis as unknown as { document?: unknown }).document;
  }
});

// ============================================================================
// TEST SUITE 23: ACCESSIBILITY REDUCED MOTION OS SYNC & CITIZEN OVERRIDE (9 SCENARIOS)
// ============================================================================
test('Accessibility Reduce Motion: OS Synchronization & Citizen Override Precedence (9 Scenarios)', () => {
  let mockSystemPrefersReduced = false;

  // Setup mock window with dynamic matchMedia
  const originalWindow = (globalThis as unknown as { window?: unknown }).window;
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: (globalThis as unknown as { localStorage: Storage }).localStorage,
    matchMedia: (query: string) => ({
      matches: query.includes('reduce') ? mockSystemPrefersReduced : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  };

  try {
    // SCENARIO 1: OS reduced motion ON, no saved user override
    localStorage.removeItem(STORAGE_KEY_A11Y);
    mockSystemPrefersReduced = true;
    const s1 = loadAccessibilityPreferences();
    assert.equal(s1.reduceMotionOverride, null, 'Scenario 1: override must be null when no explicit choice stored');
    assert.equal(s1.reduceMotion, true, 'Scenario 1: effective reduceMotion must follow OS (true)');

    // SCENARIO 2: OS reduced motion OFF, no saved user override
    localStorage.removeItem(STORAGE_KEY_A11Y);
    mockSystemPrefersReduced = false;
    const s2 = loadAccessibilityPreferences();
    assert.equal(s2.reduceMotionOverride, null, 'Scenario 2: override must be null');
    assert.equal(s2.reduceMotion, false, 'Scenario 2: effective reduceMotion must follow OS (false)');

    // SCENARIO 3: OS changes from OFF to ON when citizen has no explicit override
    // Given override is null, updating with system preference change computes effective reduceMotion: true
    mockSystemPrefersReduced = true;
    const s3 = normalizeAccessibilityPreferences({ reduceMotionOverride: null });
    assert.equal(s3.reduceMotionOverride, null, 'Scenario 3: override remains null');
    assert.equal(s3.reduceMotion, true, 'Scenario 3: effective motion updates to true with OS change');

    // SCENARIO 4: Explicit user ON survives OS change to false
    mockSystemPrefersReduced = true;
    saveAccessibilityPreferences({
      textSize: 'normal',
      highContrast: false,
      reduceMotion: true,
      reduceMotionOverride: true,
      underlineLinks: false,
    });
    // System switches OFF
    mockSystemPrefersReduced = false;
    const s4 = loadAccessibilityPreferences();
    assert.equal(s4.reduceMotionOverride, true, 'Scenario 4: explicit user ON override preserved');
    assert.equal(s4.reduceMotion, true, 'Scenario 4: explicit user ON survives OS turning off');

    // SCENARIO 5: Explicit user OFF survives OS change to true
    saveAccessibilityPreferences({
      textSize: 'normal',
      highContrast: false,
      reduceMotion: false,
      reduceMotionOverride: false,
      underlineLinks: false,
    });
    // System switches ON
    mockSystemPrefersReduced = true;
    const s5 = loadAccessibilityPreferences();
    assert.equal(s5.reduceMotionOverride, false, 'Scenario 5: explicit user OFF override preserved');
    assert.equal(s5.reduceMotion, false, 'Scenario 5: explicit user OFF survives OS turning on');

    // SCENARIO 6: Reset returns to system preference
    // Pre-condition: user has explicit override: false while OS is true
    assert.equal(loadAccessibilityPreferences().reduceMotion, false);
    mockSystemPrefersReduced = true;
    const s6 = resetAccessibilityPreferences();
    assert.equal(s6.reduceMotionOverride, null, 'Scenario 6: reset must clear override to null');
    assert.equal(s6.reduceMotion, true, 'Scenario 6: reset must return to current OS preference (true)');

    const reloadedAfterReset = loadAccessibilityPreferences();
    assert.equal(reloadedAfterReset.reduceMotionOverride, null, 'Scenario 6: stored override remains null after reset');
    assert.equal(reloadedAfterReset.reduceMotion, true, 'Scenario 6: reloaded state matches OS preference');

    // SCENARIO 7: Reload preserves explicit user choice
    saveAccessibilityPreferences({
      textSize: 'large',
      highContrast: true,
      reduceMotion: false,
      reduceMotionOverride: false,
      underlineLinks: true,
    });
    const s7 = loadAccessibilityPreferences();
    assert.equal(s7.reduceMotionOverride, false, 'Scenario 7: reload must preserve explicit override');
    assert.equal(s7.reduceMotion, false, 'Scenario 7: reload must preserve effective value');
    assert.equal(s7.textSize, 'large');
    assert.equal(s7.highContrast, true);

    // SCENARIO 8: Cross-tab updates preserve correct precedence
    // Remote tab sets explicit override: true
    const crossTabPayload = JSON.stringify({
      textSize: 'normal',
      highContrast: false,
      reduceMotion: true,
      reduceMotionOverride: true,
      underlineLinks: false,
    });
    const s8a = normalizeAccessibilityPreferences(JSON.parse(crossTabPayload));
    assert.equal(s8a.reduceMotionOverride, true, 'Scenario 8a: cross-tab explicit override recognized');
    assert.equal(s8a.reduceMotion, true);

    // Remote tab resets to system preference (override: null)
    mockSystemPrefersReduced = false;
    const crossTabReset = JSON.stringify({
      textSize: 'normal',
      highContrast: false,
      reduceMotion: false,
      reduceMotionOverride: null,
      underlineLinks: false,
    });
    const s8b = normalizeAccessibilityPreferences(JSON.parse(crossTabReset));
    assert.equal(s8b.reduceMotionOverride, null, 'Scenario 8b: cross-tab reset to null recognized');
    assert.equal(s8b.reduceMotion, false, 'Scenario 8b: evaluates to current OS preference');

    // SCENARIO 9: Malformed override falls back safely
    mockSystemPrefersReduced = true;
    const s9String = normalizeAccessibilityPreferences({ reduceMotionOverride: 'invalid_string' });
    assert.equal(s9String.reduceMotionOverride, null, 'Scenario 9: string override safely normalizes to null');
    assert.equal(s9String.reduceMotion, true, 'Scenario 9: falls back to system preference (true)');

    const s9Number = normalizeAccessibilityPreferences({ reduceMotionOverride: 12345 });
    assert.equal(s9Number.reduceMotionOverride, null, 'Scenario 9: number override safely normalizes to null');

    const s9Obj = normalizeAccessibilityPreferences({ reduceMotionOverride: { complex: true } });
    assert.equal(s9Obj.reduceMotionOverride, null, 'Scenario 9: object override safely normalizes to null');

    // Clean up
    localStorage.removeItem(STORAGE_KEY_A11Y);
  } finally {
    // Restore window
    if (originalWindow !== undefined) {
      (globalThis as unknown as { window: unknown }).window = originalWindow;
    } else {
      delete (globalThis as unknown as { window?: unknown }).window;
    }
  }
});
