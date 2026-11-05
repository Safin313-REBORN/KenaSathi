import React, { useState, useMemo } from 'react';
import {
  Building2,
  PhoneCall,
  Mail,
  MapPin,
  Scale,
  HelpCircle,
  FileText,
  ChevronDown,
  Search,
  X,
  ExternalLink,
  AlertCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { DNCRP_OFFICES } from '../data/dncrpOffices';

interface ConsumerGuideDirectoryProps {
  language: 'bn' | 'en';
  onFileComplaint: () => void;
}

// Verified National Helplines & Emergency Resources
const NATIONAL_HELPLINES = [
  {
    code: '16121',
    titleBn: 'জাতীয় ভোক্তা অধিকার হেল্পলাইন',
    titleEn: 'National Consumer Rights Helpline',
    agencyBn: 'জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP), বাণিজ্য মন্ত্রণালয়',
    agencyEn: 'Directorate of National Consumer Rights Protection (DNCRP)',
    hoursBn: 'সার্বক্ষণিক (২৪/৭)',
    hoursEn: '24/7 Round the clock',
    sourceUrl: 'https://dncrp.gov.bd',
    verifiedDateBn: 'নভেম্বর ২০২৬',
    verifiedDateEn: 'November 2026',
    callUrl: 'tel:16121',
    noteBn: 'মোবাইল সহায়তা নম্বর ০১৭৭৭-৭৫৩৬৬৮ কার্যদিবসে অফিস চলাকালীন (সকাল ৯:০০ – বিকাল ৫:০০) প্রযোজ্য। জাতীয় হটলাইন ১৬১২১ সার্বক্ষণিক চালু।',
    noteEn: 'Mobile number 01777-753668 available working days 9:00 AM – 5:00 PM; national hotline 16121 operates 24/7.',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    code: '16699',
    titleBn: 'জাতীয় আইনগত সহায়তা হেল্পলাইন (টোল-ফ্রি)',
    titleEn: 'National Legal Aid Helpline (Toll-Free)',
    agencyBn: 'জাতীয় আইনগত সহায়তা প্রদান সংস্থা (NLASO), আইন ও বিচার বিভাগ',
    agencyEn: 'National Legal Aid Services Organization (NLASO)',
    hoursBn: 'টোল-ফ্রি',
    hoursEn: 'Toll-Free',
    sourceUrl: 'https://nlaso.gov.bd',
    verifiedDateBn: 'নভেম্বর ২০২৬ প্রজ্ঞাপন',
    verifiedDateEn: 'November 2026 Notice',
    callUrl: 'tel:16699',
    noteBn: 'জাতীয় আইনগত সহায়তা অধিদপ্তরের বিজ্ঞপ্তিতে ১৬৬৯৯ নম্বরটিকে নতুন টোল-ফ্রি হেল্পলাইন হিসেবে উল্লেখ করা হয়েছে।',
    noteEn: 'NLASO lists 16699 as its new toll-free legal aid helpline. Check NLASO for current service hours.',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    code: '999',
    titleBn: 'জাতীয় জরুরি সেবা',
    titleEn: 'National Emergency Service',
    agencyBn: 'বাংলাদেশ পুলিশ (সার্বক্ষণিক পুলিশ, ফায়ার সার্ভিস ও অ্যাম্বুলেন্স)',
    agencyEn: 'Bangladesh Police (24/7 Police, Fire, Ambulance)',
    hoursBn: 'সার্বক্ষণিক (২৪/৭)',
    hoursEn: '24/7 Round the clock',
    sourceUrl: 'https://police.gov.bd',
    verifiedDateBn: 'নভেম্বর ২০২৬',
    verifiedDateEn: 'November 2026',
    callUrl: 'tel:999',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
  },
];

const CONSUMER_FAQS = [
  {
    qBn: 'ফেসবুক পেজে অর্ডার করে নকল পণ্য পেলে বা বিক্রেতা ব্লক করে দিলে কী করব?',
    qEn: 'What should I do if a Facebook page delivers a counterfeit product and blocks me?',
    aBn: 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৪৪ ও ৪৫ অনুযায়ী মিথ্যা বিজ্ঞাপন ও প্রতিশ্রুত পণ্য সরবরাহ না করা শাস্তিযোগ্য অপরাধ। আপনার কাছে থাকা ফেসবুক পেজের স্ক্রিনশট, বিকাশ/নগদ পেমেন্ট ট্রানজেকশন আইডি এবং কুরিয়ারের চালান (Waybill) সংরক্ষণ করুন। কেনাসাথী দিয়ে ৩০ দিনের মধ্যে প্রাথমিক নালিশের খসড়া তৈরি করে ccms.dncrp.com বা nccc@dncrp.gov.bd তে দাখিল করুন।',
    aEn: 'Under Sections 44 and 45 of CRPA 2009, false advertisement and failure to deliver promised goods are punishable offenses. Preserve Facebook page screenshots, mobile wallet transaction receipts (TrxID), and courier delivery waybills. Generate a structured complaint draft on KenaSathi within 30 days and file via ccms.dncrp.com or email to nccc@dncrp.gov.bd.',
  },
  {
    qBn: 'ধারা ৭৬(৪) অনুযায়ী আদায়কৃত জরিমানার শর্তাধীন বিধান কীভাবে প্রযোজ্য হয়?',
    qEn: 'How does the conditional provision of Section 76(4) apply upon fine realization?',
    aBn: 'আইনানুযায়ী সঠিক ক্রম: ১) ক্ষতিগ্রস্ত নাগরিক কর্তৃক ধারা ৭৬(১) অনুযায়ী লিখিত অভিযোগ দাখিল। ২) ধারা ৭৬(২) অনুযায়ী মহাপরিচালক বা ক্ষমতাপ্রাপ্ত কর্মকর্তা কর্তৃক অভিযোগের অনুসন্ধান ও তদন্ত। ৩) অভিযোগ প্রমাণিত হলে ধারা ৭৬(৩) এর অধীন মহাপরিচালক বা ক্ষমতাপ্রাপ্ত কর্মকর্তা কর্তৃক প্রশাসনিক জরিমানা আরোপ। ৪) ধার্যকৃত জরিমানা বিবাদী প্রতিষ্ঠান থেকে বাস্তবে আদায় হওয়ার পর (upon actual realization) ধারা ৭৬(৪) অনুযায়ী আদায়কৃত জরিমানার ২৫% তাৎক্ষণিকভাবে অভিযোগকারীকে প্রদান করা হয় (অধিদপ্তরের কর্মকর্তা-কর্মচারী ব্যতীত)। এটি কোনো আগাম ক্ষতিপূরণ বা নিশ্চয়তা নয়; সম্পূর্ণভাবে তদন্ত প্রমাণ ও অর্থ আদায়ের ওপর নির্ভরশীল। (মূল আইন: dpp.gov.bd/upload_file/gazettes/7073_21357.pdf)',
    aEn: 'Accurate statutory sequence: 1) Written complaint is filed under Section 76(1). 2) The Director General or an empowered officer investigates the complaint under Section 76(2). 3) If proved, an administrative fine may be imposed under Section 76(3) by the Director General or empowered officer. 4) When the imposed fine is actually realized from the vendor, Section 76(4) directs 25% of that realized fine to be paid to the complainant (unless filed by an officer of the Directorate). This is not upfront compensation; it strictly depends upon official investigation and physical fine realization.',
  },
  {
    qBn: 'অভিযোগ দায়ের করার তামাদি মেয়াদ ও কারণ উদ্ভবের তারিখ কীভাবে নির্ধারিত হয়?',
    qEn: 'What is the statutory limitation period for filing a complaint under Section 60?',
    aBn: 'ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯-এর ধারা ৬০ অনুযায়ী কারণ উদ্ভব হওয়ার ৩০ দিনের মধ্যে লিখিত অভিযোগ দায়ের করতে হয়। কারণ উদ্ভবের তারিখ পরিস্থিতি অনুযায়ী নির্ধারিত হতে পারে (যেমন পণ্য ক্রয়ের তারিখ, প্রতিশ্রুত ডেলিভারি মেয়াদ অতিক্রান্ত হওয়া, অথবা ত্রুটি/প্রতারণা জানার তারিখ)। ক্রয়ের তারিখ ও কারণ উদ্ভবের তারিখ সবসময় এক নয়। কোনো তারিখ নিশ্চিত না হলে অনুমান করে তারিখ দেবেন না। ৩০ দিন পার হলে ধারা ৬০ অনুযায়ী অভিযোগ গ্রহণযোগ্য নয়। সময়সীমা বা প্রযোজ্য প্রক্রিয়া নিয়ে প্রশ্ন থাকলে DNCRP হটলাইন ১৬১২১-এ যোগাযোগ করুন; হটলাইন সময়সীমা বাড়ায় না।',
    aEn: 'Section 60 of the Consumer Rights Protection Act, 2009 requires a complaint within 30 days of the cause of action. The relevant date depends on the circumstances and may differ from the purchase date. Do not guess if the date is unclear. After 30 days, a complaint is not acceptable under Section 60. Contact DNCRP at 16121 for procedural questions; the hotline does not extend the statutory period.',
  },
  {
    qBn: 'কুরিয়ারে ক্যাশ অন ডেলিভারি (COD) পার্সেল খোলার সময় প্রমাণ সংরক্ষণের সঠিক নিয়ম কী?',
    qEn: 'What is the practical procedure for evidence preservation when receiving COD parcels?',
    aBn: 'ব্যবহারিক প্রমাণ সংরক্ষণ পরামর্শ: ডিজিটাল কমার্স পরিচালনা নির্দেশিকা ২০২১ অনুসারে ডেলিভারি ও পরিশোধের সাধারণ শর্তাবলী নির্ধারিত থাকলেও কুরিয়ার কর্মীর সামনে আনবক্সিং ভিডিও রেকর্ড করার কোনো সরাসরি সংবিধিবদ্ধ বাধ্যবাধকতা আইনে উল্লেখ নেই। তবে প্রতারণা বা ভুল পণ্য প্রমাণের জন্য পার্সেল খোলার নিরবচ্ছিন্ন ভিডিও ধারণ করা এবং প্যাকেটের গায়ের ওয়েবিল বা ট্র্যাকিং লেবেল স্পষ্ট দেখানো ক্রেতার জন্য সবচেয়ে কার্যকর ডিজিটাল প্রমাণ। কোনো গড়মিল থাকলে তাৎক্ষণিক ডেলিভারি রসিদে মন্তব্য লিখুন এবং প্রয়োজনে ডেলিভারি স্থগিত রাখুন।',
    aEn: 'Practical Evidence Preservation Guidance: While the Digital Commerce Operation Guidelines 2021 specify delivery timelines and payment conditions, there is no explicit statutory right compelling courier riders to wait for unboxing videos. However, recording an unbroken unboxing video clearly capturing the waybill label is the single most effective digital evidence for disputing damaged or counterfeit goods before DNCRP or merchant support.',
  },
];

const STATUTORY_SECTIONS = [
  {
    sec: 'ধারা ৪০ (Section 40)',
    secNum: '40',
    titleBn: 'ধার্যকৃত মূল্যের অধিক মূল্যে পণ্য বিক্রয়',
    titleEn: 'Selling goods above statutory/tagged price',
    fineBn: 'অনধিক ১ (এক) বছর কারাদণ্ড, বা অনধিক ৫০,০০০ টাকা অর্থদণ্ড, বা উভয়দণ্ড',
    fineEn: 'Up to 1 year imprisonment, or fine up to BDT 50,000, or both',
    subjectBn: 'অতিরিক্ত মূল্য, এমআরপি লঙ্ঘন, কালোবাজারি',
    subjectEn: 'Overpricing, MRP violation, price gouging',
  },
  {
    sec: 'ধারা ৪১ (Section 41)',
    secNum: '41',
    titleBn: 'ভেজাল পণ্য বা ক্ষতিকর প্রসাধন বিক্রয়',
    titleEn: 'Sale of adulterated cosmetics, food, or medicine',
    fineBn: 'অনধিক ৩ (তিন) বছর কারাদণ্ড, বা অনধিক ২,০০,০০০ টাকা অর্থদণ্ড, বা উভয়দণ্ড',
    fineEn: 'Up to 3 years imprisonment, or fine up to BDT 200,000, or both',
    subjectBn: 'ভেজাল, কসমেটিকস, মেয়াদোত্তীর্ণ প্রসাধন, খাদ্যদ্রব্য',
    subjectEn: 'Adulteration, fake cosmetics, expired products',
  },
  {
    sec: 'ধারা ৪৪ (Section 44)',
    secNum: '44',
    titleBn: 'মিথ্যা বা প্রতারণামূলক বিজ্ঞাপন',
    titleEn: 'False or deceptive advertising to consumers',
    fineBn: 'অনধিক ১ (এক) বছর কারাদণ্ড, বা অনধিক ২,০০,০০০ টাকা অর্থদণ্ড, বা উভয়দণ্ড',
    fineEn: 'Up to 1 year imprisonment, or fine up to BDT 200,000, or both',
    subjectBn: 'অনলাইন প্রতারণা, ফেসবুক পেজ মিথ্যাচার, ভুয়া প্রচার',
    subjectEn: 'False advertisement, deceptive online marketing',
  },
  {
    sec: 'ধারা ৪৫ (Section 45)',
    secNum: '45',
    titleBn: 'প্রতিশ্রুত পণ্য বা সেবা যথাযথভাবে সরবরাহ না করা',
    titleEn: 'Failure to supply promised goods or services',
    fineBn: 'অনধিক ১ (এক) বছর কারাদণ্ড, বা অনধিক ৫০,০০০ টাকা অর্থদণ্ড, বা উভয়দণ্ড',
    fineEn: 'Up to 1 year imprisonment, or fine up to BDT 50,000, or both',
    subjectBn: 'পণ্য ডেলিভারি না দেওয়া, ভুল পণ্য পাঠানো, টাকা নিয়ে যোগাযোগ বন্ধ',
    subjectEn: 'Non-delivery, wrong product delivered, blocked by seller',
  },
  {
    sec: 'ধারা ৫০ (Section 50)',
    secNum: '50',
    titleBn: 'নকল বা জাল পণ্য প্রস্তুত ও বিপণন',
    titleEn: 'Manufacturing or marketing counterfeit goods',
    fineBn: 'অনধিক ৩ (তিন) বছর কারাদণ্ড, বা অনধিক ২,০০,০০০ টাকা অর্থদণ্ড, বা উভয়দণ্ড',
    fineEn: 'Up to 3 years imprisonment, or fine up to BDT 200,000, or both',
    subjectBn: 'নকল ব্র্যান্ড, ক্লোন গ্যাজেট, কপি প্রোডাক্ট',
    subjectEn: 'Counterfeit brand, cloned electronics, fake replica',
  },
  {
    sec: 'ধারা ৬০ (Section 60)',
    secNum: '60',
    titleBn: 'অভিযোগ দায়েরের সংবিধিবদ্ধ তামাদি মেয়াদ (৩০ ক্যালেন্ডার দিন)',
    titleEn: '30-Calendar-Day Statutory Limitation Period',
    fineBn: 'কারণ উদ্ভব হওয়ার ৩০ ক্যালেন্ডার দিনের মধ্যে মহাপরিচালক বা অনুমোদিত কর্মকর্তার বরাবরে লিখিত অভিযোগ আবশ্যক',
    fineEn: 'Must file formal complaint within 30 calendar days of cause of action',
    subjectBn: 'তামাদি মেয়াদ, ৩০ দিন সময়সীমা, নালিশের শর্ত',
    subjectEn: 'Limitation period, 30 days deadline, complaint condition',
  },
  {
    sec: 'ধারা ৭৬(৪) (Section 76(4))',
    secNum: '76',
    titleBn: 'আদায়কৃত জরিমানার শর্তাধীন অংশ (ধারা ৭৬(৪))',
    titleEn: 'Conditional share upon fine realization (Section 76(4))',
    fineBn: 'ধারা ৭৬(৪) অনুযায়ী আদায়কৃত জরিমানার একটি শর্তাধীন অংশ অভিযোগকারীকে প্রদেয় হতে পারে। এটি কোনো নিশ্চিত ক্ষতিপূরণ বা অর্থপ্রাপ্তির নিশ্চয়তা নয়।',
    fineEn: 'Under Section 76(4), a conditional share of realized administrative fines may be disbursed to the complainant; this does not constitute guaranteed compensation.',
    subjectBn: 'ধারা ৭৬(৪), আদায়কৃত জরিমানা, শর্তাধীন অংশ, প্রশাসনিক জরিমানা বণ্টন',
    subjectEn: 'Section 76(4), fine realization, conditional share, penalty distribution',
  },
];

export const ConsumerGuideDirectory: React.FC<ConsumerGuideDirectoryProps> = ({
  language,
  onFileComplaint,
}) => {
  const [activeTab, setActiveTab] = useState<'offices' | 'statutes' | 'faq'>('offices');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Unicode-resilient normalization for Bengali (supports composed and decomposed য়)
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFC')
      .replace(/\u09AF\u09BC/g, '\u09DF')
      .trim();

  // Search logic across tabs
  const filteredOffices = useMemo(() => {
    if (!searchQuery.trim()) return DNCRP_OFFICES;
    const q = norm(searchQuery);
    return DNCRP_OFFICES.filter(
      (off) =>
        norm(off.nameBn).includes(q) ||
        norm(off.nameEn).includes(q) ||
        norm(off.divisionBn).includes(q) ||
        norm(off.divisionEn).includes(q) ||
        norm(off.addressBn).includes(q) ||
        norm(off.addressEn).includes(q) ||
        norm(off.phone).includes(q) ||
        norm(off.email).includes(q) ||
        norm(off.hotline).includes(q)
    );
  }, [searchQuery]);

  const filteredStatutes = useMemo(() => {
    if (!searchQuery.trim()) return STATUTORY_SECTIONS;
    const q = norm(searchQuery);
    return STATUTORY_SECTIONS.filter(
      (sec) =>
        norm(sec.sec).includes(q) ||
        norm(sec.secNum).includes(q) ||
        norm(sec.titleBn).includes(q) ||
        norm(sec.titleEn).includes(q) ||
        norm(sec.fineBn).includes(q) ||
        norm(sec.fineEn).includes(q) ||
        norm(sec.subjectBn).includes(q) ||
        norm(sec.subjectEn).includes(q)
    );
  }, [searchQuery]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return CONSUMER_FAQS;
    const q = norm(searchQuery);
    return CONSUMER_FAQS.filter(
      (faq) =>
        norm(faq.qBn).includes(q) ||
        norm(faq.qEn).includes(q) ||
        norm(faq.aBn).includes(q) ||
        norm(faq.aEn).includes(q)
    );
  }, [searchQuery]);

  const activeResultCount =
    activeTab === 'offices'
      ? filteredOffices.length
      : activeTab === 'statutes'
      ? filteredStatutes.length
      : filteredFaqs.length;

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto py-2">
      {/* 1. Top Editorial Civic Header */}
      <div className="border-b border-border pb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
              {language === 'bn'
                ? 'সরকারি দপ্তর ও ভোক্তা অধিকার নির্দেশিকা'
                : 'Government Directory & Consumer Rights Guide'}
            </span>
            <span className="ks-badge">
              {language === 'bn' ? 'স্বাধীন নাগরিক গাইড' : 'Independent Civic Resource'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
            {language === 'bn'
              ? 'ভোক্তা অধিকার আইনি নির্দেশিকা ও জাতীয় দপ্তরসমূহ'
              : 'Consumer Protection Law & National Office Directory'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            {language === 'bn'
              ? 'জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP), বাণিজ্য মন্ত্রণালয় কর্তৃক প্রজ্ঞাপিত আইন, প্রধান কার্যালয়, জাতীয় অভিযোগ কেন্দ্র ও ৮টি বিভাগের যাচাইকৃত দপ্তরসমূহ।'
              : 'Official DNCRP headquarters, national complaint centre, and verified regional offices across all 8 administrative divisions under CRPA 2009.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <a
            href="tel:16121"
            className="ks-btn ks-btn-primary min-h-[44px]"
            aria-label={language === 'bn' ? 'ভোক্তা হেল্পলাইন ১৬১২১ এ কল করুন' : 'Call Consumer Helpline 16121'}
          >
            <PhoneCall className="w-4 h-4" />
            <span>{language === 'bn' ? 'হটলাইন: ১৬১২১' : 'Hotline: 16121'}</span>
          </a>

          <button
            type="button"
            onClick={onFileComplaint}
            className="ks-btn ks-btn-secondary min-h-[44px]"
            aria-label={language === 'bn' ? 'অভিযোগের খসড়া প্রস্তুত করুন' : 'Draft Complaint'}
          >
            <FileText className="w-4 h-4 text-primary" />
            <span>{language === 'bn' ? 'অভিযোগ প্রস্তুত' : 'Draft Complaint'}</span>
          </button>
        </div>
      </div>

      {/* 2. Priority Interactive Search Bar (Immediately accessible on both mobile and desktop) */}
      <div className="bg-surface border border-border rounded-lg p-3.5 sm:p-4 space-y-2 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-ink-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="guide-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'বিভাগ, জেলা, অফিসের নাম, ফোন নম্বর বা আইনি ধারা খুঁজুন...'
                : 'Search by division, district, office name, phone, or legal section...'
            }
            className="w-full pl-9 pr-10 py-2.5 border border-border rounded text-sm focus:outline-none focus:border-primary text-ink-primary placeholder:text-ink-secondary/60 min-h-[44px]"
            aria-label={language === 'bn' ? 'ডিরেক্টরি ও ধারা অনুসন্ধান' : 'Directory & Section Search'}
          />
          {searchQuery && (
            <button
              id="guide-search-clear"
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink-primary min-h-[44px] min-w-[44px] flex items-center justify-center rounded"
              aria-label={language === 'bn' ? 'অনুসন্ধান মুছুন' : 'Clear Search'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-ink-secondary pt-0.5">
          <span>
            {searchQuery ? (
              language === 'bn' ? (
                <>
                  অনুসন্ধান ফলাফল: <strong>{activeResultCount}</strong> টি
                </>
              ) : (
                <>
                  Found: <strong>{activeResultCount}</strong> result(s)
                </>
              )
            ) : language === 'bn' ? (
              'নিচের ট্যাব থেকে দপ্তর, সংবিধিবদ্ধ আইন অথবা প্রশ্নোত্তর অনুসন্ধান করতে পারেন'
            ) : (
              'Select a tab below to browse offices, statutes, or consumer FAQs'
            )}
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-primary font-medium hover:underline text-xs min-h-[44px] inline-flex items-center px-1"
            >
              {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset search'}
            </button>
          )}
        </div>
      </div>

      {/* 3. Compact National Assistance Strip (Tap-to-call mobile friendly) */}
      <div className="bg-[#F5F7F5] border border-border rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-ink-primary">
              {language === 'bn' ? 'জাতীয় জরুরি ও ভোক্তা হেল্পলাইন' : 'National Emergency & Consumer Helplines'}
            </span>
            <span className="text-xs text-ink-secondary">
              ({language === 'bn' ? 'সরাসরি কল করতে ট্যাপ করুন' : 'Tap to call directly'})
            </span>
          </div>
          <a
            href="https://ccms.dncrp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline flex items-center gap-1 text-xs self-start sm:self-auto min-h-[44px] inline-flex items-center"
          >
            <span>{language === 'bn' ? 'অনলাইন অভিযোগ পোর্টাল (ccms.dncrp.com)' : 'Online Portal (ccms.dncrp.com)'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
          {NATIONAL_HELPLINES.map((item) => (
            <a
              key={item.code}
              href={item.callUrl}
              className="bg-surface border border-border rounded p-3 flex items-center justify-between hover:border-primary transition-colors min-h-[48px] group"
              aria-label={`${item.code} - ${language === 'bn' ? item.titleBn : item.titleEn}`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border font-mono ${item.badgeColor}`}>
                    {item.code}
                  </span>
                  <span className="font-semibold text-xs text-ink-primary group-hover:text-primary transition-colors">
                    {language === 'bn' ? item.titleBn : item.titleEn}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary truncate max-w-[200px]">
                  {language === 'bn' ? item.hoursBn : item.hoursEn}
                </p>
              </div>
              <PhoneCall className="w-4 h-4 text-primary shrink-0 opacity-70 group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </div>

      {/* 4. Section Navigation Tabs */}
      <div className="flex border-b border-border gap-2 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('offices')}
          className={`ks-btn text-xs py-2 px-4 min-h-[44px] ${
            activeTab === 'offices'
              ? 'ks-btn-primary font-bold'
              : 'ks-btn-secondary'
          }`}
          aria-pressed={activeTab === 'offices'}
        >
          <Building2 className="w-4 h-4" />
          <span>
            {language === 'bn' ? 'অধিদপ্তর ও বিভাগীয় দপ্তর' : 'Headquarters & Divisional Offices'}
          </span>
          <span className="ml-1 text-xs opacity-80">({filteredOffices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('statutes')}
          className={`ks-btn text-xs py-2 px-4 min-h-[44px] ${
            activeTab === 'statutes'
              ? 'ks-btn-primary font-bold'
              : 'ks-btn-secondary'
          }`}
          aria-pressed={activeTab === 'statutes'}
        >
          <Scale className="w-4 h-4" />
          <span>{language === 'bn' ? 'আইনি ধারা ও জরিমানা' : 'Statutory Sections & Penalties'}</span>
          <span className="ml-1 text-xs opacity-80">({filteredStatutes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`ks-btn text-xs py-2 px-4 min-h-[44px] ${
            activeTab === 'faq'
              ? 'ks-btn-primary font-bold'
              : 'ks-btn-secondary'
          }`}
          aria-pressed={activeTab === 'faq'}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{language === 'bn' ? 'সাধারণ প্রশ্নোত্তর (FAQ)' : 'Consumer FAQs'}</span>
          <span className="ml-1 text-xs opacity-80">({filteredFaqs.length})</span>
        </button>
      </div>

      {/* 5. Content: DNCRP office records */}
      {activeTab === 'offices' && (
        <div className="space-y-4 animate-fadeIn">
          {filteredOffices.length === 0 ? (
            <div className="bg-surface border border-border rounded-lg p-8 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-ink-secondary mx-auto" />
              <p className="text-sm font-semibold text-ink-primary">
                {language === 'bn' ? 'কোনো দপ্তর খুঁজে পাওয়া যায়নি' : 'No offices found'}
              </p>
              <p className="text-xs text-ink-secondary">
                {language === 'bn'
                  ? 'আপনার অনুসন্ধান শব্দ পরিবর্তন করুন অথবা ফিল্টার রিসেট করুন।'
                  : 'Try searching by a different division, city, or phone number.'}
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="ks-btn ks-btn-secondary text-xs py-1.5 px-3 mt-2 min-h-[44px]"
              >
                {language === 'bn' ? 'সম্পূর্ণ তালিকা দেখুন' : 'View All Offices'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffices.map((office) => (
                <div
                  key={office.id}
                  className={`bg-surface border rounded-lg p-5 space-y-3 flex flex-col justify-between transition-colors shadow-sm ${
                    office.isHeadquarters ? 'border-primary/50' : 'border-border'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold border ${
                          office.isHeadquarters
                            ? 'bg-emerald-50 text-primary border-emerald-200'
                            : 'bg-[#F5F7F5] text-ink-primary border-border'
                        }`}
                      >
                        {language === 'bn' ? office.divisionBn : office.divisionEn}
                      </span>
                      <span className="text-xs text-ink-secondary font-mono">
                        {language === 'bn' ? `যাচাই: ${office.lastCheckedAt}` : `Checked: ${office.lastCheckedAt}`}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-ink-primary">
                      {language === 'bn' ? office.nameBn : office.nameEn}
                    </h3>

                    <p className="text-xs text-ink-secondary font-medium">
                      {language === 'bn' ? office.officeTypeBn : office.officeTypeEn}
                    </p>

                    <div className="text-xs text-ink-primary font-medium leading-relaxed flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span>{language === 'bn' ? office.addressBn : office.addressEn}</span>
                        {(office.addressNoteBn || office.addressNoteEn) && (
                          <p className="text-xs text-[#945607] bg-[#FEF7EC] border border-[#FDE68A] p-1.5 rounded leading-normal">
                            {language === 'bn' ? office.addressNoteBn : office.addressNoteEn}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2 text-xs text-ink-secondary">
                    {/* Landline Phone */}
                    <div className="space-y-0.5">
                      <p className="flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>
                          {language === 'bn' ? 'টেলিফোন (টিএন্ডটি):' : 'Telephone:'}{' '}
                          <strong className="text-ink-primary font-mono">{office.phone}</strong>
                        </span>
                      </p>
                      {(office.phoneNoteBn || office.phoneNoteEn) && (
                        <p className="text-xs text-ink-secondary pl-5 italic">
                          {language === 'bn' ? office.phoneNoteBn : office.phoneNoteEn}
                        </p>
                      )}
                    </div>

                    {/* Official Officers Directory where available */}
                    {office.officers && office.officers.length > 0 && (
                      <div className="bg-[#F5F7F5] border border-border rounded p-2 space-y-1.5">
                        <div className="flex items-center gap-1 font-bold text-ink-primary text-xs">
                          <UserCheck className="w-3.5 h-3.5 text-primary" />
                          <span>{language === 'bn' ? 'অফিসিয়াল কর্মকর্তাবৃন্দ:' : 'Official Officers:'}</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          {office.officers.map((officer, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-ink-secondary gap-0.5">
                              <span>{language === 'bn' ? officer.roleBn : officer.roleEn}:</span>
                              <span className="font-mono text-ink-primary font-semibold">{officer.phone}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mobile & Working Hours */}
                    <p className="flex items-start gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>
                        {language === 'bn' ? 'মোবাইল সহায়তা:' : 'Mobile:'}{' '}
                        <strong className="text-ink-primary font-mono">{office.mobile}</strong>
                        {(office.mobileScheduleBn || office.mobileScheduleEn) && (
                          <span className="block text-ink-secondary">
                            ({language === 'bn' ? office.mobileScheduleBn : office.mobileScheduleEn})
                          </span>
                        )}
                      </span>
                    </p>

                    {/* Email */}
                    <p className="flex items-start gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      {office.emailVerified ? (
                        <a
                          href={`mailto:${office.email}`}
                          className="font-mono text-xs text-primary hover:underline min-h-[44px] inline-flex items-center"
                        >
                          {office.email}
                        </a>
                      ) : (
                        <span className="text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {office.email || (language === 'bn' ? 'তথ্যটি বর্তমানে নিশ্চিত করা যায়নি।' : 'Unverified')}
                        </span>
                      )}
                    </p>

                    {/* Verification Status & Source Distinction */}
                    <div className="bg-[#F5F7F5] p-2 rounded border border-border space-y-1">
                      <p className="text-xs text-ink-secondary leading-normal">
                        {language === 'bn' ? office.verificationStatusBn : office.verificationStatusEn}
                      </p>
                      {office.sourceUpdatedAt && (
                        <p className="text-xs text-ink-secondary/80 border-t border-border/60 pt-1">
                          {language === 'bn'
                            ? `উৎস প্রকাশনা: ${office.sourceUpdatedAt}`
                            : `Source Notice: ${office.sourceUpdatedAt}`}
                        </p>
                      )}
                    </div>

                    {/* Hotline & Official Link */}
                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span>
                        হটলাইন: <strong className="font-mono text-primary">{office.hotline}</strong>{' '}
                        <span className="text-ink-secondary">(২৪/৭)</span>
                      </span>
                      <a
                        href={office.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-medium min-h-[44px] inline-flex items-center"
                      >
                        <span>{language === 'bn' ? 'অফিসিয়াল সোর্স' : 'Official Source'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Content: Statutory Penal Sections */}
      {activeTab === 'statutes' && (
        <div className="space-y-3 animate-fadeIn">
          {filteredStatutes.length === 0 ? (
            <div className="bg-surface border border-border rounded-lg p-8 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-ink-secondary mx-auto" />
              <p className="text-sm font-semibold text-ink-primary">
                {language === 'bn' ? 'কোনো আইনি ধারা পাওয়া যায়নি' : 'No statutes found'}
              </p>
              <p className="text-xs text-ink-secondary">
                {language === 'bn'
                  ? 'অনুসন্ধান শব্দ পরিবর্তন করে আবার চেষ্টা করুন।'
                  : 'Try searching by section number (e.g. 45) or violation keyword.'}
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="ks-btn ks-btn-secondary text-xs py-1.5 px-3 mt-2 min-h-[44px]"
              >
                {language === 'bn' ? 'সকল ধারা দেখুন' : 'View All Sections'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStatutes.map((sec) => (
                <div
                  key={sec.secNum}
                  className="bg-surface border border-border rounded-lg p-5 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#F5F7F5] text-primary border border-border font-mono">
                      {sec.sec}
                    </span>
                    <span className="text-xs text-ink-secondary">
                      {language === 'bn' ? 'আইন ২০০৯' : 'CRPA 2009'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-ink-primary">
                    {language === 'bn' ? sec.titleBn : sec.titleEn}
                  </h3>

                  <div className="p-3 bg-red-50/70 border border-red-200/80 rounded space-y-1">
                    <p className="text-xs font-semibold text-red-900">
                      {language === 'bn' ? 'শাস্তি ও জরিমানা:' : 'Statutory Penalties:'}
                    </p>
                    <p className="text-xs text-red-950 font-medium">
                      {language === 'bn' ? sec.fineBn : sec.fineEn}
                    </p>
                  </div>

                  <p className="text-xs text-ink-secondary pt-1 flex items-center gap-1">
                    <span className="font-medium text-ink-primary">
                      {language === 'bn' ? 'প্রাসঙ্গিক বিষয়:' : 'Keywords:'}
                    </span>
                    <span>{language === 'bn' ? sec.subjectBn : sec.subjectEn}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. Content: Consumer FAQs & Evidence Guidance */}
      {activeTab === 'faq' && (
        <div className="space-y-3 animate-fadeIn">
          {filteredFaqs.length === 0 ? (
            <div className="bg-surface border border-border rounded-lg p-8 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-ink-secondary mx-auto" />
              <p className="text-sm font-semibold text-ink-primary">
                {language === 'bn' ? 'কোনো প্রশ্নোত্তর পাওয়া যায়নি' : 'No FAQs found'}
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="ks-btn ks-btn-secondary text-xs py-1.5 px-3 mt-2 min-h-[44px]"
              >
                {language === 'bn' ? 'সকল প্রশ্নোত্তর দেখুন' : 'View All FAQs'}
              </button>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-lg divide-y divide-border shadow-sm">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="p-4 sm:p-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left flex items-start justify-between gap-4 group min-h-[44px]"
                    aria-expanded={openFaq === idx}
                  >
                    <span className="font-bold text-sm text-ink-primary group-hover:text-primary transition-colors flex items-start gap-2">
                      <span className="text-primary font-mono text-xs mt-0.5">Q{idx + 1}.</span>
                      <span>{language === 'bn' ? faq.qBn : faq.qEn}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 mt-1 transition-transform duration-standard ease-standard ${
                        openFaq === idx ? 'rotate-180 text-primary' : 'text-ink-secondary group-hover:text-primary'
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="pt-3 pl-6 pr-2 text-xs sm:text-sm text-ink-secondary leading-relaxed border-t border-dashed border-border mt-3 animate-fadeIn">
                      {language === 'bn' ? faq.aBn : faq.aEn}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
