# Mino Starter

Full-stack starter kit built with Bun, React, tRPC, TanStack Router, Prisma, and Tailwind CSS. Designed for low-cost deployment on Fly.io with SQLite.

## Tech Stack

- **Runtime:** Bun
- **Frontend:** React 19, TanStack Router, Tailwind CSS v4, shadcn/ui
- **API:** tRPC v11 (end-to-end type safety)
- **Database:** Prisma with SQLite (via libSQL adapter)
- **Auth:** better-auth (email/password, extensible)
- **Deployment:** Fly.io with persistent SQLite volume

## Getting Started

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Run database migrations
bun run db:migrate

# Seed sample data
bun run db:seed

# Start dev server with HMR
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server with HMR |
| `bun run build` | Build frontend (optional, for inspection) |
| `bun run start` | Start production server |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:push` | Push schema to database |
| `bun run db:seed` | Seed database with sample data |
| `bun run db:studio` | Open Prisma Studio |
| `bun run typecheck` | Run TypeScript type checking |

## Project Structure

```
src/
  index.ts              # Bun.serve() entry — tRPC + auth + HTML import
  index.html            # HTML entry point
  frontend.tsx          # React entry — providers + router
  env.ts                # Environment configuration
  db.ts                 # Prisma client singleton
  server/
    auth.ts             # better-auth configuration
    trpc.ts             # tRPC initialization
    context.ts          # tRPC context (prisma + session)
    routers/
      _app.ts           # Root router
      user.ts           # User procedures
      post.ts           # Post procedures
  client/
    auth.ts             # better-auth React client
    trpc.ts             # tRPC React hooks
    query-client.ts     # React Query + tRPC client config
    router.tsx          # TanStack Router (code-based)
    pages/
      RootLayout.tsx    # Navigation + layout
      HomePage.tsx      # Landing page
      UsersPage.tsx     # Users list (tRPC demo)
      AboutPage.tsx     # Stack info
  components/ui/        # shadcn/ui components
prisma/
  schema.prisma         # Database schema
  seed.ts               # Seed script
```

## Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app (first time)
fly launch

# Create persistent volume for SQLite
fly volumes create data --region ams --size 1

# Set secrets
fly secrets set BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
fly secrets set BETTER_AUTH_URL="https://mino-starter.fly.dev"

# Deploy
fly deploy
```

The app uses `min_machines_running = 0` and `auto_stop_machines = "stop"` to minimize costs. Machines start automatically on incoming requests.

## Environment Variables

See `.env.example` for available variables:

- `DATABASE_URL` — SQLite connection string (default: `file:./dev.db`)
- `PORT` — Server port (default: `3000`)
- `BETTER_AUTH_SECRET` — **Required in production.** Auth encryption secret (min 32 chars, generate with `openssl rand -base64 32`)
- `BETTER_AUTH_URL` — **Required in production.** Public URL for auth callbacks (default: `http://localhost:3000`)
