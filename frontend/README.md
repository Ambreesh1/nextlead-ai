# NextLead — Frontend

**AI-Powered Lead Intelligence.** A premium CRM dashboard (Next.js App Router + TypeScript +
Tailwind CSS + shadcn-style components + Framer Motion) built around the CSV import flow: a left
sidebar shell (Dashboard, Import Leads, Leads, Analytics, Team, Settings), drag & drop upload,
client-side preview, an AI processing animation, and a searchable/filterable/paginated leads table
with CSV export.

**Full documentation (architecture, deployment, env vars) lives in the
[root README](../README.md).**

## Quick start

```bash
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm install
npm run dev                          # http://localhost:3000
```

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Radix UI primitives (shadcn-style
components) · Framer Motion · Recharts · cmdk (command palette) · sonner (toasts) · PapaParse

## Structure

```
app/
  page.tsx                  # landing page
  dashboard/
    layout.tsx               # sidebar + topbar shell
    page.tsx                  # Dashboard (stats, charts)
    import/page.tsx            # Import Leads (upload -> preview -> AI processing -> results)
    leads/page.tsx               # Manage Leads (search, filter, paginate, export)
    analytics/page.tsx            # Analytics (deeper charts + breakdown table)
    team/page.tsx                  # Team (presentational)
    settings/page.tsx               # Settings
components/
  ui/            # shadcn-style primitives (button, card, table, dialog, command, ...)
  sidebar/       # Sidebar, NavItem, MobileNavDrawer
  dashboard/     # StatCard, charts, RecentSkipped
  import/        # UploadDropzone, CsvPreviewTable, ProcessingAnimation, ImportSteps
  leads/         # LeadsTable, LeadsFilters, LeadsPagination, LeadDetailDialog, StatusBadge
  common/        # Logo, ThemeToggle, CommandPalette, AnimatedCounter, EmptyState, PageHeader
hooks/
  useTheme.tsx       # dark mode (persisted + system-aware)
  useLeadsStore.tsx    # holds the last import result (localStorage-backed) across pages
  useKeyboardShortcut.tsx
lib/
  api.ts        # backend client (unchanged contract)
  csv.ts        # client-side CSV parsing + CSV export
  analytics.ts  # pure functions deriving chart data from real imported records
  utils.ts      # cn(), date/byte formatters
```

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open command palette (navigate, toggle theme, export leads) |
| `/` | Focus the search box on the Leads page |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm test` | Run Jest + React Testing Library tests |
| `npm run lint` | Run Next.js ESLint |
