# Advanced Features

Advanced functionality including local transport for in-process communication, unstable internal APIs, and utility functions for specialized use cases.

## Capabilities

### unstable_localLink

Creates a local transport link that allows direct in-process communication with a tRPC router, bypassing HTTP entirely. This is useful for server-side rendering, testing, or when both client and server code run in the same process.

```typescript { .api }
/**
 * Creates a local transport link for in-process router communication
 * @param opts - Local link configuration options
 * @returns Local transport link that calls router procedures directly
 */
function unstable_localLink<TRouter extends AnyRouter>(
  opts: LocalLinkOptions<TRouter>
): TRPCLink<TRouter>;

interface LocalLinkOptions<TRouter extends AnyRouter> {
  /** tRPC router instance to call directly */
  router: TRouter;
  
  /** Function to create request context */
  createContext: () => Promise<inferRouterContext<TRouter>>;
  
  /** Error handler for procedure errors */
  onError?: (opts: ErrorHandlerOptions<inferRouterContext<TRouter>>) => void;
  
  /** Data transformation configuration */
  transformer?: inferClientTypes<TRouter>['transformer'];
}

interface ErrorHandlerOptions<TContext> {
  /** The tRPC error that occurred */
  error: TRPCError;
  /** Operation type that failed */
  type: 'query' | 'mutation' | 'subscription';
  /** Procedure path that failed */
  path: string;
  /** Input data that caused the error */
  input: unknown;
  /** Request context at time of error */
  ctx: TContext | undefined;
}

type inferRouterContext<TRouter extends AnyRouter> = 
  TRouter['_def']['_config']['$types']['ctx'];

/**
 * @deprecated Renamed to unstable_localLink, will be removed in future version
 */
const experimental_localLink = unstable_localLink;
```

**Usage Examples:**

```typescript
import { createTRPCClient, unstable_localLink } from "@trpc/client";
import { appRouter } from "./server/router";

// Basic local link setup
const client = createTRPCClient<typeof appRouter>({
  links: [
    unstable_localLink({
      router: appRouter,
      createContext: async () => ({
        user: { id: '1', name: 'Test User' },
        db: mockDatabase,
      }),
    }),
  ],
});

// Server-side rendering with Next.js
export async function getServerSideProps() {
  const client = createTRPCClient<AppRouter>({
    links: [
      unstable_localLink({
        router: appRouter,
        createContext: async () => ({
          // Create context for SSR
          user: await getServerSideUser(),
          db: database,
        }),
      }),
    ],
  });

  const posts = await client.posts.getAll.query();
  
  return {
    props: {
      posts,
    },
  };
}

// Testing with local link
describe('User operations', () => {
  const createTestClient = () => createTRPCClient<AppRouter>({
    links: [
      unstable_localLink({
        router: appRouter,
        createContext: async () => ({
          user: { id: 'test-user', role: 'admin' },
          db: testDatabase,
        }),
        onError: ({ error, type, path, input }) => {
          console.error(`Test error in ${type} ${path}:`, error.message);
          console.error('Input:', input);
        },
      }),
    ],
  });

  it('should create user', async () => {
    const client = createTestClient();
    const user = await client.user.create.mutate({
      name: 'Test User',
      email: 'test@example.com',
    });
    expect(user.name).toBe('Test User');
  });
});

// Development mode with fallback
const isDevelopment = process.env.NODE_ENV === 'development';
const useLocalRouter = process.env.USE_LOCAL_ROUTER === 'true';

const client = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: () => isDevelopment && useLocalRouter,
      true: unstable_localLink({
        router: appRouter,
        createContext: async () => developmentContext,
      }),
      false: httpBatchLink({
        url: 'http://localhost:3000/trpc',
      }),
    }),
  ],
});
```

### Data Transformers

Utilities for configuring data transformation between client and server, supporting serialization of complex types like dates, sets, and custom objects.

```typescript { .api }
/**
 * Resolves transformer configuration to a combined data transformer
 * @param transformer - Transformer options (undefined, single, or separate input/output)
 * @returns Combined transformer with input and output serialization
 */
function getTransformer(
  transformer: TransformerOptions<any>['transformer']
): CombinedDataTransformer;

interface CombinedDataTransformer {
  /** Input data transformation (client → server) */
  input: {
    serialize: (data: any) => any;
    deserialize: (data: any) => any;
  };
  /** Output data transformation (server → client) */
  output: {
    serialize: (data: any) => any;
    deserialize: (data: any) => any;
  };
}

interface DataTransformerOptions {
  /** Serialize function for outgoing data */
  serialize: (data: any) => any;
  /** Deserialize function for incoming data */
  deserialize: (data: any) => any;
}

type TransformerOptions<TRoot extends Pick<AnyClientTypes, 'transformer'>> = 
  TRoot['transformer'] extends true
    ? { transformer: DataTransformerOptions }
    : { transformer?: never };
```

**Transformer Examples:**

```typescript
import superjson from "superjson";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

// Using superjson for Date, Set, Map, etc.
const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      transformer: superjson,
    }),
  ],
});

// Custom transformer for specific data types
const customTransformer = {
  serialize: (data: any) => {
    // Convert BigInt to string for JSON serialization
    return JSON.parse(JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() + 'n' : value
    ));
  },
  deserialize: (data: any) => {
    // Convert string back to BigInt
    return JSON.parse(JSON.stringify(data), (key, value) => {
      if (typeof value === 'string' && value.endsWith('n')) {
        return BigInt(value.slice(0, -1));
      }
      return value;
    });
  },
};

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      transformer: customTransformer,
    }),
  ],
});

// Separate input and output transformers
const asymmetricTransformer = {
  input: {
    serialize: (data: any) => {
      // Client → Server transformation
      return JSON.stringify(data);
    },
    deserialize: (data: any) => {
      // Server processing of client data
      return JSON.parse(data);
    },
  },
  output: {
    serialize: (data: any) => {
      // Server → Client preparation
      return JSON.stringify(data);
    },
    deserialize: (data: any) => {
      // Client processing of server data
      return JSON.parse(data);
    },
  },
};
```

### Fetch Utilities

Utilities for resolving and configuring fetch implementations across different environments.

```typescript { .api }
/**
 * Resolves fetch implementation from custom, window, or globalThis
 * @param customFetchImpl - Optional custom fetch implementation
 * @returns Resolved fetch function
 * @throws Error if no fetch implementation is available
 */
function getFetch(customFetchImpl?: FetchEsque | NativeFetchEsque): FetchEsque;

/** Standard fetch function interface */
type FetchEsque = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

/** Native fetch with additional Node.js compatibility */
type NativeFetchEsque = typeof fetch;

/** Request configuration interface */
interface RequestInitEsque {
  method?: string;
  headers?: Record<string, string> | Headers;
  body?: string | FormData | URLSearchParams;
  signal?: AbortSignal;
}

/** Response interface for fetch operations */
interface ResponseEsque {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  json(): Promise<any>;
  text(): Promise<string>;
}
```

**Fetch Utility Examples:**

```typescript
import { getFetch } from "@trpc/client";
import fetch from "node-fetch";

// Node.js environment
const nodeFetch = getFetch(fetch as any);

// Browser environment (automatic detection)
const browserFetch = getFetch(); // Uses window.fetch

// Custom fetch with middleware
const customFetch: FetchEsque = async (input, init) => {
  console.log("Making request to:", input);
  const response = await fetch(input, init);
  console.log("Response status:", response.status);
  return response;
};

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      fetch: customFetch,
    }),
  ],
});

// Fetch with retry logic
const retryFetch: FetchEsque = async (input, init) => {
  const maxRetries = 3;
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(input, init);
      if (response.ok) {
        return response;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError!;
};
```

### Connection State Management

Types and utilities for managing connection states in WebSocket and subscription scenarios.

```typescript { .api }
/** Connection state for real-time transports */
type TRPCConnectionState<TError = unknown> = 
  | { type: 'connecting' }
  | { type: 'open' }
  | { type: 'closed' }
  | { type: 'error'; error: TError };

/** Observable connection state management */
interface ConnectionStateManager<TError> {
  /** Current connection state */
  state: TRPCConnectionState<TError>;
  /** Subscribe to state changes */
  subscribe: (observer: { next: (state: TRPCConnectionState<TError>) => void }) => Unsubscribable;
  /** Update connection state */
  next: (state: TRPCConnectionState<TError>) => void;
}
```

**Connection State Examples:**

```typescript
// Monitor connection state in React
function useConnectionState() {
  const [connectionState, setConnectionState] = useState<TRPCConnectionState>({ type: 'closed' });

  useEffect(() => {
    const wsClient = createWSClient({
      url: "ws://localhost:3001",
      onOpen: () => setConnectionState({ type: 'open' }),
      onClose: () => setConnectionState({ type: 'closed' }),
      onError: (error) => setConnectionState({ type: 'error', error }),
    });

    // Monitor connection state changes
    const subscription = wsClient.connectionState.subscribe({
      next: setConnectionState,
    });

    return () => {
      subscription.unsubscribe();
      wsClient.close();
    };
  }, []);

  return connectionState;
}

// Connection state in local link
const client = createTRPCClient<AppRouter>({
  links: [
    unstable_localLink({
      router: appRouter,
      createContext: async () => ({ db: mockDatabase }),
      onError: ({ error, type, path }) => {
        // Handle local procedure errors
        console.error(`Local ${type} error in ${path}:`, error.message);
      },
    }),
  ],
});
```

### Type Utilities

Advanced TypeScript utilities for working with tRPC client types.

```typescript { .api }
/** Infer client types from router definition */
type inferClientTypes<TRouter extends AnyRouter> = TRouter['_def']['_config']['$types'];

/** Infer router client interface */
type inferRouterClient<TRouter extends AnyRouter> = TRPCClient<TRouter>;

/** Infer procedure input type */
type inferProcedureInput<TProcedure extends AnyProcedure> = TProcedure['_def']['input'];

/** Infer procedure output type */
type inferProcedureOutput<TProcedure extends AnyProcedure> = TProcedure['_def']['output'];

/** Any router type constraint */
type AnyRouter = {
  _def: {
    _config: { $types: any };
    record: Record<string, any>;
  };
};

/** Any procedure type constraint */
type AnyProcedure = {
  _def: {
    type: 'query' | 'mutation' | 'subscription';
    input: any;
    output: any;
  };
};
```

**Type Utility Examples:**

```typescript
import type { inferRouterClient, inferProcedureInput } from "@trpc/client";

// Infer client type from router
type MyClient = inferRouterClient<typeof appRouter>;

// Infer input type for specific procedure
type CreateUserInput = inferProcedureInput<typeof appRouter.user.create>;

// Type-safe client wrapper
class TypedTRPCClient<TRouter extends AnyRouter> {
  constructor(private client: inferRouterClient<TRouter>) {}

  async safeQuery<TPath extends keyof TRouter['_def']['record']>(
    path: TPath,
    input?: inferProcedureInput<TRouter['_def']['record'][TPath]>
  ) {
    try {
      return await (this.client as any)[path].query(input);
    } catch (error) {
      if (isTRPCClientError(error)) {
        console.error(`Query ${String(path)} failed:`, error.message);
        return null;
      }
      throw error;
    }
  }
}

// Usage with inferred types
const typedClient = new TypedTRPCClient(client);
const user = await typedClient.safeQuery('user.getById', { id: 1 });
```

### Development and Testing Utilities

Utilities for development, testing, and debugging tRPC applications.

```typescript { .api }
/** Mock client factory for testing */
interface MockClientOptions<TRouter extends AnyRouter> {
  router?: Partial<TRouter>;
  mockResponses?: Record<string, any>;
  delay?: number;
  errorRate?: number;
}

/** Development debugging helpers */
interface DebugOptions {
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
  includeContext: boolean;
  includeInput: boolean;
  includeOutput: boolean;
}
```

**Development Utility Examples:**

```typescript
// Mock client for testing
function createMockClient<TRouter extends AnyRouter>(
  options: MockClientOptions<TRouter>
): TRPCClient<TRouter> {
  return createTRPCClient<TRouter>({
    links: [
      unstable_localLink({
        router: {
          user: {
            getById: async ({ input }: { input: { id: number } }) => {
              await new Promise(resolve => setTimeout(resolve, options.delay || 0));
              
              if (Math.random() < (options.errorRate || 0)) {
                throw new Error('Mock error');
              }
              
              return options.mockResponses?.[`user.getById.${input.id}`] || {
                id: input.id,
                name: `Mock User ${input.id}`,
              };
            },
          },
        } as any,
        createContext: async () => ({}),
      }),
    ],
  });
}

// Debug client wrapper
function createDebugClient<TRouter extends AnyRouter>(
  baseClient: TRPCClient<TRouter>,
  options: DebugOptions
): TRPCClient<TRouter> {
  const handler = {
    get(target: any, prop: string) {
      const value = target[prop];
      
      if (typeof value === 'object' && value !== null) {
        return new Proxy(value, handler);
      }
      
      if (typeof value === 'function' && ['query', 'mutate', 'subscribe'].includes(prop)) {
        return new Proxy(value, {
          apply(target, thisArg, args) {
            if (options.logLevel !== 'none') {
              console.log(`Debug: ${prop} called with:`, args);
            }
            
            const result = target.apply(thisArg, args);
            
            if (result instanceof Promise) {
              return result.then(
                (data) => {
                  if (options.includeOutput && options.logLevel !== 'none') {
                    console.log(`Debug: ${prop} result:`, data);
                  }
                  return data;
                },
                (error) => {
                  if (options.logLevel !== 'none') {
                    console.error(`Debug: ${prop} error:`, error);
                  }
                  throw error;
                }
              );
            }
            
            return result;
          },
        });
      }
      
      return value;
    },
  };
  
  return new Proxy(baseClient, handler);
}

// Usage in tests
describe('User API', () => {
  const mockClient = createMockClient<AppRouter>({
    mockResponses: {
      'user.getById.1': { id: 1, name: 'Alice', email: 'alice@example.com' },
      'user.getById.2': { id: 2, name: 'Bob', email: 'bob@example.com' },
    },
    delay: 100,
    errorRate: 0.1,
  });

  it('should fetch user by ID', async () => {
    const user = await mockClient.user.getById.query({ id: 1 });
    expect(user.name).toBe('Alice');
  });
});
```