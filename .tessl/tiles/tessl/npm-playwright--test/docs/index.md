# Playwright Test

Playwright Test (@playwright/test) is a comprehensive end-to-end testing framework for modern web applications that enables automated testing across Chromium, Firefox, and WebKit browsers with a single API. It provides built-in test runner capabilities, parallel test execution, automatic waiting, screenshot and video recording, network interception, mobile device emulation, and cross-browser compatibility testing with robust debugging tools and CI/CD integration support.

## Package Information

- **Package Name**: @playwright/test
- **Package Type**: npm
- **Language**: TypeScript/JavaScript
- **Installation**: `npm install @playwright/test`

## Core Imports

```typescript
import { test, expect } from "@playwright/test";
```

For CommonJS:

```javascript
const { test, expect } = require("@playwright/test");
```

## Basic Usage

```typescript
import { test, expect } from "@playwright/test";

test("basic navigation and interaction", async ({ page }) => {
  // Navigate to a page
  await page.goto("https://example.com");
  
  // Interact with elements
  await page.click("button");
  await page.fill("input[name='username']", "testuser");
  
  // Make assertions
  await expect(page.locator("h1")).toHaveText("Welcome");
  await expect(page).toHaveURL(/.*dashboard/);
});

test.describe("User Authentication", () => {
  test("successful login", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#username", "admin");
    await page.fill("#password", "secret");
    await page.click("button[type='submit']");
    
    await expect(page).toHaveURL("/dashboard");
  });
});
```

## Architecture

Playwright Test is built around several key components:

- **Test Framework**: Core test declaration functions (`test`, `describe`) with built-in fixtures and lifecycle hooks
- **Browser Automation**: Cross-browser automation capabilities through Page, BrowserContext, and Browser objects
- **Assertion Library**: Web-specific assertions with built-in retry logic and automatic waiting
- **Fixture System**: Dependency injection for test setup including page, context, and browser instances
- **Configuration System**: Flexible configuration options for browsers, devices, execution modes, and reporting
- **Test Runner**: Parallel execution engine with worker isolation and intelligent test distribution

## Capabilities

### Test Framework Core

Essential test declaration, organization, and lifecycle management functions for structuring test suites.

```typescript { .api }
interface TestType<TestArgs, WorkerArgs> {
  (title: string, testFunction: (args: TestArgs) => Promise<void>): void;
  only: (title: string, testFunction: (args: TestArgs) => Promise<void>) => void;
  skip: (title: string, testFunction: (args: TestArgs) => Promise<void>) => void;
  fixme: (title: string, testFunction: (args: TestArgs) => Promise<void>) => void;
  slow: (title: string, testFunction: (args: TestArgs) => Promise<void>) => void;
  fail: (title: string, testFunction: (args: TestArgs) => Promise<void>) => void;
  
  describe: {
    (title: string, callback: () => void): void;
    only: (title: string, callback: () => void) => void;
    skip: (title: string, callback: () => void) => void;
    fixme: (title: string, callback: () => void) => void;
    serial: (title: string, callback: () => void) => void;
    parallel: (title: string, callback: () => void) => void;
    configure: (options: { mode?: 'default' | 'parallel' | 'serial' }) => void;
  };
  
  beforeEach: (hookFunction: (args: TestArgs) => Promise<void>) => void;
  afterEach: (hookFunction: (args: TestArgs) => Promise<void>) => void;
  beforeAll: (hookFunction: (args: WorkerArgs) => Promise<void>) => void;
  afterAll: (hookFunction: (args: WorkerArgs) => Promise<void>) => void;
  
  extend<T, W>(fixtures: Fixtures<T, W>): TestType<TestArgs & T, WorkerArgs & W>;
  use: (options: TestOptions) => void;
  step<T>(title: string, body: () => Promise<T>): Promise<T>;
  info(): TestInfo;
}

const test: TestType<PlaywrightTestArgs & PlaywrightTestOptions, PlaywrightWorkerArgs & PlaywrightWorkerOptions>;

/**
 * Base test without built-in fixtures - for custom test implementations
 */
const _baseTest: TestType<{}, {}>;
```

[Test Framework Core](./test-framework.md)

### Browser Automation

Complete browser automation API providing page interaction, element manipulation, and navigation across multiple browsers.

```typescript { .api }
interface Page {
  goto(url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }): Promise<Response>;
  click(selector: string, options?: { timeout?: number }): Promise<void>;
  fill(selector: string, value: string): Promise<void>;
  press(selector: string, key: string): Promise<void>;
  waitForSelector(selector: string, options?: { timeout?: number }): Promise<ElementHandle>;
  locator(selector: string): Locator;
  screenshot(options?: { path?: string; fullPage?: boolean }): Promise<Buffer>;
}

interface BrowserContext {
  newPage(): Promise<Page>;
  close(): Promise<void>;
}

interface Browser {
  newContext(options?: BrowserContextOptions): Promise<BrowserContext>;
  close(): Promise<void>;
}
```

[Browser Automation](./browser-automation.md)

### Assertions and Expectations

Web-specific assertion library with automatic waiting and retry logic for reliable test assertions.

```typescript { .api }
interface Expect {
  <T>(actual: T): PlaywrightAssertions<T>;
  soft<T>(actual: T): PlaywrightAssertions<T>;
  poll<T>(actual: () => T | Promise<T>): PlaywrightAssertions<T>;
  extend<T>(matchers: CustomMatchers<T>): void;
  configure(options: { timeout?: number; soft?: boolean }): void;
}

interface PlaywrightAssertions<T> {
  toEqual(expected: T): Promise<void>;
  toHaveText(expected: string | RegExp): Promise<void>;
  toHaveValue(expected: string): Promise<void>;
  toBeVisible(): Promise<void>;
  toBeEnabled(): Promise<void>;
  toHaveURL(expected: string | RegExp): Promise<void>;
}

const expect: Expect;
```

[Assertions](./assertions.md)

### Configuration and Setup

Configuration system for test execution, browser options, and project setup with support for multiple environments.

```typescript { .api }
interface PlaywrightTestConfig {
  projects?: TestProject[];
  use?: PlaywrightTestOptions;
  testDir?: string;
  timeout?: number;
  retries?: number;
  workers?: number;
  reporter?: ReporterDescription[];
  outputDir?: string;
}

interface TestProject {
  name: string;
  use?: PlaywrightTestOptions;
  testDir?: string;
  testIgnore?: string | RegExp | (string | RegExp)[];
}

function defineConfig(config: PlaywrightTestConfig): PlaywrightTestConfig;
```

[Configuration](./configuration.md)

### Test Reporting

Comprehensive reporting system with built-in reporters and custom reporter support for various output formats.

```typescript { .api }
interface Reporter {
  onBegin?(config: FullConfig, suite: Suite): void;
  onTestBegin?(test: TestCase, result: TestResult): void;
  onTestEnd?(test: TestCase, result: TestResult): void;
  onEnd?(result: FullResult): void;
}

interface TestResult {
  status: 'passed' | 'failed' | 'timedOut' | 'skipped';
  duration: number;
  errors: TestError[];
  attachments: Attachment[];
}

type ReporterDescription = 
  | 'list' 
  | 'dot' 
  | 'line' 
  | 'json' 
  | 'junit' 
  | 'html' 
  | 'blob' 
  | 'github'
  | [string, any];
```

[Reporting](./reporting.md)

## Core Types

### Built-in Fixtures

```typescript { .api }
interface PlaywrightTestArgs {
  page: Page;
  context: BrowserContext;
  browser: Browser;
  browserName: 'chromium' | 'firefox' | 'webkit';
  request: APIRequestContext;
}

interface PlaywrightWorkerArgs {
  playwright: Playwright;
  browserName: 'chromium' | 'firefox' | 'webkit';
}
```

### Test Configuration Options

```typescript { .api }
interface PlaywrightTestOptions {
  baseURL?: string;
  headless?: boolean;
  viewport?: { width: number; height: number } | null;
  ignoreHTTPSErrors?: boolean;
  screenshot?: 'off' | 'only-on-failure' | 'on';
  video?: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
  trace?: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
  storageState?: string | { cookies: Cookie[]; origins: Origin[] };
}
```

### Test Information

```typescript { .api }
interface TestInfo {
  annotations: Array<{
    type: string;
    description?: string;
  }>;
  attachments: Array<{
    name: string;
    contentType: string;
    path?: string;
    body?: string | Buffer;
  }>;
  column: number;
  config: FullConfig;
  duration: number;
  errors: Array<TestInfoError>;
  expectedStatus: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
  file: string;
  fn: Function;
  line: number;
  outputDir: string;
  parallelIndex: number;
  project: FullProject;
  repeatEachIndex: number;
  retry: number;
  snapshotDir: string;
  snapshotSuffix: string;
  status?: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
  tags: Array<string>;
  testId: string;
  timeout: number;
  title: string;
  titlePath: Array<string>;
  workerIndex: number;
  
  // Methods
  snapshotPath(...name: ReadonlyArray<string>): string;
  snapshotPath(name: string, options?: { kind?: 'screenshot' | 'aria' | 'snapshot' }): string;
  outputPath(...pathSegments: ReadonlyArray<string>): string;
  skip(condition?: boolean, description?: string): void;
  fixme(condition?: boolean, description?: string): void;
  fail(condition?: boolean, description?: string): void;
  slow(condition?: boolean, description?: string): void;
  setTimeout(timeout: number): void;
}

interface WorkerInfo {
  config: FullConfig;
  parallelIndex: number;
  project: FullProject;
  workerIndex: number;
}
```