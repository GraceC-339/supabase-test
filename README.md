## Supabase + React (Vite) Sales Dashboard

A simple sales dashboard built with React (Vite) that uses Supabase for data and realtime updates, and `react-charts` for visualization. It shows total sales per sales rep and lets you add new deals via a form.

### Tech stack
- **React 19** with Vite
- **Supabase** (`@supabase/supabase-js`)
- **Realtime** via Postgres Changes
- **Charts** via `react-charts` (bar chart)
- **ESLint** preconfigured

## Getting started

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
Create a `.env` file in the project root:

```bash
cp .env.example .env
```

If you don’t have `.env.example`, create `.env` with:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

These are read in `src/supabase-client.js`:
```js
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
```

### 3) Start the dev server
```bash
npm run dev
```
Open the URL shown in your terminal (typically `http://localhost:5173`).

## Database setup (Supabase)

This app expects a `public.sales_deals` table with at least:
- `name` (text) — sales rep name
- `value` (numeric/int) — deal amount in dollars


## App structure

- `src/main.jsx`: Bootstraps React.
- `src/App.jsx`: Renders `Header` and `Dashboard`.
- `src/Header.jsx`: Simple header.
- `src/Dashboard.jsx`:
  - Loads aggregated metrics from `public.sales_deals`:
    ```sql
    select
      name,
      value.sum()
    from public.sales_deals
    group by name;
    ```
  - Subscribes to realtime changes on `sales_deals` and refreshes metrics on change.
  - Renders a bar chart via `react-charts`.
- `src/Form.jsx`:
  - Uses `useActionState` to insert a new deal (`name`, `value`) into `sales_deals`.
  - Disables the button and shows pending state while submitting.

## How it works

- On initial load, `Dashboard` calls Supabase to fetch metrics and stores them in state.
- It subscribes to `postgres_changes` for `public.sales_deals`:
  - Any INSERT/UPDATE/DELETE triggers `fetchMetrics()` again, keeping the chart live.
- `Form` submits via `useActionState` and inserts a new row in `sales_deals`, which triggers the realtime refresh.

## Scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Build for production
- `npm run preview`: Preview the production build
- `npm run lint`: Lint the codebase

## Troubleshooting

- No realtime events:
  - Ensure the table is in `supabase_realtime` publication.
  - If RLS is enabled, ensure SELECT permissions allow your client to see rows.
  - Open browser DevTools Console; you should see logs when changes occur.
- Aggregation mismatch:
  - The app expects the aggregated response with `name` and `sum` fields.
- Environment variables not loaded:
  - Ensure `.env` vars start with `VITE_` and you restarted the dev server after editing.

## License

MIT 
