# কেনাসাথী (KenaSathi) — Design System & Visual Identity
**Product**: KenaSathi (কেনাসাথী) — Consumer Rights Assistance & Guidance  
**Standard**: Accessible Civic Technology & Institutional Public Service Portal  
**Document Version**: 4.0.0 (Official Public Service Transformation)  

---

## 1. Design Philosophy

KenaSathi is crafted as a **mature, credible public-service platform for Bangladeshi citizens**:
- **Institutional Dignity**: Stressed citizens dealing with delayed orders, counterfeit goods, or unreturned payments require predictable flows, clear typography, and honest status indicators.
- **Civic Restraint**: Inspired by the functional clarity of GOV.UK (simple public-service navigation, readability, and clear actions) and the Bangladesh National Portal (structured hierarchy and public-service content).
- **Zero Tech Showcase Clutter**: No pulsing lasers, no neon glow, no simulated forensic dials, no fake accuracy scores, and no hyperbolic marketing claims.
- **Honest Provenance & Status**: Strict separation between user-reported information, local pattern extraction, and optional model suggestions.

---

## 2. Institutional Color Palette & Tokens

| Token | Hex Value | Purpose & Usage |
| :--- | :--- | :--- |
| **Primary** | `#176B53` | Main brand actions, prominent buttons, links, and identity |
| **Dark Navy** | `#172B3A` | Header bar, primary page headings, masthead titles |
| **Background (Canvas)** | `#F4F6F5` | Calm, neutral institutional page background |
| **Surface** | `#FFFFFF` | Content containers, forms, tables, and dialog surfaces |
| **Border** | `#D9E0DC` | Clean, subtle structural dividers and input boundaries |
| **Body Text** | `#26352E` | High-contrast main body text (14:1 contrast ratio against white) |
| **Secondary Text** | `#64716A` | Supporting metadata, timestamps, and helper descriptions |
| **Warning** | `#A96C16` | Statutory cautions, limitation warnings, notice badges |
| **Danger** | `#B42318` | Time-barred notices, severe statutory offenses, delete actions |

```css
:root {
  --color-primary: #176B53;
  --color-primary-hover: #135944;
  --color-primary-light: #EAF3F0;
  --color-navy: #172B3A;
  --color-navy-hover: #11212D;
  --color-bg-base: #F4F6F5;
  --color-surface: #FFFFFF;
  --color-border: #D9E0DC;
  --color-text-primary: #26352E;
  --color-text-secondary: #64716A;
  --color-warning: #A96C16;
  --color-danger: #B42318;
}
```

---

## 3. Typography System

- **Bengali Primary**: `Noto Sans Bengali` (weights 400, 500, 600, 700) with generous line heights (1.6–1.75) for optimal readability.
- **English Supporting**: `Plus Jakarta Sans` (weights 400, 500, 600, 700, 800) for clean civic clarity.
- **Monospace Precision**: `JetBrains Mono` strictly reserved for transaction IDs, TrxIDs, statute section codes, and technical values.

---

## 4. Component Rules

- **Corner Radius**: 4–8px radius (`rounded-md`, `rounded-lg`). No oversized pill badges or floating bubbles.
- **Shadows**: Minimal (`shadow-sm`, `shadow-xs`). Content surfaces are defined by crisp `#D9E0DC` borders rather than artificial floating elevation.
- **Buttons**:
  - `ks-btn-primary`: `#176B53` solid background with white text.
  - `ks-btn-secondary`: `#FFFFFF` surface with `#D9E0DC` border and `#26352E` text.
  - `ks-btn-danger`: Red alert outline for deletion and reset operations.
- **Badges**: Rectangular with subtle 4px radius. No circular or pill badges.

---

## 5. Accessibility & Contrast (WCAG 2.2 AA)

- All body text complies with WCAG 2.2 Level AA contrast requirements (minimum 4.5:1 ratio).
- `:focus-visible` outlines use a distinct 2px solid `#176B53` ring with a 2px offset.
- High-contrast mode toggles a black-and-gold high-contrast view for visually impaired citizens.
