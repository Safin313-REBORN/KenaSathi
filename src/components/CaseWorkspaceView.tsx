import React, { useState } from 'react';
import {
  Clock,
  FileCheck2,
  FileText,
  DollarSign,
  CheckCircle2,
  Trash2,
  FolderOpen,
  Scale,
  Plus,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { ConsumerInspectionResult, CaseTask } from '../types/consumer';
import { KenaSathiStorage } from '../services/storageService';
import { ComplaintBuilder } from './ComplaintBuilder';

interface CaseWorkspaceViewProps {
  currentCase: ConsumerInspectionResult;
  cases: ConsumerInspectionResult[];
  language: 'bn' | 'en';
  onSelectCase: (caseId: string) => void;
  onDeleteCase?: (caseId: string) => void;
  onOpenNewDispute: () => void;
  initialSubTab?: 'summary' | 'timeline' | 'evidence' | 'tasks' | 'financial' | 'complaint';
}

export const CaseWorkspaceView: React.FC<CaseWorkspaceViewProps> = ({
  currentCase,
  cases,
  language,
  onSelectCase,
  onDeleteCase,
  onOpenNewDispute,
  initialSubTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'summary' | 'timeline' | 'evidence' | 'tasks' | 'financial' | 'complaint'
  >(initialSubTab || 'summary');
  const [prevInitialSubTab, setPrevInitialSubTab] = useState(initialSubTab);

  // Synchronize active sub-tab when initialSubTab prop changes from parent
  if (initialSubTab && initialSubTab !== prevInitialSubTab) {
    setPrevInitialSubTab(initialSubTab);
    setActiveSubTab(initialSubTab);
  }

  // Synchronize localTasks whenever active case changes
  const [localTasks, setLocalTasks] = useState<CaseTask[]>(
    currentCase.tasks || KenaSathiStorage.getTasks(currentCase.id)
  );
  const [prevCaseId, setPrevCaseId] = useState(currentCase.id);

  if (currentCase.id !== prevCaseId) {
    setPrevCaseId(currentCase.id);
    setLocalTasks(currentCase.tasks || KenaSathiStorage.getTasks(currentCase.id));
  }

  const handleToggleTask = (taskId: string) => {
    const updated = KenaSathiStorage.toggleTaskStatus(taskId);
    if (updated) {
      setLocalTasks((prev: CaseTask[]) =>
        prev.map((t: CaseTask) => (t.id === taskId ? updated : t))
      );
    }
  };

  // Section 60 limitation calculation
  const limitationDays = currentCase.complaintDossier?.limitationRemainingDays;
  const hasLimitation = limitationDays !== null && limitationDays !== undefined;
  const isTimeBarred = currentCase.complaintDossier?.isTimeBarred ?? false;
  const isExpiringSoon = hasLimitation && !isTimeBarred && limitationDays <= 7 && limitationDays > 0;
  const productName = currentCase.productName?.trim() || currentCase.complaintDossier?.productName?.trim() || '';
  const sellerName = currentCase.sellerName?.trim() || currentCase.complaintDossier?.sellerShopName?.trim() || '';
  const factualSummary = currentCase.complaintDossier?.factualSummaryBn?.trim() || currentCase.complaintDossier?.factualSummaryEn?.trim() || '';
  const reviewItems = [
    {
      label: language === 'bn' ? 'পণ্যের বিবরণ' : 'Product details',
      present: Boolean(productName && productName !== 'অনলাইন ক্রয় বিরোধ' && productName !== 'Online purchase dispute'),
      target: 'complaint' as const,
    },
    {
      label: language === 'bn' ? 'বিক্রেতার পরিচয়' : 'Seller identity',
      present: Boolean(sellerName && sellerName !== 'অনির্দিষ্ট বিক্রেতা' && sellerName !== 'Unspecified seller'),
      target: 'complaint' as const,
    },
    {
      label: language === 'bn' ? 'পরিশোধিত মূল্য' : 'Amount paid',
      present: currentCase.claimedPurchasePriceBdt > 0,
      target: 'financial' as const,
    },
    {
      label: language === 'bn' ? 'কারণ উদ্ভবের তারিখ' : 'Cause-of-action date',
      present: Boolean(currentCase.causeOfActionDate),
      target: 'timeline' as const,
    },
    {
      label: language === 'bn' ? 'ঘটনার বিবরণ' : 'Incident narrative',
      present: Boolean(factualSummary && factualSummary !== 'বিরোধের বিবরণ প্রস্তুত করা হয়েছে.' && factualSummary !== 'A dispute summary has been prepared.'),
      target: 'complaint' as const,
    },
    {
      label: language === 'bn' ? 'অভিযোগকারীর নাম ও যোগাযোগ' : 'Complainant name and contact',
      present: Boolean(currentCase.complaintDossier?.complainantName?.trim() && (currentCase.complaintDossier?.complainantNidPhone?.trim() || currentCase.complaintDossier?.complainantAddress?.trim())),
      target: 'complaint' as const,
    },
    {
      label: language === 'bn' ? 'সংযুক্ত প্রমাণ ফাইল' : 'Evidence files attached',
      present: Boolean(currentCase.evidenceItems?.length),
      target: 'evidence' as const,
    },
  ];
  const reviewItemsPresent = reviewItems.filter((item) => item.present).length;
  const categoryLabel = language === 'bn'
    ? ({
        product_not_delivered: 'ডেলিভারি না দেওয়া',
        wrong_product: 'ভুল পণ্য',
        damaged_product: 'ক্ষতিগ্রস্ত পণ্য',
        refund_refused: 'রিফান্ড অস্বীকৃতি',
        payment_dispute: 'অতিরিক্ত মূল্য',
        warranty_dispute: 'ওয়ারেন্টি অস্বীকৃতি',
        misleading_ad: 'বিভ্রান্তিকর বিজ্ঞাপন',
        counterfeit_product: 'নকল পণ্য',
        adulterated_goods: 'ভেজাল পণ্য',
        seller_communication: 'বিক্রেতার সঙ্গে যোগাযোগ বিচ্ছিন্ন',
        other_consumer_issue: 'অন্যান্য ভোক্তা অধিকার সমস্যা',
        deceptive_advertisement: 'বিভ্রান্তিকর বিজ্ঞাপন',
        refused_refund_warranty: 'রিফান্ড বা ওয়ারেন্টি অস্বীকৃতি',
        price_gouging_overcharge: 'অতিরিক্ত মূল্য',
        expired_hazardous_product: 'মেয়াদোত্তীর্ণ বা ঝুঁকিপূর্ণ পণ্য',
      }[currentCase.grievanceType] || 'অন্যান্য ভোক্তা অধিকার সমস্যা')
    : ({
        product_not_delivered: 'Non-delivery',
        wrong_product: 'Wrong product',
        damaged_product: 'Damaged product',
        refund_refused: 'Refund refused',
        payment_dispute: 'Overcharge',
        warranty_dispute: 'Warranty refused',
        misleading_ad: 'Misleading advertisement',
        counterfeit_product: 'Counterfeit product',
        adulterated_goods: 'Adulterated goods',
        seller_communication: 'Seller stopped responding',
        other_consumer_issue: 'Other consumer issue',
        deceptive_advertisement: 'Misleading advertisement',
        refused_refund_warranty: 'Refund or warranty refused',
        price_gouging_overcharge: 'Overcharge',
        expired_hazardous_product: 'Expired or hazardous product',
      }[currentCase.grievanceType] || 'Other consumer issue');

  const subTabs = [
    { id: 'summary', labelBn: 'সারসংক্ষেপ', labelEn: 'Case Summary', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'timeline', labelBn: 'টাইমলাইন ও তামাদি', labelEn: 'Timeline & Limitation', icon: <Clock className="w-4 h-4" /> },
    { id: 'evidence', labelBn: 'প্রমাণাদি ভল্ট', labelEn: 'Evidence Files', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'tasks', labelBn: 'করণীয় পদক্ষেপ', labelEn: 'Action Tasks', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'financial', labelBn: 'আর্থিক বিবরণ', labelEn: 'Financial Details', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'complaint', labelBn: 'অভিযোগের খসড়া', labelEn: 'Complaint Draft', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto py-4 px-4 sm:px-6">
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

      {/* Top Case Header & Selector Strip */}
      <div className="bg-white border border-[#DDE4DF] rounded-md p-6 space-y-4 shadow-sm">
        {/* Unofficial / Local Storage Boundary Notice */}
        <div className="bg-[#F5F7F5] border border-[#DDE4DF] px-3.5 py-2 rounded text-xs text-[#526359] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
          <div className="flex items-start sm:items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-[#176B53] shrink-0" />
            <span className="min-w-0">
              {language === 'bn'
                ? 'কেনাসাথী ডসিয়ার — এই নথিপত্রটি আপনার ব্রাউজারে সংরক্ষিত একটি ব্যক্তিগত রেকর্ড। এটি এখনো ডিএনসিআরপিতে দাখিল করা হয়নি।'
                : 'KenaSathi Dossier — This record is stored locally in your browser. It has not been submitted to DNCRP.'}
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-[#172B3A] break-all sm:shrink-0">
            {currentCase.id}
          </span>
        </div>

        {/* Case Title & Status Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#DDE4DF]">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#172B3A]">
                {currentCase.id}
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#EAF3EE] text-[#176B53] border border-[#ABCFC3]">
                {currentCase.applicableViolations?.[0]?.section || 'ভোক্তা অধিকার ধারা ৪৫'}
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#F5F7F5] text-[#172B3A] border border-[#DDE4DF]">
                {currentCase.complaintDossier?.complaintDraftId
                  ? language === 'bn' ? 'খসড়া প্রস্তুত' : 'Draft Ready'
                  : language === 'bn' ? 'তদন্তাধীন' : 'Under Review'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#172B3A]">
              {currentCase.productName || currentCase.complaintDossier?.productName || 'অনলাইন কেনাকাটা বিরোধ'}
            </h1>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onOpenNewDispute}
              className="ks-btn ks-btn-primary text-xs py-2 px-3.5 font-bold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন বিরোধ' : 'New Dispute'}</span>
            </button>

            {cases.length > 1 && (
              <select
                value={currentCase.id}
                onChange={(e) => onSelectCase(e.target.value)}
                className="p-2 rounded border border-[#DDE4DF] bg-[#F5F7F5] text-xs font-semibold text-[#172B3A] focus:outline-none focus:border-[#176B53]"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.productName || 'বিরোধ'}
                  </option>
                ))}
              </select>
            )}

            {onDeleteCase && (
              <button
                type="button"
                onClick={() => onDeleteCase(currentCase.id)}
                className="ks-btn ks-btn-danger text-xs py-2 px-3"
                title="Delete this record"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Priority 3: Next Relevant Action Prompt */}
        <div className="p-3.5 rounded-md bg-[#EAF3EE] border border-[#ABCFC3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#176B53]">
              {language === 'bn' ? 'পরবর্তী করণীয় পদক্ষেপ' : 'Next Recommended Action'}
            </span>
            <p className="text-[#124A3B] font-medium leading-[1.6]">
              {language === 'bn'
                ? 'অভিযোগপত্রের খসড়া চূড়ান্ত পর্যালোচনা করুন এবং ধারা ৬০ তামাদি উত্তীর্ণ হওয়ার পূর্বে সংশ্লিষ্ট ডিএনসিআরপি দপ্তরে দাখিলের প্রস্তুতি নিন।'
                : 'Review the structured complaint draft and file with the appropriate DNCRP office before statutory limitation expires.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveSubTab('complaint')}
            className="ks-btn ks-btn-primary group text-xs py-1.5 px-3 font-bold whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            <span>{language === 'bn' ? 'অভিযোগের খসড়া দেখুন' : 'Open Complaint Draft'}</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform duration-standard ease-standard group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Priority 4: Essential Case Facts Compact Row */}
        <div className="bg-[#F5F7F5] border border-[#DDE4DF] rounded-md p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#526359] mb-3">
            {language === 'bn' ? 'বিরোধের মূল তথ্য সংক্ষেপ' : 'Essential Dispute Facts'}
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3 text-xs">
            <div>
              <dt className="text-[#526359] text-xs font-medium">{language === 'bn' ? 'বিক্রেতা / পেজ' : 'Seller / Shop'}</dt>
              <dd className="font-semibold text-[#172B3A] truncate mt-0.5" title={currentCase.sellerName || currentCase.complaintDossier?.sellerShopName}>
                {currentCase.sellerName || currentCase.complaintDossier?.sellerShopName || 'অনির্ধারিত'}
              </dd>
            </div>
            <div>
              <dt className="text-[#526359] text-xs font-medium">{language === 'bn' ? 'দাবিকৃত ক্রয়মূল্য' : 'Claimed Amount'}</dt>
              <dd className="font-mono font-bold text-[#172B3A] mt-0.5">
                ৳{(currentCase.claimedPurchasePriceBdt || 0).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-[#526359] text-xs font-medium">{language === 'bn' ? 'ধারা ৬০ তামাদি হিসাব' : 'S.60 Limitation'}</dt>
              <dd className={`font-mono font-bold mt-0.5 ${!hasLimitation ? 'text-[#526359]' : isTimeBarred ? 'text-[#B42318]' : isExpiringSoon ? 'text-[#945607]' : 'text-[#176B53]'}`}>
                {!hasLimitation
                  ? (language === 'bn' ? 'তারিখ অনুপস্থিত' : 'Date missing')
                  : isTimeBarred
                  ? (language === 'bn' ? 'তামাদি উত্তীর্ণ' : 'Time Barred')
                  : (language === 'bn' ? `${limitationDays} দিন বাকি` : `${limitationDays} days left`)}
              </dd>
            </div>
            <div>
              <dt className="text-[#526359] text-xs font-medium">{language === 'bn' ? 'বিরোধের শ্রেণি' : 'Category'}</dt>
              <dd className="font-medium text-[#172B3A] truncate mt-0.5">
                {categoryLabel}
              </dd>
            </div>
            <div>
              <dt className="text-[#526359] text-xs font-medium">{language === 'bn' ? 'সংযুক্ত প্রমাণাদি' : 'Evidence Items'}</dt>
              <dd className="font-semibold text-[#172B3A] mt-0.5">
                {currentCase.evidenceItems?.length || 0} {language === 'bn' ? 'টি নথি' : 'files'}
              </dd>
            </div>
            <div>
              <dt className="text-[#526359] text-xs font-medium">{language === 'bn' ? 'বিশ্লেষণ পদ্ধতি' : 'Audit Mode'}</dt>
              <dd className="font-semibold text-[#176B53] truncate mt-0.5">
                {currentCase.processingMode === 'live_ai' || currentCase.processingMode === 'live_ai_success'
                  ? (language === 'bn' ? 'ক্লাউড এআই' : 'Cloud AI')
                  : (language === 'bn' ? 'লোকাল রুলস' : 'Local Rules')}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Structured Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Side Navigation */}
        <aside className="lg:col-span-3 bg-white border border-[#DDE4DF] rounded-md p-2 space-y-1 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#526359] px-3 py-2">
            {language === 'bn' ? 'ডসিয়ার অধ্যায়' : 'Dossier Sections'}
          </div>
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`case-subtab-${tab.id}`}
                data-subtab={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
                className={`group w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-bold transition-colors duration-fast text-left min-h-[44px] ${
                  isActive
                    ? 'bg-[#EAF3EE] text-[#176B53]'
                    : 'text-[#26352E] hover:bg-[#F2F7F4] hover:text-[#176B53]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={isActive ? 'text-[#176B53]' : 'text-[#526359] group-hover:text-[#176B53] transition-colors duration-fast'}>{tab.icon}</span>
                  <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-standard ease-standard ${isActive ? 'text-[#176B53] translate-x-0.5' : 'text-[#526359] group-hover:translate-x-0.5 group-hover:text-[#176B53]'}`} />
              </button>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <section className="lg:col-span-9 space-y-6">
          {/* SUB-TAB 1: SUMMARY */}
          {activeSubTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              {/* Dispute Background */}
              <div className="bg-white border border-[#DDE4DF] rounded-md p-6 space-y-4 shadow-sm">
                <h2 className="text-base font-bold text-[#172B3A] flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-[#176B53]" />
                  <span>{language === 'bn' ? 'বিরোধের বিবরণ ও তথ্যাবলী' : 'Dispute Background'}</span>
                </h2>

                <p className="text-xs text-[#526359] leading-relaxed whitespace-pre-line">
                  {language === 'bn'
                    ? currentCase.complaintDossier?.factualSummaryBn || 'বিরোধের বিবরণ প্রস্তুত করা হয়েছে।'
                    : currentCase.complaintDossier?.factualSummaryEn || 'A dispute summary has been prepared.'}
                </p>

                <div className="pt-3 border-t border-[#DDE4DF] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#526359]">{language === 'bn' ? 'অভিযোগকারী:' : 'Complainant:'}</span>
                    <span className="font-semibold text-[#172B3A]">{currentCase.complaintDossier?.complainantName || 'অনির্ধারিত'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#526359]">{language === 'bn' ? 'অভিযুক্ত পেজ/দোকান:' : 'Accused Shop:'}</span>
                    <span className="font-semibold text-[#172B3A]">{currentCase.complaintDossier?.sellerShopName || 'অনির্ধারিত'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#526359]">{language === 'bn' ? 'লেনদেন ট্রানজেকশন:' : 'Transaction ID:'}</span>
                    <span className="font-mono font-bold text-[#176B53]">{currentCase.complaintDossier?.transactionRef || 'প্রযোজ্য নয়'}</span>
                  </div>
                </div>
              </div>

              {/* Statutory Offense Qualification */}
              <div className="bg-white border border-[#DDE4DF] rounded-md p-6 space-y-4 shadow-sm">
                <h2 className="text-base font-bold text-[#172B3A] flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-[#176B53]" />
                  <span>{language === 'bn' ? 'আইনগত ভিত্তি ও প্রযোজ্য ধারা' : 'Statutory Basis'}</span>
                </h2>

                {currentCase.applicableViolations?.[0] ? (
                  <div className="p-4 rounded bg-[#EAF3EE] border border-[#ABCFC3] space-y-2 text-[#176B53]">
                    <span className="font-bold text-sm block">
                      {currentCase.applicableViolations[0].section}: {language === 'bn' ? currentCase.applicableViolations[0].titleBn : currentCase.applicableViolations[0].titleEn}
                    </span>
                    <p className="text-xs text-[#124A3B] leading-relaxed">
                      {language === 'bn' ? currentCase.applicableViolations[0].descriptionBn : currentCase.applicableViolations[0].descriptionEn}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#526359]">
                    {language === 'bn' ? 'প্রযোজ্য ধারা প্রস্তুত রয়েছে।' : 'Statutory provisions ready.'}
                  </p>
                )}
              </div>

              <section className="md:col-span-2 bg-white border border-[#DDE4DF] rounded-md p-5 sm:p-6 space-y-4 shadow-sm" aria-labelledby="case-review-checklist-title">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <h2 id="case-review-checklist-title" className="text-base font-bold text-[#172B3A]">
                      {language === 'bn' ? 'জমা দেওয়ার আগে তথ্য যাচাই' : 'Review details before filing'}
                    </h2>
                    <p className="text-xs text-[#526359] mt-1">
                      {language === 'bn'
                        ? 'এটি শুধু তথ্য আছে কি না দেখায়। প্রমাণের যথেষ্টতা, আইনি যোগ্যতা বা অভিযোগ গ্রহণের নিশ্চয়তা দেয় না।'
                        : 'This only checks whether details are present. It does not assess evidence, legal eligibility, or acceptance.'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#526359] tabular-nums shrink-0">
                    {language === 'bn'
                      ? `${reviewItemsPresent} / ${reviewItems.length} তথ্য নথিভুক্ত`
                      : `${reviewItemsPresent} of ${reviewItems.length} details recorded`}
                  </span>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {reviewItems.map((item) => {
                    const status = item.present
                      ? (language === 'bn' ? 'তথ্য আছে' : 'Recorded')
                      : (language === 'bn' ? 'যোগ বা যাচাই করুন' : 'Add or confirm');
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          onClick={() => setActiveSubTab(item.target)}
                          aria-label={`${item.label}: ${status}`}
                          className="w-full min-h-11 flex items-center justify-between gap-3 rounded border border-[#DDE4DF] bg-[#F5F7F5] px-3 py-2 text-left hover:bg-[#F2F7F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#176B53]"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            {item.present
                              ? <CheckCircle2 className="w-4 h-4 text-[#176B53] shrink-0" aria-hidden="true" />
                              : <span className="w-2 h-2 rounded-full bg-[#945607] shrink-0" aria-hidden="true" />}
                            <span className="text-sm font-medium text-[#26352E] truncate">{item.label}</span>
                          </span>
                          <span className={`text-xs font-semibold shrink-0 ${item.present ? 'text-[#176B53]' : 'text-[#7A4B04]'}`}>{status}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          )}

          {/* SUB-TAB 2: TIMELINE */}
          {activeSubTab === 'timeline' && (
            <div className="bg-white border border-[#DDE4DF] rounded-md p-6 space-y-4 shadow-sm animate-fadeIn">
              <h2 className="text-lg font-bold text-[#172B3A] flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[#176B53]" />
                <span>{language === 'bn' ? 'ঘটনার ধারাবাহিক টাইমলাইন ও ধারা ৬০ হিসাব' : 'Event Timeline & Section 60'}</span>
              </h2>

              <div className="space-y-4 pt-2">
                {currentCase.complaintDossier?.timeline && currentCase.complaintDossier.timeline.length > 0 ? (
                  currentCase.complaintDossier.timeline.map((ev, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs border-l-2 border-[#176B53] pl-4 py-1">
                      <div className="font-mono font-bold text-[#176B53] shrink-0">{language === 'bn' ? ev.dateStr : (ev.dateStrEn || ev.dateStr)}</div>
                      <div>
                        <strong className="text-[#172B3A] block">{language === 'bn' ? ev.titleBn : ev.titleEn}</strong>
                        <p className="text-[#526359] leading-relaxed">{language === 'bn' ? ev.detailBn : ev.detailEn}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#526359]">{language === 'bn' ? 'কোনো টাইমলাইন তথ্য নেই।' : 'No timeline events recorded.'}</p>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: EVIDENCE */}
          {activeSubTab === 'evidence' && (
            <div className="bg-white border border-[#DDE4DF] rounded-md p-6 space-y-4 shadow-sm animate-fadeIn">
              <h2 className="text-lg font-bold text-[#172B3A] flex items-center space-x-2">
                <FolderOpen className="w-5 h-5 text-[#176B53]" />
                <span>{language === 'bn' ? 'সংরক্ষিত প্রমাণাদি ভল্ট' : 'Evidence Vault'}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentCase.evidenceItems && currentCase.evidenceItems.length > 0 ? (
                  currentCase.evidenceItems.map((ev, idx) => (
                    <div key={idx} className="p-3 rounded bg-[#F5F7F5] border border-[#DDE4DF] space-y-1 text-xs">
                      <span className="font-mono text-xs text-[#176B53] font-bold">[{ev.type}]</span>
                      <strong className="text-[#172B3A] block truncate">{ev.name}</strong>
                      <span className="text-xs text-[#526359] block font-mono">
                        {ev.size || 'IndexedDB'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#526359] col-span-2">{language === 'bn' ? 'কোনো প্রমাণ আপলোড করা হয়নি।' : 'No evidence files uploaded.'}</p>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 4: TASKS */}
          {activeSubTab === 'tasks' && (
            <div className="bg-white border border-[#DDE4DF] rounded-md p-6 space-y-4 shadow-sm animate-fadeIn">
              <h2 className="text-lg font-bold text-[#172B3A] flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#176B53]" />
                <span>{language === 'bn' ? 'করণীয় পদক্ষেপ ও চেকলিস্ট' : 'Action Checklist'}</span>
              </h2>

              <div className="space-y-2 pt-2">
                {localTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTask(t.id)}
                    className="p-3 rounded bg-[#F5F7F5] border border-[#DDE4DF] flex items-center justify-between cursor-pointer hover:bg-white transition text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={t.status === 'completed'}
                        onChange={() => {}}
                        className="rounded border-[#DDE4DF] text-[#176B53] focus:ring-0"
                      />
                      <span className={`font-semibold ${t.status === 'completed' ? 'line-through text-[#526359]' : 'text-[#172B3A]'}`}>
                        {language === 'bn' ? t.titleBn : t.titleEn}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#526359]">{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 5: FINANCIAL */}
          {activeSubTab === 'financial' && (
            <div className="bg-white border border-[#DDE4DF] rounded-md p-6 space-y-4 shadow-sm animate-fadeIn">
              <h2 className="text-lg font-bold text-[#172B3A] flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-[#176B53]" />
                <span>{language === 'bn' ? 'আর্থিক দাবি ও লেনদেন হিসাব' : 'Financial Consideration'}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-4 rounded bg-[#F5F7F5] border border-[#DDE4DF]">
                  <span className="text-[#526359] block">{language === 'bn' ? 'পরিশোধিত ক্রয়মূল্য:' : 'Paid Amount:'}</span>
                  <strong className="text-xl font-bold font-mono text-[#172B3A]">
                    ৳{(currentCase.claimedPurchasePriceBdt || 0).toLocaleString()}
                  </strong>
                </div>

                <div className="p-4 rounded bg-[#F5F7F5] border border-[#DDE4DF]">
                  <span className="text-[#526359] block">{language === 'bn' ? 'বাজারদর / MSRP:' : 'Fair Market Price:'}</span>
                  <strong className="text-xl font-bold font-mono text-[#172B3A]">
                    ৳{(currentCase.fairMarketPriceBdt || currentCase.claimedPurchasePriceBdt || 0).toLocaleString()}
                  </strong>
                </div>

                <div className="p-4 rounded bg-[#EAF3EE] border border-[#ABCFC3]">
                  <span className="text-[#176B53] block">{language === 'bn' ? 'দাবিকৃত ক্ষতিপূরণ:' : 'Claimed Refund:'}</span>
                  <strong className="text-xl font-bold font-mono text-[#176B53]">
                    ৳{(currentCase.claimedPurchasePriceBdt || 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 6: COMPLAINT BUILDER */}
          {activeSubTab === 'complaint' && (
            <ComplaintBuilder currentCase={currentCase} language={language} />
          )}
        </section>
      </div>
    </div>
  );
};
