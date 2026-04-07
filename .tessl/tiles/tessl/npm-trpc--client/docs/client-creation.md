# Client Creation

Core client factory functions for creating type-safe and untyped tRPC clients with configurable transport links.

## Capabilities

### createTRPCClient

Creates a type-safe tRPC client with full TypeScript inference from your router definition. This is the primary way to create a tRPC client that provides compile-time type safety and IntelliSense support.

```typescript { .api }
/**
 * Creates a type-safe tRPC client with full TypeScript inference
 * @param opts - Configuration options including links array
 * @returns Typed proxy client with router-specific methods
 */
function createTRPCClient<TRouter extends AnyRouter>(
  opts: CreateTRPCClientOptions<TRouter>
): TRPCClient<TRouter>;

interface CreateTRPCClientOptions<TRouter> {
  /** Array of transport and middleware links to compose together */
  links: TRPCLink<TRouter>[];
}

type TRPCClient<TRouter extends AnyRouter> = DecoratedProcedureRecord<
  {
    transformer: TRouter['_def']['_config']['$types']['transformer'];
    errorShape: TRouter['_def']['_config']['$types']['errorShape'];
  },
  TRouter['_def']['record']
>;
```

**Usage Examples:**

```typescript
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./server";

// Basic client with HTTP batching
const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

// Multi-link chain with logging and HTTP transport
const client = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (op) => op.direction === 'down' && op.result instanceof Error,
    }),
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      headers() {
        return {
          authorization: getAuthHeader(),
        };
      },
    }),
  ],
});

// Using the typed client
const user = await client.user.getById.query({ id: 1 });
const result = await client.posts.create.mutate({
  title: "Hello World",
  content: "My first post",
});
```

### createTRPCUntypedClient

Creates an untyped client for dynamic operations without compile-time type safety. Useful for scenarios where you need to make dynamic requests or when working with multiple router types.

```typescript { .api }
/**
 * Creates an untyped client for low-level operations
 * @param opts - Configuration options including links array
 * @returns Untyped client with query, mutation, and subscription methods
 */
function createTRPCUntypedClient<TRouter extends AnyRouter>(
  opts: CreateTRPCClientOptions<TRouter>
): TRPCUntypedClient<TRouter>;

class TRPCUntypedClient<TInferrable extends InferrableClientTypes> {
  /** Execute a query operation */
  query(path: string, input?: unknown, opts?: TRPCRequestOptions): Promise<unknown>;
  
  /** Execute a mutation operation */
  mutation(path: string, input?: unknown, opts?: TRPCRequestOptions): Promise<unknown>;
  
  /** Subscribe to a subscription operation */
  subscription(
    path: string,
    input: unknown,
    opts: Partial<TRPCSubscriptionObserver<unknown, TRPCClientError<any>>> & TRPCRequestOptions
  ): Unsubscribable;
  
  /** Runtime configuration available to links */
  readonly runtime: TRPCClientRuntime;
}
```

**Usage Examples:**

```typescript
import { createTRPCUntypedClient, httpLink } from "@trpc/client";

const client = createTRPCUntypedClient({
  links: [
    httpLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

// Dynamic query execution
const user = await client.query("user.getById", { id: 1 });

// Dynamic mutation execution
const result = await client.mutation("posts.create", {
  title: "Dynamic Post",
  content: "Created without type safety",
});

// Dynamic subscription
const unsubscribe = client.subscription("posts.onUpdate", undefined, {
  onData: (data) => console.log("Post updated:", data),
  onError: (err) => console.error("Subscription error:", err),
});
```

### Request Options

Configuration options for individual requests to control context and cancellation.

```typescript { .api }
interface TRPCRequestOptions {
  /** Pass additional context to links */
  context?: OperationContext;
  /** Abort signal for request cancellation */
  signal?: AbortSignal;
}

interface TRPCProcedureOptions {
  /** Client-side context data */
  context?: Record<string, unknown>;
  /** Abort signal for request cancellation */
  signal?: AbortSignal;
}

/** Context passed between links in the chain */
type OperationContext = Record<string, unknown>;
```

**Usage Examples:**

```typescript
// Using request options with typed client
const controller = new AbortController();
const user = await client.user.getById.query(
  { id: 1 },
  {
    context: { priority: 'high' },
    signal: controller.signal,
  }
);

// Cancel the request
controller.abort();

// Using request options with untyped client
const result = await untypedClient.query(
  "user.getById",
  { id: 1 },
  {
    context: { requestId: 'req-123' },
    signal: new AbortController().signal,
  }
);
```

### Subscription Observer

Interface for handling subscription events and state changes.

```typescript { .api }
interface TRPCSubscriptionObserver<TValue, TError> {
  /** Called when subscription starts */
  onStarted: (opts: { context: OperationContext | undefined }) => void;
  
  /** Called for each data emission */
  onData: (value: inferAsyncIterableYield<TValue>) => void;
  
  /** Called when subscription encounters an error */
  onError: (err: TError) => void;
  
  /** Called when subscription is manually stopped */
  onStopped: () => void;
  
  /** Called when subscription completes naturally */
  onComplete: () => void;
  
  /** Called when connection state changes (WebSocket reconnection, etc.) */
  onConnectionStateChange: (state: TRPCConnectionState<TError>) => void;
}

/** Represents an active subscription that can be cancelled */
interface Unsubscribable {
  unsubscribe(): void;
}
```

**Usage Examples:**

```typescript
// Complete subscription observer
const unsubscribe = client.posts.onUpdate.subscribe(undefined, {
  onStarted: ({ context }) => {
    console.log("Subscription started with context:", context);
  },
  onData: (post) => {
    console.log("Received post update:", post);
    updateUI(post);
  },
  onError: (err) => {
    console.error("Subscription error:", err);
    showErrorMessage(err.message);
  },
  onStopped: () => {
    console.log("Subscription stopped");
  },
  onComplete: () => {
    console.log("Subscription completed");
  },
  onConnectionStateChange: (state) => {
    if (state.type === 'connecting') {
      console.log("Reconnecting to server...");
    }
  },
});

// Clean up subscription
unsubscribe.unsubscribe();
```

### Utility Functions

Additional utility functions for client management and inspection.

```typescript { .api }
/**
 * Extract untyped client from typed proxy client (internal utility)
 * @param client - Typed tRPC client
 * @returns Underlying untyped client instance
 */
function getUntypedClient<TRouter extends AnyRouter>(
  client: TRPCClient<TRouter>
): TRPCUntypedClient<TRouter>;
```

**Usage Examples:**

```typescript
import { createTRPCClient, getUntypedClient, httpBatchLink } from "@trpc/client";

const typedClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "http://localhost:3000/trpc" })],
});

// Access untyped client for dynamic operations
const untypedClient = getUntypedClient(typedClient);

// Mix typed and untyped operations
const typedResult = await typedClient.user.getById.query({ id: 1 });
const dynamicResult = await untypedClient.query("user.search", { term: "alice" });
```

### Deprecated APIs

Legacy client creation functions maintained for backward compatibility.

```typescript { .api }
/**
 * @deprecated use createTRPCClient instead, will be removed in v12
 */
const createTRPCProxyClient = createTRPCClient;

/**
 * @deprecated use inferRouterClient instead, will be removed in v12
 */
type inferRouterProxyClient<TRouter extends AnyRouter> = TRPCClient<TRouter>;

/**
 * @deprecated use TRPCClient instead, will be removed in v12
 */
type CreateTRPCClient<TRouter extends AnyRouter> = TRPCClient<TRouter>;
```

These deprecated exports are aliases that will be removed in future versions. Update your code to use the new API names for forward compatibility.