# Assertions

Web-specific assertion library with automatic waiting and retry logic for reliable test assertions. Provides comprehensive matchers for page elements, network requests, and application state.

## Capabilities

### Core Expect Function

Main assertion function with support for various assertion modes and configuration options.

```typescript { .api }
/**
 * Create assertions for any value with automatic retry logic
 * @param actual - Value to assert against
 * @returns Assertion object with matcher methods
 */
function expect<T>(actual: T): PlaywrightAssertions<T>;

/**
 * Create soft assertions that don't immediately fail the test
 * @param actual - Value to assert against  
 * @returns Soft assertion object that collects failures
 */
expect.soft<T>(actual: T): PlaywrightAssertions<T>;

/**
 * Create polling assertions that retry until condition is met
 * @param actual - Function returning value to assert against
 * @param options - Polling configuration
 * @returns Polling assertion object
 */
expect.poll<T>(
  actual: () => T | Promise<T>,
  options?: { intervals?: number[]; timeout?: number }
): PlaywrightAssertions<T>;

/**
 * Add custom matcher methods to expect
 * @param matchers - Object with custom matcher implementations
 */
expect.extend<T>(matchers: CustomMatchers<T>): void;

/**
 * Configure global expect behavior
 * @param options - Global expect configuration
 */
expect.configure(options: {
  timeout?: number;
  soft?: boolean;
}): void;
```

**Usage Examples:**

```typescript
import { test, expect } from "@playwright/test";

test("basic assertions", async ({ page }) => {
  await page.goto("/");
  
  // Standard assertions
  await expect(page.locator("h1")).toBeVisible();
  await expect(page).toHaveTitle("Home Page");
  
  // Soft assertions (collect errors, don't fail immediately)
  await expect.soft(page.locator(".warning")).toBeHidden();
  await expect.soft(page.locator(".error")).toHaveCount(0);
  
  // Polling assertions (retry until condition met)
  await expect.poll(async () => {
    const response = await page.request.get("/api/status");
    return response.status();
  }).toBe(200);
});

// Configure global timeout
expect.configure({ timeout: 10000 });
```

### Page Assertions

Assertions specifically designed for page-level properties and states.

```typescript { .api }
/**
 * Assert page has specific title
 * @param expected - Expected title (string or regex)
 * @param options - Assertion options
 */
toHaveTitle(expected: string | RegExp, options?: { timeout?: number }): Promise<void>;

/**
 * Assert page URL matches pattern
 * @param expected - Expected URL (string or regex)
 * @param options - Assertion options
 */
toHaveURL(expected: string | RegExp, options?: { timeout?: number }): Promise<void>;

/**
 * Assert page screenshot matches expected image
 * @param name - Screenshot name for comparison
 * @param options - Screenshot comparison options
 */
toHaveScreenshot(name?: string | string[], options?: {
  threshold?: number;
  maxDiffPixels?: number;
  animations?: 'disabled' | 'allow';
  caret?: 'hide' | 'initial';
  scale?: 'css' | 'device';
  mode?: 'light' | 'dark';
}): Promise<void>;
```

**Usage Examples:**

```typescript
test("page assertions", async ({ page }) => {
  await page.goto("/dashboard");
  
  // Title and URL assertions
  await expect(page).toHaveTitle("User Dashboard");
  await expect(page).toHaveTitle(/Dashboard/);
  await expect(page).toHaveURL("/dashboard");
  await expect(page).toHaveURL(/\/dashboard/);
  
  // Visual regression testing
  await expect(page).toHaveScreenshot("dashboard.png");
  await expect(page).toHaveScreenshot("dashboard.png", {
    threshold: 0.2,
    maxDiffPixels: 100
  });
});
```

### Element Assertions

Comprehensive assertions for element visibility, content, attributes, and states.

```typescript { .api }
/**
 * Assert element is visible on page
 * @param options - Assertion options
 */
toBeVisible(options?: { timeout?: number }): Promise<void>;

/**
 * Assert element is hidden from view
 * @param options - Assertion options
 */
toBeHidden(options?: { timeout?: number }): Promise<void>;

/**
 * Assert element is enabled for interaction
 * @param options - Assertion options
 */
toBeEnabled(options?: { timeout?: number }): Promise<void>;

/**
 * Assert element is disabled
 * @param options - Assertion options
 */
toBeDisabled(options?: { timeout?: number }): Promise<void>;

/**
 * Assert element is editable (input/textarea)
 * @param options - Assertion options
 */
toBeEditable(options?: { timeout?: number }): Promise<void>;

/**
 * Assert checkbox/radio is checked
 * @param options - Assertion options
 */
toBeChecked(options?: { timeout?: number }): Promise<void>;

/**
 * Assert element is focused
 * @param options - Assertion options
 */
toBeFocused(options?: { timeout?: number }): Promise<void>;

/**
 * Assert element contains specific text
 * @param expected - Expected text (string or regex)
 * @param options - Assertion options
 */
toContainText(expected: string | RegExp | (string | RegExp)[], options?: {
  ignoreCase?: boolean;
  timeout?: number;
  useInnerText?: boolean;
}): Promise<void>;

/**
 * Assert element has exact text content
 * @param expected - Expected text (string or regex)
 * @param options - Assertion options
 */
toHaveText(expected: string | RegExp | (string | RegExp)[], options?: {
  ignoreCase?: boolean;
  timeout?: number;
  useInnerText?: boolean;
}): Promise<void>;

/**
 * Assert element has specific attribute value
 * @param name - Attribute name
 * @param value - Expected value (string or regex)
 * @param options - Assertion options
 */
toHaveAttribute(name: string, value?: string | RegExp, options?: { timeout?: number }): Promise<void>;

/**
 * Assert input element has specific value
 * @param value - Expected value (string or regex)
 * @param options - Assertion options
 */
toHaveValue(value: string | RegExp, options?: { timeout?: number }): Promise<void>;

/**
 * Assert element has specific CSS property value
 * @param name - CSS property name
 * @param value - Expected value (string or regex)
 * @param options - Assertion options
 */
toHaveCSS(name: string, value: string | RegExp, options?: { timeout?: number }): Promise<void>;

/**
 * Assert element has specific class
 * @param expected - Expected class names
 * @param options - Assertion options
 */
toHaveClass(expected: string | RegExp | (string | RegExp)[], options?: { timeout?: number }): Promise<void>;

/**
 * Assert number of matching elements
 * @param count - Expected count
 * @param options - Assertion options
 */
toHaveCount(count: number, options?: { timeout?: number }): Promise<void>;

/**
 * Assert element screenshot matches expected
 * @param name - Screenshot name for comparison
 * @param options - Screenshot comparison options
 */
toHaveScreenshot(name?: string | string[], options?: ScreenshotOptions): Promise<void>;
```

**Usage Examples:**

```typescript
test("element assertions", async ({ page }) => {
  await page.goto("/form");
  
  // Visibility and state assertions
  await expect(page.locator(".loading")).toBeHidden();
  await expect(page.locator("#submit-btn")).toBeVisible();
  await expect(page.locator("#submit-btn")).toBeEnabled();
  await expect(page.locator("#terms")).toBeChecked();
  
  // Content assertions
  await expect(page.locator("h1")).toHaveText("Contact Form");
  await expect(page.locator(".error")).toContainText("required");
  await expect(page.locator("input#email")).toHaveValue("user@example.com");
  
  // Attribute and CSS assertions
  await expect(page.locator("button")).toHaveAttribute("type", "submit");
  await expect(page.locator(".highlight")).toHaveCSS("background-color", "rgb(255, 255, 0)");
  await expect(page.locator(".active")).toHaveClass("tab active");
  
  // Count assertions
  await expect(page.locator(".menu-item")).toHaveCount(5);
  await expect(page.locator(".error")).toHaveCount(0);
});
```

### Value and Content Assertions

Standard assertions for primitive values, objects, and arrays.

```typescript { .api }
/**
 * Assert values are strictly equal
 * @param expected - Expected value
 */
toBe(expected: any): Promise<void>;

/**
 * Assert values are deeply equal
 * @param expected - Expected value
 */
toEqual(expected: any): Promise<void>;

/**
 * Assert value is strictly equal to expected
 * @param expected - Expected value
 */
toStrictEqual(expected: any): Promise<void>;

/**
 * Assert value is truthy
 */
toBeTruthy(): Promise<void>;

/**
 * Assert value is falsy
 */
toBeFalsy(): Promise<void>;

/**
 * Assert value is defined (not undefined)
 */
toBeDefined(): Promise<void>;

/**
 * Assert value is undefined
 */
toBeUndefined(): Promise<void>;

/**
 * Assert value is null
 */
toBeNull(): Promise<void>;

/**
 * Assert value is NaN
 */
toBeNaN(): Promise<void>;

/**
 * Assert array/string contains specific item/substring
 * @param expected - Expected item or substring
 */
toContain(expected: any): Promise<void>;

/**
 * Assert object has specific property
 * @param keyPath - Property key or path (dot notation)
 * @param value - Optional expected value
 */
toHaveProperty(keyPath: string | string[], value?: any): Promise<void>;

/**
 * Assert number is greater than expected
 * @param expected - Expected minimum value
 */
toBeGreaterThan(expected: number): Promise<void>;

/**
 * Assert number is greater than or equal to expected
 * @param expected - Expected minimum value
 */
toBeGreaterThanOrEqual(expected: number): Promise<void>;

/**
 * Assert number is less than expected
 * @param expected - Expected maximum value
 */
toBeLessThan(expected: number): Promise<void>;

/**
 * Assert number is less than or equal to expected
 * @param expected - Expected maximum value
 */
toBeLessThanOrEqual(expected: number): Promise<void>;

/**
 * Assert number is close to expected within precision
 * @param expected - Expected value
 * @param precision - Decimal precision (default: 2)
 */
toBeCloseTo(expected: number, precision?: number): Promise<void>;

/**
 * Assert string matches regular expression
 * @param expected - Regular expression pattern
 */
toMatch(expected: RegExp | string): Promise<void>;

/**
 * Assert function throws error
 * @param expected - Expected error (optional)
 */
toThrow(expected?: string | RegExp | Error): Promise<void>;

/**
 * Assert array has specific length
 * @param expected - Expected length
 */
toHaveLength(expected: number): Promise<void>;
```

**Usage Examples:**

```typescript
test("value assertions", async ({ page }) => {
  const result = await page.evaluate(() => {
    return {
      count: 42,
      name: "test",
      items: ["a", "b", "c"],
      active: true
    };
  });
  
  // Equality assertions
  expect(result.count).toBe(42);
  expect(result).toEqual({ count: 42, name: "test", items: ["a", "b", "c"], active: true });
  
  // Property assertions
  expect(result).toHaveProperty("name", "test");
  expect(result).toHaveProperty("items.length", 3);
  
  // Number assertions
  expect(result.count).toBeGreaterThan(40);
  expect(result.count).toBeLessThanOrEqual(50);
  
  // Array assertions
  expect(result.items).toContain("b");
  expect(result.items).toHaveLength(3);
  
  // Boolean assertions
  expect(result.active).toBeTruthy();
  expect(result.disabled).toBeFalsy();
});
```

### Network Assertions

Assertions for API requests and responses.

```typescript { .api }
/**
 * Assert API response has expected status
 * @param expected - Expected status code
 */
toBeOK(): Promise<void>;

/**
 * Assert response status matches expected
 * @param expected - Expected status code
 */
toHaveStatus(expected: number): Promise<void>;

/**
 * Assert response has specific header
 * @param name - Header name
 * @param value - Expected header value (optional)
 */
toHaveHeader(name: string, value?: string | RegExp): Promise<void>;

/**
 * Assert response body matches expected
 * @param expected - Expected response body
 */
toHaveBody(expected: string | Buffer | RegExp): Promise<void>;

/**
 * Assert response JSON matches expected
 * @param expected - Expected JSON object
 */
toHaveJSON(expected: object): Promise<void>;
```

**Usage Examples:**

```typescript
test("API assertions", async ({ request }) => {
  const response = await request.get("/api/users");
  
  // Status assertions
  await expect(response).toBeOK();
  await expect(response).toHaveStatus(200);
  
  // Header assertions
  await expect(response).toHaveHeader("content-type", /application\/json/);
  
  // Body assertions
  const userData = await response.json();
  expect(userData).toHaveProperty("users");
  expect(userData.users).toHaveLength(10);
});
```

## Custom Matchers

### Extending Expect

```typescript { .api }
interface CustomMatchers<R = unknown> {
  [matcher: string]: (this: MatcherState, received: any, ...args: any[]) => CustomMatcherResult | Promise<CustomMatcherResult>;
}

interface CustomMatcherResult {
  pass: boolean;
  message: () => string;
  actual?: any;
  expected?: any;
}

interface MatcherState {
  equals: (a: any, b: any) => boolean;
  expand?: boolean;
  isNot: boolean;
  promise: string;
  suppressedErrors: Error[];
  utils: MatcherUtils;
}
```

**Usage Examples:**

```typescript
// Define custom matcher
expect.extend({
  async toHaveValidationError(locator: Locator, expectedMessage: string) {
    const errorElement = locator.locator(".error-message");
    const isVisible = await errorElement.isVisible();
    const actualMessage = isVisible ? await errorElement.textContent() : null;
    
    const pass = isVisible && actualMessage === expectedMessage;
    
    return {
      pass,
      message: () => pass 
        ? `Expected validation error "${expectedMessage}" not to be present`
        : `Expected validation error "${expectedMessage}", but got "${actualMessage}"`
    };
  }
});

// Use custom matcher
test("custom assertion", async ({ page }) => {
  await page.goto("/form");
  await page.click("#submit");
  
  await expect(page.locator("#email-field")).toHaveValidationError("Email is required");
});
```

## Core Types

### Assertion Interfaces

```typescript { .api }
interface PlaywrightAssertions<T> {
  not: PlaywrightAssertions<T>;
  
  // Value assertions
  toBe(expected: any): Promise<void>;
  toEqual(expected: any): Promise<void>;
  toStrictEqual(expected: any): Promise<void>;
  toBeTruthy(): Promise<void>;
  toBeFalsy(): Promise<void>;
  toBeDefined(): Promise<void>;
  toBeUndefined(): Promise<void>;
  toBeNull(): Promise<void>;
  toBeNaN(): Promise<void>;
  toContain(expected: any): Promise<void>;
  toHaveProperty(keyPath: string | string[], value?: any): Promise<void>;
  toHaveLength(expected: number): Promise<void>;
  toMatch(expected: RegExp | string): Promise<void>;
  toThrow(expected?: string | RegExp | Error): Promise<void>;
  
  // Number assertions
  toBeGreaterThan(expected: number): Promise<void>;
  toBeGreaterThanOrEqual(expected: number): Promise<void>;
  toBeLessThan(expected: number): Promise<void>;
  toBeLessThanOrEqual(expected: number): Promise<void>;
  toBeCloseTo(expected: number, precision?: number): Promise<void>;
  
  // Element assertions (when T is Locator)
  toBeVisible?(options?: { timeout?: number }): Promise<void>;
  toBeHidden?(options?: { timeout?: number }): Promise<void>;
  toBeEnabled?(options?: { timeout?: number }): Promise<void>;
  toBeDisabled?(options?: { timeout?: number }): Promise<void>;
  toBeEditable?(options?: { timeout?: number }): Promise<void>;
  toBeChecked?(options?: { timeout?: number }): Promise<void>;
  toBeFocused?(options?: { timeout?: number }): Promise<void>;
  toContainText?(expected: string | RegExp | (string | RegExp)[], options?: TextOptions): Promise<void>;
  toHaveText?(expected: string | RegExp | (string | RegExp)[], options?: TextOptions): Promise<void>;
  toHaveAttribute?(name: string, value?: string | RegExp, options?: { timeout?: number }): Promise<void>;
  toHaveValue?(value: string | RegExp, options?: { timeout?: number }): Promise<void>;
  toHaveCSS?(name: string, value: string | RegExp, options?: { timeout?: number }): Promise<void>;
  toHaveClass?(expected: string | RegExp | (string | RegExp)[], options?: { timeout?: number }): Promise<void>;
  toHaveCount?(count: number, options?: { timeout?: number }): Promise<void>;
  toHaveScreenshot?(name?: string | string[], options?: ScreenshotOptions): Promise<void>;
  
  // Page assertions (when T is Page)
  toHaveTitle?(expected: string | RegExp, options?: { timeout?: number }): Promise<void>;
  toHaveURL?(expected: string | RegExp, options?: { timeout?: number }): Promise<void>;
  
  // Response assertions (when T is APIResponse)
  toBeOK?(): Promise<void>;
  toHaveStatus?(expected: number): Promise<void>;
  toHaveHeader?(name: string, value?: string | RegExp): Promise<void>;
  toHaveBody?(expected: string | Buffer | RegExp): Promise<void>;
  toHaveJSON?(expected: object): Promise<void>;
}

interface TextOptions {
  ignoreCase?: boolean;
  timeout?: number;
  useInnerText?: boolean;
}

interface ScreenshotOptions {
  threshold?: number;
  maxDiffPixels?: number;
  animations?: 'disabled' | 'allow';
  caret?: 'hide' | 'initial';
  scale?: 'css' | 'device';
  mode?: 'light' | 'dark';
  timeout?: number;
}
```