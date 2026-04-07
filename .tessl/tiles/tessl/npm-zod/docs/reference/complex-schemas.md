# Complex Schemas

Validators for structured data including objects, arrays, tuples, records, maps, sets, and enums with comprehensive type inference.

## Capabilities

### Object Schema

Creates a validator for object shapes with defined properties and type-safe access.

```typescript { .api }
/**
 * Create an object schema validator with defined shape
 * @param shape - Object shape definition mapping keys to schemas
 * @param params - Optional configuration for error handling and metadata
 * @returns Object schema with type-safe property access
 */
function object<T extends ZodRawShape>(
  shape: T,
  params?: ObjectParams
): ZodObject<T>;

type ZodRawShape = { [k: string]: ZodTypeAny };

interface ObjectParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic object
const User = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
});

type User = z.infer<typeof User>;
// { name: string; age: number; email: string }

User.parse({
  name: 'Alice',
  age: 30,
  email: 'alice@example.com',
}); // => valid

// Nested objects
const Company = z.object({
  name: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    country: z.string(),
  }),
  employees: z.array(User),
});

// Optional properties
const PartialUser = z.object({
  name: z.string(),
  nickname: z.string().optional(),
});

// Accessing shape
const emailSchema = User.shape.email;
```

### Object Schema Methods

Object schemas provide extensive manipulation methods:

```typescript { .api }
interface ZodObject<T extends ZodRawShape> {
  // Shape access
  readonly shape: T;

  // Extension and merging
  extend<U extends ZodRawShape>(shape: U): ZodObject<T & U>;
  safeExtend<U extends ZodRawShape>(shape: U): ZodObject<T & U>;
  merge<U extends ZodRawShape>(other: ZodObject<U>): ZodObject<T & U>;

  // Property selection
  pick<Keys extends { [K in keyof T]?: true }>(keys: Keys): ZodObject<Pick<T, keyof Keys>>;
  omit<Keys extends { [K in keyof T]?: true }>(keys: Keys): ZodObject<Omit<T, keyof Keys>>;

  // Partiality
  partial(): ZodObject<{ [K in keyof T]: ZodOptional<T[K]> }>;
  required(): ZodObject<{ [K in keyof T]: ZodNonOptional<T[K]> }>;

  // Unknown key handling
  passthrough(): ZodObject<T>;
  strict(): ZodObject<T>;
  strip(): ZodObject<T>;
  catchall<Schema extends ZodTypeAny>(schema: Schema): ZodObject<T>;

  // Key extraction
  keyof(): ZodEnum<[keyof T, ...(keyof T)[]]>;

  // Parsing
  parse(data: unknown): ObjectOutputType<T>;
  safeParse(data: unknown): SafeParseReturnType<unknown, ObjectOutputType<T>>;
}

type ObjectOutputType<T extends ZodRawShape> = {
  [k in keyof T]: T[k]['_output'];
};

type ObjectInputType<T extends ZodRawShape> = {
  [k in keyof T]: T[k]['_input'];
};
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const User = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  age: z.number(),
});

// Extend with new properties
const Admin = User.extend({
  role: z.literal('admin'),
  permissions: z.array(z.string()),
});

// Safely extend (prevents overlapping keys at type level)
const Profile = User.safeExtend({
  bio: z.string(),
  avatar: z.string().url(),
});

// Merge two schemas
const Timestamps = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});
const UserWithTimestamps = User.merge(Timestamps);

// Pick specific properties
const UserPreview = User.pick({ name: true, email: true });
// { name: string; email: string }

// Omit properties
const UserWithoutEmail = User.omit({ email: true });
// { id: string; name: string; age: number }

// Make all properties optional
const PartialUser = User.partial();
// { id?: string; name?: string; email?: string; age?: number }

// Make all properties required (remove optional)
const RequiredUser = PartialUser.required();

// Unknown key handling
const StrictUser = User.strict(); // Reject unknown keys
const PassthroughUser = User.passthrough(); // Allow unknown keys
const CatchallUser = User.catchall(z.string()); // Unknown keys must be strings

// Extract keys as enum
const UserKeys = User.keyof();
type UserKeys = z.infer<typeof UserKeys>; // "id" | "name" | "email" | "age"
```

### Strict Object Schema

Creates an object schema that rejects any unknown properties by default.

```typescript { .api }
/**
 * Create a strict object schema that rejects unknown properties
 * @param shape - Object shape definition
 * @param params - Optional configuration for error handling and metadata
 * @returns Strict object schema
 */
function strictObject<T extends ZodRawShape>(
  shape: T,
  params?: string | ObjectParams
): ZodObject<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const StrictUser = z.strictObject({
  name: z.string(),
  age: z.number(),
});

StrictUser.parse({ name: 'Alice', age: 30 }); // => valid
// StrictUser.parse({ name: 'Alice', age: 30, extra: 'field' }); // throws error
```

### Loose Object Schema

Creates an object schema that allows unknown properties by default.

```typescript { .api }
/**
 * Create a loose object schema that allows unknown properties
 * @param shape - Object shape definition
 * @param params - Optional configuration for error handling and metadata
 * @returns Loose object schema
 */
function looseObject<T extends ZodRawShape>(
  shape: T,
  params?: string | ObjectParams
): ZodObject<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const LooseUser = z.looseObject({
  name: z.string(),
  age: z.number(),
});

LooseUser.parse({ name: 'Alice', age: 30, extra: 'field' }); // => valid (extra kept)
```

### Array Schema

Creates a validator for arrays with a specific element type.

```typescript { .api }
/**
 * Create an array schema validator
 * @param elementSchema - Schema for array elements
 * @param params - Optional configuration for error handling and metadata
 * @returns Array schema with element type validation
 */
function array<T extends ZodTypeAny>(
  elementSchema: T,
  params?: ArrayParams
): ZodArray<T>;

interface ArrayParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic array
const StringArray = z.array(z.string());
StringArray.parse(['a', 'b', 'c']); // => ["a", "b", "c"]

// Array of objects
const UserArray = z.array(
  z.object({
    name: z.string(),
    age: z.number(),
  })
);

// With constraints
const NonEmptyArray = z.array(z.string()).nonempty();
const LimitedArray = z.array(z.number()).min(1).max(10);
const ExactLengthArray = z.array(z.boolean()).length(3);

// Access element schema
const elementSchema = StringArray.element; // ZodString
```

### Array Schema Methods

Array schemas support length constraints:

```typescript { .api }
interface ZodArray<T extends ZodTypeAny> {
  readonly element: T;

  min(length: number, message?: string): ZodArray<T>;
  max(length: number, message?: string): ZodArray<T>;
  length(length: number, message?: string): ZodArray<T>;
  nonempty(message?: string): ZodArray<T>;

  parse(data: unknown): T['_output'][];
  safeParse(data: unknown): SafeParseReturnType<unknown, T['_output'][]>;
}
```

### Tuple Schema

Creates a validator for fixed-length tuples with specific types for each position.

```typescript { .api }
/**
 * Create a tuple schema validator
 * @param items - Array of schemas for each tuple position
 * @returns Tuple schema with fixed positional types
 */
function tuple<T extends [ZodTypeAny, ...ZodTypeAny[]]>(
  items: T
): ZodTuple<T, null>;

/**
 * Create a tuple schema with rest elements
 * @param items - Array of schemas for fixed positions
 * @param rest - Schema for remaining elements
 * @returns Tuple schema with rest elements
 */
function tuple<T extends [ZodTypeAny, ...ZodTypeAny[]], Rest extends ZodTypeAny>(
  items: T,
  rest: Rest
): ZodTuple<T, Rest>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Fixed tuple
const Pair = z.tuple([z.string(), z.number()]);
type Pair = z.infer<typeof Pair>; // [string, number]
Pair.parse(['hello', 42]); // => ["hello", 42]

// Tuple with different types
const Mixed = z.tuple([z.string(), z.number(), z.boolean()]);
type Mixed = z.infer<typeof Mixed>; // [string, number, boolean]

// Tuple with rest elements
const StringNumberRest = z.tuple([z.string(), z.number()], z.boolean());
type StringNumberRest = z.infer<typeof StringNumberRest>; // [string, number, ...boolean[]]
StringNumberRest.parse(['a', 1, true, false, true]); // => valid

// Add rest element to existing tuple
const ExtendedPair = Pair.rest(z.boolean());
```

### Tuple Schema Methods

Tuple schemas can add rest elements:

```typescript { .api }
interface ZodTuple<T extends [ZodTypeAny, ...ZodTypeAny[]], Rest extends ZodTypeAny | null> {
  readonly items: T;
  readonly rest: Rest;

  rest<R extends ZodTypeAny>(schema: R): ZodTuple<T, R>;

  parse(data: unknown): TupleOutputType<T, Rest>;
  safeParse(data: unknown): SafeParseReturnType<unknown, TupleOutputType<T, Rest>>;
}

type TupleOutputType<T extends [ZodTypeAny, ...ZodTypeAny[]], Rest extends ZodTypeAny | null> =
  Rest extends null
    ? { [K in keyof T]: T[K]['_output'] }
    : [...{ [K in keyof T]: T[K]['_output'] }, ...Rest['_output'][]];
```

### Record Schema

Creates a validator for record/dictionary types with key and value schemas.

```typescript { .api }
/**
 * Create a record schema validator
 * @param keySchema - Schema for record keys (string, number, or symbol)
 * @param valueSchema - Schema for record values
 * @returns Record schema with key-value validation
 */
function record<K extends KeySchema, V extends ZodTypeAny>(
  keySchema: K,
  valueSchema: V
): ZodRecord<K, V>;

type KeySchema = ZodString | ZodNumber | ZodSymbol;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// String keys
const StringRecord = z.record(z.string(), z.number());
type StringRecord = z.infer<typeof StringRecord>; // Record<string, number>
StringRecord.parse({ a: 1, b: 2, c: 3 }); // => valid

// Number keys (converted from string keys in JSON)
const NumberRecord = z.record(z.number(), z.string());

// Specific string keys with enum
const StatusRecord = z.record(
  z.enum(['pending', 'active', 'completed']),
  z.object({ count: z.number() })
);

// Generic configuration
const Config = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));
```

### Partial Record Schema

Creates a record schema where not all keys are required.

```typescript { .api }
/**
 * Create a partial record schema where keys are optional
 * @param keySchema - Schema for record keys
 * @param valueSchema - Schema for record values
 * @param params - Optional configuration for error handling and metadata
 * @returns Partial record schema
 */
function partialRecord<K extends KeySchema, V extends ZodTypeAny>(
  keySchema: K,
  valueSchema: V,
  params?: string | RecordParams
): ZodRecord<K, ZodOptional<V>>;

interface RecordParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const PartialRecord = z.partialRecord(z.string(), z.number());
PartialRecord.parse({}); // => valid (empty is allowed)
PartialRecord.parse({ a: 1 }); // => valid
```

### Loose Record Schema

Creates a record schema with relaxed validation that allows additional validation to pass through.

```typescript { .api }
/**
 * Create a loose record schema
 * @param keySchema - Schema for record keys
 * @param valueSchema - Schema for record values
 * @param params - Optional configuration for error handling and metadata
 * @returns Loose record schema
 */
function looseRecord<K extends KeySchema, V extends ZodTypeAny>(
  keySchema: K,
  valueSchema: V,
  params?: string | RecordParams
): ZodRecord<K, V>;
```

### Map Schema

Creates a validator for JavaScript Map objects with typed keys and values.

```typescript { .api }
/**
 * Create a Map schema validator
 * @param keySchema - Schema for map keys
 * @param valueSchema - Schema for map values
 * @returns Map schema with key-value validation
 */
function map<K extends ZodTypeAny, V extends ZodTypeAny>(
  keySchema: K,
  valueSchema: V
): ZodMap<K, V>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// String key, number value map
const StringNumberMap = z.map(z.string(), z.number());
type StringNumberMap = z.infer<typeof StringNumberMap>; // Map<string, number>

const map = new Map([
  ['a', 1],
  ['b', 2],
]);
StringNumberMap.parse(map); // => valid

// Complex key-value map
const UserMap = z.map(
  z.string(),
  z.object({
    name: z.string(),
    age: z.number(),
  })
);
```

### Set Schema

Creates a validator for JavaScript Set objects with typed elements.

```typescript { .api }
/**
 * Create a Set schema validator
 * @param valueSchema - Schema for set elements
 * @param params - Optional configuration for error handling and metadata
 * @returns Set schema with element validation
 */
function set<T extends ZodTypeAny>(
  valueSchema: T,
  params?: SetParams
): ZodSet<T>;

interface SetParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic set
const StringSet = z.set(z.string());
type StringSet = z.infer<typeof StringSet>; // Set<string>

const set = new Set(['a', 'b', 'c']);
StringSet.parse(set); // => valid

// Set with constraints
const LimitedSet = z.set(z.number()).min(1).max(10);
const NonEmptySet = z.set(z.string()).nonempty();

// Set of objects
const UserSet = z.set(
  z.object({
    id: z.string(),
    name: z.string(),
  })
);
```

### Set Schema Methods

Set schemas support size constraints:

```typescript { .api }
interface ZodSet<T extends ZodTypeAny> {
  readonly element: T;

  min(size: number, message?: string): ZodSet<T>;
  max(size: number, message?: string): ZodSet<T>;
  size(size: number, message?: string): ZodSet<T>;
  nonempty(message?: string): ZodSet<T>;

  parse(data: unknown): Set<T['_output']>;
  safeParse(data: unknown): SafeParseReturnType<unknown, Set<T['_output']>>;
}
```

### Enum Schema

Creates a validator for a fixed set of string or number values with type inference.

```typescript { .api }
/**
 * Create an enum schema validator
 * @param values - Array of allowed values (at least one required)
 * @returns Enum schema that only accepts specified values
 */
function enum_<T extends [string, ...string[]]>(
  values: T
): ZodEnum<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// String enum
const Status = z.enum(['pending', 'active', 'completed']);
type Status = z.infer<typeof Status>; // "pending" | "active" | "completed"
Status.parse('active'); // => "active"

// Access enum values
Status.enum.pending; // "pending"
Status.enum.active; // "active"
Status.enum.completed; // "completed"

// Extract/exclude values
const ActiveOrCompleted = Status.extract(['active', 'completed']);
const NotPending = Status.exclude(['pending']);

// Get all options
const options = Status.options; // ["pending", "active", "completed"]
```

### Enum Schema Methods

Enum schemas provide value extraction methods:

```typescript { .api }
interface ZodEnum<T extends [string, ...string[]]> {
  readonly options: T;
  readonly enum: { [K in T[number]]: K };

  extract<U extends T[number][]>(values: U): ZodEnum<U>;
  exclude<U extends T[number][]>(values: U): ZodEnum<Exclude<T[number], U[number]>[]>;

  parse(data: unknown): T[number];
  safeParse(data: unknown): SafeParseReturnType<unknown, T[number]>;
}
```

### Native Enum Schema

Creates a validator for TypeScript native enum types.

```typescript { .api }
/**
 * Create a native enum schema validator
 * @param enumObject - Native TypeScript enum object
 * @returns Schema that validates against the native enum
 */
function nativeEnum<T extends EnumLike>(
  enumObject: T
): ZodNativeEnum<T>;

type EnumLike = { [k: string]: string | number; [nu: number]: string };
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// String enum
enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

const ColorSchema = z.nativeEnum(Color);
type ColorType = z.infer<typeof ColorSchema>; // Color
ColorSchema.parse(Color.Red); // => Color.Red
ColorSchema.parse('red'); // => "red" (also valid)

// Numeric enum
enum Level {
  Low = 0,
  Medium = 1,
  High = 2,
}

const LevelSchema = z.nativeEnum(Level);
LevelSchema.parse(Level.Medium); // => 1
LevelSchema.parse(1); // => 1

// Const enum (works the same)
const enum Direction {
  North = 'N',
  South = 'S',
  East = 'E',
  West = 'W',
}

const DirectionSchema = z.nativeEnum(Direction);
```

### KeyOf Schema

Extracts keys from an object schema as an enum.

```typescript { .api }
/**
 * Extract object keys as an enum schema
 * @param objectSchema - Object schema to extract keys from
 * @returns Enum schema of object keys
 */
function keyof<T extends ZodObject<any>>(
  objectSchema: T
): ZodEnum<[keyof T['shape'], ...(keyof T['shape'])[]]>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const User = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  age: z.number(),
});

const UserKey = z.keyof(User);
type UserKey = z.infer<typeof UserKey>; // "id" | "name" | "email" | "age"

UserKey.parse('name'); // => "name"
// UserKey.parse('invalid'); // throws error

// Also available as method
const UserKeyMethod = User.keyof();
```

## Types

```typescript { .api }
type ZodTypeAny = ZodType<any, any, any>;
type ZodRawShape = { [k: string]: ZodTypeAny };

type ErrorMapFunction = (
  issue: ZodIssueOptionalMessage,
  ctx: ErrorMapCtx
) => { message: string };

interface ErrorMapCtx {
  defaultError: string;
  data: any;
}

type SafeParseReturnType<Input, Output> =
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> };

class ZodError<T = any> extends Error {
  issues: ZodIssue[];
}
```
