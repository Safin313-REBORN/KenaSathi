import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Search,
  X,
  CornerDownLeft,
  Eye,
  Globe,
  FileCheck2,
  FolderOpen,
  ShieldAlert,
  Home,
  BookOpen,
  Briefcase,
  HelpCircle,
  Sliders,
} from 'lucide-react';

export type NavigationTabType =
  | 'landing'
  | 'services'
  | 'cases'
  | 'documents'
  | 'guide'
  | 'check_purchase'
  | 'overview'
  | 'inspector'
  | 'risk'
  | 'complaint'
  | 'directory'
  | 'help'
  | 'spatial';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConsumerCase: (caseKey: string) => void;
  onToggleLanguage: () => void;
  onToggleHighContrast: () => void;
  onOpenAccessibility?: (triggerElement?: HTMLElement | null) => void;
  onNavigateTab: (tab: NavigationTabType) => void;
  language: 'bn' | 'en';
  returnFocusTarget?: HTMLElement | null;
}

interface CommandItem {
  id: string;
  category: 'navigation' | 'case' | 'action';
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectConsumerCase,
  onToggleLanguage,
  onToggleHighContrast,
  onOpenAccessibility,
  onNavigateTab,
  language,
  returnFocusTarget,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const priorFocusRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      priorFocusRef.current = returnFocusTarget ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
      const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        window.clearTimeout(focusTimer);
        const priorFocus = priorFocusRef.current;
        if (priorFocus?.isConnected && !priorFocus.closest('[inert]')) {
          priorFocus.focus();
        } else {
          const mobileMenuTrigger = document.getElementById('btn-mobile-menu-toggle');
          if (mobileMenuTrigger instanceof HTMLElement && mobileMenuTrigger.getClientRects().length > 0) {
            mobileMenuTrigger.focus();
          }
        }
      };
    }
  }, [isOpen, returnFocusTarget]);

  const commands: CommandItem[] = [
    // Core Navigation Workspaces
    {
      id: 'nav-home',
      category: 'navigation',
      titleBn: 'হোম (Home)',
      titleEn: 'Home Page',
      subtitleBn: 'কেনাসাথী পোর্টাল পরিচিতি ও জরুরি হেল্পলাইন',
      subtitleEn: 'KenaSathi citizen portal intro and helplines',
      icon: <Home className="w-4 h-4 text-[#176B53]" />,
      action: () => {
        onNavigateTab('landing');
        handleClose();
      },
    },
    {
      id: 'nav-services',
      category: 'navigation',
      titleBn: 'সেবাসমূহ (Services)',
      titleEn: 'Services Directory',
      subtitleBn: 'উপলব্ধ সকল ভোক্তা সহায়তা ও নালিশ সেবা',
      subtitleEn: 'All available consumer protection services',
      icon: <Briefcase className="w-4 h-4 text-[#176B53]" />,
      action: () => {
        onNavigateTab('services');
        handleClose();
      },
    },
    {
      id: 'nav-check',
      category: 'navigation',
      titleBn: 'পণ্য ও রসিদ যাচাই (Check a Purchase)',
      titleEn: 'Check a Purchase & Receipts',
      subtitleBn: 'বিকাশ TrxID, ইনভয়েস ও ডেলিভারি প্রতিশ্রুতি যাচাই',
      subtitleEn: 'Audit TrxID, invoice receipts, and delivery promises',
      icon: <FileCheck2 className="w-4 h-4 text-[#176B53]" />,
      action: () => {
        onNavigateTab('check_purchase');
        handleClose();
      },
    },
    {
      id: 'nav-cases',
      category: 'navigation',
      titleBn: 'আমার বিরোধ ডসিয়ার (My Cases)',
      titleEn: 'My Case Records',
      subtitleBn: 'সংরক্ষিত বিরোধের সারসংক্ষেপ, টাইমলাইন ও নালিশ খসড়া',
      subtitleEn: 'Saved case records, timelines, and complaint drafts',
      icon: <ShieldAlert className="w-4 h-4 text-[#176B53]" />,
      action: () => {
        onNavigateTab('cases');
        handleClose();
      },
    },
    {
      id: 'nav-documents',
      category: 'navigation',
      titleBn: 'আমার নথিপত্র (My Documents)',
      titleEn: 'Document Register',
      subtitleBn: 'ব্রাউজারে সংরক্ষিত প্রমাণাদি ও ফাইল রেজিস্টার',
      subtitleEn: 'Locally stored evidence items and file register',
      icon: <FolderOpen className="w-4 h-4 text-[#176B53]" />,
      action: () => {
        onNavigateTab('documents');
        handleClose();
      },
    },
    {
      id: 'nav-guide',
      category: 'navigation',
      titleBn: 'ভোক্তা অধিকার নির্দেশিকা (Consumer Guide)',
      titleEn: 'Consumer Rights Guide & Directory',
      subtitleBn: 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ ও ১৬১২১ হটলাইন নির্দেশিকা',
      subtitleEn: 'CRPA 2009 legal sections and 16121 hotline directory',
      icon: <BookOpen className="w-4 h-4 text-[#176B53]" />,
      action: () => {
        onNavigateTab('guide');
        handleClose();
      },
    },
    {
      id: 'nav-help',
      category: 'navigation',
      titleBn: 'সহায়তা ও সাধারণ প্রশ্নোত্তর',
      titleEn: 'Help and FAQs',
      subtitleBn: 'কেনাসাথী ব্যবহার, তথ্য সংরক্ষণ ও সরকারি সহায়তা',
      subtitleEn: 'Using KenaSathi, local storage, and official assistance',
      icon: <HelpCircle className="w-4 h-4 text-[#176B53]" />,
      action: () => {
        onNavigateTab('help');
        handleClose();
      },
    },

    // Demonstrations
    {
      id: 'demo-headphone',
      category: 'case',
      titleBn: 'নমুনা: সনি হেডফোন অনাদায়ি বিরোধ (ধারা ৪৫)',
      titleEn: 'Demo: Sony WH-1000XM5 Non-Delivery',
      subtitleBn: '৳৮,৫০০ টাকা অগ্রিম পেমেন্টের পর ডেলিভারি না পাওয়ার কেস',
      subtitleEn: 'Non-delivery scenario under Section 45',
      icon: <FileCheck2 className="w-4 h-4 text-amber-700" />,
      action: () => {
        onSelectConsumerCase('case_headphone_nondelivery');
        handleClose();
      },
    },
    {
      id: 'demo-airpods',
      category: 'case',
      titleBn: 'নমুনা: এয়ারপডস ক্লোন ডিভাইস (ধারা ৫০)',
      titleEn: 'Demo: AirPods Pro Counterfeit Case',
      subtitleBn: 'অরিজিনাল বলে ক্লোন ইলেকট্রনিক্স ডিভাইস গছিয়ে দেওয়ার বিরোধ',
      subtitleEn: 'Counterfeit electronic goods under Section 50',
      icon: <FileCheck2 className="w-4 h-4 text-rose-700" />,
      action: () => {
        onSelectConsumerCase('airpods_scam');
        handleClose();
      },
    },

    // Actions
    {
      id: 'action-lang',
      category: 'action',
      titleBn: language === 'bn' ? 'Switch to English' : 'বাংলা ভাষায় দেখুন',
      titleEn: language === 'bn' ? 'Switch Interface to English' : 'Switch Interface to Bengali',
      subtitleBn: 'ভাষা পরিবর্তন (Language Switcher)',
      subtitleEn: 'Toggle bilingual locale',
      icon: <Globe className="w-4 h-4 text-[#176B53]" />,
      action: () => {
        onToggleLanguage();
        handleClose();
      },
    },
    {
      id: 'action-contrast',
      category: 'action',
      titleBn: 'হাই কনট্রাস্ট এক্সেসিবিলিটি মোড',
      titleEn: 'High Contrast Mode',
      subtitleBn: 'দৃষ্টি প্রতিবন্ধকতা সহায়ক উচ্চ কনট্রাস্ট প্রদর্শন',
      subtitleEn: 'Toggle high contrast display theme',
      icon: <Eye className="w-4 h-4 text-[#176B53]" />,
      action: () => {
        onToggleHighContrast();
        handleClose();
      },
    },
    {
      id: 'action-accessibility',
      category: 'action',
      titleBn: 'অ্যাক্সেসিবিলিটি সেটিংস (Accessibility Settings)',
      titleEn: 'Accessibility Settings',
      subtitleBn: 'লেখার আকার, হাই কনট্রাস্ট, অ্যানিমেশন ও লিংক সেটিংস',
      subtitleEn: 'Text size, high contrast, reduce motion, underline links',
      icon: <Sliders className="w-4 h-4 text-[#176B53]" />,
      action: () => {
        if (onOpenAccessibility) {
          onOpenAccessibility();
        } else {
          onToggleHighContrast();
        }
        handleClose();
      },
    },
  ];

  const filtered = commands.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.titleBn.toLowerCase().includes(q) ||
      c.titleEn.toLowerCase().includes(q) ||
      c.subtitleBn.toLowerCase().includes(q) ||
      c.subtitleEn.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={handleClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="bg-surface border border-border text-ink-primary rounded-lg max-w-xl w-full shadow-dropdown overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
      >
        <h2 id="command-palette-title" className="sr-only">
          {language === 'bn' ? 'দ্রুত অনুসন্ধান' : 'Quick search'}
        </h2>
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border space-x-3 bg-surface">
          <Search className="w-4 h-4 text-ink-secondary" />
          <input
            ref={inputRef}
            type="text"
            aria-label={language === 'bn' ? 'সেবা বা নথিপত্র অনুসন্ধান করুন' : 'Search services or actions'}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={
              language === 'bn'
                ? 'সেবা বা নথিপত্র অনুসন্ধান করুন... (যেমন: অভিযোগ, যাচাই, নথিপত্র)'
                : 'Search services or actions... (e.g. Services, Complaint, Documents)'
            }
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-ink-secondary/60 text-ink-primary"
          />
          <button
            onClick={handleClose}
            className="p-1 rounded text-ink-secondary hover:bg-canvas text-xs min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Item List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left flex items-center justify-between p-2.5 rounded cursor-pointer transition min-h-[44px] ${
                  selectedIndex === idx
                    ? 'bg-emerald-50 text-primary'
                    : 'hover:bg-canvas text-ink-primary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center border ${
                      selectedIndex === idx
                        ? 'bg-surface border-emerald-300'
                        : 'bg-canvas border-border'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">
                      {language === 'bn' ? item.titleBn : item.titleEn}
                    </p>
                    <p className="text-xs text-ink-secondary leading-tight mt-0.5">
                      {language === 'bn' ? item.subtitleBn : item.subtitleEn}
                    </p>
                  </div>
                </div>
                <CornerDownLeft className="w-3.5 h-3.5 text-ink-secondary opacity-50" />
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-ink-secondary text-xs">
              <HelpCircle className="w-6 h-6 mx-auto text-ink-secondary mb-2" />
              <p>{language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matching commands found'}</p>
            </div>
          )}
        </div>

        {/* Palette Footer */}
        <div className="p-2.5 bg-canvas border-t border-border flex items-center justify-between text-xs text-ink-secondary font-mono">
          <div className="flex items-center space-x-3">
            <span>↑↓ নির্বাচন</span>
            <span>↵ খুলুন</span>
            <span>ESC বন্ধ করুন</span>
          </div>
          <span>কেনাসাথী সিভিক পোর্টাল</span>
        </div>
      </div>
    </div>
  );
};
