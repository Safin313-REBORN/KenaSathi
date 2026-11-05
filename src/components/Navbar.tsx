import React, { useState } from 'react';
import {
  Scale,
  FileText,
  Building2,
  FolderOpen,
  PhoneCall,
  Globe,
  Plus,
  Menu,
  X,
  Search,
  HelpCircle,
  Sliders,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  language: 'bn' | 'en';
  onToggleLanguage: () => void;
  onOpenNewDispute?: () => void;
  onOpenCommandPalette: (triggerElement?: HTMLElement | null) => void;
  onOpenTour: () => void;
  onOpenAccessibility: (triggerElement?: HTMLElement | null) => void;
  isHighContrast?: boolean;
  accessibilityTriggerRef?: React.RefObject<HTMLButtonElement>;
  onNarrateOverview?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigateTab,
  language,
  onToggleLanguage,
  onOpenNewDispute,
  onOpenCommandPalette,
  onOpenTour,
  onOpenAccessibility,
  isHighContrast = false,
  accessibilityTriggerRef,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuToggleRef = React.useRef<HTMLButtonElement>(null);

  // Essential public service navigation links
  const navItems = [
    {
      id: 'services',
      labelBn: 'সেবাসমূহ',
      labelEn: 'Services',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'cases',
      labelBn: 'আমার বিরোধসমূহ',
      labelEn: 'My Cases',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'documents',
      labelBn: 'নথিপত্র রেজিস্টার',
      labelEn: 'Documents',
      icon: <FolderOpen className="w-4 h-4" />,
    },
    {
      id: 'guide',
      labelBn: 'ভোক্তা গাইড',
      labelEn: 'Consumer Guide',
      icon: <Scale className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#DDE4DF] transition-colors">
      {/* Tier 1: Compact Institutional Utility Strip */}
      <div className="bg-[#172B3A] text-[#DDE4DF] text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#12212D]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs truncate mr-2">
            <span className="font-semibold text-white whitespace-nowrap">
              {language === 'bn' ? 'বাংলাদেশে ভোক্তা সহায়তা' : 'Consumer Assistance in Bangladesh'}
            </span>
            <span className="text-[#63756C] hidden sm:inline">•</span>
            <span className="text-[#DDE4DF] hidden md:inline truncate">
              {language === 'bn'
                ? 'ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ সহায়ক সেবা'
                : 'CRPA 2009 Statutory Guidance Service'}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-xs shrink-0">
            <a
              href="tel:16121"
              className="hidden sm:flex items-center space-x-1 text-[#ABCFC3] hover:text-white font-semibold transition"
              title="Official DNCRP Consumer Hotline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#ABCFC3]" />
              <span>{language === 'bn' ? 'জাতীয় ভোক্তা হটলাইন: ১৬১২১' : 'Helpline: 16121'}</span>
            </a>
            <span className="text-[#63756C] hidden sm:inline">•</span>

            {/* Language Switch */}
            <button
              id="btn-language-toggle"
              type="button"
              onClick={onToggleLanguage}
              className="flex items-center space-x-1 text-white hover:text-[#ABCFC3] font-bold transition focus:outline-none min-h-[44px] px-2 rounded"
              title={language === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
              aria-label="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#ABCFC3]" />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Accessibility Settings Control */}
            <span className="text-[#63756C] hidden sm:inline">•</span>
            <button
              id="btn-accessibility-toggle"
              ref={accessibilityTriggerRef}
              type="button"
              onClick={(e) => onOpenAccessibility(e.currentTarget)}
              className={`hidden sm:flex items-center space-x-1.5 p-1.5 rounded text-xs font-semibold transition focus:outline-none min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#ABCFC3] ${
                isHighContrast
                  ? 'bg-[#124A3B] text-white border border-[#ABCFC3]'
                  : 'text-[#DDE4DF] hover:text-white'
              }`}
              title={language === 'bn' ? 'অ্যাক্সেসিবিলিটি সেটিংস' : 'Accessibility Settings'}
              aria-label={language === 'bn' ? 'অ্যাক্সেসিবিলিটি সেটিংস' : 'Accessibility Settings'}
              aria-haspopup="dialog"
            >
              <Sliders className="w-3.5 h-3.5 text-[#ABCFC3]" />
              <span>{language === 'bn' ? 'অ্যাক্সেসিবিলিটি' : 'Accessibility'}</span>
              {isHighContrast && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tier 2: Unified Main Masthead & Integrated Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-4 min-w-0 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('landing')}
            className="flex items-center space-x-3 text-left focus:outline-none group min-h-[44px]"
            aria-label="KenaSathi Home"
          >
            <div className="w-9 h-9 rounded bg-[#176B53] group-hover:bg-[#124A3B] flex items-center justify-center text-white transition shadow-sm shrink-0">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-[#172B3A] group-hover:text-[#176B53] transition">
                  কেনাসাথী
                </span>
                <span className="text-xs font-medium text-[#526359] border-l border-[#DDE4DF] pl-2 font-mono hidden sm:inline">
                  KenaSathi
                </span>
              </div>
              <p className="text-xs text-[#526359] hidden sm:block">
                {language === 'bn' ? 'ভোক্তা অধিকার সহায়তা ও নির্দেশিকা' : 'Consumer Rights Assistance & Guidance'}
              </p>
            </div>
          </button>

          {/* Integrated Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1 pl-3 border-l border-[#DDE4DF] shrink-0" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive =
                activeTab === item.id ||
                (item.id === 'services' && activeTab === 'overview') ||
                (item.id === 'guide' && activeTab === 'directory') ||
                (item.id === 'cases' &&
                  (activeTab === 'risk' ||
                    activeTab === 'complaint' ||
                    activeTab === 'check_purchase' ||
                    activeTab === 'inspector'));

              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  data-tab={item.id}
                  type="button"
                  onClick={() => onNavigateTab(item.id)}
                  className={`ks-nav-link flex items-center space-x-1.5 px-2 py-2 text-sm min-h-[44px] ${
                    isActive ? 'active' : ''
                  }`}
                  aria-pressed={isActive}
                >
                  {item.icon}
                  <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Quick Tools & Primary Action */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Quick Search (⌘K) */}
          <button
            type="button"
            onClick={(event) => onOpenCommandPalette(event.currentTarget)}
            className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 text-xs font-medium rounded border border-[#DDE4DF] bg-[#F5F7F5] text-[#526359] hover:text-[#172B3A] hover:border-[#176B53] transition min-h-[44px]"
            title="Search (Ctrl+K / ⌘K)"
            aria-label="Open Command Palette"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden 2xl:inline">{language === 'bn' ? 'অনুসন্ধান' : 'Search'}</span>
            <span className="hidden 2xl:inline text-xs font-mono px-1 rounded bg-white border border-[#DDE4DF]">
              ⌘K
            </span>
          </button>

          {/* Help and FAQ Center */}
          <button
            type="button"
            onClick={() => onNavigateTab('help')}
            className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded border border-[#DDE4DF] bg-white text-[#26352E] hover:bg-[#F5F7F5] transition min-h-[44px]"
            aria-label={language === 'bn' ? 'সহায়তা ও সাধারণ প্রশ্নোত্তর' : 'Help and FAQs'}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#176B53]" />
            <span>{language === 'bn' ? 'সহায়তা ও FAQ' : 'Help & FAQs'}</span>
          </button>

          {/* Prominent Primary Action: অভিযোগ প্রস্তুত করুন */}
          {onOpenNewDispute && (
            <button
              id="btn-open-new-dispute"
              type="button"
              onClick={onOpenNewDispute}
            className="ks-btn ks-btn-primary group whitespace-nowrap flex items-center space-x-1.5 min-h-[44px]"
              aria-label={language === 'bn' ? 'অভিযোগ প্রস্তুত করুন' : 'Draft Complaint'}
            >
              <Plus className="w-4 h-4 shrink-0 transition-transform duration-standard ease-standard group-hover:scale-110" />
              <span className="hidden sm:inline">{language === 'bn' ? 'অভিযোগ প্রস্তুত করুন' : 'Draft Complaint'}</span>
              <span className="sm:hidden">{language === 'bn' ? 'অভিযোগ' : 'Draft'}</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            id="btn-mobile-menu-toggle"
            ref={mobileMenuToggleRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded border border-[#DDE4DF] text-[#172B3A] hover:bg-[#F5F7F5] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors duration-fast"
            aria-label="Toggle Mobile Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Official buildathon sticker, kept immediately beneath the main navigation. */}
      <div className="border-t border-[#DDE4DF] bg-[#F2F7F4]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
          <a
            href="https://yunet-aignite26.devpost.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B53]"
            aria-label="Built For Ostad Presents YUNet AIgnite Buildathon 2026. Opens event page in a new tab."
          >
            <span className="block h-[76px] w-[152px] overflow-hidden sm:h-[88px] sm:w-[176px]">
              <img
                src="/ostad-yunet-aignite-buildathon-sticker.png"
                alt="Built For Ostad Presents YUNet AIgnite Buildathon 2026"
                className="h-full w-full object-cover object-center"
                width="1170"
                height="156"
              />
            </span>
          </a>
        </div>
      </div>

      {/* Mobile Drawer (Accessible, full-height touch targets, secondary utilities) */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#DDE4DF] bg-white px-4 py-4 space-y-3 shadow-dropdown">
          <div className="text-xs font-bold uppercase tracking-wider text-[#526359] px-2">
            {language === 'bn' ? 'মেনু নেভিগেশন' : 'Navigation'}
          </div>
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigateTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded text-sm font-semibold text-left transition min-h-[48px] ${
                  activeTab === item.id
                    ? 'bg-[#EAF3EE] text-[#176B53] font-bold'
                    : 'text-[#26352E] hover:bg-[#F5F7F5]'
                }`}
              >
                {item.icon}
                <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
              </button>
            ))}
          </div>

          {/* Secondary Utilities moved cleanly into Drawer */}
          <div className="pt-3 border-t border-[#DDE4DF] space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#526359] px-2 mb-1">
              {language === 'bn' ? 'সহায়তা ও সুবিধা' : 'Assistance & Settings'}
            </div>

            {/* Accessibility Settings Action */}
            <button
              id="btn-mobile-accessibility"
              type="button"
              onClick={() => {
                const restoreTarget = mobileMenuToggleRef.current;
                setMobileMenuOpen(false);
                onOpenAccessibility(restoreTarget);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded border border-[#DDE4DF] text-xs font-semibold text-[#26352E] hover:bg-[#F5F7F5] min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#176B53]"
              aria-haspopup="dialog"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#176B53]" />
                <span>{language === 'bn' ? 'অ্যাক্সেসিবিলিটি সেটিংস' : 'Accessibility Settings'}</span>
              </span>
              <span className="text-xs text-[#176B53] font-bold">
                {language === 'bn' ? 'পরিবর্তন করুন' : 'Settings'}
              </span>
            </button>

            {/* National Consumer Hotline 16121 Call Link */}
            <a
              href="tel:16121"
              className="w-full flex items-center justify-between px-3 py-2.5 rounded bg-[#EAF3EE] text-[#176B53] font-semibold text-xs min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#176B53]" />
                <span>{language === 'bn' ? 'ভোক্তা অধিকার হেল্পলাইন' : 'Consumer Helpline'}</span>
              </span>
              <span className="font-mono font-bold text-xs">১৬১২১</span>
            </a>

            {/* Tour & Palette triggers */}
            <button
              type="button"
              onClick={() => {
                onNavigateTab('help');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2.5 text-xs font-semibold text-[#26352E] hover:text-[#176B53] min-h-[44px]"
            >
              <HelpCircle className="w-4 h-4 text-[#176B53]" />
              <span>{language === 'bn' ? 'সহায়তা ও সাধারণ প্রশ্নোত্তর' : 'Help and FAQs'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenTour();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2.5 text-xs font-semibold text-[#526359] hover:text-[#172B3A] min-h-[44px]"
            >
              <HelpCircle className="w-4 h-4 text-[#176B53]" />
              <span>{language === 'bn' ? 'ব্যবহারবিধি ও নাগরিক নির্দেশিকা' : 'Citizen Help Guide'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenCommandPalette(mobileMenuToggleRef.current);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2.5 text-xs font-semibold text-[#526359] hover:text-[#172B3A] min-h-[44px]"
            >
              <Search className="w-4 h-4" />
              <span>{language === 'bn' ? 'দ্রুত অনুসন্ধান (⌘K)' : 'Quick Search (⌘K)'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
