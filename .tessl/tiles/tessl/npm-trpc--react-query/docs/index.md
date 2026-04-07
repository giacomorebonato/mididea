# tRPC React Query

tRPC React Query is a TypeScript-first React library that provides end-to-end typesafe APIs by integrating tRPC with TanStack React Query. It offers React hooks for queries, mutations, and subscriptions with automatic type inference from tRPC router definitions, built-in caching and background updates, and comprehensive support for server-side rendering.

## Package Information

- **Package Name**: @trpc/react-query
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install @trpc/react-query @tanstack/react-query`

## Core Imports

Main client-side imports:

```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./server";

export const trpc = createTRPCReact<AppRouter>();
```

Server-side helpers:

```typescript
import { createServerSideHelpers } from "@trpc/react-query/server";
```

React Server Components (RSC) support:

```typescript
import { createHydrationHelpers } from "@trpc/react-query/rsc";
```

Query utilities:

```typescript
import { getQueryKey, getMutationKey, createTRPCQueryUtils } from "@trpc/react-query";
```

For CommonJS:

```javascript
const { createTRPCReact } = require("@trpc/react-query");
const { createServerSideHelpers } = require("@trpc/react-query/server");
```

## Basic Usage

```typescript
import { createTRPCReact } from "@trpc/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppRouter } from "./server";

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Provider setup
export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      url: "http://localhost:5000/trpc",
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <MyComponent />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// Component usage
function MyComponent() {
  const { data, error, status } = trpc.greeting.useQuery({ name: "tRPC" });
  const mutation = trpc.updateUser.useMutation();

  if (error) return <p>{error.message}</p>;
  if (status !== "success") return <p>Loading...</p>;

  return <div>{data && <p>{data.greeting}</p>}</div>;
}
```

## Architecture

tRPC React Query is built around several key components:

- **Hook Factory**: `createTRPCReact` generates typed React hooks based on your tRPC router schema
- **Provider System**: React context provider that manages client configuration and query client state
- **Procedure Hooks**: Dynamically generated hooks (useQuery, useMutation, useSubscription) that mirror your tRPC router structure
- **Utility Functions**: Query manipulation utilities available via `useUtils()` for cache management and imperative operations
- **Type System**: Complete TypeScript inference from server router to client hooks with compile-time validation
- **SSR/RSC Support**: Server-side helpers for data prefetching and hydration in Next.js and other frameworks

## Capabilities

### Hook Creation

Core factory function that creates typed React hooks from your tRPC router definition.

```typescript { .api }
function createTRPCReact<TRouter extends AnyRouter, TSSRContext = unknown>(
  opts?: CreateTRPCReactOptions<TRouter>
): CreateTRPCReact<TRouter, TSSRContext>;

interface CreateTRPCReact<TRouter extends AnyRouter, TSSRContext> {
  Provider: TRPCProvider<TRouter, TSSRContext>;
  createClient: typeof createTRPCClient<TRouter>;
  useUtils(): CreateReactUtils<TRouter, TSSRContext>;
  useQueries: TRPCUseQueries<TRouter>;
  useSuspenseQueries: TRPCUseSuspenseQueries<TRouter>;
  // Dynamic router-based hooks are automatically generated
}
```

[Hook Creation](./hook-creation.md)

### Query Hooks

React hooks for data fetching with caching, background updates, and type safety.

```typescript { .api }
// Generated for each query procedure in your router
procedure.useQuery(input: TInput, opts?: UseTRPCQueryOptions): UseTRPCQueryResult<TData, TError>;
procedure.useSuspenseQuery(input: TInput, opts?: UseTRPCSuspenseQueryOptions): [TData, UseSuspenseQueryResult];
procedure.useInfiniteQuery(input: TInput, opts?: UseTRPCInfiniteQueryOptions): UseTRPCInfiniteQueryResult<TData, TError>;
procedure.useSuspenseInfiniteQuery(input: TInput, opts?: UseTRPCSuspenseInfiniteQueryOptions): [TData, UseSuspenseInfiniteQueryResult];
```

[Query Hooks](./query-hooks.md)

### Mutation Hooks

React hooks for data modifications with optimistic updates and error handling.

```typescript { .api }
// Generated for each mutation procedure in your router
procedure.useMutation<TContext = unknown>(
  opts?: UseTRPCMutationOptions<TInput, TError, TOutput, TContext>
): UseTRPCMutationResult<TOutput, TError, TInput, TContext>;
```

[Mutation Hooks](./mutation-hooks.md)

### Subscription Hooks

React hooks for real-time data subscriptions with automatic connection management.

```typescript { .api }
// Generated for each subscription procedure in your router
procedure.useSubscription(
  input: TInput,
  opts?: UseTRPCSubscriptionOptions<TOutput, TError>
): TRPCSubscriptionResult<TOutput, TError>;
```

[Subscription Hooks](./subscription-hooks.md)

### Query Utilities

Comprehensive utility functions for imperative query operations and cache management.

```typescript { .api }
interface CreateReactUtils<TRouter, TSSRContext> {
  // Query manipulation
  invalidate(input?: TInput, opts?: InvalidateOptions): Promise<void>;
  refetch(input?: TInput, opts?: RefetchOptions): Promise<void>;
  cancel(input?: TInput): Promise<void>;
  
  // Data manipulation
  setData(input: TInput, updater: Updater<TData>, opts?: SetDataOptions): void;
  getData(input?: TInput): TData | undefined;
  setInfiniteData(input: TInput, updater: Updater<InfiniteData<TData>>, opts?: SetDataOptions): void;
  getInfiniteData(input?: TInput): InfiniteData<TData> | undefined;
  
  // Imperative fetching
  fetch(input: TInput, opts?: TRPCFetchQueryOptions): Promise<TData>;
  fetchInfinite(input: TInput, opts?: TRPCFetchInfiniteQueryOptions): Promise<InfiniteData<TData>>;
  prefetch(input: TInput, opts?: TRPCFetchQueryOptions): Promise<void>;
  prefetchInfinite(input: TInput, opts?: TRPCFetchInfiniteQueryOptions): Promise<void>;
  ensureData(input: TInput, opts?: TRPCFetchQueryOptions): Promise<TData>;
}
```

[Query Utilities](./query-utilities.md)

### Server-Side Helpers

Functions for server-side rendering and static generation.

```typescript { .api }
function createServerSideHelpers<TRouter extends AnyRouter>(
  opts: CreateServerSideHelpersOptions<TRouter>
): ServerSideHelpers<TRouter>;
```

[Server-Side Helpers](./server-side-helpers.md)

### React Server Components (RSC)

Support for React Server Components with hydration helpers for Next.js App Router and similar frameworks.

```typescript { .api }
function createHydrationHelpers<TRouter extends AnyRouter>(
  caller: Caller<TRouter>,
  getQueryClient: () => QueryClient
): { trpc: DecoratedCaller<TRouter>; HydrateClient: React.ComponentType };
```

[React Server Components](./react-server-components.md)

### Query Keys and Utilities

Utilities for working with React Query keys and mutations in the tRPC context.

```typescript { .api }
function getQueryKey<TProcedureOrRouter extends ProcedureOrRouter>(
  procedureOrRouter: TProcedureOrRouter,
  ...params: GetParams<TProcedureOrRouter>
): TRPCQueryKey;

function getMutationKey<TProcedure extends DecoratedMutation<any>>(
  procedure: TProcedure
): TRPCMutationKey;

function createTRPCQueryUtils<TRouter extends AnyRouter>(
  opts: CreateQueryUtilsOptions<TRouter>
): TRPCQueryUtils<TRouter>;
```

[Query Keys and Utilities](./query-keys.md)

## Types

```typescript { .api }
type CreateTRPCReactOptions<TRouter extends AnyRouter> = {
  context?: React.Context<any>;
  overrides?: {
    useMutation?: {
      onSuccess?: (options: { originalFn: () => void }) => void;
    };
  };
};

type TRPCQueryKey = [
  readonly string[],
  { input?: unknown; type?: Exclude<QueryType, 'any'> }?
];

type TRPCMutationKey = [readonly string[]];

type QueryType = 'any' | 'infinite' | 'query';

interface TRPCReactRequestOptions extends Omit<TRPCRequestOptions, 'signal'> {
  ssr?: boolean;
  abortOnUnmount?: boolean;
}

interface TRPCProvider<TRouter extends AnyRouter, TSSRContext> {
  (props: TRPCProviderProps<TRouter, TSSRContext>): JSX.Element;
}

interface TRPCProviderProps<TRouter extends AnyRouter, TSSRContext> {
  client: TRPCClient<TRouter> | TRPCUntypedClient<TRouter>;
  queryClient: QueryClient;
  ssrContext?: TSSRContext;
  ssrState?: SSRState;
  abortOnUnmount?: boolean;
  children: ReactNode;
}
```