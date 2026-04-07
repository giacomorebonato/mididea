# Test Framework Core

Essential test declaration, organization, and lifecycle management functions for structuring robust test suites with built-in fixtures and configuration options.

## Capabilities

### Test Declaration

Main function for declaring individual test cases with automatic fixture injection.

```typescript { .api }
/**
 * Declares a test case with built-in fixtures
 * @param title - Descriptive name for the test
 * @param testFunction - Async function containing test logic with fixture parameters
 */
function test(
  title: string, 
  testFunction: (fixtures: PlaywrightTestArgs & PlaywrightTestOptions) => Promise<void>
): void;

/**
 * Declares a test case with additional metadata
 * @param title - Descriptive name for the test
 * @param details - Test annotations and configuration
 * @param testFunction - Async function containing test logic
 */
function test(
  title: string,
  details: { tag?: string | string[]; annotation?: { type: string; description?: string }[] },
  testFunction: (fixtures: PlaywrightTestArgs & PlaywrightTestOptions) => Promise<void>
): void;
```

**Usage Examples:**

```typescript
import { test, expect } from "@playwright/test";

// Basic test
test("should load homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
});

// Test with metadata
test("should handle user login", 
  { tag: ["@auth", "@critical"] },
  async ({ page }) => {
    await page.goto("/login");
    // test logic
  }
);
```

### Test Modifiers

Functions for controlling test execution behavior and marking test states.

```typescript { .api }
/**
 * Focuses execution on specific tests only
 * @param title - Test title
 * @param testFunction - Test implementation
 */
test.only(title: string, testFunction: (fixtures: PlaywrightTestArgs) => Promise<void>): void;

/**
 * Skips test execution conditionally or unconditionally
 * @param title - Test title
 * @param testFunction - Test implementation
 */
test.skip(title: string, testFunction: (fixtures: PlaywrightTestArgs) => Promise<void>): void;

/**
 * Marks test as needing fixes (skip with TODO marker)
 * @param title - Test title
 * @param testFunction - Test implementation
 */
test.fixme(title: string, testFunction: (fixtures: PlaywrightTestArgs) => Promise<void>): void;

/**
 * Marks test as slow running (triples timeout)
 * @param title - Test title
 * @param testFunction - Test implementation
 */  
test.slow(title: string, testFunction: (fixtures: PlaywrightTestArgs) => Promise<void>): void;

/**
 * Marks test as expected to fail
 * @param title - Test title
 * @param testFunction - Test implementation
 */
test.fail(title: string, testFunction: (fixtures: PlaywrightTestArgs) => Promise<void>): void;
```

**Usage Examples:**

```typescript
// Focus on specific test during development
test.only("debug this specific test", async ({ page }) => {
  // This is the only test that will run
});

// Skip test conditionally
test.skip("skip on mobile", async ({ page, isMobile }) => {
  test.skip(isMobile, "Feature not supported on mobile");
  // test logic
});

// Mark as needing attention
test.fixme("fix broken authentication", async ({ page }) => {
  // This test will be skipped until fixed
});
```

### Test Organization

Functions for grouping and organizing tests into logical suites.

```typescript { .api }
/**
 * Groups related tests into a describe block
 * @param title - Suite description
 * @param callback - Function containing test declarations
 */
test.describe(title: string, callback: () => void): void;

/**
 * Focus execution on entire test suite
 * @param title - Suite description  
 * @param callback - Function containing test declarations
 */
test.describe.only(title: string, callback: () => void): void;

/**
 * Skip entire test suite
 * @param title - Suite description
 * @param callback - Function containing test declarations
 */
test.describe.skip(title: string, callback: () => void): void;

/**
 * Mark entire suite as needing fixes
 * @param title - Suite description
 * @param callback - Function containing test declarations
 */
test.describe.fixme(title: string, callback: () => void): void;

/**
 * Run tests in suite serially (one after another)
 * @param title - Suite description
 * @param callback - Function containing test declarations
 */
test.describe.serial(title: string, callback: () => void): void;

/**
 * Run tests in suite in parallel (default behavior)
 * @param title - Suite description
 * @param callback - Function containing test declarations
 */
test.describe.parallel(title: string, callback: () => void): void;

/**
 * Configure suite-specific execution options
 * @param options - Suite configuration options
 */
test.describe.configure(options: { 
  mode?: 'default' | 'parallel' | 'serial';
  retries?: number;
  timeout?: number;
}): void;
```

**Usage Examples:**

```typescript
test.describe("User Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("successful login", async ({ page }) => {
    // test logic
  });

  test("failed login", async ({ page }) => {
    // test logic
  });
});

// Configure serial execution for dependent tests
test.describe.serial("Database Migration", () => {
  test.describe.configure({ mode: 'serial' });
  
  test("run migration", async ({ page }) => {
    // must run first
  });
  
  test("verify migration", async ({ page }) => {
    // depends on previous test
  });
});
```

### Lifecycle Hooks

Functions for setup and teardown operations before and after tests.

```typescript { .api }
/**
 * Runs before each test in the current suite
 * @param hookFunction - Setup function with test fixtures
 */
test.beforeEach(hookFunction: (fixtures: PlaywrightTestArgs) => Promise<void>): void;

/**
 * Runs after each test in the current suite  
 * @param hookFunction - Teardown function with test fixtures
 */
test.afterEach(hookFunction: (fixtures: PlaywrightTestArgs) => Promise<void>): void;

/**
 * Runs once before all tests in the worker
 * @param hookFunction - Setup function with worker fixtures
 */
test.beforeAll(hookFunction: (fixtures: PlaywrightWorkerArgs) => Promise<void>): void;

/**
 * Runs once after all tests in the worker
 * @param hookFunction - Teardown function with worker fixtures
 */
test.afterAll(hookFunction: (fixtures: PlaywrightWorkerArgs) => Promise<void>): void;
```

**Usage Examples:**

```typescript
test.describe("Shopping Cart", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/shop");
    await page.click("[data-testid='add-to-cart']");
  });

  test.afterEach(async ({ page }) => {
    await page.click("[data-testid='clear-cart']");
  });

  test("view cart items", async ({ page }) => {
    await page.click("[data-testid='view-cart']");
    // test logic
  });
});

test.beforeAll(async ({ browser }) => {
  // Setup shared resources across all tests
  console.log(`Testing with ${browser.browserType().name()}`);
});
```

### Test Enhancement

Advanced functions for extending test capabilities and accessing test metadata.

```typescript { .api }
/**
 * Extends test with custom fixtures
 * @param fixtures - Custom fixture definitions
 * @returns Extended test function with additional fixtures
 */
test.extend<T, W>(fixtures: Fixtures<T, W>): TestType<PlaywrightTestArgs & T, PlaywrightWorkerArgs & W>;

/**
 * Sets default options for tests in current suite
 * @param options - Default test configuration options
 */
test.use(options: PlaywrightTestOptions): void;

/**
 * Creates hierarchical test steps for better reporting
 * @param title - Step description
 * @param body - Step implementation
 * @returns Promise resolving to step result
 */
test.step<T>(title: string, body: () => Promise<T>): Promise<T>;

/**
 * Access current test information and metadata
 * @returns Test information object
 */
test.info(): TestInfo;
```

**Usage Examples:**

```typescript
// Extend test with custom fixtures
const testWithDB = test.extend<{ db: Database }>({
  db: async ({}, use) => {
    const db = await connectToDatabase();
    await use(db);
    await db.close();
  },
});

testWithDB("user can save data", async ({ page, db }) => {
  // Use both page and db fixtures
});

// Configure default options
test.use({ 
  viewport: { width: 1280, height: 720 },
  ignoreHTTPSErrors: true 
});

// Create test steps
test("multi-step checkout", async ({ page }) => {
  await test.step("add items to cart", async () => {
    await page.click("[data-testid='add-to-cart']");
  });
  
  await test.step("proceed to checkout", async () => {
    await page.click("[data-testid='checkout']");
  });
  
  await test.step("complete payment", async () => {
    await page.fill("#card-number", "4242424242424242");
    await page.click("#submit-payment");
  });
});

// Access test information
test("get test metadata", async ({ page }) => {
  const info = test.info();
  console.log(`Running test: ${info.title} in ${info.file}`);
});
```

## Core Types

### Test Function Type

```typescript { .api }
interface TestType<TestArgs, WorkerArgs> {
  (title: string, testFunction: (args: TestArgs) => Promise<void>): void;
  (title: string, details: TestDetails, testFunction: (args: TestArgs) => Promise<void>): void;
  
  only: (title: string, testFunction: (args: TestArgs) => Promise<void>) => void;
  skip: (title: string, testFunction: (args: TestArgs) => Promise<void>) => void;
  fixme: (title: string, testFunction: (args: TestArgs) => Promise<void>) => void;
  slow: (title: string, testFunction: (args: TestArgs) => Promise<void>) => void;
  fail: (title: string, testFunction: (args: TestArgs) => Promise<void>) => void;
  
  describe: DescribeFunction;
  beforeEach: (hookFunction: (args: TestArgs) => Promise<void>) => void;
  afterEach: (hookFunction: (args: TestArgs) => Promise<void>) => void;
  beforeAll: (hookFunction: (args: WorkerArgs) => Promise<void>) => void;
  afterAll: (hookFunction: (args: WorkerArgs) => Promise<void>) => void;
  
  extend<T, W>(fixtures: Fixtures<T, W>): TestType<TestArgs & T, WorkerArgs & W>;
  use: (options: TestOptions) => void;
  step<T>(title: string, body: () => Promise<T>): Promise<T>;
  info(): TestInfo;
}
```

### Test Details and Metadata

```typescript { .api }
interface TestDetails {
  tag?: string | string[];
  annotation?: TestAnnotation[];
}

interface TestAnnotation {
  type: string;
  description?: string;
}

interface TestInfo {
  title: string;
  file: string;
  line: number;
  column: number;
  status?: TestStatus;
  duration: number;
  errors: TestError[];
  attachments: Attachment[];
  annotations: TestAnnotation[];
  expectedStatus: TestStatus;
  timeout: number;
  project: TestProject;
}

type TestStatus = 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
```

### Fixture System

```typescript { .api }
type Fixtures<T, W> = {
  [K in keyof T]: FixtureFunction<T[K], T, W>;
} & {
  [K in keyof W]: WorkerFixtureFunction<W[K], T, W>;
};

type FixtureFunction<R, T, W> = (
  args: T & W,
  use: (r: R) => Promise<void>
) => Promise<void>;

type WorkerFixtureFunction<R, T, W> = (
  args: W,
  use: (r: R) => Promise<void>,
  workerInfo: WorkerInfo
) => Promise<void>;

/**
 * Enhanced fixture type definitions for precise fixture typing
 */
type TestFixture<R, Args extends {}> = (
  args: Args, 
  use: (r: R) => Promise<void>, 
  testInfo: TestInfo
) => any;

type WorkerFixture<R, Args extends {}> = (
  args: Args, 
  use: (r: R) => Promise<void>, 
  workerInfo: WorkerInfo
) => any;

type TestBody<Args> = (args: Args, testInfo: TestInfo) => Promise<void> | void;
type ConditionBody<Args> = (args: Args) => boolean | Promise<boolean>;
```