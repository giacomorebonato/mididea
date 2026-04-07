# Query Keys and Utilities

Utilities for working with React Query keys and mutations in the tRPC context. These functions provide access to the underlying query key structure and enable advanced cache manipulation and query utilities creation.

## Capabilities

### getQueryKey

Extract query keys for tRPC procedures to work directly with React Query cache.

```typescript { .api }
/**
 * Extract the query key for a tRPC procedure
 * @param procedureOrRouter - tRPC procedure or router
 * @param ...params - Variable parameters: [input?, type?] for query procedures, [] for routers
 * @returns tRPC query key for use with React Query
 */
function getQueryKey<TProcedureOrRouter extends ProcedureOrRouter>(
  procedureOrRouter: TProcedureOrRouter,
  ...params: GetParams<TProcedureOrRouter>
): TRPCQueryKey;

type GetParams<TProcedureOrRouter extends ProcedureOrRouter> =
  TProcedureOrRouter extends DecoratedQuery<infer $Def>
    ? [input?: GetQueryProcedureInput<$Def['input']>, type?: QueryType]
    : [];

type QueryType = 'any' | 'infinite' | 'query';

type TRPCQueryKey = [
  readonly string[],
  { input?: unknown; type?: Exclude<QueryType, 'any'> }?
];

type GetQueryProcedureInput<TProcedureInput> = TProcedureInput extends { cursor?: any }
  ? GetInfiniteQueryInput<TProcedureInput>
  : DeepPartial<TProcedureInput> | undefined;
```

**Usage Examples:**

```typescript
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "./utils/trpc";

function QueryKeyExamples() {
  const queryClient = useQueryClient();

  const keyExamples = {
    // Get key for specific query
    getSpecificUserKey: () => {
      const key = getQueryKey(trpc.user.get, { id: 1 }, 'query');
      console.log("User query key:", key);
      // Result: [['user', 'get'], { input: { id: 1 }, type: 'query' }]
    },

    // Get key for all queries of a procedure
    getAllUserKeys: () => {
      const key = getQueryKey(trpc.user.get);
      console.log("All user keys:", key);
      // Result: [['user', 'get']]
    },

    // Get key for infinite queries
    getInfinitePostsKey: () => {
      const key = getQueryKey(trpc.posts.list, { limit: 10 }, 'infinite');
      console.log("Infinite posts key:", key);
      // Result: [['posts', 'list'], { input: { limit: 10 }, type: 'infinite' }]
    },

    // Use keys with React Query directly
    invalidateWithKey: () => {
      const userKey = getQueryKey(trpc.user.get, { id: 1 });
      queryClient.invalidateQueries({ queryKey: userKey });
    },

    // Check if data exists in cache
    hasDataInCache: (userId: number) => {
      const key = getQueryKey(trpc.user.get, { id: userId });
      const data = queryClient.getQueryData(key);
      return data !== undefined;
    },
  };

  return (
    <div>
      <button onClick={keyExamples.getSpecificUserKey}>
        Get Specific User Key
      </button>
      <button onClick={keyExamples.invalidateWithKey}>
        Invalidate with Key
      </button>
    </div>
  );
}
```

### getMutationKey

Extract mutation keys for tRPC mutation procedures.

```typescript { .api }
/**
 * Extract the mutation key for a tRPC mutation procedure
 * @param procedure - tRPC mutation procedure
 * @returns tRPC mutation key for use with React Query
 */
function getMutationKey<TProcedure extends DecoratedMutation<any>>(
  procedure: TProcedure
): TRPCMutationKey;

type TRPCMutationKey = [readonly string[]];
```

**Usage Examples:**

```typescript
import { getMutationKey } from "@trpc/react-query";
import { trpc } from "./utils/trpc";

function MutationKeyExamples() {
  const queryClient = useQueryClient();

  const mutationKeyExamples = {
    // Get mutation key
    getUserMutationKey: () => {
      const key = getMutationKey(trpc.user.create);
      console.log("User create mutation key:", key);
      // Result: [['user', 'create']]
    },

    // Check if mutation is in progress
    isMutationInProgress: () => {
      const key = getMutationKey(trpc.user.create);
      const mutation = queryClient.getMutationCache().find({ mutationKey: key });
      return mutation?.state.status === 'pending';
    },

    // Cancel specific mutations
    cancelMutation: () => {
      const key = getMutationKey(trpc.user.create);
      queryClient.getMutationCache().findAll({ mutationKey: key })
        .forEach(mutation => mutation.destroy());
    },

    // Get mutation count
    getMutationCount: () => {
      const key = getMutationKey(trpc.user.create);
      return queryClient.getMutationCache().findAll({ mutationKey: key }).length;
    },
  };

  return (
    <div>
      <button onClick={mutationKeyExamples.getUserMutationKey}>
        Get Mutation Key
      </button>
      <button onClick={mutationKeyExamples.cancelMutation}>
        Cancel Mutations
      </button>
    </div>
  );
}
```

### createTRPCQueryUtils

Create standalone query utilities without React hooks.

```typescript { .api }
/**
 * Creates query utilities for imperative tRPC operations outside React components
 * @param opts - Configuration with tRPC client and React Query client
 * @returns Utility functions mirroring your router structure
 */
function createTRPCQueryUtils<TRouter extends AnyRouter>(
  opts: CreateQueryUtilsOptions<TRouter>
): TRPCQueryUtils<TRouter>;

interface CreateQueryUtilsOptions<TRouter extends AnyRouter> {
  /** tRPC client instance */
  client: TRPCClient<TRouter> | TRPCUntypedClient<TRouter>;
  /** React Query client instance */
  queryClient: QueryClient;
}

interface TRPCQueryUtils<TRouter> {
  // Utility methods are generated based on your router structure
  // Each procedure gets utility methods for cache manipulation
}
```

**Usage Examples:**

```typescript
import { createTRPCQueryUtils } from "@trpc/react-query";
import { QueryClient } from "@tanstack/react-query";

// Create utils outside React components
const queryClient = new QueryClient();
const trpcClient = createTRPCClient({
  url: "http://localhost:3000/api/trpc",
});

const utils = createTRPCQueryUtils({
  client: trpcClient,
  queryClient,
});

// Use in non-React contexts
async function backgroundSync() {
  // Fetch and cache data
  await utils.user.list.fetch();
  
  // Invalidate stale data
  await utils.user.invalidate();
  
  // Prefetch upcoming data
  await utils.posts.trending.prefetch();
}

// Service worker usage
self.addEventListener('sync', async (event) => {
  if (event.tag === 'background-sync') {
    await backgroundSync();
  }
});

// Node.js script usage
async function dataPreprocessing() {
  const users = await utils.user.list.fetch();
  
  for (const user of users) {
    // Process each user
    await utils.user.analytics.prefetch({ userId: user.id });
  }
  
  console.log("Data preprocessing complete");
}
```

### Query Key Structure

Understanding the tRPC query key structure for advanced cache manipulation.

```typescript { .api }
// Query key structure
type TRPCQueryKey = [
  readonly string[], // Procedure path: ['user', 'get']
  {
    input?: unknown;  // Procedure input
    type?: 'query' | 'infinite'; // Query type
  }?
];

// Examples of query keys:
// trpc.user.get.useQuery({ id: 1 })
// Key: [['user', 'get'], { input: { id: 1 }, type: 'query' }]

// trpc.posts.list.useInfiniteQuery({ limit: 10 })
// Key: [['posts', 'list'], { input: { limit: 10 }, type: 'infinite' }]

// trpc.user.get.invalidate() (all user.get queries)
// Key: [['user', 'get']]

// trpc.invalidate() (all queries)
// Key: []
```

**Usage Examples:**

```typescript
function AdvancedCacheManipulation() {
  const queryClient = useQueryClient();

  const cacheExamples = {
    // Find all user queries
    findAllUserQueries: () => {
      const queries = queryClient.getQueryCache().findAll({
        queryKey: [['user']],
        type: 'active',
      });
      return queries;
    },

    // Find specific user data queries
    findUserDataQueries: (userId: number) => {
      const queries = queryClient.getQueryCache().findAll({
        queryKey: [['user', 'get']],
        predicate: (query) => {
          const [, params] = query.queryKey as TRPCQueryKey;
          return params?.input?.id === userId;
        },
      });
      return queries;
    },

    // Find all infinite queries
    findInfiniteQueries: () => {
      const queries = queryClient.getQueryCache().findAll({
        predicate: (query) => {
          const [, params] = query.queryKey as TRPCQueryKey;
          return params?.type === 'infinite';
        },
      });
      return queries;
    },

    // Custom cache invalidation
    invalidateUserRelatedQueries: (userId: number) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const [path, params] = query.queryKey as TRPCQueryKey;
          
          // Invalidate user-specific queries
          if (path[0] === 'user' && params?.input?.id === userId) {
            return true;
          }
          
          // Invalidate user's posts
          if (path.join('.') === 'posts.byUser' && params?.input?.userId === userId) {
            return true;
          }
          
          return false;
        },
      });
    },
  };

  return (
    <div>
      <button onClick={() => cacheExamples.invalidateUserRelatedQueries(1)}>
        Invalidate User 1 Related Queries
      </button>
    </div>
  );
}
```

### Advanced Query Filtering

Use query keys for sophisticated cache filtering and manipulation.

```typescript
function QueryFiltering() {
  const queryClient = useQueryClient();

  const filteringExamples = {
    // Remove stale user queries
    removeStaleUserQueries: () => {
      const staleTime = 5 * 60 * 1000; // 5 minutes
      const now = Date.now();

      queryClient.getQueryCache().findAll({
        queryKey: [['user']],
        predicate: (query) => {
          const dataUpdatedAt = query.state.dataUpdatedAt;
          return now - dataUpdatedAt > staleTime;
        },
      }).forEach(query => {
        queryClient.removeQueries({ queryKey: query.queryKey });
      });
    },

    // Get query statistics
    getQueryStatistics: () => {
      const allQueries = queryClient.getQueryCache().getAll();
      const trpcQueries = allQueries.filter(query => 
        Array.isArray(query.queryKey[0])
      );

      const stats = {
        total: trpcQueries.length,
        success: trpcQueries.filter(q => q.state.status === 'success').length,
        error: trpcQueries.filter(q => q.state.status === 'error').length,
        loading: trpcQueries.filter(q => q.state.status === 'pending').length,
      };

      return stats;
    },

    // Find queries by input pattern
    findQueriesByInputPattern: (pattern: any) => {
      return queryClient.getQueryCache().findAll({
        predicate: (query) => {
          const [, params] = query.queryKey as TRPCQueryKey;
          return JSON.stringify(params?.input).includes(JSON.stringify(pattern));
        },
      });
    },
  };

  const stats = filteringExamples.getQueryStatistics();

  return (
    <div>
      <p>Total tRPC queries: {stats.total}</p>
      <p>Success: {stats.success}</p>
      <p>Error: {stats.error}</p>
      <p>Loading: {stats.loading}</p>
      
      <button onClick={filteringExamples.removeStaleUserQueries}>
        Remove Stale User Queries
      </button>
    </div>
  );
}
```

## Common Patterns

### Cache Debugging

```typescript
function CacheDebugging() {
  const queryClient = useQueryClient();

  const debugCache = () => {
    const cache = queryClient.getQueryCache().getAll();
    
    console.group("tRPC Query Cache Debug");
    cache.forEach((query) => {
      if (Array.isArray(query.queryKey[0])) {
        const [path, params] = query.queryKey as TRPCQueryKey;
        console.log({
          procedure: path.join('.'),
          input: params?.input,
          type: params?.type,
          status: query.state.status,
          dataUpdatedAt: new Date(query.state.dataUpdatedAt),
          data: query.state.data,
        });
      }
    });
    console.groupEnd();
  };

  return (
    <button onClick={debugCache}>
      Debug Cache
    </button>
  );
}
```

### Query Key Utilities

```typescript
function QueryKeyUtilities() {
  // Helper functions for working with tRPC query keys
  const keyUtils = {
    // Check if a key matches a procedure
    matchesProcedure: (key: TRPCQueryKey, procedurePath: string[]) => {
      const [path] = key;
      return path.length >= procedurePath.length &&
        procedurePath.every((segment, index) => path[index] === segment);
    },

    // Extract procedure path from key
    getProcedurePath: (key: TRPCQueryKey) => {
      const [path] = key;
      return path.join('.');
    },

    // Check if key has specific input
    hasInput: (key: TRPCQueryKey, input: any) => {
      const [, params] = key;
      return JSON.stringify(params?.input) === JSON.stringify(input);
    },

    // Get query type from key
    getQueryType: (key: TRPCQueryKey) => {
      const [, params] = key;
      return params?.type || 'query';
    },
  };

  return keyUtils;
}
```

### Batch Operations

```typescript
function BatchOperations() {
  const queryClient = useQueryClient();

  const batchOps = {
    // Batch invalidate multiple procedures
    batchInvalidate: async (procedures: Array<{ path: string[], input?: any }>) => {
      await Promise.all(
        procedures.map(({ path, input }) => {
          const key = input 
            ? [path, { input }] as TRPCQueryKey
            : [path] as TRPCQueryKey;
          return queryClient.invalidateQueries({ queryKey: key });
        })
      );
    },

    // Batch prefetch related data
    batchPrefetch: async (userId: number) => {
      const utils = createTRPCQueryUtils({
        client: trpcClient,
        queryClient,
      });

      await Promise.all([
        utils.user.get.prefetch({ id: userId }),
        utils.user.posts.prefetch({ userId }),
        utils.user.followers.prefetch({ userId }),
        utils.user.settings.prefetch({ userId }),
      ]);
    },
  };

  return (
    <button onClick={() => batchOps.batchPrefetch(1)}>
      Batch Prefetch User Data
    </button>
  );
}
```