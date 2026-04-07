# Environment Variables

Environment variables that control and influence Biome's behavior.

## Capabilities

### Biome-Specific Variables

Environment variables specific to Biome configuration and operation.

#### BIOME_CONFIG_PATH

Path to the Biome configuration file.

```bash { .api }
BIOME_CONFIG_PATH=<PATH>
```

**Type:** String (file path)

**Usage:**

```bash
# Set configuration path
export BIOME_CONFIG_PATH=/path/to/biome.json
biome check

# Per-command
BIOME_CONFIG_PATH=./configs/biome.json biome check --write
```

**Behavior:**
- Alternative to `--config-path` CLI option
- CLI option takes precedence over environment variable
- Disables default configuration file discovery
- Can point to file or directory containing `biome.json`/`biome.jsonc`

---

#### BIOME_BINARY

Override path to the native Biome binary.

```bash { .api }
BIOME_BINARY=<PATH>
```

**Type:** String (file path)

**Usage:**

```bash
# Use custom binary
export BIOME_BINARY=/path/to/custom/biome
biome check

# Use locally built binary
export BIOME_BINARY=./target/release/biome
biome check
```

**Behavior:**
- Overrides automatic platform detection and binary resolution
- Used by the Node.js wrapper to locate the native executable
- Useful for:
  - Testing custom builds
  - Using binaries on unsupported platforms
  - Development and debugging

---

#### BIOME_LOG_PATH

Directory where daemon server logs are stored.

```bash { .api }
BIOME_LOG_PATH=<PATH>
```

**Type:** String (directory path)

**Default:** Platform-specific cache directory
- Linux: `$XDG_CACHE_HOME/biome` or `~/.cache/biome`
- macOS: `~/Library/Caches/biome`
- Windows: `%LOCALAPPDATA%\biome\cache`

**Usage:**

```bash
# Set log directory
export BIOME_LOG_PATH=/var/log/biome
biome start

# Per-command
BIOME_LOG_PATH=/tmp/biome-logs biome start
```

**Behavior:**
- Alternative to `--log-path` CLI option (for `start` and `lsp-proxy` commands)
- CLI option takes precedence over environment variable
- Directory is created if it doesn't exist
- Log files named with `BIOME_LOG_PREFIX_NAME` prefix

**Related:**
- `BIOME_LOG_PREFIX_NAME` - Log file name prefix
- `--log-path` CLI option

---

#### BIOME_LOG_PREFIX_NAME

Prefix for daemon log file names.

```bash { .api }
BIOME_LOG_PREFIX_NAME=<STRING>
```

**Type:** String

**Default:** `"server.log"`

**Usage:**

```bash
# Set log prefix
export BIOME_LOG_PREFIX_NAME=biome-daemon
biome start
# Creates: biome-daemon.{timestamp}.log

# Multiple instances
BIOME_LOG_PREFIX_NAME=instance-1 biome start
BIOME_LOG_PREFIX_NAME=instance-2 biome start
```

**Behavior:**
- Alternative to `--log-prefix-name` CLI option
- CLI option takes precedence over environment variable
- Useful for distinguishing logs from multiple daemon instances
- Full log filename: `{prefix}.{timestamp}.log`

---

#### BIOME_THREADS

Number of threads to use for parallel processing.

```bash { .api }
BIOME_THREADS=<NUMBER>
```

**Type:** Number (positive integer)

**Default:** Number of CPU cores

**Usage:**

```bash
# Limit threads in CI
export BIOME_THREADS=2
biome ci

# Single-threaded processing
BIOME_THREADS=1 biome check

# Use all cores explicitly
BIOME_THREADS=$(nproc) biome check
```

**Behavior:**
- Controls parallelism for file processing
- Useful in resource-limited CI environments
- Lower values reduce memory usage and CPU load
- Alternative to `--threads` CLI option (available in `ci` command)
- CLI option takes precedence over environment variable

**Use Cases:**
- CI environments with limited resources
- Containers with CPU limits
- Avoiding resource exhaustion in shared environments

---

#### BIOME_VERSION

Biome version string (build-time only).

```bash { .api }
BIOME_VERSION=<VERSION>
```

**Type:** String

**Usage:**

This variable is used during Biome's build process to embed version information. It's not intended for user configuration.

**Behavior:**
- Read during compilation/build only
- Not used at runtime
- Version displayed by `biome version` command

---

### Standard Environment Variables

Standard environment variables that Biome reads and respects.

#### NO_COLOR

Disable colored output.

```bash { .api }
NO_COLOR=<any-value>
```

**Type:** Boolean (any value disables color)

**Standard:** [NO_COLOR](https://no-color.org/)

**Usage:**

```bash
# Disable colors
export NO_COLOR=1
biome check

# Disable colors (any value works)
NO_COLOR=true biome check
NO_COLOR= biome check
```

**Behavior:**
- When set (to any value), disables ANSI color codes in output
- Overridden by `--colors=force` CLI option
- Standard convention respected by many CLI tools
- Useful for:
  - Log files
  - CI systems that don't support colors
  - Accessibility (screen readers)
  - Output piping and processing

---

#### TERM

Terminal type information.

```bash { .api }
TERM=<terminal-type>
```

**Type:** String

**Common Values:** `xterm`, `xterm-256color`, `screen`, `dumb`, `vt100`

**Usage:**

```bash
# Set terminal type
export TERM=xterm-256color
biome check

# Dumb terminal (no colors)
TERM=dumb biome check
```

**Behavior:**
- Read to determine terminal capabilities
- Influences color and formatting decisions
- `dumb` terminal type disables colors
- Automatically set by terminal emulators

---

#### GITHUB_ACTIONS

Detected by Biome to enable GitHub Actions-specific behavior.

```bash { .api }
GITHUB_ACTIONS=<true|false>
```

**Type:** String (typically `"true"` when running in GitHub Actions)

**Usage:**

Set automatically by GitHub Actions when workflows run. Not intended for manual configuration.

```bash
# Automatically set by GitHub Actions
GITHUB_ACTIONS=true

# Biome detects and adjusts behavior accordingly
biome ci --reporter=github
```

**Behavior:**
- Automatically set by GitHub Actions CI environment
- Biome detects this variable to optimize output for GitHub
- May influence reporting format and color handling
- Used for generating GitHub workflow annotations
- Helps Biome provide better integration with GitHub Actions workflows

**Related:**
- Use `--reporter=github` to generate GitHub Actions workflow commands
- GitHub-specific formatting for errors and warnings

---

### Node.js Runtime Variables

Variables set by the Node.js wrapper and passed to the native binary for context.

#### JS_RUNTIME_VERSION

JavaScript runtime version.

```bash { .api }
JS_RUNTIME_VERSION=<version>
```

**Type:** String

**Example:** `v20.10.0`

**Usage:**

Set automatically by the Node.js wrapper based on `process.version`. Not intended for manual configuration.

**Behavior:**
- Passed to native binary for diagnostic information
- Included in `biome rage` output
- Useful for debugging runtime-specific issues

---

#### JS_RUNTIME_NAME

JavaScript runtime name.

```bash { .api }
JS_RUNTIME_NAME=<name>
```

**Type:** String

**Example:** `node`

**Usage:**

Set automatically by the Node.js wrapper based on `process.release.name`. Not intended for manual configuration.

**Behavior:**
- Passed to native binary for diagnostic information
- Included in `biome rage` output
- Distinguishes Node.js from other JavaScript runtimes (Deno, Bun, etc.)

---

#### NODE_PACKAGE_MANAGER

Package manager being used.

```bash { .api }
NODE_PACKAGE_MANAGER=<package-manager>
```

**Type:** String

**Example:** `npm/8.19.2`, `pnpm/8.10.0`, `yarn/1.22.19`

**Usage:**

Set automatically by package managers via `npm_config_user_agent`. Not intended for manual configuration.

**Behavior:**
- Detected from `npm_config_user_agent` environment variable
- Passed to native binary for diagnostic information
- Included in `biome rage` output
- Format: `{name}/{version}`

---

## Environment Variable Precedence

When multiple configuration sources are available:

1. **CLI options** (highest precedence)
2. **Environment variables**
3. **Configuration file**
4. **Default values** (lowest precedence)

**Example:**

```bash
# Configuration file
{
  "files": {
    "maxSize": 1048576
  }
}

# Environment variable
export BIOME_CONFIG_PATH=/other/config.json

# CLI option overrides both
biome check --config-path=/final/config.json
```

---

## Common Usage Patterns

### CI/CD Environments

```bash
#!/bin/bash
# .gitlab-ci.yml or similar

export BIOME_THREADS=2
export NO_COLOR=1
export BIOME_CONFIG_PATH=./ci-config.json

biome ci --reporter=gitlab > gl-code-quality-report.json
```

### Development Scripts

```bash
#!/bin/bash
# scripts/check-code.sh

export BIOME_CONFIG_PATH=./configs/biome.json
export BIOME_LOG_PATH=./logs

biome check --write --use-server
```

### Docker Containers

```dockerfile
# Dockerfile
FROM node:20

ENV BIOME_THREADS=2
ENV BIOME_CONFIG_PATH=/app/biome.json

WORKDIR /app
COPY . .
RUN npm install
RUN npx @biomejs/biome ci
```

### Testing Custom Builds

```bash
#!/bin/bash
# Test locally built Biome binary

export BIOME_BINARY=./target/release/biome
export BIOME_LOG_LEVEL=debug
export BIOME_LOG_PATH=./debug-logs

biome check --write
```

### Multiple Daemon Instances

```bash
# Instance 1
export BIOME_LOG_PREFIX_NAME=daemon-1
export BIOME_LOG_PATH=/tmp/biome/instance-1
biome start &

# Instance 2
export BIOME_LOG_PREFIX_NAME=daemon-2
export BIOME_LOG_PATH=/tmp/biome/instance-2
biome start &
```

---

## Debugging with Environment Variables

For debugging and troubleshooting:

```bash
# Enable debug logging
export BIOME_LOG_PATH=./debug
biome start --log-level=debug

# Use server with debugging
export BIOME_THREADS=1  # Single-threaded for easier debugging
biome check --use-server --verbose --log-level=debug

# Check configuration resolution
export BIOME_CONFIG_PATH=./debug-config.json
biome rage --formatter --linter
```

---

## Environment Variables in Scripts

### Bash

```bash
#!/bin/bash
export BIOME_CONFIG_PATH=/path/to/config.json
export BIOME_THREADS=4
biome check --write
```

### PowerShell

```powershell
$env:BIOME_CONFIG_PATH = "C:\path\to\config.json"
$env:BIOME_THREADS = 4
biome check --write
```

### npm/package.json Scripts

```json
{
  "scripts": {
    "check": "BIOME_CONFIG_PATH=./configs/biome.json biome check --write",
    "ci": "BIOME_THREADS=2 NO_COLOR=1 biome ci --reporter=json"
  }
}
```

### cross-env for Cross-Platform Scripts

```json
{
  "scripts": {
    "check": "cross-env BIOME_CONFIG_PATH=./configs/biome.json biome check --write",
    "ci": "cross-env BIOME_THREADS=2 NO_COLOR=1 biome ci"
  }
}
```
