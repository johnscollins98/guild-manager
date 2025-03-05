FROM imbios/bun-node:1.2.2-22-alpine

WORKDIR /app

COPY package.json bun.lock ./
COPY ./client/package.json ./client/package.json
COPY ./server/package.json ./server/package.json

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

CMD ["bun", "start"]