# Suspense Integration

React Suspense-compatible versions of query hooks that suspend component rendering until data is available.

## useSuspenseQuery

**Suspense-enabled version of useQuery that suspends component rendering until data is available**

```typescript { .api }
function useSuspenseQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): UseSuspenseQueryResult<TData, TError>
```

### Options

```typescript { .api }
interface UseSuspenseQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 
  'queryFn' | 'enabled' | 'throwOnError' | 'placeholderData'> {
  queryFn?: Exclude<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>['queryFn'], SkipToken>
}
```

**Key Differences from useQuery:**
- `enabled` is always `true` (cannot be disabled)
- `throwOnError` is always `true` (errors are thrown to Error Boundaries)
- `placeholderData` is not supported (component suspends instead)
- `queryFn` cannot be `skipToken`

### Result

```typescript { .api }
interface UseSuspenseQueryResult<TData = unknown, TError = DefaultError> 
  extends Omit<DefinedQueryObserverResult<TData, TError>, 'isPlaceholderData' | 'promise'> {
  data: TData // Always defined (never undefined)
  isPlaceholderData: false // Always false
}
```

**Guaranteed Properties:**
- `data` is always defined (never undefined)
- `isSuccess` is always `true`
- `isLoading` and `isPending` are always `false`
- `isPlaceholderData` is always `false`

### Basic Usage

```typescript { .api }
import { Suspense } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'

interface User {
  id: number
  name: string
  email: string
}

function UserProfile({ userId }: { userId: number }) {
  // No need to check for loading states or undefined data
  const { data: user } = useSuspenseQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      return response.json()
    }
  })

  // user is guaranteed to be defined here
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<div>Loading user...</div>}>
      <UserProfile userId={1} />
    </Suspense>
  )
}
```

### With Error Boundary

```typescript { .api }
import { ErrorBoundary } from 'react-error-boundary'

function UserDashboard({ userId }: { userId: number }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })

  const { data: posts } = useSuspenseQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => fetchUserPosts(userId)
  })

  return (
    <div>
      <h1>{user.name}</h1>
      <div>Posts: {posts.length}</div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <UserDashboard userId={1} />
      </Suspense>
    </ErrorBoundary>
  )
}
```

## useSuspenseInfiniteQuery

**Suspense-enabled version of useInfiniteQuery for incremental loading with suspense**

```typescript { .api }
function useSuspenseInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseSuspenseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
  queryClient?: QueryClient,
): UseSuspenseInfiniteQueryResult<TData, TError>
```

### Options

```typescript { .api }
interface UseSuspenseInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> extends Omit<UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>, 
  'queryFn' | 'enabled' | 'throwOnError' | 'placeholderData'> {
  queryFn?: Exclude<UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>['queryFn'], SkipToken>
}
```

### Result

```typescript { .api }
interface UseSuspenseInfiniteQueryResult<TData = unknown, TError = DefaultError> 
  extends Omit<DefinedInfiniteQueryObserverResult<TData, TError>, 'isPlaceholderData' | 'promise'> {
  data: InfiniteData<TData> // Always defined
  isPlaceholderData: false // Always false
}
```

### Basic Usage

```typescript { .api }
interface PostsPage {
  posts: Post[]
  nextCursor?: number
}

function InfinitePostsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useSuspenseInfiniteQuery<PostsPage>({
    queryKey: ['posts'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/posts?cursor=${pageParam}`)
      return response.json()
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  // data is guaranteed to be defined
  return (
    <div>
      {data.pages.map((page, i) => (
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
        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
      </button>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<div>Loading posts...</div>}>
      <InfinitePostsList />
    </Suspense>
  )
}
```

## useSuspenseQueries

**Suspense-enabled version of useQueries for parallel query execution with suspense**

```typescript { .api }
function useSuspenseQueries<
  T extends Array<any>,
  TCombinedResult = SuspenseQueriesResults<T>,
>(
  options: {
    queries: readonly [...SuspenseQueriesOptions<T>]
    combine?: (result: SuspenseQueriesResults<T>) => TCombinedResult
  },
  queryClient?: QueryClient,
): TCombinedResult
```

### Types

```typescript { .api }
type SuspenseQueriesOptions<T extends Array<any>> = {
  [K in keyof T]: UseSuspenseQueryOptions<any, any, any, any>
}

type SuspenseQueriesResults<T extends Array<any>> = {
  [K in keyof T]: UseSuspenseQueryResult<any, any>
}
```

### Basic Usage

```typescript { .api }
function UserDashboard({ userId }: { userId: number }) {
  const [userQuery, postsQuery, followersQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['user', userId],
        queryFn: () => fetchUser(userId)
      },
      {
        queryKey: ['user-posts', userId],
        queryFn: () => fetchUserPosts(userId)
      },
      {
        queryKey: ['user-followers', userId],
        queryFn: () => fetchUserFollowers(userId)
      }
    ]
  })

  // All data is guaranteed to be defined
  return (
    <div>
      <h1>{userQuery.data.name}</h1>
      <div>Posts: {postsQuery.data.length}</div>
      <div>Followers: {followersQuery.data.length}</div>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <UserDashboard userId={1} />
    </Suspense>
  )
}
```

### With Combine Function

```typescript { .api }
function StatsOverview({ userIds }: { userIds: number[] }) {
  const stats = useSuspenseQueries({
    queries: userIds.map(id => ({
      queryKey: ['user-stats', id],
      queryFn: () => fetchUserStats(id),
    })),
    combine: (results) => ({
      totalUsers: results.length,
      totalPosts: results.reduce((sum, result) => sum + result.data.postCount, 0),
      totalFollowers: results.reduce((sum, result) => sum + result.data.followerCount, 0),
      users: results.map(result => result.data)
    })
  })

  return (
    <div>
      <h2>Platform Statistics</h2>
      <div>Total Users: {stats.totalUsers}</div>
      <div>Total Posts: {stats.totalPosts}</div>
      <div>Total Followers: {stats.totalFollowers}</div>
      
      <h3>Top Users</h3>
      {stats.users
        .sort((a, b) => b.followerCount - a.followerCount)
        .slice(0, 5)
        .map(user => (
          <div key={user.id}>
            {user.name} - {user.followerCount} followers
          </div>
        ))}
    </div>
  )
}
```

## Suspense Best Practices

### Nested Suspense Boundaries

```typescript { .api }
function App() {
  return (
    <div>
      {/* Top-level suspense for critical data */}
      <Suspense fallback={<AppShell />}>
        <Navigation />
        <main>
          {/* Nested suspense for page-specific data */}
          <Suspense fallback={<PageSkeleton />}>
            <Route path="/users/:id" component={UserPage} />
          </Suspense>
        </main>
      </Suspense>
    </div>
  )
}

function UserPage({ userId }: { userId: number }) {
  // This will suspend until user data is loaded
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })

  return (
    <div>
      <UserHeader user={user} />
      
      {/* Nested suspense for secondary data */}
      <Suspense fallback={<div>Loading posts...</div>}>
        <UserPosts userId={userId} />
      </Suspense>
    </div>
  )
}
```

### Progressive Loading with Multiple Boundaries

```typescript { .api }
function BlogPost({ postId }: { postId: number }) {
  // Load post data first
  const { data: post } = useSuspenseQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId)
  })

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
      
      {/* Load comments separately to avoid blocking post display */}
      <Suspense fallback={<div>Loading comments...</div>}>
        <Comments postId={postId} />
      </Suspense>
      
      {/* Load related posts separately */}
      <Suspense fallback={<div>Loading related posts...</div>}>
        <RelatedPosts categoryId={post.categoryId} />
      </Suspense>
    </article>
  )
}
```

### Error Boundaries with Suspense

```typescript { .api }
import { QueryErrorResetBoundary } from '@tanstack/react-query'

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div>
              <h2>Something went wrong:</h2>
              <pre>{error.message}</pre>
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

### Prefetching with Suspense

```typescript { .api }
function UsersList() {
  const { data: users } = useSuspenseQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  })

  const queryClient = useQueryClient()

  return (
    <div>
      {users.map(user => (
        <div
          key={user.id}
          onMouseEnter={() => {
            // Prefetch user details on hover
            queryClient.prefetchQuery({
              queryKey: ['user', user.id],
              queryFn: () => fetchUser(user.id),
              staleTime: 5 * 60 * 1000
            })
          }}
        >
          <Link to={`/users/${user.id}`}>
            {user.name}
          </Link>
        </div>
      ))}
    </div>
  )
}
```

### Conditional Suspense Queries

```typescript { .api }
function ConditionalData({ showDetails, userId }: { showDetails: boolean, userId: number }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })

  return (
    <div>
      <h2>{user.name}</h2>
      
      {showDetails && (
        <Suspense fallback={<div>Loading details...</div>}>
          <UserDetails userId={userId} />
        </Suspense>
      )}
    </div>
  )
}

function UserDetails({ userId }: { userId: number }) {
  const { data: details } = useSuspenseQuery({
    queryKey: ['user-details', userId],
    queryFn: () => fetchUserDetails(userId)
  })

  return (
    <div>
      <p>Bio: {details.bio}</p>
      <p>Location: {details.location}</p>
    </div>
  )
}
```

## Migration from Regular Hooks

### Before (useQuery)

```typescript { .api }
function UserProfile({ userId }: { userId: number }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!user) return null

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

### After (useSuspenseQuery)

```typescript { .api }
function UserProfile({ userId }: { userId: number }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })

  // No need for loading/error checks - handled by Suspense/ErrorBoundary
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

// Wrap in Suspense and ErrorBoundary at higher level
function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingFallback />}>
        <UserProfile userId={1} />
      </Suspense>
    </ErrorBoundary>
  )
}
```

The suspense integration hooks provide a declarative way to handle loading and error states at the boundary level, leading to cleaner component code and better user experience with coordinated loading states.