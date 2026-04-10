# TypeScript Kebab-Case Filename Convention

**Date:** 2026-04-10  
**Status:** Approved

## Overview

Enforce lowercase kebab-case for all TypeScript files (`.ts` and `.tsx`) in the project. Existing files will be renamed, and future files must follow this convention. Import statements will be automatically updated when files are renamed.

## Goals

1. Rename all existing `.ts` and `.tsx` files to kebab-case
2. Update all import statements that reference renamed files
3. Add Biome lint rule to enforce kebab-case for future files
4. Verify all tests pass after changes

## Architecture

### Tools

- **Biome** - Linting tool with `useFilenamingConvention` rule
- **git mv** - Rename files while preserving git history
- **bun run test** - Verify tests pass

### Configuration

Add to `biome.json`:

```json
{
  "linter": {
    "rules": {
      "style": {
        "useFilenamingConvention": {
          "options": {
            "filenameCases": ["kebab-case"]
          }
        }
      }
    }
  }
}
```

## Process

1. Add Biome rule to `biome.json`
2. Identify all `.ts` and `.tsx` files not in kebab-case
3. Rename each file using `git mv` (preserves git history)
4. Auto-update all imports referencing renamed files
5. Run `bun run test` to verify tests pass
6. Commit changes

## Verification

Run `bun run test` after all changes to verify:

- All unit tests pass (86+ tests)
- All e2e tests pass (11 tests)

## Notes

- Biome's `useFilenamingConvention` rule does not have auto-fix
- Files must be renamed manually, then imports updated
- Test files (`.test.ts` / `.test.tsx`) follow kebab-case with `.test` suffix