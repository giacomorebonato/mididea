# WebSocket Links

Real-time communication through WebSocket connections for subscriptions and bidirectional communication. WebSocket links provide persistent connections for real-time data streaming and notifications.

## Capabilities

### wsLink

Creates a WebSocket transport link for real-time subscriptions and bidirectional communication with tRPC servers.

```typescript { .api }
/**
 * Creates a WebSocket transport link for real-time communication
 * @param opts - WebSocket link configuration options
 * @returns WebSocket transport link for the client chain
 */
function wsLink<TRouter extends AnyRouter>(
  opts: WebSocketLinkOptions<TRouter>
): TRPCLink<TRouter>;

interface WebSocketLinkOptions<TRouter extends AnyRouter> {
  /** WebSocket client instance */
  client: TRPCWebSocketClient;
  /** Data transformation configuration */
  transformer?: inferClientTypes<TRouter>['transformer'];
}
```

**Usage Examples:**

```typescript
import { createTRPCClient, wsLink, createWSClient } from "@trpc/client";

// Basic WebSocket setup
const wsClient = createWSClient({
  url: "ws://localhost:3001",
});

const client = createTRPCClient<AppRouter>({
  links: [
    wsLink({
      client: wsClient,
    }),
  ],
});

// Subscribe to real-time updates
const unsubscribe = client.posts.onUpdate.subscribe(undefined, {
  onData: (post) => {
    console.log("Post updated:", post);
  },
  onError: (err) => {
    console.error("Subscription error:", err);
  },
});

// Clean up when done
unsubscribe.unsubscribe();
```

### createWSClient

Factory function for creating WebSocket clients with connection management, reconnection logic, and configuration options.

```typescript { .api }
/**
 * Creates a WebSocket client with connection management
 * @param opts - WebSocket client configuration options
 * @returns Configured WebSocket client instance
 */
function createWSClient(opts: WebSocketClientOptions): TRPCWebSocketClient;

interface WebSocketClientOptions {
  /** WebSocket server URL */
  url: string;
  
  /** WebSocket implementation (for Node.js environments) */
  WebSocket?: typeof WebSocket;
  
  /** Retry delay calculation function */
  retryDelayMs?: (attemptIndex: number) => number;
  
  /** Connection opened event handler */
  onOpen?: () => void;
  
  /** Connection error event handler */
  onError?: (event?: Event) => void;
  
  /** Connection closed event handler */
  onClose?: (cause?: { code?: number }) => void;
  
  /** Lazy connection configuration */
  lazy?: LazyOptions;
  
  /** Keep-alive ping/pong configuration */
  keepAlive?: KeepAliveOptions;
}

type TRPCWebSocketClient = ReturnType<typeof createWSClient>;
```

**Usage Examples:**

```typescript
import { createWSClient } from "@trpc/client";

// Basic WebSocket client
const wsClient = createWSClient({
  url: "ws://localhost:3001",
});

// WebSocket client with event handlers
const wsClient = createWSClient({
  url: "ws://localhost:3001",
  onOpen: () => {
    console.log("Connected to WebSocket");
  },
  onError: (event) => {
    console.error("WebSocket error:", event);
  },
  onClose: (cause) => {
    console.log("WebSocket closed:", cause?.code);
  },
});

// Node.js environment with WebSocket polyfill
import WebSocket from "ws";

const wsClient = createWSClient({
  url: "ws://localhost:3001",
  WebSocket: WebSocket as any,
});

// Custom retry strategy
const wsClient = createWSClient({
  url: "ws://localhost:3001",
  retryDelayMs: (attemptIndex) => {
    // Custom backoff: 1s, 3s, 5s, 10s, then 10s
    const delays = [1000, 3000, 5000, 10000];
    return delays[attemptIndex] || 10000;
  },
});
```

### Retry and Backoff

Configurable retry logic with exponential backoff for handling connection failures.

```typescript { .api }
/**
 * Default exponential backoff calculation
 * @param attemptIndex - Zero-based retry attempt index
 * @returns Delay in milliseconds (0ms → 1s → 2s → 4s ... → 30s max)
 */
function exponentialBackoff(attemptIndex: number): number;
```

**Retry Examples:**

```typescript
import { createWSClient, exponentialBackoff } from "@trpc/client";

// Using default exponential backoff
const wsClient = createWSClient({
  url: "ws://localhost:3001",
  retryDelayMs: exponentialBackoff, // Default behavior
});

// Custom retry logic
const wsClient = createWSClient({
  url: "ws://localhost:3001",
  retryDelayMs: (attemptIndex) => {
    if (attemptIndex === 0) return 0; // Immediate first retry
    if (attemptIndex < 3) return 1000; // 1s for first 3 attempts
    if (attemptIndex < 6) return 5000; // 5s for next 3 attempts
    return 15000; // 15s for subsequent attempts
  },
});

// Aggressive retry for critical connections
const wsClient = createWSClient({
  url: "ws://localhost:3001",
  retryDelayMs: (attemptIndex) => Math.min(500 * attemptIndex, 5000),
});
```

### Lazy Connections

Lazy connection management that automatically opens and closes WebSocket connections based on activity.

```typescript { .api }
interface LazyOptions {
  /** Enable lazy connection mode */
  enabled: boolean;
  /** Close connection after this many milliseconds of inactivity */
  closeMs: number;
}

/** Default lazy connection configuration */
const lazyDefaults: LazyOptions = {
  enabled: false,
  closeMs: 0,
};
```

**Lazy Connection Examples:**

```typescript
// Enable lazy connections with 30-second timeout
const wsClient = createWSClient({
  url: "ws://localhost:3001",
  lazy: {
    enabled: true,
    closeMs: 30000, // Close after 30s of inactivity
  },
});

// Lazy connections for mobile apps (battery optimization)
const wsClient = createWSClient({
  url: "ws://localhost:3001",
  lazy: {
    enabled: true,
    closeMs: 10000, // Aggressive 10s timeout for mobile
  },
});
```

### Keep-Alive Configuration

Ping/pong keep-alive mechanism to maintain WebSocket connections and detect connection issues.

```typescript { .api }
interface KeepAliveOptions {
  /** Enable keep-alive ping/pong */
  enabled: boolean;
  /** Send ping every this many milliseconds */
  intervalMs?: number;
  /** Timeout for pong response in milliseconds */
  pongTimeoutMs?: number;
}

/** Default keep-alive configuration */
const keepAliveDefaults: KeepAliveOptions = {
  enabled: false,
  pongTimeoutMs: 1000,
  intervalMs: 5000,
};
```

**Keep-Alive Examples:**

```typescript
// Enable keep-alive with default settings
const wsClient = createWSClient({
  url: "ws://localhost:3001",
  keepAlive: {
    enabled: true,
  },
});

// Custom keep-alive timing
const wsClient = createWSClient({
  url: "ws://localhost:3001",
  keepAlive: {
    enabled: true,
    intervalMs: 10000, // Ping every 10 seconds
    pongTimeoutMs: 2000, // Wait 2 seconds for pong
  },
});

// Aggressive keep-alive for unstable networks
const wsClient = createWSClient({
  url: "ws://localhost:3001",
  keepAlive: {
    enabled: true,
    intervalMs: 3000, // Frequent pings
    pongTimeoutMs: 1000, // Quick timeout detection
  },
});
```

### Connection State Management

WebSocket links provide connection state information for handling reconnections and connection issues.

```typescript { .api }
/** Connection state types */
type TRPCConnectionState<TError = unknown> = 
  | { type: 'connecting' }
  | { type: 'open' }
  | { type: 'closed' }
  | { type: 'error'; error: TError };

/** WebSocket client with connection state observable */
interface TRPCWebSocketClient {
  connectionState: Observable<TRPCConnectionState>;
  request(opts: { op: Operation; transformer: any }): Observable<any>;
  close(): void;
}
```

**Connection State Examples:**

```typescript
import { createTRPCClient, wsLink, createWSClient } from "@trpc/client";

const wsClient = createWSClient({
  url: "ws://localhost:3001",
});

// Monitor connection state
wsClient.connectionState.subscribe({
  next: (state) => {
    switch (state.type) {
      case 'connecting':
        console.log("Connecting to WebSocket...");
        showConnectingIndicator(true);
        break;
      case 'open':
        console.log("WebSocket connected");
        showConnectingIndicator(false);
        break;
      case 'closed':
        console.log("WebSocket disconnected");
        showOfflineIndicator(true);
        break;
      case 'error':
        console.error("WebSocket error:", state.error);
        handleConnectionError(state.error);
        break;
    }
  },
});

const client = createTRPCClient<AppRouter>({
  links: [
    wsLink({
      client: wsClient,
    }),
  ],
});
```

### Combined HTTP and WebSocket Setup

Common pattern combining HTTP transport for queries/mutations with WebSocket transport for subscriptions.

```typescript { .api }
import { 
  createTRPCClient, 
  httpBatchLink, 
  wsLink, 
  splitLink,
  createWSClient 
} from "@trpc/client";
```

**Combined Setup Examples:**

```typescript
// Split transport based on operation type
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

// Use queries/mutations over HTTP, subscriptions over WebSocket
const user = await client.user.getById.query({ id: 1 }); // HTTP
const newUser = await client.user.create.mutate({ name: "Alice" }); // HTTP

const unsubscribe = client.posts.onUpdate.subscribe(undefined, { // WebSocket
  onData: (post) => console.log("Post updated:", post),
});
```

### Error Handling

WebSocket connections provide specific error handling for connection and communication issues.

```typescript { .api }
// WebSocket-specific error handling
const wsClient = createWSClient({
  url: "ws://localhost:3001",
  onError: (event) => {
    console.error("WebSocket connection error:", event);
    
    // Handle specific error scenarios
    if (event?.type === 'error') {
      // Network error, server down, etc.
      showRetryPrompt();
    }
  },
  onClose: (cause) => {
    if (cause?.code === 1006) {
      // Abnormal closure - network issue
      console.log("Unexpected disconnection, will retry");
    } else if (cause?.code === 1000) {
      // Normal closure
      console.log("Connection closed normally");
    }
  },
});
```

**Subscription Error Handling:**

```typescript
const unsubscribe = client.posts.onUpdate.subscribe(undefined, {
  onData: (post) => {
    updateUI(post);
  },
  onError: (err) => {
    if (err instanceof TRPCClientError) {
      // Server-side subscription error
      console.error("Subscription error:", err.message);
      handleSubscriptionError(err);
    } else {
      // Connection-level error
      console.error("Connection error:", err);
      handleConnectionError(err);
    }
  },
  onConnectionStateChange: (state) => {
    if (state.type === 'error') {
      console.error("Connection state error:", state.error);
      // Attempt manual reconnection or show error UI
    }
  },
});
```