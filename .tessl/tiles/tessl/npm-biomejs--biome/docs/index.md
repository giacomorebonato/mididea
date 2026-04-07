# Biome

Biome is a performant toolchain for web projects that provides fast formatting, linting, and code quality tools in a single unified package. Built on a Rust core for maximum performance, Biome offers 97% compatibility with Prettier for formatting and includes over 340 linting rules from ESLint, typescript-eslint, and other sources. It's designed for interactive use within editors with LSP support and can format and lint malformed code in real-time with detailed diagnostics.

## Package Information

- **Package Name**: @biomejs/biome
- **Package Type**: npm
- **Language**: JavaScript/TypeScript (wrapper around native Rust binaries)
- **Installation**: `npm install --save-dev --save-exact @biomejs/biome`
- **Requirements**: Node.js >= 14.21.3
- **Documentation**: https://biomejs.dev/

## Core Usage

Biome is invoked via the `biome` command-line interface. The CLI provides multiple commands for different workflows.

### Basic Commands

```bash
# Format files
npx @biomejs/biome format --write ./src

# Lint files and apply safe fixes
npx @biomejs/biome lint --write ./src

# Run format, lint, and import sorting with safe fixes
npx @biomejs/biome check --write ./src

# Check all files in CI (read-only mode)
npx @biomejs/biome ci ./src
```

### Configuration

Biome uses a `biome.json` or `biome.jsonc` configuration file:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.8/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

## Basic Usage

```bash
# Initialize a new Biome project
npx @biomejs/biome init

# Format and lint a project
npx @biomejs/biome check --write

# Run checks in CI environment
npx @biomejs/biome ci
```

## Architecture

Biome consists of several key components:

- **CLI Interface**: Node.js wrapper that spawns platform-specific native binaries
- **Native Binaries**: Rust-based core distributed as platform-specific optional dependencies
- **Formatter Engine**: Fast formatting with Prettier compatibility
- **Linter Engine**: Rule-based linting with over 340 rules
- **LSP Server**: Language Server Protocol support for editor integration
- **Configuration System**: JSON-based configuration with extends, overrides, and language-specific settings
- **VCS Integration**: Git integration for staged and changed file detection
- **Daemon Mode**: Optional server mode for faster repeated invocations

## Capabilities

### Core Commands

Primary commands for formatting, linting, and checking code.

```bash { .api }
# Format files
biome format [OPTIONS] [PATHS]...

# Lint files
biome lint [OPTIONS] [PATHS]...

# Run formatter, linter, and import sorting
biome check [OPTIONS] [PATHS]...

# CI mode (read-only)
biome ci [OPTIONS] [PATHS]...
```

[Core Commands](./core-commands.md)

### Configuration Management

Initialize, migrate, and manage Biome configuration.

```bash { .api }
# Initialize new project
biome init [--jsonc]

# Migrate from other tools
biome migrate [prettier|eslint] [OPTIONS]
```

Configuration file structure:

```typescript { .api }
interface BiomeConfiguration {
  $schema?: string;
  root?: boolean;
  extends?: string[];
  files?: FilesConfiguration;
  formatter?: FormatterConfiguration;
  linter?: LinterConfiguration;
  assist?: AssistConfiguration;
  javascript?: JavaScriptConfiguration;
  json?: JsonConfiguration;
  css?: CssConfiguration;
  graphql?: GraphqlConfiguration;
  html?: HtmlConfiguration;
  vcs?: VcsConfiguration;
  overrides?: OverrideConfiguration[];
  plugins?: string[];
}
```

[Configuration](./configuration.md)

### Global CLI Options

Options available across most commands for controlling output, diagnostics, and behavior.

```bash { .api }
# Color control
--colors <off|force>

# Configuration path
--config-path <PATH>

# Verbosity
--verbose
--max-diagnostics <none|NUMBER>
--diagnostic-level <info|warn|error>

# Error handling
--skip-parse-errors
--error-on-warnings
--no-errors-on-unmatched

# Reporting format
--reporter <json|json-pretty|github|junit|summary|gitlab|checkstyle|rdjson>

# Logging
--log-file <PATH>
--log-level <none|debug|info|warn|error>
--log-kind <pretty|compact|json>

# Server mode
--use-server
```

[Global Options](./global-options.md)

### Environment Variables

Environment variables that control Biome's behavior.

```bash { .api }
# Biome-specific
BIOME_CONFIG_PATH   # Path to configuration file
BIOME_BINARY        # Override native binary path
BIOME_LOG_PATH      # Daemon log directory
BIOME_LOG_PREFIX_NAME  # Log file prefix
BIOME_THREADS       # Thread count

# Standard variables
NO_COLOR            # Disable color output
TERM                # Terminal type
```

[Environment Variables](./environment.md)

### Advanced Features

Additional capabilities for debugging, search, and server management.

```bash { .api }
# Search with GritQL patterns (experimental)
biome search <PATTERN> [PATHS]...

# Print debugging information
biome rage [OPTIONS]

# Show rule documentation
biome explain <RULE_NAME>

# Daemon server management
biome start [OPTIONS]
biome stop

# LSP server
biome lsp-proxy [OPTIONS]

# Clean daemon logs
biome clean
```

[Advanced Features](./advanced-features.md)

## Exit Codes

Biome uses standard Unix exit codes:

- **0** - Success (no errors)
- **1** - Failure (errors occurred)

Exit code behavior:
- Diagnostics with severity >= Error result in exit code 1
- With `--error-on-warnings`, warnings result in exit code 1
- Configuration errors result in exit code 1
- No files matched (without `--no-errors-on-unmatched`) results in exit code 1

## Supported Languages

Biome supports formatting and linting for:

- JavaScript (`.js`, `.mjs`, `.cjs`)
- TypeScript (`.ts`, `.mts`, `.cts`)
- JSX/TSX (`.jsx`, `.tsx`)
- JSON (`.json`, `.jsonc`)
- CSS (`.css`)
- GraphQL (`.graphql`, `.gql`)
- HTML (`.html`, `.htm`)
- Vue (`.vue` - with caveats)
- Astro (`.astro` - with caveats)
- Svelte (`.svelte` - with caveats)

## Platform Support

Biome provides native binaries for:

- **Windows**: x64, arm64
- **macOS**: x64 (Intel), arm64 (Apple Silicon)
- **Linux**: x64, arm64 (glibc and musl variants)

The npm package automatically installs the appropriate binary for your platform via optional dependencies.
