# কেনাসাথী (KenaSathi) — FINAL ACCEPTANCE & INTEGRITY MATRIX
**Document**: `/docs/ACCEPTANCE_MATRIX.md`  
**Application**: KenaSathi Consumer Rights Assistance & Guidance Portal  
**Statutory Reference**: Consumer Rights Protection Act, 2009 (ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯)  
**Verification Baseline**: 16/16 Test Suites Passing • 0 ESLint Errors • Clean Production Build  

---

## Final Acceptance Criteria Checklist

| # | Benchmark Criterion | Acceptance Requirement | Implementation Evidence | Result |
| :---: | :--- | :--- | :--- | :---: |
| **01** | **No Invented Incident Date** | Missing incident date must remain `null`/`undefined`. Never auto-fill today's date or 25 days default. | `NewDisputeModal.tsx` preserves empty date; `limitationService.ts` returns `null` days and honest notice. Tested in Suite 11. | **PASS** |
| **02** | **Section 60 Calendar Days Math** | Exact 30 calendar days (not working days), calculated timezone-safe in Bangladesh time (UTC+6). | `limitationService.ts` validates calendar bounds, handles boundary Day 30 and Day 31 time-barred. Tested in Suite 11. | **PASS** |
| **03** | **Evidence-Driven Case Timeline** | Category-adapted timeline; counterfeit disputes cite Section 50; missing facts show `এই তথ্যটি এখনো দেওয়া হয়নি।`. | `aiService.ts` (`buildEvidenceDrivenTimeline`) adapts to grievance category. Tested in Suite 12. | **PASS** |
| **04** | **Section 76(4) Reward Neutrality** | Zero projected arbitrary cash rewards derived from `maxFine * 0.25`. Educational note on fine realization condition. | `aiService.ts` sets `whistleblowerRewardBdt: 0` and statutory realization condition explanation. Tested in Suite 13. | **PASS** |
| **05** | **Complaint Generation & Action Labels** | Action buttons accurately describe actions: Copy Draft, Print, Open Email Draft, Open CCMS Portal. Citizen review disclaimer. | `ComplaintBuilder.tsx` updated with accurate button labels and citizen draft disclaimer badge. | **PASS** |
| **06** | **Gemini 3.8 Flash Integration** | Model `gemini-3.8-flash:generateContent`; `x-goog-api-key` header (never in query params); structured JSON; timeout cleanup in `finally`. | `aiService.ts` (`callLiveGeminiApi`) implements header authentication, structured JSON, 15s timeout cleanup. Tested in Suite 15. | **PASS** |
| **07** | **PII Minimization (Text & Images)** | Redact Bangladeshi mobile, 10/13/17-digit NID, emails across all prompt fields. Image privacy disclosure. | `sanitizePiiForCloud` scrubs regex patterns; `NewDisputeModal.tsx` provides pre-upload pixel warning and file checkboxes. Tested in Suite 14. | **PASS** |
| **08** | **PDF Text Stream AI Integration** | Extracted selectable PDF text passed into Gemini prompt. Scanned PDFs clearly marked without OCR claim. | `evidenceProcessor.ts` uses `pdfjs-dist`; `aiService.ts` injects sanitized PDF text into prompt. Tested in Suite 15. | **PASS** |
| **09** | **Case Switching & Task State** | Changing `currentCase.id` properly updates tasks and sub-tabs without cross-case bleeding or cascading renders. | `CaseWorkspaceView.tsx` synchronizes state during render upon case switch. Tested in Suite 10. | **PASS** |
| **10** | **Direct Intake & Complaint Routing** | "Check a Purchase" without active case opens intake modal directly; "Draft Complaint" CTA opens Complaint Draft sub-tab. | `App.tsx` routes directly to intake modal or `caseWorkspaceSubTab = 'complaint'`. | **PASS** |
| **11** | **Landing Demo Fictional Label** | Sample card explicitly labeled `Illustrative fictional example — not a live inspection or verified consumer case.` Neutral badge. | `LandingHero.tsx` renders neutral disclaimer badge and demo notice. | **PASS** |
| **12** | **Typography & Font Stack** | Loaded typography system: Plus Jakarta Sans for English, Noto Sans Bengali for Bengali, JetBrains Mono for codes. | `index.html` and `src/index.css` updated to load and prioritize Plus Jakarta Sans and Noto Sans Bengali. | **PASS** |
| **13** | **Stale Component Cleanup** | Remove unimported legacy components (`InspectionDashboard`, `RiskAnalysisView`, `SpatialWorkspace`, `PitchDeckModal`). | Deleted unimported components from repository; verified 0 compile or lint errors. | **PASS** |
| **14** | **Automated Test Coverage** | Expand test suite to cover Section 60 matrix, timeline adaptation, Section 76(4) neutrality, PII, mocked Gemini requests, and zero event terms. | `tests/kenasathiCore.test.ts` expanded to 16 test suites; 16/16 passing. | **PASS** |
| **15** | **Build & Performance Hygiene** | `npm test`, `npm run lint`, and `npm run build` must pass cleanly without bundle warnings. | 16/16 tests pass; 0 ESLint errors; production build chunks split (vendor, index, pdf) with zero warnings. | **PASS** |
| **16** | **Public Service Brand Integrity** | Zero competition references in source files, metadata, or menus; official institutional civic portal identity. | Verified across `src/`, `index.html`, and `README.md`. Tested in Suite 16. | **PASS** |
