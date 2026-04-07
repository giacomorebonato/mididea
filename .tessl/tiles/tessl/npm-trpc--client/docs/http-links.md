# HTTP Transport Links

HTTP-based transport mechanisms including standard HTTP, batching, and streaming capabilities for queries and mutations. These links handle communication with tRPC servers over HTTP protocols.

## Capabilities

### httpLink

Standard HTTP transport for individual queries and mutations. Each operation results in a separate HTTP request.

```typescript { .api }
/**
 * Creates an HTTP transport link for individual requests
 * @param opts - HTTP link configuration options
 * @returns HTTP transport link for the client chain
 */
function httpLink<TRouter extends AnyRouter>(
  opts: HTTPLinkOptions<TRouter['_def']['_config']['$types']>
): TRPCLink<TRouter>;

interface HTTPLinkOptions<TRoot extends AnyClientTypes> {
  /** Server endpoint URL */
  url: string | URL;
  
  /** Static headers or function returning headers */
  headers?: HTTPHeaders | ((opts: { op: Operation }) => HTTPHeaders | Promise<HTTPHeaders>);
  
  /** Data transformation configuration */
  transformer?: TRoot['transformer'];
  
  /** Custom fetch implementation */
  fetch?: FetchEsque;
  
  /** Send all requests as POST regardless of procedure type */
  methodOverride?: 'POST';
}

type HTTPHeaders = Record<string, string | string[]> | Headers;
```

**Usage Examples:**

```typescript
import { createTRPCClient, httpLink } from "@trpc/client";

// Basic HTTP link
const client = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

// HTTP link with authentication headers
const client = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: "http://localhost:3000/trpc",
      headers: {
        authorization: "Bearer " + getToken(),
      },
    }),
  ],
});

// Dynamic headers based on operation
const client = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: "http://localhost:3000/trpc",
      headers: async ({ op }) => {
        return {
          authorization: await getAuthToken(),
          "x-request-type": op.type,
          "x-procedure-path": op.path,
        };
      },
    }),
  ],
});

// Custom fetch implementation (Node.js)
const client = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: "http://localhost:3000/trpc",
      fetch: fetch, // Node.js fetch polyfill
    }),
  ],
});
```

### httpBatchLink

Batches multiple requests into single HTTP calls to reduce network overhead. Automatically groups operations and sends them together when possible.

```typescript { .api }
/**
 * Creates an HTTP transport link that batches multiple requests
 * @param opts - HTTP batch link configuration options
 * @returns HTTP batch transport link for the client chain
 */
function httpBatchLink<TRouter extends AnyRouter>(
  opts: HTTPBatchLinkOptions<TRouter['_def']['_config']['$types']>
): TRPCLink<TRouter>;

interface HTTPBatchLinkOptions<TRoot extends AnyClientTypes> {
  /** Server endpoint URL */
  url: string | URL;
  
  /** Maximum URL length for batched requests */
  maxURLLength?: number;
  
  /** Maximum number of operations per batch */
  maxItems?: number;
  
  /** Static headers or batch-aware function returning headers */
  headers?: HTTPHeaders | ((opts: { opList: NonEmptyArray<Operation> }) => HTTPHeaders | Promise<HTTPHeaders>);
  
  /** Data transformation configuration */
  transformer?: TRoot['transformer'];
  
  /** Custom fetch implementation */
  fetch?: FetchEsque;
  
  /** Send all requests as POST regardless of procedure type */
  methodOverride?: 'POST';
}

type NonEmptyArray<T> = [T, ...T[]];
```

**Usage Examples:**

```typescript
import { createTRPCClient, httpBatchLink } from "@trpc/client";

// Basic batch link
const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

// Batch link with size limits
const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      maxURLLength: 2048, // Limit URL size
      maxItems: 10, // Limit batch size
    }),
  ],
});

// Batch-aware headers
const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      headers: ({ opList }) => ({
        authorization: "Bearer " + getToken(),
        "x-batch-size": opList.length.toString(),
        "x-batch-operations": opList.map(op => op.path).join(","),
      }),
    }),
  ],
});

// Using the batched client (automatically batches concurrent calls)
const [user, posts, comments] = await Promise.all([
  client.user.getById.query({ id: 1 }),
  client.posts.getByUserId.query({ userId: 1 }),
  client.comments.getByUserId.query({ userId: 1 }),
]);
```

### httpBatchStreamLink

Streaming batch transport using JSONL (JSON Lines) format for handling large batched responses efficiently.

```typescript { .api }
/**
 * Creates a streaming HTTP batch link that handles responses as JSONL
 * @param opts - HTTP batch stream link configuration options
 * @returns Streaming HTTP batch transport link
 */
function httpBatchStreamLink<TRouter extends AnyRouter>(
  opts: HTTPBatchStreamLinkOptions<TRouter['_def']['_config']['$types']>
): TRPCLink<TRouter>;

interface HTTPBatchStreamLinkOptions<TRoot extends AnyClientTypes> extends HTTPBatchLinkOptions<TRoot> {
  /** Additional streaming configuration options */
}
```

**Usage Examples:**

```typescript
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";

// Streaming batch link for large responses
const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchStreamLink({
      url: "http://localhost:3000/trpc",
      maxItems: 50, // Handle larger batches with streaming
    }),
  ],
});

// Efficient for operations returning large datasets
const results = await Promise.all([
  client.analytics.getUserMetrics.query({ range: "30d" }),
  client.analytics.getPostMetrics.query({ range: "30d" }),
  client.analytics.getEngagementData.query({ range: "30d" }),
]);
```

### httpSubscriptionLink

HTTP-based subscriptions using Server-Sent Events (SSE) for real-time communication without WebSocket connections.

```typescript { .api }
/**
 * Creates an HTTP subscription link using Server-Sent Events
 * @param opts - HTTP subscription link configuration options  
 * @returns HTTP subscription transport link
 */
function httpSubscriptionLink<TRouter extends AnyRouter>(
  opts: HTTPSubscriptionLinkOptions<TRouter['_def']['_config']['$types']>
): TRPCLink<TRouter>;

interface HTTPSubscriptionLinkOptions<TRoot extends AnyClientTypes> extends HTTPLinkOptions<TRoot> {
  /** Additional SSE-specific configuration */
}
```

**Usage Examples:**

```typescript
import { createTRPCClient, httpBatchLink, httpSubscriptionLink, splitLink } from "@trpc/client";

// Combined HTTP links for queries/mutations and subscriptions
const client = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: httpSubscriptionLink({
        url: "http://localhost:3000/trpc",
      }),
      false: httpBatchLink({
        url: "http://localhost:3000/trpc",
      }),
    }),
  ],
});

// Subscribe using HTTP SSE
const unsubscribe = client.posts.onUpdate.subscribe(undefined, {
  onData: (post) => console.log("Post updated:", post),
  onError: (err) => console.error("SSE error:", err),
});
```

### Content Type Support

HTTP links automatically detect and handle different content types for mutation inputs.

```typescript { .api }
/** Detect if value is FormData for file uploads */
function isFormData(value: unknown): boolean;

/** Detect if value is binary octet stream data */
function isOctetType(value: unknown): boolean;

/** Detect if value requires non-JSON serialization */
function isNonJsonSerializable(value: unknown): boolean;
```

**Content Type Examples:**

```typescript
// JSON payload (default)
await client.posts.create.mutate({
  title: "Hello World",
  content: "This is a post",
});

// FormData for file uploads
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("title", "Image Upload");

await client.media.upload.mutate(formData);

// Binary octet stream
const binaryData = new Uint8Array([1, 2, 3, 4]);
await client.files.uploadBinary.mutate(binaryData);

// Automatically detects content type and sets appropriate headers
```

### Error Handling

HTTP links provide detailed error information including response metadata.

```typescript { .api }
interface HTTPResult {
  /** HTTP response metadata */
  meta: {
    response: Response;
    responseJSON?: any;
  };
  /** Parsed response data */
  json: any;
}
```

**Error Handling Examples:**

```typescript
try {
  const result = await client.user.getById.query({ id: 999 });
} catch (error) {
  if (error instanceof TRPCClientError) {
    // Access HTTP response details
    const response = error.meta?.response;
    const status = response?.status;
    
    if (status === 404) {
      console.log("User not found");
    } else if (status === 401) {
      redirectToLogin();
    }
    
    // Structured error data from server
    console.log("Error code:", error.data?.code);
    console.log("Error details:", error.data?.details);
  }
}
```

### Configuration Options

Advanced configuration options for HTTP transport behavior.

```typescript { .api }
/** Custom fetch function interface */
type FetchEsque = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

/** Base HTTP link configuration shared across HTTP transports */
interface HTTPLinkBaseOptions<TRoot extends AnyClientTypes> {
  /** Server endpoint URL */
  url: string | URL;
  
  /** Custom fetch implementation */
  fetch?: FetchEsque;
  
  /** Force all requests to use POST method */
  methodOverride?: 'POST';
  
  /** Data transformation configuration */
  transformer?: TransformerOptions<TRoot>;
}

/** Data transformation options */
interface TransformerOptions<TRoot> {
  transformer?: TRoot['transformer'];
}
```

**Advanced Configuration Examples:**

```typescript
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import fetch from "node-fetch";

// Node.js environment with custom fetch
const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      fetch: fetch as any,
      methodOverride: "POST", // Force all requests to POST
    }),
  ],
});

// Custom transformer (superjson example)
import superjson from "superjson";

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      transformer: superjson,
    }),
  ],
});
```