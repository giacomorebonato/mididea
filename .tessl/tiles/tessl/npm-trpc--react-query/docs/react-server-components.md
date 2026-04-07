# React Server Components (RSC)

React Server Components support for tRPC with hydration helpers designed for Next.js App Router and similar frameworks that support RSC.

## Capabilities

### createHydrationHelpers

Creates utilities for prefetching data in React Server Components and hydrating the client with that data.

```typescript { .api }
/**
 * Creates hydration helpers for React Server Components
 * @param caller - Server-side router caller instance
 * @param getQueryClient - Function that returns the QueryClient instance
 * @returns Object with trpc proxy and HydrateClient component
 * @note Requires @tanstack/react-query@^5.49.0
 * @note Make sure to set serializeData/deserializeData in QueryClient for data transformers
 */
function createHydrationHelpers<TRouter extends AnyRouter>(
  caller: Caller<TRouter>,
  getQueryClient: () => QueryClient
): HydrationHelpersResult<TRouter>;

interface HydrationHelpersResult<TRouter extends AnyRouter> {
  /** Wrapped router caller with prefetch helpers */
  trpc: DecoratedCaller<TRouter>;
  /** Component for hydrating client-side React Query cache */
  HydrateClient: React.ComponentType<{ children: React.ReactNode }>;
}

type Caller<TRouter extends AnyRouter> = ReturnType<
  RouterCaller<inferRouterRootTypes<TRouter>, TRouter['_def']['record']>
>;

type DecoratedCaller<TRouter extends AnyRouter> = {
  // All procedures can be called directly: trpc.user.get("123")
  // Plus prefetch methods: trpc.user.get.prefetch("123")
  [K in keyof TRouter]: TRouter[K] extends AnyProcedure
    ? DecorateProcedure<inferRouterRootTypes<TRouter>, TRouter[K]>
    : DecoratedCaller<TRouter[K]>;
};

interface DecorateProcedure<TRoot extends AnyRootTypes, TProcedure extends AnyProcedure> {
  (input: inferProcedureInput<TProcedure>): Promise<inferProcedureOutput<TProcedure>>;
  prefetch: (
    input: inferProcedureInput<TProcedure>,
    opts?: TRPCFetchQueryOptions<
      inferTransformedProcedureOutput<TRoot, TProcedure>,
      TRPCClientError<TRoot>
    >
  ) => Promise<void>;
  prefetchInfinite: (
    input: inferProcedureInput<TProcedure>,
    opts?: TRPCFetchInfiniteQueryOptions<
      inferTransformedProcedureOutput<TRoot, TProcedure>,
      TRPCClientError<TRoot>
    >
  ) => Promise<void>;
}
```

**Usage Examples:**

```typescript
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { createCaller } from "./server/routers/app";
import { getQueryClient } from "./lib/query-client";

// Create the hydration helpers
const { trpc, HydrateClient } = createHydrationHelpers(
  createCaller({ /* server context */ }),
  getQueryClient
);

// In an RSC component
export default async function PostPage({ params }: { params: { id: string } }) {
  // Direct call for immediate data
  const post = await trpc.post.get(params.id);
  
  // Prefetch related data for client hydration
  await trpc.post.comments.prefetch({ postId: params.id });
  
  return (
    <HydrateClient>
      <div>
        <h1>{post.title}</h1>
        <PostComments postId={params.id} />
      </div>
    </HydrateClient>
  );
}
```

### QueryClient Configuration

For proper data transformer support, configure your QueryClient:

```typescript
import { QueryClient } from "@tanstack/react-query";
import { transformer } from "./server/transformer"; // Your data transformer

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      dehydrate: {
        serializeData: transformer.serialize,
      },
      hydrate: {
        deserializeData: transformer.deserialize,
      },
    },
  });
```

### HydrateClient Component

Automatically handles hydration of prefetched data from server to client.

```typescript { .api }
interface HydrateClientProps {
  children: React.ReactNode;
}

/**
 * Component that wraps children with HydrationBoundary to hydrate
 * server-prefetched data into the client QueryClient
 */
React.ComponentType<HydrateClientProps>
```

**Features:**

- **Server-Side Prefetching**: Use `.prefetch()` and `.prefetchInfinite()` methods on procedures
- **Automatic Hydration**: `HydrateClient` component handles transferring server data to client
- **Direct Calls**: Call procedures directly in RSC for immediate data access
- **Type Safety**: Full TypeScript inference from router to RSC helpers
- **Data Transformers**: Supports custom data transformers via QueryClient configuration

## Types

```typescript { .api }
interface TRPCFetchQueryOptions<TQueryFnData, TError> {
  staleTime?: number;
  retry?: boolean | number | ((failureCount: number, error: TError) => boolean);
  retryDelay?: number | ((retryAttempt: number, error: TError) => number);
  refetchOnMount?: boolean | 'always';
  refetchOnReconnect?: boolean | 'always';
  refetchOnWindowFocus?: boolean | 'always';
}

interface TRPCFetchInfiniteQueryOptions<TQueryFnData, TError> 
  extends TRPCFetchQueryOptions<TQueryFnData, TError> {
  initialPageParam?: unknown;
  getNextPageParam?: (lastPage: TQueryFnData, allPages: TQueryFnData[], lastPageParam: unknown, allPageParams: unknown[]) => unknown;
  getPreviousPageParam?: (firstPage: TQueryFnData, allPages: TQueryFnData[], firstPageParam: unknown, allPageParams: unknown[]) => unknown;
  maxPages?: number;
}
```