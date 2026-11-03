import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { ServicesView } from './components/ServicesView';
import { PurchaseInspectionView } from './components/PurchaseInspectionView';
import { CaseWorkspaceView } from './components/CaseWorkspaceView';
import { DocumentsView } from './components/DocumentsView';
import { ConsumerGuideDirectory } from './components/ConsumerGuideDirectory';
import { NewDisputeModal } from './components/NewDisputeModal';
import { OnboardingModal } from './components/OnboardingModal';
import { CommandPalette, NavigationTabType } from './components/CommandPalette';
import { LoadingOverlay } from './components/LoadingOverlay';
import { EmptyStateView } from './components/EmptyStateView';

import { ConsumerInspectionResult } from './types/consumer';
import { SAMPLE_CONSUMER_CASES } from './data/consumerScenarios';
import { KenaSathiStorage } from './services/storageService';
import { SpeechService } from './services/speechService';

import {
  Scale,
  Download,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialLang = searchParams?.get('lang') === 'en' ? 'en' : 'bn';
  const initialTabParam = searchParams?.get('tab') as NavigationTabType | null;
  const validTabs: NavigationTabType[] = ['landing', 'services', 'check_purchase', 'cases', 'documents', 'guide'];
  const initialTab = initialTabParam && validTabs.includes(initialTabParam) ? initialTabParam : 'landing';
  const initialModal = searchParams?.get('modal');
  const initialSub = searchParams?.get('sub') as 'summary' | 'timeline' | 'evidence' | 'tasks' | 'financial' | 'complaint' | null;

  const requestedCase = searchParams?.get('case') || (searchParams?.get('demo') ? 'case_headphone_nondelivery' : null);

  const [language, setLanguage] = useState<'bn' | 'en'>(initialLang);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(initialModal === 'onboarding');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewDisputeOpen, setIsNewDisputeOpen] = useState(initialModal === 'intake');
  const [isLoading] = useState(false);

  // Active Experience View (Default: Landing Page for public visitors)
  const [activeTab, setActiveTab] = useState<NavigationTabType>(initialTab);

  // Persistent Cases State
  const [customCases, setCustomCases] = useState<ConsumerInspectionResult[]>(() => {
    KenaSathiStorage.initialize();
    if (requestedCase) {
      KenaSathiStorage.loadFictionalDemo();
    }
    return KenaSathiStorage.getCases();
  });

  const [activeCustomCase, setActiveCustomCase] = useState<ConsumerInspectionResult | null>(() => {
    if (requestedCase) {
      if (SAMPLE_CONSUMER_CASES[requestedCase]) return SAMPLE_CONSUMER_CASES[requestedCase];
      return KenaSathiStorage.loadFictionalDemo();
    }
    const cases = KenaSathiStorage.getCases();
    return cases.length > 0 ? cases[0] : null;
  });

  const [consumerCaseKey, setConsumerCaseKey] = useState<string>(
    requestedCase || activeCustomCase?.id || ''
  );

  // Active sub-tab within Case Workspace
  const [caseWorkspaceSubTab, setCaseWorkspaceSubTab] = useState<
    'summary' | 'timeline' | 'evidence' | 'tasks' | 'financial' | 'complaint'
  >(initialSub || 'summary');

  // Active Resolved Consumer Case (nullable when store is completely empty)
  const consumerCase: ConsumerInspectionResult | null =
    activeCustomCase ||
    customCases.find((c) => c.id === consumerCaseKey) ||
    (consumerCaseKey && SAMPLE_CONSUMER_CASES[consumerCaseKey] ? SAMPLE_CONSUMER_CASES[consumerCaseKey] : null) ||
    (customCases.length > 0 ? customCases[0] : null) ||
    (SAMPLE_CONSUMER_CASES['case_headphone_nondelivery'] || null);

  // Synchronize document language with UI selection
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Keyboard shortcut listener for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectCase = (key: string) => {
    const allStored = KenaSathiStorage.getCases();
    const found = allStored.find((c) => c.id === key);
    if (found) {
      setActiveCustomCase(found);
      setConsumerCaseKey(found.id);
    } else if (SAMPLE_CONSUMER_CASES[key]) {
      setActiveCustomCase(SAMPLE_CONSUMER_CASES[key]);
      setConsumerCaseKey(key);
    }
  };

  const handleAddNewCase = (newCase: ConsumerInspectionResult) => {
    KenaSathiStorage.saveCase(newCase);
    const updated = KenaSathiStorage.getCases();
    setCustomCases(updated);
    setActiveCustomCase(newCase);
    setConsumerCaseKey(newCase.id);
    setCaseWorkspaceSubTab('summary');
    setActiveTab('cases');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadDemoCase = () => {
    const demo = KenaSathiStorage.loadFictionalDemo();
    const updated = KenaSathiStorage.getCases();
    setCustomCases(updated);
    setActiveCustomCase(demo);
    setConsumerCaseKey(demo.id);
    setCaseWorkspaceSubTab('summary');
    setActiveTab('cases');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCase = (id: string) => {
    KenaSathiStorage.deleteCase(id);
    const updated = KenaSathiStorage.getCases();
    setCustomCases(updated);
    if (updated.length > 0) {
      setActiveCustomCase(updated[0]);
      setConsumerCaseKey(updated[0].id);
    } else {
      setActiveCustomCase(null);
      setConsumerCaseKey('');
    }
  };

  const handleLaunchInspectorWithCase = (caseKey?: string) => {
    if (caseKey) {
      handleSelectCase(caseKey);
      setActiveTab('check_purchase');
    } else if (!consumerCase && customCases.length === 0) {
      // Direct intake modal when no case exists
      setIsNewDisputeOpen(true);
    } else {
      setActiveTab('check_purchase');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenComplaintDraft = () => {
    if (!consumerCase) {
      setIsNewDisputeOpen(true);
      return;
    }
    setCaseWorkspaceSubTab('complaint');
    setActiveTab('cases');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportData = () => {
    const jsonStr = KenaSathiStorage.exportAllDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kenasathi_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNarrateOverview = () => {
    const text =
      language === 'bn'
        ? `কেনাসাথী: ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ অনুসারে সাধারণ নাগরিক ও ক্রেতাদের কেনাকাটার তথ্য ও প্রমাণ সংরক্ষণ এবং অভিযোগের খসড়া প্রস্তুত করার স্বাধীন ডিজিটাল প্ল্যাটফর্ম।`
        : `KenaSathi: Independent civic consumer assistance platform for organizing evidence and preparing formal complaint drafts under the Consumer Rights Protection Act 2009.`;
    SpeechService.speak(text, language === 'bn' ? 'bn-BD' : 'en-US');
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isHighContrast
          ? 'high-contrast bg-black text-yellow-300'
          : 'bg-[#F4F6F5] text-[#26352E]'
      }`}
    >
      {/* Top Institutional Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'))}
        onOpenTour={() => setIsOnboardingOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNewDispute={() => setIsNewDisputeOpen(true)}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        onNarrateOverview={handleNarrateOverview}
      />

      {/* Main Experience Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading Overlay */}
        {isLoading && <LoadingOverlay language={language} />}

        {/* 1. Official Homepage Experience */}
        {activeTab === 'landing' && (
          <LandingHero
            language={language}
            onLaunchInspector={handleLaunchInspectorWithCase}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenDirectory={() => setActiveTab('guide')}
            onOpenNewDispute={() => setIsNewDisputeOpen(true)}
          />
        )}

        {/* 2. Structured Services Page Experience */}
        {(activeTab === 'services' || activeTab === 'overview') && (
          <ServicesView
            language={language}
            onOpenCheckPurchase={() => handleLaunchInspectorWithCase()}
            onOpenComplaint={handleOpenComplaintDraft}
            onOpenCases={() => setActiveTab('cases')}
            onOpenDocuments={() => setActiveTab('documents')}
            onOpenGuide={() => setActiveTab('guide')}
          />
        )}

        {/* 3. Check a Purchase & Evidence Audit */}
        {(activeTab === 'check_purchase' || activeTab === 'inspector') && (
          !consumerCase ? (
            <EmptyStateView
              language={language}
              onOpenNewDispute={() => setIsNewDisputeOpen(true)}
              onLoadDemoCase={handleLoadDemoCase}
              onOpenDirectory={() => setActiveTab('guide')}
            />
          ) : (
            <PurchaseInspectionView
              currentCase={consumerCase}
              language={language}
              onOpenNewCaseModal={() => setIsNewDisputeOpen(true)}
              onOpenComplaintBuilder={handleOpenComplaintDraft}
            />
          )
        )}

        {/* 4. My Cases Workspace */}
        {(activeTab === 'cases' || activeTab === 'risk' || activeTab === 'complaint' || activeTab === 'spatial') && (
          !consumerCase ? (
            <EmptyStateView
              language={language}
              onOpenNewDispute={() => setIsNewDisputeOpen(true)}
              onLoadDemoCase={handleLoadDemoCase}
              onOpenDirectory={() => setActiveTab('guide')}
            />
          ) : (
            <CaseWorkspaceView
              currentCase={consumerCase}
              cases={customCases}
              language={language}
              initialSubTab={caseWorkspaceSubTab}
              onSelectCase={handleSelectCase}
              onDeleteCase={handleDeleteCase}
              onOpenNewDispute={() => setIsNewDisputeOpen(true)}
            />
          )
        )}

        {/* 5. Documents & Evidence Register */}
        {activeTab === 'documents' && (
          customCases.length === 0 ? (
            <EmptyStateView
              language={language}
              onOpenNewDispute={() => setIsNewDisputeOpen(true)}
              onLoadDemoCase={handleLoadDemoCase}
              onOpenDirectory={() => setActiveTab('guide')}
            />
          ) : (
            <DocumentsView
              cases={customCases}
              language={language}
              onSelectCase={(id) => {
                handleSelectCase(id);
                setActiveTab('cases');
              }}
              onOpenNewDispute={() => setIsNewDisputeOpen(true)}
            />
          )
        )}

        {/* 6. Consumer Rights Guide & Official Directory */}
        {(activeTab === 'guide' || activeTab === 'directory') && (
          <ConsumerGuideDirectory
            language={language}
            onFileComplaint={() => setIsNewDisputeOpen(true)}
          />
        )}
      </main>

      {/* Global Modals */}
      <NewDisputeModal
        isOpen={isNewDisputeOpen}
        onClose={() => setIsNewDisputeOpen(false)}
        onSubmitNewCase={handleAddNewCase}
        language={language}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSelectCase={(caseKey: string) => handleLaunchInspectorWithCase(caseKey)}
        language={language}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectConsumerCase={(key) => {
          handleSelectCase(key);
          setActiveTab('cases');
        }}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'))}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        language={language}
      />

      {/* =========================================================================
          PROFESSIONAL PUBLIC-SERVICE INSTITUTIONAL FOOTER
         ========================================================================= */}
      <footer className="mt-16 border-t border-[#D9E0DC] bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-[#64716A]">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Top Row: Data Backup Action & Helpline Reminder */}
          <div className="p-4 rounded bg-[#F4F6F5] border border-[#D9E0DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-[#172B3A]">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#176B53]">
              <ShieldCheck className="w-4 h-4 text-[#176B53] shrink-0" />
              <span>
                {language === 'bn'
                  ? 'আপনার নথিপত্র ব্রাউজারের নিজস্ব IndexedDB স্টোরেজে নিরাপদে সংরক্ষিত রয়েছে।'
                  : 'Your evidence records are isolated securely in your local browser storage.'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="ks-btn ks-btn-secondary text-xs py-1.5 px-3 flex items-center space-x-1 font-semibold"
              title="Export all stored cases as JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#64716A]" />
              <span>{language === 'bn' ? 'নথিপত্র ব্যাকআপ (JSON)' : 'Export Backup (JSON)'}</span>
            </button>
          </div>

          {/* Main Footer Multi-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: About KenaSathi */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded bg-[#176B53] flex items-center justify-center text-white">
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-lg text-[#172B3A]">কেনাসাথী</span>
              </div>
              <p className="text-[#64716A] text-xs leading-relaxed">
                {language === 'bn'
                  ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ অনুসারে সাধারণ নাগরিক ও ক্রেতাদের কেনাকাটার তথ্য সংরক্ষণ, প্রমাণাদি যাচাই এবং আইনি অভিযোগের খসড়া প্রস্তুত সহায়তাকারী একটি স্বাধীন ডিজিটাল প্ল্যাটফর্ম।'
                  : 'Independent consumer assistance platform supporting Bangladeshi citizens with evidence organization and statutory complaint drafting under CRPA 2009.'}
              </p>
            </div>

            {/* Column 2: Available Services */}
            <div className="space-y-2">
              <div className="font-bold text-[#172B3A] uppercase text-[11px] tracking-wider">
                {language === 'bn' ? 'সেবাসমূহ' : 'Services'}
              </div>
              <div className="space-y-1.5 text-xs text-[#64716A]">
                <div>
                  <button onClick={() => setActiveTab('check_purchase')} className="hover:text-[#176B53] transition">
                    {language === 'bn' ? 'কেনাকাটার তথ্য ও প্রমাণ যাচাই' : 'Purchase & Evidence Audit'}
                  </button>
                </div>
                <div>
                  <button onClick={handleOpenComplaintDraft} className="hover:text-[#176B53] transition">
                    {language === 'bn' ? 'অভিযোগের খসড়া প্রস্তুত' : 'Complaint Draft Builder'}
                  </button>
                </div>
                <div>
                  <button onClick={() => setActiveTab('documents')} className="hover:text-[#176B53] transition">
                    {language === 'bn' ? 'আমার নথিপত্র ভল্ট' : 'Document Vault'}
                  </button>
                </div>
                <div>
                  <button onClick={() => setActiveTab('guide')} className="hover:text-[#176B53] transition">
                    {language === 'bn' ? 'ভোক্তা অধিকার নির্দেশিকা' : 'Consumer Rights Guide'}
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: National Helplines & Official Links */}
            <div className="space-y-2">
              <div className="font-bold text-[#172B3A] uppercase text-[11px] tracking-wider">
                {language === 'bn' ? 'জরুরি হেল্পলাইন ও অফিসিয়াল লিঙ্ক' : 'National Helplines'}
              </div>
              <div className="space-y-1.5 text-xs text-[#64716A]">
                <div>ভোক্তা অধিদপ্তর হটলাইন: <strong className="text-[#176B53] font-mono">16121</strong></div>
                <div>জাতীয় জরুরি কল: <strong className="text-amber-700 font-mono">999</strong></div>
                <div>সরকারি আইনি সেবা: <strong className="text-[#172B3A] font-mono">16430</strong></div>
                <div>ইমেইল: <span className="font-mono text-[#172B3A]">nccc@dncrp.gov.bd</span></div>
                <div>
                  <a
                    href="https://ccms.dncrp.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#176B53] hover:underline flex items-center space-x-1 font-semibold"
                  >
                    <span>ডিএনসিআরপি সিসিএমএস পোর্টাল</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 4: Statutory Compliance & Privacy */}
            <div className="space-y-2">
              <div className="font-bold text-[#172B3A] uppercase text-[11px] tracking-wider">
                {language === 'bn' ? 'আইনি ও গোপনীয়তা নীতি' : 'Statutory & Privacy'}
              </div>
              <div className="space-y-1 text-xs text-[#64716A]">
                <div>ধারা ৬০: ৩০ ক্যালেন্ডার দিনের তামাদি ট্র্যাকার</div>
                <div>ধারা ৭৬(৪): জরিমানা আদায় সাপেক্ষে ২৫% বিধান</div>
                <div>লোকাল ডিভাইস স্টোরেজ (সম্মতিহীন ক্লাউড শেয়ারিং নয়)</div>
                <div>নাগরিক পর্যালোচনার জন্য নিরপেক্ষ খসড়া প্রস্তুতকারক</div>
              </div>
            </div>
          </div>

          {/* Mandatory Independent Service Disclosure */}
          <div className="pt-6 border-t border-[#E8ECE9] space-y-3">
            <div className="p-3.5 rounded bg-[#F4F6F5] border border-[#D9E0DC] text-xs text-[#64716A] leading-relaxed">
              <strong className="text-[#172B3A] block mb-0.5">
                {language === 'bn' ? 'স্বাধীন প্ল্যাটফর্ম ও আইনি দায়মুক্তি বিজ্ঞপ্তি:' : 'Independent Service Disclosure:'}
              </strong>
              {language === 'bn'
                ? 'কেনাসাথী একটি স্বাধীন ভোক্তা-সহায়তা প্ল্যাটফর্ম। এটি জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর বা কোনো সরকারি প্রতিষ্ঠানের অফিসিয়াল ওয়েবসাইট নয়। এই প্ল্যাটফর্মে প্রদত্ত তথ্য ও খসড়া নাগরিকের সচেতনতা ও সহায়তার জন্য প্রস্তুতকৃত।'
                : 'KenaSathi is an independent consumer assistance platform. It is not the official website of the Directorate of National Consumer Rights Protection or any government agency. Information and drafts are provided for citizen guidance and assistance.'}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8A9790]">
              <div>
                © 2026 কেনাসাথী (KenaSathi). ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ সহায়ক স্বাধীন নাগরিক সেবা।
              </div>
              <div className="flex items-center space-x-4">
                <span>ঢাকা, বাংলাদেশ</span>
                <span>•</span>
                <span className="text-[#176B53] font-medium">নাগরিক গোপনীয়তা সুরক্ষিত</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
