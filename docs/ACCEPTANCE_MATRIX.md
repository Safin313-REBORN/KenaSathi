# KenaSathi acceptance matrix

**Review date:** 5 November 2026
**Scope:** independent source review, automated checks, and live Chromium-based browser review at desktop (default 1383×900), tablet (768×1024), and mobile (390×844).
**Workspace:** existing project with uncommitted changes from the prior Codex session; this review did not treat its prior reports as evidence.

| Area | Observed result | Status / limitation |
|---|---|---|
| Public posture | Bengali-first independent consumer-assistance platform; footer says it is not an official DNCRP or government website. No competition language found in public source/UI scan. | Pass |
| Empty and demo states | Fresh local origin showed the empty case state. Explicit demo is labeled fictional and not a real complaint. | Pass |
| Case workflow | Empty case state and populated case summary/complaint draft were reviewed at all three viewport sizes; long case IDs wrap within the privacy notice on mobile. Timeline, evidence, tasks, financial and complaint sections were navigated. | Pass for reviewed workflow; no real filing integration exists. |
| Intake dialog | Keyboard Escape closes it and returns focus to its trigger; dialog exposes modal semantics and focus handling in source. | Pass for manual check; not a full assistive-technology audit. |
| Consumer guide | Search and FAQ tabs work on mobile. Section 60 FAQ now says 30 days from cause of action, tells users not to guess dates, and does not imply that hotline contact extends time. | Pass; checked against [official legislation](https://bdlaws.minlaw.gov.bd/act-print-1014.html). |
| Local storage | UI now discloses browser-local storage and that it is not an encrypted vault; no central account/database is represented. | Pass; browser profile/device security and quota remain user risks. |
| Accessibility settings | Text-size, contrast, motion, and link-underlining controls reviewed. At 125% on a 390px viewport, document width was 382px with no page-level horizontal overflow. | Pass for observed state; broader WCAG conformance is not certified. |
| Quick search | Search input is labelled; overlay has modal semantics, keyboard containment, semantic result buttons, Escape close, and focus return. | Pass for manual keyboard flow; not tested with a screen reader. |
| Scores | Removed numeric confidence percentages from fictional fixtures and local deterministic fallback output; no numeric confidence is presented as calibrated evidence. | Pass for reviewed source. |
| Documents | Empty state and populated demo register were reviewed at desktop, tablet and mobile. The table scrolls within its own wrapper at tablet; mobile uses stacked records. Accessible names are present on search and type controls. | Pass for these layouts; not assistive-technology certified. |
| DNCRP contacts and office records | Official DNCRP [contact page](https://dncrp.gov.bd/pages/static-pages/6922dc77933eb65569e10832) and [CCMS portal](https://ccms.dncrp.com/) were checked for hotline 16121 and official complaint route. Section 76(4) was checked in [official law text](https://bdlaws.minlaw.gov.bd/act-print-1014/section-print-39187.html). | Partial; this review did not independently re-verify every local office phone/email/address. Do not treat the directory as fully re-certified. |
| Other helplines | 999 displayed as emergency service. NLASO’s [official notice](https://nlaso.gov.bd/pages/notices/6922f1c6dbfbab28ce0d5df6) names 16699 as a new toll-free legal-aid helpline. | Pass for number and toll-free status; no service hours are claimed. Historical 16430 wording was removed because current status was not established. |
| Backend | No backend added. Existing app is local-first, with optional user-consented direct provider calls when a user supplies credentials. | See `BACKEND_DECISION.md`; no deployment or operational requirements were supplied. |
| Automated tests | `npm test`: 23 passed, 0 failed. | Pass |
| Lint | `npm run lint`: exit 0, no diagnostics. | Pass |
| TypeScript + production build | `npm run build`: exit 0. Vite reports large chunks (~507 KB app and ~501 KB PDF); build is successful but bundle optimization remains. | Pass with performance follow-up |
| Browser run | Routes and screen states listed in `RESPONSIVE_QA.md` were inspected in the live app at desktop 1383×900, tablet 768×1024, and mobile 390×844. Final phone case and desktop home screenshots were visually inspected after the last responsive changes. Local Vite returned HTTP 200 at `http://127.0.0.1:4173/`; browser console errors were not exhaustively re-audited after final changes. | Pass for visual review; see precise scope and limits in responsive QA notes. |
| Impeccable detector | Final targeted `impeccable detect --json` run returned `[]`. | Pass for this detector; it does not prove overall usability or conformance. |

## Confirmed fixes in this review

- Corrected Section 60 FAQ copy that had implied the hotline could help after the filing window elapsed.
- Replaced claims that browser data is “secure” with an accurate IndexedDB/local-storage disclosure.
- Added accessible names to document search and type controls.
- Added labelled modal semantics, keyboard containment, semantic result buttons, Escape close, and return focus to quick search.
- Added modal semantics, Escape behavior, focus containment, and focus restoration to the intake dialog.
- Reduced mobile masthead spacing after measuring overflow at 125% text size.
- Removed an unsupported “secure external AI provider” claim; the UI now states that selected materials are sent only after consent and advises users to review provider privacy terms.
- Removed the unsupported “mandatory evidence” statement, replacing it with practical suggestions to retain relevant records and confirm filing requirements with DNCRP.
- Removed unverified 16699 service hours and historical 16430 status wording; the app now states only the official toll-free designation.
- Removed arbitrary numeric confidence percentages from fictional data and deterministic fallback output.
- Corrected public directory wording and service counts to reflect the current records without claiming the app itself has official status.
