import { z } from 'zod';
import {
  CaseTask,
  ConsumerGrievanceType,
  ConsumerInspectionResult,
  DisputeTimelineEvent,
  DncrpStatuteViolation,
  EvidenceItem,
  ExtractedFact,
  InspectionAgentStep,
  RiskCategoryItem,
  RiskTier,
} from '../types/consumer';
import {
  calculateSection60Limitation,
  Section60LimitationResult,
} from './limitationService';

export const ModelAnalysisOutputSchema = z.object({
  summaryBn: z.string().min(1),
  summaryEn: z.string().min(1),
  trustScore: z.number().min(0).max(100).optional(),
  statuteSection: z.string().optional(),
  statutoryReasoningBn: z.string().optional(),
  extractedFacts: z
    .array(
      z.object({
        labelBn: z.string(),
        labelEn: z.string(),
        value: z.string(),
        sourceDocId: z.string().optional(),
        sourceSnippet: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  unknownFields: z.array(z.string()).optional().default([]),
});
export type ModelAnalysisOutput = z.infer<typeof ModelAnalysisOutputSchema>;

// Comprehensive PII sanitization helper for external cloud transmission (Data Minimization)
export function sanitizePiiForCloud(text: string): string {
  if (!text) return '';
  return text
    // Bangladeshi mobile numbers (+8801..., 8801..., 01...) with optional spacing or hyphens
    .replace(/(?:\+?880[\s-]?)?0?1[3-9]\d{1,2}[\s-]?\d{3}[\s-]?\d{3,4}\b|\b01[3-9]\d{8}\b/g, '[PHONE_REDACTED]')
    // National Identity (NID) formats: 10-digit smart NID, 13-digit legacy, or 17-digit birth-year prefixed NID
    .replace(/\b(?:\d{17}|\d{13}|\d{10})\b/g, '[NID_REDACTED]')
    // Email addresses
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[EMAIL_REDACTED]');
}

export interface AiAnalysisInput {
  productName: string;
  productBrand: string;
  sellerName: string;
  platform: 'facebook_page' | 'daraz' | 'chaldal' | 'physical_store' | 'standalone_website';
  grievanceType: ConsumerGrievanceType;
  claimedPurchasePriceBdt: number;
  fairMarketPriceBdt: number;
  transactionRef: string;
  incidentDate?: string; // Cause of action date (crucial for Section 60)
  complainantName: string;
  complainantPhone: string;
  complainantAddress: string;
  incidentDetail: string;
  evidenceItems: EvidenceItem[];
  detectedFacts: ExtractedFact[];
  // Ephemeral AI Execution Options (Zero Permanent Secret Storage)
  ephemeralApiKey?: string;
  preferredProvider?: 'local_deterministic' | 'gemini' | 'openai';
  userConsentedToCloud?: boolean;
}

// Statutory rules dictionary aligned with Bangladesh Consumer Rights Protection Act 2009 (CRPA 2009)
// Note: These are candidate statutory provisions for official review, not definitive judicial findings.
export const STATUTE_MAP: Record<
  ConsumerGrievanceType,
  {
    section: string;
    titleBn: string;
    titleEn: string;
    descBn: string;
    descEn: string;
    maxFine: number;
    years: number;
    statutoryNotes: string;
  }
> = {
  product_not_delivered: {
    section: 'ধারা ৪৫',
    titleBn: 'প্রতিশ্রুত পণ্য বা সেবা প্রদান বা সরবরাহ না করা',
    titleEn: 'Failure to Supply Promised Goods or Services',
    descBn:
      'কোনো ব্যক্তি বা প্রতিষ্ঠান প্রতিশ্রুত পণ্য বা সেবা যথাযথভাবে প্রদান বা সরবরাহ না করিলে অনধিক ১ বছরের কারাদণ্ড বা ৫০,০০০ টাকা অর্থদণ্ড বা উভয় দণ্ডে দণ্ডিত হইতে পারেন।',
    descEn:
      'Punishable with up to 1 year imprisonment or BDT 50,000 fine for failure to supply promised goods or services under Section 45.',
    maxFine: 50000,
    years: 1,
    statutoryNotes:
      'অগ্রিম মূল্য গ্রহণপূর্বক প্রতিশ্রুত সময়ে পণ্য সরবরাহ না করা এবং পরবর্তীতে যোগাযোগ বিচ্ছিন্ন করা এই ধারার প্রাথমিক উপাদান।',
  },
  wrong_product: {
    section: 'ধারা ৪৫',
    titleBn: 'ভুল বা ভিন্ন পণ্য সরবরাহপূর্বক চুক্তি ভঙ্গ',
    titleEn: 'Supply of Dissimilar / Non-Conforming Goods',
    descBn:
      'অর্ডারের সাথে অসামঞ্জস্যপূর্ণ ভিন্ন বা ত্রুটিপূর্ণ পণ্য সরবরাহ করে ক্রেতার সম্মতি ব্যতিরেকে বাধ্য করা ধারা ৪৫ এর পরিপন্থী।',
    descEn:
      'Supplying incorrect or non-conforming goods in breach of express sales commitment under Section 45.',
    maxFine: 50000,
    years: 1,
    statutoryNotes:
      'ধারা ৫৩ (সেবা প্রদাতার অবহেলা) কেবল তখনই প্রযোজ্য যদি কোনো সেবা প্রদানের অবহেলার কারণে ক্রেতার জীবন বা অর্থের অপূরণীয় ক্ষতি ঘটে।',
  },
  damaged_product: {
    section: 'ধারা ৪৫',
    titleBn: 'ক্ষতিগ্রস্ত বা অব্যবহারযোগ্য পণ্য সরবরাহ',
    titleEn: 'Supply of Defective or Damaged Goods',
    descBn:
      'নতুন ও অক্ষত পণ্যের প্রতিশ্রুতি দিয়ে ভাঙা, ব্যবহৃত বা ক্ষতিগ্রস্ত পণ্য সরবরাহ করা প্রতিশ্রুত মান লঙ্ঘনের শামিল।',
    descEn:
      'Supplying broken or damaged goods in breach of purchase contract under Section 45.',
    maxFine: 50000,
    years: 1,
    statutoryNotes:
      'ডেলিভারি গ্রহণের পর তাৎক্ষণিক আনবক্সিং ভিডিও বা রসিদে নোট থাকা প্রমাণ হিসেবে অত্যন্ত গুরুত্বপূর্ণ।',
  },
  refund_refused: {
    section: 'ধারা ৪৫',
    titleBn: 'প্রতিশ্রুত অর্থ ফেরত বা রিফান্ড প্রদানে অস্বীকৃতি',
    titleEn: 'Refusal of Promised Lawful Refund',
    descBn:
      'পণ্য সরবরাহে ব্যর্থ হওয়া বা ত্রুটিপূর্ণ পণ্য ফেরত নেওয়ার পর প্রতিশ্রুত রিফান্ড আটকে রাখা সেবা প্রদানে ব্যর্থতার অংশ।',
    descEn:
      'Unlawfully withholding refund post return or supply failure under Section 45.',
    maxFine: 50000,
    years: 1,
    statutoryNotes:
      'রিফান্ড পলিসির স্ক্রিনশট এবং বিক্রেতার সাথে চ্যাটের প্রতিশ্রুতি প্রামাণ্য ভিত্তি হিসেবে বিবেচিত হয়।',
  },
  payment_dispute: {
    section: 'ধারা ৪০ ও ৪৫',
    titleBn: 'নির্ধারিত মূল্যের অতিরিক্ত মূল্য আদায় বা মূল্য বিরোধ',
    titleEn: 'Charging Above Regulated/Marked Price or Pricing Dispute',
    descBn:
      'আইন বা বিধি দ্বারা নির্ধারিত বা মোড়কে মুদ্রিত সর্বোচ্চ খুচরা মূল্যের (MRP) অধিক মূল্যে পণ্য বিক্রয় ধারা ৪০ অনুযায়ী দণ্ডনীয়।',
    descEn:
      'Selling above scheduled or marked retail price (MRP) is punishable under Section 40. Ordinary transaction disputes fall under Section 45.',
    maxFine: 50000,
    years: 1,
    statutoryNotes:
      'সতর্কতা: ধারা ৪০ কেবল সরকার নির্ধারিত বা মুদ্রিত সর্বোচ্চ মূল্যের চেয়ে বেশি দাবি করার ক্ষেত্রে প্রযোজ্য; সাধারণ ব্যাংক/বিকাশ পেমেন্ট বিরোধের ক্ষেত্রে ধারা ৪৫ অধিক সামঞ্জস্যপূর্ণ।',
  },
  warranty_dispute: {
    section: 'ধারা ৪৫',
    titleBn: 'প্রতিশ্রুত ওয়ারেন্টি বা বিক্রয়োত্তর সেবা প্রদানে ব্যর্থতা',
    titleEn: 'Breach of Express After-Sales Warranty',
    descBn:
      'বিক্রয়কালে ওয়ারেন্টির নিশ্চয়তা প্রদান সত্ত্বেও পরবর্তীতে তা প্রদানে অস্বীকৃতি জানানো ধারা ৪৫ অনুযায়ী প্রতিশ্রুত সেবা প্রদানে ব্যর্থতা।',
    descEn:
      'Refusal to honor express after-sales service or warranty commitments under Section 45.',
    maxFine: 50000,
    years: 1,
    statutoryNotes:
      'ওয়ারেন্টি কার্ড বা ইনভয়েসে উল্লেখিত মেয়াদ ও শর্তাবলি প্রমাণ হিসেবে দাখিল করতে হবে।',
  },
  misleading_ad: {
    section: 'ধারা ৪৪',
    titleBn: 'মিথ্যা, অসত্য বা প্রতারণামূলক বিজ্ঞাপন প্রচার',
    titleEn: 'Deceptive and Fraudulent Advertisement',
    descBn:
      'বিজ্ঞাপনে অসত্য বা চাতুর্যপূর্ণ বর্ণনা দিয়ে ভোক্তাকে বিভ্রান্ত ও প্রলুব্ধ করা অনধিক ১ বছরের কারাদণ্ড বা ২,০০,০০০ টাকা অর্থদণ্ডে দণ্ডনীয়।',
    descEn:
      'Punishable with up to 1 year imprisonment or BDT 200,000 fine for false or misleading advertising under Section 44.',
    maxFine: 200000,
    years: 1,
    statutoryNotes:
      'ফেসবুক বিজ্ঞাপন, ওয়েবসাইট অফার বা বিজ্ঞাপনী পোস্টের স্ক্রিনশট এই ধারার মূল প্রমাণ।',
  },
  counterfeit_product: {
    section: 'ধারা ৫০ ও ৪৪',
    titleBn: 'নকল বা জাল পণ্য প্রস্তুত ও বিপণন',
    titleEn: 'Manufacturing and Marketing Counterfeit Goods',
    descBn:
      'ধারা ৫০ অনুযায়ী নকল পণ্য প্রস্তুত করা অনধিক ৩ বছরের কারাদণ্ড বা ২,০০,০০০ টাকা অর্থদণ্ডে দণ্ডনীয়। আসল বলে প্রচার করে নকল বিক্রয় ধারা ৪৪ এর আওতায় পড়ে।',
    descEn:
      'Section 50 penalizes manufacturing counterfeit goods. Selling a counterfeit while advertising authentic goods constitutes deception under Section 44.',
    maxFine: 200000,
    years: 3,
    statutoryNotes:
      'সতর্কতা: ধারা ৫০ মূলত নকল পণ্য প্রস্তুতকারীদের জন্য। খুচরা বিক্রেতা নকল বিক্রয় করলে ধারা ৪৪ ও ৪৫ এর অধীনে অভিযোগ সাধারণত কার্যকর হয়।',
  },
  adulterated_goods: {
    section: 'ধারা ৪১',
    titleBn: 'ভেজাল বা মানবস্বাস্থ্যের জন্য ক্ষতিকর পণ্য বিক্রয়',
    titleEn: 'Sale of Adulterated or Harmful Goods',
    descBn:
      'মানবস্বাস্থ্যের জন্য ক্ষতিকর কোনো দ্রব্য মিশ্রিত খাদ্য বা পণ্য বিক্রয় করা অনধিক ৩ বছরের কারাদণ্ড বা ২,০০,০০০ টাকা অর্থদণ্ডে দণ্ডনীয়।',
    descEn:
      'Punishable with up to 3 years imprisonment or BDT 200,000 fine for selling adulterated goods under Section 41.',
    maxFine: 200000,
    years: 3,
    statutoryNotes:
      'ল্যাবরেটরি টেস্ট রিপোর্ট বা বিএসটিআই মান সনদের ব্যত্যয় এই ধারায় বিচার্য বিষয়।',
  },
  seller_communication: {
    section: 'ধারা ৪৫',
    titleBn: 'যোগাযোগ বিচ্ছিন্নকরণপূর্বক প্রতিশ্রুত সেবা প্রদানে অস্বীকৃতি',
    titleEn: 'Severing Communication in Breach of Supply Commitment',
    descBn:
      'মূল্য গ্রহণের পর ক্রেতাকে ব্লক করা বা যোগাযোগ সম্পূর্ণ বন্ধ করা প্রতিশ্রুত পণ্য বা সেবা সরবরাহ না করার প্রমাণ হিসেবে গণ্য।',
    descEn:
      'Ceasing communication post consideration constitutes willful failure to supply goods/services under Section 45.',
    maxFine: 50000,
    years: 1,
    statutoryNotes:
      'কল লগ, আনরিচেবল স্ট্যাটাস বা মেসেঞ্জারে ব্লক করার স্ক্রিনশট সাক্ষ্য হিসেবে সংরক্ষণ করুন।',
  },
  other_consumer_issue: {
    section: 'ধারা ৪৫',
    titleBn: 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর আওতায় সাধারণ নালিশ',
    titleEn: 'General Consumer Rights Grievance',
    descBn:
      'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর বিধান অনুযায়ী উপযুক্ত প্রতিকার প্রার্থনা।',
    descEn:
      'General grievance petition submitted pursuant to CRPA 2009 provisions.',
    maxFine: 50000,
    years: 1,
    statutoryNotes:
      'সংশ্লিষ্ট ঘটনার সুনির্দিষ্ট বিবরণ এবং লেনদেনের প্রমাণপত্র আবশ্যক।',
  },
  // Aliases
  deceptive_advertisement: {
    section: 'ধারা ৪৪',
    titleBn: 'মিথ্যা বিজ্ঞাপন',
    titleEn: 'Deceptive Advertisement',
    descBn: 'বিজ্ঞাপনে মিথ্যা তথ্য দেওয়া।',
    descEn: 'False claims in advertising.',
    maxFine: 200000,
    years: 1,
    statutoryNotes: 'ধারা ৪৪ প্রযোজ্য।',
  },
  refused_refund_warranty: {
    section: 'ধারা ৪৫',
    titleBn: 'রিফান্ড ও ওয়ারেন্টি অস্বীকৃতি',
    titleEn: 'Refused Refund / Warranty',
    descBn: 'প্রতিশ্রুত রিফান্ড বা ওয়ারেন্টি না দেওয়া।',
    descEn: 'Failure to honor refund or warranty.',
    maxFine: 50000,
    years: 1,
    statutoryNotes: 'ধারা ৪৫ প্রযোজ্য।',
  },
  price_gouging_overcharge: {
    section: 'ধারা ৪০',
    titleBn: 'অতিরিক্ত মূল্য আদায়',
    titleEn: 'Price Gouging',
    descBn: 'নির্ধারিত মূল্যের অতিরিক্ত মূল্যে বিক্রয়।',
    descEn: 'Selling above regulated price.',
    maxFine: 50000,
    years: 1,
    statutoryNotes: 'ধারা ৪০ প্রযোজ্য।',
  },
  expired_hazardous_product: {
    section: 'ধারা ৫১ ও ৪১',
    titleBn: 'মেয়াদোত্তীর্ণ বা ক্ষতিকর পণ্য',
    titleEn: 'Expired or Hazardous Product',
    descBn: 'মেয়াদোত্তীর্ণ পণ্য বিক্রয়।',
    descEn: 'Sale of expired goods.',
    maxFine: 50000,
    years: 1,
    statutoryNotes: 'ধারা ৫১ প্রযোজ্য।',
  },
};

export function getStatuteForGrievance(type: ConsumerGrievanceType) {
  return STATUTE_MAP[type] || STATUTE_MAP.product_not_delivered;
}

// ============================================================================
// MAIN DISPUTE ANALYSIS ENGINE (CLIENT-SIDE OR CLOUD-ASSISTED)
// ============================================================================
export async function runKenaSathiAiAnalysis(
  input: AiAnalysisInput,
  onProgress?: (step: string) => void
): Promise<ConsumerInspectionResult> {
  const statuteInfo = getStatuteForGrievance(input.grievanceType);
  const caseId = `case_${Date.now()}`;
  const nowStr = new Date().toISOString().split('T')[0];

  // If user requested live cloud AI (Gemini or OpenAI)
  if (input.preferredProvider === 'gemini' || input.preferredProvider === 'openai') {
    // 1. Missing credentials check (P0-1, P0-A)
    if (!input.ephemeralApiKey || !input.ephemeralApiKey.trim()) {
      const fallback = runLocalDeterministicEngine(input, statuteInfo, caseId, nowStr);
      return {
        ...fallback,
        processingMode: 'missing_credentials',
        providerError: 'Missing API key. Live cloud AI requires a temporary session API key.',
        aiModelUsed: 'Local Legal Rules Engine (Missing Cloud Credentials)',
      };
    }

    // 2. Explicit consent and key provided
    if (input.userConsentedToCloud && input.ephemeralApiKey) {
      if (input.preferredProvider === 'gemini') {
        try {
          if (onProgress) onProgress('Connecting to Google Gemini 3.8 Flash Vision API (Multimodal)...');
          const liveResult = await callLiveGeminiApi(input, input.ephemeralApiKey.trim(), statuteInfo, caseId, nowStr);
          if (liveResult) return liveResult;
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.warn('Live Gemini AI call failed:', errMsg);
          const fallback = runLocalDeterministicEngine(input, statuteInfo, caseId, nowStr);
          return {
            ...fallback,
            processingMode: 'local_rules_fallback',
            providerError: `Gemini API request failed: ${errMsg}. Local rules engine applied as fallback.`,
            aiModelUsed: 'Local Legal Rules Engine (Fallback after Gemini Error)',
          };
        }
      } else if (input.preferredProvider === 'openai') {
        try {
          if (onProgress) onProgress('Connecting to OpenAI GPT-4o-mini Multimodal API...');
          const liveResult = await callLiveOpenAiApi(input, input.ephemeralApiKey.trim(), statuteInfo, caseId, nowStr);
          if (liveResult) return liveResult;
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.warn('Live OpenAI call failed:', errMsg);
          const fallback = runLocalDeterministicEngine(input, statuteInfo, caseId, nowStr);
          return {
            ...fallback,
            processingMode: 'local_rules_fallback',
            providerError: `OpenAI API request failed: ${errMsg}. Local rules engine applied as fallback.`,
            aiModelUsed: 'Local Legal Rules Engine (Fallback after OpenAI Error)',
          };
        }
      }
    }
  }

  // 100% Client-Side Local Deterministic Forensics Engine (Default & Privacy-Preserving)
  if (onProgress) onProgress('Executing Local Legal Forensics Rule Engine (Zero Cloud Transmission)...');
  return runLocalDeterministicEngine(input, statuteInfo, caseId, nowStr);
}

// ----------------------------------------------------------------------------
// LOCAL DETERMINISTIC REASONING ENGINE (HONEST, TRANSPARENT, UNBIASED)
// ----------------------------------------------------------------------------
export function buildEvidenceDrivenTimeline(
  input: AiAnalysisInput,
  limitation: Section60LimitationResult,
  statute: typeof STATUTE_MAP['product_not_delivered']
): DisputeTimelineEvent[] {
  const events: DisputeTimelineEvent[] = [];
  const price = input.claimedPurchasePriceBdt || 0;
  const msrp = input.fairMarketPriceBdt || price;
  const hasExtractedTrx = input.detectedFacts.some((f) => f.field === 'transactionRef');
  const deliveryPromise = input.detectedFacts.find((f) => f.field === 'deliveryPromise')?.value;

  // Event 1: Consideration / Payment
  const paymentDate = input.incidentDate || 'তারিখ দেওয়া হয়নি / Date not provided';
  let paymentDetailBn: string;
  let paymentDetailEn: string;
  if (price > 0 || input.transactionRef) {
    paymentDetailBn = `দাবিকৃত ক্রয়মূল্য: ৳${price.toLocaleString()} টাকা। ${
      input.transactionRef
        ? `লেনদেন আইডি: ${input.transactionRef} (${hasExtractedTrx ? 'রসিদ হতে প্যাটার্ন শনাক্ত' : 'ব্যবহারকারী প্রদত্ত'})।`
        : 'ট্রানজেকশন আইডি: এই তথ্যটি এখনো দেওয়া হয়নি।'
    }`;
    paymentDetailEn = `Consideration amount: BDT ${price.toLocaleString()}. ${
      input.transactionRef
        ? `TrxID: ${input.transactionRef} (${hasExtractedTrx ? 'Pattern extracted' : 'User reported'}).`
        : 'Transaction ID: Not yet provided.'
    }`;
  } else {
    paymentDetailBn = 'এই তথ্যটি এখনো দেওয়া হয়নি। (ক্রয়মূল্য ও লেনদেন আইডি অনির্ধারিত)।';
    paymentDetailEn = 'Not yet provided. (Purchase price and transaction reference missing).';
  }

  events.push({
    id: 'tl_ev_1',
    dateStr: paymentDate,
    titleBn: 'পণ্য ক্রয় ও মূল্য পরিশোধ',
    titleEn: 'Purchase & Consideration Payment',
    detailBn: paymentDetailBn,
    detailEn: paymentDetailEn,
    verified: hasExtractedTrx,
  });

  // Event 2: Grievance Incident Event (Adapts strictly to selected grievance type)
  let grievanceTitleBn: string;
  let grievanceTitleEn: string;
  let grievanceDetailBn: string;
  let grievanceDetailEn: string;

  switch (input.grievanceType) {
    case 'product_not_delivered':
      grievanceTitleBn = 'প্রতিশ্রুত ডেলিভারি মেয়াদ ও সরবরাহ ব্যর্থতা';
      grievanceTitleEn = 'Delivery Commitment & Breach';
      grievanceDetailBn = deliveryPromise
        ? `প্রতিশ্রুত সময়সীমা: ${deliveryPromise} (বিজ্ঞাপন হতে সংগৃহীত)। বিক্রেতা প্রতিশ্রুত সময়ে পণ্য সরবরাহ করেনি।`
        : 'নির্দিষ্ট ডেলিভারি সময়সীমা: এই তথ্যটি এখনো দেওয়া হয়নি। গ্রাহকের বিবরণ অনুযায়ী বিক্রেতা পণ্য সরবরাহ করেনি।';
      grievanceDetailEn = deliveryPromise
        ? `Promised delivery timeline: ${deliveryPromise} (Extracted from ad). Vendor failed to deliver.`
        : 'Specific delivery timeline: Not yet provided. Vendor failed to deliver goods as reported.';
      break;

    case 'counterfeit_product':
      grievanceTitleBn = 'নকল বা অননুমোদিত পণ্য প্রাপ্তি';
      grievanceTitleEn = 'Receipt of Counterfeit Goods';
      grievanceDetailBn = `অফিসিয়াল বাজারদর ৳${msrp.toLocaleString()} টাকার বিপরীতে ৳${price.toLocaleString()} টাকায় প্রাপ্ত পণ্যটি নকল বলে প্রতীয়মান (ভোক্তা অধিকার ধারা ৫০ লঙ্ঘন)।`;
      grievanceDetailEn = `Received counterfeit item priced at BDT ${price.toLocaleString()} vs official MSRP BDT ${msrp.toLocaleString()} (Section 50 violation).`;
      break;

    case 'damaged_product':
      grievanceTitleBn = 'ক্ষতিগ্রস্ত বা ত্রুটিপূর্ণ পণ্য প্রাপ্তি';
      grievanceTitleEn = 'Receipt of Defective / Broken Goods';
      grievanceDetailBn = input.incidentDetail
        ? `ডেলিভারির পর পণ্যটি ভাঙা বা ত্রুটিপূর্ণ অবস্থায় পাওয়ার অভিযোগ: ${sanitizePiiForCloud(input.incidentDetail).slice(0, 150)}`
        : 'পণ্য ক্ষতিগ্রস্ত হওয়ার বিস্তারিত তথ্য: এই তথ্যটি এখনো দেওয়া হয়নি।';
      grievanceDetailEn = input.incidentDetail
        ? `Delivered goods defective as reported: ${sanitizePiiForCloud(input.incidentDetail).slice(0, 150)}`
        : 'Defect details: Not yet provided.';
      break;

    case 'refund_refused':
      grievanceTitleBn = 'রিফান্ড বা অর্থ ফেরত প্রদানে অস্বীকৃতি';
      grievanceTitleEn = 'Refusal of Lawful Refund';
      grievanceDetailBn = 'পণ্য ফেরত বা সরবরাহ ব্যর্থতার পর বিক্রেতা কর্তৃক প্রতিশ্রুত অর্থ ফেরত প্রদানে অস্বীকৃতি (ধারা ৪৫ লঙ্ঘন)।';
      grievanceDetailEn = 'Vendor refused to remit lawful refund following supply failure or return (Section 45).';
      break;

    case 'payment_dispute':
      grievanceTitleBn = 'অতিরিক্ত মূল্য আদায় বা পেমেন্ট অসঙ্গতি';
      grievanceTitleEn = 'Pricing Dispute / Excessive Charge';
      grievanceDetailBn = `নির্ধারিত বা মুদ্রিত মূল্যের চেয়ে অতিরিক্ত অর্থ আদায়ের অভিযোগ (ধারা ৪০)। দাবিকৃত মূল্য: ৳${price.toLocaleString()}।`;
      grievanceDetailEn = `Allegation of charging above printed/regulated price (Section 40). Charged amount: BDT ${price.toLocaleString()}.`;
      break;

    default:
      grievanceTitleBn = `বিরোধের কারণ ও আইনি পর্যালোচনা (${statute.section})`;
      grievanceTitleEn = `Dispute Ground & Review (${statute.section})`;
      grievanceDetailBn = input.incidentDetail
        ? `ঘটনার বিবরণ: ${sanitizePiiForCloud(input.incidentDetail).slice(0, 150)}`
        : 'এই তথ্যটি এখনো দেওয়া হয়নি।';
      grievanceDetailEn = input.incidentDetail
        ? `Incident narrative: ${sanitizePiiForCloud(input.incidentDetail).slice(0, 150)}`
        : 'Not yet provided.';
      break;
  }

  events.push({
    id: 'tl_ev_2',
    dateStr: input.incidentDate ? `${input.incidentDate} (ঘটনার তারিখ)` : 'তারিখ দেওয়া হয়নি',
    titleBn: grievanceTitleBn,
    titleEn: grievanceTitleEn,
    detailBn: grievanceDetailBn,
    detailEn: grievanceDetailEn,
    verified: false,
  });

  // Event 3: Section 60 Statutory Window Tracker
  events.push({
    id: 'tl_ev_3',
    dateStr: limitation.limitationRemainingDays != null
      ? (limitation.isTimeBarred ? 'তামাদি মেয়াদ উত্তীর্ণ' : `অবশিষ্ট: ${limitation.limitationRemainingDays} দিন`)
      : 'তামাদি হিসাব অনির্ধারিত',
    titleBn: 'ধারা ৬০ সংবিধিবদ্ধ তামাদি সীমা (৩০ ক্যালেন্ডার দিন)',
    titleEn: 'Section 60 Statutory Limitation Window (30 Calendar Days)',
    detailBn: limitation.limitationRemainingDays != null
      ? limitation.statutoryWarningBn
      : 'এই তথ্যটি এখনো দেওয়া হয়নি। (ঘটনার তারিখ অনুপস্থিত থাকায় তামাদি হিসাব করা সম্ভব হয়নি; ধারা ৬০ অনুসারে কারণ উদ্ভব হওয়ার ৩০ ক্যালেন্ডার দিনের মধ্যে লিখিত অভিযোগ দাখিল আবশ্যক)।',
    detailEn: limitation.limitationRemainingDays != null
      ? limitation.statutoryWarningEn
      : 'Not yet provided. (Incident date missing; under Section 60, written complaint must be submitted within 30 calendar days).',
    verified: limitation.limitationRemainingDays != null && !limitation.isFutureDate,
  });

  return events;
}

function runLocalDeterministicEngine(
  input: AiAnalysisInput,
  statute: typeof STATUTE_MAP['product_not_delivered'],
  caseId: string,
  nowStr: string
): ConsumerInspectionResult {
  const price = input.claimedPurchasePriceBdt || 0;
  const msrp = input.fairMarketPriceBdt || price;
  const isNonDelivery = input.grievanceType === 'product_not_delivered';
  const isCounterfeit = input.grievanceType === 'counterfeit_product';

  // Section 60 30 Calendar Days Statutory Limitation Engine (P0-1 Timezone Safe)
  const limitation = calculateSection60Limitation(input.incidentDate);
  const limitationRemainingDays = limitation.limitationRemainingDays;
  const isTimeBarred = limitation.isTimeBarred;

  // Nuanced Risk Tiers based on actual evidence signals (Never universal critical_fraud)
  let riskTier: RiskTier = 'needs_further_review';
  if (input.evidenceItems.length === 0) {
    riskTier = 'insufficient_evidence';
  } else if (isNonDelivery && input.transactionRef) {
    riskTier = 'high_dispute_risk';
  } else if (isCounterfeit && msrp > 0 && price > 0 && price < msrp * 0.4) {
    riskTier = 'warning_signals';
  } else if (input.evidenceItems.some((e) => e.anomalyDetected)) {
    riskTier = 'warning_signals';
  }

  // Transparent, deterministic Evidence-Coverage calculation (Not arbitrary model trust score)
  let evidenceCoverageScore = 30; // base intake score
  if (input.evidenceItems.length > 0) evidenceCoverageScore += 25;
  if (input.transactionRef) evidenceCoverageScore += 20;
  if (input.incidentDate && !isTimeBarred && !limitation.isFutureDate) evidenceCoverageScore += 15;
  if (input.sellerName) evidenceCoverageScore += 10;
  evidenceCoverageScore = Math.min(100, evidenceCoverageScore);

  const estimatedFine = statute.maxFine;

  // Provenance classification for user-entered fields (Fixes P0-7)
  const hasExtractedTrx = input.detectedFacts.some((f) => f.field === 'transactionRef');
  const trxCategory = input.transactionRef
    ? hasExtractedTrx
      ? ('pattern_extracted' as const)
      : ('user_reported' as const)
    : ('unknown' as const);
  const trxProvenance = input.transactionRef
    ? hasExtractedTrx
      ? ('pattern_extracted' as const)
      : ('user_reported' as const)
    : undefined;
  const trxProvenanceLabelBn = input.transactionRef
    ? hasExtractedTrx
      ? 'সংযুক্ত রসিদ হতে প্যাটার্ন শনাক্ত (ব্যাংক কর্তৃক সরাসরি প্রতিপাদিত নয়)'
      : 'গ্রাহকের তথ্যানুসারে সংরক্ষিত (ব্যবহারকারী প্রদত্ত)'
    : undefined;

  const dateCategory = input.incidentDate
    ? isTimeBarred
      ? ('warning' as const)
      : ('user_reported' as const)
    : ('unknown' as const);
  const dateProvenance = input.incidentDate ? ('calculated_from_user_date' as const) : undefined;
  const dateProvenanceLabelBn = input.incidentDate ? 'ব্যবহারকারীর প্রদত্ত ঘটনার তারিখভিত্তিক গণনা' : undefined;

  const riskBreakdown: RiskCategoryItem[] = [
    {
      id: `rb_${caseId}_1`,
      category: 'warning',
      provenance: 'document_observed',
      titleBn: `আইনি পর্যালোচনা: ${statute.titleBn} (${statute.section})`,
      titleEn: `Statutory Review: ${statute.titleEn} (${statute.section})`,
      detailBn: statute.descBn,
      detailEn: statute.descEn,
      impactScore: 25,
      statuteRef: statute.section,
    },
    {
      id: `rb_${caseId}_2`,
      category: trxCategory,
      provenance: trxProvenance,
      provenanceLabelBn: trxProvenanceLabelBn,
      provenanceLabelEn: input.transactionRef
        ? hasExtractedTrx
          ? 'Pattern extracted from receipt'
          : 'Reported by user'
        : undefined,
      titleBn: input.transactionRef ? 'পেমেন্ট ট্রানজেকশন রেকর্ড' : 'পেমেন্ট রেফারেন্স অনুপস্থিত',
      titleEn: input.transactionRef ? 'Payment Transaction Recorded' : 'Payment Reference Missing',
      detailBn: input.transactionRef
        ? `লেনদেন আইডি: ${input.transactionRef} (${trxProvenanceLabelBn})।`
        : 'পেমেন্টের সুনির্দিষ্ট ট্রানজেকশন আইডি ছাড়া শুনানিতে আর্থিক দাবি প্রমাণের সুযোগ সীমিত।',
      detailEn: input.transactionRef
        ? `TrxID: ${input.transactionRef} (${hasExtractedTrx ? 'Pattern extracted' : 'User reported'}).`
        : 'Payment transaction reference missing; essential for proving financial consideration.',
      impactScore: input.transactionRef ? 10 : 30,
    },
    {
      id: `rb_${caseId}_3`,
      category: dateCategory,
      provenance: dateProvenance,
      provenanceLabelBn: dateProvenanceLabelBn,
      provenanceLabelEn: input.incidentDate ? 'Calculated from user-reported incident date' : undefined,
      titleBn: input.incidentDate
        ? isTimeBarred
          ? 'তামাদি সতর্কতা: ধারা ৬০ অনুযায়ী ৩০ দিন অতিক্রান্ত'
          : `ধারা ৬০ তামাদি মেয়াদ: অবশিষ্ট ${limitationRemainingDays} দিন`
        : 'ঘটনার তারিখ অনির্ধারিত (ধারা ৬০ তামাদি যাচাই প্রয়োজন)',
      titleEn: input.incidentDate
        ? isTimeBarred
          ? 'Statutory Alert: Section 60 30-Day Window Elapsed'
          : `Section 60 Limitation: ${limitationRemainingDays} Days Remaining`
        : 'Incident Date Not Set (Section 60 Review Required)',
      detailBn: limitation.statutoryWarningBn,
      detailEn: limitation.statutoryWarningEn,
      impactScore: isTimeBarred ? 40 : 15,
      statuteRef: 'ধারা ৬০',
    },
  ];

  // Agent Steps: Removed fixed confidence numbers (85, 88) (Fixes P0-8)
  const agentSteps: InspectionAgentStep[] = [
    {
      agentId: 'vision',
      nameBn: 'প্রামাণ্য নথি ও ইমেজ বিশ্লেষণ',
      nameEn: 'Document & Evidence Inspection',
      roleBn: 'সংযুক্ত ফাইলের মেটাডাটা ও টেক্সট প্যাটার্ন বিশ্লেষণ',
      roleEn: 'Analyzes attached files metadata and text patterns',
      status: 'completed',
      timestamp: new Date().toLocaleTimeString('bn-BD'),
      findingsBn: [
        `সংযুক্ত প্রমাণপত্র সংখ্যা: ${input.evidenceItems.length}টি`,
        input.evidenceItems.length > 0
          ? `নথির ধরন: ${input.evidenceItems.map((e) => e.name).join(', ')}`
          : 'কোনো ডিজিটাল প্রমাণপত্র সংযুক্ত করা হয়নি',
      ],
      findingsEn: [
        `Attached evidence items: ${input.evidenceItems.length}`,
        input.evidenceItems.length > 0
          ? `Files: ${input.evidenceItems.map((e) => e.name).join(', ')}`
          : 'No evidence files attached',
      ],
      confidenceLabel: 'completed',
    },
    {
      agentId: 'statute',
      nameBn: 'ভোক্তা অধিকার আইনি ধারা নিরূপণ',
      nameEn: 'Statutory Provisions Mapping',
      roleBn: 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর প্রাসঙ্গিক ধারা যাচাই',
      roleEn: 'Maps facts to relevant CRPA 2009 statutory provisions',
      status: 'completed',
      timestamp: new Date().toLocaleTimeString('bn-BD'),
      findingsBn: [
        `সম্ভাব্য প্রযোজ্য ধারা: ${statute.section} (${statute.titleBn})`,
        input.incidentDate
          ? `ধারা ৬০ তামাদি: ${isTimeBarred ? '৩০ দিন অতিক্রান্ত' : `অবশিষ্ট ${limitationRemainingDays} দিন`}`
          : 'ধারা ৬০ তামাদি: ঘটনার তারিখ অনির্ধারিত',
      ],
      findingsEn: [
        `Candidate provision: ${statute.section} (${statute.titleEn})`,
        input.incidentDate
          ? `Section 60 window: ${isTimeBarred ? 'Expired' : `${limitationRemainingDays} days left`}`
          : 'Section 60 window: Incident date required',
      ],
      confidenceLabel: 'completed',
    },
  ];

  const applicableViolations: DncrpStatuteViolation[] = [
    {
      section: statute.section,
      titleBn: statute.titleBn,
      titleEn: statute.titleEn,
      descriptionBn: statute.descBn,
      descriptionEn: statute.descEn,
      maxPenaltyFineBdt: statute.maxFine,
      maxImprisonmentYears: statute.years,
      whistleblowerRewardPercent: 25,
      officialSourceUrl: 'https://dncrp.gov.bd/',
    },
  ];

  // Neutral, factual statement of claim (No "fraudster" allegations; authority determines fraud)
  const factualSummaryBn = isNonDelivery
    ? `আমি ${input.complainantName || 'অভিযোগকারী'}, বিবাদী প্রতিষ্ঠান "${input.sellerName || 'অনলাইন বিক্রেতা'}" এর নিকট হতে ৳${price.toLocaleString()} টাকা মূল্যে "${input.productName || 'পণ্য'}" ক্রয়ের উদ্দেশ্যে সম্পূর্ণ অর্থ লেনদেন রেফারেন্স (${input.transactionRef || 'সংযুক্ত রসিদ দ্রষ্টব্য'}) মারফত পরিশোধ করি। বিবাদী প্রতিশ্রুত সময়সীমার মধ্যে পণ্য সরবরাহ করিতে ব্যর্থ হইয়াছে এবং পরবর্তীতে বারবার তাগাদা সত্ত্বেও পণ্য সরবরাহ বা অর্থ ফেরত প্রদান করে নাই। ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৪৫ এর আলোকে বিষয়টি তদন্তপূর্বক আইনানুগ প্রতিকার প্রার্থনা করিতেছি।`
    : `আমি ${input.complainantName || 'অভিযোগকারী'}, বিবাদী প্রতিষ্ঠান "${input.sellerName || 'অনলাইন বিক্রেতা'}" এর নিকট হতে ৳${price.toLocaleString()} টাকা মূল্যে "${input.productName || 'পণ্য'}" ক্রয় করি। সরবরাহকৃত পণ্যটিতে ${input.incidentDetail || 'প্রতিশ্রুত মান ও বর্ণনার ব্যত্যয়'} পরিলক্ষিত হওয়ায় বিবাদীর নিকট প্রতিকার দাবি করা সত্ত্বেও বিবাদী কোনো কার্যকর পদক্ষেপ গ্রহণ করে নাই। ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ${statute.section} এর আলোকে বিষয়টি পর্যালোচনার জন্য দাখিল করিলাম।`;

  const factualSummaryEn = isNonDelivery
    ? `I, ${input.complainantName || 'Complainant'}, placed an order for "${input.productName || 'the product'}" with respondent merchant "${input.sellerName || 'Seller'}" for BDT ${price.toLocaleString()} and remitted consideration via transaction ref (${input.transactionRef || 'see attached receipt'}). The respondent failed to deliver the promised goods within the stipulated period and did not remedy the breach. I respectfully submit this factual grievance under Section 45 of CRPA 2009 for appropriate administrative investigation.`
    : `I, ${input.complainantName || 'Complainant'}, purchased "${input.productName || 'the product'}" from respondent "${input.sellerName || 'Seller'}" for BDT ${price.toLocaleString()}. The goods supplied suffered from ${input.incidentDetail || 'discrepancy from agreed specifications'}. The respondent failed to resolve the dispute. I submit this matter for review under Section ${statute.section} of the Consumer Rights Protection Act 2009.`;

  // Dynamically record attached evidence file names
  const attachedEvidenceNames = input.evidenceItems.map((e) => e.name);

  const tasks: CaseTask[] = [
    {
      id: `task_${caseId}_1`,
      caseId,
      titleBn: 'বিক্রেতাকে লিখিত চূড়ান্ত দাবি নোটিশ প্রেরণ (২৪-৪৮ ঘণ্টার সময়সীমা)',
      titleEn: 'Send Written Final Notice to Seller (24-48h Window)',
      descriptionBn: `${statute.section} উল্লেখপূর্বক চ্যাটে বা এসএমএসে সমাধানের লিখিত অনুরোধ জানান।`,
      descriptionEn: `Issue polite formal demand citing ${statute.section} requesting dispute resolution.`,
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      priority: 'urgent',
      status: 'pending',
      statutoryDeadline: statute.section,
    },
    {
      id: `task_${caseId}_2`,
      caseId,
      titleBn: 'সকল ডিজিটাল প্রমাণের ব্যাকআপ নিশ্চিতকরণ',
      titleEn: 'Archive Digital Screenshots & Payment Receipts',
      descriptionBn: 'বিজ্ঞাপন ও লেনদেন স্টেটমেন্ট নিরাপদে সংরক্ষণ করুন।',
      descriptionEn: 'Export conversation and MFS payment statements as backup.',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'high',
      status: 'completed',
      completedAt: new Date().toISOString(),
    },
    {
      id: `task_${caseId}_3`,
      caseId,
      titleBn: 'ডিএনসিআরপি সেন্ট্রাল কমপ্লেইন্ট পোর্টালে (ccms.dncrp.com) নালিশ দাখিল',
      titleEn: 'Submit Complaint via Official DNCRP Portal (ccms.dncrp.com)',
      descriptionBn: 'ধারা ৬০ এর ৩০ দিনের তামাদি শেষ হওয়ার পূর্বেই প্রস্তুতকৃত খসড়া অনুযায়ী দাখিল করুন।',
      descriptionEn: 'Submit the formal complaint dossier before the 30-day limitation expires.',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: 'urgent',
      status: 'pending',
      statutoryDeadline: 'ধারা ৬০ (৩০ দিন)',
    },
  ];

  const unknownFields: string[] = [];
  if (!input.sellerName) unknownFields.push('বিক্রেতা বা প্রতিষ্ঠানের নাম (অজ্ঞাত)');
  if (!input.transactionRef) unknownFields.push('পেমেন্ট ট্রানজেকশন আইডি (অজ্ঞাত)');
  if (!input.incidentDate) unknownFields.push('ঘটনা বা চুক্তি ভঙ্গের সঠিক তারিখ (অনির্ধারিত — ধারা ৬০ তামাদি যাচাই আবশ্যক)');
  if (input.evidenceItems.length === 0) unknownFields.push('ক্রয় রসিদ বা চ্যাট প্রমাণপত্র (সংযুক্ত করা হয়নি)');

  return {
    id: caseId,
    createdAt: nowStr,
    incidentDate: input.incidentDate,
    productName: input.productName || 'অনির্ধারিত পণ্য',
    productBrand: input.productBrand || '',
    sellerName: input.sellerName || 'অজ্ঞাত বিক্রেতা',
    platform: input.platform,
    grievanceType: input.grievanceType,
    claimedPurchasePriceBdt: price,
    fairMarketPriceBdt: msrp,
    trustScore: evidenceCoverageScore,
    riskTier,
    confidenceScore: evidenceCoverageScore,
    processingMode: 'local_deterministic',
    aiModelUsed: 'Local Legal Rules Engine (Zero Cloud Transmission)',
    evidenceStorageType: 'indexeddb_blobs_and_local_meta',
    statutoryCitation: `ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯, ${statute.section}`,
    statutoryDisclaimerBn:
      'আইনি নোটিশ: এটি জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP) এর আইন ২০০৯ এর আলোকে নাগরিক সহায়তার জন্য প্রস্তুত একটি প্রাথমিক নালিশ খসড়া। কেনাসাথী কোনো সরকারি সংস্থা নয় এবং আদালতের চূড়ান্ত রায়ের নিশ্চয়তা প্রদান করে না। চূড়ান্ত শুনানিতে নির্বাহী ম্যাজিস্ট্রেটের সিদ্ধান্ত চূড়ান্ত।',
    statutoryDisclaimerEn:
      'Legal Disclaimer: Prepared as a civic-tech complaint draft under CRPA 2009. KenaSathi is an independent platform, not an affiliated government entity. Official administrative relief is subject to hearing before an Executive Magistrate.',
    evidenceItems: input.evidenceItems,
    riskBreakdown,
    agentSteps,
    applicableViolations,
    complaintDossier: {
      complaintId: `KS-DRAFT-2026-${caseId.slice(-6)}`,
      generatedDate: nowStr,
      incidentDate: input.incidentDate,
      complainantName: input.complainantName || '',
      complainantNidPhone: input.complainantPhone || '',
      complainantAddress: input.complainantAddress || '',
      sellerShopName: input.sellerName || '',
      sellerContact: input.transactionRef ? `পেমেন্ট রিসিভার ট্রানজেকশন: ${input.transactionRef}` : 'যোগাযোগ নম্বর অনুপস্থিত',
      sellerLocation: `${input.platform.toUpperCase().replace('_', ' ')} অনলাইন প্ল্যাটফর্ম`,
      productName: input.productName || '',
      purchaseAmountBdt: price,
      transactionRef: input.transactionRef || '',
      courierName: isNonDelivery ? 'সরবরাহ করা হয়নি (Not Delivered)' : 'প্রযোজ্য ক্ষেত্রে কুরিয়ার সার্ভিস',
      grievanceType: input.grievanceType,
      factualSummaryBn,
      factualSummaryEn,
      violations: applicableViolations,
      timeline: buildEvidenceDrivenTimeline(input, limitation, statute),
      claimedRefundBdt: price,
      statutoryFineEstimatedBdt: estimatedFine,
      whistleblowerRewardBdt: 0, // No projected arbitrary cash payout
      statutoryConditionsBn: 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৭৬(৪) অনুযায়ী আদায়কৃত জরিমানা সাপেক্ষে ২৫% প্রদেয় (শর্তাধীন)।',
      submissionEmail: 'nccc@dncrp.gov.bd', // Official National Consumer Complaint Centre
      helpline: '16121',
      officialPortalUrl: 'https://ccms.dncrp.com/',
      limitationRemainingDays,
      isTimeBarred,
      attachedEvidenceNames,
      missingEvidenceNoticeBn:
        attachedEvidenceNames.length === 0
          ? 'সতর্কতা: কোনো প্রমাণপত্র সংযুক্ত করা হয়নি। শুনানির জন্য রসিদ ও চ্যাট স্ক্রিনশট আবশ্যক।'
          : undefined,
    },
    tasks,
    activities: [
      {
        id: `act_${caseId}_1`,
        caseId,
        timestamp: new Date().toISOString(),
        type: 'created',
        titleBn: 'নতুন বিরোধ খসড়া প্রস্তুত',
        titleEn: 'Dispute Draft Prepared',
        details: `${statute.section} এর আলোকে প্রাথমিক নালিশ খসড়া সংরক্ষিত।`,
      },
    ],
    extractedFacts: (() => {
      const facts: ExtractedFact[] = [...input.detectedFacts];
      if (input.transactionRef && !facts.some((f) => f.field === 'transactionRef')) {
        facts.push({
          id: `f_user_trx_${caseId}`,
          field: 'transactionRef',
          labelBn: 'লেনদেন আইডি / TrxID (ভোক্তা কর্তৃক প্রদত্ত)',
          labelEn: 'Transaction Reference (User-Reported)',
          value: input.transactionRef,
          sourceDocId: 'user_input',
          sourceDocName: 'User Dispute Intake Form',
          confidence: 90,
          verified: false,
          factStatus: 'user_reported',
          provenance: 'user_reported',
          extractionMethod: 'user_input',
        });
      }
      if (input.claimedPurchasePriceBdt && !facts.some((f) => f.field === 'paidAmount')) {
        facts.push({
          id: `f_user_price_${caseId}`,
          field: 'paidAmount',
          labelBn: 'দাবিকৃত ক্রয়মূল্য',
          labelEn: 'Claimed Purchase Price',
          value: `৳${input.claimedPurchasePriceBdt.toLocaleString()}`,
          sourceDocId: 'user_input',
          sourceDocName: 'User Dispute Intake Form',
          confidence: 90,
          verified: false,
          factStatus: 'user_reported',
          provenance: 'user_reported',
          extractionMethod: 'user_input',
        });
      }
      return facts;
    })(),
    unknownFields,
  };
}

// ----------------------------------------------------------------------------
// LIVE GEMINI 3.8 FLASH VISION API INTEGRATION (WHEN EXPLICITLY CONSENTED)
// ----------------------------------------------------------------------------
async function callLiveGeminiApi(
  input: AiAnalysisInput,
  apiKey: string,
  statute: typeof STATUTE_MAP['product_not_delivered'],
  caseId: string,
  nowStr: string
): Promise<ConsumerInspectionResult | null> {
  // Use current Google Gemini 3.8 Flash model via x-goog-api-key header (Never in URL query params)
  const modelId = 'gemini-3.8-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

  // Personal Data Minimization: Sanitize Complainant PII before external cloud transmission
  const sanitizedProductName = sanitizePiiForCloud(input.productName);
  const sanitizedProductBrand = sanitizePiiForCloud(input.productBrand || 'Generic');
  const sanitizedSeller = sanitizePiiForCloud(input.sellerName);
  const sanitizedDetail = sanitizePiiForCloud(input.incidentDetail);
  const sanitizedTrxId = input.transactionRef ? sanitizePiiForCloud(input.transactionRef) : 'Not provided';

  // Include extracted selectable text from PDF documents (sanitized)
  const extractedPdfTexts = input.evidenceItems
    .filter((e) => e.textExtractionStatus === 'text_extracted_from_pdf' && e.rawTextSnippet)
    .map((e) => `[Document: ${e.name}] ${sanitizePiiForCloud(e.rawTextSnippet || '')}`)
    .join('\n\n');

  // Include detected candidate facts
  const candidateFactsSummary = input.detectedFacts
    .map((f) => `- ${f.labelEn}: ${f.value} (Source: ${f.sourceDocName}, Method: ${f.extractionMethod})`)
    .join('\n');

  const promptText = `
You are KenaSathi AI, an expert Consumer Protection and Legal Analysis Engine for Bangladesh under the Consumer Rights Protection Act, 2009 (CRPA 2009).
Inspect the provided dispute details, extracted document text, and attached evidence images:
Product: ${sanitizedProductName} (${sanitizedProductBrand})
Seller: ${sanitizedSeller} on ${input.platform}
Grievance Category: ${input.grievanceType}
Purchase Consideration: BDT ${input.claimedPurchasePriceBdt}
Market MSRP: BDT ${input.fairMarketPriceBdt}
TrxID: ${sanitizedTrxId}
Incident Date: ${input.incidentDate || 'Not provided'}
Dispute Description: ${sanitizedDetail}
Complainant Identity: [REDACTED FOR CITIZEN PRIVACY]

EXTRACTED DOCUMENT TEXT (PII Sanitized):
${extractedPdfTexts || 'No selectable PDF text extracted from documents.'}

CANDIDATE DETECTED FACTS:
${candidateFactsSummary || 'No candidate facts extracted.'}

INSTRUCTIONS (ADHERE STRICTLY TO TRUTH & OBJECTIVITY):
1. Inspect images if attached (read visible packaging, receipts, delivery timeframes).
2. Do NOT accuse anyone of fraud without judicial determination. Use neutral language: "Respondent Merchant".
3. If non-delivery, candidate violation is Section 45.
4. Extract observed candidate facts with source snippet. Mark them as observations, not judicial verifications.
5. In extractedFacts, the "sourceDocId" MUST match one of the actual uploaded document IDs: ${input.evidenceItems.map((e) => e.id).join(', ') || 'none'}.
6. Output STRICT JSON conforming to this schema:
{
  "summaryBn": "string",
  "summaryEn": "string",
  "statuteSection": "${statute.section}",
  "statutoryReasoningBn": "string",
  "extractedFacts": [
    {
      "labelBn": "string",
      "labelEn": "string",
      "value": "string",
      "sourceDocId": "string",
      "sourceSnippet": "string"
    }
  ],
  "unknownFields": ["string"]
}
`;

  // Build multimodal parts including actual image bytes if present
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
    { text: promptText },
  ];

  for (const ev of input.evidenceItems) {
    if (ev.dataUrl && ev.dataUrl.startsWith('data:image/')) {
      const match = ev.dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }
  }

  // Generation config: supported structured JSON without deprecated sampling parameters
  const requestBody = {
    contents: [{ parts }],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  };

  // Add 15s timeout to prevent browser hangs with cleanup in finally block
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let errMessage = '';
    try {
      const errJson = await response.json();
      errMessage = errJson.error?.message || '';
    } catch {
      // ignore
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error(`Authentication error (${response.status}): Invalid or unauthorized Google Gemini API key.`);
    } else if (response.status === 429) {
      throw new Error(`Rate limit exceeded (${response.status}): Gemini quota exhausted. Please retry shortly or use local rules engine.`);
    } else if (response.status === 400) {
      throw new Error(`Bad request (${response.status}): ${errMessage || 'Invalid request configuration for Gemini 3.8 Flash.'}`);
    } else if (response.status >= 500) {
      throw new Error(`Service error (${response.status}): Google Gemini servers temporarily unavailable.`);
    } else {
      throw new Error(`Gemini API error (HTTP ${response.status}): ${errMessage || response.statusText}`);
    }
  }

  const json = await response.json();
  const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) throw new Error('Gemini API response contained no candidate text parts');

  let parsedRaw: unknown;
  try {
    parsedRaw = JSON.parse(textContent);
  } catch (parseErr) {
    throw new Error(
      `Malformed JSON returned from Gemini: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
      { cause: parseErr }
    );
  }

  // Runtime schema validation with Zod (P0-2, P0-D)
  const validationResult = ModelAnalysisOutputSchema.safeParse(parsedRaw);
  if (!validationResult.success) {
    throw new Error(`Gemini output failed schema validation: ${validationResult.error.message}`);
  }
  const validData = validationResult.data;

  const fallback = runLocalDeterministicEngine(input, statute, caseId, nowStr);

  // Map model-extracted candidate facts into final case; validate sourceDocId strictly
  const validEvidenceIds = new Set(input.evidenceItems.map((e) => e.id));
  const modelFacts: ExtractedFact[] = (validData.extractedFacts || []).map((f, idx) => {
    const isDocValid = f.sourceDocId && validEvidenceIds.has(f.sourceDocId);
    const matchingDoc = isDocValid ? input.evidenceItems.find((e) => e.id === f.sourceDocId) : undefined;
    return {
      id: `fact_gemini_${caseId}_${idx + 1}`,
      field: `gemini_observed_${idx + 1}`,
      labelBn: f.labelBn,
      labelEn: f.labelEn,
      value: f.value,
      sourceDocId: matchingDoc ? matchingDoc.id : 'unattached_ai_observation',
      sourceDocName: matchingDoc ? matchingDoc.name : 'Unattached AI Observation',
      verified: false, // Model findings are candidate observations, never independently verified
      factStatus: 'model_suggested',
      confidenceLabel: 'model_proposed',
      extractionMethod: 'multimodal_vision',
      sourceSnippet: f.sourceSnippet,
    };
  });

  const allFacts = [...input.detectedFacts, ...modelFacts];

  return {
    ...fallback,
    processingMode: 'live_ai_success',
    aiModelUsed: 'Google Gemini 3.8 Flash Vision (Multimodal Live)',
    userConsentedToAiTransfer: true,
    statutoryCitation: validData.statuteSection || fallback.statutoryCitation,
    complaintDossier: {
      ...fallback.complaintDossier,
      factualSummaryBn: validData.summaryBn || fallback.complaintDossier.factualSummaryBn,
      factualSummaryEn: validData.summaryEn || fallback.complaintDossier.factualSummaryEn,
    },
    extractedFacts: allFacts,
    unknownFields:
      validData.unknownFields && validData.unknownFields.length > 0
        ? validData.unknownFields
        : fallback.unknownFields,
  };
}

// ----------------------------------------------------------------------------
// LIVE OPENAI API INTEGRATION (WHEN EXPLICITLY CONSENTED)
// ----------------------------------------------------------------------------
async function callLiveOpenAiApi(
  input: AiAnalysisInput,
  apiKey: string,
  statute: typeof STATUTE_MAP['product_not_delivered'],
  caseId: string,
  nowStr: string
): Promise<ConsumerInspectionResult | null> {
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const sanitizedDetail = sanitizePiiForCloud(input.incidentDetail);

  const promptText = `
You are KenaSathi AI, an expert Consumer Protection legal intelligence assistant in Bangladesh under the Consumer Rights Protection Act, 2009.
Dispute Details:
Product: ${input.productName}
Seller: ${input.sellerName}
Grievance: ${input.grievanceType}
Price: BDT ${input.claimedPurchasePriceBdt}
TrxID: ${input.transactionRef}
Incident Date: ${input.incidentDate || 'Not provided'}
Dispute Description: ${sanitizedDetail}
Complainant Identity: [REDACTED FOR CITIZEN PRIVACY]

Respond in STRICT JSON matching this schema:
{
  "summaryBn": "string",
  "summaryEn": "string",
  "statuteSection": "${statute.section}",
  "statutoryReasoningBn": "string",
  "extractedFacts": [
    {
      "labelBn": "string",
      "labelEn": "string",
      "value": "string",
      "sourceDocId": "string",
      "sourceSnippet": "string"
    }
  ],
  "unknownFields": ["string"]
}
`;

  // Multimodal content array for OpenAI vision
  const contentParts: Array<{ type: string; text?: string; image_url?: { url: string; detail?: string } }> = [
    { type: 'text', text: promptText },
  ];

  for (const ev of input.evidenceItems) {
    if (ev.dataUrl && ev.dataUrl.startsWith('data:image/')) {
      contentParts.push({
        type: 'image_url',
        image_url: { url: ev.dataUrl, detail: 'low' },
      });
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: contentParts }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`OpenAI API returned status ${response.status}`);
  }

  const json = await response.json();
  const textContent = json.choices?.[0]?.message?.content;
  if (!textContent) throw new Error('OpenAI returned no text content in choices');

  let parsedRaw: unknown;
  try {
    parsedRaw = JSON.parse(textContent);
  } catch (parseErr) {
    throw new Error(
      `Malformed JSON from OpenAI: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
      { cause: parseErr }
    );
  }

  // Runtime schema validation with Zod
  const validationResult = ModelAnalysisOutputSchema.safeParse(parsedRaw);
  if (!validationResult.success) {
    throw new Error(`OpenAI output failed schema validation: ${validationResult.error.message}`);
  }
  const validData = validationResult.data;

  const fallback = runLocalDeterministicEngine(input, statute, caseId, nowStr);

  const modelFacts: ExtractedFact[] = (validData.extractedFacts || []).map((f, idx) => ({
    id: `fact_openai_${caseId}_${idx + 1}`,
    field: `openai_observed_${idx + 1}`,
    labelBn: f.labelBn,
    labelEn: f.labelEn,
    value: f.value,
    sourceDocId: f.sourceDocId || input.evidenceItems[0]?.id || 'openai_vision_input',
    sourceDocName:
      input.evidenceItems.find((e) => e.id === f.sourceDocId)?.name ||
      input.evidenceItems[0]?.name ||
      'OpenAI Vision Payload',
    verified: false,
    factStatus: 'model_suggested',
    confidenceLabel: 'model_proposed',
    extractionMethod: 'multimodal_vision',
    sourceSnippet: f.sourceSnippet,
  }));

  const allFacts = [...input.detectedFacts, ...modelFacts];

  return {
    ...fallback,
    processingMode: 'live_ai_success',
    aiModelUsed: 'OpenAI GPT-4o-mini Vision (Multimodal Live)',
    userConsentedToAiTransfer: true,
    statutoryCitation: validData.statuteSection || fallback.statutoryCitation,
    complaintDossier: {
      ...fallback.complaintDossier,
      factualSummaryBn: validData.summaryBn || fallback.complaintDossier.factualSummaryBn,
      factualSummaryEn: validData.summaryEn || fallback.complaintDossier.factualSummaryEn,
    },
    extractedFacts: allFacts,
    unknownFields:
      validData.unknownFields && validData.unknownFields.length > 0
        ? validData.unknownFields
        : fallback.unknownFields,
  };
}
