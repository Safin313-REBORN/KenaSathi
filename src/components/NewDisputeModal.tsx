import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Upload,
  ShoppingBag,
  Sparkles,
  Key,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Calendar,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
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
  initialNotice?: string | null;
}

export const NewDisputeModal: React.FC<NewDisputeModalProps> = ({
  isOpen,
  onClose,
  onSubmitNewCase,
  language,
  initialNotice,
}) => {
  // Step state: 1 to 5
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form fields
  const [productName, setProductName] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('facebook_page');
  const [grievanceType, setGrievanceType] = useState<ConsumerGrievanceType>('product_not_delivered');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [fairMarketPrice, setFairMarketPrice] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [causeOfActionDate, setCauseOfActionDate] = useState('');
  const [complainantName, setComplainantName] = useState('');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [complainantAddress, setComplainantAddress] = useState('');
  const [incidentDetail, setIncidentDetail] = useState('');

  // Uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  // Track consent by File identity. Filenames are not unique, so using them as
  // consent keys could include an unselected same-named file in a cloud request.
  const [cloudIncludedFiles, setCloudIncludedFiles] = useState<Set<File>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [processingError, setProcessingError] = useState('');

  // AI Engine Settings (Zero plain secret storage)
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'local_deterministic' | 'gemini' | 'openai'>('local_deterministic');
  const [ephemeralApiKey, setEphemeralApiKey] = useState('');
  const [userConsentedToCloud, setUserConsentedToCloud] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    const parent = dialog?.parentElement;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const siblings = parent
      ? Array.from(parent.children).filter((child) => child !== dialog) as HTMLElement[]
      : [];
    const previousInertStates = siblings.map((element) => ({ element, inert: element.inert }));
    siblings.forEach((element) => {
      element.inert = true;
    });

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusFirstControl = () => {
      dialog?.querySelector<HTMLElement>('#btn-close-new-dispute')?.focus();
    };
    const frame = window.requestAnimationFrame(focusFirstControl);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      previousInertStates.forEach(({ element, inert }) => {
        element.inert = inert;
      });
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const maxSizeBytes = 10 * 1024 * 1024;
      const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
      const newFiles = selectedFiles.filter((file) => file.size <= maxSizeBytes && supportedTypes.has(file.type));
      const rejectedFiles = selectedFiles.length - newFiles.length;
      setProcessingError(rejectedFiles > 0
        ? (language === 'bn'
          ? `${rejectedFiles}টি ফাইল যোগ হয়নি। JPG, PNG, WebP বা PDF ফাইল ১০ এমবির মধ্যে দিন।`
          : `${rejectedFiles} file(s) were not added. Choose JPG, PNG, WebP, or PDF files up to 10 MB.`)
        : '');
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      // Allow choosing the same file again after a validation error.
      e.target.value = '';
    }
  };

  const handleToggleCloudInclude = (file: File) => {
    setCloudIncludedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(file)) {
        next.delete(file);
      } else {
        next.add(file);
      }
      return next;
    });
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    setCloudIncludedFiles((prev) => {
      const next = new Set(prev);
      if (fileToRemove) next.delete(fileToRemove);
      return next;
    });
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLoadFictionalDemoPreset = () => {
    const demo = KenaSathiStorage.loadFictionalDemo();
    onSubmitNewCase(demo);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingError('');
    setIsProcessing(true);
    setProgressMsg(language === 'bn' ? 'নথিপত্র প্রক্রিয়া করা হচ্ছে...' : 'Processing evidence files...');

    try {
      // 1. Process files locally
      const processedEvidence = await processUploadedEvidenceFiles(
        uploadedFiles,
        incidentDetail.trim()
      );

      // Filter cloud transmission: only attach dataUrl (bytes) for user-consented files
      const evidenceForAnalysis = processedEvidence.evidenceItems.map((item, index) => {
        const isIncludedInCloud = cloudIncludedFiles.has(uploadedFiles[index]);
        if (!isIncludedInCloud && selectedProvider !== 'local_deterministic') {
          return {
            ...item,
            dataUrl: undefined, // Strip bytes from external cloud payload
          };
        }
        return item;
      });

      // 2. Run analysis — NEVER auto-populate today's date if empty (Preserve missing dates honestly)
      const sanitizedCauseOfActionDate = causeOfActionDate.trim() ? causeOfActionDate.trim() : undefined;
      const sanitizedIncidentDate = incidentDate.trim() ? incidentDate.trim() : sanitizedCauseOfActionDate;

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
          purchaseDate: purchaseDate.trim() || undefined,
          discoveryDate: incidentDate.trim() || undefined,
          causeOfActionDate: sanitizedCauseOfActionDate,
          incidentDate: sanitizedCauseOfActionDate || sanitizedIncidentDate,
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
      setProcessingError(language === 'bn'
        ? 'তথ্য সংরক্ষণ করা যায়নি। ফাইলের ধরন ও আকার যাচাই করে আবার চেষ্টা করুন। সমস্যা চললে ফাইল ছাড়া সংরক্ষণ করে পরে প্রমাণ যোগ করুন।'
        : 'We could not save this case. Check the file type and size, then try again. If the problem continues, save without files and add evidence later.');
    } finally {
      setIsProcessing(false);
      setProgressMsg('');
    }
  };

  const steps = [
    { number: 1, titleBn: '১. বিরোধ ও বিক্রেতা', titleEn: '1. Dispute & Seller' },
    { number: 2, titleBn: '২. লেনদেন ও তারিখ', titleEn: '2. Payment & Date' },
    { number: 3, titleBn: '৩. প্রমাণাদি', titleEn: '3. Evidence' },
    { number: 4, titleBn: '৪. অভিযোগকারী ও বিবরণ', titleEn: '4. Complainant' },
    { number: 5, titleBn: '৫. পর্যালোচনা', titleEn: '5. Review' },
  ];

  return (
      <div ref={dialogRef} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto overscroll-contain animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="new-dispute-title" tabIndex={-1}>
      <div className="relative w-full max-w-3xl my-6 rounded-md border border-[#DDE4DF] bg-white shadow-xl overflow-hidden flex flex-col max-h-[92vh] overscroll-contain">
        {/* Modal Masthead */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-[#DDE4DF] bg-[#F5F7F5]">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded bg-[#176B53] text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 id="new-dispute-title" className="text-base sm:text-lg font-bold text-[#172B3A]">
                {language === 'bn' ? 'নতুন বিরোধ বা ক্রয় তথ্য যাচাই' : 'New Consumer Dispute Intake'}
              </h3>
              <p className="hidden sm:block text-xs text-[#526359]">
                {language === 'bn'
                  ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ অনুসারে প্রমাণাদি যাচাই ও অভিযোগ প্রস্তুত'
                  : 'Evidence-based dispute intake & CRPA 2009 statutory guidance'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadFictionalDemoPreset}
              className="ks-btn ks-btn-secondary shrink-0"
              title="Load demo scenario for testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#176B53]" />
              <span>{language === 'bn' ? 'নমুনা দেখুন' : 'Load demo'}</span>
            </button>
            <button
              id="btn-close-new-dispute"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-[#526359] hover:text-[#172B3A] hover:bg-[#DDE4DF] transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Guided Stepper Tabs */}
        <div className="px-6 py-3 border-b border-[#DDE4DF] bg-[#F5F7F5] flex items-center justify-between overflow-x-auto gap-2">
          {steps.map((st) => {
            const isCompleted = currentStep > st.number;
            const isCurrent = currentStep === st.number;

            return (
              <button
                key={st.number}
                id={`dispute-step-tab-${st.number}`}
                data-step={st.number}
                type="button"
                onClick={() => setCurrentStep(st.number)}
                className={`min-h-[44px] px-3.5 py-1.5 rounded text-sm font-bold whitespace-nowrap transition-colors duration-fast flex items-center space-x-2 border ${
                  isCurrent
                    ? 'bg-[#176B53] text-white border-[#176B53] shadow-sm'
                    : isCompleted
                    ? 'bg-[#EAF3EE] text-[#176B53] border-[#ABCFC3]'
                    : 'bg-white text-[#526359] border-[#DDE4DF] hover:border-[#C2CDC6]'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-xs ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-[#176B53] text-white'
                      : 'bg-[#F5F7F5] text-[#526359]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : st.number}
                </span>
                <span>{language === 'bn' ? st.titleBn : st.titleEn}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-sm">
          {initialNotice && (
            <div className="p-3.5 rounded bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{initialNotice}</span>
            </div>
          )}

          {/* STEP 1: Grievance Category & Seller Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-b border-[#DDE4DF] pb-2">
                <h4 className="font-bold text-[#172B3A] text-sm">
                  {language === 'bn' ? '১. বিরোধের ধরন ও বিক্রেতার বিবরণ' : '1. Grievance Category & Seller Details'}
                </h4>
                <p className="text-xs text-[#526359]">
                  {language === 'bn'
                    ? 'অভিযোগের আইনি ক্যাটাগরি এবং যে প্ল্যাটফর্ম বা দোকান থেকে ক্রয় করেছেন তার তথ্য।'
                    : 'Select statutory violation category and seller identity details.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#172B3A]">
                  {language === 'bn' ? 'অভিযোগের আইনি ক্যাটাগরি:' : 'Grievance Category:'}
                </label>
                <select
                  value={grievanceType}
                  onChange={(e) => setGrievanceType(e.target.value as ConsumerGrievanceType)}
                  className="w-full px-3.5 py-2.5 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#26352E] focus:outline-none focus:border-[#176B53] focus:bg-white transition"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#172B3A]">
                    {language === 'bn' ? 'পণ্যের নাম:' : 'Product Name:'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sony WH-1000XM5 Headphones"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#26352E] focus:outline-none focus:border-[#176B53] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#172B3A]">
                    {language === 'bn' ? 'ব্র্যান্ড:' : 'Brand (Claimed):'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sony / Apple"
                    value={productBrand}
                    onChange={(e) => setProductBrand(e.target.value)}
                    className="w-full px-3.5 py-2 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#26352E] focus:outline-none focus:border-[#176B53] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#172B3A]">
                    {language === 'bn' ? 'বিক্রেতা / পেজের নাম:' : 'Seller / Shop Name:'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gadget Vault BD (বিক্রেতা)"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#26352E] focus:outline-none focus:border-[#176B53] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#172B3A]">
                    {language === 'bn' ? 'প্ল্যাটফর্ম:' : 'Platform:'}
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as PlatformType)}
                    className="w-full px-3.5 py-2 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#26352E] focus:outline-none focus:border-[#176B53] focus:bg-white"
                  >
                    <option value="facebook_page">Facebook Page / F-Commerce</option>
                    <option value="daraz">Daraz Marketplace</option>
                    <option value="chaldal">Chaldal / E-commerce</option>
                    <option value="standalone_website">Standalone Website</option>
                    <option value="physical_store">Physical Retail Shop</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Consideration & Statutory Date */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-b border-[#DDE4DF] pb-2">
                <h4 className="font-bold text-[#172B3A] text-sm">
                  {language === 'bn' ? '২. আর্থিক লেনদেন ও আইনি তামাদি তারিখ' : '2. Financial Consideration & Statutory Date'}
                </h4>
                <p className="text-xs text-[#526359]">
                  {language === 'bn'
                    ? 'পরিশোধিত মূল্য, লেনদেন নম্বর এবং ধারা ৬০ অনুসারে কারণ উদ্ভবের তারিখ।'
                    : 'Payment amount, transaction ID, and cause-of-action date for Section 60.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#172B3A]">
                    {language === 'bn' ? 'পরিশোধিত মূল্য (টাকা):' : 'Paid Amount (BDT):'}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 8500"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#26352E] font-mono focus:outline-none focus:border-[#176B53]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#172B3A]">
                    {language === 'bn' ? 'বাজারদর / MSRP (টাকা):' : 'MSRP / Regular Price:'}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 38000"
                    value={fairMarketPrice}
                    onChange={(e) => setFairMarketPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#26352E] font-mono focus:outline-none focus:border-[#176B53]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#172B3A]">
                    {language === 'bn' ? 'লেনদেন আইডি / TrxID:' : 'MFS TrxID / Ref:'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BK9X81729L"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#26352E] font-mono uppercase focus:outline-none focus:border-[#176B53]"
                  />
                </div>
              </div>

              {/* Explicit 3-Date Distinction: Purchase Date, Incident Date, Cause-of-Action Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Purchase / Order Date */}
                <div className="p-3 rounded bg-[#F5F7F5] border border-[#DDE4DF] space-y-1">
                  <label className="font-semibold text-[#172B3A] flex items-center space-x-1 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#526359]" />
                    <span>{language === 'bn' ? 'ক্রয় / অর্ডারের তারিখ:' : 'Purchase / Order Date:'}</span>
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-[#DDE4DF] text-[#26352E] focus:outline-none focus:border-[#176B53] text-xs"
                  />
                  <span className="text-xs text-[#526359] block">
                    {language === 'bn' ? 'পণ্য বা সেবা কেনার দিন' : 'When order placed'}
                  </span>
                </div>

                {/* 2. Incident / Discovery Date */}
                <div className="p-3 rounded bg-[#F5F7F5] border border-[#DDE4DF] space-y-1">
                  <label className="font-semibold text-[#172B3A] flex items-center space-x-1 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#526359]" />
                    <span>{language === 'bn' ? 'ঘটনা / ত্রুটি জানার তারিখ:' : 'Incident / Discovery Date:'}</span>
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-[#DDE4DF] text-[#26352E] focus:outline-none focus:border-[#176B53] text-xs"
                  />
                  <span className="text-xs text-[#526359] block">
                    {language === 'bn' ? 'পণ্য পাওয়া বা ত্রুটি শনাক্তের দিন' : 'Defect noticed date'}
                  </span>
                </div>

                {/* 3. Confirmed Cause of Action Date for Section 60 */}
                <div className="p-3 rounded bg-[#FEF7EC] border border-[#FDE68A] space-y-1">
                  <label className="font-bold text-[#945607] flex items-center space-x-1 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#945607]" />
                    <span>{language === 'bn' ? 'কারণ উদ্ভবের তারিখ (ধারা ৬০):' : 'Cause-of-Action (S.60):'}</span>
                  </label>
                  <input
                    type="date"
                    value={causeOfActionDate}
                    onChange={(e) => setCauseOfActionDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-[#DDE4DF] text-[#26352E] focus:outline-none focus:border-[#945607] text-xs"
                  />
                  <span className="text-xs text-[#945607] block">
                    {language === 'bn' ? 'প্রতিকারের অধিকার সৃষ্টির দিন' : 'Breach / cause arose'}
                  </span>
                </div>
              </div>

              {/* Informational Section 60 Educational Box */}
              <div className="p-3 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-xs text-[#526359] leading-relaxed">
                {language === 'bn'
                  ? 'ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯-এর ধারা ৬০ অনুযায়ী কারণ উদ্ভব হওয়ার ৩০ দিনের মধ্যে লিখিত অভিযোগ দায়ের করতে হয়। কারণ উদ্ভবের তারিখ পরিস্থিতি অনুযায়ী নির্ধারিত হতে পারে।'
                  : 'Under Section 60 of the Consumer Rights Protection Act, 2009, a written complaint must be lodged within 30 days of the cause of action arising. The date of cause of action is determined by individual circumstances.'}
              </div>
            </div>
          )}

          {/* STEP 3: Multi-File Evidence Upload */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-b border-[#DDE4DF] pb-2">
                <h4 className="font-bold text-[#172B3A] text-sm">
                  {language === 'bn' ? '৩. ডিজিটাল প্রমাণপত্র সংযুক্তি' : '3. Evidence Documents Upload'}
                </h4>
                <p className="text-xs text-[#526359]">
                  {language === 'bn'
                    ? 'পেমেন্ট রসিদ, চালান, চ্যাট স্ক্রিনশট বা পণ্য ডেলিভারির স্লিপ।'
                    : 'Attach payment receipts, chat logs, or courier delivery slips.'}
                </p>
              </div>

              <label className="ks-dropzone group p-6 flex flex-col items-center justify-center cursor-pointer">
                <Upload className="w-7 h-7 text-[#176B53] group-hover:scale-110 transition-transform duration-standard mb-2" />
                <span className="text-sm font-semibold text-[#172B3A]">
                  {language === 'bn'
                    ? 'ক্রয় রসিদ, ইনভয়েস ও চ্যাট হিস্ট্রি ফাইল টানুন বা ব্রাউজ করুন'
                    : 'Click or drag receipt, invoice & chat screenshot files'}
                </span>
                <span className="text-xs text-[#526359] mt-1">
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

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-[#172B3A] block">
                    {language === 'bn' ? 'সংযুক্ত নথিপত্রসমূহ:' : 'Attached Evidence Files:'}
                  </span>
                  {uploadedFiles.map((f, idx) => {
                    const isImage = f.type.startsWith('image/');
                    const isIncludedInCloud = cloudIncludedFiles.has(f);
                    return (
                      <div
                        key={`${f.name}-${idx}`}
                        className="p-3 rounded bg-white border border-[#DDE4DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center space-x-3 truncate">
                          {isImage ? (
                            <div className="w-8 h-8 rounded bg-[#F5F7F5] border border-[#DDE4DF] overflow-hidden shrink-0 flex items-center justify-center">
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
                            <span className="truncate text-[#26352E] text-xs font-medium block">{f.name}</span>
                            <span className="text-xs text-[#526359] font-mono">
                              {(f.size / 1024).toFixed(0)} KB • {isImage ? 'ইমেজ' : 'পিডিএফ'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
                          {selectedProvider !== 'local_deterministic' && (
                            <label className="flex items-center space-x-1.5 text-xs text-[#526359] cursor-pointer bg-[#F5F7F5] px-2 py-1 rounded border border-[#DDE4DF]">
                              <input
                                type="checkbox"
                                checked={isIncludedInCloud}
                                onChange={() => handleToggleCloudInclude(f)}
                                className="rounded border-[#DDE4DF] text-[#176B53] focus:ring-0 w-3.5 h-3.5"
                              />
                              <span>{language === 'bn' ? 'ক্লাউড এআই-তে পাঠান' : 'Send to Cloud'}</span>
                            </label>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="p-1 text-[#526359] hover:text-[#B42318] transition"
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
          )}

          {/* STEP 4: Complainant Details & Incident Narrative */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-b border-[#DDE4DF] pb-2">
                <h4 className="font-bold text-[#172B3A] text-sm">
                  {language === 'bn' ? '৪. অভিযোগকারী নাগরিকের তথ্য ও ঘটনার বিবরণ' : '4. Complainant & Incident Details'}
                </h4>
                <p className="text-xs text-[#526359]">
                  {language === 'bn'
                    ? 'অভিযোগপত্র খসড়ায় ব্যবহারের জন্য আপনার নাম, মোবাইল এবং সুনির্দিষ্ট বিবরণ।'
                    : 'Contact information and statement of facts for the complaint draft.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="আপনার নাম (Complainant Name)"
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#26352E] focus:outline-none focus:border-[#176B53] focus:bg-white text-xs sm:text-sm"
                />
                <input
                  type="text"
                  placeholder="মোবাইল নম্বর (Phone)"
                  value={complainantPhone}
                  onChange={(e) => setComplainantPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#26352E] focus:outline-none focus:border-[#176B53] focus:bg-white text-xs sm:text-sm"
                />
                <input
                  type="text"
                  placeholder="ঠিকানা (Address)"
                  value={complainantAddress}
                  onChange={(e) => setComplainantAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#26352E] focus:outline-none focus:border-[#176B53] focus:bg-white text-xs sm:text-sm"
                />
              </div>

              <textarea
                rows={4}
                placeholder="ঘটনার সংক্ষিপ্ত ধারাবাহিক বিবরণ (e.g. গত ১২ অক্টোবর ৩ দিনে ডেলিভারির প্রতিশ্রুতি দিয়ে অগ্রিম টাকা নিয়ে পণ্য পাঠায়নি...)"
                value={incidentDetail}
                onChange={(e) => setIncidentDetail(e.target.value)}
                className="w-full p-3 rounded bg-[#F5F7F5] border border-[#DDE4DF] text-[#26352E] leading-relaxed focus:outline-none focus:border-[#176B53] focus:bg-white text-xs sm:text-sm"
              />

              {/* Processing & Privacy Configuration Drawer */}
              <div className="p-3.5 rounded bg-[#F5F7F5] border border-[#DDE4DF] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#172B3A]">
                    <ShieldCheck className="w-4 h-4 text-[#176B53]" />
                    <span>
                      {language === 'bn' ? 'প্রসেসিং মোড:' : 'Processing Mode:'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#EAF3EE] text-[#176B53] font-bold">
                      {selectedProvider === 'local_deterministic' ? (language === 'bn' ? 'অফলাইন লোকাল ইঞ্জিন' : 'Local Offline Engine') : 'Consented Cloud AI'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAiSettings(!showAiSettings)}
                    className="text-xs font-semibold text-[#176B53] hover:underline flex items-center space-x-1"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{showAiSettings ? (language === 'bn' ? 'লুকান' : 'Hide') : (language === 'bn' ? 'কনফিগারেশন' : 'Configure')}</span>
                  </button>
                </div>

                {showAiSettings && (
                  <div className="p-3 rounded bg-white border border-[#DDE4DF] space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className={`p-2.5 rounded border cursor-pointer ${selectedProvider === 'local_deterministic' ? 'bg-[#EAF3EE] border-[#176B53] text-[#176B53] font-bold' : 'bg-[#F5F7F5] border-[#DDE4DF] text-[#526359]'}`}>
                        <div className="flex items-center space-x-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          <span>লোকাল অফলাইন মোড</span>
                        </div>
                        <span className="text-xs block text-[#526359] font-normal mt-0.5">১০০% ডিভাইসে সীমাবদ্ধ</span>
                        <input
                          type="radio"
                          name="provider"
                          className="hidden"
                          checked={selectedProvider === 'local_deterministic'}
                          onChange={() => setSelectedProvider('local_deterministic')}
                        />
                      </label>

                      <label className={`p-2.5 rounded border cursor-pointer ${selectedProvider === 'gemini' ? 'bg-[#EAF3EE] border-[#176B53] text-[#176B53] font-bold' : 'bg-[#F5F7F5] border-[#DDE4DF] text-[#526359]'}`}>
                        <div className="flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Google Gemini AI</span>
                        </div>
                        <span className="text-xs block text-[#526359] font-normal mt-0.5">ঐচ্ছিক ভিশন মডেল</span>
                        <input
                          type="radio"
                          name="provider"
                          className="hidden"
                          checked={selectedProvider === 'gemini'}
                          onChange={() => setSelectedProvider('gemini')}
                        />
                      </label>
                    </div>

                    {selectedProvider !== 'local_deterministic' && (
                      <div className="space-y-2 pt-2 border-t border-[#DDE4DF]">
                        <input
                          type="password"
                          placeholder="আপনার সাময়িক API Key প্রদান করুন (ঐচ্ছিক)"
                          value={ephemeralApiKey}
                          onChange={(e) => setEphemeralApiKey(e.target.value)}
                          className="w-full px-3 py-1.5 rounded border border-[#DDE4DF] bg-white text-[#26352E] font-mono text-xs focus:outline-none focus:border-[#176B53]"
                        />
                        <label className="flex items-start space-x-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={userConsentedToCloud}
                            onChange={(e) => setUserConsentedToCloud(e.target.checked)}
                            className="mt-0.5 rounded border-[#DDE4DF] text-[#176B53] focus:ring-0"
                          />
                          <span className="text-xs text-[#526359] leading-snug">
                            আমি নির্বাচিত তথ্য Google-এর ক্লাউড এআই সেবায় পাঠাতে সম্মতি দিচ্ছি। কিছু ফোন নম্বর, এনআইডি ও ইমেইল-ধাঁচের তথ্য লেখার মধ্যে মাস্ক করা হয়; ছবি বা স্ক্যান করা নথিতে থাকা তথ্য মাস্ক নাও হতে পারে।
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Final Review & Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-b border-[#DDE4DF] pb-2">
                <h4 className="font-bold text-[#172B3A] text-sm">
                  {language === 'bn' ? '৫. তথ্য পর্যালোচনা ও নিশ্চিতকরণ' : '5. Review & Final Confirmation'}
                </h4>
                <p className="text-xs text-[#526359]">
                  {language === 'bn'
                    ? 'সংরক্ষণ ও অভিযোগ খসড়া তৈরির পূর্বে আপনার প্রদত্ত তথ্য যাচাই করে নিন।'
                    : 'Verify your submitted details before saving and generating the draft.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F5F7F5] p-4 rounded border border-[#DDE4DF]">
                <div>
                  <span className="text-[#526359] block">{language === 'bn' ? 'পণ্য:' : 'Product:'}</span>
                  <strong className="text-[#26352E]">{productName || 'অনলাইন ক্রয় বিরোধ'}</strong>
                </div>
                <div>
                  <span className="text-[#526359] block">{language === 'bn' ? 'বিক্রেতা:' : 'Seller:'}</span>
                  <strong className="text-[#26352E]">{sellerName || 'অনির্দিষ্ট বিক্রেতা'}</strong>
                </div>
                <div>
                  <span className="text-[#526359] block">{language === 'bn' ? 'পরিশোধিত মূল্য:' : 'Paid Amount:'}</span>
                  <strong className="text-[#26352E] font-mono">{purchasePrice ? `৳${purchasePrice}` : 'উল্লিখিত নয়'}</strong>
                </div>
                <div>
                  <span className="text-[#526359] block">{language === 'bn' ? 'লেনদেন আইডি:' : 'TrxID:'}</span>
                  <strong className="text-[#26352E] font-mono">{transactionRef || 'উল্লিখিত নয়'}</strong>
                </div>
                <div>
                  <span className="text-[#526359] block">{language === 'bn' ? 'ক্রয় / অর্ডারের তারিখ:' : 'Purchase Date:'}</span>
                  <strong className="text-[#26352E]">{purchaseDate || (language === 'bn' ? 'দেওয়া হয়নি' : 'Not provided')}</strong>
                </div>
                <div>
                  <span className="text-[#526359] block">{language === 'bn' ? 'ঘটনা / ত্রুটি জানার তারিখ:' : 'Incident Date:'}</span>
                  <strong className="text-[#26352E]">{incidentDate || (language === 'bn' ? 'দেওয়া হয়নি' : 'Not provided')}</strong>
                </div>
                <div>
                  <span className="text-[#526359] block">{language === 'bn' ? 'কারণ উদ্ভবের তারিখ (ধারা ৬০):' : 'Cause of Action Date (S.60):'}</span>
                  <strong className="text-[#176B53]">{causeOfActionDate || (language === 'bn' ? 'ফাঁকা (পরবর্তীতে যুক্ত করুন)' : 'Blank (Add later)')}</strong>
                </div>
                <div>
                  <span className="text-[#526359] block">{language === 'bn' ? 'সংযুক্ত ফাইল:' : 'Attached Evidence:'}</span>
                  <strong className="text-[#26352E]">{uploadedFiles.length} টি ফাইল</strong>
                </div>
              </div>

              {(!causeOfActionDate || uploadedFiles.length === 0) && (
                <div className="p-3 rounded bg-amber-50 border border-amber-300 text-xs text-amber-950 leading-relaxed" role="status">
                  <strong>{language === 'bn' ? 'পর্যালোচনার জন্য প্রয়োজনীয় তথ্য' : 'Details to review'}</strong>
                  <ul className="mt-1 list-disc pl-5 space-y-1">
                    {!causeOfActionDate && (
                      <li>{language === 'bn'
                        ? 'ধারা ৬০-এর সময় গণনার জন্য কারণ উদ্ভবের তারিখ নিশ্চিত করুন। তারিখ অনিশ্চিত হলে অনুমান করবেন না; DNCRP-এর সঙ্গে যাচাই করুন।'
                        : 'Confirm the cause-of-action date to calculate the Section 60 window. If unsure, do not guess; check with DNCRP.'}</li>
                    )}
                    {uploadedFiles.length === 0 && (
                      <li>{language === 'bn'
                        ? 'এখনো কোনো প্রমাণ ফাইল যোগ করা হয়নি। প্রমাণ থাকলে পরে যোগ করতে পারবেন; দাখিলের নিয়ম DNCRP-এর সঙ্গে যাচাই করুন।'
                        : 'No evidence files are attached yet. You can add them later if available; confirm filing requirements with DNCRP.'}</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Legal Notice */}
              <div className="p-3 rounded bg-[#EAF3EE] border border-[#ABCFC3] text-xs text-[#124A3B] leading-relaxed">
                {language === 'bn'
                  ? 'স্মারকলিপি: সাবমিট বাটনে ক্লিক করলে আপনার তথ্য ব্রাউজারের স্থানীয় স্টোরেজে সংরক্ষিত হবে এবং একটি প্রাথমিক অভিযোগপত্র তৈরি হবে।'
                  : 'Notice: Clicking submit saves data to your local browser storage and generates a structured citizen draft.'}
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="p-3 rounded bg-[#EAF3EE] border border-[#ABCFC3] text-[#176B53] font-mono text-center flex items-center justify-center space-x-2">
              <div className="w-4 h-4 rounded-full border-2 border-[#176B53] border-t-transparent animate-spin" />
              <span>{progressMsg}</span>
            </div>
          )}

          {processingError && (
            <div className="p-3 rounded bg-rose-50 border border-rose-300 text-rose-900 text-sm leading-relaxed" role="alert">
              {processingError}
            </div>
          )}

          {/* Stepper Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#DDE4DF]">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="ks-btn ks-btn-secondary text-xs"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>

            <div className="flex items-center space-x-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="ks-btn ks-btn-secondary text-xs flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</span>
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="ks-btn ks-btn-primary group text-xs font-bold flex items-center space-x-1"
                >
                  <span>{language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-standard ease-standard group-hover:translate-x-[2px]" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="ks-btn ks-btn-primary text-xs font-bold shadow-sm flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? (language === 'bn' ? 'বিশ্লেষণ চলছে...' : 'Auditing...')
                      : (language === 'bn' ? 'সংরক্ষণ ও খসড়া প্রস্তুত করুন' : 'Save & Prepare Draft')}
                  </span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
