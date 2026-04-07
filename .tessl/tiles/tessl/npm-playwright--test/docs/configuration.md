# Configuration

Configuration system for test execution, browser options, and project setup with support for multiple environments, parallel execution, and custom reporting.

## Capabilities

### Configuration Definition

Main function for defining Playwright Test configuration with support for multiple projects and shared options.

```typescript { .api }
/**
 * Define Playwright Test configuration with type safety
 * @param config - Configuration object with test settings
 * @returns Typed configuration object
 */
function defineConfig(config: PlaywrightTestConfig): PlaywrightTestConfig;

/**
 * Define configuration with custom fixtures
 * @param config - Configuration object with custom fixture types
 * @returns Typed configuration with extended fixtures  
 */
function defineConfig<TestArgs, WorkerArgs>(
  config: PlaywrightTestConfig<TestArgs, WorkerArgs>
): PlaywrightTestConfig<TestArgs, WorkerArgs>;
```

**Usage Examples:**

```typescript
import { defineConfig, devices } from "@playwright/test";

// Basic configuration
export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
});

// Multi-project configuration
export default defineConfig({
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox", 
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
```

### Test Configuration Interface

Main configuration interface for global test settings and project definitions.

```typescript { .api }
interface PlaywrightTestConfig<TestArgs = {}, WorkerArgs = {}> {
  /**
   * Directory containing test files
   */
  testDir?: string;
  
  /**
   * Test timeout in milliseconds
   */
  timeout?: number;
  
  /**
   * Maximum number of test retries
   */
  retries?: number;
  
  /**
   * Number of parallel worker processes
   */
  workers?: number;
  
  /**
   * Shared options for all tests
   */
  use?: UseOptions<TestArgs, WorkerArgs>;
  
  /**
   * Project configurations for multi-project setup
   */
  projects?: TestProject<TestArgs, WorkerArgs>[];
  
  /**
   * Reporter configuration
   */
  reporter?: ReporterDescription[];
  
  /**
   * Output directory for test artifacts
   */
  outputDir?: string;
  
  /**
   * Test file patterns to match
   */
  testMatch?: string | RegExp | (string | RegExp)[];
  
  /**
   * Test file patterns to ignore
   */
  testIgnore?: string | RegExp | (string | RegExp)[];
  
  /**
   * Global setup file
   */
  globalSetup?: string;
  
  /**
   * Global teardown file
   */
  globalTeardown?: string;
  
  /**
   * Maximum number of test failures before stopping
   */
  maxFailures?: number;
  
  /**
   * Expect configuration
   */
  expect?: {
    timeout?: number;
    toHaveScreenshot?: {
      threshold?: number;
      mode?: 'buffer' | 'base64';
    };
    toMatchSnapshot?: {
      threshold?: number;
      mode?: 'buffer' | 'base64';
    };
  };
  
  /**
   * Web server configuration for development servers
   */
  webServer?: {
    command: string;
    port?: number;
    url?: string;
    timeout?: number;
    reuseExistingServer?: boolean;
  };
}
```

### Project Configuration

Project-specific configuration for multi-browser and multi-environment testing.

```typescript { .api }
interface TestProject<TestArgs = {}, WorkerArgs = {}> {
  /**
   * Project identifier name
   */
  name: string;
  
  /**
   * Project-specific test options
   */
  use?: UseOptions<TestArgs, WorkerArgs>;
  
  /**
   * Test directory for this project
   */
  testDir?: string;
  
  /**
   * Test file patterns to match for this project
   */
  testMatch?: string | RegExp | (string | RegExp)[];
  
  /**
   * Test file patterns to ignore for this project
   */
  testIgnore?: string | RegExp | (string | RegExp)[];
  
  /**
   * Project dependencies (other projects that must run first)
   */
  dependencies?: string[];
  
  /**
   * Timeout for tests in this project
   */
  timeout?: number;
  
  /**
   * Project-specific output directory
   */
  outputDir?: string;
  
  /**
   * Project-specific retries configuration
   */
  retries?: number;
}
```

### Test Options

Comprehensive test execution options including browser configuration, debugging tools, and test behavior settings.

```typescript { .api }
interface PlaywrightTestOptions {
  /**
   * Base URL for page navigation
   */
  baseURL?: string;
  
  /**
   * Browser execution mode
   */
  headless?: boolean;
  
  /**
   * Browser viewport size
   */
  viewport?: { width: number; height: number } | null;
  
  /**
   * Browser type selection
   */
  browserName?: 'chromium' | 'firefox' | 'webkit';
  
  /**
   * Browser launch options
   */
  launchOptions?: LaunchOptions;
  
  /**
   * Browser context options
   */
  contextOptions?: BrowserContextOptions;
  
  /**
   * Ignore HTTPS certificate errors
   */
  ignoreHTTPSErrors?: boolean;
  
  /**
   * Screenshot capture mode
   */
  screenshot?: 'off' | 'only-on-failure' | 'on';
  
  /**
   * Video recording mode  
   */
  video?: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
  
  /**
   * Execution trace recording mode
   */
  trace?: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
  
  /**
   * Browser storage state for authentication persistence
   */
  storageState?: string | { cookies: Cookie[]; origins: Origin[] };
  
  /**
   * User locale for browser
   */
  locale?: string;
  
  /**
   * Timezone for browser
   */
  timezoneId?: string;
  
  /**
   * Geolocation coordinates
   */
  geolocation?: { latitude: number; longitude: number };
  
  /**
   * Browser permissions
   */
  permissions?: string[];
  
  /**
   * Color scheme preference
   */
  colorScheme?: 'light' | 'dark' | 'no-preference';
  
  /**
   * Extra HTTP headers
   */
  extraHTTPHeaders?: { [key: string]: string };
  
  /**
   * HTTP authentication credentials
   */
  httpCredentials?: { username: string; password: string };
  
  /**
   * Offline mode simulation
   */
  offline?: boolean;
  
  /**
   * Download behavior
   */
  acceptDownloads?: boolean;
}
```

### Device Configuration

Pre-configured device settings for mobile and desktop testing.

```typescript { .api }
/**
 * Pre-configured device settings
 */
const devices: {
  'Desktop Chrome': PlaywrightTestOptions;
  'Desktop Firefox': PlaywrightTestOptions;
  'Desktop Safari': PlaywrightTestOptions;
  'iPhone 12': PlaywrightTestOptions;
  'iPhone 13': PlaywrightTestOptions;
  'Pixel 5': PlaywrightTestOptions;
  'iPad Pro': PlaywrightTestOptions;
  [deviceName: string]: PlaywrightTestOptions;
};
```

**Usage Examples:**

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  projects: [
    // Desktop browsers
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    // Mobile devices
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
});
```

### Test Utilities

Helper functions for advanced test configuration scenarios.

```typescript { .api }
/**
 * Merge multiple test types with different fixtures
 * @param tests - Array of test objects to merge
 * @returns Combined test object with merged fixtures
 */
function mergeTests<T extends Record<string, any>[]>(...tests: T): MergedTest<T>;

/**
 * Merge multiple expect implementations
 * @param expects - Array of expect objects to merge
 * @returns Combined expect with merged matchers
 */
function mergeExpects<T extends Record<string, any>[]>(...expects: T): MergedExpect<T>;
```

**Usage Examples:**

```typescript
import { test as base, expect as baseExpect, mergeTests, mergeExpects } from "@playwright/test";
import { test as dbTest, expect as dbExpect } from "./fixtures/database";
import { test as apiTest, expect as apiExpected } from "./fixtures/api";

// Merge test fixtures
export const test = mergeTests(base, dbTest, apiTest);

// Merge expect matchers  
export const expect = mergeExpects(baseExpected, dbExpect, apiExpected);
```

### Environment Configuration

Configuration options for test environment setup and teardown.

```typescript { .api }
interface WebServerConfig {
  /**
   * Command to start the development server
   */
  command: string;
  
  /**
   * Port number for the server
   */
  port?: number;
  
  /**
   * URL to check server availability
   */
  url?: string;
  
  /**
   * Timeout for server startup in milliseconds
   */
  timeout?: number;
  
  /**
   * Whether to reuse existing server instance
   */
  reuseExistingServer?: boolean;
  
  /**
   * Working directory for server command
   */
  cwd?: string;
  
  /**
   * Environment variables for server process
   */
  env?: { [key: string]: string };
}
```

**Usage Examples:**

```typescript
export default defineConfig({
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
});
```