/**
 * KenaSathi Accessibility Preferences Service
 * Single source of truth for citizen accessibility settings.
 * Persisted in browser localStorage under 'kenasathi_accessibility_preferences'.
 */

export type TextSizePreference = 'normal' | 'large' | 'largest';

export interface AccessibilityPreferences {
  textSize: TextSizePreference;
  highContrast: boolean;
  reduceMotion: boolean; // effective reduce-motion state for UI / DOM
  reduceMotionOverride: boolean | null; // explicit citizen choice (null = follow system)
  underlineLinks: boolean;
}

export const STORAGE_KEY_A11Y = 'kenasathi_accessibility_preferences';

/**
 * Check if the user's operating system requests reduced motion.
 */
export function getSystemPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Standard default accessibility preferences.
 * Respects OS reduced-motion setting initially.
 */
export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  textSize: 'normal',
  highContrast: false,
  reduceMotion: false, // Evaluated dynamically via getSystemPrefersReducedMotion()
  reduceMotionOverride: null, // explicit default is null (follow system)
  underlineLinks: false,
};

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // LocalStorage access may be restricted in sandboxed environments
  }

  try {
    if (typeof globalThis !== 'undefined' && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
      return (globalThis as unknown as { localStorage: Storage }).localStorage;
    }
  } catch {
    // Ignore globalThis storage access errors
  }

  return null;
}

/**
 * Robust normalization & validation of stored or incoming accessibility preferences.
 * Strict type checking ensures that malformed inputs like "false", null, numbers, or unknown keys
 * safely fall back to valid defaults rather than corrupting state or evaluating to true.
 *
 * Architecture:
 * - `reduceMotionOverride`: boolean | null (explicit citizen choice; null = follow system)
 * - `reduceMotion`: boolean (effective state = reduceMotionOverride ?? systemPrefersReducedMotion)
 */
export function normalizeAccessibilityPreferences(
  input: unknown,
  fallback = DEFAULT_ACCESSIBILITY_PREFERENCES
): AccessibilityPreferences {
  const systemPrefers = getSystemPrefersReducedMotion();

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    const override = fallback.reduceMotionOverride !== undefined ? fallback.reduceMotionOverride : null;
    return {
      textSize: fallback.textSize,
      highContrast: fallback.highContrast,
      reduceMotionOverride: override,
      reduceMotion: override !== null ? override : systemPrefers,
      underlineLinks: fallback.underlineLinks,
    };
  }

  const obj = input as Record<string, unknown>;

  // 1. Text Size: strictly 'normal' | 'large' | 'largest'
  const validSizes: TextSizePreference[] = ['normal', 'large', 'largest'];
  const textSize: TextSizePreference =
    typeof obj.textSize === 'string' && validSizes.includes(obj.textSize as TextSizePreference)
      ? (obj.textSize as TextSizePreference)
      : fallback.textSize;

  // 2. High Contrast: strictly boolean, never truthy string like "false"
  const highContrast = typeof obj.highContrast === 'boolean'
    ? obj.highContrast
    : fallback.highContrast;

  // 3. Reduce Motion Override: boolean | null
  let reduceMotionOverride: boolean | null;
  if (typeof obj.reduceMotionOverride === 'boolean') {
    reduceMotionOverride = obj.reduceMotionOverride;
  } else if (obj.reduceMotionOverride === null) {
    reduceMotionOverride = null;
  } else if (typeof obj.reduceMotion === 'boolean' && obj.reduceMotionOverride === undefined) {
    // If input explicitly provided reduceMotion boolean but no override, treat as citizen override
    reduceMotionOverride = obj.reduceMotion;
  } else {
    reduceMotionOverride = fallback.reduceMotionOverride ?? null;
  }

  // 4. Effective Reduce Motion: computed from override ?? system preference
  const reduceMotion = reduceMotionOverride !== null ? reduceMotionOverride : systemPrefers;

  // 5. Underline Links: strictly boolean
  const underlineLinks = typeof obj.underlineLinks === 'boolean'
    ? obj.underlineLinks
    : fallback.underlineLinks;

  return {
    textSize,
    highContrast,
    reduceMotion,
    reduceMotionOverride,
    underlineLinks,
  };
}

/**
 * Safely load accessibility preferences from localStorage with fallback to defaults.
 * Follows system preference on initial load if no explicit citizen override exists.
 */
export function loadAccessibilityPreferences(): AccessibilityPreferences {
  const systemPrefers = getSystemPrefersReducedMotion();
  const fallback: AccessibilityPreferences = {
    ...DEFAULT_ACCESSIBILITY_PREFERENCES,
    reduceMotionOverride: null,
    reduceMotion: systemPrefers,
  };

  const storage = getStorage();
  if (!storage) {
    return fallback;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY_A11Y);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    return normalizeAccessibilityPreferences(parsed, fallback);
  } catch (err) {
    console.warn('Failed to parse accessibility preferences from localStorage, using defaults:', err);
    return fallback;
  }
}

/**
 * Persist accessibility preferences to localStorage.
 */
export function saveAccessibilityPreferences(prefs: AccessibilityPreferences): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const validated = normalizeAccessibilityPreferences(prefs);
    storage.setItem(STORAGE_KEY_A11Y, JSON.stringify(validated));
  } catch (err) {
    console.error('Failed to save accessibility preferences to localStorage:', err);
  }
}

/**
 * Reset accessibility preferences to defaults without affecting case dossiers or documents.
 * Clears explicit motion override and restores system-following behavior.
 */
export function resetAccessibilityPreferences(): AccessibilityPreferences {
  const systemPrefers = getSystemPrefersReducedMotion();
  const freshDefaults: AccessibilityPreferences = {
    ...DEFAULT_ACCESSIBILITY_PREFERENCES,
    reduceMotionOverride: null,
    reduceMotion: systemPrefers,
  };
  saveAccessibilityPreferences(freshDefaults);
  applyAccessibilityToDOM(freshDefaults);
  return freshDefaults;
}

/**
 * Synchronize accessibility preferences with document root attributes and classes.
 * Centralised DOM mutation point — prevents duplicate DOM edits across components.
 */
export function applyAccessibilityToDOM(prefs: AccessibilityPreferences): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // 1. Text Size Attribute (scales rem typography)
  root.setAttribute('data-text-size', prefs.textSize);

  // 2. High Contrast Attribute and Class
  root.setAttribute('data-high-contrast', prefs.highContrast ? 'true' : 'false');
  if (prefs.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  // 3. Reduce Motion Attribute
  root.setAttribute('data-reduce-motion', prefs.reduceMotion ? 'true' : 'false');

  // 4. Underline Links Attribute
  root.setAttribute('data-underline-links', prefs.underlineLinks ? 'true' : 'false');
}
