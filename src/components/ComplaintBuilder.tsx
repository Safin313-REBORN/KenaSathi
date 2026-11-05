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
  AlertTriangle,
} from 'lucide-react';
import { ConsumerInspectionResult } from '../types/consumer';
import { KenaSathiStorage } from '../services/storageService';
import { DNCRP_OFFICES, DncrpOffice } from '../data/dncrpOffices';

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

  // Selected Target Office for the Complaint
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('nccc-dhaka');

  const selectedOffice: DncrpOffice = useMemo(() => {
    return DNCRP_OFFICES.find((o) => o.id === selectedOfficeId) || DNCRP_OFFICES[1]; // default NCCC
  }, [selectedOfficeId]);

  // Synchronize fields when currentCase changes to guarantee zero data contamination between cases
  const [prevCaseId, setPrevCaseId] = useState(currentCase.id);
  if (currentCase.id !== prevCaseId) {
    setPrevCaseId(currentCase.id);
    setIsEditing(false);
    setComplainantName(currentCase.complaintDossier.complainantName || '');
    setComplainantAddress(currentCase.complaintDossier.complainantAddress || '');
    setComplainantPhone(currentCase.complaintDossier.complainantNidPhone || '');
    setSellerName(currentCase.complaintDossier.sellerShopName || '');
    setSellerLocation(currentCase.complaintDossier.sellerLocation || '');
    setSellerContact(currentCase.complaintDossier.sellerContact || '');
    setFactualSummary(currentCase.complaintDossier.factualSummaryBn || '');
  }

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
  const isDemo = Boolean(currentCase.isDemo || complaintDossier.isDemo);

  const generateFullText = () => {
    return `
বরাবর,
${selectedOffice.officeTypeBn}
${selectedOffice.nameBn}
${selectedOffice.addressBn}
অফিসিয়াল ইমেইল: ${selectedOffice.email} | হেল্পলাইন: ${selectedOffice.hotline}

বিষয়: ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯ এর বিধান লঙ্ঘনের বিষয়ে বিবাদী প্রতিষ্ঠান/বিক্রেতার বিরুদ্ধে অভিযোগ ও প্রতিকার প্রার্থনা।

[খসড়া পরিচিতি আইডি: ${draftId}]
${isDemo ? '[সতর্কতা: নমুনা কাল্পনিক তথ্য — প্রকৃত অভিযোগ নয়]' : ''}

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

[আইনি সতর্কতা: এটি কেনাসাথী (KenaSathi) প্ল্যাটফর্ম দ্বারা নাগরিকের নিজ পর্যালোচনার জন্য প্রস্তুতকৃত একটি কাঠামোবদ্ধ খসড়া আবেদনপত্র। জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP)-এর অফিসিয়াল পোর্টালে (https://ccms.dncrp.com/) দাখিলের পূর্বে সমস্ত তথ্য সতর্কতার সাথে যাচাই করে নিন।]
    `.trim();
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      const updatedDossier = {
        ...currentCase.complaintDossier,
        complainantName,
        complainantAddress,
        complainantNidPhone: complainantPhone,
        sellerShopName: sellerName,
        sellerLocation,
        sellerContact,
        factualSummaryBn: factualSummary,
        factualSummaryEn: factualSummary,
      };
      KenaSathiStorage.saveCase({
        ...currentCase,
        complaintDossier: updatedDossier,
      });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
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
    window.open(`mailto:${selectedOffice.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleOpenCcmsPortal = () => {
    window.open('https://ccms.dncrp.com/', '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Explicit Fictional Demo Banner */}
      {isDemo && (
        <div role="status" className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {language === 'bn'
              ? 'নমুনা কাল্পনিক তথ্য — প্রকৃত অভিযোগ নয়'
              : 'Fictional demonstration data — not a real consumer complaint.'}
          </span>
        </div>
      )}

      {/* Top Action Header Bar */}
      <div className="bg-white border border-[#DDE4DF] rounded-md p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#EAF3EE] text-[#176B53]">
              {language === 'bn' ? 'নাগরিক পর্যালোচনার জন্য অভিযোগপত্রের খসড়া' : 'Structured Complaint Draft for Citizen Review'}
            </span>
            <span className="font-mono text-xs text-[#526359]">{draftId}</span>
          </div>
          <h2 className="text-xl font-bold text-[#172B3A] mt-1.5">
            {language === 'bn' ? 'নাগরিক পর্যালোচনার জন্য অভিযোগপত্রের খসড়া' : 'Structured Complaint Draft for Citizen Review'}
          </h2>
          <p className="text-xs text-[#526359] mt-0.5">
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
            onClick={handleToggleEdit}
            className={`ks-btn text-xs py-2 px-3.5 border transition min-h-[44px] ${
              isEditing
                ? 'bg-[#FEF7EC] text-[#945607] border-[#FDE68A]'
                : 'ks-btn-secondary'
            }`}
            aria-pressed={isEditing}
          >
            {isEditing ? <Check className="w-3.5 h-3.5 text-[#945607]" /> : <Edit3 className="w-3.5 h-3.5 text-[#176B53]" />}
            <span>{isEditing ? (language === 'bn' ? 'সম্পাদনা সংরক্ষণ' : 'Save Edits') : (language === 'bn' ? 'তথ্য সম্পাদনা' : 'Edit Text')}</span>
          </button>

          {/* Copy Complaint Draft */}
          <button
            type="button"
            onClick={handleCopyText}
            className="ks-btn ks-btn-secondary text-xs py-2 px-3.5 min-h-[44px]"
            title="Copy Complaint Draft"
            aria-label="Copy Complaint Draft"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#176B53]" />
                <span className="text-[#176B53] font-bold">{language === 'bn' ? 'কপি হয়েছে' : 'Draft Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#526359]" />
                <span>{language === 'bn' ? 'অভিযোগপত্র খসড়া কপি করুন' : 'Copy Complaint Draft'}</span>
              </>
            )}
          </button>

          {/* Print Complaint */}
          <button
            type="button"
            onClick={handlePrint}
            className="ks-btn ks-btn-secondary text-xs py-2 px-3.5 min-h-[44px]"
            title="Print Complaint"
            aria-label="Print Complaint"
          >
            <Printer className="w-3.5 h-3.5 text-[#526359]" />
            <span>{language === 'bn' ? 'প্রিন্ট / PDF' : 'Print / PDF'}</span>
          </button>

          {/* Draft Email */}
          <button
            type="button"
            onClick={handleDraftEmail}
            className="ks-btn ks-btn-secondary text-xs py-2 px-3.5 min-h-[44px]"
            title="Email Draft"
            aria-label="Email Draft"
          >
            <Mail className="w-3.5 h-3.5 text-[#176B53]" />
            <span>{language === 'bn' ? 'ইমেইল খসড়া খুলুন' : 'Open Email Draft'}</span>
          </button>

          {/* Official CCMS Portal Link */}
          <button
            type="button"
            onClick={handleOpenCcmsPortal}
            className="ks-btn ks-btn-primary group text-xs py-2 px-3.5 min-h-[44px]"
            title="Open DNCRP Portal"
            aria-label="Open DNCRP Portal"
          >
            <span>{language === 'bn' ? 'CCMS পোর্টালে দাখিল করুন' : 'Open CCMS Portal'}</span>
            <ExternalLink className="w-3.5 h-3.5 transition-transform duration-standard ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* Target Recipient Office Selector */}
      <div className="bg-[#F5F7F5] border border-[#DDE4DF] rounded-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <label htmlFor="complaint-target-office" className="font-bold text-[#172B3A] block">
            {language === 'bn' ? 'প্রাপক ভোক্তা অধিকার দপ্তর নির্বাচন করুন:' : 'Target Recipient DNCRP Office:'}
          </label>
          <span className="text-[#526359]">
            {language === 'bn'
              ? 'আপনার অভিযোগটি কোন বিভাগীয় দপ্তর বা কেন্দ্রে জমা দিতে চান তা নির্বাচন করুন।'
              : 'Choose the appropriate divisional desk or central cell for complaint filing.'}
          </span>
        </div>
        <select
          id="complaint-target-office"
          value={selectedOfficeId}
          onChange={(e) => setSelectedOfficeId(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-white border border-[#DDE4DF] rounded text-xs font-semibold text-[#172B3A] focus:outline-none focus:border-[#176B53] min-h-[44px]"
        >
          {DNCRP_OFFICES.map((off) => (
            <option key={off.id} value={off.id}>
              {language === 'bn' ? off.nameBn : off.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Realistic A4 Document Preview Sheet */}
      <div className="bg-white border border-[#DDE4DF] shadow-md p-8 sm:p-12 space-y-8 max-w-4xl mx-auto rounded-md relative">
        {/* Fictional Demo Watermark Ribbon */}
        {isDemo && (
          <div role="status" className="bg-amber-100 border border-amber-300 text-amber-900 text-xs px-3 py-1.5 rounded text-center font-bold">
            {language === 'bn'
              ? 'নমুনা কাল্পনিক তথ্য — প্রকৃত অভিযোগ নয়'
              : 'Fictional demonstration data — not a real consumer complaint.'}
          </div>
        )}

        {/* Document Header (Clean Citizen Draft Heading, No Government Pretence) */}
        <div className="text-center space-y-2 border-b border-[#DDE4DF] pb-6">
          <div className="w-10 h-10 rounded bg-[#176B53] mx-auto flex items-center justify-center text-white shadow-xs">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B3A]">
            {language === 'bn'
              ? 'নাগরিক পর্যালোচনার জন্য অভিযোগপত্রের খসড়া'
              : 'Structured Complaint Draft for Citizen Review'}
          </h1>
          <p className="text-xs text-[#526359]">
            {language === 'bn'
              ? `প্রাপক: ${selectedOffice.nameBn} | হেল্পলাইন: ${selectedOffice.hotline}`
              : `Recipient: ${selectedOffice.nameEn} | Helpline: ${selectedOffice.hotline}`}
          </p>
          <div className="inline-block px-3 py-1 bg-[#F5F7F5] border border-[#DDE4DF] rounded font-mono text-xs text-[#526359]">
            খসড়া পরিচিতি নম্বর: <strong className="text-[#172B3A]">{draftId}</strong>
          </div>
        </div>

        {/* Recipient & Subject */}
        <div className="space-y-4 text-xs sm:text-sm text-[#26352E]">
          <div className="space-y-0.5 leading-relaxed">
            <p className="font-bold text-[#172B3A]">বরাবর,</p>
            <p>{selectedOffice.officeTypeBn}</p>
            <p>{selectedOffice.nameBn}</p>
            <p>{selectedOffice.addressBn}</p>
            <p className="text-xs text-[#526359]">ইমেইল: {selectedOffice.email} | ফোন: {selectedOffice.phone}</p>
          </div>

          <div className="p-3.5 rounded bg-[#F5F7F5] border border-[#DDE4DF] font-bold text-[#172B3A] leading-relaxed">
            বিষয়: ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯ এর বিধান লঙ্ঘনের বিষয়ে বিবাদী প্রতিষ্ঠান/বিক্রেতার বিরুদ্ধে অভিযোগ ও প্রতিকার প্রার্থনা।
          </div>
        </div>

        {/* Parties Grid (Complainant & Seller) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Complainant Details */}
          <div className="p-4 rounded bg-[#F5F7F5] border border-[#DDE4DF] space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-[#172B3A] pb-1 border-b border-[#DDE4DF]">
              <User className="w-4 h-4 text-[#176B53]" />
              <span>অভিযোগকারী (Complainant)</span>
            </div>
            {isEditing ? (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  placeholder="অভিযোগকারীর পুরো নাম"
                  className="w-full p-2 border rounded bg-white text-xs min-h-[44px]"
                  aria-label="অভিযোগকারীর পুরো নাম"
                />
                <input
                  type="text"
                  value={complainantAddress}
                  onChange={(e) => setComplainantAddress(e.target.value)}
                  placeholder="বর্তমান যোগাযোগের ঠিকানা"
                  className="w-full p-2 border rounded bg-white text-xs min-h-[44px]"
                  aria-label="বর্তমান যোগাযোগের ঠিকানা"
                />
                <input
                  type="text"
                  value={complainantPhone}
                  onChange={(e) => setComplainantPhone(e.target.value)}
                  placeholder="মোবাইল ও এনআইডি নম্বর"
                  className="w-full p-2 border rounded bg-white text-xs min-h-[44px]"
                  aria-label="মোবাইল ও এনআইডি নম্বর"
                />
              </div>
            ) : (
              <div className="space-y-1 text-[#526359] pt-1">
                <p>নাম: <strong className="text-[#172B3A]">{complainantName || '[অভিযোগকারীর নাম]'}</strong></p>
                <p>ঠিকানা: <span className="text-[#26352E]">{complainantAddress || '[অভিযোগকারীর ঠিকানা]'}</span></p>
                <p>যোগাযোগ: <span className="font-mono text-[#26352E]">{complainantPhone || '[মোবাইল ও এনআইডি]'}</span></p>
              </div>
            )}
          </div>

          {/* Seller / Respondent Details */}
          <div className="p-4 rounded bg-[#F5F7F5] border border-[#DDE4DF] space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-[#172B3A] pb-1 border-b border-[#DDE4DF]">
              <Building className="w-4 h-4 text-[#176B53]" />
              <span>অভিযুক্ত বিক্রেতা/প্রতিষ্ঠান (Respondent)</span>
            </div>
            {isEditing ? (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="বিক্রেতা বা প্রতিষ্ঠানের নাম"
                  className="w-full p-2 border rounded bg-white text-xs min-h-[44px]"
                  aria-label="বিক্রেতা বা প্রতিষ্ঠানের নাম"
                />
                <input
                  type="text"
                  value={sellerLocation}
                  onChange={(e) => setSellerLocation(e.target.value)}
                  placeholder="বিক্রেতার ঠিকানা বা পেজের লিঙ্ক"
                  className="w-full p-2 border rounded bg-white text-xs min-h-[44px]"
                  aria-label="বিক্রেতার ঠিকানা বা পেজের লিঙ্ক"
                />
                <input
                  type="text"
                  value={sellerContact}
                  onChange={(e) => setSellerContact(e.target.value)}
                  placeholder="বিক্রেতার মোবাইল নম্বর বা সোশ্যাল আইডি"
                  className="w-full p-2 border rounded bg-white text-xs min-h-[44px]"
                  aria-label="বিক্রেতার মোবাইল নম্বর বা সোশ্যাল আইডি"
                />
              </div>
            ) : (
              <div className="space-y-1 text-[#526359] pt-1">
                <p>প্রতিষ্ঠান: <strong className="text-[#172B3A]">{sellerName || '[বিক্রেতার নাম]'}</strong></p>
                <p>ঠিকানা/প্ল্যাটফর্ম: <span className="text-[#26352E]">{sellerLocation || '[বিক্রেতার ঠিকানা]'}</span></p>
                <p>যোগাযোগ: <span className="font-mono text-[#26352E]">{sellerContact || '[যোগাযোগের নম্বর/লিঙ্ক]'}</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Statement of Facts */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-[#172B3A]">ঘটনার বিবরণ (Statement of Facts):</h3>
          {isEditing ? (
            <textarea
              rows={5}
              value={factualSummary}
              onChange={(e) => setFactualSummary(e.target.value)}
              className="w-full p-3 border rounded bg-white text-xs font-sans leading-relaxed"
              placeholder="ঘটনার সুনির্দিষ্ট ও প্রামাণ্য তথ্য সংক্ষেপে লিখুন..."
              aria-label="ঘটনার বিবরণ"
            />
          ) : (
            <p className="p-4 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#26352E] leading-relaxed whitespace-pre-line">
              {factualSummary || '[কোনো বিবরণ প্রদান করা হয়নি]'}
            </p>
          )}
        </div>

        {/* Transaction Details */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-[#172B3A]">ক্রয় ও লেনদেন বিবরণ:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded bg-[#F5F7F5] border border-[#DDE4DF]">
              <span className="text-[#526359] block">ক্রয়কৃত পণ্য:</span>
              <span className="font-semibold text-[#172B3A]">{complaintDossier.productName || 'নির্দিষ্ট করা হয়নি'}</span>
            </div>
            <div className="p-3 rounded bg-[#F5F7F5] border border-[#DDE4DF]">
              <span className="text-[#526359] block">পরিশোধিত মূল্য:</span>
              <span className="font-bold font-mono text-[#172B3A]">৳{(complaintDossier.purchaseAmountBdt || 0).toLocaleString()}</span>
            </div>
            <div className="p-3 rounded bg-[#F5F7F5] border border-[#DDE4DF]">
              <span className="text-[#526359] block">ট্রানজেকশন আইডি:</span>
              <span className="font-mono font-bold text-[#176B53]">{complaintDossier.transactionRef || 'প্রযোজ্য নয়'}</span>
            </div>
            <div className="p-3 rounded bg-[#F5F7F5] border border-[#DDE4DF]">
              <span className="text-[#526359] block">কুরিয়ার/ডেলিভারি:</span>
              <span className="font-semibold text-[#172B3A]">{complaintDossier.courierName || 'অনির্ধারিত'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Evidence Attachments Table */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-[#172B3A]">সংযুক্তি (Attached Supporting Documents):</h3>
          <div className="p-3 rounded bg-[#F5F7F5] border border-[#DDE4DF] space-y-1">
            {dynamicAttachments.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-[#26352E]">
                <FileText className="w-3.5 h-3.5 text-[#176B53]" />
                <span className="font-mono">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formal Prayer */}
        <div className="space-y-2 text-xs sm:text-sm border-t border-[#DDE4DF] pt-4">
          <h3 className="font-bold text-[#172B3A]">দাবিকৃত প্রতিকার (Prayer):</h3>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs text-[#26352E] leading-relaxed">
            <li>
              ক্ষতিগ্রস্ত সাধারণ ভোক্তা হিসেবে পরিশোধিত অর্থ <strong className="font-mono">৳{(complaintDossier.purchaseAmountBdt || 0).toLocaleString()}</strong> অবিলম্বে সম্পূর্ণ ফেরত বা প্রতিশ্রুত মানসম্মত পণ্য সরবরাহ/প্রতিস্থাপন।
            </li>
            <li>
              ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯ এর সংশ্লিষ্ট ধারা লঙ্ঘনের দায়ে বিবাদী প্রতিষ্ঠানের বিরুদ্ধে তদন্তপূর্বক আইনানুগ প্রশাসনিক ব্যবস্থা গ্রহণ।
            </li>
          </ol>
        </div>

        {/* Statutory Condition Note on Section 76(4) */}
        <div className="p-3.5 rounded bg-[#FEF7EC] border border-[#FDE68A] text-xs text-[#945607] leading-relaxed">
          <strong>আইনগত তথ্য (ধারা ৭৬(৪)):</strong> ধারা ৭৬(৪) অনুযায়ী আদায়কৃত জরিমানার একটি শর্তাধীন অংশ অভিযোগকারীকে প্রদেয় হতে পারে। এটি কোনো নিশ্চিত ক্ষতিপূরণ বা অর্থপ্রাপ্তির নিশ্চয়তা নয়।
        </div>

        {/* Signatures & Date */}
        <div className="pt-6 border-t border-[#DDE4DF] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#526359] gap-4">
          <div>
            <p>তারিখ: <strong className="text-[#172B3A] font-mono">{complaintDossier.generatedDate || new Date().toISOString().split('T')[0]}</strong></p>
            <p className="text-xs mt-0.5">কেনাসাথী সিভিক-টেক ড্রাফটিং ইঞ্জিন দ্বারা সংকলিত</p>
          </div>
          <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
            <p className="font-bold text-[#172B3A]">{complainantName || '[অভিযোগকারীর স্বাক্ষর]'}</p>
            <p className="text-xs">স্বাক্ষর ও তারিখ</p>
          </div>
        </div>
      </div>
    </div>
  );
};
