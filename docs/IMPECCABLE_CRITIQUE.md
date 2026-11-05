# Impeccable design critique

**Review date:** 5 November 2026. The existing UI was independently reviewed by two design reviewers using the Impeccable audit/critique guidance. Findings below are limited to issues confirmed in source or browser checks.

| Finding | Priority | Disposition |
|---|---|---|
| 125% text scaling could push the mobile masthead beyond the viewport. | High | Reduced mobile masthead horizontal spacing; rechecked at 390px viewport with no document overflow. |
| Section 60 FAQ implied that hotline contact might resolve a complaint after the statutory period. | High | Reworded: cause-of-action date, 30-day limit, do not guess, and hotline does not extend time. |
| Browser data was described in ways that could imply secure storage. | Medium | Replaced with explicit browser-local, unencrypted-storage disclosure. |
| Intake wizard needed stronger modal and keyboard semantics. | High | Added labelled dialog semantics, Escape close, Tab containment, and focus restoration. |
| Document search and type filter lacked clear accessible names. | Medium | Added explicit labels. |
| Quick search lacked a labelled dialog/search field and reliable focus return from the mobile drawer. | High | Added dialog semantics, focus containment, semantic result buttons, and explicit mobile trigger restoration. |
| AI-analysis copy claimed a “secure” provider and PII sanitization without sufficient evidence. | High | Removed the claim; copy now describes consented selected-material transfer and points users to provider privacy terms. |
| Public copy called supporting documents mandatory and showed numeric sample confidence percentages. | Medium | Changed the evidence wording to recommendations and removed the uncalibrated percentages from fixtures and fallback output. |

The detector was run once after edits; see `IMPECCABLE_DETECT.md`. Visual critique is not a substitute for usability research or a full accessibility audit.
