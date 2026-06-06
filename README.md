# StorePilot

StorePilot is a full-stack TypeScript starter with a Next.js frontend, NestJS backend, PostgreSQL, Prisma, Docker Compose, JWT auth structure, and Swagger API docs.

## Structure

- `nextjsfrontend` - Next.js App Router frontend with Tailwind CSS
- `nestbackend` - NestJS API with Prisma, JWT scaffolding, Swagger, and health checks
- `docker-compose.yml` - PostgreSQL, backend, and frontend services

## Local Setup

1. Copy `.env.example` to `.env`.
2. Install dependencies:

```bash
npm install
```

3. Generate the Prisma client:

```bash
npm run db:generate
```

4. Start all services in Docker:

```bash
docker compose up --build
```

Backend health check: `http://localhost:3001/api/health`

Swagger docs: `http://localhost:3001/api/docs`

Frontend: `http://localhost:3000`
