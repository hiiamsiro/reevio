FROM node:22-alpine

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages/
COPY apps/api/prisma ./apps/api/prisma/
COPY apps/worker ./apps/worker/

RUN pnpm install --frozen-lockfile

CMD ["pnpm", "-F", "worker", "dev"]
