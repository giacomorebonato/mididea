# Route Definition & Management

System for defining routes with type-safe parameters, search handling, data loading, and nested layouts. Supports both programmatic route creation and file-based routing patterns.

## Capabilities

### Route Creation

Create route instances with comprehensive configuration options including loaders, components, and validation.

```typescript { .api }
/**
 * Create a route instance with configuration
 * @param options - Route configuration options
 * @returns Route instance
 */
function createRoute<TParentRoute extends AnyRoute = AnyRoute>(
  options: RouteOptions<TParentRoute>
): Route<TParentRoute>;

interface RouteOptions<TParentRoute extends AnyRoute = AnyRoute> {
  /** Function returning parent route */
  getParentRoute?: () => TParentRoute;
  /** Route path pattern */
  path?: string;
  /** Route ID for identification */
  id?: string;
  /** Route component */
  component?: RouteComponent;
  /** Error boundary component */
  errorComponent?: ErrorRouteComponent;
  /** Loading/pending component */
  pendingComponent?: RouteComponent;
  /** Not found component */
  notFoundComponent?: NotFoundRouteComponent;
  /** Route loader function */
  loader?: RouteLoaderFn;
  /** Route context function */
  beforeLoad?: RouteContextFn;
  /** Validation schema for search params */
  validateSearch?: SearchValidator;
  /** Transform search params */
  search?: SearchTransform;
  /** Static data */
  staticData?: any;
  /** Whether route should preload */
  shouldReload?: boolean | ((match: RouteMatch) => boolean);
  /** Stale time for route data */
  staleTime?: number;
  /** Garbage collection time */
  gcTime?: number;
}
```

**Usage Examples:**

```typescript
import { createRoute, createRootRoute } from "@tanstack/react-router";

// Basic route
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <div>Home</div>,
});

// Route with parameters and loader
const postRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/posts/$postId",
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId);
    return { post };
  },
  component: ({ useLoaderData }) => {
    const { post } = useLoaderData();
    return <div>{post.title}</div>;
  },
});

// Route with search validation
const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  validateSearch: (search) => ({
    q: search.q || "",
    page: Number(search.page) || 1,
  }),
  component: ({ useSearch }) => {
    const { q, page } = useSearch();
    return <SearchResults query={q} page={page} />;
  },
});
```

### Root Route Creation

Create the root route that serves as the top-level route for the application.

```typescript { .api }
/**
 * Create a root route
 * @param options - Root route configuration options
 * @returns Root route instance
 */
function createRootRoute<TRouterContext = unknown>(
  options?: RootRouteOptions<TRouterContext>
): RootRoute<TRouterContext>;

/**
 * Create a root route with typed context
 * @returns Function to create root route with context
 */
function createRootRouteWithContext<TRouterContext>(): <TRouter extends AnyRouter = AnyRouter>(
  options?: RootRouteOptions<TRouterContext>
) => RootRoute<TRouterContext>;

interface RootRouteOptions<TRouterContext = unknown> {
  /** Root component */
  component?: RouteComponent;
  /** Root error component */
  errorComponent?: ErrorRouteComponent;
  /** Root pending component */
  pendingComponent?: RouteComponent;
  /** Root not found component */
  notFoundComponent?: NotFoundRouteComponent;
  /** Root loader function */
  loader?: (opts: { context: TRouterContext }) => any;
  /** Root context function */
  beforeLoad?: (opts: { context: TRouterContext }) => any;
}
```

**Usage Examples:**

```typescript
import { createRootRoute, createRootRouteWithContext, Outlet } from "@tanstack/react-router";

// Basic root route
const rootRoute = createRootRoute({
  component: () => (
    <div>
      <nav>Navigation</nav>
      <Outlet />
    </div>
  ),
});

// Root route with typed context
const createRootWithContext = createRootRouteWithContext<{
  user: User;
  theme: "light" | "dark";
}>();

const rootRoute = createRootWithContext({
  component: () => <App />,
  beforeLoad: ({ context }) => {
    console.log("User:", context.user);
    return { ...context };
  },
});
```

### File-Based Routes

Create routes based on file system conventions with automatic type generation and file-system-based routing patterns.

```typescript { .api }
/**
 * Create a file-based route with automatic type inference
 * @param path - File path for type inference
 * @returns Function to create route with file-based typing
 */
function createFileRoute<TFilePath extends keyof FileRoutesByPath>(
  path?: TFilePath
): FileRoute<TFilePath>['createRoute'];

/**
 * Create a lazy file route for code splitting
 * @param id - File path used as route ID
 * @returns Function to create lazy file route
 */
function createLazyFileRoute<TFilePath extends keyof FileRoutesByPath>(
  id: TFilePath
): (opts: LazyRouteOptions) => LazyRoute<FileRoutesByPath[TFilePath]['preLoaderRoute']>;

/**
 * File route loader function (deprecated - use loader in createFileRoute options)
 * @param path - File path
 * @returns Function to define typed loader
 */
function FileRouteLoader<TFilePath extends keyof FileRoutesByPath>(
  path: TFilePath
): <TLoaderFn>(loaderFn: TLoaderFn) => TLoaderFn;
```

### File Route Class

File route class for programmatic file-based route creation (deprecated in favor of createFileRoute).

```typescript { .api }
/**
 * File route class (deprecated - use createFileRoute instead)
 * @deprecated Use createFileRoute('/path/to/file')(options) instead
 */
class FileRoute<
  TFilePath extends keyof FileRoutesByPath,
  TParentRoute extends AnyRoute = FileRoutesByPath[TFilePath]['parentRoute'],
  TId extends RouteConstraints['TId'] = FileRoutesByPath[TFilePath]['id'],
  TPath extends RouteConstraints['TPath'] = FileRoutesByPath[TFilePath]['path'],
  TFullPath extends RouteConstraints['TFullPath'] = FileRoutesByPath[TFilePath]['fullPath']
> {
  /** File path */
  path?: TFilePath;
  /** Silent mode flag */
  silent?: boolean;

  constructor(path?: TFilePath, opts?: { silent: boolean });

  /**
   * Create route from file route instance
   * @param options - File route options
   * @returns Route instance
   */
  createRoute<TOptions extends FileBaseRouteOptions>(
    options?: TOptions
  ): Route<TParentRoute, TPath, TFullPath, TFilePath, TId>;
}
```

**Usage Examples:**

```typescript
// In routes/index.tsx
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <div>Home</div>;
}

// In routes/posts/$postId.tsx
export const Route = createFileRoute("/posts/$postId")({
  loader: ({ params }) => fetchPost(params.postId),
  component: PostDetail,
});

// Lazy file route
export const Route = createLazyFileRoute("/posts/$postId")({
  component: LazyPostDetail,
});
```

### Lazy Routes

Create routes that load components dynamically for code splitting with typed hook access.

```typescript { .api }
/**
 * Create a lazy route for code splitting
 * @param id - Route ID
 * @returns Function to create lazy route
 */
function createLazyRoute<
  TRouter extends AnyRouter = RegisteredRouter,
  TId extends string = string,
  TRoute extends AnyRoute = RouteById<TRouter['routeTree'], TId>
>(
  id: ConstrainLiteral<TId, RouteIds<TRouter['routeTree']>>
): (opts: LazyRouteOptions) => LazyRoute<TRoute>;

interface LazyRouteOptions {
  /** Lazy route component */
  component?: LazyRouteComponent;
  /** Lazy error component */
  errorComponent?: ErrorRouteComponent;
  /** Lazy pending component */
  pendingComponent?: RouteComponent;
  /** Lazy not found component */
  notFoundComponent?: NotFoundRouteComponent;
}
```

### Lazy Route Class

Lazy route class with typed hooks for accessing route data.

```typescript { .api }
/**
 * Lazy route class with typed hook access
 */
class LazyRoute<TRoute extends AnyRoute> {
  /** Lazy route options including ID */
  options: { id: string } & LazyRouteOptions;

  constructor(opts: { id: string } & LazyRouteOptions);

  /**
   * Access match data for this lazy route
   * @param opts - Match selection options
   * @returns Route match data
   */
  useMatch: UseMatchRoute<TRoute['id']>;

  /**
   * Access route context for this lazy route
   * @param opts - Context selection options
   * @returns Route context
   */
  useRouteContext: UseRouteContextRoute<TRoute['id']>;

  /**
   * Access search params for this lazy route
   * @param opts - Search selection options
   * @returns Search parameters
   */
  useSearch: UseSearchRoute<TRoute['id']>;

  /**
   * Access route params for this lazy route
   * @param opts - Params selection options
   * @returns Route parameters
   */
  useParams: UseParamsRoute<TRoute['id']>;

  /**
   * Access loader dependencies for this lazy route
   * @param opts - Loader deps selection options
   * @returns Loader dependencies
   */
  useLoaderDeps: UseLoaderDepsRoute<TRoute['id']>;

  /**
   * Access loader data for this lazy route
   * @param opts - Loader data selection options
   * @returns Loader data
   */
  useLoaderData: UseLoaderDataRoute<TRoute['id']>;

  /**
   * Access navigation function for this lazy route
   * @returns Typed navigation function
   */
  useNavigate: () => UseNavigateResult<TRoute['fullPath']>;
}
```

### Route API

Access typed API for specific routes with helper methods.

```typescript { .api }
/**
 * Get typed route API for a specific route
 * @param id - Route ID
 * @returns RouteApi instance
 */
function getRouteApi<TId extends string, TRouter extends AnyRouter = RegisteredRouter>(
  id: TId
): RouteApi<TRouter, TId>;

class RouteApi<TRouter extends AnyRouter, TId extends RouteIds<TRouter>> {
  /** Route ID */
  id: TId;

  /**
   * Use loader data for this route
   * @param opts - Options
   * @returns Loader data
   */
  useLoaderData<TSelected = ResolveLoaderData<TRouter, TId>>(
    opts?: {
      select?: (data: ResolveLoaderData<TRouter, TId>) => TSelected;
    }
  ): TSelected;

  /**
   * Use route context
   * @param opts - Options
   * @returns Route context
   */
  useRouteContext<TSelected = RouteContext<TRouter, TId>>(
    opts?: {
      select?: (context: RouteContext<TRouter, TId>) => TSelected;
    }
  ): TSelected;

  /**
   * Use search params for this route
   * @param opts - Options
   * @returns Search params
   */
  useSearch<TSelected = InferFullSearchSchema<TRouter, TId>>(
    opts?: {
      select?: (search: InferFullSearchSchema<TRouter, TId>) => TSelected;
    }
  ): TSelected;

  /**
   * Use params for this route
   * @param opts - Options
   * @returns Route params
   */
  useParams<TSelected = ResolveParams<TRouter, TId>>(
    opts?: {
      select?: (params: ResolveParams<TRouter, TId>) => TSelected;
    }
  ): TSelected;
}
```

### Route Masking

Create route masks for URL masking and aliasing.

```typescript { .api }
/**
 * Create a route mask for URL masking
 * @param options - Masking options
 * @returns Route mask configuration
 */
function createRouteMask<TRouteTree extends AnyRoute, TFrom extends string, TTo extends string>(
  options: {
    routeTree: TRouteTree;
    from: TFrom;
    to: TTo;
    params?: Record<string, any>;
    search?: Record<string, any>;
    hash?: string;
    unmaskOnReload?: boolean;
  }
): RouteMask;
```

## Types

### Route Types

```typescript { .api }
interface Route<TParentRoute extends AnyRoute = AnyRoute> {
  /** Route ID */
  id: string;
  /** Route path pattern */
  path: string;
  /** Full resolved path */
  fullPath: string;
  /** Parent route */
  parentRoute?: TParentRoute;
  /** Child routes */
  children?: AnyRoute[];
  /** Route options */
  options: RouteOptions;
  /** Add child routes */
  addChildren<TChildren extends AnyRoute[]>(children: TChildren): RouteWithChildren<TChildren>;
}

interface RootRoute<TRouterContext = unknown> extends Route {
  /** Root route marker */
  isRoot: true;
  /** Router context */
  context?: TRouterContext;
}
```

### Route Match Types

```typescript { .api }
interface RouteMatch {
  /** Match ID */
  id: string;
  /** Route ID this match represents */
  routeId: string;
  /** Pathname portion */
  pathname: string;
  /** Route parameters */
  params: Record<string, any>;
  /** Search parameters */
  search: Record<string, any>;
  /** Loader data */
  loaderData?: any;
  /** Route context */
  context: RouteContext;
  /** Match status */
  status: "pending" | "success" | "error" | "idle";
  /** Whether match is invalid */
  invalid: boolean;
  /** Error if any */
  error?: unknown;
  /** Updated timestamp */
  updatedAt: number;
}
```

### Component Types

```typescript { .api }
type RouteComponent = React.ComponentType<{
  useParams: () => any;
  useSearch: () => any;
  useLoaderData: () => any;
  useRouteContext: () => any;
  useNavigate: () => any;
}>;

type ErrorRouteComponent = React.ComponentType<{
  error: Error;
  info: { componentStack: string };
  reset: () => void;
}>;

type NotFoundRouteComponent = React.ComponentType<{
  data?: any;
}>;
```

### Loader Types

```typescript { .api }
type RouteLoaderFn<TRoute extends AnyRoute = AnyRoute> = (
  context: LoaderFnContext<TRoute>
) => any | Promise<any>;

interface LoaderFnContext<TRoute extends AnyRoute = AnyRoute> {
  /** Route parameters */
  params: ResolveParams<TRoute>;
  /** Search parameters */
  search: InferFullSearchSchema<TRoute>;
  /** Route context */
  context: RouteContext<TRoute>;
  /** Location object */
  location: ParsedLocation;
  /** Abort signal */
  signal: AbortSignal;
}
```