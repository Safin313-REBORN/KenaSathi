# Test and build results

**Review date:** 5 November 2026. Results below were run against the current workspace after the review fixes.

| Command | Result |
|---|---|
| `npm test` | Pass: 23 tests, 0 failures, 0 skipped. |
| `npm run lint` | Pass: exit 0, no lint diagnostics. |
| `npm run build` | Pass: TypeScript project build and Vite production build completed. Vite warned that the app chunk is about 507 KB and PDF chunk about 501 KB, over its 500 KB advisory threshold. |
| Browser QA | Manual live-browser visual review at desktop 1383×900, tablet 768×1024, and phone 390×844; route coverage and limits in `RESPONSIVE_QA.md`. The app returned HTTP 200 at `http://127.0.0.1:4173/`. |

The test output includes expected mocked 401/429 AI-provider error messages from fallback tests; these did not represent failed tests. No claim is made here that all routes or states have automated browser coverage.
