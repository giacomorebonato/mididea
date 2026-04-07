# Router Creation & Configuration

Core router setup and configuration for creating type-safe routing instances with comprehensive options for data loading, caching, error handling, and SSR support.

## Capabilities

### Router Creation

Creates a new router instance with the specified route tree and configuration options.

```typescript { .api }
/**
 * Create a router instance with route tree and configuration
 * @param options - Router configuration options including route tree, history, and defaults
 * @returns Router instance for use with RouterProvider
 */
function createRouter<TRouteTree extends AnyRoute>(
  options: RouterConstructorOptions<TRouteTree>
): Router<TRouteTree>;

interface RouterConstructorOptions<TRouteTree extends AnyRoute> {
  /** The route tree defining all application routes */
  routeTree: TRouteTree;
  /** History instance for navigation (defaults to createBrowserHistory()) */
  history?: RouterHistory;
  /** Base path for the router */
  basepath?: string;
  /** Router context shared across all routes */
  context?: TRouterContext;
  /** Default preload strategy for routes */
  defaultPreload?: false | "intent" | "render" | "viewport";
  /** Default preload delay in milliseconds */
  defaultPreloadDelay?: number;
  /** Default component used when route has no component */
  defaultComponent?: RouteComponent;
  /** Default error component for route errors */
  defaultErrorComponent?: ErrorRouteComponent;
  /** Default pending component shown during loading */
  defaultPendingComponent?: RouteComponent;
  /** Default not found component for 404 errors */
  defaultNotFoundComponent?: NotFoundRouteComponent;
  /** Minimum time to show pending component */
  defaultPendingMinMs?: number;
  /** Default time before showing pending component */
  defaultPendingMs?: number;
  /** Default stale time for route data */
  defaultStaleTime?: number;
  /** Default garbage collection time */
  defaultGcTime?: number;
  /** Whether routes are case sensitive */
  caseSensitive?: boolean;
  /** Trailing slash handling */
  trailingSlash?: "always" | "never" | "preserve";
  /** Enable structural sharing by default */
  defaultStructuralSharing?: boolean;
  /** Router wrapper component */
  Wrap?: (props: { children: React.ReactNode }) => JSX.Element;
  /** Inner router wrapper component */
  InnerWrap?: (props: { children: React.ReactNode }) => JSX.Element;
  /** Default error handler */
  defaultOnCatch?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

**Usage Examples:**

```typescript
import { createRouter, createBrowserHistory } from "@tanstack/react-router";

// Basic router creation
const router = createRouter({
  routeTree,
});

// Router with custom configuration
const router = createRouter({
  routeTree,
  basepath: "/app",
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  caseSensitive: true,
  trailingSlash: "never",
  defaultComponent: () => <div>Loading...</div>,
  defaultErrorComponent: ({ error }) => <div>Error: {error.message}</div>,
});

// Router with custom history
const customHistory = createBrowserHistory();
const router = createRouter({
  routeTree,
  history: customHistory,
  context: {
    user: { id: "123", name: "John" },
    theme: "dark",
  },
});
```

### Router Configuration

Creates a router configuration object for advanced scenarios.

```typescript { .api }
/**
 * Create a router configuration object
 * @param config - Router configuration
 * @returns Router configuration object
 */
function createRouterConfig<TRouteTree extends AnyRoute>(
  config: RouterConstructorOptions<TRouteTree>
): RouterConfig<TRouteTree>;
```

### Router Class

The main router class that manages navigation state, route matching, and lifecycle.

```typescript { .api }
class Router<TRouteTree extends AnyRoute = AnyRoute> {
  /** Router history instance */
  history: RouterHistory;
  /** Current router state */
  state: RouterState<TRouteTree>;
  /** Route tree */
  routeTree: TRouteTree;
  /** Router options */
  options: RouterOptions;

  /**
   * Navigate to a new location
   * @param options - Navigation options
   * @returns Promise that resolves when navigation completes
   */
  navigate<TFrom extends RoutePaths<TRouteTree> = "/">(
    options: NavigateOptions<TRouteTree, TFrom>
  ): Promise<void>;

  /**
   * Build a location object from navigation options
   * @param options - Navigation options
   * @returns Parsed location object
   */
  buildLocation<TFrom extends RoutePaths<TRouteTree> = "/">(
    options: BuildLocationOptions<TRouteTree, TFrom>
  ): ParsedLocation;

  /**
   * Invalidate all route matches
   * @returns Promise that resolves when invalidation completes
   */
  invalidate(): Promise<void>;

  /**
   * Load a route by location
   * @param location - Location to load
   * @returns Promise that resolves when loading completes
   */
  load(location?: ParsedLocation): Promise<void>;

  /**
   * Preload a route
   * @param options - Navigation options for route to preload
   * @returns Promise that resolves when preloading completes
   */
  preloadRoute<TFrom extends RoutePaths<TRouteTree> = "/">(
    options: NavigateOptions<TRouteTree, TFrom>
  ): Promise<void>;

  /**
   * Subscribe to router state changes
   * @param fn - Listener function
   * @returns Unsubscribe function
   */
  subscribe(fn: (state: RouterState<TRouteTree>) => void): () => void;

  /**
   * Match routes for a location
   * @param location - Location to match
   * @returns Array of route matches
   */
  matchRoutes(location: ParsedLocation): RouteMatch[];
}
```

## Types

### Router State

```typescript { .api }
interface RouterState<TRouteTree extends AnyRoute = AnyRoute> {
  /** Current location */
  location: ParsedLocation;
  /** Currently matched routes */
  matches: RouteMatch[];
  /** Pending matches during navigation */
  pendingMatches?: RouteMatch[];
  /** Whether router is in loading state */
  isLoading: boolean;
  /** Whether router is transitioning between routes */
  isTransitioning: boolean;
  /** Last updated timestamp */
  lastUpdated: number;
  /** Navigation status */
  status: "idle" | "pending" | "success" | "error";
}
```

### Router Events

```typescript { .api }
interface RouterEvents {
  onBeforeLoad: (event: {
    router: Router;
    fromLocation: ParsedLocation;
    toLocation: ParsedLocation;
  }) => void;
  onLoad: (event: {
    router: Router;
    fromLocation: ParsedLocation;
    toLocation: ParsedLocation;
  }) => void;
  onBeforeNavigate: (event: {
    router: Router;
    fromLocation: ParsedLocation;
    toLocation: ParsedLocation;
  }) => void;
  onNavigate: (event: {
    router: Router;
    fromLocation: ParsedLocation;
    toLocation: ParsedLocation;
  }) => void;
}
```

### History Types

```typescript { .api }
interface RouterHistory {
  /** Current location */
  location: HistoryLocation;
  /** Go back in history */
  back(): void;
  /** Go forward in history */
  forward(): void;
  /** Go to specific history entry */
  go(n: number): void;
  /** Push new location */
  push(path: string, state?: any): void;
  /** Replace current location */
  replace(path: string, state?: any): void;
  /** Create href for path */
  createHref(path: string): string;
  /** Subscribe to location changes */
  subscribe(fn: (location: HistoryLocation) => void): () => void;
}

interface HistoryLocation {
  pathname: string;
  search: string;
  hash: string;
  state?: any;
  key?: string;
}
```