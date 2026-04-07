# Query Hooks

React hooks for data fetching with caching, background updates, and full type safety. These hooks are automatically generated for each query procedure in your tRPC router.

## Capabilities

### useQuery

Primary hook for data fetching with caching and background synchronization.

```typescript { .api }
/**
 * Hook for fetching data from a tRPC query procedure
 * @param input - Input parameters for the procedure
 * @param opts - Query configuration options
 * @returns Query result with data, loading states, and error information
 */
procedure.useQuery<TQueryFnData = TOutput, TData = TQueryFnData>(
  input: TInput | SkipToken,
  opts?: UseTRPCQueryOptions<TQueryFnData, TData, TError, TOutput>
): UseTRPCQueryResult<TData, TError>;

// Overload for defined initial data
procedure.useQuery<TQueryFnData = TOutput, TData = TQueryFnData>(
  input: TInput | SkipToken,
  opts: DefinedUseTRPCQueryOptions<TQueryFnData, TData, TError, TOutput>
): DefinedUseTRPCQueryResult<TData, TError>;

interface UseTRPCQueryOptions<TOutput, TData, TError, TQueryOptsData = TOutput>
  extends Omit<UseBaseQueryOptions<TOutput, TError, TData, TQueryOptsData>, 'queryKey'> {
  trpc?: TRPCReactRequestOptions;
}

interface UseTRPCQueryResult<TData, TError> extends UseQueryResult<TData, TError> {
  trpc: TRPCHookResult;
}

interface TRPCHookResult {
  path: string[];
}
```

**Usage Examples:**

```typescript
import { trpc } from "./utils/trpc";

function UserProfile({ userId }: { userId: number }) {
  // Basic query
  const { data, error, isLoading } = trpc.user.get.useQuery({ id: userId });

  // With options
  const { data: user } = trpc.user.get.useQuery(
    { id: userId },
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  // With data transformation
  const { data: userName } = trpc.user.get.useQuery(
    { id: userId },
    {
      select: (user) => user.name,
    }
  );

  // Skip query conditionally
  const { data } = trpc.user.get.useQuery(
    userId ? { id: userId } : skipToken
  );

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>Hello, {data?.name}!</div>;
}
```

### useSuspenseQuery

Suspense-enabled query hook that automatically suspends the component during loading.

```typescript { .api }
/**
 * Suspense-enabled hook for fetching data from a tRPC query procedure
 * @param input - Input parameters for the procedure
 * @param opts - Suspense query configuration options
 * @returns Tuple with data and query result (data is always defined)
 */
procedure.useSuspenseQuery<TQueryFnData = TOutput, TData = TQueryFnData>(
  input: TInput,
  opts?: UseTRPCSuspenseQueryOptions<TQueryFnData, TData, TError>
): [TData, UseSuspenseQueryResult<TData, TError> & TRPCHookResult];

interface UseTRPCSuspenseQueryOptions<TOutput, TData, TError>
  extends Omit<UseSuspenseQueryOptions<TOutput, TError, TData>, 'queryKey'> {
  trpc?: TRPCReactRequestOptions;
}
```

**Usage Examples:**

```typescript
import { Suspense } from "react";

function UserProfileSuspense({ userId }: { userId: number }) {
  // Suspense query - data is always defined
  const [user, query] = trpc.user.get.useSuspenseQuery({ id: userId });

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      {query.isFetching && <span>Updating...</span>}
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<div>Loading user...</div>}>
      <UserProfileSuspense userId={1} />
    </Suspense>
  );
}
```

### useInfiniteQuery

Hook for paginated/infinite data fetching with cursor-based pagination support.

```typescript { .api }
/**
 * Hook for infinite/paginated data fetching (only available for procedures with cursor input)
 * @param input - Input parameters excluding cursor and direction
 * @param opts - Infinite query configuration options
 * @returns Infinite query result with pages data and pagination controls
 */
procedure.useInfiniteQuery<TData = InfiniteData<TOutput>>(
  input: Omit<TInput, 'cursor' | 'direction'> | SkipToken,
  opts?: UseTRPCInfiniteQueryOptions<TOutput, TData, TError, TCursor>
): UseTRPCInfiniteQueryResult<TData, TError>;

interface UseTRPCInfiniteQueryOptions<TOutput, TData, TError, TCursor>
  extends Omit<UseInfiniteQueryOptions<TOutput, TError, TData>, 'queryKey' | 'initialPageParam'> {
  trpc?: TRPCReactRequestOptions;
  initialCursor?: TCursor;
}

interface UseTRPCInfiniteQueryResult<TData, TError> 
  extends UseInfiniteQueryResult<TData, TError> {
  trpc: TRPCHookResult;
}
```

**Usage Examples:**

```typescript
function PostsList() {
  // Infinite query for paginated posts
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = trpc.posts.list.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      getPreviousPageParam: (firstPage) => firstPage.prevCursor,
      initialCursor: null,
    }
  );

  return (
    <div>
      <button
        onClick={() => fetchPreviousPage()}
        disabled={!hasPreviousPage || isFetchingPreviousPage}
      >
        Load Previous
      </button>

      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map((post) => (
            <article key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </article>
          ))}
        </div>
      ))}

      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? "Loading..." : "Load More"}
      </button>
    </div>
  );
}
```

### useSuspenseInfiniteQuery

Suspense-enabled infinite query hook for paginated data with automatic suspense handling.

```typescript { .api }
/**
 * Suspense-enabled infinite query hook (only available for procedures with cursor input)
 * @param input - Input parameters excluding cursor and direction
 * @param opts - Suspense infinite query configuration options
 * @returns Tuple with infinite data and query result
 */
procedure.useSuspenseInfiniteQuery(
  input: Omit<TInput, 'cursor' | 'direction'>,
  opts: UseTRPCSuspenseInfiniteQueryOptions<TOutput, TCursor>
): [InfiniteData<TOutput>, UseSuspenseInfiniteQueryResult<InfiniteData<TOutput>, TError> & TRPCHookResult];

interface UseTRPCSuspenseInfiniteQueryOptions<TOutput, TCursor>
  extends Omit<UseSuspenseInfiniteQueryOptions<TOutput, TError, InfiniteData<TOutput>>, 'queryKey' | 'initialPageParam'> {
  trpc?: TRPCReactRequestOptions;
  initialCursor?: TCursor;
}
```

**Usage Examples:**

```typescript
import { Suspense } from "react";

function PostsListSuspense() {
  const [data, query] = trpc.posts.list.useSuspenseInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map((post) => (
            <article key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </article>
          ))}
        </div>
      ))}
      
      <button
        onClick={() => query.fetchNextPage()}
        disabled={!query.hasNextPage}
      >
        Load More
      </button>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<div>Loading posts...</div>}>
      <PostsListSuspense />
    </Suspense>
  );
}
```

### usePrefetchQuery

Hook for prefetching query data without rendering the result.

```typescript { .api }
/**
 * Hook for prefetching query data
 * @param input - Input parameters for the procedure
 * @param opts - Prefetch configuration options
 */
procedure.usePrefetchQuery(
  input: TInput | SkipToken,
  opts?: TRPCFetchQueryOptions<TOutput, TError>
): void;

interface TRPCFetchQueryOptions<TData, TError>
  extends Omit<FetchQueryOptions<TData, TError>, 'queryKey'> {
  trpc?: TRPCReactRequestOptions;
}
```

**Usage Examples:**

```typescript
function UserList() {
  const { data: users } = trpc.users.list.useQuery();

  // Prefetch user details on hover
  const handleUserHover = (userId: number) => {
    trpc.user.get.usePrefetchQuery({ id: userId });
  };

  return (
    <ul>
      {users?.map((user) => (
        <li
          key={user.id}
          onMouseEnter={() => handleUserHover(user.id)}
        >
          <Link to={`/users/${user.id}`}>{user.name}</Link>
        </li>
      ))}
    </ul>
  );
}
```

### usePrefetchInfiniteQuery

Hook for prefetching infinite query data.

```typescript { .api }
/**
 * Hook for prefetching infinite query data (only available for procedures with cursor input)
 * @param input - Input parameters excluding cursor and direction
 * @param opts - Prefetch infinite query configuration options
 */
procedure.usePrefetchInfiniteQuery(
  input: Omit<TInput, 'cursor' | 'direction'> | SkipToken,
  opts: TRPCFetchInfiniteQueryOptions<TInput, TOutput, TError>
): void;

interface TRPCFetchInfiniteQueryOptions<TInput, TOutput, TError>
  extends Omit<FetchInfiniteQueryOptions<TOutput, TError>, 'queryKey' | 'initialPageParam'> {
  trpc?: TRPCReactRequestOptions;
  initialCursor?: ExtractCursorType<TInput>;
}
```

**Usage Examples:**

```typescript
function PostsNavigation() {
  // Prefetch first page of posts
  trpc.posts.list.usePrefetchInfiniteQuery(
    { limit: 10 },
    {
      initialCursor: null,
    }
  );

  return (
    <nav>
      <Link to="/posts">View Posts</Link>
    </nav>
  );
}
```

## Common Patterns

### Conditional Queries

```typescript
function ConditionalQuery({ userId }: { userId?: number }) {
  // Skip query when userId is undefined
  const { data } = trpc.user.get.useQuery(
    userId ? { id: userId } : skipToken
  );

  // Alternative with enabled option
  const { data: user } = trpc.user.get.useQuery(
    { id: userId! },
    { enabled: !!userId }
  );

  return <div>{data?.name}</div>;
}
```

### Error Handling

```typescript
function UserWithErrorHandling({ userId }: { userId: number }) {
  const { data, error, isError } = trpc.user.get.useQuery({ id: userId });

  if (isError) {
    if (error.data?.code === "NOT_FOUND") {
      return <div>User not found</div>;
    }
    return <div>Error: {error.message}</div>;
  }

  return <div>{data?.name}</div>;
}
```

### Data Transformation

```typescript
function TransformedQuery({ userId }: { userId: number }) {
  // Transform data in the select function
  const { data: userInfo } = trpc.user.get.useQuery(
    { id: userId },
    {
      select: (user) => ({
        displayName: `${user.firstName} ${user.lastName}`,
        initials: `${user.firstName[0]}${user.lastName[0]}`,
      }),
    }
  );

  return <div>{userInfo?.displayName}</div>;
}
```