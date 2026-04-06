# FinCore

Full-stack **finance dashboard** demo: REST API with role-based access (Viewer / Analyst / Admin), financial record CRUD, aggregated dashboard endpoints, JWT auth, and a React (Vite) UI.

## Repository layout

| Folder | Description |
|--------|-------------|
| [`finance-backend/`](./finance-backend/) | Express + TypeScript + Prisma (PostgreSQL). **Start here for the backend assignment:** setup, env vars, API tables, and how requirements map to the implementation. |
| [`frontend/`](./frontend/) | React + TypeScript + Tailwind + Recharts client. |

## Quick start

1. **Backend:** follow [`finance-backend/README.md`](./finance-backend/README.md) (database URL, `npm install`, Prisma migrate, seed, `npm run dev`).
2. **Frontend:** `cd frontend && npm install && npm run dev` — set `VITE_API_URL` if your API is not the default in `src/api/axios.ts`.

**Going live:** see [Deploying live](finance-backend/README.md#deploying-live-overview) in `finance-backend/README.md` (Neon + Render + Vercel-style setup, env vars, migrations).

## Tech highlights

- **Persistence:** PostgreSQL via Prisma (not in-memory).
- **Auth:** Bearer JWT; roles enforced in middleware on routes.
- **Records:** Soft delete, filtering, pagination, optional search.
- **Dashboard:** Summary totals, category breakdown, monthly/weekly trends, recent activity.

## Admin Login (For Evaluator)

- New users are created as `VIEWER` by default.
- Only an existing `ADMIN` can change a user's role to `ANALYST` or `ADMIN`.

### Default admin credentials (after seed)

- **Email:** `admin@finance.com`
- **Password:** `Admin@123`

### If admin login does not work on live deployment

The deployed database is likely not seeded yet. Run:

```bash
cd finance-backend
npx prisma migrate deploy
npm run db:seed
```

### Role assignment flow

1. Login as admin.
2. Open the Users page.
3. Change role from dropdown to `ANALYST` or `ADMIN`.
4. User logs out and logs in again to see updated permissions.

---

_Submission / evaluation:_ backend scope and assumptions are documented in [`finance-backend/README.md`](./finance-backend/README.md).
