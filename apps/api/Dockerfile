FROM node:22-alpine

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages/
COPY apps/api ./apps/api/

RUN pnpm install --frozen-lockfile

EXPOSE 4000

CMD ["pnpm", "-F", "api", "dev"]
