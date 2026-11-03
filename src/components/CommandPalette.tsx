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
  | 'spatial';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConsumerCase: (caseKey: string) => void;
  onToggleLanguage: () => void;
  onToggleHighContrast: () => void;
  onNavigateTab: (tab: NavigationTabType) => void;
  language: 'bn' | 'en';
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
  onNavigateTab,
  language,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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
      titleEn: 'High Contrast Mode (WCAG 2.2 AA)',
      subtitleBn: 'দৃষ্টি প্রতিবন্ধকতা সহায়ক উচ্চ কনট্রাস্ট প্রদর্শন',
      subtitleEn: 'Toggle black-and-gold high contrast view',
      icon: <Eye className="w-4 h-4 text-[#176B53]" />,
      action: () => {
        onToggleHighContrast();
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
    if (e.key === 'ArrowDown') {
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
    >
      <div
        className="bg-white border border-[#D9E0DC] text-[#26352E] rounded-lg max-w-xl w-full shadow-dropdown overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#D9E0DC] space-x-3 bg-white">
          <Search className="w-4 h-4 text-[#64716A]" />
          <input
            ref={inputRef}
            type="text"
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
            className="w-full bg-transparent text-sm focus:outline-none placeholder-[#8A9790] text-[#172B3A]"
          />
          <button
            onClick={handleClose}
            className="p-1 rounded text-[#64716A] hover:bg-[#E8ECE9] text-xs"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Item List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <div
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between p-2.5 rounded cursor-pointer transition ${
                  selectedIndex === idx
                    ? 'bg-[#EAF3F0] text-[#176B53]'
                    : 'hover:bg-[#F4F6F5] text-[#26352E]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center border ${
                      selectedIndex === idx
                        ? 'bg-white border-[#ABCFC3]'
                        : 'bg-[#F4F6F5] border-[#D9E0DC]'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">
                      {language === 'bn' ? item.titleBn : item.titleEn}
                    </p>
                    <p className="text-[11px] text-[#64716A] leading-tight mt-0.5">
                      {language === 'bn' ? item.subtitleBn : item.subtitleEn}
                    </p>
                  </div>
                </div>
                <CornerDownLeft className="w-3.5 h-3.5 text-[#8A9790] opacity-50" />
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[#64716A] text-xs">
              <HelpCircle className="w-6 h-6 mx-auto text-[#8A9790] mb-2" />
              <p>{language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matching commands found'}</p>
            </div>
          )}
        </div>

        {/* Palette Footer */}
        <div className="p-2.5 bg-[#F4F6F5] border-t border-[#D9E0DC] flex items-center justify-between text-[11px] text-[#64716A] font-mono">
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
