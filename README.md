# কেনাসাথী (KenaSathi)

KenaSathi is an independent, Bengali-first consumer-assistance application for Bangladesh. It helps users organize purchase records, calculate a Section 60 date window from a user-provided cause-of-action date, and prepare complaint drafts for citizen review. It is **not** a DNCRP or government website and does not submit complaints.

## What the app does

- Keeps case metadata in browser `localStorage` and evidence files in browser `IndexedDB`.
- Provides an authentic empty state and explicitly labelled fictional demonstrations.
- Builds a draft based on user-provided information and available records; users must review it and submit through an official channel themselves.
- Supports local deterministic processing and optional, consented direct browser-to-provider AI requests when a user supplies provider credentials.

Browser storage is not an encrypted vault. Case records remain browser-local; there is no account service, case database, or case sync. A small SQLite help database powers the product FAQ and local FAQ-matching chat. Chat questions are not saved or sent to an AI provider. Do not use a shared/public device for sensitive records. Optional AI requests may transmit selected information to the provider; review the provider’s terms before consenting.

## Legal and official-service links

- Section 60 of the Consumer Rights Protection Act, 2009 sets a 30-day period from the cause of action; the relevant date depends on the facts. Do not guess if the date is unclear. See the [official Bangladeshi law text](https://bdlaws.minlaw.gov.bd/act-print-1014.html).
- Section 76(4) concerns a conditional share of a fine actually realized; it is not guaranteed compensation or a refund. See the [official law text](https://bdlaws.minlaw.gov.bd/act-print-1014/section-print-39187.html).
- DNCRP’s official site lists hotline **16121** and online complaint information at [DNCRP](https://dncrp.gov.bd/). The current online complaint system is also available at [CCMS](https://ccms.dncrp.com/).
- NLASO’s official notice lists **16699** as a new toll-free legal-aid helpline; see the [official notice](https://nlaso.gov.bd/pages/notices/6922f1c6dbfbab28ce0d5df6).

The office directory in the app still needs a record-by-record recheck before it should be described as fully verified. KenaSathi is guidance, not legal advice; confirm filing requirements with DNCRP.

## Local development

Requires Node.js 22.5+ and npm 9+.

```bash
npm install
npm run backend
```

In a second terminal, start the UI:

```bash
npm run dev
npm test
npm run lint
npm run build
```

The API listens on `http://127.0.0.1:8787`. Vite proxies `/api` requests to it. The SQLite database is created at `data/kenasathi-help.sqlite` and stays local to the installation.

For a production-style local run that serves the built UI and API from one process, use `npm run build` followed by `npm start`. On a host, point `KENASATHI_HELP_DB` to a persistent volume and bind `HOST=0.0.0.0`; the host should provide `PORT`.

Current review results and scope are in [`docs/ACCEPTANCE_MATRIX.md`](docs/ACCEPTANCE_MATRIX.md), [`docs/TEST_RESULTS.md`](docs/TEST_RESULTS.md), and [`docs/ACCESSIBILITY_AUDIT.md`](docs/ACCESSIBILITY_AUDIT.md). The current suite has 23 tests. The production build succeeds but currently reports app and PDF chunks slightly above Vite’s 500 KB advisory limit.
