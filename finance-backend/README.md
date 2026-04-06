# FinCore: Finance Data Processing and Access Control System

A complete end-to-end full-stack application simulating a finance dashboard with complex aggregation, data validation, roles-based access control, and a sleek dark-themed React UI.

## How this maps to the Finance Backend Assignment

| Assignment requirement | Implementation |
|------------------------|----------------|
| **1. User & role management** | `POST /api/auth/register` creates users; **ADMIN** uses `GET/PATCH/DELETE /api/users/...` to list users, update **name/email**, **role**, **status** (active/inactive), or remove a user. |
| **2. Financial records** | `FinancialRecord` model with amount, type (income/expense), category, date, notes. **ADMIN** full CRUD; **ANALYST** read-only. Filters: type, category, date range, **search** (category/notes), pagination. |
| **3. Dashboard summaries** | `GET /api/dashboard/summary` (totals, net), `by-category`, `trends` (month or week), `recent` activity. |
| **4. Access control** | JWT auth (`authenticate`) + `authorizeRole` on routes; **VIEWER** dashboard-only; **ANALYST** records read + summaries; **ADMIN** records write + user admin. |
| **5. Validation & errors** | Zod schemas; `AppError` + global handler (4xx/5xx, Prisma, JWT). |
| **6. Persistence** | **PostgreSQL** via Prisma (relational, not in-memory). |
| **Optional extras** | JWT sessions, pagination, search, soft delete on records, rate limiting on auth routes, README API tables. |

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, Prisma (Neon Postgres DB)
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Recharts, Axios
- **Auth**: JWT Bearer Tokens
- **Validation**: Zod (Object schema validation)

## Setup Instructions

### 1. Database Configuration
Rename or create a `.env` file in the `finance-backend` folder using your Neon PosgreSQL connection.
```dotenv
DATABASE_URL="postgresql://<user>:<password>@<host>/neondb?sslmode=require"
JWT_SECRET="your_super_secret_jwt_key_here"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
# Production only — comma-separated frontend URLs for CORS (e.g. https://fincore.vercel.app)
# FRONTEND_URL="https://your-frontend.example.com"
```

**Prisma `P1012` (URL must start with `postgresql://` or `postgres://`):** Your `DATABASE_URL` is empty, wrong, or not Postgres. Use the full string from Neon (or your host), with no extra quotes inside the value on Render. It must begin with `postgresql://` or `postgres://`, not `mysql://`, `mongodb://`, or `file:`.

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd finance-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
4. Seed the database with test users and data:
   ```bash
   npm run db:seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a newly created terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```

## Admin Login (For Evaluator)

- New users are created as `VIEWER` by default.
- Only an existing `ADMIN` can promote users to `ANALYST` or `ADMIN`.

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
4. User logs out and logs in again to apply updated permissions.

## Assumptions Made
- Soft deletion is used for records, meaning deleted items will retain their referential integrity while setting `deletedAt` flag instead of a hard drop. (Users are still hard deleted since they own records).
- The `Role` scale strictly controls component access horizontally (routing layers) and vertically (API gateways).
- The frontend uses `VITE_API_URL` when set; otherwise it defaults to `http://localhost:3001/api` (see `frontend/src/api/axios.ts`). Match this to the backend `PORT` in `.env`.
- **Registration** always creates users with the **VIEWER** role; only an **ADMIN** can promote roles via `PATCH /api/users/:id/role`.
- **JWT + database**: After each request, the user is loaded from the database so **INACTIVE** status and **role changes** apply immediately (not only at login).
- **Dashboard aggregates** are **organization-wide** (all non-deleted records), not scoped per user—appropriate for a shared finance dashboard served to viewers and analysts.
- **Weekly trends** use **Monday** as the start of the week in the server’s local timezone.
- **PostgreSQL** is required for case-insensitive `contains` filters (`mode: 'insensitive'`).
- **Rate limiting**: `POST /api/auth/register` and `POST /api/auth/login` are limited to **100 requests per 15 minutes** per IP (adjust in `auth.route.ts`). Behind a reverse proxy, set `app.set('trust proxy', 1)` in `app.ts` if needed.

## Folder Structure
```text
FinCore/
├── finance-backend/
│   ├── prisma/             # Schema definitions and seed scripts
│   ├── src/
│   │   ├── config/         # Environment parsing
│   │   ├── controllers/    # Route handlers logic
│   │   ├── middleware/     # Auth and validation pipelines
│   │   ├── routes/         # Express Router setup
│   │   ├── services/       # Database transactions via Prisma
│   │   ├── utils/          # Global Utilities and AppError wrapper
│   │   └── validators/     # Zod payload verifications
│   └── .env                # Secret configurations
└── frontend/
    ├── src/
    │   ├── api/            # Axios API config
    │   ├── components/     # Reusable layout UI building blocks
    │   ├── context/        # React Context Auth wrapping
    │   └── pages/          # Full feature layout configurations
```

## API Endpoints

### Auth
| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | All | Register a new user |
| POST | `/api/auth/login` | No | All | Authenticate and get JWT |
| GET | `/api/auth/me` | Yes | All | Get current user's details |

### Records
| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/records` | Yes | ADMIN, ANALYST | Get paginated filtered records (query: `type`, `category`, `search` on category/notes, `startDate`, `endDate`, `page`, `limit`) |
| GET | `/api/records/:id` | Yes | ADMIN, ANALYST | Get specific record |
| POST | `/api/records` | Yes | ADMIN | Create new record |
| PATCH | `/api/records/:id` | Yes | ADMIN | Update a record |
| DELETE | `/api/records/:id` | Yes | ADMIN | Soft delete a record |

### Dashboard
| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/dashboard/summary` | Yes | All | Get aggregate summary |
| GET | `/api/dashboard/by-category` | Yes | All | Get pie chart groupings |
| GET | `/api/dashboard/trends` | Yes | All | Trend series; query `period=month` (default, last 6 calendar months) or `period=week` (last 8 weeks, week starts Monday). Response: `{ period, trends }` where each point includes `label`, `income`, `expenses`, `net` (monthly points also include `month`; weekly include `weekOf`). |
| GET | `/api/dashboard/recent` | Yes | All | Get recent 10 transactions |

### Users
| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/users` | Yes | ADMIN | List all registered users |
| GET | `/api/users/:id` | Yes | ADMIN | Access specific user info |
| PATCH | `/api/users/:id` | Yes | ADMIN | Update user **name** and/or **email** (body: at least one of `name`, `email`) |
| PATCH | `/api/users/:id/role` | Yes | ADMIN | Elevate or restrict user privileges |
| PATCH | `/api/users/:id/status` | Yes | ADMIN | Hard toggle Active state |
| DELETE | `/api/users/:id` | Yes | ADMIN | Hard delete user |

## Deploying live (overview)

You need three pieces: **PostgreSQL** (e.g. [Neon](https://neon.tech)), a **Node host** for the API, and **static hosting** for the Vite frontend.

### A. Database (Neon or any Postgres)

1. Create a project and copy the connection string (include `?sslmode=require` if required).
2. Set `DATABASE_URL` on your API host.

### B. Backend API (example: [Render](https://render.com))

1. New **Web Service** → connect this repo, root directory **`finance-backend`**.
2. **Build command:** `npm install && npx prisma migrate deploy && npm run build`
3. **Start command:** `npm start`
4. **Environment variables:**

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | Postgres URL from Neon |
| `JWT_SECRET` | Long random string (generate locally, never commit) |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Your live frontend origin(s), comma-separated, e.g. `https://fincore.vercel.app` |
| `PORT` | Usually set automatically by the platform |

5. After deploy, open `https://<your-service>.onrender.com/health` — you should see `{"status":"ok",...}`.

`postinstall` runs `prisma generate` so the Prisma client is built on install. `prisma` is a runtime dependency for that reason.

**Render build / TypeScript:** `npm run build` runs a pinned `npm install` of `@types/node`, `@types/express`, `@types/cors`, `@types/jsonwebtoken`, and `@types/bcryptjs` before `tsc`, so typings exist even if the first install step skipped them. **Commit `package-lock.json`.** If builds still fail, add Render env var `NPM_CONFIG_PRODUCTION`=`false` (or keep the repo’s `.npmrc` with `production=false`).

### C. Frontend (example: [Vercel](https://vercel.com) or [Netlify](https://netlify.com))

1. New project → import repo, root directory **`frontend`**.
2. Build: `npm run build`, output directory **`dist`** (Vite default).
3. **Environment variable:** `VITE_API_URL` = your public API base URL **including** `/api`, e.g. `https://fincore-api.onrender.com/api`

Redeploy the frontend whenever the API URL changes.

### D. Seed production (optional)

From your machine (with `DATABASE_URL` pointing at production), once:

```bash
cd finance-backend
npx prisma migrate deploy
npm run db:seed
```

Or run a one-off shell on the host with the same env. **Change default seed passwords** if the DB is public.

---

Same pattern works on **Railway**, **Fly.io**, **Azure**, etc.: run the backend as a Node process with `npm start`, run migrations before or as part of the build, and point `VITE_API_URL` at that API.
