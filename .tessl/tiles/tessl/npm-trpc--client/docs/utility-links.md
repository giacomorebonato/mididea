# Utility Links

Middleware links for logging, conditional routing, retry logic, and other cross-cutting concerns in the link chain. These links provide essential functionality for debugging, reliability, and routing operations.

## Capabilities

### loggerLink

Logs tRPC operations for debugging purposes, providing detailed information about requests, responses, and errors.

```typescript { .api }
/**
 * Creates a logging link for debugging tRPC operations
 * @param opts - Logger configuration options
 * @returns Logger middleware link for the client chain
 */
function loggerLink<TRouter extends AnyRouter>(
  opts?: LoggerLinkOptions<TRouter>
): TRPCLink<TRouter>;

interface LoggerLinkOptions<TRouter extends AnyRouter> {
  /** Custom logging function */
  logger?: LoggerLinkFn<TRouter>;
  
  /** Conditional logging function */
  enabled?: EnabledFn<TRouter>;
  
  /** Console implementation to use */
  console?: ConsoleEsque;
  
  /** Color mode for log output */
  colorMode?: ColorMode;
  
  /** Include operation context in logs */
  withContext?: boolean;
}

type LoggerLinkFn<TRouter extends AnyRouter> = (
  opts: LoggerLinkFnOptions<TRouter>
) => void;

interface LoggerLinkFnOptions<TRouter extends AnyRouter> extends Operation {
  direction: 'up' | 'down';
  result?: OperationResultEnvelope<unknown, TRPCClientError<TRouter>> | TRPCClientError<TRouter>;
  elapsedMs?: number;
}

type EnabledFn<TRouter extends AnyRouter> = (
  opts: EnableFnOptions<TRouter>
) => boolean;

type ColorMode = 'ansi' | 'css' | 'none';

interface ConsoleEsque {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
}
```

**Usage Examples:**

```typescript
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";

// Basic logging (logs all operations)
const client = createTRPCClient<AppRouter>({
  links: [
    loggerLink(),
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

// Conditional logging (only errors)
const client = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (opts) => 
        opts.direction === 'down' && opts.result instanceof Error,
    }),
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

// Custom logger with detailed information
const client = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      logger: ({ op, direction, result, elapsedMs }) => {
        if (direction === 'up') {
          console.log(`🔄 ${op.type.toUpperCase()} ${op.path}`, {
            input: op.input,
            context: op.context,
          });
        } else {
          const success = !(result instanceof Error);
          const icon = success ? '✅' : '❌';
          console.log(`${icon} ${op.type.toUpperCase()} ${op.path} (${elapsedMs}ms)`, {
            result: success ? result : result.message,
          });
        }
      },
    }),
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

// Development vs production logging
const client = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: () => process.env.NODE_ENV === 'development',
      colorMode: process.env.NODE_ENV === 'development' ? 'ansi' : 'none',
      withContext: true,
    }),
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});
```

### splitLink

Conditionally routes operations to different link chains based on operation characteristics, enabling different transport or middleware for different types of operations.

```typescript { .api }
/**
 * Creates a conditional routing link that splits operations between different link chains
 * @param opts - Split configuration options
 * @returns Split routing link for conditional operation handling
 */
function splitLink<TRouter extends AnyRouter>(opts: {
  /** Routing predicate function */
  condition: (op: Operation) => boolean;
  /** Link(s) for operations where condition returns true */
  true: TRPCLink<TRouter> | TRPCLink<TRouter>[];
  /** Link(s) for operations where condition returns false */
  false: TRPCLink<TRouter> | TRPCLink<TRouter>[];
}): TRPCLink<TRouter>;

interface Operation {
  /** Operation type */
  type: 'query' | 'mutation' | 'subscription';
  /** Procedure path */
  path: string;
  /** Operation input data */
  input: unknown;
  /** Operation context */
  context: OperationContext;
  /** Request ID */
  id: number;
  /** Abort signal for cancellation */
  signal: AbortSignal | null;
}
```

**Usage Examples:**

```typescript
import { 
  createTRPCClient, 
  httpBatchLink, 
  wsLink, 
  splitLink, 
  createWSClient 
} from "@trpc/client";

// Split by operation type (HTTP for queries/mutations, WebSocket for subscriptions)
const wsClient = createWSClient({
  url: "ws://localhost:3001",
});

const client = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: wsLink({
        client: wsClient,
      }),
      false: httpBatchLink({
        url: "http://localhost:3000/trpc",
      }),
    }),
  ],
});

// Split by procedure path (different endpoints for different services)
const client = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.path.startsWith('analytics.'),
      true: httpBatchLink({
        url: "http://analytics-service:3000/trpc",
      }),
      false: httpBatchLink({
        url: "http://main-service:3000/trpc",
      }),
    }),
  ],
});

// Split by input characteristics (large file uploads use different endpoint)
const client = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => {
        return op.type === 'mutation' && 
               op.input instanceof FormData ||
               (op.input as any)?.fileSize > 1024 * 1024; // 1MB
      },
      true: httpLink({
        url: "http://upload-service:3000/trpc",
      }),
      false: httpBatchLink({
        url: "http://localhost:3000/trpc",
      }),
    }),
  ],
});

// Multi-level split with nested conditions
const client = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: wsLink({ client: wsClient }),
      false: splitLink({
        condition: (op) => op.path.startsWith('admin.'),
        true: httpLink({
          url: "http://admin-service:3000/trpc",
          headers: {
            'X-Admin-Access': 'true',
          },
        }),
        false: httpBatchLink({
          url: "http://localhost:3000/trpc",
        }),
      }),
    }),
  ],
});
```

### retryLink

Adds retry logic to failed operations with configurable retry conditions and delay strategies.

```typescript { .api }
/**
 * Creates a retry link that automatically retries failed operations
 * @param opts - Retry configuration options
 * @returns Retry middleware link for automatic operation retry
 */
function retryLink<TInferrable extends InferrableClientTypes>(
  opts: RetryLinkOptions<TInferrable>
): TRPCLink<TInferrable>;

interface RetryLinkOptions<TInferrable extends InferrableClientTypes> {
  /** Function to determine if operation should be retried */
  retry: (opts: RetryFnOptions<TInferrable>) => boolean;
  /** Delay calculation function between retries */
  retryDelayMs?: (attempt: number) => number;
}

interface RetryFnOptions<TInferrable extends InferrableClientTypes> {
  /** The operation that failed */
  op: Operation;
  /** The error that occurred */
  error: TRPCClientError<TInferrable>;
  /** Number of attempts made (including initial call) */
  attempts: number;
}
```

**Usage Examples:**

```typescript
import { createTRPCClient, httpBatchLink, retryLink, isTRPCClientError } from "@trpc/client";

// Basic retry for network errors
const client = createTRPCClient<AppRouter>({
  links: [
    retryLink({
      retry: ({ error, attempts }) => {
        // Retry up to 3 times for network errors
        return attempts <= 3 && 
               (error.cause?.name === 'TypeError' || 
                error.meta?.response?.status >= 500);
      },
      retryDelayMs: (attempt) => Math.min(1000 * Math.pow(2, attempt), 30000),
    }),
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

// Sophisticated retry strategy
const client = createTRPCClient<AppRouter>({
  links: [
    retryLink({
      retry: ({ op, error, attempts }) => {
        // Never retry mutations (they might not be idempotent)
        if (op.type === 'mutation') {
          return false;
        }

        // Don't retry client-side validation errors
        if (error.data?.code === 'BAD_REQUEST') {
          return false;
        }

        // Retry up to 5 times for queries
        if (attempts > 5) {
          return false;
        }

        // Retry network errors and 5xx server errors
        const isNetworkError = error.cause?.name === 'TypeError';
        const isServerError = error.meta?.response?.status >= 500;
        const isRateLimit = error.meta?.response?.status === 429;

        return isNetworkError || isServerError || isRateLimit;
      },
      retryDelayMs: (attempt) => {
        // Exponential backoff with jitter
        const baseDelay = Math.min(1000 * Math.pow(2, attempt), 30000);
        const jitter = Math.random() * 0.3 * baseDelay;
        return baseDelay + jitter;
      },
    }),
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

// Conditional retry based on operation
const client = createTRPCClient<AppRouter>({
  links: [
    retryLink({
      retry: ({ op, error, attempts }) => {
        // Critical operations get more retries
        const isCritical = op.path.includes('payment') || op.path.includes('auth');
        const maxAttempts = isCritical ? 5 : 3;

        if (attempts > maxAttempts) {
          return false;
        }

        // Handle rate limiting with exponential backoff
        if (error.meta?.response?.status === 429) {
          return attempts <= 10; // Allow more retries for rate limits
        }

        // Standard retry conditions
        return error.cause?.name === 'TypeError' || 
               error.meta?.response?.status >= 500;
      },
      retryDelayMs: (attempt) => {
        // Different delays for different error types
        return attempt === 0 ? 0 : Math.min(500 * attempt, 10000);
      },
    }),
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});
```

### Custom Utility Links

Examples of creating custom utility links for specific use cases.

```typescript { .api }
/** Generic link function signature */
type TRPCLink<TInferrable extends InferrableClientTypes> = (
  runtime: TRPCClientRuntime
) => OperationLink<TInferrable>;

/** Operation link after runtime initialization */
type OperationLink<TInferrable extends InferrableClientTypes> = (
  opts: { op: Operation }
) => Observable<OperationResultEnvelope>;

/** Client runtime configuration */
interface TRPCClientRuntime {
  [key: string]: unknown;
}
```

**Custom Link Examples:**

```typescript
import { observable } from "@trpc/server/observable";

// Authentication link that adds auth headers
function authLink(): TRPCLink<any> {
  return () => {
    return ({ op, next }) => {
      return observable((observer) => {
        // Add authentication context
        const authedOp = {
          ...op,
          context: {
            ...op.context,
            authorization: getAuthToken(),
          },
        };

        return next(authedOp).subscribe(observer);
      });
    };
  };
}

// Caching link for read operations
function cacheLink(cache: Map<string, any>): TRPCLink<any> {
  return () => {
    return ({ op, next }) => {
      return observable((observer) => {
        if (op.type === 'query') {
          const cacheKey = `${op.path}:${JSON.stringify(op.input)}`;
          const cached = cache.get(cacheKey);
          
          if (cached) {
            observer.next({ result: { type: 'data', data: cached } });
            observer.complete();
            return;
          }

          return next(op).subscribe({
            next: (envelope) => {
              // Cache successful query results
              if (envelope.result.type === 'data') {
                cache.set(cacheKey, envelope.result.data);
              }
              observer.next(envelope);
            },
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });
        }

        return next(op).subscribe(observer);
      });
    };
  };
}

// Rate limiting link
function rateLimitLink(requestsPerSecond: number): TRPCLink<any> {
  const requests: number[] = [];

  return () => {
    return ({ op, next }) => {
      return observable((observer) => {
        const now = Date.now();
        
        // Clean old requests
        while (requests.length > 0 && now - requests[0] > 1000) {
          requests.shift();
        }

        // Check rate limit
        if (requests.length >= requestsPerSecond) {
          const delay = 1000 - (now - requests[0]);
          setTimeout(() => {
            requests.push(now + delay);
            next(op).subscribe(observer);
          }, delay);
          return;
        }

        requests.push(now);
        return next(op).subscribe(observer);
      });
    };
  };
}

// Usage of custom links
const client = createTRPCClient<AppRouter>({
  links: [
    loggerLink({ enabled: () => process.env.NODE_ENV === 'development' }),
    authLink(),
    cacheLink(new Map()),
    rateLimitLink(10), // 10 requests per second
    retryLink({
      retry: ({ attempts }) => attempts <= 3,
      retryDelayMs: (attempt) => 1000 * attempt,
    }),
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});
```

### Link Chain Composition

Understanding how utility links work together in the client chain.

```typescript { .api }
/** Example of a complete link chain flow */
interface LinkChainFlow {
  /** 1. Request starts from client */
  clientRequest: Operation;
  
  /** 2. Goes through each link in order */
  linkProcessing: Array<{
    linkName: string;
    transforms: string[];
    canModifyOp: boolean;
    canModifyResult: boolean;
  }>;
  
  /** 3. Reaches terminating link (HTTP, WebSocket, etc.) */
  terminalTransport: string;
  
  /** 4. Response flows back through links in reverse order */
  responseProcessing: Array<{
    linkName: string;
    transforms: string[];
  }>;
  
  /** 5. Final result delivered to client */
  clientResponse: any;
}
```

**Link Chain Examples:**

```typescript
// Understanding link execution order
const client = createTRPCClient<AppRouter>({
  links: [
    // 1. Logger (request up) - logs outgoing request
    loggerLink(),
    
    // 2. Auth - adds authentication headers
    authLink(),
    
    // 3. Retry - handles retry logic
    retryLink({
      retry: ({ attempts }) => attempts <= 3,
    }),
    
    // 4. Split - routes based on operation type
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: wsLink({ client: wsClient }),
      false: [
        // 5a. Cache (for HTTP operations)
        cacheLink(new Map()),
        
        // 6a. HTTP transport (terminating link)
        httpBatchLink({
          url: "http://localhost:3000/trpc",
        }),
      ],
    }),
  ],
});

// Flow for a query operation:
// Request: Client → Logger → Auth → Retry → Split → Cache → HTTP → Server
// Response: Server → HTTP → Cache → Split → Retry → Auth → Logger → Client

// Flow for a subscription:
// Request: Client → Logger → Auth → Retry → Split → WebSocket → Server  
// Response: Server → WebSocket → Split → Retry → Auth → Logger → Client
```