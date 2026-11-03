import React, { useState } from 'react';
import {
  ArrowRight,
  FileCheck2,
  FileText,
  PhoneCall,
  Scale,
  AlertCircle,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface LandingHeroProps {
  language: 'bn' | 'en';
  onLaunchInspector: (scenarioKey?: string) => void;
  onNavigateTab?: (tab: 'services' | 'documents' | 'guide' | 'cases') => void;
  onOpenDirectory?: () => void;
  onOpenNewDispute?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  language,
  onLaunchInspector,
  onNavigateTab,
  onOpenDirectory,
  onOpenNewDispute,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      qBn: 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৬০ কী?',
      qEn: 'What is Section 60 of the Consumer Rights Protection Act 2009?',
      aBn: 'ধারা ৬০ অনুসারে কোনো পণ্য বা সেবা নিয়ে প্রতারণার কারণ ঘটার সর্বোচ্চ ৩০ (ত্রিশ) ক্যালেন্ডার দিনের মধ্যে মহাপরিচালক বা অনুমোদিত কর্মকর্তার নিকট লিখিত অভিযোগ দাখিল করতে হবে। ৩০ ক্যালেন্ডার দিন অতিক্রান্ত হলে আইন অনুযায়ী কোনো কর্মকর্তা অভিযোগ গ্রহণ করবেন না।',
      aEn: 'Under Section 60, written complaints must be filed with the Director General or authorized officer within 30 calendar days from the date the cause of action arose. Complaints filed after 30 calendar days cannot be entertained under the law.',
    },
    {
      qBn: 'ধারা ৭৬(৪) এর ২৫% অর্থ কি সরাসরি ক্ষতিপূরণ হিসেবে পাওয়া যায়?',
      qEn: 'Is the 25% reward under Section 76(4) direct compensation?',
      aBn: 'না। ধারা ৭৬(৪) অনুযায়ী অপরাধের দায়ে আরোপিত প্রশাসনিক জরিমানা সংশ্লিষ্ট কর্মকর্তা বা নির্বাহী ম্যাজিস্ট্রেট কর্তৃক আদায়ের পর (upon actual realization) আদায়কৃত জরিমানার ২৫% অভিযোগকারীকে প্রদান করা হয়। এটি কোনো নিশ্চিত আগাম ক্ষতিপূরণ বা ব্যবসায়িক আয় নয়।',
      aEn: 'No. Under Section 76(4), 25% of any administrative fine actually realized by an authorized officer or magistrate is payable to the complainant. It is strictly contingent upon fine realization, not guaranteed upfront compensation.',
    },
    {
      qBn: 'কেনাসাথীতে আপলোডকৃত প্রমাণাদি কোথায় সংরক্ষিত থাকে?',
      qEn: 'Where is uploaded evidence stored in KenaSathi?',
      aBn: 'আপনার আপলোডকৃত রসিদ, ছবি ও নথিপত্র আপনার ব্রাউজারের নিজস্ব IndexedDB স্টোরেজে সংরক্ষিত থাকে। আপনার স্পষ্ট সম্মতি ছাড়া কোনো ফাইল বাহ্যিক সার্ভারে পাঠানো হয় না এবং স্বয়ংক্রিয়ভাবে ক্লায়েন্ট সাইডেই ফোন নম্বর ও এনআইডি মাস্কিং করা হয়।',
      aEn: 'Your uploaded receipts and documents are stored locally in your browser IndexedDB. No files are transmitted to external cloud services without your explicit consent, and sensitive personal identifiers are masked locally.',
    },
    {
      qBn: 'কেনাসাথী কি জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তরের সরকারি পোর্টাল?',
      qEn: 'Is KenaSathi an official government website?',
      aBn: 'না। কেনাসাথী একটি স্বাধীন ডিজিটাল ভোক্তা-সহায়তা সেবা। এটি জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP) বা কোনো সরকারি প্রতিষ্ঠানের অফিসিয়াল ওয়েবসাইট নয়। তবে এটি নাগরিকদের ডিএনসিআরপির নির্ধারিত আইনি কাঠামোর সাথে সংগতিপূর্ণ অভিযোগপত্র তৈরিতে সহায়তা করে।',
      aEn: 'No. KenaSathi is an independent consumer assistance platform. It is not an official government website. However, it helps citizens prepare structured complaint drafts conforming to statutory standards under CRPA 2009.',
    },
  ];

  return (
    <div className="space-y-12 py-2 animate-fadeIn max-w-6xl mx-auto">
      {/* =========================================================================
          SECTION A — HOMEPAGE INTRODUCTION (2-COLUMN INSTITUTIONAL LAYOUT)
         ========================================================================= */}
      <section className="bg-white border border-[#D9E0DC] rounded-lg p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline and Call-to-Action */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[#EAF3F0] text-[#176B53] text-xs font-bold border border-[#ABCFC3]">
              <ShieldCheck className="w-4 h-4 text-[#176B53]" />
              <span>{language === 'bn' ? 'ভোক্তা অধিকার সহায়তা' : 'Consumer Rights Assistance'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#172B3A] tracking-tight leading-snug">
              {language === 'bn'
                ? 'ভোক্তা অধিকার সম্পর্কে জানুন, প্রয়োজনীয় প্রমাণ গুছিয়ে নিন।'
                : 'Know Your Rights. Organize Your Evidence.'}
            </h1>

            <p className="text-sm sm:text-base text-[#64716A] leading-relaxed max-w-xl">
              {language === 'bn'
                ? 'কেনাসাথী আপনাকে কেনাকাটার তথ্য ও প্রমাণ সংরক্ষণ, ভোক্তা অধিকার সম্পর্কে জানা এবং অভিযোগের খসড়া প্রস্তুত করতে সহায়তা করে।'
                : 'KenaSathi assists citizens under the Consumer Rights Protection Act 2009 with evidence organization, statutory limitation tracking, and formal complaint draft preparation.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateTab) {
                    onNavigateTab('services');
                  } else {
                    onLaunchInspector();
                  }
                }}
                className="ks-btn ks-btn-primary px-5 py-2.5 font-bold shadow-sm"
              >
                <span>{language === 'bn' ? 'সেবা গ্রহণ করুন' : 'Explore Services'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateTab) {
                    onNavigateTab('guide');
                  } else if (onOpenDirectory) {
                    onOpenDirectory();
                  }
                }}
                className="ks-btn ks-btn-secondary px-5 py-2.5 font-bold"
              >
                <Scale className="w-4 h-4 text-[#176B53]" />
                <span>{language === 'bn' ? 'ভোক্তা অধিকার জানুন' : 'Consumer Rights Guide'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Restrained Service Navigation Panel */}
          <div className="lg:col-span-5 bg-[#F4F6F5] border border-[#D9E0DC] rounded-lg p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#172B3A] border-b border-[#D9E0DC] pb-2">
              {language === 'bn' ? 'প্রধান নাগরিক সেবাসমূহ' : 'Core Public Services'}
            </div>

            <div
              onClick={() => (onOpenNewDispute ? onOpenNewDispute() : onLaunchInspector())}
              className="p-3 bg-white rounded border border-[#D9E0DC] hover:border-[#176B53] cursor-pointer transition space-y-1 group"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-[#172B3A] group-hover:text-[#176B53]">
                <FileCheck2 className="w-4 h-4 text-[#176B53]" />
                <span>১. কেনাকাটার তথ্য ও প্রমাণ যাচাই</span>
              </div>
              <p className="text-[11px] text-[#64716A] leading-relaxed">
                {language === 'bn'
                  ? 'বিকাশ TrxID, মেমো ও চ্যাট সংরক্ষণ এবং ধারা ৬০ অনুযায়ী ৩০ দিনের তামাদি যাচাই।'
                  : 'Verify payment slips, chat logs, and calculate Section 60 30-day deadlines.'}
              </p>
            </div>

            <div
              onClick={() => onNavigateTab && onNavigateTab('cases')}
              className="p-3 bg-white rounded border border-[#D9E0DC] hover:border-[#176B53] cursor-pointer transition space-y-1 group"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-[#172B3A] group-hover:text-[#176B53]">
                <FolderOpen className="w-4 h-4 text-[#176B53]" />
                <span>২. অভিযোগের তথ্য গুছিয়ে নেওয়া</span>
              </div>
              <p className="text-[11px] text-[#64716A] leading-relaxed">
                {language === 'bn'
                  ? 'ঘটনার ধারাবাহিক টাইমলাইন তৈরি এবং বিক্রেতার যোগাযোগের বিবরণ গুছিয়ে রাখা।'
                  : 'Compile event chronology, communication history, and financial facts.'}
              </p>
            </div>

            <div
              onClick={() => onNavigateTab && onNavigateTab('services')}
              className="p-3 bg-white rounded border border-[#D9E0DC] hover:border-[#176B53] cursor-pointer transition space-y-1 group"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-[#172B3A] group-hover:text-[#176B53]">
                <FileText className="w-4 h-4 text-[#176B53]" />
                <span>৩. অভিযোগপত্রের খসড়া প্রস্তুত</span>
              </div>
              <p className="text-[11px] text-[#64716A] leading-relaxed">
                {language === 'bn'
                  ? 'ডিএনসিআরপিতে দাখিলের উপযোগী কাঠামোবদ্ধ আনুষ্ঠানিক অভিযোগের খসড়া তৈরি।'
                  : 'Generate Schedule-A compliant structured complaint drafts for citizen review.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION B — জরুরি ভোক্তা সহায়তা (PUBLIC RESOURCES & HELPLINES)
         ========================================================================= */}
      <section className="bg-[#172B3A] text-white rounded-lg p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#233F54] gap-3">
          <div>
            <div className="text-xs text-[#ABCFC3] font-bold uppercase tracking-wider mb-1">
              {language === 'bn' ? 'জরুরি ভোক্তা সহায়তা ও সরকারি যোগাযোগ' : 'Emergency Assistance & Hotlines'}
            </div>
            <h2 className="text-xl font-bold">
              {language === 'bn' ? 'জাতীয় ভোক্তা হেল্পলাইন ও অফিসিয়াল সেবা' : 'National Consumer Rights Helplines'}
            </h2>
          </div>
          <a
            href="tel:16121"
            className="ks-btn bg-[#176B53] hover:bg-[#135944] text-white text-xs font-bold px-4 py-2 rounded shrink-0 self-start sm:self-auto"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সরাসরি কল ১৬১২১' : 'Direct Call 16121'}</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded bg-[#11212D] border border-[#233F54] space-y-1">
            <span className="text-[#8A9790] block">{language === 'bn' ? 'ভোক্তা অধিদপ্তর হটলাইন' : 'DNCRP Hotline'}</span>
            <span className="font-mono font-bold text-lg text-[#ABCFC3]">16121</span>
            <p className="text-[11px] text-[#8A9790]">{language === 'bn' ? 'সরাসরি সরকারি অভিযোগ গ্রহণ' : 'Official government intake'}</p>
          </div>

          <div className="p-3.5 rounded bg-[#11212D] border border-[#233F54] space-y-1">
            <span className="text-[#8A9790] block">{language === 'bn' ? 'জাতীয় জরুরি সেবা' : 'National Emergency'}</span>
            <span className="font-mono font-bold text-lg text-amber-400">999</span>
            <p className="text-[11px] text-[#8A9790]">{language === 'bn' ? 'পুলিশ ও জরুরি সহায়তা' : 'Police & emergency service'}</p>
          </div>

          <div className="p-3.5 rounded bg-[#11212D] border border-[#233F54] space-y-1">
            <span className="text-[#8A9790] block">{language === 'bn' ? 'সরকারি আইনি পরামর্শ' : 'Govt Legal Aid'}</span>
            <span className="font-mono font-bold text-lg text-emerald-400">16430</span>
            <p className="text-[11px] text-[#8A9790]">{language === 'bn' ? 'বিনামূল্যে আইনি সহায়তা' : 'Toll-free legal counsel'}</p>
          </div>

          <div className="p-3.5 rounded bg-[#11212D] border border-[#233F54] space-y-1">
            <span className="text-[#8A9790] block">{language === 'bn' ? 'অফিসিয়াল সিসিএমএস পোর্টাল' : 'Official CCMS Portal'}</span>
            <a
              href="https://ccms.dncrp.com/"
              target="_blank"
              rel="noreferrer"
              className="text-[#ABCFC3] hover:underline flex items-center space-x-1 font-bold text-sm pt-0.5"
            >
              <span>ccms.dncrp.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-[11px] text-[#8A9790]">{language === 'bn' ? 'ডিএনসিআরপির সরাসরি অনলাইন পোর্টাল' : 'Official submission portal'}</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C — আমাদের সেবাসমূহ (STRUCTURED SERVICE ROWS)
         ========================================================================= */}
      <section className="space-y-4">
        <div className="border-b border-[#D9E0DC] pb-3">
          <h2 className="text-xl font-bold text-[#172B3A]">
            {language === 'bn' ? 'আমাদের সেবাসমূহ' : 'Available Services'}
          </h2>
          <p className="text-xs text-[#64716A] mt-0.5">
            {language === 'bn'
              ? 'নাগরিক স্বার্থে ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর আলোকে বিন্যস্ত সেবাসমূহ।'
              : 'Services designed to protect consumer interests under CRPA 2009.'}
          </p>
        </div>

        <div className="space-y-3">
          {/* Row 1 */}
          <div className="bg-white border border-[#D9E0DC] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#176B53] transition">
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded bg-[#EAF3F0] border border-[#ABCFC3] flex items-center justify-center shrink-0 mt-0.5">
                <FileCheck2 className="w-4 h-4 text-[#176B53]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172B3A]">
                  {language === 'bn' ? 'কেনাকাটার প্রমাণ গুছিয়ে নিন' : 'Organize Purchase Evidence'}
                </h3>
                <p className="text-xs text-[#64716A] mt-0.5 leading-relaxed">
                  {language === 'bn'
                    ? 'পেমেন্ট রসিদ, চালান, কথোপকথন ও প্রয়োজনীয় নথি এক জায়গায় সংরক্ষণ করুন।'
                    : 'Archive payment receipts, invoices, chat logs, and delivery slips in one local place.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => (onOpenNewDispute ? onOpenNewDispute() : onLaunchInspector())}
              className="ks-btn ks-btn-primary text-xs py-2 px-4 shrink-0 font-bold self-start sm:self-auto"
            >
              <span>{language === 'bn' ? 'শুরু করুন' : 'Start'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Row 2 */}
          <div className="bg-white border border-[#D9E0DC] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#176B53] transition">
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded bg-[#EAF3F0] border border-[#ABCFC3] flex items-center justify-center shrink-0 mt-0.5">
                <Scale className="w-4 h-4 text-[#176B53]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172B3A]">
                  {language === 'bn' ? 'ভোক্তা অধিকার সম্পর্কে জানুন' : 'Understand Consumer Rights'}
                </h3>
                <p className="text-xs text-[#64716A] mt-0.5 leading-relaxed">
                  {language === 'bn'
                    ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এবং প্রাসঙ্গিক আইনি বিষয়গুলো বুঝুন।'
                    : 'Explore the Consumer Rights Protection Act 2009 and essential statutory provisions.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('guide')}
              className="ks-btn ks-btn-secondary text-xs py-2 px-4 shrink-0 font-bold self-start sm:self-auto"
            >
              <span>{language === 'bn' ? 'নির্দেশিকা দেখুন' : 'View Guide'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Row 3 */}
          <div className="bg-white border border-[#D9E0DC] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#176B53] transition">
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded bg-[#EAF3F0] border border-[#ABCFC3] flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-[#176B53]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172B3A]">
                  {language === 'bn' ? 'অভিযোগের খসড়া প্রস্তুত করুন' : 'Prepare Complaint Draft'}
                </h3>
                <p className="text-xs text-[#64716A] mt-0.5 leading-relaxed">
                  {language === 'bn'
                    ? 'আপনার দেওয়া তথ্যের ভিত্তিতে একটি কাঠামোবদ্ধ অভিযোগপত্রের খসড়া তৈরি করুন।'
                    : 'Generate a structured formal complaint draft based strictly on your verified facts.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('services')}
              className="ks-btn ks-btn-primary text-xs py-2 px-4 shrink-0 font-bold self-start sm:self-auto"
            >
              <span>{language === 'bn' ? 'খসড়া তৈরি করুন' : 'Create Draft'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Row 4 */}
          <div className="bg-white border border-[#D9E0DC] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#176B53] transition">
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded bg-[#EAF3F0] border border-[#ABCFC3] flex items-center justify-center shrink-0 mt-0.5">
                <FolderOpen className="w-4 h-4 text-[#176B53]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172B3A]">
                  {language === 'bn' ? 'সংরক্ষিত নথি দেখুন' : 'View Saved Documents'}
                </h3>
                <p className="text-xs text-[#64716A] mt-0.5 leading-relaxed">
                  {language === 'bn'
                    ? 'এই ব্রাউজারে সংরক্ষিত নথি ও অভিযোগের তথ্য দেখুন।'
                    : 'Access and review locally stored receipts and dispute records in your browser.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('documents')}
              className="ks-btn ks-btn-secondary text-xs py-2 px-4 shrink-0 font-bold self-start sm:self-auto"
            >
              <span>{language === 'bn' ? 'নথিপত্র খুলুন' : 'Open Vault'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D — সেবা ব্যবহারের নিয়ম (3-STEP PROCESS)
         ========================================================================= */}
      <section className="bg-white border border-[#D9E0DC] rounded-lg p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#E8ECE9] pb-3">
          <h2 className="text-xl font-bold text-[#172B3A]">
            {language === 'bn' ? 'সেবা ব্যবহারের নিয়ম' : 'How the Service Works'}
          </h2>
          <p className="text-xs text-[#64716A] mt-0.5">
            {language === 'bn'
              ? 'সহজ তিন ধাপে আপনার কেনাকাটার অধিকার সুরক্ষা নিশ্চিত করুন।'
              : 'Follow these straightforward steps to document your claim.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded bg-[#F4F6F5] border border-[#D9E0DC] space-y-2">
            <div className="font-mono text-xs font-bold text-[#176B53] bg-[#EAF3F0] inline-block px-2 py-0.5 rounded">
              ধাপ ০১
            </div>
            <h3 className="font-bold text-sm text-[#172B3A]">
              {language === 'bn' ? '০১ — তথ্য দিন' : '01 — Provide Information'}
            </h3>
            <p className="text-xs text-[#64716A] leading-relaxed">
              {language === 'bn'
                ? 'ক্রয়কৃত পণ্যের বিবরণ, বিক্রেতার নাম বা পেজ, পরিশোধিত ক্রয়মূল্য এবং ঘটনার তারিখ প্রদান করুন।'
                : 'Enter item details, seller info, purchase price, and the exact cause-of-action date.'}
            </p>
          </div>

          <div className="p-4 rounded bg-[#F4F6F5] border border-[#D9E0DC] space-y-2">
            <div className="font-mono text-xs font-bold text-[#176B53] bg-[#EAF3F0] inline-block px-2 py-0.5 rounded">
              ধাপ ০২
            </div>
            <h3 className="font-bold text-sm text-[#172B3A]">
              {language === 'bn' ? '০২ — প্রমাণ গুছিয়ে নিন' : '02 — Organize Evidence'}
            </h3>
            <p className="text-xs text-[#64716A] leading-relaxed">
              {language === 'bn'
                ? 'বিকাশ/নগদ পেমেন্ট রসিদ, চালান বা চ্যাট স্ক্রিনশট আপলোড করে TrxID ও ডেলিভারি প্রতিশ্রুতি নিশ্চিত করুন।'
                : 'Upload payment slips, receipts, or chat logs to confirm TrxIDs and promises.'}
            </p>
          </div>

          <div className="p-4 rounded bg-[#F4F6F5] border border-[#D9E0DC] space-y-2">
            <div className="font-mono text-xs font-bold text-[#176B53] bg-[#EAF3F0] inline-block px-2 py-0.5 rounded">
              ধাপ ০৩
            </div>
            <h3 className="font-bold text-sm text-[#172B3A]">
              {language === 'bn' ? '০৩ — অভিযোগের খসড়া তৈরি করুন' : '03 — Draft Complaint'}
            </h3>
            <p className="text-xs text-[#64716A] leading-relaxed">
              {language === 'bn'
                ? 'প্রস্তুতকৃত আনুষ্ঠানিক অভিযোগপত্রটি প্রিন্ট বা কপি করে ডিএনসিআরপির অফিসিয়াল মাধ্যমে দাখিল করুন।'
                : 'Review, copy, or print the structured draft for submission through official DNCRP channels.'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION E — গুরুত্বপূর্ণ সংবিধিবদ্ধ তথ্য (FORMAL NOTICE PANEL)
         ========================================================================= */}
      <section className="bg-[#F4F6F5] border border-[#D9E0DC] rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-2 font-bold text-[#172B3A] text-sm">
          <AlertCircle className="w-4 h-4 text-[#A96C16]" />
          <span>{language === 'bn' ? 'গুরুত্বপূর্ণ সংবিধিবদ্ধ তথ্য ও সাধারণ নির্দেশনা' : 'Important Statutory Notices'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#64716A]">
          <div className="space-y-1 bg-white p-3.5 rounded border border-[#D9E0DC]">
            <strong className="text-[#172B3A] block">১. আইনি তামাদি সময়সীমা (ধারা ৬০):</strong>
            <p className="leading-relaxed">
              ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৬০ অনুযায়ী বিরোধের কারণ ঘটার সর্বোচ্চ ৩০ ক্যালেন্ডার দিনের মধ্যে লিখিত অভিযোগ দাখিল করতে হবে।
            </p>
          </div>

          <div className="space-y-1 bg-white p-3.5 rounded border border-[#D9E0DC]">
            <strong className="text-[#172B3A] block">২. প্রয়োজনীয় প্রাথমিক প্রমাণাদি:</strong>
            <p className="leading-relaxed">
              অভিযোগের সাথে পেমেন্ট রসিদ (বিকাশ/নগদ/ব্যাংক), ক্যাশ মেমো বা ইনভয়েস এবং বিক্রেতার সাথে চ্যাটের স্পষ্ট প্রমাণ সংযুক্ত করা বাধ্যতামূলক।
            </p>
          </div>

          <div className="space-y-1 bg-white p-3.5 rounded border border-[#D9E0DC]">
            <strong className="text-[#172B3A] block">৩. তথ্যের গোপনীয়তা ও সুরক্ষা:</strong>
            <p className="leading-relaxed">
              আপনার আপলোডকৃত ফাইলসমূহ ব্রাউজারের নিজস্ব IndexedDB স্টোরেজে জমা থাকে। ক্লাউড শেয়ারিংয়ের ক্ষেত্রে ফোন ও এনআইডি নম্বর স্বয়ংক্রিয়ভাবে মুছে ফেলা হয়।
            </p>
          </div>

          <div className="space-y-1 bg-white p-3.5 rounded border border-[#D9E0DC]">
            <strong className="text-[#172B3A] block">৪. অভিযোগ দাখিলের প্রক্রিয়া:</strong>
            <p className="leading-relaxed">
              কেনাসাথী প্রদত্ত ফরম্যাটটি প্রাথমিক খসড়া। নাগরিকের পর্যালোচনার পর এটি ডিএনসিআরপির সিসিএমএস পোর্টাল (ccms.dncrp.com) বা ইমেইলে পাঠাতে হবে।
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION F — সাধারণ জিজ্ঞাসা (FAQ ACCORDION)
         ========================================================================= */}
      <section className="bg-white border border-[#D9E0DC] rounded-lg p-6 sm:p-8 space-y-4">
        <div className="border-b border-[#E8ECE9] pb-3">
          <h2 className="text-xl font-bold text-[#172B3A]">
            {language === 'bn' ? 'সাধারণ জিজ্ঞাসা (FAQ)' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs text-[#64716A] mt-0.5">
            {language === 'bn'
              ? 'আইনি তামাদি, পুরস্কারের শর্তাবলী এবং তথ্যের সুরক্ষা সংক্রান্ত সাধারণ প্রশ্নের উত্তর।'
              : 'Answers to common questions regarding statutory timelines, rewards, and data privacy.'}
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-[#D9E0DC] rounded overflow-hidden">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-[#172B3A] hover:bg-[#F4F6F5] transition"
              >
                <span>{language === 'bn' ? faq.qBn : faq.qEn}</span>
                {activeFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#176B53]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64716A]" />
                )}
              </button>
              {activeFaq === idx && (
                <div className="p-4 pt-1 text-xs text-[#64716A] leading-relaxed border-t border-[#D9E0DC] bg-[#F4F6F5]/60">
                  {language === 'bn' ? faq.aBn : faq.aEn}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          OPTIONAL FICTIONAL DEMONSTRATION INSPECTION EXAMPLE
         ========================================================================= */}
      <section className="bg-white border border-[#D9E0DC] rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8ECE9] gap-2">
          <div>
            <span className="ks-badge ks-badge-neutral mb-1">
              {language === 'bn'
                ? 'দৃষ্টান্তমূলক কাল্পনিক নমুনা — লাইভ অডিট বা যাচাইকৃত প্রকৃত ঘটনা নয়'
                : 'Illustrative fictional example — not a live inspection or verified consumer case.'}
            </span>
            <h3 className="text-base font-bold text-[#172B3A]">
              {language === 'bn'
                ? 'সনি WH-1000XM5 ডেলিভারি না পাওয়ার বিরোধ'
                : 'Sony WH-1000XM5 Non-Delivery Dispute'}
            </h3>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-[#64716A] block">
              {language === 'bn' ? 'আইনি ধারা লঙ্ঘন:' : 'Statutory Violation:'}
            </span>
            <span className="text-xs font-bold text-[#176B53] font-mono">
              ভোক্তা অধিকার ধারা ৪৫
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded bg-[#F4F6F5] border border-[#D9E0DC] space-y-1">
            <span className="text-[#64716A] block">নমুনা TrxID:</span>
            <strong className="font-mono text-[#172B3A]">BK9X81729L</strong>
            <p className="text-[11px] text-[#8A9790]">উৎস: bKash_Receipt.png (নমুনা)</p>
          </div>

          <div className="p-3 rounded bg-[#F4F6F5] border border-[#D9E0DC] space-y-1">
            <span className="text-[#64716A] block">পরিশোধিত ক্রয়মূল্য:</span>
            <strong className="font-mono text-[#172B3A]">৳৮,৫০০ BDT</strong>
            <p className="text-[11px] text-[#8A9790]">প্রতিশ্রুত ডেলিভারি: ৩ দিন</p>
          </div>

          <div className="p-3 rounded bg-[#EAF3F0] border border-[#ABCFC3] space-y-1">
            <span className="text-[#176B53] block font-semibold">ধারা ৬০ তামাদি হিসাব:</span>
            <strong className="text-[#176B53]">ঘটনা থেকে ৩০ দিন কার্যকর</strong>
            <p className="text-[11px] text-[#0E4434]">তামাদি পর্যবেক্ষণ প্রযোজ্য</p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64716A] gap-3">
          <span>
            {language === 'bn'
              ? 'এটি একটি পরীক্ষামূলক নমুনা যা সিস্টেমের কার্যপদ্ধতি প্রদর্শনের জন্য রাখা হয়েছে।'
              : 'This is a demonstration preset to illustrate system capabilities.'}
          </span>
          <button
            type="button"
            onClick={() => onLaunchInspector('case_headphone_nondelivery')}
            className="ks-btn ks-btn-secondary text-xs px-3.5 py-1.5"
          >
            <span>{language === 'bn' ? 'নমুনা বিরোধ পর্যালোচনা করুন' : 'Explore Demo Case'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
