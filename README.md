# Reevio

AI-powered short-form video generation studio. Built as a TypeScript monorepo with three independent apps: a Next.js frontend, a NestJS API, and a BullMQ background worker.

## Tech Stack

| Layer | Tech | Location |
|-------|------|----------|
| Frontend | Next.js 15 (App Router) | `apps/web/` |
| Backend | NestJS 11 | `apps/api/` |
| Worker | BullMQ + Redis | `apps/worker/` |
| ORM | Prisma | `apps/api/prisma/` |
| Auth | JWT + Passport | `@nestjs/jwt` |
| Types | TypeScript | `packages/types/` |
| Config | Zod schemas | `packages/config/` |

## Requirements

- Node.js 22+
- pnpm 9+
- Docker Desktop or local PostgreSQL + Redis

## Setup: Local Source

Run the apps on your machine and keep only infrastructure external.

```bash
# Install dependencies
pnpm install

# Copy local development environment variables
cp .env.example .env

# Start only infrastructure with Docker
docker compose -f docker-compose.dev.yml up -d postgres redis

# Generate Prisma client and sync schema
pnpm db:generate
pnpm db:push

# Start all apps in parallel
pnpm dev
```

Run apps individually when needed:

```bash
pnpm dev:web
pnpm dev:api
pnpm dev:worker
```

Local source URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

## Setup: Docker Source

Run Postgres, Redis, web, api, and worker inside Docker with source-code volumes mounted for hot reload.

```bash
# Start and build all services
docker compose -f docker-compose.dev.yml up -d --build

# Start services without rebuilding images
docker compose -f docker-compose.dev.yml up -d

# Stream logs when needed
docker compose -f docker-compose.dev.yml logs -f web api worker

# Stop services
docker compose -f docker-compose.dev.yml down

# Stop services and remove data volumes
docker compose -f docker-compose.dev.yml down -v
```

Docker notes:

- Source files from `apps/*` and `packages/*` are mounted into containers for development.
- Environment variables for Docker services are defined in `docker-compose.dev.yml`.
- Use `up -d` when images were already built and you only want to restart services.
- Use `up -d --build` after changing Dockerfiles, dependencies, or other image-build inputs.
- Local `pnpm install` is not required when using the full Docker workflow.

**Services:**

| Service | Port | Description |
|---------|------|-------------|
| `postgres` | 5432 | PostgreSQL 16 |
| `redis` | 6379 | Redis 7 |
| `web` | 3000 | Next.js frontend |
| `api` | 4000 | NestJS API |
| `worker` | — | BullMQ background worker |

> **Note:** Volumes are mounted for hot-reload during development. Changes to source files are reflected immediately inside containers.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in parallel |
| `pnpm build` | Build all apps (Turbo pipeline) |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format all packages (Prettier) |
| `pnpm typecheck` | Type-check all packages |
| `pnpm test` | Run all tests |
| `pnpm test:e2e` | Run e2e suite (requires build first) |
| `pnpm db:migrate` | Run Prisma migrations (API) |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to DB (no migrations) |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio |

## Architecture

```
apps/
├── api/         NestJS REST API — /v1/ routes, Prisma ORM, BullMQ producers
├── web/         Next.js 15 frontend — src/app/ router
└── worker/      BullMQ consumer — background video render jobs

packages/
├── types/       Shared TypeScript interfaces
├── config/      Shared Zod validation schemas
└── tsconfig/    Shared TypeScript configurations
```

**Why a separate worker app?** BullMQ runs standalone, decoupled from the API process so job processing doesn't impact request latency.

## Environment Variables

Use `.env.example` for local development and rename it to `.env`. Docker Compose already sets the core development variables for containerized services.

Key variables:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string for BullMQ
- `AUTH_SECRET` — Secret used for authentication flows
