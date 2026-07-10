# NextLead AI
### Intelligent CRM Lead Management Platform

NextLead AI is a modern AI-powered CRM platform that intelligently imports leads from CSV files with different formats and automatically maps them into a standardized CRM schema using Google Gemini.

The platform includes AI-powered lead extraction, an interactive dashboard, analytics, lead management, CSV preview, and cloud-ready architecture built using Next.js, Express.js, TypeScript, and Docker.

---
## 🌐 Live Demo
**Frontend:** https://your-vercel-url.vercel.app

## ⚙️ Backend API
**Backend:** https://nextlead-ai.onrender.com

## 💻 Source Code
**GitHub:** https://github.com/Ambreesh1/nextlead-ai
## 📸 Project Screenshot
<img width="1920" height="1080" alt="Screenshot 2026-07-10 120528" src="https://github.com/user-attachments/assets/9099f37e-8bbf-4506-b6c4-1f7cd8ef0ef7" />
<img width="1920" height="1080" alt="Screenshot 2026-07-10 120235" src="https://github.com/user-attachments/assets/26ddc97e-c921-45ce-b7c2-d16cf7d6ef0b" />
<img width="1920" height="1080" alt="Screenshot 2026-07-10 120214" src="https://github.com/user-attachments/assets/caffce60-2e40-42ad-a3bd-b4c56d055e4b" />
<img width="1920" height="1080" alt="Screenshot 2026-07-10 120149" src="https://github.com/user-attachments/assets/11e06a7b-c33f-44c1-bda1-7e46fb116ef3" />





## ✨ Key Features

- AI-powered CSV field mapping using Google Gemini
- Intelligent Lead Management Dashboard
- CSV Preview before Import
- Analytics Dashboard
- Lead Search & Filtering
- CSV Export
- Dark Mode
- Responsive Design
- Docker Support
- REST API Architecture

## Table of contents

1. [Live demo & submission info](#live-demo--submission-info)
2. [Overall architecture](#overall-architecture)
3. [Folder structure](#folder-structure)
4. [How the AI extraction works](#how-the-ai-extraction-works)
5. [Local setup](#local-setup)
6. [Environment variables](#environment-variables)
7. [Running tests](#running-tests)
8. [Docker](#docker)
9. [Deployment guide](#deployment-guide)
10. [API reference](#api-reference)
11. [Design decisions & tradeoffs](#design-decisions--tradeoffs)
12. [Rebrand notes](#rebrand-notes)
13. [Known limitations / future work](#known-limitations--future-work)

---

## system architecture

This is a **two-service architecture** — a Next.js frontend and a standalone Express/TypeScript
backend — communicating over a JSON/multipart REST API. The two are independently deployable
(e.g. frontend on Vercel, backend on Render/Railway).

```
┌─────────────────────────┐        multipart/form-data        ┌──────────────────────────────┐
│                         │  ─────────────────────────────▶   │                              │
│   Next.js Frontend      │      POST /api/csv/process        │   Express Backend (TS)       │
│   (App Router)          │  ◀─────────────────────────────   │                              │
│   "NextLead" dashboard  │        structured JSON             │                              │
│                         │                                    │  1. multer (memory storage)  │
│  Sidebar: Dashboard,    │                                    │  2. PapaParse → raw rows     │
│  Import Leads, Leads,   │                                    │  3. Batch rows (N per batch) │
│  Analytics, Team,       │                                    │  4. Gemini extraction        │
│  Settings               │                                    │     (bounded concurrency,    │
│                         │                                    │      retry w/ backoff)       │
│  Import Leads page:     │                                    │  5. Zod validation of AI     │
│  1. Drag & drop upload  │                                    │     output                   │
│  2. Client-side preview │                                    │  6. Business rule: skip rows │
│     (PapaParse, no AI)  │                                    │     with no email & no phone │
│  3. Confirm → API call  │                                    └──────────────────────────────┘
│  4. AI processing        │
│     animation             │
│  5. Auto-navigate to       │
│     Manage Leads page       │
└─────────────────────────┘
```

The frontend is a full CRM shell, not a single wizard page: a persistent left sidebar (Dashboard,
Import Leads, Leads, Analytics, Team, Settings), a command palette (⌘K), dark mode, animated stat
counters, real charts (status breakdown, leads-over-time, top sources) computed from the actual
imported records, a searchable/filterable/paginated leads table, per-row detail view, and CSV
export — all built on shadcn-style Radix UI primitives, Tailwind CSS, and Framer Motion. The last
import result is held in a small client-side store (React Context + localStorage) so Dashboard,
Leads, and Analytics all reflect the same data without needing a backend database.

**Why two services instead of one Next.js app with API routes?** The assignment's tech stack
section explicitly lists Next.js (frontend) and Node.js/Express (backend) as separate concerns,
and evaluators are grading "API design" and "backend quality" as their own category. Splitting
them keeps the backend a portable, standalone REST API usable by any client (mobile app, another
frontend, a script) — not just this UI — and matches how a real GrowEasy microservice would
likely be structured.

### Request lifecycle for a single import

1. User drops/selects a `.csv` file in the browser.
2. **Frontend parses it entirely client-side** with PapaParse to render the preview table.
   **No network call happens here** — this satisfies the assignment's explicit requirement that
   "No AI processing should happen yet" at the preview step.
3. User clicks **Confirm & Import with AI**. The *original file* (not the parsed preview) is
   uploaded via `multipart/form-data` to `POST /api/csv/process`.
4. Backend re-parses the CSV (never trusts client-supplied structure), splits rows into batches
   (`CSV_BATCH_SIZE`, default 25), and sends each batch to Gemini **concurrently** (bounded by
   `GEMINI_CONCURRENCY`) with a carefully engineered system prompt (see below).
5. Each batch's JSON response is validated against a Zod schema — any invalid `crm_status` or
   `data_source` value is coerced to `null`/`""` rather than trusted blindly, and any row missing
   both `email` and `mobile_without_country_code` is deterministically moved to the *skipped* list
   (this rule is enforced in code, not left to the AI, so it's guaranteed and unit-tested).
6. Failed batches are retried with exponential backoff; if a batch still fails after all retries,
   its rows are marked skipped with a clear reason rather than failing the entire import.
7. The backend returns one JSON payload with `records` (imported), `skipped` (with reasons), and
   summary counts. The frontend renders this in a tabbed results table.

---

## Folder structure

```
nextlead/
├── backend/
│   ├── src/
│   │   ├── config/          # env loading (zod-validated), Gemini client setup
│   │   ├── controllers/      # request handlers (thin - delegate to services)
│   │   ├── middleware/        # error handler, multer upload config, rate limiter
│   │   ├── prompts/           # AI system instructions + per-batch prompt builder
│   │   ├── routes/            # Express routers
│   │   ├── services/           # csvParser, gemini, extraction orchestration
│   │   ├── types/               # CrmRecord, ProcessCsvResult, etc.
│   │   ├── utils/                # AppError classes, retry/backoff, concurrency pool, logger
│   │   ├── app.ts                 # Express app assembly (middleware + routes)
│   │   └── server.ts               # process entrypoint
│   ├── tests/                       # Jest unit + integration tests
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── layout.tsx        # fonts, theme + leads-store providers, anti-FOUC script
│   │   ├── page.tsx           # NextLead landing page
│   │   ├── globals.css         # shadcn-style HSL theme tokens (light + dark)
│   │   └── dashboard/
│   │       ├── layout.tsx        # sidebar + topbar shell, command palette
│   │       ├── page.tsx           # Dashboard (stat cards, charts)
│   │       ├── import/page.tsx     # Import Leads (upload → preview → AI → results)
│   │       ├── leads/page.tsx       # Manage Leads (search, filter, paginate, export)
│   │       ├── analytics/page.tsx    # Analytics (charts + breakdown table)
│   │       ├── team/page.tsx          # Team (presentational)
│   │       └── settings/page.tsx       # Settings
│   ├── components/
│   │   ├── ui/            # shadcn-style Radix primitives (button, card, table, dialog, ...)
│   │   ├── sidebar/        # Sidebar, NavItem, MobileNavDrawer
│   │   ├── dashboard/       # StatCard, LeadStatusChart, LeadsOverTimeChart, TopSourcesChart
│   │   ├── import/           # UploadDropzone, CsvPreviewTable, ProcessingAnimation, ImportSteps
│   │   ├── leads/              # LeadsTable, LeadsFilters, LeadsPagination, LeadDetailDialog
│   │   └── common/               # Logo, ThemeToggle, CommandPalette, AnimatedCounter, EmptyState
│   ├── hooks/
│   │   ├── useTheme.tsx          # dark mode (persisted + system-aware)
│   │   ├── useLeadsStore.tsx       # last import result, shared across dashboard pages
│   │   └── useKeyboardShortcut.tsx
│   ├── lib/                          # api.ts (unchanged backend client), csv.ts, analytics.ts, utils.ts
│   ├── types/crm.ts                     # mirrors backend schema for the frontend
│   ├── __tests__/                          # Jest + React Testing Library tests
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml         # runs both services together
├── .env.example                 # variables consumed by docker-compose
└── README.md                      # this file
```

---

## How the AI extraction works

The hardest part of this assignment is prompt engineering, not CSV parsing. The approach used
here (see `backend/src/prompts/crmExtraction.prompt.ts`):

- **Rows are sent as JSON, not raw CSV text**, to Gemini. This removes all delimiter/quoting
  ambiguity so the model can focus purely on semantic field mapping.
- **The system instruction is exhaustive and explicit** about every target field, including
  what to do when a field *isn't* found (`null`, never a guess).
- **Closed vocabularies are enforced twice**: once by instructing the model that `crm_status`
  and `data_source` must come from a fixed list (or be blank), and again in code — a Zod schema
  coerces any value outside the allowed list back to `null`/`""`, so a hallucinated status can
  never leak into the CRM data even if the model ignores instructions.
- **Multi-value fields** (multiple emails/phones in one row) are explicitly handled: keep the
  first, append the rest to `crm_note` — matching the assignment's rule precisely.
- **The "skip if no email and no mobile" rule is NOT left to the AI.** It's applied
  deterministically in `extraction.service.ts` after the AI response comes back, so it's testable,
  guaranteed, and immune to prompt drift.
- **Batching + concurrency + retries**: rows are chunked (`CSV_BATCH_SIZE`), batches run with
  bounded concurrency (`GEMINI_CONCURRENCY`), and each batch retries with exponential backoff
  (`GEMINI_MAX_RETRIES`, `GEMINI_RETRY_DELAY_MS`) before its rows are marked skipped — a large CSV
  never fails all-or-nothing because of one flaky batch.
- **Row-order preservation**: the model is instructed to return exactly one output object per
  input row, in the same order, so the backend can zip AI output back up with original row
  numbers for accurate "skipped row" reporting.

---

## Local setup

### Prerequisites

- Node.js 18+
- A Gemini API key — get one free at [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env and paste your GEMINI_API_KEY

npm install
npm run dev
# backend runs at http://localhost:4000
```

### 2. Frontend

In a separate terminal:

```bash
cd frontend
cp .env.local.example .env.local
# defaults to http://localhost:4000, change if your backend runs elsewhere

npm install
npm run dev
# frontend runs at http://localhost:3000
```

Open `http://localhost:3000`, click **Go to Dashboard** (or go straight to
`http://localhost:3000/dashboard/import`), upload a CSV (there's a sample below), preview it,
confirm, and watch the AI-extracted results come back — you'll be auto-navigated to the **Leads**
page once the import finishes.

### Sample CSV to try

```csv
Full Name,Contact Number,Email Address,Enquiry Status,Notes,Source,Project
John Doe,9876543210,john.doe@example.com,Interested - schedule demo,Asked to reschedule,Facebook Ad,Meridian Tower
Sarah J,9876543211,,No response after 3 tries,,Google Ads,
,,priya@example.com; priya.alt@example.com,Deal closed,Ready to onboard,Website Form,Eden Park
Random Row,,,,,,
```

This intentionally mixes non-standard column names, a row with no phone, a row with two emails,
and a fully empty row — all patterns the AI mapping and skip-rule logic are designed to handle.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Port the Express server listens on |
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `CORS_ORIGIN` | `http://localhost:3000` | Comma-separated list of allowed frontend origins |
| `GEMINI_API_KEY` | — | **Required.** Your Gemini API key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model name |
| `MAX_FILE_SIZE_MB` | `10` | Max upload size |
| `CSV_BATCH_SIZE` | `25` | Rows sent to Gemini per request |
| `GEMINI_MAX_RETRIES` | `3` | Retries per failed batch |
| `GEMINI_RETRY_DELAY_MS` | `1000` | Base delay for exponential backoff |
| `GEMINI_CONCURRENCY` | `3` | Max batches processed in parallel |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window for `/api/csv/process` |
| `RATE_LIMIT_MAX_REQUESTS` | `20` | Max requests per window per IP |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Base URL of the backend API |

---

## Running tests

### Backend (Jest + Supertest)

```bash
cd backend
npm test
```

Covers: CSV parsing edge cases (empty files, blank rows, arbitrary headers), batching logic, the
Zod validation schema's coercion behavior (invalid enum values never leak through), the full
extraction orchestration with Gemini mocked (skip-rule correctness, batch-failure isolation,
row-order preservation), and integration tests against the Express app (health check, file-type
validation, 404 handling).

### Frontend (Jest + React Testing Library)

```bash
cd frontend
npm test
```

Covers: CSV file-type validation, byte/date formatting helpers, the pure analytics functions that
derive chart data from imported records (status/source breakdowns, time-series bucketing), and
key UI components (`StatusBadge`, `ImportSteps`).

---

## Docker

Run both services together with one command from the repo root:

```bash
cp .env.example .env
# edit .env and set GEMINI_API_KEY

docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

Each service also has its own standalone `Dockerfile` if you want to build/deploy them
independently:

```bash
docker build -t groweasy-backend ./backend
docker build -t groweasy-frontend --build-arg NEXT_PUBLIC_API_URL=https://your-backend-url ./frontend
```

---

## Deployment guide

### Backend → Render (or Railway)

1. Push this repo to GitHub.
2. On Render: **New → Web Service**, connect the repo, set **Root Directory** to `backend`.
3. Build command: `npm install && npm run build`. Start command: `npm start`.
4. Add environment variables from the table above (at minimum `GEMINI_API_KEY`; set
   `CORS_ORIGIN` to your deployed frontend URL once you have it).
5. Deploy. Note the resulting URL (e.g. `https://groweasy-backend.onrender.com`).

Railway is effectively identical: **New Project → Deploy from GitHub**, set the root directory to
`backend`, and add the same environment variables.

### Frontend → Vercel

1. On Vercel: **New Project**, import the repo, set **Root Directory** to `frontend`.
2. Framework preset: Next.js (auto-detected).
3. Add environment variable `NEXT_PUBLIC_API_URL` = your deployed backend URL from the step
   above.
4. Deploy.
5. Go back to your backend's `CORS_ORIGIN` env var and update it to your new Vercel URL, then
   redeploy the backend so CORS allows it.

---

## API reference

### `GET /api/health`

Health check. Returns `{ success: true, data: { status: 'ok', timestamp } }`.

### `POST /api/csv/preview`

Optional server-side preview (parse only, no AI). Multipart field name: `file`.

```json
{
  "success": true,
  "data": { "headers": ["Name", "Email"], "rows": [{"Name": "John", "Email": "john@x.com"}], "totalRows": 1 }
}
```

### `POST /api/csv/process`

The main endpoint. Multipart field name: `file`. Rate-limited (see env vars above).

**Success (200):**

```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "totalRows": 10,
    "totalImported": 8,
    "totalSkipped": 2,
    "batchesProcessed": 1,
    "batchesFailed": 0,
    "records": [
      {
        "rowNumber": 1,
        "raw": { "Full Name": "John Doe", "...": "..." },
        "crm": {
          "created_at": "2026-05-13 14:20:48",
          "name": "John Doe",
          "email": "john.doe@example.com",
          "country_code": "+91",
          "mobile_without_country_code": "9876543210",
          "company": "GrowEasy",
          "city": "Mumbai",
          "state": "Maharashtra",
          "country": "India",
          "lead_owner": "test@gmail.com",
          "crm_status": "GOOD_LEAD_FOLLOW_UP",
          "crm_note": "Client is asking to reschedule demo",
          "data_source": "",
          "possession_time": null,
          "description": null
        }
      }
    ],
    "skipped": [
      { "rowNumber": 4, "raw": {"...": "..."}, "reason": "MISSING_EMAIL_AND_MOBILE", "detail": "..." }
    ],
    "processingTimeMs": 3120
  }
}
```

**Error (4xx/5xx):**

```json
{ "success": false, "error": { "message": "Only .csv files are supported", "code": "INVALID_FILE_TYPE" } }
```

---

## Design decisions & tradeoffs

- **Stateless by design.** No database — every import is processed and returned in one request.
  This matches the assignment's "keep the project stateless" option and keeps the submission
  simple to run/verify. A `jobId` is still generated per request for log correlation and to leave
  room for persistence later without changing the API shape.
- **Skip rule enforced in code, not by the AI.** A model can be prompted to skip rows, but that
  makes correctness dependent on prompt compliance. Enforcing it in TypeScript after extraction
  means it's 100% guaranteed and unit-tested, regardless of what the model does.
- **Zod validation as a safety net for AI output.** LLM output is treated as *untrusted input* —
  every record is validated, and out-of-vocabulary `crm_status`/`data_source` values are coerced
  rather than trusted, so the CRM's data integrity can't be broken by a hallucinated value.
  Structural failures still surface as store errors rather than silently swallowing 0 records.
- **Bounded concurrency + exponential backoff** rather than fire-all-batches-at-once, to stay
  within Gemini rate limits gracefully on larger files while still processing faster than fully
  sequential batches.
- **Client-side preview, server-side processing.** The preview step re-parses nothing on the
  server — it's pure client-side PapaParse for instant feedback — while the actual AI extraction
  always re-parses the original file server-side rather than trusting client-supplied JSON, since
  the backend should never trust a client's interpretation of the file it's about to bill AI calls
  against.

---

## Branding

The product is branded **NextLead — AI-Powered Lead Intelligence** throughout the frontend: page
titles, the sidebar, the landing page, toasts, and all UI copy. This was a frontend-only rebrand
by design:

- *The application is branded as NextLead AI throughout the frontend while maintaining full compatibility with the existing backend API and CRM schema.

## Known limitations / future work
## Skills Demonstrated

- Full Stack Development
- Next.js
- Express.js
- TypeScript
- REST API Development
- Google Gemini Integration
- Prompt Engineering
- Docker
- Git & GitHub
- Cloud Deployment
## Roadmap
- Progress during AI processing is a **bounded client-side simulation** (see
  `frontend/components/import/ProcessingAnimation.tsx`), not a real server-sent progress stream. A
  follow-up could add Server-Sent Events or WebSockets so the UI reflects true per-batch
  completion.
- The Leads table paginates (10 rows/page) rather than using a virtualized list, so it comfortably
  handles large imports without rendering thousands of DOM rows at once — but for extremely large
  single-page views, integrating `react-window` would keep scroll performance smooth if pagination
  were ever removed.
- No persistence layer — the last import lives in `localStorage` via `useLeadsStore`, so it
  survives a refresh but not a different browser/device. Adding a database (e.g. Postgres) behind
  `jobId` would allow revisiting past imports from anywhere.
- Team and Settings pages are intentionally presentational — the assignment's backend has no
  team/user-management or settings endpoints, so those pages demonstrate the intended UX without
  claiming functionality the API doesn't back.
  ### Future Improvements

- Authentication
- PostgreSQL Integration
- Multi-user Workspaces
- Background Job Queue
- Real-time Progress Tracking
- Role Based Access Control
