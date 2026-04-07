# Global CLI Options

Options available across most Biome commands for controlling output, diagnostics, logging, and behavior.

## Capabilities

### Color Control

Control markup formatting and color output.

```bash { .api }
--colors <off|force>
```

**Values:**
- `off` - Plain text output without ANSI color codes
- `force` - Force ANSI colors even if output destination doesn't support them

**Usage Examples:**

```bash
# Disable colors
biome check --colors=off

# Force colors (e.g., when piping to files)
biome check --colors=force

# CI mode forces colors by default
biome ci
biome ci --colors=off  # Override to disable
```

**Behavior:**
- Colors automatically disabled when output is not a TTY
- `NO_COLOR` environment variable also disables colors
- CI mode (`biome ci`) forces colors on by default

---

### Configuration Path

Specify path to configuration file or directory.

```bash { .api }
--config-path <PATH>
```

**Arguments:**
- `<PATH>` - Path to `biome.json`/`biome.jsonc` file or directory containing one

**Usage Examples:**

```bash
# Use specific configuration file
biome check --config-path=/path/to/biome.json

# Use configuration in specific directory
biome check --config-path=/path/to/project

# Combine with other options
biome check --write --config-path=./configs/biome.json
```

**Behavior:**
- Disables default configuration file resolution (no directory tree walking)
- If path is a directory, looks for `biome.json` or `biome.jsonc` in that directory
- Can also be set via `BIOME_CONFIG_PATH` environment variable
- CLI option takes precedence over environment variable

**Environment Variable:**

```bash
export BIOME_CONFIG_PATH=/path/to/biome.json
biome check
```

---

### Verbosity and Diagnostics

Control how much information Biome outputs.

#### Verbose Mode

Print additional diagnostics and processed files.

```bash { .api }
--verbose
```

**Usage Examples:**

```bash
# Show detailed processing information
biome check --verbose

# Verbose CI output
biome ci --verbose
```

**Output Includes:**
- List of processed files
- Configuration file locations
- Timing information
- Detailed diagnostic context

---

#### Maximum Diagnostics

Cap the number of diagnostics displayed.

```bash { .api }
--max-diagnostics <none|NUMBER>
```

**Arguments:**
- `<NUMBER>` - Maximum number of diagnostics to show
- `none` - Remove the limit and show all diagnostics

**Default:** `20`

**Usage Examples:**

```bash
# Show only first 5 diagnostics
biome check --max-diagnostics=5

# Show all diagnostics
biome check --max-diagnostics=none

# Default behavior (20 diagnostics)
biome check
```

**Behavior:**
- Limits total diagnostics across all files
- Useful for large projects with many issues
- Summary still shows total count even when capped

---

#### Diagnostic Level

Set minimum diagnostic level to display.

```bash { .api }
--diagnostic-level <info|warn|error>
```

**Values:**
- `info` - Show informational, warning, and error diagnostics
- `warn` - Show warning and error diagnostics (default)
- `error` - Show only error diagnostics

**Default:** `warn`

**Usage Examples:**

```bash
# Show all diagnostics including info
biome check --diagnostic-level=info

# Show only errors
biome check --diagnostic-level=error

# Default (warnings and errors)
biome check
```

**Behavior:**
- Filters diagnostics by severity level
- Does not affect exit code (errors still cause exit code 1)

---

### Error Handling

Control how Biome handles errors and edge cases.

#### Skip Parse Errors

Skip files with syntax errors instead of emitting error diagnostics.

```bash { .api }
--skip-parse-errors
```

**Usage Examples:**

```bash
# Skip files with syntax errors
biome check --skip-parse-errors

# Format valid files only
biome format --write --skip-parse-errors
```

**Behavior:**
- Files with parse errors are skipped silently
- No error diagnostic emitted for parse failures
- Exit code not affected by skipped files
- Useful for processing partially valid codebases

---

#### Error on Warnings

Exit with error code when warnings are emitted.

```bash { .api }
--error-on-warnings
```

**Usage Examples:**

```bash
# Treat warnings as errors in CI
biome check --error-on-warnings

# Strict mode for formatting
biome format --error-on-warnings
```

**Behavior:**
- Warnings cause exit code 1 instead of 0
- Useful for enforcing strict code quality in CI
- Affects all warning-level diagnostics

---

#### No Errors on Unmatched

Don't error when no files are processed.

```bash { .api }
--no-errors-on-unmatched
```

**Usage Examples:**

```bash
# Don't fail if no files match
biome check --no-errors-on-unmatched "src/**/*.ts"

# Useful in CI with conditional file patterns
biome check --changed --no-errors-on-unmatched
```

**Behavior:**
- Exit code 0 when no files match the pattern
- Default behavior (without flag): exit code 1 when no files matched
- Useful when file patterns might not always match files

---

### Reporting

Change how diagnostics and summaries are reported.

```bash { .api }
--reporter <REPORTER>
```

**Values:**
- `json` - Machine-readable JSON output
- `json-pretty` - Formatted JSON output with indentation
- `github` - GitHub Actions workflow commands format
- `junit` - JUnit XML format for CI integration
- `summary` - Grouped summary by category and file
- `gitlab` - GitLab Code Quality report format
- `checkstyle` - Checkstyle XML format
- `rdjson` - Reviewdog JSON diagnostic format

**Usage Examples:**

```bash
# JSON output for parsing
biome check --reporter=json

# Formatted JSON for readability
biome check --reporter=json-pretty

# GitHub Actions annotations
biome ci --reporter=github

# JUnit XML for CI
biome ci --reporter=junit > report.xml

# GitLab Code Quality
biome ci --reporter=gitlab > gl-code-quality-report.json

# Checkstyle XML
biome ci --reporter=checkstyle > checkstyle-report.xml
```

#### JSON Reporter

Machine-readable JSON output without formatting.

**Output Structure:**

```json
{
  "diagnostics": [
    {
      "severity": "error",
      "location": {
        "path": "src/index.ts",
        "span": { "start": 100, "end": 105 }
      },
      "message": "Diagnostic message",
      "code": "lint/correctness/noUnusedVariables"
    }
  ],
  "summary": {
    "errors": 5,
    "warnings": 10,
    "filesProcessed": 50
  }
}
```

#### JSON Pretty Reporter

Formatted JSON with indentation for human readability.

Same structure as JSON reporter but with indentation and newlines.

#### GitHub Reporter

GitHub Actions workflow commands format for PR annotations.

**Output Format:**

```
::error file=src/index.ts,line=10,col=5::Diagnostic message
::warning file=src/utils.ts,line=20,col=10::Warning message
```

**Behavior:**
- Creates inline annotations in GitHub PRs
- Colors automatically disabled
- Integrates with GitHub Actions check runs

#### JUnit Reporter

JUnit XML format for CI integration.

**Output Format:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="biome" tests="50" failures="5">
    <testcase name="src/index.ts">
      <failure message="Diagnostic message" />
    </testcase>
  </testsuite>
</testsuites>
```

**Usage:**
- Compatible with most CI systems (Jenkins, GitLab CI, CircleCI, etc.)
- Can be published as test results or artifacts

#### Summary Reporter

Grouped summary format organized by category and file.

**Output:**
```
Errors:
  src/index.ts:
    - Line 10: Unused variable 'x'
    - Line 20: Missing semicolon

Warnings:
  src/utils.ts:
    - Line 5: Prefer const over let

Summary: 2 errors, 1 warning in 2 files
```

#### GitLab Reporter

GitLab Code Quality report format.

**Output Format:**

```json
[
  {
    "description": "Diagnostic message",
    "fingerprint": "abc123",
    "severity": "major",
    "location": {
      "path": "src/index.ts",
      "lines": { "begin": 10 }
    }
  }
]
```

**Usage:**
- Compatible with GitLab Code Quality widget
- Can be uploaded as GitLab CI artifacts

#### Checkstyle Reporter

Checkstyle XML format.

**Output Format:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<checkstyle version="4.3">
  <file name="src/index.ts">
    <error line="10" column="5" severity="error" message="Diagnostic message" />
  </file>
</checkstyle>
```

#### Reviewdog JSON Reporter

Reviewdog diagnostic format for code review.

**Output Format:**

```json
{
  "source": {
    "name": "biome"
  },
  "diagnostics": [
    {
      "message": "Diagnostic message",
      "location": {
        "path": "src/index.ts",
        "range": {
          "start": { "line": 10, "column": 5 }
        }
      },
      "severity": "ERROR"
    }
  ]
}
```

---

### Logging

Control internal logging for debugging and diagnostics.

#### Log File

Redirect log messages to a file.

```bash { .api }
--log-file <PATH>
```

**Default:** stdout

**Usage Examples:**

```bash
# Write logs to file
biome check --log-file=biome.log

# Use with log level
biome check --log-file=debug.log --log-level=debug
```

---

#### Log Level

Set logging verbosity.

```bash { .api }
--log-level <none|debug|info|warn|error>
```

**Values:**
- `none` - No logging (default)
- `debug` - Verbose debug information
- `info` - Informational messages
- `warn` - Warning messages only
- `error` - Error messages only

**Default:** `none`

**Usage Examples:**

```bash
# Debug logging
biome check --log-level=debug

# Info logging
biome check --log-level=info --log-file=biome.log

# Error logging only
biome check --log-level=error
```

**Output:**
- Internal Biome operation logs (not user-facing diagnostics)
- Useful for debugging Biome itself or reporting issues

---

#### Log Kind

Set log format style.

```bash { .api }
--log-kind <pretty|compact|json>
```

**Values:**
- `pretty` - Human-readable with colors and formatting (default)
- `compact` - Condensed single-line format
- `json` - JSON format for machine parsing

**Default:** `pretty`

**Usage Examples:**

```bash
# Pretty logging (default)
biome check --log-level=debug --log-kind=pretty

# Compact logging
biome check --log-level=info --log-kind=compact

# JSON logging for parsing
biome check --log-level=debug --log-kind=json --log-file=debug.json
```

---

### Server Mode

Connect to a running Biome daemon server instead of starting a new process.

```bash { .api }
--use-server
```

**Usage Examples:**

```bash
# Start daemon server
biome start

# Use server for commands
biome check --use-server --write
biome format --use-server --write
biome lint --use-server --write

# Stop daemon server
biome stop
```

**Behavior:**
- Connects to existing daemon process via IPC
- Faster repeated invocations (avoids process startup overhead)
- Shares cached state between invocations
- Daemon automatically started if not running (when `--use-server` specified)

**Performance Benefits:**
- Reduced startup time (daemon already running)
- Shared file system cache
- Persistent process with warm caches

**Use Cases:**
- Development workflows with frequent Biome invocations
- Editor integration (LSP)
- Watch mode scenarios
- Git hooks

---

### Thread Control

Control the number of threads used for parallel processing (available in `ci` command).

```bash { .api }
--threads <NUMBER>
```

**Arguments:**
- `<NUMBER>` - Number of threads to use for parallel file processing

**Usage Examples:**

```bash
# Limit threads in CI environment
biome ci --threads=2

# Single-threaded processing
biome ci --threads=1

# Use 4 threads
biome ci --threads=4 --write
```

**Behavior:**
- Controls parallelism for file processing operations
- Default: Number of available CPU cores
- Can also be set via `BIOME_THREADS` environment variable
- CLI option takes precedence over environment variable
- Lower values reduce memory usage and CPU load

**Use Cases:**
- CI environments with limited resources
- Containers with CPU limits
- Avoiding resource exhaustion in shared environments
- Testing and debugging with predictable threading

**Note:** This option is primarily used with the `ci` command but can be controlled globally via the `BIOME_THREADS` environment variable for all commands.

---

## Combining Options

Global options can be combined with command-specific options:

```bash
# Multiple global options
biome check \
  --write \
  --config-path=./configs/biome.json \
  --verbose \
  --max-diagnostics=50 \
  --reporter=json-pretty \
  --log-level=info \
  --log-file=biome.log \
  --colors=force

# CI with strict settings
biome ci \
  --reporter=github \
  --error-on-warnings \
  --max-diagnostics=none \
  --no-errors-on-unmatched

# Development with server mode
biome check \
  --write \
  --use-server \
  --verbose \
  --staged
```

---

## Option Precedence

When the same setting can be specified multiple ways:

1. CLI options (highest precedence)
2. Environment variables
3. Configuration file
4. Default values (lowest precedence)

**Example:**

```bash
# Environment variable
export BIOME_CONFIG_PATH=/path/to/config.json

# CLI option overrides environment variable
biome check --config-path=/other/path/config.json
```
