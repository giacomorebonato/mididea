# TypeScript Kebab-Case Filename Convention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename all TypeScript files (.ts and .tsx) to lowercase kebab-case, update all imports, and add Biome lint rule to enforce for future files.

**Architecture:** This is a file renaming task with import updates. Each file must be renamed using `git mv` to preserve git history, then all import statements in the codebase must be updated to reference the new filenames.

**Tech Stack:** Biome (linting), git (version control), bun test (testing)

---

## File Inventory

### Files Already in Kebab-Case (No Change Needed)

These files are already correctly named:

```
src/client/auth.ts
src/client/query-client.ts
src/client/trpc.ts
src/client/sequencer/scales.ts
src/client/sequencer/types.ts
src/client/sequencer/midi-export.ts
src/client/sequencer/audio-engine.ts
src/client/sequencer/drum-sounds.ts
src/client/sequencer/synth-presets.ts
src/client/sequencer/use-sequencer.ts
src/client/sequencer/use-collaboration.ts
src/server/config.ts
src/server/context.ts
src/server/auth.ts
src/server/trpc.ts
src/server/collaboration-events.ts
src/db.ts
src/env.ts
src/index.ts
src/lib/utils.ts
```

### Files to Rename (PascalCase → kebab-case)

```
src/components/XyPad.tsx                    →  src/components/xy-pad.tsx
src/components/error-boundary.tsx              →  src/components/error-boundary.tsx
src/client/router.tsx                       →  src/client/router.tsx
src/client/pages/root-layout.tsx             →  src/client/pages/root-layout.tsx
src/client/pages/composition-page.tsx        →  src/client/pages/composition-page.tsx
src/client/pages/creations-page.tsx           →  src/client/pages/creations-page.tsx
src/client/components/auth-button.tsx        →  src/client/components/auth-button.tsx
src/client/components/collaborator-dialog.tsx → src/client/components/collaborator-dialog.tsx
src/client/components/collaborator-presence.tsx → src/client/components/collaborator-presence.tsx
src/client/components/save-composition-dialog.tsx → src/client/components/save-composition-dialog.tsx
src/client/sequencer/sequencer-page.tsx          →  src/client/sequencer/sequencer-page.tsx
src/client/sequencer/sequencer-grid.tsx         →  src/client/sequencer/sequencer-grid.tsx
src/client/sequencer/sequencer-controls.tsx    →  src/client/sequencer/sequencer-controls.tsx
src/client/sequencer/orientation-context.tsx    →  src/client/sequencer/orientation-context.tsx
src/client/sequencer/landscape-prompt.tsx      →  src/client/sequencer/landscape-prompt.tsx
src/client/sequencer/synth-engine.ts            →  src/client/sequencer/synth-engine.ts
src/client/sequencer/synth-step-cell.tsx        →  src/client/sequencer/synth-step-cell.tsx
src/client/sequencer/step-cell.tsx              →  src/client/sequencer/step-cell.tsx
src/client/sequencer/xy-pad.tsx                →  src/client/sequencer/xy-pad.tsx
src/frontend.tsx                               →  src/frontend.tsx
src/components/ui/button.tsx                   →  src/components/ui/button.tsx
src/components/ui/input.tsx                    →  src/components/ui/input.tsx
src/components/ui/label.tsx                    →  src/components/ui/label.tsx
src/components/ui/card.tsx                      →  src/components/ui/card.tsx
src/components/ui/select.tsx                   →  src/components/ui/select.tsx
src/components/ui/textarea.tsx                 →  src/components/ui/textarea.tsx
```

### Excluded Files (Test Conventions)

```
e2e/**/*.spec.ts      → Keep as-is (Playwright convention)
**/*.test.ts           → Keep suffix .test.ts (test convention)
**/*.test.tsx         → Keep suffix .test.tsx (test convention)
```

---

## Task 1: Add Biome Kebab-Case Rule

**Files:**
- Modify: `biome.json`

- [ ] **Step 1: Add useFilenamingConvention rule to biome.json**

Add the linter rule under `linter.rules.style`:

```json
"style": {
  "noNonNullAssertion": "off",
  "useFilenamingConvention": {
    "options": {
      "filenameCases": ["kebab-case"]
    }
  }
}
```

Run: `biome check src/`
Expected: Should show lint errors for files not in kebab-case

- [ ] **Step 2: Commit**

```bash
git add biome.json
git commit -m "chore: add kebab-case filename convention rule"
```

---

## Task 2: Rename Files and Update Imports

**Strategy:** Rename one file at a time using `git mv`, then find and update all imports that reference the old filename.

### Batch Rename Process

For EACH file in the inventory:

- [ ] **Step 1: Rename file using git mv**

```bash
git mv src/path/OldFileName.tsx src/path/new-file-name.tsx
```

- [ ] **Step 2: Find all imports referencing the old file**

```bash
grep -r "OldFileName" src/ --include="*.ts" --include="*.tsx"
```

- [ ] **Step 3: Update each import statement**

Replace all occurrences of the old filename in imports with the new kebab-case filename.

Example:
```typescript
// Old
import { XyPad } from "../components/XyPad";

// New
import { XyPad } from "../components/xy-pad";
```

- [ ] **Step 4: Run tests to verify**

```bash
bun run test
```

Expected: All tests pass

- [ ] **Step 5: Commit after each file**

```bash
git add -A
git commit -m "refactor: rename OldFileName.tsx to new-file-name.tsx"
```

---

### Task 2a: Rename src/components/XyPad.tsx

- [ ] git mv src/components/XyPad.tsx src/components/xy-pad.tsx
- [ ] Update imports in: src/client/sequencer/xy-pad.tsx
- [ ] Run tests: bun run test
- [ ] Commit

### Task 2b: Rename src/components/error-boundary.tsx

- [ ] git mv src/components/error-boundary.tsx src/components/error-boundary.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2c: Rename src/client/router.tsx

- [ ] git mv src/client/router.tsx src/client/router.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2d: Rename src/client/pages/root-layout.tsx

- [ ] git mv src/client/pages/root-layout.tsx src/client/pages/root-layout.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2e: Rename src/client/pages/composition-page.tsx

- [ ] git mv src/client/pages/composition-page.tsx src/client/pages/composition-page.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2f: Rename src/client/pages/creations-page.tsx

- [ ] git mv src/client/pages/creations-page.tsx src/client/pages/creations-page.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2g: Rename src/client/components/auth-button.tsx

- [ ] git mv src/client/components/auth-button.tsx src/client/components/auth-button.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2h: Rename src/client/components/collaborator-dialog.tsx

- [ ] git mv src/client/components/collaborator-dialog.tsx src/client/components/collaborator-dialog.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2i: Rename src/client/components/collaborator-presence.tsx

- [ ] git mv src/client/components/collaborator-presence.tsx src/client/components/collaborator-presence.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2j: Rename src/client/components/save-composition-dialog.tsx

- [ ] git mv src/client/components/save-composition-dialog.tsx src/client/components/save-composition-dialog.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2k: Rename src/client/sequencer/sequencer-page.tsx

- [ ] git mv src/client/sequencer/sequencer-page.tsx src/client/sequencer/sequencer-page.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2l: Rename src/client/sequencer/sequencer-grid.tsx

- [ ] git mv src/client/sequencer/sequencer-grid.tsx src/client/sequencer/sequencer-grid.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2m: Rename src/client/sequencer/sequencer-controls.tsx

- [ ] git mv src/client/sequencer/sequencer-controls.tsx src/client/sequencer/sequencer-controls.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2n: Rename src/client/sequencer/orientation-context.tsx

- [ ] git mv src/client/sequencer/orientation-context.tsx src/client/sequencer/orientation-context.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2o: Rename src/client/sequencer/landscape-prompt.tsx

- [ ] git mv src/client/sequencer/landscape-prompt.tsx src/client/sequencer/landscape-prompt.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2p: Rename src/client/sequencer/synth-engine.ts

- [ ] git mv src/client/sequencer/synth-engine.ts src/client/sequencer/synth-engine.ts
- [ ] Note: This is already lowercase! Skip.

### Task 2q: Rename src/client/sequencer/synth-step-cell.tsx

- [ ] git mv src/client/sequencer/synth-step-cell.tsx src/client/sequencer/synth-step-cell.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2r: Rename src/client/sequencer/step-cell.tsx

- [ ] git mv src/client/sequencer/step-cell.tsx src/client/sequencer/step-cell.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2s: Rename src/client/sequencer/xy-pad.tsx

- [ ] git mv src/client/sequencer/xy-pad.tsx src/client/sequencer/xy-pad.tsx
- [ ] Update imports in: src/client/sequencer/synth-engine.ts
- [ ] Run tests: bun run test
- [ ] Commit

### Task 2t: Rename src/frontend.tsx

- [ ] git mv src/frontend.tsx src/frontend.tsx
- [ ] Note: This is already lowercase! Skip.

### Task 2u: Rename UI components (src/components/ui/*.tsx)

All UI components are already in kebab-case (button.tsx, input.tsx, etc.). Skip.

---

## Task 3: Verify All Tests Pass

**Files:**
- Test: Run all tests

- [ ] **Step 1: Run full test suite**

```bash
bun run test
```

Expected: All 86 unit tests pass, all 11 e2e tests pass

- [ ] **Step 2: Run biome check**

```bash
biome check src/
```

Expected: No useFilenamingConvention errors for files in kebab-case

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: verify all tests pass after kebab-case migration"
```

---

## Task 4: Final Verification

- [ ] Run `bun run test` - all tests pass
- [ ] Run `biome check src/` - no filename errors
- [ ] Verify git status shows clean working tree