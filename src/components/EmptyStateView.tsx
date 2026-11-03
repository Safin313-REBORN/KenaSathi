import React from 'react';
import { Inbox, PlusCircle, BookOpen, Scale, ShieldAlert, Sparkles } from 'lucide-react';

interface EmptyStateViewProps {
  language: 'bn' | 'en';
  onOpenNewDispute: () => void;
  onLoadDemoCase: () => void;
  onOpenDirectory?: () => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  language,
  onOpenNewDispute,
  onLoadDemoCase,
  onOpenDirectory,
}) => {
  return (
    <div className="bg-white border border-[#D9E0DC] rounded-lg p-8 sm:p-12 text-center space-y-6 shadow-sm max-w-2xl mx-auto my-8 animate-fadeIn">
      <div className="w-14 h-14 rounded bg-[#EAF3F0] border border-[#ABCFC3] text-[#176B53] mx-auto flex items-center justify-center">
        <Inbox className="w-7 h-7 text-[#176B53]" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#F4F6F5] border border-[#D9E0DC] text-xs font-semibold text-[#64716A]">
          <Scale className="w-3.5 h-3.5 text-[#176B53]" />
          <span>{language === 'bn' ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯' : 'Consumer Rights Protection Act 2009'}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#172B3A]">
          {language === 'bn' ? 'কোনো সংরক্ষিত বিরোধ নেই' : 'No Active Disputes Stored'}
        </h2>

        <p className="text-xs sm:text-sm text-[#64716A] leading-relaxed">
          {language === 'bn'
            ? 'আপনার ব্রাউজারে বর্তমানে কোনো সংরক্ষিত বিরোধ নেই। কেনাকাটায় প্রতারিত হলে নতুন বিরোধ নথিভুক্ত করতে পারেন অথবা সিস্টেমের কার্যকারিতা দেখতে একটি নমুনা প্রদর্শন পর্যালোচনা করতে পারেন।'
            : 'There are currently no active disputes stored in your browser. Record a new consumer grievance or explore a sample demonstration scenario.'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onOpenNewDispute}
          className="ks-btn ks-btn-primary text-xs sm:text-sm font-bold px-5 py-2.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন বিরোধ নথিভুক্ত করুন' : 'Record New Dispute'}</span>
        </button>

        <button
          type="button"
          onClick={onLoadDemoCase}
          className="ks-btn ks-btn-secondary text-xs sm:text-sm font-bold px-5 py-2.5"
        >
          <Sparkles className="w-4 h-4 text-[#176B53]" />
          <span>{language === 'bn' ? 'পরীক্ষামূলক নমুনা দেখুন' : 'Explore Demonstration'}</span>
        </button>

        {onOpenDirectory && (
          <button
            type="button"
            onClick={onOpenDirectory}
            className="ks-btn ks-btn-ghost text-xs sm:text-sm px-4 py-2.5"
          >
            <BookOpen className="w-4 h-4 text-[#176B53]" />
            <span>{language === 'bn' ? 'ভোক্তা নির্দেশিকা (১৬১২১)' : 'Consumer Guide (16121)'}</span>
          </button>
        )}
      </div>

      {/* Statutory Limitation Reminder Footer */}
      <div className="pt-6 border-t border-[#E8ECE9] flex flex-wrap items-center justify-center gap-3 text-xs text-[#8A9790]">
        <span className="flex items-center space-x-1 text-[#64716A]">
          <ShieldAlert className="w-3.5 h-3.5 text-[#A96C16]" />
          <span>{language === 'bn' ? 'ধারা ৬০: ৩০ দিনের মধ্যে লিখিত অভিযোগ দাখিল আবশ্যক' : 'Section 60: 30-Day Statutory Limitation'}</span>
        </span>
        <span>•</span>
        <span>জাতীয় হেল্পলাইন: <strong className="text-[#176B53] font-mono">16121</strong></span>
        <span>•</span>
        <span className="font-mono">nccc@dncrp.gov.bd</span>
      </div>
    </div>
  );
};
