# Client Configuration

Comprehensive configuration options for creating libSQL clients with different connection types, performance settings, and deployment scenarios.

## Capabilities

### Client Creation

Creates a Client instance based on the provided configuration, automatically selecting the appropriate implementation based on URL scheme.

```typescript { .api }
/**
 * Creates a Client instance based on the provided configuration
 * @param config - Configuration object specifying connection and behavior options
 * @returns Platform-appropriate Client implementation (HttpClient, WsClient, or Sqlite3Client)
 */
function createClient(config: Config): Client;
```

### Configuration Interface

Complete configuration options for client creation with support for different deployment scenarios.

```typescript { .api }
interface Config {
  /** Database URL supporting multiple schemes: libsql:, http:, https:, ws:, wss:, file: */
  url: string;
  
  /** Authentication token for remote database access */
  authToken?: string;
  
  /** Encryption key for database file encryption at rest */
  encryptionKey?: string;
  
  /** Remote server URL for embedded replica synchronization */
  syncUrl?: string;
  
  /** Synchronization interval in seconds for embedded replicas */
  syncInterval?: number;
  
  /** Enable read-your-writes consistency for embedded replicas */
  readYourWrites?: boolean;
  
  /** Enable offline writes for embedded replicas */
  offline?: boolean;
  
  /** Enable or disable TLS for libsql: URLs (default: true) */
  tls?: boolean;
  
  /** Integer representation mode for JavaScript compatibility */
  intMode?: IntMode;
  
  /** Custom fetch function for HTTP client (overrides default) */
  fetch?: Function;
  
  /** Maximum concurrent requests (default: 20, set to 0 for unlimited) */
  concurrency?: number | undefined;
}
```

### Integer Mode Configuration

Configure how SQLite integers are represented in JavaScript to handle large numbers correctly.

```typescript { .api }
/**
 * Integer representation modes for JavaScript compatibility
 * - "number": JavaScript numbers (double precision floats), throws RangeError for values > 2^53-1
 * - "bigint": JavaScript bigints (arbitrary precision integers) 
 * - "string": String representation of integers
 */
type IntMode = "number" | "bigint" | "string";
```

**Usage Examples:**

```typescript
import { createClient } from "@libsql/client";

// Local SQLite database
const localClient = createClient({
  url: "file:./database.db"
});

// Remote HTTP database
const remoteClient = createClient({
  url: "https://your-database.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN
});

// WebSocket connection
const wsClient = createClient({
  url: "wss://your-database.turso.io", 
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Embedded replica (local file that syncs with remote)
const replicaClient = createClient({
  url: "file:./local-replica.db",
  syncUrl: "libsql://your-database.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 60000, // sync every minute
  readYourWrites: true,
  offline: true
});

// With encryption
const encryptedClient = createClient({
  url: "file:./encrypted.db",
  encryptionKey: process.env.DB_ENCRYPTION_KEY
});

// Custom integer handling for large numbers
const bigintClient = createClient({
  url: "file:./database.db",
  intMode: "bigint" // Use bigint for all integers
});

// High concurrency configuration
const highConcurrencyClient = createClient({
  url: "https://your-database.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN,
  concurrency: 100 // Allow up to 100 concurrent requests
});

// Custom fetch function (useful for testing or special environments)
const customFetchClient = createClient({
  url: "https://your-database.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN,
  fetch: customFetchImplementation
});
```

### URL Scheme Support

Different URL schemes automatically select the appropriate client implementation:

- **`file:`** - Local SQLite files using Sqlite3Client
- **`http:`/`https:`** - HTTP connections using HttpClient  
- **`ws:`/`wss:`** - WebSocket connections using WsClient
- **`libsql:`** - Auto-detection based on server capabilities (defaults to WebSocket with TLS)

### Embedded Replica Configuration

Special configuration for embedded replicas that provide offline capability:

```typescript
// Embedded replica configuration
const replicaConfig = {
  url: "file:local.db",           // Local SQLite file
  syncUrl: "libsql://remote.db",  // Remote database to sync with
  authToken: "token",             // Authentication for remote
  syncInterval: 60000,            // Auto-sync every 60 seconds
  readYourWrites: true,           // Ensure read consistency
  offline: true                   // Allow offline operations
};
```

### Error Handling

Configuration errors are thrown as `LibsqlError` instances with specific error codes:

**Configuration Error Codes:**
- `URL_SCHEME_NOT_SUPPORTED` - Unsupported URL scheme (e.g., "ftp://")
- `URL_INVALID` - Malformed URL or invalid URL parameters
- `URL_PARAM_NOT_SUPPORTED` - Unsupported URL query parameter
- `ENCRYPTION_KEY_NOT_SUPPORTED` - Encryption not supported by client type
- `WEBSOCKETS_NOT_SUPPORTED` - WebSocket support not available in environment

**Runtime Error Codes:**
- `CLIENT_CLOSED` - Operation attempted on closed client
- `TRANSACTION_CLOSED` - Operation attempted on closed transaction  
- `SYNC_NOT_SUPPORTED` - Sync operation not supported by client type

```typescript
import { createClient, LibsqlError } from "@libsql/client";

try {
  const client = createClient({ url: "invalid://url" });
} catch (error) {
  if (error instanceof LibsqlError) {
    console.log(error.code); // "URL_SCHEME_NOT_SUPPORTED"
    console.log(error.rawCode); // Numeric error code (when available)
  }
}
```