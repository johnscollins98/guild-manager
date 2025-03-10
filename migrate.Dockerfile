FROM imbios/bun-node:1.2-22-alpine AS base

FROM base AS migrator

WORKDIR /app

COPY ./server/package.json bun.lock ./
COPY package.json bun.lock ./
COPY ./client/package.json ./client/package.json
COPY ./server/package.json ./server/package.json
RUN bun install --production --frozen-lockfile

COPY ./server/src/dataSource.ts ./server/src/dataSource.ts
COPY ./server/src/config ./server/src/config
COPY ./server/src/migrations ./server/src/migrations
COPY ./server/tsconfig.json ./server/tsconfig.json

CMD ["bun", "db:migration:run"]