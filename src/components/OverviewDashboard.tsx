import React from 'react';
import {
  Clock,
  FileCheck2,
  FileText,
  FolderOpen,
  Plus,
  ArrowRight,
  CheckCircle2,
  Scale,
  PhoneCall,
} from 'lucide-react';
import { ConsumerInspectionResult, CaseTask } from '../types/consumer';
import { KenaSathiStorage } from '../services/storageService';
import { EmptyStateView } from './EmptyStateView';

interface OverviewDashboardProps {
  cases: ConsumerInspectionResult[];
  activeCase: ConsumerInspectionResult | null;
  language: 'bn' | 'en';
  onSelectCase: (caseId: string) => void;
  onOpenNewDispute: () => void;
  onOpenCheckPurchase: () => void;
  onOpenDocuments: () => void;
  onOpenComplaint: () => void;
  onLoadDemoCase: () => void;
  onOpenDirectory: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  cases,
  activeCase,
  language,
  onSelectCase,
  onOpenNewDispute,
  onOpenCheckPurchase,
  onOpenDocuments,
  onOpenComplaint,
  onLoadDemoCase,
  onOpenDirectory,
}) => {
  if (!cases || cases.length === 0) {
    return (
      <EmptyStateView
        language={language}
        onOpenNewDispute={onOpenNewDispute}
        onLoadDemoCase={onLoadDemoCase}
        onOpenDirectory={onOpenDirectory}
      />
    );
  }

  // Aggregate pending tasks across cases
  const allTasks: { task: CaseTask; caseTitle: string; caseId: string }[] = [];
  cases.forEach((c) => {
    const tasks = c.tasks || KenaSathiStorage.getTasks(c.id);
    tasks.forEach((t) => {
      allTasks.push({ task: t, caseTitle: c.productName || c.complaintDossier?.productName || c.id, caseId: c.id });
    });
  });

  const pendingTasks = allTasks.filter((item) => item.task.status === 'pending');
  const totalEvidenceCount = cases.reduce((acc, c) => acc + (c.evidenceItems?.length || 0), 0);

  // Honest Section 60 limitation check (Zero fabricated 25-day fallbacks)
  const activeLimitationDays = activeCase?.complaintDossier?.limitationRemainingDays;
  const isActiveTimeBarred = activeCase?.complaintDossier?.isTimeBarred ?? false;
  const hasActiveDate = activeLimitationDays !== null && activeLimitationDays !== undefined;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* =========================================================================
          TOP WELCOME & QUICK METRIC CARDS
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E9ED]">
        <div>
          <h1 className="text-2xl font-bold text-[#192B38]">
            {language === 'bn' ? 'ভোক্তা ড্যাশবোর্ড ও বিরোধ সারসংক্ষেপ' : 'Consumer Dispute Overview'}
          </h1>
          <p className="text-xs text-[#657481] mt-1">
            {language === 'bn'
              ? 'আপনার সক্রিয় কেনাকাটার বিরোধ, প্রমাণ ও আইনি তামাদি মেয়াদের সামগ্রিক চিত্র।'
              : 'Summary of active purchase disputes, evidence, and statutory limitation deadlines.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenCheckPurchase}
            className="ks-btn ks-btn-secondary text-xs"
          >
            <FileCheck2 className="w-4 h-4 text-[#087E78]" />
            <span>{language === 'bn' ? 'নতুন পণ্য অডিট' : 'Audit Purchase'}</span>
          </button>
          <button
            onClick={onOpenNewDispute}
            className="ks-btn ks-btn-teal text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'অভিযোগ নথিভুক্ত' : 'File Dispute'}</span>
          </button>
        </div>
      </div>

      {/* 4 Core Questions Answered in Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. What needs my attention? */}
        <div className="ks-card p-4 space-y-2 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#657481]">
              {language === 'bn' ? 'জরুরি দৃষ্টি আকর্ষণ' : 'Needs Attention'}
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              !hasActiveDate ? 'bg-slate-100 text-slate-600' : isActiveTimeBarred ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#192B38]">
            {!hasActiveDate
              ? (language === 'bn' ? 'তারিখ দেওয়া হয়নি' : 'Date Not Provided')
              : isActiveTimeBarred
              ? (language === 'bn' ? 'তামাদি উত্তীর্ণ' : 'Time Barred')
              : (language === 'bn' ? `${activeLimitationDays} দিন বাকি` : `${activeLimitationDays} Days Left`)}
          </div>
          <p className="text-[11px] text-[#657481]">
            {!hasActiveDate
              ? (language === 'bn' ? 'ঘটনার কারণ উদ্ভব হওয়ার তারিখ দেওয়া হয়নি।' : 'Cause-of-action date not provided.')
              : isActiveTimeBarred
              ? (language === 'bn' ? 'ধারা ৬০ এর ৩০ দিনের আইনি সময় অতিক্রান্ত।' : 'Section 60 30-day statutory window elapsed.')
              : (language === 'bn' ? 'ধারা ৬০ অনুসারে ৩০ দিনের তামাদি মেয়াদ কার্যকর।' : 'Active within Section 60 30-day window.')}
          </p>
        </div>

        {/* 2. What cases are active? */}
        <div className="ks-card p-4 space-y-2 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#657481]">
              {language === 'bn' ? 'সক্রিয় বিরোধ তালিকা' : 'Active Cases'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#E8F5F2] text-[#087E78] flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-[#192B38]">
            {cases.length} টি নথি
          </div>
          <p className="text-[11px] text-[#657481]">
            {language === 'bn'
              ? 'ডিভাইসে সংরক্ষিত মোট সক্রিয় অভিযোগ ডসিয়ার।'
              : 'Total stored dispute dossiers on this device.'}
          </p>
        </div>

        {/* 3. What should I do next? */}
        <div className="ks-card p-4 space-y-2 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#657481]">
              {language === 'bn' ? 'পরবর্তী করণীয়' : 'Next Action'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-[#192B38]">
            {pendingTasks.length} টি কাজ
          </div>
          <p className="text-[11px] text-[#657481]">
            {language === 'bn'
              ? 'প্রমাণাদি সংযুক্তি ও বিক্রেতার জবাব লিপিবদ্ধ করণ।'
              : 'Pending action checklist tasks across your cases.'}
          </p>
        </div>

        {/* 4. Where are my documents? */}
        <div
          onClick={onOpenDocuments}
          className="ks-card p-4 space-y-2 bg-white cursor-pointer hover:border-[#087E78] transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#657481]">
              {language === 'bn' ? 'সংরক্ষিত প্রমাণাদি' : 'Stored Documents'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EEF5FB] text-[#1B65A4] flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-[#192B38]">
            {totalEvidenceCount} টি ফাইল
          </div>
          <p className="text-[11px] text-[#087E78] font-semibold flex items-center space-x-1">
            <span>{language === 'bn' ? 'নথিপত্র ভল্ট দেখুন' : 'Open Document Vault'}</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* =========================================================================
          ACTIVE DISPUTES & PENDING TASKS SPLIT
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Cases List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#192B38]">
              {language === 'bn' ? 'সক্রিয় বিরোধসমূহ' : 'Active Disputes'}
            </h2>
            <span className="text-xs text-[#657481]">
              {language === 'bn' ? 'নির্বাচন করতে ক্লিক করুন' : 'Click to inspect'}
            </span>
          </div>

          <div className="space-y-3">
            {cases.map((c) => {
              const isSelected = activeCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className={`ks-card p-4 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#087E78] ring-1 ring-[#087E78] bg-[#F6F8FA]'
                      : 'hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white border border-[#E4E9ED] text-[#657481] font-bold">
                        {c.id}
                      </span>
                      <span className="ks-badge ks-badge-teal">
                        {c.applicableViolations?.[0]?.section || 'ধারা ৪৫'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#192B38]">
                      {c.productName || c.complaintDossier?.productName || 'অনলাইন ক্রয় বিরোধ'}
                    </h3>
                    <p className="text-xs text-[#657481]">
                      {language === 'bn' ? 'বিক্রেতা:' : 'Seller:'}{' '}
                      <strong className="text-[#192B38]">
                        {c.sellerName || c.complaintDossier?.sellerShopName || 'অনির্ধারিত'}
                      </strong>
                      {' • '}
                      {language === 'bn' ? 'ক্রয়মূল্য:' : 'Price:'}{' '}
                      <strong className="font-mono">
                        ৳{(c.claimedPurchasePriceBdt || 0).toLocaleString()}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 sm:self-center">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-[#657481] block">
                        {language === 'bn' ? 'তামাদি সীমা (ধারা ৬০)' : 'Limitation (S.60)'}
                      </span>
                      <span className={`text-xs font-bold font-mono ${
                        c.complaintDossier?.limitationRemainingDays == null
                          ? 'text-[#657481]'
                          : c.complaintDossier.isTimeBarred
                          ? 'text-rose-600'
                          : 'text-[#087E78]'
                      }`}>
                        {c.complaintDossier?.limitationRemainingDays != null
                          ? (c.complaintDossier.isTimeBarred
                              ? (language === 'bn' ? 'তামাদি উত্তীর্ণ' : 'Time Barred')
                              : (language === 'bn' ? `${c.complaintDossier.limitationRemainingDays} দিন বাকি` : `${c.complaintDossier.limitationRemainingDays} days left`))
                          : (language === 'bn' ? 'তারিখ দেওয়া হয়নি' : 'Date not provided')}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#657481]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Pending Action Items & Statutory Alert */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#192B38]">
            {language === 'bn' ? 'করণীয় ও পরামর্শ' : 'Pending Tasks'}
          </h2>

          <div className="ks-card p-4 space-y-3 bg-white">
            {pendingTasks.length > 0 ? (
              <div className="space-y-2">
                {pendingTasks.slice(0, 5).map(({ task, caseTitle }, idx) => (
                  <div
                    key={task.id || idx}
                    className="p-2.5 rounded-lg bg-[#F6F8FA] border border-[#E4E9ED] space-y-1"
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#192B38]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{language === 'bn' ? task.titleBn : task.titleEn}</span>
                    </div>
                    <p className="text-[11px] text-[#657481] pl-5">
                      {caseTitle}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">
                {language === 'bn' ? 'সকল করণীয় কাজ সম্পন্ন হয়েছে।' : 'All tasks completed.'}
              </p>
            )}

            {/* Complaint Draft Action CTA */}
            <div className="pt-2 border-t border-[#EDF1F4]">
              <button
                onClick={onOpenComplaint}
                className="w-full ks-btn ks-btn-teal text-xs py-2"
              >
                <FileText className="w-4 h-4" />
                <span>{language === 'bn' ? 'ডিএনসিআরপি অভিযোগপত্র দেখুন' : 'Open Complaint Draft'}</span>
              </button>
            </div>
          </div>

          {/* Quick Hotline Helper Box */}
          <div className="p-4 rounded-xl bg-[#E8F5F2] border border-[#A3D7CB] space-y-2 text-[#087E78]">
            <div className="flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-[#087E78]" />
              <span className="text-xs font-bold">
                {language === 'bn' ? 'জাতীয় ভোক্তা হটলাইন' : 'National Helpline'}
              </span>
            </div>
            <p className="text-xs text-[#066560]">
              {language === 'bn'
                ? 'আইনি বিষয়ে দ্রুত পরামর্শ পেতে সরাসরি ১৬১২১ নম্বরে কল করতে পারেন।'
                : 'Call 16121 for official consumer dispute guidance.'}
            </p>
            <a
              href="tel:16121"
              className="inline-block text-xs font-mono font-bold text-[#087E78] underline"
            >
              ১৬১২১ (টোল-ফ্রি নয়)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
