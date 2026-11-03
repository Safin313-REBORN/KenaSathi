import React, { useState, useMemo } from 'react';
import {
  Printer,
  Copy,
  CheckCircle2,
  ExternalLink,
  Building,
  User,
  Edit3,
  Check,
  Mail,
  FileText,
  Scale,
} from 'lucide-react';
import { ConsumerInspectionResult } from '../types/consumer';

interface ComplaintBuilderProps {
  currentCase: ConsumerInspectionResult;
  language: 'bn' | 'en';
}

export const ComplaintBuilder: React.FC<ComplaintBuilderProps> = ({
  currentCase,
  language,
}) => {
  const [copied, setCopied] = useState(false);
  const { complaintDossier } = currentCase;

  // Editable fields state for citizen customization
  const [isEditing, setIsEditing] = useState(false);
  const [complainantName, setComplainantName] = useState(complaintDossier.complainantName || '');
  const [complainantAddress, setComplainantAddress] = useState(complaintDossier.complainantAddress || '');
  const [complainantPhone, setComplainantPhone] = useState(complaintDossier.complainantNidPhone || '');
  const [sellerName, setSellerName] = useState(complaintDossier.sellerShopName || '');
  const [sellerLocation, setSellerLocation] = useState(complaintDossier.sellerLocation || '');
  const [sellerContact, setSellerContact] = useState(complaintDossier.sellerContact || '');
  const [factualSummary, setFactualSummary] = useState(complaintDossier.factualSummaryBn || '');

  // Dynamic Attachments derived strictly from case evidence
  const dynamicAttachments: string[] = useMemo(() => {
    if (currentCase.evidenceItems && currentCase.evidenceItems.length > 0) {
      return currentCase.evidenceItems.map(
        (ev, idx) => `${idx + 1}. [${ev.type}] ${ev.name}`
      );
    }
    if (complaintDossier.attachedEvidenceNames && complaintDossier.attachedEvidenceNames.length > 0) {
      return complaintDossier.attachedEvidenceNames.map((name, idx) => `${idx + 1}. ${name}`);
    }
    return ['১. কোনো প্রমাণাদি সংযুক্ত করা হয়নি (দাখিলের পূর্বে আপলোড করুন)'];
  }, [currentCase.evidenceItems, complaintDossier.attachedEvidenceNames]);

  const draftId = complaintDossier.complaintDraftId || `KS-DRAFT-${complaintDossier.complaintId.replace(/^DNCRP-/, '')}`;

  const generateFullText = () => {
    return `
বরাবর,
মহাপরিচালক / সহকারী পরিচালক
জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP)
১, কারওয়ান বাজার (টিসিবি ভবন), ঢাকা-১২১৫।
অফিসিয়াল ইমেইল: nccc@dncrp.gov.bd | হেল্পলাইন: ১৬১২১

বিষয়: ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯ এর বিধান লঙ্ঘনের বিষয়ে বিবাদী প্রতিষ্ঠান/বিক্রেতার বিরুদ্ধে অভিযোগ ও প্রতিকার প্রার্থনা।

[খসড়া পরিচিতি আইডি: ${draftId}]

অভিযোগকারী (Complainant):
নাম: ${complainantName || '[অভিযোগকারীর নাম]'}
ঠিকানা: ${complainantAddress || '[অভিযোগকারীর ঠিকানা]'}
যোগাযোগ/এনআইডি: ${complainantPhone || '[মোবাইল ও এনআইডি নম্বর]'}

অভিযুক্ত বিক্রেতা/প্রতিষ্ঠান (Respondent):
নাম/পেজ: ${sellerName || '[বিক্রেতা বা পেজের নাম]'}
ঠিকানা: ${sellerLocation || '[বিক্রেতার ঠিকানা বা অনলাইন প্ল্যাটফর্ম]'}
যোগাযোগ: ${sellerContact || '[যোগাযোগের নম্বর বা সোশ্যাল লিঙ্ক]'}

ঘটনার বিবরণ (Statement of Facts):
${factualSummary || '[ঘটনার বিস্তারিত বিবরণ]'}

লেনদেন ও ক্রয় বিবরণ:
১. ক্রয়কৃত পণ্য: ${complaintDossier.productName || 'নির্দিষ্ট করা হয়নি'}
২. পরিশোধিত ক্রয়মূল্য: ৳${(complaintDossier.purchaseAmountBdt || 0).toLocaleString()}
৩. ট্রানজেকশন আইডি: ${complaintDossier.transactionRef || 'প্রযোজ্য নয় / প্রদান করা হয়নি'}
৪. ডেলিভারি/কুরিয়ার মাধ্যম: ${complaintDossier.courierName || 'প্রযোজ্য নয় / অনির্ধারিত'}

দাবিকৃত আইনানুগ প্রতিকার (Prayer):
১. ক্ষতিগ্রস্ত ভোক্তা হিসেবে পরিশোধিত অর্থ ৳${(complaintDossier.purchaseAmountBdt || 0).toLocaleString()} অবিলম্বে সম্পূর্ণ ফেরত বা প্রতিশ্রুত মানসম্মত পণ্য সরবরাহ/প্রতিস্থাপন।
২. ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯ এর সংশ্লিষ্ট বিধান লঙ্ঘনের দায়ে বিবাদী প্রতিষ্ঠানের বিরুদ্ধে তদন্তপূর্বক আইনানুগ প্রশাসনিক ব্যবস্থা গ্রহণ।

সংযুক্তি (Attachments):
${dynamicAttachments.join('\n')}

বিনীত,
${complainantName || '[স্বাক্ষর]'}
তারিখ: ${complaintDossier.generatedDate || new Date().toISOString().split('T')[0]}

[আইনি সতর্কতা: এটি কেনাসাথী এআই দ্বারা প্রস্তুতকৃত একটি প্রাথমিক খসড়া আবেদনপত্র। জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP)-এর অফিসিয়াল পোর্টালে (https://ccms.dncrp.com/) দাখিলের পূর্বে সমস্ত তথ্য সতর্কতার সাথে যাচাই করে নিন।]
    `.trim();
  };

  const handleCopyText = () => {
    const text = generateFullText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDraftEmail = () => {
    const subject = encodeURIComponent(`ভোক্তা অধিকার নালিশ খসড়া: [${sellerName || 'বিক্রেতা'}] এর বিরুদ্ধে অভিযোগ`);
    const body = encodeURIComponent(generateFullText());
    window.open(`mailto:nccc@dncrp.gov.bd?subject=${subject}&body=${body}`, '_blank');
  };

  const handleOpenCcmsPortal = () => {
    window.open('https://ccms.dncrp.com/', '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Header Bar */}
      <div className="ks-card p-5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="ks-badge ks-badge-teal">
              {language === 'bn' ? 'নাগরিক পর্যালোচনার নালিশ খসড়া' : 'Structured Complaint Draft (Citizen Review)'}
            </span>
            <span className="font-mono text-xs text-[#657481]">{draftId}</span>
          </div>
          <h2 className="text-xl font-bold text-[#192B38] mt-1">
            {language === 'bn' ? 'ভোক্তা অধিকার নালিশ খসড়া ও আবেদনপত্র' : 'DNCRP Citizen Complaint Draft'}
          </h2>
          <p className="text-xs text-[#657481] mt-0.5">
            {language === 'bn'
              ? 'নাগরিকের নিজ পর্যালোচনার পর অফিসিয়াল পোর্টালে (ccms.dncrp.com) বা ইমেইলে দাখিলের উদ্দেশ্যে প্রস্তুতকৃত নিরপেক্ষ খসড়া।'
              : 'Structured complaint draft prepared for citizen review before official submission via portal or email.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`ks-btn text-xs py-2 px-3 border transition ${
              isEditing
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'ks-btn-secondary'
            }`}
          >
            {isEditing ? <Check className="w-3.5 h-3.5 text-amber-700" /> : <Edit3 className="w-3.5 h-3.5 text-[#087E78]" />}
            <span>{isEditing ? (language === 'bn' ? 'সম্পাদনা সম্পন্ন' : 'Save Edits') : (language === 'bn' ? 'তথ্য সম্পাদনা' : 'Edit Text')}</span>
          </button>

          {/* Copy Complaint Draft */}
          <button
            type="button"
            onClick={handleCopyText}
            className="ks-btn ks-btn-secondary text-xs py-2 px-3"
            title="Copy Complaint Draft"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">{language === 'bn' ? 'কপি হয়েছে' : 'Draft Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#657481]" />
                <span>{language === 'bn' ? 'অভিযোগপত্র খসড়া কপি করুন' : 'Copy Complaint Draft'}</span>
              </>
            )}
          </button>

          {/* Print Complaint */}
          <button
            type="button"
            onClick={handlePrint}
            className="ks-btn ks-btn-secondary text-xs py-2 px-3"
            title="Print Complaint"
          >
            <Printer className="w-3.5 h-3.5 text-[#657481]" />
            <span>{language === 'bn' ? 'অভিযোগপত্র প্রিন্ট করুন' : 'Print Complaint'}</span>
          </button>

          {/* Open Email Draft */}
          <button
            type="button"
            onClick={handleDraftEmail}
            className="ks-btn ks-btn-teal text-xs py-2 px-3 font-bold"
            title="Open Email Draft in Default Mail App"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ইমেইল খসড়া খুলুন' : 'Open Email Draft'}</span>
          </button>

          {/* Open Official CCMS Portal */}
          <button
            type="button"
            onClick={handleOpenCcmsPortal}
            className="ks-btn ks-btn-primary text-xs py-2 px-3 font-bold"
            title="Open Official DNCRP Portal"
          >
            <span>{language === 'bn' ? 'অফিসিয়াল সিসিএমএস পোর্টাল' : 'Open Official CCMS Portal'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Official Bangladesh Government White Paper Sheet */}
      <div className="ks-card p-6 sm:p-10 bg-white border border-[#CBD5E1] shadow-md space-y-8 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="text-center space-y-2 border-b border-[#E4E9ED] pb-6">
          <div className="w-12 h-12 rounded-full bg-[#142B3B] mx-auto flex items-center justify-center text-white shadow-sm">
            <Scale className="w-6 h-6 text-[#75C3B1]" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-[#192B38]">
            জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP)
          </h1>
          <p className="text-xs text-[#657481]">
            ১, কারওয়ান বাজার (টিসিবি ভবন), ঢাকা-১২১৫ | হেল্পলাইন: ১৬১২১ | ইমেইল: nccc@dncrp.gov.bd
          </p>
          <div className="inline-block mt-1 px-3 py-1 bg-[#F6F8FA] border border-[#E4E9ED] rounded font-mono text-xs text-[#657481]">
            খসড়া পরিচিতি নম্বর: <strong className="text-[#192B38]">{draftId}</strong>
          </div>
        </div>

        {/* Recipient & Subject */}
        <div className="space-y-4 text-xs sm:text-sm text-[#192B38]">
          <div className="space-y-0.5">
            <p className="font-semibold">বরাবর,</p>
            <p>মহাপরিচালক / সহকারী পরিচালক</p>
            <p>জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর</p>
            <p>১, কারওয়ান বাজার, ঢাকা-১২১৫।</p>
          </div>

          <div className="p-3 rounded-lg bg-[#F6F8FA] border border-[#E4E9ED] font-semibold">
            বিষয়: ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯ এর বিধান লঙ্ঘনের বিষয়ে বিবাদী প্রতিষ্ঠান/বিক্রেতার বিরুদ্ধে অভিযোগ ও প্রতিকার প্রার্থনা।
          </div>
        </div>

        {/* Parties Grid (Complainant & Seller) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Complainant Card */}
          <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#E4E9ED] space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-[#192B38] pb-1 border-b border-[#EDF1F4]">
              <User className="w-4 h-4 text-[#087E78]" />
              <span>অভিযোগকারী (Complainant)</span>
            </div>
            {isEditing ? (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  placeholder="অভিযোগকারীর পুরো নাম"
                  className="w-full p-2 border rounded bg-white text-xs"
                />
                <input
                  type="text"
                  value={complainantAddress}
                  onChange={(e) => setComplainantAddress(e.target.value)}
                  placeholder="বর্তমান যোগাযোগের ঠিকানা"
                  className="w-full p-2 border rounded bg-white text-xs"
                />
                <input
                  type="text"
                  value={complainantPhone}
                  onChange={(e) => setComplainantPhone(e.target.value)}
                  placeholder="মোবাইল ও এনআইডি নম্বর"
                  className="w-full p-2 border rounded bg-white text-xs"
                />
              </div>
            ) : (
              <div className="space-y-1 text-[#657481] pt-1">
                <p>নাম: <strong className="text-[#192B38]">{complainantName || '[অভিযোগকারীর নাম]'}</strong></p>
                <p>ঠিকানা: {complainantAddress || '[অভিযোগকারীর ঠিকানা]'}</p>
                <p>যোগাযোগ: <span className="font-mono">{complainantPhone || '[মোবাইল ও এনআইডি]'}</span></p>
              </div>
            )}
          </div>

          {/* Seller Card */}
          <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#E4E9ED] space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-[#192B38] pb-1 border-b border-[#EDF1F4]">
              <Building className="w-4 h-4 text-amber-600" />
              <span>অভিযুক্ত বিক্রেতা / প্রতিষ্ঠান (Respondent)</span>
            </div>
            {isEditing ? (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="বিক্রেতা বা পেজের নাম"
                  className="w-full p-2 border rounded bg-white text-xs"
                />
                <input
                  type="text"
                  value={sellerLocation}
                  onChange={(e) => setSellerLocation(e.target.value)}
                  placeholder="বিক্রেতার ঠিকানা বা অনলাইন লিঙ্ক"
                  className="w-full p-2 border rounded bg-white text-xs"
                />
                <input
                  type="text"
                  value={sellerContact}
                  onChange={(e) => setSellerContact(e.target.value)}
                  placeholder="যোগাযোগ নম্বর বা হোয়াটসঅ্যাপ"
                  className="w-full p-2 border rounded bg-white text-xs"
                />
              </div>
            ) : (
              <div className="space-y-1 text-[#657481] pt-1">
                <p>নাম: <strong className="text-[#192B38]">{sellerName || '[বিক্রেতার নাম]'}</strong></p>
                <p>ঠিকানা: {sellerLocation || '[বিক্রেতার ঠিকানা]'}</p>
                <p>যোগাযোগ: <span className="font-mono">{sellerContact || '[যোগাযোগের বিবরণ]'}</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Factual Summary */}
        <div className="space-y-2 text-xs sm:text-sm">
          <h3 className="font-bold text-[#192B38]">ঘটনার বিবরণ (Statement of Facts):</h3>
          {isEditing ? (
            <textarea
              value={factualSummary}
              onChange={(e) => setFactualSummary(e.target.value)}
              rows={5}
              className="w-full p-3 border rounded-lg bg-white text-xs leading-relaxed"
            />
          ) : (
            <p className="p-4 rounded-lg bg-[#F6F8FA] border border-[#E4E9ED] text-[#192B38] leading-relaxed whitespace-pre-line text-xs">
              {factualSummary || '[ঘটনার বিস্তারিত বিবরণ এখানে প্রদান করুন]'}
            </p>
          )}
        </div>

        {/* Transaction Details */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-[#192B38]">ক্রয় ও লেনদেন বিবরণ:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded bg-[#F6F8FA] border border-[#E4E9ED]">
              <span className="text-[#657481] block">ক্রয়কৃত পণ্য:</span>
              <span className="font-semibold text-[#192B38]">{complaintDossier.productName || 'নির্দিষ্ট করা হয়নি'}</span>
            </div>
            <div className="p-2.5 rounded bg-[#F6F8FA] border border-[#E4E9ED]">
              <span className="text-[#657481] block">পরিশোধিত মূল্য:</span>
              <span className="font-bold font-mono text-[#192B38]">৳{(complaintDossier.purchaseAmountBdt || 0).toLocaleString()}</span>
            </div>
            <div className="p-2.5 rounded bg-[#F6F8FA] border border-[#E4E9ED]">
              <span className="text-[#657481] block">ট্রানজেকশন আইডি:</span>
              <span className="font-mono font-bold text-[#087E78]">{complaintDossier.transactionRef || 'প্রযোজ্য নয়'}</span>
            </div>
            <div className="p-2.5 rounded bg-[#F6F8FA] border border-[#E4E9ED]">
              <span className="text-[#657481] block">কুরিয়ার/ডেলিভারি:</span>
              <span className="font-semibold text-[#192B38]">{complaintDossier.courierName || 'অনির্ধারিত'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Evidence Attachments Table */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-[#192B38]">সংযুক্তি (Attached Supporting Documents):</h3>
          <div className="p-3 rounded-lg bg-[#F6F8FA] border border-[#E4E9ED] space-y-1">
            {dynamicAttachments.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-[#192B38]">
                <FileText className="w-3.5 h-3.5 text-[#087E78]" />
                <span className="font-mono">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formal Prayer */}
        <div className="space-y-2 text-xs sm:text-sm border-t border-[#EDF1F4] pt-4">
          <h3 className="font-bold text-[#192B38]">দাবিকৃত প্রতিকার (Prayer):</h3>
          <ol className="list-decimal pl-5 space-y-1 text-xs text-[#192B38] leading-relaxed">
            <li>
              ক্ষতিগ্রস্ত সাধারণ ভোক্তা হিসেবে পরিশোধিত অর্থ <strong className="font-mono">৳{(complaintDossier.purchaseAmountBdt || 0).toLocaleString()}</strong> অবিলম্বে সম্পূর্ণ ফেরত বা প্রতিশ্রুত মানসম্মত পণ্য সরবরাহ/প্রতিস্থাপন।
            </li>
            <li>
              ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯ এর সংশ্লিষ্ট ধারা লঙ্ঘনের দায়ে বিবাদী প্রতিষ্ঠানের বিরুদ্ধে তদন্তপূর্বক আইনানুগ প্রশাসনিক ব্যবস্থা গ্রহণ।
            </li>
          </ol>
        </div>

        {/* Statutory Condition Note on Section 76(4) */}
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <strong>আইনগত তথ্য (ধারা ৭৬(৪)):</strong> ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ এর ধারা ৭৬(৪) অনুসারে নির্বাহী ম্যাজিস্ট্রেট কর্তৃক প্রশাসনিক জরিমানা আদায় সাপেক্ষে (upon realization) আদায়কৃত জরিমানার ২৫% অভিযোগকারীকে প্রদান করা হয়। এটি সরাসরি দাবিকৃত প্রতিকারের অন্তর্ভুক্ত নয়।
        </div>

        {/* Signatures & Date */}
        <div className="pt-6 border-t border-[#E4E9ED] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#657481] gap-4">
          <div>
            <p>তারিখ: <strong className="text-[#192B38] font-mono">{complaintDossier.generatedDate || new Date().toISOString().split('T')[0]}</strong></p>
            <p className="text-[11px] mt-0.5">কেনাসাথী সিভিক-টেক ড্রাফটিং ইঞ্জিন দ্বারা সংকলিত</p>
          </div>
          <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
            <p className="font-bold text-[#192B38]">{complainantName || '[অভিযোগকারীর স্বাক্ষর]'}</p>
            <p className="text-[11px]">স্বাক্ষর ও তারিখ</p>
          </div>
        </div>
      </div>
    </div>
  );
};
