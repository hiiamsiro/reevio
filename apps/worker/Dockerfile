FROM node:22-alpine

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages ./packages/
COPY apps/worker ./apps/worker/

RUN pnpm install --no-frozen-lockfile

CMD ["pnpm", "-F", "worker", "dev"]
