# Mutations

Hooks for data modification with optimistic updates, error handling, and automatic query invalidation.

## useMutation

**Hook for creating, updating, or deleting data with optimistic updates and rollback capabilities**

```typescript { .api }
function useMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
  queryClient?: QueryClient,
): UseMutationResult<TData, TError, TVariables, TContext>
```

### Options

```typescript { .api }
interface UseMutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
> {
  mutationFn?: MutationFunction<TData, TVariables>
  mutationKey?: MutationKey
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext | void
  onError?: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined,
  ) => Promise<unknown> | unknown
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext | undefined,
  ) => Promise<unknown> | unknown
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext | undefined,
  ) => Promise<unknown> | unknown
  retry?: boolean | number | ((failureCount: number, error: TError) => boolean)
  retryDelay?: number | ((retryAttempt: number, error: TError) => number)
  networkMode?: 'online' | 'always' | 'offlineFirst'
  gcTime?: number
  meta?: Record<string, unknown>
}
```

### Result

```typescript { .api }
interface UseMutationResult<
  TData = unknown,
  TError = DefaultError,
  TVariables = unknown,
  TContext = unknown,
> {
  data: TData | undefined
  error: TError | null
  isError: boolean
  isIdle: boolean
  isPending: boolean
  isPaused: boolean
  isSuccess: boolean
  failureCount: number
  failureReason: TError | null
  mutate: (
    variables: TVariables,
    options?: {
      onSuccess?: (data: TData, variables: TVariables, context: TContext) => void
      onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void
      onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: TContext | undefined) => void
    }
  ) => void
  mutateAsync: (
    variables: TVariables,
    options?: {
      onSuccess?: (data: TData, variables: TVariables, context: TContext) => void
      onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void
      onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: TContext | undefined) => void
    }
  ) => Promise<TData>
  reset: () => void
  status: 'idle' | 'pending' | 'error' | 'success'
  submittedAt: number
  variables: TVariables | undefined
}
```

### Basic Usage

```typescript { .api }
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreatePostRequest {
  title: string
  content: string
}

interface Post {
  id: number
  title: string
  content: string
  createdAt: string
}

function CreatePostForm() {
  const queryClient = useQueryClient()
  
  const mutation = useMutation<Post, Error, CreatePostRequest>({
    mutationFn: async (newPost) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create post')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      // Or add the new post to existing cache
      queryClient.setQueryData(['posts'], (oldPosts: Post[]) => [...oldPosts, data])
    },
    onError: (error) => {
      console.error('Error creating post:', error.message)
    }
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    mutation.mutate({
      title: formData.get('title') as string,
      content: formData.get('content') as string
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Post title" required />
      <textarea name="content" placeholder="Post content" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
      
      {mutation.isError && (
        <div style={{ color: 'red' }}>
          Error: {mutation.error?.message}
        </div>
      )}
      
      {mutation.isSuccess && (
        <div style={{ color: 'green' }}>
          Post created successfully!
        </div>
      )}
    </form>
  )
}
```

### Optimistic Updates

```typescript { .api }
interface UpdatePostRequest {
  id: number
  title: string
  content: string
}

function useUpdatePost() {
  const queryClient = useQueryClient()
  
  return useMutation<Post, Error, UpdatePostRequest, { previousPost?: Post }>({
    mutationFn: async (updatedPost) => {
      const response = await fetch(`/api/posts/${updatedPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPost)
      })
      return response.json()
    },
    onMutate: async (updatedPost) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['post', updatedPost.id] })
      
      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<Post>(['post', updatedPost.id])
      
      // Optimistically update to the new value
      queryClient.setQueryData(['post', updatedPost.id], updatedPost)
      
      // Return a context object with the snapshotted value
      return { previousPost }
    },
    onError: (err, updatedPost, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousPost) {
        queryClient.setQueryData(['post', updatedPost.id], context.previousPost)
      }
    },
    onSettled: (data, error, updatedPost) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['post', updatedPost.id] })
    }
  })
}

function EditPostForm({ post }: { post: Post }) {
  const updateMutation = useUpdatePost()
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    updateMutation.mutate({
      id: post.id,
      title: formData.get('title') as string,
      content: formData.get('content') as string
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" defaultValue={post.title} />
      <textarea name="content" defaultValue={post.content} />
      <button type="submit" disabled={updateMutation.isPending}>
        Update Post
      </button>
    </form>
  )
}
```

### Async/Await Pattern

```typescript { .api }
function useCreatePost() {
  const queryClient = useQueryClient()
  
  return useMutation<Post, Error, CreatePostRequest>({
    mutationFn: async (newPost) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}

function CreatePostModal() {
  const [isOpen, setIsOpen] = useState(false)
  const createMutation = useCreatePost()

  const handleCreate = async (postData: CreatePostRequest) => {
    try {
      const newPost = await createMutation.mutateAsync(postData)
      console.log('Created post:', newPost)
      setIsOpen(false) // Close modal on success
    } catch (error) {
      console.error('Failed to create post:', error)
      // Error handling - modal stays open
    }
  }

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Create Post</button>
      {isOpen && (
        <Modal>
          <CreatePostForm 
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
          />
        </Modal>
      )}
    </div>
  )
}
```

### Global Mutation Handling

```typescript { .api }
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      // Global error handling
      console.error(`Mutation failed:`, error)
      
      // Show toast notification
      toast.error(`Operation failed: ${error.message}`)
    },
    onSuccess: (data, variables, context, mutation) => {
      // Global success handling
      if (mutation.options.meta?.successMessage) {
        toast.success(mutation.options.meta.successMessage)
      }
    }
  })
})

// Usage with meta
const mutation = useMutation({
  mutationFn: createPost,
  meta: {
    successMessage: 'Post created successfully!'
  }
})
```

## useMutationState

**Hook for accessing mutation state across components**

```typescript { .api }
function useMutationState<TResult = MutationState>(
  options?: {
    filters?: MutationFilters
    select?: (mutation: Mutation) => TResult
  },
  queryClient?: QueryClient,
): Array<TResult>
```

### Basic Usage

```typescript { .api }
// Monitor all pending mutations
function GlobalLoadingIndicator() {
  const pendingMutations = useMutationState({
    filters: { status: 'pending' }
  })

  if (pendingMutations.length === 0) return null

  return (
    <div className="loading-indicator">
      {pendingMutations.length} operation{pendingMutations.length > 1 ? 's' : ''} in progress...
    </div>
  )
}

// Monitor specific mutation types
function PostOperations() {
  const postMutations = useMutationState({
    filters: { mutationKey: ['posts'] },
    select: (mutation) => ({
      status: mutation.state.status,
      variables: mutation.state.variables,
      error: mutation.state.error,
      submittedAt: mutation.state.submittedAt
    })
  })

  return (
    <div>
      <h3>Post Operations</h3>
      {postMutations.map((mutation, index) => (
        <div key={index}>
          Status: {mutation.status}
          {mutation.error && <span> - Error: {mutation.error.message}</span>}
        </div>
      ))}
    </div>
  )
}
```

### Advanced State Selection

```typescript { .api }
function MutationHistory() {
  const recentMutations = useMutationState({
    select: (mutation) => ({
      id: mutation.mutationId,
      key: mutation.options.mutationKey?.[0] || 'unknown',
      status: mutation.state.status,
      submittedAt: mutation.state.submittedAt,
      variables: mutation.state.variables,
      error: mutation.state.error?.message
    })
  })

  const sortedMutations = recentMutations
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .slice(0, 10) // Last 10 mutations

  return (
    <div>
      <h3>Recent Operations</h3>
      {sortedMutations.map((mutation) => (
        <div key={mutation.id} className={`mutation-${mutation.status}`}>
          <strong>{mutation.key}</strong> - {mutation.status}
          <small>{new Date(mutation.submittedAt).toLocaleTimeString()}</small>
          {mutation.error && <div className="error">{mutation.error}</div>}
        </div>
      ))}
    </div>
  )
}
```

## useIsMutating

**Hook for tracking the number of mutations currently in a pending state**

```typescript { .api }
function useIsMutating(
  filters?: MutationFilters,
  queryClient?: QueryClient,
): number
```

### Basic Usage

```typescript { .api }
function App() {
  const isMutating = useIsMutating()

  return (
    <div>
      {isMutating > 0 && (
        <div className="global-loading-bar">
          Saving changes... ({isMutating} operations)
        </div>
      )}
      <Router>
        {/* App content */}
      </Router>
    </div>
  )
}

// Track specific mutation types
function PostsSection() {
  const isPostMutating = useIsMutating({ mutationKey: ['posts'] })

  return (
    <div>
      <h2>Posts {isPostMutating > 0 && '(Saving...)'}</h2>
      <PostsList />
    </div>
  )
}
```

### With Filters

```typescript { .api }
function UserDashboard({ userId }: { userId: number }) {
  // Track mutations for this specific user
  const userMutationsCount = useIsMutating({
    mutationKey: ['user', userId]
  })

  // Track all create operations
  const createMutationsCount = useIsMutating({
    predicate: (mutation) => 
      mutation.options.mutationKey?.[1] === 'create'
  })

  return (
    <div>
      <h1>User Dashboard</h1>
      {userMutationsCount > 0 && (
        <div>Updating user data...</div>
      )}
      {createMutationsCount > 0 && (
        <div>Creating {createMutationsCount} new items...</div>
      )}
      {/* Dashboard content */}
    </div>
  )
}
```

## Mutation Patterns

### Sequential Mutations

```typescript { .api }
function useCreateUserWithProfile() {
  const queryClient = useQueryClient()
  
  const createUser = useMutation({
    mutationFn: (userData: CreateUserRequest) => 
      fetch('/api/users', { 
        method: 'POST', 
        body: JSON.stringify(userData) 
      }).then(res => res.json())
  })
  
  const createProfile = useMutation({
    mutationFn: ({ userId, profileData }: { userId: number, profileData: any }) =>
      fetch(`/api/users/${userId}/profile`, {
        method: 'POST',
        body: JSON.stringify(profileData)
      }).then(res => res.json())
  })

  const createUserWithProfile = async (userData: CreateUserRequest, profileData: any) => {
    try {
      const user = await createUser.mutateAsync(userData)
      const profile = await createProfile.mutateAsync({ 
        userId: user.id, 
        profileData 
      })
      
      queryClient.invalidateQueries({ queryKey: ['users'] })
      return { user, profile }
    } catch (error) {
      throw error
    }
  }

  return {
    createUserWithProfile,
    isLoading: createUser.isPending || createProfile.isPending,
    error: createUser.error || createProfile.error
  }
}
```

### Dependent Mutations

```typescript { .api }
function usePublishPost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ postId }: { postId: number }) => {
      // First validate the post
      const validation = await fetch(`/api/posts/${postId}/validate`, {
        method: 'POST'
      }).then(res => res.json())
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }
      
      // Then publish
      return fetch(`/api/posts/${postId}/publish`, {
        method: 'POST'
      }).then(res => res.json())
    },
    onSuccess: (data, variables) => {
      // Update the post in cache
      queryClient.setQueryData(['post', variables.postId], data)
      // Invalidate posts list
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}
```

### Batch Operations

```typescript { .api }
function useBatchDeletePosts() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (postIds: number[]) => {
      // Delete posts in batches of 10
      const batches = []
      for (let i = 0; i < postIds.length; i += 10) {
        const batch = postIds.slice(i, i + 10)
        batches.push(
          fetch('/api/posts/batch-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: batch })
          }).then(res => res.json())
        )
      }
      
      return Promise.all(batches)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}

function PostsManager() {
  const [selectedPosts, setSelectedPosts] = useState<number[]>([])
  const batchDelete = useBatchDeletePosts()

  const handleBatchDelete = () => {
    batchDelete.mutate(selectedPosts, {
      onSuccess: () => {
        setSelectedPosts([])
      }
    })
  }

  return (
    <div>
      {selectedPosts.length > 0 && (
        <button 
          onClick={handleBatchDelete}
          disabled={batchDelete.isPending}
        >
          Delete {selectedPosts.length} posts
        </button>
      )}
      {/* Posts list with selection */}
    </div>
  )
}
```

### Error Recovery

```typescript { .api }
function useCreatePostWithRetry() {
  return useMutation({
    mutationFn: createPost,
    retry: (failureCount, error) => {
      // Retry network errors up to 3 times
      if (error.name === 'NetworkError' && failureCount < 3) {
        return true
      }
      // Don't retry validation errors
      if (error.status === 400) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}
```

Mutations in React Query provide powerful data modification capabilities with built-in optimistic updates, error handling, and automatic cache management, making it easy to build responsive and reliable user interfaces.