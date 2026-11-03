import React from 'react';
import {
  FileCheck2,
  FileText,
  FolderOpen,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

interface ServicesViewProps {
  language: 'bn' | 'en';
  onOpenCheckPurchase: () => void;
  onOpenComplaint: () => void;
  onOpenCases: () => void;
  onOpenDocuments: () => void;
  onOpenGuide: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  language,
  onOpenCheckPurchase,
  onOpenComplaint,
  onOpenCases,
  onOpenDocuments,
  onOpenGuide,
}) => {
  const services = [
    {
      id: 'audit',
      titleBn: '১. কেনাকাটার তথ্য ও প্রমাণ যাচাই',
      titleEn: '1. Purchase & Evidence Audit',
      descBn:
        'বিকাশ/নগদ পেমেন্ট রসিদ, চ্যাট স্ক্রিনশট ও চালান বিশ্লেষণ করে TrxID, বিক্রেতার বিবরণ এবং প্রতিশ্রুত ডেলিভারি শর্তাবলী শনাক্ত করা।',
      descEn:
        'Audit bKash/Nagad receipts, messenger conversations, and invoices to extract TrxIDs, seller records, and delivery promises.',
      requiredBn: 'পেমেন্ট রসিদ/স্ক্রিনশট বা পিডিএফ চালান, বিক্রেতার নাম ও পরিশোধিত অর্থের পরিমাণ।',
      requiredEn: 'Payment receipts, chat screenshots, seller name/page, and paid transaction amount.',
      receiveBn: 'যাচাইকৃত তথ্যের তালিকা, তারিখ হিসাব এবং ভোক্তা অধিকার ধারা ৬০ অনুসারে ৩০ দিনের তামাদি প্রতিবেদন।',
      receiveEn: 'Verified fact record, incident timeline, and Section 60 30-day statutory limitation report.',
      modeBn: 'ব্রাউজারে লোকাল ডিটারমিনিস্টিক রুলস ইঞ্জিন (ব্যবহারকারীর সম্মতি সাপেক্ষে ঐচ্ছিক ক্লাউড এআই)।',
      modeEn: 'Local in-browser deterministic rules engine (optional external AI upon explicit consent).',
      actionLabelBn: 'পণ্য ও প্রমাণ যাচাই শুরু করুন',
      actionLabelEn: 'Start Purchase Inspection',
      action: onOpenCheckPurchase,
      icon: <FileCheck2 className="w-5 h-5 text-[#176B53]" />,
    },
    {
      id: 'complaint',
      titleBn: '২. অভিযোগপত্রের আনুষ্ঠানিক খসড়া প্রস্তুত',
      titleEn: '2. Formal Complaint Draft Builder',
      descBn:
        'সংগৃহীত প্রমাণের ভিত্তিতে জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP) বরাবর দাখিলের উপযোগী কাঠামোবদ্ধ আনুষ্ঠানিক অভিযোগপত্রের খসড়া তৈরি।',
      descEn:
        'Prepare Schedule-A compliant, structured formal complaint drafts for citizen review before submitting to DNCRP.',
      requiredBn: 'অভিযোগকারীর নাম, যোগাযোগের তথ্য, অভিযুক্ত বিক্রেতার বিবরণ ও সুনির্দিষ্ট ঘটনার বিবরণ।',
      requiredEn: 'Complainant contact info, respondent seller details, and structured statement of facts.',
      receiveBn: 'A4 ফরম্যাটের প্রিন্ট ও কপিযোগ্য নিরপেক্ষ অভিযোগপত্র, সংযুক্তি তালিকা এবং অফিসিয়াল ইমেইল খসড়া।',
      receiveEn: 'Print-ready A4 complaint draft, validated attachment register, and pre-filled mail draft.',
      modeBn: 'সম্পূর্ণ লোকাল ও ব্যক্তিগত ডেটা সুরক্ষিত রেখে তাৎক্ষণিক খসড়া তৈরি।',
      modeEn: '100% private local generation without transmitting personal identity details.',
      actionLabelBn: 'অভিযোগের খসড়া তৈরি করুন',
      actionLabelEn: 'Create Complaint Draft',
      action: onOpenComplaint,
      icon: <FileText className="w-5 h-5 text-[#176B53]" />,
    },
    {
      id: 'cases',
      titleBn: '৩. আমার বিরোধ ডসিয়ার',
      titleEn: '3. My Case Dossier',
      descBn:
        'আপনার সংরক্ষিত বিরোধসমূহের বিস্তারিত রেকর্ড, ঘটনার ধারাবাহিক টাইমলাইন এবং করণীয় পদক্ষেপসমূহের চেকলিস্ট পর্যালোচনা।',
      descEn:
        'Review your active case dossiers, chronological timeline events, and statutory action checklists.',
      requiredBn: 'পূর্বে তৈরিকৃত যে কোনো বিরোধের তথ্য।',
      requiredEn: 'Any previously created dispute record.',
      receiveBn: 'পূর্ণাঙ্গ কেস ডসিয়ার, টাইমলাইন, আর্থিক দাবি হিসাব এবং করণীয় কাজের তালিকা।',
      receiveEn: 'Structured case dossier, timeline, claim summary, and step-by-step resolution tasks.',
      modeBn: 'ব্রাউজারের নিজস্ব IndexedDB ভল্টে সম্পূর্ণ ব্যক্তিগত সংরক্ষণ।',
      modeEn: 'Locally stored in browser IndexedDB without cloud exposure.',
      actionLabelBn: 'সংরক্ষিত বিরোধ দেখুন',
      actionLabelEn: 'View Saved Cases',
      action: onOpenCases,
      icon: <Briefcase className="w-5 h-5 text-[#176B53]" />,
    },
    {
      id: 'documents',
      titleBn: '৪. প্রমাণাদি ও নথিপত্র ভল্ট',
      titleEn: '4. Evidence & Document Vault',
      descBn:
        'ব্রাউজারে সংরক্ষিত সমস্ত পেমেন্ট রসিদ, চালান ও চ্যাট স্ক্রিনশটের রেজিস্টার দেখা এবং নতুন নথি আপলোড করা।',
      descEn:
        'Inspect all archived payment receipts, PDF invoices, and chat logs stored in your local browser vault.',
      requiredBn: 'ডিভাইসে সংরক্ষিত রসিদ বা নথি।',
      requiredEn: 'Locally stored evidence items and transaction artifacts.',
      receiveBn: 'নথিপত্রের সুবিন্যস্ত তালিকা, এক্সট্রাকশন স্ট্যাটাস এবং সংশ্লিষ্ট কেসের লিংক।',
      receiveEn: 'Tabular document register, extraction status, and case association links.',
      modeBn: 'ডিভাইসের নিজস্ব IndexedDB তে নিরাপদ সংরক্ষণ।',
      modeEn: 'Isolated securely in client-side IndexedDB.',
      actionLabelBn: 'সংরক্ষিত নথিপত্র দেখুন',
      actionLabelEn: 'Open Document Vault',
      action: onOpenDocuments,
      icon: <FolderOpen className="w-5 h-5 text-[#176B53]" />,
    },
    {
      id: 'guide',
      titleBn: '৫. ভোক্তা অধিকার আইন ও সরকারি ডিরেক্টরি',
      titleEn: '5. Consumer Rights Guide & Directory',
      descBn:
        'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর প্রধান প্রধান অপরাধ ও শাস্তির ধারা এবং সারা দেশের সরকারি কার্যালয়ের হেল্পলাইন ও ঠিকানা অনুসন্ধান।',
      descEn:
        'Explore statutory provisions (Sections 40, 41, 44, 45, 50, 60, 76) and national consumer protection offices across Bangladesh.',
      requiredBn: 'কোনো তথ্যের প্রয়োজন নেই (উন্মুক্ত নাগরিক সেবা)।',
      requiredEn: 'No information required (open public educational resource).',
      receiveBn: 'আইনি ধারাভিত্তিক সহজ ব্যাখ্যা, শাস্তির পরিমাণ এবং জাতীয় হেল্পলাইন ১৬১২১ এর সরাসরি যোগাযোগ।',
      receiveEn: 'Plain-language statutory guides, penalty metrics, and official 16121 contact directory.',
      modeBn: 'উন্মুক্ত নাগরিক তথ্য ও অফলাইন রেফারেন্স।',
      modeEn: 'Open public information resource and verified institutional directory.',
      actionLabelBn: 'আইনি নির্দেশিকা ও হটলাইন দেখুন',
      actionLabelEn: 'Open Legal Guide & Helpline',
      action: onOpenGuide,
      icon: <BookOpen className="w-5 h-5 text-[#176B53]" />,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto py-2">
      {/* Top Banner */}
      <div className="bg-white border border-[#D9E0DC] p-6 sm:p-8 rounded-lg space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-[#176B53] px-2.5 py-1 rounded bg-[#EAF3F0] border border-[#ABCFC3]">
          <ShieldCheck className="w-4 h-4 text-[#176B53]" />
          <span>{language === 'bn' ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯' : 'Consumer Rights Protection Act 2009'}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B3A] tracking-tight">
          {language === 'bn' ? 'আমাদের সেবাসমূহ' : 'Public Consumer Services'}
        </h1>

        <p className="text-sm text-[#64716A] max-w-3xl leading-relaxed">
          {language === 'bn'
            ? 'কেনাসাথী সাধারণ নাগরিক ও ক্রেতাদের কেনাকাটার তথ্য সংরক্ষণ, ধারা ৬০ অনুসারে ৩০ দিনের আইনি সময়সীমা নিশ্চিতকরণ এবং ডিএনসিআরপিতে দাখিলের জন্য নিরপেক্ষ অভিযোগের খসড়া প্রস্তুত করতে সহায়তা প্রদান করে।'
            : 'KenaSathi provides independent consumer assistance to help citizens organize purchase records, calculate Section 60 statutory limitation windows, and prepare structured complaint drafts for official submission.'}
        </p>
      </div>

      {/* Services List */}
      <div className="space-y-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-white border border-[#D9E0DC] rounded-lg p-6 space-y-5 hover:border-[#176B53] transition shadow-sm"
          >
            {/* Service Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8ECE9]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded bg-[#EAF3F0] border border-[#ABCFC3] flex items-center justify-center shrink-0">
                  {srv.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#172B3A]">
                    {language === 'bn' ? srv.titleBn : srv.titleEn}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={srv.action}
                className="ks-btn ks-btn-primary text-xs py-2 px-4 shrink-0 font-bold self-start sm:self-auto"
              >
                <span>{language === 'bn' ? srv.actionLabelBn : srv.actionLabelEn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-[#26352E] leading-relaxed">
              {language === 'bn' ? srv.descBn : srv.descEn}
            </p>

            {/* 3 Detail Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded bg-[#F4F6F5] border border-[#D9E0DC] space-y-1">
                <span className="font-bold text-[#172B3A] block">
                  {language === 'bn' ? 'প্রয়োজনীয় তথ্য:' : 'Required Information:'}
                </span>
                <p className="text-[#64716A] leading-relaxed">
                  {language === 'bn' ? srv.requiredBn : srv.requiredEn}
                </p>
              </div>

              <div className="p-3.5 rounded bg-[#F4F6F5] border border-[#D9E0DC] space-y-1">
                <span className="font-bold text-[#172B3A] block">
                  {language === 'bn' ? 'নাগরিক যা পাবেন:' : 'What You Receive:'}
                </span>
                <p className="text-[#64716A] leading-relaxed">
                  {language === 'bn' ? srv.receiveBn : srv.receiveEn}
                </p>
              </div>

              <div className="p-3.5 rounded bg-[#F4F6F5] border border-[#D9E0DC] space-y-1">
                <span className="font-bold text-[#172B3A] block">
                  {language === 'bn' ? 'প্রসেসিং ও ডেটা মোড:' : 'Processing & Privacy Mode:'}
                </span>
                <p className="text-[#64716A] leading-relaxed">
                  {language === 'bn' ? srv.modeBn : srv.modeEn}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statutory Guidance & Legal Boundary Notice */}
      <div className="bg-[#F4F6F5] border border-[#D9E0DC] rounded-lg p-5 sm:p-6 text-xs text-[#64716A] space-y-3">
        <div className="flex items-center space-x-2 font-bold text-[#172B3A]">
          <AlertCircle className="w-4 h-4 text-[#A96C16]" />
          <span>{language === 'bn' ? 'গুরুত্বপূর্ণ সংবিধিবদ্ধ আইনি সতর্কতা' : 'Statutory Notice & Procedural Guidance'}</span>
        </div>
        <p className="leading-relaxed">
          {language === 'bn'
            ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৬০ অনুসারে, কোনো অপরাধ বা প্রতারণার কারণ ঘটার সর্বোচ্চ ৩০ (ত্রিশ) ক্যালেন্ডার দিনের মধ্যে জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তরে অভিযোগ দায়ের করতে হবে। কেনাসাথী প্রস্তুতকৃত অভিযোগপত্র নাগরিকের পর্যালোচনা ও সহায়তার জন্য প্রস্তুতকৃত প্রাথমিক খসড়া। নাগরিকগণ এটি প্রিন্ট বা কপি করে ডিএনসিআরপির অফিসিয়াল পোর্টালে (ccms.dncrp.com) বা ইমেইলে (nccc@dncrp.gov.bd) দাখিল করতে পারবেন।'
            : 'Under Section 60 of the Consumer Rights Protection Act 2009, complaints must be lodged within 30 calendar days from the date the cause of action arose. Drafts prepared by KenaSathi are citizen-review drafts for reference, which citizens may submit directly through official DNCRP channels.'}
        </p>
      </div>
    </div>
  );
};
