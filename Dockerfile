FROM node:22-alpine AS base

# Build App
FROM base AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY ./client/package.json ./client/package.json
COPY ./server/package.json ./server/package.json

RUN npm install --frozen-lockfile

COPY ./server ./server
RUN npm run --cwd server build

COPY ./client ./client
RUN npm run --cwd client build

# Install Production Dependencies
FROM base AS runner

WORKDIR /app

COPY package.json package-lock.json ./
COPY ./server/package.json ./server/
COPY ./client/package.json ./client/

RUN npm install --omit=dev --frozen-lockfile

RUN addgroup --system --gid 1002 nodejs
RUN adduser --system --uid 1002 guildmanager
USER guildmanager

COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/build ./server/build

WORKDIR /app/server

CMD ["npm", "start"]