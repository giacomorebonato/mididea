# Reporting

Comprehensive reporting system with built-in reporters and custom reporter support for various output formats, test result analysis, and CI/CD integration.

## Capabilities

### Reporter Configuration

Configuration options for built-in and custom reporters with support for multiple output formats.

```typescript { .api }
/**
 * Reporter configuration description
 */
type ReporterDescription = 
  | 'list' 
  | 'dot' 
  | 'line' 
  | 'json' 
  | 'junit' 
  | 'html' 
  | 'blob' 
  | 'github'
  | 'null'
  | [string]
  | [string, any]
  | ['list', ListReporterOptions]
  | ['junit', JUnitReporterOptions]
  | ['json', JsonReporterOptions] 
  | ['html', HtmlReporterOptions]
  | ['blob', BlobReporterOptions];

/**
 * Built-in reporter option interfaces
 */
interface ListReporterOptions {
  printSteps?: boolean;
}

interface JUnitReporterOptions {
  outputFile?: string;
  stripANSIControlSequences?: boolean;
  includeProjectInTestName?: boolean;
}

interface JsonReporterOptions {
  outputFile?: string;
}

interface HtmlReporterOptions {
  outputFolder?: string;
  open?: 'always' | 'never' | 'on-failure';
  host?: string;
  port?: number;
  attachmentsBaseURL?: string;
  title?: string;
  noSnippets?: boolean;
}

interface BlobReporterOptions {
  outputDir?: string;
  fileName?: string;
}
```

**Usage Examples:**

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  // Single reporter
  reporter: "html",
  
  // Multiple reporters
  reporter: [
    ["html", { outputFolder: "reports/html" }],
    ["json", { outputFile: "reports/results.json" }],
    ["junit", { outputFile: "reports/junit.xml" }],
  ],
  
  // Custom reporter
  reporter: [
    ["./custom-reporter.js", { option: "value" }]
  ],
});
```

### Custom Reporter Interface

Interface for implementing custom reporters with complete test lifecycle hooks.

```typescript { .api }
/**
 * Custom reporter interface for extending test reporting
 */
interface Reporter {
  /**
   * Called once before running all tests
   * @param config - Full test configuration
   * @param suite - Root test suite
   */
  onBegin?(config: FullConfig, suite: Suite): void;
  
  /**
   * Called for each test when it starts running
   * @param test - Test case metadata
   * @param result - Test result object (initial state)
   */
  onTestBegin?(test: TestCase, result: TestResult): void;
  
  /**
   * Called for each test when it finishes
   * @param test - Test case metadata
   * @param result - Complete test result
   */
  onTestEnd?(test: TestCase, result: TestResult): void;
  
  /**
   * Called for each step when it starts
   * @param test - Test case metadata
   * @param result - Test result containing the step
   * @param step - Test step metadata
   */
  onStepBegin?(test: TestCase, result: TestResult, step: TestStep): void;
  
  /**
   * Called for each step when it finishes
   * @param test - Test case metadata  
   * @param result - Test result containing the step
   * @param step - Complete test step result
   */
  onStepEnd?(test: TestCase, result: TestResult, step: TestStep): void;
  
  /**
   * Called after all tests finish
   * @param result - Full test run result
   */
  onEnd?(result: FullResult): void;
  
  /**
   * Called on unexpected errors during test execution
   * @param error - Error information
   */
  onError?(error: TestError): void;
  
  /**
   * Called when output is written to stdout during test execution
   * @param chunk - Output data
   * @param test - Test case that produced the output (if any)
   * @param result - Test result (if any)
   */
  onStdOut?(chunk: string | Buffer, test?: TestCase, result?: TestResult): void;
  
  /**
   * Called when output is written to stderr during test execution
   * @param chunk - Output data
   * @param test - Test case that produced the output (if any)
   * @param result - Test result (if any)
   */
  onStdErr?(chunk: string | Buffer, test?: TestCase, result?: TestResult): void;
}
```

### Test Result Interfaces

Comprehensive result data structures for test execution analysis and reporting.

```typescript { .api }
/**
 * Complete test run results
 */
interface FullResult {
  /**
   * Overall test run status
   */
  status: 'passed' | 'failed' | 'timedout' | 'interrupted';
  
  /**
   * Total test run duration in milliseconds
   */
  startTime: Date;
  
  /**
   * Test execution statistics
   */
  duration: number;
}

/**
 * Individual test case metadata and configuration
 */
interface TestCase {
  /**
   * Test case title
   */
  title: string;
  
  /**
   * Full test title including parent suite names
   */
  titlePath(): string[];
  
  /**
   * Test file location
   */
  location: { file: string; line: number; column: number };
  
  /**
   * Parent test suite
   */
  parent: Suite;
  
  /**
   * Test expected status
   */
  expectedStatus: 'passed' | 'failed' | 'skipped';
  
  /**
   * Test timeout in milliseconds
   */
  timeout: number;
  
  /**
   * Test annotations
   */
  annotations: { type: string; description?: string }[];
  
  /**
   * Test retry count
   */
  retries: number;
  
  /**
   * Associated test project
   */
  project(): FullProject;
  
  /**
   * Test case results across all retries
   */
  results: TestResult[];
  
  /**
   * Outcome of the last test result
   */
  outcome(): 'skipped' | 'expected' | 'unexpected' | 'flaky';
}

/**
 * Single test execution result
 */
interface TestResult {
  /**
   * Test execution status
   */
  status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
  
  /**
   * Test execution duration in milliseconds
   */
  duration: number;
  
  /**
   * Test start time
   */
  startTime: Date;
  
  /**
   * Test retry attempt number
   */
  retry: number;
  
  /**
   * Test execution parallelism index
   */
  parallelIndex: number;
  
  /**
   * Worker process index
   */
  workerIndex: number;
  
  /**
   * Test execution errors
   */
  errors: TestError[];
  
  /**
   * Test result attachments
   */
  attachments: Attachment[];
  
  /**
   * Test execution steps
   */
  steps: TestStep[];
  
  /**
   * Standard output during test execution
   */
  stdout: { text: string; timestamp: Date }[];
  
  /**
   * Standard error during test execution
   */
  stderr: { text: string; timestamp: Date }[];
}

/**
 * Test suite hierarchy representation
 */
interface Suite {
  /**
   * Suite title
   */
  title: string;
  
  /**
   * Parent suite (undefined for root)
   */
  parent?: Suite;
  
  /**
   * Child test suites
   */
  suites: Suite[];
  
  /**
   * Test cases in this suite
   */
  tests: TestCase[];
  
  /**
   * Full suite title path
   */
  titlePath(): string[];
  
  /**
   * All tests in this suite and child suites
   */
  allTests(): TestCase[];
  
  /**
   * Suite location in source file
   */
  location?: { file: string; line: number; column: number };
}

/**
 * Test step information for hierarchical test organization
 */
interface TestStep {
  /**
   * Step title
   */
  title: string;
  
  /**
   * Step category
   */
  category: string;
  
  /**
   * Step start time
   */
  startTime: Date;
  
  /**
   * Step duration in milliseconds
   */
  duration: number;
  
  /**
   * Step execution error (if any)
   */
  error?: TestError;
  
  /**
   * Parent step (for nested steps)
   */
  parent?: TestStep;
  
  /**
   * Child steps
   */
  steps: TestStep[];
  
  /**
   * Step location in source code
   */
  location?: { file: string; line: number; column: number };
}
```

### Error and Attachment Types

Data structures for test failures, debugging information, and test artifacts.

```typescript { .api }
/**
 * Test execution error information
 */
interface TestError {
  /**
   * Error message
   */
  message?: string;
  
  /**
   * Stack trace
   */
  stack?: string;
  
  /**
   * Error location in source code
   */
  location?: { file: string; line: number; column: number };
  
  /**
   * Associated test step (if any)
   */
  snippet?: string;
}

/**
 * Test result attachment (screenshot, video, trace, etc.)
 */
interface Attachment {
  /**
   * Attachment name
   */
  name: string;
  
  /**
   * MIME content type
   */
  contentType: string;
  
  /**
   * File path to attachment
   */
  path?: string;
  
  /**
   * Attachment body (for small attachments)
   */
  body?: Buffer;
}
```

### Built-in Reporter Types

Description of built-in reporters and their output formats.

```typescript { .api }
/**
 * List Reporter - Detailed step-by-step output
 * Shows test progress with detailed step information
 */
type ListReporter = 'list';

/**
 * Dot Reporter - Compact progress indicator
 * Shows single character per test result
 */
type DotReporter = 'dot';

/**
 * Line Reporter - Single line progress
 * Updates single line with current test status
 */
type LineReporter = 'line';

/**
 * JSON Reporter - Structured test results
 * Outputs complete test results as JSON
 */
type JsonReporter = 'json';

/**
 * JUnit Reporter - JUnit XML format
 * Compatible with CI/CD systems expecting JUnit format
 */
type JUnitReporter = 'junit';

/**
 * HTML Reporter - Interactive web report
 * Generates browsable HTML report with filtering and trace viewer
 */
type HtmlReporter = 'html';

/**
 * Blob Reporter - Binary blob format
 * Efficient format for report merging and storage
 */
type BlobReporter = 'blob';

/**
 * GitHub Reporter - GitHub Actions integration
 * Optimized output for GitHub Actions CI environment
 */
type GitHubReporter = 'github';

/**
 * Null Reporter - No output
 * Suppresses all test output
 */
type NullReporter = 'null';
```

**Usage Examples:**

```typescript
// Custom reporter implementation
class CustomReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite) {
    console.log(`Starting test run with ${suite.allTests().length} tests`);
  }
  
  onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status;
    const duration = result.duration;
    console.log(`${test.title}: ${status} (${duration}ms)`);
  }
  
  onEnd(result: FullResult) {
    console.log(`Test run ${result.status} after ${result.duration}ms`);
  }
}

// Export for use in configuration
module.exports = CustomReporter;
```

### Runtime Configuration Access

Interface for accessing resolved configuration during test execution.

```typescript { .api }
/**
 * Complete resolved configuration available at runtime
 */
interface FullConfig {
  /**
   * Root directory for tests
   */
  rootDir: string;
  
  /**
   * Resolved projects configuration
   */
  projects: FullProject[];
  
  /**
   * Global test timeout
   */
  timeout: number;
  
  /**
   * Worker count
   */
  workers: number;
  
  /**
   * Configuration file path
   */
  configFile?: string;
  
  /**
   * Test report output directory
   */
  outputDir: string;
  
  /**
   * Reporter configuration
   */
  reporter: ReporterDescription[];
  
  /**
   * Web server configuration (if any)  
   */
  webServer?: WebServerConfig;
}

/**
 * Resolved project configuration
 */
interface FullProject {
  /**
   * Project name
   */
  name: string;
  
  /**
   * Project test directory
   */
  testDir: string;
  
  /**
   * Project output directory
   */
  outputDir: string;
  
  /**
   * Resolved project options
   */
  use: PlaywrightTestOptions;
  
  /**
   * Project dependencies
   */
  dependencies: string[];
  
  /**
   * Project timeout
   */
  timeout: number;
}
```