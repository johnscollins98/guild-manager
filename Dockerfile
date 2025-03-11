FROM imbios/bun-node:1.2-22-alpine AS base

# Build App
FROM base AS builder

WORKDIR /app

COPY package.json bun.lock ./
COPY ./client/package.json ./client/package.json
COPY ./server/package.json ./server/package.json

RUN bun install --frozen-lockfile

COPY ./server ./server
RUN bun run --cwd server build

COPY ./client ./client
RUN bun run --cwd client build

# Install Production Dependencies
FROM base AS runner

WORKDIR /app

COPY package.json bun.lock ./
COPY ./server/package.json ./server/
COPY ./client/package.json ./client/

RUN bun install --production --frozen-lockfile

COPY ./server/src/dataSource.ts ./server/src/dataSource.ts
COPY ./server/src/config ./server/src/config
COPY ./server/src/migrations ./server/src/migrations
COPY ./server/tsconfig.json ./server/tsconfig.json

COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/build ./server/build

CMD ["bun", "start"]