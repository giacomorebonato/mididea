FROM oven/bun:1 AS base
WORKDIR /app

# Install production dependencies only
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Install all dependencies for prisma generate
FROM base AS build-deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Generate Prisma client
FROM build-deps AS generate
COPY prisma ./prisma
COPY prisma.config.ts ./
ENV DATABASE_URL="file:/data/prod.db"
RUN bunx prisma generate

# Production image
FROM base AS production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=generate /app/generated ./generated
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
COPY styles ./styles
COPY bunfig.toml ./
COPY package.json ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun src/index.ts"]
