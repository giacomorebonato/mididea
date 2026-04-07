# React Hooks

React hooks for accessing router state, navigation functions, route data, parameters, and managing router interactions. These hooks provide type-safe access to all router functionality.

## Capabilities

### Router Access Hooks

Hooks for accessing the router instance and router state.

```typescript { .api }
/**
 * Access the router instance
 * @param opts - Options for router access
 * @returns Router instance
 */
function useRouter<TRouter extends AnyRouter = RegisteredRouter>(
  opts?: { warn?: boolean }
): TRouter;

/**
 * Subscribe to router state changes
 * @param opts - Router state subscription options
 * @returns Selected router state
 */
function useRouterState<
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = RouterState<TRouter>,
  TStructuralSharing extends boolean = true
>(
  opts?: {
    router?: TRouter;
    select?: (state: RouterState<TRouter>) => TSelected;
    structuralSharing?: TStructuralSharing;
  }
): UseRouterStateResult<TRouter, TSelected>;
```

**Usage Examples:**

```typescript
import { useRouter, useRouterState } from "@tanstack/react-router";

function MyComponent() {
  // Access router instance
  const router = useRouter();

  // Subscribe to loading state
  const isLoading = useRouterState({
    select: (state) => state.isLoading,
  });

  // Subscribe to current location
  const location = useRouterState({
    select: (state) => state.location,
  });

  return (
    <div>
      Current path: {location.pathname}
      {isLoading && <div>Loading...</div>}
    </div>
  );
}
```

### Navigation Hooks

Hooks for programmatic navigation and location access.

```typescript { .api }
/**
 * Get navigation function for programmatic navigation
 * @param defaultOpts - Default navigation options
 * @returns Type-safe navigation function
 */
function useNavigate<
  TRouter extends AnyRouter = RegisteredRouter,
  TDefaultFrom extends RoutePaths<TRouter> = "/"
>(
  defaultOpts?: { from?: TDefaultFrom }
): UseNavigateResult<TRouter, TDefaultFrom>;

/**
 * Access current location with optional selection
 * @param opts - Location access options
 * @returns Current location or selected subset
 */
function useLocation<
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = ParsedLocation,
  TStructuralSharing extends boolean = true
>(
  opts?: {
    select?: (location: ParsedLocation) => TSelected;
    structuralSharing?: TStructuralSharing;
  }
): UseLocationResult<TSelected>;

/**
 * Check if browser can navigate back
 * @returns Whether back navigation is possible
 */
function useCanGoBack(): boolean;
```

**Usage Examples:**

```typescript
import { useNavigate, useLocation, useCanGoBack } from "@tanstack/react-router";

function NavigationComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = useCanGoBack();

  // Navigate programmatically
  const handleNavigate = () => {
    navigate({
      to: "/posts/$postId",
      params: { postId: "123" },
      search: { tab: "comments" },
    });
  };

  // Navigate with state
  const handleNavigateWithState = () => {
    navigate({
      to: "/profile",
      state: { fromDashboard: true },
      replace: true,
    });
  };

  return (
    <div>
      <p>Current path: {location.pathname}</p>
      <button onClick={handleNavigate}>Go to Post</button>
      <button onClick={() => navigate({ to: -1 })} disabled={!canGoBack}>
        Go Back
      </button>
    </div>
  );
}
```

### Route Data Hooks

Hooks for accessing route-specific data, parameters, and search values.

```typescript { .api }
/**
 * Access route parameters with type safety
 * @param opts - Params access options
 * @returns Route parameters or selected subset
 */
function useParams<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RoutePaths<TRouter> = "/",
  TStrict extends boolean = true,
  TThrow extends boolean = true,
  TSelected = ResolveParams<TRouter, TFrom>,
  TStructuralSharing extends boolean = true
>(
  opts?: {
    from?: TFrom;
    strict?: TStrict;
    shouldThrow?: TThrow;
    select?: (params: ResolveParams<TRouter, TFrom>) => TSelected;
    structuralSharing?: TStructuralSharing;
  }
): UseParamsResult<TRouter, TFrom, TStrict, TThrow, TSelected>;

/**
 * Access search parameters with type safety
 * @param opts - Search access options
 * @returns Search parameters or selected subset
 */
function useSearch<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RoutePaths<TRouter> = "/",
  TStrict extends boolean = true,
  TThrow extends boolean = true,
  TSelected = InferFullSearchSchema<TRouter, TFrom>,
  TStructuralSharing extends boolean = true
>(
  opts?: {
    from?: TFrom;
    strict?: TStrict;
    shouldThrow?: TThrow;
    select?: (search: InferFullSearchSchema<TRouter, TFrom>) => TSelected;
    structuralSharing?: TStructuralSharing;
  }
): UseSearchResult<TRouter, TFrom, TStrict, TThrow, TSelected>;

/**
 * Access loader data from route
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

/**
 * Access route context
 * @param opts - Route context access options
 * @returns Route context or selected subset
 */
function useRouteContext<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RoutePaths<TRouter> = "/",
  TStrict extends boolean = true,
  TSelected = RouteContext<TRouter, TFrom>,
  TStructuralSharing extends boolean = true
>(
  opts?: {
    from?: TFrom;
    strict?: TStrict;
    select?: (context: RouteContext<TRouter, TFrom>) => TSelected;
    structuralSharing?: TStructuralSharing;
  }
): UseRouteContextResult<TRouter, TFrom, TStrict, TSelected>;
```

**Usage Examples:**

```typescript
import { useParams, useSearch, useLoaderData, useRouteContext } from "@tanstack/react-router";

function PostDetail() {
  // Access route parameters
  const { postId } = useParams({ from: "/posts/$postId" });

  // Access search parameters with selection
  const page = useSearch({
    from: "/posts/$postId",
    select: (search) => search.page || 1,
  });

  // Access loader data
  const { post, comments } = useLoaderData({ from: "/posts/$postId" });

  // Access route context
  const user = useRouteContext({
    select: (context) => context.user,
  });

  return (
    <div>
      <h1>{post.title}</h1>
      <p>Post ID: {postId}</p>
      <p>Page: {page}</p>
      <p>Viewing as: {user.name}</p>
    </div>
  );
}
```

### Route Match Hooks

Hooks for accessing route matches and match-related functionality.

```typescript { .api }
/**
 * Access route match data
 * @param opts - Match access options
 * @returns Route match or selected subset
 */
function useMatch<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RoutePaths<TRouter> = "/",
  TStrict extends boolean = true,
  TThrow extends boolean = true,
  TSelected = RouteMatch<TRouter, TFrom>,
  TStructuralSharing extends boolean = true
>(
  opts?: {
    from?: TFrom;
    strict?: TStrict;
    shouldThrow?: TThrow;
    select?: (match: RouteMatch<TRouter, TFrom>) => TSelected;
    structuralSharing?: TStructuralSharing;
  }
): UseMatchResult<TRouter, TFrom, TStrict, TThrow, TSelected>;

/**
 * Access all active route matches
 * @param opts - Matches access options
 * @returns Array of route matches or selected subset
 */
function useMatches<
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = RouteMatch[],
  TStructuralSharing extends boolean = true
>(
  opts?: {
    select?: (matches: RouteMatch[]) => TSelected;
    structuralSharing?: TStructuralSharing;
  }
): UseMatchesResult<TSelected>;

/**
 * Access parent matches relative to current match
 * @param opts - Parent matches access options
 * @returns Array of parent matches or selected subset
 */
function useParentMatches<
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = RouteMatch[],
  TStructuralSharing extends boolean = true
>(
  opts?: {
    select?: (matches: RouteMatch[]) => TSelected;
    structuralSharing?: TStructuralSharing;
  }
): UseMatchesResult<TSelected>;

/**
 * Access child matches relative to current match
 * @param opts - Child matches access options
 * @returns Array of child matches or selected subset
 */
function useChildMatches<
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = RouteMatch[],
  TStructuralSharing extends boolean = true
>(
  opts?: {
    select?: (matches: RouteMatch[]) => TSelected;
    structuralSharing?: TStructuralSharing;
  }
): UseMatchesResult<TSelected>;

/**
 * Get function to check if routes match current location
 * @returns Function that returns match params or false
 */
function useMatchRoute<TRouter extends AnyRouter = RegisteredRouter>(): (
  opts: UseMatchRouteOptions<TRouter>
) => false | AllParams<TRouter>;
```

**Usage Examples:**

```typescript
import { useMatch, useMatches, useParentMatches, useMatchRoute } from "@tanstack/react-router";

function RouteInfo() {
  // Access current match
  const match = useMatch();

  // Access all matches with breadcrumb info
  const breadcrumbs = useMatches({
    select: (matches) => matches.map(match => ({
      id: match.id,
      pathname: match.pathname,
      title: match.context?.title || match.routeId,
    })),
  });

  // Access parent matches
  const parentMatches = useParentMatches();

  // Check route matching
  const matchRoute = useMatchRoute();
  const isOnProfile = matchRoute({ to: "/profile" });

  return (
    <div>
      <nav>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.id}>{crumb.title} / </span>
        ))}
      </nav>
      <p>Current match: {match.routeId}</p>
      <p>Parent matches: {parentMatches.length}</p>
      {isOnProfile && <p>Currently on profile page</p>}
    </div>
  );
}
```

### Navigation Blocking Hooks

Hooks for blocking navigation based on conditions.

```typescript { .api }
/**
 * Block navigation conditionally
 * @param opts - Navigation blocking options
 * @returns Blocker resolver if using resolver pattern
 */
function useBlocker<
  TRouter extends AnyRouter = RegisteredRouter,
  TWithResolver extends boolean = false
>(
  opts: {
    shouldBlockFn: ShouldBlockFn;
    enableBeforeUnload?: boolean | (() => boolean);
    disabled?: boolean;
    withResolver?: TWithResolver;
  }
): TWithResolver extends true ? BlockerResolver : void;

type ShouldBlockFn = (
  fromLocation: ParsedLocation,
  toLocation: ParsedLocation
) => boolean;

interface BlockerResolver {
  status: "idle" | "blocked";
  confirm: () => void;
  cancel: () => void;
}
```

**Usage Examples:**

```typescript
import { useBlocker } from "@tanstack/react-router";

function FormWithUnsavedChanges() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Block navigation if there are unsaved changes
  useBlocker({
    shouldBlockFn: () => hasUnsavedChanges,
    enableBeforeUnload: true,
  });

  // With resolver pattern
  const blocker = useBlocker({
    shouldBlockFn: () => hasUnsavedChanges,
    withResolver: true,
  });

  return (
    <form>
      <input onChange={() => setHasUnsavedChanges(true)} />

      {blocker.status === "blocked" && (
        <div>
          <p>You have unsaved changes. Are you sure you want to leave?</p>
          <button onClick={blocker.confirm}>Yes, leave</button>
          <button onClick={blocker.cancel}>Stay</button>
        </div>
      )}
    </form>
  );
}
```

### Async Data Hooks

Hooks for handling deferred promises and async data.

```typescript { .api }
/**
 * Handle deferred promises with suspense
 * @param options - Await options
 * @returns Tuple of resolved data and promise state
 */
function useAwaited<T>(
  options: AwaitOptions<T>
): [T, DeferredPromise<T>];

interface AwaitOptions<T> {
  /** Promise to await */
  promise: Promise<T>;
}

interface DeferredPromise<T> extends Promise<T> {
  __deferredState: DeferredPromiseState<T>;
}

interface DeferredPromiseState<T> {
  status: "pending" | "success" | "error";
  data?: T;
  error?: any;
}
```

**Usage Examples:**

```typescript
import { useAwaited, defer } from "@tanstack/react-router";

function AsyncDataComponent() {
  const { deferredPosts } = useLoaderData();

  try {
    const [posts, promise] = useAwaited({ promise: deferredPosts });

    return (
      <div>
        <h2>Posts (Status: {promise.__deferredState.status})</h2>
        {posts.map(post => (
          <div key={post.id}>{post.title}</div>
        ))}
      </div>
    );
  } catch (promise) {
    // This will suspend until the promise resolves
    throw promise;
  }
}
```

### Link Props Hook

Hook for getting link element props with all link logic applied.

```typescript { .api }
/**
 * Get props for link elements with all link logic
 * @param options - Link options
 * @param forwardedRef - Optional forwarded ref
 * @returns Props object for anchor element
 */
function useLinkProps<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends string = string,
  TTo extends string | undefined = undefined,
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = ""
>(
  options: UseLinkPropsOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo>,
  forwardedRef?: React.ForwardedRef<Element>
): React.ComponentPropsWithRef<"a">;

interface UseLinkPropsOptions<TRouter extends AnyRouter, TFrom extends string, TTo extends string | undefined, TMaskFrom extends string, TMaskTo extends string>
  extends LinkOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo> {
  /** Disabled state */
  disabled?: boolean;
}
```

**Usage Examples:**

```typescript
import { useLinkProps } from "@tanstack/react-router";

function CustomLink({ to, children, ...props }) {
  const linkProps = useLinkProps({
    to,
    activeProps: { className: "active" },
    preload: "intent",
    ...props,
  });

  return (
    <a {...linkProps} className={`custom-link ${linkProps.className || ""}`}>
      {children}
    </a>
  );
}
```

### Utility Hooks

Utility hooks for common React patterns and DOM interactions.

```typescript { .api }
/**
 * Hook for accessing previous values across renders
 * @param value - Current value
 * @returns Previous value or null if no previous value
 */
function usePrevious<T>(value: T): T | null;

/**
 * Hook for stable callback references that don't cause re-renders
 * @param fn - Function to stabilize
 * @returns Stable function reference
 */
function useStableCallback<T extends (...args: Array<any>) => any>(fn: T): T;

/**
 * Hook for working with forwarded refs
 * @param ref - Forwarded ref from React.forwardRef
 * @returns Inner ref that can be used on DOM elements
 */
function useForwardedRef<T>(ref?: React.ForwardedRef<T>): React.RefObject<T>;

/**
 * Hook for IntersectionObserver functionality
 * @param ref - Ref to element to observe
 * @param callback - Callback when intersection changes
 * @param intersectionObserverOptions - IntersectionObserver options
 * @param options - Hook-specific options
 */
function useIntersectionObserver<T extends Element>(
  ref: React.RefObject<T | null>,
  callback: (entry: IntersectionObserverEntry | undefined) => void,
  intersectionObserverOptions?: IntersectionObserverInit,
  options?: { disabled?: boolean }
): void;

/**
 * Hook for custom element scroll restoration
 * @param options - Scroll restoration configuration
 * @returns Scroll restoration entry if available
 */
function useElementScrollRestoration(
  options: (
    | {
        id: string;
        getElement?: () => Window | Element | undefined | null;
      }
    | {
        id?: string;
        getElement: () => Window | Element | undefined | null;
      }
  ) & {
    getKey?: (location: ParsedLocation) => string;
  }
): ScrollRestorationEntry | undefined;
```

**Usage Examples:**

```typescript
import {
  usePrevious,
  useStableCallback,
  useForwardedRef,
  useIntersectionObserver,
  useElementScrollRestoration,
} from "@tanstack/react-router";

// Previous value tracking
function CounterComponent({ count }: { count: number }) {
  const prevCount = usePrevious(count);

  return (
    <div>
      Current: {count}, Previous: {prevCount}
    </div>
  );
}

// Stable callbacks to prevent re-renders
function ExpensiveComponent({ onUpdate }: { onUpdate: (data: any) => void }) {
  const stableOnUpdate = useStableCallback(onUpdate);

  // This won't cause child re-renders when onUpdate reference changes
  return <ChildComponent onUpdate={stableOnUpdate} />;
}

// Forwarded refs
const CustomInput = React.forwardRef<HTMLInputElement>((props, ref) => {
  const innerRef = useForwardedRef(ref);

  return <input ref={innerRef} {...props} />;
});

// Intersection observer
function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useIntersectionObserver(
    imgRef,
    (entry) => {
      if (entry?.isIntersecting) {
        setIsVisible(true);
      }
    },
    { rootMargin: "100px" }
  );

  return (
    <img
      ref={imgRef}
      src={isVisible ? src : undefined}
      alt={alt}
    />
  );
}

// Element scroll restoration
function CustomScrollableComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollEntry = useElementScrollRestoration({
    id: "custom-scrollable",
    getElement: () => containerRef.current,
  });

  useEffect(() => {
    if (scrollEntry && containerRef.current) {
      containerRef.current.scrollTop = scrollEntry.scrollY;
    }
  }, [scrollEntry]);

  return <div ref={containerRef}>...</div>;
}
```

## Types

### Hook Result Types

```typescript { .api }
type UseNavigateResult<TRouter extends AnyRouter, TDefaultFrom extends RoutePaths<TRouter>> =
  <TTo extends RoutePaths<TRouter> = "/", TFrom extends RoutePaths<TRouter> = TDefaultFrom>(
    options: NavigateOptions<TRouter, TFrom, TTo>
  ) => Promise<void>;

type UseLocationResult<TSelected> = TSelected extends ParsedLocation
  ? ParsedLocation
  : TSelected;

type UseParamsResult<TRouter extends AnyRouter, TFrom extends RoutePaths<TRouter>, TStrict extends boolean, TThrow extends boolean, TSelected> =
  TStrict extends false
    ? TThrow extends false
      ? TSelected | undefined
      : TSelected
    : TSelected;

type UseSearchResult<TRouter extends AnyRouter, TFrom extends RoutePaths<TRouter>, TStrict extends boolean, TThrow extends boolean, TSelected> =
  TStrict extends false
    ? TThrow extends false
      ? TSelected | undefined
      : TSelected
    : TSelected;

type UseMatchesResult<TSelected> = TSelected;
```

### Hook Options Types

```typescript { .api }
interface UseMatchRouteOptions<TRouter extends AnyRouter = AnyRouter> {
  to: RoutePaths<TRouter>;
  params?: Record<string, any>;
  search?: Record<string, any>;
  hash?: string;
  fuzzy?: boolean;
  includeSearch?: boolean;
  includeHash?: boolean;
}
```