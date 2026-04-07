# Pipeline and Codec

Connect schemas with one-way pipelines or bidirectional codecs for advanced transformation workflows and serialization/deserialization patterns.

## Capabilities

### Pipe

Creates a one-way transformation pipeline from one schema to another, where the output of the first schema becomes the input of the second schema.

```typescript { .api }
/**
 * Create a pipeline connecting two schemas
 * @param a - Input schema
 * @param b - Output schema that receives the output of schema a
 * @returns Pipeline schema with one-way transformation
 */
function pipe<A extends ZodTypeAny, B extends ZodTypeAny>(
  a: A,
  b: B
): ZodPipeline<A, B>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// String to number pipeline
const StringToNumber = z.pipe(
  z.string(),
  z.coerce.number()
);

type StringToNumber = z.infer<typeof StringToNumber>; // number (output)
StringToNumber.parse('42'); // => 42
StringToNumber.parse('3.14'); // => 3.14

// Validation pipeline
const TrimmedEmail = z.pipe(
  z.string().transform((s) => s.trim()),
  z.string().email()
);
TrimmedEmail.parse('  user@example.com  '); // => "user@example.com"

// Multi-step transformation
const ProcessedUser = z.pipe(
  z.object({
    name: z.string(),
    age: z.string(),
  }),
  z.object({
    name: z.string(),
    age: z.number(),
  }).transform((data) => ({
    ...data,
    age: parseInt(data.age, 10),
  }))
);

// Date parsing pipeline
const DatePipeline = z.pipe(
  z.string(),
  z.string().transform((s) => new Date(s)),
  z.date()
);

// JSON parsing pipeline
const JsonPipeline = z.pipe(
  z.string(),
  z.string().transform((s) => JSON.parse(s)),
  z.object({
    name: z.string(),
    age: z.number(),
  })
);

JsonPipeline.parse('{"name": "Alice", "age": 30}');
// => { name: "Alice", age: 30 }
```

### Pipe Method Syntax

Pipes can also be created using the `.pipe()` method on schemas:

```typescript
import * as z from 'zod';

const StringToNumber = z.string().pipe(z.coerce.number());

// Chaining multiple pipes
const ComplexPipe = z.string()
  .pipe(z.string().transform((s) => s.trim()))
  .pipe(z.string().transform((s) => s.toLowerCase()))
  .pipe(z.string().min(3));

// Object transformation pipeline
const UserInput = z.object({
  firstName: z.string(),
  lastName: z.string(),
})
  .pipe(z.object({
    firstName: z.string(),
    lastName: z.string(),
  }).transform((data) => ({
    fullName: `${data.firstName} ${data.lastName}`,
  })));
```

### Codec

Creates a bidirectional transformation between input and output types, allowing both encoding (output to input) and decoding (input to output).

```typescript { .api }
/**
 * Create a bidirectional codec
 * @param encoder - Schema that encodes output to input
 * @param decoder - Schema that decodes input to output
 * @returns Codec schema with encode and decode methods
 */
function codec<Input, Output>(
  encoder: ZodType<Input, any, Output>,
  decoder: ZodType<Output, any, Input>
): ZodCodec<Input, Output>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Date codec (serialize/deserialize dates as ISO strings)
const DateCodec = z.codec(
  z.date().transform((date) => date.toISOString()), // encode: Date -> string
  z.string().transform((str) => new Date(str))     // decode: string -> Date
);

type DateCodecInput = z.input<typeof DateCodec>; // string
type DateCodecOutput = z.output<typeof DateCodec>; // Date

// Decode: string -> Date
const decoded = DateCodec.decode('2024-01-15T10:30:00.000Z');
// => Date object

// Encode: Date -> string
const encoded = DateCodec.encode(new Date('2024-01-15T10:30:00.000Z'));
// => "2024-01-15T10:30:00.000Z"

// Number to string codec
const NumberStringCodec = z.codec(
  z.number().transform((n) => n.toString()),
  z.string().transform((s) => parseFloat(s))
);

NumberStringCodec.decode('42.5'); // => 42.5
NumberStringCodec.encode(42.5);   // => "42.5"

// Complex object codec
const UserCodec = z.codec(
  // Encoder: convert User to JSON-safe format
  z.object({
    name: z.string(),
    birthDate: z.date(),
    metadata: z.map(z.string(), z.any()),
  }).transform((user) => ({
    name: user.name,
    birthDate: user.birthDate.toISOString(),
    metadata: Object.fromEntries(user.metadata),
  })),
  // Decoder: convert JSON-safe format to User
  z.object({
    name: z.string(),
    birthDate: z.string(),
    metadata: z.record(z.string(), z.any()),
  }).transform((data) => ({
    name: data.name,
    birthDate: new Date(data.birthDate),
    metadata: new Map(Object.entries(data.metadata)),
  }))
);

// API serialization codec
const ApiCodec = z.codec(
  // Encoder: domain model -> API format
  z.object({
    userId: z.string(),
    fullName: z.string(),
    createdAt: z.date(),
  }).transform((data) => ({
    user_id: data.userId,
    full_name: data.fullName,
    created_at: data.createdAt.getTime(),
  })),
  // Decoder: API format -> domain model
  z.object({
    user_id: z.string(),
    full_name: z.string(),
    created_at: z.number(),
  }).transform((data) => ({
    userId: data.user_id,
    fullName: data.full_name,
    createdAt: new Date(data.created_at),
  }))
);
```

### Codec Methods

Codec schemas provide both encoding and decoding methods:

```typescript { .api }
interface ZodCodec<Input, Output> {
  // Decoding (input -> output)
  decode(input: Input): Output;
  decodeAsync(input: Input): Promise<Output>;
  safeDecode(input: Input): SafeParseReturnType<Input, Output>;
  safeDecodeAsync(input: Input): Promise<SafeParseReturnType<Input, Output>>;

  // Encoding (output -> input)
  encode(output: Output): Input;
  encodeAsync(output: Output): Promise<Input>;
  safeEncode(output: Output): SafeParseReturnType<Output, Input>;
  safeEncodeAsync(output: Output): Promise<SafeParseReturnType<Output, Input>>;

  // Standard parse methods (same as decode)
  parse(input: Input): Output;
  parseAsync(input: Input): Promise<Output>;
  safeParse(input: Input): SafeParseReturnType<Input, Output>;
  safeParseAsync(input: Input): Promise<SafeParseReturnType<Input, Output>>;
}

type SafeParseReturnType<Input, Output> =
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> };
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const DateCodec = z.codec(
  z.date().transform((date) => date.toISOString()),
  z.string().transform((str) => new Date(str))
);

// Decode (parse)
const date = DateCodec.decode('2024-01-15T10:30:00.000Z');
console.log(date); // Date object

// Encode
const isoString = DateCodec.encode(new Date('2024-01-15'));
console.log(isoString); // "2024-01-15T00:00:00.000Z"

// Safe decode
const result = DateCodec.safeDecode('invalid-date');
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}

// Safe encode
const encodeResult = DateCodec.safeEncode(new Date());
if (encodeResult.success) {
  console.log(encodeResult.data);
}

// Async operations
const asyncResult = await DateCodec.decodeAsync('2024-01-15T10:30:00.000Z');
```

### String-Boolean Codec

A built-in codec for converting between string and boolean values, commonly used for form data and URL parameters.

```typescript { .api }
/**
 * Create a codec for string-to-boolean conversion
 * @param params - Optional configuration
 * @returns Codec schema converting between string and boolean
 */
function stringbool(params?: StringBoolParams): ZodCodec<ZodString, ZodBoolean>;

interface StringBoolParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const StringBoolCodec = z.stringbool();

// Decode: string -> boolean
StringBoolCodec.decode('true');  // => true
StringBoolCodec.decode('false'); // => false
StringBoolCodec.decode('1');     // => true
StringBoolCodec.decode('0');     // => false
StringBoolCodec.decode('yes');   // => true
StringBoolCodec.decode('no');    // => false

// Encode: boolean -> string
StringBoolCodec.encode(true);  // => "true"
StringBoolCodec.encode(false); // => "false"

// Use in object schemas
const FormData = z.object({
  name: z.string(),
  isActive: z.stringbool(),
  acceptsTerms: z.stringbool(),
});

// Parse form data
const result = FormData.parse({
  name: 'Alice',
  isActive: 'true',
  acceptsTerms: '1',
});
// => { name: 'Alice', isActive: true, acceptsTerms: true }

// Encode back to string format
const encoded = FormData.encode({
  name: 'Alice',
  isActive: true,
  acceptsTerms: true,
});
// => { name: 'Alice', isActive: 'true', acceptsTerms: 'true' }
```

### Use Cases

Common patterns for pipes and codecs:

```typescript
import * as z from 'zod';

// 1. Form data processing (pipe)
const FormDataPipe = z.pipe(
  z.object({
    name: z.string(),
    age: z.string(),
    email: z.string(),
  }),
  z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
    email: z.string().email(),
  }).transform((data) => ({
    name: data.name.trim(),
    age: parseInt(data.age, 10),
    email: data.email.toLowerCase(),
  }))
);

// 2. API serialization (codec)
const ApiUserCodec = z.codec(
  // To API format
  z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.date(),
  }).transform((user) => ({
    id: user.id,
    name: user.name,
    created_at: user.createdAt.toISOString(),
  })),
  // From API format
  z.object({
    id: z.string(),
    name: z.string(),
    created_at: z.string(),
  }).transform((data) => ({
    id: data.id,
    name: data.name,
    createdAt: new Date(data.created_at),
  }))
);

// 3. Data normalization (pipe)
const NormalizePipe = z.string()
  .pipe(z.string().transform((s) => s.trim()))
  .pipe(z.string().transform((s) => s.toLowerCase()))
  .pipe(z.string().transform((s) => s.replace(/\s+/g, '-')));

// 4. Binary encoding (codec)
const BinaryCodec = z.codec(
  // Encode to base64
  z.instanceof(Uint8Array).transform((bytes) => {
    return Buffer.from(bytes).toString('base64');
  }),
  // Decode from base64
  z.string().transform((str) => {
    return new Uint8Array(Buffer.from(str, 'base64'));
  })
);

// 5. URL encoding (codec)
const UrlParamsCodec = z.codec(
  // Object to URL params
  z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .transform((obj) => new URLSearchParams(
      Object.entries(obj).map(([k, v]) => [k, String(v)])
    ).toString()),
  // URL params to object
  z.string().transform((str) => {
    const params = new URLSearchParams(str);
    return Object.fromEntries(params.entries());
  })
);
```

### Async Codecs

Codecs support async transformations:

```typescript
import * as z from 'zod';

const AsyncUserCodec = z.codec(
  // Async encoder
  z.object({
    id: z.string(),
    name: z.string(),
  }).transform(async (user) => {
    const enriched = await enrichUserData(user.id);
    return { ...user, ...enriched };
  }),
  // Async decoder
  z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }).transform(async (data) => {
    const validated = await validateUser(data);
    return validated;
  })
);

// Use async methods
const encoded = await AsyncUserCodec.encodeAsync({ id: '1', name: 'Alice' });
const decoded = await AsyncUserCodec.decodeAsync({ id: '1', name: 'Alice', email: 'alice@example.com' });

declare function enrichUserData(id: string): Promise<{ email: string }>;
declare function validateUser(data: any): Promise<any>;
```

## Types

```typescript { .api }
type ZodTypeAny = ZodType<any, any, any>;

class ZodPipeline<A extends ZodTypeAny, B extends ZodTypeAny> {
  readonly _type: 'ZodPipeline';
  readonly in: A;
  readonly out: B;

  parse(data: unknown): z.output<B>;
  safeParse(data: unknown): SafeParseReturnType<unknown, z.output<B>>;
}

class ZodCodec<Input, Output> {
  readonly _type: 'ZodCodec';
  readonly encoder: ZodType<Input, any, Output>;
  readonly decoder: ZodType<Output, any, Input>;

  // Decode methods
  decode(input: Input): Output;
  decodeAsync(input: Input): Promise<Output>;
  safeDecode(input: Input): SafeParseReturnType<Input, Output>;
  safeDecodeAsync(input: Input): Promise<SafeParseReturnType<Input, Output>>;

  // Encode methods
  encode(output: Output): Input;
  encodeAsync(output: Output): Promise<Input>;
  safeEncode(output: Output): SafeParseReturnType<Output, Input>;
  safeEncodeAsync(output: Output): Promise<SafeParseReturnType<Output, Input>>;

  // Parse methods (aliases for decode)
  parse(input: Input): Output;
  parseAsync(input: Input): Promise<Output>;
  safeParse(input: Input): SafeParseReturnType<Input, Output>;
  safeParseAsync(input: Input): Promise<SafeParseReturnType<Input, Output>>;
}

type SafeParseReturnType<Input, Output> =
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> };

class ZodError<T = any> extends Error {
  issues: ZodIssue[];
}
```
