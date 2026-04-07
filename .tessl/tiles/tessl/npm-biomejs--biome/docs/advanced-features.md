# Advanced Features

Additional Biome capabilities for debugging, pattern searching, server management, and LSP integration.

## Capabilities

### Search Command (Experimental)

Search for GritQL patterns across a project.

```bash { .api }
biome search [OPTIONS] <PATTERN> [PATHS]...
```

**Status:** EXPERIMENTAL - API may change in future versions

**Arguments:**
- `<PATTERN>` - The GritQL pattern to search for (use single quotes to avoid shell interpretation)
- `[PATHS]...` - Files or directories to search (default: current directory)

**Options:**

```bash { .api }
# Target language (default: JavaScript)
-l, --language <LANGUAGE>

# Process stdin with specified file path
--stdin-file-path <PATH>
```

**Usage Examples:**

```bash
# Search for console.log statements
biome search '`console.log($message)`'

# Search in specific directory
biome search '`console.log($message)`' ./src

# Search for function calls with specific pattern
biome search '`fetch($url)`'

# Search for React hooks
biome search '`useState($initial)`'

# Search with specific language
biome search --language typescript '`interface $name { }`'

# Process stdin
echo "console.log('hello')" | biome search '`console.log($msg)`' --stdin-file-path=file.js
```

**GritQL Pattern Syntax:**

GritQL uses backticks to escape code snippets:
- `` `console.log($message)` `` - Match console.log with any argument
- `` `$var = $value` `` - Match variable assignments
- `$variable` - Capture/match any expression
- `` `function $name() { }` `` - Match function declarations

**Important:**
- Use **single quotes** around patterns to prevent shell command substitution
- Backticks in GritQL patterns would otherwise trigger shell command execution
- Wrong: `` biome search `console.log($msg)` `` (shell interprets backticks)
- Correct: `` biome search '`console.log($msg)`' `` (single quotes protect backticks)

**Output:**

```
src/index.ts:10:5
  console.log('hello world')

src/utils.ts:25:10
  console.log(result)

Found 2 matches
```

**Exit Codes:**
- `0` - Pattern found
- `1` - Pattern not found or error occurred

---

### Rage Command

Print debugging information useful for filing bug reports.

```bash { .api }
biome rage [OPTIONS]
```

**Options:**

```bash { .api }
# Print daemon server logs
--daemon-logs

# Print formatter options applied
--formatter

# Print linter options applied
--linter
```

**Usage Examples:**

```bash
# Basic debugging info
biome rage

# Include daemon logs
biome rage --daemon-logs

# Show formatter configuration
biome rage --formatter

# Show linter configuration
biome rage --linter

# Show all information
biome rage --daemon-logs --formatter --linter
```

**Output Includes:**

Basic information:
- CLI version
- Platform (operating system)
- CPU architecture
- Configuration file location and status
- Workspace root
- VCS configuration

With `--daemon-logs`:
- Daemon server log contents
- Server connection status
- Process information

With `--formatter`:
- Resolved formatter configuration
- Formatter options for each language
- File-specific formatter settings

With `--linter`:
- Resolved linter configuration
- Enabled rules and their levels
- Rule group settings
- File-specific linter overrides

**Example Output:**

```
CLI Version: 2.3.8
Platform: linux-x64
CPU Architecture: x86_64

Configuration:
  Path: /project/biome.json
  Status: Loaded successfully
  Root: true

Workspace:
  Root: /project
  VCS: git (enabled)

Formatter:
  Enabled: true
  IndentStyle: space
  IndentWidth: 2
  LineWidth: 80

Linter:
  Enabled: true
  Rules: 342 enabled
  Errors: 120
  Warnings: 222
```

**Use Cases:**
- Filing bug reports
- Troubleshooting configuration issues
- Understanding which rules are active
- Debugging daemon connection problems
- Verifying configuration resolution

**Exit Codes:**
- `0` - Always succeeds

---

### Explain Command

Show documentation for rules, diagnostics, or other CLI aspects.

```bash { .api }
biome explain <NAME>
```

**Arguments:**
- `<NAME>` - Name of the rule or documentation topic to explain

**Usage Examples:**

```bash
# Explain a linter rule
biome explain noDebugger
biome explain noUnusedVariables
biome explain useConst

# Explain daemon logs topic
biome explain daemon-logs

# Explain specific rule with category
biome explain correctness/noUnusedVariables
```

**Output:**

Displays comprehensive documentation for the specified rule or topic, including:
- Rule description
- Why the rule exists
- Examples of code that violates the rule
- Examples of correct code
- Rule options (if configurable)
- Links to related rules
- Source (ESLint equivalent, if applicable)

**Example Output:**

```
Rule: noDebugger
Category: suspicious
Severity: error

Description:
  Disallow the use of debugger statements in production code.

Why:
  Debugger statements cause execution to pause and should not be
  present in production code. They are useful during development
  but should be removed before deployment.

Invalid:

  function example() {
    debugger; // ❌
    return 42;
  }

Valid:

  function example() {
    return 42; // ✅
  }

Configuration:
  {
    "linter": {
      "rules": {
        "suspicious": {
          "noDebugger": "error"
        }
      }
    }
  }

See also:
  - noConsoleLog
  - noConsole

Source: ESLint no-debugger
```

**Available Topics:**
- Linter rules (e.g., `noDebugger`, `useConst`)
- Documentation topics (e.g., `daemon-logs`)

**Exit Codes:**
- `0` - Documentation displayed successfully
- `1` - Rule or topic not found

---

### Clean Command

Clean logs emitted by the daemon server.

```bash { .api }
biome clean
```

**Usage Examples:**

```bash
# Clean all daemon logs
biome clean

# Useful after debugging sessions
biome rage --daemon-logs  # View logs
biome clean               # Remove logs
```

**Behavior:**
- Removes all log files from the Biome cache directory
- Default log location (platform-specific):
  - Linux: `~/.cache/biome/`
  - macOS: `~/Library/Caches/biome/`
  - Windows: `%LOCALAPPDATA%\biome\cache\`
- Respects `BIOME_LOG_PATH` environment variable
- Does not stop running daemon server

**Exit Codes:**
- `0` - Logs cleaned successfully
- `1` - Error accessing or removing log files

---

### Start Command

Start the Biome daemon server process.

```bash { .api }
biome start [OPTIONS]
```

**Options:**

```bash { .api }
# Prefix for log file names (default: "server.log")
--log-prefix-name <STRING>

# Directory where logs are stored
--log-path <PATH>
```

**Environment Variables:**
- `BIOME_LOG_PREFIX_NAME` - Alternative to `--log-prefix-name`
- `BIOME_LOG_PATH` - Alternative to `--log-path`

**Usage Examples:**

```bash
# Start daemon with defaults
biome start

# Start with custom log prefix
biome start --log-prefix-name=my-daemon

# Start with custom log directory
biome start --log-path=/tmp/biome-logs

# Start with environment variables
export BIOME_LOG_PATH=/var/log/biome
export BIOME_LOG_PREFIX_NAME=production
biome start
```

**Behavior:**
- Starts daemon server in background
- Server listens for connections via IPC
- Creates log file in specified or default location
- Log file: `{prefix}.{timestamp}.log`
- Server remains running until explicitly stopped or system reboot
- Only one daemon instance per user (per log path)

**Benefits:**
- Faster repeated command invocations
- Shared caching between commands
- Persistent process with warm state
- Reduced startup overhead

**Use Cases:**
- Development workflows with frequent Biome use
- Editor integration
- Git hook scripts
- Watch mode scenarios

**Exit Codes:**
- `0` - Daemon started successfully
- `1` - Error starting daemon (e.g., already running, permission denied)

---

### Stop Command

Stop the Biome daemon server process.

```bash { .api }
biome stop
```

**Usage Examples:**

```bash
# Stop running daemon
biome stop

# Typical workflow
biome start
biome check --use-server --write
biome format --use-server --write
biome stop
```

**Behavior:**
- Sends shutdown signal to running daemon
- Daemon gracefully stops after completing current operations
- Does not remove log files (use `biome clean` for that)
- Safe to call even if no daemon is running

**Exit Codes:**
- `0` - Daemon stopped successfully (or wasn't running)
- `1` - Error stopping daemon

---

### LSP Proxy Command

Act as a server for the Language Server Protocol over stdin/stdout.

```bash { .api }
biome lsp-proxy [OPTIONS]
```

**Options:**

```bash { .api }
# Prefix for log file names
--log-prefix-name <STRING>

# Directory where logs are stored
--log-path <PATH>

# Bogus argument for vscode-languageclient compatibility
--stdio
```

**Environment Variables:**
- `BIOME_LOG_PREFIX_NAME` - Alternative to `--log-prefix-name`
- `BIOME_LOG_PATH` - Alternative to `--log-path`

**Usage Examples:**

```bash
# Start LSP server
biome lsp-proxy

# Start with custom logging
biome lsp-proxy --log-prefix-name=lsp --log-path=/tmp/biome-lsp

# VS Code compatible invocation
biome lsp-proxy --stdio
```

**Behavior:**
- Runs Language Server Protocol server
- Communicates via stdin/stdout
- Provides real-time formatting and linting
- Integrates with editors and IDEs
- Supports LSP features:
  - Diagnostics (linting errors/warnings)
  - Formatting on save
  - Format on type
  - Code actions (quick fixes)
  - Hover information

**LSP Capabilities:**

Formatting:
- Document formatting
- Range formatting
- Format on save
- Format on paste

Linting:
- Real-time diagnostics
- Error/warning reporting
- Contextual information

Code Actions:
- Quick fixes for lint violations
- Safe fixes
- Unsafe fixes (with confirmation)
- Import organization

**Editor Integration:**

VS Code:
```json
{
  "biome.lspBin": "path/to/biome"
}
```

Neovim (with nvim-lspconfig):
```lua
require('lspconfig').biome.setup{}
```

Emacs (with lsp-mode):
```elisp
(add-to-list 'lsp-language-id-configuration '(typescript-mode . "typescript"))
(lsp-register-client
  (make-lsp-client
    :new-connection (lsp-stdio-connection '("biome" "lsp-proxy"))
    :major-modes '(typescript-mode js-mode)
    :server-id 'biome))
```

**Exit Codes:**
- Server runs indefinitely until connection closed
- Exit code depends on how connection is terminated

---

## Daemon Server Workflow

Complete workflow for using the Biome daemon:

### Starting the Daemon

```bash
# Start daemon
biome start

# Verify it's running
biome rage --daemon-logs
```

### Using the Daemon

```bash
# Commands with --use-server flag
biome check --use-server --write
biome format --use-server --write
biome lint --use-server --write

# Multiple invocations share the daemon
for file in *.ts; do
  biome format --use-server --write "$file"
done
```

### Stopping the Daemon

```bash
# Stop daemon
biome stop

# Clean up logs (optional)
biome clean
```

### Daemon Management

```bash
# Check daemon status
biome rage --daemon-logs

# Restart daemon
biome stop
biome clean
biome start

# Custom daemon configuration
export BIOME_LOG_PATH=/var/log/biome
export BIOME_LOG_PREFIX_NAME=production
biome start
```

---

## Advanced Debugging

Combine multiple features for comprehensive debugging:

```bash
# Enable verbose logging and collect information
export BIOME_LOG_PATH=./debug-logs
biome start --log-prefix-name=debug

# Run commands with verbose output
biome check --use-server --verbose --log-level=debug

# Collect diagnostic information
biome rage --daemon-logs --formatter --linter > debug-info.txt

# Explain specific issues
biome explain noUnusedVariables

# Clean up
biome stop
biome clean
```

---

## GritQL Pattern Examples

Common GritQL patterns for the search command:

```bash
# Find all console statements
biome search '`console.$method($args)`'

# Find TODO comments
biome search '`// TODO: $message`'

# Find specific import patterns
biome search '`import $name from "react"`'

# Find function declarations
biome search '`function $name($params) { $body }`'

# Find arrow functions
biome search '`($params) => $body`'

# Find JSX components
biome search '`<$Component $props />`'

# Find state hooks
biome search '`const [$state, $setState] = useState($initial)`'

# Find effect hooks
biome search '`useEffect($fn, $deps)`'

# Find async functions
biome search '`async function $name($params) { $body }`'

# Find try-catch blocks
biome search '`try { $body } catch ($err) { $handler }`'
```

---

## LSP Server Features

When running as LSP server, Biome provides:

### Real-time Diagnostics

- Syntax errors highlighted immediately
- Lint violations shown as you type
- Contextual error messages with quick fixes

### Formatting

- Format on save
- Format on paste
- Format selection
- Whole document formatting

### Code Actions

- Apply safe fixes
- Apply unsafe fixes (with confirmation)
- Suppress specific rules
- Organize imports
- Add missing imports

### Configuration

- Respects `biome.json` configuration
- Updates when configuration changes
- File-specific overrides via `overrides`

### Performance

- Incremental parsing and analysis
- Caches unchanged files
- Parallel processing
- Fast response times (<100ms typical)
