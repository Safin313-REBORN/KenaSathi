# KenaSathi AI — Professional Redesign Audit (Phase 2)
**Date:** November 2026  
**Auditor:** Senior Product Designer & Full-Stack Architect  
**Project:** KenaSathi AI (কেনাসাথী) — Ostad Presents YUNet AIgnite Buildathon 2026  
**Target:** Transform current prototype into an accessible, trustworthy, institutional-grade Bangladeshi consumer protection platform.

---

## 1. Executive Summary & Core Diagnosis

The existing KenaSathi AI codebase has achieved solid backend and legal logic (robust CRPA 2009 statutory mapping, Gemini 3.8 Flash migration, Zod runtime validation, IndexedDB storage separation, and PII minimization). However, **the interface suffers from severe visual dissonance and "vibe-coding" tells**:

1. **Dark "Cyber/Hacker" Aesthetic**: The application is framed in pitch-black (`#050811`), neon cyan, glowing purple, and high-saturation cards reminiscent of gaming consoles or cryptocurrency dashboards, rather than a civic-tech/fintech consumer assistance portal.
2. **Gimmicky Interactive Toys**: Features like "Laser Scanner Loupe", "Simulate 4-Stage Re-Audit" setInterval spinners, "Price Deviation Sliders", and "3D Spatial Lab" distract from real consumer distress and reduce credibility before judicial and administrative evaluators.
3. **Cluttered Information Architecture**: Six horizontal tabs across the top (`landing`, `inspector`, `risk`, `complaint`, `directory`, `spatial`) force the citizen to guess where their dispute is being handled, rather than following a unified workspace (Overview -> Check Purchase -> My Cases -> Documents -> Guide).
4. **Mobile Navigation Deficits**: Horizontal tab strips overflow or wrap awkwardly on 360px–390px screens. Desktop-centric data tables lack responsive card transformations.
5. **Color & Hierarchy Inconsistencies**: Status colors are used decoratively rather than semantically. Headings and typography lack standard typographic scales for mixed Bengali and English typography.

---

## 2. Detailed Inspection by Component & Screen

### A. Navigation & Shell (`Navbar.tsx`, `App.tsx`)
- **Flaws**:
  - Double header with dark borders (`bg-[#070b14]/95`, `bg-[#050811]`) creating claustrophobic vertical compression.
  - Horizontal tab navigation (`tactile-btn`) with mixed bright background colors (cyan, rose, emerald, teal, purple) that conflict with professional design restraint.
  - Primary navigation treats "3D Spatial Lab" as an equal peer to filing a DNCRP complaint, signaling a toy project rather than an authentic civic service.
- **Recommended Remedy**:
  - Adopt a clean, light-first desktop sidebar navigation (`Overview`, `Check a Purchase`, `My Cases`, `Evidence & Documents`, `Consumer Guide`) with account/export utilities anchored at the bottom.
  - On mobile, adopt a streamlined, clean header with a persistent, comfortable bottom action bar and drawer.

### B. Landing Page (`LandingHero.tsx`)
- **Flaws**:
  - Excessively long scroll (770 lines) with scattered interactive widgets: a live laser scan toggle, a live loader modal simulator, fine/reward sliders, and complex specimen cards.
  - Headline doesn't follow the verified brief: needs the crystal-clear bilingual messaging:
    - *Bangla:* "আপনার অনলাইন কেনাকাটায় থাকুক সুরক্ষা।"
    - *English:* "Shop Smarter. Stay Protected."
    - *Supporting:* "KenaSathi AI helps you evaluate online purchase risks, organize evidence and prepare consumer complaints when something goes wrong."
- **Recommended Remedy**:
  - Restructure into 9 clean, trust-first sections:
    1. Hero & primary CTA ("Check a Purchase" / "How It Works").
    2. Real consumer problems (non-delivery, counterfeit goods, refusal of memo).
    3. How KenaSathi works (Inspect, Organize, Draft).
    4. Realistic purchase inspection preview (clean document upload & fact extraction).
    5. Evidence & case management preview.
    6. DNCRP Form-1 complaint preparation workflow.
    7. Bangladesh-specific consumer resources & 16121 hotline.
    8. Honest FAQ.
    9. Trust & statutory compliance footer with the Ostad Buildathon 2026 badge.

### C. Purchase Inspection & Evidence Upload (`InspectionDashboard.tsx`, `NewDisputeModal.tsx`)
- **Flaws**:
  - File upload inside `NewDisputeModal.tsx` is functional but crowded; lacks clear visual separation between drag-and-drop zones, active uploads, and privacy redaction advisories.
  - The inspector view in `InspectionDashboard.tsx` contains "Laser Scanning" toggles and "Simulate Re-Audit" dummy progress bars that detract from genuine AI-extracted facts.
- **Recommended Remedy**:
  - Clean, dedicated "Check a Purchase" workflow with modern drag-and-drop, mobile file picker, supported MIME chips (PNG, JPG, PDF up to 10MB), and instant thumbnail previews.
  - Fact presentation separated into distinct, honest tiers:
    - **Verified from Source** (e.g., PDF text extraction, official merchant records).
    - **Reported by User** (e.g., user-entered amount or seller handle).
    - **Extracted by Pattern** (e.g., regex-matched bKash/Nagad TrxID).
    - **Suggested by AI** (e.g., Gemini 3.8 Flash statutory inferences).
    - **Unknown / Missing Information** (e.g., seller physical address or trade license).
  - Explicit processing mode badge (`live_ai_success`, `local_rules_fallback`, `missing_credentials`, etc.).

### D. Case Workspace & Risk Assessment (`InspectionDashboard.tsx`, `RiskAnalysisView.tsx`)
- **Flaws**:
  - Fragmented across two disparate screens ("প্রতারণা অডিট ও প্রমাণ" and "ঝুঁকি ও আইনি ধারা").
  - Inside a case, the consumer must navigate backwards and forwards to see the timeline, statutory risks, and tasks.
- **Recommended Remedy**:
  - Unified Case Workspace (`My Cases` tab) with contextual sub-tabs:
    1. **Summary** (Case ID, seller, amount, status, primary Section 40/44/45/50 risk).
    2. **Timeline** (Incident date, Section 60 30-day countdown, statutory deadlines).
    3. **Evidence** (Uploaded receipts, chat logs, PDFs with thumbnail previews and extraction badges).
    4. **Tasks** (Action checklist with interactive toggle and status persistence).
    5. **Financial Details** (Purchase price, fair market value, refund claims).
    6. **Complaint Draft** (Integrated Form-1 DNCRP draft preview).

### E. Evidence & Documents Workspace
- **Flaws**:
  - Evidence items are trapped inside individual case widgets; citizens cannot view their complete repository of documents across their disputes.
- **Recommended Remedy**:
  - Dedicated "Evidence & Documents" section displaying file previews, file names, upload dates, category tags, extraction statuses, and linked dispute IDs.

### F. Complaint Builder (`ComplaintBuilder.tsx`)
- **Flaws**:
  - Dark-mode background makes legal print documents look unusual on screen.
  - Fine slider calculator at the top can confuse citizens into thinking they are awarding themselves a fine.
- **Recommended Remedy**:
  - Refined document sheet preview styled like official Bangladesh Government white paper (clean white card with crisp navy/slate typography and watermark).
  - Editable complainant, seller, and incident fields.
  - Dynamic attachments table derived directly from case evidence.
  - Clear statutory note on Section 76(4) 25% reward conditionality.
  - Copy and Print/Export PDF actions.

---

## 3. Typography & Design Tokens Audit

| Category | Existing Value (Problems) | New Standard (Phase 3 Design System) |
|---|---|---|
| **Theme** | Pitch-black dark mode (`#050811`, `#070b14`) | Refined light-first interface (`#F6F8FA` bg, `#FFFFFF` surface) |
| **Primary Navy** | `#0f172a` (Generic Tailwind slate) | `#142B3B` (Authoritative institutional navy) |
| **Teal Accent** | Bright cyan `#06b6d4` | `#087E78` (Deep Bangladeshi civic teal) |
| **Teal Light** | `#ecfeff` | `#E8F5F2` (Soft tinted surface for chips and active items) |
| **Primary Text** | `#f8fafc` on dark | `#192B38` (High contrast, readable dark slate) |
| **Secondary Text** | `#94a3b8` | `#657481` (Accessible neutral grey, WCAG AA compliant) |
| **Border** | `#1e293b` dark borders | `#E4E9ED` (Subtle, crisp border rules) |
| **Success** | `#10b981` | `#16845B` (Solid statutory green) |
| **Warning** | `#f59e0b` | `#B7791F` (Accessible amber/gold) |
| **Danger** | `#ef4444` | `#C44747` (Calibrated warning red) |
| **Font Family** | Inconsistent sans fonts | Inter / Plus Jakarta Sans + Noto Sans Bengali |

---

## 4. Functionality Boundaries That Must NOT Be Broken

During this redesign, the following repaired features are strictly preserved:
1. **Gemini 3.8 Flash Integration**: Live API calls, prompt formatting, and fallback handling.
2. **Explicit Processing Modes**: `live_ai_success`, `local_rules_fallback`, `missing_credentials`, `provider_error`, `local_deterministic`.
3. **Zod Runtime Validation**: `ModelAnalysisOutputSchema` validation before accepting LLM responses.
4. **Honest Provenance Model**: `user_reported`, `pattern_extracted`, `model_suggested`, `externally_verified`.
5. **Client-Side PII Scrubbing**: `sanitizePiiForCloud` redacting Bangladeshi phones, NID, and emails.
6. **IndexedDB Blob Separation**: Storing raw binary files in `evidence_blobs` and stripping base64 before saving to `localStorage`.
7. **Bounded PDF Text Extraction**: Page-by-page extraction via `pdfjs-dist` (max 10 pages, 10MB limit).
8. **Section 60 Date Math**: 30-day statutory limitation calculation and countdown timers.
9. **CRPA 2009 Statutory Offense Mapping**: Sections 37, 38, 40, 41, 44, 45, 50, 51, 52, 53.
10. **Dynamic Form-1 Complaint Drafting**: Dynamic attachments matching case evidence.
11. **Authentic Empty State**: Transitioning to empty state when all disputes are deleted.
12. **All 10 Automated Core Tests**: Remaining 10/10 green.
