# Configuration and Utilities

Global configuration, utility functions, type utilities, regex patterns, registries, and helper functions for advanced Zod usage.

## Capabilities

### Configuration

Global configuration for Zod behavior and error handling.

```typescript { .api }
/**
 * Configure global Zod settings
 * @param options - Configuration options
 */
function config(options?: ConfigOptions): void;

interface ConfigOptions {
  customError?: ZodErrorMap;
  localeError?: ZodErrorMap;
  jitless?: boolean;
}

type ZodErrorMap = (
  issue: ZodIssueOptionalMessage,
  ctx: ErrorMapCtx
) => { message: string };
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Set custom error map
z.config({
  customError: (issue, ctx) => {
    return { message: `Custom: ${ctx.defaultError}` };
  },
});

// Set locale error map
z.config({
  localeError: z.locales.es(),
});

// Disable JIT compilation for debugging
z.config({
  jitless: true,
});

// Combine options
z.config({
  localeError: z.locales.fr(),
  jitless: false,
});
```

### Clone

Creates a deep copy of a schema.

```typescript { .api }
/**
 * Clone a schema
 * @param schema - Schema to clone
 * @returns Cloned schema
 */
function clone<T extends ZodTypeAny>(schema: T): T;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const OriginalSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const ClonedSchema = z.clone(OriginalSchema);

// Modify cloned schema without affecting original
const ExtendedSchema = ClonedSchema.extend({
  email: z.string().email(),
});

// Original remains unchanged
type Original = z.infer<typeof OriginalSchema>;
// { name: string; age: number }

type Extended = z.infer<typeof ExtendedSchema>;
// { name: string; age: number; email: string }
```

### Describe

Adds a description to a schema for documentation purposes.

```typescript { .api }
/**
 * Add a description to a schema
 * @param description - Description text
 * @returns Function that adds description to a schema
 */
function describe(description: string): (schema: ZodType) => ZodType;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Add description to schema
const EmailSchema = z.describe('User email address')(z.string().email());

// Description can be accessed from schema
// Useful for generating documentation or JSON schemas

// Using with object properties
const UserSchema = z.object({
  name: z.describe('Full name of the user')(z.string()),
  email: z.describe('User email address')(z.string().email()),
  age: z.describe('User age in years')(z.number().int().positive()),
});

// Can also use method syntax
const AgeSchema = z.number().describe('User age in years');
```

### Meta

Adds custom metadata to a schema for application-specific purposes.

```typescript { .api }
/**
 * Add custom metadata to a schema
 * @param metadata - Custom metadata object
 * @returns Function that adds metadata to a schema
 */
function meta<T = any>(metadata: T): (schema: ZodType) => ZodType;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Add custom metadata
const ProductIdSchema = z.meta({ dbField: 'product_id', indexed: true })(
  z.string().uuid()
);

// Metadata can be accessed for custom processing
const UserSchema = z.object({
  id: z.meta({ primary: true })(z.string().uuid()),
  name: z.meta({ searchable: true })(z.string()),
  email: z.meta({ unique: true, indexed: true })(z.string().email()),
  role: z.meta({ enum: 'user_role' })(z.enum(['admin', 'user', 'guest'])),
});

// Can also use method syntax
const TagSchema = z.string().meta({ category: 'taxonomy' });
```

### Type Utilities

TypeScript utility types for extracting types from schemas.

```typescript { .api }
/**
 * Extract output type from schema
 */
type infer<T extends ZodType<any, any>> = T['_output'];

/**
 * Extract output type (alias for infer)
 */
type output<T extends ZodType<any, any>> = T['_output'];

/**
 * Extract input type from schema
 */
type input<T extends ZodType<any, any>> = T['_input'];
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
});

// Extract output type
type User = z.infer<typeof UserSchema>;
// { name: string; age: number; email: string }

// Alternative syntax
type UserOutput = z.output<typeof UserSchema>;

// Extract input type (useful with transformations)
const TransformSchema = z.string().transform((s) => parseInt(s, 10));
type Input = z.input<typeof TransformSchema>;   // string
type Output = z.output<typeof TransformSchema>; // number

// Complex example
const FormSchema = z.object({
  name: z.string().trim().toLowerCase(),
  age: z.coerce.number(),
});

type FormInput = z.input<typeof FormSchema>;
// { name: string; age: unknown }

type FormOutput = z.output<typeof FormSchema>;
// { name: string; age: number }
```

### Symbols

Type brand symbols for advanced type manipulations.

```typescript { .api }
/**
 * Symbol for output type metadata
 */
const $output: unique symbol;

/**
 * Symbol for input type metadata
 */
const $input: unique symbol;

/**
 * Symbol for branded types
 */
const $brand: unique symbol;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Brand symbol usage
const UserId = z.string().brand<'UserId'>();
type UserId = z.infer<typeof UserId>;
// string & { [z.$brand]: "UserId" }

// Accessing type symbols (advanced usage)
type SchemaOutput<T> = T extends { [z.$output]: infer O } ? O : never;
type SchemaInput<T> = T extends { [z.$input]: infer I } ? I : never;
```

### Constants

Constant values used throughout Zod.

```typescript { .api }
/**
 * Never constant with type never
 */
const NEVER: never;

/**
 * Time precision constants
 */
const TimePrecision: {
  millisecond: 3;
  second: 0;
};
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Use in exhaustiveness checking
function handleValue(value: 'a' | 'b') {
  if (value === 'a') return 'handled a';
  if (value === 'b') return 'handled b';
  return z.NEVER; // Ensures all cases are handled
}

// Time precision for datetime validation
const PreciseDateTime = z.iso.datetime({
  precision: z.TimePrecision.millisecond,
});
```

### Global Registry

Global schema registry for storing metadata with schemas.

```typescript { .api }
/**
 * Global schema registry
 */
const globalRegistry: {
  add<T extends ZodTypeAny>(schema: T, metadata: any): void;
  get<T extends ZodTypeAny>(schema: T): any | undefined;
  has<T extends ZodTypeAny>(schema: T): boolean;
  remove<T extends ZodTypeAny>(schema: T): void;
  clear(): void;
};
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

// Add metadata to schema
z.globalRegistry.add(UserSchema, {
  tableName: 'users',
  primaryKey: 'id',
  version: 1,
});

// Retrieve metadata
const metadata = z.globalRegistry.get(UserSchema);
console.log(metadata.tableName); // "users"

// Check if schema has metadata
if (z.globalRegistry.has(UserSchema)) {
  console.log('Schema is registered');
}

// Remove metadata
z.globalRegistry.remove(UserSchema);

// Clear all metadata
z.globalRegistry.clear();
```

### Custom Registry

Create custom registries with typed metadata.

```typescript { .api }
/**
 * Create a custom registry
 * @returns Registry with typed metadata
 */
function registry<Meta = any, Schema extends ZodTypeAny = ZodTypeAny>(): Registry<Meta, Schema>;

interface Registry<Meta, Schema extends ZodTypeAny> {
  add(schema: Schema, metadata: Meta): void;
  get(schema: Schema): Meta | undefined;
  has(schema: Schema): boolean;
  remove(schema: Schema): void;
  clear(): void;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Create typed registry
interface SchemaMetadata {
  tableName: string;
  version: number;
  description?: string;
}

const schemaRegistry = z.registry<SchemaMetadata>();

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

// Add with typed metadata
schemaRegistry.add(UserSchema, {
  tableName: 'users',
  version: 1,
  description: 'User account schema',
});

// Get typed metadata
const meta = schemaRegistry.get(UserSchema);
if (meta) {
  console.log(meta.tableName); // TypeScript knows this exists
}

// Multiple registries for different purposes
const validationRegistry = z.registry<{ validationLevel: 'strict' | 'loose' }>();
const documentationRegistry = z.registry<{ docs: string; examples: string[] }>();
```

### Regex Patterns

Built-in regex patterns for common validations.

```typescript { .api }
/**
 * Built-in regex patterns namespace
 */
namespace regexes {
  // ID patterns
  const cuid: RegExp;
  const cuid2: RegExp;
  const ulid: RegExp;
  const xid: RegExp;
  const ksuid: RegExp;
  const nanoid: RegExp;
  const guid: RegExp;
  const uuid4: RegExp;
  const uuid6: RegExp;
  const uuid7: RegExp;
  function uuid(version?: 4 | 6 | 7): RegExp;

  // Email patterns
  const email: RegExp;
  const html5Email: RegExp;
  const rfc5322Email: RegExp;
  const unicodeEmail: RegExp;
  const browserEmail: RegExp;

  // Network patterns
  const ipv4: RegExp;
  const ipv6: RegExp;
  function mac(delimiter?: string): RegExp;
  const cidrv4: RegExp;
  const cidrv6: RegExp;

  // Encoding patterns
  const base64: RegExp;
  const base64url: RegExp;
  const hex: RegExp;

  // Domain patterns
  const hostname: RegExp;
  const domain: RegExp;

  // Phone patterns
  const e164: RegExp;

  // Date/time patterns
  const date: RegExp;
  function time(args: TimeArgs): RegExp;
  function datetime(args: DateTimeArgs): RegExp;
  const duration: RegExp;

  // Case patterns
  const lowercase: RegExp;
  const uppercase: RegExp;

  // Hash patterns (examples, many more available)
  const md5_hex: RegExp;
  const md5_base64: RegExp;
  const sha1_hex: RegExp;
  const sha256_hex: RegExp;
  const sha256_base64: RegExp;
  const sha384_hex: RegExp;
  const sha512_hex: RegExp;
}

interface TimeArgs {
  precision?: number;
}

interface DateTimeArgs {
  precision?: number;
  offset?: boolean;
  local?: boolean;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Use built-in patterns directly
const EmailPattern = z.regexes.email;
const isValidEmail = EmailPattern.test('user@example.com'); // true

// UUID validation
const UuidPattern = z.regexes.uuid4;
const isValidUuid = UuidPattern.test('550e8400-e29b-41d4-a716-446655440000');

// Custom validation using patterns
const CustomEmail = z.string().regex(z.regexes.email, 'Invalid email');

// MAC address with custom delimiter
const macWithColon = z.regexes.mac(':');
const macWithDash = z.regexes.mac('-');

// Dynamic datetime pattern
const datetimePattern = z.regexes.datetime({
  precision: 3,
  offset: true,
});

// IP validation
const IpSchema = z.string().regex(
  new RegExp(`^(${z.regexes.ipv4.source}|${z.regexes.ipv6.source})$`)
);

// Hash validation
const Sha256Schema = z.string().regex(z.regexes.sha256_hex);
```

### Utility Namespace

Helper functions and type utilities.

```typescript { .api }
/**
 * Utility namespace with helper functions
 */
namespace util {
  // Object utilities
  function isObject(value: unknown): value is object;
  function isPlainObject(value: unknown): value is Record<string, unknown>;
  function clone<T>(value: T): T;
  function shallowClone<T>(value: T): T;
  function objectClone<T extends object>(value: T): T;

  // Type utilities
  function getParsedType(data: unknown): ZodParsedType;

  // Other utilities
  function defineLazy(): any;
  function captureStackTrace(): any;
  function jsonStringifyReplacer(): (key: string, value: any) => any;

  // Type definitions
  type JSONType = string | number | boolean | null | JSONObject | JSONArray;
  interface JSONObject { [key: string]: JSONType }
  interface JSONArray extends Array<JSONType> {}

  type Primitive = string | number | boolean | null | undefined | symbol | bigint;
  type SafeParseSuccess<Output> = { success: true; data: Output };
  type SafeParseError<Input> = { success: false; error: ZodError<Input> };
  type SafeParseReturnType<Input, Output> =
    | SafeParseSuccess<Output>
    | SafeParseError<Input>;

  type Flatten<T> = { [K in keyof T]: T[K] };
  type Prettify<T> = { [K in keyof T]: T[K] } & {};
  type NoNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] };
  type Writeable<T> = { -readonly [K in keyof T]: T[K] };
  type MakeReadonly<T> = { readonly [K in keyof T]: T[K] };
  type MakePartial<T> = { [K in keyof T]?: T[K] };

  type HasSize = { size: number };
  type HasLength = { length: number };
  type Numeric = number | bigint;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Check if value is object
if (z.util.isObject(value)) {
  console.log('Is an object');
}

// Check if plain object (not array, date, etc.)
if (z.util.isPlainObject(value)) {
  console.log('Is a plain object');
}

// Clone values
const cloned = z.util.clone(complexObject);
const shallowCloned = z.util.shallowClone(simpleObject);

// Get parsed type
const type = z.util.getParsedType(value);
console.log(type); // "string", "number", "object", etc.

// JSON replacer for circular references
const json = JSON.stringify(obj, z.util.jsonStringifyReplacer());

// Type utilities
type User = { name: string; age: number };
type PrettyUser = z.util.Prettify<User>;
type PartialUser = z.util.MakePartial<User>;
type ReadonlyUser = z.util.MakeReadonly<User>;
```

### Advanced Usage Patterns

Combining configuration and utilities for advanced scenarios:

```typescript
import * as z from 'zod';

// 1. Custom error handling with registry
const errorRegistry = z.registry<{ errorCode: string; severity: 'error' | 'warning' }>();

const CriticalSchema = z.string().min(1);
errorRegistry.add(CriticalSchema, { errorCode: 'CRITICAL_001', severity: 'error' });

function validateWithRegistry<T extends z.ZodTypeAny>(schema: T, data: unknown) {
  const result = schema.safeParse(data);

  if (!result.success) {
    const meta = errorRegistry.get(schema);
    return {
      success: false,
      error: result.error,
      errorCode: meta?.errorCode,
      severity: meta?.severity,
    };
  }

  return { success: true, data: result.data };
}

// 2. Schema versioning with registry
const versionRegistry = z.registry<{ version: number; migrateFrom?: (data: any) => any }>();

const UserSchemaV1 = z.object({ name: z.string() });
const UserSchemaV2 = z.object({ name: z.string(), email: z.string() });

versionRegistry.add(UserSchemaV1, { version: 1 });
versionRegistry.add(UserSchemaV2, {
  version: 2,
  migrateFrom: (data) => ({ ...data, email: '' }),
});

// 3. Performance monitoring
const performanceRegistry = z.registry<{ avgParseTime: number; parseCount: number }>();

function monitoredParse<T extends z.ZodTypeAny>(schema: T, data: unknown) {
  const start = performance.now();
  const result = schema.safeParse(data);
  const duration = performance.now() - start;

  const meta = performanceRegistry.get(schema) || { avgParseTime: 0, parseCount: 0 };
  const newCount = meta.parseCount + 1;
  const newAvg = (meta.avgParseTime * meta.parseCount + duration) / newCount;

  performanceRegistry.add(schema, {
    avgParseTime: newAvg,
    parseCount: newCount,
  });

  return result;
}
```

## Types

```typescript { .api }
interface ConfigOptions {
  customError?: ZodErrorMap;
  localeError?: ZodErrorMap;
  jitless?: boolean;
}

type infer<T extends ZodType<any, any>> = T['_output'];
type output<T extends ZodType<any, any>> = T['_output'];
type input<T extends ZodType<any, any>> = T['_input'];

const $output: unique symbol;
const $input: unique symbol;
const $brand: unique symbol;

const NEVER: never;
const TimePrecision: {
  millisecond: 3;
  second: 0;
};

interface Registry<Meta, Schema extends ZodTypeAny> {
  add(schema: Schema, metadata: Meta): void;
  get(schema: Schema): Meta | undefined;
  has(schema: Schema): boolean;
  remove(schema: Schema): void;
  clear(): void;
}

type ZodErrorMap = (
  issue: ZodIssueOptionalMessage,
  ctx: ErrorMapCtx
) => { message: string };

interface ErrorMapCtx {
  defaultError: string;
  data: any;
}
```
