# React Components

Essential React components for router setup, navigation, route rendering, error handling, and SSR support. These components provide the UI layer for TanStack React Router functionality.

## Capabilities

### Router Provider

Main provider component that wraps the application and provides router context to all child components.

```typescript { .api }
/**
 * Router provider component that wraps the application
 * @param props - Router provider props
 * @returns JSX element providing router context
 */
function RouterProvider<TRouter extends AnyRouter, TDehydrated = unknown>(
  props: RouterProps<TRouter, TDehydrated>
): JSX.Element;

interface RouterProps<TRouter extends AnyRouter, TDehydrated = unknown> {
  /** Router instance */
  router: TRouter;
  /** Dehydrated state for SSR */
  dehydratedState?: TDehydrated;
  /** Additional context */
  context?: Partial<TRouter["options"]["context"]>;
  /** Default component */
  defaultComponent?: RouteComponent;
  /** Default error component */
  defaultErrorComponent?: ErrorRouteComponent;
  /** Default pending component */
  defaultPendingComponent?: RouteComponent;
  /** Default not found component */
  defaultNotFoundComponent?: NotFoundRouteComponent;
}
```

**Usage Examples:**

```typescript
import { RouterProvider, createRouter } from "@tanstack/react-router";

function App() {
  return (
    <RouterProvider
      router={router}
      context={{
        user: getCurrentUser(),
        theme: "dark",
      }}
    />
  );
}

// With SSR
function App({ dehydratedState }: { dehydratedState: any }) {
  return (
    <RouterProvider
      router={router}
      dehydratedState={dehydratedState}
      defaultPendingComponent={() => <div>Loading...</div>}
    />
  );
}
```

### Router Context Provider

Lower-level provider that only provides router context without rendering matches.

```typescript { .api }
/**
 * Router context provider without match rendering
 * @param props - Context provider props
 * @returns JSX element providing router context only
 */
function RouterContextProvider<TRouter extends AnyRouter>(
  props: {
    router: TRouter;
    children: React.ReactNode;
  }
): JSX.Element;
```

### Navigation Link

Navigation link component with active state management, preloading, and type-safe parameters.

```typescript { .api }
/**
 * Navigation link component with active state and preloading
 * @param props - Link component props
 * @returns JSX anchor element with router functionality
 */
function Link<TRouter extends AnyRouter = RegisteredRouter, TFrom extends string = string>(
  props: LinkProps<TRouter, TFrom>
): JSX.Element;

interface LinkProps<TRouter extends AnyRouter = RegisteredRouter, TFrom extends string = string>
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Destination path */
  to?: ToPathOption;
  /** Source path for relative navigation */
  from?: TFrom;
  /** Path parameters */
  params?: MakeRouteMatch["params"];
  /** Search parameters */
  search?: MakeRouteMatch["search"] | ((prev: any) => any);
  /** Hash fragment */
  hash?: string | ((prev: string) => string);
  /** History state */
  state?: any;
  /** Route mask options */
  mask?: ToMaskOptions;
  /** Props when link is active */
  activeProps?: React.AnchorHTMLAttributes<HTMLAnchorElement> | (() => React.AnchorHTMLAttributes<HTMLAnchorElement>);
  /** Props when link is inactive */
  inactiveProps?: React.AnchorHTMLAttributes<HTMLAnchorElement> | (() => React.AnchorHTMLAttributes<HTMLAnchorElement>);
  /** Active matching options */
  activeOptions?: ActiveLinkOptions;
  /** Preload strategy */
  preload?: false | "intent" | "render" | "viewport";
  /** Preload delay in milliseconds */
  preloadDelay?: number;
  /** Use replace instead of push */
  replace?: boolean;
  /** Reset scroll position */
  resetScroll?: boolean;
  /** Scroll hash target into view */
  hashScrollIntoView?: boolean;
  /** Wrap navigation in startTransition */
  startTransition?: boolean;
  /** Enable view transitions */
  viewTransition?: boolean;
  /** Ignore navigation blockers */
  ignoreBlocker?: boolean;
  /** Child content */
  children?: React.ReactNode | ((state: { isActive: boolean; isTransitioning: boolean }) => React.ReactNode);
}
```

**Usage Examples:**

```typescript
import { Link } from "@tanstack/react-router";

// Basic link
<Link to="/about">About</Link>

// Link with parameters
<Link to="/posts/$postId" params={{ postId: "123" }}>
  View Post
</Link>

// Link with search params and active styles
<Link
  to="/search"
  search={{ q: "react", page: 1 }}
  activeProps={{ className: "active" }}
  preload="intent"
>
  Search
</Link>

// Link with render prop children
<Link to="/profile">
  {({ isActive, isTransitioning }) => (
    <span className={isActive ? "active" : ""}>
      Profile {isTransitioning && "..."}
    </span>
  )}
</Link>
```

### Route Rendering Components

Components for rendering route matches and providing outlet functionality.

```typescript { .api }
/**
 * Renders a specific route match with error boundaries and suspense
 * @param props - Match component props
 * @returns JSX element rendering the route match
 */
function Match(props: { matchId: string }): JSX.Element;

/**
 * Renders child route matches, acts as placeholder for nested routes
 * @returns JSX element rendering child routes
 */
function Outlet(): JSX.Element;

/**
 * Root component that renders all active route matches
 * @returns JSX element rendering all matches
 */
function Matches(): JSX.Element;
```

**Usage Examples:**

```typescript
import { Match, Outlet, Matches } from "@tanstack/react-router";

// In root route component
function RootLayout() {
  return (
    <div>
      <nav>Navigation</nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

// Custom match rendering
function CustomRenderer() {
  return (
    <div>
      <Match matchId="specific-route-id" />
    </div>
  );
}

// Complete match rendering
function App() {
  return <Matches />;
}
```

### Conditional Rendering

Component for conditionally rendering based on route matches.

```typescript { .api }
/**
 * Conditionally renders children based on route match
 * @param props - MatchRoute component props
 * @returns JSX element or null based on match
 */
function MatchRoute<TRouter extends AnyRouter = RegisteredRouter>(
  props: MakeMatchRouteOptions<TRouter> & {
    children?: React.ReactNode | ((params: any) => React.ReactNode);
  }
): JSX.Element | null;
```

**Usage Examples:**

```typescript
import { MatchRoute } from "@tanstack/react-router";

// Show content only on specific route
<MatchRoute to="/dashboard" params={{ tab: "analytics" }}>
  <AnalyticsDashboard />
</MatchRoute>

// With render prop
<MatchRoute to="/posts/$postId">
  {(params) => <PostDetails postId={params.postId} />}
</MatchRoute>
```

### Navigation Components

Components for programmatic navigation.

```typescript { .api }
/**
 * Imperatively navigates when rendered
 * @param props - Navigate component props
 * @returns null (triggers navigation side effect)
 */
function Navigate<TRouter extends AnyRouter = RegisteredRouter>(
  props: NavigateOptions<TRouter>
): null;
```

**Usage Examples:**

```typescript
import { Navigate } from "@tanstack/react-router";

function LoginRedirect() {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Dashboard />;
}
```

### Error Handling Components

Components for handling errors and not found states.

```typescript { .api }
/**
 * Error boundary for catching and handling errors
 * @param props - CatchBoundary component props
 * @returns JSX element with error boundary functionality
 */
function CatchBoundary(props: CatchBoundaryProps): JSX.Element;

interface CatchBoundaryProps {
  /** Function to get reset key for boundary reset */
  getResetKey: () => string | number;
  /** Child components */
  children: React.ReactNode;
  /** Error component to render */
  errorComponent?: ErrorRouteComponent;
  /** Error handler callback */
  onCatch?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Default error display component
 * @param props - Error component props
 * @returns JSX element displaying error
 */
function ErrorComponent(props: { error: any }): JSX.Element;

/**
 * Boundary specifically for handling not found errors
 * @param props - CatchNotFound component props
 * @returns JSX element with not found error handling
 */
function CatchNotFound(props: {
  fallback?: (error: NotFoundError) => React.ReactElement;
  onCatch?: (error: Error, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
}): JSX.Element;

/**
 * Default global not found component
 * @returns JSX element for 404 errors
 */
function DefaultGlobalNotFound(): JSX.Element;
```

**Usage Examples:**

```typescript
import { CatchBoundary, ErrorComponent, CatchNotFound } from "@tanstack/react-router";

// Error boundary with custom error component
<CatchBoundary
  getResetKey={() => window.location.pathname}
  errorComponent={({ error, reset }) => (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )}
  onCatch={(error, errorInfo) => {
    console.error("Route error:", error, errorInfo);
  }}
>
  <App />
</CatchBoundary>

// Not found boundary
<CatchNotFound
  fallback={(error) => <div>Page not found: {error.message}</div>}
>
  <Routes />
</CatchNotFound>
```

### Async Components

Components for handling asynchronous operations and promises.

```typescript { .api }
/**
 * Suspense-based promise resolution component
 * @param props - Await component props
 * @returns JSX element with promise handling
 */
function Await<T>(props: AwaitOptions<T> & {
  fallback?: React.ReactNode;
  children: (result: T) => React.ReactNode;
}): JSX.Element;

interface AwaitOptions<T> {
  /** Promise to await */
  promise: Promise<T>;
}
```

**Usage Examples:**

```typescript
import { Await, defer } from "@tanstack/react-router";

// In route loader
const Route = createRoute({
  path: "/posts",
  loader: () => ({
    posts: defer(fetchPosts()),
  }),
  component: PostsPage,
});

function PostsPage() {
  const { posts } = Route.useLoaderData();

  return (
    <Await promise={posts} fallback={<div>Loading posts...</div>}>
      {(posts) => (
        <div>
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </Await>
  );
}
```

### Navigation Blocking

Components for blocking navigation based on conditions.

```typescript { .api }
/**
 * Blocks navigation based on conditions
 * @param props - Block component props
 * @returns JSX element or null
 */
function Block<TRouter extends AnyRouter = RegisteredRouter>(
  props: BlockProps<TRouter>
): JSX.Element | null;

interface BlockProps<TRouter extends AnyRouter = RegisteredRouter> {
  /** Function to determine if navigation should be blocked */
  shouldBlockFn: ShouldBlockFn;
  /** Enable beforeunload blocking */
  enableBeforeUnload?: boolean | (() => boolean);
  /** Disable the blocker */
  disabled?: boolean;
  /** Use resolver pattern */
  withResolver?: boolean;
  /** Child content */
  children?: React.ReactNode | ((resolver: any) => React.ReactNode);
}
```

### Client-Side Only Components

Components that only render on the client side.

```typescript { .api }
/**
 * Only renders children on client side
 * @param props - ClientOnly component props
 * @returns JSX element or fallback
 */
function ClientOnly(props: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): JSX.Element;
```

### Utility Components

Utility components for safe rendering and common patterns.

```typescript { .api }
/**
 * Safe fragment component for wrapping children
 * @param props - Component props with children
 * @returns JSX fragment with children
 */
function SafeFragment(props: { children?: React.ReactNode }): JSX.Element;
```

**Usage Examples:**

```typescript
import { SafeFragment } from "@tanstack/react-router";

function MyComponent() {
  return (
    <SafeFragment>
      <div>Child 1</div>
      <div>Child 2</div>
    </SafeFragment>
  );
}

// Useful for conditional rendering
function ConditionalContent({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <SafeFragment>
      {items.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </SafeFragment>
  );
}
```

### SSR Components

Components for server-side rendering and asset management.

```typescript { .api }
/**
 * Renders route-specific and manifest scripts (SSR)
 * @returns JSX element with script tags
 */
function Scripts(): JSX.Element;

/**
 * Renders various HTML assets (scripts, styles, meta, etc.)
 * @param props - Asset component props
 * @returns JSX element with asset tags
 */
function Asset(props: RouterManagedTag & { nonce?: string }): JSX.Element;

/**
 * Renders head content from route matches
 * @returns JSX element with head content
 */
function HeadContent(): JSX.Element;

/**
 * Ensures scripts are only rendered once
 * @param props - Script attributes
 * @returns JSX script element
 */
function ScriptOnce(props: React.ScriptHTMLAttributes<HTMLScriptElement>): JSX.Element;
```

### Lazy Loading Components

Utilities for creating lazy-loaded route components with automatic code splitting.

```typescript { .api }
/**
 * Create a lazy route component with dynamic import
 * @param importer - Function that returns a dynamic import promise
 * @param exportName - Named export to use (defaults to 'default')
 * @returns Lazy component with preload capability
 */
function lazyRouteComponent<
  T extends Record<string, any>,
  TKey extends keyof T = 'default'
>(
  importer: () => Promise<T>,
  exportName?: TKey
): T[TKey] extends (props: infer TProps) => any
  ? AsyncRouteComponent<TProps>
  : never;

/**
 * Create a lazy component wrapper
 * @param fn - Function that returns a dynamic import promise
 * @returns Lazy component
 */
function lazyFn<T>(fn: () => Promise<T>): LazyComponent<T>;

/**
 * Component types available for routes
 * Array of valid component type strings
 */
declare const componentTypes: string[];
```

**Usage Examples:**

```typescript
import { lazyRouteComponent } from "@tanstack/react-router";

// Lazy load a default export
const LazyDashboard = lazyRouteComponent(() => import("./Dashboard"));

// Lazy load a named export
const LazySettings = lazyRouteComponent(
  () => import("./SettingsComponents"),
  "SettingsPage"
);

// Use in route definition
const dashboardRoute = createRoute({
  path: "/dashboard",
  component: LazyDashboard,
});

// Preload component
LazyDashboard.preload();

// With error handling
const LazyComponent = lazyRouteComponent(() =>
  import("./Component").catch(error => {
    console.error("Failed to load component:", error);
    throw error;
  })
);
```

### Scroll Management

Components for managing scroll position and restoration.

```typescript { .api }
/**
 * Handles scroll position restoration
 * @param props - ScrollRestoration component props
 * @returns null (manages scroll as side effect)
 */
function ScrollRestoration(props: {
  getKey?: (location: ParsedLocation) => string;
}): null;
```

## Types

### Component Props Types

```typescript { .api }
interface ActiveLinkOptions {
  /** Exact path matching */
  exact?: boolean;
  /** Include hash in matching */
  includeHash?: boolean;
  /** Include search in matching */
  includeSearch?: boolean;
}

interface RouterManagedTag {
  tag: "script" | "style" | "link" | "meta";
  attrs?: Record<string, string>;
  children?: string;
}
```