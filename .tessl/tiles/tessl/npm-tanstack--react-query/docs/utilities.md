# Utility Hooks and Functions

This document covers utility hooks for state inspection, prefetching, and restoration management in @tanstack/react-query.

## State Inspection Hooks

### useIsFetching

Tracks the number of queries currently in fetching state, with optional filtering.

```typescript { .api }
function useIsFetching(
  filters?: QueryFilters,
  queryClient?: QueryClient
): number
```

**Parameters:**
- `filters` (optional): `QueryFilters` - Filters to limit which queries to count
- `queryClient` (optional): `QueryClient` - Custom QueryClient instance

**Returns:** `number` - Count of currently fetching queries

**Example:**
```typescript
import { useIsFetching } from '@tanstack/react-query'

function LoadingIndicator() {
  const fetchingCount = useIsFetching()
  
  if (fetchingCount > 0) {
    return <div>Loading {fetchingCount} queries...</div>
  }
  
  return null
}

// With filters
function UserQueriesLoadingIndicator() {
  const userFetchingCount = useIsFetching({
    queryKey: ['users'],
    exact: false
  })
  
  return userFetchingCount > 0 ? <div>Loading user data...</div> : null
}
```

### useIsMutating

Tracks the number of mutations currently in pending state, with optional filtering.

```typescript { .api }
function useIsMutating(
  filters?: MutationFilters,
  queryClient?: QueryClient
): number
```

**Parameters:**
- `filters` (optional): `MutationFilters` - Filters to limit which mutations to count
- `queryClient` (optional): `QueryClient` - Custom QueryClient instance

**Returns:** `number` - Count of currently pending mutations

**Example:**
```typescript
import { useIsMutating } from '@tanstack/react-query'

function MutationLoadingIndicator() {
  const mutatingCount = useIsMutating()
  
  if (mutatingCount > 0) {
    return <div>Saving changes...</div>
  }
  
  return null
}

// With filters for specific mutation
function UserUpdateLoadingIndicator() {
  const isUpdatingUser = useIsMutating({
    mutationKey: ['updateUser']
  })
  
  return isUpdatingUser > 0 ? <div>Updating user...</div> : null
}
```

### useMutationState

Subscribes to the mutation cache and returns selected mutation states.

```typescript { .api }
function useMutationState<TResult = MutationState>(
  options?: {
    filters?: MutationFilters
    select?: (mutation: Mutation) => TResult
  },
  queryClient?: QueryClient
): Array<TResult>
```

**Parameters:**
- `options` (optional): Configuration object
  - `filters` (optional): `MutationFilters` - Filters for mutation selection
  - `select` (optional): `(mutation: Mutation) => TResult` - Transform function for each mutation
- `queryClient` (optional): `QueryClient` - Custom QueryClient instance

**Returns:** `Array<TResult>` - Array of selected/transformed mutation states

**Example:**
```typescript
import { useMutationState } from '@tanstack/react-query'

function PendingMutations() {
  const pendingMutations = useMutationState({
    filters: { status: 'pending' },
    select: (mutation) => ({
      mutationKey: mutation.options.mutationKey,
      submittedAt: mutation.state.submittedAt,
    })
  })

  return (
    <div>
      {pendingMutations.map((mutation, index) => (
        <div key={index}>
          Mutation {mutation.mutationKey?.join(' ')} pending since{' '}
          {new Date(mutation.submittedAt!).toLocaleTimeString()}
        </div>
      ))}
    </div>
  )
}

// Get all mutation variables for failed mutations
function FailedMutationData() {
  const failedVariables = useMutationState({
    filters: { status: 'error' },
    select: (mutation) => mutation.state.variables,
  })

  return <div>Failed mutations: {failedVariables.length}</div>
}
```

## Prefetch Hooks

### usePrefetchQuery

Prefetches a query during component render if it's not already in cache.

```typescript { .api }
function usePrefetchQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: UsePrefetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient
): void
```

**Parameters:**
- `options`: `UsePrefetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>` - Query configuration for prefetching
- `queryClient` (optional): `QueryClient` - Custom QueryClient instance

**Returns:** `void`

**Key Features:**
- Only prefetches if query is not already in cache
- Runs during component render phase
- Uses same options as regular queries but optimized for prefetching

**Example:**
```typescript
import { usePrefetchQuery } from '@tanstack/react-query'

function UserProfilePage({ userId }: { userId: string }) {
  // Prefetch user posts when viewing profile
  usePrefetchQuery({
    queryKey: ['users', userId, 'posts'],
    queryFn: () => fetchUserPosts(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Main profile query
  const { data: user } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
  })

  return (
    <div>
      <h1>{user?.name}</h1>
      {/* Posts will be instantly available when navigating to posts tab */}
    </div>
  )
}

// Conditional prefetching
function ConditionalPrefetch({ shouldPrefetch, userId }: { 
  shouldPrefetch: boolean
  userId: string 
}) {
  usePrefetchQuery({
    queryKey: ['users', userId, 'settings'],
    queryFn: () => fetchUserSettings(userId),
    enabled: shouldPrefetch, // Only prefetch when needed
  })

  return <div>Component content</div>
}
```

### usePrefetchInfiniteQuery

Prefetches an infinite query during component render if it's not already in cache.

```typescript { .api }
function usePrefetchInfiniteQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown
>(
  options: FetchInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
  queryClient?: QueryClient
): void
```

**Parameters:**
- `options`: `FetchInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>` - Infinite query configuration
- `queryClient` (optional): `QueryClient` - Custom QueryClient instance

**Returns:** `void`

**Key Features:**
- Prefetches only the first page by default
- Only runs if infinite query is not already in cache
- Useful for infinite lists that might be accessed soon

**Example:**
```typescript
import { usePrefetchInfiniteQuery } from '@tanstack/react-query'

function HomePage() {
  // Prefetch first page of user posts for instant loading
  usePrefetchInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    pages: 1, // Only prefetch first page
  })

  return (
    <div>
      <h1>Welcome</h1>
      <Link to="/posts">View Posts</Link> {/* Will load instantly */}
    </div>
  )
}

// Prefetch with initial page param
function CategoryPage({ categoryId }: { categoryId: string }) {
  usePrefetchInfiniteQuery({
    queryKey: ['posts', { category: categoryId }],
    queryFn: ({ pageParam = 0 }) => fetchPostsByCategory(categoryId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  })

  return <div>Category content</div>
}
```

## Restoration Management

### useIsRestoring

Indicates whether the app is currently in the hydration/restoration phase during SSR.

```typescript { .api }
function useIsRestoring(): boolean
```

**Returns:** `boolean` - `true` if currently restoring from server state, `false` otherwise

**Key Features:**
- Essential for SSR hydration scenarios
- Helps avoid hydration mismatches
- Used internally by suspense queries during hydration

**Example:**
```typescript
import { useIsRestoring } from '@tanstack/react-query'

function UserProfile() {
  const isRestoring = useIsRestoring()
  const { data: user, isPending } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  })

  // Show different loading state during hydration
  if (isRestoring) {
    return <div>Restoring user data...</div>
  }

  if (isPending) {
    return <div>Loading user...</div>
  }

  return <div>Welcome, {user.name}!</div>
}

// Conditional rendering during hydration
function ConditionalContent() {
  const isRestoring = useIsRestoring()
  
  // Don't render complex components during hydration
  if (isRestoring) {
    return <div>Loading app...</div>
  }
  
  return <ComplexInteractiveComponent />
}

// Custom hook for handling restoration state
function useHydrationSafeQuery(options: UseQueryOptions) {
  const isRestoring = useIsRestoring()
  
  return useQuery({
    ...options,
    enabled: !isRestoring && (options.enabled ?? true),
  })
}
```

## Type Definitions

```typescript { .api }
interface QueryFilters {
  queryKey?: QueryKey
  exact?: boolean
  type?: 'active' | 'inactive' | 'all'
  stale?: boolean
  fetchStatus?: FetchStatus
  predicate?: (query: Query) => boolean
}

interface MutationFilters {
  mutationKey?: MutationKey
  exact?: boolean
  status?: MutationStatus
  predicate?: (mutation: Mutation) => boolean
}

interface UsePrefetchQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> extends Omit<FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryFn'> {
  queryFn?: Exclude<
    FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>['queryFn'],
    SkipToken
  >
}
```

## Core Utility Functions

The following utility functions are available from the core query system for advanced use cases:

### hashKey

Generates a deterministic hash string from a query key for internal use.

```typescript { .api }
function hashKey(queryKey: QueryKey): string
```

**Parameters:**
- `queryKey`: `QueryKey` - The query key to hash

**Returns:** `string` - Deterministic hash string

**Example:**
```typescript
import { hashKey } from '@tanstack/react-query'

const key1 = ['users', { id: 1 }]
const key2 = ['users', { id: 1 }]
const hash1 = hashKey(key1)
const hash2 = hashKey(key2)

console.log(hash1 === hash2) // true - same content produces same hash
```

### matchQuery

Checks if a query matches the provided filters.

```typescript { .api }
function matchQuery(
  filters: QueryFilters,
  query: Query
): boolean
```

**Parameters:**
- `filters`: `QueryFilters` - The filters to match against
- `query`: `Query` - The query instance to check

**Returns:** `boolean` - Whether the query matches the filters

### matchMutation

Checks if a mutation matches the provided filters.

```typescript { .api }
function matchMutation(
  filters: MutationFilters,
  mutation: Mutation
): boolean
```

**Parameters:**
- `filters`: `MutationFilters` - The filters to match against
- `mutation`: `Mutation` - The mutation instance to check

**Returns:** `boolean` - Whether the mutation matches the filters

### keepPreviousData

Utility function to keep previous data during refetches, useful for pagination.

```typescript { .api }
function keepPreviousData<T>(
  previousData: T | undefined,
  previousQuery: Query | undefined
): T | undefined
```

**Parameters:**
- `previousData`: `T | undefined` - The previous query data
- `previousQuery`: `Query | undefined` - The previous query instance

**Returns:** `T | undefined` - The data to use during refetch

**Example:**
```typescript
import { useQuery, keepPreviousData } from '@tanstack/react-query'

function PaginatedPosts({ page }: { page: number }) {
  const { data, isPending, isPlaceholderData } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => fetchPosts(page),
    placeholderData: keepPreviousData,
  })

  return (
    <div>
      {data?.posts.map(post => <div key={post.id}>{post.title}</div>)}
      {isPending && !isPlaceholderData && <div>Loading...</div>}
      {isPlaceholderData && <div>Loading new page...</div>}
    </div>
  )
}
```

### skipToken

Special token that can be passed to queryFn to skip query execution.

```typescript { .api }
const skipToken: unique symbol
```

**Example:**
```typescript
import { useQuery, skipToken } from '@tanstack/react-query'

function ConditionalQuery({ userId, enabled }: { 
  userId: string | null
  enabled: boolean 
}) {
  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: enabled && userId ? () => fetchUser(userId) : skipToken,
  })

  return <div>{data?.name}</div>
}
```

### Error Utilities

#### CancelledError

Error class for cancelled query operations.

```typescript { .api }
class CancelledError extends Error {
  constructor(options?: { revert?: boolean })
}
```

#### isCancelledError

Utility to check if an error is a cancellation error.

```typescript { .api }
function isCancelledError(value: any): value is CancelledError
```

**Example:**
```typescript
import { useMutation, isCancelledError } from '@tanstack/react-query'

function UpdateUser() {
  const mutation = useMutation({
    mutationFn: updateUser,
    onError: (error) => {
      if (isCancelledError(error)) {
        console.log('Update was cancelled')
      } else {
        console.log('Update failed:', error.message)
      }
    }
  })
  
  return (
    <button onClick={() => mutation.mutate(userData)}>
      Update User
    </button>
  )
}
```

## Experimental APIs

### experimental_streamedQuery

**Experimental streaming query functionality for advanced use cases**

```typescript { .api }
const experimental_streamedQuery: unique symbol
```

⚠️ **Warning:** This is an experimental API that may change or be removed in future versions. Use with caution in production environments.

This experimental feature is designed for advanced streaming data scenarios and is subject to breaking changes. Refer to the official TanStack Query documentation for the latest information about experimental features.

## Error Handling

All utility hooks are designed to be safe and non-throwing:

- **State inspection hooks** return safe default values (0 for counts, empty arrays for collections)
- **Prefetch hooks** silently fail if queries cannot be prefetched
- **Restoration hooks** safely handle SSR/CSR transitions

**Common Error Scenarios:**
- Missing QueryClient context - hooks will use the default QueryClient or throw clear error messages
- Invalid filters - filters that don't match any queries simply return empty results
- Network failures during prefetch - silently ignored, main queries will handle errors when actually executed