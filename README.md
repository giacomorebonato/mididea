# Mididea

A fun, embeddable collaborative music toy. Make beats with friends — no DAW, no cost, no complexity.

## Why Mididea?

Music should be fun and collaborative. Mididea is a lightweight step sequencer you can:
- **Embed on any website** — iframe it, embed it, share it
- **Create with friends in real-time** — jam together, build beats, share ideas
- **Export to your DAW** — MIDI out to keep working in your studio
- **Run for free** — Bun + SQLite on Fly.io runs for essentially $0/month

No tracks, no automation lanes, no mixer. Just a grid, a play button, and friends.

## Low-Cost, Low-Maintenance

Mididea is designed to be cheap and easy to run:
- **Single SQLite file** — no separate database server
- **Bun runtime** — one executable, minimal memory
- **Fly.io** — persistent volume for SQLite, machines that auto-stop between requests
- **~$0-5/month** — depending on traffic

This isn't enterprise software. It's a fun side project that happens to be deployable.

## What is Mididea?

Mididea is a playful, web-based step sequencer designed for jamming with friends. It's not a DAW — it's a toy that happens to export MIDI.

- **Simple** — 16 steps, 16 notes, one play button
- **Collaborative** — See friends' cursors and edits in real-time
- **Embeddable** — Drop it into any webpage via iframe
- **Free to run** — Bun + SQLite + Fly.io means cents/month hosting
- **DAW-friendly** — Export to MIDI and keep working in your real studio

### Core Features

- **Step Sequencer** — 16-step pattern-based composition with 16 notes
- **Per-Step Synthesis** — XY pad control for each step to shape sound (pitch, filter cutoff, etc.)
- **Real-Time Collaboration** — See collaborators' cursor positions and edits live
- **Synthesizer** — Built-in sounds using Tone.js (lead, pad, bass, drums)
- **MIDI Export** — Download your composition as a standard MIDI file
- **Gallery** — Save and browse shared compositions
- **Auth** — User accounts to own and manage your creations

## Tech Stack

- **Runtime:** Bun
- **Frontend:** React 19, TanStack Router, Tailwind CSS v4, shadcn/ui
- **Audio:** Tone.js (synthesizer), MIDI Writer
- **API:** tRPC v11 (end-to-end type safety)
- **Database:** Prisma with SQLite (via libSQL adapter)
- **Auth:** better-auth
- **Collaboration:** WebSocket-based real-time sync via tRPC subscriptions

## Getting Started

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Run database migrations
bun run db:migrate

# Start dev server with HMR
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  index.ts                    # Bun.serve() entry — tRPC + auth + HTML import
  index.html                  # HTML entry point
  frontend.tsx                # React entry — providers + router
  env.ts                      # Environment configuration
  db.ts                       # Prisma client singleton
  server/
    auth.ts                   # better-auth configuration
    trpc.ts                   # tRPC initialization
    context.ts                # tRPC context (prisma + session)
    collaboration-events.ts   # Real-time collaboration event handlers
    routers/
      _app.ts                 # Root router
      user.ts                 # User procedures
      post.ts                 # (Legacy) Post procedures
      composition.ts          # Composition CRUD + collaboration
      collaboration.ts        # Real-time collaboration sync
  client/
    auth.ts                   # better-auth React client
    trpc.ts                   # tRPC React hooks
    query-client.ts           # React Query + tRPC client config
    router.tsx               # TanStack Router (code-based)
    pages/
      root-layout.tsx         # Navigation + layout
      sequencer-page.tsx     # Main sequencer interface
      composition-page.tsx   # Composition detail/edit view
      creations-page.tsx     # Gallery of saved compositions
    sequencer/
      sequencer-page.tsx     # Main sequencer UI
      sequencer-grid.tsx     # 16x16 step grid
      sequencer-controls.tsx # Transport, BPM, sounds
      use-sequencer.ts       # Sequencer state logic
      use-collaboration.ts   # Real-time sync logic
      synth-engine.ts        # Tone.js synthesis
      audio-engine.ts        # Web Audio management
      synth-presets.ts       # Synth sound definitions
      scales.ts              # Musical scales
      midi-export.ts         # MIDI file generation
      types.ts               # TypeScript interfaces
      xy-pad.tsx            # Per-step XY control
      step-cell.tsx          # Individual step component
  components/ui/             # shadcn/ui components
prisma/
  schema.prisma              # Database schema (User, Composition, Collaborator, Like)
  seed.ts                    # Seed script
```

## Key Concepts

### Sequencer

The sequencer is a 16-step pattern with 16 notes (matching the MIDI note range C0-C1). Each step can be toggled on/off, and each step has its own XY pad data that controls synthesis parameters.

### XY Pad

Each step has an associated X (horizontal) and Y (vertical) value (0-1 range). These control:
- **X:** Typically filter cutoff or pitch
- **Y:** Typically resonance or volume

### Collaboration

When multiple users work on the same composition:
- Cursor positions are broadcast in real-time
- Step toggles and XY changes sync instantly
- Presence indicators show who's online

### MIDI Export

Export compositions as standard MIDI Type 0 files, compatible with any DAW or music software.

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server with HMR |
| `bun run build` | Build frontend |
| `bun run start` | Start production server |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:push` | Push schema to database |
| `bun run db:seed` | Seed database with sample data |
| `bun run db:studio` | Open Prisma Studio |
| `bun run typecheck` | Run TypeScript type checking |
| `bun test` | Run unit tests |
| `bunx playwright test` | Run E2E tests |

## Environment Variables

See `.env.example`:

- `DATABASE_URL` — SQLite connection string (default: `file:./dev.db`)
- `PORT` — Server port (default: `3000`)
- `BETTER_AUTH_SECRET` — **Required in production.** Auth encryption secret (min 32 chars)
- `BETTER_AUTH_URL` — **Required in production.** Public URL for auth callbacks

## Development

### Running Tests

```bash
# Unit tests
bun test

# E2E tests
bunx playwright test

# Both
bun test
```

### Code Quality

```bash
# Lint
bun run lint

# Auto-fix lint issues
bun run lint:fix

# Format
bun run format

# Type check
bun run typecheck
```

## License

MIT