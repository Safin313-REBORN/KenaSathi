# KenaSathi — open verification and product risks

**Updated:** 5 November 2026. This file replaces the prior completion/roadmap claims. The current review and test results are in [`ACCEPTANCE_MATRIX.md`](ACCEPTANCE_MATRIX.md) and [`TEST_RESULTS.md`](TEST_RESULTS.md).

1. Independently re-check every DNCRP office address, phone, and email against its current primary source before describing the complete directory as verified.
2. Complete screen-reader testing and a criterion-by-criterion WCAG 2.2 AA audit across supported browsers and mobile devices. Current work is a focused accessibility review, not certification.
3. Decide whether to build a backend only after an operator, deployment target, data region, retention/consent rules, credentials policy, and support/incident process are defined. Current storage is local and unencrypted.
4. Reduce or split the production app and PDF chunks (about 507 KB and 501 KB minified); the build currently succeeds with Vite’s size warning.
5. Maintain source links and review dates for legal and contact information. The app does not submit complaints; citizens must review drafts and use official channels.
6. Revisit old browsers’ state and migration behavior before adding sync, accounts, or a production deployment.
