# KENASATHI AI (কেনাসাথী) — COMPREHENSIVE PROJECT AUDIT & SYSTEM REVIEW
**Competition**: Ostad Presents YUNet AIgnite Buildathon 2026  
**Project**: KenaSathi AI (কেনাসাথী) — Independent Consumer Protection & Complaint Preparation System  
**Governing Statute**: Consumer Rights Protection Act, 2009 (*ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯ — আইন নং ২৬, ২০০৯*)  
**Verification Date**: November 3, 2026  
**System Architecture**: Civic-Tech Single Page Application (React 18 + TypeScript + Vite + Tailwind CSS + IndexedDB)  
**Status**: 15/15 Automated Test Suites Passing • 0 ESLint Errors • Clean Production Build  

---

## 1. Executive Summary & Civic Mission

Online commerce in Bangladesh (marketplace platforms, Facebook commerce, and courier deliveries) involves thousands of consumer transactions daily without formal escrow protection. The most common consumer grievances include:
1. **Advance payment taken followed by delivery failure and seller block** (*Section 45 / ধারা ৪৫*).
2. **Counterfeit electronics or duplicate branded products delivered** (*Section 50 / ধারা ৫০*).
3. **Selling above maximum retail price (MRP)** (*Section 40 / ধারা ৪০*).
4. **Refusal to honor stated return, warranty, or refund commitments** (*Section 45 / ধারা ৪৫*).

The Directorate of National Consumer Rights Protection (জাতীয় ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর — DNCRP) receives complaints under Section 76. However, citizens face significant practical challenges:
- **Strict 30 Calendar Days Statutory Limitation Window** (*Section 60 / ধারা ৬০*): A complaint must be filed within 30 calendar days from the cause of action. Complaints submitted after 30 days cannot be entertained by law.
- **Evidence Formatting Burden**: Complaints lacking structured payment records, courier documentation, seller identities, and dates are frequently rejected during initial administrative scrutiny.
- **Statutory Reward Misconception**: Under Section 76(4), 25% of any administrative fine *actually realized* by the authority is disbursed to the complainant. Consumers frequently mistake this statutory incentive for guaranteed commercial refunds or pre-adjudication compensation.

KenaSathi AI is an independent civic-tech platform designed to assist consumers in organizing evidence, understanding statutory limitations under CRPA 2009, managing case deadlines, and preparing structured complaint drafts for citizen review.

---

## 2. Core Functional Distinctions

To ensure complete technical defensibility and legal honesty, the platform strictly separates:

### A. Local Deterministic Functionality (100% Client-Side, Zero External API Dependency)
- **Section 60 Limitation Engine (`limitationService.ts`)**: Timezone-safe calendar math calculated strictly from user-provided cause-of-action dates. Never invents dates; displays explicit "তারিখ দেওয়া হয়নি / Date not provided" when dates are unconfirmed.
- **Local Text Pattern Extraction (`evidenceProcessor.ts`)**: Deterministic regex extraction for bKash TrxID, Nagad TrxID, and BDT currency amounts. Tagged strictly as `pattern_extracted` with `verified: false`.
- **Local PDF Text Extraction**: Client-side selectable text parsing using `pdfjs-dist` (bounded to 10 pages, 10MB). Scanned PDFs without text streams are explicitly noted as `ocr_not_run_in_local_mode` and never scanned for fake binary patterns.
- **Evidence-Driven Case Timeline (`aiService.ts`)**: Generates timeline events adapted strictly to the grievance category (e.g. counterfeit disputes reflect counterfeit reception under Section 50 rather than non-delivery delivery breaches). Missing details are labeled `এই তথ্যটি এখনো দেওয়া হয়নি।`.
- **Section 76(4) Neutrality**: Whistleblower reward projection is set to 0 BDT. Explicit educational notes explain that any 25% entitlement is strictly contingent upon formal realization of fines by an authorized magistrate.
- **Complaint Drafting (`ComplaintBuilder.tsx`)**: Generates structured citizen drafts (not claimed as government-issued Form-1). Action buttons explicitly specify `Copy Complaint Draft`, `Print Complaint`, `Open Email Draft` (via `mailto:` to `nccc@dncrp.gov.bd`), and `Open Official CCMS Portal` (`https://ccms.dncrp.com/`).
- **Client Storage & Isolation (`storageService.ts`, `evidenceDb.ts`)**: Disputed cases persist in browser `localStorage` (with base64 image data stripped to prevent storage crashes); binary images/PDFs reside in client-side `IndexedDB`. Deleting the last dispute returns the application to an authentic empty state.

### B. Optional External AI Functionality (Consented, Ephemeral BYOK)
- **Gemini 3.8 Flash Multimodal Integration (`callLiveGeminiApi`)**:
  - Targets current model `gemini-3.8-flash:generateContent`.
  - Authenticates securely via `x-goog-api-key` header; API keys are never placed in URL query strings.
  - Strict structured JSON output configuration without deprecated sampling parameters (`temperature`, `top_p`, `top_k`).
  - Passes client-sanitized extracted PDF text and detected candidate facts into the model prompt.
  - Client-side PII redaction (`sanitizePiiForCloud`) masks Bangladeshi mobile numbers (+8801..., 01...), 10/13/17-digit National IDs, and emails across all prompt fields before transmission.
  - 15-second timeout with cleanup in `finally` blocks.
  - Distinct HTTP error handling for 400 (bad request), 401/403 (unauthorized/invalid key), 429 (quota exhausted), and 500 (upstream service error).
  - Model observations are strictly tagged as `model_suggested` with `verified: false`. Source document IDs are validated against actual uploaded evidence IDs.

---

## 3. Engineering Quality & Verification Baseline

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **Section 60 Calculation** | Exact 30 calendar days, Bangladesh timezone UTC+6, handles missing, future, and boundary dates. | **TESTED & VERIFIED** |
| **Evidence-Driven Timeline** | Category-adapted milestones; missing facts show `এই তথ্যটি এখনো দেওয়া হয়নি।`. | **TESTED & VERIFIED** |
| **Section 76(4) Neutrality** | Zero projected arbitrary cash rewards; realization condition explicitly stated. | **TESTED & VERIFIED** |
| **PII Minimization** | BD mobile (+880, 01...), 10/13/17-digit NIDs, emails scrubbed from prompt text. | **TESTED & VERIFIED** |
| **Gemini 3.8 Flash Request** | Header authentication (`x-goog-api-key`), structured JSON, PDF text in prompt, distinct error status. | **TESTED & VERIFIED** |
| **Dynamic Complaint Draft** | Action labels reflect real actions (Copy, Print, Email Draft, CCMS portal link). | **TESTED & VERIFIED** |
| **Case Switching State** | Workspace synchronizes sub-tab and tasks upon switching case ID. | **TESTED & VERIFIED** |
| **Landing Fictional Label** | Demo card labeled `Illustrative fictional example — not a live inspection or verified consumer case.` | **TESTED & VERIFIED** |
| **Automated Test Suite** | 15 test suites covering limitation matrix, PII, schema, storage, mocked Gemini requests. | **15/15 PASS** |
| **Linter & Code Quality** | `eslint src` passes with 0 errors and 0 warnings. | **PASS** |
| **TypeScript & Build** | `tsc -b && vite build` compiles cleanly; chunks split into vendor, index, and pdf chunks. | **PASS** |

---

## 4. Known Technical Limitations & Honest Disclosures

1. **Client-Side Prototype BYOK**: While API keys are kept in memory and transmitted only via HTTPS request headers, browser-based BYOK is a development/evaluation architecture, not a production multi-tenant secret manager. A production deployment requires a server-side API proxy with IP rate limiting and server environment variables.
2. **Image Pixel PII**: Text regex redaction operates on extracted strings and input fields. Text embedded inside uploaded images (such as physical receipts or chat screenshots) is not OCR-blurred in client memory prior to transmission. A clear user warning is displayed in `NewDisputeModal.tsx` advising users of this boundary.
3. **Scanned PDF OCR**: In local deterministic mode, scanned image-only PDFs without selectable text streams are flagged as `ocr_not_run_in_local_mode` rather than claiming OCR verification.
4. **Independent Civic Platform**: KenaSathi AI is not affiliated with the Directorate of National Consumer Rights Protection (DNCRP), the Ministry of Commerce, or any judicial authority. All generated documents are drafts prepared for citizen review.
