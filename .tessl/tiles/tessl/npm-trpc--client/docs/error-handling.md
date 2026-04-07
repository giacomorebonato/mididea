# Error Handling

Comprehensive error handling system with structured error information and type guards for error identification. The tRPC client provides detailed error information including server responses, network issues, and client-side problems.

## Capabilities

### TRPCClientError

Main error class for all tRPC client operations, extending the standard JavaScript Error with structured error data and metadata.

```typescript { .api }
/**
 * Main error class for tRPC client operations
 * Extends Error with structured error data and metadata
 */
class TRPCClientError<TRouterOrProcedure extends InferrableClientTypes> extends Error {
  /** Error message */
  readonly message: string;
  
  /** Structured error data from server */
  readonly shape: Maybe<inferErrorShape<TRouterOrProcedure>>;
  
  /** Error-specific data payload */
  readonly data: Maybe<inferErrorShape<TRouterOrProcedure>['data']>;
  
  /** Original error cause */
  readonly cause: Error;
  
  /** Additional metadata (e.g., HTTP response details) */
  meta: Record<string, unknown>;

  constructor(
    message: string,
    opts?: {
      result?: Maybe<TRPCErrorResponse<inferErrorShape<TRouterOrProcedure>>>;
      cause?: Error;
      meta?: Record<string, unknown>;
    }
  );

  /**
   * Creates TRPCClientError from various error sources
   * @param cause - Error source (Error, TRPCErrorResponse, or object)
   * @param opts - Additional options including metadata
   * @returns Properly formatted TRPCClientError instance
   */
  static from<TRouterOrProcedure extends InferrableClientTypes>(
    cause: Error | TRPCErrorResponse | object,
    opts?: { meta?: Record<string, unknown> }
  ): TRPCClientError<TRouterOrProcedure>;
}

/** Server error response structure */
interface TRPCErrorResponse<TShape> {
  error: {
    code: number;
    message: string;
    data?: TShape['data'];
  };
}

/** Utility type for nullable values */
type Maybe<T> = T | null | undefined;

/** Infer error shape from router or procedure type */
type inferErrorShape<TInferrable extends InferrableClientTypes> = 
  inferClientTypes<TInferrable>['errorShape'];
```

**Usage Examples:**

```typescript
import { TRPCClientError, isTRPCClientError } from "@trpc/client";

// Basic error handling
try {
  const user = await client.user.getById.query({ id: 999 });
} catch (error) {
  if (error instanceof TRPCClientError) {
    console.log("tRPC Error:", error.message);
    console.log("Error code:", error.data?.code);
    console.log("Error details:", error.data);
    
    // Access HTTP metadata if available
    if (error.meta?.response) {
      console.log("HTTP status:", error.meta.response.status);
    }
  }
}

// Create error from different sources
const networkError = new Error("Network timeout");
const trpcError = TRPCClientError.from(networkError, {
  meta: { source: "network" }
});

// Server error response
const serverErrorResponse = {
  error: {
    code: -32602,
    message: "Invalid params",
    data: { field: "id", issue: "required" }
  }
};
const validationError = TRPCClientError.from(serverErrorResponse);
```

### isTRPCClientError

Type guard function to safely check if an unknown error is a TRPCClientError instance.

```typescript { .api }
/**
 * Type guard to check if error is TRPCClientError instance
 * @param cause - Unknown error value to check
 * @returns True if cause is TRPCClientError, false otherwise
 */
function isTRPCClientError<TInferrable extends InferrableClientTypes>(
  cause: unknown
): cause is TRPCClientError<TInferrable>;
```

**Usage Examples:**

```typescript
// Safe error type checking
function handleError(error: unknown) {
  if (isTRPCClientError(error)) {
    // TypeScript knows this is TRPCClientError
    console.log("tRPC error:", error.message);
    console.log("Error shape:", error.shape);
    console.log("Error data:", error.data);
    
    // Handle specific error codes
    if (error.data?.code === "UNAUTHORIZED") {
      redirectToLogin();
    } else if (error.data?.code === "FORBIDDEN") {
      showAccessDeniedMessage();
    }
  } else if (error instanceof Error) {
    // Standard JavaScript error
    console.log("Standard error:", error.message);
  } else {
    // Unknown error type
    console.log("Unknown error:", error);
  }
}

// Use in async error handling
async function fetchUserData(id: number) {
  try {
    return await client.user.getById.query({ id });
  } catch (error) {
    if (isTRPCClientError(error)) {
      // Handle tRPC-specific errors
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    // Re-throw other errors
    throw error;
  }
}
```

### Error Categories

Different types of errors that can occur in tRPC client operations.

```typescript { .api }
/** Network and connection errors */
interface NetworkError {
  type: 'network';
  cause: Error;
  meta?: {
    url?: string;
    method?: string;
    timeout?: boolean;
  };
}

/** HTTP response errors */
interface HTTPError {
  type: 'http';
  status: number;
  statusText: string;
  meta: {
    response: Response;
    responseJSON?: any;
  };
}

/** Server-side validation or business logic errors */
interface ServerError {
  type: 'server';
  code: string | number;
  message: string;
  data?: Record<string, any>;
}

/** Client-side validation or configuration errors */
interface ClientError {
  type: 'client';
  cause: Error;
  operation?: string;
}
```

**Error Category Examples:**

```typescript
// Network error handling
try {
  const result = await client.posts.getAll.query();
} catch (error) {
  if (isTRPCClientError(error)) {
    // Check if it's a network error
    if (error.cause?.name === 'TypeError' && error.cause?.message.includes('fetch')) {
      console.log("Network error - check connection");
      showOfflineMessage();
      return;
    }
    
    // Check HTTP status codes
    const httpStatus = error.meta?.response?.status;
    if (httpStatus === 500) {
      console.log("Server error - try again later");
      showRetryButton();
    } else if (httpStatus === 404) {
      console.log("Resource not found");
      showNotFoundMessage();
    }
    
    // Check tRPC error codes
    if (error.data?.code === 'TIMEOUT') {
      console.log("Request timeout - try again");
    } else if (error.data?.code === 'PARSE_ERROR') {
      console.log("Invalid request format");
    }
  }
}
```

### HTTP Error Details

Access detailed HTTP response information from failed requests.

```typescript { .api }
/** HTTP response metadata structure */
interface HTTPResponseMeta {
  response: Response;
  responseJSON?: any;
  request?: {
    url: string;
    method: string;
    headers: Record<string, string>;
  };
}
```

**HTTP Error Examples:**

```typescript
// Detailed HTTP error analysis
try {
  const user = await client.user.update.mutate({ id: 1, name: "New Name" });
} catch (error) {
  if (isTRPCClientError(error) && error.meta?.response) {
    const response = error.meta.response as Response;
    
    console.log("HTTP Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("Response Headers:", Object.fromEntries(response.headers.entries()));
    
    // Handle specific HTTP status codes
    switch (response.status) {
      case 400:
        console.log("Bad Request - check input data");
        if (error.data?.validationErrors) {
          displayValidationErrors(error.data.validationErrors);
        }
        break;
      case 401:
        console.log("Unauthorized - refresh token");
        await refreshAuthToken();
        break;
      case 403:
        console.log("Forbidden - insufficient permissions");
        showPermissionError();
        break;
      case 404:
        console.log("Not Found - resource doesn't exist");
        redirectToNotFound();
        break;
      case 429:
        console.log("Rate Limited - wait before retry");
        const retryAfter = response.headers.get('Retry-After');
        scheduleRetry(parseInt(retryAfter || '60'));
        break;
      case 500:
        console.log("Server Error - report to support");
        reportServerError(error);
        break;
    }
    
    // Access raw response body if available
    if (error.meta.responseJSON) {
      console.log("Response Body:", error.meta.responseJSON);
    }
  }
}
```

### Validation Error Handling

Handle structured validation errors from input/output schema validation.

```typescript { .api }
/** Validation error structure */
interface ValidationError {
  code: string;
  message: string;
  path: (string | number)[];
  expected?: any;
  received?: any;
}

/** Validation error response */
interface ValidationErrorResponse {
  code: 'BAD_REQUEST' | 'VALIDATION_ERROR';
  message: string;
  validationErrors: ValidationError[];
}
```

**Validation Error Examples:**

```typescript
// Handle input validation errors
try {
  const user = await client.user.create.mutate({
    name: "", // Invalid empty name
    email: "invalid-email", // Invalid email format
    age: -5, // Invalid negative age
  });
} catch (error) {
  if (isTRPCClientError(error) && error.data?.code === 'BAD_REQUEST') {
    const validationErrors = error.data.validationErrors as ValidationError[];
    
    validationErrors.forEach((err) => {
      const fieldPath = err.path.join('.');
      console.log(`Validation error in ${fieldPath}: ${err.message}`);
      
      // Show field-specific errors in UI
      if (fieldPath === 'email') {
        showFieldError('email', 'Please enter a valid email address');
      } else if (fieldPath === 'name') {
        showFieldError('name', 'Name is required');
      } else if (fieldPath === 'age') {
        showFieldError('age', 'Age must be a positive number');
      }
    });
  }
}

// Handle output validation errors (server response doesn't match schema)
try {
  const posts = await client.posts.getAll.query();
} catch (error) {
  if (isTRPCClientError(error) && error.data?.code === 'INTERNAL_SERVER_ERROR') {
    if (error.message.includes('output validation')) {
      console.error("Server returned invalid data format");
      // Report to monitoring service
      reportDataIntegrityIssue(error);
    }
  }
}
```

### Error Recovery Strategies

Common patterns for recovering from different types of errors.

```typescript { .api }
/** Retry configuration options */
interface RetryOptions {
  maxAttempts: number;
  delayMs: number | ((attempt: number) => number);
  retryIf: (error: TRPCClientError<any>) => boolean;
}
```

**Error Recovery Examples:**

```typescript
// Exponential backoff retry
async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: TRPCClientError<any>;
  
  for (let attempt = 0; attempt < options.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isTRPCClientError(error) || !options.retryIf(error)) {
        throw error;
      }
      
      lastError = error;
      
      if (attempt < options.maxAttempts - 1) {
        const delay = typeof options.delayMs === 'function' 
          ? options.delayMs(attempt)
          : options.delayMs;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Usage with retry strategy
const userData = await withRetry(
  () => client.user.getById.query({ id: 1 }),
  {
    maxAttempts: 3,
    delayMs: (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000),
    retryIf: (error) => {
      // Retry on network errors and 5xx server errors
      const isNetworkError = error.cause?.name === 'TypeError';
      const isServerError = error.meta?.response?.status >= 500;
      return isNetworkError || isServerError;
    }
  }
);

// Graceful degradation
async function getUserWithFallback(id: number) {
  try {
    return await client.user.getById.query({ id });
  } catch (error) {
    if (isTRPCClientError(error)) {
      console.warn("Failed to fetch user, using cached data:", error.message);
      return getCachedUser(id);
    }
    throw error;
  }
}

// Circuit breaker pattern
class CircuitBreaker {
  private failures = 0;
  private readonly threshold = 5;
  private readonly timeoutMs = 30000;
  private lastFailTime = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error("Circuit breaker is open");
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    return this.failures >= this.threshold && 
           (Date.now() - this.lastFailTime) < this.timeoutMs;
  }

  private onSuccess(): void {
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailTime = Date.now();
  }
}
```

### Error Monitoring and Reporting

Integration with error monitoring services for production error tracking.

```typescript { .api }
/** Error context for monitoring services */
interface ErrorContext {
  operation: {
    type: 'query' | 'mutation' | 'subscription';
    path: string;
    input?: any;
  };
  user?: {
    id: string;
    email?: string;
  };
  session?: {
    id: string;
    duration: number;
  };
  environment: {
    userAgent: string;
    url: string;
    timestamp: number;
  };
}
```

**Error Monitoring Examples:**

```typescript
// Global error handler for monitoring
function setupErrorMonitoring() {
  const originalConsoleError = console.error;
  
  console.error = (...args) => {
    args.forEach(arg => {
      if (isTRPCClientError(arg)) {
        reportErrorToMonitoring(arg);
      }
    });
    originalConsoleError(...args);
  };
}

function reportErrorToMonitoring(error: TRPCClientError<any>) {
  const context: ErrorContext = {
    operation: {
      type: error.meta?.operationType || 'unknown',
      path: error.meta?.operationPath || 'unknown',
      input: error.meta?.operationInput,
    },
    user: getCurrentUser(),
    session: getCurrentSession(),
    environment: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
    },
  };

  // Send to monitoring service (Sentry, Datadog, etc.)
  monitoringService.captureException(error, context);
}

// Custom error boundary for React applications
class TRPCErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (isTRPCClientError(error)) {
      reportErrorToMonitoring(error);
      
      // Show user-friendly error message
      this.setState({
        hasError: true,
        errorType: 'trpc',
        canRetry: this.isRetryableError(error),
      });
    }
  }

  private isRetryableError(error: TRPCClientError<any>): boolean {
    const httpStatus = error.meta?.response?.status;
    return httpStatus === 429 || httpStatus >= 500 || 
           error.cause?.name === 'TypeError';
  }
}
```