import React from 'react';
import { X, ArrowRight, Clock, Award, ShieldCheck, FolderCheck } from 'lucide-react';
import { DEMO_CASE_PRESETS, DemoCasePreset } from '../data/demoCases';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase: (caseKey: string) => void;
  language: 'bn' | 'en';
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSelectCase,
  language,
}) => {
  if (!isOpen) return null;

  const handlePick = (preset: DemoCasePreset) => {
    onSelectCase(preset.caseKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface border border-border text-ink-primary rounded-lg max-w-2xl w-full overflow-hidden shadow-dropdown flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-canvas border-b border-border p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded text-ink-secondary hover:text-ink-primary hover:bg-border/40 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>{language === 'bn' ? 'ভোক্তা অধিকার সহায়তা ও নাগরিক নির্দেশিকা' : 'Consumer Rights Assistance & Citizen Guide'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-ink-primary flex items-center gap-2">
            <span>{language === 'bn' ? 'কেনাসাথী ব্যবহারে স্বাগতম' : 'Welcome to KenaSathi'}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-primary font-bold border border-emerald-200">
              CRPA 2009
            </span>
          </h2>
          <p className="text-sm text-ink-secondary mt-1.5 leading-relaxed">
            {language === 'bn'
              ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ অনুসারে কেনাকাটার তথ্য সংরক্ষণ, ধারা ৬০ অনুযায়ী ৩০ দিনের তামাদি মেয়াদ গণনা এবং আনুষ্ঠানিক অভিযোগের খসড়া তৈরি করতে কেনাসাথী আপনাকে সহায়তা করে।'
              : 'KenaSathi assists citizens under the Consumer Rights Protection Act 2009 with evidence organization, Section 60 30-day statutory limitation tracking, and formal complaint draft preparation.'}
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* 3 Core Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1">
              <FolderCheck className="w-4 h-4 text-primary" />
              <div className="font-bold text-primary">
                {language === 'bn' ? 'প্রমাণাদি সংরক্ষণ' : 'Evidence Archive'}
              </div>
              <div className="text-xs text-primary-deep leading-normal">
                {language === 'bn' ? 'পেমেন্ট রসিদ, চালান ও চ্যাট নিজের ডিভাইসে সংরক্ষণ' : 'Store receipts & chats locally on your device'}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-1">
              <Clock className="w-4 h-4 text-amber-700" />
              <div className="font-bold text-amber-900">
                {language === 'bn' ? 'ধারা ৬০: ৩০ দিনের তামাদি' : 'Section 60: 30-Day Window'}
              </div>
              <div className="text-xs text-amber-800 leading-normal">
                {language === 'bn' ? 'ঘটনা ঘটার ৩০ ক্যালেন্ডার দিনের আইনি সময়সীমা' : '30-calendar-day deadline from cause of action'}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-canvas border border-border text-xs space-y-1">
              <Award className="w-4 h-4 text-ink-primary" />
              <div className="font-bold text-ink-primary">
                {language === 'bn' ? 'ধারা ৭৬(৪): ২৫% রিওয়ার্ড' : 'Section 76(4): 25% Share'}
              </div>
              <div className="text-xs text-ink-secondary leading-normal">
                {language === 'bn' ? 'প্রশাসনিক জরিমানা আদায় সাপেক্ষে প্রদেয়' : 'Subject to actual realization by authority'}
              </div>
            </div>
          </div>

          {/* Optional Demonstration Scenarios */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-2 flex items-center justify-between">
              <span>{language === 'bn' ? 'সিস্টেম কীভাবে কাজ করে তা বোঝার জন্য কাল্পনিক নমুনা:' : 'Optional Fictional Demonstrations:'}</span>
              <span className="ks-badge">
                {language === 'bn' ? 'পরীক্ষামূলক নমুনা' : 'Demonstration'}
              </span>
            </div>

            <div className="space-y-2.5">
              {DEMO_CASE_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handlePick(preset)}
                  className="p-4 rounded-lg border border-border hover:border-primary bg-surface hover:bg-canvas cursor-pointer transition text-xs space-y-1.5 group min-h-[44px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink-primary group-hover:text-primary text-sm">
                      {language === 'bn' ? preset.taglineBn : preset.taglineEn}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-primary border border-emerald-200">
                      {language === 'bn' ? preset.badgeBn : preset.badgeEn}
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {language === 'bn' ? preset.summaryBn : preset.summaryEn}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs text-primary font-semibold">
                    <span>{preset.statutorySection}</span>
                    <span className="flex items-center gap-1">
                      <span>{language === 'bn' ? 'নমুনা দেখুন' : 'Explore Demo'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-canvas border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-secondary text-center sm:text-left">
            {language === 'bn'
              ? 'কেনাসাথী একটি স্বাধীন ডিজিটাল নাগরিক সহায়তা সেবা।'
              : 'KenaSathi is an independent civic consumer assistance service.'}
          </p>
          <button
            onClick={onClose}
            className="ks-btn ks-btn-primary w-full sm:w-auto"
          >
            <span>{language === 'bn' ? 'সেবা গ্রহণ শুরু করুন' : 'Start Using Service'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
