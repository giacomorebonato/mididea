# @tanstack/react-query

**Hooks for managing, caching and syncing asynchronous and remote data in React**

## Package Information

- **Package:** `@tanstack/react-query`
- **Version:** 5.87.1
- **License:** MIT
- **Documentation:** https://tanstack.com/query
- **Repository:** https://github.com/tanstack/query

TanStack React Query is a comprehensive React hooks library for managing asynchronous state and remote data fetching. It provides powerful caching and synchronization capabilities with automatic refetching strategies, parallel and dependent queries, mutations with reactive query refetching, multi-layer caching with automatic garbage collection, and advanced features like infinite scroll queries, request cancellation, and React Suspense integration.

## Core Imports

```typescript { .api }
// Essential hooks for data fetching
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueries
} from '@tanstack/react-query'

// Provider and context
import {
  QueryClient,
  QueryClientProvider,
  QueryClientContext,
  useQueryClient
} from '@tanstack/react-query'

// Suspense-enabled hooks
import {
  useSuspenseQuery,
  useSuspenseInfiniteQuery,
  useSuspenseQueries
} from '@tanstack/react-query'

// Utility hooks and state management
import {
  useIsFetching,
  useIsMutating,
  useMutationState,
  useQueryErrorResetBoundary,
  useIsRestoring,
  usePrefetchQuery,
  usePrefetchInfiniteQuery
} from '@tanstack/react-query'

// Configuration helpers
import {
  queryOptions,
  infiniteQueryOptions,
  mutationOptions
} from '@tanstack/react-query'

// Components and providers
import {
  HydrationBoundary,
  QueryErrorResetBoundary,
  IsRestoringProvider
} from '@tanstack/react-query'

// Core utility functions
import {
  hashKey,
  matchQuery,
  matchMutation,
  keepPreviousData,
  skipToken,
  CancelledError,
  isCancelledError
} from '@tanstack/react-query'

// Core management classes
import {
  QueryCache,
  MutationCache,
  QueryObserver,
  InfiniteQueryObserver,
  MutationObserver,
  QueriesObserver
} from '@tanstack/react-query'

// Manager singletons
import {
  focusManager,
  onlineManager,
  notifyManager
} from '@tanstack/react-query'

// Hydration utilities
import {
  dehydrate,
  hydrate,
  defaultShouldDehydrateQuery,
  defaultShouldDehydrateMutation
} from '@tanstack/react-query'

// Core data classes
import {
  Query,
  Mutation
} from '@tanstack/react-query'
```

## Basic Usage

### Setting Up the Provider

```typescript { .api }
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
    </QueryClientProvider>
  )
}
```

### Basic Query

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
    error
  } = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      return response.json()
    }
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

### Basic Mutation

```typescript { .api }
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreateUserRequest {
  name: string
  email: string
}

function CreateUserForm() {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: async (newUser: CreateUserRequest) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    mutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create User'}
      </button>
      {mutation.error && (
        <div>Error: {mutation.error.message}</div>
      )}
    </form>
  )
}
```

### Infinite Query for Pagination

```typescript { .api }
import { useInfiniteQuery } from '@tanstack/react-query'

interface UsersPage {
  users: User[]
  nextCursor?: number
}

function UsersList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery<UsersPage>({
    queryKey: ['users'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/users?cursor=${pageParam}`)
      return response.json()
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.users.map((user) => (
            <div key={user.id}>{user.name}</div>
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

## API Documentation

This package provides an extensive API with 74+ distinct functions, hooks, and components. The documentation is organized into focused sections:

### [Core Query Hooks](./core-query-hooks.md)
The foundation of data fetching with caching, background updates, and error handling:
- **`useQuery`** - Primary hook for fetching and caching data
- **`useInfiniteQuery`** - Hook for paginated/infinite scroll data
- **`useQueries`** - Hook for parallel query execution

### [Suspense Integration](./suspense-integration.md)
React Suspense-compatible versions of query hooks:
- **`useSuspenseQuery`** - Suspense-enabled data fetching
- **`useSuspenseInfiniteQuery`** - Suspense-enabled infinite queries  
- **`useSuspenseQueries`** - Suspense-enabled parallel queries

### [Mutations](./mutations.md)
Hooks for data modification with optimistic updates and error handling:
- **`useMutation`** - Hook for creating, updating, or deleting data
- **`useMutationState`** - Hook for accessing mutation state across components
- **`useIsMutating`** - Hook for tracking pending mutations

### [Provider & Context System](./providers-context.md)
Components and hooks for managing the QueryClient context:
- **`QueryClientProvider`** - Provider component for QueryClient context
- **`useQueryClient`** - Hook to access the current QueryClient
- **`HydrationBoundary`** - Component for SSR hydration
- **`QueryErrorResetBoundary`** - Component for error boundary functionality

### [Utility Hooks & Functions](./utilities.md)
Helper hooks and utilities for advanced query management:
- **`useIsFetching`** - Track number of queries currently fetching
- **`useIsRestoring`** - Check if queries are being restored from server state
- **`usePrefetchQuery`** - Prefetch queries before they're needed
- **`usePrefetchInfiniteQuery`** - Prefetch infinite queries

### [Configuration & Options](./configuration.md)
Type-safe configuration helpers and option builders:
- **`queryOptions`** - Helper for creating type-safe query configurations
- **`infiniteQueryOptions`** - Helper for infinite query configurations
- **`mutationOptions`** - Helper for mutation configurations

## Key Features

### Automatic Caching & Background Updates
```typescript { .api }
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000,   // 10 minutes
  refetchOnWindowFocus: true,
  refetchOnReconnect: true
})
```

### Optimistic Updates
```typescript { .api }
const mutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (newPost) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['posts'] })
    
    // Snapshot previous value
    const previousPosts = queryClient.getQueryData(['posts'])
    
    // Optimistically update
    queryClient.setQueryData(['posts'], (old) => [...old, newPost])
    
    return { previousPosts }
  },
  onError: (err, newPost, context) => {
    // Rollback on error
    queryClient.setQueryData(['posts'], context.previousPosts)
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  }
})
```

### Parallel Queries
```typescript { .api }
const results = useQueries({
  queries: [
    { queryKey: ['users'], queryFn: fetchUsers },
    { queryKey: ['posts'], queryFn: fetchPosts },
    { queryKey: ['comments'], queryFn: fetchComments }
  ],
  combine: (results) => ({
    data: results.map(result => result.data),
    pending: results.some(result => result.isPending)
  })
})
```

### Dependent Queries
```typescript { .api }
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId)
})

const { data: posts } = useQuery({
  queryKey: ['posts', user?.id],
  queryFn: () => fetchUserPosts(user.id),
  enabled: !!user?.id // Only run when user is loaded
})
```

## TypeScript Support

The package is built with TypeScript and provides comprehensive type safety:

```typescript { .api }
// Generic type parameters for complete type safety
const { data } = useQuery<
  PostsResponse,    // TQueryFnData - what the query function returns
  Error,            // TError - error type
  Post[],           // TData - final transformed data type  
  ['posts', string] // TQueryKey - query key tuple type
>({
  queryKey: ['posts', filter],
  queryFn: async ({ queryKey }) => {
    const [, filterValue] = queryKey // Fully typed query key access
    return fetchPosts(filterValue)
  },
  select: (data) => data.posts // Transform response to Post[]
})
```

## Error Handling

```typescript { .api }
const { data, error, isError } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  throwOnError: false, // Handle errors in component instead of error boundary
  retry: (failureCount, error) => {
    // Custom retry logic
    if (error.status === 404) return false
    return failureCount < 3
  }
})

if (isError) {
  return <div>Error: {error.message}</div>
}
```

## Server-Side Rendering (SSR)

```typescript { .api }
// Server-side
import { QueryClient, dehydrate } from '@tanstack/react-query'

const queryClient = new QueryClient()
await queryClient.prefetchQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts
})

// Pass dehydrated state to client
const dehydratedState = dehydrate(queryClient)

// Client-side
function App({ dehydratedState }) {
  const queryClient = new QueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <Posts />
      </HydrationBoundary>
    </QueryClientProvider>
  )
}
```

## Performance & Best Practices

### Query Key Management
```typescript { .api }
// Use query key factories for consistency
const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: string) => [...postKeys.lists(), { filters }] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const
}

// Usage
const { data } = useQuery({
  queryKey: postKeys.detail(postId),
  queryFn: () => fetchPost(postId)
})
```

### Request Deduplication
Multiple components calling the same query simultaneously will share the same network request automatically.

### Garbage Collection
Unused query data is automatically garbage collected based on `gcTime` (default 5 minutes).

### Background Updates
Queries automatically refetch in the background when:
- Window regains focus
- Network reconnects  
- Query becomes stale
- Manual invalidation occurs

This documentation provides comprehensive coverage of TanStack React Query's capabilities for building robust, performant React applications with powerful data fetching and state management.