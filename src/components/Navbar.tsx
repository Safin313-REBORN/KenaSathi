import React, { useState } from 'react';
import {
  Scale,
  Plus,
  BookOpen,
  PhoneCall,
  Search,
  Globe,
  Eye,
  Menu,
  X,
  FolderOpen,
  ShieldAlert,
  Home,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import { NavigationTabType } from './CommandPalette';

interface NavbarProps {
  activeTab: NavigationTabType;
  onNavigateTab: (tab: NavigationTabType) => void;
  language: 'bn' | 'en';
  onToggleLanguage: () => void;
  onOpenTour: () => void;
  onOpenCommandPalette: () => void;
  onOpenNewDispute?: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  onNarrateOverview?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigateTab,
  language,
  onToggleLanguage,
  onOpenTour,
  onOpenCommandPalette,
  onOpenNewDispute,
  isHighContrast,
  onToggleHighContrast,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'landing' as NavigationTabType,
      labelBn: 'হোম',
      labelEn: 'Home',
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'services' as NavigationTabType,
      labelBn: 'সেবাসমূহ',
      labelEn: 'Services',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: 'documents' as NavigationTabType,
      labelBn: 'আমার নথিপত্র',
      labelEn: 'My Documents',
      icon: <FolderOpen className="w-4 h-4" />,
    },
    {
      id: 'guide' as NavigationTabType,
      labelBn: 'ভোক্তা অধিকার',
      labelEn: 'Consumer Rights',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'cases' as NavigationTabType,
      labelBn: 'আমার বিরোধ',
      labelEn: 'My Cases',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#D9E0DC] shadow-sm transition-colors">
      {/* 1. Slim Top Utility Bar */}
      <div className="bg-[#172B3A] text-[#D9E0DC] text-xs py-1.5 px-4 border-b border-[#11212D]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="font-semibold text-white">
              {language === 'bn' ? 'বাংলাদেশে ভোক্তা সহায়তা' : 'Consumer Assistance in Bangladesh'}
            </span>
            <span className="text-[#8A9790] hidden sm:inline">•</span>
            <span className="text-[#D9E0DC] hidden sm:inline">
              {language === 'bn'
                ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ সহায়ক সেবা'
                : 'CRPA 2009 Statutory Guidance Service'}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <a
              href="tel:16121"
              className="flex items-center space-x-1 text-[#ABCFC3] hover:text-white font-bold transition"
              title="Official DNCRP Consumer Hotline"
            >
              <PhoneCall className="w-3 h-3 text-[#ABCFC3]" />
              <span>{language === 'bn' ? 'জাতীয় ভোক্তা হটলাইন: ১৬১২১' : 'Helpline: 16121'}</span>
            </a>
            <span className="text-[#64716A]">•</span>
            {/* Language Switch */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center space-x-1 text-white hover:text-[#ABCFC3] font-bold transition"
              title={language === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <Globe className="w-3 h-3 text-[#ABCFC3]" />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
            <span className="text-[#64716A]">•</span>
            {/* Accessibility Option */}
            <button
              onClick={onToggleHighContrast}
              className={`p-1 rounded text-[11px] font-semibold transition ${
                isHighContrast
                  ? 'bg-black text-yellow-300 ring-1 ring-yellow-300'
                  : 'text-[#D9E0DC] hover:text-white'
              }`}
              title={language === 'bn' ? 'উচ্চ কনট্রাস্ট প্রদর্শন' : 'High Contrast Mode'}
              aria-label="Toggle High Contrast"
            >
              <Eye className="w-3 h-3 inline mr-1" />
              <span className="hidden md:inline">{language === 'bn' ? 'এক্সেসিবিলিটি' : 'Accessibility'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left: Brand Mark and Wordmark */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('landing')}
            className="flex items-center space-x-3 text-left focus:outline-none group"
            aria-label="KenaSathi Home"
          >
            <div className="w-10 h-10 rounded bg-[#176B53] flex items-center justify-center text-white shadow-sm ring-1 ring-[#176B53]/20">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-[#172B3A] group-hover:text-[#176B53] transition">
                  কেনাসাথী
                </span>
                <span className="text-[11px] font-medium text-[#64716A] border-l border-[#D9E0DC] pl-2 font-mono hidden sm:inline">
                  KenaSathi
                </span>
              </div>
              <p className="text-[11px] text-[#64716A]">
                {language === 'bn' ? 'ভোক্তা অধিকার সহায়তা ও নির্দেশিকা' : 'Consumer Rights Assistance & Guidance'}
              </p>
            </div>
          </button>
        </div>

        {/* Right: Quick Search + Primary Action */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Search (⌘K) */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded border border-[#D9E0DC] bg-[#F4F6F5] text-[#64716A] hover:text-[#172B3A] hover:border-[#176B53] transition"
            title="Search (Ctrl+K / ⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{language === 'bn' ? 'অনুসন্ধান' : 'Search'}</span>
            <span className="text-[10px] font-mono px-1 rounded bg-white border border-[#D9E0DC]">
              ⌘K
            </span>
          </button>

          {/* Citizen Guide Tour */}
          <button
            onClick={onOpenTour}
            className="hidden md:flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded border border-[#D9E0DC] bg-white text-[#26352E] hover:bg-[#F4F6F5] transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#176B53]" />
            <span>{language === 'bn' ? 'নির্দেশিকা' : 'Citizen Help'}</span>
          </button>

          {/* Prominent Primary Action: অভিযোগ প্রস্তুত করুন */}
          {onOpenNewDispute && (
            <button
              onClick={onOpenNewDispute}
              className="ks-btn ks-btn-primary text-xs sm:text-sm py-2 px-3.5 sm:px-4 font-bold shadow-sm flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'অভিযোগ প্রস্তুত করুন' : 'Draft Complaint'}</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded border border-[#D9E0DC] text-[#172B3A] hover:bg-[#F4F6F5]"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. Primary Navigation Bar (Desktop) */}
      <div className="hidden lg:block border-t border-[#D9E0DC] bg-[#F4F6F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 py-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive =
                activeTab === item.id ||
                (item.id === 'services' && activeTab === 'overview') ||
                (item.id === 'guide' && activeTab === 'directory') ||
                (item.id === 'cases' && (activeTab === 'risk' || activeTab === 'complaint' || activeTab === 'check_purchase' || activeTab === 'inspector'));

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded text-xs font-bold transition ${
                    isActive
                      ? 'bg-white text-[#176B53] shadow-xs border border-[#D9E0DC]'
                      : 'text-[#64716A] hover:text-[#172B3A] hover:bg-white/60'
                  }`}
                >
                  {item.icon}
                  <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 4. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D9E0DC] bg-white px-4 py-4 space-y-2 shadow-dropdown">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64716A] px-2 mb-1">
            {language === 'bn' ? 'মেনু নেভিগেশন' : 'Navigation'}
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigateTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded text-xs font-bold text-left transition ${
                activeTab === item.id
                  ? 'bg-[#EAF3F0] text-[#176B53]'
                  : 'text-[#26352E] hover:bg-[#F4F6F5]'
              }`}
            >
              {item.icon}
              <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
            </button>
          ))}

          <div className="pt-3 border-t border-[#D9E0DC] space-y-2">
            <button
              onClick={() => {
                onOpenTour();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-[#64716A]"
            >
              <HelpCircle className="w-4 h-4 text-[#176B53]" />
              <span>{language === 'bn' ? 'ব্যবহারবিধি ও নাগরিক নির্দেশিকা' : 'Citizen Help Guide'}</span>
            </button>

            <button
              onClick={() => {
                onOpenCommandPalette();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-[#64716A]"
            >
              <Search className="w-4 h-4" />
              <span>{language === 'bn' ? 'অনুসন্ধান করুন (⌘K)' : 'Search (⌘K)'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
