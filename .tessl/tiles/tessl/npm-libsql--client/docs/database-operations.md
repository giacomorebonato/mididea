# Database Operations

Core database interaction methods for executing SQL statements, managing results, and handling different query patterns with full type safety and performance optimization.

## Capabilities

### Single Statement Execution

Execute individual SQL statements with optional parameters for queries, inserts, updates, and deletes.

```typescript { .api }
/**
 * Execute a single SQL statement
 * @param stmt - Statement object with SQL and optional arguments
 * @returns Promise resolving to query results
 */
execute(stmt: InStatement): Promise<ResultSet>;

/**
 * Execute a single SQL statement with separate arguments
 * @param sql - SQL query string
 * @param args - Optional array or object of parameter values
 * @returns Promise resolving to query results
 */
execute(sql: string, args?: InArgs): Promise<ResultSet>;
```

**Usage Examples:**

```typescript
import { createClient } from "@libsql/client";

const client = createClient({ url: "file:database.db" });

// Simple query without parameters
const users = await client.execute("SELECT * FROM users");
console.log(users.rows);

// Query with positional parameters
const user = await client.execute({
  sql: "SELECT * FROM users WHERE id = ? AND status = ?",
  args: [1, "active"]
});

// Query with named parameters  
const userByEmail = await client.execute({
  sql: "SELECT * FROM users WHERE email = $email",
  args: { email: "alice@example.com" }
});

// Insert with parameters
const insertResult = await client.execute({
  sql: "INSERT INTO users (name, email) VALUES (?, ?)",
  args: ["Bob", "bob@example.com"]
});
console.log(insertResult.lastInsertRowid); // New row ID

// Update with parameters
const updateResult = await client.execute({
  sql: "UPDATE users SET name = ? WHERE id = ?", 
  args: ["Robert", 1]
});
console.log(updateResult.rowsAffected); // Number of updated rows
```

### Batch Operations

Execute multiple SQL statements atomically in a transaction for data consistency and performance.

```typescript { .api }
/**
 * Execute a batch of SQL statements in a transaction
 * @param stmts - Array of statements or [sql, args] tuples
 * @param mode - Transaction mode (default: "deferred")
 * @returns Promise resolving to array of results for each statement
 */
batch(
  stmts: Array<InStatement | [string, InArgs?]>, 
  mode?: TransactionMode
): Promise<Array<ResultSet>>;
```

**Usage Examples:**

```typescript
// Batch insert multiple records
const results = await client.batch([
  {
    sql: "INSERT INTO users (name, email) VALUES (?, ?)",
    args: ["Alice", "alice@example.com"]
  },
  {
    sql: "INSERT INTO users (name, email) VALUES (?, ?)", 
    args: ["Bob", "bob@example.com"]
  }
], "write");

// Mixed operations in a transaction
const mixedResults = await client.batch([
  "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT)",
  ["INSERT INTO products (name) VALUES (?)", ["Laptop"]],
  ["UPDATE users SET last_login = ? WHERE id = ?", [new Date(), 1]]
], "write");

// Read-only batch for consistent snapshots
const reportData = await client.batch([
  "SELECT COUNT(*) as user_count FROM users",
  "SELECT COUNT(*) as product_count FROM products",
  "SELECT AVG(price) as avg_price FROM products"
], "read");
```

### Migration Operations

Execute database schema migrations with foreign key constraints temporarily disabled.

```typescript { .api }
/**
 * Execute a batch of statements with foreign key constraints disabled
 * Useful for database migrations and schema changes
 * @param stmts - Array of migration statements
 * @returns Promise resolving to array of results
 */
migrate(stmts: Array<InStatement>): Promise<Array<ResultSet>>;
```

**Usage Examples:**

```typescript
// Database schema migration
const migrationResults = await client.migrate([
  {
    sql: "CREATE TABLE new_users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE)"
  },
  {
    sql: "INSERT INTO new_users (id, name, email) SELECT id, name, email FROM users"
  },
  {
    sql: "DROP TABLE users"
  },
  {
    sql: "ALTER TABLE new_users RENAME TO users"
  }
]);

// Add foreign key relationships
await client.migrate([
  {
    sql: "CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id))"
  }
]);
```

### Multiple Statement Execution

Execute multiple semicolon-separated SQL statements from scripts or migrations.

```typescript { .api }
/**
 * Execute multiple semicolon-separated SQL statements
 * @param sql - SQL script with multiple statements
 * @returns Promise resolving when all statements complete
 */
executeMultiple(sql: string): Promise<void>;
```

**Usage Examples:**

```typescript
// Execute SQL script
await client.executeMultiple(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id)
  );
  
  INSERT INTO categories (name) VALUES ('Electronics'), ('Books');
`);

// Execute migration script
const migrationScript = await fs.readFile('./migrations/001_initial.sql', 'utf8');
await client.executeMultiple(migrationScript);
```

### Database Synchronization

Synchronize embedded replica databases with remote servers.

```typescript { .api }
/**
 * Manually trigger synchronization with remote database
 * Only available for embedded replica configurations
 * @returns Promise resolving to sync statistics
 */
sync(): Promise<Replicated>;
```

**Usage Examples:**

```typescript
// Manual sync for embedded replica
const client = createClient({
  url: "file:local.db",
  syncUrl: "libsql://remote.turso.io",
  authToken: "token"
});

// Trigger manual sync
const syncResult = await client.sync();
if (syncResult) {
  console.log(`Synced ${syncResult.frames_synced} frames`);
  console.log(`Current frame: ${syncResult.frame_no}`);
}
```

### Connection Management

Manage client lifecycle and connection state.

```typescript { .api }
/**
 * Close the client and release all resources
 * Aborts any operations currently in progress
 */
close(): void;

/**
 * Reconnect after the client has been closed
 * Creates new underlying connections
 */
reconnect(): void;

/** Whether the client is closed */
readonly closed: boolean;

/** Protocol used by the client: "http", "ws", or "file" */
readonly protocol: string;
```

**Usage Examples:**

```typescript
const client = createClient({ url: "file:database.db" });

// Check connection state
console.log(client.protocol); // "file"
console.log(client.closed);   // false

// Proper cleanup
process.on('SIGINT', () => {
  client.close();
  process.exit(0);
});

// Reconnect after network issues
try {
  await client.execute("SELECT 1");
} catch (error) {
  if (client.closed) {
    await client.reconnect();
    await client.execute("SELECT 1"); // Retry operation
  }
}
```

## Result Set Interface

```typescript { .api }
interface ResultSet {
  /** Column names from the SQL query */
  columns: Array<string>;
  
  /** Column types (when available from schema) */
  columnTypes: Array<string>;
  
  /** Array of result rows */
  rows: Array<Row>;
  
  /** Number of rows affected by INSERT, UPDATE, or DELETE */
  rowsAffected: number;
  
  /** ROWID of the last inserted row (INSERT operations only) */
  lastInsertRowid: bigint | undefined;
  
  /** Convert result set to JSON representation */
  toJSON(): any;
}

interface Row {
  /** Number of columns in this row */
  length: number;
  
  /** Access column values by numeric index */
  [index: number]: Value;
  
  /** Access column values by column name */
  [name: string]: Value;
}
```

## Transaction Modes

```typescript { .api }
/**
 * Transaction isolation and locking modes
 * - "write": Immediate write lock, blocks other write transactions
 * - "read": Read-only transaction, allows concurrent reads
 * - "deferred": Starts as read, upgrades to write on first write operation
 */
type TransactionMode = "write" | "read" | "deferred";
```

## Input Types

```typescript { .api }
/** SQL statement with optional parameters */
type InStatement = { sql: string; args?: InArgs } | string;

/** Parameter values for SQL statements */
type InArgs = Array<InValue> | Record<string, InValue>;

/** JavaScript values that can be used as SQL parameters */
type InValue = Value | boolean | Uint8Array | Date;

/** SQL result values */
type Value = null | string | number | bigint | ArrayBuffer;

/** Sync operation result */
type Replicated = { frame_no: number; frames_synced: number } | undefined;
```