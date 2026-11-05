import React from 'react';
import { Scale } from 'lucide-react';

interface LoadingOverlayProps {
  language: 'bn' | 'en';
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  language,
  message,
}) => {
  return (
    <div className="p-8 sm:p-12 bg-surface border border-border rounded-lg shadow-sm text-center space-y-6 animate-fadeIn max-w-lg mx-auto my-6">
      <div className="flex items-center justify-center pt-2">
        <div className="w-10 h-10 rounded-full border-3 border-emerald-100 border-t-primary animate-spin" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-canvas text-primary text-xs font-semibold border border-border">
          <Scale className="w-3.5 h-3.5 text-primary" />
          <span>
            {language === 'bn'
              ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ যাচাই'
              : 'CRPA 2009 Statutory Audit'}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-ink-primary">
          {message ||
            (language === 'bn'
              ? 'প্রমাণপত্র স্ক্যান ও আইনি ধারা পর্যালোচনা চলছে...'
              : 'Inspecting Evidence & Mapping CRPA 2009 Provisions...')}
        </h3>

        <p className="text-xs text-ink-secondary leading-relaxed">
          {language === 'bn'
            ? 'ডিজিটাল রসিদ, ট্রানজেকশন রেফারেন্স, ধারা ৬০ সংবিধিবদ্ধ ৩০ দিনের তামাদি মেয়াদ ও ডিএনসিআরপি অভিযোগ খসড়া প্রস্তুত করা হচ্ছে।'
            : 'Extracting digital receipts, transaction references, computing Section 60 30-day limitation window, and compiling draft DNCRP complaint.'}
        </p>
      </div>
    </div>
  );
};
