---
name: KenaSathi (কেনাসাথী)
description: Refined public-service editorial design, color system, and motion design for Bangladeshi consumer assistance
colors:
  primary: "#176B53"
  primary-deep: "#124A3B"
  primary-hover: "#135944"
  navy: "#172B3A"
  navy-deep: "#102431"
  canvas: "#F5F7F5"
  surface: "#FFFFFF"
  surface-soft: "#EAF3EE"
  surface-pale: "#F2F7F4"
  text-primary: "#26352E"
  text-secondary: "#526359"
  text-muted: "#65736B"
  border: "#DDE4DF"
  border-strong: "#C2CDC6"
  warning: "#945607"
  warning-bg: "#FEF7EC"
  danger: "#B42318"
  danger-bg: "#FDF2F2"
  hc-bg: "#09121A"
  hc-card: "#101F2C"
  hc-navy: "#E2E8F0"
  hc-navy-deep: "#101F2C"
  hc-navy-hover: "#FFFFFF"
  hc-border: "#4A6D88"
  hc-border-subtle: "#2C485E"
  hc-border-strong: "#709CB8"
  hc-accent: "#1EB88A"
  hc-accent-hover: "#2BD4A0"
  hc-ink-primary: "#FFFFFF"
  hc-ink-secondary: "#D2E0EB"
  hc-ink-muted: "#A5BDCE"
  hc-warning: "#FBBF24"
  hc-warning-text: "#FDE68A"
  hc-warning-bg: "#221A08"
  hc-danger: "#F87171"
  hc-danger-text: "#FECACA"
  hc-danger-bg: "#270F12"
  badge-green: "#C4DFD6"
motion:
  fast: "160ms"
  standard: "200ms"
  emphasis: "280ms"
  ease-standard: "cubic-bezier(0.2, 0, 0, 1)"
  ease-enter: "cubic-bezier(0.16, 1, 0.3, 1)"
typography:
  caption:
    fontFamily: "Noto Sans Bengali, Plus Jakarta Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1.4"
  display:
    fontFamily: "Noto Sans Bengali, Plus Jakarta Sans, sans-serif"
    fontSize: "3.25rem"
    fontWeight: 800
    lineHeight: "1.25"
  headline:
    fontFamily: "Noto Sans Bengali, Plus Jakarta Sans, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 700
    lineHeight: "1.3"
  title:
    fontFamily: "Noto Sans Bengali, Plus Jakarta Sans, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: "1.4"
  body:
    fontFamily: "Noto Sans Bengali, Plus Jakarta Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.75"
  body-large:
    fontFamily: "Noto Sans Bengali, Plus Jakarta Sans, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: "1.75"
  body-largest:
    fontFamily: "Noto Sans Bengali, Plus Jakarta Sans, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: "1.75"
  label:
    fontFamily: "Noto Sans Bengali, Plus Jakarta Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: "1.4"
  code:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.5"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md-small: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
controls:
  minimum-height: "44px"
  horizontal-padding: "14px"
  text-size: "14px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
---

> This file records design intent and token choices, not a conformance report. The 5 November 2026 review was a focused accessibility check; no full WCAG 2.2 audit or screen-reader study was completed. See `docs/ACCESSIBILITY_AUDIT.md`.

# Design System: KenaSathi (কেনাসাথী)
**Premium Civic Digital Service Design System & Motion Specification**

## 1. Overview & Civic Posture
KenaSathi is an independent civic consumer assistance platform for Bangladeshi citizens.
The design direction embodies:
**Modern Government Digital Service × Premium Editorial Design × Refined Civic Technology.**

It pairs the usability, restraint, and visual discipline of international civic-service platforms (such as GOV.UK and modern national service portals) with a warm, authentic Bengali editorial character. It firmly rejects generic AI dashboard tropes (neon gradients, cards within cards, floating bubbles, bouncy physics, and AI hype scanners) while strictly preserving its status as an independent consumer protection service (zero government impersonation, no state crests, and no fake submission confirmations).

---

## 2. Centralized Color Tokens & Balance

### Recommended Palette
| Design Token | CSS Variable | Hex | Usage & Role |
|---|---|---|---|
| Primary Green | `--color-primary` | `#176B53` | Main brand identity and key civic actions |
| Deep Forest | `--color-primary-deep` | `#124A3B` | Hover, active, pressed states, print headers |
| Dark Navy | `--color-navy` | `#172B3A` | Institutional mastheads, headings, and footer surfaces |
| Navy Deep | `--color-navy-deep` | `#102431` | Dark utility sub-surfaces and footer strips |
| Canvas | `--color-canvas` | `#F5F7F5` | Main page background (prevents eye fatigue) |
| Pure White | `--color-surface` | `#FFFFFF` | Main content surfaces and A4 document previews |
| Soft Green | `--color-surface-soft`| `#EAF3EE` | Selected navigation items, tonal badges, statutory highlights |
| Pale Green | `--color-surface-pale`| `#F2F7F4` | Interactive row hover backgrounds and dropzone hover tint |
| Primary Ink | `--color-ink-primary` | `#26352E` | Main body text token |
| Secondary Ink | `--color-ink-secondary`| `#526359` | Supporting information token |
| Muted Ink | `--color-ink-muted` | `#65736B` | Less prominent labels and borders (≥ 3:1 contrast) |
| Border | `--color-border` | `#DDE4DF` | Structural dividers and field borders |
| Strong Border | `--color-border-strong`| `#C2CDC6` | Hover borders, selected states |
| Warning | `--color-warning` | `#945607` | Statutory deadlines (Section 60 alerts) |
| Warning Background | `--color-warning-bg`| `#FEF7EC` | Warning notice background |
| Danger | `--color-danger` | `#B42318` | Critical time-bar alerts, deletion confirmations |
| Danger Background | `--color-danger-bg` | `#FDF2F2` | Error surfaces |

### Visual Balance Composition
- **65–70%**: Neutral white (`#FFFFFF`) and soft canvas (`#F5F7F5`).
- **15–20%**: Dark navy (`#172B3A`) and primary typography (`#26352E`).
- **8–12%**: Soft green surfaces (`#EAF3EE` and `#F2F7F4`).
- **3–5%**: Strong green accents and primary actions (`#176B53`).
- **Strictly Conditional**: Warning (`#945607`) and danger (`#B42318`) only when legally or procedurally necessary.

---

## 3. Bengali & English Typography Rhythm

### Typefaces
- **Bengali Primary**: `Noto Sans Bengali` — prioritized across all Bengali content, ensuring open counters and clear rendering of complex conjuncts (যুক্তাক্ষর).
- **English Alphanumeric**: `Plus Jakarta Sans` — clean, institutional geometry with generous x-height.
- **Identifiers & Technical Figures**: `JetBrains Mono` — used strictly for Case IDs, TrxIDs, telephone numbers, and monetary figures.

### Type Scale & Rhythm
| Element | Desktop Guideline | Mobile Guideline | Line-Height | Font Weight |
|---|---|---|---|---|
| Hero Title | 48–56px (`3.25rem`) | 32–38px (`2rem`) | 1.25 | Extrabold (800) |
| Page Title | 34–40px (`2.125rem`)| 27–32px (`1.75rem`)| 1.3 | Bold (700) |
| Section Title | 27–32px (`1.75rem`) | 23–27px (`1.5rem`) | 1.4 | Bold (700) |
| Subheading | 19–22px (`1.25rem`) | 18–20px (`1.125rem`)| 1.45 | Semibold (600) |
| Body Text | 16–17px (`1rem`) | 15–16px (`0.9375rem`)| 1.65–1.75 | Regular (400) |
| Supporting Text| 14–15px (`0.875rem`)| 13–14px (`0.8125rem`)| 1.5 | Medium (500) |
| Form Labels | 14–15px (`0.875rem`)| 14–15px (`0.875rem`)| 1.4 | Semibold (600) |

---

## 4. Motion Design System & Micro-Interactions

### Timing Tokens & Easing Curves
- `--motion-fast`: `160ms` — button hovers, color shifts, icon translations.
- `--motion-standard`: `200ms` — chevron rotations, tab switches, dropdown triggers.
- `--motion-emphasis`: `280ms` — drawer entry, modal entrance, toast notices.
- `--ease-standard`: `cubic-bezier(0.2, 0, 0, 1)` — organic acceleration and deceleration without bounce.
- `--ease-enter`: `cubic-bezier(0.16, 1, 0.3, 1)` — crisp deceleration for overlay reveals.

### Interaction Specifications
1. **Desktop Navigation (`.ks-nav-link`)**:
   - On hover, text color shifts from secondary ink (`#526359`) to primary green (`#176B53`).
   - A crisp 2px green underline expands smoothly from left to right (`width: 0%` to `100%`) in 160ms.
   - Active link maintains green text and full underline. No oversized pill wrappers.
2. **Primary Actions (`.ks-btn-primary`)**:
   - Deepens from `#176B53` to `#124A3B` on hover with a subtle shadow elevation.
   - Trailing arrow (`ArrowRight`) smoothly translates 2–3px to the right (`translate-x-[2px]`).
   - Active pressed state: scales to 0.99 with no bouncy recoil.
3. **Secondary Actions (`.ks-btn-secondary`)**:
   - Pure white surface with `#DDE4DF` border transitions to pale green tint (`#F2F7F4`) on hover.
4. **Service Rows (`.ks-service-row`)**:
   - Row transitions to pale green (`#F2F7F4`) background.
   - Service numeral transitions from muted `#526359` to `#176B53`.
   - Trailing arrow shifts 3px right. The entire row behaves as one cohesive interactive element without jumping vertically.
5. **FAQ Accordion**:
   - Chevron rotates 180 degrees smoothly (`transform duration-standard ease-standard rotate-180`).
   - Content expands with soft fade-in without abrupt jumping.
6. **Guided Intake Stepper**:
   - Completed steps display a clear checkmark icon (`CheckCircle2`) and soft green tint (`#EAF3EE`).
   - Active step displays crisp filled primary green with white numeral.
7. **Upload Dropzone (`.ks-dropzone`)**:
   - Dashed border transitions from `#DDE4DF` to `#176B53`.
   - Background shifts to `#F2F7F4`. Upload icon scales 1.1x smoothly.
8. **Institutional Dark-Navy Footer**:
   - Cohesive `#172B3A` surface with balanced `#ABCFC3` highlights, clear service links, helpline contacts, and mandatory independent service disclosure.

### Reduced Motion Preference
The interface includes a reduced-motion preference and responds to the operating-system setting. This behavior is a design intent and has not been evaluated with users who have vestibular sensitivities.

---

## 5. Accessibility design targets

The interface includes text scaling (100%, 112.5%, 125%), a high-contrast theme, reduced-motion controls, link underlining, visible focus styles, and modal focus handling. The 44×44px target is a design goal; individual controls still require full measurement.

The color values below are palette tokens and have not been audited across every text/background/state combination. Do not treat token-level estimates as proof of WCAG conformance. The current review found no horizontal overflow at the tested desktop and mobile sizes, but it did not test screen readers or every interface state.

### Accessibility Component Interaction Specifications

1. **Dialog Focus Trap (`AccessibilitySettings.tsx`)**:
   - `role="dialog"`, `aria-modal="true"`.
   - On open, initial focus moves to `#btn-close-accessibility`.
   - Tab navigates sequentially forward; on last element (`#btn-done-accessibility`), wraps to first (`#btn-close-accessibility`).
   - Shift+Tab navigates backward; on first element, wraps to last.
   - Escape closes dialog immediately.
   - Focus restoration: On close, focus returns to the triggering element (desktop `#btn-accessibility-toggle` or mobile menu toggle `#btn-mobile-menu-toggle`). Zero focus theft on initial page load.

2. **Radio Group Roving TabIndex (`[role="radiogroup"]`)**:
   - Only the currently selected text-size option has `tabIndex={0}`; unselected options have `tabIndex={-1}`.
   - Pressing `ArrowRight` or `ArrowDown` selects next option and moves focus immediately.
   - Pressing `ArrowLeft` or `ArrowUp` selects previous option and moves focus immediately.
   - Pressing `Home` selects Normal (100%); pressing `End` selects Largest (125%).
   - Tab enters the checked radio option once, then moves directly to the next setting row without stopping on each radio option.

3. **Switch Target Comfort (44×44px)**:
   - Each switch control is wrapped in a `<button role="switch">` providing a minimum interactive hit area of 44×44px (`min-h-[44px] min-w-[44px] p-2`).
   - Visual switch track remains compact (`h-6 w-11`) with smooth sliding thumb (`h-5 w-5`) that does not distort or cause layout shift.
   - Entire setting row is clickable to toggle the switch.

4. **Reduced Motion Precedence**:
   - System default: Respects OS `prefers-reduced-motion` media query when no citizen preference is stored.
   - Citizen override: If a citizen explicitly toggles Reduce Motion on or off, the stored preference takes precedence over the OS setting.
   - In CSS, `html[data-reduce-motion="true"]` clamps transitions to `0.001ms`. When `data-reduce-motion="false"`, transitions remain smooth even if the OS query matches.
