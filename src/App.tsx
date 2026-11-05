import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { ServicesView } from './components/ServicesView';
import { PurchaseInspectionView } from './components/PurchaseInspectionView';
import { CaseWorkspaceView } from './components/CaseWorkspaceView';
import { DocumentsView } from './components/DocumentsView';
import { ConsumerGuideDirectory } from './components/ConsumerGuideDirectory';
import { HelpCenterView } from './components/HelpCenterView';
import { NewDisputeModal } from './components/NewDisputeModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AccessibilitySettings } from './components/AccessibilitySettings';
import { CommandPalette, NavigationTabType } from './components/CommandPalette';
import { LoadingOverlay } from './components/LoadingOverlay';
import { EmptyStateView } from './components/EmptyStateView';

import { ConsumerInspectionResult } from './types/consumer';
import { SAMPLE_CONSUMER_CASES } from './data/consumerScenarios';
import { KenaSathiStorage } from './services/storageService';
import { SpeechService } from './services/speechService';
import { useAccessibilityPreferences } from './hooks/useAccessibilityPreferences';

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
  const validTabs: NavigationTabType[] = ['landing', 'services', 'check_purchase', 'cases', 'documents', 'guide', 'help'];
  const initialTab = initialTabParam && validTabs.includes(initialTabParam) ? initialTabParam : 'landing';
  const initialModal = searchParams?.get('modal');
  const initialSub = searchParams?.get('sub') as 'summary' | 'timeline' | 'evidence' | 'tasks' | 'financial' | 'complaint' | null;

  const requestedCase = searchParams?.get('case') || (searchParams?.get('demo') ? 'case_headphone_nondelivery' : null);

  const [language, setLanguage] = useState<'bn' | 'en'>(initialLang);
  const { preferences, updatePreference, resetPreferences } = useAccessibilityPreferences();
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const closeAccessibility = useCallback(() => setIsAccessibilityOpen(false), []);
  const [activeAccessibilityTrigger, setActiveAccessibilityTrigger] = useState<HTMLElement | null>(null);
  const accessibilityTriggerRef = useRef<HTMLButtonElement>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(initialModal === 'onboarding');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandPaletteReturnFocusTarget, setCommandPaletteReturnFocusTarget] = useState<HTMLElement | null>(null);
  const [isNewDisputeOpen, setIsNewDisputeOpen] = useState(initialModal === 'intake');
  const [disputeNotice, setDisputeNotice] = useState<string | null>(null);
  const [isLoading] = useState(false);

  // Active Experience View (Default: Landing Page for public visitors)
  const [activeTab, setActiveTab] = useState<NavigationTabType>(initialTab);

  // Persistent Cases State (Real cases saved in browser localStorage only)
  const [customCases, setCustomCases] = useState<ConsumerInspectionResult[]>(() => {
    KenaSathiStorage.initialize();
    return KenaSathiStorage.getCases();
  });

  // Active Selected Case: Only set if user has stored cases or explicitly requested a demo via URL/button
  const [activeCustomCase, setActiveCustomCase] = useState<ConsumerInspectionResult | null>(() => {
    if (requestedCase) {
      if (SAMPLE_CONSUMER_CASES[requestedCase]) return SAMPLE_CONSUMER_CASES[requestedCase];
      const demo = KenaSathiStorage.getCaseById(requestedCase);
      if (demo) return demo;
    }
    const cases = KenaSathiStorage.getCases();
    return cases.length > 0 ? cases[0] : null;
  });

  const [consumerCaseKey, setConsumerCaseKey] = useState<string>(
    activeCustomCase?.id || (requestedCase || '')
  );

  // Active sub-tab within Case Workspace
  const [caseWorkspaceSubTab, setCaseWorkspaceSubTab] = useState<
    'summary' | 'timeline' | 'evidence' | 'tasks' | 'financial' | 'complaint'
  >(initialSub || 'summary');

  // Active Resolved Consumer Case: strictly null when user has no stored cases and no demo is selected
  const consumerCase: ConsumerInspectionResult | null =
    activeCustomCase ||
    customCases.find((c) => c.id === consumerCaseKey) ||
    (consumerCaseKey && SAMPLE_CONSUMER_CASES[consumerCaseKey] ? SAMPLE_CONSUMER_CASES[consumerCaseKey] : null) ||
    (customCases.length > 0 ? customCases[0] : null);

  // Synchronize document language with UI selection
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Keyboard shortcut listener for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isCommandPaletteOpen) {
          setCommandPaletteReturnFocusTarget(document.activeElement instanceof HTMLElement ? document.activeElement : null);
        }
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  const handleSelectCase = (key: string) => {
    const allStored = KenaSathiStorage.getCases();
    const found = allStored.find((c) => c.id === key);
    if (found) {
      setActiveCustomCase(found);
      setConsumerCaseKey(found.id);
    } else if (SAMPLE_CONSUMER_CASES[key]) {
      setActiveCustomCase(SAMPLE_CONSUMER_CASES[key]);
      setConsumerCaseKey(key);
    } else {
      const demo = KenaSathiStorage.getCaseById(key);
      if (demo) {
        setActiveCustomCase(demo);
        setConsumerCaseKey(demo.id);
      }
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
      // Direct intake modal with clear explanation when no case exists
      setDisputeNotice(
        language === 'bn'
          ? 'পণ্য ও রসিদ যাচাই শুরু করতে আপনার কেনাকাটার বিবরণ ও প্রমাণপত্র আপলোড করুন।'
          : 'Please upload purchase receipts and dispute details to start evidence verification.'
      );
      setIsNewDisputeOpen(true);
    } else {
      setActiveTab('check_purchase');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenComplaintDraft = () => {
    if (!consumerCase) {
      // Explain that a case must be created first and open intake
      setDisputeNotice(
        language === 'bn'
          ? 'অভিযোগপত্র খসড়া প্রস্তুত করার পূর্বে আপনার কেনাকাটার তথ্য ও প্রামাণ্য নথি দেওয়া আবশ্যক।'
          : 'Please provide purchase and evidence details first before drafting a formal complaint.'
      );
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
        preferences.highContrast
          ? 'high-contrast bg-[#09121A] text-white'
          : 'bg-[#F4F6F5] text-[#26352E]'
      }`}
    >
      {/* Top Institutional Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onNavigateTab={(tab) => {
          setActiveTab(tab as NavigationTabType);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'))}
        onOpenTour={() => setIsOnboardingOpen(true)}
        onOpenCommandPalette={(triggerElement) => {
          setCommandPaletteReturnFocusTarget(triggerElement ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null));
          setIsCommandPaletteOpen(true);
        }}
        onOpenNewDispute={() => setIsNewDisputeOpen(true)}
        onOpenAccessibility={(triggerEl) => {
          setActiveAccessibilityTrigger(triggerEl || null);
          setIsAccessibilityOpen(true);
        }}
        isHighContrast={preferences.highContrast}
        accessibilityTriggerRef={accessibilityTriggerRef}
        onNarrateOverview={handleNarrateOverview}
      />

      {/* Main Experience Container */}
      <main id="main-content" data-active-tab={activeTab} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          (customCases.length === 0 && !consumerCase) ? (
            <EmptyStateView
              language={language}
              onOpenNewDispute={() => setIsNewDisputeOpen(true)}
              onLoadDemoCase={handleLoadDemoCase}
              onOpenDirectory={() => setActiveTab('guide')}
            />
          ) : (
            <DocumentsView
              cases={customCases.length > 0 ? customCases : (consumerCase ? [consumerCase] : [])}
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

        {activeTab === 'help' && <HelpCenterView language={language} />}
      </main>

      {/* Global Modals */}
      <NewDisputeModal
        isOpen={isNewDisputeOpen}
        onClose={() => {
          setIsNewDisputeOpen(false);
          setDisputeNotice(null);
        }}
        onSubmitNewCase={(newCase) => {
          setDisputeNotice(null);
          handleAddNewCase(newCase);
        }}
        language={language}
        initialNotice={disputeNotice}
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
        onToggleHighContrast={() => updatePreference('highContrast', !preferences.highContrast)}
        onOpenAccessibility={(triggerEl) => {
          setActiveAccessibilityTrigger(triggerEl || null);
          setIsCommandPaletteOpen(false);
          setIsAccessibilityOpen(true);
        }}
        onNavigateTab={(tab) => setActiveTab(tab)}
        language={language}
        returnFocusTarget={commandPaletteReturnFocusTarget}
      />

      {/* Dedicated Accessibility Settings Popover/Sheet */}
      <AccessibilitySettings
        isOpen={isAccessibilityOpen}
        onClose={closeAccessibility}
        language={language}
        preferences={preferences}
        onUpdatePreference={updatePreference}
        onResetPreferences={resetPreferences}
        triggerRef={accessibilityTriggerRef}
        activeTrigger={activeAccessibilityTrigger}
      />

      {/* =========================================================================
          PROFESSIONAL PUBLIC-SERVICE INSTITUTIONAL FOOTER (DARK-NAVY)
         ========================================================================= */}
      <footer className="mt-16 border-t border-[#12212D] bg-[#172B3A] py-10 px-4 sm:px-6 lg:px-8 text-xs text-[#DDE4DF]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Row: Data Backup Action & Helpline Reminder */}
          <div className="p-4 rounded-lg bg-[#102431] border border-[#233F54] flex flex-col sm:flex-row items-center justify-between gap-3 text-[#DDE4DF]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ABCFC3]">
              <ShieldCheck className="w-4 h-4 text-[#ABCFC3] shrink-0" />
              <span>
                {language === 'bn'
                  ? 'আপনার নথি এই ব্রাউজারের IndexedDB-তে থাকে। ব্রাউজার স্টোরেজ এনক্রিপ্টেড ভল্ট নয়; ব্যক্তিগত ডিভাইসে ব্যবহার করুন এবং নিয়মিত ব্যাকআপ রাখুন।'
                  : 'Your evidence stays in this browser’s IndexedDB. Browser storage is not an encrypted vault; use a private device and keep a backup.'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="ks-btn bg-[#172B3A] border border-[#233F54] text-white hover:bg-[#12212D] text-xs py-1.5 px-3"
              title="Export all stored cases as JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#ABCFC3]" />
              <span>{language === 'bn' ? 'নথিপত্র ব্যাকআপ (JSON)' : 'Export Backup (JSON)'}</span>
            </button>
          </div>

          {/* Main Footer Multi-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: About KenaSathi */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#176B53] flex items-center justify-center text-white shadow-xs">
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-lg text-white">কেনাসাথী</span>
              </div>
              <p className="text-[#ABCFC3] text-xs leading-[1.7]">
                {language === 'bn'
                  ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ অনুসারে সাধারণ নাগরিক ও ক্রেতাদের কেনাকাটার তথ্য সংরক্ষণ, প্রমাণাদি যাচাই এবং আইনি অভিযোগের খসড়া প্রস্তুত সহায়তাকারী একটি স্বাধীন ডিজিটাল প্ল্যাটফর্ম।'
                  : 'Independent consumer assistance platform supporting Bangladeshi citizens with evidence organization and statutory complaint drafting under CRPA 2009.'}
              </p>
            </div>

            {/* Column 2: Available Services */}
            <div className="space-y-2">
              <div className="font-bold text-white uppercase text-xs tracking-wider">
                {language === 'bn' ? 'সেবাসমূহ' : 'Services'}
              </div>
              <div className="space-y-1 text-xs text-[#DDE4DF]">
                <div>
                  <button id="footer-link-inspection" onClick={() => setActiveTab('check_purchase')} className="hover:text-white transition-colors duration-fast min-h-[36px] flex items-center">
                    {language === 'bn' ? 'কেনাকাটার তথ্য ও প্রমাণ যাচাই' : 'Purchase & Evidence Audit'}
                  </button>
                </div>
                <div>
                  <button onClick={handleOpenComplaintDraft} className="hover:text-white transition-colors duration-fast min-h-[36px] flex items-center">
                    {language === 'bn' ? 'অভিযোগের খসড়া প্রস্তুত' : 'Complaint Draft Builder'}
                  </button>
                </div>
                <div>
                  <button onClick={() => setActiveTab('documents')} className="hover:text-white transition-colors duration-fast min-h-[36px] flex items-center">
                    {language === 'bn' ? 'আমার নথিপত্র ভল্ট' : 'Document Vault'}
                  </button>
                </div>
                <div>
                  <button onClick={() => setActiveTab('guide')} className="hover:text-white transition-colors duration-fast min-h-[36px] flex items-center">
                    {language === 'bn' ? 'ভোক্তা অধিকার নির্দেশিকা' : 'Consumer Rights Guide'}
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: National Helplines & Official Links */}
            <div className="space-y-2">
              <div className="font-bold text-white uppercase text-xs tracking-wider">
                {language === 'bn' ? 'জরুরি হেল্পলাইন ও অফিসিয়াল লিঙ্ক' : 'National Helplines'}
              </div>
              <div className="space-y-1.5 text-xs text-[#DDE4DF]">
                <div>ভোক্তা অধিদপ্তর হটলাইন: <strong className="text-white font-mono font-bold">16121</strong></div>
                <div>জাতীয় জরুরি কল: <strong className="text-amber-300 font-mono font-bold">999</strong></div>
                <div>জাতীয় আইনগত সহায়তা হেল্পলাইন (টোল-ফ্রি): <strong className="text-emerald-300 font-mono font-bold">16699</strong></div>
                <div>ইমেইল: <span className="font-mono text-white">nccc@dncrp.gov.bd</span></div>
                <div className="pt-1">
                  <a
                    href="https://ccms.dncrp.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#ABCFC3] hover:text-white flex items-center gap-1 font-semibold min-h-[44px] inline-flex items-center transition-colors"
                  >
                    <span>ডিএনসিআরপি সিসিএমএস পোর্টাল</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#ABCFC3]" />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 4: Statutory Compliance & Privacy */}
            <div className="space-y-2">
              <div className="font-bold text-white uppercase text-xs tracking-wider">
                {language === 'bn' ? 'আইনি ও গোপনীয়তা নীতি' : 'Statutory & Privacy'}
              </div>
              <div className="space-y-1.5 text-xs text-[#ABCFC3]">
                <div>ধারা ৬০: ৩০ ক্যালেন্ডার দিনের তামাদি ট্র্যাকার</div>
                <div>ধারা ৭৬(৪): জরিমানা আদায় সাপেক্ষে ২৫% বিধান</div>
                <div>লোকাল স্টোরেজ: localStorage (কেস) + IndexedDB (ফাইল)</div>
                <div>ক্লাউড সিঙ্ক নেই; নাগরিক পর্যালোচনার নিরপেক্ষ খসড়া</div>
              </div>
            </div>
          </div>

          {/* Mandatory Independent Service Disclosure */}
          <div className="pt-6 border-t border-[#233F54] space-y-3">
            <div className="p-4 rounded-lg bg-[#102431] border border-[#233F54] text-xs text-[#ABCFC3] leading-[1.7]">
              <strong className="text-white block mb-1">
                {language === 'bn' ? 'স্বাধীন প্ল্যাটফর্ম ও আইনি দায়মুক্তি বিজ্ঞপ্তি:' : 'Independent Service Disclosure:'}
              </strong>
              {language === 'bn'
                ? 'কেনাসাথী একটি স্বাধীন ভোক্তা-সহায়তা প্ল্যাটফর্ম। এটি জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর বা কোনো সরকারি প্রতিষ্ঠানের অফিসিয়াল ওয়েবসাইট নয়। এই প্ল্যাটফর্মে প্রদত্ত তথ্য ও খসড়া নাগরিকের সচেতনতা ও সহায়তার জন্য প্রস্তুতকৃত।'
                : 'KenaSathi is an independent consumer assistance platform. It is not the official website of the Directorate of National Consumer Rights Protection or any government agency. Information and drafts are provided for citizen guidance and assistance.'}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#ABCFC3]">
              <div>
                © 2026 কেনাসাথী (KenaSathi). ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ সহায়ক স্বাধীন নাগরিক সেবা।
              </div>
              <div className="flex items-center gap-4">
                <span>ঢাকা, বাংলাদেশ</span>
                <span>•</span>
                <span className="text-[#ABCFC3] font-medium">কোনো কেন্দ্রীয় অ্যাকাউন্ট বা ডেটাবেস নেই</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
