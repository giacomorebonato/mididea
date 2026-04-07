# Provider & Context System

Components and hooks for managing QueryClient context, hydration, and error boundaries.

## QueryClientProvider

**Provider component for QueryClient context**

```typescript { .api }
const QueryClientProvider: React.FC<QueryClientProviderProps>

interface QueryClientProviderProps {
  client: QueryClient
  children?: React.ReactNode
}
```

### Basic Setup

```typescript { .api }
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
      retry: (failureCount, error) => {
        if (error.status === 404) return false
        return failureCount < 3
      }
    },
    mutations: {
      retry: 1
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users/:id" element={<UserProfile />} />
          </Routes>
        </Router>
      </div>
    </QueryClientProvider>
  )
}
```

### Advanced Configuration

```typescript { .api }
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(`Query failed:`, error)
      // Global query error handling
      if (error.status === 401) {
        // Redirect to login
        window.location.href = '/login'
      }
    },
    onSuccess: (data, query) => {
      // Global success handling
      console.log(`Query succeeded for key:`, query.queryKey)
    }
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      console.error(`Mutation failed:`, error)
      // Show global error notification
      toast.error(`Operation failed: ${error.message}`)
    },
    onSuccess: (data, variables, context, mutation) => {
      // Show global success notification
      if (mutation.options.meta?.successMessage) {
        toast.success(mutation.options.meta.successMessage)
      }
    }
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Custom retry logic
        if (error.status === 404 || error.status === 403) return false
        return failureCount < 3
      }
    },
    mutations: {
      retry: (failureCount, error) => {
        if (error.status >= 400 && error.status < 500) return false
        return failureCount < 2
      }
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Suspense fallback={<GlobalLoadingSpinner />}>
          <AppContent />
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
```

## QueryClientContext

**React context that holds the QueryClient instance**

```typescript { .api }
const QueryClientContext: React.Context<QueryClient | undefined>
```

### Direct Context Usage

```typescript { .api }
import { useContext } from 'react'
import { QueryClientContext } from '@tanstack/react-query'

function MyComponent() {
  const queryClient = useContext(QueryClientContext)
  
  if (!queryClient) {
    throw new Error('QueryClient not found. Make sure you are using QueryClientProvider.')
  }

  const handleInvalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  }

  return (
    <button onClick={handleInvalidate}>
      Refresh Posts
    </button>
  )
}
```

## useQueryClient

**Hook to access the current QueryClient instance**

```typescript { .api }
function useQueryClient(queryClient?: QueryClient): QueryClient
```

### Basic Usage

```typescript { .api }
import { useQueryClient } from '@tanstack/react-query'

function RefreshButton() {
  const queryClient = useQueryClient()

  const handleRefreshAll = () => {
    // Invalidate all queries
    queryClient.invalidateQueries()
  }

  const handleRefreshPosts = () => {
    // Invalidate specific queries
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  }

  return (
    <div>
      <button onClick={handleRefreshPosts}>Refresh Posts</button>
      <button onClick={handleRefreshAll}>Refresh All</button>
    </div>
  )
}
```

### Cache Manipulation

```typescript { .api }
function PostActions({ postId }: { postId: number }) {
  const queryClient = useQueryClient()

  const handleOptimisticUpdate = () => {
    queryClient.setQueryData(['post', postId], (oldPost: Post) => ({
      ...oldPost,
      likes: oldPost.likes + 1
    }))
  }

  const handlePrefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['post-comments', postId],
      queryFn: () => fetchPostComments(postId),
      staleTime: 5 * 60 * 1000
    })
  }

  const handleRemoveFromCache = () => {
    queryClient.removeQueries({ queryKey: ['post', postId] })
  }

  return (
    <div>
      <button onClick={handleOptimisticUpdate}>Like</button>
      <button onClick={handlePrefetch}>Prefetch Comments</button>
      <button onClick={handleRemoveFromCache}>Remove from Cache</button>
    </div>
  )
}
```

### Manual Cache Updates

```typescript { .api }
function usePostCache() {
  const queryClient = useQueryClient()

  const updatePost = (postId: number, updates: Partial<Post>) => {
    queryClient.setQueryData(['post', postId], (oldPost: Post) => ({
      ...oldPost,
      ...updates
    }))
  }

  const addPost = (newPost: Post) => {
    // Update posts list
    queryClient.setQueryData(['posts'], (oldPosts: Post[]) => 
      [newPost, ...oldPosts]
    )
    
    // Set individual post data
    queryClient.setQueryData(['post', newPost.id], newPost)
  }

  const removePost = (postId: number) => {
    // Remove from posts list
    queryClient.setQueryData(['posts'], (oldPosts: Post[]) =>
      oldPosts.filter(post => post.id !== postId)
    )
    
    // Remove individual post data
    queryClient.removeQueries({ queryKey: ['post', postId] })
  }

  return { updatePost, addPost, removePost }
}
```

## HydrationBoundary

**Component for hydrating server-side rendered queries on the client**

```typescript { .api }
const HydrationBoundary: React.FC<HydrationBoundaryProps>

interface HydrationBoundaryProps {
  state: DehydratedState | null | undefined
  options?: HydrateOptions
  children?: React.ReactNode
  queryClient?: QueryClient
}
```

### Basic SSR Setup

```typescript { .api }
// Server-side (Next.js example)
import { QueryClient, dehydrate } from '@tanstack/react-query'

export async function getServerSideProps() {
  const queryClient = new QueryClient()

  // Prefetch data on the server
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  })

  await queryClient.prefetchQuery({
    queryKey: ['user', 'me'],
    queryFn: fetchCurrentUser
  })

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  }
}

// Client-side
function PostsPage({ dehydratedState }: { dehydratedState: DehydratedState }) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <PostsList />
      <UserProfile />
    </HydrationBoundary>
  )
}
```

### Advanced Hydration

```typescript { .api }
function App({ dehydratedState }: { dehydratedState: DehydratedState }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000 // 1 minute
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary 
        state={dehydratedState}
        options={{
          defaultOptions: {
            queries: {
              staleTime: 5 * 60 * 1000 // Override stale time for hydrated queries
            }
          }
        }}
      >
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/posts" element={<PostsPage />} />
          </Routes>
        </Router>
      </HydrationBoundary>
    </QueryClientProvider>
  )
}
```

### Selective Hydration

```typescript { .api }
// Server-side with selective dehydration
export async function getServerSideProps() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  })

  await queryClient.prefetchQuery({
    queryKey: ['user-settings'],
    queryFn: fetchUserSettings
  })

  return {
    props: {
      dehydratedState: dehydrate(queryClient, {
        shouldDehydrateQuery: (query) => {
          // Only dehydrate posts, not user settings for security
          return query.queryKey[0] === 'posts'
        }
      })
    }
  }
}
```

### Nested Hydration Boundaries

```typescript { .api }
function Layout({ globalDehydratedState, children }: { 
  globalDehydratedState: DehydratedState
  children: React.ReactNode 
}) {
  return (
    <HydrationBoundary state={globalDehydratedState}>
      <Header />
      <main>{children}</main>
      <Footer />
    </HydrationBoundary>
  )
}

function PostPage({ pageDehydratedState }: { pageDehydratedState: DehydratedState }) {
  return (
    <HydrationBoundary state={pageDehydratedState}>
      <PostContent />
      <PostComments />
    </HydrationBoundary>
  )
}
```

## QueryErrorResetBoundary

**Component for providing error reset functionality to child queries**

```typescript { .api }
const QueryErrorResetBoundary: React.FC<QueryErrorResetBoundaryProps>

interface QueryErrorResetBoundaryProps {
  children: QueryErrorResetBoundaryFunction | React.ReactNode
}

type QueryErrorResetBoundaryFunction = (
  value: QueryErrorResetBoundaryValue,
) => React.ReactNode

interface QueryErrorResetBoundaryValue {
  clearReset: QueryErrorClearResetFunction
  isReset: QueryErrorIsResetFunction
  reset: QueryErrorResetFunction
}
```

### Basic Error Boundary

```typescript { .api }
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div className="error-fallback">
              <h2>Something went wrong:</h2>
              <pre className="error-message">{error.message}</pre>
              <button onClick={resetErrorBoundary}>
                Try again
              </button>
            </div>
          )}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <UserDashboard />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

### useQueryErrorResetBoundary

```typescript { .api }
function useQueryErrorResetBoundary(): QueryErrorResetBoundaryValue
```

### Custom Error Reset Logic

```typescript { .api }
import { useQueryErrorResetBoundary } from '@tanstack/react-query'

function CustomErrorBoundary({ children }: { children: React.ReactNode }) {
  const { reset, isReset } = useQueryErrorResetBoundary()
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (isReset()) {
      setHasError(false)
    }
  }, [isReset])

  if (hasError) {
    return (
      <div className="error-boundary">
        <h2>Oops! Something went wrong</h2>
        <button 
          onClick={() => {
            reset()
            setHasError(false)
          }}
        >
          Reset and try again
        </button>
      </div>
    )
  }

  return (
    <ErrorBoundary
      onError={() => setHasError(true)}
      fallback={null}
    >
      {children}
    </ErrorBoundary>
  )
}
```

### Nested Error Boundaries

```typescript { .api }
function Layout() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <div>
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ resetErrorBoundary }) => (
              <div className="header-error">
                <span>Header failed to load</span>
                <button onClick={resetErrorBoundary}>Retry</button>
              </div>
            )}
          >
            <Header />
          </ErrorBoundary>

          <main>
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ resetErrorBoundary }) => (
                <div className="content-error">
                  <h2>Content failed to load</h2>
                  <button onClick={resetErrorBoundary}>Retry</button>
                </div>
              )}
            >
              <MainContent />
            </ErrorBoundary>
          </main>
        </div>
      )}
    </QueryErrorResetBoundary>
  )
}
```

## IsRestoringProvider

**Provider component for tracking restoration state**

```typescript { .api }
const IsRestoringProvider: React.Provider<boolean>
```

### useIsRestoring

```typescript { .api }
function useIsRestoring(): boolean
```

### Usage

```typescript { .api }
import { useIsRestoring } from '@tanstack/react-query'

function GlobalLoadingIndicator() {
  const isRestoring = useIsRestoring()
  const isFetching = useIsFetching()

  if (isRestoring) {
    return (
      <div className="restoration-indicator">
        Restoring queries from server...
      </div>
    )
  }

  if (isFetching > 0) {
    return (
      <div className="fetching-indicator">
        Loading... ({isFetching} queries)
      </div>
    )
  }

  return null
}
```

### Custom Restoration Handling

```typescript { .api }
function App({ dehydratedState }: { dehydratedState: DehydratedState }) {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <IsRestoringProvider value={true}>
          <RestorationAwareApp />
        </IsRestoringProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  )
}

function RestorationAwareApp() {
  const isRestoring = useIsRestoring()

  // Don't render interactive elements during restoration
  if (isRestoring) {
    return <SkeletonLoader />
  }

  return <InteractiveApp />
}
```

## Core Management Classes

The following core classes are available for advanced use cases and custom implementations:

### QueryCache

**Manages the cache of queries and their states**

```typescript { .api }
class QueryCache {
  constructor(config?: QueryCacheConfig)
  
  add(query: Query): void
  remove(query: Query): void
  find(filters: QueryFilters): Query | undefined
  findAll(filters?: QueryFilters): Query[]
  notify(event: QueryCacheNotifyEvent): void
  subscribe(callback: (event: QueryCacheNotifyEvent) => void): () => void
  clear(): void
}

interface QueryCacheConfig {
  onError?: (error: unknown, query: Query) => void
  onSuccess?: (data: unknown, query: Query) => void
  onSettled?: (data: unknown | undefined, error: unknown | null, query: Query) => void
}
```

**Example:**
```typescript
import { QueryCache } from '@tanstack/react-query'

const queryCache = new QueryCache({
  onError: (error, query) => {
    console.error('Query failed:', query.queryKey, error)
  },
  onSuccess: (data, query) => {
    console.log('Query succeeded:', query.queryKey)  
  }
})

// Use in QueryClient
const queryClient = new QueryClient({ queryCache })
```

### MutationCache

**Manages the cache of mutations and their states**

```typescript { .api }
class MutationCache {
  constructor(config?: MutationCacheConfig)
  
  add(mutation: Mutation): void
  remove(mutation: Mutation): void
  find(filters: MutationFilters): Mutation | undefined
  findAll(filters?: MutationFilters): Mutation[]
  notify(event: MutationCacheNotifyEvent): void
  subscribe(callback: (event: MutationCacheNotifyEvent) => void): () => void
  clear(): void
}

interface MutationCacheConfig {
  onError?: (error: unknown, variables: unknown, context: unknown, mutation: Mutation) => void
  onSuccess?: (data: unknown, variables: unknown, context: unknown, mutation: Mutation) => void
  onSettled?: (data: unknown | undefined, error: unknown | null, variables: unknown, context: unknown, mutation: Mutation) => void
}
```

### Core Managers

#### focusManager

**Manages window focus detection for automatic refetching**

```typescript { .api }
const focusManager: {
  subscribe(callback: (focused: boolean) => void): () => void
  setFocused(focused?: boolean): void
  isFocused(): boolean
  setEventListener(handleFocus: () => void): void
}
```

**Example:**
```typescript
import { focusManager } from '@tanstack/react-query'

// Custom focus management
focusManager.setEventListener(() => {
  // Custom logic to determine if window is focused
  const hasFocus = document.hasFocus()
  focusManager.setFocused(hasFocus)
})

// Subscribe to focus changes
const unsubscribe = focusManager.subscribe((focused) => {
  console.log('Window focus changed:', focused)
})
```

#### onlineManager

**Manages network connectivity detection for automatic refetching**

```typescript { .api }
const onlineManager: {
  subscribe(callback: (online: boolean) => void): () => void
  setOnline(online?: boolean): void
  isOnline(): boolean
  setEventListener(handleOnline: () => void): void
}
```

**Example:**
```typescript
import { onlineManager } from '@tanstack/react-query'

// Custom online detection
onlineManager.setEventListener(() => {
  onlineManager.setOnline(navigator.onLine)
})

// Subscribe to online status changes  
const unsubscribe = onlineManager.subscribe((online) => {
  if (online) {
    console.log('Connection restored')
  } else {
    console.log('Connection lost')
  }
})
```

#### notifyManager

**Manages batching and scheduling of notifications**

```typescript { .api }
const notifyManager: {
  schedule(fn: () => void): void
  batchCalls<T extends Array<unknown>>(fn: (...args: T) => void): (...args: T) => void
  flush(): void
}
```

### Observer Classes

Advanced observer classes for custom query management:

#### QueryObserver

**Lower-level observer for individual queries**

```typescript { .api }
class QueryObserver<TQueryFnData, TError, TData, TQueryKey extends QueryKey> {
  constructor(client: QueryClient, options: QueryObserverOptions<TQueryFnData, TError, TData, TQueryKey>)
  
  subscribe(listener?: (result: QueryObserverResult<TData, TError>) => void): () => void
  getCurrentResult(): QueryObserverResult<TData, TError>
  trackResult(result: QueryObserverResult<TData, TError>): QueryObserverResult<TData, TError>
  getOptimisticResult(options: QueryObserverOptions<TQueryFnData, TError, TData, TQueryKey>): QueryObserverResult<TData, TError>
  updateResult(): void
  setOptions(options: QueryObserverOptions<TQueryFnData, TError, TData, TQueryKey>): void
  destroy(): void
}
```

#### InfiniteQueryObserver

**Observer for infinite/paginated queries**

```typescript { .api }
class InfiniteQueryObserver<TQueryFnData, TError, TData, TQueryKey extends QueryKey, TPageParam> {
  constructor(client: QueryClient, options: InfiniteQueryObserverOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>)
  
  subscribe(listener?: (result: InfiniteQueryObserverResult<TData, TError>) => void): () => void
  getCurrentResult(): InfiniteQueryObserverResult<TData, TError>
  // ... similar methods to QueryObserver
}
```

#### MutationObserver

**Observer for individual mutations**

```typescript { .api }
class MutationObserver<TData, TError, TVariables, TContext> {
  constructor(client: QueryClient, options: MutationObserverOptions<TData, TError, TVariables, TContext>)
  
  subscribe(listener?: (result: MutationObserverResult<TData, TError, TVariables, TContext>) => void): () => void
  getCurrentResult(): MutationObserverResult<TData, TError, TVariables, TContext>
  mutate(variables: TVariables, options?: MutateOptions<TData, TError, TVariables, TContext>): Promise<TData>
  reset(): void
  destroy(): void
}
```

### Hydration Utilities

#### dehydrate

**Serializes QueryClient state for SSR**

```typescript { .api }
function dehydrate(
  client: QueryClient,
  options?: DehydrateOptions
): DehydratedState

interface DehydrateOptions {
  shouldDehydrateMutation?: (mutation: Mutation) => boolean
  shouldDehydrateQuery?: (query: Query) => boolean
}
```

#### hydrate

**Restores QueryClient state from serialized data**

```typescript { .api }
function hydrate(
  client: QueryClient,
  dehydratedState: DehydratedState,
  options?: HydrateOptions
): void

interface HydrateOptions {
  defaultOptions?: DefaultOptions
}
```

#### defaultShouldDehydrateQuery

**Default filter for query dehydration**

```typescript { .api }
function defaultShouldDehydrateQuery(query: Query): boolean
```

#### defaultShouldDehydrateMutation

**Default filter for mutation dehydration**

```typescript { .api }
function defaultShouldDehydrateMutation(mutation: Mutation): boolean
```

**Example:**
```typescript
import { 
  dehydrate, 
  hydrate, 
  defaultShouldDehydrateQuery,
  defaultShouldDehydrateMutation 
} from '@tanstack/react-query'

// Custom dehydration with selective queries
export async function getServerSideProps() {
  const queryClient = new QueryClient()
  
  // Prefetch data
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  })
  
  return {
    props: {
      dehydratedState: dehydrate(queryClient, {
        shouldDehydrateQuery: (query) => {
          // Use default logic plus custom conditions
          return defaultShouldDehydrateQuery(query) && 
                 !query.queryKey.includes('sensitive')
        }
      })
    }
  }
}
```

## Best Practices

### QueryClient Singleton

```typescript { .api }
// ❌ Don't create a new QueryClient on every render
function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {/* This creates a new client on every render */}
    </QueryClientProvider>
  )
}

// ✅ Create QueryClient outside component or use useState
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* QueryClient is stable across renders */}
    </QueryClientProvider>
  )
}

// ✅ Or use useState for client-side apps
function App() {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <QueryClientProvider client={queryClient}>
      {/* QueryClient is created once and stable */}
    </QueryClientProvider>
  )
}
```

### Error Boundary Hierarchy

```typescript { .api }
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Global error boundary for unrecoverable errors */}
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={GlobalErrorFallback}
          >
            <Router>
              <Routes>
                <Route path="/*" element={
                  /* Page-level error boundaries for recoverable errors */
                  <QueryErrorResetBoundary>
                    {({ reset }) => (
                      <ErrorBoundary
                        onReset={reset}
                        fallbackRender={PageErrorFallback}
                      >
                        <PageContent />
                      </ErrorBoundary>
                    )}
                  </QueryErrorResetBoundary>
                } />
              </Routes>
            </Router>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </QueryClientProvider>
  )
}
```

### Context Optimization

```typescript { .api }
// ✅ Use the useQueryClient hook instead of context directly
function MyComponent() {
  const queryClient = useQueryClient()
  // Hook provides better error messages and type safety
}

// ❌ Don't use context directly unless necessary
function MyComponent() {
  const queryClient = useContext(QueryClientContext)
  // Manual error checking required
  if (!queryClient) throw new Error('...')
}
```

The provider and context system in React Query offers a robust foundation for managing query state, error handling, and SSR hydration across your entire React application.