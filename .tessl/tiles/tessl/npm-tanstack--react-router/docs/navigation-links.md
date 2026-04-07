# Navigation & Links

Navigation utilities, link components, and programmatic navigation with type-safe parameter handling, URL masking, and advanced navigation features.

## Capabilities

### Redirection

Create redirect responses for use in route loaders and actions.

```typescript { .api }
/**
 * Create a redirect response
 * @param options - Redirect configuration options
 * @returns Redirect object for throwing from loaders/actions
 */
function redirect<TRouter extends AnyRouter = AnyRouter>(
  options: RedirectOptions<TRouter>
): Redirect;

interface RedirectOptions<TRouter extends AnyRouter = AnyRouter> {
  /** Redirect destination path */
  to?: string;
  /** Search parameters for redirect */
  search?: Record<string, any> | ((current: any) => Record<string, any>);
  /** Path parameters for redirect */
  params?: Record<string, any>;
  /** Hash fragment for redirect */
  hash?: string | ((current: string) => string);
  /** History state */
  state?: any;
  /** Use replace instead of push */
  replace?: boolean;
  /** HTTP status code (SSR) */
  statusCode?: number;
  /** HTTP headers (SSR) */
  headers?: Record<string, string>;
}

/**
 * Type guard for redirect objects
 * @param obj - Object to check
 * @returns Whether object is a redirect
 */
function isRedirect(obj: any): obj is Redirect;

interface Redirect {
  code: "REDIRECT";
  statusCode: number;
  headers: Record<string, string>;
  href: string;
}
```

**Usage Examples:**

```typescript
import { redirect } from "@tanstack/react-router";

// In route loader
const postRoute = createRoute({
  path: "/posts/$postId",
  loader: async ({ params, context }) => {
    const post = await fetchPost(params.postId);

    // Redirect if post not found
    if (!post) {
      throw redirect({
        to: "/404",
        statusCode: 404,
      });
    }

    // Redirect if user doesn't have permission
    if (!context.user.canViewPost(post)) {
      throw redirect({
        to: "/login",
        search: { redirect: `/posts/${params.postId}` },
        replace: true,
      });
    }

    return { post };
  },
});

// Conditional redirect in component
function ProtectedRoute() {
  const { user } = useRouteContext();

  if (!user) {
    throw redirect({ to: "/login" });
  }

  return <Dashboard />;
}
```

### Link Utilities

Utilities for creating custom link components and validating link options.

```typescript { .api }
/**
 * Create a custom link component with any element
 * @param Comp - Base component to wrap with link functionality
 * @returns Link component with router functionality
 */
function createLink<TComp extends React.ComponentType<any>>(
  Comp: TComp
): LinkComponent<TComp>;

/**
 * Validate and return link options with type safety
 * @param options - Link options to validate
 * @returns Validated link options
 */
function linkOptions<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends string = string,
  TTo extends string | undefined = undefined,
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = ""
>(
  options: LinkOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo>
): LinkOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo>;

type LinkComponent<TComp> = React.ForwardRefExoticComponent<
  Omit<React.ComponentProps<TComp>, keyof LinkProps> & LinkProps
>;
```

**Usage Examples:**

```typescript
import { createLink, linkOptions } from "@tanstack/react-router";

// Create custom link with button
const ButtonLink = createLink("button");

function CustomNavigation() {
  return (
    <ButtonLink
      to="/dashboard"
      params={{ userId: "123" }}
      activeProps={{ className: "active-button" }}
    >
      Dashboard
    </ButtonLink>
  );
}

// Create link with custom component
const CardLink = createLink(({ children, ...props }) => (
  <div className="card" {...props}>
    {children}
  </div>
));

// Validate link options
function ValidatedLink({ to, ...options }) {
  const validatedOptions = linkOptions({
    to,
    preload: "intent",
    activeOptions: { exact: true },
    ...options,
  });

  return <Link {...validatedOptions} />;
}
```

### Navigation History

Create and manage browser history for navigation.

```typescript { .api }
/**
 * Create a browser history instance
 * @param options - Browser history options
 * @returns Browser history instance
 */
function createBrowserHistory(options?: {
  basename?: string;
  window?: Window;
}): RouterHistory;

/**
 * Create a hash history instance
 * @param options - Hash history options
 * @returns Hash history instance
 */
function createHashHistory(options?: {
  basename?: string;
  window?: Window;
}): RouterHistory;

/**
 * Create a memory history instance for testing/SSR
 * @param options - Memory history options
 * @returns Memory history instance
 */
function createMemoryHistory(options?: {
  initialEntries?: string[];
  initialIndex?: number;
}): RouterHistory;

/**
 * Create a history instance (base function)
 * @param options - History options
 * @returns History instance
 */
function createHistory(options: {
  getLocation: () => HistoryLocation;
  listener: (fn: () => void) => () => void;
  pushState: (path: string, state?: any) => void;
  replaceState: (path: string, state?: any) => void;
  go: (n: number) => void;
  back: () => void;
  forward: () => void;
  createHref?: (path: string) => string;
}): RouterHistory;
```

**Usage Examples:**

```typescript
import { createBrowserHistory, createMemoryHistory, createRouter } from "@tanstack/react-router";

// Browser history with basename
const history = createBrowserHistory({
  basename: "/app",
});

const router = createRouter({
  routeTree,
  history,
});

// Memory history for testing
const testHistory = createMemoryHistory({
  initialEntries: ["/", "/about", "/contact"],
  initialIndex: 1, // Start at /about
});

// Hash history
const hashHistory = createHashHistory();
```

### Navigation Blocking

Utilities for blocking navigation under certain conditions.

```typescript { .api }
type BlockerFn = (args: {
  fromLocation: ParsedLocation;
  toLocation: ParsedLocation;
}) => boolean | Promise<boolean>;

type ShouldBlockFn = (
  fromLocation: ParsedLocation,
  toLocation: ParsedLocation
) => boolean;
```

### Route Matching Utilities

Utilities for checking route matches and building navigation options.

```typescript { .api }
/**
 * Check if current location matches route pattern
 * @param basepath - Base path
 * @param currentPathname - Current pathname
 * @param matchLocation - Location to match against
 * @returns Match result or false
 */
function matchPathname(
  basepath: string,
  currentPathname: string,
  matchLocation: MatchLocation
): MatchPathResult | false;

/**
 * Match route by path pattern
 * @param basepath - Base path
 * @param currentPathname - Current pathname
 * @param matchLocation - Location to match against
 * @returns Match result or false
 */
function matchByPath(
  basepath: string,
  currentPathname: string,
  matchLocation: MatchLocation
): MatchPathResult | false;

interface MatchLocation {
  to: string;
  params?: Record<string, any>;
  search?: Record<string, any>;
  hash?: string;
  fuzzy?: boolean;
  includeSearch?: boolean;
  includeHash?: boolean;
}

interface MatchPathResult {
  params: Record<string, string>;
}
```

### Build Navigation Functions

Utilities for building navigation and location objects.

```typescript { .api }
type BuildLocationFn<TRouter extends AnyRouter = AnyRouter> = <
  TFrom extends RoutePaths<TRouter> = "/",
  TTo extends string = "."
>(
  opts: BuildLocationOptions<TRouter, TFrom, TTo>
) => ParsedLocation;

interface BuildLocationOptions<TRouter extends AnyRouter, TFrom extends RoutePaths<TRouter>, TTo extends string> {
  to?: TTo;
  from?: TFrom;
  params?: Record<string, any>;
  search?: Record<string, any> | ((prev: any) => Record<string, any>);
  hash?: string | ((prev: string) => string);
  state?: any;
}

type NavigateFn<TRouter extends AnyRouter = AnyRouter> = <
  TFrom extends RoutePaths<TRouter> = "/",
  TTo extends string = "."
>(
  opts: NavigateOptions<TRouter, TFrom, TTo>
) => Promise<void>;
```

### Navigation Options Validation

Type-safe validation utilities for navigation options.

```typescript { .api }
type ValidateNavigateOptions<TRouter extends AnyRouter, TFrom extends string, TTo extends string> =
  NavigateOptions<TRouter, TFrom, TTo>;

type ValidateNavigateOptionsArray<T> = T extends ReadonlyArray<infer U>
  ? U extends { to: infer TTo; from?: infer TFrom }
    ? TTo extends string
      ? TFrom extends string | undefined
        ? ValidateNavigateOptions<RegisteredRouter, TFrom extends string ? TFrom : "/", TTo>
        : never
      : never
    : never
  : never;

type ValidateRedirectOptions<TRouter extends AnyRouter, TFrom extends string, TTo extends string> =
  RedirectOptions<TRouter>;

type ValidateRedirectOptionsArray<T> = T extends ReadonlyArray<infer U>
  ? U extends { to: infer TTo; from?: infer TFrom }
    ? TTo extends string
      ? TFrom extends string | undefined
        ? ValidateRedirectOptions<RegisteredRouter, TFrom extends string ? TFrom : "/", TTo>
        : never
      : never
    : never
  : never;
```

## Types

### Core Navigation Types

```typescript { .api }
interface NavigateOptions<
  TRouter extends AnyRouter = AnyRouter,
  TFrom extends RoutePaths<TRouter> = "/",
  TTo extends string = "."
> {
  /** Destination path */
  to?: TTo;
  /** Source path for relative navigation */
  from?: TFrom;
  /** Path parameters */
  params?: MakeRouteMatch<TRouter, TFrom, TTo>["params"];
  /** Search parameters */
  search?: MakeRouteMatch<TRouter, TFrom, TTo>["search"] | ((prev: any) => any);
  /** Hash fragment */
  hash?: string | ((prev: string) => string);
  /** History state */
  state?: any;
  /** Route mask options */
  mask?: ToMaskOptions<TRouter, TFrom, TTo>;
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
}

interface LinkOptions<
  TRouter extends AnyRouter = AnyRouter,
  TFrom extends string = string,
  TTo extends string | undefined = undefined,
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = ""
> extends NavigateOptions<TRouter, TFrom, TTo> {
  /** Props when link is active */
  activeProps?:
    | React.AnchorHTMLAttributes<HTMLAnchorElement>
    | (() => React.AnchorHTMLAttributes<HTMLAnchorElement>);
  /** Props when link is inactive */
  inactiveProps?:
    | React.AnchorHTMLAttributes<HTMLAnchorElement>
    | (() => React.AnchorHTMLAttributes<HTMLAnchorElement>);
  /** Active link matching options */
  activeOptions?: ActiveLinkOptions;
  /** Preload strategy */
  preload?: false | "intent" | "render" | "viewport";
  /** Preload delay in milliseconds */
  preloadDelay?: number;
  /** Disabled state */
  disabled?: boolean;
}

interface ActiveLinkOptions {
  /** Exact path matching */
  exact?: boolean;
  /** Include search parameters in matching */
  includeSearch?: boolean;
  /** Include hash in matching */
  includeHash?: boolean;
}
```

### Route Masking Types

```typescript { .api }
interface ToMaskOptions<
  TRouter extends AnyRouter = AnyRouter,
  TFrom extends string = string,
  TTo extends string = string
> {
  /** Masked destination */
  to?: string;
  /** Masked parameters */
  params?: Record<string, any>;
  /** Masked search parameters */
  search?: Record<string, any> | ((prev: any) => any);
  /** Masked hash */
  hash?: string | ((prev: string) => string);
  /** Unmask on reload */
  unmaskOnReload?: boolean;
}

interface RouteMask {
  from: string;
  to: string;
  params?: Record<string, any>;
  search?: Record<string, any>;
  hash?: string;
  unmaskOnReload?: boolean;
}
```

### Path Resolution Types

```typescript { .api }
type ToPathOption<
  TRouter extends AnyRouter = AnyRouter,
  TFrom extends RoutePaths<TRouter> = "/",
  TTo extends string = string
> = TTo | RelativeToPathAutoComplete<TRouter, TFrom, TTo>;

type RelativeToPathAutoComplete<
  TRouter extends AnyRouter,
  TFrom extends string,
  TTo extends string
> = TTo extends `..${infer _}`
  ? "../"
  : TTo extends `./${infer _}`
  ? "./"
  : TTo;

type AbsoluteToPath<TRouter extends AnyRouter, TTo extends string> = TTo;

type RelativeToPath<
  TRouter extends AnyRouter,
  TFrom extends string,
  TTo extends string
> = TTo extends "."
  ? TFrom
  : TTo extends `..${infer Rest}`
  ? RelativeToParentPath<TRouter, TFrom, Rest>
  : TTo extends `./${infer Rest}`
  ? RelativeToCurrentPath<TRouter, TFrom, Rest>
  : never;
```