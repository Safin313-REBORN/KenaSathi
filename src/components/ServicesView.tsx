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
  Database,
  Lock,
  Download,
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
      serviceNumber: '০১',
      serviceNumberEn: '01',
      titleBn: 'কেনাকাটার তথ্য ও প্রমাণ পর্যালোচনা',
      titleEn: 'Purchase & Evidence Inspection',
      descBn:
        'বিকাশ/নগদ পেমেন্ট স্ক্রিনশট, চালান বা চ্যাট হিস্ট্রি থেকে স্বয়ংক্রিয়ভাবে লেনদেন নম্বর (TrxID), পণ্যের বিবরণ ও বিক্রেতার প্রতিশ্রুত শর্তাবলী পৃথক করা।',
      descEn:
        'Inspect payment receipts, invoices, and chat logs to identify TrxIDs, transaction amounts, seller records, and delivery commitments.',
      requiredBn: 'পেমেন্ট রসিদ, চালান বা চ্যাটের স্ক্রিনশট/পিডিএফ এবং বিক্রেতার নাম ও মূল্য।',
      requiredEn: 'Payment receipts, PDF invoices, chat screenshots, seller name/page, and transaction amount.',
      receiveBn:
        'প্যাটার্ন শনাক্ত তথ্য (Pattern Extracted), ব্যবহারকারী রিপোর্টকৃত তথ্য (User Reported) এবং ধারা ৬০ অনুসারে ৩০ দিনের তামাদি সময়সীমা পর্যালোচনা।',
      receiveEn:
        'Pattern-extracted data, user-reported records, and Section 60 30-day statutory limitation assessment.',
      storageBn: 'তথ্য আপনার ব্রাউজারের localStorage-এ এবং মূল ফাইল IndexedDB-তে সংরক্ষিত থাকে।',
      storageEn: 'Case data in browser localStorage; binary files in IndexedDB.',
      actionLabelBn: 'পণ্য ও প্রমাণ যাচাই শুরু করুন',
      actionLabelEn: 'Start Purchase Inspection',
      action: onOpenCheckPurchase,
      icon: <FileCheck2 className="w-5 h-5 text-[#176B53]" />,
    },
    {
      id: 'complaint',
      serviceNumber: '০২',
      serviceNumberEn: '02',
      titleBn: 'কাঠামোবদ্ধ অভিযোগপত্রের খসড়া প্রস্তুত',
      titleEn: 'Structured Complaint Draft for Citizen Review',
      descBn:
        'সংগৃহীত ও পর্যালোচিত তথ্যের ভিত্তিতে জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP) বরাবর দাখিলের জন্য প্রিন্ট ও কপিযোগ্য প্রাথমিক খসড়া তৈরি।',
      descEn:
        'Generate a structured formal complaint draft for citizen review before submission to the Directorate of National Consumer Rights Protection (DNCRP).',
      requiredBn: 'অভিযোগকারীর নাম ও যোগাযোগের ঠিকানা, অভিযুক্ত বিক্রেতার তথ্য এবং সুনির্দিষ্ট ঘটনার বিবরণ।',
      requiredEn: 'Complainant contact info, respondent seller details, and structured chronological statement of facts.',
      receiveBn:
        'নাগরিক পর্যালোচনার জন্য A4 ফরম্যাটের অভিযোগপত্রের খসড়া, সংযুক্তির তালিকা এবং অফিসিয়াল ইমেইল খসড়া।',
      receiveEn:
        'Print-ready A4 complaint draft for citizen review, attached evidence index, and pre-formatted email draft.',
      storageBn: 'সম্পূর্ণ লোকালভাবে প্রক্রিয়াজাত; কোনো অ্যাকাউন্ট বা ক্লাউড সার্ভার সিঙ্ক নেই।',
      storageEn: 'Processed entirely on-device; no automated account or cloud server sync.',
      actionLabelBn: 'অভিযোগের খসড়া তৈরি করুন',
      actionLabelEn: 'Create Complaint Draft',
      action: onOpenComplaint,
      icon: <FileText className="w-5 h-5 text-[#176B53]" />,
    },
    {
      id: 'cases',
      serviceNumber: '০৩',
      serviceNumberEn: '03',
      titleBn: 'আমার বিরোধ ডসিয়ার ও টাইমলাইন',
      titleEn: 'Dispute Dossier & Case Management',
      descBn:
        'আপনার সংরক্ষিত বিরোধসমূহের বিস্তারিত রেকর্ড, ঘটনার ধারাবাহিক সময়রেখা এবং পরবর্তী আইনি করণীয় পদক্ষেপসমূহের চেকলিস্ট পর্যালোচনা।',
      descEn:
        'Manage active dispute records, review chronological timelines, track claim amounts, and follow recommended civic action checklists.',
      requiredBn: 'পূর্বে তৈরিকৃত যে কোনো বিরোধের রেকর্ড বা নতুন বিরোধ অন্তর্ভুক্তি।',
      requiredEn: 'Any previously recorded consumer dispute or new incident record.',
      receiveBn:
        'বিরোধ ডসিয়ার, ঘটনার ধারাবাহিক টাইমলাইন, আর্থিক দাবি হিসাব এবং করণীয় পদক্ষেপের তালিকা।',
      receiveEn:
        'Structured case dossier, incident timeline, monetary claim breakdown, and procedural next steps.',
      storageBn: 'কেস রেকর্ড ও টাইমলাইন ব্রাউজারের লোকাল স্টোরেজে (localStorage) সংরক্ষিত।',
      storageEn: 'Case metadata and tasks saved in local browser storage (localStorage).',
      actionLabelBn: 'সংরক্ষিত বিরোধ দেখুন',
      actionLabelEn: 'View Saved Cases',
      action: onOpenCases,
      icon: <Briefcase className="w-5 h-5 text-[#176B53]" />,
    },
    {
      id: 'documents',
      serviceNumber: '০৪',
      serviceNumberEn: '04',
      titleBn: 'প্রমাণাদি ও নথিপত্র রেজিস্টার',
      titleEn: 'Evidence & Document Register',
      descBn:
        'ব্রাউজারে সংরক্ষিত সমস্ত পেমেন্ট রসিদ, চালান ও চ্যাট স্ক্রিনশটের রেজিস্টার দেখা এবং নতুন নথি আপলোড ও পরিদর্শন করা।',
      descEn:
        'Inspect the local register of saved payment receipts, invoices, and chat screenshots with status and case association links.',
      requiredBn: 'ডিভাইসে সংরক্ষিত রসিদ বা ইমেজ/পিডিএফ ফাইল।',
      requiredEn: 'Locally stored transaction receipts, images, or PDF documents.',
      receiveBn:
        'নথিপত্রের তালিকা, এক্সট্রাকশন স্ট্যাটাস (User Reported / Pattern Extracted) এবং সংশ্লিষ্ট কেস লিংক।',
      receiveEn:
        'Tabular document register, extraction status (User Reported / Pattern Extracted), and case links.',
      storageBn: 'প্রমাণের মূল বাইনারি ফাইলসমূহ ব্রাউজারের নিজস্ব IndexedDB ডাটাবেজে সংরক্ষিত।',
      storageEn: 'Original evidence files stay in browser IndexedDB; browser storage is not an encrypted vault.',
      actionLabelBn: 'সংরক্ষিত নথিপত্র দেখুন',
      actionLabelEn: 'Open Document Register',
      action: onOpenDocuments,
      icon: <FolderOpen className="w-5 h-5 text-[#176B53]" />,
    },
    {
      id: 'guide',
      serviceNumber: '০৫',
      serviceNumberEn: '05',
      titleBn: 'ভোক্তা অধিকার আইন ও সরকারি দপ্তর নির্দেশিকা',
      titleEn: 'Consumer Rights Guide & Government Directory',
      descBn:
        'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর মূল অপরাধ ও শাস্তির ধারা এবং DNCRP প্রধান কার্যালয়, জাতীয় অভিযোগ কেন্দ্র ও ৮টি বিভাগের দপ্তরের যোগাযোগসূত্র।',
      descEn:
        'Search statutory sections (40, 41, 44, 45, 50, 60, 76), DNCRP headquarters, the national complaint centre, offices across all 8 divisions, and national helplines.',
      requiredBn: 'কোনো তথ্যের প্রয়োজন নেই (উন্মুক্ত নাগরিক সেবা)।',
      requiredEn: 'No information required (public civic resource).',
      receiveBn:
        'আইনি ধারাভিত্তিক সহজ ব্যাখ্যা, শাস্তির পরিমাণ, যাচাইকৃত ফোন/ঠিকানা এবং জাতীয় হেল্পলাইন ১৬১২১, ৯৯৯ ও ১৬৬৯৯।',
      receiveEn:
        'Plain-language statutory guides, penalty metrics, verified office contacts, and helplines 16121, 999, 16699.',
      storageBn: 'স্থির তথ্য নির্দেশিকা; ডিভাইসের কোনো স্টোরেজ ব্যবহারের প্রয়োজন নেই।',
      storageEn: 'Static reference directory; requires no local device storage.',
      actionLabelBn: 'আইনি নির্দেশিকা ও হটলাইন দেখুন',
      actionLabelEn: 'Open Directory & Guide',
      action: onOpenGuide,
      icon: <BookOpen className="w-5 h-5 text-[#176B53]" />,
    },
  ];

  return (
    <div className="space-y-10 animate-fadeIn max-w-5xl mx-auto py-4 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="border-b border-[#DDE4DF] pb-6 space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-[#176B53]">
          <ShieldCheck className="w-4 h-4 text-[#176B53]" />
          <span>
            {language === 'bn'
              ? 'ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯ (আইন নং ২৬)'
              : 'Consumer Rights Protection Act 2009 (Act No. 26)'}
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#172B3A] tracking-tight">
          {language === 'bn' ? 'আমাদের সেবাসমূহ' : 'Public Consumer Services'}
        </h1>

        <p className="text-sm text-[#526359] max-w-3xl leading-relaxed">
          {language === 'bn'
            ? 'কেনাসাথী সাধারণ ক্রেতা ও নাগরিকদের কেনাকাটার প্রমাণাদি গুছিয়ে রাখতে, ধারা ৬০ অনুসারে ৩০ দিনের সংবিধিবদ্ধ তামাদি সময়সীমা হিসাব করতে এবং জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তরে (DNCRP) দাখিলের জন্য নাগরিক পর্যালোচনার উপযোগী নিরপেক্ষ অভিযোগপত্রের খসড়া প্রস্তুত করতে সহায়তা প্রদান করে।'
            : 'KenaSathi provides independent consumer assistance to help citizens organize purchase records, calculate Section 60 statutory limitation windows, and prepare structured complaint drafts for citizen review prior to official submission.'}
        </p>
      </div>

      {/* Services List - Clean Editorial Directory Layout */}
      <div className="divide-y divide-[#DDE4DF]">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="ks-service-row group py-5 px-4 rounded-md space-y-4 cursor-pointer"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start space-x-4">
                <span className="font-mono text-2xl font-bold text-[#526359] group-hover:text-[#176B53] transition-colors duration-fast shrink-0 mt-0.5">
                  {language === 'bn' ? srv.serviceNumber : srv.serviceNumberEn}
                </span>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-[#172B3A] group-hover:text-[#124A3B] transition-colors duration-fast">
                    {language === 'bn' ? srv.titleBn : srv.titleEn}
                  </h2>
                  <p className="text-sm text-[#526359] leading-[1.7] max-w-2xl">
                    {language === 'bn' ? srv.descBn : srv.descEn}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={srv.action}
                className="ks-btn ks-btn-primary text-sm py-2 px-5 shrink-0 font-bold self-start md:self-auto"
              >
                <span>{language === 'bn' ? srv.actionLabelBn : srv.actionLabelEn}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-standard ease-standard group-hover:translate-x-[3px]" />
              </button>
            </div>

            {/* Service Requirements and Deliverables Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 text-sm text-[#526359] pt-2 border-t border-[#DDE4DF]">
              <div>
                <span className="font-bold text-[#172B3A] block mb-0.5">
                  {language === 'bn' ? 'প্রয়োজনীয় তথ্য:' : 'Required Info:'}
                </span>
                <p className="leading-relaxed">
                  {language === 'bn' ? srv.requiredBn : srv.requiredEn}
                </p>
              </div>

              <div>
                <span className="font-bold text-[#172B3A] block mb-0.5">
                  {language === 'bn' ? 'নাগরিক যা পাবেন:' : 'Deliverable:'}
                </span>
                <p className="leading-relaxed text-[#26352E]">
                  {language === 'bn' ? srv.receiveBn : srv.receiveEn}
                </p>
              </div>

              <div>
                <span className="font-bold text-[#172B3A] block mb-0.5">
                  {language === 'bn' ? 'সংরক্ষণ স্থিতি:' : 'Storage:'}
                </span>
                <p className="leading-relaxed">
                  {language === 'bn' ? srv.storageBn : srv.storageEn}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Citizen-Facing Privacy & Local Storage Notice */}
      <div className="bg-[#F5F7F5] border border-[#DDE4DF] rounded-md p-6 space-y-4">
        <div className="flex items-center space-x-2 font-bold text-sm text-[#172B3A]">
          <Database className="w-4 h-4 text-[#176B53]" />
          <span>
            {language === 'bn'
              ? 'ডেটা প্রসেসিং, গোপনীয়তা ও ব্রাউজার স্টোরেজ বিষয়ক স্বচ্ছ তথ্য'
              : 'Data Processing, Privacy & Local Storage Architecture'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#526359]">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-[#172B3A]">
              <Lock className="w-3.5 h-3.5 text-[#176B53]" />
              <span>{language === 'bn' ? '১. লোকাল ব্রাউজার সংরক্ষণ' : '1. Local Browser Storage'}</span>
            </div>
            <p className="leading-relaxed">
              {language === 'bn'
                ? 'আপনার মামলার মেটাডাটা, বিবরণ ও কার্যক্রম ব্রাউজারের localStorage-এ এবং আপলোডকৃত রসিদ বা দলিলের বাইনারি ফাইল IndexedDB-তে সংরক্ষিত থাকে। ব্রাউজারের ক্যাশ ও হিস্ট্রি মুছে ফেললে এই তথ্য স্বয়ংক্রিয়ভাবে মুছে যাবে।'
                : 'Case records, narratives, and task states are stored in browser localStorage; binary document blobs are kept in IndexedDB. Clearing browser data will delete these local files.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-[#172B3A]">
              <Download className="w-3.5 h-3.5 text-[#176B53]" />
              <span>{language === 'bn' ? '২. ক্লাউড সিঙ্ক নেই (ব্যাকআপ করণীয়)' : '2. No Cloud Sync (Use JSON Backup)'}</span>
            </div>
            <p className="leading-relaxed">
              {language === 'bn'
                ? 'কেনাসাথীতে কোনো কেন্দ্রীয় অ্যাকাউন্ট বা ক্লাউড ডেটাবেস নেই। ভিন্ন ডিভাইস বা ব্রাউজারে কেস দেখতে হলে "JSON ব্যাকআপ এক্সপোর্ট" সুবিধা ব্যবহার করে ফাইলটি নিজের কাছে সংরক্ষণ করুন।'
                : 'There is currently no account-based cloud synchronization. To move cases across devices, use the JSON Backup Export option to save your files safely.'}
            </p>
          </div>
        </div>

        <p className="text-xs text-[#526359] leading-relaxed pt-2 border-t border-[#DDE4DF]">
          {language === 'bn'
            ? 'সতর্কতা: ব্রাউজার স্টোরেজ কোনো এনক্রিপ্টেড ভল্ট নয়। পাবলিক সাইবার ক্যাফে বা যৌথ ডিভাইসে ব্যবহারের পর আপনার কেস এক্সপোর্ট করে ব্রাউজার থেকে মুছে ফেলা উচিত। ঐচ্ছিক ক্লাউড এআই ব্যবহার করার সময় কেবল ব্যবহারকারীর স্পষ্টভাবে সম্মতি দেওয়া ফাইলই বাহ্যিক মডেল প্রসেসরে পাঠানো হয়।'
            : 'Notice: Local browser storage is not an encrypted vault. On shared devices, export your records and clear cases after use. Optional cloud AI only transmits files that the user explicitly selects and consents to.'}
        </p>
      </div>

      {/* Statutory Guidance & Legal Limitation Notice */}
      <div className="bg-white border border-[#DDE4DF] rounded-md p-6 text-xs text-[#526359] space-y-2">
        <div className="flex items-center space-x-2 font-bold text-[#172B3A]">
          <AlertCircle className="w-4 h-4 text-amber-700" />
          <span>
            {language === 'bn'
              ? 'সংবিধিবদ্ধ আইনি তামাদি সতর্কতা (ধারা ৬০)'
              : 'Statutory Limitation Notice (Section 60)'}
          </span>
        </div>
        <p className="leading-relaxed">
          {language === 'bn'
            ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৬০ অনুসারে, কোনো অপরাধ বা প্রতারণার কারণ উদ্ভব হওয়ার অনধিক ৩০ (ত্রিশ) ক্যালেন্ডার দিনের মধ্যে জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তরে অভিযোগ দায়ের করতে হবে। কেনাসাথী কর্তৃক প্রস্তুতকৃত অভিযোগপত্র নাগরিকের পর্যালোচনার জন্য একটি কাঠামোবদ্ধ নিরপেক্ষ খসড়া। এটি চূড়ান্ত করতে প্রিন্ট বা কপি করে ডিএনসিআরপির অফিসিয়াল পোর্টালে (ccms.dncrp.com) বা ইমেইলে (nccc@dncrp.gov.bd) দাখিল করতে হবে।'
            : 'Under Section 60 of the Consumer Rights Protection Act 2009, complaints must be submitted within 30 calendar days from the date the cause of action arose. Complaint drafts generated by KenaSathi are structured drafts for citizen review, which citizens may submit directly through official DNCRP channels.'}
        </p>
      </div>
    </div>
  );
};
