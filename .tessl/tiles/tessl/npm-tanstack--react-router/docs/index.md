# TanStack React Router

TanStack React Router is a modern and scalable routing solution for React applications that provides end-to-end type safety, built-in data fetching, caching, and state management capabilities. It offers a comprehensive type-safe approach to routing with schema-driven search parameter validation, nested layouts with transitions and error boundaries, and advanced features like prefetching and invalidation.

## Package Information

- **Package Name**: @tanstack/react-router
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install @tanstack/react-router`

## Core Imports

```typescript
import {
  Router, createRouter, RouterProvider,
  Link, useNavigate, useParams, useSearch,
  createRoute, createRootRoute, createFileRoute
} from "@tanstack/react-router";
```

For CommonJS:

```javascript
const {
  Router, createRouter, RouterProvider,
  Link, useNavigate, useParams, useSearch,
  createRoute, createRootRoute, createFileRoute
} = require("@tanstack/react-router");
```

## Basic Usage

```typescript
import {
  createRouter, RouterProvider, createRootRoute,
  createRoute, Link, useNavigate, Outlet
} from "@tanstack/react-router";

// Create root route
const rootRoute = createRootRoute({
  component: () => (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Outlet />
    </div>
  ),
});

// Create route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <div>Welcome Home!</div>,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: () => <div>About Page</div>,
});

// Create router
const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
const router = createRouter({ routeTree });

// Use in app
function App() {
  return <RouterProvider router={router} />;
}
```

## Architecture

TanStack React Router is built around several key architectural components:

- **Router Core**: Central router instance managing navigation state, route matching, and lifecycle
- **Route Definition System**: Declarative route creation with type-safe parameter and search handling
- **Component System**: React components for navigation (Link), rendering (Match, Outlet), and error handling
- **Hook System**: React hooks for accessing router state, navigation, and route data
- **Data Loading**: Integrated loader system with caching, invalidation, and error boundaries
- **SSR Support**: Full server-side rendering capabilities with hydration
- **File-based Routing**: Optional file-based route organization with automatic type generation

## Capabilities

### Router Creation & Configuration

Core router setup and configuration for creating type-safe routing instances with comprehensive options for data loading, caching, and error handling.

```typescript { .api }
function createRouter<TRouteTree extends AnyRoute>(
  options: RouterConstructorOptions<TRouteTree>
): Router<TRouteTree>;

interface RouterConstructorOptions<TRouteTree extends AnyRoute> {
  routeTree: TRouteTree;
  history?: RouterHistory;
  basepath?: string;
  context?: TRouterContext;
  defaultPreload?: false | "intent" | "render" | "viewport";
  defaultComponent?: RouteComponent;
  defaultErrorComponent?: ErrorRouteComponent;
  defaultNotFoundComponent?: NotFoundRouteComponent;
}
```

[Router Creation & Configuration](./router-creation.md)

### Route Definition & Management

System for defining routes with type-safe parameters, search handling, data loading, and nested layouts.

```typescript { .api }
function createRoute<TParentRoute extends AnyRoute = AnyRoute>(
  options: RouteOptions<TParentRoute>
): Route<TParentRoute>;

function createRootRoute<TRouterContext = unknown>(
  options?: RootRouteOptions<TRouterContext>
): RootRoute<TRouterContext>;

function createFileRoute<TFilePath extends string>(
  path?: TFilePath
): FileRoute;
```

[Route Definition & Management](./route-definition.md)

### React Components

Essential React components for router setup, navigation, route rendering, and error handling.

```typescript { .api }
function RouterProvider<TRouter extends AnyRouter, TDehydrated = unknown>(
  props: RouterProps<TRouter, TDehydrated>
): JSX.Element;

function Link<TRouter extends AnyRouter = RegisteredRouter, TFrom extends string = string>(
  props: LinkProps<TRouter, TFrom>
): JSX.Element;

function Match(props: { matchId: string }): JSX.Element;

function Outlet(): JSX.Element;
```

[React Components](./react-components.md)

### React Hooks

React hooks for accessing router state, navigation functions, route data, and parameters.

```typescript { .api }
function useRouter<TRouter extends AnyRouter = RegisteredRouter>(): TRouter;

function useNavigate<TRouter extends AnyRouter = RegisteredRouter>():
  UseNavigateResult<TRouter>;

function useParams<TRouter extends AnyRouter = RegisteredRouter>(
  opts?: UseParamsOptions
): ResolveParams<TRouter>;

function useSearch<TRouter extends AnyRouter = RegisteredRouter>(
  opts?: UseSearchOptions
): InferFullSearchSchema<TRouter>;
```

[React Hooks](./react-hooks.md)

### Navigation & Links

Navigation utilities, link components, and programmatic navigation with type-safe parameter handling.

```typescript { .api }
function redirect<TRouter extends AnyRouter = AnyRouter>(
  options: RedirectOptions<TRouter>
): Redirect;

function createLink<TComp extends React.ComponentType<any>>(
  Comp: TComp
): LinkComponent<TComp>;

function linkOptions<TRouter extends AnyRouter, TFrom extends string>(
  options: LinkOptions<TRouter, TFrom>
): LinkOptions<TRouter, TFrom>;
```

[Navigation & Links](./navigation-links.md)

### Data Loading & Caching

Built-in data loading system with loaders, caching, invalidation, and promise handling.

```typescript { .api }
function defer<T>(promise: Promise<T>): DeferredPromise<T>;

function useLoaderData<TRouter extends AnyRouter = RegisteredRouter>(
  opts?: UseLoaderDataOptions
): ResolveLoaderData<TRouter>;

function useAwaited<T>(options: AwaitOptions<T>): [T, DeferredPromise<T>];
```

[Data Loading & Caching](./data-loading.md)

### Error Handling

Comprehensive error handling with boundaries, not found handling, and custom error components.

```typescript { .api }
function CatchBoundary(props: CatchBoundaryProps): JSX.Element;

function notFound<TRouterContext = unknown>(
  options?: NotFoundError
): NotFoundError;

function isNotFound(obj: any): obj is NotFoundError;

function isRedirect(obj: any): obj is Redirect;
```

[Error Handling](./error-handling.md)

### Server-Side Rendering

Complete SSR support with server and client components, rendering utilities, and hydration.

```typescript { .api }
function renderRouterToString<TRouter extends AnyRouter>(
  options: RenderRouterToStringOptions<TRouter>
): Promise<string>;

function renderRouterToStream<TRouter extends AnyRouter>(
  options: RenderRouterToStreamOptions<TRouter>
): Promise<ReadableStream>;
```

[Server-Side Rendering](./ssr.md)

### Path & Search Utilities

Low-level utilities for path manipulation, search parameter handling, and URL processing.

```typescript { .api }
function joinPaths(paths: Array<string | undefined>): string;

function parseSearchWith<T>(parser: (searchStr: string) => T): (searchStr: string) => T;

function retainSearchParams<T>(search: T, retain: Array<string | number>): Partial<T>;

function interpolatePath(path: string, params: Record<string, any>): string;
```

[Path & Search Utilities](./path-search-utils.md)

## Types

### Core Router Types

```typescript { .api }
interface Router<TRouteTree extends AnyRoute = AnyRoute> {
  history: RouterHistory;
  state: RouterState;
  navigate: (options: NavigateOptions) => Promise<void>;
  buildLocation: (options: BuildLocationOptions) => ParsedLocation;
  invalidate: () => Promise<void>;
}

interface RouterState {
  location: ParsedLocation;
  matches: RouteMatch[];
  pendingMatches?: RouteMatch[];
  isLoading: boolean;
  isTransitioning: boolean;
}

interface ParsedLocation {
  pathname: string;
  search: Record<string, any>;
  searchStr: string;
  hash: string;
  href: string;
  state: HistoryState;
}
```

### Route Types

```typescript { .api }
interface Route<TParentRoute extends AnyRoute = AnyRoute> {
  id: string;
  path: string;
  fullPath: string;
  parentRoute?: TParentRoute;
  children?: AnyRoute[];
  options: RouteOptions;
}

interface RouteMatch {
  id: string;
  routeId: string;
  pathname: string;
  params: Record<string, any>;
  search: Record<string, any>;
  loaderData?: any;
  context: RouteContext;
  status: "pending" | "success" | "error" | "idle";
}
```

### Navigation Types

```typescript { .api }
interface NavigateOptions<TRouter extends AnyRouter = AnyRouter> {
  to?: string;
  from?: string;
  params?: Record<string, any>;
  search?: Record<string, any> | ((prev: any) => Record<string, any>);
  hash?: string | ((prev: string) => string);
  state?: any;
  replace?: boolean;
  resetScroll?: boolean;
  startTransition?: boolean;
}

interface LinkOptions<TRouter extends AnyRouter = AnyRouter> extends NavigateOptions<TRouter> {
  activeProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  inactiveProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  preload?: false | "intent" | "render" | "viewport";
  preloadDelay?: number;
}
```