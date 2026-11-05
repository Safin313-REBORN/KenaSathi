import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AccessibilityPreferences,
  loadAccessibilityPreferences,
  saveAccessibilityPreferences,
  resetAccessibilityPreferences,
  applyAccessibilityToDOM,
  normalizeAccessibilityPreferences,
  getSystemPrefersReducedMotion,
  STORAGE_KEY_A11Y,
} from '../services/accessibilityPreferences';

export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    const initial = loadAccessibilityPreferences();
    applyAccessibilityToDOM(initial);
    return initial;
  });

  const preferencesRef = useRef(preferences);
  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  // Listen for storage events (multi-tab sync) with strict normalization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_A11Y && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const validated = normalizeAccessibilityPreferences(parsed);
          setPreferences(validated);
          applyAccessibilityToDOM(validated);
        } catch {
          // Ignore malformed storage updates safely
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for OS reduced-motion changes when no explicit citizen override exists
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      try {
        const current = preferencesRef.current;
        // Only react to OS changes when citizen has NO explicit override
        if (current.reduceMotionOverride === null) {
          const next: AccessibilityPreferences = {
            ...current,
            reduceMotion: e.matches,
          };
          setPreferences(next);
          applyAccessibilityToDOM(next);
        }
      } catch {
        // Safe fallback if error occurs
      }
    };

    if (mq.addEventListener) {
      mq.addEventListener('change', handleMotionChange);
      return () => mq.removeEventListener('change', handleMotionChange);
    } else if ('addListener' in mq) {
      (mq as unknown as { addListener: (cb: (e: MediaQueryListEvent) => void) => void }).addListener(handleMotionChange);
      return () => {
        (mq as unknown as { removeListener: (cb: (e: MediaQueryListEvent) => void) => void }).removeListener(handleMotionChange);
      };
    }
  }, []);

  const updatePreference = useCallback(
    <K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => {
      setPreferences((prev) => {
        let updated: Partial<AccessibilityPreferences>;

        if (key === 'reduceMotion') {
          // Citizen explicitly interacted with Reduce Motion switch: record manual override
          const explicitVal = Boolean(value);
          updated = {
            ...prev,
            reduceMotionOverride: explicitVal,
            reduceMotion: explicitVal,
          };
        } else if (key === 'reduceMotionOverride') {
          const override = value as boolean | null;
          updated = {
            ...prev,
            reduceMotionOverride: override,
            reduceMotion: override !== null ? override : getSystemPrefersReducedMotion(),
          };
        } else {
          updated = {
            ...prev,
            [key]: value,
          };
        }

        const next = normalizeAccessibilityPreferences(updated);
        saveAccessibilityPreferences(next);
        applyAccessibilityToDOM(next);
        return next;
      });
    },
    []
  );

  const resetAllPreferences = useCallback(() => {
    const defaults = resetAccessibilityPreferences();
    setPreferences(defaults);
  }, []);

  return {
    preferences,
    updatePreference,
    resetPreferences: resetAllPreferences,
  };
}
