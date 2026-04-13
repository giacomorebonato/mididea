# Codebase Clarity Refactor

## Goal

Improve developer experience by eliminating ambiguity about where code lives and where new code should go. The refactor is phased so each step leaves the codebase in a working state.

## Motivation

The primary pain point is navigating the codebase: duplicate files with unclear canonical versions, tests scattered across multiple patterns, and component directories split across two locations. This slows down feature work because every new file requires a judgment call about placement.

## Phase 1: Remove Dead Code

Delete unused artifacts left over from the starter template.

**Files to delete:**
- `src/server/routers/post.ts`
- `src/server/routers/__tests__/post.test.ts`
- `src/server/__tests__/post.test.ts`
- `src/components/xy-pad.tsx` (unused — no imports reference it)
- `src/components/xy-pad.css`

**Files to modify:**
- `src/server/routers/_app.ts` — remove `postRouter` import and registration
- `prisma/schema.prisma` — remove the `Post` model

**Follow-up:** Generate a Prisma migration to drop the `Post` table.

## Phase 2: Consolidate Component Directories

Merge `src/client/components/` into `src/components/` so there is one component directory.

**Before:**
```
src/components/
  ui/            (shadcn primitives)
  error-boundary.tsx
  xy-pad.tsx     (deleted in Phase 1)
  xy-pad.css     (deleted in Phase 1)
src/client/components/
  auth-button.tsx
  collaborator-dialog.tsx
  collaborator-presence.tsx
  save-composition-dialog.tsx
```

**After:**
```
src/components/
  ui/            (shadcn primitives — unchanged)
  error-boundary.tsx
  auth-button.tsx
  collaborator-dialog.tsx
  collaborator-presence.tsx
  save-composition-dialog.tsx
```

**Convention:**
- `src/components/ui/` — generic design-system primitives (shadcn)
- `src/components/` — app-level components

**Import updates:** Moved files switch from relative imports to `@/components/*` paths, consistent with how ui/ primitives are already imported.

After this phase, `src/client/` contains only: `pages/`, `sequencer/`, and client wiring files (`router.tsx`, `trpc.ts`, `auth.ts`, `query-client.ts`).

## Phase 3: Split Sequencer Audio

Extract the audio concern from `src/client/sequencer/` into a sub-directory.

**Before:** 16 files in a flat directory mixing audio, state, UI, and export.

**After:**
```
src/client/sequencer/
  audio/
    audio-engine.ts
    synth-engine.ts
    drum-sounds.ts
    synth-presets.ts
    scales.ts
  sequencer-page.tsx
  sequencer-grid.tsx
  sequencer-controls.tsx
  step-cell.tsx
  synth-step-cell.tsx
  xy-pad.tsx
  landscape-prompt.tsx
  orientation-context.tsx
  use-sequencer.ts
  use-collaboration.ts
  types.ts
  midi-export.ts
```

**Rationale:** Only audio is extracted because it is the clearest independent concern (5 files, no JSX, no React dependencies). State hooks and UI components are tightly coupled and splitting them would create unnecessary indirection. MIDI export is a single file and does not need its own directory.

## Phase 4: Colocate Tests

Adopt a single test pattern: test files live next to the file they test.

**Before:** Four patterns — `__tests__/` sibling directories, `__tests__/` inside subdirectories, and inline sibling files.

**After:** Inline sibling files only.

```
src/server/routers/composition.ts
src/server/routers/composition.test.ts

src/client/sequencer/use-sequencer.ts
src/client/sequencer/use-sequencer.test.ts
```

**Specific moves:**
- `src/server/__tests__/health.test.ts` -> `src/server/health.test.ts`
- `src/server/__tests__/user.test.ts` -> `src/server/routers/user.integration.test.ts` (integration test — uses real DB via createTestDb)
- `src/server/__tests__/post.test.ts` -> deleted (Post code removed in Phase 1)
- `src/server/__tests__/setup.ts` -> `src/server/test-setup.ts`
- `src/server/routers/__tests__/composition.test.ts` -> `src/server/routers/composition.test.ts`
- `src/server/routers/__tests__/user.test.ts` -> `src/server/routers/user.test.ts` (unit test — mocks prisma)
- `src/server/routers/__tests__/post.test.ts` -> deleted (Post code removed in Phase 1)
- `src/client/sequencer/__tests__/use-sequencer.test.ts` -> `src/client/sequencer/use-sequencer.test.ts`
- `src/__tests__/env.test.ts` -> `src/env.test.ts`

**Phase 1 interaction:** Both user test files reference `user.posts` (a Post model relation). After removing the Post model in Phase 1, these tests must be updated to remove Post-related assertions. This is handled during Phase 1, not Phase 4.

Delete all `__tests__/` directories after moves are complete.

**Why this pattern:** When you open a file, you immediately see whether it has a test. The inline pattern is already used by `audio-engine.test.ts` and `synth-engine.test.ts` — this makes it consistent.

Note: Test files that move into `sequencer/audio/` after Phase 3:
- `src/client/sequencer/audio-engine.test.ts` -> `src/client/sequencer/audio/audio-engine.test.ts`
- `src/client/sequencer/synth-engine.test.ts` -> `src/client/sequencer/audio/synth-engine.test.ts`

## Scope Boundaries

This refactor does NOT include:
- Adding new tests or improving test coverage
- Changing any runtime behavior
- Error handling improvements
- Refactoring code within individual files
- Changing the Prisma migration history

Each phase is one commit/PR. All phases are independent — stopping after any phase leaves the codebase in a valid state.
