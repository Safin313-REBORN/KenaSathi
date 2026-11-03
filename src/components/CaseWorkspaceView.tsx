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
  AlertCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { ConsumerInspectionResult, EvidenceItem, CaseTask, DisputeTimelineEvent } from '../types/consumer';
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

  const subTabs = [
    { id: 'summary', labelBn: 'সারসংক্ষেপ', labelEn: 'Case Summary', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'timeline', labelBn: 'টাইমলাইন ও তামাদি', labelEn: 'Timeline & Limitation', icon: <Clock className="w-4 h-4" /> },
    { id: 'evidence', labelBn: 'প্রমাণাদি ভল্ট', labelEn: 'Evidence Files', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'tasks', labelBn: 'করণীয় পদক্ষেপ', labelEn: 'Action Tasks', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'financial', labelBn: 'আর্থিক বিবরণ', labelEn: 'Financial Details', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'complaint', labelBn: 'অভিযোগের খসড়া', labelEn: 'Complaint Draft', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto py-2">
      {/* =========================================================================
          TOP CASE HEADER & SELECTOR STRIP
         ========================================================================= */}
      <div className="bg-white border border-[#D9E0DC] rounded-lg p-5 sm:p-6 space-y-4 shadow-sm">
        {/* Unofficial / Local Storage Boundary Notice */}
        <div className="bg-[#F4F6F5] border border-[#D9E0DC] px-3.5 py-2 rounded text-xs text-[#64716A] flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#176B53] shrink-0" />
            <span>
              {language === 'bn'
                ? 'কেনাসাথী ডসিয়ার — এই নথিপত্রটি আপনার ব্রাউজারে সংরক্ষিত একটি ব্যক্তিগত রেকর্ড। এটি এখনো ডিএনসিআরপিতে দাখিল করা হয়নি।'
                : 'KenaSathi Dossier — This record is stored locally in your browser. It has not been submitted to DNCRP.'}
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-[#172B3A] shrink-0">
            {currentCase.id}
          </span>
        </div>

        {/* Case Switcher & Title */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E8ECE9]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#64716A]">
                {language === 'bn' ? 'সক্রিয় বিরোধ ডসিয়ার:' : 'Active Dossier:'}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#EAF3F0] text-[#176B53] border border-[#ABCFC3]">
                {currentCase.applicableViolations?.[0]?.section || 'ভোক্তা অধিকার ধারা ৪৫'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#172B3A]">
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
                className="p-2 rounded border border-[#D9E0DC] bg-[#F4F6F5] text-xs font-semibold text-[#172B3A] focus:outline-none focus:border-[#176B53]"
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

        {/* 6 Key Properties Header Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded bg-[#F4F6F5] border border-[#D9E0DC]">
            <span className="text-[#64716A] block">{language === 'bn' ? 'অবস্থা' : 'Status'}</span>
            <span className="font-bold text-[#172B3A]">
              {currentCase.complaintDossier?.complaintDraftId
                ? language === 'bn' ? 'খসড়া প্রস্তুত' : 'Draft Ready'
                : language === 'bn' ? 'তদন্তাধীন' : 'Under Review'}
            </span>
          </div>

          <div className="p-3 rounded bg-[#F4F6F5] border border-[#D9E0DC]">
            <span className="text-[#64716A] block">{language === 'bn' ? 'সমস্যার ধরন' : 'Category'}</span>
            <span className="font-bold text-[#172B3A]">
              {currentCase.grievanceType === 'product_not_delivered'
                ? 'ডেলিভারি না দেওয়া'
                : currentCase.grievanceType === 'counterfeit_product'
                ? 'নকল পণ্য'
                : 'ভোক্তা অধিকার লঙ্ঘন'}
            </span>
          </div>

          <div className="p-3 rounded bg-[#F4F6F5] border border-[#D9E0DC]">
            <span className="text-[#64716A] block">{language === 'bn' ? 'দাবিকৃত ক্রয়মূল্য' : 'Amount'}</span>
            <span className="font-mono font-bold text-[#172B3A]">
              ৳{(currentCase.claimedPurchasePriceBdt || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded bg-[#F4F6F5] border border-[#D9E0DC]">
            <span className="text-[#64716A] block">{language === 'bn' ? 'বিক্রেতা' : 'Seller'}</span>
            <span className="font-bold text-[#172B3A] truncate block">
              {currentCase.sellerName || currentCase.complaintDossier?.sellerShopName || 'অনির্ধারিত'}
            </span>
          </div>

          <div className="p-3 rounded bg-[#F4F6F5] border border-[#D9E0DC]">
            <span className="text-[#64716A] block">{language === 'bn' ? 'তামাদি সীমা (ধারা ৬০)' : 'Limitation (S.60)'}</span>
            <span className={`font-mono font-bold ${!hasLimitation ? 'text-[#64716A]' : isTimeBarred ? 'text-[#B42318]' : isExpiringSoon ? 'text-[#A96C16]' : 'text-[#176B53]'}`}>
              {!hasLimitation
                ? (language === 'bn' ? 'তারিখ দেওয়া হয়নি' : 'Date not provided')
                : isTimeBarred
                ? (language === 'bn' ? 'তামাদি উত্তীর্ণ' : 'Time Barred')
                : (language === 'bn' ? `${limitationDays} দিন বাকি` : `${limitationDays} days left`)}
            </span>
          </div>

          <div className="p-3 rounded bg-[#F4F6F5] border border-[#D9E0DC]">
            <span className="text-[#64716A] block">{language === 'bn' ? 'পরবর্তী পদক্ষেপ' : 'Next Action'}</span>
            <span className="font-bold text-[#176B53]">
              {language === 'bn' ? 'অভিযোগপত্র যাচাই' : 'Review Draft'}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STRUCTURED WORKSPACE LAYOUT (SIDE NAV ON DESKTOP)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Side Navigation */}
        <aside className="lg:col-span-3 bg-white border border-[#D9E0DC] rounded-lg p-2 space-y-1 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64716A] px-3 py-2">
            {language === 'bn' ? 'ডসিয়ার অধ্যায়' : 'Dossier Sections'}
          </div>
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-bold transition text-left ${
                  isActive
                    ? 'bg-[#EAF3F0] text-[#176B53]'
                    : 'text-[#26352E] hover:bg-[#F4F6F5]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={isActive ? 'text-[#176B53]' : 'text-[#64716A]'}>{tab.icon}</span>
                  <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition ${isActive ? 'text-[#176B53] translate-x-0.5' : 'text-[#8A9790]'}`} />
              </button>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <section className="lg:col-span-9 space-y-6">
          {/* =========================================================================
              SUB-TAB 1: SUMMARY
             ========================================================================= */}
          {activeSubTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              {/* Dispute Background */}
              <div className="bg-white border border-[#D9E0DC] rounded-lg p-6 space-y-4 shadow-sm">
                <h2 className="text-base font-bold text-[#172B3A] flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-[#176B53]" />
                  <span>{language === 'bn' ? 'বিরোধের বিবরণ ও তথ্যাবলী' : 'Dispute Background'}</span>
                </h2>

                <p className="text-xs text-[#64716A] leading-relaxed whitespace-pre-line">
                  {currentCase.complaintDossier?.factualSummaryBn ||
                    'বিরোধের বিবরণ প্রস্তুত করা হয়েছে।'}
                </p>

                <div className="pt-3 border-t border-[#E8ECE9] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64716A]">{language === 'bn' ? 'অভিযোগকারী:' : 'Complainant:'}</span>
                    <span className="font-semibold text-[#172B3A]">{currentCase.complaintDossier?.complainantName || 'অনির্ধারিত'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64716A]">{language === 'bn' ? 'অভিযুক্ত পেজ/দোকান:' : 'Accused Shop:'}</span>
                    <span className="font-semibold text-[#172B3A]">{currentCase.complaintDossier?.sellerShopName || 'অনির্ধারিত'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64716A]">{language === 'bn' ? 'লেনদেন ট্রানজেকশন:' : 'Transaction ID:'}</span>
                    <span className="font-mono font-bold text-[#176B53]">{currentCase.complaintDossier?.transactionRef || 'প্রযোজ্য নয়'}</span>
                  </div>
                </div>
              </div>

              {/* Statutory Offense Qualification */}
              <div className="bg-white border border-[#D9E0DC] rounded-lg p-6 space-y-4 shadow-sm">
                <h2 className="text-base font-bold text-[#172B3A] flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-[#176B53]" />
                  <span>{language === 'bn' ? 'আইনগত ভিত্তি ও প্রযোজ্য ধারা' : 'Statutory Basis'}</span>
                </h2>

                {currentCase.applicableViolations?.[0] ? (
                  <div className="p-4 rounded bg-[#EAF3F0] border border-[#ABCFC3] space-y-2 text-[#176B53]">
                    <span className="font-bold text-sm block">
                      {currentCase.applicableViolations[0].section}: {currentCase.applicableViolations[0].titleBn}
                    </span>
                    <p className="text-xs text-[#0E4434] leading-relaxed">
                      {currentCase.applicableViolations[0].descriptionBn}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded bg-[#EAF3F0] border border-[#ABCFC3] space-y-2 text-[#176B53]">
                    <span className="font-bold text-sm block">ধারা ৪৫: প্রতিশ্রুত পণ্য বা সেবা প্রদান না করা</span>
                    <p className="text-xs text-[#0E4434] leading-relaxed">
                      প্রদত্ত মূল্যের বিনিময়ে প্রতিশ্রুত পণ্য বা সেবা যথাযথভাবে প্রদান না করা বা প্রদানে অস্বীকৃতি।
                    </p>
                  </div>
                )}

                <div className="space-y-1 text-xs text-[#64716A]">
                  <p className="font-semibold text-[#172B3A]">আইনি উপাদানসমূহ:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>অর্থ পরিশোধের প্রমাণ (রসিদ বা স্টেটমেন্ট) বিদ্যমান।</li>
                    <li>নির্দিষ্ট সময়ের মধ্যে পণ্য সরবরাহ না করার প্রমাণ।</li>
                    <li>যোগাযোগ বিচ্ছিন্ন করা বা রিফান্ডে অস্বীকৃতি জ্ঞাপন।</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SUB-TAB 2: TIMELINE & LIMITATION
             ========================================================================= */}
          {activeSubTab === 'timeline' && (
            <div className="bg-white border border-[#D9E0DC] rounded-lg p-6 space-y-6 shadow-sm animate-fadeIn">
              <div>
                <h2 className="text-base font-bold text-[#172B3A]">
                  {language === 'bn' ? 'প্রমাণভিত্তিক কালানুক্রমিক টাইমলাইন ও তামাদি সীমা' : 'Evidence Timeline & Limitation'}
                </h2>
                <p className="text-xs text-[#64716A]">
                  {language === 'bn'
                    ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৬০ অনুযায়ী ঘটনার ৩০ ক্যালেন্ডার দিনের হিসাব।'
                    : '30-calendar-day statutory tracker computed from actual case records.'}
                </p>
              </div>

              {/* Educational notice if incident date is missing */}
              {!hasLimitation && (
                <div className="p-3.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="block font-semibold">
                      {language === 'bn' ? 'তারিখের অনিশ্চয়তা সংক্রান্ত আইনি সতর্কতা:' : 'Notice on Date Uncertainty:'}
                    </strong>
                    <p className="leading-relaxed">
                      {language === 'bn'
                        ? 'এই বিরোধে ঘটনার নির্দিষ্ট তারিখ দেওয়া হয়নি। ধারা ৬০ অনুসারে কারণ উদ্ভব হওয়ার ৩০ ক্যালেন্ডার দিনের মধ্যে লিখিত অভিযোগ দাখিল আবশ্যক। আপনি যদি কারণ উদ্ভবের সঠিক তারিখ সম্পর্কে অনিশ্চিত হন, তবে কোনো মনগড়া তারিখ গ্রহণ না করে ভোক্তা অধিদপ্তরের হটলাইনে (১৬১২১) যোগাযোগ করে পরামর্শ নিন।'
                        : 'Cause-of-action date was not provided. Under Section 60, complaints must be submitted within 30 calendar days. If uncertain, consult DNCRP helpline 16121 for official guidance.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Evidence-Driven Timeline Items */}
              <div className="relative pl-6 border-l-2 border-[#D9E0DC] space-y-6">
                {(currentCase.complaintDossier?.timeline && currentCase.complaintDossier.timeline.length > 0) ? (
                  currentCase.complaintDossier.timeline.map((ev: DisputeTimelineEvent) => (
                    <div key={ev.id} className="relative space-y-1">
                      <div
                        className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full ring-4 ring-white ${
                          ev.verified ? 'bg-[#176B53]' : 'bg-[#172B3A]'
                        }`}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-[#176B53] font-bold">{ev.dateStr}</span>
                        {ev.verified ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAF3F0] text-[#176B53] border border-[#ABCFC3]">
                            {language === 'bn' ? 'প্যাটার্ন শনাক্ত' : 'Pattern Extracted'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4F6F5] text-[#64716A] border border-[#D9E0DC]">
                            {language === 'bn' ? 'নাগরিক বিবরণ' : 'User Reported'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-[#172B3A]">
                        {language === 'bn' ? ev.titleBn : ev.titleEn}
                      </h3>
                      <p className="text-xs text-[#64716A] leading-relaxed">
                        {language === 'bn' ? ev.detailBn : ev.detailEn}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#64716A] py-4">
                    {language === 'bn' ? 'এই তথ্যটি এখনো দেওয়া হয়নি।' : 'No timeline events recorded yet.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              SUB-TAB 3: EVIDENCE FILES
             ========================================================================= */}
          {activeSubTab === 'evidence' && (
            <div className="bg-white border border-[#D9E0DC] rounded-lg p-6 space-y-4 shadow-sm animate-fadeIn">
              <h2 className="text-base font-bold text-[#172B3A] flex items-center space-x-2">
                <FolderOpen className="w-4 h-4 text-[#176B53]" />
                <span>{language === 'bn' ? 'সংযুক্ত প্রমাণাদি ও নথিপত্র' : 'Case Evidence Vault'}</span>
              </h2>

              {currentCase.evidenceItems && currentCase.evidenceItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentCase.evidenceItems.map((ev: EvidenceItem) => (
                    <div key={ev.id} className="p-4 rounded border border-[#D9E0DC] bg-[#F4F6F5] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#172B3A] truncate max-w-[200px]" title={ev.name}>
                          {ev.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white border border-[#D9E0DC]">
                          {ev.type}
                        </span>
                      </div>
                      <p className="text-[#64716A] text-[11px]">
                        স্ট্যাটাস: <strong className="text-[#172B3A]">{ev.textExtractionStatus === 'text_extracted_from_pdf' ? 'টেক্সট এক্সট্রাক্ট হয়েছে' : 'লোকাল ভল্টে সংরক্ষিত'}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#64716A]">
                  {language === 'bn' ? 'এই বিরোধে এখনো কোনো প্রমাণাদি আপলোড করা হয়নি।' : 'No evidence files uploaded for this case.'}
                </p>
              )}
            </div>
          )}

          {/* =========================================================================
              SUB-TAB 4: ACTION TASKS
             ========================================================================= */}
          {activeSubTab === 'tasks' && (
            <div className="bg-white border border-[#D9E0DC] rounded-lg p-6 space-y-4 shadow-sm animate-fadeIn">
              <h2 className="text-base font-bold text-[#172B3A] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#176B53]" />
                <span>{language === 'bn' ? 'নাগরিক করণীয় পদক্ষেপ চেকলিস্ট' : 'Action Checklist'}</span>
              </h2>

              <div className="space-y-2.5">
                {localTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTask(t.id)}
                    className="p-3.5 rounded border border-[#D9E0DC] bg-[#F4F6F5] hover:bg-white cursor-pointer transition flex items-start space-x-3 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={t.status === 'completed'}
                      onChange={() => {}}
                      className="mt-0.5 accent-[#176B53]"
                    />
                    <div className="space-y-0.5">
                      <span className={`font-bold block ${t.status === 'completed' ? 'line-through text-[#8A9790]' : 'text-[#172B3A]'}`}>
                        {language === 'bn' ? t.titleBn : t.titleEn}
                      </span>
                      <p className="text-[#64716A] text-[11px] leading-relaxed">
                        {language === 'bn' ? t.descriptionBn : t.descriptionEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              SUB-TAB 5: FINANCIAL DETAILS
             ========================================================================= */}
          {activeSubTab === 'financial' && (
            <div className="bg-white border border-[#D9E0DC] rounded-lg p-6 space-y-4 shadow-sm animate-fadeIn">
              <h2 className="text-base font-bold text-[#172B3A] flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-[#176B53]" />
                <span>{language === 'bn' ? 'আর্থিক দাবি ও সংবিধিবদ্ধ জরিমানার বিধান' : 'Financial Details'}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded bg-[#F4F6F5] border border-[#D9E0DC] space-y-1">
                  <span className="text-[#64716A] block">দাবিকৃত প্রত্যক্ষ আর্থিক ক্ষতি:</span>
                  <span className="font-mono font-bold text-xl text-[#172B3A]">
                    ৳{(currentCase.claimedPurchasePriceBdt || 0).toLocaleString()}
                  </span>
                  <p className="text-[11px] text-[#64716A]">আবেদনপত্রে সম্পূর্ণ অর্থ ফেরত চাওয়া হয়েছে।</p>
                </div>

                <div className="p-4 rounded bg-[#EAF3F0] border border-[#ABCFC3] space-y-1 text-[#176B53]">
                  <span className="block font-semibold">ধারা ৭৬(৪) সংবিধিবদ্ধ শেয়ার বিধান:</span>
                  <p className="text-xs text-[#0E4434] leading-relaxed">
                    ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৭৬(৪) অনুযায়ী অপরাধের দায়ে কোনো জরিমানা আদায় হলে, আদায়কৃত অর্থের ২৫% অভিযোগকারীকে প্রদান করা হয় (জরিমানা আদায় সাপেক্ষে)।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SUB-TAB 6: COMPLAINT DRAFT
             ========================================================================= */}
          {activeSubTab === 'complaint' && (
            <div className="animate-fadeIn">
              <ComplaintBuilder currentCase={currentCase} language={language} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
