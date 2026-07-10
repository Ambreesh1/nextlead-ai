# GrowEasy CSV Importer — Backend

Express + TypeScript API that parses uploaded CSVs and uses Gemini to map arbitrary columns onto
the GrowEasy CRM schema.

**Full documentation (architecture, API reference, deployment, env vars) lives in the
[root README](../README.md).**

## Quick start

```bash
cp .env.example .env      # add your GEMINI_API_KEY
npm install
npm run dev                # http://localhost:4000
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with hot reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (`dist/server.js`) |
| `npm test` | Run Jest unit + integration tests |
| `npm run lint` | Run ESLint |
