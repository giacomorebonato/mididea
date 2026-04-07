# React DOM

React DOM is the official DOM renderer for React, serving as the essential bridge between React's component model and browser DOM manipulation. It provides comprehensive rendering capabilities for client-side, server-side, and static site generation, with specialized APIs for different JavaScript runtimes and deployment targets.

## Package Information

- **Package Name**: react-dom
- **Package Type**: npm
- **Language**: JavaScript/TypeScript
- **Version**: 19.2.0
- **License**: MIT
- **Installation**: `npm install react react-dom`
- **Peer Dependencies**: react@^19.2.0
- **Homepage**: https://react.dev/

## Core Imports

```javascript
// Client-side rendering
import { createRoot, hydrateRoot } from 'react-dom/client';

// Server-side rendering
import { renderToPipeableStream } from 'react-dom/server';

// Static prerendering
import { prerender } from 'react-dom/static';

// Shared utilities
import { createPortal, flushSync } from 'react-dom';
```

For CommonJS:

```javascript
const { createRoot, hydrateRoot } = require('react-dom/client');
const { renderToPipeableStream } = require('react-dom/server');
const { createPortal, flushSync } = require('react-dom');
```

## Basic Usage

### Client-Side Rendering

```javascript
import { createRoot } from 'react-dom/client';

function App() {
  return <div>Hello World</div>;
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

### Server-Side Rendering (Node.js)

```javascript
import { renderToPipeableStream } from 'react-dom/server';

function App() {
  return <div>Hello World</div>;
}

function handleRequest(req, res) {
  const stream = renderToPipeableStream(<App />, {
    onShellReady() {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      stream.pipe(res);
    },
    onError(error) {
      console.error(error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });
}
```

### Hydration

```javascript
import { hydrateRoot } from 'react-dom/client';

function App() {
  return <div>Hello World</div>;
}

hydrateRoot(document.getElementById('root'), <App />);
```

## Architecture

React DOM is organized into several functional areas:

- **Client Rendering**: Modern concurrent rendering with `createRoot` and `hydrateRoot` APIs
- **Server Rendering**: Streaming SSR with runtime-specific implementations (Node.js, Browser, Edge, Bun)
- **Static Generation**: Prerendering APIs with postponed content support for static site generation
- **Resource Management**: Resource hint APIs for optimizing loading (DNS prefetch, preconnect, preload, preinit)
- **Portal System**: Render components outside the normal DOM hierarchy
- **Form Integration**: Progressive enhancement with Server Actions support
- **Performance Utilities**: Synchronous update control and profiling capabilities

### Entry Points

- `react-dom` - Shared utilities and resource hints
- `react-dom/client` - Client-side rendering
- `react-dom/server` - Server-side rendering (auto-selects runtime variant)
- `react-dom/server.node` - Node.js specific SSR
- `react-dom/server.browser` - Browser/Deno specific SSR
- `react-dom/server.edge` - Edge runtime specific SSR
- `react-dom/server.bun` - Bun specific SSR
- `react-dom/static` - Static prerendering (auto-selects runtime variant)
- `react-dom/static.node` - Node.js specific static generation
- `react-dom/static.browser` - Browser specific static generation
- `react-dom/static.edge` - Edge runtime specific static generation
- `react-dom/profiling` - Profiling build with React DevTools integration
- `react-dom/test-utils` - Testing utilities (deprecated)

## Capabilities

### Client-Side Rendering

APIs for rendering React components in the browser with modern concurrent rendering features.

```javascript { .api }
function createRoot(
  container: Element | DocumentFragment,
  options?: CreateRootOptions
): Root;

interface Root {
  render(children: ReactNode): void;
  unmount(): void;
}

interface CreateRootOptions {
  unstable_strictMode?: boolean;
  identifierPrefix?: string;
  onUncaughtError?: (error: Error, errorInfo: ErrorInfo) => void;
  onCaughtError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRecoverableError?: (error: Error, errorInfo: ErrorInfo) => void;
  onDefaultTransitionIndicator?: () => void | (() => void);
  unstable_transitionCallbacks?: TransitionTracingCallbacks;
}

function hydrateRoot(
  container: Element | Document,
  initialChildren: ReactNode,
  options?: HydrateRootOptions
): Root;

interface HydrateRootOptions extends CreateRootOptions {
  onHydrated?: (suspenseBoundary: SuspenseBoundary) => void;
  onDeleted?: (suspenseBoundary: SuspenseBoundary) => void;
  formState?: ReactFormState;
}
```

[Client Rendering](./client-rendering.md)

### Server-Side Rendering

Streaming server-side rendering APIs optimized for different JavaScript runtimes.

```javascript { .api }
// Node.js - Primary streaming API
function renderToPipeableStream(
  children: ReactNode,
  options?: RenderToPipeableStreamOptions
): PipeableStream;

interface PipeableStream {
  pipe<T extends Writable>(destination: T): T;
  abort(reason?: string): void;
}

// Web Streams API (Browser/Edge/Bun)
function renderToReadableStream(
  children: ReactNode,
  options?: RenderToReadableStreamOptions
): Promise<ReadableStream & { allReady: Promise<void> }>;

// Resume from postponed state
function resumeToPipeableStream(
  children: ReactNode,
  postponedState: PostponedState,
  options?: RenderToPipeableStreamOptions
): PipeableStream;

function resume(
  children: ReactNode,
  postponedState: PostponedState,
  options?: RenderToReadableStreamOptions
): Promise<ReadableStream>;
```

[Server-Side Rendering](./server-rendering.md)

### Static Site Generation

APIs for prerendering React components to static HTML with support for postponed content.

```javascript { .api }
// Web Streams API
function prerender(
  children: ReactNode,
  options?: PrerenderOptions
): Promise<{ prelude: ReadableStream; postponed: PostponedState | null }>;

// Node.js Streams API
function prerenderToNodeStream(
  children: ReactNode,
  options?: PrerenderOptions
): Promise<{ prelude: Readable; postponed: PostponedState | null }>;

// Resume and prerender with postponed state
function resumeAndPrerender(
  children: ReactNode,
  postponedState: PostponedState,
  options?: PrerenderOptions
): Promise<{ prelude: ReadableStream; postponed: PostponedState | null }>;

function resumeAndPrerenderToNodeStream(
  children: ReactNode,
  postponedState: PostponedState,
  options?: PrerenderOptions
): Promise<{ prelude: Readable; postponed: PostponedState | null }>;
```

[Static Site Generation](./static-generation.md)

### Portals

Render React children into a DOM node outside the current component hierarchy, useful for modals, tooltips, and overlays.

```javascript { .api }
function createPortal(
  children: ReactNode,
  container: Element | DocumentFragment,
  key?: string
): ReactPortal;
```

**Usage Example:**

```javascript
import { createPortal } from 'react-dom';

function Modal({ children }) {
  return createPortal(
    <div className="modal">{children}</div>,
    document.getElementById('modal-root')
  );
}
```

### Resource Hints

APIs for optimizing resource loading with DNS prefetch, preconnect, preload, and preinit capabilities.

```javascript { .api }
function prefetchDNS(href: string): void;

function preconnect(
  href: string,
  options?: { crossOrigin?: 'anonymous' | 'use-credentials' }
): void;

function preload(href: string, options: PreloadOptions): void;

interface PreloadOptions {
  as: string; // Required: 'style' | 'font' | 'script' | 'image' | etc.
  crossOrigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
  type?: string;
  media?: string;
  nonce?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  imageSrcSet?: string;
  imageSizes?: string;
  referrerPolicy?: string;
}

function preloadModule(
  href: string,
  options?: PreloadModuleOptions
): void;

interface PreloadModuleOptions {
  as?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
  nonce?: string;
}

function preinit(href: string, options: PreinitOptions): void;

interface PreinitOptions {
  as: 'style' | 'script'; // Required
  precedence?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
  nonce?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
}

function preinitModule(
  href: string,
  options?: PreinitModuleOptions
): void;

interface PreinitModuleOptions {
  as?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
  nonce?: string;
}
```

[Resource Hints](./resource-hints.md)

### Form Actions

React hooks for progressive enhancement and Server Actions integration.

```javascript { .api }
function useFormState<S, P = FormData>(
  action: (prevState: Awaited<S>, payload: P) => S,
  initialState: Awaited<S>,
  permalink?: string
): [state: Awaited<S>, dispatch: (payload: P) => void, isPending: boolean];

// Return type is a discriminated union based on pending state
type FormStatusNotPending = {
  pending: false;
  data: null;
  method: null;
  action: null;
};

type FormStatusPending = {
  pending: true;
  data: FormData;
  method: string;
  action: string | ((formData: FormData) => void | Promise<void>) | null;
};

type FormStatus = FormStatusPending | FormStatusNotPending;

function useFormStatus(): FormStatus;

function requestFormReset(form: HTMLFormElement): void;
```

[Form Actions](./form-actions.md)

### Performance Utilities

Control over React's update scheduling and performance profiling.

```javascript { .api }
function flushSync<R>(fn?: () => R): R;
```

**Usage Example:**

```javascript
import { flushSync } from 'react-dom';

// Force synchronous update (use sparingly)
flushSync(() => {
  setState(newValue);
});
// DOM is guaranteed to be updated here
```

**Warning**: `flushSync` can harm performance. Use only when you need to read from the DOM immediately after a state update.

### Version Information

```javascript { .api }
const version: string; // "19.2.0"
```

Exported from all entry points.

## Types

### ErrorInfo

```javascript { .api }
interface ErrorInfo {
  componentStack?: string;
  errorBoundary?: React.Component;
}
```

### ReactFormState

```javascript { .api }
interface ReactFormState<S = any, P = any> {
  [key: string]: any;
}
```

### PostponedState

```javascript { .api }
// Opaque type representing postponed rendering state
type PostponedState = OpaquePostponedState;
```

Used for resuming rendering in static generation and server rendering scenarios.

### SuspenseBoundary

```javascript { .api }
// Opaque type representing a Suspense boundary node
type SuspenseBoundary = Comment;
```

## Deprecated APIs

### unstable_batchedUpdates

```javascript { .api }
function unstable_batchedUpdates<A, R>(fn: (a: A) => R, a: A): R;
```

**Status**: Deprecated - batching is now automatic in React 18+. This is now a no-op passthrough.

### Legacy Server Rendering

```javascript { .api }
function renderToString(children: ReactNode): string;
function renderToStaticMarkup(children: ReactNode): string;
```

**Status**: Deprecated - use streaming APIs (`renderToPipeableStream` or `renderToReadableStream`) instead. These legacy APIs don't support Suspense or streaming.

### Test Utils act

```javascript { .api }
function act(callback: () => void | Promise<void>): Promise<void>;
```

**Status**: Deprecated - import `act` from 'react' package instead of 'react-dom/test-utils'.

## Internal APIs

### __DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE

**Warning**: This is an internal API exported from the main entry point. Do not use - it will break in future React versions without warning.

## Runtime-Specific Entry Points

React DOM provides runtime-specific builds optimized for different JavaScript environments:

### Server Rendering Entry Points

- **react-dom/server** - Auto-selects based on environment
- **react-dom/server.node** - Node.js (uses `renderToPipeableStream`)
- **react-dom/server.browser** - Browser/Deno (uses `renderToReadableStream`)
- **react-dom/server.edge** - Edge runtimes like Cloudflare Workers (uses `renderToReadableStream`)
- **react-dom/server.bun** - Bun runtime (uses `renderToReadableStream`)

### Static Generation Entry Points

- **react-dom/static** - Auto-selects based on environment
- **react-dom/static.node** - Node.js (provides `prerenderToNodeStream`)
- **react-dom/static.browser** - Browser (provides `prerender` with ReadableStream)
- **react-dom/static.edge** - Edge runtimes (provides `prerender` with ReadableStream)

### Special Entry Points

- **react-dom/profiling** - Same as client + main entry point, but with profiling instrumentation for React DevTools Profiler
- **react-dom/test-utils** - Legacy testing utilities (deprecated)
- **react-dom/unstable_testing** - Experimental testing utilities
- **react-dom/unstable_server-external-runtime** - Experimental external runtime for server rendering

## Best Practices

1. **Use createRoot for new applications**: Prefer `createRoot` over legacy `ReactDOM.render`
2. **Prefer streaming SSR**: Use `renderToPipeableStream` or `renderToReadableStream` over deprecated `renderToString`
3. **Use appropriate runtime variant**: Import from runtime-specific entry points when targeting specific environments
4. **Minimize flushSync usage**: Only use `flushSync` when absolutely necessary as it can harm performance
5. **Leverage resource hints**: Use `prefetchDNS`, `preconnect`, `preload`, and `preinit` to optimize loading
6. **Progressive enhancement**: Use form hooks (`useFormState`, `useFormStatus`) for better UX
7. **Error boundaries**: Configure error handlers in `createRoot` options for better error handling
8. **Hydration best practices**: Ensure server and client render identical content to avoid hydration mismatches

## Migration Notes

### From React 17 to React 18+

```javascript
// Old (React 17)
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// New (React 18+)
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

### From legacy SSR to streaming

```javascript
// Old (deprecated)
import { renderToString } from 'react-dom/server';
const html = renderToString(<App />);

// New (streaming)
import { renderToPipeableStream } from 'react-dom/server';
const stream = renderToPipeableStream(<App />, {
  onShellReady() {
    stream.pipe(res);
  }
});
```

## See Also

- React Documentation: https://react.dev/
- React DOM Reference: https://react.dev/reference/react-dom
- React DOM Client: https://react.dev/reference/react-dom/client
- React DOM Server: https://react.dev/reference/react-dom/server
- React DOM Components: https://react.dev/reference/react-dom/components
