FROM oven/bun:1 AS base
WORKDIR /app

# Install all dependencies for build + prisma generate
FROM base AS build-deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Generate Prisma client
FROM build-deps AS generate
COPY prisma ./prisma
COPY prisma.config.ts ./
ENV DATABASE_URL="file:/data/prod.db"
RUN bunx prisma generate

# Build the full-stack app
FROM build-deps AS build
COPY --from=generate /app/generated ./generated
COPY tsconfig.json ./
COPY bunfig.toml ./
COPY src ./src
COPY styles ./styles
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY package.json ./
RUN bunx @tailwindcss/cli -i ./src/index.css -o ./src/compiled.css --minify
RUN sed -i "s|import './index.css'|import './compiled.css'|" ./src/frontend.tsx
RUN bun build --target=bun --production --outdir=dist src/index.ts

# Install production dependencies only
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Production image
FROM base AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=generate /app/generated ./generated
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY package.json ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "bunx prisma migrate deploy && cd dist && bun index.js"]
