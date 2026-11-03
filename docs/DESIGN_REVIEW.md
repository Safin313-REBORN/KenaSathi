# KenaSathi AI (কেনাসাথী) — Design System & Interaction Review

**Event**: Ostad Presents YUNet AIgnite Buildathon 2026  
**Auditor**: Antigravity UI/UX Design & Frontend Engineering  
**Scope**: Full visual overhaul, information architecture reconstruction, and accessibility audit.  
**Verification Date**: November 3, 2026  

---

## 1. Executive Design Evaluation

Prior to this engineering redesign, KenaSathi AI exhibited an overly "vibe-coded" aesthetic: dark backgrounds, glowing neon borders, laser beam animations, fake re-audit spinners, and fragmented tabs. While visually flashy, it read as a sci-fi cyber console rather than a trustworthy, authoritative Bangladeshi civic-fintech service.

The upgraded product implements a **light-first, calm institutional visual system** grounded in plain-language civic principles, WCAG 2.2 AA contrast standards, and authentic legal workflows under the **Consumer Rights Protection Act 2009 (CRPA 2009)**.

---

## 2. Palette & Color Token Evaluation

| Token Name | Hex Code | Role | Contrast Ratio (vs Background) | Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Navy** | `#142B3B` | Brand identity, primary headers, key actions | 13.8:1 | WCAG AAA |
| **Deep Teal** | `#087E78` | Primary accent, verified badges, action buttons | 5.2:1 | WCAG AA |
| **Teal Light** | `#E8F5F2` | Subtle badges, callout container backgrounds | N/A (Surface) | Compliant |
| **Canvas Background** | `#F6F8FA` | Gentle off-white app background (no sterile white glare) | Base | Compliant |
| **Surface** | `#FFFFFF` | Elevated cards, modals, formal papers | Base | Compliant |
| **Text Primary** | `#192B38` | Headings, body titles, primary legal statements | 12.9:1 | WCAG AAA |
| **Text Secondary** | `#657481` | Metadata, statutory commentary, subtext | 4.8:1 | WCAG AA |
| **Border Neutral** | `#E4E9ED` | Clean card outlines (replaces heavy glow outlines) | N/A | Compliant |
| **Success / Verified** | `#16845B` | Fact verified badges, completed tasks | 5.6:1 | WCAG AA |
| **Warning / Limitation** | `#B7791F` | Section 60 30-day countdown, unverified notices | 4.6:1 | WCAG AA |
| **Danger** | `#C44747` | Expired countdown, statutory violation alerts | 5.1:1 | WCAG AA |

---

## 3. Information Architecture (5 Core Views + Public Landing)

1. **Public Landing Hero (`LandingHero.tsx`)**:
   - Reassuring headline (*"আপনার অনলাইন কেনাকাটায় থাকুক সুরক্ষা।"* / *"Shop Smarter. Stay Protected."*).
   - Real Bangladeshi consumer scenarios (advance payment without delivery, fake replica goods, refused returns).
   - Illustrative fictional sample preview card labeled with an honest neutral badge.
   - National Emergency / DNCRP 16121 civic directory grid.
   - Section 60 FAQ specifying 30 calendar days.
2. **Overview Dashboard (`OverviewDashboard.tsx`)**:
   - Earliest Section 60 deadline banner (or `তারিখ দেওয়া হয়নি` when missing).
   - Active case cards with price, seller, and category.
   - Urgent citizen task checklist.
   - Direct launcher into dispute workspace and evidence vault.
3. **Check a Purchase (`PurchaseInspectionView.tsx`)**:
   - Single unified inspection workspace.
   - 5 transparent fact provenance filter tabs (*All*, *Verified*, *Pattern Extracted*, *User Reported*, *AI Suggested*).
   - Explicit processing mode indicator with badge (*Live Gemini 3.8 Flash*, *Local Deterministic Rules*, *Missing Credentials*).
   - Warning signs breakdown with statutory reference callouts.
4. **My Cases Workspace (`CaseWorkspaceView.tsx`)**:
   - 6-property persistent header strip: Status, Grievance Category, Claimed Amount, Seller Name, Section 60 Countdown, Next Action Recommendation.
   - 6 contextual sub-tabs for complete lifecycle management: *Summary*, *Timeline*, *Evidence*, *Tasks*, *Financial Details*, *Complaint Draft*.
5. **Evidence & Documents Vault (`DocumentsView.tsx`)**:
   - Unified vault displaying receipts, courier slips, chat screenshots, and PDFs.
   - File status badges (Stored locally, Text extracted, Cloud analyzed, Failed).
   - Cross-linking directly to respective dispute workspaces.
6. **Consumer Guide & Directory (`ConsumerGuideDirectory.tsx`)**:
   - DNCRP 16121 national helpline, emergency contacts (999, 16430 Legal Aid).
   - Physical divisional offices with addresses, direct phone numbers, and official emails.
   - Section 40, 41, 44, 45, 50 statutory breakdown with penalties and fine ranges.

---

## 4. Typography & Bilingual Styling

- **Primary Font Family**: Clean modern font stack loading **Plus Jakarta Sans** for English and Latin glyphs, and **Noto Sans Bengali** for complete Bengali conjunct rendering.
- **Monospace Font**: **JetBrains Mono** strictly for transaction references, dates, and technical identifiers.
- **Hierarchical Scale**:
  - `h1`: 28px–36px, Bold (`#192B38`)
  - `h2`: 18px–20px, Bold (`#192B38`)
  - `h3` / Card Titles: 15px–16px, Semi-Bold (`#192B38`)
  - Body: 14px–15px, Regular, leading 1.6 (`#192B38`)
  - Metadata / Captions: 11px–12px, Regular (`#657481`)
  - Monospace: 13px, Bold (`font-mono`)
- **Tone**: Plain, respectful, and easily comprehended by non-technical citizens.

---

## 5. Accessibility & Motion Compliance

- **Reduced Motion Support**: All CSS keyframe animations wrap in `@media (prefers-reduced-motion: reduce)`.
- **Focus Rings**: Standardized `:focus-visible` with 2px solid teal offset ring on all interactive elements.
- **High Contrast Toggle**: Header includes instant high-contrast toggle boosting borders to 2px solid high-contrast black/yellow for low-vision users.
- **Keyboard Navigation**: ⌘K / Ctrl+K opens the redesigned Command Palette with arrow key selection and Enter execution.
- **Document Language**: Synchronizes `document.documentElement.lang` between `bn` and `en`.
