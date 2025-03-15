FROM oven/bun:1.2.2-alpine AS bunbase

# Build App
FROM bunbase AS builder

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
FROM bunbase AS installer

WORKDIR /app

COPY package.json bun.lock ./
COPY ./server/package.json ./server/
COPY ./client/package.json ./client/

RUN bun install --production --frozen-lockfile

FROM node:22.14.0-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1002 nodejs
RUN adduser --system --uid 1002 guildmanager
USER guildmanager

COPY ./server/package.json ./server/

COPY --from=installer /app/node_modules ./node_modules
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/build ./server/build

WORKDIR /app/server

CMD ["npm", "start"]