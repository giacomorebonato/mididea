# libSQL Client

libSQL Client is a comprehensive TypeScript/JavaScript driver for libSQL databases, offering both local and remote database connectivity with advanced features like embedded replicas that can work offline and sync with remote Turso databases. It provides full SQLite compatibility with additional libSQL features like encryption at rest and AI & Vector Search capabilities for modern applications.

## Package Information

- **Package Name**: @libsql/client
- **Package Type**: npm 
- **Language**: TypeScript
- **Installation**: `npm install @libsql/client`

## Core Imports

```typescript
import { createClient } from "@libsql/client";
```

For CommonJS:

```javascript
const { createClient } = require("@libsql/client");
```

Platform-specific imports:

```typescript
// Node.js optimized
import { createClient } from "@libsql/client/node";

// HTTP-only client
import { createClient } from "@libsql/client/http";

// WebSocket-only client  
import { createClient } from "@libsql/client/ws";

// Local SQLite3 client
import { createClient } from "@libsql/client/sqlite3";

// Web/browser client
import { createClient } from "@libsql/client/web";
```

## Basic Usage

```typescript
import { createClient } from "@libsql/client";

// Create client for local database
const client = createClient({
  url: "file:local.db"
});

// Create client for remote database
const client = createClient({
  url: "libsql://your-database.turso.io",
  authToken: "your-auth-token"
});

// Create embedded replica (works offline, syncs with remote)
const client = createClient({
  url: "file:local.db",
  syncUrl: "libsql://your-database.turso.io", 
  authToken: "your-auth-token",
  syncInterval: 60000 // sync every minute
});

// Execute a simple query
const result = await client.execute("SELECT * FROM users");
console.log(result.rows);

// Execute with parameters
const user = await client.execute({
  sql: "SELECT * FROM users WHERE id = ?",
  args: [1]
});

// Execute a batch of statements in a transaction
const results = await client.batch([
  "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)",
  {
    sql: "INSERT INTO users (name) VALUES (?)",
    args: ["Alice"]
  }
], "write");

// Don't forget to close when done
client.close();
```

## Architecture

libSQL Client is built around several key components:

- **Multi-Protocol Support**: Automatic selection between HTTP, WebSocket, and local SQLite based on URL scheme
- **Client Implementations**: Platform-specific clients (`HttpClient`, `WsClient`, `Sqlite3Client`) behind unified interface
- **Embedded Replicas**: Local SQLite files that can sync with remote Turso databases for offline capability
- **Transaction Support**: Both batch (non-interactive) and interactive transaction modes
- **Type Safety**: Full TypeScript support with configurable integer representation modes
- **Connection Management**: Automatic connection pooling, reconnection, and concurrency control
- **Cross-Platform**: Supports Node.js, browsers, Deno, Cloudflare Workers, and other runtimes

## Capabilities

### Client Creation and Configuration

Core client creation with comprehensive configuration options for different deployment scenarios and database connection types.

```typescript { .api }
function createClient(config: Config): Client;

interface Config {
  url: string;
  authToken?: string;
  encryptionKey?: string;
  syncUrl?: string;
  syncInterval?: number;
  readYourWrites?: boolean;
  offline?: boolean;
  tls?: boolean;
  intMode?: IntMode;
  fetch?: Function;
  concurrency?: number | undefined;
}

type IntMode = "number" | "bigint" | "string";
```

[Client Configuration](./client-configuration.md)

### Database Operations

Core database interaction methods for executing SQL statements, managing results, and handling different query patterns.

```typescript { .api }
interface Client {
  execute(stmt: InStatement): Promise<ResultSet>;
  execute(sql: string, args?: InArgs): Promise<ResultSet>;
  batch(stmts: Array<InStatement | [string, InArgs?]>, mode?: TransactionMode): Promise<Array<ResultSet>>;
  migrate(stmts: Array<InStatement>): Promise<Array<ResultSet>>;
  transaction(mode?: TransactionMode): Promise<Transaction>;
  /** @deprecated Please specify the `mode` explicitly. The default `"write"` will be removed in the next major release. */
  transaction(): Promise<Transaction>;
  executeMultiple(sql: string): Promise<void>;
  sync(): Promise<Replicated>;
  close(): void;
  reconnect(): void;
  closed: boolean;
  protocol: string;
}

interface ResultSet {
  columns: Array<string>;
  columnTypes: Array<string>;
  rows: Array<Row>;
  rowsAffected: number;
  lastInsertRowid: bigint | undefined;
  toJSON(): any;
}
```

[Database Operations](./database-operations.md)

### Transaction Management

Interactive transaction support with commit/rollback control for complex multi-statement operations requiring atomicity.

```typescript { .api }
interface Transaction {
  execute(stmt: InStatement): Promise<ResultSet>;
  batch(stmts: Array<InStatement>): Promise<Array<ResultSet>>;
  executeMultiple(sql: string): Promise<void>;
  rollback(): Promise<void>;
  commit(): Promise<void>;
  close(): void;
  closed: boolean;
}

type TransactionMode = "write" | "read" | "deferred";
```

[Transaction Management](./transaction-management.md)

## Core Types

```typescript { .api }
type Value = null | string | number | bigint | ArrayBuffer;

type InValue = Value | boolean | Uint8Array | Date;

type InStatement = { sql: string; args?: InArgs } | string;

type InArgs = Array<InValue> | Record<string, InValue>;

interface Row {
  length: number;
  [index: number]: Value;
  [name: string]: Value;
}

type Replicated = { frame_no: number; frames_synced: number } | undefined;

class LibsqlError extends Error {
  code: string;
  rawCode?: number;
  constructor(message: string, code: string, rawCode?: number, cause?: Error);
}
```

## Platform-Specific Behavior

### Client Implementation Selection

libSQL Client automatically selects the appropriate implementation based on URL scheme:

- **`file:` URLs** → `Sqlite3Client` (Node.js only)
- **`http:`/`https:` URLs** → `HttpClient` (all platforms)
- **`ws:`/`wss:` URLs** → `WsClient` (where WebSockets supported)
- **`libsql:` URLs** → Auto-detection (prefers WebSocket, falls back to HTTP)

### Feature Availability by Platform

**Node.js Environment:**
- ✅ All features supported including local SQLite files and encryption
- ✅ Embedded replicas with full sync capabilities
- ✅ WebSocket and HTTP connections

**Browser/Web Environment:**
- ✅ HTTP and WebSocket connections to remote databases
- ❌ Local file access and embedded replicas not supported
- ❌ Encryption keys not supported (use remote encrypted databases)

**Deno/Cloudflare Workers:**
- ✅ HTTP connections with custom fetch support
- ✅ WebSocket connections (where runtime supports it)
- ❌ Local SQLite files not supported

### Sync Operation Limitations

The `sync()` method is only available for embedded replica configurations:
- Requires both `url` (local file) and `syncUrl` (remote database)
- Only works with `Sqlite3Client` (Node.js environment)
- Returns `undefined` for non-replica clients

### Integer Mode Considerations

**`"number"` mode (default):**
- Safe for integers up to 2^53-1 (9,007,199,254,740,991)
- Throws `RangeError` for larger values
- Best performance for typical use cases

**`"bigint"` mode:**
- Handles arbitrary precision integers
- Requires explicit `BigInt()` conversion in calculations
- Recommended for applications with large integer values

**`"string"` mode:**
- Always safe but requires manual parsing
- Useful for preserving exact precision in display