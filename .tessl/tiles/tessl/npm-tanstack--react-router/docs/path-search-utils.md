# Path & Search Utilities

Low-level utilities for path manipulation, search parameter handling, URL processing, and data validation for robust routing functionality.

## Capabilities

### Path Manipulation

Utilities for working with URL paths, including joining, cleaning, and normalization.

```typescript { .api }
/**
 * Join multiple path segments into a single path
 * @param paths - Array of path segments to join
 * @returns Combined path string
 */
function joinPaths(paths: Array<string | undefined>): string;

/**
 * Clean and normalize a path
 * @param path - Path to clean
 * @returns Cleaned path string
 */
function cleanPath(path: string): string;

/**
 * Remove leading and trailing slashes from path
 * @param path - Path to trim
 * @returns Trimmed path string
 */
function trimPath(path: string): string;

/**
 * Remove leading slashes from path
 * @param path - Path to trim
 * @returns Path without leading slashes
 */
function trimPathLeft(path: string): string;

/**
 * Remove trailing slashes from path
 * @param path - Path to trim
 * @returns Path without trailing slashes
 */
function trimPathRight(path: string): string;

/**
 * Resolve a relative path against a base path
 * @param basepath - Base path
 * @param base - Current base
 * @param to - Target path
 * @returns Resolved absolute path
 */
function resolvePath(basepath: string, base: string, to: string): string;
```

**Usage Examples:**

```typescript
import {
  joinPaths,
  cleanPath,
  trimPath,
  trimPathLeft,
  trimPathRight,
  resolvePath
} from "@tanstack/react-router";

// Join path segments
const fullPath = joinPaths(["/api", "users", undefined, "123"]);
// Result: "/api/users/123"

// Clean messy paths
const cleaned = cleanPath("//api///users//123//");
// Result: "/api/users/123"

// Trim slashes
const trimmed = trimPath("/path/to/resource/");
// Result: "path/to/resource"

const leftTrimmed = trimPathLeft("///path/to/resource");
// Result: "path/to/resource"

const rightTrimmed = trimPathRight("path/to/resource///");
// Result: "path/to/resource"

// Resolve relative paths
const resolved = resolvePath("/app", "/users", "../posts/123");
// Result: "/app/posts/123"

// Resolve from root
const absolute = resolvePath("", "/users/123", "../../admin");
// Result: "/admin"
```

### Path Parsing and Interpolation

Utilities for parsing paths and interpolating parameters.

```typescript { .api }
/**
 * Parse a pathname into segments
 * @param pathname - Pathname to parse
 * @returns Array of path segments
 */
function parsePathname(pathname: string): Array<string>;

/**
 * Interpolate path parameters into a path template
 * @param path - Path template with parameter placeholders
 * @param params - Parameters to interpolate
 * @returns Path with parameters filled in
 */
function interpolatePath(path: string, params: Record<string, any>): string;
```

**Usage Examples:**

```typescript
import { parsePathname, interpolatePath } from "@tanstack/react-router";

// Parse pathname into segments
const segments = parsePathname("/users/123/posts/456");
// Result: ["users", "123", "posts", "456"]

const rootSegments = parsePathname("/");
// Result: []

// Interpolate parameters
const userPath = interpolatePath("/users/$userId/posts/$postId", {
  userId: "123",
  postId: "456",
});
// Result: "/users/123/posts/456"

// With optional parameters
const profilePath = interpolatePath("/profile/$userId?", {
  userId: undefined,
});
// Result: "/profile"

// Complex interpolation
const complexPath = interpolatePath(
  "/org/$orgId/project/$projectId/task/$taskId",
  {
    orgId: "acme",
    projectId: "website",
    taskId: "fix-bug-123",
  }
);
// Result: "/org/acme/project/website/task/fix-bug-123"
```

### Search Parameter Processing

Utilities for parsing, stringifying, and manipulating URL search parameters.

```typescript { .api }
/**
 * Default search parameter parser
 * @param searchStr - Search string to parse
 * @returns Parsed search object
 */
function defaultParseSearch(searchStr: string): Record<string, any>;

/**
 * Default search parameter stringifier
 * @param search - Search object to stringify
 * @returns URL search string
 */
function defaultStringifySearch(search: Record<string, any>): string;

/**
 * Create a custom search parser
 * @param parser - Custom parser function
 * @returns Search parser function
 */
function parseSearchWith<T>(
  parser: (searchStr: string) => T
): (searchStr: string) => T;

/**
 * Create a custom search stringifier
 * @param stringify - Custom stringify function
 * @returns Search stringifier function
 */
function stringifySearchWith<T>(
  stringify: (search: T) => string
): (search: T) => string;

type SearchParser<T = any> = (searchStr: string) => T;
type SearchSerializer<T = any> = (search: T) => string;
```

**Usage Examples:**

```typescript
import {
  defaultParseSearch,
  defaultStringifySearch,
  parseSearchWith,
  stringifySearchWith
} from "@tanstack/react-router";

// Default parsing and stringifying
const searchObj = defaultParseSearch("?name=john&age=25&active=true");
// Result: { name: "john", age: "25", active: "true" }

const searchStr = defaultStringifySearch({
  name: "jane",
  age: 30,
  tags: ["dev", "react"],
});
// Result: "name=jane&age=30&tags=dev&tags=react"

// Custom parser with type conversion
const typedParser = parseSearchWith((searchStr: string) => {
  const params = new URLSearchParams(searchStr);
  return {
    page: Number(params.get("page")) || 1,
    limit: Number(params.get("limit")) || 10,
    sort: params.get("sort") || "created_at",
    desc: params.get("desc") === "true",
    tags: params.getAll("tags"),
  };
});

const parsed = typedParser("?page=2&limit=20&desc=true&tags=react&tags=routing");
// Result: { page: 2, limit: 20, sort: "created_at", desc: true, tags: ["react", "routing"] }

// Custom stringifier
const typedStringifier = stringifySearchWith((search: {
  page: number;
  limit: number;
  filters?: Record<string, any>;
}) => {
  const params = new URLSearchParams();
  params.set("page", search.page.toString());
  params.set("limit", search.limit.toString());

  if (search.filters) {
    Object.entries(search.filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, String(v)));
      } else {
        params.set(key, String(value));
      }
    });
  }

  return params.toString();
});
```

### Search Parameter Filtering

Utilities for filtering and manipulating search parameters.

```typescript { .api }
/**
 * Retain only specific search parameters
 * @param search - Search object to filter
 * @param retain - Array of keys to retain
 * @returns Filtered search object
 */
function retainSearchParams<T>(
  search: T,
  retain: Array<string | number>
): Partial<T>;

/**
 * Remove specific search parameters
 * @param search - Search object to filter
 * @param strip - Array of keys to remove
 * @returns Filtered search object
 */
function stripSearchParams<T>(
  search: T,
  strip: Array<string | number>
): Partial<T>;
```

**Usage Examples:**

```typescript
import { retainSearchParams, stripSearchParams } from "@tanstack/react-router";

const searchParams = {
  page: 1,
  limit: 10,
  sort: "name",
  filter: "active",
  debug: true,
  internal: "secret",
};

// Retain only specific params
const publicParams = retainSearchParams(searchParams, ["page", "limit", "sort", "filter"]);
// Result: { page: 1, limit: 10, sort: "name", filter: "active" }

// Strip sensitive params
const cleanParams = stripSearchParams(searchParams, ["debug", "internal"]);
// Result: { page: 1, limit: 10, sort: "name", filter: "active" }

// Use in navigation
function NavigateWithCleanParams() {
  const currentSearch = useSearch();
  const navigate = useNavigate();

  const navigateToNextPage = () => {
    const cleanSearch = stripSearchParams(currentSearch, ["debug", "internal"]);
    navigate({
      search: {
        ...cleanSearch,
        page: (cleanSearch.page || 1) + 1,
      },
    });
  };

  return <button onClick={navigateToNextPage}>Next Page</button>;
}
```

### Deep Comparison Utilities

Utilities for deep equality checking and structural sharing.

```typescript { .api }
/**
 * Deep equality comparison
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param opts - Comparison options
 * @returns Whether values are deeply equal
 */
function deepEqual(
  a: any,
  b: any,
  opts?: {
    partial?: boolean;
    ignoreUndefined?: boolean;
  }
): boolean;

/**
 * Deep equality replacement for structural sharing
 * @param prev - Previous value
 * @param next - Next value
 * @returns Previous value if equal, next value if different
 */
function replaceEqualDeep<T>(prev: T, next: T): T;

/**
 * Check if value is a plain object
 * @param obj - Value to check
 * @returns Whether value is a plain object
 */
function isPlainObject(obj: any): boolean;

/**
 * Check if value is a plain array
 * @param obj - Value to check
 * @returns Whether value is a plain array
 */
function isPlainArray(obj: any): boolean;
```

**Usage Examples:**

```typescript
import {
  deepEqual,
  replaceEqualDeep,
  isPlainObject,
  isPlainArray
} from "@tanstack/react-router";

// Deep equality comparison
const obj1 = { a: 1, b: { c: 2, d: [3, 4] } };
const obj2 = { a: 1, b: { c: 2, d: [3, 4] } };
const obj3 = { a: 1, b: { c: 2, d: [3, 5] } };

console.log(deepEqual(obj1, obj2)); // true
console.log(deepEqual(obj1, obj3)); // false

// Partial comparison
const partial = { a: 1, b: { c: 2 } };
const full = { a: 1, b: { c: 2, d: 3 }, e: 4 };
console.log(deepEqual(partial, full, { partial: true })); // true

// Structural sharing for performance
const prevState = { users: [1, 2, 3], posts: [4, 5, 6] };
const nextState = { users: [1, 2, 3], posts: [4, 5, 7] };

const optimized = replaceEqualDeep(prevState, nextState);
// optimized.users === prevState.users (same reference)
// optimized.posts !== prevState.posts (different reference)

// Type checking
console.log(isPlainObject({})); // true
console.log(isPlainObject([])); // false
console.log(isPlainObject(new Date())); // false

console.log(isPlainArray([])); // true
console.log(isPlainArray({})); // false
console.log(isPlainArray("string")); // false
```

### Functional Update Utilities

Utilities for applying functional updates to data.

```typescript { .api }
/**
 * Apply a functional update to a value
 * @param updater - Update function or new value
 * @param previous - Previous value
 * @returns Updated value
 */
function functionalUpdate<T>(
  updater: T | ((prev: T) => T),
  previous: T
): T;
```

**Usage Examples:**

```typescript
import { functionalUpdate } from "@tanstack/react-router";

// Simple value update
const newValue = functionalUpdate("new", "old");
// Result: "new"

// Functional update
const newObj = functionalUpdate(
  (prev) => ({ ...prev, updated: true }),
  { id: 1, name: "test" }
);
// Result: { id: 1, name: "test", updated: true }

// Use in search parameter updates
function SearchUpdater() {
  const search = useSearch();
  const navigate = useNavigate();

  const updateSearch = (updater: (prev: any) => any) => {
    const newSearch = functionalUpdate(updater, search);
    navigate({ search: newSearch });
  };

  return (
    <div>
      <button
        onClick={() =>
          updateSearch((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
        }
      >
        Next Page
      </button>
      <button
        onClick={() =>
          updateSearch((prev) => ({ ...prev, sort: prev.sort === "asc" ? "desc" : "asc" }))
        }
      >
        Toggle Sort
      </button>
    </div>
  );
}
```

### URL Construction Utilities

Utilities for constructing and manipulating URLs.

```typescript { .api }
/**
 * Root route identifier constant
 */
const rootRouteId: "__root__";

/**
 * Check if value matches a route match object
 * @param obj - Object to check
 * @returns Whether object is a route match
 */
function isMatch(obj: any): obj is RouteMatch;
```

**Usage Examples:**

```typescript
import { rootRouteId, isMatch } from "@tanstack/react-router";

// Root route identification
const isRootRoute = (routeId: string) => routeId === rootRouteId;

// Route match type checking
function processMatches(matches: unknown[]) {
  const validMatches = matches.filter(isMatch);

  return validMatches.map(match => ({
    id: match.id,
    pathname: match.pathname,
    params: match.params,
  }));
}

// Use in route tree construction
const routeTree = rootRoute.addChildren([
  homeRoute,
  aboutRoute,
  postsRoute.addChildren([
    postDetailRoute,
    newPostRoute,
  ]),
]);
```

### Route Rendering Utilities

Utilities for handling route rendering, particularly for not found scenarios.

```typescript { .api }
/**
 * Renders the appropriate not found component for a route
 * @param router - Router instance
 * @param route - Route that triggered not found
 * @param data - Optional data to pass to not found component
 * @returns JSX element with not found component
 */
function renderRouteNotFound(
  router: AnyRouter,
  route: AnyRoute,
  data: any
): JSX.Element;
```

**Usage Examples:**

```typescript
import { renderRouteNotFound } from "@tanstack/react-router";

// Manual not found rendering (typically handled internally)
function CustomRouteRenderer({ router, route, error }: {
  router: AnyRouter;
  route: AnyRoute;
  error: any;
}) {
  // Handle not found scenarios
  if (error?.status === 404) {
    return renderRouteNotFound(router, route, error);
  }

  // Handle other rendering scenarios
  return <route.component />;
}
```

## Types

### Path Types

```typescript { .api }
type Segment = string;

type RemoveTrailingSlashes<T extends string> = T extends `${infer R}/`
  ? RemoveTrailingSlashes<R>
  : T;

type RemoveLeadingSlashes<T extends string> = T extends `/${infer R}`
  ? RemoveLeadingSlashes<R>
  : T;

type TrimPath<T extends string> = RemoveTrailingSlashes<RemoveLeadingSlashes<T>>;
type TrimPathLeft<T extends string> = RemoveLeadingSlashes<T>;
type TrimPathRight<T extends string> = RemoveTrailingSlashes<T>;
```

### Search Types

```typescript { .api }
interface SearchFilter {
  key: string;
  value: any;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains";
}

type SearchSchemaInput = Record<string, any>;

interface ParsedLocation {
  pathname: string;
  search: Record<string, any>;
  searchStr: string;
  hash: string;
  href: string;
  state?: any;
}
```

### Utility Types

```typescript { .api }
type Constrain<T, U> = T extends U ? T : U;

type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends object
  ? T extends infer O
    ? { [K in keyof O]: Expand<O[K]> }
    : never
  : T;

type Assign<T, U> = {
  [K in keyof T]: K extends keyof U ? U[K] : T[K];
} & {
  [K in keyof U]: U[K];
};

type MergeAll<T extends readonly unknown[]> = T extends readonly [
  infer H,
  ...infer Tail
]
  ? H & MergeAll<Tail>
  : {};

type IntersectAssign<T, U> = T & U;
```