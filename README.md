# StorePilot

StorePilot is a full-stack retail operations dashboard built for portfolio-quality demonstration. It combines a polished Next.js admin UI with a NestJS API, PostgreSQL, Prisma, Docker Compose, JWT auth, role-based access, Swagger docs, seed data, and service tests.

## Tech Stack

- Next.js App Router, TypeScript, Tailwind CSS
- NestJS, TypeScript, Swagger
- PostgreSQL
- Prisma ORM and migrations
- Docker Compose
- JWT access tokens and refresh tokens
- Roles: `OWNER`, `MANAGER`, `STAFF`

## Project Structure

```text
StorePilot/
  nextjsfrontend/    Next.js dashboard UI
  nestbackend/       NestJS API, Prisma schema, migrations, seed data
  docker-compose.yml PostgreSQL, backend, and frontend services
```

## Environment Variables

Copy the root example file before running Docker:

```bash
cp .env.example .env
```

Root `.env.example`:

```env
POSTGRES_USER=storepilot
POSTGRES_PASSWORD=storepilot
POSTGRES_DB=storepilot
DATABASE_URL=postgresql://storepilot:storepilot@postgres:5432/storepilot?schema=public
JWT_SECRET=change-me-in-production
BACKEND_PORT=3001
FRONTEND_PORT=3000
FRONTEND_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

For local backend development outside Docker, use `nestbackend/.env.example` and set `DATABASE_URL` to `localhost`.

## Local Setup

Install dependencies and generate Prisma client:

```bash
npm install
npm run db:generate
```

Run PostgreSQL with Docker, then migrate and seed:

```bash
docker compose up -d postgres
npm run db:migrate
npm run db:seed
```

Start both apps:

```bash
npm run dev
```

Frontend: `http://localhost:3000`

Backend API: `http://localhost:3001/api`

## Demo Accounts

After `npm run db:seed`, use password `password123` for:

- `owner@storepilot.local`
- `manager@storepilot.local`
- `staff@storepilot.local`

## Docker Compose Guide

Run the full stack:

```bash
docker compose up --build
```

The backend container runs `prisma migrate deploy` before starting, so a fresh Docker database receives the committed migrations automatically.

Stop services:

```bash
docker compose down
```

Remove volumes for a clean database:

```bash
docker compose down -v
```

## API Documentation

Swagger UI is available after the backend starts:

```text
http://localhost:3001/api/docs
```

Use the Swagger `Authorize` button with a JWT access token returned by:

```text
POST /api/auth/login
```

Important API areas:

- `/api/auth` register, login, refresh, logout, profile
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

## Screenshots

Add screenshots to `docs/screenshots/` when publishing the portfolio repo.

Recommended captures:

- `docs/screenshots/login.png`
- `docs/screenshots/dashboard-overview.png`
- `docs/screenshots/products.png`
- `docs/screenshots/inventory.png`
- `docs/screenshots/sales-orders.png`

Suggested capture command once the app is running:

```bash
npm --workspace nextjsfrontend run dev
```

Then open `http://localhost:3000` and capture the listed pages.

## Production Build Verification

Run the full verification suite:

```bash
npm run verify
```

This runs:

- Prisma client generation
- Frontend and backend lint
- Backend tests
- Frontend and backend production builds
- Docker Compose config validation

Individual commands:

```bash
npm run db:generate
npm run lint
npm run test
npm run build
docker compose config
```

## Current Portfolio Scope

Implemented:

- Auth and RBAC structure
- Store and branch management
- Product and category APIs
- Inventory stock and movement APIs
- Customer APIs
- Sales order and line item APIs
- Dashboard UI pages for all major workflows
- Seed data and demo accounts
- Basic backend service tests
- Prisma-aware API error handling
- Loading and empty UI states
