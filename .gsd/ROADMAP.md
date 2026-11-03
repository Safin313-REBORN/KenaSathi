# KENASATHI AI — GSD ROADMAP & MILESTONE TRACKER
**Event**: Ostad Presents YUNet AIgnite Buildathon 2026  
**Project**: KenaSathi AI (কেনাসাথী)  
**Methodology**: GSD (Get Shit Done) Specification-Driven Iterative Repair  
**Target Legislation**: Consumer Rights Protection Act, 2009 (*ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯*)  

---

## 🎯 Project Objective
Transform KenaSathi AI into a truthful, secure, legally accurate, and privacy-preserving consumer protection assistant for Bangladeshi citizens under CRPA 2009.

---

## 🗺️ Milestone Breakdown & Verification Status

### Milestone 1: P0 Statutory & Factual Integrity (Phase 1)
- [x] Task 1.1: Fix Section 60 calculation: preserve missing dates as `null`/`undefined`; eliminate auto-populating today's date or 25-day fallbacks.
- [x] Task 1.2: Exact 30 calendar days (not working days), timezone-safe for Bangladesh time (UTC+6), boundary Day 30 and Day 31 handling.
- [x] Task 1.3: Build category-adapted evidence-driven case timeline in `CaseWorkspaceView.tsx` (counterfeit disputes reflect Section 50 receipt, not delivery breaches; missing facts show `এই তথ্যটি এখনো দেওয়া হয়নি।`).
- [x] Task 1.4: Refactor Section 76(4) reward reflection: remove projected arbitrary payouts (`maxFine * 0.25`); provide educational notes explaining statutory realization condition.
- [x] Task 1.5: Truthful complaint draft actions in `ComplaintBuilder.tsx`: Copy Complaint Draft, Print Complaint, Open Email Draft (`mailto:`), Open Official CCMS Portal link, with citizen review draft disclaimer.

### Milestone 2: P0 AI Processing, Privacy & Provenance (Phase 2)
- [x] Task 2.1: Gemini 3.8 Flash (`gemini-3.8-flash:generateContent`) request construction via `x-goog-api-key` header (never in URL query params).
- [x] Task 2.2: Structured JSON output without deprecated sampling parameters (`temperature`, `top_p`, `top_k`).
- [x] Task 2.3: Pass sanitized selectable PDF text and detected candidate facts into model prompt.
- [x] Task 2.4: 15-second timeout with cleanup in `finally` blocks; distinct error handling for 400, 401/403, 429, 500 status codes.
- [x] Task 2.5: Client-side PII minimization (`sanitizePiiForCloud`) covering Bangladeshi mobile (+8801..., 01...), 10/13/17-digit NIDs, and citizen emails across all prompt fields.
- [x] Task 2.6: Image privacy disclosure and selective cloud transmission controls (`cloudIncludedFiles`) in `NewDisputeModal.tsx`.
- [x] Task 2.7: Strict validation of model `sourceDocId` against actual evidence document IDs.

### Milestone 3: Civic UI/UX Rebuild (Phase 3)
- [x] Task 3.1: Light-first institutional palette (`#142B3B` Navy, `#087E78` Deep Teal, `#F6F8FA` Canvas, `#FFFFFF` Surface).
- [x] Task 3.2: Typography stack loading Plus Jakarta Sans, Noto Sans Bengali, and JetBrains Mono.
- [x] Task 3.3: Streamline navigation to 5 core workspaces (`Overview`, `Check a Purchase`, `My Cases`, `Evidence & Documents`, `Consumer Guide`) with brand logo navigating to Home.
- [x] Task 3.4: Landing page redesign: authentic headlines, 3-step workflow, real Bangladeshi dispute scenarios, Section 60 FAQ (30 calendar days).
- [x] Task 3.5: Illustrative fictional preview card labeled with honest neutral badge (`দৃষ্টান্তমূলক কাল্পনিক নমুনা — লাইভ অডিট বা যাচাইকৃত প্রকৃত ঘটনা নয়`).
- [x] Task 3.6: Workflows: "Check a Purchase" without active cases opens intake modal directly; "Draft Complaint" CTA opens Complaint Draft sub-tab directly.
- [x] Task 3.7: Fix case switching task synchronization and sub-tab state in `CaseWorkspaceView.tsx` without cascading renders.

### Milestone 4: Content & Stale Code Cleanup (Phase 4)
- [x] Task 4.1: Clean `index.html`: neutral title `KenaSathi AI (কেনাসাথী) — Consumer Rights Assistance for Bangladesh`, accurate meta tags, light body style.
- [x] Task 4.2: Update `src/App.tsx`: voice narration describes legal assistance (removed 25% cash reward phrase); footer states `Citizen-Controlled Privacy & Optional Ephemeral Cloud AI`; dynamic `document.documentElement.lang`.
- [x] Task 4.3: Permanently delete unimported legacy files (`InspectionDashboard.tsx`, `RiskAnalysisView.tsx`, `SpatialWorkspace.tsx`).

### Milestone 5: Testing, Build & Performance Verification (Phase 5)
- [x] Task 5.1: Expand `tests/kenasathiCore.test.ts` from 10 to 15 test suites covering Section 60 matrix, timeline adaptation, Section 76(4) neutrality, PII, and mocked Gemini requests (15/15 PASS).
- [x] Task 5.2: `npm run lint` passes with 0 errors and 0 warnings.
- [x] Task 5.3: `npm run build` compiles cleanly with code-split manual chunks (vendor, index, pdf) and zero chunk size warnings.
- [x] Task 5.4: Update all documentation in `docs/` and `.gsd/` separating implemented functionality, local deterministic features, optional cloud AI, and known limitations.
