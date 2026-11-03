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
  const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
  const fortyDaysAgo = new Date(Date.now() - 40 * 86400000).toISOString().split('T')[0];

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
  const todayStr = new Date().toISOString().split('T')[0];
  const todayResult = calculateSection60Limitation(todayStr);
  assert.equal(todayResult.limitationRemainingDays, 30);
  assert.equal(todayResult.isTimeBarred, false);

  // 3. Incident occurred 5 days ago -> exactly 25 calendar days remaining
  const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
  const fiveDaysResult = calculateSection60Limitation(fiveDaysAgo);
  assert.equal(fiveDaysResult.limitationRemainingDays, 25);
  assert.equal(fiveDaysResult.isTimeBarred, false);
  assert.equal(fiveDaysResult.isExpiringSoon, false);

  // 4. Incident occurred 30 days ago -> boundary: 0 days remaining, last day to file
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const thirtyDaysResult = calculateSection60Limitation(thirtyDaysAgo);
  assert.equal(thirtyDaysResult.limitationRemainingDays, 0);
  assert.equal(thirtyDaysResult.isTimeBarred, false, 'Day 30 is still within statutory window');
  assert.equal(thirtyDaysResult.isExpiringSoon, true);

  // 5. Incident occurred 31 days ago -> time-barred
  const thirtyOneDaysAgo = new Date(Date.now() - 31 * 86400000).toISOString().split('T')[0];
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
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
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
test('Public Portal Integrity: Verifies zero competition references and institutional civic boundary', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  const srcDir = path.resolve(process.cwd(), 'src');
  const indexHtmlPath = path.resolve(process.cwd(), 'index.html');

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

  // Recursive search in src/ for forbidden event terms
  async function searchFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await searchFiles(fullPath)));
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const allSrcFiles = await searchFiles(srcDir);
  const forbiddenRegex = /Ostad Presents|YUNet|AIgnite|Buildathon 2026|PitchDeckModal/i;

  for (const file of allSrcFiles) {
    const content = await fs.readFile(file, 'utf-8');
    assert.ok(
      !forbiddenRegex.test(content),
      `File ${path.basename(file)} must not contain competition or event references`
    );
  }
});


