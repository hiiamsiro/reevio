## Project: reevio

TypeScript monorepo with three apps: NestJS API, Next.js web frontend, and a BullMQ background worker.

## Commands

```bash
# Build (all apps)
pnpm run build           # runs turbo pipeline: ^build dependencies, outputs dist/.next/.turbo

# Test
pnpm test                # all packages
pnpm test:e2e            # e2e suite (requires build first)

# Lint & Format
pnpm run lint            # all packages
pnpm run format          # all packages (Prettier)
pnpm run typecheck       # all packages

# Dev
pnpm run dev             # all apps in parallel (Turbo persistent)
pnpm run dev:web         # web only
pnpm run dev:api         # api only
pnpm run dev:worker      # worker only

# Database (API only)
pnpm run db:migrate      # Prisma migrate dev
pnpm run db:generate     # Prisma generate
pnpm run db:push         # Prisma db push (no migrations)
pnpm run db:seed         # seed the database
pnpm run db:studio       # open Prisma Studio
```

## Architecture

Turbo monorepo with workspace packages. Each app is independent and has its own build/test/lint pipeline.

- `apps/api/` — NestJS REST API (`/v1/`), Prisma ORM, BullMQ producers
- `apps/web/` — Next.js 15 frontend (`src/app/` router)
- `apps/worker/` — BullMQ consumer worker (background jobs)
- `packages/` — shared config, tsconfig, and types

- Auth: JWT via `@nestjs/jwt` + Passport. Tokens short-lived.
- DB: Prisma with PostgreSQL. Migrations go in `apps/api/prisma/migrations/`.
- Queue: BullMQ via Redis. Workers register queues in `apps/worker/src/`.

## Key Decisions

**Why separate worker app?** BullMQ runs standalone — decoupled from the API process so job processing doesn't affect request latency.

## Workflow

- Run `pnpm run typecheck` after making a series of code changes
- Prefer fixing the root cause over adding workarounds
- When unsure about approach, use plan mode before coding

## Don'ts

- Don't modify generated files (`*.gen.ts`, `*.generated.*`, `node_modules/`)
- Don't run `pnpm install` or change lockfiles — use the workspace resolver
- The `packages/` directory is shared; changes there affect all apps
