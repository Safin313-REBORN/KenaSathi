# Backend and database status

KenaSathi has a Node.js help API backed by SQLite. It serves product help FAQs and deterministic chat answers from a seeded database. The API validates request size and message length, uses prepared database statements, applies a per-IP request limit, and does not save chat messages.

## Run locally

Run the UI and backend in separate terminals:

1. `npm run backend` starts the API at `http://127.0.0.1:8787`.
2. `npm run dev` starts Vite; `/api` calls are proxied to the backend.

The SQLite file is created at `data/kenasathi-help.sqlite` by default and is ignored by Git. Node.js 22.5 or newer is required for the built-in SQLite module.

## Production-style single-service run

`npm run build && npm start` serves both the generated frontend and `/api` from one Node process. Set `HOST=0.0.0.0`, let the host provide `PORT`, and set `KENASATHI_HELP_DB` to a file path under the host's mounted persistent volume. Keep this SQLite deployment to one service instance; use managed PostgreSQL before adding account-based user records or multiple app instances.

## Data boundary

Case metadata and evidence remain in the browser's localStorage and IndexedDB. The new backend does **not** sync, receive, or store complaint records, personal identifiers, or uploaded evidence. The help chat is a searchable FAQ matcher, not an AI assistant; it does not send user questions to a model or retain them. Do not present the help database as a secure vault for case data.

## Before adding account-based case sync

A production case database still needs an identified operator and deployment target, account/session design, per-user authorization, encrypted storage, retention and deletion rules, backups and restore tests, privacy/legal review, incident response, and a support owner. Only add case sync after those decisions are implemented and explained to users at the point of consent. Official DNCRP filing remains a user-controlled handoff.
