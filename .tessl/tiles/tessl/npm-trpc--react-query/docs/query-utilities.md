# Query Utilities

Comprehensive utility functions for imperative query operations and cache management. These utilities are accessed through the `useUtils()` hook and provide programmatic control over React Query's cache and data fetching.

## Capabilities

### useUtils Hook

Primary hook for accessing query utilities and cache management functions.

```typescript { .api }
/**
 * Hook that provides access to query utilities for imperative operations
 * @returns Object with utility functions mirroring your router structure
 */
function useUtils(): CreateReactUtils<TRouter, TSSRContext>;

// Legacy alias (deprecated)
function useContext(): CreateReactUtils<TRouter, TSSRContext>;

interface CreateReactUtils<TRouter, TSSRContext> {
  // Utility functions are generated based on your router structure
  // Each procedure gets a set of utility methods
}
```

**Usage Examples:**

```typescript
import { trpc } from "./utils/trpc";

function UserManagement() {
  const utils = trpc.useUtils();

  const handleRefreshUser = (userId: number) => {
    // Refetch specific user data
    utils.user.get.refetch({ id: userId });
  };

  const handleInvalidateUsers = () => {
    // Invalidate all user-related queries
    utils.user.invalidate();
  };

  return (
    <div>
      <button onClick={() => handleRefreshUser(1)}>
        Refresh User 1
      </button>
      <button onClick={handleInvalidateUsers}>
        Refresh All User Data
      </button>
    </div>
  );
}
```

### Query Invalidation

Invalidate cached queries to trigger refetching when data may be stale.

```typescript { .api }
/**
 * Invalidate queries to trigger refetching
 * @param input - Optional input to target specific queries
 * @param opts - Invalidation options
 * @returns Promise that resolves when invalidation is complete
 */
procedure.invalidate(
  input?: GetQueryProcedureInput<TInput>,
  opts?: InvalidateQueryFilters & RefetchOptions
): Promise<void>;

interface InvalidateQueryFilters {
  type?: QueryType;
  exact?: boolean;
  predicate?: (query: Query) => boolean;
}
```

**Usage Examples:**

```typescript
function InvalidationExamples() {
  const utils = trpc.useUtils();

  const invalidateExamples = {
    // Invalidate all user queries
    invalidateAllUsers: () => utils.user.invalidate(),
    
    // Invalidate specific user query
    invalidateSpecificUser: (userId: number) => 
      utils.user.get.invalidate({ id: userId }),
    
    // Invalidate with options
    invalidateWithOptions: () => 
      utils.user.list.invalidate(undefined, {
        type: 'active', // Only invalidate active queries
        refetchType: 'active',
      }),
    
    // Invalidate multiple related queries
    invalidateUserData: async (userId: number) => {
      await Promise.all([
        utils.user.get.invalidate({ id: userId }),
        utils.user.posts.invalidate({ userId }),
        utils.user.settings.invalidate({ userId }),
      ]);
    },
  };

  return (
    <div>
      <button onClick={invalidateExamples.invalidateAllUsers}>
        Invalidate All Users
      </button>
      <button onClick={() => invalidateExamples.invalidateSpecificUser(1)}>
        Invalidate User 1
      </button>
    </div>
  );
}
```

### Query Refetching

Explicitly refetch queries to get fresh data from the server.

```typescript { .api }
/**
 * Refetch queries to get fresh data
 * @param input - Optional input to target specific queries
 * @param opts - Refetch options
 * @returns Promise that resolves when refetch is complete
 */
procedure.refetch(
  input?: GetQueryProcedureInput<TInput>,
  opts?: RefetchOptions
): Promise<void>;

interface RefetchOptions {
  type?: 'active' | 'inactive' | 'all';
  cancelRefetch?: boolean;
}
```

**Usage Examples:**

```typescript
function RefetchExamples() {
  const utils = trpc.useUtils();

  const refetchExamples = {
    // Refetch all user queries
    refetchAllUsers: () => utils.user.refetch(),
    
    // Refetch specific user
    refetchSpecificUser: (userId: number) => 
      utils.user.get.refetch({ id: userId }),
    
    // Refetch with options
    refetchActive: () => 
      utils.user.list.refetch(undefined, { type: 'active' }),
    
    // Conditional refetch
    conditionalRefetch: async (userId: number) => {
      const userData = utils.user.get.getData({ id: userId });
      if (!userData || isStale(userData)) {
        await utils.user.get.refetch({ id: userId });
      }
    },
  };

  return (
    <div>
      <button onClick={refetchExamples.refetchAllUsers}>
        Refetch All Users
      </button>
      <button onClick={() => refetchExamples.refetchSpecificUser(1)}>
        Refetch User 1
      </button>
    </div>
  );
}
```

### Query Cancellation

Cancel in-flight queries to prevent unnecessary network requests.

```typescript { .api }
/**
 * Cancel in-flight queries
 * @param input - Optional input to target specific queries
 * @returns Promise that resolves when cancellation is complete
 */
procedure.cancel(
  input?: GetQueryProcedureInput<TInput>
): Promise<void>;
```

**Usage Examples:**

```typescript
function CancellationExamples() {
  const utils = trpc.useUtils();

  const cancelExamples = {
    // Cancel all user queries
    cancelAllUserQueries: () => utils.user.cancel(),
    
    // Cancel specific user query
    cancelSpecificUser: (userId: number) => 
      utils.user.get.cancel({ id: userId }),
    
    // Cancel before new operation
    cancelAndRefetch: async (userId: number) => {
      await utils.user.get.cancel({ id: userId });
      await utils.user.get.refetch({ id: userId });
    },
  };

  return (
    <div>
      <button onClick={cancelExamples.cancelAllUserQueries}>
        Cancel All User Queries
      </button>
    </div>
  );
}
```

### Data Manipulation

Directly manipulate cached query data without making server requests.

```typescript { .api }
/**
 * Set query data in the cache
 * @param input - Input parameters identifying the query
 * @param updater - Function or value to update the data
 * @param opts - Set data options
 */
procedure.setData(
  input: TInput,
  updater: Updater<TOutput>,
  opts?: SetDataOptions
): TOutput | undefined;

/**
 * Get query data from the cache
 * @param input - Input parameters identifying the query
 * @returns Cached data or undefined
 */
procedure.getData(
  input?: GetQueryProcedureInput<TInput>
): TOutput | undefined;

type Updater<TData> = TData | ((oldData: TData | undefined) => TData | undefined);

interface SetDataOptions {
  updatedAt?: number;
}
```

**Usage Examples:**

```typescript
function DataManipulationExamples() {
  const utils = trpc.useUtils();

  const dataExamples = {
    // Set user data directly
    setUserData: (userId: number, userData: User) => {
      utils.user.get.setData({ id: userId }, userData);
    },
    
    // Update user data with function
    updateUserData: (userId: number, updates: Partial<User>) => {
      utils.user.get.setData({ id: userId }, (oldData) => 
        oldData ? { ...oldData, ...updates } : undefined
      );
    },
    
    // Get user data from cache
    getUserData: (userId: number) => {
      return utils.user.get.getData({ id: userId });
    },
    
    // Optimistic update pattern
    optimisticUpdate: (userId: number, updates: Partial<User>) => {
      const previousData = utils.user.get.getData({ id: userId });
      
      // Apply optimistic update
      utils.user.get.setData({ id: userId }, (old) => 
        old ? { ...old, ...updates } : undefined
      );
      
      return () => {
        // Rollback function
        utils.user.get.setData({ id: userId }, previousData);
      };
    },
  };

  const handleOptimisticUpdate = () => {
    const rollback = dataExamples.optimisticUpdate(1, { name: "New Name" });
    
    // Later, if the mutation fails:
    // rollback();
  };

  return (
    <button onClick={handleOptimisticUpdate}>
      Optimistic Update
    </button>
  );
}
```

### Infinite Query Utilities

Specialized utilities for managing infinite/paginated query data.

```typescript { .api }
/**
 * Set infinite query data in the cache
 * @param input - Input parameters identifying the infinite query
 * @param updater - Function or value to update the infinite data
 * @param opts - Set data options
 */
procedure.setInfiniteData(
  input: GetInfiniteQueryInput<TInput>,
  updater: Updater<InfiniteData<TOutput>>,
  opts?: SetDataOptions
): InfiniteData<TOutput> | undefined;

/**
 * Get infinite query data from the cache
 * @param input - Input parameters identifying the infinite query
 * @returns Cached infinite data or undefined
 */
procedure.getInfiniteData(
  input?: GetInfiniteQueryInput<TInput>
): InfiniteData<TOutput> | undefined;
```

**Usage Examples:**

```typescript
function InfiniteQueryExamples() {
  const utils = trpc.useUtils();

  const infiniteExamples = {
    // Add new item to infinite list
    addItemToInfiniteList: (newPost: Post) => {
      utils.posts.list.setInfiniteData({ limit: 10 }, (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: [
            { ...oldData.pages[0], posts: [newPost, ...oldData.pages[0].posts] },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
    
    // Update item in infinite list
    updateItemInInfiniteList: (postId: number, updates: Partial<Post>) => {
      utils.posts.list.setInfiniteData({ limit: 10 }, (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) => 
              post.id === postId ? { ...post, ...updates } : post
            ),
          })),
        };
      });
    },
    
    // Get specific item from infinite data
    getItemFromInfiniteList: (postId: number) => {
      const data = utils.posts.list.getInfiniteData({ limit: 10 });
      return data?.pages
        .flatMap((page) => page.posts)
        .find((post) => post.id === postId);
    },
  };

  return (
    <button onClick={() => infiniteExamples.addItemToInfiniteList({
      id: Date.now(),
      title: "New Post",
      content: "Post content",
    })}>
      Add Post to Infinite List
    </button>
  );
}
```

### Imperative Fetching

Fetch data imperatively outside of React components.

```typescript { .api }
/**
 * Fetch query data imperatively
 * @param input - Input parameters for the query
 * @param opts - Fetch options
 * @returns Promise resolving to the fetched data
 */
procedure.fetch(
  input: TInput,
  opts?: TRPCFetchQueryOptions<TOutput, TError>
): Promise<TOutput>;

/**
 * Fetch infinite query data imperatively
 * @param input - Input parameters for the infinite query
 * @param opts - Fetch infinite options
 * @returns Promise resolving to the fetched infinite data
 */
procedure.fetchInfinite(
  input: GetInfiniteQueryInput<TInput>,
  opts: TRPCFetchInfiniteQueryOptions<TInput, TOutput, TError>
): Promise<InfiniteData<TOutput>>;
```

**Usage Examples:**

```typescript
function ImperativeFetchingExamples() {
  const utils = trpc.useUtils();

  const fetchExamples = {
    // Fetch user data imperatively
    fetchUserData: async (userId: number) => {
      try {
        const userData = await utils.user.get.fetch({ id: userId });
        console.log("Fetched user:", userData);
        return userData;
      } catch (error) {
        console.error("Failed to fetch user:", error);
        throw error;
      }
    },
    
    // Fetch with options
    fetchWithOptions: async (userId: number) => {
      const userData = await utils.user.get.fetch(
        { id: userId },
        {
          staleTime: 10 * 60 * 1000, // 10 minutes
        }
      );
      return userData;
    },
    
    // Fetch infinite data
    fetchInfiniteData: async () => {
      const postsData = await utils.posts.list.fetchInfinite(
        { limit: 10 },
        {
          initialCursor: null,
        }
      );
      return postsData;
    },
  };

  const handleImperativeFetch = async () => {
    const user = await fetchExamples.fetchUserData(1);
    console.log("User fetched:", user);
  };

  return (
    <button onClick={handleImperativeFetch}>
      Fetch User Imperatively
    </button>
  );
}
```

### Data Prefetching

Prefetch data before it's needed to improve user experience.

```typescript { .api }
/**
 * Prefetch query data
 * @param input - Input parameters for the query
 * @param opts - Prefetch options
 * @returns Promise that resolves when prefetch is complete
 */
procedure.prefetch(
  input: TInput,
  opts?: TRPCFetchQueryOptions<TOutput, TError>
): Promise<void>;

/**
 * Prefetch infinite query data
 * @param input - Input parameters for the infinite query
 * @param opts - Prefetch infinite options
 * @returns Promise that resolves when prefetch is complete
 */
procedure.prefetchInfinite(
  input: GetInfiniteQueryInput<TInput>,
  opts: TRPCFetchInfiniteQueryOptions<TInput, TOutput, TError>
): Promise<void>;
```

**Usage Examples:**

```typescript
function PrefetchingExamples() {
  const utils = trpc.useUtils();

  const prefetchExamples = {
    // Prefetch on hover
    prefetchOnHover: (userId: number) => {
      utils.user.get.prefetch({ id: userId });
    },
    
    // Prefetch related data
    prefetchRelatedData: async (userId: number) => {
      await Promise.all([
        utils.user.get.prefetch({ id: userId }),
        utils.user.posts.prefetch({ userId }),
        utils.user.settings.prefetch({ userId }),
      ]);
    },
    
    // Prefetch infinite data
    prefetchInfiniteData: () => {
      utils.posts.list.prefetchInfinite(
        { limit: 10 },
        { initialCursor: null }
      );
    },
  };

  return (
    <div>
      <button 
        onMouseEnter={() => prefetchExamples.prefetchOnHover(1)}
      >
        Hover to Prefetch User 1
      </button>
    </div>
  );
}
```

### Data Ensuring

Ensure data exists in cache, fetching it if necessary.

```typescript { .api }
/**
 * Ensure query data exists in cache, fetching if necessary
 * @param input - Input parameters for the query
 * @param opts - Ensure data options
 * @returns Promise resolving to the ensured data
 */
procedure.ensureData(
  input: TInput,
  opts?: TRPCFetchQueryOptions<TOutput, TError>
): Promise<TOutput>;
```

**Usage Examples:**

```typescript
function DataEnsuringExamples() {
  const utils = trpc.useUtils();

  const ensureExamples = {
    // Ensure user data exists before using it
    ensureUserData: async (userId: number) => {
      const userData = await utils.user.get.ensureData({ id: userId });
      // userData is guaranteed to exist
      return userData;
    },
    
    // Ensure data with fresh fetch if stale
    ensureFreshData: async (userId: number) => {
      const userData = await utils.user.get.ensureData(
        { id: userId },
        {
          staleTime: 0, // Always fetch fresh data
        }
      );
      return userData;
    },
  };

  const handleEnsureData = async () => {
    const user = await ensureExamples.ensureUserData(1);
    console.log("Ensured user data:", user);
  };

  return (
    <button onClick={handleEnsureData}>
      Ensure User Data
    </button>
  );
}
```

## Common Patterns

### Cache Management

```typescript
function CacheManagementExample() {
  const utils = trpc.useUtils();

  const cacheManager = {
    // Clear all cache
    clearAll: () => {
      utils.invalidate();
    },
    
    // Clear specific cache
    clearUserCache: () => {
      utils.user.invalidate();
    },
    
    // Warm cache on app start
    warmCache: async () => {
      await Promise.all([
        utils.user.list.prefetch(),
        utils.posts.list.prefetch({ limit: 10 }),
      ]);
    },
  };

  return (
    <div>
      <button onClick={cacheManager.clearAll}>Clear All Cache</button>
      <button onClick={cacheManager.warmCache}>Warm Cache</button>
    </div>
  );
}
```

### Optimistic Updates with Rollback

```typescript
function OptimisticUpdatesExample() {
  const utils = trpc.useUtils();
  const updateUser = trpc.user.update.useMutation();

  const performOptimisticUpdate = async (userId: number, updates: Partial<User>) => {
    // Store current data for rollback
    const previousData = utils.user.get.getData({ id: userId });
    
    // Apply optimistic update
    utils.user.get.setData({ id: userId }, (old) => 
      old ? { ...old, ...updates } : undefined
    );

    try {
      // Perform actual mutation
      await updateUser.mutateAsync({ id: userId, ...updates });
    } catch (error) {
      // Rollback on error
      utils.user.get.setData({ id: userId }, previousData);
      throw error;
    }
  };

  return (
    <button onClick={() => performOptimisticUpdate(1, { name: "New Name" })}>
      Update with Optimistic UI
    </button>
  );
}
```