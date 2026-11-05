# KenaSathi data flow and privacy — current implementation

**Updated:** 5 November 2026. This replaces prior privacy “manifesto” language and unsupported security assurances.

## Data kept in the browser

- Case metadata and drafts are stored in browser `localStorage`.
- Evidence file blobs are stored in browser `IndexedDB`.
- The application has no account service, central case database for complaints, case sync, or official complaint-submission integration. A local SQLite help database serves product FAQs and chat matching only. Chat messages are processed in memory and not stored. Browser storage is not an encrypted vault and may be lost if site data is cleared. Shared-device users should avoid retaining sensitive material and should keep a backup they control.

## Optional AI requests

The source contains optional direct browser-to-provider AI calls when users supply their own credentials and explicitly consent to selected materials being sent. There is no application server proxy. Users should review the selected provider’s data handling terms. Never place production service credentials in a public browser build.

## Current limits

This document is a technical description, not a security audit or legal privacy notice. No account-based case backend, operator, retention policy, regional hosting decision, account isolation, or operational incident process is in place. Backend setup and remaining production requirements are documented in [`BACKEND_DECISION.md`](BACKEND_DECISION.md).
