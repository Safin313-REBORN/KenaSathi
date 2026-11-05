import React, { useState } from 'react';
import {
  Upload,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  ConsumerInspectionResult,
  ExtractedFact,
  RiskCategoryItem,
  ProcessingMode,
} from '../types/consumer';

interface PurchaseInspectionViewProps {
  currentCase: ConsumerInspectionResult;
  language: 'bn' | 'en';
  onOpenNewCaseModal: () => void;
  onOpenComplaintBuilder: () => void;
}

export const PurchaseInspectionView: React.FC<PurchaseInspectionViewProps> = ({
  currentCase,
  language,
  onOpenNewCaseModal,
  onOpenComplaintBuilder,
}) => {
  const [selectedFactTab, setSelectedFactTab] = useState<
    'all' | 'verified' | 'pattern' | 'user' | 'model' | 'unknown'
  >('all');

  const allFacts: ExtractedFact[] = currentCase.extractedFacts || [];
  const verifiedFacts = allFacts.filter(
    (f: ExtractedFact) => f.factStatus === 'externally_verified' || f.verified === true
  );
  const patternFacts = allFacts.filter(
    (f: ExtractedFact) => f.factStatus === 'pattern_extracted' || (!f.verified && f.provenance === 'pattern_extracted')
  );
  const userReportedFacts = allFacts.filter(
    (f: ExtractedFact) => f.factStatus === 'user_reported' || f.provenance === 'user_reported'
  );
  const modelSuggestedFacts = allFacts.filter(
    (f: ExtractedFact) => f.factStatus === 'model_suggested' || f.provenance === 'model_suggested'
  );

  const displayedFacts = allFacts.filter((f: ExtractedFact) => {
    if (selectedFactTab === 'all') return true;
    if (selectedFactTab === 'verified') return f.verified === true || f.factStatus === 'externally_verified';
    if (selectedFactTab === 'pattern') return f.factStatus === 'pattern_extracted';
    if (selectedFactTab === 'user') return f.factStatus === 'user_reported' || f.provenance === 'user_reported';
    if (selectedFactTab === 'model') return f.factStatus === 'model_suggested' || f.provenance === 'model_suggested';
    return true;
  });

  const modeMetadata: Record<
    ProcessingMode,
    { labelBn: string; labelEn: string; color: string; descBn: string; descEn: string }
  > = {
    live_ai_success: {
      labelBn: 'ঐচ্ছিক ক্লাউড এআই বিশ্লেষণ',
      labelEn: 'Optional Cloud AI Analysis',
      color: 'bg-[#EAF3EE] text-[#176B53] border-[#ABCFC3]',
      descBn: 'আপনার সম্মতিতে নির্বাচিত উপকরণটি বাছাই করা এআই সেবায় পাঠানো হয়েছে। ওই সেবার গোপনীয়তার শর্ত দেখে নিন।',
      descEn: 'Selected materials were sent to the chosen AI provider after your consent. Review that provider’s privacy terms.',
    },
    local_rules_fallback: {
      labelBn: 'লোকাল ডিটারমিনিস্টিক রুলস',
      labelEn: 'Local Deterministic Rules',
      color: 'bg-[#F5F7F5] text-[#172B3A] border-[#DDE4DF]',
      descBn: 'ব্রাউজারের নিজস্ব আইনি নিয়মে সম্পূর্ণ অফলাইনে যাচাই করা হয়েছে।',
      descEn: 'Executed locally in-browser via deterministic statutory rules.',
    },
    missing_credentials: {
      labelBn: 'অফলাইন লোকাল রুলস মোড',
      labelEn: 'Offline Local Mode',
      color: 'bg-[#FEF7EC] text-[#945607] border-[#FDE68A]',
      descBn: 'কোনো এপিআই কী ছাড়া অফলাইন লোকাল রুলস ফাইলে অডিট পরিচালিত হয়েছে।',
      descEn: 'Processed using offline statutory rule engine.',
    },
    provider_error: {
      labelBn: 'লোকাল ফলব্যাক মোড',
      labelEn: 'Local Fallback Mode',
      color: 'bg-[#FDF2F2] text-[#B42318] border-[#FECACA]',
      descBn: 'সার্ভার সংযোগ অনুপস্থিত থাকায় অফলাইন আইনি নিয়মে সম্পন্ন হয়েছে।',
      descEn: 'Processed via local deterministic statutory rules.',
    },
    local_deterministic: {
      labelBn: 'লোকাল প্রিভিউ ডেমো',
      labelEn: 'Local Demonstration',
      color: 'bg-[#F5F7F5] text-[#526359] border-[#DDE4DF]',
      descBn: 'নমুনা আইনি ডসিয়ার থেকে সরাসরি অফলাইনে প্রদর্শিত।',
      descEn: 'Loaded from local deterministic scenario.',
    },
  };

  const normalizedMode: ProcessingMode =
    currentCase.processingMode === 'live_ai'
      ? 'live_ai_success'
      : currentCase.processingMode || 'local_rules_fallback';
  const modeInfo = modeMetadata[normalizedMode] || modeMetadata.local_rules_fallback;

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto py-4 px-4 sm:px-6">
      {/* Explicit Fictional Demo Banner */}
      {Boolean(currentCase.isDemo || currentCase.complaintDossier?.isDemo) && (
        <div
          role="status"
          className="bg-[#FFF8E6] border border-[#F3D78A] text-[#7A4B04] px-4 py-2.5 rounded-md flex items-center justify-between gap-3 text-xs font-semibold shadow-xs"
        >
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E08A00] shrink-0" />
            <span>
              {language === 'bn'
                ? 'নমুনা কাল্পনিক তথ্য — প্রকৃত অভিযোগ নয়'
                : 'Fictional demonstration data — not a real consumer complaint.'}
            </span>
          </div>
          <span className="text-xs font-mono opacity-80 uppercase tracking-wider">
            {language === 'bn' ? 'ডেমো কেস' : 'Demo Mode'}
          </span>
        </div>
      )}

      {/* Top Header & Transparency Strip */}
      <div className="bg-white border border-[#DDE4DF] rounded-md p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span id="inspection-case-id" className="font-mono text-xs px-2.5 py-1 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#172B3A] font-bold">
                {currentCase.id}
              </span>
              <span className={`px-2.5 py-1 rounded text-xs font-bold border ${modeInfo.color}`}>
                {language === 'bn' ? modeInfo.labelBn : modeInfo.labelEn}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#172B3A] mt-2">
              {currentCase.productName || 'অনলাইন ক্রয় বিরোধ ও প্রমাণ যাচাই'}
            </h1>
          </div>

          <button
            type="button"
            onClick={onOpenNewCaseModal}
            className="ks-btn ks-btn-primary text-xs py-2 px-4 self-start sm:self-auto font-bold shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন রসিদ / প্রমাণ যাচাই' : 'Upload Evidence'}</span>
          </button>
        </div>

        <p className="text-xs text-[#526359] leading-relaxed border-t border-[#DDE4DF] pt-3">
          {language === 'bn' ? modeInfo.descBn : modeInfo.descEn}
        </p>
      </div>

      {/* Fact Provenance Audit */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE4DF] pb-3">
          <div>
            <h2 className="text-xl font-bold text-[#172B3A]">
              {language === 'bn' ? 'শনাক্তকৃত তথ্যাবলি ও প্রামাণ্য উৎস' : 'Extracted Facts & Provenance'}
            </h2>
            <p className="text-xs text-[#526359]">
              {language === 'bn'
                ? 'প্রতিটি তথ্যের সুনির্দিষ্ট উৎস চিহ্নিত করা হয়েছে (কোনো কৃত্রিম নিশ্চয়তা ছাড়া)।'
                : 'Each fact is categorized strictly by source without artificial certainty.'}
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedFactTab('all')}
              className={`px-3 py-1.5 rounded border font-semibold transition ${
                selectedFactTab === 'all'
                  ? 'bg-[#172B3A] text-white border-[#172B3A]'
                  : 'bg-white text-[#526359] border-[#DDE4DF] hover:bg-[#F5F7F5]'
              }`}
            >
              {language === 'bn' ? 'সকল তথ্য' : 'All'} ({allFacts.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFactTab('verified')}
              className={`px-3 py-1.5 rounded border font-semibold transition ${
                selectedFactTab === 'verified'
                  ? 'bg-[#176B53] text-white border-[#176B53]'
                  : 'bg-white text-[#526359] border-[#DDE4DF] hover:bg-[#F5F7F5]'
              }`}
            >
              {language === 'bn' ? 'যাচাইকৃত' : 'Verified'} ({verifiedFacts.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFactTab('pattern')}
              className={`px-3 py-1.5 rounded border font-semibold transition ${
                selectedFactTab === 'pattern'
                  ? 'bg-[#176B53] text-white border-[#176B53]'
                  : 'bg-white text-[#526359] border-[#DDE4DF] hover:bg-[#F5F7F5]'
              }`}
            >
              {language === 'bn' ? 'প্যাটার্ন শনাক্ত' : 'Pattern Extracted'} ({patternFacts.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFactTab('user')}
              className={`px-3 py-1.5 rounded border font-semibold transition ${
                selectedFactTab === 'user'
                  ? 'bg-[#172B3A] text-white border-[#172B3A]'
                  : 'bg-white text-[#526359] border-[#DDE4DF] hover:bg-[#F5F7F5]'
              }`}
            >
              {language === 'bn' ? 'ভোক্তা প্রদত্ত' : 'User Reported'} ({userReportedFacts.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFactTab('model')}
              className={`px-3 py-1.5 rounded border font-semibold transition ${
                selectedFactTab === 'model'
                  ? 'bg-[#176B53] text-white border-[#176B53]'
                  : 'bg-white text-[#526359] border-[#DDE4DF] hover:bg-[#F5F7F5]'
              }`}
            >
              {language === 'bn' ? 'এআই প্রস্তাবিত' : 'AI Suggested'} ({modelSuggestedFacts.length})
            </button>
          </div>
        </div>

        {/* Facts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedFacts.length > 0 ? (
            displayedFacts.map((fact) => {
              const isPattern = fact.factStatus === 'pattern_extracted';
              const isUser = fact.factStatus === 'user_reported' || fact.provenance === 'user_reported';
              const isVerified = fact.verified;

              return (
                <div
                  key={fact.id}
                  className="bg-white border border-[#DDE4DF] rounded-md p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#526359]">
                        {language === 'bn' ? fact.labelBn : fact.labelEn}
                      </span>
                      {isVerified ? (
                        <span className="ks-badge ks-badge-verified">
                          {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                        </span>
                      ) : isPattern ? (
                        <span className="ks-badge ks-badge-verified">
                          {language === 'bn' ? 'প্যাটার্ন শনাক্ত' : 'Pattern Match'}
                        </span>
                      ) : isUser ? (
                        <span className="ks-badge ks-badge-neutral">
                          {language === 'bn' ? 'ভোক্তা প্রদত্ত' : 'User Stated'}
                        </span>
                      ) : (
                        <span className="ks-badge ks-badge-teal">
                          {language === 'bn' ? 'মডেল প্রস্তাবিত' : 'AI Suggested'}
                        </span>
                      )}
                    </div>
                    <div className="font-mono font-bold text-sm text-[#172B3A] break-all">
                      {fact.value}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#DDE4DF] flex items-center justify-between text-xs text-[#526359]">
                    <span>
                      {language === 'bn' ? 'উৎস নথি:' : 'Source:'}{' '}
                      <strong className="text-[#26352E]">{fact.sourceDocName || 'ইনপুট ফর্ম'}</strong>
                    </span>
                    <span className="italic">
                      {fact.verified ? 'প্রামাণ্য' : 'যাচাই সাপেক্ষ'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 p-8 text-center bg-white border border-[#DDE4DF] rounded-md text-xs text-[#526359]">
              {language === 'bn'
                ? 'এই ক্যাটাগরিতে কোনো তথ্য পাওয়া যায়নি।'
                : 'No facts found in this category.'}
            </div>
          )}
        </div>
      </div>

      {/* Statutory Risk Assessment Breakdown */}
      <div className="bg-white border border-[#DDE4DF] rounded-md p-6 space-y-6 shadow-sm">
        <div className="border-b border-[#DDE4DF] pb-3">
          <h2 className="text-xl font-bold text-[#172B3A]">
            {language === 'bn' ? 'আইনি ঝুঁকি ও পর্যবেক্ষণ সারসংক্ষেপ' : 'Statutory Risk Assessment'}
          </h2>
          <p className="text-xs text-[#526359] mt-0.5">
            {language === 'bn'
              ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ অনুসারে পর্যবেক্ষণের বিবরণ ও গুরুত্ব।'
              : 'Detailed breakdown of observed signals under Consumer Rights Protection Act 2009.'}
          </p>
        </div>

        <div className="space-y-3">
          {currentCase.riskBreakdown.map((item: RiskCategoryItem) => {
            const isWarning = item.category === 'warning';
            const isVerified = item.category === 'verified';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-md border flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                  isWarning
                    ? 'bg-[#FEF7EC] border-[#FDE68A]'
                    : isVerified
                    ? 'bg-[#EAF3EE] border-[#ABCFC3]'
                    : 'bg-[#F5F7F5] border-[#DDE4DF]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-[#945607] shrink-0" />
                    ) : isVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-[#176B53] shrink-0" />
                    ) : (
                      <HelpCircle className="w-4 h-4 text-[#526359] shrink-0" />
                    )}
                    <span className="font-bold text-sm text-[#172B3A]">
                      {language === 'bn' ? item.titleBn : item.titleEn}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-white border border-[#DDE4DF] text-[#526359]">
                      {item.provenance || 'pattern_extracted'}
                    </span>
                  </div>
                  <p className="text-xs text-[#526359] pl-6 leading-relaxed">
                    {language === 'bn' ? item.detailBn : item.detailEn}
                  </p>
                </div>

                <div className="sm:self-center shrink-0 pl-6 sm:pl-0">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded ${
                      isWarning
                        ? 'bg-[#FEF7EC] text-[#945607] border border-[#FDE68A]'
                        : isVerified
                        ? 'bg-[#EAF3EE] text-[#176B53] border border-[#ABCFC3]'
                        : 'bg-white text-[#526359] border border-[#DDE4DF]'
                    }`}
                  >
                    {isWarning
                      ? language === 'bn'
                        ? 'সতর্কতা সংকেত'
                        : 'Warning Sign'
                      : isVerified
                      ? language === 'bn'
                        ? 'যাচাইকৃত'
                        : 'Verified'
                      : language === 'bn'
                        ? 'অজ্ঞাত'
                        : 'Unknown'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Limitation Reminder Bar */}
        <div className="p-4 rounded-md bg-[#F5F7F5] border border-[#DDE4DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-[#172B3A]">
            <Clock className="w-5 h-5 text-[#176B53] shrink-0" />
            <div>
              <span className="font-bold">
                {language === 'bn' ? 'আইনগত তামাদি মেয়াদ (ধারা ৬০):' : 'Statutory Limitation (Section 60):'}
              </span>{' '}
              {currentCase.complaintDossier?.limitationRemainingDays != null ? (
                currentCase.complaintDossier.isTimeBarred ? (
                  language === 'bn'
                    ? 'ঘটনার কারণ উদ্ভব হওয়ার ৩০ ক্যালেন্ডার দিন অতিক্রান্ত হয়েছে।'
                    : 'Statutory 30-day window has elapsed since the cause of action.'
                ) : (
                  language === 'bn'
                    ? `ঘটনার তারিখ হতে ৩০ ক্যালেন্ডার দিনের মধ্যে লিখিত অভিযোগ দাখিল করতে হবে (${currentCase.complaintDossier.limitationRemainingDays} দিন বাকি)।`
                    : `Section 60 requires filing within 30 calendar days (${currentCase.complaintDossier.limitationRemainingDays} days remaining).`
                )
              ) : (
                language === 'bn'
                  ? 'ঘটনার নির্দিষ্ট তারিখ দেওয়া হয়নি। ধারা ৬০ অনুসারে কারণ উদ্ভব হওয়ার ৩০ ক্যালেন্ডার দিনের মধ্যে অভিযোগ দাখিল আবশ্যক।'
                  : 'Cause-of-action date not provided. Under Section 60, filing is required within 30 calendar days.'
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenComplaintBuilder}
            className="ks-btn ks-btn-primary text-xs py-2 px-4 shrink-0 font-bold"
          >
            <span>{language === 'bn' ? 'অভিযোগপত্র খসড়া দেখুন' : 'Draft Formal Complaint'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
