# KENASATHI AI — AUTOMATED TEST RESULTS & VERIFICATION REPORT
**Event**: Ostad Presents YUNet AIgnite Buildathon 2026  
**Document**: `/docs/TEST_RESULTS.md`  
**Test Runner**: Node.js Native Test Runner with `tsx` (`tsx --test tests/kenasathiCore.test.ts`)  
**Status**: 15/15 Test Suites Passing (100% Pass Rate, 0 Failures, 0 Regressions)  
**Verification Date**: November 3, 2026  

---

## 1. Test Suite Execution Summary

```bash
$ npm test

> ainsathi@1.0.0 test
> tsx --test tests/kenasathiCore.test.ts

✔ EvidenceProcessor: Extracts bKash TrxID, Nagad TrxID, BDT amount with pattern_extracted status and provenance (18.3ms)
✔ AI Classification: CRPA 2009 statutory mapping elements and qualifications (0.2ms)
✔ Section 60 Limitation Math: Verifies countdown from incident date, expiration, and missing date handling (7.4ms)
✔ StorageService: Clean empty state, delete-last-case, and demo preset isolation (1.3ms)
✔ Complaint Drafting: Dynamic attachments match actual evidence and avoids simulated facts (0.7ms)
✔ Gemini 3.8 Flash: Explicit status handling when API key is missing or provider fails (0.6ms)
✔ Zod Runtime Schema: Rejects invalid model outputs and validates conforming payloads (3.8ms)
✔ Provenance & Privacy: Tags user input honestly and scrubs sensitive PII before transmission (1.6ms)
✔ Storage Safety: Strips large base64 dataUrls before persisting to prevent quota crashes (1.2ms)
✔ Workspace Lifecycle: Transition to authentic empty state upon deleting last dispute (1.3ms)
✔ Section 60 Limitation Engine: Comprehensive calendar-day matrix & timezone safety (1.0ms)
✔ Evidence-Driven Timeline: Adapts specifically to grievance category and preserves unknown fields (1.0ms)
✔ Section 76(4) Neutrality: Rejects projected cash rewards and emphasizes fine realization condition (0.5ms)
✔ PII Sanitization: Comprehensive scrubbing of Bangladeshi phone formats, smart/legacy NIDs and emails (0.5ms)
✔ Gemini 3.8 Flash Request: Verifies header authentication, payload structure, and error mapping (2.9ms)

ℹ tests 15
ℹ suites 0
ℹ pass 15
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 413.4ms
```

---

## 2. Test Matrix & Detailed Coverage Breakdown

| Suite # | Test Target | Verification Objectives | Result |
| :---: | :--- | :--- | :---: |
| **01** | `EvidenceProcessor` Pattern Extraction | Extracts bKash TrxID, Nagad TrxID, BDT currency with `pattern_extracted` status, direct source document ID pointer, and `verified: false`. | **PASS** |
| **02** | CRPA 2009 Statutory Mapping | Validates Section 45 for non-delivery, Section 50 for counterfeit goods, Section 40 for price gouging, and Section 44 for misleading ads. | **PASS** |
| **03** | Section 60 Limitation Math | Tests countdown from cause-of-action date: (A) 5 days ago = 25 days remaining; (B) 40 days ago = 0 remaining (`isTimeBarred: true`); (C) missing date = `null`. | **PASS** |
| **04** | Storage Isolation & Demo Loading | Verifies clean initialization (`getCases().length === 0`), save operation, delete-last-case, and isolated fictional demo preset loading. | **PASS** |
| **05** | Complaint Drafting & Attachments | Ensures attachments list contains only uploaded evidence files; verifies official email `nccc@dncrp.gov.bd` and helpline `16121`. | **PASS** |
| **06** | Gemini 3.8 Flash Status Handling | Verifies explicit `missing_credentials` status and diagnostic error when API key is missing; verifies offline deterministic fallback. | **PASS** |
| **07** | Zod Runtime Schema Validation | Validates conforming outputs against `ModelAnalysisOutputSchema`; asserts failure on scores > 100, negative scores, and missing required summaries. | **PASS** |
| **08** | Provenance & PII Sanitization | Verifies `sanitizePiiForCloud` scrubs phone numbers (both hyphenated and plain), NID numbers, and emails; verifies user TrxID is tagged `user_reported`. | **PASS** |
| **09** | Storage Safety & DataUrl Stripping | Verifies `sanitizeCaseForLocalStorage` strips base64 `dataUrl` strings before saving, preventing quota crashes while preserving `blobId` references. | **PASS** |
| **10** | Workspace Empty State Lifecycle | Tests multi-case addition and subsequent deletion; verifies store cleanly returns `[]` upon deleting the final dispute. | **PASS** |
| **11** | Section 60 Limitation Engine Matrix | Tests missing date (returns null and neutral advice), today (30 days remaining), 5 days ago (25 days), 30 days ago (0 days remaining, day 30 active), 31 days ago (time-barred), invalid strings, and future dates. | **PASS** |
| **12** | Evidence-Driven Timeline Adaptation | Tests category-specific event generation (counterfeit cites Section 50 receipt of counterfeit goods without delivery promise breach; non-delivery shows honest unknown notice when delivery promise is absent). | **PASS** |
| **13** | Section 76(4) Reward Neutrality | Asserts that `whistleblowerRewardBdt` is strictly 0 BDT (not calculated as `maxFine * 0.25`); verifies presence of fine realization statutory condition note. | **PASS** |
| **14** | Bangladeshi PII Redaction | Exhaustively checks +8801..., 017..., 018..., 019... formats, 10-digit smart NIDs, 13-digit legacy NIDs, 17-digit NIDs, and citizen emails. | **PASS** |
| **15** | Mocked Gemini 3.8 Flash Request | Verifies header authentication (`x-goog-api-key`), absence of API key in query parameters, model endpoint `gemini-3.8-flash:generateContent`, structured JSON, PDF text and candidate facts in prompt, and distinct mapping for 401 and 429 status codes. | **PASS** |

---

## 3. Linter & Build Verification

### ESLint (`npm run lint`)
```bash
$ npm run lint
> ainsathi@1.0.0 lint
> eslint src
(0 errors, 0 warnings - Exit Code 0)
```

### TypeScript & Vite Build (`npm run build`)
```bash
$ npm run build
> ainsathi@1.0.0 build
> tsc -b && vite build

✓ 2179 modules transformed.
dist/index.html                   1.82 kB │ gzip:   0.98 kB
dist/assets/index-BTSz223q.css   36.29 kB │ gzip:   6.98 kB
dist/assets/vendor-SIwY82C9.js  140.74 kB │ gzip:  45.21 kB
dist/assets/index-BK6dNbgB.js   346.10 kB │ gzip: 105.19 kB
dist/assets/pdf-CfZJMOwX.js     501.34 kB │ gzip: 150.11 kB
✓ built in 4.14s - Exit Code 0
```
