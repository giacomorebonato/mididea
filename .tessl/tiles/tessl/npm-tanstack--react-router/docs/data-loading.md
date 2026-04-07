# Data Loading & Caching

Built-in data loading system with loaders, caching, invalidation, promise handling, and deferred data streaming for efficient data management.

## Capabilities

### Deferred Promises

Create deferred promises for streaming data loading and progressive rendering.

```typescript { .api }
/**
 * Create a deferred promise for streaming data
 * @param promise - Promise to defer
 * @returns Deferred promise wrapper for streaming
 */
function defer<T>(promise: Promise<T>): DeferredPromise<T>;

interface DeferredPromise<T> extends Promise<T> {
  /** Deferred promise state marker */
  [TSR_DEFERRED_PROMISE]: DeferredPromiseState<T>;
  /** Access to deferred state */
  __deferredState: DeferredPromiseState<T>;
}

interface DeferredPromiseState<T> {
  /** Current status of the promise */
  status: "pending" | "success" | "error";
  /** Resolved data if successful */
  data?: T;
  /** Error if promise rejected */
  error?: any;
}

/** Symbol key for deferred promise state */
declare const TSR_DEFERRED_PROMISE: unique symbol;
```

**Usage Examples:**

```typescript
import { defer } from "@tanstack/react-router";

// In route loader - defer slow data
const Route = createRoute({
  path: "/dashboard",
  loader: async () => {
    // Load fast data immediately
    const user = await fetchUser();

    // Defer slow data for streaming
    const analytics = defer(fetchAnalytics());
    const reports = defer(fetchReports());

    return {
      user, // Available immediately
      analytics, // Streams in when ready
      reports, // Streams in when ready
    };
  },
});

// In component - handle deferred data
function Dashboard() {
  const { user, analytics, reports } = Route.useLoaderData();

  return (
    <div>
      <h1>Welcome, {user.name}</h1>

      <Suspense fallback={<div>Loading analytics...</div>}>
        <Await promise={analytics}>
          {(data) => <AnalyticsChart data={data} />}
        </Await>
      </Suspense>

      <Suspense fallback={<div>Loading reports...</div>}>
        <Await promise={reports}>
          {(data) => <ReportsList reports={data} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

### Controlled Promises

Create promises with external control for advanced async patterns.

```typescript { .api }
/**
 * Create a controllable promise with external resolve/reject
 * @returns Promise with control methods
 */
function createControlledPromise<T>(): ControlledPromise<T>;

interface ControlledPromise<T> extends Promise<T> {
  /** Resolve the promise */
  resolve: (value: T | PromiseLike<T>) => void;
  /** Reject the promise */
  reject: (reason?: any) => void;
  /** Current status */
  status: "pending" | "resolved" | "rejected";
}
```

**Usage Examples:**

```typescript
import { createControlledPromise } from "@tanstack/react-router";

// Custom async operation with external control
function createAsyncOperation() {
  const { promise, resolve, reject } = createControlledPromise<string>();

  // Simulate async operation
  setTimeout(() => {
    if (Math.random() > 0.5) {
      resolve("Success!");
    } else {
      reject(new Error("Failed"));
    }
  }, 1000);

  return {
    promise,
    cancel: () => reject(new Error("Cancelled")),
    forceSuccess: () => resolve("Forced success"),
  };
}

// In route loader
const Route = createRoute({
  path: "/async-demo",
  loader: () => {
    const operation = createAsyncOperation();
    return { result: defer(operation.promise) };
  },
});
```

### Loader Data Hooks

Hooks for accessing loader data with type safety and selection.

```typescript { .api }
/**
 * Access loader data from route with type safety
 * @param opts - Loader data access options
 * @returns Loader data or selected subset
 */
function useLoaderData<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RoutePaths<TRouter> = "/",
  TStrict extends boolean = true,
  TSelected = ResolveLoaderData<TRouter, TFrom>,
  TStructuralSharing extends boolean = true
>(
  opts?: {
    from?: TFrom;
    strict?: TStrict;
    select?: (data: ResolveLoaderData<TRouter, TFrom>) => TSelected;
    structuralSharing?: TStructuralSharing;
  }
): UseLoaderDataResult<TRouter, TFrom, TStrict, TSelected>;

/**
 * Access loader dependencies
 * @param opts - Loader deps access options
 * @returns Loader dependencies
 */
function useLoaderDeps<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RoutePaths<TRouter> = "/",
  TStrict extends boolean = true,
  TSelected = ResolveLoaderDeps<TRouter, TFrom>,
  TStructuralSharing extends boolean = true
>(
  opts?: {
    from?: TFrom;
    strict?: TStrict;
    select?: (deps: ResolveLoaderDeps<TRouter, TFrom>) => TSelected;
    structuralSharing?: TStructuralSharing;
  }
): UseLoaderDepsResult<TRouter, TFrom, TStrict, TSelected>;
```

**Usage Examples:**

```typescript
import { useLoaderData, useLoaderDeps } from "@tanstack/react-router";

// Access loader data in component
function PostDetail() {
  // Get all loader data
  const { post, comments, relatedPosts } = useLoaderData({
    from: "/posts/$postId",
  });

  // Select specific data
  const postTitle = useLoaderData({
    from: "/posts/$postId",
    select: (data) => data.post.title,
  });

  // Access loader deps for cache invalidation
  const deps = useLoaderDeps({
    from: "/posts/$postId",
  });

  return (
    <div>
      <h1>{postTitle}</h1>
      <div>{post.content}</div>
      <CommentsList comments={comments} />
      <RelatedPosts posts={relatedPosts} />
    </div>
  );
}
```

### Awaited Data Hook

Hook for handling deferred promises with suspense integration.

```typescript { .api }
/**
 * Handle deferred promises with suspense integration
 * @param options - Await options
 * @returns Tuple of resolved data and promise state
 */
function useAwaited<T>(options: AwaitOptions<T>): [T, DeferredPromise<T>];

interface AwaitOptions<T> {
  /** Promise to await */
  promise: Promise<T> | DeferredPromise<T>;
}
```

**Usage Examples:**

```typescript
import { useAwaited, defer } from "@tanstack/react-router";

function StreamingDataComponent() {
  const { deferredAnalytics } = useLoaderData();

  try {
    // This will suspend until promise resolves
    const [analytics, promise] = useAwaited({ promise: deferredAnalytics });

    return (
      <div>
        <h2>Analytics (Status: {promise.__deferredState.status})</h2>
        <AnalyticsChart data={analytics} />
      </div>
    );
  } catch (promise) {
    // Suspense boundary will catch and show fallback
    throw promise;
  }
}

// Alternative usage with error handling
function SafeStreamingComponent() {
  const { deferredData } = useLoaderData();

  try {
    const [data, promise] = useAwaited({ promise: deferredData });

    if (promise.__deferredState.status === "error") {
      return <div>Error loading data: {promise.__deferredState.error.message}</div>;
    }

    return <DataDisplay data={data} />;
  } catch (promise) {
    // Still loading
    return <div>Loading...</div>;
  }
}
```

### Cache Invalidation

Utilities for invalidating cached route data and triggering reloads.

```typescript { .api }
/**
 * Router invalidation method
 * Invalidates all route matches and triggers reload
 */
interface Router {
  /**
   * Invalidate all route data and reload
   * @returns Promise that resolves when invalidation completes
   */
  invalidate(): Promise<void>;

  /**
   * Preload a route's data
   * @param options - Navigation options for route to preload
   * @returns Promise that resolves when preloading completes
   */
  preloadRoute<TFrom extends RoutePaths<TRouteTree> = "/">(
    options: NavigateOptions<TRouteTree, TFrom>
  ): Promise<void>;
}
```

**Usage Examples:**

```typescript
import { useRouter } from "@tanstack/react-router";

function DataManagement() {
  const router = useRouter();

  const handleRefreshData = async () => {
    // Invalidate all cached data and reload
    await router.invalidate();
  };

  const handlePreloadProfile = async () => {
    // Preload profile data
    await router.preloadRoute({ to: "/profile" });
  };

  return (
    <div>
      <button onClick={handleRefreshData}>Refresh All Data</button>
      <button onClick={handlePreloadProfile}>Preload Profile</button>
    </div>
  );
}
```

### Route Loader Functions

Types and utilities for defining route data loaders.

```typescript { .api }
/**
 * Route loader function type
 */
type RouteLoaderFn<TRoute extends AnyRoute = AnyRoute> = (
  context: LoaderFnContext<TRoute>
) => any | Promise<any>;

interface LoaderFnContext<TRoute extends AnyRoute = AnyRoute> {
  /** Route parameters */
  params: ResolveParams<TRoute>;
  /** Search parameters */
  search: InferFullSearchSchema<TRoute>;
  /** Route context from beforeLoad */
  context: RouteContext<TRoute>;
  /** Current location */
  location: ParsedLocation;
  /** Abort signal for cancellation */
  signal: AbortSignal;
  /** Preload flag */
  preload?: boolean;
}

/**
 * Loader data resolution types
 */
type ResolveLoaderData<TRouter extends AnyRouter, TFrom extends RoutePaths<TRouter>> =
  RouteById<TRouter, TFrom>["loaderData"];

type ResolveLoaderDeps<TRouter extends AnyRouter, TFrom extends RoutePaths<TRouter>> =
  RouteById<TRouter, TFrom>["loaderDeps"];
```

**Usage Examples:**

```typescript
// Advanced loader with error handling and caching
const Route = createRoute({
  path: "/api/data/$id",
  loader: async ({ params, search, context, signal, preload }: LoaderFnContext) => {
    // Check if this is a preload
    if (preload) {
      // Maybe return cached data for preloads
      return getCachedData(params.id);
    }

    // Use abort signal for cleanup
    const controller = new AbortController();
    signal.addEventListener("abort", () => controller.abort());

    try {
      // Load multiple data sources
      const [item, metadata] = await Promise.all([
        fetchItem(params.id, { signal: controller.signal }),
        fetchMetadata(params.id, { signal: controller.signal }),
      ]);

      // Apply search filters
      const filteredData = applySearchFilters(item, search);

      // Use context for authorization
      const authorizedData = await authorizeData(filteredData, context.user);

      return {
        item: authorizedData,
        metadata,
        loadedAt: Date.now(),
      };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request cancelled");
      }
      throw error;
    }
  },
  // Configure caching
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
});
```

### Data Transformation

Utilities for transforming and updating loader data.

```typescript { .api }
/**
 * Apply functional updates to data
 * @param updater - Update function or new value
 * @param previous - Previous value
 * @returns Updated value
 */
function functionalUpdate<T>(
  updater: T | ((prev: T) => T),
  previous: T
): T;

/**
 * Deep equality replacement for structural sharing
 * @param prev - Previous value
 * @param next - Next value
 * @returns Previous if equal, next if different
 */
function replaceEqualDeep<T>(prev: T, next: T): T;
```

**Usage Examples:**

```typescript
import { functionalUpdate, replaceEqualDeep } from "@tanstack/react-router";

// Functional updates in loader
const Route = createRoute({
  path: "/settings",
  loader: async ({ context }) => {
    const settings = await fetchSettings();

    // Apply functional update based on context
    const updatedSettings = functionalUpdate(
      (prev) => ({
        ...prev,
        theme: context.user.preferredTheme,
      }),
      settings
    );

    return { settings: updatedSettings };
  },
});

// Structural sharing for performance
function useOptimizedData() {
  const data = useLoaderData();

  // Only re-render if data actually changed
  const optimizedData = useMemo(() =>
    replaceEqualDeep(previousData.current, data),
    [data]
  );

  return optimizedData;
}
```

## Types

### Loader Types

```typescript { .api }
interface LoaderContext<TRoute extends AnyRoute = AnyRoute> {
  params: ResolveParams<TRoute>;
  search: InferFullSearchSchema<TRoute>;
  context: RouteContext<TRoute>;
  location: ParsedLocation;
  signal: AbortSignal;
  preload?: boolean;
}

type LoaderData<TRoute extends AnyRoute = AnyRoute> = TRoute extends {
  loader: infer TLoader;
}
  ? TLoader extends (...args: any[]) => infer TReturn
    ? TReturn extends Promise<infer TData>
      ? TData
      : TReturn
    : never
  : {};
```

### Promise State Types

```typescript { .api }
interface DeferredPromiseState<T> {
  status: "pending" | "success" | "error";
  data?: T;
  error?: any;
}

type ControllablePromise<T> = Promise<T> & {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  status: "pending" | "resolved" | "rejected";
};
```

### Cache Configuration Types

```typescript { .api }
interface CacheOptions {
  /** Time until data becomes stale */
  staleTime?: number;
  /** Time until data is garbage collected */
  gcTime?: number;
  /** Whether route should reload on focus */
  shouldReload?: boolean | ((match: RouteMatch) => boolean);
}
```