# Error Handling

Comprehensive error handling with boundaries, not found handling, custom error components, and error recovery mechanisms for robust routing applications.

## Capabilities

### Error Boundaries

React error boundaries for catching and handling route errors with recovery capabilities.

```typescript { .api }
/**
 * Error boundary for catching and handling route errors
 * @param props - Error boundary configuration
 * @returns JSX element with error boundary functionality
 */
function CatchBoundary(props: CatchBoundaryProps): JSX.Element;

interface CatchBoundaryProps {
  /** Function to get reset key for boundary reset */
  getResetKey: () => string | number;
  /** Child components to protect */
  children: React.ReactNode;
  /** Custom error component to render */
  errorComponent?: ErrorRouteComponent;
  /** Error handler callback */
  onCatch?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Default error component for displaying errors
 * @param props - Error component props
 * @returns JSX element displaying error information
 */
function ErrorComponent(props: ErrorComponentProps): JSX.Element;

interface ErrorComponentProps {
  /** The error that occurred */
  error: any;
  /** Error info from React */
  info?: { componentStack: string };
  /** Function to reset the error boundary */
  reset?: () => void;
}
```

**Usage Examples:**

```typescript
import { CatchBoundary, ErrorComponent } from "@tanstack/react-router";

// Basic error boundary
<CatchBoundary
  getResetKey={() => window.location.pathname}
  errorComponent={ErrorComponent}
  onCatch={(error, errorInfo) => {
    console.error("Route error:", error);
    // Send to error reporting service
    errorReporter.captureException(error, {
      extra: { errorInfo, route: window.location.pathname },
    });
  }}
>
  <App />
</CatchBoundary>

// Custom error component
function CustomErrorComponent({ error, reset }) {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <details>
        <summary>Error details</summary>
        <pre>{error.message}</pre>
        <pre>{error.stack}</pre>
      </details>
      <button onClick={reset} className="retry-button">
        Try again
      </button>
    </div>
  );
}

// Error boundary with custom component
<CatchBoundary
  getResetKey={() => Date.now()}
  errorComponent={CustomErrorComponent}
>
  <Routes />
</CatchBoundary>
```

### Not Found Error Handling

Specialized error handling for 404 not found errors with custom fallbacks.

```typescript { .api }
/**
 * Create a not found error
 * @param options - Not found error options
 * @returns NotFoundError instance
 */
function notFound<TRouterContext = unknown>(
  options?: NotFoundErrorOptions<TRouterContext>
): NotFoundError;

/**
 * Type guard for not found errors
 * @param obj - Object to check
 * @returns Whether object is a not found error
 */
function isNotFound(obj: any): obj is NotFoundError;

interface NotFoundError extends Error {
  /** Error code identifier */
  routerCode: "NOT_FOUND";
  /** Whether error was thrown in production */
  isNotFound: true;
  /** Additional data */
  data?: any;
}

interface NotFoundErrorOptions<TRouterContext = unknown> {
  /** Additional data to include */
  data?: any;
}

/**
 * Boundary specifically for handling not found errors
 * @param props - Not found boundary props
 * @returns JSX element with not found error handling
 */
function CatchNotFound(props: CatchNotFoundProps): JSX.Element;

interface CatchNotFoundProps {
  /** Fallback component for not found errors */
  fallback?: (error: NotFoundError) => React.ReactElement;
  /** Error handler callback */
  onCatch?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Child components */
  children: React.ReactNode;
}

/**
 * Default global not found component
 * @returns JSX element for 404 errors
 */
function DefaultGlobalNotFound(): JSX.Element;
```

**Usage Examples:**

```typescript
import { notFound, isNotFound, CatchNotFound, DefaultGlobalNotFound } from "@tanstack/react-router";

// Throw not found in loader
const Route = createRoute({
  path: "/posts/$postId",
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId);

    if (!post) {
      throw notFound({
        data: {
          postId: params.postId,
          message: "Post not found",
        },
      });
    }

    return { post };
  },
});

// Handle not found in component
function PostLoader() {
  try {
    const { post } = useLoaderData();
    return <PostDetail post={post} />;
  } catch (error) {
    if (isNotFound(error)) {
      return <div>Post not found: {error.data?.postId}</div>;
    }
    throw error; // Re-throw other errors
  }
}

// Not found boundary
<CatchNotFound
  fallback={(error) => (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <p>{error.data?.message || "The requested page could not be found."}</p>
      <Link to="/">Go Home</Link>
    </div>
  )}
  onCatch={(error, errorInfo) => {
    console.log("Not found error:", error.data);
  }}
>
  <Routes />
</CatchNotFound>

// Using default not found component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" component={DefaultGlobalNotFound} />
      </Routes>
    </Router>
  );
}
```

### Route-Level Error Components

Error components specifically for route-level error handling.

```typescript { .api }
/**
 * Route error component type
 */
type ErrorRouteComponent = React.ComponentType<{
  error: Error;
  info: { componentStack: string };
  reset: () => void;
}>;

/**
 * Not found route component type
 */
type NotFoundRouteComponent = React.ComponentType<{
  data?: any;
}>;
```

**Usage Examples:**

```typescript
// Route with error component
const Route = createRoute({
  path: "/risky-route",
  loader: async () => {
    // This might throw an error
    const data = await riskyApiCall();
    return { data };
  },
  component: RiskyComponent,
  errorComponent: ({ error, reset }) => (
    <div>
      <h2>Error in risky route</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Retry</button>
      <Link to="/">Go Home</Link>
    </div>
  ),
});

// Route with not found component
const Route = createRoute({
  path: "/users/$userId",
  loader: async ({ params }) => {
    const user = await fetchUser(params.userId);
    if (!user) {
      throw notFound({ data: { userId: params.userId } });
    }
    return { user };
  },
  component: UserProfile,
  notFoundComponent: ({ data }) => (
    <div>
      <h2>User Not Found</h2>
      <p>User with ID "{data?.userId}" does not exist.</p>
      <Link to="/users">View All Users</Link>
    </div>
  ),
});
```

### Error Recovery and Reset

Utilities for recovering from errors and resetting error states.

```typescript { .api }
/**
 * Error boundary reset utilities
 */
interface ErrorBoundaryReset {
  /** Reset the error boundary */
  reset: () => void;
  /** Get current reset key */
  getResetKey: () => string | number;
}

/**
 * Router-level error handling
 */
interface RouterErrorHandling {
  /** Default error handler for all routes */
  defaultOnCatch?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Default error component */
  defaultErrorComponent?: ErrorRouteComponent;
  /** Default not found component */
  defaultNotFoundComponent?: NotFoundRouteComponent;
}
```

**Usage Examples:**

```typescript
// Router with global error handling
const router = createRouter({
  routeTree,
  defaultErrorComponent: ({ error, reset }) => (
    <div className="global-error">
      <h1>Application Error</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Reset Application</button>
    </div>
  ),
  defaultNotFoundComponent: () => (
    <div className="global-not-found">
      <h1>Page Not Found</h1>
      <Link to="/">Return Home</Link>
    </div>
  ),
  defaultOnCatch: (error, errorInfo) => {
    // Global error logging
    console.error("Global route error:", error, errorInfo);
    errorReporter.captureException(error, {
      tags: { type: "route_error" },
      extra: errorInfo,
    });
  },
});

// Component with error recovery
function RecoverableComponent() {
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  const handleError = useCallback((error: Error) => {
    if (retryCount < 3) {
      // Auto-retry up to 3 times
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        window.location.reload();
      }, 1000);
    } else {
      // Navigate to error page after max retries
      navigate({ to: "/error", state: { error: error.message } });
    }
  }, [retryCount, navigate]);

  return (
    <CatchBoundary
      getResetKey={() => retryCount}
      onCatch={handleError}
    >
      <RiskyComponent />
    </CatchBoundary>
  );
}
```

### Error Serialization

Utilities for serializing errors, particularly useful for SSR.

```typescript { .api }
/**
 * Default error serializer for SSR and transport
 * @param error - Error to serialize
 * @returns Serialized error object
 */
function defaultSerializeError(error: Error): SerializedError;

interface SerializedError {
  name: string;
  message: string;
  stack?: string;
}
```

**Usage Examples:**

```typescript
import { defaultSerializeError } from "@tanstack/react-router";

// Serialize errors for API responses
async function apiErrorHandler(error: Error) {
  const serialized = defaultSerializeError(error);

  return {
    success: false,
    error: serialized,
    timestamp: Date.now(),
  };
}

// Custom error serializer
function customSerializeError(error: Error) {
  const base = defaultSerializeError(error);

  return {
    ...base,
    code: error.code || "UNKNOWN_ERROR",
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  };
}
```

### Router State Utilities

Utilities for managing router state and initialization.

```typescript { .api }
/**
 * Get initial router state for a given location
 * @param location - Parsed location object
 * @returns Initial router state
 */
function getInitialRouterState(location: ParsedLocation): RouterState;
```

**Usage Examples:**

```typescript
import { getInitialRouterState } from "@tanstack/react-router";

// Create initial state for SSR
function createServerState(url: string) {
  const location = parseLocation(url);
  const initialState = getInitialRouterState(location);

  return {
    ...initialState,
    isServer: true,
  };
}

// Initialize router with custom state
const router = createRouter({
  routeTree,
  initialState: getInitialRouterState(currentLocation),
});
```

### Error Class Types

Specific error classes for different routing scenarios.

```typescript { .api }
/**
 * Search parameter validation error
 * Thrown when search parameter validation fails
 */
class SearchParamError extends Error {
  name: "SearchParamError";
  constructor(message: string);
}

/**
 * Path parameter validation error
 * Thrown when path parameter validation fails
 */
class PathParamError extends Error {
  name: "PathParamError";
  constructor(message: string);
}
```

**Usage Examples:**

```typescript
import { SearchParamError, PathParamError } from "@tanstack/react-router";

// Route with parameter validation
const Route = createRoute({
  path: "/items/$itemId",
  validateSearch: (search) => {
    const page = Number(search.page);
    if (isNaN(page) || page < 1) {
      throw new SearchParamError("Page must be a positive number");
    }
    return { page };
  },
  loader: ({ params }) => {
    if (!params.itemId.match(/^[a-zA-Z0-9]+$/)) {
      throw new PathParamError("Invalid item ID format");
    }
    return fetchItem(params.itemId);
  },
  errorComponent: ({ error }) => {
    if (error instanceof SearchParamError) {
      return <div>Invalid search parameters: {error.message}</div>;
    }
    if (error instanceof PathParamError) {
      return <div>Invalid path parameters: {error.message}</div>;
    }
    return <div>Unexpected error: {error.message}</div>;
  },
});
```

## Types

### Error Component Types

```typescript { .api }
interface ErrorRouteProps {
  error: Error;
  info: { componentStack: string };
  reset: () => void;
}

interface NotFoundRouteProps {
  data?: any;
}

type ErrorRouteComponent = React.ComponentType<ErrorRouteProps>;
type NotFoundRouteComponent = React.ComponentType<NotFoundRouteProps>;
```

### Error State Types

```typescript { .api }
interface RouteErrorState {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  hasError: boolean;
  errorBoundaryKey: string | number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  resetKey: string | number;
}
```

### Error Handling Configuration

```typescript { .api }
interface ErrorHandlingConfig {
  defaultErrorComponent?: ErrorRouteComponent;
  defaultNotFoundComponent?: NotFoundRouteComponent;
  defaultOnCatch?: (error: Error, errorInfo: React.ErrorInfo) => void;
  errorSerializer?: (error: Error) => any;
}
```