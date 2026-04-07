# Server-Side Rendering

Complete SSR support with server and client components, rendering utilities, hydration, stream handling, and asset management for modern web applications.

## Capabilities

### Server-Side Rendering Functions

Functions for rendering router to string or stream on the server.

```typescript { .api }
/**
 * Render router to string for SSR
 * @param options - Server rendering options
 * @returns Promise resolving to rendered HTML string
 */
function renderRouterToString<TRouter extends AnyRouter>(
  options: RenderRouterToStringOptions<TRouter>
): Promise<string>;

/**
 * Render router to stream for SSR with streaming
 * @param options - Stream rendering options
 * @returns Promise resolving to readable stream
 */
function renderRouterToStream<TRouter extends AnyRouter>(
  options: RenderRouterToStreamOptions<TRouter>
): Promise<ReadableStream<Uint8Array>>;

interface RenderRouterToStringOptions<TRouter extends AnyRouter> {
  /** Router instance */
  router: TRouter;
  /** Request URL */
  url: string;
  /** Request headers */
  headers?: Record<string, string>;
  /** Render handler function */
  renderHandler?: RenderHandler;
  /** Additional context */
  context?: any;
}

interface RenderRouterToStreamOptions<TRouter extends AnyRouter> {
  /** Router instance */
  router: TRouter;
  /** Request URL */
  url: string;
  /** Request headers */
  headers?: Record<string, string>;
  /** Stream handler function */
  streamHandler?: StreamHandler;
  /** Render handler function */
  renderHandler?: RenderHandler;
  /** Additional context */
  context?: any;
}
```

**Usage Examples:**

```typescript
import { renderRouterToString, renderRouterToStream } from "@tanstack/react-router/ssr/server";

// Express.js server with string rendering
app.get("*", async (req, res) => {
  try {
    const html = await renderRouterToString({
      router,
      url: req.url,
      headers: req.headers,
      context: {
        user: req.user,
        session: req.session,
      },
    });

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>My App</title>
        </head>
        <body>
          <div id="root">${html}</div>
          <script src="/client.js"></script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// Stream rendering for better performance
app.get("*", async (req, res) => {
  try {
    const stream = await renderRouterToStream({
      router,
      url: req.url,
      headers: req.headers,
    });

    res.setHeader("Content-Type", "text/html");
    res.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>My App</title>
        </head>
        <body>
          <div id="root">
    `);

    const reader = stream.getReader();
    const pump = () => {
      return reader.read().then(({ done, value }) => {
        if (done) {
          res.end(`
            </div>
            <script src="/client.js"></script>
          </body>
        </html>
          `);
          return;
        }
        res.write(new TextDecoder().decode(value));
        return pump();
      });
    };

    return pump();
  } catch (error) {
    res.status(500).send("Server Error");
  }
});
```

### Server and Client Components

Specialized components for server-side and client-side routing.

```typescript { .api }
/**
 * Server-side router component
 * @param props - Server router props
 * @returns JSX element for server rendering
 */
function RouterServer<TRouter extends AnyRouter>(
  props: RouterServerProps<TRouter>
): JSX.Element;

/**
 * Client-side router component for hydration
 * @param props - Client router props
 * @returns JSX element for client hydration
 */
function RouterClient<TRouter extends AnyRouter>(
  props: RouterClientProps<TRouter>
): JSX.Element;

interface RouterServerProps<TRouter extends AnyRouter> {
  /** Router instance */
  router: TRouter;
  /** Server context */
  context?: any;
  /** Dehydrated state */
  dehydratedState?: any;
}

interface RouterClientProps<TRouter extends AnyRouter> {
  /** Router instance */
  router: TRouter;
  /** Hydration state from server */
  hydrationState?: any;
}
```

**Usage Examples:**

```typescript
// Server-side component usage
import { RouterServer } from "@tanstack/react-router/ssr/server";

function ServerApp({ router, context }: { router: Router; context: any }) {
  return (
    <RouterServer
      router={router}
      context={context}
      dehydratedState={{
        user: context.user,
        timestamp: Date.now(),
      }}
    />
  );
}

// Client-side hydration
import { RouterClient } from "@tanstack/react-router/ssr/client";

function ClientApp({ router }: { router: Router }) {
  const hydrationState = window.__ROUTER_HYDRATION_STATE__;

  return (
    <RouterClient
      router={router}
      hydrationState={hydrationState}
    />
  );
}
```

### Render and Stream Handlers

Default handlers for rendering and streaming functionality.

```typescript { .api }
/**
 * Default render handler for SSR
 * @param options - Render handler options
 * @returns Rendered content
 */
function defaultRenderHandler<TRouter extends AnyRouter>(
  options: RenderHandlerOptions<TRouter>
): React.ReactElement;

/**
 * Default stream handler for SSR streaming
 * @param options - Stream handler options
 * @returns Stream configuration
 */
function defaultStreamHandler<TRouter extends AnyRouter>(
  options: StreamHandlerOptions<TRouter>
): StreamHandlerResult;

interface RenderHandlerOptions<TRouter extends AnyRouter> {
  router: TRouter;
  context?: any;
  dehydratedState?: any;
}

interface StreamHandlerOptions<TRouter extends AnyRouter> {
  router: TRouter;
  context?: any;
}

interface StreamHandlerResult {
  /** Bootstrap script */
  bootstrapScript?: string;
  /** Bootstrap modules */
  bootstrapModules?: string[];
  /** Progressive enhancement */
  progressivelyEnhance?: boolean;
}

type RenderHandler = <TRouter extends AnyRouter>(
  options: RenderHandlerOptions<TRouter>
) => React.ReactElement;

type StreamHandler = <TRouter extends AnyRouter>(
  options: StreamHandlerOptions<TRouter>
) => StreamHandlerResult;
```

**Usage Examples:**

```typescript
import { defaultRenderHandler, defaultStreamHandler } from "@tanstack/react-router/ssr/server";

// Custom render handler
const customRenderHandler: RenderHandler = ({ router, context, dehydratedState }) => {
  return (
    <html>
      <head>
        <title>{context.title}</title>
        <meta name="description" content={context.description} />
        <HeadContent />
      </head>
      <body>
        <RouterServer
          router={router}
          context={context}
          dehydratedState={dehydratedState}
        />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__ROUTER_HYDRATION_STATE__ = ${JSON.stringify(dehydratedState)};`,
          }}
        />
      </body>
    </html>
  );
};

// Custom stream handler
const customStreamHandler: StreamHandler = ({ router, context }) => {
  return {
    bootstrapScript: "/static/js/client.js",
    bootstrapModules: ["/static/js/hydration.js"],
    progressivelyEnhance: true,
  };
};

// Use custom handlers
const html = await renderRouterToString({
  router,
  url: req.url,
  renderHandler: customRenderHandler,
  context: {
    title: "My App",
    description: "A great application",
    user: req.user,
  },
});
```

### Asset Management Components

Components for managing HTML assets, scripts, and metadata in SSR.

```typescript { .api }
/**
 * Renders route-specific and manifest scripts
 * @returns JSX element with script tags
 */
function Scripts(): JSX.Element;

/**
 * Renders various HTML assets (scripts, styles, meta, etc.)
 * @param props - Asset configuration
 * @returns JSX element with asset tags
 */
function Asset(props: AssetProps): JSX.Element;

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

interface AssetProps extends RouterManagedTag {
  /** Content Security Policy nonce */
  nonce?: string;
}

interface RouterManagedTag {
  /** HTML tag type */
  tag: "script" | "style" | "link" | "meta" | "title";
  /** Tag attributes */
  attrs?: Record<string, string>;
  /** Tag content */
  children?: string;
}
```

**Usage Examples:**

```typescript
import { Scripts, Asset, HeadContent, ScriptOnce } from "@tanstack/react-router";

// Complete HTML document with assets
function DocumentShell() {
  return (
    <html>
      <head>
        <HeadContent />
        <Asset
          tag="meta"
          attrs={{ charset: "utf-8" }}
        />
        <Asset
          tag="link"
          attrs={{
            rel: "stylesheet",
            href: "/static/css/app.css",
          }}
        />
        <ScriptOnce
          src="/static/js/polyfills.js"
          defer
        />
      </head>
      <body>
        <div id="root">
          <RouterServer router={router} />
        </div>
        <Scripts />
      </body>
    </html>
  );
}

// Conditional asset loading
function ConditionalAssets({ isDevelopment }: { isDevelopment: boolean }) {
  return (
    <>
      {isDevelopment && (
        <ScriptOnce src="/static/js/devtools.js" />
      )}
      <Asset
        tag="link"
        attrs={{
          rel: "preconnect",
          href: "https://api.example.com",
        }}
      />
    </>
  );
}
```

### Router Context for SSR

Utilities for accessing router context in SSR environments.

```typescript { .api }
/**
 * Get router context for SSR usage
 * @returns React context for router
 */
function getRouterContext(): React.Context<AnyRouter | undefined>;
```

**Usage Examples:**

```typescript
import { getRouterContext } from "@tanstack/react-router";

// Access router in SSR context
function ServerOnlyComponent() {
  const RouterContext = getRouterContext();

  return (
    <RouterContext.Consumer>
      {(router) => {
        if (!router) return null;

        return (
          <div>
            <p>Current URL: {router.state.location.pathname}</p>
            <p>Matches: {router.state.matches.length}</p>
          </div>
        );
      }}
    </RouterContext.Consumer>
  );
}

// Use with useContext
function useRouterSSR() {
  const RouterContext = getRouterContext();
  return useContext(RouterContext);
}
```

### Location Rewriting for SSR

Utilities for rewriting URLs and handling base paths in SSR.

```typescript { .api }
/**
 * Create a basepath rewrite function
 * @param basepath - Base path to rewrite
 * @returns Location rewrite function
 */
function rewriteBasepath(basepath: string): LocationRewrite;

/**
 * Compose multiple location rewrite functions
 * @param rewrites - Array of rewrite functions
 * @returns Composed rewrite function
 */
function composeRewrites(...rewrites: LocationRewrite[]): LocationRewrite;

type LocationRewrite = (location: ParsedLocation) => ParsedLocation;
type LocationRewriteFunction = LocationRewrite;
```

**Usage Examples:**

```typescript
import { rewriteBasepath, composeRewrites } from "@tanstack/react-router";

// Basepath rewriting
const basepathRewrite = rewriteBasepath("/app");

// Custom location rewrite
const customRewrite: LocationRewrite = (location) => ({
  ...location,
  pathname: location.pathname.replace(/^\/old/, "/new"),
});

// Compose multiple rewrites
const composedRewrite = composeRewrites(
  basepathRewrite,
  customRewrite,
  (location) => ({
    ...location,
    search: { ...location.search, timestamp: Date.now() },
  })
);

// Use in router configuration
const router = createRouter({
  routeTree,
  basepath: "/app",
  // Apply location rewrites
  rewrite: composedRewrite,
});
```

### Serialization for SSR

Serialization utilities for transferring data between server and client.

```typescript { .api }
/**
 * Create a serialization adapter
 * @param adapter - Serialization configuration
 * @returns Serialization adapter
 */
function createSerializationAdapter<T>(
  adapter: SerializationAdapter<T>
): SerializationAdapter<T>;

interface SerializationAdapter<T = any> {
  /** Serialize value for transport */
  serialize: (value: T) => string;
  /** Deserialize value from transport */
  deserialize: (value: string) => T;
}

type AnySerializationAdapter = SerializationAdapter<any>;
```

**Usage Examples:**

```typescript
import { createSerializationAdapter } from "@tanstack/react-router";

// Custom date serialization
const dateAdapter = createSerializationAdapter({
  serialize: (date: Date) => date.toISOString(),
  deserialize: (dateString: string) => new Date(dateString),
});

// Complex object serialization
const complexAdapter = createSerializationAdapter({
  serialize: (obj) => {
    return JSON.stringify(obj, (key, value) => {
      if (value instanceof Date) return { __type: "Date", value: value.toISOString() };
      if (value instanceof Map) return { __type: "Map", value: Array.from(value.entries()) };
      return value;
    });
  },
  deserialize: (str) => {
    return JSON.parse(str, (key, value) => {
      if (value?.__type === "Date") return new Date(value.value);
      if (value?.__type === "Map") return new Map(value.value);
      return value;
    });
  },
});

// Use in router
const router = createRouter({
  routeTree,
  serializationAdapter: complexAdapter,
});
```

## Types

### SSR Configuration Types

```typescript { .api }
interface SSROptions {
  /** Enable server-side rendering */
  ssr?: boolean;
  /** Hydration strategy */
  hydrationStrategy?: "progressive" | "immediate" | "lazy";
  /** Stream rendering options */
  streaming?: boolean;
  /** Asset preloading strategy */
  assetPreloading?: "aggressive" | "conservative" | "none";
}

interface HydrationState {
  /** Router state for hydration */
  routerState: RouterState;
  /** Dehydrated loader data */
  loaderData: Record<string, any>;
  /** Timestamp of server render */
  timestamp: number;
}
```

### Stream Types

```typescript { .api }
interface StreamOptions {
  /** Bootstrap scripts */
  bootstrapScripts?: string[];
  /** Bootstrap modules */
  bootstrapModules?: string[];
  /** Progressive enhancement */
  progressivelyEnhance?: boolean;
  /** Identifier for the stream */
  identifierPrefix?: string;
}
```