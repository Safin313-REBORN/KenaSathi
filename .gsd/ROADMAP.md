# KenaSathi — current roadmap

**Updated:** 5 November 2026. Earlier milestone completion claims are superseded by the current evidence in `docs/ACCEPTANCE_MATRIX.md`.

## Completed in the current review

- Corrected Section 60 FAQ guidance and removed unsupported mandatory-evidence language.
- Disclosed local, unencrypted browser storage and removed unsupported provider-security claims.
- Strengthened the intake and quick-search dialogs, field labels, keyboard flow, and focus restoration.
- Removed numeric confidence percentages from demos and deterministic fallback output.
- Removed unverified hours and legacy-status claims from the 16699 helpline card.
- Ran tests, lint, build, browser checks at desktop/mobile sizes, and Impeccable detector.

## Next work

1. Independently verify all office contact details before calling the directory fully verified.
2. Run screen-reader testing and a full WCAG 2.2 AA evaluation.
3. Reduce the app/PDF bundle chunks to the Vite advisory range or below.
4. Define product operator, deployment target, data region, consent/retention, credentials custody, support, and incident-response needs before considering a backend.
5. Keep official complaint submission user-controlled unless an authorized integration is documented and built.

## Not implemented

No backend, accounts, cloud sync, secure cloud document store, or DNCRP complaint submission integration exists. See `docs/BACKEND_DECISION.md`.
