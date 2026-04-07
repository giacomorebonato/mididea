# Hook Creation

The core functionality of @trpc/react-query revolves around the `createTRPCReact` factory function that generates typed React hooks from your tRPC router definition.

## Capabilities

### createTRPCReact

Creates a complete set of typed React hooks and utilities for your tRPC router.

```typescript { .api }
/**
 * Creates typed React hooks for tRPC procedures based on your router schema
 * @param opts - Optional configuration for the hook factory
 * @returns Object containing Provider, hooks, and utilities
 */
function createTRPCReact<TRouter extends AnyRouter, TSSRContext = unknown>(
  opts?: CreateTRPCReactOptions<TRouter>
): CreateTRPCReact<TRouter, TSSRContext>;

interface CreateTRPCReactOptions<TRouter extends AnyRouter> {
  /** Custom React context for tRPC provider */
  context?: React.Context<any>;
  /** Abort all queries when unmounting @default false */
  abortOnUnmount?: boolean;
  /** Hook behavior overrides */
  overrides?: {
    useMutation?: Partial<UseMutationOverride>;
  };
}

interface UseMutationOverride {
  onSuccess: (opts: {
    /** Calls the original function that was defined in the query's onSuccess option */
    originalFn: () => MaybePromise<void>;
    queryClient: QueryClient;
    /** Meta data passed in from the useMutation() hook */
    meta: Record<string, unknown>;
  }) => MaybePromise<void>;
}

interface CreateTRPCReact<TRouter extends AnyRouter, TSSRContext> {
  /** React context provider component */
  Provider: TRPCProvider<TRouter, TSSRContext>;
  /** Factory function for creating tRPC clients */
  createClient: typeof createTRPCClient<TRouter>;
  /** Hook for accessing query utilities */
  useUtils(): CreateReactUtils<TRouter, TSSRContext>;
  /** @deprecated Use useUtils instead */
  useContext(): CreateReactUtils<TRouter, TSSRContext>;
  /** Hook for batch queries */
  useQueries: TRPCUseQueries<TRouter>;
  /** Hook for batch suspense queries */
  useSuspenseQueries: TRPCUseSuspenseQueries<TRouter>;
  
  // Dynamic router-based hooks are automatically generated based on your router structure
  // For example, if your router has:
  // - router.user.get (query) -> trpc.user.get.useQuery()
  // - router.user.create (mutation) -> trpc.user.create.useMutation()
  // - router.notifications.subscribe (subscription) -> trpc.notifications.subscribe.useSubscription()
}
```

**Usage Examples:**

```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./server";

// Basic usage
export const trpc = createTRPCReact<AppRouter>();

// With custom context
const MyTRPCContext = React.createContext(null);
export const trpc = createTRPCReact<AppRouter>({
  context: MyTRPCContext,
});

// With mutation overrides
export const trpc = createTRPCReact<AppRouter>({
  overrides: {
    useMutation: {
      onSuccess: ({ originalFn }) => {
        // Custom success behavior
        console.log("Mutation succeeded");
        originalFn();
      },
    },
  },
});
```

### TRPCProvider

React context provider that manages tRPC client configuration and React Query state.

```typescript { .api }
/**
 * Provider component that supplies tRPC client and query client to child components
 */
interface TRPCProvider<TRouter extends AnyRouter, TSSRContext> {
  (props: TRPCProviderProps<TRouter, TSSRContext>): JSX.Element;
}

interface TRPCProviderProps<TRouter extends AnyRouter, TSSRContext> {
  /** tRPC client instance */
  client: TRPCClient<TRouter> | TRPCUntypedClient<TRouter>;
  /** React Query client instance */
  queryClient: QueryClient;
  /** Server-side rendering context */
  ssrContext?: TSSRContext;
  /** SSR state for hydration */
  ssrState?: SSRState;
  /** Whether to abort requests on component unmount */
  abortOnUnmount?: boolean;
  /** Child components */
  children: ReactNode;
}

type SSRState = false | 'prepass' | 'mounting' | 'mounted';
```

**Usage Examples:**

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "./utils/trpc";

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      url: "http://localhost:5000/trpc",
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <MyApp />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// With SSR context
function AppWithSSR({ ssrContext }: { ssrContext: MySSRContext }) {
  return (
    <trpc.Provider 
      client={trpcClient} 
      queryClient={queryClient}
      ssrContext={ssrContext}
      ssrState="mounting"
    >
      <MyApp />
    </trpc.Provider>
  );
}
```

### Dynamic Hook Generation

The `createTRPCReact` function automatically generates hooks based on your router structure. Each procedure gets decorated with appropriate hook methods:

```typescript { .api }
// For query procedures
interface QueryProcedureHooks<TInput, TOutput, TError> {
  useQuery(input: TInput, opts?: UseTRPCQueryOptions): UseTRPCQueryResult<TOutput, TError>;
  useSuspenseQuery(input: TInput, opts?: UseTRPCSuspenseQueryOptions): [TOutput, UseSuspenseQueryResult];
  usePrefetchQuery(input: TInput, opts?: TRPCFetchQueryOptions): void;
  
  // If procedure supports cursor/pagination
  useInfiniteQuery?(input: TInput, opts?: UseTRPCInfiniteQueryOptions): UseTRPCInfiniteQueryResult<TOutput, TError>;
  useSuspenseInfiniteQuery?(input: TInput, opts?: UseTRPCSuspenseInfiniteQueryOptions): [InfiniteData<TOutput>, UseSuspenseInfiniteQueryResult];
  usePrefetchInfiniteQuery?(input: TInput, opts?: TRPCFetchInfiniteQueryOptions): void;
}

// For mutation procedures
interface MutationProcedureHooks<TInput, TOutput, TError> {
  useMutation<TContext = unknown>(
    opts?: UseTRPCMutationOptions<TInput, TError, TOutput, TContext>
  ): UseTRPCMutationResult<TOutput, TError, TInput, TContext>;
}

// For subscription procedures
interface SubscriptionProcedureHooks<TInput, TOutput, TError> {
  useSubscription(
    input: TInput,
    opts?: UseTRPCSubscriptionOptions<TOutput, TError>
  ): TRPCSubscriptionResult<TOutput, TError>;
}
```

**Usage Examples:**

```typescript
// Assuming your router has these procedures:
// router.user.get (query)
// router.user.create (mutation)
// router.posts.list (query with cursor)
// router.notifications.subscribe (subscription)

function MyComponent() {
  // Query hook
  const { data: user } = trpc.user.get.useQuery({ id: 1 });
  
  // Mutation hook
  const createUser = trpc.user.create.useMutation();
  
  // Infinite query hook (for cursor-based pagination)
  const { 
    data: posts, 
    fetchNextPage, 
    hasNextPage 
  } = trpc.posts.list.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  
  // Subscription hook
  const { data: notification } = trpc.notifications.subscribe.useSubscription({
    userId: 1,
  });

  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={() => createUser.mutate({ name: "New User" })}>
        Create User
      </button>
    </div>
  );
}
```

### Client Factory

Access to the tRPC client factory for creating configured client instances.

```typescript { .api }
/**
 * Factory function for creating tRPC clients (re-exported from @trpc/client)
 */
createClient: typeof createTRPCClient<TRouter>;
```

**Usage Examples:**

```typescript
const trpcClient = trpc.createClient({
  url: "http://localhost:5000/trpc",
  headers: {
    Authorization: "Bearer token",
  },
});

// With transformers
const trpcClient = trpc.createClient({
  url: "http://localhost:5000/trpc",
  transformer: superjson,
});
```