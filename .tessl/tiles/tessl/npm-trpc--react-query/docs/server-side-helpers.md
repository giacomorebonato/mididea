# Server-Side Helpers

Functions for server-side rendering, static generation, and React Server Components support. These utilities enable data prefetching and hydration in Next.js and other server-side rendering frameworks.

## Capabilities

### createServerSideHelpers

Creates a set of utilities for server-side data fetching and cache management.

```typescript { .api }
/**
 * Creates server-side helpers for SSG, SSR, and data prefetching
 * @param opts - Configuration options with router/client and query client
 * @returns Object with server-side utility functions and dehydration
 */
function createServerSideHelpers<TRouter extends AnyRouter>(
  opts: CreateServerSideHelpersOptions<TRouter>
): ServerSideHelpers<TRouter>;

type CreateServerSideHelpersOptions<TRouter extends AnyRouter> = 
  CreateTRPCReactQueryClientConfig & (
    | CreateSSGHelpersInternal<TRouter>
    | CreateSSGHelpersExternal<TRouter>
  );

interface CreateSSGHelpersInternal<TRouter extends AnyRouter> {
  /** tRPC router instance */
  router: TRouter;
  /** Router context for procedure calls */
  ctx: inferRouterContext<TRouter>;
  /** Data transformer configuration */
  transformer?: TransformerOptions;
}

interface CreateSSGHelpersExternal<TRouter extends AnyRouter> {
  /** tRPC client instance */
  client: TRPCClient<TRouter> | TRPCUntypedClient<TRouter>;
}

interface ServerSideHelpers<TRouter> {
  /** React Query client instance */
  queryClient: QueryClient;
  /** Dehydrate query cache for client-side hydration */
  dehydrate: (opts?: DehydrateOptions) => DehydratedState;
  
  // Procedure-specific methods are generated based on router structure
  // Each query procedure gets: fetch, fetchInfinite, prefetch, prefetchInfinite, queryOptions, infiniteQueryOptions
}
```

**Usage Examples:**

```typescript
// With router and context (internal)
import { createServerSideHelpers } from "@trpc/react-query/server";
import { createContext } from "./context";
import { appRouter } from "./router";

export const ssg = createServerSideHelpers({
  router: appRouter,
  ctx: await createContext(),
  transformer: superjson,
});

// With client (external)
export const ssg = createServerSideHelpers({
  client: trpcClient,
  queryClient: new QueryClient(),
});
```

### Server-Side Data Fetching

Fetch data on the server before rendering components.

```typescript { .api }
/**
 * Fetch query data on the server
 * @param input - Input parameters for the procedure
 * @param opts - Server-side fetch options
 * @returns Promise resolving to the fetched data
 */
procedure.fetch(
  input: TInput,
  opts?: TRPCFetchQueryOptions<TOutput, TError>
): Promise<TOutput>;

/**
 * Fetch infinite query data on the server
 * @param input - Input parameters for the infinite query
 * @param opts - Server-side fetch infinite options
 * @returns Promise resolving to the fetched infinite data
 */
procedure.fetchInfinite(
  input: GetInfiniteQueryInput<TInput>,
  opts: TRPCFetchInfiniteQueryOptions<TInput, TOutput, TError>
): Promise<InfiniteData<TOutput>>;
```

**Usage Examples:**

```typescript
// Next.js getServerSideProps
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(context),
  });

  // Fetch user data on the server
  const user = await ssg.user.get.fetch({ id: 1 });
  
  // Fetch paginated posts
  const posts = await ssg.posts.list.fetchInfinite(
    { limit: 10 },
    { initialCursor: null }
  );

  return {
    props: {
      user,
      posts,
      trpcState: ssg.dehydrate(),
    },
  };
}

// Next.js getStaticProps
export async function getStaticProps() {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
  });

  try {
    await ssg.posts.list.fetch({ limit: 100 });
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 60, // Revalidate every minute
  };
}
```

### Server-Side Prefetching

Prefetch data on the server to populate the query cache.

```typescript { .api }
/**
 * Prefetch query data on the server
 * @param input - Input parameters for the procedure
 * @param opts - Server-side prefetch options
 * @returns Promise that resolves when prefetch is complete
 */
procedure.prefetch(
  input: TInput,
  opts?: TRPCFetchQueryOptions<TOutput, TError>
): Promise<void>;

/**
 * Prefetch infinite query data on the server
 * @param input - Input parameters for the infinite query
 * @param opts - Server-side prefetch infinite options
 * @returns Promise that resolves when prefetch is complete
 */
procedure.prefetchInfinite(
  input: GetInfiniteQueryInput<TInput>,
  opts: TRPCFetchInfiniteQueryOptions<TInput, TOutput, TError>
): Promise<void>;
```

**Usage Examples:**

```typescript
// Prefetch multiple queries
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(context),
  });

  // Prefetch multiple related queries
  await Promise.all([
    ssg.user.get.prefetch({ id: 1 }),
    ssg.user.posts.prefetch({ userId: 1 }),
    ssg.posts.list.prefetchInfinite(
      { limit: 10 },
      { initialCursor: null }
    ),
  ]);

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
}

// Conditional prefetching
export async function getStaticProps({ params }: GetStaticPropsContext) {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
  });

  const userId = Number(params?.userId);
  
  if (userId) {
    // Only prefetch if userId is valid
    await ssg.user.get.prefetch({ id: userId });
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
      userId,
    },
  };
}
```

### Query Options Generation

Generate React Query options for server-side use.

```typescript { .api }
/**
 * Generate query options for React Query
 * @param input - Input parameters for the procedure
 * @param opts - Query options configuration
 * @returns React Query options object
 */
procedure.queryOptions(
  input: TInput,
  opts?: TRPCQueryOptions<TOutput, TError>
): DefinedTRPCQueryOptionsOut<TOutput, TOutput, TError>;

/**
 * Generate infinite query options for React Query
 * @param input - Input parameters for the infinite query
 * @param opts - Infinite query options configuration
 * @returns React Query infinite options object
 */
procedure.infiniteQueryOptions(
  input: GetInfiniteQueryInput<TInput>,
  opts?: TRPCInfiniteQueryOptions<TInput, TOutput, TError>
): DefinedTRPCInfiniteQueryOptionsOut<TInput, TOutput, TError>;
```

**Usage Examples:**

```typescript
// Generate query options for custom usage
function CustomServerSideLogic() {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: createContext(),
  });

  // Generate query options
  const userQueryOptions = ssg.user.get.queryOptions({ id: 1 });
  const postsQueryOptions = ssg.posts.list.infiniteQueryOptions(
    { limit: 10 },
    { initialCursor: null }
  );

  // Use with React Query directly
  const queryClient = new QueryClient();
  
  // Prefetch using generated options
  await queryClient.prefetchQuery(userQueryOptions);
  await queryClient.prefetchInfiniteQuery(postsQueryOptions);

  return {
    userQueryOptions,
    postsQueryOptions,
  };
}
```

### Dehydration and Hydration

Serialize server-side cache state for client-side hydration.

```typescript { .api }
/**
 * Dehydrate query cache for client-side hydration
 * @param opts - Dehydration options
 * @returns Serialized state for client hydration
 */
dehydrate(opts?: DehydrateOptions): DehydratedState;

interface DehydrateOptions {
  shouldDehydrateQuery?: (query: Query) => boolean;
  shouldDehydrateMutation?: (mutation: Mutation) => boolean;
  serializeData?: (data: unknown) => unknown;
}
```

**Usage Examples:**

```typescript
// Basic dehydration
export async function getServerSideProps() {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
  });

  await ssg.user.list.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
}

// Custom dehydration options
export async function getServerSideProps() {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
  });

  await ssg.user.list.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate({
        shouldDehydrateQuery: (query) => {
          // Only dehydrate successful queries
          return query.state.status === 'success';
        },
      }),
    },
  };
}

// Client-side hydration
function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => trpc.createClient({
    url: "http://localhost:3000/api/trpc",
  }));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.trpcState}>
          <Component {...pageProps} />
        </Hydrate>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```


## Common Patterns

### Error Handling in SSR

```typescript
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(context),
  });

  try {
    await ssg.user.get.fetch({ id: 1 });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    
    // Handle specific errors
    if (error.code === "NOT_FOUND") {
      return { notFound: true };
    }
    
    // Return error props
    return {
      props: {
        error: error.message,
        trpcState: ssg.dehydrate(),
      },
    };
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
}
```

### Conditional Server-Side Logic

```typescript
export async function getStaticProps({ params }: GetStaticPropsContext) {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
  });

  const userId = params?.userId as string;
  
  if (userId && !isNaN(Number(userId))) {
    // Only fetch if userId is valid
    try {
      await ssg.user.get.fetch({ id: Number(userId) });
      await ssg.user.posts.prefetch({ userId: Number(userId) });
    } catch (error) {
      console.warn(`Failed to fetch data for user ${userId}:`, error);
    }
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
      userId: userId || null,
    },
  };
}
```

### Performance Optimization

```typescript
export async function getServerSideProps() {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
  });

  // Fetch critical data first
  const criticalData = await ssg.app.config.fetch();
  
  // Prefetch non-critical data in parallel
  await Promise.allSettled([
    ssg.user.recommendations.prefetch(),
    ssg.posts.trending.prefetch(),
    ssg.notifications.recent.prefetch(),
  ]);

  return {
    props: {
      criticalData,
      trpcState: ssg.dehydrate({
        shouldDehydrateQuery: (query) => {
          // Only dehydrate successful queries to reduce payload size
          return query.state.status === 'success';
        },
      }),
    },
  };
}
```

### Custom Context Creation

```typescript
async function createSSRContext(context: GetServerSidePropsContext) {
  const session = await getSession(context.req);
  
  return {
    session,
    req: context.req,
    res: context.res,
  };
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createSSRContext(context),
  });

  if (session?.user) {
    await ssg.user.profile.prefetch({ id: session.user.id });
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
      session,
    },
  };
}
```