# Modifiers

Transform schemas by making them optional, nullable, with defaults, or applying other modifications to change validation behavior and type signatures.

## Capabilities

### Optional Modifier

Makes a schema accept undefined values in addition to its base type.

```typescript { .api }
/**
 * Create an optional schema that accepts undefined
 * @param schema - Base schema to make optional
 * @returns Optional schema accepting base type or undefined
 */
function optional<T extends ZodTypeAny>(schema: T): ZodOptional<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const OptionalString = z.optional(z.string());
type OptionalString = z.infer<typeof OptionalString>; // string | undefined

OptionalString.parse('hello'); // => "hello"
OptionalString.parse(undefined); // => undefined

// Method syntax
const SameAsAbove = z.string().optional();

// In object schemas
const User = z.object({
  name: z.string(),
  nickname: z.string().optional(),
  age: z.number().optional(),
});

type User = z.infer<typeof User>;
// { name: string; nickname?: string | undefined; age?: number | undefined }
```

### Exact Optional Modifier

Makes a schema optional but excludes undefined from the type (only affects presence, not type).

```typescript { .api }
/**
 * Create an exact optional schema (affects presence not type)
 * @param schema - Base schema to make exactly optional
 * @returns Exact optional schema
 */
function exactOptional<T extends ZodTypeAny>(schema: T): ZodOptional<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const ExactOptionalString = z.exactOptional(z.string());

// Property can be omitted but not explicitly undefined
const Schema = z.object({
  name: z.string(),
  nickname: z.string().exactOptional(),
});

Schema.parse({ name: 'Alice' }); // => valid (nickname omitted)
Schema.parse({ name: 'Alice', nickname: 'Ali' }); // => valid
// Schema.parse({ name: 'Alice', nickname: undefined }); // may throw based on config
```

### Nullable Modifier

Makes a schema accept null values in addition to its base type.

```typescript { .api }
/**
 * Create a nullable schema that accepts null
 * @param schema - Base schema to make nullable
 * @returns Nullable schema accepting base type or null
 */
function nullable<T extends ZodTypeAny>(schema: T): ZodNullable<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const NullableString = z.nullable(z.string());
type NullableString = z.infer<typeof NullableString>; // string | null

NullableString.parse('hello'); // => "hello"
NullableString.parse(null); // => null

// Method syntax
const SameAsAbove = z.string().nullable();

// In object schemas
const User = z.object({
  name: z.string(),
  middleName: z.string().nullable(),
  deletedAt: z.date().nullable(),
});

type User = z.infer<typeof User>;
// { name: string; middleName: string | null; deletedAt: Date | null }
```

### Nullish Modifier

Makes a schema accept both null and undefined values (combination of optional and nullable).

```typescript { .api }
/**
 * Create a nullish schema that accepts null or undefined
 * @param schema - Base schema to make nullish
 * @returns Nullish schema accepting base type, null, or undefined
 */
function nullish<T extends ZodTypeAny>(schema: T): ZodNullish<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const NullishString = z.nullish(z.string());
type NullishString = z.infer<typeof NullishString>; // string | null | undefined

NullishString.parse('hello'); // => "hello"
NullishString.parse(null); // => null
NullishString.parse(undefined); // => undefined

// Method syntax
const SameAsAbove = z.string().nullish();

// Common pattern for optional database fields
const DatabaseRecord = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(), // can be missing, null, or string
});
```

### Default Modifier

Provides a default value when the input is undefined.

```typescript { .api }
/**
 * Create a schema with a default value
 * @param schema - Base schema
 * @param defaultValue - Default value or function returning default value
 * @returns Schema with default value for undefined inputs
 */
function _default<T extends ZodTypeAny>(
  schema: T,
  defaultValue: DefaultValue<T>
): ZodDefault<T>;

type DefaultValue<T extends ZodTypeAny> =
  | z.output<T>
  | (() => z.output<T>);
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const StringWithDefault = z.string().default('default value');
type StringWithDefault = z.infer<typeof StringWithDefault>; // string

StringWithDefault.parse(undefined); // => "default value"
StringWithDefault.parse('custom'); // => "custom"

// Function defaults (computed each time)
const TimestampedSchema = z.object({
  message: z.string(),
  timestamp: z.date().default(() => new Date()),
});

// Array with default
const TagsSchema = z.array(z.string()).default([]);

// Number with default
const CounterSchema = z.number().default(0);

// Complex defaults
const ConfigSchema = z.object({
  host: z.string().default('localhost'),
  port: z.number().default(3000),
  ssl: z.boolean().default(false),
  options: z.object({
    timeout: z.number(),
  }).default({ timeout: 5000 }),
});

// Note: default makes the input optional
const Schema = z.object({
  name: z.string(),
  role: z.string().default('user'),
});

Schema.parse({ name: 'Alice' }); // => { name: "Alice", role: "user" }
```

### Prefault Modifier

Provides a default value for the input (before parsing), different from default which applies to output.

```typescript { .api }
/**
 * Create a schema with a prefault (input default) value
 * @param schema - Base schema
 * @param prefaultValue - Prefault value or function returning prefault value
 * @returns Schema with prefault value for undefined inputs
 */
function prefault<T extends ZodTypeAny>(
  schema: T,
  prefaultValue: PrefaultValue<T>
): ZodPrefault<T>;

type PrefaultValue<T extends ZodTypeAny> =
  | z.input<T>
  | (() => z.input<T>);
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Prefault applies to input before transformation
const Schema = z
  .string()
  .transform((val) => val.toUpperCase())
  .prefault('hello');

Schema.parse(undefined); // => "HELLO" (prefault value transformed)
Schema.parse('world'); // => "WORLD"

// Difference between default and prefault
const WithDefault = z.string().transform((s) => s.length).default(0);
// default applies after transform: undefined -> 0 (no transformation)

const WithPrefault = z.string().transform((s) => s.length).prefault('');
// prefault applies before transform: undefined -> '' -> 0 (transformed)
```

### Catch Modifier

Catches validation errors and returns a fallback value instead of throwing.

```typescript { .api }
/**
 * Create a schema that catches errors and returns a fallback value
 * @param schema - Base schema
 * @param catchValue - Fallback value or function receiving error
 * @returns Schema that never throws, returns fallback on error
 */
function catch_<T extends ZodTypeAny>(
  schema: T,
  catchValue: CatchValue<T>
): ZodCatch<T>;

type CatchValue<T extends ZodTypeAny> =
  | z.output<T>
  | ((error: ZodError) => z.output<T>);
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const SafeNumber = z.number().catch(0);
SafeNumber.parse(42); // => 42
SafeNumber.parse('invalid'); // => 0 (caught error)

// Function catch with error inspection
const SafeString = z.string().catch((error) => {
  console.error('Parse error:', error.message);
  return 'fallback';
});

// Useful for config parsing
const Config = z.object({
  port: z.number().catch(3000),
  host: z.string().catch('localhost'),
  debug: z.boolean().catch(false),
});

// Parsing bad config returns defaults
Config.parse({ port: 'invalid', host: 123 });
// => { port: 3000, host: "localhost", debug: false }

// Array with catch
const SafeArray = z.array(z.number()).catch([]);
SafeArray.parse('not an array'); // => []
```

### Readonly Modifier

Makes a schema readonly (TypeScript type-level only, no runtime effect).

```typescript { .api }
/**
 * Create a readonly schema (type-level only)
 * @param schema - Base schema to make readonly
 * @returns Readonly schema
 */
function readonly<T extends ZodTypeAny>(schema: T): ZodReadonly<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const ReadonlyArray = z.readonly(z.array(z.string()));
type ReadonlyArray = z.infer<typeof ReadonlyArray>; // readonly string[]

const ReadonlyObject = z.object({
  name: z.string(),
  age: z.number(),
}).readonly();

type ReadonlyObject = z.infer<typeof ReadonlyObject>;
// { readonly name: string; readonly age: number }

// Useful for immutable data structures
const ImmutableUser = z.readonly(z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
}));
```

### Success Modifier

Converts a schema to return boolean success instead of throwing errors.

```typescript { .api }
/**
 * Create a schema that returns boolean success instead of throwing
 * @param schema - Base schema
 * @returns Success schema returning boolean
 */
function success<T extends ZodTypeAny>(schema: T): ZodSuccess<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const IsValidEmail = z.success(z.string().email());
IsValidEmail.parse('valid@example.com'); // => true
IsValidEmail.parse('invalid'); // => false (doesn't throw)

// Useful for validation predicates
const isPositive = z.success(z.number().positive());
console.log(isPositive.parse(5)); // => true
console.log(isPositive.parse(-5)); // => false
```

### Nonoptional Modifier

Removes optional modifier from a schema, making it required.

```typescript { .api }
/**
 * Remove optional modifier from a schema
 * @param schema - Optional schema to make required
 * @returns Required schema without optional
 */
function nonoptional<T extends ZodTypeAny>(schema: T): ZodNonOptional<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const OptionalString = z.string().optional();
const RequiredString = z.nonoptional(OptionalString);

type OptionalString = z.infer<typeof OptionalString>; // string | undefined
type RequiredString = z.infer<typeof RequiredString>; // string

// Useful for object schema manipulation
const PartialUser = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
});

const RequiredUser = PartialUser.required(); // Makes all fields required
```

### Brand Modifier

Adds a nominal type brand for creating distinct types with the same runtime representation.

```typescript { .api }
/**
 * Add a nominal type brand to a schema
 * @param schema - Base schema to brand
 * @returns Branded schema with distinct type
 */
interface ZodType<Output, Input = Output> {
  brand<Brand extends string | symbol>(): ZodBranded<this, Brand>;
}

const $brand: unique symbol;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Create branded types
const UserId = z.string().brand<'UserId'>();
const OrderId = z.string().brand<'OrderId'>();

type UserId = z.infer<typeof UserId>; // string & { [z.$brand]: "UserId" }
type OrderId = z.infer<typeof OrderId>; // string & { [z.$brand]: "OrderId" }

// Runtime they're both strings, but TypeScript treats them as different types
const userId: UserId = UserId.parse('user-123');
const orderId: OrderId = OrderId.parse('order-456');

// Type error: can't assign one to the other
// const x: UserId = orderId; // TypeScript error

// Useful for domain modeling
const Email = z.string().email().brand<'Email'>();
const URL = z.string().url().brand<'URL'>();
const UUID = z.string().uuid().brand<'UUID'>();

type Email = z.infer<typeof Email>;
type URL = z.infer<typeof URL>;
type UUID = z.infer<typeof UUID>;

// Function only accepts branded types
function sendEmail(to: Email, subject: string) {
  // Implementation
}

const email = Email.parse('user@example.com');
sendEmail(email, 'Hello'); // OK
// sendEmail('user@example.com', 'Hello'); // TypeScript error
```

### Describe Modifier

Adds a description to a schema for documentation purposes.

```typescript { .api }
/**
 * Add a description to a schema
 * @param description - Description string
 * @returns Schema with description metadata
 */
interface ZodType<Output, Input = Output> {
  describe(description: string): this;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Username = z.string()
  .min(3)
  .max(20)
  .describe('User account username (3-20 characters)');

const User = z.object({
  username: Username,
  email: z.string().email().describe('User email address'),
  age: z.number().int().positive().describe('User age in years'),
});

// Description is available in schema metadata
console.log(Username.description); // "User account username (3-20 characters)"
```

### Meta Modifier

Adds custom metadata to a schema for application-specific purposes.

```typescript { .api }
/**
 * Add custom metadata to a schema
 * @param metadata - Custom metadata object
 * @returns Schema with custom metadata
 */
interface ZodType<Output, Input = Output> {
  meta(metadata: any): this;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Username = z.string().meta({
  label: 'Username',
  helpText: 'Choose a unique username',
  placeholder: 'john_doe',
});

const FormSchema = z.object({
  name: z.string().meta({ fieldType: 'text', required: true }),
  email: z.string().email().meta({ fieldType: 'email', required: true }),
  age: z.number().meta({ fieldType: 'number', min: 0, max: 120 }),
});

// Access metadata
console.log(Username._def.meta);
```

## Chaining Modifiers

Modifiers can be chained together:

```typescript
import * as z from 'zod';

const Schema = z.string()
  .min(3)
  .optional()
  .default('default')
  .describe('A string field')
  .meta({ custom: 'data' });

const ComplexField = z.number()
  .positive()
  .nullable()
  .default(0)
  .brand<'Score'>()
  .describe('User score');

const CatchWithDefault = z.number()
  .catch(0)
  .default(100);
```

## Types

```typescript { .api }
type ZodTypeAny = ZodType<any, any, any>;

class ZodOptional<T extends ZodTypeAny> {
  readonly _type: 'ZodOptional';
  unwrap(): T;
}

class ZodNullable<T extends ZodTypeAny> {
  readonly _type: 'ZodNullable';
  unwrap(): T;
}

class ZodNullish<T extends ZodTypeAny> {
  readonly _type: 'ZodNullish';
  unwrap(): T;
}

class ZodDefault<T extends ZodTypeAny> {
  readonly _type: 'ZodDefault';
  readonly _defaultValue: () => z.output<T>;
  removeDefault(): T;
}

class ZodPrefault<T extends ZodTypeAny> {
  readonly _type: 'ZodPrefault';
  readonly _prefaultValue: () => z.input<T>;
}

class ZodCatch<T extends ZodTypeAny> {
  readonly _type: 'ZodCatch';
  readonly _catchValue: (error: ZodError) => z.output<T>;
  removeCatch(): T;
}

class ZodReadonly<T extends ZodTypeAny> {
  readonly _type: 'ZodReadonly';
  unwrap(): T;
}

class ZodSuccess<T extends ZodTypeAny> {
  readonly _type: 'ZodSuccess';
}

class ZodNonOptional<T extends ZodTypeAny> {
  readonly _type: 'ZodNonOptional';
}

class ZodBranded<T extends ZodTypeAny, Brand extends string | symbol> {
  readonly _type: 'ZodBranded';
  readonly _brand: Brand;
  unwrap(): T;
}

type DefaultValue<T extends ZodTypeAny> = z.output<T> | (() => z.output<T>);
type PrefaultValue<T extends ZodTypeAny> = z.input<T> | (() => z.input<T>);
type CatchValue<T extends ZodTypeAny> = z.output<T> | ((error: ZodError) => z.output<T>);

class ZodError<T = any> extends Error {
  issues: ZodIssue[];
}
```
