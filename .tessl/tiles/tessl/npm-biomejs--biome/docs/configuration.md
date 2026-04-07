# Configuration

Biome configuration management including initialization, migration, and configuration file structure.

## Capabilities

### Initialize Command

Bootstrap a new Biome project with a configuration file.

```bash { .api }
biome init [OPTIONS]
```

**Options:**

```bash { .api }
# Create biome.jsonc instead of biome.json
--jsonc
```

**Usage Examples:**

```bash
# Create biome.json with defaults
biome init

# Create biome.jsonc (JSON with comments)
biome init --jsonc
```

**Behavior:**
- Creates `biome.json` (or `biome.jsonc` with `--jsonc`) in current directory
- Sets sensible defaults for formatter and linter
- Automatically detects `.gitignore` and enables VCS integration if found
- Automatically detects `dist/` folder and adds to ignored paths
- Fails if configuration file already exists

**Generated Configuration:**
```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.8/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignores": ["dist"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

**Exit Codes:**
- `0` - Configuration file created successfully
- `1` - Error (e.g., file already exists, permission denied)

---

### Migrate Command

Update configuration when there are breaking changes or migrate from other tools.

```bash { .api }
biome migrate [OPTIONS] [SUBCOMMAND]
```

**Options:**

```bash { .api }
# Write the new configuration to disk
--write
```

**Usage Examples:**

```bash
# Migrate Prettier configuration (dry run)
biome migrate prettier

# Migrate Prettier and write to disk
biome migrate prettier --write

# Migrate ESLint configuration
biome migrate eslint --write
```

**Behavior:**
- Without `--write`: Shows proposed changes without modifying files
- With `--write`: Updates `biome.json` with migrated configuration
- Preserves existing Biome configuration and merges with migrated settings

---

#### Migrate Prettier Subcommand

Migrate Prettier configuration to Biome.

```bash { .api }
biome migrate prettier [OPTIONS]
```

**Detected Files:**
- `.prettierrc`
- `.prettierrc.json`
- `.prettierrc.js`
- `prettier.config.js`
- `.prettierignore`

**Migrated Settings:**

Formatter options:
- `printWidth` → `formatter.lineWidth`
- `tabWidth` → `formatter.indentWidth`
- `useTabs` → `formatter.indentStyle` (`"tab"` or `"space"`)
- `semi` → `javascript.formatter.semicolons`
- `singleQuote` → `javascript.formatter.quoteStyle`
- `quoteProps` → `javascript.formatter.quoteProperties`
- `jsxSingleQuote` → `javascript.formatter.jsxQuoteStyle`
- `trailingComma` → `javascript.formatter.trailingCommas`
- `bracketSpacing` → `javascript.formatter.bracketSpacing`
- `bracketSameLine` → `javascript.formatter.bracketSameLine`
- `arrowParens` → `javascript.formatter.arrowParentheses`
- `endOfLine` → `formatter.lineEnding`

Ignore patterns:
- `.prettierignore` → `files.ignores`

**Usage Examples:**

```bash
# Preview Prettier migration
biome migrate prettier

# Apply Prettier migration
biome migrate prettier --write
```

**Exit Codes:**
- `0` - Migration successful
- `1` - Error (e.g., no Prettier config found, invalid configuration)

---

#### Migrate ESLint Subcommand

Migrate ESLint configuration to Biome.

```bash { .api }
biome migrate eslint [OPTIONS]
```

**Options:**

```bash { .api }
# Include rules inspired by ESLint rules
--include-inspired

# Include nursery (experimental) rules
--include-nursery
```

**Detected Files:**
- `.eslintrc`
- `.eslintrc.json`
- `.eslintrc.js`
- `eslint.config.js`
- `.eslintignore`

**Migrated Rules:**

Biome includes equivalents or inspired versions of many ESLint rules:
- Core ESLint rules (e.g., `no-unused-vars`, `no-debugger`, `eqeqeq`)
- typescript-eslint rules (e.g., `@typescript-eslint/no-explicit-any`)
- React plugin rules (e.g., `react/jsx-key`, `react-hooks/rules-of-hooks`)
- JSX-a11y plugin rules (e.g., `jsx-a11y/alt-text`)
- Import plugin rules (e.g., `import/no-duplicates`)

**Conversion:**
- ESLint rule severity `"error"` → Biome `"error"`
- ESLint rule severity `"warn"` → Biome `"warn"`
- ESLint rule severity `"off"` → Biome `"off"`
- ESLint `0`, `1`, `2` → Biome `"off"`, `"warn"`, `"error"`

Ignore patterns:
- `.eslintignore` → `files.ignores`

**Usage Examples:**

```bash
# Preview ESLint migration
biome migrate eslint

# Apply ESLint migration
biome migrate eslint --write

# Include inspired rules
biome migrate eslint --write --include-inspired

# Include nursery rules
biome migrate eslint --write --include-nursery
```

**Exit Codes:**
- `0` - Migration successful
- `1` - Error (e.g., no ESLint config found, invalid configuration)

---

## Configuration File Structure

Biome configuration is stored in `biome.json` or `biome.jsonc` (JSON with comments).

### Top-Level Configuration

```typescript { .api }
interface BiomeConfiguration {
  // JSON schema URL for editor support
  $schema?: string;

  // Whether this is the root configuration
  root?: boolean;

  // Paths to other configuration files to extend
  extends?: string[];

  // File system configuration
  files?: FilesConfiguration;

  // Formatter configuration
  formatter?: FormatterConfiguration;

  // Linter configuration
  linter?: LinterConfiguration;

  // Assist configuration
  assist?: AssistConfiguration;

  // Language-specific configurations
  javascript?: JavaScriptConfiguration;
  json?: JsonConfiguration;
  css?: CssConfiguration;
  graphql?: GraphqlConfiguration;
  html?: HtmlConfiguration;
  grit?: GritConfiguration;

  // Version control system configuration
  vcs?: VcsConfiguration;

  // Configuration overrides for specific file patterns
  overrides?: OverrideConfiguration[];

  // Plugins to load
  plugins?: string[];
}
```

---

### Files Configuration

Controls which files Biome processes and how.

```typescript { .api }
interface FilesConfiguration {
  // Glob patterns for files to include
  includes?: string[];

  // Glob patterns for files to ignore
  ignores?: string[];

  // Maximum file size to process (in bytes)
  maxSize?: number;

  // Ignore files with unknown extensions
  ignoreUnknown?: boolean;

  // Experimental scanner-level ignore patterns
  experimentalScannerIgnores?: string[];
}
```

**Example:**

```json
{
  "files": {
    "includes": ["src/**/*.ts", "src/**/*.tsx"],
    "ignores": [
      "dist/**",
      "build/**",
      "node_modules/**",
      "**/*.min.js"
    ],
    "maxSize": 1048576,
    "ignoreUnknown": true,
    "experimentalScannerIgnores": [".cache/**", ".git/**"]
  }
}
```

**Glob Pattern Syntax:**
- `*` - Matches any characters except `/`
- `**` - Matches any characters including `/`
- `?` - Matches single character
- `[abc]` - Matches one character from set
- `{a,b}` - Matches either `a` or `b`

---

### Formatter Configuration

Controls code formatting behavior.

```typescript { .api }
interface FormatterConfiguration {
  // Enable or disable formatter
  enabled?: boolean;

  // Allow formatting files with syntax errors
  formatWithErrors?: boolean;

  // Indent style: "tab" or "space"
  indentStyle?: "tab" | "space";

  // Number of spaces per indent level (if indentStyle is "space")
  indentWidth?: number;

  // Maximum line width before wrapping
  lineWidth?: number;

  // Line ending style
  lineEnding?: "lf" | "crlf" | "cr";

  // How to position attributes in HTML/JSX
  attributePosition?: "auto" | "multiline";

  // Add spaces inside object/array brackets
  bracketSpacing?: boolean;

  // Whether to place closing bracket on same line
  bracketSameLine?: boolean;

  // Control property expansion in objects/arrays
  expand?: "auto" | "always" | "never";

  // Read and apply .editorconfig settings
  useEditorconfig?: boolean;

  // File patterns to include in formatting
  includes?: string[];

  // File patterns to ignore in formatting
  ignore?: string[];
}
```

**Example:**

```json
{
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80,
    "lineEnding": "lf",
    "bracketSpacing": true,
    "bracketSameLine": false,
    "expand": "auto",
    "useEditorconfig": true
  }
}
```

**Defaults:**
- `enabled`: `true`
- `indentStyle`: `"space"`
- `indentWidth`: `2`
- `lineWidth`: `80`
- `lineEnding`: `"lf"`
- `bracketSpacing`: `true`
- `bracketSameLine`: `false`
- `expand`: `"auto"`
- `useEditorconfig`: `false`

---

### Linter Configuration

Controls linting behavior and rule configuration.

```typescript { .api }
interface LinterConfiguration {
  // Enable or disable linter
  enabled?: boolean;

  // Rule configuration by category
  rules?: RulesConfiguration;

  // File patterns to include in linting
  includes?: string[];

  // File patterns to ignore in linting
  ignore?: string[];
}

interface RulesConfiguration {
  // Enable all recommended rules
  recommended?: boolean;

  // Rule group configurations
  a11y?: RuleGroupConfiguration;
  complexity?: RuleGroupConfiguration;
  correctness?: RuleGroupConfiguration;
  nursery?: RuleGroupConfiguration;
  performance?: RuleGroupConfiguration;
  security?: RuleGroupConfiguration;
  style?: RuleGroupConfiguration;
  suspicious?: RuleGroupConfiguration;
}

interface RuleGroupConfiguration {
  // Enable all rules in this group
  all?: boolean;

  // Enable recommended rules in this group
  recommended?: boolean;

  // Individual rule configurations
  [ruleName: string]: RuleConfiguration | boolean;
}

type RuleConfiguration =
  | "off"
  | "warn"
  | "error"
  | {
      level: "off" | "warn" | "error";
      options?: any;
    };
```

**Example:**

```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn",
        "noDebugger": "error"
      },
      "style": {
        "useConst": "error",
        "useTemplate": "warn"
      },
      "nursery": {
        "recommended": false
      }
    }
  }
}
```

**Rule Groups:**
- `a11y` - Accessibility rules (e.g., `noAccessKey`, `noAutofocus`)
- `complexity` - Code complexity rules (e.g., `noExcessiveCognitiveComplexity`)
- `correctness` - Correctness rules (e.g., `noUnusedVariables`, `noUnreachable`)
- `nursery` - Experimental rules (disabled in recommended by default)
- `performance` - Performance rules (e.g., `noAccumulatingSpread`)
- `security` - Security rules (e.g., `noDangerouslySetInnerHtml`)
- `style` - Style rules (e.g., `useConst`, `useTemplate`)
- `suspicious` - Suspicious code patterns (e.g., `noExplicitAny`, `noDebugger`)

---

### Assist Configuration

Controls code assist features.

```typescript { .api }
interface AssistConfiguration {
  // Enable or disable assists
  enabled?: boolean;

  // Configure assist actions
  actions?: AssistActionsConfiguration;
}

interface AssistActionsConfiguration {
  // Enable recommended assists
  recommended?: boolean;

  // Source code action configuration
  source?: SourceActionsConfiguration;
}

interface SourceActionsConfiguration {
  // Organize imports action
  organizeImports?: AssistAction;
}

type AssistAction =
  | "on"
  | "off"
  | {
      enabled: boolean;
      options?: any;
    };
```

**Example:**

```json
{
  "assist": {
    "enabled": true,
    "actions": {
      "recommended": true,
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

---

### Language-Specific Configuration

#### JavaScript/TypeScript Configuration

```typescript { .api }
interface JavaScriptConfiguration {
  // Parser options
  parser?: {
    unsafeParameterDecoratorsEnabled?: boolean;
  };

  // Formatter overrides for JavaScript/TypeScript
  formatter?: {
    quoteStyle?: "single" | "double";
    jsxQuoteStyle?: "single" | "double";
    quoteProperties?: "asNeeded" | "preserve";
    trailingCommas?: "all" | "es5" | "none";
    semicolons?: "always" | "asNeeded";
    arrowParentheses?: "always" | "asNeeded";
    bracketSameLine?: boolean;
    bracketSpacing?: boolean;
    attributePosition?: "auto" | "multiline";
  };

  // Linter rule overrides for JavaScript/TypeScript
  linter?: {
    enabled?: boolean;
  };

  // Global variables
  globals?: string[];
}
```

**Example:**

```json
{
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "trailingCommas": "es5",
      "semicolons": "always",
      "arrowParentheses": "always",
      "bracketSameLine": false
    },
    "globals": ["window", "document", "$", "jQuery"]
  }
}
```

#### JSON Configuration

```typescript { .api }
interface JsonConfiguration {
  // Parser options
  parser?: {
    allowComments?: boolean;
    allowTrailingCommas?: boolean;
  };

  // Formatter overrides for JSON
  formatter?: {
    trailingCommas?: "none" | "all";
  };

  // Linter rule overrides for JSON
  linter?: {
    enabled?: boolean;
  };
}
```

**Example:**

```json
{
  "json": {
    "parser": {
      "allowComments": true,
      "allowTrailingCommas": false
    },
    "formatter": {
      "trailingCommas": "none"
    }
  }
}
```

#### CSS Configuration

```typescript { .api }
interface CssConfiguration {
  // Parser options
  parser?: {
    cssModules?: boolean;
  };

  // Formatter overrides for CSS
  formatter?: {
    enabled?: boolean;
    indentStyle?: "tab" | "space";
    indentWidth?: number;
    lineWidth?: number;
  };

  // Linter rule overrides for CSS
  linter?: {
    enabled?: boolean;
  };
}
```

#### GraphQL Configuration

```typescript { .api }
interface GraphqlConfiguration {
  // Linter rule overrides for GraphQL
  linter?: {
    enabled?: boolean;
  };
}
```

#### HTML Configuration

```typescript { .api }
interface HtmlConfiguration {
  // Formatter overrides for HTML
  formatter?: {
    enabled?: boolean;
  };

  // Linter rule overrides for HTML
  linter?: {
    enabled?: boolean;
  };
}
```

#### Grit Configuration

Configuration for the experimental Grit pattern language search feature.

```typescript { .api }
interface GritConfiguration {
  // Currently empty - reserved for future Grit-specific options
}
```

**Note:** Grit support is experimental. The configuration is reserved for future use when Grit-specific options become available.

---

### VCS Configuration

Version control system integration.

```typescript { .api }
interface VcsConfiguration {
  // Enable VCS integration
  enabled?: boolean;

  // VCS client type
  clientKind?: "git";

  // Use VCS ignore file (.gitignore)
  useIgnoreFile?: boolean;

  // VCS root directory
  root?: string;

  // Default branch for --changed comparisons
  defaultBranch?: string;
}
```

**Example:**

```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  }
}
```

**Features:**
- Automatically respects `.gitignore` when `useIgnoreFile` is true
- `--changed` flag compares against `defaultBranch`
- `--staged` flag processes files in Git staging area

---

### Overrides Configuration

Apply different configuration for specific file patterns.

```typescript { .api }
interface OverrideConfiguration {
  // Glob patterns to include
  includes?: string[];

  // Glob patterns to ignore
  ignores?: string[];

  // Override formatter configuration
  formatter?: Partial<FormatterConfiguration>;

  // Override linter configuration
  linter?: Partial<LinterConfiguration>;

  // Override language-specific configuration
  javascript?: Partial<JavaScriptConfiguration>;
  json?: Partial<JsonConfiguration>;
  css?: Partial<CssConfiguration>;
  graphql?: Partial<GraphqlConfiguration>;
  html?: Partial<HtmlConfiguration>;
}
```

**Example:**

```json
{
  "overrides": [
    {
      "includes": ["*.test.ts", "*.spec.ts"],
      "linter": {
        "rules": {
          "suspicious": {
            "noExplicitAny": "off"
          }
        }
      }
    },
    {
      "includes": ["*.config.js"],
      "formatter": {
        "lineWidth": 120
      }
    },
    {
      "includes": ["src/legacy/**"],
      "linter": {
        "enabled": false
      }
    }
  ]
}
```

**Behavior:**
- Overrides are applied in order
- Later overrides take precedence over earlier ones
- Patterns are relative to configuration file location

---

### Extends Configuration

Extend configuration from other files.

```typescript { .api }
interface BiomeConfiguration {
  extends?: string[];
}
```

**Example:**

```json
{
  "extends": [
    "./base-config.json",
    "./team-config.json"
  ],
  "formatter": {
    "lineWidth": 100
  }
}
```

**Behavior:**
- Extended configurations are loaded and merged in order
- Local configuration overrides extended configuration
- Relative paths resolved from current configuration file
- Can extend multiple files

---

## Configuration Discovery

Biome searches for configuration files in the following order:

1. Path specified via `--config-path` CLI option
2. Path specified via `BIOME_CONFIG_PATH` environment variable
3. `biome.json` or `biome.jsonc` in current directory
4. Walk up directory tree looking for configuration file
5. Stop at configuration file with `"root": true`
6. If no configuration found, use default settings

**Example Directory Structure:**

```
/project
  biome.json (root: true)
  /src
    /components
      biome.json (overrides for components)
```

When running Biome in `/project/src/components`:
1. Loads `/project/src/components/biome.json`
2. Walks up and loads `/project/biome.json`
3. Stops at `/project/biome.json` because `root: true`
4. Merges configurations (components config overrides root config)

---

## Schema Validation

Biome configuration files support JSON schema for editor validation:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.8/schema.json"
}
```

**Benefits:**
- Auto-completion in editors (VS Code, IntelliJ, etc.)
- Inline validation of configuration options
- Documentation on hover
- Error detection before running Biome

**Version-Specific Schemas:**
- Use version-specific schema URL: `https://biomejs.dev/schemas/{VERSION}/schema.json`
- Latest version: `https://biomejs.dev/schemas/latest/schema.json`
- Local schema also available: `packages/@biomejs/biome/configuration_schema.json`
