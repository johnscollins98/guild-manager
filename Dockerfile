FROM oven/bun:1.2 AS base

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
FROM base AS production_installer

WORKDIR /app

COPY package.json bun.lock ./
COPY ./server/package.json ./server/
COPY ./client/package.json ./client/

RUN bun install --production --frozen-lockfile

# Runner only requires node (not bun)
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/build ./server/build
COPY --from=production_installer /app/node_modules ./node_modules

CMD ["node", "./server/build/server.js"]