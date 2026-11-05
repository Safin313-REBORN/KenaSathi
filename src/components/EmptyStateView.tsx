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
    <div className="ks-card bg-surface rounded-lg p-6 sm:p-8 text-center space-y-5 max-w-xl mx-auto my-6 animate-fadeIn">
      <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 text-primary mx-auto flex items-center justify-center">
        <Inbox className="w-6 h-6 text-primary" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-canvas border border-border text-xs font-semibold text-ink-secondary">
          <Scale className="w-3.5 h-3.5 text-primary" />
          <span>{language === 'bn' ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯' : 'Consumer Rights Protection Act 2009'}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-ink-primary tracking-tight">
          {language === 'bn' ? 'কোনো সংরক্ষিত বিরোধ নেই' : 'No Active Disputes Stored'}
        </h2>

        <p className="text-sm text-ink-secondary leading-relaxed">
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
          className="ks-btn ks-btn-primary"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন বিরোধ নথিভুক্ত করুন' : 'Record New Dispute'}</span>
        </button>

        <button
          type="button"
          onClick={onLoadDemoCase}
          className="ks-btn ks-btn-secondary"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span>{language === 'bn' ? 'পরীক্ষামূলক নমুনা দেখুন' : 'Explore Demonstration'}</span>
        </button>

        {onOpenDirectory && (
          <button
            type="button"
            onClick={onOpenDirectory}
            className="ks-btn ks-btn-ghost"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span>{language === 'bn' ? 'ভোক্তা নির্দেশিকা (১৬১২১)' : 'Consumer Guide (16121)'}</span>
          </button>
        )}
      </div>

      {/* Statutory Limitation Reminder Footer */}
      <div className="pt-6 border-t border-border flex flex-wrap items-center justify-center gap-3 text-xs text-ink-secondary">
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-4 h-4 text-warning" />
          <span>{language === 'bn' ? 'ধারা ৬০: ৩০ দিনের মধ্যে লিখিত অভিযোগ দাখিল আবশ্যক' : 'Section 60: 30-Day Statutory Limitation'}</span>
        </span>
        <span>•</span>
        <span>জাতীয় হেল্পলাইন: <strong className="text-primary font-mono">16121</strong></span>
        <span>•</span>
        <span className="font-mono">nccc@dncrp.gov.bd</span>
      </div>
    </div>
  );
};
