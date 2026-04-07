# Number Types

Specialized number and bigint validators including integers, floats, and sized numeric types with precise range constraints.

## Capabilities

### Integer Validation

Creates a number schema that validates integer values.

```typescript { .api }
/**
 * Create an integer validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns Number schema with integer validation
 */
function int(params?: NumberParams): ZodNumber;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Integer = z.int();
Integer.parse(42); // => 42
Integer.parse(0); // => 0
Integer.parse(-123); // => -123
// Integer.parse(3.14); // throws error

// With additional constraints
const PositiveInt = z.int().positive();
const IntRange = z.int().min(1).max(100);
```

### 32-bit Float Validation

Creates a number schema that validates 32-bit floating point numbers (IEEE 754 single precision).

```typescript { .api }
/**
 * Create a 32-bit float validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns Number schema with float32 validation
 */
function float32(params?: NumberParams): ZodNumber;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Float32 = z.float32();
Float32.parse(3.14159); // => 3.14159
Float32.parse(-1.5); // => -1.5

// Validates that the number fits within float32 range
const Float32Range = z.float32().min(-3.4e38).max(3.4e38);
```

### 64-bit Float Validation

Creates a number schema that validates 64-bit floating point numbers (IEEE 754 double precision).

```typescript { .api }
/**
 * Create a 64-bit float validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns Number schema with float64 validation
 */
function float64(params?: NumberParams): ZodNumber;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Float64 = z.float64();
Float64.parse(3.141592653589793); // => 3.141592653589793
Float64.parse(Number.MAX_VALUE); // => valid

// Standard JavaScript numbers are float64 by default
const Price = z.float64().positive();
```

### 32-bit Integer Validation

Creates a number schema that validates 32-bit signed integers (-2³¹ to 2³¹-1).

```typescript { .api }
/**
 * Create a 32-bit signed integer validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns Number schema with int32 validation
 */
function int32(params?: NumberParams): ZodNumber;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Int32 = z.int32();
Int32.parse(2147483647); // => 2147483647 (max int32)
Int32.parse(-2147483648); // => -2147483648 (min int32)
// Int32.parse(2147483648); // throws error (out of range)

// Useful for API compatibility
const Counter = z.int32().nonnegative();
```

### Unsigned 32-bit Integer Validation

Creates a number schema that validates 32-bit unsigned integers (0 to 2³²-1).

```typescript { .api }
/**
 * Create a 32-bit unsigned integer validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns Number schema with uint32 validation
 */
function uint32(params?: NumberParams): ZodNumber;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UInt32 = z.uint32();
UInt32.parse(4294967295); // => 4294967295 (max uint32)
UInt32.parse(0); // => 0
// UInt32.parse(-1); // throws error (negative)
// UInt32.parse(4294967296); // throws error (out of range)

// Useful for unsigned values like buffer sizes
const BufferSize = z.uint32();
```

### 64-bit Integer Validation

Creates a bigint schema that validates 64-bit signed integers (-2⁶³ to 2⁶³-1).

```typescript { .api }
/**
 * Create a 64-bit signed integer validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns BigInt schema with int64 validation
 */
function int64(params?: BigIntParams): ZodBigInt;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Int64 = z.int64();
Int64.parse(9223372036854775807n); // => 9223372036854775807n (max int64)
Int64.parse(-9223372036854775808n); // => -9223372036854775808n (min int64)
// Int64.parse(9223372036854775808n); // throws error (out of range)

// Useful for database IDs and timestamps
const Timestamp = z.int64().positive();
const DatabaseID = z.int64();
```

### Unsigned 64-bit Integer Validation

Creates a bigint schema that validates 64-bit unsigned integers (0 to 2⁶⁴-1).

```typescript { .api }
/**
 * Create a 64-bit unsigned integer validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns BigInt schema with uint64 validation
 */
function uint64(params?: BigIntParams): ZodBigInt;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UInt64 = z.uint64();
UInt64.parse(18446744073709551615n); // => 18446744073709551615n (max uint64)
UInt64.parse(0n); // => 0n
// UInt64.parse(-1n); // throws error (negative)

// Useful for unsigned large numbers
const FileSize = z.uint64();
const UnsignedID = z.uint64();
```

## Number Schema Methods

All number type schemas support chainable validation methods:

```typescript { .api }
interface ZodNumber {
  // Range constraints
  min(value: number, message?: string): ZodNumber;
  max(value: number, message?: string): ZodNumber;
  gt(value: number, message?: string): ZodNumber;
  gte(value: number, message?: string): ZodNumber;
  lt(value: number, message?: string): ZodNumber;
  lte(value: number, message?: string): ZodNumber;

  // Type constraints
  int(message?: string): ZodNumber;
  positive(message?: string): ZodNumber;
  negative(message?: string): ZodNumber;
  nonnegative(message?: string): ZodNumber;
  nonpositive(message?: string): ZodNumber;
  multipleOf(divisor: number, message?: string): ZodNumber;
  finite(message?: string): ZodNumber;
  safe(message?: string): ZodNumber;

  // Sized types
  float32(message?: string): ZodNumber;
  float64(message?: string): ZodNumber;
  int32(message?: string): ZodNumber;
  uint32(message?: string): ZodNumber;

  // Common modifiers
  optional(): ZodOptional<ZodNumber>;
  nullable(): ZodNullable<ZodNumber>;
  default(value: number): ZodDefault<ZodNumber>;

  // Parsing
  parse(data: unknown): number;
  safeParse(data: unknown): SafeParseReturnType<unknown, number>;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Combining constraints on typed numbers
const Port = z.int32().min(1).max(65535);
const Percentage = z.float32().min(0).max(100);
const EvenInt = z.int().multipleOf(2);
const SafeInt = z.int().safe(); // Number.MIN_SAFE_INTEGER to Number.MAX_SAFE_INTEGER
```

## BigInt Schema Methods

All bigint type schemas support chainable validation methods:

```typescript { .api }
interface ZodBigInt {
  // Range constraints
  min(value: bigint, message?: string): ZodBigInt;
  max(value: bigint, message?: string): ZodBigInt;
  gt(value: bigint, message?: string): ZodBigInt;
  gte(value: bigint, message?: string): ZodBigInt;
  lt(value: bigint, message?: string): ZodBigInt;
  lte(value: bigint, message?: string): ZodBigInt;

  // Type constraints
  positive(message?: string): ZodBigInt;
  negative(message?: string): ZodBigInt;
  nonnegative(message?: string): ZodBigInt;
  nonpositive(message?: string): ZodBigInt;
  multipleOf(divisor: bigint, message?: string): ZodBigInt;

  // Sized types
  int64(message?: string): ZodBigInt;
  uint64(message?: string): ZodBigInt;

  // Common modifiers
  optional(): ZodOptional<ZodBigInt>;
  nullable(): ZodNullable<ZodBigInt>;
  default(value: bigint): ZodDefault<ZodBigInt>;

  // Parsing
  parse(data: unknown): bigint;
  safeParse(data: unknown): SafeParseReturnType<unknown, bigint>;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Combining constraints on typed bigints
const PositiveInt64 = z.int64().positive();
const RangeUInt64 = z.uint64().min(0n).max(1000000n);
const EvenBigInt = z.int64().multipleOf(2n);
```

## Types

```typescript { .api }
interface NumberParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface BigIntParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

type ErrorMapFunction = (
  issue: ZodIssueOptionalMessage,
  ctx: ErrorMapCtx
) => { message: string };

interface ErrorMapCtx {
  defaultError: string;
  data: any;
}

interface ZodIssueOptionalMessage {
  code: string;
  path: (string | number)[];
  message?: string;
}

type SafeParseReturnType<Input, Output> =
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> };

class ZodError<T = any> extends Error {
  issues: ZodIssue[];
}
```
