# @trpc/client

@trpc/client is a type-safe client library for communicating with tRPC servers, supporting queries, mutations, and subscriptions through various transport mechanisms. It provides full TypeScript inference and compile-time type safety when connected to your tRPC router definitions.

## Package Information

- **Package Name**: @trpc/client
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install @trpc/client`

## Core Imports

```typescript
import { createTRPCClient, httpBatchLink, httpLink, TRPCClientError } from "@trpc/client";
import { wsLink, createWSClient } from "@trpc/client";
import { loggerLink, splitLink } from "@trpc/client";
```

For CommonJS:

```javascript
const { createTRPCClient, httpBatchLink, httpLink, TRPCClientError } = require("@trpc/client");
const { wsLink, createWSClient } = require("@trpc/client");
const { loggerLink, splitLink } = require("@trpc/client");
```

## Basic Usage

```typescript
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./server"; // Import your router type

// Create client with HTTP transport
const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

// Use the client
const user = await client.user.getById.query({ id: 1 });
const newUser = await client.user.create.mutate({
  name: "Alice",
  email: "alice@example.com",
});

// Subscribe to real-time updates (with WebSocket)
client.posts.onUpdate.subscribe(undefined, {
  onData: (post) => console.log("Post updated:", post),
  onError: (err) => console.error("Subscription error:", err),
});
```

## Architecture

@trpc/client is built around several key components:

- **Type-Safe Client**: Main `TRPCClient` with full TypeScript inference from server router definitions
- **Untyped Client**: Lower-level `TRPCUntypedClient` for dynamic operations without compile-time type safety
- **Link Chain**: Middleware system where transport and utility links can be composed together
- **Transport Links**: HTTP, WebSocket, and local transport mechanisms for server communication
- **Error System**: Structured error handling with `TRPCClientError` providing detailed error information
- **Proxy Interface**: Router procedures are automatically transformed into client methods through JavaScript proxies

## Capabilities

### Client Creation

Core client factory functions for creating type-safe and untyped tRPC clients with configurable transport links.

```typescript { .api }
function createTRPCClient<TRouter extends AnyRouter>(
  opts: CreateTRPCClientOptions<TRouter>
): TRPCClient<TRouter>;

function createTRPCUntypedClient<TRouter extends AnyRouter>(
  opts: CreateTRPCClientOptions<TRouter>
): TRPCUntypedClient<TRouter>;

interface CreateTRPCClientOptions<TRouter> {
  links: TRPCLink<TRouter>[];
}
```

[Client Creation](./client-creation.md)

### HTTP Transport Links

HTTP-based transport mechanisms including standard HTTP, batching, streaming, and subscription capabilities for queries and mutations.

```typescript { .api }
function httpLink<TRouter extends AnyRouter>(
  opts: HTTPLinkOptions<TRouter['_def']['_config']['$types']>
): TRPCLink<TRouter>;

function httpBatchLink<TRouter extends AnyRouter>(
  opts: HTTPBatchLinkOptions<TRouter['_def']['_config']['$types']>
): TRPCLink<TRouter>;

function httpBatchStreamLink<TRouter extends AnyRouter>(
  opts: HTTPBatchLinkOptions<TRouter['_def']['_config']['$types']>
): TRPCLink<TRouter>;

function httpSubscriptionLink<TRouter extends AnyRouter>(
  opts: HTTPSubscriptionLinkOptions<TRouter['_def']['_config']['$types']>
): TRPCLink<TRouter>;

interface HTTPLinkOptions<TTypes> {
  url: string;
  headers?: HTTPHeaders | (() => HTTPHeaders | Promise<HTTPHeaders>);
  transformer?: TTypes['transformer'];
  fetch?: TRPCFetch;
}
```

[HTTP Transport Links](./http-links.md)

### WebSocket Links

Real-time communication through WebSocket connections for subscriptions and bidirectional communication.

```typescript { .api }
function wsLink<TRouter extends AnyRouter>(
  opts: WSLinkOptions<TRouter>
): TRPCLink<TRouter>;

function createWSClient(opts: WebSocketClientOptions): TRPCWebSocketClient;

interface WSLinkOptions<TRouter> {
  client: TRPCWebSocketClient;
  transformer?: TRouter['_def']['_config']['$types']['transformer'];
}

interface WebSocketClientOptions {
  url: string;
  WebSocket?: typeof WebSocket;
  retryDelayMs?: (attemptIndex: number) => number;
  onOpen?: (ws: WebSocket) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  lazy?: boolean;
  keepAlive?: number;
}
```

[WebSocket Links](./websocket-links.md)

### Error Handling

Comprehensive error handling system with structured error information and type guards for error identification.

```typescript { .api }
class TRPCClientError<TRouterOrProcedure extends InferrableClientTypes> extends Error {
  readonly message: string;
  readonly shape: Maybe<inferErrorShape<TRouterOrProcedure>>;
  readonly data: Maybe<inferErrorShape<TRouterOrProcedure>['data']>;
  readonly cause: Error;
  meta: Record<string, unknown>;

  static from<TRouterOrProcedure extends InferrableClientTypes>(
    cause: Error | TRPCErrorResponse | object,
    opts?: { meta?: Record<string, unknown> }
  ): TRPCClientError<TRouterOrProcedure>;
}

function isTRPCClientError<TInferrable extends InferrableClientTypes>(
  cause: unknown
): cause is TRPCClientError<TInferrable>;
```

[Error Handling](./error-handling.md)

### Utility Links

Middleware links for logging, conditional routing, retry logic, and other cross-cutting concerns in the link chain.

```typescript { .api }
function loggerLink<TRouter extends AnyRouter>(
  opts?: LoggerLinkOptions<TRouter>
): TRPCLink<TRouter>;

function splitLink<TRouter extends AnyRouter>(
  opts: SplitLinkOptions<TRouter>
): TRPCLink<TRouter>;

function retryLink<TInferrable extends InferrableClientTypes>(
  opts: RetryLinkOptions<TInferrable>
): TRPCLink<TInferrable>;
```

[Utility Links](./utility-links.md)

### Advanced Features

Advanced functionality including local transport for in-process communication, fetch utilities, and unstable internal APIs.

```typescript { .api }
function unstable_localLink<TRouter extends AnyRouter>(
  opts: LocalLinkOptions<TRouter>
): TRPCLink<TRouter>;

function getFetch(customFetchImpl?: FetchEsque | NativeFetchEsque): FetchEsque;

interface LocalLinkOptions<TRouter> {
  router: TRouter;
  createContext?: () => any;
  onError?: (err: Error) => void;
  transformer?: TRouter['_def']['_config']['$types']['transformer'];
}
```

[Advanced Features](./advanced-features.md)