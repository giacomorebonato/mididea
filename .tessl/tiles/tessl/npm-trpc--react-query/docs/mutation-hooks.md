# Mutation Hooks

React hooks for data modifications with optimistic updates, error handling, and automatic cache invalidation. These hooks are automatically generated for each mutation procedure in your tRPC router.

## Capabilities

### useMutation

Primary hook for data mutations with comprehensive state management and lifecycle callbacks.

```typescript { .api }
/**
 * Hook for performing data mutations through tRPC mutation procedures
 * @param opts - Mutation configuration options including callbacks and settings
 * @returns Mutation result with mutate functions, loading states, and error information
 */
procedure.useMutation<TContext = unknown>(
  opts?: UseTRPCMutationOptions<TInput, TError, TOutput, TContext>
): UseTRPCMutationResult<TOutput, TError, TInput, TContext>;

interface UseTRPCMutationOptions<TInput, TError, TOutput, TContext = unknown>
  extends Omit<UseMutationOptions<TOutput, TError, TInput, TContext>, 'mutationFn'> {
  trpc?: TRPCReactRequestOptions;
}

interface UseTRPCMutationResult<TOutput, TError, TInput, TContext>
  extends UseMutationResult<TOutput, TError, TInput, TContext> {
  trpc: TRPCHookResult;
}
```

**Usage Examples:**

```typescript
import { trpc } from "./utils/trpc";

function CreateUserForm() {
  const utils = trpc.useUtils();
  
  const createUser = trpc.user.create.useMutation({
    onSuccess: (newUser) => {
      console.log("User created:", newUser);
      // Invalidate and refetch user list
      utils.user.list.invalidate();
    },
    onError: (error) => {
      console.error("Failed to create user:", error.message);
    },
  });

  const handleSubmit = (formData: { name: string; email: string }) => {
    createUser.mutate(formData);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSubmit({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
      });
    }}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button 
        type="submit" 
        disabled={createUser.isPending}
      >
        {createUser.isPending ? "Creating..." : "Create User"}
      </button>
      {createUser.error && (
        <div>Error: {createUser.error.message}</div>
      )}
    </form>
  );
}
```

### Optimistic Updates

Implement optimistic updates to improve user experience by updating the UI immediately before the server responds.

```typescript { .api }
// Optimistic update pattern using onMutate callback
interface OptimisticUpdateOptions<TInput, TOutput, TContext> {
  onMutate?: (variables: TInput) => Promise<TContext> | TContext;
  onError?: (error: TError, variables: TInput, context: TContext | undefined) => void;
  onSettled?: (data: TOutput | undefined, error: TError | null, variables: TInput, context: TContext | undefined) => void;
}
```

**Usage Examples:**

```typescript
function OptimisticUserUpdate({ userId }: { userId: number }) {
  const utils = trpc.useUtils();
  
  const updateUser = trpc.user.update.useMutation({
    onMutate: async (updateData) => {
      // Cancel outgoing refetches
      await utils.user.get.cancel({ id: userId });
      
      // Get current data
      const previousUser = utils.user.get.getData({ id: userId });
      
      // Optimistically update the cache
      utils.user.get.setData(
        { id: userId },
        (old) => old ? { ...old, ...updateData } : undefined
      );
      
      // Return context with previous data for rollback
      return { previousUser };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        utils.user.get.setData({ id: userId }, context.previousUser);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      utils.user.get.invalidate({ id: userId });
    },
  });

  const handleUpdate = (data: { name: string }) => {
    updateUser.mutate({ id: userId, ...data });
  };

  return (
    <button onClick={() => handleUpdate({ name: "New Name" })}>
      Update User
    </button>
  );
}
```

### Mutation State Management

Access comprehensive mutation state information for UI feedback.

```typescript { .api }
interface UseTRPCMutationResult<TOutput, TError, TInput, TContext> {
  // Data and state
  data: TOutput | undefined;
  error: TError | null;
  isPending: boolean;
  isIdle: boolean;
  isSuccess: boolean;
  isError: boolean;
  
  // Mutation functions
  mutate: (variables: TInput, options?: MutateOptions<TOutput, TError, TInput, TContext>) => void;
  mutateAsync: (variables: TInput, options?: MutateOptions<TOutput, TError, TInput, TContext>) => Promise<TOutput>;
  
  // Reset function
  reset: () => void;
  
  // Status information
  status: 'idle' | 'pending' | 'error' | 'success';
  submittedAt: number;
  
  // tRPC specific
  trpc: TRPCHookResult;
}
```

**Usage Examples:**

```typescript
function MutationStatusExample() {
  const deleteUser = trpc.user.delete.useMutation();

  const handleDelete = async (userId: number) => {
    try {
      await deleteUser.mutateAsync({ id: userId });
      alert("User deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div>
      <button 
        onClick={() => handleDelete(1)}
        disabled={deleteUser.isPending}
      >
        Delete User
      </button>
      
      {/* Status indicators */}
      {deleteUser.isPending && <div>Deleting...</div>}
      {deleteUser.isError && (
        <div>Error: {deleteUser.error?.message}</div>
      )}
      {deleteUser.isSuccess && (
        <div>User deleted successfully!</div>
      )}
      
      {/* Reset mutation state */}
      {(deleteUser.isError || deleteUser.isSuccess) && (
        <button onClick={() => deleteUser.reset()}>
          Reset
        </button>
      )}
    </div>
  );
}
```

### Batch Mutations

Handle multiple related mutations with proper error handling and state management.

```typescript
function BatchMutationExample() {
  const utils = trpc.useUtils();
  const createUser = trpc.user.create.useMutation();
  const updateSettings = trpc.settings.update.useMutation();

  const handleBatchOperation = async () => {
    try {
      // Perform mutations sequentially
      const newUser = await createUser.mutateAsync({
        name: "John Doe",
        email: "john@example.com",
      });
      
      await updateSettings.mutateAsync({
        userId: newUser.id,
        theme: "dark",
      });
      
      // Invalidate related queries
      utils.user.list.invalidate();
      utils.settings.get.invalidate();
      
      alert("Batch operation completed successfully");
    } catch (error) {
      console.error("Batch operation failed:", error);
    }
  };

  const isLoading = createUser.isPending || updateSettings.isPending;

  return (
    <button onClick={handleBatchOperation} disabled={isLoading}>
      {isLoading ? "Processing..." : "Create User & Settings"}
    </button>
  );
}
```

### File Upload Mutations

Handle file uploads and form data through tRPC mutations.

```typescript
function FileUploadExample() {
  const uploadAvatar = trpc.user.uploadAvatar.useMutation({
    onSuccess: (result) => {
      console.log("Upload successful:", result.url);
    },
    onError: (error) => {
      console.error("Upload failed:", error.message);
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', '123');

    uploadAvatar.mutate(formData);
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileUpload}
        accept="image/*"
        disabled={uploadAvatar.isPending}
      />
      {uploadAvatar.isPending && <div>Uploading...</div>}
      {uploadAvatar.data && (
        <img src={uploadAvatar.data.url} alt="Uploaded avatar" />
      )}
    </div>
  );
}
```

### Global Mutation Settings

Configure global mutation behavior through the mutation overrides system.

```typescript
// In your tRPC setup
const trpc = createTRPCReact<AppRouter>({
  overrides: {
    useMutation: {
      onSuccess: ({ originalFn }) => {
        // Global success handler
        console.log("Mutation succeeded globally");
        
        // Call the original success handler
        originalFn();
        
        // Add global success behavior
        showSuccessToast("Operation completed successfully");
      },
    },
  },
});

function showSuccessToast(message: string) {
  // Your toast implementation
  console.log("Toast:", message);
}
```

## Common Patterns

### Loading States

```typescript
function LoadingStateExample() {
  const mutation = trpc.user.create.useMutation();

  return (
    <button 
      onClick={() => mutation.mutate({ name: "Test" })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? (
        <>
          <Spinner /> Creating...
        </>
      ) : (
        "Create User"
      )}
    </button>
  );
}
```

### Error Boundaries

```typescript
function MutationWithErrorBoundary() {
  const mutation = trpc.user.create.useMutation({
    onError: (error) => {
      // Log error for debugging
      console.error("Mutation error:", error);
      
      // Report to error tracking service
      errorService.report(error);
    },
  });

  return (
    <button onClick={() => mutation.mutate({ name: "Test" })}>
      Create User
    </button>
  );
}
```

### Cache Invalidation Patterns

```typescript
function CacheInvalidationExample() {
  const utils = trpc.useUtils();
  
  const createPost = trpc.post.create.useMutation({
    onSuccess: () => {
      // Invalidate all post queries
      utils.post.invalidate();
      
      // Invalidate specific user's posts
      utils.post.byUser.invalidate({ userId: currentUserId });
      
      // Refetch specific query
      utils.post.list.refetch();
    },
  });

  return (
    <button onClick={() => createPost.mutate({ title: "New Post" })}>
      Create Post
    </button>
  );
}