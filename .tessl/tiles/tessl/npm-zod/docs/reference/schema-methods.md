# Schema Methods

Common instance methods available on all schema types for parsing, validation, transformation, and modification.

## Capabilities

### Parse Methods

All schemas provide parsing methods that validate and return the parsed value or throw an error.

```typescript { .api }
/**
 * Parse and validate data, throwing on error
 * @param data - Data to validate
 * @returns Validated and typed data
 * @throws ZodError if validation fails
 */
parse(data: unknown): Output;

/**
 * Parse and validate data asynchronously
 * @param data - Data to validate
 * @returns Promise of validated and typed data
 * @throws ZodError if validation fails
 */
parseAsync(data: unknown): Promise<Output>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// Synchronous parse
const user = UserSchema.parse({ name: 'Alice', age: 30 });
// user: { name: string; age: number }

// Throws ZodError on invalid data
try {
  UserSchema.parse({ name: 'Bob' }); // Missing age
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.issues);
  }
}

// Async parse
const AsyncSchema = z.object({
  username: z.string().refine(async (val) => {
    return await checkUsernameAvailable(val);
  }),
});

const result = await AsyncSchema.parseAsync({ username: 'alice' });

declare function checkUsernameAvailable(username: string): Promise<boolean>;
```

### Safe Parse Methods

Safe parse methods return a result object instead of throwing errors, useful for conditional error handling.

```typescript { .api }
/**
 * Parse and validate data without throwing
 * @param data - Data to validate
 * @returns Result object with success flag and data or error
 */
safeParse(data: unknown): SafeParseReturnType<Input, Output>;

/**
 * Parse and validate data asynchronously without throwing
 * @param data - Data to validate
 * @returns Promise of result object with success flag and data or error
 */
safeParseAsync(data: unknown): Promise<SafeParseReturnType<Input, Output>>;

/**
 * Shorthand alias for safeParseAsync
 * @param data - Data to validate
 * @returns Promise of result object with success flag and data or error
 */
spa(data: unknown): Promise<SafeParseReturnType<Input, Output>>;

type SafeParseReturnType<Input, Output> =
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> };
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// Safe parse
const result = UserSchema.safeParse({ name: 'Alice', age: 30 });

if (result.success) {
  console.log(result.data); // { name: string; age: number }
} else {
  console.error(result.error.issues); // ZodIssue[]
}

// Type narrowing works automatically
if (result.success) {
  result.data.name; // TypeScript knows this is safe
} else {
  result.error.format(); // TypeScript knows error exists here
}

// Async safe parse
const AsyncSchema = z.object({
  email: z.string().refine(async (val) => {
    return await checkEmailValid(val);
  }),
});

const asyncResult = await AsyncSchema.safeParseAsync({ email: 'test@example.com' });

if (asyncResult.success) {
  console.log(asyncResult.data);
}

// Using spa() shorthand
const result2 = await AsyncSchema.spa({ email: 'user@example.com' });

declare function checkEmailValid(email: string): Promise<boolean>;
```

### Refinement Methods

Add custom validation logic to existing schemas.

```typescript { .api }
/**
 * Add custom validation
 * @param check - Validation function returning boolean
 * @param params - Optional error message and path
 * @returns Schema with additional validation
 */
refine(
  check: (data: Output) => boolean | Promise<boolean>,
  params?: RefineParams
): ZodEffects<this>;

/**
 * Add advanced validation with context
 * @param check - Validation function with issue context
 * @returns Schema with advanced validation
 */
superRefine(
  check: (data: Output, ctx: RefinementCtx) => void | Promise<void>
): ZodEffects<this>;

interface RefineParams {
  message?: string;
  path?: (string | number)[];
}

interface RefinementCtx {
  addIssue(issue: IssueData): void;
  path: (string | number)[];
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic refinement
const PositiveNumber = z.number().refine((n) => n > 0, {
  message: 'Must be positive',
});

// Super refinement with multiple issues
const PasswordSchema = z.string().superRefine((password, ctx) => {
  if (password.length < 8) {
    ctx.addIssue({
      code: 'too_small',
      minimum: 8,
      type: 'string',
      inclusive: true,
      message: 'Password too short',
    });
  }
  if (!/[A-Z]/.test(password)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Must contain uppercase',
    });
  }
});
```

### Transformation Methods

Transform parsed values to different types or formats.

```typescript { .api }
/**
 * Transform the parsed value
 * @param transform - Transformation function
 * @returns Schema with transformation
 */
transform<NewOut>(
  transform: (data: Output) => NewOut | Promise<NewOut>
): ZodEffects<this, NewOut>;

/**
 * Pipe to another schema
 * @param schema - Target schema
 * @returns Pipeline schema
 */
pipe<T extends ZodTypeAny>(schema: T): ZodPipeline<this, T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Transform to different type
const StringToNumber = z.string().transform((s) => parseInt(s, 10));
const num = StringToNumber.parse('42'); // => 42 (number)

// Transform object
const UserTransform = z.object({
  firstName: z.string(),
  lastName: z.string(),
}).transform((data) => ({
  fullName: `${data.firstName} ${data.lastName}`,
}));

// Pipe to another schema
const TrimmedEmail = z.string()
  .transform((s) => s.trim())
  .pipe(z.string().email());
```

### Modifier Methods

Modify schema behavior and type signatures.

```typescript { .api }
/**
 * Make schema optional (accepts undefined)
 */
optional(): ZodOptional<this>;

/**
 * Make schema exactly optional
 */
exactOptional(): ZodOptional<this>;

/**
 * Make schema nullable (accepts null)
 */
nullable(): ZodNullable<this>;

/**
 * Make schema nullish (accepts null or undefined)
 */
nullish(): ZodNullish<this>;

/**
 * Provide default value
 */
default(defaultValue: DefaultValue<this>): ZodDefault<this>;

/**
 * Provide prefault value (input default)
 */
prefault(prefaultValue: PrefaultValue<this>): ZodPrefault<this>;

/**
 * Catch errors with fallback value
 */
catch(catchValue: CatchValue<this>): ZodCatch<this>;

/**
 * Make schema readonly (type-level only)
 */
readonly(): ZodReadonly<this>;

/**
 * Add nominal type brand
 */
brand<Brand extends string | symbol>(): ZodBranded<this, Brand>;

type DefaultValue<T> = z.output<T> | (() => z.output<T>);
type PrefaultValue<T> = z.input<T> | (() => z.input<T>);
type CatchValue<T> = z.output<T> | ((error: ZodError) => z.output<T>);
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Optional
const OptionalString = z.string().optional();
type OptionalString = z.infer<typeof OptionalString>; // string | undefined

// Nullable
const NullableNumber = z.number().nullable();
type NullableNumber = z.infer<typeof NullableNumber>; // number | null

// Nullish
const NullishBoolean = z.boolean().nullish();
type NullishBoolean = z.infer<typeof NullishBoolean>; // boolean | null | undefined

// Default
const WithDefault = z.string().default('hello');
WithDefault.parse(undefined); // => "hello"

// Catch
const SafeNumber = z.number().catch(0);
SafeNumber.parse('invalid'); // => 0 (no throw)

// Brand
const UserId = z.string().brand<'UserId'>();
type UserId = z.infer<typeof UserId>; // string & { [z.$brand]: "UserId" }

// Readonly
const ReadonlyArray = z.array(z.string()).readonly();
type ReadonlyArray = z.infer<typeof ReadonlyArray>; // readonly string[]
```

### Metadata Methods

Add descriptions and metadata to schemas.

```typescript { .api }
/**
 * Add description for documentation
 * @param description - Description string
 * @returns Schema with description
 */
describe(description: string): this;

/**
 * Add custom metadata
 * @param metadata - Custom metadata object
 * @returns Schema with metadata
 */
meta(metadata: any): this;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Username = z.string()
  .min(3)
  .max(20)
  .describe('User account username (3-20 characters)')
  .meta({
    label: 'Username',
    placeholder: 'john_doe',
    helpText: 'Choose a unique username',
  });

const User = z.object({
  id: z.string().describe('Unique user identifier'),
  email: z.string().email().describe('User email address'),
  age: z.number().int().positive().describe('User age in years'),
});
```

### Codec Methods

For schemas that support bidirectional transformation (codecs).

```typescript { .api }
/**
 * Encode from output to input
 */
encode(data: Output): Input;

/**
 * Decode from input to output (same as parse)
 */
decode(data: Input): Output;

/**
 * Encode asynchronously
 */
encodeAsync(data: Output): Promise<Input>;

/**
 * Decode asynchronously (same as parseAsync)
 */
decodeAsync(data: Input): Promise<Output>;

/**
 * Safe encode
 */
safeEncode(data: Output): SafeParseReturnType<Output, Input>;

/**
 * Safe decode (same as safeParse)
 */
safeDecode(data: Input): SafeParseReturnType<Input, Output>;

/**
 * Safe encode asynchronously
 */
safeEncodeAsync(data: Output): Promise<SafeParseReturnType<Output, Input>>;

/**
 * Safe decode asynchronously (same as safeParseAsync)
 */
safeDecodeAsync(data: Input): Promise<SafeParseReturnType<Input, Output>>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const DateCodec = z.codec(
  z.date().transform((d) => d.toISOString()),
  z.string().transform((s) => new Date(s))
);

// Decode (input -> output)
const date = DateCodec.decode('2024-01-15T10:30:00.000Z');
// => Date object

// Encode (output -> input)
const isoString = DateCodec.encode(new Date('2024-01-15'));
// => "2024-01-15T00:00:00.000Z"

// Safe operations
const decodeResult = DateCodec.safeDecode('2024-01-15T10:30:00.000Z');
const encodeResult = DateCodec.safeEncode(new Date());
```

### Standalone Parsing Functions

Top-level parsing functions that take a schema as the first argument, providing an alternative functional API.

```typescript { .api }
/**
 * Parse data with a schema (functional style)
 * @param schema - Schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws ZodError if validation fails
 */
function parse<T extends ZodTypeAny>(schema: T, data: unknown): z.output<T>;

/**
 * Parse data asynchronously with a schema
 * @param schema - Schema to validate against
 * @param data - Data to validate
 * @returns Promise of validated data
 * @throws ZodError if validation fails
 */
function parseAsync<T extends ZodTypeAny>(schema: T, data: unknown): Promise<z.output<T>>;

/**
 * Safe parse data with a schema (functional style)
 * @param schema - Schema to validate against
 * @param data - Data to validate
 * @returns Result object with success flag and data or error
 */
function safeParse<T extends ZodTypeAny>(
  schema: T,
  data: unknown
): SafeParseReturnType<z.input<T>, z.output<T>>;

/**
 * Safe parse data asynchronously with a schema
 * @param schema - Schema to validate against
 * @param data - Data to validate
 * @returns Promise of result object
 */
function safeParseAsync<T extends ZodTypeAny>(
  schema: T,
  data: unknown
): Promise<SafeParseReturnType<z.input<T>, z.output<T>>>;

/**
 * Encode data with a schema (output to input transformation)
 * @param schema - Schema to use for encoding
 * @param data - Data to encode
 * @returns Encoded data
 */
function encode<T extends ZodTypeAny>(schema: T, data: z.output<T>): z.input<T>;

/**
 * Decode data with a schema (input to output transformation)
 * @param schema - Schema to use for decoding
 * @param data - Data to decode
 * @returns Decoded data
 */
function decode<T extends ZodTypeAny>(schema: T, data: z.input<T>): z.output<T>;

/**
 * Encode data asynchronously with a schema
 * @param schema - Schema to use for encoding
 * @param data - Data to encode
 * @returns Promise of encoded data
 */
function encodeAsync<T extends ZodTypeAny>(schema: T, data: z.output<T>): Promise<z.input<T>>;

/**
 * Decode data asynchronously with a schema
 * @param schema - Schema to use for decoding
 * @param data - Data to decode
 * @returns Promise of decoded data
 */
function decodeAsync<T extends ZodTypeAny>(schema: T, data: z.input<T>): Promise<z.output<T>>;

/**
 * Safe encode data with a schema
 * @param schema - Schema to use for encoding
 * @param data - Data to encode
 * @returns Result object with success flag
 */
function safeEncode<T extends ZodTypeAny>(
  schema: T,
  data: z.output<T>
): SafeParseReturnType<z.output<T>, z.input<T>>;

/**
 * Safe decode data with a schema
 * @param schema - Schema to use for decoding
 * @param data - Data to decode
 * @returns Result object with success flag
 */
function safeDecode<T extends ZodTypeAny>(
  schema: T,
  data: z.input<T>
): SafeParseReturnType<z.input<T>, z.output<T>>;

/**
 * Safe encode data asynchronously with a schema
 * @param schema - Schema to use for encoding
 * @param data - Data to encode
 * @returns Promise of result object
 */
function safeEncodeAsync<T extends ZodTypeAny>(
  schema: T,
  data: z.output<T>
): Promise<SafeParseReturnType<z.output<T>, z.input<T>>>;

/**
 * Safe decode data asynchronously with a schema
 * @param schema - Schema to use for decoding
 * @param data - Data to decode
 * @returns Promise of result object
 */
function safeDecodeAsync<T extends ZodTypeAny>(
  schema: T,
  data: z.input<T>
): Promise<SafeParseReturnType<z.input<T>, z.output<T>>>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// Functional API style
const user1 = z.parse(UserSchema, { name: 'Alice', age: 30 });
// Equivalent to: UserSchema.parse({ name: 'Alice', age: 30 })

const result = z.safeParse(UserSchema, { name: 'Bob', age: 25 });
if (result.success) {
  console.log(result.data);
}

// Useful for higher-order functions
const schemas = [z.string(), z.number(), z.boolean()];
const values = ['hello', 42, true];
const validated = schemas.map((schema, i) => z.parse(schema, values[i]));

// Codec operations
const DateCodec = z.codec(
  z.date().transform((d) => d.toISOString()),
  z.string().transform((s) => new Date(s))
);

const encoded = z.encode(DateCodec, new Date('2024-01-15'));
const decoded = z.decode(DateCodec, '2024-01-15T00:00:00.000Z');
```

### Type-Specific Methods

Different schema types have their own specific methods:

```typescript { .api }
// String methods
interface ZodString {
  min(length: number, message?: string): ZodString;
  max(length: number, message?: string): ZodString;
  length(length: number, message?: string): ZodString;
  email(message?: string): ZodString;
  url(message?: string): ZodString;
  uuid(message?: string): ZodString;
  regex(pattern: RegExp, message?: string): ZodString;
  trim(): ZodString;
  toLowerCase(): ZodString;
  toUpperCase(): ZodString;
}

// Number methods
interface ZodNumber {
  min(value: number, message?: string): ZodNumber;
  max(value: number, message?: string): ZodNumber;
  int(message?: string): ZodNumber;
  positive(message?: string): ZodNumber;
  negative(message?: string): ZodNumber;
  multipleOf(divisor: number, message?: string): ZodNumber;
}

// Array methods
interface ZodArray<T> {
  min(length: number, message?: string): ZodArray<T>;
  max(length: number, message?: string): ZodArray<T>;
  length(length: number, message?: string): ZodArray<T>;
  nonempty(message?: string): ZodArray<T>;
}

// Object methods
interface ZodObject<T> {
  extend<U>(shape: U): ZodObject<T & U>;
  merge<U>(other: ZodObject<U>): ZodObject<T & U>;
  pick<Keys>(keys: Keys): ZodObject<Pick<T, keyof Keys>>;
  omit<Keys>(keys: Keys): ZodObject<Omit<T, keyof Keys>>;
  partial(): ZodObject<Partial<T>>;
  deepPartial(): ZodObject<DeepPartial<T>>;
  required(): ZodObject<Required<T>>;
  passthrough(): ZodObject<T>;
  strict(): ZodObject<T>;
  strip(): ZodObject<T>;
  catchall<Schema>(schema: Schema): ZodObject<T>;
  keyof(): ZodEnum<keyof T>;
}
```

## Chaining Methods

Methods can be chained for complex validation:

```typescript
import * as z from 'zod';

const ComplexSchema = z.string()
  .min(3, 'Too short')
  .max(20, 'Too long')
  .regex(/^[a-z]+$/, 'Lowercase only')
  .transform((s) => s.toUpperCase())
  .describe('Username field')
  .meta({ fieldType: 'text' });

const UserSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  age: z.number().int().positive().min(18).max(120),
  role: z.enum(['admin', 'user']).default('user'),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).default('light'),
    notifications: z.boolean().default(true),
  }).optional(),
});

const ProcessedData = z.string()
  .trim()
  .refine((s) => s.length > 0, 'Required')
  .transform((s) => s.split(','))
  .refine((arr) => arr.length <= 10, 'Too many items')
  .transform((arr) => arr.map((s) => s.trim()));
```

## Types

```typescript { .api }
interface ZodType<Output = any, Input = Output> {
  // Parsing
  parse(data: unknown): Output;
  parseAsync(data: unknown): Promise<Output>;
  safeParse(data: unknown): SafeParseReturnType<Input, Output>;
  safeParseAsync(data: unknown): Promise<SafeParseReturnType<Input, Output>>;

  // Codec (when applicable)
  encode?(data: Output): Input;
  decode?(data: Input): Output;
  encodeAsync?(data: Output): Promise<Input>;
  decodeAsync?(data: Input): Promise<Output>;
  safeEncode?(data: Output): SafeParseReturnType<Output, Input>;
  safeDecode?(data: Input): SafeParseReturnType<Input, Output>;
  safeEncodeAsync?(data: Output): Promise<SafeParseReturnType<Output, Input>>;
  safeDecodeAsync?(data: Input): Promise<SafeParseReturnType<Input, Output>>;

  // Refinement
  refine(
    check: (data: Output) => boolean | Promise<boolean>,
    params?: RefineParams
  ): ZodEffects<this>;
  superRefine(
    check: (data: Output, ctx: RefinementCtx) => void | Promise<void>
  ): ZodEffects<this>;

  // Transformation
  transform<NewOut>(
    transform: (data: Output) => NewOut | Promise<NewOut>
  ): ZodEffects<this, NewOut>;
  pipe<T extends ZodTypeAny>(schema: T): ZodPipeline<this, T>;

  // Modifiers
  optional(): ZodOptional<this>;
  exactOptional(): ZodOptional<this>;
  nullable(): ZodNullable<this>;
  nullish(): ZodNullish<this>;
  default(defaultValue: DefaultValue<this>): ZodDefault<this>;
  prefault(prefaultValue: PrefaultValue<this>): ZodPrefault<this>;
  catch(catchValue: CatchValue<this>): ZodCatch<this>;
  readonly(): ZodReadonly<this>;
  brand<Brand extends string | symbol>(): ZodBranded<this, Brand>;

  // Metadata
  describe(description: string): this;
  meta(metadata: any): this;
}

type SafeParseReturnType<Input, Output> =
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> };

type ZodTypeAny = ZodType<any, any, any>;

type DefaultValue<T> = z.output<T> | (() => z.output<T>);
type PrefaultValue<T> = z.input<T> | (() => z.input<T>);
type CatchValue<T> = z.output<T> | ((error: ZodError) => z.output<T>);
```
