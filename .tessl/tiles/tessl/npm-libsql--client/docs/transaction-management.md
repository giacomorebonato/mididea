# Transaction Management

Interactive transaction support with commit/rollback control for complex multi-statement operations requiring atomicity and consistency.

## Capabilities

### Transaction Creation

Start interactive transactions with different isolation modes for fine-grained control over database operations.

```typescript { .api }
/**
 * Start an interactive transaction
 * @param mode - Transaction mode (default: "write") 
 * @returns Promise resolving to Transaction instance
 */
transaction(mode?: TransactionMode): Promise<Transaction>;
```

**Usage Examples:**

```typescript
import { createClient } from "@libsql/client";

const client = createClient({ url: "file:database.db" });

// Write transaction (default)
const writeTxn = await client.transaction("write");

// Read-only transaction for consistent snapshots
const readTxn = await client.transaction("read");

// Deferred transaction (starts as read, upgrades to write as needed)
const deferredTxn = await client.transaction("deferred");
```

### Transaction Execution

Execute SQL statements within the transaction context with full atomicity guarantees.

```typescript { .api }
/**
 * Execute an SQL statement within the transaction
 * @param stmt - Statement with SQL and optional arguments
 * @returns Promise resolving to query results
 */
execute(stmt: InStatement): Promise<ResultSet>;
```

**Usage Examples:**

```typescript
const transaction = await client.transaction("write");

try {
  // Execute statements within transaction
  const user = await transaction.execute({
    sql: "INSERT INTO users (name, email) VALUES (?, ?)",
    args: ["Alice", "alice@example.com"]
  });
  
  const userId = user.lastInsertRowid;
  
  await transaction.execute({
    sql: "INSERT INTO user_preferences (user_id, theme) VALUES (?, ?)",
    args: [userId, "dark"]
  });
  
  // Commit if all operations succeed
  await transaction.commit();
} catch (error) {
  // Rollback on any error
  await transaction.rollback();
} finally {
  // Always close transaction to free resources
  transaction.close();
}
```

### Transaction Batch Operations

Execute multiple statements atomically within a transaction for better performance.

```typescript { .api }
/**
 * Execute a batch of statements within the transaction
 * @param stmts - Array of statements to execute
 * @returns Promise resolving to array of results
 */
batch(stmts: Array<InStatement>): Promise<Array<ResultSet>>;
```

**Usage Examples:**

```typescript
const transaction = await client.transaction("write");

try {
  // Batch multiple related operations
  const results = await transaction.batch([
    {
      sql: "UPDATE accounts SET balance = balance - ? WHERE id = ?",
      args: [100, 1] // Debit account 1
    },
    {
      sql: "UPDATE accounts SET balance = balance + ? WHERE id = ?", 
      args: [100, 2] // Credit account 2
    },
    {
      sql: "INSERT INTO transactions (from_account, to_account, amount) VALUES (?, ?, ?)",
      args: [1, 2, 100] // Record transaction
    }
  ]);
  
  await transaction.commit();
  console.log("Transfer completed successfully");
} finally {
  transaction.close();
}
```

### Multiple Statement Execution

Execute multiple semicolon-separated statements within the transaction.

```typescript { .api }
/**
 * Execute multiple semicolon-separated SQL statements within transaction
 * @param sql - SQL script with multiple statements
 * @returns Promise resolving when all statements complete
 */
executeMultiple(sql: string): Promise<void>;
```

**Usage Examples:**

```typescript
const transaction = await client.transaction("write");

try {
  await transaction.executeMultiple(`
    CREATE TEMPORARY TABLE temp_data (id INTEGER, value TEXT);
    INSERT INTO temp_data VALUES (1, 'test'), (2, 'data');
    INSERT INTO main_table SELECT * FROM temp_data;
    DROP TABLE temp_data;
  `);
  
  await transaction.commit();
} finally {
  transaction.close();
}
```

### Transaction Control

Commit or rollback transaction changes with explicit control over when changes are applied.

```typescript { .api }
/**
 * Commit all changes made in this transaction
 * Makes all changes permanent and closes the transaction
 */
commit(): Promise<void>;

/**
 * Roll back all changes made in this transaction
 * Discards all changes and closes the transaction  
 */
rollback(): Promise<void>;

/**
 * Close the transaction
 * Rolls back if not already committed
 */
close(): void;

/** Whether the transaction is closed */
readonly closed: boolean;
```

**Usage Examples:**

```typescript
const transaction = await client.transaction("write");

try {
  await transaction.execute({
    sql: "INSERT INTO users (name) VALUES (?)",
    args: ["Test User"]
  });
  
  // Explicitly commit changes
  await transaction.commit();
  console.log("Transaction committed successfully");
  
} catch (error) {
  // Explicitly rollback on error
  await transaction.rollback();
  console.log("Transaction rolled back due to error:", error);
  
} finally {
  // Close always safe to call, even after commit/rollback
  transaction.close();
}

// Check transaction state
console.log(transaction.closed); // true after commit/rollback/close
```

### Transaction Patterns

Common patterns for safe transaction handling:

**Basic Transaction Pattern:**

```typescript
const transaction = await client.transaction("write");
try {
  // Perform operations
  await transaction.execute("INSERT INTO ...", args);
  await transaction.commit();
} finally {
  transaction.close(); // Always close to free resources
}
```

**Conditional Commit Pattern:**

```typescript
const transaction = await client.transaction("write");
let shouldCommit = false;

try {
  const result = await transaction.execute("SELECT ...", args);
  
  if (result.rows.length > 0) {
    await transaction.execute("UPDATE ...", updateArgs);
    shouldCommit = true;
  }
  
  if (shouldCommit) {
    await transaction.commit();
  } else {
    await transaction.rollback();
  }
} finally {
  transaction.close();
}
```

**Nested Operation Pattern:**

```typescript
async function transferMoney(fromId: number, toId: number, amount: number) {
  const transaction = await client.transaction("write");
  
  try {
    // Check sufficient balance
    const balance = await transaction.execute({
      sql: "SELECT balance FROM accounts WHERE id = ?",
      args: [fromId]
    });
    
    if (balance.rows[0].balance < amount) {
      throw new Error("Insufficient funds");
    }
    
    // Perform transfer
    await transaction.batch([
      {
        sql: "UPDATE accounts SET balance = balance - ? WHERE id = ?",
        args: [amount, fromId]
      },
      {
        sql: "UPDATE accounts SET balance = balance + ? WHERE id = ?",
        args: [amount, toId]
      }
    ]);
    
    await transaction.commit();
    return true;
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    transaction.close();
  }
}
```

## Transaction Modes

```typescript { .api }
/**
 * Transaction isolation and locking behavior
 * - "write": READ-WRITE transaction with immediate lock, blocks other writes
 * - "read": READ-ONLY transaction, allows concurrent reads, lower latency
 * - "deferred": Starts as read-only, upgrades to write on first write operation
 */
type TransactionMode = "write" | "read" | "deferred";
```

**Mode Selection Guidelines:**

- **"read"**: Use for read-only operations requiring consistent snapshots
- **"write"**: Use when you know you'll be making changes
- **"deferred"**: Use when you might or might not make changes based on read results

## Error Handling

Transactions can fail at various points. Common transaction-related error codes include `TRANSACTION_CLOSED` and `CLIENT_CLOSED`. For a complete list of error codes and handling examples, see [Client Configuration - Error Handling](./client-configuration.md#error-handling).

```typescript
import { LibsqlError } from "@libsql/client";

try {
  const transaction = await client.transaction("write");
  await transaction.execute("INVALID SQL");
} catch (error) {
  if (error instanceof LibsqlError) {
    console.log(`Transaction error [${error.code}]: ${error.message}`);
  }
}
```

## Performance Considerations

- **Batch Operations**: Use `batch()` instead of multiple `execute()` calls for better performance
- **Transaction Duration**: Keep transactions short to avoid blocking other operations
- **Read Transactions**: Use read-only transactions when possible for better concurrency
- **Connection Reuse**: Transactions use dedicated connections; close promptly to free resources