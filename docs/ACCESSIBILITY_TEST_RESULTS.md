# Focused accessibility results — 5 November 2026

This replaces the prior accessibility automation report, whose screenshot and conformance claims were not reproduced in this review. See [`ACCESSIBILITY_AUDIT.md`](ACCESSIBILITY_AUDIT.md) for scope and limits.

- `npm test`: 23 tests passed, 0 failed. The suite covers accessibility preference storage/synchronization and reduce-motion override behavior; it is not a full DOM or assistive-technology suite.
- `npm run lint`: passed.
- Manual browser review: intake dialog Escape/focus return; quick-search modal semantics, named input, keyboard interaction and focus return; accessibility settings reset; document search/select labels.
- At 390×844 with 125% text size, document width measured 382px (no page-level horizontal overflow). At 1365×900, page width measured 1357px (no page-level horizontal overflow).

No screen-reader sessions or complete WCAG 2.2 AA criterion audit were conducted. Do not describe the product as WCAG-certified or fully compliant.
