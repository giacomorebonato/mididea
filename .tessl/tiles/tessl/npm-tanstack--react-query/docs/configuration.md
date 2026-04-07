# Configuration Helpers

This document covers type-safe configuration helpers for creating enhanced query and mutation options in @tanstack/react-query.

## Overview

Configuration helpers provide type-safe ways to create query and mutation options with enhanced TypeScript inference. These helpers are particularly useful for creating reusable query configurations and ensuring proper type safety across your application.

## Query Configuration

### queryOptions

Creates type-safe query options with enhanced TypeScript data tagging for better type inference.

```typescript { .api }
function queryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  queryKey: TQueryKey
}
```

**Parameters:**
- `options`: `UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>` - Query configuration object

**Returns:** Enhanced query options with improved TypeScript inference

**Key Features:**
- Enhanced type inference for query data
- Type tagging for better IDE support
- Supports all standard query options
- Multiple overloads for different initial data scenarios

**Example:**
```typescript
import { queryOptions, useQuery } from '@tanstack/react-query'

// Define reusable query options
const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`)
      return response.json() as Promise<User>
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

// Use in components with full type safety
function UserProfile({ userId }: { userId: string }) {
  const options = userQueryOptions(userId)
  const { data: user } = useQuery(options)
  
  return <div>{user?.name}</div> // user is properly typed as User | undefined
}

// With defined initial data
const userWithInitialDataOptions = (userId: string, initialUser: User) =>
  queryOptions({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
    initialData: initialUser, // Ensures data is always defined
  })

function UserProfileWithInitialData({ userId, initialUser }: { 
  userId: string
  initialUser: User 
}) {
  const { data: user } = useQuery(
    userWithInitialDataOptions(userId, initialUser)
  )
  
  return <div>{user.name}</div> // user is typed as User (never undefined)
}

// Shared options across multiple components
export const postsQueryOptions = {
  all: () =>
    queryOptions({
      queryKey: ['posts'],
      queryFn: fetchAllPosts,
    }),
  
  byCategory: (category: string) =>
    queryOptions({
      queryKey: ['posts', { category }],
      queryFn: () => fetchPostsByCategory(category),
    }),
    
  byId: (postId: string) =>
    queryOptions({
      queryKey: ['posts', postId],
      queryFn: () => fetchPost(postId),
      staleTime: Infinity, // Posts don't change often
    }),
}
```

### infiniteQueryOptions

Creates type-safe infinite query options with enhanced TypeScript data tagging.

```typescript { .api }
function infiniteQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown
>(
  options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>
): UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & {
  queryKey: TQueryKey
}
```

**Parameters:**
- `options`: `UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>` - Infinite query configuration

**Returns:** Enhanced infinite query options with improved TypeScript inference

**Key Features:**
- Type-safe pagination parameter handling
- Enhanced inference for page data structure
- Support for both forward and backward pagination
- Type tagging for better IDE support

**Example:**
```typescript
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

// Reusable infinite query options
const postsInfiniteOptions = (category?: string) =>
  infiniteQueryOptions({
    queryKey: ['posts', 'infinite', { category }],
    queryFn: ({ pageParam = 0 }) => 
      fetchPosts({ 
        page: pageParam, 
        category,
        limit: 10 
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined
    },
    getPreviousPageParam: (firstPage, allPages) => {
      return allPages.length > 1 ? 0 : undefined
    },
    initialPageParam: 0,
  })

function InfinitePostsList({ category }: { category?: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(postsInfiniteOptions(category))

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}
      
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}

// Cursor-based pagination
const cursorBasedPostsOptions = () =>
  infiniteQueryOptions({
    queryKey: ['posts', 'cursor-based'],
    queryFn: ({ pageParam }) => 
      fetchPostsWithCursor({ cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  })

// Bidirectional infinite queries
const bidirectionalMessagesOptions = (channelId: string) =>
  infiniteQueryOptions({
    queryKey: ['messages', channelId],
    queryFn: ({ pageParam = { direction: 'newer', cursor: null } }) =>
      fetchMessages(channelId, pageParam),
    getNextPageParam: (lastPage) => ({
      direction: 'newer' as const,
      cursor: lastPage.newestCursor,
    }),
    getPreviousPageParam: (firstPage) => ({
      direction: 'older' as const,
      cursor: firstPage.oldestCursor,
    }),
    initialPageParam: { direction: 'newer' as const, cursor: null },
  })
```

## Mutation Configuration

### mutationOptions

Creates type-safe mutation options for consistent mutation configuration.

```typescript { .api }
function mutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationOptions<TData, TError, TVariables, TContext>
```

**Parameters:**
- `options`: `UseMutationOptions<TData, TError, TVariables, TContext>` - Mutation configuration object

**Returns:** Same mutation options object with enhanced type safety

**Key Features:**
- Type-safe mutation variable handling
- Enhanced context typing for optimistic updates
- Support for both keyed and unkeyed mutations
- Consistent error handling patterns

**Example:**
```typescript
import { mutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'

// Define reusable mutation options
const createUserMutationOptions = () =>
  mutationOptions({
    mutationFn: async (userData: CreateUserRequest) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
      return response.json() as Promise<User>
    },
    onSuccess: (newUser, variables, context) => {
      // newUser is typed as User
      // variables is typed as CreateUserRequest
      console.log('User created:', newUser.name)
    },
    onError: (error, variables, context) => {
      // Error handling with proper typing
      console.error('Failed to create user:', error.message)
    },
  })

function CreateUserForm() {
  const createUserMutation = useMutation(createUserMutationOptions())

  const handleSubmit = (userData: CreateUserRequest) => {
    createUserMutation.mutate(userData)
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleSubmit({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
      })
    }}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button 
        type="submit" 
        disabled={createUserMutation.isPending}
      >
        {createUserMutation.isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  )
}

// Mutation with optimistic updates
const updateUserMutationOptions = () => {
  const queryClient = useQueryClient()
  
  return mutationOptions({
    mutationKey: ['updateUser'],
    mutationFn: async ({ userId, updates }: {
      userId: string
      updates: Partial<User>
    }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      return response.json() as Promise<User>
    },
    
    // Optimistic update
    onMutate: async ({ userId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['users', userId] })
      
      const previousUser = queryClient.getQueryData(['users', userId])
      
      queryClient.setQueryData(['users', userId], (old: User) => ({
        ...old,
        ...updates,
      }))
      
      return { previousUser }
    },
    
    // Rollback on error
    onError: (error, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(
          ['users', variables.userId], 
          context.previousUser
        )
      }
    },
    
    // Refetch on success or error
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['users', variables.userId] 
      })
    },
  })
}

// Keyed mutations for tracking multiple instances
const deletePostMutationOptions = (postId: string) =>
  mutationOptions({
    mutationKey: ['deletePost', postId],
    mutationFn: async () => {
      await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      // Invalidate and refetch posts list
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

// Batch mutation options
const batchUpdateMutationOptions = () =>
  mutationOptions({
    mutationKey: ['batchUpdate'],
    mutationFn: async (updates: Array<{ id: string; data: Partial<User> }>) => {
      const promises = updates.map(({ id, data }) =>
        fetch(`/api/users/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(res => res.json())
      )
      return Promise.all(promises) as Promise<User[]>
    },
    onSuccess: (updatedUsers) => {
      // Update cache for each user
      updatedUsers.forEach(user => {
        queryClient.setQueryData(['users', user.id], user)
      })
    },
  })
```

## Advanced Configuration Patterns

### Factory Functions

Create configuration factories for common patterns:

```typescript
import { queryOptions, infiniteQueryOptions, mutationOptions } from '@tanstack/react-query'

// Generic CRUD query factory
function createCrudOptions<T>(resource: string) {
  return {
    list: () =>
      queryOptions({
        queryKey: [resource],
        queryFn: () => fetchResource<T[]>(`/api/${resource}`),
      }),
      
    byId: (id: string) =>
      queryOptions({
        queryKey: [resource, id],
        queryFn: () => fetchResource<T>(`/api/${resource}/${id}`),
      }),
      
    infinite: (filters?: Record<string, any>) =>
      infiniteQueryOptions({
        queryKey: [resource, 'infinite', filters],
        queryFn: ({ pageParam = 0 }) =>
          fetchResource<PaginatedResponse<T>>(`/api/${resource}`, {
            page: pageParam,
            ...filters,
          }),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 0,
      }),
      
    create: () =>
      mutationOptions({
        mutationFn: (data: Omit<T, 'id'>) =>
          postResource<T>(`/api/${resource}`, data),
      }),
      
    update: () =>
      mutationOptions({
        mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
          patchResource<T>(`/api/${resource}/${id}`, data),
      }),
      
    delete: () =>
      mutationOptions({
        mutationFn: (id: string) =>
          deleteResource(`/api/${resource}/${id}`),
      }),
  }
}

// Usage
const userOptions = createCrudOptions<User>('users')
const postOptions = createCrudOptions<Post>('posts')

// In components
const { data: users } = useQuery(userOptions.list())
const { data: user } = useQuery(userOptions.byId('123'))
const createUser = useMutation(userOptions.create())
```

### Configuration with Default Options

Set up default configurations for your application:

```typescript
// Define default options
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000,   // 10 minutes
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
}

const defaultMutationOptions = {
  retry: 1,
  retryDelay: 1000,
}

// Enhanced configuration helpers
const enhancedQueryOptions = <T extends UseQueryOptions>(options: T) =>
  queryOptions({
    ...defaultQueryOptions,
    ...options,
  })

const enhancedMutationOptions = <T extends UseMutationOptions>(options: T) =>
  mutationOptions({
    ...defaultMutationOptions,
    ...options,
  })

// Usage with defaults
const userQuery = enhancedQueryOptions({
  queryKey: ['users', '123'],
  queryFn: () => fetchUser('123'),
  // Inherits all default options
})
```

## Type Definitions

```typescript { .api }
interface UseQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> {
  queryKey: TQueryKey
  queryFn?: QueryFunction<TQueryFnData, TQueryKey>
  enabled?: boolean
  staleTime?: number
  gcTime?: number
  retry?: RetryValue<TError>
  retryDelay?: RetryDelayValue<TError>
  refetchOnMount?: boolean | 'always'
  refetchOnWindowFocus?: boolean | 'always'
  refetchOnReconnect?: boolean | 'always'
  refetchInterval?: number | false
  refetchIntervalInBackground?: boolean
  initialData?: TData | InitialDataFunction<TData>
  placeholderData?: TData | PlaceholderDataFunction<TData>
  select?: (data: TQueryFnData) => TData
  throwOnError?: ThrowOnError<TQueryFnData, TError, TData, TQueryKey>
  // ... additional options
}

interface UseInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown
> extends UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> {
  getNextPageParam: GetNextPageParamFunction<TQueryFnData, TPageParam>
  getPreviousPageParam?: GetPreviousPageParamFunction<TQueryFnData, TPageParam>
  initialPageParam: TPageParam
  maxPages?: number
}

interface UseMutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown
> {
  mutationKey?: MutationKey
  mutationFn?: MutationFunction<TData, TVariables>
  onMutate?: (variables: TVariables) => Promise<TContext | void> | TContext | void
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => Promise<unknown> | unknown
  onError?: (error: TError, variables: TVariables, context: TContext | undefined) => unknown
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: TContext | undefined) => unknown
  retry?: RetryValue<TError>
  retryDelay?: RetryDelayValue<TError>
  throwOnError?: ThrowOnError<TData, TError, TVariables, unknown>
  // ... additional options
}
```

## Best Practices

1. **Use configuration helpers** for better type safety and code reuse
2. **Create factory functions** for common resource patterns
3. **Set up default options** at the application level
4. **Type your data models** explicitly for better inference
5. **Use keyed mutations** when tracking multiple instances
6. **Implement optimistic updates** for better user experience
7. **Handle errors consistently** across your application

These configuration helpers provide the foundation for building type-safe, maintainable query and mutation logic in your React Query applications.