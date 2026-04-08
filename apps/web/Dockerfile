FROM node:22-alpine

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages ./packages/
COPY apps/web ./apps/web/

RUN pnpm install --no-frozen-lockfile

EXPOSE 3000

CMD ["pnpm", "-F", "web", "dev"]
