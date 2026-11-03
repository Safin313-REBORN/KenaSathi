import React, { useState } from 'react';
import {
  X,
  Upload,
  ShoppingBag,
  DollarSign,
  User,
  Sparkles,
  Key,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Calendar,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { ConsumerGrievanceType, ConsumerInspectionResult } from '../types/consumer';
import { processUploadedEvidenceFiles } from '../services/evidenceProcessor';
import { runKenaSathiAiAnalysis } from '../services/aiService';
import { KenaSathiStorage } from '../services/storageService';

type PlatformType = 'facebook_page' | 'daraz' | 'chaldal' | 'physical_store' | 'standalone_website';

interface NewDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitNewCase: (newCase: ConsumerInspectionResult) => void;
  language: 'bn' | 'en';
}

export const NewDisputeModal: React.FC<NewDisputeModalProps> = ({
  isOpen,
  onClose,
  onSubmitNewCase,
  language,
}) => {
  // Form fields start blank to protect consumer privacy
  const [productName, setProductName] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('facebook_page');
  const [grievanceType, setGrievanceType] = useState<ConsumerGrievanceType>('product_not_delivered');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [fairMarketPrice, setFairMarketPrice] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [complainantName, setComplainantName] = useState('');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [complainantAddress, setComplainantAddress] = useState('');
  const [incidentDetail, setIncidentDetail] = useState('');

  // Uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [cloudIncludedFiles, setCloudIncludedFiles] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  // AI Engine Settings (Zero plain secret storage)
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'local_deterministic' | 'gemini' | 'openai'>('local_deterministic');
  const [ephemeralApiKey, setEphemeralApiKey] = useState('');
  const [userConsentedToCloud, setUserConsentedToCloud] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setCloudIncludedFiles((prev) => {
        const next = new Set(prev);
        newFiles.forEach((f) => next.add(f.name));
        return next;
      });
    }
  };

  const handleToggleCloudInclude = (fileName: string) => {
    setCloudIncludedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileName)) {
        next.delete(fileName);
      } else {
        next.add(fileName);
      }
      return next;
    });
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    if (fileToRemove) {
      setCloudIncludedFiles((prev) => {
        const next = new Set(prev);
        next.delete(fileToRemove.name);
        return next;
      });
    }
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLoadFictionalDemoPreset = () => {
    const demo = KenaSathiStorage.loadFictionalDemo();
    onSubmitNewCase(demo);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProgressMsg(language === 'bn' ? 'নথিপত্র প্রক্রিয়া করা হচ্ছে...' : 'Processing evidence files...');

    try {
      // 1. Process files locally
      const processedEvidence = await processUploadedEvidenceFiles(
        uploadedFiles,
        incidentDetail.trim()
      );

      // Filter cloud transmission: only attach dataUrl (bytes) for user-consented files
      const evidenceForAnalysis = processedEvidence.evidenceItems.map((item) => {
        const isIncludedInCloud = cloudIncludedFiles.has(item.name);
        if (!isIncludedInCloud && selectedProvider !== 'local_deterministic') {
          return {
            ...item,
            dataUrl: undefined, // Strip bytes from external cloud payload
          };
        }
        return item;
      });

      // 2. Run analysis — NEVER auto-populate today's date if empty (Preserve missing dates honestly)
      const sanitizedIncidentDate = incidentDate.trim() ? incidentDate.trim() : undefined;

      const analyzedCase = await runKenaSathiAiAnalysis(
        {
          productName: productName || 'অনলাইন ক্রয় বিরোধ',
          productBrand: productBrand || 'সাধারণ',
          sellerName: sellerName || 'অনির্দিষ্ট বিক্রেতা',
          platform,
          grievanceType,
          claimedPurchasePriceBdt: parseFloat(purchasePrice) || 0,
          fairMarketPriceBdt: parseFloat(fairMarketPrice) || parseFloat(purchasePrice) || 0,
          transactionRef: transactionRef.trim(),
          incidentDate: sanitizedIncidentDate,
          complainantName: complainantName.trim(),
          complainantPhone: complainantPhone.trim(),
          complainantAddress: complainantAddress.trim(),
          incidentDetail: incidentDetail.trim(),
          evidenceItems: evidenceForAnalysis,
          detectedFacts: processedEvidence.detectedFacts,
          preferredProvider: selectedProvider,
          ephemeralApiKey: ephemeralApiKey.trim(),
          userConsentedToCloud: userConsentedToCloud,
        },
        (step) => setProgressMsg(step)
      );

      // 3. Persist to storage
      KenaSathiStorage.saveCase(analyzedCase);

      // 4. Notify parent & close modal
      onSubmitNewCase(analyzedCase);
      onClose();
    } catch (err) {
      console.error('Case processing error:', err);
    } finally {
      setIsProcessing(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl my-6 rounded-2xl border border-[#E4E9ED] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E9ED] bg-[#F6F8FA]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5F2] text-[#087E78] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#192B38]">
                {language === 'bn' ? 'নতুন ভোক্তা অভিযোগ অডিট (+ File Dispute)' : 'New Consumer Dispute Audit'}
              </h3>
              <p className="text-xs text-[#657481]">
                {language === 'bn'
                  ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ অনুসারে প্রমাণাদি যাচাই ও নালিশ প্রস্তুত'
                  : 'Evidence-based dispute intake & CRPA 2009 statutory audit'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleLoadFictionalDemoPreset}
              className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center space-x-1 transition"
              title="Load demo scenario for testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'bn' ? 'নমুনা ডেমো লোড করুন' : 'Load Demo'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#657481] hover:text-[#192B38] hover:bg-slate-200 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* AI Engine & Privacy Mode Drawer */}
          <div className="p-3.5 rounded-xl bg-[#F6F8FA] border border-[#E4E9ED] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#192B38]">
                <ShieldCheck className="w-4 h-4 text-[#087E78]" />
                <span>
                  {language === 'bn'
                    ? 'এআই ইঞ্জিন ও গোপনীয়তা সেটিংস:'
                    : 'AI Engine & Privacy Mode:'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F5F2] text-[#087E78] font-bold">
                  {selectedProvider === 'local_deterministic' ? '100% Client-Side Privacy' : 'Cloud AI (Consented)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiSettings(!showAiSettings)}
                className="text-xs font-semibold text-[#087E78] hover:underline flex items-center space-x-1"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{showAiSettings ? (language === 'bn' ? 'লুকান' : 'Hide') : (language === 'bn' ? 'কনফিগারেশন' : 'Configure')}</span>
              </button>
            </div>

            {showAiSettings && (
              <div className="p-3.5 rounded-xl bg-white border border-[#E4E9ED] space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between ${selectedProvider === 'local_deterministic' ? 'bg-[#E8F5F2] border-[#087E78] text-[#087E78]' : 'bg-[#F6F8FA] border-[#E4E9ED] text-[#657481]'}`}>
                    <div className="flex items-center space-x-1.5 font-bold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>লোকাল ইঞ্জিন (Local)</span>
                    </div>
                    <span className="text-[10px] mt-1 text-[#657481]">জিরো ক্লাউড ডেটা লিকেজ</span>
                    <input
                      type="radio"
                      name="provider"
                      className="hidden"
                      checked={selectedProvider === 'local_deterministic'}
                      onChange={() => setSelectedProvider('local_deterministic')}
                    />
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between ${selectedProvider === 'gemini' ? 'bg-[#E8F5F2] border-[#087E78] text-[#087E78]' : 'bg-[#F6F8FA] border-[#E4E9ED] text-[#657481]'}`}>
                    <div className="flex items-center space-x-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini 3.8 Flash Vision</span>
                    </div>
                    <span className="text-[10px] mt-1 text-[#657481]">Google Multimodal AI</span>
                    <input
                      type="radio"
                      name="provider"
                      className="hidden"
                      checked={selectedProvider === 'gemini'}
                      onChange={() => setSelectedProvider('gemini')}
                    />
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between ${selectedProvider === 'openai' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-[#F6F8FA] border-[#E4E9ED] text-[#657481]'}`}>
                    <div className="flex items-center space-x-1.5 font-bold">
                      <Key className="w-3.5 h-3.5" />
                      <span>GPT-4o-mini Vision</span>
                    </div>
                    <span className="text-[10px] mt-1 text-[#657481]">OpenAI Multimodal AI</span>
                    <input
                      type="radio"
                      name="provider"
                      className="hidden"
                      checked={selectedProvider === 'openai'}
                      onChange={() => setSelectedProvider('openai')}
                    />
                  </label>
                </div>

                {selectedProvider !== 'local_deterministic' && (
                  <div className="space-y-2.5 pt-2 border-t border-[#EDF1F4]">
                    <input
                      type="password"
                      placeholder={`আপনার সাময়িক ${selectedProvider.toUpperCase()} API Key প্রদান করুন (সেশনে সীমাবদ্ধ)`}
                      value={ephemeralApiKey}
                      onChange={(e) => setEphemeralApiKey(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E4E9ED] bg-white text-[#192B38] font-mono text-xs focus:outline-none focus:border-[#087E78]"
                    />
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                      <strong>{language === 'bn' ? 'নিরাপত্তা সতর্কতা:' : 'Security Notice:'}</strong>{' '}
                      {language === 'bn'
                        ? 'এই ক্লায়েন্ট-সাইড প্রোটোটাইপে আপনার এপিআই কি সাময়িকভাবে ব্রাউজারের মেমরিতে সংরক্ষিত হয় এবং সরাসরি প্রোভাইডার এন্ডপয়েন্টে পাঠানো হয়। ব্রাউজার ডেভেলপার টুলসে এটি দৃশ্যমান হতে পারে। কোনো শেয়ার্ড বা প্রোডাকশন সিক্রেট কি ব্যবহার করবেন না।'
                        : 'In this client-side prototype, your API key is held ephemerally in browser memory and sent directly to provider APIs. It may be visible in browser DevTools network tab. Do not use shared or high-privilege production credentials.'}
                    </div>
                    <label className="flex items-start space-x-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={userConsentedToCloud}
                        onChange={(e) => setUserConsentedToCloud(e.target.checked)}
                        className="mt-0.5 rounded border-[#CBD5E1] text-[#087E78] focus:ring-0"
                      />
                      <span className="text-[11px] text-[#657481] leading-snug">
                        আমি স্বীকার করছি যে প্রামাণ্য নথির ছবি ও বিবরণ ক্লাউড এআই মডেলে পাঠানো হবে। ব্যক্তিগত তথ্য (নাম, ফোন, ঠিকানা) ক্লায়েন্টেই মিনিমাইজ ও স্ক্রাব (Redacted) করা হয়।
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section A: Grievance Category & Cause of Action Date */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-[#192B38]">
                  {language === 'bn' ? 'অভিযোগের আইনি ক্যাটাগরি:' : 'Grievance Category:'}
                </label>
                <select
                  value={grievanceType}
                  onChange={(e) => setGrievanceType(e.target.value as ConsumerGrievanceType)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F6F8FA] border border-[#E4E9ED] text-[#192B38] focus:outline-none focus:border-[#087E78] focus:bg-white transition"
                >
                  <option value="product_not_delivered">প্রতিশ্রুত পণ্য বা সেবা সরবরাহ না করা (ধারা ৪৫)</option>
                  <option value="wrong_product">ভুল বা ভিন্ন পণ্য সরবরাহ (ধারা ৪৫)</option>
                  <option value="damaged_product">ক্ষতিগ্রস্ত বা ভাঙা পণ্য ডেলিভারি (ধারা ৪৫)</option>
                  <option value="refund_refused">প্রতিশ্রুত রিফান্ড বা অর্থ ফেরত অস্বীকৃতি (ধারা ৪৫)</option>
                  <option value="payment_dispute">নির্ধারিত মূল্যের অধিক মূল্যে বিক্রয় (ধারা ৪০)</option>
                  <option value="warranty_dispute">ওয়ারেন্টি প্রদানে অস্বীকৃতি (ধারা ৪৫)</option>
                  <option value="misleading_ad">মিথ্যা ও প্রতারণামূলক বিজ্ঞাপন (ধারা ৪৪)</option>
                  <option value="counterfeit_product">নকল বা জাল পণ্য প্রস্তুত/বিপণন (ধারা ৫০/৪৪)</option>
                  <option value="adulterated_goods">ভেজাল পণ্য বিক্রয় (ধারা ৪১)</option>
                  <option value="seller_communication">যোগাযোগ বিচ্ছিন্ন বা ক্রেতাকে ব্লক করা (ধারা ৪৫)</option>
                  <option value="other_consumer_issue">অন্যান্য ভোক্তা অধিকার লঙ্ঘন</option>
                </select>
              </div>

              {/* Crucial Cause of Action Date for Section 60 */}
              <div className="space-y-1.5">
                <label className="font-bold text-amber-800 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'bn' ? 'ঘটনা বা কারণ উদ্ভবের তারিখ (ধারা ৬০):' : 'Cause-of-Action Date (Section 60):'}</span>
                </label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-amber-50/50 border border-amber-300 text-[#192B38] focus:outline-none focus:border-amber-600 transition text-xs sm:text-sm"
                />
                <span className="text-[10px] text-[#657481] block leading-relaxed">
                  {language === 'bn'
                    ? 'ঐচ্ছিক: ক্রয়ের তারিখ নয়, যে তারিখে বিক্রেতা প্রতিশ্রুতি ভঙ্গ করেছে (cause of action) সেই তারিখ দিন। ফাঁকা রাখলে স্বয়ংক্রিয়ভাবে আজকের তারিখ বসানো হবে না।'
                    : 'Optional: Date when breach/failure occurred (cause of action). If left blank, today\'s date will not be fabricated.'}
                </span>
              </div>
            </div>
          </div>

          {/* Section B: Product & Seller Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-[#192B38]">
                {language === 'bn' ? 'পণ্যের নাম:' : 'Product Name:'}
              </label>
              <input
                type="text"
                placeholder="e.g. Sony WH-1000XM5 Headphones"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#F6F8FA] border border-[#E4E9ED] text-[#192B38] placeholder-slate-400 focus:outline-none focus:border-[#087E78] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#192B38]">
                {language === 'bn' ? 'ব্র্যান্ড:' : 'Brand (Claimed):'}
              </label>
              <input
                type="text"
                placeholder="e.g. Sony / Apple"
                value={productBrand}
                onChange={(e) => setProductBrand(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#F6F8FA] border border-[#E4E9ED] text-[#192B38] placeholder-slate-400 focus:outline-none focus:border-[#087E78] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#192B38]">
                {language === 'bn' ? 'বিক্রেতা / পেজের নাম:' : 'Seller / Shop Name:'}
              </label>
              <input
                type="text"
                placeholder="e.g. Gadget Vault BD"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#F6F8FA] border border-[#E4E9ED] text-[#192B38] placeholder-slate-400 focus:outline-none focus:border-[#087E78] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#192B38]">
                {language === 'bn' ? 'প্ল্যাটফর্ম:' : 'Platform:'}
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#F6F8FA] border border-[#E4E9ED] text-[#192B38] focus:outline-none focus:border-[#087E78] focus:bg-white"
              >
                <option value="facebook_page">Facebook Page / F-Commerce</option>
                <option value="daraz">Daraz Marketplace</option>
                <option value="chaldal">Chaldal / E-commerce</option>
                <option value="standalone_website">Standalone Website</option>
                <option value="physical_store">Physical Retail Shop</option>
              </select>
            </div>
          </div>

          {/* Section C: Financial Consideration & TrxID */}
          <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#E4E9ED] space-y-4">
            <div className="font-bold text-[#087E78] flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4" />
              <span>{language === 'bn' ? 'আর্থিক লেনদেন ও ট্রানজেকশন তথ্য:' : 'Financial Consideration & TrxID:'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-[#657481]">
                  {language === 'bn' ? 'পরিশোধিত মূল্য (টাকা):' : 'Paid Amount (BDT):'}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 8500"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E4E9ED] text-[#192B38] font-mono focus:outline-none focus:border-[#087E78]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#657481]">
                  {language === 'bn' ? 'বাজারদর / MSRP (টাকা):' : 'MSRP / Regular Price:'}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 38000"
                  value={fairMarketPrice}
                  onChange={(e) => setFairMarketPrice(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E4E9ED] text-[#192B38] font-mono focus:outline-none focus:border-[#087E78]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#657481]">
                  {language === 'bn' ? 'লেনদেন আইডি / TrxID:' : 'MFS TrxID / Ref:'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. BK9X81729L"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E4E9ED] text-[#192B38] font-mono uppercase focus:outline-none focus:border-[#087E78]"
                />
              </div>
            </div>
          </div>

          {/* Section D: Multi-File Genuine Evidence Upload */}
          <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#E4E9ED] space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-[#087E78] flex items-center space-x-1.5">
                <Upload className="w-4 h-4" />
                <span>{language === 'bn' ? 'ডিজিটাল প্রমাণপত্র আপলোড (JPG, PNG, WebP, PDF):' : 'Upload Evidence Files:'}</span>
              </div>
              <span className="text-[11px] text-[#657481] font-mono">
                {uploadedFiles.length} {language === 'bn' ? 'টি ফাইল সংযুক্ত' : 'files attached'}
              </span>
            </div>

            <label className="border-2 border-dashed border-[#CBD5E1] hover:border-[#087E78] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-white">
              <Upload className="w-6 h-6 text-[#8E9BA7] mb-1" />
              <span className="text-xs font-semibold text-[#192B38]">
                {language === 'bn'
                  ? 'ক্রয় রসিদ, ফেসবুক বিজ্ঞাপনের স্ক্রিনশট ও চ্যাট হিস্ট্রি ফাইল টানুন বা ব্রাউজ করুন'
                  : 'Click or drag receipt, advertisement screenshot & chat history'}
              </span>
              <span className="text-[10px] text-[#8E9BA7] mt-0.5">
                সমর্থিত ফরম্যাট: JPG, JPEG, PNG, WebP, PDF (সর্বোচ্চ ১০ এমবি)
              </span>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug flex items-start space-x-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {language === 'bn'
                  ? 'গোপনীয়তা সতর্কতা: ছবিতে থাকা ব্যক্তিগত তথ্য (NID, ব্যাংক অ্যাকাউন্ট, পিন) স্বয়ংক্রিয়ভাবে ফিল্টার হয় না। আপনি যে ছবিগুলো নির্বাচন করবেন কেবল সেগুলোই ক্লাউড এআই প্রোভাইডারের কাছে যাবে। আপনি চাইলে সম্পূর্ণ লোকাল অফলাইন মোড ব্যবহার করতে পারেন।'
                  : 'Privacy Advisory: Image pixels are not automatically redacted. Only files explicitly checked will be transmitted to the external cloud model. Local-only inspection is always available.'}
              </span>
            </div>

            {/* Uploaded File List with Thumbnail Preview and Selective Cloud Inclusion */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-[#192B38] block">
                  {language === 'bn' ? 'সংযুক্ত নথিপত্র ও ক্লাউড ট্রান্সমিশন নির্বাচন:' : 'Attached Evidence & Cloud Transmission Choices:'}
                </span>
                {uploadedFiles.map((f, idx) => {
                  const isImage = f.type.startsWith('image/');
                  const isIncludedInCloud = cloudIncludedFiles.has(f.name);
                  return (
                    <div
                      key={`${f.name}-${idx}`}
                      className="p-2.5 rounded-lg bg-white border border-[#E4E9ED] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        {isImage ? (
                          <div className="w-8 h-8 rounded bg-[#F6F8FA] border border-[#E4E9ED] overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={URL.createObjectURL(f)}
                              alt={f.name}
                              className="w-full h-full object-cover"
                              onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded bg-rose-50 text-rose-600 border border-rose-200 shrink-0 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                        <div className="truncate">
                          <span className="truncate text-[#192B38] text-xs font-medium block">{f.name}</span>
                          <span className="text-[10px] text-[#8E9BA7] font-mono">
                            {(f.size / 1024).toFixed(0)} KB • {isImage ? 'ইমেজ' : 'পিডিএফ ডকুমেন্ট'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
                        {selectedProvider !== 'local_deterministic' && (
                          <label className="flex items-center space-x-1.5 text-[11px] text-[#657481] cursor-pointer bg-[#F6F8FA] px-2 py-1 rounded border border-[#E4E9ED]">
                            <input
                              type="checkbox"
                              checked={isIncludedInCloud}
                              onChange={() => handleToggleCloudInclude(f.name)}
                              className="rounded border-[#CBD5E1] text-[#087E78] focus:ring-0 w-3.5 h-3.5"
                            />
                            <span>{language === 'bn' ? 'ক্লাউড এআই-তে পাঠান' : 'Send to Cloud AI'}</span>
                          </label>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="p-1 text-[#8E9BA7] hover:text-rose-600 transition"
                          aria-label="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section E: Complainant Details & Incident Narrative */}
          <div className="space-y-3 pt-2 border-t border-[#EDF1F4]">
            <div className="font-bold text-[#192B38] flex items-center space-x-1.5">
              <User className="w-4 h-4 text-[#087E78]" />
              <span>{language === 'bn' ? 'অভিযোগকারী নাগরিকের তথ্য ও ঘটনার বিবরণ:' : 'Complainant & Incident Details:'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="আপনার নাম (Complainant Name)"
                value={complainantName}
                onChange={(e) => setComplainantName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F6F8FA] border border-[#E4E9ED] text-[#192B38] focus:outline-none focus:border-[#087E78] focus:bg-white text-xs sm:text-sm"
              />
              <input
                type="text"
                placeholder="মোবাইল নম্বর (Phone)"
                value={complainantPhone}
                onChange={(e) => setComplainantPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F6F8FA] border border-[#E4E9ED] text-[#192B38] focus:outline-none focus:border-[#087E78] focus:bg-white text-xs sm:text-sm"
              />
              <input
                type="text"
                placeholder="ঠিকানা (Address)"
                value={complainantAddress}
                onChange={(e) => setComplainantAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F6F8FA] border border-[#E4E9ED] text-[#192B38] focus:outline-none focus:border-[#087E78] focus:bg-white text-xs sm:text-sm"
              />
            </div>

            <textarea
              rows={3}
              placeholder="ঘটনার সংক্ষিপ্ত বিবরণ (e.g. ৩ দিনে ডেলিভারির প্রতিশ্রুতি দিয়ে অগ্রিম টাকা নিয়ে পণ্য পাঠায়নি...)"
              value={incidentDetail}
              onChange={(e) => setIncidentDetail(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#F6F8FA] border border-[#E4E9ED] text-[#192B38] placeholder-slate-400 leading-relaxed focus:outline-none focus:border-[#087E78] focus:bg-white"
            />
          </div>

          {/* Legal Disclaimer Callout with Correct DNCRP Email */}
          <div className="p-3 rounded-lg bg-[#EEF5FB] border border-[#B6CEE0] text-[11px] text-[#1B65A4] flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-[#1B65A4] shrink-0 mt-0.5" />
            <span>
              {language === 'bn'
                ? 'আইনি ঘোষণা: কেনাসাথী একটি স্বাধীন সিভিক-টেক প্ল্যাটফর্ম। ধারা ৬০ অনুযায়ী ঘটনার ৩০ দিনের মধ্যে নালিশ আবশ্যক। জাতীয় ভোক্তা অভিযোগ কেন্দ্রের অফিশিয়াল ইমেইল: nccc@dncrp.gov.bd এবং সরাসরি পোর্টাল: ccms.dncrp.com।'
                : 'Disclaimer: Independent civic-tech platform under CRPA 2009. Section 60 mandates complaint within 30 days. National Consumer Complaint Centre email: nccc@dncrp.gov.bd; portal: ccms.dncrp.com.'}
            </span>
          </div>

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="p-3 rounded-lg bg-[#E8F5F2] border border-[#A3D7CB] text-[#087E78] font-mono text-center flex items-center justify-center space-x-2">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[#087E78] border-t-transparent animate-spin" />
              <span>{progressMsg}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#EDF1F4]">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="ks-btn ks-btn-secondary text-xs"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="ks-btn ks-btn-teal text-xs font-bold shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isProcessing
                  ? (language === 'bn' ? 'বিশ্লেষণ চলছে...' : 'Auditing...')
                  : (language === 'bn' ? 'ফরেনসিক অডিট ও নালিশ প্রস্তুত করুন' : 'Run Audit & Prepare Complaint')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
