# Resource Hints

APIs for optimizing resource loading through DNS prefetching, preconnecting, preloading, and preinitialization. These functions help improve page load performance by giving the browser hints about resources that will be needed.

## Capabilities

### prefetchDNS

Prefetch DNS for a given URL, warming up the DNS resolver before the resource is actually needed.

```javascript { .api }
/**
 * Prefetch DNS for a URL
 * @param href - URL to prefetch DNS for
 */
function prefetchDNS(href: string): void;
```

**Usage Examples:**

```javascript
import { prefetchDNS } from 'react-dom';

function App() {
  // Prefetch DNS for external resources
  prefetchDNS('https://api.example.com');
  prefetchDNS('https://cdn.example.com');

  return <YourApp />;
}

// In components
function VideoPlayer() {
  prefetchDNS('https://video-cdn.example.com');

  return <video src="https://video-cdn.example.com/video.mp4" />;
}
```

**When to Use:**

- External API domains you'll fetch from
- CDN domains for assets
- Third-party services (analytics, ads)
- Any cross-origin resource

**Benefits:**

- Reduces DNS lookup time (typically 20-120ms saved)
- Works in parallel with other loading
- Zero cost if resource isn't used

### preconnect

Preconnect to an origin, establishing the full connection (DNS + TCP + TLS) before the resource is needed.

```javascript { .api }
/**
 * Preconnect to an origin
 * @param href - Origin URL to connect to
 * @param options - Optional connection configuration
 */
function preconnect(
  href: string,
  options?: PreconnectOptions
): void;

interface PreconnectOptions {
  /** CORS mode for the connection */
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
}
```

**Usage Examples:**

```javascript
import { preconnect } from 'react-dom';

function App() {
  // Preconnect to API
  preconnect('https://api.example.com');

  // Preconnect to CDN with CORS
  preconnect('https://cdn.example.com', {
    crossOrigin: 'anonymous'
  });

  // Preconnect for authenticated requests
  preconnect('https://private-api.example.com', {
    crossOrigin: 'use-credentials'
  });

  return <YourApp />;
}

// Strategic preconnect in route component
function CheckoutPage() {
  // User is likely to proceed to payment
  preconnect('https://payment-api.example.com');

  return <CheckoutForm />;
}
```

**When to Use:**

- Origins you'll definitely fetch from soon
- Payment gateways when entering checkout
- Authentication services
- Streaming media sources

**Benefits:**

- Saves DNS + TCP + TLS time (typically 100-500ms)
- More aggressive than prefetchDNS
- Best for high-probability resources

**Notes:**

- More expensive than prefetchDNS (opens connection)
- Limit to 4-6 domains (browser connection limits)
- Connection may timeout if not used quickly

### preload

Preload a specific resource, downloading it before the browser would normally discover it.

```javascript { .api }
/**
 * Preload a resource
 * @param href - Resource URL to preload
 * @param options - Required resource type and optional configuration
 */
function preload(
  href: string,
  options: PreloadOptions
): void;

interface PreloadOptions {
  /** Resource type (required) */
  as: string; // 'style' | 'font' | 'script' | 'image' | 'fetch' | 'audio' | 'video' | 'document' | 'worker' | 'embed' | 'object' | 'track'
  /** CORS mode */
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  /** Subresource integrity hash */
  integrity?: string;
  /** MIME type hint */
  type?: string;
  /** Media query for conditional loading */
  media?: string;
  /** Content Security Policy nonce */
  nonce?: string;
  /** Fetch priority hint */
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Image srcset for responsive images */
  imageSrcSet?: string;
  /** Image sizes for responsive images */
  imageSizes?: string;
  /** Referrer policy */
  referrerPolicy?: string;
}
```

**Usage Examples:**

```javascript
import { preload } from 'react-dom';

function App() {
  // Preload critical CSS
  preload('/styles/critical.css', { as: 'style' });

  // Preload font
  preload('/fonts/main.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous'
  });

  // Preload hero image
  preload('/images/hero.jpg', {
    as: 'image',
    fetchPriority: 'high'
  });

  // Preload API data
  preload('/api/initial-data.json', {
    as: 'fetch',
    crossOrigin: 'anonymous'
  });

  // Preload video
  preload('/videos/intro.mp4', {
    as: 'video',
    type: 'video/mp4'
  });

  return <YourApp />;
}

// Responsive image preload
function HeroSection() {
  preload('/images/hero.jpg', {
    as: 'image',
    imageSrcSet: '/images/hero-small.jpg 480w, /images/hero-large.jpg 1200w',
    imageSizes: '(max-width: 600px) 480px, 1200px',
    fetchPriority: 'high'
  });

  return (
    <img
      src="/images/hero.jpg"
      srcSet="/images/hero-small.jpg 480w, /images/hero-large.jpg 1200w"
      sizes="(max-width: 600px) 480px, 1200px"
      alt="Hero"
    />
  );
}

// Conditional preload with media query
function App() {
  preload('/styles/desktop.css', {
    as: 'style',
    media: '(min-width: 768px)'
  });

  return <YourApp />;
}

// Preload with integrity check
function App() {
  preload('/vendor/library.js', {
    as: 'script',
    integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux...',
    crossOrigin: 'anonymous'
  });

  return <YourApp />;
}
```

**When to Use:**

- Critical CSS for above-the-fold content
- Web fonts used immediately
- Hero images
- Critical JavaScript bundles
- Data needed for initial render

**Resource Types:**

- **style**: CSS stylesheets
- **font**: Web fonts
- **script**: JavaScript files
- **image**: Images
- **fetch**: XHR/fetch resources (JSON, API data)
- **audio**: Audio files
- **video**: Video files
- **document**: HTML documents (for prefetching)
- **worker**: Web Workers
- **embed**: Embed resources
- **object**: Object resources
- **track**: Text tracks (WebVTT)

**Benefits:**

- Downloads resource in parallel with page load
- Cached and ready when actually referenced
- Can prioritize with fetchPriority

**Notes:**

- Only preload resources you're certain will be used
- Too many preloads can slow down critical resources
- Preloaded resources expire from cache after a short time

### preloadModule

Preload an ES module, downloading it before it's dynamically imported.

```javascript { .api }
/**
 * Preload an ES module
 * @param href - Module URL to preload
 * @param options - Optional configuration
 */
function preloadModule(
  href: string,
  options?: PreloadModuleOptions
): void;

interface PreloadModuleOptions {
  /** Resource type hint (usually omitted for modules) */
  as?: string;
  /** CORS mode */
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  /** Subresource integrity hash */
  integrity?: string;
  /** Content Security Policy nonce */
  nonce?: string;
}
```

**Usage Examples:**

```javascript
import { preloadModule } from 'react-dom';

function App() {
  // Preload ES module
  preloadModule('/modules/feature.js');

  // Preload module with integrity
  preloadModule('/modules/vendor.js', {
    integrity: 'sha384-...',
    crossOrigin: 'anonymous'
  });

  return <YourApp />;
}

// Preload lazy-loaded component module
function Dashboard() {
  // User will likely open settings
  preloadModule('/modules/SettingsPanel.js');

  return (
    <div>
      <button onClick={() => import('/modules/SettingsPanel.js')}>
        Open Settings
      </button>
    </div>
  );
}

// Preload route module on link hover
function NavLink({ to, children }) {
  function handleMouseEnter() {
    preloadModule(`/routes${to}.js`);
  }

  return (
    <a href={to} onMouseEnter={handleMouseEnter}>
      {children}
    </a>
  );
}
```

**When to Use:**

- Lazy-loaded component modules
- Route modules for likely navigation
- Feature modules for anticipated user actions
- Dynamic import() targets

**Benefits:**

- Modules ready when imported
- Works with code splitting
- Improves lazy loading performance

### preinit

Preinitialize a resource, downloading and executing it (for scripts) or inserting it into the document (for stylesheets).

```javascript { .api }
/**
 * Preinitialize and execute/apply a resource
 * @param href - Resource URL to preinit
 * @param options - Required resource type and optional configuration
 */
function preinit(
  href: string,
  options: PreinitOptions
): void;

interface PreinitOptions {
  /** Resource type - required */
  as: 'style' | 'script';
  /** Precedence for stylesheet insertion order */
  precedence?: string;
  /** CORS mode */
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  /** Subresource integrity hash */
  integrity?: string;
  /** Content Security Policy nonce */
  nonce?: string;
  /** Fetch priority hint */
  fetchPriority?: 'high' | 'low' | 'auto';
}
```

**Usage Examples:**

```javascript
import { preinit } from 'react-dom';

function App() {
  // Preinit stylesheet (downloads and inserts into document)
  preinit('/styles/app.css', { as: 'style' });

  // Preinit with precedence (controls insertion order)
  preinit('/styles/reset.css', {
    as: 'style',
    precedence: 'reset'  // Applied first
  });

  preinit('/styles/theme.css', {
    as: 'style',
    precedence: 'default'  // Applied after reset
  });

  // Preinit script (downloads and executes)
  preinit('/scripts/analytics.js', {
    as: 'script',
    crossOrigin: 'anonymous'
  });

  // Preinit with high priority
  preinit('/styles/critical.css', {
    as: 'style',
    precedence: 'high',
    fetchPriority: 'high'
  });

  return <YourApp />;
}

// Conditional preinit based on feature flag
function App({ features }) {
  if (features.newUI) {
    preinit('/styles/new-ui.css', {
      as: 'style',
      precedence: 'theme'
    });
  }

  return <YourApp />;
}

// Preinit third-party scripts
function Layout() {
  preinit('https://www.google-analytics.com/analytics.js', {
    as: 'script',
    crossOrigin: 'anonymous'
  });

  return <Page />;
}
```

**When to Use:**

- Stylesheets you know will be needed
- Analytics and monitoring scripts
- Third-party libraries
- Configuration scripts

**Precedence Values:**

Stylesheets with higher precedence (alphabetically later) are inserted later in the document:

```javascript
preinit('/reset.css', { as: 'style', precedence: 'reset' });    // First
preinit('/theme.css', { as: 'style', precedence: 'theme' });    // Second
preinit('/components.css', { as: 'style', precedence: 'ui' });  // Third
```

**Benefits:**

- Resource is applied immediately
- No need for separate `<link>` or `<script>` tags
- Automatic deduplication (calling multiple times won't duplicate)

**Notes:**

- More aggressive than preload (actually applies/executes)
- Only use for resources you're certain will be needed
- For scripts, this executes them immediately

### preinitModule

Preinitialize an ES module, downloading and executing it.

```javascript { .api }
/**
 * Preinitialize and execute an ES module
 * @param href - Module URL to preinit
 * @param options - Optional configuration
 */
function preinitModule(
  href: string,
  options?: PreinitModuleOptions
): void;

interface PreinitModuleOptions {
  /** Resource type hint */
  as?: string;
  /** CORS mode */
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  /** Subresource integrity hash */
  integrity?: string;
  /** Content Security Policy nonce */
  nonce?: string;
}
```

**Usage Examples:**

```javascript
import { preinitModule } from 'react-dom';

function App() {
  // Preinit ES module (downloads and executes)
  preinitModule('/modules/init.js');

  // Preinit with options
  preinitModule('/modules/config.js', {
    crossOrigin: 'anonymous',
    integrity: 'sha384-...'
  });

  return <YourApp />;
}

// Preinit analytics module
function App() {
  preinitModule('/modules/analytics.js');

  return <YourApp />;
}

// Preinit feature detection module
function App() {
  preinitModule('/modules/feature-detection.js');

  return <YourApp />;
}
```

**When to Use:**

- Initialization modules
- Feature detection scripts
- Analytics modules
- Configuration modules

**Benefits:**

- Module executes immediately
- Side effects run early
- Cached for later imports

## Performance Strategies

### Critical Resource Loading

```javascript
function App() {
  // 1. DNS: Warm up external domains
  prefetchDNS('https://cdn.example.com');
  prefetchDNS('https://api.example.com');

  // 2. Preconnect: High-probability origins
  preconnect('https://cdn.example.com', { crossOrigin: 'anonymous' });

  // 3. Preload: Critical resources
  preload('/styles/critical.css', { as: 'style', fetchPriority: 'high' });
  preload('/fonts/main.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });

  // 4. Preinit: Apply immediately
  preinit('/styles/app.css', { as: 'style', precedence: 'default' });

  return <YourApp />;
}
```

### Progressive Enhancement

```javascript
function ProductPage() {
  // Essential: Preinit critical CSS
  preinit('/styles/product.css', { as: 'style' });

  // Nice-to-have: Preload images
  preload('/images/product-main.jpg', { as: 'image', fetchPriority: 'high' });

  // Speculative: Preconnect to likely next action
  preconnect('https://checkout-api.example.com');

  return <Product />;
}
```

### Route Prefetching

```javascript
function Navigation() {
  return (
    <nav>
      <Link
        to="/products"
        onMouseEnter={() => {
          // Prefetch route resources on hover
          preloadModule('/routes/products.js');
          preload('/api/products', { as: 'fetch' });
        }}
      >
        Products
      </Link>
    </nav>
  );
}
```

### Font Loading Strategy

```javascript
function App() {
  // Preload critical fonts
  preload('/fonts/primary-regular.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
    fetchPriority: 'high'
  });

  // Preload secondary fonts (lower priority)
  preload('/fonts/primary-bold.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous'
  });

  return <YourApp />;
}
```

### Third-Party Script Loading

```javascript
function App() {
  // Preconnect to third-party domains
  preconnect('https://www.google-analytics.com');
  preconnect('https://cdn.segment.com');

  // Preinit analytics (low priority)
  preinit('https://www.google-analytics.com/analytics.js', {
    as: 'script',
    crossOrigin: 'anonymous'
  });

  return <YourApp />;
}
```

## Best Practices

1. **Start Conservative**: Begin with prefetchDNS/preconnect, add preload/preinit as needed
2. **Prioritize Critical Resources**: Use fetchPriority: 'high' for above-the-fold content
3. **Limit Preconnects**: Maximum 4-6 domains (browser connection limits)
4. **Preload Fonts**: Always preload fonts used in critical rendering path
5. **Use Precedence**: Control stylesheet order with precedence option
6. **Cross-Origin**: Always set crossOrigin for fonts and external resources
7. **Deduplication**: React automatically deduplicates - safe to call multiple times
8. **Measure Impact**: Use browser DevTools to verify resource hints are effective
9. **Avoid Over-Optimizing**: Too many hints can hurt performance
10. **Server-Side**: These hints work in SSR - insert <link rel="dns-prefetch"> etc.

## Comparison Table

| Function | Action | Cost | Use When |
|----------|--------|------|----------|
| **prefetchDNS** | DNS lookup | Low | External domains likely to be used |
| **preconnect** | DNS + TCP + TLS | Medium | External domains definitely to be used |
| **preload** | Download | Medium | Specific resources will be needed soon |
| **preloadModule** | Download module | Medium | ES modules will be imported |
| **preinit** | Download + Apply/Execute | High | Resources needed immediately |
| **preinitModule** | Download + Execute module | High | Modules needed immediately |

## Browser Support

All resource hint functions are supported in modern browsers and gracefully degrade in older browsers (no-op if not supported).

## Server-Side Rendering

Resource hints work in SSR and inject appropriate `<link>` tags:

```javascript
// React component
function App() {
  preload('/font.woff2', { as: 'font', type: 'font/woff2' });
  return <div>App</div>;
}

// Rendered HTML includes:
// <link rel="preload" href="/font.woff2" as="font" type="font/woff2">
```

## Common Patterns

### E-commerce Product Page

```javascript
function ProductPage({ productId }) {
  // Preconnect to checkout (user might buy)
  preconnect('https://checkout.example.com');

  // Preload product images
  preload(`/images/products/${productId}-main.jpg`, {
    as: 'image',
    fetchPriority: 'high'
  });

  // Preload related products data
  preload(`/api/products/${productId}/related`, {
    as: 'fetch',
    crossOrigin: 'anonymous'
  });

  return <Product id={productId} />;
}
```

### Media-Heavy Landing Page

```javascript
function LandingPage() {
  // Preconnect to video CDN
  preconnect('https://video-cdn.example.com');

  // Preload hero video poster
  preload('/images/video-poster.jpg', {
    as: 'image',
    fetchPriority: 'high'
  });

  // Preload video metadata
  preload('https://video-cdn.example.com/hero.mp4', {
    as: 'video',
    type: 'video/mp4'
  });

  return <Hero />;
}
```

### Dashboard Application

```javascript
function Dashboard() {
  // Preload critical data
  preload('/api/dashboard/stats', {
    as: 'fetch',
    crossOrigin: 'anonymous'
  });

  // Preload chart library module
  preloadModule('/modules/charts.js');

  // Preconnect to API
  preconnect('https://api.example.com', {
    crossOrigin: 'use-credentials'
  });

  return <DashboardLayout />;
}
```
