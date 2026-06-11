# StorePilot

StorePilot is a portfolio-ready fullstack retail operations dashboard. It pairs a role-aware Next.js admin console with a NestJS API, PostgreSQL, Prisma migrations, JWT auth, Swagger docs, seed data, and Docker Compose.

## Features

- Next.js App Router dashboard with Thai/English language switching
- Light, dark, and system theme modes persisted in localStorage
- Role-aware UI for `OWNER`, `MANAGER`, and `STAFF`
- NestJS backend RBAC as the source of truth
- Products, stores, branches, inventory, stock movements, customers, and sales orders
- Standard API error responses: `{ statusCode, code, message, path, timestamp }`
- Swagger API documentation
- Optional Nginx reverse proxy profile for production-style routing

## Architecture

```text
StorePilot/
  nextjsfrontend/       Next.js dashboard UI
  nestbackend/          NestJS API, Prisma schema, migrations, seed data
  nginx/                Optional reverse proxy config
  docker-compose.yml    PostgreSQL, backend, frontend, optional Nginx
```

```mermaid
flowchart LR
  Browser["Browser / Next.js UI"] --> API["NestJS API /api"]
  API --> Prisma["Prisma Client"]
  Prisma --> Postgres["PostgreSQL"]
  Browser -. optional .-> Nginx["Nginx proxy profile"]
  Nginx --> API
```

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, lucide-react
- Backend: NestJS 11, TypeScript, Swagger, JWT, Passport
- Database: PostgreSQL 16, Prisma ORM
- Tooling: npm workspaces, Docker Compose, Jest

## Local Setup on Windows

Install dependencies:

```powershell
npm install
```

Start PostgreSQL. The local host port is `5433` to avoid conflicts with a Windows PostgreSQL install on `5432`.

```powershell
docker compose up -d postgres
```

Generate Prisma client, apply migrations, and seed demo data:

```powershell
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
```

Start frontend and backend together:

```powershell
npm.cmd run dev
```

Open:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:3001/api/health`
- Swagger docs: `http://localhost:3001/api/docs`

## Environment

Copy the root example file:

```powershell
Copy-Item .env.example .env
```

Important local values:

```env
POSTGRES_PORT=5433
DATABASE_URL=postgresql://storepilot:storepilot@postgres:5432/storepilot?schema=public
BACKEND_PORT=3001
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

For running the Nest backend outside Docker, use `nestbackend/.env` with:

```env
DATABASE_URL=postgresql://storepilot:storepilot@localhost:5433/storepilot?schema=public
```

## Prisma Note

Prisma is pinned to `7.7.0` in this project because Prisma `7.8.0` was quarantined by Windows Defender on this machine during local setup. Do not upgrade Prisma or run `npm audit fix --force` unless you intentionally re-test that environment issue.

## Demo Accounts

After seeding, all demo users use password `password123`.

| Role | Email | Access |
| --- | --- | --- |
| OWNER | `owner@storepilot.local` | Full admin controls, settings, users, owner-only deletes |
| MANAGER | `manager@storepilot.local` | Catalog, stock, customer, and order management |
| STAFF | `staff@storepilot.local` | Sales workflow and read-only operational views |

The frontend hides unavailable controls for clarity, but backend RBAC remains the source of truth. Forbidden API responses return HTTP `403` with the standard error shape.

## Useful Commands

```powershell
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd --workspace nestbackend run build
npm.cmd --workspace nextjsfrontend run build
```

Run the focused backend tests:

```powershell
npm.cmd --workspace nestbackend run test -- api-exception.filter.spec.ts --runInBand
```

## Docker Compose

Run only the database for local development:

```powershell
docker compose up -d postgres
```

Run the full stack:

```powershell
docker compose up --build
```

Run with the optional Nginx proxy:

```powershell
docker compose --profile proxy up --build
```

Nginx listens on `http://localhost:8080` by default:

- `/` routes to the frontend
- `/api` routes to the backend
- `/api/docs` routes to Swagger

Nginx is only a reverse proxy. It does not mask or rewrite API 400-series errors.

## Screenshots

Add portfolio screenshots under `docs/screenshots/`.

Recommended captures:

- `docs/screenshots/login-th.png`
- `docs/screenshots/dashboard-overview-dark.png`
- `docs/screenshots/products-owner.png`
- `docs/screenshots/inventory-manager.png`
- `docs/screenshots/sales-orders-staff.png`
- `docs/screenshots/settings-forbidden.png`

## API Areas

- `/api/auth`
- `/api/users`
- `/api/stores`
- `/api/branches`
- `/api/categories`
- `/api/products`
- `/api/inventory-stock`
- `/api/stock-movements`
- `/api/customers`
- `/api/sales-orders`
- `/api/sales-order-items`
- `/api/health`
