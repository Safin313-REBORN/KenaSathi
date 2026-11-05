import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  RotateCcw,
  Sliders,
  Type,
  Eye,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  AccessibilityPreferences,
  TextSizePreference,
} from '../services/accessibilityPreferences';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
  preferences: AccessibilityPreferences;
  onUpdatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => void;
  onResetPreferences: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  activeTrigger?: HTMLElement | null;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  isOpen,
  onClose,
  language,
  preferences,
  onUpdatePreference,
  onResetPreferences,
  triggerRef,
  activeTrigger,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const storedTriggerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // References to radio option buttons for roving tabindex and arrow-key focus management
  const normalRadioRef = useRef<HTMLButtonElement>(null);
  const largeRadioRef = useRef<HTMLButtonElement>(null);
  const largestRadioRef = useRef<HTMLButtonElement>(null);

  const textSizes: { id: TextSizePreference; labelBn: string; labelEn: string; scale: string }[] = [
    { id: 'normal', labelBn: 'সাধারণ', labelEn: 'Normal', scale: '100%' },
    { id: 'large', labelBn: 'বড়', labelEn: 'Large', scale: '112%' },
    { id: 'largest', labelBn: 'সবচেয়ে বড়', labelEn: 'Largest', scale: '125%' },
  ];

  // =========================================================================
  // 1. ROBUST DIALOG FOCUS TRAP & ACCESSIBILITY MANAGEMENT
  // =========================================================================
  // Focus moves into the dialog ONLY on the initial open transition (rising edge).
  // Preference updates while dialog is open MUST NOT restart this effect or steal focus.
  useEffect(() => {
    if (isOpen) {
      if (!wasOpenRef.current) {
        wasOpenRef.current = true;

        // Remember the actual element that opened the dialog
        if (activeTrigger) {
          storedTriggerRef.current = activeTrigger;
        } else if (document.activeElement instanceof HTMLElement) {
          storedTriggerRef.current = document.activeElement;
        }

        // Move focus into dialog on open (50ms timeout ensures DOM render)
        const timer = setTimeout(() => {
          closeButtonRef.current?.focus();
        }, 50);

        return () => clearTimeout(timer);
      }
    } else if (wasOpenRef.current) {
      // ONLY restore focus after a real dialog-close transition (falling edge)
      // Never steal focus when the application initially mounts with isOpen=false
      wasOpenRef.current = false;

      const target = storedTriggerRef.current || triggerRef?.current;
      if (target && target.isConnected && target.offsetParent !== null) {
        target.focus();
      } else if (triggerRef?.current && triggerRef.current.isConnected && triggerRef.current.offsetParent !== null) {
        triggerRef.current.focus();
      }
    }
  }, [isOpen, activeTrigger, triggerRef]);

  // Keyboard navigation & focus trap (Tab / Shift+Tab wrapping, Escape dismissal)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab') {
        if (!panelRef.current) return;

        const focusableSelector =
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

        const focusableElements = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)
        ).filter((el) => {
          return el.offsetParent !== null && !el.hasAttribute('disabled');
        });

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: wrap from first to last
          if (document.activeElement === firstElement || !panelRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: wrap from last to first
          if (document.activeElement === lastElement || !panelRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside listener for popover dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const targetNode = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(targetNode) &&
        (!storedTriggerRef.current || !storedTriggerRef.current.contains(targetNode)) &&
        (!triggerRef?.current || !triggerRef.current.contains(targetNode))
      ) {
        onCloseRef.current();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, triggerRef]);

  // =========================================================================
  // 2. RADIO GROUP ARROW-KEY NAVIGATION & ROVING TABINDEX
  // =========================================================================
  const handleRadioKeyDown = (
    e: React.KeyboardEvent,
    currentId: TextSizePreference
  ) => {
    const order: TextSizePreference[] = ['normal', 'large', 'largest'];
    const currentIndex = order.indexOf(currentId);
    let nextIndex = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % order.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + order.length) % order.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = order.length - 1;
    }

    if (nextIndex !== -1) {
      const nextId = order[nextIndex];
      onUpdatePreference('textSize', nextId);
      const target =
        nextId === 'normal'
          ? normalRadioRef.current
          : nextId === 'large'
          ? largeRadioRef.current
          : largestRadioRef.current;
      target?.focus();
    }
  };

  if (!isOpen) return null;

  const handleReset = () => {
    onResetPreferences();
    setResetNotice(
      language === 'bn'
        ? 'ডিফল্ট সেটিংসে পুনঃস্থাপিত হয়েছে'
        : 'Restored to default settings'
    );
    setTimeout(() => setResetNotice(null), 3000);
  };

  return (
    <div
      id="accessibility-dialog"
      className="fixed inset-0 z-50 flex items-end sm:items-start sm:justify-end p-0 sm:p-4 sm:pt-16 bg-black/40 backdrop-blur-xs transition-opacity duration-standard"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-panel-title"
      aria-describedby="a11y-panel-desc"
    >
      {/* Settings Surface: Bottom sheet on mobile (<640px), crisp anchored popover on desktop */}
      <div
        ref={panelRef}
        className="w-full sm:max-w-md bg-white border border-[#DDE4DF] rounded-t-xl sm:rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[88vh] animate-fadeIn focus:outline-none"
        tabIndex={-1}
      >
        {/* Masthead Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DDE4DF] bg-[#F5F7F5]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#176B53] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 id="a11y-panel-title" className="text-sm sm:text-base font-bold text-[#172B3A] tracking-tight">
                {language === 'bn' ? 'অ্যাক্সেসিবিলিটি সেটিংস' : 'Accessibility Settings'}
              </h2>
              <p id="a11y-panel-desc" className="text-xs text-[#526359]">
                {language === 'bn'
                  ? 'আপনার প্রয়োজন অনুযায়ী ওয়েবসাইটের লেখা ও প্রদর্শন পরিবর্তন করুন।'
                  : "Adjust the website's text and display to suit your needs."}
              </p>
            </div>
          </div>

          <button
            id="btn-close-accessibility"
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-[#526359] hover:text-[#172B3A] hover:bg-white border border-transparent hover:border-[#DDE4DF] transition min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#176B53]"
            aria-label={language === 'bn' ? 'সেটিংস প্যানেল বন্ধ করুন' : 'Close accessibility settings'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Settings Groups */}
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* SECTION 1: Text Appearance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#172B3A] flex items-center space-x-1.5">
                <Type className="w-3.5 h-3.5 text-[#176B53]" />
                <span>{language === 'bn' ? 'লেখার আকার' : 'Text Size'}</span>
              </label>
              <span className="text-xs font-mono font-medium text-[#526359]">
                {preferences.textSize === 'normal'
                  ? '100%'
                  : preferences.textSize === 'large'
                  ? '112%'
                  : '125%'}
              </span>
            </div>

            {/* Accessible Segmented Radio Group with Arrow-Key Navigation */}
            <div
              role="radiogroup"
              aria-label={language === 'bn' ? 'লেখার আকার নির্বাচন' : 'Select text size'}
              className="grid grid-cols-3 gap-1.5 p-1 rounded-md bg-[#F5F7F5] border border-[#DDE4DF]"
            >
              {textSizes.map((opt) => {
                const isSelected = preferences.textSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    id={`btn-text-size-${opt.id}`}
                    ref={opt.id === 'normal' ? normalRadioRef : opt.id === 'large' ? largeRadioRef : largestRadioRef}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={isSelected ? 0 : -1} // Roving tabindex: only checked item is in Tab sequence
                    onClick={(e) => {
                      e.currentTarget.focus();
                      onUpdatePreference('textSize', opt.id);
                    }}
                    onKeyDown={(e) => handleRadioKeyDown(e, opt.id)}
                    className={`py-2 px-2.5 rounded text-xs font-semibold flex flex-col items-center justify-center transition-all duration-fast min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#176B53] ${
                      isSelected
                        ? 'bg-[#176B53] text-white shadow-xs font-bold'
                        : 'text-[#526359] hover:text-[#172B3A] hover:bg-white'
                    }`}
                  >
                    <span>{language === 'bn' ? opt.labelBn : opt.labelEn}</span>
                    <span className={`text-xs opacity-80 font-mono ${isSelected ? 'text-white' : 'text-[#65736B]'}`}>
                      {opt.scale}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs sm:text-sm text-[#526359] leading-relaxed">
              {language === 'bn'
                ? 'বড় বা সবচেয়ে বড় নির্বাচন করলে ফন্ট স্কেলিং রুলস অনুসারে হেডলাইন ও মূল বক্তব্য দৃশ্যমানভাবে বড় হবে।'
                : 'Scales typography proportionally across all pages while preserving editorial hierarchy.'}
            </p>
          </div>

          <div className="border-t border-[#DDE4DF]/70" />

          {/* SECTION 2: Display & Visibility (Clean settings rows, no repetitive heavy card boxes) */}
          <div className="space-y-1">
            <div className="pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A] flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-[#176B53]" />
                <span>{language === 'bn' ? 'প্রদর্শন ও দৃশ্যমানতা' : 'Display & Visibility'}</span>
              </span>
            </div>

            {/* Toggle 1: High Contrast — Semantic single-button switch row */}
            <button
              id="toggle-high-contrast"
              type="button"
              role="switch"
              aria-checked={preferences.highContrast}
              aria-labelledby="label-high-contrast"
              aria-describedby="desc-high-contrast"
              onClick={(e) => {
                e.currentTarget.focus();
                onUpdatePreference('highContrast', !preferences.highContrast);
              }}
              className="w-full flex items-center justify-between gap-4 py-3 px-2 border-b border-[#DDE4DF]/60 hover:bg-[#F5F7F5] rounded-md transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#176B53] focus-visible:ring-offset-2 min-h-[44px] group"
            >
              <div className="space-y-0.5 pr-2">
                <span
                  id="label-high-contrast"
                  className="text-sm font-bold text-[#172B3A] block group-hover:text-[#176B53] transition-colors"
                >
                  {language === 'bn' ? 'উচ্চ কনট্রাস্ট' : 'High Contrast'}
                </span>
                <p
                  id="desc-high-contrast"
                  className="text-xs sm:text-sm text-[#526359] leading-relaxed"
                >
                  {language === 'bn'
                    ? 'লেখা, ব্যাকগ্রাউন্ড ও গুরুত্বপূর্ণ সীমারেখার পার্থক্য স্পষ্ট করে।'
                    : 'Sharpens contrast between text, backgrounds, and functional boundaries.'}
                </p>
              </div>

              {/* Accessible Switch Visual Track */}
              <span
                aria-hidden="true"
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-standard ease-standard ${
                  preferences.highContrast ? 'bg-[#176B53]' : 'bg-[#DDE4DF]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-standard ease-standard ${
                    preferences.highContrast ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>

            {/* Toggle 2: Underline Links — Semantic single-button switch row */}
            <button
              id="toggle-underline-links"
              type="button"
              role="switch"
              aria-checked={preferences.underlineLinks}
              aria-labelledby="label-underline-links"
              aria-describedby="desc-underline-links"
              onClick={(e) => {
                e.currentTarget.focus();
                onUpdatePreference('underlineLinks', !preferences.underlineLinks);
              }}
              className="w-full flex items-center justify-between gap-4 py-3 px-2 border-b border-[#DDE4DF]/60 hover:bg-[#F5F7F5] rounded-md transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#176B53] focus-visible:ring-offset-2 min-h-[44px] group"
            >
              <div className="space-y-0.5 pr-2">
                <span
                  id="label-underline-links"
                  className="text-sm font-bold text-[#172B3A] block group-hover:text-[#176B53] transition-colors"
                >
                  {language === 'bn' ? 'লিংক আন্ডারলাইন দেখান' : 'Underline Links'}
                </span>
                <p
                  id="desc-underline-links"
                  className="text-xs sm:text-sm text-[#526359] leading-relaxed"
                >
                  {language === 'bn'
                    ? 'লিংকগুলোকে অন্য লেখা থেকে সহজে আলাদা করে চিনতে সাহায্য করে।'
                    : 'Adds explicit underlines to all textual links so color is not the only indicator.'}
                </p>
              </div>

              {/* Accessible Switch Visual Track */}
              <span
                aria-hidden="true"
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-standard ease-standard ${
                  preferences.underlineLinks ? 'bg-[#176B53]' : 'bg-[#DDE4DF]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-standard ease-standard ${
                    preferences.underlineLinks ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          </div>

          {/* SECTION 3: Motion & Transitions */}
          <div className="space-y-1">
            <div className="pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A] flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#176B53]" />
                <span>{language === 'bn' ? 'মোশন ও ট্রানজিশন' : 'Motion & Transitions'}</span>
              </span>
            </div>

            {/* Toggle 3: Reduce Motion — Semantic single-button switch row */}
            <button
              id="toggle-reduce-motion"
              type="button"
              role="switch"
              aria-checked={preferences.reduceMotion}
              aria-labelledby="label-reduce-motion"
              aria-describedby="desc-reduce-motion"
              onClick={(e) => {
                e.currentTarget.focus();
                onUpdatePreference('reduceMotion', !preferences.reduceMotion);
              }}
              className="w-full flex items-center justify-between gap-4 py-3 px-2 hover:bg-[#F5F7F5] rounded-md transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#176B53] focus-visible:ring-offset-2 min-h-[44px] group"
            >
              <div className="space-y-0.5 pr-2">
                <span
                  id="label-reduce-motion"
                  className="text-sm font-bold text-[#172B3A] block group-hover:text-[#176B53] transition-colors"
                >
                  {language === 'bn' ? 'অ্যানিমেশন কমান' : 'Reduce Motion'}
                </span>
                <p
                  id="desc-reduce-motion"
                  className="text-xs sm:text-sm text-[#526359] leading-relaxed"
                >
                  {language === 'bn'
                    ? 'অপ্রয়োজনীয় নড়াচড়া ও ট্রানজিশন কমিয়ে দেয় (সিস্টেমের সেটিং ওভাররাইড করতে পারেন)।'
                    : 'Disables decorative movement and simplifies transitions (can override OS preference).'}
                </p>
              </div>

              {/* Accessible Switch Visual Track */}
              <span
                aria-hidden="true"
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-standard ease-standard ${
                  preferences.reduceMotion ? 'bg-[#176B53]' : 'bg-[#DDE4DF]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-standard ease-standard ${
                    preferences.reduceMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Footer Area with Non-Destructive Reset Action */}
        <div className="p-4 border-t border-[#DDE4DF] bg-[#F5F7F5] flex flex-col gap-2">
          {resetNotice && (
            <div
              role="status"
              className="px-3 py-1.5 rounded bg-[#EAF3EE] border border-[#ABCFC3] text-[#176B53] text-xs font-semibold flex items-center space-x-1.5 animate-fadeIn"
            >
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{resetNotice}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              id="btn-reset-accessibility"
              type="button"
              onClick={handleReset}
              className="flex items-center space-x-1.5 text-xs font-semibold text-[#526359] hover:text-[#B42318] px-2.5 py-2 rounded hover:bg-white transition min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#176B53]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ডিফল্ট সেটিংসে ফিরিয়ে নিন' : 'Reset to Defaults'}</span>
            </button>

            <button
              id="btn-done-accessibility"
              type="button"
              onClick={onClose}
              className="ks-btn ks-btn-primary text-xs py-2 px-4 font-bold min-h-[44px]"
            >
              <span>{language === 'bn' ? 'সম্পন্ন' : 'Done'}</span>
            </button>
          </div>

          <p className="text-xs text-[#65736B] leading-normal pt-1">
            {language === 'bn'
              ? 'দ্রষ্টব্য: রিসেট করলে কেবল প্রদর্শন সেটিংস পুনঃস্থাপিত হবে; আপনার কোনো সংরক্ষিত অভিযোগ বা নথি মুছে যাবে না।'
              : 'Note: Resetting only restores display preferences; consumer cases and evidence files are never deleted.'}
          </p>
        </div>
      </div>
    </div>
  );
};
