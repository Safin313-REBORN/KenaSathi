import React, { useState } from 'react';
import {
  Building2,
  PhoneCall,
  Mail,
  MapPin,
  Scale,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ConsumerGuideDirectoryProps {
  language: 'bn' | 'en';
  onFileComplaint: () => void;
}

export const ConsumerGuideDirectory: React.FC<ConsumerGuideDirectoryProps> = ({
  language,
  onFileComplaint,
}) => {
  const [activeTab, setActiveTab] = useState<'offices' | 'statutes' | 'faq'>('offices');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Official Directorate of National Consumer Rights Protection (DNCRP) Real Offices
  const dncrpOffices = [
    {
      divisionBn: 'প্রধান কার্যালয় (ঢাকা)',
      divisionEn: 'Head Office (Dhaka)',
      addressBn: '১, কারওয়ান বাজার (টিসিবি ভবন, ৮ম ও ৯ম তলা), ঢাকা-১২১৫।',
      addressEn: '1, Karwan Bazar (TCB Bhaban, 8th & 9th Floor), Dhaka-1215.',
      phone: '02-8189425',
      hotline: '16121',
      email: 'nccc@dncrp.gov.bd',
      headOfficialBn: 'মহাপরিচালক (অতিরিক্ত সচিব)',
      headOfficialEn: 'Director General (Additional Secretary)',
    },
    {
      divisionBn: 'ঢাকা বিভাগীয় কার্যালয়',
      divisionEn: 'Dhaka Divisional Office',
      addressBn: 'টিসিবি ভবন, কারওয়ান বাজার, ঢাকা।',
      addressEn: 'TCB Bhaban, Karwan Bazar, Dhaka.',
      phone: '02-8189426',
      hotline: '16121',
      email: 'dd-dhaka@dncrp.gov.bd',
      headOfficialBn: 'উপ-পরিচালক (ঢাকা বিভাগ)',
      headOfficialEn: 'Deputy Director (Dhaka Division)',
    },
    {
      divisionBn: 'চট্টগ্রাম বিভাগীয় কার্যালয়',
      divisionEn: 'Chattogram Divisional Office',
      addressBn: 'সিজিএস কলোনি, আগ্রাবাদ, চট্টগ্রাম।',
      addressEn: 'CGS Colony, Agrabad, Chattogram.',
      phone: '031-727822',
      hotline: '16121',
      email: 'dd-ctg@dncrp.gov.bd',
      headOfficialBn: 'উপ-পরিচালক (চট্টগ্রাম বিভাগ)',
      headOfficialEn: 'Deputy Director (Chattogram Division)',
    },
    {
      divisionBn: 'রাজশাহী বিভাগীয় কার্যালয়',
      divisionEn: 'Rajshahi Divisional Office',
      addressBn: 'কাজীহাটা, রাজপাড়া, রাজশাহী।',
      addressEn: 'Kazihata, Rajput, Rajshahi.',
      phone: '0721-772844',
      hotline: '16121',
      email: 'dd-rajshahi@dncrp.gov.bd',
      headOfficialBn: 'উপ-পরিচালক (রাজশাহী বিভাগ)',
      headOfficialEn: 'Deputy Director (Rajshahi Division)',
    },
    {
      divisionBn: 'খুলনা বিভাগীয় কার্যালয়',
      divisionEn: 'Khulna Divisional Office',
      addressBn: 'বয়রা মেইন রোড, খুলনা।',
      addressEn: 'Boyra Main Road, Khulna.',
      phone: '041-762955',
      hotline: '16121',
      email: 'dd-khulna@dncrp.gov.bd',
      headOfficialBn: 'উপ-পরিচালক (খুলনা বিভাগ)',
      headOfficialEn: 'Deputy Director (Khulna Division)',
    },
    {
      divisionBn: 'সিলেট বিভাগীয় কার্যালয়',
      divisionEn: 'Sylhet Divisional Office',
      addressBn: 'মিরাবাজার, সিলেট।',
      addressEn: 'Mirabazar, Sylhet.',
      phone: '0821-719322',
      hotline: '16121',
      email: 'dd-sylhet@dncrp.gov.bd',
      headOfficialBn: 'উপ-পরিচালক (সিলেট বিভাগ)',
      headOfficialEn: 'Deputy Director (Sylhet Division)',
    },
  ];

  const consumerFaqs = [
    {
      qBn: 'ফেসবুক পেজে অর্ডার করে নকল পণ্য পেলে বা বিক্রেতা ব্লক করে দিলে কী করব?',
      qEn: 'What should I do if a Facebook page delivers a counterfeit product and blocks me?',
      aBn: 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৪৪ ও ৪৫ অনুযায়ী মিথ্যা বিজ্ঞাপন ও প্রতিশ্রুত পণ্য সরবরাহ না করা শাস্তিযোগ্য অপরাধ। আপনার কাছে থাকা ফেসবুক পেজের স্ক্রিনশট, বিকাশ/নগদ পেমেন্ট ট্রানজেকশন আইডি এবং কুরিয়ারের চালান (Waybill) সংরক্ষণ করুন। কেনাসাথী দিয়ে ৩০ দিনের মধ্যে প্রাথমিক নালিশ তৈরি করে ccms.dncrp.com বা nccc@dncrp.gov.bd তে দাখিল করুন।',
      aEn: 'Under Sections 44 and 45 of CRPA 2009, false advertisement and failure to deliver promised goods are punishable offenses. Preserve Facebook page screenshots, mobile wallet transaction receipts (TrxID), and courier delivery waybills. Generate an official complaint on KenaSathi within 30 days and file via ccms.dncrp.com or email to nccc@dncrp.gov.bd.',
    },
    {
      qBn: 'ধারা ৭৬(৪) অনুযায়ী ২৫% সরকারি পুরস্কার কীভাবে কার্যকর হয়?',
      qEn: 'How does the complainant receive the 25% statutory reward under Section 76(4)?',
      aBn: 'আইনের ধারা ৭৬(৪) অনুসারে সংশ্লিষ্ট কর্মকর্তা বা নির্বাহী ম্যাজিস্ট্রেট কর্তৃক আরোপিত প্রশাসনিক জরিমানা বিবাদী প্রতিষ্ঠানের নিকট হতে বাস্তবে আদায়ের পর (upon actual realization) আদায়কৃত জরিমানার ২৫% অর্থ তাৎক্ষণিকভাবে অভিযোগকারীকে প্রদান করা হয়। এটি কোনো আগাম ক্ষতিপূরণ নয়, জরিমানা আদায় সাপেক্ষ।',
      aEn: 'Under Section 76(4), when an administrative fine is collected/realized from the guilty vendor by an Executive Magistrate or authorized officer, 25% of the collected fine is disbursed to the complainant. It is conditional upon fine realization.',
    },
    {
      qBn: 'অভিযোগ দায়ের করার তামাদি মেয়াদ কত দিন?',
      qEn: 'What is the statutory limitation period for filing a complaint?',
      aBn: 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৬০ অনুযায়ী কারণ উদ্ভব হওয়ার (পণ্য ক্রয় বা প্রতারণা সংঘটিত হওয়ার) তারিখ থেকে অনধিক ৩০ (ত্রিশ) ক্যালেন্ডার দিনের মধ্যে লিখিত অভিযোগ দায়ের করতে হবে। ৩০ দিন অতিক্রান্ত হলে আইন অনুযায়ী অভিযোগ তামাদি হয়ে যায়।',
      aEn: 'Under Section 60 of CRPA 2009, the complaint must be filed within 30 calendar days from when the cause of action arises. Claims filed after 30 calendar days become time-barred by statute.',
    },
    {
      qBn: 'কুরিয়ারে ক্যাশ অন ডেলিভারি (COD) পার্সেল খোলার আইনি নিয়ম কী?',
      qEn: 'What are the rules regarding opening Cash on Delivery (COD) courier parcels?',
      aBn: 'বাণিজ্য মন্ত্রণালয়ের ই-কমার্স পরিচালনা নির্দেশিকা ২০২১ অনুসারে, ডেলিভারিম্যানের উপস্থিতিতে পার্সেল খুলে আনবক্সিং ভিডিও ধারণ করা ক্রেতার আইনি অধিকার। কোনো অমিল বা ভাঙা পণ্য পাওয়া গেলে অবিলম্বে ডেলিভারিম্যানকে দিয়ে রিটার্ন রসিদ সই করিয়ে নিন এবং বিকাশ/কুরিয়ার পেমেন্ট সাময়িকভাবে হোল্ড করতে বলুন।',
      aEn: 'Under the Ministry of Commerce E-Commerce Guidelines 2021, buyers have the right to record unboxing videos in the presence of the courier rider. If broken or counterfeit goods are found, immediately request a signed return slip and notify the courier to withhold payout to the merchant.',
    },
  ];

  const statutorySections = [
    {
      sec: 'ধারা ৪০ (Section 40)',
      titleBn: 'ধার্যকৃত মূল্যের অধিক মূল্যে পণ্য বিক্রয়',
      titleEn: 'Selling goods above statutory/tagged price',
      fineBn: 'অনধিক ১ (এক) বছর কারাদণ্ড, বা অনধিক ৫০,০০০ টাকা অর্থদণ্ড, বা উভয়দণ্ড',
      fineEn: 'Up to 1 year imprisonment, or fine up to BDT 50,000, or both',
    },
    {
      sec: 'ধারা ৪১ (Section 41)',
      titleBn: 'ভেজাল পণ্য বা ক্ষতিকর প্রসাধন বিক্রয়',
      titleEn: 'Sale of adulterated cosmetics, food, or medicine',
      fineBn: 'অনধিক ৩ (তিন) বছর কারাদণ্ড, বা অনধিক ২,০০,০০০ টাকা অর্থদণ্ড, বা উভয়দণ্ড',
      fineEn: 'Up to 3 years imprisonment, or fine up to BDT 200,000, or both',
    },
    {
      sec: 'ধারা ৪৪ (Section 44)',
      titleBn: 'মিথ্যা বা প্রতারণামূলক বিজ্ঞাপন',
      titleEn: 'False or deceptive advertising to consumers',
      fineBn: 'অনধিক ১ (এক) বছর কারাদণ্ড, বা অনধিক ২,০০,০০০ টাকা অর্থদণ্ড, বা উভয়দণ্ড',
      fineEn: 'Up to 1 year imprisonment, or fine up to BDT 200,000, or both',
    },
    {
      sec: 'ধারা ৪৫ (Section 45)',
      titleBn: 'প্রতিশ্রুত পণ্য বা সেবা যথাযথভাবে সরবরাহ না করা',
      titleEn: 'Failure to supply promised goods or services',
      fineBn: 'অনধিক ১ (এক) বছর কারাদণ্ড, বা অনধিক ৫০,০০০ টাকা অর্থদণ্ড, বা উভয়দণ্ড',
      fineEn: 'Up to 1 year imprisonment, or fine up to BDT 50,000, or both',
    },
    {
      sec: 'ধারা ৫০ (Section 50)',
      titleBn: 'নকল বা জাল পণ্য প্রস্তুত ও বিপণন',
      titleEn: 'Manufacturing or marketing counterfeit goods',
      fineBn: 'অনধিক ৩ (তিন) বছর কারাদণ্ড, বা অনধিক ২,০০,০০০ টাকা অর্থদণ্ড, বা উভয়দণ্ড',
      fineEn: 'Up to 3 years imprisonment, or fine up to BDT 200,000, or both',
    },
    {
      sec: 'ধারা ৬০ (Section 60)',
      titleBn: 'অভিযোগ দায়েরের সংবিধিবদ্ধ তামাদি মেয়াদ (৩০ ক্যালেন্ডার দিন)',
      titleEn: '30-Calendar-Day Statutory Limitation Period',
      fineBn: 'কারণ উদ্ভব হওয়ার ৩০ ক্যালেন্ডার দিনের মধ্যে মহাপরিচালক বা অনুমোদিত কর্মকর্তার বরাবরে লিখিত অভিযোগ আবশ্যক',
      fineEn: 'Must file formal complaint within 30 calendar days of cause of action',
    },
    {
      sec: 'ধারা ৭৬(৪) (Section 76(4))',
      titleBn: 'আদায়কৃত জরিমানার ২৫% সরকারি রিওয়ার্ড',
      titleEn: '25% share upon fine realization',
      fineBn: 'প্রশাসনিক জরিমানা আদায় সাপেক্ষে আদায়কৃত অর্থের ২৫% অভিযোগকারীকে প্রদান',
      fineEn: '25% of realized administrative penalty disbursed to the complainant',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto py-2">
      {/* Top Civic Header */}
      <div className="bg-white border border-[#D9E0DC] p-6 sm:p-8 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#176B53]" />
            <span className="text-xs font-mono font-bold text-[#176B53] uppercase">
              {language === 'bn' ? 'অফিসিয়াল তথ্য বাতায়ন' : 'Official Portal & Directory'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172B3A]">
            {language === 'bn'
              ? 'ভোক্তা অধিকার আইনি নির্দেশিকা ও জাতীয় দপ্তরসমূহ'
              : 'Consumer Protection Law & National Office Directory'}
          </h1>
          <p className="text-xs text-[#64716A] leading-relaxed">
            {language === 'bn'
              ? 'জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP), বাণিজ্য মন্ত্রণালয় কর্তৃক প্রজ্ঞাপিত আইন, অফিসিয়াল ঠিকানা, ফোন নম্বর ও আইনি অধিকার আদায়ের নির্দেশিকা।'
              : 'Divisional office contacts, statutory sections, procedural FAQs under Consumer Rights Protection Act 2009.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <a
            href="tel:16121"
            className="ks-btn ks-btn-primary text-xs font-bold py-2 px-3.5 shadow-sm"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{language === 'bn' ? 'হটলাইন: ১৬১২১' : 'Hotline: 16121'}</span>
          </a>

          <button
            type="button"
            onClick={onFileComplaint}
            className="ks-btn ks-btn-secondary text-xs font-bold py-2 px-3.5"
          >
            <FileText className="w-4 h-4 text-[#176B53]" />
            <span>{language === 'bn' ? 'অভিযোগ প্রস্তুত' : 'Draft Complaint'}</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-[#D9E0DC] space-x-2 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('offices')}
          className={`ks-btn text-xs py-2 px-4 ${
            activeTab === 'offices'
              ? 'ks-btn-primary font-bold'
              : 'ks-btn-secondary'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'বিভাগীয় দপ্তর ডিরেক্টরি' : 'Divisional Offices'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('statutes')}
          className={`ks-btn text-xs py-2 px-4 ${
            activeTab === 'statutes'
              ? 'ks-btn-primary font-bold'
              : 'ks-btn-secondary'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'আইনি ধারা ও জরিমানা' : 'Statutory Sections'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`ks-btn text-xs py-2 px-4 ${
            activeTab === 'faq'
              ? 'ks-btn-primary font-bold'
              : 'ks-btn-secondary'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'সাধারণ প্রশ্নোত্তর (FAQ)' : 'Consumer FAQs'}</span>
        </button>
      </div>

      {/* Content: Offices */}
      {activeTab === 'offices' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
          {dncrpOffices.map((office, idx) => (
            <div key={idx} className="bg-white border border-[#D9E0DC] rounded-lg p-5 space-y-3 flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EAF3F0] text-[#176B53] border border-[#ABCFC3]">
                  {language === 'bn' ? office.divisionBn : office.divisionEn}
                </span>
                <p className="text-xs text-[#172B3A] font-medium leading-relaxed flex items-start space-x-1.5">
                  <MapPin className="w-4 h-4 text-[#176B53] shrink-0 mt-0.5" />
                  <span>{language === 'bn' ? office.addressBn : office.addressEn}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-[#E8ECE9] space-y-1 text-xs text-[#64716A]">
                <p className="flex items-center space-x-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-[#176B53]" />
                  <span>ফোন: <strong className="text-[#172B3A] font-mono">{office.phone}</strong></span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#176B53]" />
                  <span className="font-mono text-[11px] text-[#176B53]">{office.email}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content: Statutes */}
      {activeTab === 'statutes' && (
        <div className="space-y-3 animate-fadeIn">
          {statutorySections.map((sec, idx) => (
            <div key={idx} className="bg-white border border-[#D9E0DC] rounded-lg p-5 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#176B53]">{sec.sec}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#F4F6F5] border border-[#D9E0DC] text-[#64716A]">
                  আইন নং ২৬, ২০০৯
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#172B3A]">
                {language === 'bn' ? sec.titleBn : sec.titleEn}
              </h3>
              <p className="text-xs text-[#64716A]">
                শাস্তি / বিধান: <strong className="text-[#172B3A]">{language === 'bn' ? sec.fineBn : sec.fineEn}</strong>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Content: FAQs */}
      {activeTab === 'faq' && (
        <div className="space-y-3 animate-fadeIn">
          {consumerFaqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-[#D9E0DC] rounded-lg overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4 flex items-center justify-between text-sm font-semibold text-[#172B3A] hover:bg-[#F4F6F5]"
              >
                <span>{language === 'bn' ? faq.qBn : faq.qEn}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#176B53]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64716A]" />
                )}
              </button>
              {openFaq === idx && (
                <div className="p-4 pt-1 text-xs text-[#64716A] leading-relaxed border-t border-[#E8ECE9] bg-[#F4F6F5]/50">
                  {language === 'bn' ? faq.aBn : faq.aEn}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
