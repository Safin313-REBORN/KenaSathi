export type ConsumerGrievanceType =
  | 'product_not_delivered' // প্রতিশ্রুত পণ্য বা সেবা সরবরাহ না করা (Section 45)
  | 'wrong_product' // ভুল বা অসদৃশ পণ্য সরবরাহ (Section 45)
  | 'damaged_product' // ক্ষতিগ্রস্ত বা ত্রুটিপূর্ণ পণ্য সরবরাহ (Section 45)
  | 'refund_refused' // অর্থ ফেরত বা রিফান্ড প্রদানে অস্বীকৃতি (Section 45)
  | 'payment_dispute' // নির্ধারিত মূল্যের অধিক মূল্যে বিক্রয় / মূল্য বিরোধ (Section 40)
  | 'warranty_dispute' // প্রতিশ্রুত ওয়ারেন্টি বা বিক্রয়োত্তর সেবা প্রদানে ব্যর্থতা (Section 45)
  | 'misleading_ad' // মিথ্যা ও প্রতারণামূলক বিজ্ঞাপন (Section 44)
  | 'counterfeit_product' // নকল বা জাল পণ্য প্রস্তুত/বিপণন (Section 50)
  | 'adulterated_goods' // ভেজাল বা মানবস্বাস্থ্যের জন্য ক্ষতিকর পণ্য (Section 41)
  | 'seller_communication' // বিক্রেতা যোগাযোগ বিচ্ছিন্ন বা অস্বীকৃতি (Section 45)
  | 'other_consumer_issue' // অন্যান্য ভোক্তা অধিকার লঙ্ঘন
  // Legacy aliases for backward compatibility
  | 'deceptive_advertisement'
  | 'refused_refund_warranty'
  | 'price_gouging_overcharge'
  | 'expired_hazardous_product';

export type RiskTier =
  | 'verified_safe'
  | 'warning_signals'
  | 'high_dispute_risk'
  | 'needs_further_review'
  | 'insufficient_evidence'
  | 'critical_fraud'; // kept for backward compatibility

export type FactVerificationStatus =
  | 'user_reported'
  | 'pattern_extracted'
  | 'document_observed'
  | 'model_suggested'
  | 'externally_verified'
  | 'user_confirmed'
  | 'ai_interpreted'
  | 'cross_verified';

export type ProcessingMode =
  | 'live_ai_success'
  | 'local_rules_fallback'
  | 'provider_error'
  | 'missing_credentials'
  | 'local_deterministic';

export interface ExtractedFact {
  id: string;
  field: string;
  labelBn: string;
  labelEn: string;
  value: string;
  sourceDocId: string;
  sourceDocName: string;
  confidence?: number; // 0-100 qualitative calibration
  confidenceLabel?: 'pattern_matched' | 'needs_user_confirmation' | 'uncalibrated' | 'model_proposed';
  verified: boolean; // strictly false for raw regex matches; only true if externally or cross-verified
  factStatus?: FactVerificationStatus;
  provenance?: string;
  extractionMethod?: 'regex_heuristic' | 'user_input' | 'multimodal_vision' | 'pdf_stream';
  sourceSnippet?: string;
}

export interface EvidenceItem {
  id: string;
  name: string;
  type: 'image' | 'receipt' | 'chat_screenshot' | 'courier_slip' | 'advertisement' | 'pdf' | 'url';
  fileFormat?: string; // jpg, png, webp, pdf
  previewUrl?: string; // data URL or blob
  dataUrl?: string; // in-memory base64 representation for multimodal inspection (never persisted to localStorage)
  blobId?: string; // IndexedDB storage reference
  size?: string;
  uploadedAt: string;
  anomalyDetected: boolean;
  anomalyDescriptionBn?: string;
  anomalyDescriptionEn?: string;
  forensicConfidence?: number; // 0-100%
  forensicStatus?: 'pattern_matched' | 'no_signals_detected' | 'uncalibrated_heuristic';
  rawTextSnippet?: string;
  extractedFacts?: ExtractedFact[];
  textExtractionStatus?:
    | 'ocr_not_run_in_local_mode'
    | 'filename_metadata_only'
    | 'text_extracted_from_pdf'
    | 'vision_ai_analyzed'
    | 'unreadable';
  extractionNoticeBn?: string;
  extractionNoticeEn?: string;
}

export interface RiskCategoryItem {
  id: string;
  category: 'verified' | 'warning' | 'unknown' | 'user_reported' | 'pattern_extracted';
  provenance?:
    | 'user_reported'
    | 'pattern_extracted'
    | 'document_observed'
    | 'calculated_from_user_date'
    | 'externally_verified'
    | 'model_suggested';
  provenanceLabelBn?: string;
  provenanceLabelEn?: string;
  titleBn: string;
  titleEn: string;
  detailBn: string;
  detailEn: string;
  impactScore: number; // weight
  evidenceLink?: string;
  statuteRef?: string;
}

export interface DncrpStatuteViolation {
  section: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  maxPenaltyFineBdt: number;
  maxImprisonmentYears: number;
  whistleblowerRewardPercent: number; // 25% under Section 76(4) upon realization
  officialSourceUrl?: string;
}

export interface InspectionAgentStep {
  agentId: 'vision' | 'price' | 'seller' | 'statute';
  nameBn: string;
  nameEn: string;
  roleBn: string;
  roleEn: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
  findingsBn: string[];
  findingsEn: string[];
  confidence?: number;
  confidenceLabel?: 'pattern_matched' | 'completed' | 'qualitative_only';
}

export interface DisputeTimelineEvent {
  id: string;
  dateStr: string;
  titleBn: string;
  titleEn: string;
  detailBn: string;
  detailEn: string;
  verified: boolean;
}

export interface CaseTask {
  id: string;
  caseId: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'normal';
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  statutoryDeadline?: string;
  linkedEvidenceId?: string;
}

export interface CaseActivity {
  id: string;
  caseId: string;
  timestamp: string;
  type: 'created' | 'evidence_added' | 'ai_audited' | 'task_completed' | 'notice_generated' | 'filed_dncrp' | 'updated';
  titleBn: string;
  titleEn: string;
  details?: string;
}

export interface DncrpComplaintDossier {
  complaintId: string; // KenaSathi Draft Reference (e.g. KS-DRAFT-2026-XXXX)
  complaintDraftId?: string; // Explicit Draft identifier
  officialTrackingNumber?: string; // Populated by user once filed on ccms.dncrp.com
  generatedDate: string;
  incidentDate?: string; // Cause-of-action date
  complainantName: string;
  complainantNidPhone: string;
  complainantAddress: string;
  sellerShopName: string;
  sellerContact: string;
  sellerLocation: string;
  productName: string;
  purchaseAmountBdt: number;
  transactionRef: string; // bKash / Nagad / Bank
  courierName: string;
  grievanceType: ConsumerGrievanceType;
  factualSummaryBn: string;
  factualSummaryEn: string;
  violations: DncrpStatuteViolation[];
  timeline: DisputeTimelineEvent[];
  claimedRefundBdt: number;
  statutoryFineEstimatedBdt: number;
  whistleblowerRewardBdt: number; // 25% of realized fine under Section 76(4)
  submissionEmail: string; // nccc@dncrp.gov.bd (National Consumer Complaint Centre)
  helpline: string; // 16121
  officialPortalUrl?: string; // https://ccms.dncrp.com/
  limitationRemainingDays: number | null; // null if incidentDate unknown
  isTimeBarred?: boolean;
  statutoryConditionsBn?: string;
  attachedEvidenceNames?: string[];
  missingEvidenceNoticeBn?: string;
}

export interface ConsumerInspectionResult {
  id: string;
  createdAt: string;
  incidentDate?: string; // Date cause of action arose
  productName: string;
  productBrand: string;
  sellerName: string;
  platform: 'facebook_page' | 'daraz' | 'chaldal' | 'physical_store' | 'standalone_website';
  grievanceType: ConsumerGrievanceType;
  claimedPurchasePriceBdt: number;
  fairMarketPriceBdt: number;
  trustScore: number; // 0 to 100
  riskTier: RiskTier;
  confidenceScore: number;
  evidenceItems: EvidenceItem[];
  riskBreakdown: RiskCategoryItem[];
  agentSteps: InspectionAgentStep[];
  applicableViolations: DncrpStatuteViolation[];
  complaintDossier: DncrpComplaintDossier;
  tasks?: CaseTask[];
  activities?: CaseActivity[];
  extractedFacts?: ExtractedFact[];
  unknownFields?: string[];
  processingMode?: ProcessingMode | 'live_ai';
  providerError?: string;
  aiModelUsed?: string;
  evidenceStorageType?: 'indexeddb_blobs_and_local_meta' | 'metadata_only';
  statutoryCitation?: string;
  statutoryDisclaimerBn?: string;
  statutoryDisclaimerEn?: string;
  userConsentedToAiTransfer?: boolean;
}
