# Core Query Hooks

The foundation hooks for data fetching, caching, and synchronization in React Query.

## useQuery

**Primary hook for fetching, caching and updating asynchronous data**

```typescript { .api }
function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): UseQueryResult<TData, TError>

// With defined initial data
function useQuery<...>(
  options: DefinedInitialDataOptions<...>,
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError>

// With undefined initial data
function useQuery<...>(
  options: UndefinedInitialDataOptions<...>,
  queryClient?: QueryClient,
): UseQueryResult<TData, TError>
```

### Options

```typescript { .api }
interface UseQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> {
  queryKey: TQueryKey
  queryFn?: QueryFunction<TQueryFnData, TQueryKey> | SkipToken
  enabled?: boolean
  networkMode?: 'online' | 'always' | 'offlineFirst'
  retry?: boolean | number | ((failureCount: number, error: TError) => boolean)
  retryDelay?: number | ((retryAttempt: number, error: TError) => number)
  staleTime?: number | ((query: Query) => number)
  gcTime?: number
  queryKeyHashFn?: QueryKeyHashFunction<TQueryKey>
  refetchInterval?: number | false | ((query: Query) => number | false)
  refetchIntervalInBackground?: boolean
  refetchOnMount?: boolean | 'always' | ((query: Query) => boolean | 'always')
  refetchOnWindowFocus?: boolean | 'always' | ((query: Query) => boolean | 'always')
  refetchOnReconnect?: boolean | 'always' | ((query: Query) => boolean | 'always')
  notifyOnChangeProps?: Array<keyof UseQueryResult> | 'all'
  onSuccess?: (data: TData) => void
  onError?: (error: TError) => void
  onSettled?: (data: TData | undefined, error: TError | null) => void
  select?: (data: TQueryFnData) => TData
  suspense?: boolean
  initialData?: TData | InitialDataFunction<TData>
  initialDataUpdatedAt?: number | (() => number)
  placeholderData?: TData | PlaceholderDataFunction<TData, TError>
  structuralSharing?: boolean | ((oldData: TData | undefined, newData: TData) => TData)
  throwOnError?: boolean | ((error: TError, query: Query) => boolean)
  meta?: Record<string, unknown>
}
```

### Result

```typescript { .api }
interface UseQueryResult<TData = unknown, TError = DefaultError> {
  data: TData | undefined
  dataUpdatedAt: number
  error: TError | null
  errorUpdatedAt: number
  failureCount: number
  failureReason: TError | null
  fetchStatus: 'fetching' | 'paused' | 'idle'
  isError: boolean
  isFetched: boolean
  isFetchedAfterMount: boolean
  isFetching: boolean
  isInitialLoading: boolean
  isLoading: boolean
  isLoadingError: boolean
  isPaused: boolean
  isPending: boolean
  isPlaceholderData: boolean
  isRefetchError: boolean
  isRefetching: boolean
  isStale: boolean
  isSuccess: boolean
  refetch: (options?: RefetchOptions) => Promise<UseQueryResult<TData, TError>>
  status: 'pending' | 'error' | 'success'
}

interface DefinedUseQueryResult<TData = unknown, TError = DefaultError> 
  extends Omit<UseQueryResult<TData, TError>, 'data'> {
  data: TData
}
```

### Basic Usage

```typescript { .api }
import { useQuery } from '@tanstack/react-query'

interface User {
  id: number
  name: string
  email: string
}

function UserProfile({ userId }: { userId: number }) {
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  })

  if (isLoading) return <div>Loading user...</div>
  if (isError) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  )
}
```

### Advanced Usage

```typescript { .api }
// Conditional querying
function UserPosts({ userId }: { userId?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => fetchUserPosts(userId!),
    enabled: !!userId, // Only fetch when userId exists
    retry: (failureCount, error) => {
      // Don't retry on 404
      if (error.status === 404) return false
      return failureCount < 3
    }
  })

  // Component logic...
}

// Data transformation
function PostsList() {
  const { data: posts } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    select: (data) => data.posts.filter(post => post.published),
    placeholderData: { posts: [] }
  })

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

## useInfiniteQuery

**Hook for queries that can incrementally load more data (pagination, infinite scrolling)**

```typescript { .api }
function useInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
  queryClient?: QueryClient,
): UseInfiniteQueryResult<TData, TError>

// With defined initial data
function useInfiniteQuery<...>(
  options: DefinedInitialDataInfiniteOptions<...>,
  queryClient?: QueryClient,
): DefinedUseInfiniteQueryResult<TData, TError>

// With undefined initial data  
function useInfiniteQuery<...>(
  options: UndefinedInitialDataInfiniteOptions<...>,
  queryClient?: QueryClient,
): UseInfiniteQueryResult<TData, TError>
```

### Options

```typescript { .api }
interface UseInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> extends Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryFn'> {
  queryFn: QueryFunction<TQueryFnData, TQueryKey, TPageParam>
  initialPageParam: TPageParam
  getNextPageParam: (
    lastPage: TQueryFnData,
    allPages: TQueryFnData[],
    lastPageParam: TPageParam,
    allPageParams: TPageParam[]
  ) => TPageParam | undefined | null
  getPreviousPageParam?: (
    firstPage: TQueryFnData,
    allPages: TQueryFnData[],
    firstPageParam: TPageParam,
    allPageParams: TPageParam[]
  ) => TPageParam | undefined | null
  maxPages?: number
}
```

### Result

```typescript { .api }
interface UseInfiniteQueryResult<TData = unknown, TError = DefaultError> 
  extends Omit<UseQueryResult<TData, TError>, 'data'> {
  data: InfiniteData<TData> | undefined
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<UseInfiniteQueryResult<TData, TError>>
  fetchPreviousPage: (options?: FetchPreviousPageOptions) => Promise<UseInfiniteQueryResult<TData, TError>>
  hasNextPage: boolean
  hasPreviousPage: boolean
  isFetchingNextPage: boolean
  isFetchingPreviousPage: boolean
}

interface InfiniteData<TData, TPageParam = unknown> {
  pages: TData[]
  pageParams: TPageParam[]
}
```

### Basic Usage

```typescript { .api }
interface PostsPage {
  posts: Post[]
  nextCursor?: number
  hasMore: boolean
}

function InfinitePostsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery<PostsPage>({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/posts?cursor=${pageParam}`)
      return response.json()
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined
    },
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) return <div>Loading posts...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map((post) => (
            <div key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
            </div>
          ))}
        </div>
      ))}
      
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? 'Loading more...'
          : hasNextPage
          ? 'Load More'
          : 'Nothing more to load'}
      </button>
    </div>
  )
}
```

### Bidirectional Infinite Queries

```typescript { .api }
function BidirectionalFeed() {
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = { direction: 'next', cursor: 0 } }) => {
      const { direction, cursor } = pageParam
      const response = await fetch(`/api/feed?${direction}=${cursor}`)
      return response.json()
    },
    initialPageParam: { direction: 'next', cursor: 0 },
    getNextPageParam: (lastPage) => 
      lastPage.hasMore 
        ? { direction: 'next', cursor: lastPage.nextCursor }
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.hasPrevious
        ? { direction: 'previous', cursor: firstPage.previousCursor }
        : undefined
  })

  return (
    <div>
      <button
        onClick={() => fetchPreviousPage()}
        disabled={!hasPreviousPage || isFetchingPreviousPage}
      >
        {isFetchingPreviousPage ? 'Loading...' : 'Load Previous'}
      </button>
      
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.items.map(item => (
            <div key={item.id}>{item.content}</div>
          ))}
        </div>
      ))}
      
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Loading...' : 'Load Next'}
      </button>
    </div>
  )
}
```

## useQueries

**Hook for running multiple queries in parallel with advanced composition capabilities**

```typescript { .api }
function useQueries<
  T extends Array<any>,
  TCombinedResult = QueriesResults<T>,
>(
  options: {
    queries: readonly [...QueriesOptions<T>]
    combine?: (result: QueriesResults<T>) => TCombinedResult
    subscribed?: boolean
  },
  queryClient?: QueryClient,
): TCombinedResult
```

### Types

```typescript { .api }
type QueriesOptions<T extends Array<any>> = {
  [K in keyof T]: UseQueryOptions<any, any, any, any>
}

type QueriesResults<T extends Array<any>> = {
  [K in keyof T]: UseQueryResult<any, any>
}
```

### Basic Usage

```typescript { .api }
function Dashboard({ userId }: { userId: number }) {
  const results = useQueries({
    queries: [
      {
        queryKey: ['user', userId],
        queryFn: () => fetchUser(userId),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['user-posts', userId],
        queryFn: () => fetchUserPosts(userId),
        staleTime: 2 * 60 * 1000,
      },
      {
        queryKey: ['user-followers', userId],
        queryFn: () => fetchUserFollowers(userId),
        enabled: userId > 0,
      }
    ]
  })

  const [userQuery, postsQuery, followersQuery] = results

  if (userQuery.isLoading) return <div>Loading user...</div>
  if (userQuery.error) return <div>Error loading user</div>

  return (
    <div>
      <h1>{userQuery.data?.name}</h1>
      
      <section>
        <h2>Posts</h2>
        {postsQuery.isLoading ? (
          <div>Loading posts...</div>
        ) : (
          <div>{postsQuery.data?.length} posts</div>
        )}
      </section>
      
      <section>
        <h2>Followers</h2>
        {followersQuery.isLoading ? (
          <div>Loading followers...</div>
        ) : (
          <div>{followersQuery.data?.length} followers</div>
        )}
      </section>
    </div>
  )
}
```

### With Combine Function

```typescript { .api }
function CombinedDashboard({ userIds }: { userIds: number[] }) {
  const combinedResult = useQueries({
    queries: userIds.map(id => ({
      queryKey: ['user', id],
      queryFn: () => fetchUser(id),
    })),
    combine: (results) => ({
      users: results.map(result => result.data).filter(Boolean),
      isLoading: results.some(result => result.isLoading),
      hasErrors: results.some(result => result.isError),
      errors: results.map(result => result.error).filter(Boolean),
    })
  })

  if (combinedResult.isLoading) {
    return <div>Loading users...</div>
  }

  if (combinedResult.hasErrors) {
    return (
      <div>
        Errors occurred:
        {combinedResult.errors.map((error, i) => (
          <div key={i}>{error.message}</div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h1>Users ({combinedResult.users.length})</h1>
      {combinedResult.users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### Dynamic Queries

```typescript { .api }
function DynamicQueries({ searchTerms }: { searchTerms: string[] }) {
  const queries = useQueries({
    queries: searchTerms.map((term) => ({
      queryKey: ['search', term],
      queryFn: () => searchPosts(term),
      enabled: term.length > 2, // Only search terms longer than 2 chars
      staleTime: 30 * 1000, // 30 seconds
    })),
    combine: (results) => ({
      data: results.flatMap(result => result.data || []),
      isAnyLoading: results.some(result => result.isLoading),
      hasData: results.some(result => result.data?.length > 0),
    })
  })

  return (
    <div>
      {queries.isAnyLoading && <div>Searching...</div>}
      {!queries.hasData && !queries.isAnyLoading && (
        <div>No results found</div>
      )}
      {queries.data.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

## Performance Optimizations

### Query Key Factories

```typescript { .api }
// Consistent query key management
const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  posts: (id: number) => [...userKeys.detail(id), 'posts'] as const,
}

// Usage with type safety
const { data: user } = useQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => fetchUser(userId)
})

const { data: posts } = useQuery({
  queryKey: userKeys.posts(userId),
  queryFn: () => fetchUserPosts(userId),
  enabled: !!user
})
```

### Structural Sharing

```typescript { .api }
const { data } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  structuralSharing: (oldData, newData) => {
    // Custom structural sharing logic
    if (!oldData) return newData
    
    // Only update if data actually changed
    const changed = newData.some((todo, index) => 
      !oldData[index] || todo.id !== oldData[index].id
    )
    
    return changed ? newData : oldData
  }
})
```

### Selective Subscriptions

```typescript { .api }
const { data, refetch } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  notifyOnChangeProps: ['data', 'error'], // Only re-render when data or error changes
})
```

These core query hooks provide the foundation for all data fetching patterns in React Query, offering powerful caching, background updates, error handling, and performance optimizations out of the box.