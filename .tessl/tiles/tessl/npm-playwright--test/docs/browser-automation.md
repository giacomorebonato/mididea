# Browser Automation

Complete browser automation API providing page interaction, element manipulation, and navigation across Chromium, Firefox, and WebKit browsers with automatic waiting and context isolation.

## Capabilities

### Page Navigation and Lifecycle

Functions for navigating between pages and managing page lifecycle events.

```typescript { .api }
/**
 * Navigate to a URL with optional wait conditions
 * @param url - Target URL (absolute or relative to baseURL)
 * @param options - Navigation options
 * @returns Promise resolving to Response object
 */
goto(url: string, options?: {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  timeout?: number;
  referer?: string;
}): Promise<Response | null>;

/**
 * Navigate back in browser history
 * @param options - Navigation options
 * @returns Promise resolving to Response object or null
 */
goBack(options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'; timeout?: number }): Promise<Response | null>;

/**
 * Navigate forward in browser history
 * @param options - Navigation options  
 * @returns Promise resolving to Response object or null
 */
goForward(options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'; timeout?: number }): Promise<Response | null>;

/**
 * Reload the current page
 * @param options - Reload options
 * @returns Promise resolving to Response object or null
 */
reload(options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'; timeout?: number }): Promise<Response | null>;

/**
 * Wait for specific page load states
 * @param state - Load state to wait for
 * @param options - Wait options
 */
waitForLoadState(state?: 'load' | 'domcontentloaded' | 'networkidle', options?: { timeout?: number }): Promise<void>;

/**
 * Wait for navigation to complete
 * @param options - Navigation wait options
 * @returns Promise resolving to Response object
 */
waitForNavigation(options?: {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  timeout?: number;
  url?: string | RegExp | ((url: URL) => boolean);
}): Promise<Response | null>;
```

**Usage Examples:**

```typescript
// Basic navigation
await page.goto("https://example.com");
await page.goto("/dashboard"); // Relative to baseURL

// Navigation with wait conditions
await page.goto("/slow-page", { waitUntil: 'networkidle' });

// Browser history navigation
await page.goBack();
await page.goForward();
await page.reload();

// Wait for specific load states
await page.waitForLoadState('domcontentloaded');
await page.waitForNavigation({ url: /dashboard/ });
```

### Element Interaction

Functions for interacting with page elements including clicking, typing, and form manipulation.

```typescript { .api }
/**
 * Click an element matching the selector
 * @param selector - CSS selector or locator string
 * @param options - Click options
 */
click(selector: string, options?: {
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  delay?: number;
  position?: { x: number; y: number };
  modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
  force?: boolean;
  noWaitAfter?: boolean;
  timeout?: number;
}): Promise<void>;

/**
 * Double-click an element
 * @param selector - CSS selector or locator string
 * @param options - Double-click options
 */
dblclick(selector: string, options?: {
  delay?: number;
  button?: 'left' | 'right' | 'middle';
  position?: { x: number; y: number };
  modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
  force?: boolean;
  noWaitAfter?: boolean;
  timeout?: number;
}): Promise<void>;

/**
 * Fill input element with text
 * @param selector - CSS selector for input element
 * @param value - Text to input
 * @param options - Fill options
 */
fill(selector: string, value: string, options?: {
  force?: boolean;
  noWaitAfter?: boolean;
  timeout?: number;
}): Promise<void>;

/**
 * Type text with realistic timing
 * @param selector - CSS selector for input element  
 * @param text - Text to type
 * @param options - Type options
 */
type(selector: string, text: string, options?: {
  delay?: number;
  noWaitAfter?: boolean;
  timeout?: number;
}): Promise<void>;

/**
 * Press keyboard keys
 * @param selector - CSS selector for target element
 * @param key - Key or key combination to press
 * @param options - Press options
 */
press(selector: string, key: string, options?: {
  delay?: number;
  noWaitAfter?: boolean;
  timeout?: number;
}): Promise<void>;

/**
 * Hover over an element
 * @param selector - CSS selector for target element
 * @param options - Hover options
 */
hover(selector: string, options?: {
  position?: { x: number; y: number };
  modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
  force?: boolean;
  timeout?: number;
}): Promise<void>;
```

**Usage Examples:**

```typescript
// Basic element interactions
await page.click("button#submit");
await page.fill("input[name='email']", "user@example.com");
await page.type("#search", "playwright testing");
await page.press("input", "Enter");

// Advanced click options
await page.click(".menu-item", { 
  button: 'right',
  modifiers: ['Control'] 
});

// Form interactions
await page.fill("#username", "admin");
await page.fill("#password", "secret");
await page.click("button[type='submit']");

// Keyboard navigation
await page.press("body", "Tab");
await page.press("input", "Control+A");
await page.press("input", "Backspace");
```

### Element Selection and Waiting

Functions for selecting elements and waiting for various conditions.

```typescript { .api }
/**
 * Wait for element to appear and become actionable
 * @param selector - CSS selector for target element
 * @param options - Wait options
 * @returns Promise resolving to ElementHandle
 */
waitForSelector(selector: string, options?: {
  state?: 'attached' | 'detached' | 'visible' | 'hidden';
  timeout?: number;
}): Promise<ElementHandle | null>;

/**
 * Create a locator for element(s) matching selector
 * @param selector - CSS selector or locator string
 * @param options - Locator options
 * @returns Locator instance for chaining operations
 */
locator(selector: string, options?: {
  hasText?: string | RegExp;
  has?: Locator;
}): Locator;

/**
 * Get element handle for the first matching element
 * @param selector - CSS selector
 * @param options - Query options
 * @returns ElementHandle or null if not found
 */
$(selector: string, options?: { timeout?: number }): Promise<ElementHandle | null>;

/**
 * Get element handles for all matching elements
 * @param selector - CSS selector
 * @returns Array of ElementHandle objects
 */
$$(selector: string): Promise<ElementHandle[]>;

/**
 * Wait for function to return truthy value
 * @param pageFunction - Function to evaluate repeatedly
 * @param arg - Argument to pass to pageFunction
 * @param options - Wait options
 * @returns Promise resolving to function result
 */
waitForFunction<R, Arg>(
  pageFunction: PageFunction<Arg, R>,
  arg?: Arg,
  options?: { timeout?: number; polling?: number | 'raf' }
): Promise<JSHandle<R>>;
```

**Usage Examples:**

```typescript
// Wait for elements
await page.waitForSelector(".loading-indicator", { state: 'detached' });
await page.waitForSelector("button:enabled");

// Create locators for chaining
const submitButton = page.locator("button[type='submit']");
await submitButton.click();

const todoItem = page.locator(".todo-item", { hasText: "Buy groceries" });
await todoItem.check();

// Element handles
const element = await page.$(".title");
const allLinks = await page.$$("a");

// Wait for custom conditions
await page.waitForFunction(() => document.querySelectorAll('.item').length > 5);
await page.waitForFunction(() => window.myApiLoaded === true);
```

### JavaScript Execution

Functions for executing JavaScript code within the page context.

```typescript { .api }
/**
 * Execute JavaScript in page context
 * @param pageFunction - Function to execute in page context
 * @param arg - Argument to pass to the function
 * @returns Promise resolving to function return value
 */
evaluate<R, Arg>(
  pageFunction: PageFunction<Arg, R>,
  arg?: Arg
): Promise<R>;

/**
 * Execute JavaScript and return JSHandle to result
 * @param pageFunction - Function to execute in page context
 * @param arg - Argument to pass to the function  
 * @returns Promise resolving to JSHandle of result
 */
evaluateHandle<R, Arg>(
  pageFunction: PageFunction<Arg, R>,
  arg?: Arg
): Promise<JSHandle<R>>;

/**
 * Add script tag to page
 * @param options - Script tag options
 * @returns Promise resolving to ElementHandle of script tag
 */
addScriptTag(options: {
  url?: string;
  path?: string;
  content?: string;
  type?: string;
}): Promise<ElementHandle>;

/**
 * Add style tag to page
 * @param options - Style tag options
 * @returns Promise resolving to ElementHandle of style tag
 */
addStyleTag(options: {
  url?: string;
  path?: string;
  content?: string;
}): Promise<ElementHandle>;
```

**Usage Examples:**

```typescript
// Execute JavaScript and get result
const pageTitle = await page.evaluate(() => document.title);
const elementCount = await page.evaluate(() => document.querySelectorAll('.item').length);

// Pass arguments to page functions
const result = await page.evaluate(
  (name) => window.myApp.getUserData(name),
  'john'
);

// Get handles to page objects
const windowHandle = await page.evaluateHandle(() => window);
const documentHandle = await page.evaluateHandle(() => document);

// Add external scripts and styles
await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/lodash@4/lodash.min.js' });
await page.addStyleTag({ content: '.highlight { background: yellow; }' });
```

### Screenshots and Media

Functions for capturing page screenshots, PDFs, and videos.

```typescript { .api }
/**
 * Take screenshot of page or element
 * @param options - Screenshot options
 * @returns Promise resolving to screenshot buffer
 */
screenshot(options?: {
  path?: string;
  fullPage?: boolean;
  clip?: { x: number; y: number; width: number; height: number };
  omitBackground?: boolean;
  type?: 'png' | 'jpeg';
  quality?: number;
  timeout?: number;
}): Promise<Buffer>;

/**
 * Generate PDF from page (Chromium only)
 * @param options - PDF generation options
 * @returns Promise resolving to PDF buffer
 */
pdf(options?: {
  path?: string;
  scale?: number;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  printBackground?: boolean;
  landscape?: boolean;
  pageRanges?: string;
  format?: string;
  width?: string | number;
  height?: string | number;
  preferCSSPageSize?: boolean;
  margin?: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
}): Promise<Buffer>;
```

**Usage Examples:**

```typescript
// Basic screenshots
await page.screenshot({ path: 'homepage.png' });
await page.screenshot({ path: 'fullpage.png', fullPage: true });

// Element screenshots
const element = page.locator('.chart');
await element.screenshot({ path: 'chart.png' });

// Screenshot with clipping
await page.screenshot({
  path: 'header.png',
  clip: { x: 0, y: 0, width: 1200, height: 100 }
});

// Generate PDF
await page.pdf({
  path: 'document.pdf',
  format: 'A4',
  printBackground: true
});
```

### Form Handling

Specialized functions for working with form elements.

```typescript { .api }
/**
 * Select option(s) from select element
 * @param selector - CSS selector for select element
 * @param values - Option values to select
 * @param options - Selection options
 * @returns Array of selected option values
 */
selectOption(
  selector: string,
  values: string | ElementHandle | SelectOption | string[] | ElementHandle[] | SelectOption[],
  options?: { force?: boolean; noWaitAfter?: boolean; timeout?: number }
): Promise<string[]>;

/**
 * Check checkbox or radio button
 * @param selector - CSS selector for input element
 * @param options - Check options
 */
check(selector: string, options?: {
  force?: boolean;
  noWaitAfter?: boolean;
  position?: { x: number; y: number };
  timeout?: number;
}): Promise<void>;

/**
 * Uncheck checkbox
 * @param selector - CSS selector for checkbox element
 * @param options - Uncheck options
 */
uncheck(selector: string, options?: {
  force?: boolean;
  noWaitAfter?: boolean;
  position?: { x: number; y: number };
  timeout?: number;
}): Promise<void>;

/**
 * Set files for file input element
 * @param selector - CSS selector for file input
 * @param files - File paths or file objects
 * @param options - File input options
 */
setInputFiles(
  selector: string,
  files: string | string[] | FilePayload | FilePayload[],
  options?: { noWaitAfter?: boolean; timeout?: number }
): Promise<void>;
```

**Usage Examples:**

```typescript
// Select dropdown options
await page.selectOption('select#country', 'USA');
await page.selectOption('select#languages', ['en', 'es', 'fr']);

// Checkbox and radio interactions
await page.check('input#newsletter');
await page.uncheck('input#notifications');
await page.check('input[name="payment"][value="credit"]');

// File uploads
await page.setInputFiles('input#avatar', 'path/to/photo.jpg');
await page.setInputFiles('input#documents', [
  'path/to/file1.pdf',
  'path/to/file2.pdf'
]);
```

## Browser Context and Browser Management

### Browser Context

```typescript { .api }
interface BrowserContext {
  /**
   * Create new page in this context
   * @returns Promise resolving to new Page instance
   */
  newPage(): Promise<Page>;
  
  /**
   * Get all pages in this context
   * @returns Array of Page instances
   */
  pages(): Page[];
  
  /**
   * Close browser context and all pages
   */
  close(): Promise<void>;
  
  /**
   * Set extra HTTP headers for all requests
   * @param headers - Header key-value pairs
   */
  setExtraHTTPHeaders(headers: Record<string, string>): Promise<void>;
  
  /**
   * Set geolocation for all pages
   * @param geolocation - Latitude and longitude coordinates
   */
  setGeolocation(geolocation: { latitude: number; longitude: number; accuracy?: number }): Promise<void>;
  
  /**
   * Get storage state (cookies and local storage)
   * @param options - Storage state options
   * @returns Promise resolving to storage state object
   */
  storageState(options?: { path?: string }): Promise<StorageState>;
}
```

### Browser Management

```typescript { .api }
interface Browser {
  /**
   * Create new browser context
   * @param options - Context configuration options
   * @returns Promise resolving to new BrowserContext
   */
  newContext(options?: BrowserContextOptions): Promise<BrowserContext>;
  
  /**
   * Get all browser contexts
   * @returns Array of BrowserContext instances
   */
  contexts(): BrowserContext[];
  
  /**
   * Close browser and all contexts
   */
  close(): Promise<void>;
  
  /**
   * Get browser version string
   * @returns Browser version
   */
  version(): string;
  
  /**
   * Get browser type instance
   * @returns BrowserType for this browser
   */
  browserType(): BrowserType;
}

interface BrowserType {
  /**
   * Launch new browser instance
   * @param options - Browser launch options
   * @returns Promise resolving to Browser instance
   */
  launch(options?: BrowserLaunchOptions): Promise<Browser>;
  
  /**
   * Connect to existing browser via WebSocket
   * @param wsEndpoint - WebSocket endpoint URL
   * @param options - Connection options
   * @returns Promise resolving to Browser instance
   */
  connect(wsEndpoint: string, options?: BrowserConnectOptions): Promise<Browser>;
  
  /**
   * Get browser type name
   * @returns Browser name ('chromium', 'firefox', or 'webkit')
   */
  name(): string;
}
```

## Core Types

### Page Interface

```typescript { .api }
interface Page extends EventEmitter {
  url(): string;
  title(): Promise<string>;
  content(): Promise<string>;
  setContent(html: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'; timeout?: number }): Promise<void>;
  setViewportSize(viewportSize: { width: number; height: number }): Promise<void>;
  viewportSize(): { width: number; height: number } | null;
  isClosed(): boolean;
  close(options?: { runBeforeUnload?: boolean }): Promise<void>;
}
```

### Locator Interface

```typescript { .api }
interface Locator {
  click(options?: ClickOptions): Promise<void>;
  fill(value: string, options?: FillOptions): Promise<void>;
  press(key: string, options?: PressOptions): Promise<void>;
  hover(options?: HoverOptions): Promise<void>;
  focus(options?: { timeout?: number }): Promise<void>;
  blur(options?: { timeout?: number }): Promise<void>;
  
  textContent(options?: { timeout?: number }): Promise<string | null>;
  innerText(options?: { timeout?: number }): Promise<string>;
  innerHTML(options?: { timeout?: number }): Promise<string>;
  getAttribute(name: string, options?: { timeout?: number }): Promise<string | null>;
  
  isVisible(options?: { timeout?: number }): Promise<boolean>;
  isEnabled(options?: { timeout?: number }): Promise<boolean>;
  isEditable(options?: { timeout?: number }): Promise<boolean>;
  isChecked(options?: { timeout?: number }): Promise<boolean>;
  
  count(): Promise<number>;
  first(): Locator;
  last(): Locator;
  nth(index: number): Locator;
  filter(options: { hasText?: string | RegExp; has?: Locator }): Locator;
  
  screenshot(options?: ScreenshotOptions): Promise<Buffer>;
  waitFor(options?: { state?: 'attached' | 'detached' | 'visible' | 'hidden'; timeout?: number }): Promise<void>;
}
```

### Element Handle

```typescript { .api }
interface ElementHandle extends JSHandle {
  click(options?: ClickOptions): Promise<void>;
  fill(value: string, options?: FillOptions): Promise<void>;
  press(key: string, options?: PressOptions): Promise<void>;
  hover(options?: HoverOptions): Promise<void>;
  
  boundingBox(): Promise<{ x: number; y: number; width: number; height: number } | null>;
  screenshot(options?: ScreenshotOptions): Promise<Buffer>;
  scrollIntoViewIfNeeded(options?: { timeout?: number }): Promise<void>;
  
  isVisible(): Promise<boolean>;
  isEnabled(): Promise<boolean>;
  isEditable(): Promise<boolean>;
  isChecked(): Promise<boolean>;
  
  textContent(): Promise<string | null>;
  innerText(): Promise<string>;
  innerHTML(): Promise<string>;
  getAttribute(name: string): Promise<string | null>;
  
  $(selector: string): Promise<ElementHandle | null>;
  $$(selector: string): Promise<ElementHandle[]>;
  
  waitForElementState(state: 'visible' | 'hidden' | 'stable' | 'enabled' | 'disabled' | 'editable', options?: { timeout?: number }): Promise<void>;
  waitForSelector(selector: string, options?: WaitForSelectorOptions): Promise<ElementHandle | null>;
}