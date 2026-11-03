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
      color: 'bg-[#EAF3F0] text-[#176B53] border-[#ABCFC3]',
      descBn: 'ব্যবহারকারীর সম্মতিক্রমে ক্লাউড মডেল দ্বারা নথিপত্র ও তথ্যাবলি অডিট করা হয়েছে।',
      descEn: 'Audited via secure external AI provider with client-side PII sanitization upon consent.',
    },
    local_rules_fallback: {
      labelBn: 'লোকাল ডিটারমিনিস্টিক রুলস',
      labelEn: 'Local Deterministic Rules',
      color: 'bg-[#F4F6F5] text-[#172B3A] border-[#D9E0DC]',
      descBn: 'ব্রাউজারের নিজস্ব আইনি নিয়মে সম্পূর্ণ অফলাইনে যাচাই করা হয়েছে।',
      descEn: 'Executed locally in-browser via deterministic statutory rules.',
    },
    missing_credentials: {
      labelBn: 'অফলাইন লোকাল রুলস মোড',
      labelEn: 'Offline Local Mode',
      color: 'bg-[#FEF7EC] text-[#A96C16] border-[#FDE68A]',
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
      color: 'bg-[#F4F6F5] text-[#64716A] border-[#D9E0DC]',
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
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto py-2">
      {/* Top Header & Transparency Strip */}
      <div className="bg-white border border-[#D9E0DC] rounded-lg p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#F4F6F5] border border-[#D9E0DC] text-[#64716A] font-bold">
                {currentCase.id}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${modeInfo.color}`}>
                {language === 'bn' ? modeInfo.labelBn : modeInfo.labelEn}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B3A] mt-2">
              {currentCase.productName || 'অনলাইন ক্রয় বিরোধ ও প্রমাণ যাচাই'}
            </h1>
          </div>

          <button
            type="button"
            onClick={onOpenNewCaseModal}
            className="ks-btn ks-btn-primary text-xs py-2 px-4 self-start sm:self-auto font-bold shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'নতুন রসিদ / প্রমাণ যাচাই' : 'Upload Evidence'}</span>
          </button>
        </div>

        <p className="text-xs text-[#64716A] leading-relaxed border-t border-[#E8ECE9] pt-3">
          {language === 'bn' ? modeInfo.descBn : modeInfo.descEn}
        </p>
      </div>

      {/* Fact Provenance Audit */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#172B3A]">
              {language === 'bn' ? 'শনাক্তকৃত তথ্যাবলি ও প্রামাণ্য উৎস' : 'Extracted Facts & Provenance'}
            </h2>
            <p className="text-xs text-[#64716A]">
              {language === 'bn'
                ? 'প্রতিটি তথ্যের সুনির্দিষ্ট উৎস চিহ্নিত করা হয়েছে (কোনো ভুয়া নিশ্চয়তা ছাড়াই)।'
                : 'Each fact is categorized strictly by source without artificial certainty.'}
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedFactTab('all')}
              className={`px-3 py-1 rounded border font-semibold transition ${
                selectedFactTab === 'all'
                  ? 'bg-[#172B3A] text-white border-[#172B3A]'
                  : 'bg-white text-[#64716A] border-[#D9E0DC] hover:bg-[#F4F6F5]'
              }`}
            >
              {language === 'bn' ? 'সকল তথ্য' : 'All'} ({allFacts.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFactTab('verified')}
              className={`px-3 py-1 rounded border font-semibold transition ${
                selectedFactTab === 'verified'
                  ? 'bg-[#176B53] text-white border-[#176B53]'
                  : 'bg-white text-[#64716A] border-[#D9E0DC] hover:bg-[#F4F6F5]'
              }`}
            >
              {language === 'bn' ? 'যাচাইকৃত' : 'Verified'} ({verifiedFacts.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFactTab('pattern')}
              className={`px-3 py-1 rounded border font-semibold transition ${
                selectedFactTab === 'pattern'
                  ? 'bg-[#176B53] text-white border-[#176B53]'
                  : 'bg-white text-[#64716A] border-[#D9E0DC] hover:bg-[#F4F6F5]'
              }`}
            >
              {language === 'bn' ? 'প্যাটার্ন শনাক্ত' : 'Pattern Extracted'} ({patternFacts.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFactTab('user')}
              className={`px-3 py-1 rounded border font-semibold transition ${
                selectedFactTab === 'user'
                  ? 'bg-[#172B3A] text-white border-[#172B3A]'
                  : 'bg-white text-[#64716A] border-[#D9E0DC] hover:bg-[#F4F6F5]'
              }`}
            >
              {language === 'bn' ? 'ভোক্তা প্রদত্ত' : 'User Reported'} ({userReportedFacts.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFactTab('model')}
              className={`px-3 py-1 rounded border font-semibold transition ${
                selectedFactTab === 'model'
                  ? 'bg-indigo-700 text-white border-indigo-700'
                  : 'bg-white text-[#64716A] border-[#D9E0DC] hover:bg-[#F4F6F5]'
              }`}
            >
              {language === 'bn' ? 'এআই প্রস্তাবিত' : 'AI Suggested'} ({modelSuggestedFacts.length})
            </button>
          </div>
        </div>

        {/* Facts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedFacts.length > 0 ? (
            displayedFacts.map((fact) => {
              const isPattern = fact.factStatus === 'pattern_extracted';
              const isUser = fact.factStatus === 'user_reported' || fact.provenance === 'user_reported';
              const isVerified = fact.verified;

              return (
                <div
                  key={fact.id}
                  className="bg-white border border-[#D9E0DC] rounded-lg p-4 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#64716A]">
                        {language === 'bn' ? fact.labelBn : fact.labelEn}
                      </span>
                      {isVerified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF3F0] text-[#176B53] border border-[#ABCFC3]">
                          {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                        </span>
                      ) : isPattern ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF3F0] text-[#176B53] border border-[#ABCFC3]">
                          {language === 'bn' ? 'প্যাটার্ন শনাক্ত' : 'Pattern Match'}
                        </span>
                      ) : isUser ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4F6F5] text-[#64716A] border border-[#D9E0DC]">
                          {language === 'bn' ? 'ভোক্তা প্রদত্ত' : 'User Stated'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {language === 'bn' ? 'মডেল প্রস্তাবিত' : 'AI Suggested'}
                        </span>
                      )}
                    </div>
                    <div className="font-mono font-bold text-sm text-[#172B3A] break-all">
                      {fact.value}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E8ECE9] flex items-center justify-between text-[11px] text-[#8A9790]">
                    <span>
                      {language === 'bn' ? 'উৎস নথি:' : 'Source:'}{' '}
                      <strong className="text-[#64716A]">{fact.sourceDocName || 'ইনপুট ফর্ম'}</strong>
                    </span>
                    <span className="italic">
                      {fact.verified ? 'প্রামাণ্য' : 'যাচাই সাপেক্ষ'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 p-8 text-center bg-white border border-[#D9E0DC] rounded-lg text-xs text-[#64716A]">
              {language === 'bn'
                ? 'এই ক্যাটাগরিতে কোনো তথ্য পাওয়া যায়নি।'
                : 'No facts found in this category.'}
            </div>
          )}
        </div>
      </div>

      {/* Statutory Risk Assessment Breakdown */}
      <div className="bg-white border border-[#D9E0DC] rounded-lg p-6 space-y-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#172B3A]">
            {language === 'bn' ? 'আইনি ঝুঁকি ও পর্যবেক্ষণ সারসংক্ষেপ' : 'Statutory Risk Assessment'}
          </h2>
          <p className="text-xs text-[#64716A]">
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
                className={`p-4 rounded border flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                  isWarning
                    ? 'bg-amber-50/70 border-amber-200'
                    : isVerified
                    ? 'bg-[#EAF3F0] border-[#ABCFC3]'
                    : 'bg-[#F4F6F5] border-[#D9E0DC]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    ) : isVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-[#176B53] shrink-0" />
                    ) : (
                      <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className="font-bold text-sm text-[#172B3A]">
                      {language === 'bn' ? item.titleBn : item.titleEn}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-[#D9E0DC] text-[#64716A]">
                      {item.provenance || 'pattern_extracted'}
                    </span>
                  </div>
                  <p className="text-xs text-[#64716A] pl-6 leading-relaxed">
                    {language === 'bn' ? item.detailBn : item.detailEn}
                  </p>
                </div>

                <div className="sm:self-center shrink-0 pl-6 sm:pl-0">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                      isWarning
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isVerified
                        ? 'bg-[#EAF3F0] text-[#176B53] border border-[#ABCFC3]'
                        : 'bg-slate-200 text-slate-700'
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
        <div className="p-4 rounded bg-[#F4F6F5] border border-[#D9E0DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            className="ks-btn ks-btn-primary text-xs py-2 px-3.5 shrink-0 font-bold"
          >
            <span>{language === 'bn' ? 'অভিযোগপত্র খসড়া দেখুন' : 'Draft Formal Complaint'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
