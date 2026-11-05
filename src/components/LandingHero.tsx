import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  PhoneCall,
  Scale,
  ChevronDown,
  ExternalLink,
  Shield,
  Clock,
  CheckCircle2,
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
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const landing = landingRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || document.documentElement.dataset.reduceMotion === 'true';
    if (!landing || reduceMotion || !('IntersectionObserver' in window)) return;

    const sections = Array.from(landing.querySelectorAll<HTMLElement>(':scope > section')).slice(1);
    sections.forEach((section) => section.classList.add('ks-scroll-reveal'));
    landing.classList.add('ks-motion-ready');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      landing.classList.remove('ks-motion-ready');
      sections.forEach((section) => section.classList.remove('ks-scroll-reveal', 'is-visible'));
    };
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      qBn: 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৬০ কী এবং তামাদি কীভাবে হিসাব হয়?',
      qEn: 'What is Section 60 of CRPA 2009 and how is limitation calculated?',
      aBn: 'ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯-এর ধারা ৬০ অনুযায়ী কারণ উদ্ভব হওয়ার ৩০ দিনের মধ্যে লিখিত অভিযোগ দায়ের করতে হয়। কারণ উদ্ভবের তারিখ পরিস্থিতি অনুযায়ী নির্ধারিত হতে পারে এবং ক্রয়ের তারিখের সঙ্গে সবসময় এক নাও হতে পারে। ৩০ দিন পার হলে ধারা ৬০ অনুযায়ী অভিযোগ গ্রহণযোগ্য নয়। তারিখ নিয়ে অনিশ্চয়তা থাকলে অনুমান না করে DNCRP-এর সঙ্গে দ্রুত যোগাযোগ করুন।',
      aEn: 'Section 60 of the Consumer Rights Protection Act, 2009 requires a complaint within 30 days of the cause of action. The relevant date depends on the circumstances and may differ from the purchase date. After 30 days, a complaint is not acceptable under Section 60. If the date is unclear, do not guess; contact DNCRP promptly.',
    },
    {
      qBn: 'ধারা ৭৬(৪) এর ২৫% অর্থ কি সরাসরি ক্ষতিপূরণ হিসেবে পাওয়া যায়?',
      qEn: 'Is the 25% share under Section 76(4) guaranteed compensation?',
      aBn: 'না। ধারা ৭৬(৩) অনুযায়ী অভিযোগ প্রমাণিত হলে মহাপরিচালক বা ক্ষমতাপ্রাপ্ত কর্মকর্তা কর্তৃক আরোপিত প্রশাসনিক জরিমানা বাস্তবে আদায় হওয়ার পর (upon actual realization) ধারা ৭৬(৪) অনুযায়ী আদায়কৃত জরিমানার ২৫% অভিযোগকারীকে প্রদান করা হয়। এটি কোনো আগাম নিশ্চিত ক্ষতিপূরণ নয়; সম্পূর্ণভাবে সরকারি কর্মকর্তা কর্তৃক জরিমানা আদায়ের ওপর নির্ভরশীল।',
      aEn: 'No. Under Section 76(4), after an inquiry proves the complaint and an administrative fine is imposed by the Director General or an empowered officer under Section 76(3), 25% of that fine is payable to the complainant only when actually realized. It is strictly contingent upon physical realization, not upfront guaranteed compensation.',
    },
    {
      qBn: 'কেনাসাথীতে আপলোডকৃত প্রমাণাদি কোথায় সংরক্ষিত থাকে?',
      qEn: 'Where is uploaded evidence stored in KenaSathi?',
      aBn: 'আপনার আপলোডকৃত ফাইল ব্রাউজারের IndexedDB-তে থাকে। ক্লাউড এআই বেছে নিলে এবং সম্মতি দিলে, শুধু নির্বাচিত ফাইল ও প্রয়োজনীয় তথ্য Google-এ পাঠানো হয়। কিছু ফোন নম্বর, এনআইডি ও ইমেইল-ধাঁচের তথ্য লেখার মধ্যে মাস্ক করা হয়; ছবির ভেতরের তথ্য মাস্ক নাও হতে পারে।',
      aEn: 'Uploaded files stay in browser IndexedDB unless you choose Cloud AI, consent, and select files to send to Google. Some phone, NID, and email-like patterns are masked in text; information visible inside images may not be.',
    },
    {
      qBn: 'কেনাসাথী কি জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তরের সরকারি পোর্টাল?',
      qEn: 'Is KenaSathi an official government website?',
      aBn: 'না। কেনাসাথী একটি স্বাধীন ডিজিটাল ভোক্তা-সহায়তা সেবা। এটি জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP) বা কোনো সরকারি প্রতিষ্ঠানের অফিসিয়াল ওয়েবসাইট নয়। তবে এটি নাগরিকদের ডিএনসিআরপির নির্ধারিত আইনি কাঠামোর সাথে সংগতিপূর্ণ অভিযোগপত্র তৈরিতে সহায়তা করে।',
      aEn: 'No. KenaSathi is an independent consumer assistance platform. It is not an official government website. However, it helps citizens prepare structured complaint drafts conforming to statutory standards under CRPA 2009.',
    },
  ];

  return (
    <div ref={landingRef} className="space-y-16 py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* =========================================================================
          SECTION 1 — EDITORIAL HERO (OPEN COMPOSITION, NO GIANT CARD WRAPPER)
         ========================================================================= */}
      <section className="pt-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Pure Editorial Typography */}
          <div className="lg:col-span-7 space-y-6 ks-hero-copy">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-[#176B53]">
              <Shield className="w-4 h-4 text-[#176B53]" />
              <span>
                {language === 'bn'
                  ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ সহায়িকা'
                  : 'Consumer Rights Protection Act 2009 Guidance'}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold text-[#172B3A] tracking-tight leading-[1.25]">
                {language === 'bn'
                  ? 'আপনার কেনাকাটা, আপনার অধিকার।'
                  : 'Your Purchase. Your Consumer Rights.'}
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-[#176B53] leading-snug">
                {language === 'bn'
                  ? 'সঠিক তথ্য জানুন। প্রয়োজনীয় প্রমাণ গুছিয়ে নিন।'
                  : 'Know the Facts. Organize Your Evidence.'}
              </p>
            </div>

            <p className="text-base sm:text-lg text-[#526359] leading-[1.75] max-w-2xl">
              {language === 'bn'
                ? 'কেনাসাথী আপনাকে কেনাকাটার তথ্য সংরক্ষণ, ভোক্তা অধিকার সম্পর্কে জানা এবং প্রয়োজনীয় অভিযোগপত্রের খসড়া প্রস্তুত করতে সহায়তা করে।'
                : 'KenaSathi assists citizens under the Consumer Rights Protection Act 2009 with evidence organization, Section 60 statutory limitation tracking, and formal complaint draft preparation.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateTab) {
                    onNavigateTab('services');
                  } else {
                    onLaunchInspector();
                  }
                }}
                className="ks-btn ks-btn-primary group px-6 py-3 font-bold shadow-sm"
              >
                <span>{language === 'bn' ? 'সেবা গ্রহণ করুন' : 'Explore Services'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-standard ease-standard group-hover:translate-x-[3px]" />
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
                className="ks-btn ks-btn-secondary px-6 py-3 font-bold"
              >
                <Scale className="w-4 h-4 text-[#176B53]" />
                <span>{language === 'bn' ? 'ভোক্তা অধিকার জানুন' : 'Consumer Rights Guide'}</span>
              </button>
            </div>

            <div className="pt-3 flex items-center space-x-6 text-xs text-[#526359] border-t border-[#DDE4DF]">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#176B53]" />
                <span>{language === 'bn' ? 'ব্রাউজারে স্থানীয় সংরক্ষণ' : 'Local Browser Storage'}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-[#176B53]" />
                <span>{language === 'bn' ? 'ধারা ৬০ তামাদি গণনা' : 'Section 60 Calculation'}</span>
              </span>
            </div>
          </div>

          {/* Right Column: Authentic Illustrative Document Preparation Preview */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#DDE4DF] hover:border-[#C2CDC6] transition-colors duration-fast rounded-md shadow-sm p-6 relative ks-hero-preview">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE4DF]">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#176B53]" />
                  <span className="text-xs font-bold text-[#172B3A] uppercase tracking-wider font-mono">
                    {language === 'bn' ? 'অভিযোগপত্র খসড়া রূপরেখা' : 'Draft Complaint Outline'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#526359] bg-[#F5F7F5] px-2.5 py-1 rounded">
                  {language === 'bn' ? 'দৃষ্টান্তমূলক রূপরেখা' : 'Illustrative Template'}
                </span>
              </div>

              {/* Document Mockup Body */}
              <div className="mt-4 space-y-3.5 text-xs text-[#526359]">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#172B3A] block">
                    {language === 'bn' ? 'বরাবর:' : 'To:'}
                  </span>
                  <p className="bg-[#F5F7F5] p-2.5 rounded text-[#26352E]">
                    {language === 'bn'
                      ? 'মহাপরিচালক, জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর'
                      : 'Director General, Directorate of National Consumer Rights Protection'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#172B3A] block">
                    {language === 'bn' ? 'বিষয়:' : 'Subject:'}
                  </span>
                  <p className="text-[#26352E] font-medium leading-relaxed">
                    {language === 'bn'
                      ? 'ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯ অনুসারে মিথ্যা প্রতিশ্রুতি ও পণ্য সরবরাহ না করার প্রতিকার চেয়ে আবেদন।'
                      : 'Complaint under Consumer Rights Protection Act 2009 regarding non-delivery and deceptive practice.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-[#F5F7F5]">
                    <span className="text-[#526359] block">{language === 'bn' ? 'সংযুক্ত প্রমাণাদি:' : 'Evidence:'}</span>
                    <strong className="text-[#26352E] block">{language === 'bn' ? 'পেমেন্ট রসিদ ও চ্যাট' : 'Receipt & Chat Log'}</strong>
                  </div>
                  <div className="p-2.5 rounded bg-[#EAF3EE]">
                    <span className="text-[#176B53] block">{language === 'bn' ? 'আইনি তামাদি:' : 'Statutory Limit:'}</span>
                    <strong className="text-[#176B53] block">{language === 'bn' ? 'ধারা ৬০ (৩০ দিন)' : 'Section 60 (30 Days)'}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#DDE4DF] flex items-center justify-between text-xs">
                  <span className="text-[#526359]">
                    {language === 'bn' ? 'স্বাক্ষর: অভিযোগকারী নাগরিক' : 'Signature: Complainant Citizen'}
                  </span>
                  <button
                    onClick={() => (onOpenNewDispute ? onOpenNewDispute() : onLaunchInspector())}
                    className="text-[#176B53] hover:text-[#124A3B] font-bold inline-flex items-center space-x-1 min-h-[44px] group"
                  >
                    <span>{language === 'bn' ? 'আপনার খসড়া তৈরি করুন' : 'Start Your Draft'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-standard ease-standard group-hover:translate-x-[3px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — IMPORTANT PUBLIC ASSISTANCE (INSTITUTIONAL STRIP)
         ========================================================================= */}
      <section className="bg-[#172B3A] text-white rounded-md p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#233F54] gap-4">
          <div>
            <div className="text-xs text-[#ABCFC3] font-bold uppercase tracking-wider mb-1">
              {language === 'bn' ? 'সরকারি জরুরি সেবা ও হেল্পলাইন' : 'Official Emergency & Hotlines'}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              {language === 'bn'
                ? 'জাতীয় ভোক্তা হেল্পলাইন ও প্রাতিষ্ঠানিক সহায়তা'
                : 'National Consumer Rights Helplines'}
            </h2>
            <p className="text-xs text-[#ABCFC3] mt-1">
              {language === 'bn'
                ? 'সরকারি সেবাসমূহ কেনাসাথী থেকে সম্পূর্ণ স্বাধীন ও স্বতন্ত্র।'
                : 'Official statutory bodies operate independently of KenaSathi.'}
            </p>
          </div>
          <a
            href="tel:16121"
            className="ks-btn bg-[#176B53] hover:bg-[#124A3B] text-white text-sm font-bold px-5 py-2.5 rounded shrink-0 self-start lg:self-auto group"
          >
            <PhoneCall className="w-4 h-4 transition-transform duration-standard group-hover:scale-110" />
            <span>{language === 'bn' ? 'সরাসরি হটলাইন: ১৬১২১' : 'Direct Call 16121'}</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-xs">
          <div className="p-4 rounded bg-[#12212D] border border-transparent hover:border-[#176B53] transition-colors duration-fast">
            <span className="text-[#ABCFC3] block font-medium">{language === 'bn' ? 'ভোক্তা অধিকার হটলাইন' : 'DNCRP Helpline'}</span>
            <span className="font-mono font-bold text-2xl text-white block mt-1">16121</span>
            <p className="text-xs text-[#ABCFC3] mt-1">
              {language === 'bn' ? 'ডিএনসিআরপির সরাসরি সরকারি সেবা' : 'Official consumer helpline'}
            </p>
          </div>

          <div className="p-4 rounded bg-[#12212D] border border-transparent hover:border-amber-400/50 transition-colors duration-fast">
            <span className="text-[#ABCFC3] block font-medium">{language === 'bn' ? 'জাতীয় জরুরি সেবা' : 'National Emergency'}</span>
            <span className="font-mono font-bold text-2xl text-amber-300 block mt-1">999</span>
            <p className="text-xs text-[#ABCFC3] mt-1">
              {language === 'bn' ? 'পুলিশ ও জরুরি সহায়তা (২৪/৭)' : 'Police, ambulance & fire (24/7)'}
            </p>
          </div>

          <div className="p-4 rounded bg-[#12212D] border border-transparent hover:border-emerald-400/50 transition-colors duration-fast">
            <span className="text-[#ABCFC3] block font-medium">{language === 'bn' ? 'জাতীয় আইনগত সহায়তা হেল্পলাইন' : 'National Legal Aid Helpline'}</span>
            <span className="font-mono font-bold text-2xl text-emerald-300 block mt-1">16699</span>
            <p className="text-xs text-[#ABCFC3] mt-1">
              {language === 'bn' ? 'টোল-ফ্রি' : 'Toll-Free'}
            </p>
          </div>

          <div className="p-4 rounded bg-[#12212D] border border-transparent hover:border-[#176B53] transition-colors duration-fast">
            <span className="text-[#ABCFC3] block font-medium">{language === 'bn' ? 'অফিসিয়াল সিসিএমএস পোর্টাল' : 'Official CCMS Portal'}</span>
            <a
              href="https://ccms.dncrp.com/"
              target="_blank"
              rel="noreferrer"
              className="text-white hover:text-[#ABCFC3] flex items-center space-x-1 font-bold text-base mt-1 min-h-[44px] inline-flex items-center group"
            >
              <span className="font-mono">ccms.dncrp.com</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#ABCFC3] transition-transform duration-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <p className="text-xs text-[#ABCFC3] mt-1">
              {language === 'bn' ? 'অনলাইন অভিযোগ দাখিল ব্যবস্থা' : 'Official complaints portal'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 — SERVICES DIRECTORY (TYPOGRAPHIC DIRECTORY WITH DIVIDERS)
         ========================================================================= */}
      <section className="space-y-6">
        <div className="border-b border-[#DDE4DF] pb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#176B53]">
            {language === 'bn' ? 'নাগরিক সেবাসমূহ' : 'Civic Services'}
          </div>
          <h2 className="text-2xl font-bold text-[#172B3A] mt-1">
            {language === 'bn' ? 'আমাদের সেবাসমূহ' : 'Available Services'}
          </h2>
          <p className="text-sm text-[#526359] mt-1">
            {language === 'bn'
              ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ অনুসারে আপনার অধিকার রক্ষায় সহায়ক কার্যপ্রণালী।'
              : 'Structured workflows to protect consumer interests under CRPA 2009.'}
          </p>
        </div>

        <div className="divide-y divide-[#DDE4DF]">
          {/* Service 01 */}
          <div className="ks-service-row group py-5 px-4 rounded flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer">
            <div className="flex items-start space-x-5">
              <span className="font-mono font-bold text-3xl text-[#526359] group-hover:text-[#176B53] transition-colors duration-fast shrink-0 mt-0.5">
                ০১
              </span>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#172B3A] group-hover:text-[#124A3B] transition-colors duration-fast">
                  {language === 'bn'
                    ? '০১ — কেনাকাটার প্রমাণ পর্যালোচনা'
                    : '01 — Organize Purchase Evidence'}
                </h3>
                <p className="text-sm text-[#526359] max-w-2xl leading-[1.7]">
                  {language === 'bn'
                    ? 'বিকাশ, নগদ বা ব্যাংক পেমেন্ট রসিদ, মেমো ও চ্যাট সংরক্ষণ এবং ধারা ৬০ অনুযায়ী ৩০ দিনের সংবিধিবদ্ধ তামাদি যাচাই।'
                    : 'Verify transaction slips, invoices, and ensure compliance with Section 60 30-day deadlines.'}
                </p>
                <div className="text-xs text-[#526359] flex items-center space-x-4 pt-1">
                  <span>{language === 'bn' ? 'প্রয়োজনীয় তথ্য: রসিদ/TrxID' : 'Requires: Receipt/TrxID'}</span>
                  <span>•</span>
                  <span>{language === 'bn' ? 'ফলাফল: প্রমাণ ডসিয়ার' : 'Result: Evidence Dossier'}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => (onOpenNewDispute ? onOpenNewDispute() : onLaunchInspector())}
              className="ks-btn ks-btn-primary text-sm py-2 px-5 shrink-0 self-start md:self-auto font-bold"
            >
              <span>{language === 'bn' ? 'শুরু করুন' : 'Start'}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-standard ease-standard group-hover:translate-x-[3px]" />
            </button>
          </div>

          {/* Service 02 */}
          <div className="ks-service-row group py-5 px-4 rounded flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer">
            <div className="flex items-start space-x-5">
              <span className="font-mono font-bold text-3xl text-[#526359] group-hover:text-[#176B53] transition-colors duration-fast shrink-0 mt-0.5">
                ০২
              </span>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#172B3A] group-hover:text-[#124A3B] transition-colors duration-fast">
                  {language === 'bn'
                    ? '০২ — অভিযোগের তথ্য গুছিয়ে নেওয়া'
                    : '02 — Compile Case Chronology'}
                </h3>
                <p className="text-sm text-[#526359] max-w-2xl leading-[1.7]">
                  {language === 'bn'
                    ? 'ঘটনার ধারাবাহিক তারিখভিত্তিক টাইমলাইন তৈরি এবং বিক্রেতার যোগাযোগের বিবরণ গুছিয়ে রাখা।'
                    : 'Compile accurate factual chronology, communication history, and merchant records.'}
                </p>
                <div className="text-xs text-[#526359] flex items-center space-x-4 pt-1">
                  <span>{language === 'bn' ? 'প্রয়োজনীয় তথ্য: বিক্রেতার বিবরণ' : 'Requires: Seller Details'}</span>
                  <span>•</span>
                  <span>{language === 'bn' ? 'ফলাফল: ধারাবাহিক বিবরণ' : 'Result: Case Timeline'}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('cases')}
              className="ks-btn ks-btn-secondary text-sm py-2 px-5 shrink-0 self-start md:self-auto font-bold"
            >
              <span>{language === 'bn' ? 'মামলা ডসিয়ার' : 'View Cases'}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-standard ease-standard group-hover:translate-x-[3px]" />
            </button>
          </div>

          {/* Service 03 */}
          <div className="ks-service-row group py-5 px-4 rounded flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer">
            <div className="flex items-start space-x-5">
              <span className="font-mono font-bold text-3xl text-[#526359] group-hover:text-[#176B53] transition-colors duration-fast shrink-0 mt-0.5">
                ০৩
              </span>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#172B3A] group-hover:text-[#124A3B] transition-colors duration-fast">
                  {language === 'bn'
                    ? '০৩ — অভিযোগপত্রের খসড়া তৈরি'
                    : '03 — Draft Complaint Letter'}
                </h3>
                <p className="text-sm text-[#526359] max-w-2xl leading-[1.7]">
                  {language === 'bn'
                    ? 'ডিএনসিআরপিতে দাখিলের উপযোগী আনুষ্ঠানিক অভিযোগের A4 খসড়া প্রস্তুত ও প্রমাণ সংযুক্তির তালিকা তৈরি।'
                    : 'Generate a structured formal complaint draft for citizen review before submission to DNCRP.'}
                </p>
                <div className="text-xs text-[#526359] flex items-center space-x-4 pt-1">
                  <span>{language === 'bn' ? 'প্রয়োজনীয় তথ্য: ক্ষতিপূরণ দাবি' : 'Requires: Claim Details'}</span>
                  <span>•</span>
                  <span>{language === 'bn' ? 'ফলাফল: A4 প্রিন্ট উপযোগী খসড়া' : 'Result: A4 Printable Draft'}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('services')}
              className="ks-btn ks-btn-primary text-sm py-2 px-5 shrink-0 self-start md:self-auto font-bold"
            >
              <span>{language === 'bn' ? 'খসড়া প্রস্তুত করুন' : 'Create Draft'}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-standard ease-standard group-hover:translate-x-[3px]" />
            </button>
          </div>

          {/* Service 04 */}
          <div className="ks-service-row group py-5 px-4 rounded flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer">
            <div className="flex items-start space-x-5">
              <span className="font-mono font-bold text-3xl text-[#526359] group-hover:text-[#176B53] transition-colors duration-fast shrink-0 mt-0.5">
                ০৪
              </span>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#172B3A] group-hover:text-[#124A3B] transition-colors duration-fast">
                  {language === 'bn'
                    ? '০৪ — ভোক্তা অধিকার নির্দেশিকা'
                    : '04 — Consumer Rights Guide'}
                </h3>
                <p className="text-sm text-[#526359] max-w-2xl leading-[1.7]">
                  {language === 'bn'
                    ? 'আইনি ধারাসমূহ, জরিমানা ও শাস্তির বিধান এবং DNCRP প্রধান কার্যালয়, জাতীয় অভিযোগ কেন্দ্র ও ৮টি বিভাগের দপ্তরের যোগাযোগসূত্র।'
                    : 'Statutory provisions, penalties, and contact links for DNCRP headquarters, the national complaint centre, and offices across all 8 divisions.'}
                </p>
                <div className="text-xs text-[#526359] flex items-center space-x-4 pt-1">
                  <span>{language === 'bn' ? 'প্রয়োজনীয় তথ্য: কোনো তথ্য প্রয়োজন নেই' : 'Requires: None'}</span>
                  <span>•</span>
                  <span>{language === 'bn' ? 'ফলাফল: সরকারি দপ্তর ও আইন সহায়িকা' : 'Result: Statutory Knowledge Base'}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('guide')}
              className="ks-btn ks-btn-secondary text-sm py-2 px-5 shrink-0 self-start md:self-auto font-bold"
            >
              <span>{language === 'bn' ? 'নির্দেশিকা দেখুন' : 'View Guide'}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-standard ease-standard group-hover:translate-x-[3px]" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 — HOW IT WORKS (CLEAN 3-STEP JOURNEY)
         ========================================================================= */}
      <section className="bg-white border border-[#DDE4DF] rounded-md p-6 sm:p-10 space-y-8">
        <div className="border-b border-[#DDE4DF] pb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#176B53]">
            {language === 'bn' ? 'কার্যপ্রণালী' : 'Workflow'}
          </div>
          <h2 className="text-2xl font-bold text-[#172B3A] mt-1">
            {language === 'bn' ? 'সেবা ব্যবহারের নিয়ম' : 'How It Works'}
          </h2>
          <p className="text-sm text-[#526359] mt-1">
            {language === 'bn'
              ? 'তথ্য দিন → প্রমাণ গুছিয়ে নিন → খসড়া প্রস্তুত করুন'
              : 'Enter Information → Organize Evidence → Prepare Complaint Draft'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <span className="font-mono text-sm font-bold text-[#176B53] bg-[#EAF3EE] px-2.5 py-1 rounded inline-block">
              ০১
            </span>
            <h3 className="font-bold text-base text-[#172B3A]">
              {language === 'bn' ? 'তথ্য দিন' : 'Provide Information'}
            </h3>
            <p className="text-sm text-[#526359] leading-relaxed">
              {language === 'bn'
                ? 'ক্রয়কৃত পণ্যের বিবরণ, বিক্রেতার নাম ও পেজ, পরিশোধিত মূল্য এবং ঘটনার স্পষ্ট তারিখ প্রদান করুন।'
                : 'Enter item details, merchant credentials, payment amount, and incident date.'}
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-mono text-sm font-bold text-[#176B53] bg-[#EAF3EE] px-2.5 py-1 rounded inline-block">
              ০২
            </span>
            <h3 className="font-bold text-base text-[#172B3A]">
              {language === 'bn' ? 'প্রমাণ গুছিয়ে নিন' : 'Organize Evidence'}
            </h3>
            <p className="text-sm text-[#526359] leading-relaxed">
              {language === 'bn'
                ? 'পেমেন্ট রসিদ ও চ্যাট স্ক্রিনশট থেকে TrxID শনাক্ত করুন এবং ধারা ৬০ অনুযায়ী ৩০ দিনের তামাদি পরীক্ষা করুন।'
                : 'Verify payment slips and calculate Section 60 30-day statutory limitations.'}
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-mono text-sm font-bold text-[#176B53] bg-[#EAF3EE] px-2.5 py-1 rounded inline-block">
              ০৩
            </span>
            <h3 className="font-bold text-base text-[#172B3A]">
              {language === 'bn' ? 'খসড়া প্রস্তুত করুন' : 'Draft Complaint'}
            </h3>
            <p className="text-sm text-[#526359] leading-relaxed">
              {language === 'bn'
                ? 'প্রস্তুতকৃত আনুষ্ঠানিক অভিযোগপত্রটি প্রিন্ট বা কপি করে ডিএনসিআরপির অফিসিয়াল মাধ্যমে দাখিল করুন।'
                : 'Review, copy, or print the structured draft for submission through official DNCRP channels.'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5 — STATUTORY INFORMATION (ONE COHESIVE EDITORIAL SECTION)
         ========================================================================= */}
      <section className="bg-[#F5F7F5] border border-[#DDE4DF] rounded-md p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#DDE4DF] pb-3">
          <h2 className="text-xl font-bold text-[#172B3A]">
            {language === 'bn' ? 'গুরুত্বপূর্ণ সংবিধিবদ্ধ তথ্য ও আইনি নির্দেশনা' : 'Statutory Notices & Guidance'}
          </h2>
          <p className="text-xs text-[#526359] mt-0.5">
            {language === 'bn'
              ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর আওতায় নাগরিক সুরক্ষামূলক নির্দেশিকা।'
              : 'Key statutory rules under the Consumer Rights Protection Act 2009.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#526359]">
          <div className="space-y-1.5">
            <strong className="text-[#172B3A] block font-bold">
              {language === 'bn' ? '১. আইনি তামাদি সময়সীমা (ধারা ৬০):' : '1. Limitation Period (Section 60):'}
            </strong>
            <p className="leading-relaxed">
              {language === 'bn'
                ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৬০ অনুযায়ী বিরোধের কারণ ঘটার সর্বোচ্চ ৩০ ক্যালেন্ডার দিনের মধ্যে লিখিত অভিযোগ দাখিল করতে হবে। ৩০ দিন অতিক্রান্ত হলে কোনো অভিযোগ গ্রহণ করা হবে না।'
                : 'Complaints must be filed within 30 calendar days of the cause of action. No complaints will be entertained after 30 calendar days.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <strong className="text-[#172B3A] block font-bold">
              {language === 'bn' ? '২. সহায়ক প্রমাণাদি:' : '2. Helpful Supporting Records:'}
            </strong>
            <p className="leading-relaxed">
              {language === 'bn'
                ? 'প্রাসঙ্গিক নথি থাকলে পেমেন্ট রসিদ (বিকাশ/নগদ/ব্যাংক TrxID), ইনভয়েস ও বিক্রেতার সঙ্গে কথোপকথনের কপি গুছিয়ে রাখুন। দাখিলের নিয়ম DNCRP-এর সঙ্গে যাচাই করুন।'
                : 'Keep relevant records such as payment receipts, invoices, and seller communications. Confirm filing requirements with DNCRP.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <strong className="text-[#172B3A] block font-bold">
              {language === 'bn' ? '৩. তথ্যের গোপনীয়তা ও সুরক্ষা:' : '3. Privacy & Client-Side Storage:'}
            </strong>
            <p className="leading-relaxed">
              {language === 'bn'
                ? 'আপনার ফাইল ব্রাউজারের IndexedDB-তে থাকে। ক্লাউড এআই বেছে নিয়ে সম্মতি দিলে শুধু নির্বাচিত ফাইল পাঠানো হয়। লেখার কিছু ফোন নম্বর, এনআইডি ও ইমেইল-ধাঁচের তথ্য মাস্ক করা হয়; ছবির ভেতরের তথ্য মাস্ক নাও হতে পারে।'
                : 'Evidence stays in browser IndexedDB. If you choose Cloud AI and consent, only selected files are sent. Some phone, NID, and email-like text patterns are masked; information visible inside images may not be.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <strong className="text-[#172B3A] block font-bold">
              {language === 'bn' ? '৪. স্বাধীন নাগরিক সেবা সংক্রান্ত সতর্কতা:' : '4. Independent Platform Notice:'}
            </strong>
            <p className="leading-relaxed">
              {language === 'bn'
                ? 'কেনাসাথী প্রদত্ত ফরম্যাটটি প্রাথমিক খসড়া। এটি কোনো সরকারি সংস্থার সরাসরি দাখিল পোর্টাল নয়। নাগরিকের পর্যালোচনার পর এটি ডিএনসিআরপির সিসিএমএস পোর্টাল বা ইমেইলে জমা দিতে হবে।'
                : 'KenaSathi is an independent civic tool. The draft must be reviewed by the citizen before submission to the official DNCRP CCMS portal.'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6 — FAQ ACCORDION
         ========================================================================= */}
      <section className="bg-white border border-[#DDE4DF] rounded-md p-6 sm:p-8 space-y-4">
        <div className="border-b border-[#DDE4DF] pb-3">
          <h2 className="text-xl font-bold text-[#172B3A]">
            {language === 'bn' ? 'সাধারণ জিজ্ঞাসা (FAQ)' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs text-[#526359] mt-0.5">
            {language === 'bn'
              ? 'আইনি সময়সীমা, ধারা ৭৬(৪)-এ জরিমানা আদায়ের পর প্রাপ্য অর্থ এবং তথ্যের সুরক্ষা বিষয়ে সাধারণ প্রশ্নের উত্তর।'
              : 'Answers to common questions about statutory deadlines, the conditional Section 76(4) share after a fine is collected, and data privacy.'}
          </p>
        </div>

        <div className="divide-y divide-[#DDE4DF]">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full text-left py-2 flex items-center justify-between text-sm font-semibold text-[#172B3A] hover:text-[#176B53] transition-colors duration-fast min-h-[44px]"
                aria-expanded={activeFaq === idx}
              >
                <span className="pr-4">{language === 'bn' ? faq.qBn : faq.qEn}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-standard ease-standard ${
                    activeFaq === idx ? 'rotate-180 text-[#176B53]' : 'text-[#526359]'
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="pt-1 pb-2 text-sm text-[#526359] leading-[1.75] animate-fadeIn">
                  {language === 'bn' ? faq.aBn : faq.aEn}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7 — DEMO PREVIEW SCENARIO (EXPLICIT DEMO FOR TESTING/EXPLORATION)
         ========================================================================= */}
      <section className="bg-white border border-[#DDE4DF] rounded-md p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DDE4DF] gap-2">
          <div>
            <span className="ks-badge ks-badge-neutral mb-1.5">
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
            <span className="text-xs text-[#526359] block">
              {language === 'bn' ? 'আইনি ধারা লঙ্ঘন:' : 'Statutory Violation:'}
            </span>
            <span className="text-sm font-bold text-[#176B53] font-mono">
              ভোক্তা অধিকার ধারা ৪৫
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded bg-[#F5F7F5] space-y-1">
            <span className="text-[#526359] block">নমুনা TrxID:</span>
            <strong className="font-mono text-[#172B3A] text-sm">BK9X81729L</strong>
            <p className="text-xs text-[#526359]">উৎস: bKash_Receipt.png (নমুনা)</p>
          </div>

          <div className="p-3.5 rounded bg-[#F5F7F5] space-y-1">
            <span className="text-[#526359] block">পরিশোধিত ক্রয়মূল্য:</span>
            <strong className="font-mono text-[#172B3A] text-sm">৳৮,৫০০ BDT</strong>
            <p className="text-xs text-[#526359]">প্রতিশ্রুত ডেলিভারি: ৩ দিন</p>
          </div>

          <div className="p-3.5 rounded bg-[#EAF3EE] space-y-1">
            <span className="text-[#176B53] block font-semibold">ধারা ৬০ তামাদি হিসাব:</span>
            <strong className="text-[#176B53] text-sm block">ঘটনা থেকে ৩০ দিন কার্যকর</strong>
            <p className="text-xs text-[#124A3B]">তামাদি পর্যবেক্ষণ প্রযোজ্য</p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-[#526359] gap-3">
          <span>
            {language === 'bn'
              ? 'এটি একটি পরীক্ষামূলক নমুনা যা সিস্টেমের কার্যপদ্ধতি প্রদর্শনের জন্য রাখা হয়েছে।'
              : 'This is a demonstration preset to illustrate system capabilities.'}
          </span>
          <button
            type="button"
            onClick={() => onLaunchInspector('case_headphone_nondelivery')}
            className="ks-btn ks-btn-secondary text-xs px-4 py-2 font-bold"
          >
            <span>{language === 'bn' ? 'নমুনা বিরোধ পর্যালোচনা করুন' : 'Explore Demo Case'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
