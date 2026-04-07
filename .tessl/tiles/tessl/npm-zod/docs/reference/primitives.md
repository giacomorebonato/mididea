# Primitive Schemas

Core primitive type validators for strings, numbers, booleans, dates, symbols, and special types like null, undefined, any, unknown, and never.

## Capabilities

### String Schema

Creates a validator for string values with optional chainable methods for length constraints, format validation, and transformations.

```typescript { .api }
/**
 * Create a string schema validator
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema instance with chainable validation methods
 */
function string(params?: StringParams): ZodString;

interface StringParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface ZodString {
  // Parsing
  parse(data: unknown): string;
  safeParse(data: unknown): SafeParseReturnType<unknown, string>;

  // Length constraints
  min(length: number, message?: string): ZodString;
  max(length: number, message?: string): ZodString;
  length(length: number, message?: string): ZodString;
  nonempty(message?: string): ZodString;

  // Content constraints
  startsWith(prefix: string, message?: string): ZodString;
  endsWith(suffix: string, message?: string): ZodString;
  includes(substring: string, message?: string): ZodString;
  regex(pattern: RegExp, message?: string): ZodString;

  // Transformations
  trim(): ZodString;
  toLowerCase(): ZodString;
  toUpperCase(): ZodString;

  // Format validations
  email(message?: string): ZodString;
  url(message?: string): ZodString;
  uuid(message?: string): ZodString;
  cuid(message?: string): ZodString;
  ulid(message?: string): ZodString;
  datetime(options?: DateTimeOptions): ZodString;
  date(message?: string): ZodString;
  time(options?: TimeOptions): ZodString;
  duration(message?: string): ZodString;
  ip(options?: IPOptions): ZodString;
  ipv4(message?: string): ZodString;
  ipv6(message?: string): ZodString;
  mac(message?: string): ZodString;
  cidr(options?: CIDROptions): ZodString;

  // Modifiers
  optional(): ZodOptional<ZodString>;
  nullable(): ZodNullable<ZodString>;
  default(value: string): ZodDefault<ZodString>;

  // ... and all common schema methods
}

interface DateTimeOptions {
  message?: string;
  precision?: number;
  offset?: boolean;
  local?: boolean;
}

interface TimeOptions {
  message?: string;
  precision?: number;
}

interface IPOptions {
  version?: 'v4' | 'v6';
  message?: string;
}

interface CIDROptions {
  version?: 'v4' | 'v6';
  message?: string;
}

type ErrorMapFunction = (
  issue: ZodIssueOptionalMessage,
  ctx: ErrorMapCtx
) => { message: string };
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic string
const Name = z.string();
Name.parse('Alice'); // => "Alice"

// With constraints
const Username = z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/);
Username.parse('user_123'); // => "user_123"

// With transformations
const TrimmedString = z.string().trim().toLowerCase();
TrimmedString.parse('  HELLO  '); // => "hello"

// With format validation
const Email = z.string().email();
Email.parse('alice@example.com'); // => "alice@example.com"

// With default value
const OptionalName = z.string().optional().default('Anonymous');
```

### Number Schema

Creates a validator for number values with methods for range validation, integer checking, and numeric constraints.

```typescript { .api }
/**
 * Create a number schema validator
 * @param params - Optional configuration for error handling and metadata
 * @returns Number schema instance with chainable validation methods
 */
function number(params?: NumberParams): ZodNumber;

interface NumberParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface ZodNumber {
  // Parsing
  parse(data: unknown): number;
  safeParse(data: unknown): SafeParseReturnType<unknown, number>;

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

  // Modifiers
  optional(): ZodOptional<ZodNumber>;
  nullable(): ZodNullable<ZodNumber>;
  default(value: number): ZodDefault<ZodNumber>;

  // ... and all common schema methods
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic number
const Age = z.number();
Age.parse(25); // => 25

// Integer with range
const Port = z.number().int().min(1).max(65535);
Port.parse(8080); // => 8080

// Positive number
const Price = z.number().positive();
Price.parse(19.99); // => 19.99

// Multiple of divisor
const Even = z.number().multipleOf(2);
Even.parse(42); // => 42

// Safe integer
const SafeInt = z.number().int().safe();
SafeInt.parse(123456789); // => 123456789
```

### BigInt Schema

Creates a validator for bigint values with similar range validation methods as numbers.

```typescript { .api }
/**
 * Create a bigint schema validator
 * @param params - Optional configuration for error handling and metadata
 * @returns BigInt schema instance with chainable validation methods
 */
function bigint(params?: BigIntParams): ZodBigInt;

interface BigIntParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface ZodBigInt {
  // Parsing
  parse(data: unknown): bigint;
  safeParse(data: unknown): SafeParseReturnType<unknown, bigint>;

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

  // Modifiers
  optional(): ZodOptional<ZodBigInt>;
  nullable(): ZodNullable<ZodBigInt>;
  default(value: bigint): ZodDefault<ZodBigInt>;

  // ... and all common schema methods
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic bigint
const BigValue = z.bigint();
BigValue.parse(9007199254740991n); // => 9007199254740991n

// With constraints
const PositiveBigInt = z.bigint().positive();
PositiveBigInt.parse(123456789n); // => 123456789n

// 64-bit integer
const Int64 = z.int64();
Int64.parse(9223372036854775807n); // => 9223372036854775807n
```

### Boolean Schema

Creates a validator for boolean values.

```typescript { .api }
/**
 * Create a boolean schema validator
 * @param params - Optional configuration for error handling and metadata
 * @returns Boolean schema instance
 */
function boolean(params?: BooleanParams): ZodBoolean;

interface BooleanParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface ZodBoolean {
  parse(data: unknown): boolean;
  safeParse(data: unknown): SafeParseReturnType<unknown, boolean>;

  optional(): ZodOptional<ZodBoolean>;
  nullable(): ZodNullable<ZodBoolean>;
  default(value: boolean): ZodDefault<ZodBoolean>;

  // ... and all common schema methods
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic boolean
const IsActive = z.boolean();
IsActive.parse(true); // => true

// With default
const OptionalFlag = z.boolean().optional().default(false);
```

### Date Schema

Creates a validator for JavaScript Date objects with min/max constraints.

```typescript { .api }
/**
 * Create a date schema validator
 * @param params - Optional configuration for error handling and metadata
 * @returns Date schema instance with chainable validation methods
 */
function date(params?: DateParams): ZodDate;

interface DateParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface ZodDate {
  parse(data: unknown): Date;
  safeParse(data: unknown): SafeParseReturnType<unknown, Date>;

  min(date: Date, message?: string): ZodDate;
  max(date: Date, message?: string): ZodDate;

  optional(): ZodOptional<ZodDate>;
  nullable(): ZodNullable<ZodDate>;
  default(value: Date | (() => Date)): ZodDefault<ZodDate>;

  // ... and all common schema methods
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic date
const Timestamp = z.date();
Timestamp.parse(new Date()); // => Date object

// With range
const FutureDate = z.date().min(new Date());
FutureDate.parse(new Date('2030-01-01')); // => Date object

// With max constraint
const PastDate = z.date().max(new Date());
```

### Symbol Schema

Creates a validator for JavaScript Symbol values.

```typescript { .api }
/**
 * Create a symbol schema validator
 * @param params - Optional configuration for error handling and metadata
 * @returns Symbol schema instance
 */
function symbol(params?: SymbolParams): ZodSymbol;

interface SymbolParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface ZodSymbol {
  parse(data: unknown): symbol;
  safeParse(data: unknown): SafeParseReturnType<unknown, symbol>;

  optional(): ZodOptional<ZodSymbol>;
  nullable(): ZodNullable<ZodSymbol>;

  // ... and all common schema methods
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const SymbolSchema = z.symbol();
const sym = Symbol('test');
SymbolSchema.parse(sym); // => Symbol(test)
```

### Null Schema

Creates a validator that only accepts null values.

```typescript { .api }
/**
 * Create a null schema validator
 * @returns Null schema instance that only accepts null
 */
function null_(): ZodNull;

interface ZodNull {
  parse(data: unknown): null;
  safeParse(data: unknown): SafeParseReturnType<unknown, null>;

  // ... and all common schema methods
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const NullSchema = z.null();
NullSchema.parse(null); // => null
// NullSchema.parse(undefined); // throws error
```

### Undefined Schema

Creates a validator that only accepts undefined values.

```typescript { .api }
/**
 * Create an undefined schema validator
 * @returns Undefined schema instance that only accepts undefined
 */
function undefined_(): ZodUndefined;

interface ZodUndefined {
  parse(data: unknown): undefined;
  safeParse(data: unknown): SafeParseReturnType<unknown, undefined>;

  // ... and all common schema methods
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UndefinedSchema = z.undefined();
UndefinedSchema.parse(undefined); // => undefined
// UndefinedSchema.parse(null); // throws error
```

### Void Schema

Creates a validator that accepts undefined values (alias for undefined that returns void type).

```typescript { .api }
/**
 * Create a void schema validator (accepts undefined)
 * @returns Void schema instance
 */
function void_(): ZodVoid;

interface ZodVoid {
  parse(data: unknown): void;
  safeParse(data: unknown): SafeParseReturnType<unknown, undefined>;

  // ... and all common schema methods
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const VoidSchema = z.void();
VoidSchema.parse(undefined); // => undefined (void)
```

### NaN Schema

Creates a validator that only accepts NaN values.

```typescript { .api }
/**
 * Create a NaN schema validator
 * @param params - Optional configuration for error handling and metadata
 * @returns NaN schema instance that only accepts NaN
 */
function nan(params?: NanParams): ZodNaN;

interface NanParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface ZodNaN {
  parse(data: unknown): number;
  safeParse(data: unknown): SafeParseReturnType<unknown, number>;

  // ... and all common schema methods
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const NaNSchema = z.nan();
NaNSchema.parse(NaN); // => NaN
// NaNSchema.parse(0); // throws error
```

### Any Schema

Creates a validator that accepts any value without validation (bypasses all checks).

```typescript { .api }
/**
 * Create an any schema validator that accepts all values
 * @returns Any schema instance
 */
function any(): ZodAny;

interface ZodAny {
  parse(data: unknown): any;
  safeParse(data: unknown): SafeParseReturnType<unknown, any>;

  // ... and all common schema methods
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const AnySchema = z.any();
AnySchema.parse('string'); // => "string"
AnySchema.parse(123); // => 123
AnySchema.parse({ foo: 'bar' }); // => { foo: "bar" }
```

### Unknown Schema

Creates a validator that accepts any value but preserves the unknown type (requires type narrowing).

```typescript { .api }
/**
 * Create an unknown schema validator
 * @returns Unknown schema instance
 */
function unknown(): ZodUnknown;

interface ZodUnknown {
  parse(data: unknown): unknown;
  safeParse(data: unknown): SafeParseReturnType<unknown, unknown>;

  // ... and all common schema methods
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UnknownSchema = z.unknown();
const value = UnknownSchema.parse('anything'); // => unknown type

// Requires type narrowing
if (typeof value === 'string') {
  console.log(value.toUpperCase());
}
```

### Never Schema

Creates a validator that always fails validation (useful for exhaustiveness checking).

```typescript { .api }
/**
 * Create a never schema validator that always fails
 * @param params - Optional configuration for error handling and metadata
 * @returns Never schema instance
 */
function never(params?: NeverParams): ZodNever;

interface NeverParams {
  errorMap?: ErrorMapFunction;
  description?: string;
}

interface ZodNever {
  parse(data: unknown): never;
  safeParse(data: unknown): SafeParseReturnType<unknown, never>;

  // ... and all common schema methods
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const NeverSchema = z.never();
// NeverSchema.parse('anything'); // always throws error

// Useful for exhaustiveness checking
type Shape = 'circle' | 'square';
function handleShape(shape: Shape) {
  if (shape === 'circle') return 'round';
  if (shape === 'square') return 'angular';
  z.never().parse(shape); // ensures all cases handled
}
```

## Types

```typescript { .api }
type SafeParseReturnType<Input, Output> =
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> };

interface ZodIssueOptionalMessage {
  code: string;
  path: (string | number)[];
  message?: string;
}

interface ErrorMapCtx {
  defaultError: string;
  data: any;
}

class ZodError<T = any> extends Error {
  issues: ZodIssue[];
}
```
