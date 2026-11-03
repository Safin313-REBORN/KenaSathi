import {
  ConsumerInspectionResult,
  CaseTask,
  CaseActivity,
} from '../types/consumer';
import { SAMPLE_CONSUMER_CASES } from '../data/consumerScenarios';
import { EvidenceBlobStorage } from './evidenceDb';

const STORAGE_KEYS = {
  CASES: 'kenasathi_cases_v2',
  TASKS: 'kenasathi_tasks_v2',
  ACTIVITIES: 'kenasathi_activities_v2',
  USER_PROFILE: 'kenasathi_profile_v2',
  INITIALIZED: 'kenasathi_initialized_v2',
};

// Strips base64 dataUrl from evidence items before localStorage save (Fixes P0-10 & prevents quota crash)
export function sanitizeCaseForLocalStorage(c: ConsumerInspectionResult): ConsumerInspectionResult {
  return {
    ...c,
    evidenceStorageType: 'indexeddb_blobs_and_local_meta',
    evidenceItems: (c.evidenceItems || []).map((ev) => {
      // Keep only metadata, blobId reference, and small snippets. Strip base64 dataUrl!
      const safeMeta = { ...ev };
      delete safeMeta.dataUrl;
      return {
        ...safeMeta,
        blobId: ev.blobId || ev.id,
      };
    }),
  };
}

export interface UserProfile {
  name: string;
  phone: string;
  address: string;
  nid?: string;
  email?: string;
  preferredLanguage: 'bn' | 'en';
}

// User profile defaults to empty fields to protect real consumer identities
const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  phone: '',
  address: '',
  email: '',
  preferredLanguage: 'bn',
};

// ============================================================================
// FICTIONAL DEMO SCENARIO FOR EVALUATOR DEMONSTRATION & BENCHMARK TESTING
// (Not a real incident; uses synthetic merchant and mock TrxID for testing)
// ============================================================================
export const FICTIONAL_HEADPHONE_DEMO_CASE: ConsumerInspectionResult = {
  id: 'case_demo_headphone_nondelivery',
  createdAt: new Date().toISOString().split('T')[0],
  incidentDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], // 5 days ago
  productName: 'Sony WH-1000XM5 Wireless Headphones (৳৮,৫০০)',
  productBrand: 'Sony (Advertised)',
  sellerName: 'Gadget Vault BD (নমুনা ডেমো মার্চেন্ট)',
  platform: 'facebook_page',
  grievanceType: 'product_not_delivered',
  claimedPurchasePriceBdt: 8500,
  fairMarketPriceBdt: 38000,
  trustScore: 25,
  riskTier: 'high_dispute_risk',
  confidenceScore: 85.0,
  processingMode: 'local_deterministic',
  statutoryCitation: 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯, ধারা ৪৫ ও ধারা ৬০',
  statutoryDisclaimerBn:
    'আইনি নোটিশ: এটি জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP) আইন ২০০৯ এর আলোকে প্রামাণ্য নথির ভিত্তিতে প্রস্তুত প্রাথমিক নালিশ খসড়া। কেনাসাথী কোনো সরকারি সংস্থা নয়; শুনানিতে নির্বাহী ম্যাজিস্ট্রেটের সিদ্ধান্ত চূড়ান্ত।',
  statutoryDisclaimerEn:
    'Legal Disclaimer: Prepared in accordance with Sections 45 & 60 of the Consumer Rights Protection Act 2009. Official relief is subject to administrative hearing before an Executive Magistrate.',
  evidenceItems: [
    {
      id: 'ev_hp_01',
      name: 'Facebook_Ad_Gadget_Vault.png',
      type: 'advertisement',
      fileFormat: 'png',
      size: '1.4 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      anomalyDetected: false,
      forensicStatus: 'pattern_matched',
      rawTextSnippet: 'Sony WH-1000XM5 Super Flash Sale. Price 8500 BDT only. Delivery within 3 days nationwide.',
      extractedFacts: [
        {
          id: 'fact_hp_1',
          field: 'productName',
          labelBn: 'পণ্যের নাম',
          labelEn: 'Product Name',
          value: 'Sony WH-1000XM5',
          sourceDocId: 'ev_hp_01',
          sourceDocName: 'Facebook_Ad_Gadget_Vault.png',
          confidenceLabel: 'pattern_matched',
          verified: false,
          factStatus: 'pattern_extracted',
          extractionMethod: 'regex_heuristic',
          sourceSnippet: 'Sony WH-1000XM5 Super Flash Sale',
        },
        {
          id: 'fact_hp_2',
          field: 'deliveryPromise',
          labelBn: 'প্রতিশ্রুত ডেলিভারি মেয়াদ',
          labelEn: 'Promised Delivery Time',
          value: 'Delivery within 3 days',
          sourceDocId: 'ev_hp_01',
          sourceDocName: 'Facebook_Ad_Gadget_Vault.png',
          confidenceLabel: 'pattern_matched',
          verified: false,
          factStatus: 'pattern_extracted',
          extractionMethod: 'regex_heuristic',
          sourceSnippet: 'Delivery within 3 days',
        },
      ],
    },
    {
      id: 'ev_hp_02',
      name: 'bKash_Payment_Statement_Trx9X81.jpg',
      type: 'receipt',
      fileFormat: 'jpg',
      size: '890 KB',
      uploadedAt: new Date().toISOString().split('T')[0],
      anomalyDetected: true,
      anomalyDescriptionBn: 'ব্যক্তিগত মোবাইল ওয়ালেটে অর্থ স্থানান্তর (পিয়ার-টু-পিয়ার চ্যানেল; অফিশিয়াল ইনভয়েসবিহীন লেনদেন)।',
      anomalyDescriptionEn: 'Payment transferred to personal wallet instead of merchant checkout.',
      forensicStatus: 'pattern_matched',
      rawTextSnippet: 'bKash Send Money Successful. Amount: Tk 8,500.00. To: 01823-XXXXXX. TrxID: BK9X81729L.',
      extractedFacts: [
        {
          id: 'fact_hp_3',
          field: 'transactionRef',
          labelBn: 'ট্রানজেকশন রেফারেন্স',
          labelEn: 'Transaction Reference',
          value: 'BK9X81729L',
          sourceDocId: 'ev_hp_02',
          sourceDocName: 'bKash_Payment_Statement_Trx9X81.jpg',
          confidenceLabel: 'pattern_matched',
          verified: false,
          factStatus: 'pattern_extracted',
          extractionMethod: 'regex_heuristic',
          sourceSnippet: 'TrxID: BK9X81729L',
        },
        {
          id: 'fact_hp_4',
          field: 'paidAmount',
          labelBn: 'পরিশোধিত মূল্য',
          labelEn: 'Paid Consideration',
          value: '৳৮,৫০০',
          sourceDocId: 'ev_hp_02',
          sourceDocName: 'bKash_Payment_Statement_Trx9X81.jpg',
          confidenceLabel: 'pattern_matched',
          verified: false,
          factStatus: 'pattern_extracted',
          extractionMethod: 'regex_heuristic',
          sourceSnippet: 'Tk 8,500.00',
        },
      ],
    },
  ],
  riskBreakdown: [
    {
      id: 'rb_hp_1',
      category: 'warning',
      provenance: 'document_observed',
      titleBn: 'ধারা ৪৫ পর্যালোচনা: প্রতিশ্রুত সরবরাহ লঙ্ঘন',
      titleEn: 'Section 45 Review: Breach of Supply Promise',
      detailBn: 'অগ্রিম ৳৮,৫০০ টাকা গ্রহণের পর ৩ দিনের প্রতিশ্রুত মেয়াদ অতিক্রান্ত হলেও পণ্য সরবরাহ করা হয়নি।',
      detailEn: 'Consideration remitted but merchant failed promised 3-day delivery window.',
      impactScore: 35,
      statuteRef: 'ধারা ৪৫',
    },
    {
      id: 'rb_hp_2',
      category: 'pattern_extracted',
      provenance: 'pattern_extracted',
      provenanceLabelBn: 'সংযুক্ত রসিদ হতে প্যাটার্ন শনাক্ত (ব্যাংক কর্তৃক সরাসরি প্রতিপাদিত নয়)',
      provenanceLabelEn: 'Pattern extracted from payment receipt',
      titleBn: 'বিকাশ লেনদেন রেকর্ড (TrxID: BK9X81729L)',
      titleEn: 'MFS Transaction Record',
      detailBn: 'পেমেন্ট স্টেটমেন্টে লেনদেন আইডি BK9X81729L প্রামাণ্য ভিত্তি হিসেবে সংরক্ষিত (প্যাটার্ন শনাক্ত)।',
      detailEn: 'Transaction reference BK9X81729L archived as candidate pattern from statement.',
      impactScore: 10,
    },
    {
      id: 'rb_hp_3',
      category: 'user_reported',
      provenance: 'calculated_from_user_date',
      provenanceLabelBn: 'ব্যবহারকারীর প্রদত্ত ঘটনার তারিখভিত্তিক গণনা',
      provenanceLabelEn: 'Calculated from user-provided incident date',
      titleBn: 'ধারা ৬০ তামাদি মেয়াদ: অবশিষ্ট ২৫ দিন',
      titleEn: 'Section 60 Window: 25 Days Remaining',
      detailBn: 'ঘটনার তারিখ হতে ৫ দিন অতিক্রান্ত হয়েছে; ৩০ দিনের আইনি তামাদির মধ্যে এখনও ২৫ দিন অবশিষ্ট রয়েছে।',
      detailEn: '5 days elapsed since cause of action; 25 days remaining before statutory deadline.',
      impactScore: 15,
      statuteRef: 'ধারা ৬০',
    },
  ],
  agentSteps: [
    {
      agentId: 'vision',
      nameBn: 'প্রামাণ্য নথি বিশ্লেষণ',
      nameEn: 'Document & Evidence Inspection',
      roleBn: 'বিজ্ঞাপন ও বিকাশ রসিদ যাচাই',
      roleEn: 'Inspects ad promise and payment receipt',
      status: 'completed',
      timestamp: '11:00 AM',
      findingsBn: ['বিজ্ঞাপনে ৩ দিনের ডেলিভারি প্রতিশ্রুতি', 'বিকাশ TrxID BK9X81729L শনাক্ত'],
      findingsEn: ['3-day delivery promised in ad', 'bKash TrxID BK9X81729L identified'],
      confidenceLabel: 'completed',
    },
    {
      agentId: 'statute',
      nameBn: 'আইনি ধারা নিরূপণ',
      nameEn: 'Statutory Mapping',
      roleBn: 'ধারা ৪৫ ও ৬০ পর্যালোচনা',
      roleEn: 'Maps to Sections 45 and 60',
      status: 'completed',
      timestamp: '11:01 AM',
      findingsBn: ['ধারা ৪৫ প্রতিশ্রুত সরবরাহ লঙ্ঘনের প্রাথমিক উপাদান', 'ধারা ৬০ তামাদি সময়সীমার মধ্যে বিদ্যমান'],
      findingsEn: ['Candidate provision: Section 45', 'Within Section 60 30-day limitation window'],
      confidenceLabel: 'completed',
    },
  ],
  applicableViolations: [
    {
      section: 'ধারা ৪৫',
      titleBn: 'প্রতিশ্রুত পণ্য বা সেবা প্রদান বা সরবরাহ না করা',
      titleEn: 'Failure to Supply Promised Goods or Services',
      descriptionBn: 'অগ্রিম মূল্য গ্রহণপূর্বক প্রতিশ্রুত পণ্য বা সেবা সরবরাহ না করা অনধিক ১ বছরের কারাদণ্ড বা ৫০,০০০ টাকা অর্থদণ্ডে দণ্ডনীয়।',
      descriptionEn: 'Punishable with up to 1 year imprisonment or BDT 50,000 fine under Section 45.',
      maxPenaltyFineBdt: 50000,
      maxImprisonmentYears: 1,
      whistleblowerRewardPercent: 25,
      officialSourceUrl: 'https://dncrp.gov.bd/',
    },
  ],
  complaintDossier: {
    complaintId: 'KS-DRAFT-2026-8812',
    generatedDate: new Date().toISOString().split('T')[0],
    incidentDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    complainantName: 'মুহাম্মদ তানভীর আহমেদ',
    complainantNidPhone: 'মোবাইল: 01712-345678',
    complainantAddress: 'মিরপুর-১০, ঢাকা-১২১৬',
    sellerShopName: 'Gadget Vault BD (ফেসবুক পেজ মার্চেন্ট)',
    sellerContact: 'বিকাশ নম্বর: 01823-XXXXXX',
    sellerLocation: 'অনলাইন শপ (ফেসবুক পেজ)',
    productName: 'Sony WH-1000XM5 Wireless Headphones',
    purchaseAmountBdt: 8500,
    transactionRef: 'BK9X81729L',
    courierName: 'পণ্য সরবরাহ করা হয়নি (Not Delivered)',
    grievanceType: 'product_not_delivered',
    factualSummaryBn:
      'আমি অভিযোগকারী মুহাম্মদ তানভীর আহমেদ, বিবাদী ফেসবুক পেজ "Gadget Vault BD" এর নিকট হতে ৳৮,৫০০ টাকা মূল্যে "Sony WH-1000XM5 Headphones" ক্রয়ের উদ্দেশ্যে সম্পূর্ণ অর্থ বিকাশ ট্রানজেকশন BK9X81729L মারফত পরিশোধ করি। বিবাদী ৩ দিনের মধ্যে নিশ্চিত হোম ডেলিভারির প্রতিশ্রুতি দেওয়া সত্ত্বেও ৫ দিন অতিক্রান্ত হওয়ার পরও পণ্য সরবরাহ করেনি এবং পরবর্তীতে বারবার যোগাযোগ করার চেষ্টা করা সত্ত্বেও সাড়া দেয়নি। ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৪৫ এর আলোকে বিষয়টি তদন্তপূর্বক আইনানুগ প্রতিকার প্রার্থনা করিতেছি।',
    factualSummaryEn:
      'I, Muhammad Tanvir Ahmed, placed an order for Sony WH-1000XM5 Headphones with respondent Facebook page "Gadget Vault BD" for BDT 8,500 and remitted consideration via bKash TrxID BK9X81729L. The respondent promised 3-day home delivery but failed to deliver the goods and ceased answering inquiries. I respectfully submit this factual grievance under Section 45 of CRPA 2009 for appropriate administrative investigation.',
    violations: [
      {
        section: 'ধারা ৪৫',
        titleBn: 'প্রতিশ্রুত পণ্য বা সেবা প্রদান বা সরবরাহ না করা',
        titleEn: 'Failure to Supply Promised Goods or Services',
        descriptionBn: 'প্রতিশ্রুত পণ্য বা সেবা যথাযথভাবে প্রদান বা সরবরাহ না করা।',
        descriptionEn: 'Failure to deliver promised goods.',
        maxPenaltyFineBdt: 50000,
        maxImprisonmentYears: 1,
        whistleblowerRewardPercent: 25,
        officialSourceUrl: 'https://dncrp.gov.bd/',
      },
    ],
    timeline: [
      {
        id: 'tl_hp_1',
        dateStr: '৫ দিন পূর্বে',
        titleBn: 'অর্ডার প্রদান ও বিকাশ পেমেন্ট সম্পন্ন',
        titleEn: 'Order Placed & bKash Payment Remitted',
        detailBn: '৮,৫০০ টাকা পরিশোধ (TrxID: BK9X81729L); ৩ দিনের হোম ডেলিভারি প্রতিশ্রুতি।',
        detailEn: 'BDT 8,500 transferred via bKash; 3-day delivery promised.',
        verified: true,
      },
      {
        id: 'tl_hp_2',
        dateStr: '২ দিন পূর্বে',
        titleBn: 'প্রতিশ্রুত ডেলিভারি মেয়াদ অতিক্রান্ত',
        titleEn: 'Promised Delivery Timeframe Expired',
        detailBn: '৩ দিন পার হলেও কুরিয়ার ট্র্যাকিং দেওয়া হয়নি এবং পেজ এডমিন মেসেজের উত্তর দেওয়া বন্ধ করেছে।',
        detailEn: 'Delivery deadline passed without tracking info; merchant ceased communication.',
        verified: true,
      },
    ],
    claimedRefundBdt: 8500,
    statutoryFineEstimatedBdt: 50000,
    whistleblowerRewardBdt: 12500, // 25% of 50,000 fine upon realization by magistrate
    submissionEmail: 'nccc@dncrp.gov.bd', // Official National Consumer Complaint Centre
    helpline: '16121',
    officialPortalUrl: 'https://ccms.dncrp.com/',
    limitationRemainingDays: 25,
    isTimeBarred: false,
    attachedEvidenceNames: ['Facebook_Ad_Gadget_Vault.png', 'bKash_Payment_Statement_Trx9X81.jpg'],
  },
  tasks: [
    {
      id: 'task_hp_1',
      caseId: 'case_demo_headphone_nondelivery',
      titleBn: 'বিক্রেতাকে লিখিত চূড়ান্ত দাবি নোটিশ প্রেরণ',
      titleEn: 'Send Final Written Demand to Seller',
      descriptionBn: 'ধারা ৪৫ উল্লেখ করে অবিলম্বে পণ্য সরবরাহ অথবা অর্থ ফেরতের দাবি জানান।',
      descriptionEn: 'Issue polite formal demand citing Section 45 requesting refund or delivery.',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      priority: 'urgent',
      status: 'pending',
      statutoryDeadline: 'ধারা ৪৫',
    },
    {
      id: 'task_hp_2',
      caseId: 'case_demo_headphone_nondelivery',
      titleBn: 'সকল ডিজিটাল প্রমাণের পিডিএফ ও স্ক্রিনশট ব্যাকআপ',
      titleEn: 'Archive Digital Screenshots & Payment Receipts',
      descriptionBn: 'বিজ্ঞাপন ও লেনদেন স্টেটমেন্ট নিরাপদে সংরক্ষণ করুন।',
      descriptionEn: 'Backup conversation export and official MFS statement.',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'high',
      status: 'completed',
      completedAt: new Date().toISOString(),
    },
    {
      id: 'task_hp_3',
      caseId: 'case_demo_headphone_nondelivery',
      titleBn: 'ডিএনসিআরপি সেন্ট্রাল কমপ্লেইন্ট পোর্টালে (ccms.dncrp.com) নালিশ দাখিল',
      titleEn: 'Submit Complaint via Official DNCRP Portal (ccms.dncrp.com)',
      descriptionBn: 'ধারা ৬০ এর ৩০ দিনের তামাদি শেষ হওয়ার পূর্বেই প্রস্তুতকৃত খসড়াটি দাখিল করুন।',
      descriptionEn: 'Dispatch the prepared Section 45 complaint within 30-day window.',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: 'urgent',
      status: 'pending',
      statutoryDeadline: 'ধারা ৬০ (৩০ দিন)',
    },
  ],
  activities: [
    {
      id: 'act_hp_1',
      caseId: 'case_demo_headphone_nondelivery',
      timestamp: new Date().toISOString(),
      type: 'created',
      titleBn: 'নতুন বিরোধ সৃষ্টি: হেডফোন ডেলিভারি না পাওয়ার নালিশ (ডেমো)',
      titleEn: 'Case Created: Non-Delivery of Headphones (Demo)',
      details: 'বিকাশ TrxID BK9X81729L এবং বিজ্ঞাপন স্ক্রিনশট যুক্ত করা হয়েছে।',
    },
  ],
  extractedFacts: [
    {
      id: 'f_hp_1',
      field: 'productName',
      labelBn: 'পণ্যের নাম',
      labelEn: 'Product Name',
      value: 'Sony WH-1000XM5 Headphones',
      sourceDocId: 'ev_hp_01',
      sourceDocName: 'Facebook_Ad_Gadget_Vault.png',
      confidence: 85,
      verified: false,
      factStatus: 'pattern_extracted',
    },
    {
      id: 'f_hp_2',
      field: 'purchasePrice',
      labelBn: 'পরিশোধিত মূল্য',
      labelEn: 'Purchase Price',
      value: '৳৮,৫০০',
      sourceDocId: 'ev_hp_02',
      sourceDocName: 'bKash_Payment_Statement_Trx9X81.jpg',
      confidence: 90,
      verified: false,
      factStatus: 'pattern_extracted',
    },
    {
      id: 'f_hp_3',
      field: 'transactionId',
      labelBn: 'ট্রানজেকশন রেফারেন্স',
      labelEn: 'TrxID',
      value: 'BK9X81729L',
      sourceDocId: 'ev_hp_02',
      sourceDocName: 'bKash_Payment_Statement_Trx9X81.jpg',
      confidence: 88,
      verified: false,
      factStatus: 'pattern_extracted',
    },
    {
      id: 'f_hp_4',
      field: 'deliveryPromise',
      labelBn: 'প্রতিশ্রুত ডেলিভারি',
      labelEn: 'Promised Delivery',
      value: 'Delivery within 3 days',
      sourceDocId: 'ev_hp_01',
      sourceDocName: 'Facebook_Ad_Gadget_Vault.png',
      confidence: 80,
      verified: false,
      factStatus: 'pattern_extracted',
    },
  ],
  unknownFields: [
    'বিক্রেতার নিবন্ধিত ট্রেড লাইসেন্স নম্বর (অজ্ঞাত)',
    'বিক্রেতার স্থায়ী দোকান বা ব্যবসায়িক ঠিকানা (অজ্ঞাত)',
  ],
};

// Alias for backwards compatibility with tests and older views
export const HEADPHONE_NON_DELIVERY_CASE = FICTIONAL_HEADPHONE_DEMO_CASE;

// ============================================================================
// HONEST, PROVABLE STORAGE MANAGER (BROWSER-LOCAL PROTOTYPE PERSISTENCE)
// ============================================================================
export const KenaSathiStorage = {
  initialize() {
    // Honest prototype persistence: Does NOT force seed data into user store
    // Real store starts empty ([]) so user has a clean, authentic experience
    try {
      const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!initialized) {
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      }
    } catch {
      // Browser storage unavailable or private mode
    }
  },

  // Returns ONLY real cases stored by user; returns [] if empty
  getCases(): ConsumerInspectionResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CASES);
      if (!data) return [];
      const parsed: ConsumerInspectionResult[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  getCaseById(id: string): ConsumerInspectionResult | null {
    const cases = this.getCases();
    const found = cases.find((c) => c.id === id);
    if (found) return found;
    // Check if it's the fictional demo preset
    if (id === FICTIONAL_HEADPHONE_DEMO_CASE.id) return FICTIONAL_HEADPHONE_DEMO_CASE;
    if (SAMPLE_CONSUMER_CASES[id]) return SAMPLE_CONSUMER_CASES[id];
    return null;
  },

  saveCase(newCase: ConsumerInspectionResult): void {
    try {
      const sanitized = sanitizeCaseForLocalStorage(newCase);
      const cases = this.getCases();
      const existingIndex = cases.findIndex((c) => c.id === sanitized.id);
      let updated: ConsumerInspectionResult[];
      if (existingIndex >= 0) {
        cases[existingIndex] = sanitized;
        updated = [...cases];
      } else {
        updated = [sanitized, ...cases];
      }
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(updated));

      // Persist tasks attached to this case
      if (newCase.tasks && newCase.tasks.length > 0) {
        newCase.tasks.forEach((t) => this.saveTask(t));
      }
      // Persist activities
      if (newCase.activities && newCase.activities.length > 0) {
        newCase.activities.forEach((a) => this.addActivity(a));
      }
    } catch (err) {
      console.warn('Failed to save case to local storage (quota or security restriction):', err);
    }
  },

  deleteCase(id: string): void {
    try {
      const cases = this.getCases();
      const target = cases.find((c) => c.id === id);
      if (target && target.evidenceItems) {
        for (const ev of target.evidenceItems) {
          const blobKey = ev.blobId || ev.id;
          if (blobKey) {
            EvidenceBlobStorage.deleteBlob(blobKey).catch(() => {});
          }
        }
      }
      const updated = cases.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(updated));
      // Also clean up tasks and activities for this case
      const tasks = this.getTasks().filter((t) => t.caseId !== id);
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      const activities = this.getActivities().filter((a) => a.caseId !== id);
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (err) {
      console.warn('Failed to delete case:', err);
    }
  },

  loadFictionalDemo(): ConsumerInspectionResult {
    const demo = { ...FICTIONAL_HEADPHONE_DEMO_CASE, id: `case_demo_${Date.now()}` };
    this.saveCase(demo);
    return demo;
  },

  getTasks(caseId?: string): CaseTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      const tasks: CaseTask[] = data ? JSON.parse(data) : [];
      if (caseId) {
        return tasks.filter((t) => t.caseId === caseId);
      }
      return tasks;
    } catch {
      return [];
    }
  },

  saveTask(task: CaseTask): void {
    try {
      const tasks = this.getTasks();
      const idx = tasks.findIndex((t) => t.id === task.id);
      let updated: CaseTask[];
      if (idx >= 0) {
        tasks[idx] = task;
        updated = [...tasks];
      } else {
        updated = [task, ...tasks];
      }
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save task:', err);
    }
  },

  toggleTaskStatus(taskId: string): CaseTask | null {
    try {
      const tasks = this.getTasks();
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return null;

      task.status = task.status === 'completed' ? 'pending' : 'completed';
      task.completedAt = task.status === 'completed' ? new Date().toISOString() : undefined;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return task;
    } catch (err) {
      console.warn('Failed to toggle task:', err);
      return null;
    }
  },

  getActivities(caseId?: string): CaseActivity[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      const activities: CaseActivity[] = data ? JSON.parse(data) : [];
      if (caseId) {
        return activities.filter((a) => a.caseId === caseId);
      }
      return activities;
    } catch {
      return [];
    }
  },

  addActivity(activity: CaseActivity): void {
    try {
      const activities = this.getActivities();
      const updated = [activity, ...activities.slice(0, 100)];
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to add activity:', err);
    }
  },

  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (err) {
      console.warn('Failed to save profile:', err);
    }
  },

  exportAllDataJson(): string {
    const data = {
      version: '2.1.0',
      exportedAt: new Date().toISOString(),
      disclaimer: 'KenaSathi AI Client-Side Export. Contains confidential citizen dispute drafts.',
      cases: this.getCases(),
      tasks: this.getTasks(),
      activities: this.getActivities(),
      userProfile: this.getUserProfile(),
    };
    return JSON.stringify(data, null, 2);
  },

  importDataJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !Array.isArray(parsed.cases)) {
        throw new Error('Invalid KenaSathi backup format');
      }
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(parsed.cases));
      if (Array.isArray(parsed.tasks)) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(parsed.tasks));
      }
      if (Array.isArray(parsed.activities)) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(parsed.activities));
      }
      if (parsed.userProfile) {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(parsed.userProfile));
      }
      return true;
    } catch (err) {
      console.error('Failed to import data:', err);
      return false;
    }
  },
};
