# Codebase Clarity Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve developer navigation by removing dead code, consolidating component directories, extracting sequencer audio files, and colocating tests.

**Architecture:** Four independent phases, each a single commit. No runtime behavior changes. File moves + import rewrites + dead code deletion.

**Tech Stack:** Bun, Prisma (SQLite), React, tRPC, Biome (linting)

---

### Task 1: Delete Post router and its tests

**Files:**
- Delete: `src/server/routers/post.ts`
- Delete: `src/server/routers/__tests__/post.test.ts`
- Delete: `src/server/__tests__/post.test.ts`
- Modify: `src/server/routers/_app.ts`

- [ ] **Step 1: Remove postRouter from app router**

Edit `src/server/routers/_app.ts` to remove the post import and registration:

```ts
import { router } from '../trpc'
import { collaborationRouter } from './collaboration'
import { compositionRouter } from './composition'
import { userRouter } from './user'

export const appRouter = router({
  user: userRouter,
  composition: compositionRouter,
  collaboration: collaborationRouter,
})

export type AppRouter = typeof appRouter
```

- [ ] **Step 2: Delete Post router and test files**

```bash
rm src/server/routers/post.ts
rm src/server/routers/__tests__/post.test.ts
rm src/server/__tests__/post.test.ts
```

- [ ] **Step 3: Run tests to verify nothing broke**

Run: `bun test src/server/`
Expected: All remaining server tests pass. No references to post router.

---

### Task 2: Remove Post model from Prisma schema and update user router

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/server/routers/user.ts`
- Modify: `src/server/__tests__/user.test.ts`
- Modify: `src/server/routers/__tests__/user.test.ts`

- [ ] **Step 1: Remove Post model from schema**

Edit `prisma/schema.prisma` to remove the entire `model Post { ... }` block (lines 64-73) and remove the `posts Post[]` line from the User model (line 16).

The User model should become:

```prisma
model User {
  id             String         @id @default(cuid())
  email          String         @unique
  emailVerified  Boolean        @default(false)
  name           String?
  image          String?
  compositions   Composition[]
  likes          Like[]
  collaborations Collaborator[]
  sessions       Session[]
  accounts       Account[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}
```

- [ ] **Step 2: Update user router to remove Post includes**

Edit `src/server/routers/user.ts`:

```ts
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

export const userRouter = router({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany()
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findUniqueOrThrow({
        where: { id: input.id },
      })
    }),

  create: publicProcedure
    .input(z.object({ email: z.email(), name: z.string().optional() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.create({ data: input })
    }),
})
```

- [ ] **Step 3: Update integration test to remove Post assertions**

Edit `src/server/__tests__/user.test.ts` — remove the `user.posts` assertion in the "byId returns the user with posts" test:

```ts
  test('byId returns the user', async () => {
    const caller = createCaller()
    const users = await caller.user.list()
    const user = await caller.user.byId({ id: users[0]!.id })
    expect(user.email).toBe('test@example.com')
  })
```

- [ ] **Step 4: Update unit test to remove Post references**

Edit `src/server/routers/__tests__/user.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'
import { userRouter } from '../user'

function caller(ctx: unknown) {
  return (
    userRouter as unknown as { createCaller: (c: unknown) => unknown }
  ).createCaller(ctx) as ReturnType<typeof userRouter.createCaller>
}

describe('userRouter', () => {
  test('list returns users', async () => {
    const users: any[] = [
      { id: 'u1', name: 'Alice' },
    ]
    const c = caller({
      prisma: { user: { findMany: async () => users as any } },
      session: null,
    })
    const result = await c.list()
    expect(result).toEqual(users)
  })

  test('byId returns user', async () => {
    const user: any = { id: 'u1', name: 'Alice' }
    const c = caller({
      prisma: { user: { findUniqueOrThrow: async () => user as any } },
      session: null,
    })
    const result = await c.byId({ id: 'u1' })
    expect(result.id).toBe('u1')
  })

  test('byId throws when not found', async () => {
    const c = caller({
      prisma: {
        user: {
          findUniqueOrThrow: async () => {
            throw new Error('Not found')
          },
        },
      },
      session: null,
    })
    expect(c.byId({ id: 'nope' })).rejects.toThrow()
  })

  test('create a new user', async () => {
    const created: any = { id: 'u2', email: 'new@test.com', name: 'New User' }
    const c = caller({
      prisma: { user: { create: async () => created } as any },
      session: null,
    })
    const result = await c.create({ email: 'new@test.com', name: 'New User' })
    expect(result.id).toBe('u2')
  })
})
```

- [ ] **Step 5: Generate Prisma migration**

```bash
bunx prisma migrate dev --name remove-post-model
```

Expected: Migration created, Prisma client regenerated.

- [ ] **Step 6: Run all tests**

```bash
bun test src/
```

Expected: All tests pass. No Post references remain.

---

### Task 3: Delete unused xy-pad component

**Files:**
- Delete: `src/components/xy-pad.tsx`
- Delete: `src/components/xy-pad.css`

- [ ] **Step 1: Delete the unused files**

```bash
rm src/components/xy-pad.tsx
rm src/components/xy-pad.css
```

- [ ] **Step 2: Verify no imports reference these files**

```bash
bunx biome check .
```

Expected: No errors about missing imports. (We already verified no file imports from `src/components/xy-pad`.)

- [ ] **Step 3: Commit Phase 1**

```bash
git add -A
git commit -m "refactor: remove dead code (Post model, unused xy-pad)"
```

---

### Task 4: Move client components to shared components directory

**Files:**
- Move: `src/client/components/auth-button.tsx` -> `src/components/auth-button.tsx`
- Move: `src/client/components/collaborator-dialog.tsx` -> `src/components/collaborator-dialog.tsx`
- Move: `src/client/components/collaborator-presence.tsx` -> `src/components/collaborator-presence.tsx`
- Move: `src/client/components/save-composition-dialog.tsx` -> `src/components/save-composition-dialog.tsx`
- Modify: `src/client/pages/composition-page.tsx` (update imports)
- Modify: `src/client/pages/root-layout.tsx` (update imports)
- Modify: `src/client/sequencer/sequencer-page.tsx` (update imports)

- [ ] **Step 1: Move the four component files**

```bash
mv src/client/components/auth-button.tsx src/components/auth-button.tsx
mv src/client/components/collaborator-dialog.tsx src/components/collaborator-dialog.tsx
mv src/client/components/collaborator-presence.tsx src/components/collaborator-presence.tsx
mv src/client/components/save-composition-dialog.tsx src/components/save-composition-dialog.tsx
rmdir src/client/components
```

- [ ] **Step 2: Update imports in moved files**

The moved files import from `../auth` and `../trpc` (relative to their old location). Update these to use the `@/` alias or correct relative paths from their new location.

**`src/components/auth-button.tsx`** — change:
- `'../auth'` -> `'@/client/auth'`

**`src/components/collaborator-dialog.tsx`** — change:
- `'../trpc'` -> `'@/client/trpc'`

**`src/components/collaborator-presence.tsx`** — change:
- `'../trpc'` -> `'@/client/trpc'`

**`src/components/save-composition-dialog.tsx`** — change:
- `'../auth'` -> `'@/client/auth'`
- `'../sequencer/types'` -> `'@/client/sequencer/types'`
- `'../trpc'` -> `'@/client/trpc'`

- [ ] **Step 3: Update imports in consuming files**

**`src/client/pages/composition-page.tsx`** — change:
- `'../components/collaborator-dialog'` -> `'@/components/collaborator-dialog'`
- `'../components/collaborator-presence'` -> `'@/components/collaborator-presence'`

**`src/client/pages/root-layout.tsx`** — change:
- `'../components/auth-button'` -> `'@/components/auth-button'`

**`src/client/sequencer/sequencer-page.tsx`** — change:
- `'../components/save-composition-dialog'` -> `'@/components/save-composition-dialog'`

- [ ] **Step 4: Verify lint and typecheck**

```bash
bunx biome check . && bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Run tests**

```bash
bun test src/
```

Expected: All tests pass.

- [ ] **Step 6: Commit Phase 2**

```bash
git add -A
git commit -m "refactor: consolidate component directories into src/components/"
```

---

### Task 5: Extract sequencer audio files into sub-directory

**Files:**
- Move: `src/client/sequencer/audio-engine.ts` -> `src/client/sequencer/audio/audio-engine.ts`
- Move: `src/client/sequencer/synth-engine.ts` -> `src/client/sequencer/audio/synth-engine.ts`
- Move: `src/client/sequencer/drum-sounds.ts` -> `src/client/sequencer/audio/drum-sounds.ts`
- Move: `src/client/sequencer/synth-presets.ts` -> `src/client/sequencer/audio/synth-presets.ts`
- Move: `src/client/sequencer/scales.ts` -> `src/client/sequencer/audio/scales.ts`
- Move: `src/client/sequencer/audio-engine.test.ts` -> `src/client/sequencer/audio/audio-engine.test.ts`
- Move: `src/client/sequencer/synth-engine.test.ts` -> `src/client/sequencer/audio/synth-engine.test.ts`
- Modify: imports in 7 consuming files

- [ ] **Step 1: Create audio directory and move files**

```bash
mkdir -p src/client/sequencer/audio
mv src/client/sequencer/audio-engine.ts src/client/sequencer/audio/audio-engine.ts
mv src/client/sequencer/synth-engine.ts src/client/sequencer/audio/synth-engine.ts
mv src/client/sequencer/drum-sounds.ts src/client/sequencer/audio/drum-sounds.ts
mv src/client/sequencer/synth-presets.ts src/client/sequencer/audio/synth-presets.ts
mv src/client/sequencer/scales.ts src/client/sequencer/audio/scales.ts
mv src/client/sequencer/audio-engine.test.ts src/client/sequencer/audio/audio-engine.test.ts
mv src/client/sequencer/synth-engine.test.ts src/client/sequencer/audio/synth-engine.test.ts
```

- [ ] **Step 2: Update internal imports within moved audio files**

**`src/client/sequencer/audio/audio-engine.ts`** — change:
- `'./drum-sounds'` -> stays `'./drum-sounds'` (same directory now)
- `'./synth-engine'` -> stays `'./synth-engine'` (same directory now)
- `'./types'` -> `'../types'`

**`src/client/sequencer/audio/synth-engine.ts`** — change:
- `'./synth-presets'` -> stays `'./synth-presets'` (same directory now)
- `'./types'` -> `'../types'`

- [ ] **Step 3: Update imports in consuming files outside audio/**

**`src/client/sequencer/sequencer-page.tsx`** — change:
- `'./audio-engine'` -> `'./audio/audio-engine'`

**`src/client/pages/composition-page.tsx`** — change:
- `'../sequencer/audio-engine'` -> `'../sequencer/audio/audio-engine'`

**`src/client/sequencer/sequencer-grid.tsx`** — change:
- `'./synth-presets'` -> `'./audio/synth-presets'`

**`src/client/sequencer/xy-pad.tsx`** — change:
- `'./scales'` -> `'./audio/scales'`
- `'./synth-presets'` -> `'./audio/synth-presets'`

**`src/client/sequencer/sequencer-controls.tsx`** — change:
- `'./scales'` -> `'./audio/scales'`

**`src/client/sequencer/synth-step-cell.tsx`** — change:
- `'./scales'` -> `'./audio/scales'`

**`src/client/sequencer/midi-export.ts`** — change:
- `'./scales'` -> `'./audio/scales'`

- [ ] **Step 4: Verify lint and typecheck**

```bash
bunx biome check . && bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Run tests**

```bash
bun test src/
```

Expected: All tests pass (including audio-engine and synth-engine tests from their new location).

- [ ] **Step 6: Commit Phase 3**

```bash
git add -A
git commit -m "refactor: extract sequencer audio files into audio/ sub-directory"
```

---

### Task 6: Colocate test files with source files

**Files:**
- Move: `src/server/__tests__/health.test.ts` -> `src/server/health.test.ts`
- Move: `src/server/__tests__/user.test.ts` -> `src/server/routers/user.integration.test.ts`
- Move: `src/server/__tests__/setup.ts` -> `src/server/test-setup.ts`
- Move: `src/server/routers/__tests__/composition.test.ts` -> `src/server/routers/composition.test.ts`
- Move: `src/server/routers/__tests__/user.test.ts` -> `src/server/routers/user.test.ts`
- Move: `src/client/sequencer/__tests__/use-sequencer.test.ts` -> `src/client/sequencer/use-sequencer.test.ts`
- Move: `src/__tests__/env.test.ts` -> `src/env.test.ts`

- [ ] **Step 1: Move server test setup file**

```bash
mv src/server/__tests__/setup.ts src/server/test-setup.ts
```

- [ ] **Step 2: Move server test files**

```bash
mv src/server/__tests__/health.test.ts src/server/health.test.ts
mv src/server/__tests__/user.test.ts src/server/routers/user.integration.test.ts
```

- [ ] **Step 3: Update import in user integration test**

**`src/server/routers/user.integration.test.ts`** — change:
- `'../routers/_app'` -> `'./_app'`
- `'./setup'` -> `'../test-setup'`

- [ ] **Step 4: Move router test files**

```bash
mv src/server/routers/__tests__/composition.test.ts src/server/routers/composition.test.ts
mv src/server/routers/__tests__/user.test.ts src/server/routers/user.test.ts
```

The router `__tests__` files use `'../composition'` and `'../user'` imports — these become `'./composition'` and `'./user'`.

**`src/server/routers/composition.test.ts`** — change:
- `'../composition'` -> `'./composition'`

**`src/server/routers/user.test.ts`** — change:
- `'../user'` -> `'./user'`

- [ ] **Step 5: Move client test files**

```bash
mv src/client/sequencer/__tests__/use-sequencer.test.ts src/client/sequencer/use-sequencer.test.ts
mv src/__tests__/env.test.ts src/env.test.ts
```

**`src/client/sequencer/use-sequencer.test.ts`** — change:
- `'../types'` -> `'./types'`
- `'../use-sequencer'` -> `'./use-sequencer'`

**`src/env.test.ts`** — change:
- `'../env'` -> `'./env'`

- [ ] **Step 6: Remove empty __tests__ directories**

```bash
rmdir src/server/__tests__
rmdir src/server/routers/__tests__
rmdir src/client/sequencer/__tests__
rmdir src/__tests__
```

- [ ] **Step 7: Verify lint and typecheck**

```bash
bunx biome check . && bunx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 8: Run all tests**

```bash
bun test src/
```

Expected: All tests pass from their new locations.

- [ ] **Step 9: Commit Phase 4**

```bash
git add -A
git commit -m "refactor: colocate test files with source files"
```
