# Core Commands

Core commands for formatting, linting, and checking code quality with Biome.

## Capabilities

### Check Command

Runs formatter, linter, and import sorting on files. This is the primary command for comprehensive code health checks.

```bash { .api }
biome check [OPTIONS] [PATHS]...
```

**Arguments:**
- `[PATHS]...` - Files, directories, or glob patterns to check. If omitted, checks current directory.

**Key Options:**

```bash { .api }
# Apply safe fixes, formatting, and import sorting
--write

# Apply unsafe fixes (requires --write)
--unsafe

# Enable/disable individual tools
--formatter-enabled <true|false>
--linter-enabled <true|false>
--assist-enabled <true|false>

# Control assist enforcement
--enforce-assist <true|false>  # Default: true

# Allow formatting files with syntax errors
--format-with-errors <true|false>

# Process stdin with specified file path
--stdin-file-path <PATH>

# VCS integration
--staged          # Only check staged files
--changed         # Only check changed files vs default branch
--since <REF>     # Specify base ref for --changed
```

**Usage Examples:**

```bash
# Check all files and apply safe fixes
biome check --write

# Check specific directory
biome check --write ./src

# Check with unsafe fixes
biome check --write --unsafe

# Check only staged files
biome check --staged

# Check changed files since main branch
biome check --changed

# Process stdin
echo "const x = 1" | biome check --stdin-file-path=file.js

# Disable linter, only run formatter
biome check --write --linter-enabled=false
```

**Exit Codes:**
- `0` - No errors found
- `1` - Errors found or fixes needed

---

### Format Command

Runs the formatter on files to ensure consistent code style.

```bash { .api }
biome format [OPTIONS] [PATHS]...
```

**Arguments:**
- `[PATHS]...` - Files, directories, or glob patterns to format. If omitted, formats current directory.

**Key Options:**

```bash { .api }
# Write formatted output to files
--write

# Process stdin with specified file path
--stdin-file-path <PATH>

# VCS integration
--staged          # Only format staged files
--changed         # Only format changed files
--since <REF>     # Specify base ref for --changed
```

**Usage Examples:**

```bash
# Format all files
biome format --write

# Format specific files
biome format --write src/index.ts src/utils.ts

# Format and output to stdout (without --write)
biome format src/index.ts

# Format staged files
biome format --write --staged

# Format changed files
biome format --write --changed

# Process stdin
echo "const x=1" | biome format --stdin-file-path=file.js
```

**Formatting Behavior:**
- Without `--write`: Outputs formatted code to stdout and exits with code 1 if formatting would change the file
- With `--write`: Writes formatted code back to files
- Respects formatter configuration from `biome.json`
- Provides 97% compatibility with Prettier

**Exit Codes:**
- `0` - All files already formatted correctly (with `--write`) or formatted successfully
- `1` - Formatting changes needed (without `--write`) or errors occurred

---

### Lint Command

Runs the linter on files to detect and fix code quality issues.

```bash { .api }
biome lint [OPTIONS] [PATHS]...
```

**Arguments:**
- `[PATHS]...` - Files, directories, or glob patterns to lint. If omitted, lints current directory.

**Key Options:**

```bash { .api }
# Write safe fixes
--write

# Apply unsafe fixes (requires --write)
--unsafe

# Add comment suppressions instead of fixes
--suppress

# Explanation for suppressions
--reason <STRING>

# Run only specific rules, groups, or domains
--only <GROUP|RULE|DOMAIN>  # Can be repeated

# Skip specific rules, groups, or domains
--skip <GROUP|RULE|DOMAIN>  # Can be repeated

# Process stdin with specified file path
--stdin-file-path <PATH>

# VCS integration
--staged          # Only lint staged files
--changed         # Only lint changed files
--since <REF>     # Specify base ref for --changed
```

**Usage Examples:**

```bash
# Lint all files and apply safe fixes
biome lint --write

# Lint without fixing (report only)
biome lint

# Apply safe and unsafe fixes
biome lint --write --unsafe

# Suppress violations with comments
biome lint --suppress --reason "Legacy code"

# Run only specific rules
biome lint --only=correctness/noUnusedVariables
biome lint --only=correctness --only=suspicious

# Skip specific rules
biome lint --skip=style/useConst --skip=suspicious/noExplicitAny

# Lint staged files
biome lint --write --staged

# Process stdin
echo "var x = 1" | biome lint --stdin-file-path=file.js
```

**Rule Filtering:**
- `--only` runs specified rules, groups, or domains exclusively
- `--skip` excludes specified rules, groups, or domains (takes precedence over `--only`)
- Can filter by:
  - Individual rule: `correctness/noUnusedVariables`
  - Rule group: `correctness`, `suspicious`, `style`, etc.
  - Domain: JavaScript-specific, TypeScript-specific, etc.

**Fix Modes:**
- **Safe fixes** (default with `--write`): Fixes that are guaranteed not to change behavior
- **Unsafe fixes** (`--unsafe`): Fixes that might change behavior but are likely correct
- **Suppressions** (`--suppress`): Adds comment directives to suppress violations

**Exit Codes:**
- `0` - No violations found
- `1` - Violations found

---

### CI Command

Runs formatter, linter, and import sorting in read-only mode for CI environments. Does not modify files.

```bash { .api }
biome ci [OPTIONS] [PATHS]...
```

**Arguments:**
- `[PATHS]...` - Files, directories, or glob patterns to check. If omitted, checks current directory.

**Key Options:**

```bash { .api }
# Enable/disable individual tools
--formatter-enabled <true|false>
--linter-enabled <true|false>
--assist-enabled <true|false>

# Control assist enforcement
--enforce-assist <true|false>  # Default: true

# Allow checking files with syntax errors
--format-with-errors <true|false>

# Only check changed files
--changed
--since <REF>     # Specify base ref for --changed

# Thread control for resource-limited environments
--threads <NUMBER>
```

**Usage Examples:**

```bash
# Run all checks in CI mode
biome ci

# Check specific directory
biome ci ./src

# Check only changed files
biome ci --changed

# Limit threads in resource-constrained CI
biome ci --threads=2

# Disable formatter, only lint
biome ci --formatter-enabled=false

# Output diagnostics in GitHub Actions format
biome ci --reporter=github

# Output in JUnit XML format
biome ci --reporter=junit
```

**CI Mode Behavior:**
- Read-only: Never modifies files
- Colors forced on by default (unless `--colors off` specified)
- Optimized for CI environment output
- Exits with code 1 if any issues found

**Exit Codes:**
- `0` - All checks passed
- `1` - One or more checks failed

---

## Version Command

Shows the Biome version information and exits.

```bash { .api }
biome version
```

**Usage Examples:**

```bash
biome version
```

**Output:**
Displays version information for the Biome CLI and exits immediately.

**Exit Codes:**
- `0` - Always succeeds

---

## Stdin Processing

All core commands support processing code from stdin when `--stdin-file-path` is provided:

```bash { .api }
--stdin-file-path <PATH>
```

**Behavior:**
- Reads code from stdin instead of files
- Uses the file path's extension to determine language and parser
- File doesn't need to exist on disk
- Output goes to stdout
- Extension mapping examples:
  - `.js`, `.mjs`, `.cjs` → JavaScript
  - `.ts`, `.mts`, `.cts` → TypeScript
  - `.jsx`, `.tsx` → JSX/TSX
  - `.json`, `.jsonc` → JSON
  - `.css` → CSS

**Examples:**

```bash
# Format code from stdin
echo "const x=1" | biome format --stdin-file-path=file.js

# Lint code from stdin
cat src/file.ts | biome lint --stdin-file-path=file.ts

# Check code from stdin
echo "var x = 1" | biome check --stdin-file-path=file.js
```

---

## VCS Integration

Core commands integrate with version control systems to selectively process files:

### Staged Files

Process only files staged with `git add`:

```bash { .api }
--staged
```

**Usage:**
```bash
biome check --write --staged
biome format --write --staged
biome lint --write --staged
```

**Notes:**
- Cannot be combined with `--changed`
- Requires Git repository
- Only processes files in the staging area

### Changed Files

Process only files changed compared to a base branch:

```bash { .api }
--changed
--since <REF>
```

**Usage:**
```bash
# Check changed files vs default branch
biome check --changed

# Check changed files vs specific ref
biome check --changed --since=origin/main

# Format changed files
biome format --write --changed

# CI: only check changed files
biome ci --changed --since=main
```

**Notes:**
- Cannot be combined with `--staged`
- Requires Git repository
- Default branch configured via `vcs.defaultBranch` in `biome.json`
- `--since` overrides default branch setting

---

## File Selection

All core commands accept file paths, directories, or glob patterns:

```bash
# Single file
biome check --write src/index.ts

# Multiple files
biome check --write src/index.ts src/utils.ts

# Directory
biome check --write src/

# Glob patterns (use quotes to prevent shell expansion)
biome check --write "src/**/*.ts"
biome check --write "src/**/*.{ts,tsx,js,jsx}"

# Current directory (default)
biome check --write
```

**File Discovery:**
- Respects `files.includes` and `files.ignores` in `biome.json`
- Respects `.gitignore` when VCS integration enabled
- Respects `.biomeignore` files
- Skips files exceeding `files.maxSize`
- Skips unknown file types (unless `files.ignoreUnknown` is false)

---

## Global Options

All core commands support global CLI options. See [Global Options](./global-options.md) for details:

- Color control (`--colors`)
- Configuration path (`--config-path`)
- Verbosity (`--verbose`, `--max-diagnostics`, `--diagnostic-level`)
- Error handling (`--skip-parse-errors`, `--error-on-warnings`)
- Reporting format (`--reporter`)
- Logging (`--log-file`, `--log-level`, `--log-kind`)
- Server mode (`--use-server`)
