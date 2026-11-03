# KENASATHI AI — TECHNICAL MATURITY, KNOWN LIMITATIONS & ROADMAP
**Event**: Ostad Presents YUNet AIgnite Buildathon 2026  
**Document**: `/docs/REMAINING_ISSUES.md`  
**Classification**: Engineering Audit, Technical Integrity & Product Roadmap  
**Status**: Clean Production Build • 15/15 Test Suites Passing • Post-Final Integrity Upgrade  

---

## 1. Feature Status Breakdown & Architectural Separation

To maintain strict truthfulness and technical defensibility, features are separated into 6 distinct categories:

### 1. Implemented & Fully Tested
- **Section 60 Limitation Engine (`limitationService.ts`)**: Timezone-safe calendar math (Asia/Dhaka, UTC+6) calculating 30 calendar days from user-provided cause-of-action date. Missing dates return `null` and honest guidance. Verified across missing, today, 5-day, 30-day boundary, 31-day expired, future, and invalid strings (Suite 11).
- **Evidence-Driven Case Timeline (`aiService.ts`)**: Generates timeline events strictly adapted to grievance category (e.g. counterfeit claims reflect Section 50 receipt without delivery promise breach; missing fields show `এই তথ্যটি এখনো দেওয়া হয়নি।`). Verified in Suite 12.
- **Section 76(4) Neutrality (`aiService.ts`)**: Whistleblower reward projection strictly set to 0 BDT (not calculated as `maxFine * 0.25`). Realization condition under Section 76(4) explicitly stated. Verified in Suite 13.
- **Deep PII Sanitization (`aiService.ts`)**: Regex scrubber removes Bangladeshi mobile formats (+8801..., 01...), 10/13/17-digit NIDs, and citizen emails across all prompt fields. Verified in Suite 14.
- **Mocked Gemini 3.8 Flash Request (`aiService.ts`)**: Header authentication (`x-goog-api-key`), no API keys in query parameters, structured JSON config without deprecated sampling params, prompt inclusion of extracted PDF text and detected candidate facts, and distinct mapping for 401 and 429 status codes. Verified in Suite 15.
- **Client Storage & Safety (`storageService.ts`, `evidenceDb.ts`)**: Base64 dataUrl stripping before `localStorage` persistence, IndexedDB binary blob store, and clean transition to authentic empty state upon deleting the final dispute. Verified in Suites 4, 9, 10.
- **Deterministic Pattern Extraction (`evidenceProcessor.ts`)**: Regex extraction for bKash TrxID, Nagad TrxID, BDT amounts with provenance tagged `pattern_extracted` and `verified: false`. Verified in Suite 1.
- **Runtime Schema Validation (`aiService.ts`)**: Zod schema validation of model responses rejecting out-of-bounds scores and missing fields. Verified in Suite 7.
- **Case State Synchronization (`CaseWorkspaceView.tsx`)**: Synchronizes sub-tab routing (`initialSubTab`) and task lists upon switching active case ID.

### 2. Implemented But Not Integration-Tested (Live External API)
- **Live Google Gemini 3.8 Flash Provider Call**: Full request construction, header auth, and error mapping are implemented and tested with mocked HTTP responses in the automated suite. Live execution with real Google production servers requires user-supplied credentials during evaluation.

### 3. Local Deterministic Functionality (Zero Cloud Transmission)
- Full local legal rules engine for 11 CRPA 2009 grievance categories.
- Selectable text extraction from PDF files via `pdfjs-dist` (up to 10 pages, 10MB).
- Deterministic regex pattern matching for transaction references and monetary amounts.
- Section 60 limitation calculator and case timeline generator.
- Local storage and IndexedDB persistence.
- Bilingual complaint draft generation formatted for print and copy.

### 4. Optional External AI Functionality (Consent-Gated BYOK)
- Multimodal analysis via Google Gemini 3.8 Flash (`gemini-3.8-flash:generateContent`).
- Selective cloud transmission controls: users choose which individual files to include.
- Ephemeral in-memory API key handling without local persistence.

---

## 2. Known Technical Limitations & Honest Disclosures

1. **Client-Side Prototype BYOK**:
   - The current BYOK pattern holds API keys in React component memory and transmits them via HTTPS request headers.
   - **Honest Disclosure**: While secure against browser storage extraction, client-side BYOK is intended for evaluation, developer testing, and hackathon demonstration. A production deployment requires a server-side proxy with rate limiting, IP whitelisting, and secret management.

2. **Image Pixel Content vs Text Sanitization**:
   - Client-side regex scrubbing operates on text strings (names, descriptions, extracted text).
   - **Honest Disclosure**: Text embedded inside image pixels (such as a photo of a physical receipt or screenshot containing an NID card) is not OCR-blurred in client memory prior to transmission. A prominent warning in `NewDisputeModal.tsx` alerts the user to crop or blur sensitive image regions before uploading.

3. **Scanned PDF OCR**:
   - Local PDF parsing handles selectable text streams via `pdfjs-dist`. Scanned image-only PDFs without text streams are flagged as `ocr_not_run_in_local_mode` and not parsed into arbitrary binary noise.

4. **Official Redress Integration**:
   - DNCRP Central Complaint Management System ([ccms.dncrp.com](https://ccms.dncrp.com/)) does not provide an open public submission API for third-party automated submission.
   - KenaSathi AI generates a structured, printable complaint draft and provides direct links to the official CCMS portal and complaint intake email (`nccc@dncrp.gov.bd`). KenaSathi does not claim to officially file or register complaints on behalf of citizens.

---

## 3. Future Roadmap

1. **Server-Side Proxy Architecture**: Implement a Cloud Run / Next.js API route proxy storing provider secrets in Google Cloud Secret Manager, enforcing IP rate-limiting and request payload bounds.
2. **Client-Side Canvas Image Redaction**: Allow users to draw redaction rectangles directly over sensitive pixel regions (e.g. personal phone numbers or bank account digits) before sending images to cloud models.
3. **Automated DNCRP PDF Template**: Generate official Form-1 Schedule-A PDF directly using `pdfmake` matching the official gazetted layout.
4. **Calendar Reminder Export**: Provide `.ics` download for Section 60 limitation deadlines so consumers receive calendar reminders before day 30 expires.
