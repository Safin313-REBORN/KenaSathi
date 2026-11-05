# কেনাসাথী (KenaSathi) — Design System & Visual Identity

**Product:** Independent civic consumer-assistance platform
**Review date:** 5 November 2026
**Status:** Sizing and responsive implementation guide; not a WCAG conformance claim

## Design direction

KenaSathi uses a Bengali-first editorial interface for people organizing consumer-purchase disputes. Its tone is calm, practical and independent. It identifies DNCRP and other official channels as external services; it does not present itself as a government body or filing portal.

## Color tokens

| Token | Value | Use |
|---|---|---|
| Primary | `#176B53` | Main actions, links and selected states |
| Deep primary | `#124A3B` | Pressed and hover states |
| Navy | `#172B3A` | Header, section titles and footer |
| Canvas | `#F5F7F5` | Page background |
| Surface | `#FFFFFF` | Cards, forms and document surfaces |
| Soft green | `#EAF3EE` | Selected states and supportive information |
| Primary ink | `#26352E` | Main text |
| Secondary ink | `#526359` | Explanatory text and labels |
| Border | `#DDE4DF` | Structural dividers and field boundaries |
| Warning | `#945607` | Statutory deadline notices |
| Danger | `#B42318` | Errors and destructive actions |

The high-contrast preference switches to the coordinated dark navy and mint palette in `src/index.css`. Each foreground/background pairing still requires contrast verification before claiming WCAG conformance.

## Typography

Use Noto Sans Bengali first for Bengali, Plus Jakarta Sans for Latin text and JetBrains Mono for identifiers and technical values. Bengali body copy uses a relaxed line height to preserve conjunct readability.

| Role | Size / line height | Weight | Use |
|---|---:|---:|---|
| Caption | 12 / 17px | 500–600 | Helper text and non-critical metadata |
| Supporting | 14 / 21px | 400–600 | Labels, table content, navigation and secondary actions |
| Body | 16 / 28px | 400 | Explanations and form content |
| Lead | 18 / 28px | 400–600 | Short introductions |
| Section title | 20–24 / 28–32px | 600–700 | Card and page sections |
| Page title | 30–36 / 40–44px | 700 | Route heading; 24–30px on narrow screens |
| Display | 40–52 / 1.2 | 700–800 | Homepage heading; 30–36px on phones |

## Spacing, shapes and controls

- Spacing scale: 4, 8, 12, 16, 24, 32 and 48px. Use 12–16px within controls, 16–24px within content sections and 24–32px between distinct sections.
- Radii: 4px badges, 6px buttons and fields, 8px content surfaces and cards.
- Content cards use a single border as their elevation cue. Shadows are reserved for overlays and visibly floating controls.
- Shared `ks-btn` controls are at least 44px tall, use 14px semibold text and 14px horizontal padding. Primary is solid green, secondary is white with a border, danger is reserved for destructive actions, and text links are tertiary.
- Text inputs, selects and textareas are at least 44px tall with 16px text. Checkboxes, radios and range inputs keep native dimensions.
- Visible keyboard focus is required. High-contrast mode has its own stronger focus ring.
- A card exists only to group information or provide a distinct state. Keep cards single-layered; empty states should fit their message and actions without excess vertical padding.

## Responsive rules

- Main container: maximum 1280px, centered; 16px side padding on phones, 24px on tablets and 32px on wide desktop.
- Below 1280px, use the compact masthead and mobile navigation drawer. At and above 1280px, show one-line primary navigation labels.
- Use one column on phones, two columns from 768px where content supports them, and three columns from 1280px where text remains readable. Service metadata stays two columns through tablet widths.
- Tables remain semantic and scroll within their own wrapper. The document register supplies stacked mobile rows; page-level horizontal scrolling is not acceptable.
- Button groups wrap instead of shrinking labels. Bengali text wraps naturally. Long IDs and filenames may truncate only when the full value remains available.

## Interaction

Color and opacity transitions use the motion tokens in `src/index.css`. Honor the reduced-motion preference. Hover must not be the only feedback. Keep destructive actions distinct, focus visible, and text link underlining available through the accessibility settings.

## Review note

The 5 November 2026 review checked the homepage, services, empty case state, populated case workspace, document register and guide in a live Chromium-based browser at desktop (default 1383×900), tablet (768×1024) and mobile (390×844) viewports. See `docs/RESPONSIVE_QA.md` for findings and verification limits.
