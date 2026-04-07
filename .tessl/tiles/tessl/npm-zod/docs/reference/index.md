# Zod

TypeScript-first schema validation library enabling developers to define schemas and validate data with static type inference. Zod provides comprehensive validation capabilities for primitives, complex data structures, and custom validation logic with zero external dependencies and a tiny 2kb core bundle size.

## Package Information

- **Package Name**: zod
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install zod`

## Core Imports

```typescript
import * as z from 'zod';
```

Named imports:

```typescript
import { z } from 'zod';
```

CommonJS:

```javascript
const z = require('zod');
```

## Basic Usage

```typescript
import * as z from 'zod';

// Define a schema
const User = z.object({
  name: z.string(),
  age: z.number().int().positive(),
  email: z.string().email(),
  isActive: z.boolean().optional(),
});

// Parse and validate data
const userData = User.parse({
  name: 'Alice',
  age: 30,
  email: 'alice@example.com',
  isActive: true,
});

// Safe parsing (returns result object instead of throwing)
const result = User.safeParse({
  name: 'Bob',
  age: 25,
  email: 'bob@example.com',
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error.issues);
}

// Type inference
type User = z.infer<typeof User>;
// type User = { name: string; age: number; email: string; isActive?: boolean }
```

## Architecture

Zod's architecture is built on several core principles:

- **Schema Constructors**: Factory functions (e.g., `z.string()`, `z.object()`) that create immutable schema instances
- **Validation Pipeline**: Each schema instance contains validation logic that processes input data through a series of checks
- **Type Inference**: TypeScript's type system extracts static types from schema definitions using the `z.infer<T>` utility
- **Immutable API**: All methods return new schema instances rather than mutating existing ones
- **Error System**: `ZodError` class provides granular validation issue tracking with path information
- **Codec Pattern**: Bidirectional transformation between input and output types via encode/decode methods
- **JIT Compilation**: Optional just-in-time compilation for performance-critical validation paths

## Capabilities

### Primitive Schemas

Core primitive type validators including strings, numbers, booleans, dates, and specialized string formats like emails, URLs, UUIDs, and more.

```typescript { .api }
function string(params?: StringParams): ZodString;
function number(params?: NumberParams): ZodNumber;
function bigint(params?: BigIntParams): ZodBigInt;
function boolean(params?: BooleanParams): ZodBoolean;
function date(params?: DateParams): ZodDate;
function symbol(params?: SymbolParams): ZodSymbol;
function null(): ZodNull;
function undefined(): ZodUndefined;
function nan(params?: NanParams): ZodNaN;
function void(): ZodVoid;
function any(): ZodAny;
function unknown(): ZodUnknown;
function never(params?: NeverParams): ZodNever;

interface StringParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

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

interface BooleanParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface DateParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface SymbolParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface NanParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface NeverParams {
  errorMap?: ErrorMapFunction;
  description?: string;
}
```

[Primitives](./primitives.md)

### String Formats

Specialized string validators for common formats including emails, URLs, UUIDs, IP addresses, and many identifier types.

```typescript { .api }
function email(params?: StringParams): ZodString;
function url(params?: StringParams): ZodString;
function httpUrl(params?: StringParams): ZodString;
function uuid(params?: StringParams): ZodString;
function uuidv4(params?: StringParams): ZodString;
function uuidv6(params?: StringParams): ZodString;
function uuidv7(params?: StringParams): ZodString;
function guid(params?: StringParams): ZodString;
function cuid(params?: StringParams): ZodString;
function cuid2(params?: StringParams): ZodString;
function ulid(params?: StringParams): ZodString;
function xid(params?: StringParams): ZodString;
function ksuid(params?: StringParams): ZodString;
function nanoid(params?: StringParams): ZodString;
function emoji(params?: StringParams): ZodString;
function ipv4(params?: StringParams): ZodString;
function ipv6(params?: StringParams): ZodString;
function mac(params?: StringParams): ZodString;
function cidrv4(params?: StringParams): ZodString;
function cidrv6(params?: StringParams): ZodString;
function base64(params?: StringParams): ZodString;
function base64url(params?: StringParams): ZodString;
function e164(params?: StringParams): ZodString;
function jwt(params?: StringParams): ZodString;
function hostname(params?: StringParams): ZodString;
function hex(params?: StringParams): ZodString;
function hash<
  Alg extends 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512',
  Enc extends 'hex' | 'base64' | 'base64url' = 'hex'
>(
  alg: Alg,
  params?: { enc?: Enc } & StringParams
): ZodCustomStringFormat<`${Alg}_${Enc}`>;
function stringFormat<Format extends string>(
  format: Format,
  validator: ((value: string) => boolean) | RegExp,
  params?: StringParams
): ZodCustomStringFormat<Format>;

type ZodCustomStringFormat<Format extends string> = ZodString & { format: Format };
```

[String Formats](./string-formats.md)

### Number Types

Specialized number and bigint validators including integers, floats, and sized numeric types.

```typescript { .api }
function int(params?: NumberParams): ZodNumber;
function float32(params?: NumberParams): ZodNumber;
function float64(params?: NumberParams): ZodNumber;
function int32(params?: NumberParams): ZodNumber;
function uint32(params?: NumberParams): ZodNumber;
function int64(params?: BigIntParams): ZodBigInt;
function uint64(params?: BigIntParams): ZodBigInt;
```

[Number Types](./number-types.md)

### Literal and Special Schemas

Literal value validation and special schema types for any, unknown, and never.

```typescript { .api }
function literal<T extends Primitive>(value: T): ZodLiteral<T>;

type Primitive = string | number | boolean | null | undefined | symbol | bigint;
```

[Literals](./literals.md)

### Complex Schemas

Validators for structured data including objects, arrays, tuples, records, maps, sets, and enums.

```typescript { .api }
function object<T extends ZodRawShape>(
  shape: T,
  params?: ObjectParams
): ZodObject<T>;

function strictObject<T extends ZodRawShape>(
  shape: T,
  params?: ObjectParams
): ZodObject<T>;

function looseObject<T extends ZodRawShape>(
  shape: T,
  params?: ObjectParams
): ZodObject<T>;

function array<T extends ZodTypeAny>(
  schema: T,
  params?: ArrayParams
): ZodArray<T>;

function tuple<T extends [ZodTypeAny, ...ZodTypeAny[]]>(
  items: T
): ZodTuple<T>;

function tuple<T extends [ZodTypeAny, ...ZodTypeAny[]], Rest extends ZodTypeAny>(
  items: T,
  rest: Rest
): ZodTuple<T, Rest>;

function record<K extends KeySchema, V extends ZodTypeAny>(
  keySchema: K,
  valueSchema: V
): ZodRecord<K, V>;

function partialRecord<K extends KeySchema, V extends ZodTypeAny>(
  keySchema: K,
  valueSchema: V
): ZodRecord<K, ZodOptional<V>>;

function looseRecord<K extends KeySchema, V extends ZodTypeAny>(
  keySchema: K,
  valueSchema: V
): ZodRecord<K, V>;

function map<K extends ZodTypeAny, V extends ZodTypeAny>(
  keySchema: K,
  valueSchema: V
): ZodMap<K, V>;

function set<T extends ZodTypeAny>(
  valueSchema: T,
  params?: SetParams
): ZodSet<T>;

function enum_<T extends [string, ...string[]]>(
  values: T
): ZodEnum<T>;

function nativeEnum<T extends EnumLike>(
  enumObject: T
): ZodNativeEnum<T>;

function keyof<T extends ZodObject>(
  schema: T
): ZodEnum<[keyof T['shape'], ...(keyof T['shape'])[]]>;

type ZodRawShape = { [k: string]: ZodTypeAny };
type KeySchema = ZodString | ZodNumber | ZodSymbol;
type EnumLike = { [k: string]: string | number; [nu: number]: string };

interface ObjectParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface ArrayParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface SetParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

[Complex Schemas](./complex-schemas.md)

### Union and Intersection Schemas

Combine multiple schemas using union, discriminated union, exclusive union (xor), and intersection operations.

```typescript { .api }
function union<T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(
  schemas: T
): ZodUnion<T>;

function discriminatedUnion<
  Discriminator extends string,
  Options extends ZodDiscriminatedUnionOption<Discriminator>[]
>(
  discriminator: Discriminator,
  options: Options
): ZodDiscriminatedUnion<Discriminator, Options>;

function xor<T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(
  schemas: T
): ZodXor<T>;

function intersection<A extends ZodTypeAny, B extends ZodTypeAny>(
  left: A,
  right: B
): ZodIntersection<A, B>;

type ZodDiscriminatedUnionOption<Discriminator extends string> = ZodObject<{
  [K in Discriminator]: ZodLiteral<any>;
}>;
```

[Unions and Intersections](./unions-intersections.md)

### Modifiers

Transform schemas by making them optional, nullable, with defaults, or applying other modifications.

```typescript { .api }
function optional<T extends ZodTypeAny>(schema: T): ZodOptional<T>;
function exactOptional<T extends ZodTypeAny>(schema: T): ZodOptional<T>;
function nullable<T extends ZodTypeAny>(schema: T): ZodNullable<T>;
function nullish<T extends ZodTypeAny>(schema: T): ZodNullish<T>;
function _default<T extends ZodTypeAny>(
  schema: T,
  defaultValue: DefaultValue<T>
): ZodDefault<T>;
function prefault<T extends ZodTypeAny>(
  schema: T,
  prefaultValue: PrefaultValue<T>
): ZodPrefault<T>;
function catch_<T extends ZodTypeAny>(
  schema: T,
  catchValue: CatchValue<T>
): ZodCatch<T>;
function readonly<T extends ZodTypeAny>(schema: T): ZodReadonly<T>;
function success<T extends ZodTypeAny>(schema: T): ZodSuccess<T>;
function nonoptional<T extends ZodTypeAny>(schema: T): ZodNonOptional<T>;

type DefaultValue<T> = z.output<T> | (() => z.output<T>);
type PrefaultValue<T> = z.input<T> | (() => z.input<T>);
type CatchValue<T> = z.output<T> | ((error: ZodError) => z.output<T>);
```

[Modifiers](./modifiers.md)

### Refinements and Transformations

Add custom validation logic and transform parsed values with refine, superRefine, transform, and preprocessing.

```typescript { .api }
function refine<T extends ZodTypeAny>(
  schema: T,
  refinement: RefinementFunction<T>,
  params?: RefineParams
): ZodEffects<T>;

function superRefine<T extends ZodTypeAny>(
  schema: T,
  refinement: SuperRefinementFunction<T>
): ZodEffects<T>;

function transform<T extends ZodTypeAny, Output>(
  schema: T,
  transform: TransformFunction<T, Output>
): ZodEffects<T, Output>;

function preprocess<T extends ZodTypeAny>(
  preprocessor: (arg: unknown) => unknown,
  schema: T
): ZodEffects<T>;

function custom<T = any>(
  validator: CustomValidator<T>,
  params?: CustomParams
): ZodCustom<T>;

function instanceof<T extends typeof Class>(
  cls: T,
  params?: ZodInstanceOfParams
): ZodCustom<InstanceType<T>, InstanceType<T>>;

type RefinementFunction<T> = (data: z.output<T>) => boolean | Promise<boolean>;
type SuperRefinementFunction<T> = (
  data: z.output<T>,
  ctx: RefinementCtx
) => void | Promise<void>;
type TransformFunction<T, Output> = (
  data: z.output<T>
) => Output | Promise<Output>;
type CustomValidator<T> = (data: unknown) => data is T;

interface RefineParams {
  message?: string;
  path?: (string | number)[];
}

interface CustomParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface RefinementCtx {
  addIssue(issue: IssueData): void;
}
```

[Refinements and Transformations](./refinements-transformations.md)

### Check Functions

Standalone validation and transformation functions that can be applied to schemas for adding constraints without method chaining.

```typescript { .api }
// Numeric comparisons
function lt<T extends ZodNumber | ZodBigInt>(schema: T, value: number | bigint, params?: string | RefinementParams): T;
function lte<T extends ZodNumber | ZodBigInt>(schema: T, value: number | bigint, params?: string | RefinementParams): T;
function gt<T extends ZodNumber | ZodBigInt>(schema: T, value: number | bigint, params?: string | RefinementParams): T;
function gte<T extends ZodNumber | ZodBigInt>(schema: T, value: number | bigint, params?: string | RefinementParams): T;
function positive<T extends ZodNumber | ZodBigInt>(schema: T, params?: string | RefinementParams): T;
function negative<T extends ZodNumber | ZodBigInt>(schema: T, params?: string | RefinementParams): T;
function nonpositive<T extends ZodNumber | ZodBigInt>(schema: T, params?: string | RefinementParams): T;
function nonnegative<T extends ZodNumber | ZodBigInt>(schema: T, params?: string | RefinementParams): T;
function multipleOf<T extends ZodNumber | ZodBigInt>(schema: T, value: number | bigint, params?: string | RefinementParams): T;

// Size constraints
function maxSize<T extends ZodArray | ZodSet | ZodMap>(schema: T, size: number, params?: string | RefinementParams): T;
function minSize<T extends ZodArray | ZodSet | ZodMap>(schema: T, size: number, params?: string | RefinementParams): T;
function size<T extends ZodArray | ZodSet | ZodMap>(schema: T, size: number, params?: string | RefinementParams): T;

// Length constraints
function maxLength<T extends ZodString | ZodArray>(schema: T, length: number, params?: string | RefinementParams): T;
function minLength<T extends ZodString | ZodArray>(schema: T, length: number, params?: string | RefinementParams): T;
function length<T extends ZodString | ZodArray>(schema: T, length: number, params?: string | RefinementParams): T;

// String validation
function regex<T extends ZodString>(schema: T, pattern: RegExp, params?: string | RefinementParams): T;
function lowercase<T extends ZodString>(schema: T, params?: string | RefinementParams): T;
function uppercase<T extends ZodString>(schema: T, params?: string | RefinementParams): T;
function includes<T extends ZodString>(schema: T, substring: string, params?: string | RefinementParams): T;
function startsWith<T extends ZodString>(schema: T, prefix: string, params?: string | RefinementParams): T;
function endsWith<T extends ZodString>(schema: T, suffix: string, params?: string | RefinementParams): T;

// String transformations
function normalize<T extends ZodString>(schema: T, form?: 'NFC' | 'NFD' | 'NFKC' | 'NFKD'): T;
function trim<T extends ZodString>(schema: T): T;
function toLowerCase<T extends ZodString>(schema: T): T;
function toUpperCase<T extends ZodString>(schema: T): T;
function slugify<T extends ZodString>(schema: T): T;

// Other utilities
function overwrite<T extends ZodTypeAny, V>(schema: T, value: V): ZodEffects<T, V>;
function property<T extends ZodObject, K extends string, V extends ZodTypeAny>(schema: T, property: K, propertySchema: V): T;
function mime<T extends ZodFile>(schema: T, mimeType: string | string[], params?: string | RefinementParams): T;

interface RefinementParams {
  message?: string;
  path?: (string | number)[];
}
```

[Check Functions](./check-functions.md)

### Pipeline and Codec

Connect schemas with one-way pipelines or bidirectional codecs for advanced transformation workflows.

```typescript { .api }
function pipe<A extends ZodTypeAny, B extends ZodTypeAny>(
  a: A,
  b: B
): ZodPipeline<A, B>;

function codec<Input, Output>(
  encoder: ZodType<Input, any, Output>,
  decoder: ZodType<Output, any, Input>
): ZodCodec<Input, Output>;

function stringbool(params?: StringBoolParams): ZodCodec<ZodString, ZodBoolean>;
```

[Pipeline and Codec](./pipeline-codec.md)

### Advanced Schemas

Specialized schemas for functions, promises, lazy evaluation, template literals, files, and JSON data.

```typescript { .api }
function _function<
  Args extends ZodTuple<any, any> = ZodTuple<[], null>,
  Returns extends ZodTypeAny = ZodUnknown
>(params?: FunctionParams<Args, Returns>): ZodFunction<Args, Returns>;

function promise<T extends ZodTypeAny>(schema: T): ZodPromise<T>;

function lazy<T extends ZodTypeAny>(getter: () => T): ZodLazy<T>;

function templateLiteral<
  T extends [
    ZodTemplateLiteralPart,
    ...ZodTemplateLiteralPart[]
  ]
>(parts: T): ZodTemplateLiteral<T>;

function file(params?: FileParams): ZodFile;

function json(params?: JsonParams): ZodJson;

interface FunctionParams<Args, Returns> {
  args?: Args;
  returns?: Returns;
  errorMap?: ErrorMapFunction;
  description?: string;
}

interface FileParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

interface JsonParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

type ZodTemplateLiteralPart = ZodLiteral<string> | ZodString | ZodNumber;
```

[Advanced Schemas](./advanced-schemas.md)

### ISO Date and Time Schemas

Validators for ISO 8601 formatted datetime, date, time, and duration strings.

```typescript { .api }
namespace iso {
  function datetime(params?: ISODateTimeParams): ZodISODateTime;
  function date(params?: ISODateParams): ZodISODate;
  function time(params?: ISOTimeParams): ZodISOTime;
  function duration(params?: ISODurationParams): ZodISODuration;
}

interface ISODateTimeParams extends StringParams {
  precision?: number;
  offset?: boolean;
  local?: boolean;
}

interface ISODateParams extends StringParams {}

interface ISOTimeParams extends StringParams {
  precision?: number;
}

interface ISODurationParams extends StringParams {}
```

[ISO Date and Time](./iso-datetime.md)

### Coercion

Force type coercion during parsing for strings, numbers, booleans, bigints, and dates.

```typescript { .api }
namespace coerce {
  function string(params?: StringParams): ZodString;
  function number(params?: NumberParams): ZodNumber;
  function boolean(params?: BooleanParams): ZodBoolean;
  function bigint(params?: BigIntParams): ZodBigInt;
  function date(params?: DateParams): ZodDate;
}
```

[Coercion](./coercion.md)

### Schema Instance Methods

All schema instances share common methods for parsing, validation, transformation, and modification. These methods are available on every schema type.

```typescript { .api }
interface ZodType<Output = any, Input = Output> {
  // Parsing methods
  parse(data: unknown): Output;
  parseAsync(data: unknown): Promise<Output>;
  safeParse(data: unknown): SafeParseReturnType<Input, Output>;
  safeParseAsync(data: unknown): Promise<SafeParseReturnType<Input, Output>>;

  // Codec methods
  encode(data: Output): Input;
  decode(data: Input): Output;
  encodeAsync(data: Output): Promise<Input>;
  decodeAsync(data: Input): Promise<Output>;
  safeEncode(data: Output): SafeParseReturnType<Output, Input>;
  safeDecode(data: Input): SafeParseReturnType<Input, Output>;
  safeEncodeAsync(data: Output): Promise<SafeParseReturnType<Output, Input>>;
  safeDecodeAsync(data: Input): Promise<SafeParseReturnType<Input, Output>>;

  // Refinement methods
  refine(
    check: (data: Output) => boolean | Promise<boolean>,
    params?: RefineParams
  ): ZodEffects<this>;
  superRefine(
    check: (data: Output, ctx: RefinementCtx) => void | Promise<void>
  ): ZodEffects<this>;
  transform<NewOut>(
    transform: (data: Output) => NewOut | Promise<NewOut>
  ): ZodEffects<this, NewOut>;
  pipe<T extends ZodTypeAny>(schema: T): ZodPipeline<this, T>;

  // Modifier methods
  optional(): ZodOptional<this>;
  exactOptional(): ZodOptional<this>;
  nullable(): ZodNullable<this>;
  nullish(): ZodNullish<this>;
  default(defaultValue: DefaultValue<this>): ZodDefault<this>;
  prefault(prefaultValue: PrefaultValue<this>): ZodPrefault<this>;
  catch(catchValue: CatchValue<this>): ZodCatch<this>;
  readonly(): ZodReadonly<this>;
  brand<Brand extends string | symbol>(): ZodBranded<this, Brand>;
  describe(description: string): this;
  meta(metadata: any): this;
}

type SafeParseReturnType<Input, Output> =
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> };
```

[Schema Methods](./schema-methods.md)

### Standalone Parsing Functions

Functional-style top-level parsing functions that take a schema as the first argument, providing an alternative to method-based parsing.

```typescript { .api }
function parse<T extends ZodTypeAny>(schema: T, data: unknown): z.output<T>;
function parseAsync<T extends ZodTypeAny>(schema: T, data: unknown): Promise<z.output<T>>;
function safeParse<T extends ZodTypeAny>(
  schema: T,
  data: unknown
): SafeParseReturnType<z.input<T>, z.output<T>>;
function safeParseAsync<T extends ZodTypeAny>(
  schema: T,
  data: unknown
): Promise<SafeParseReturnType<z.input<T>, z.output<T>>>;
function encode<T extends ZodTypeAny>(schema: T, data: z.output<T>): z.input<T>;
function decode<T extends ZodTypeAny>(schema: T, data: z.input<T>): z.output<T>;
function encodeAsync<T extends ZodTypeAny>(schema: T, data: z.output<T>): Promise<z.input<T>>;
function decodeAsync<T extends ZodTypeAny>(schema: T, data: z.input<T>): Promise<z.output<T>>;
function safeEncode<T extends ZodTypeAny>(
  schema: T,
  data: z.output<T>
): SafeParseReturnType<z.output<T>, z.input<T>>;
function safeDecode<T extends ZodTypeAny>(
  schema: T,
  data: z.input<T>
): SafeParseReturnType<z.input<T>, z.output<T>>;
function safeEncodeAsync<T extends ZodTypeAny>(
  schema: T,
  data: z.output<T>
): Promise<SafeParseReturnType<z.output<T>, z.input<T>>>;
function safeDecodeAsync<T extends ZodTypeAny>(
  schema: T,
  data: z.input<T>
): Promise<SafeParseReturnType<z.input<T>, z.output<T>>>;
```

[Schema Methods](./schema-methods.md)

### Error Handling

Comprehensive error handling with ZodError class, issue types, and error formatting utilities.

```typescript { .api }
class ZodError<T = any> extends Error {
  issues: ZodIssue[];

  get isEmpty(): boolean;
  format(): FormattedError<T>;
  flatten<U = string>(): FlattenedError<T, U>;
  toString(): string;

  static create(issues: ZodIssue[]): ZodError;
}

function formatError<T>(error: ZodError<T>): FormattedError<T>;
function flattenError<T>(error: ZodError<T>): FlattenedError<T>;
function treeifyError<T>(error: ZodError<T>): TreeError<T>;
function prettifyError<T>(error: ZodError<T>): string;

type ZodIssue =
  | ZodInvalidTypeIssue
  | ZodTooBigIssue
  | ZodTooSmallIssue
  | ZodInvalidFormatIssue
  | ZodNotMultipleOfIssue
  | ZodUnrecognizedKeysIssue
  | ZodInvalidUnionIssue
  | ZodInvalidKeyIssue
  | ZodInvalidElementIssue
  | ZodInvalidValueIssue
  | ZodCustomIssue;

interface ZodIssueBase {
  path: (string | number)[];
  message: string;
}

interface FormattedError<T> {
  _errors: string[];
  [key: string]: FormattedError<any> | string[];
}

interface FlattenedError<T, U = string> {
  formErrors: U[];
  fieldErrors: { [P in keyof T]?: U[] };
}

interface TreeError<T> {
  errors: string[];
  children: { [key: string]: TreeError<any> };
}
```

[Error Handling](./error-handling.md)

### JSON Schema Integration

Convert between Zod schemas and JSON Schema format for interoperability with other tools.

```typescript { .api }
function toJSONSchema<T extends ZodTypeAny>(
  schema: T,
  options?: JSONSchemaOptions
): JSONSchema7;

function fromJSONSchema(
  jsonSchema: JSONSchema7,
  options?: FromJSONSchemaOptions
): ZodTypeAny;

interface JSONSchemaOptions {
  name?: string;
  $refStrategy?: 'root' | 'relative' | 'none';
  effectStrategy?: 'input' | 'output' | 'any';
  definitions?: Record<string, ZodTypeAny>;
  errorMessages?: boolean;
  markdownDescription?: boolean;
}

interface FromJSONSchemaOptions {
  errorMap?: ZodErrorMap;
}

type JSONSchema7 = {
  $schema?: string;
  $id?: string;
  type?: string | string[];
  properties?: { [key: string]: JSONSchema7 };
  items?: JSONSchema7 | JSONSchema7[];
  required?: string[];
  enum?: any[];
  const?: any;
  anyOf?: JSONSchema7[];
  oneOf?: JSONSchema7[];
  allOf?: JSONSchema7[];
  not?: JSONSchema7;
  // ... and more JSON Schema properties
};
```

[JSON Schema](./json-schema.md)

### Localization

Support for 49 locales with localized error messages.

```typescript { .api }
namespace locales {
  function en(): ZodErrorMap;
  function ar(): ZodErrorMap;
  function az(): ZodErrorMap;
  function be(): ZodErrorMap;
  function bg(): ZodErrorMap;
  function ca(): ZodErrorMap;
  function cs(): ZodErrorMap;
  function da(): ZodErrorMap;
  function de(): ZodErrorMap;
  function eo(): ZodErrorMap;
  function es(): ZodErrorMap;
  function fa(): ZodErrorMap;
  function fi(): ZodErrorMap;
  function fr(): ZodErrorMap;
  function frCA(): ZodErrorMap;
  function he(): ZodErrorMap;
  function hu(): ZodErrorMap;
  function hy(): ZodErrorMap;
  function id(): ZodErrorMap;
  function is(): ZodErrorMap;
  function it(): ZodErrorMap;
  function ja(): ZodErrorMap;
  function ka(): ZodErrorMap;
  function kh(): ZodErrorMap;
  function km(): ZodErrorMap;
  function ko(): ZodErrorMap;
  function lt(): ZodErrorMap;
  function mk(): ZodErrorMap;
  function ms(): ZodErrorMap;
  function nl(): ZodErrorMap;
  function no(): ZodErrorMap;
  function ota(): ZodErrorMap;
  function ps(): ZodErrorMap;
  function pl(): ZodErrorMap;
  function pt(): ZodErrorMap;
  function ru(): ZodErrorMap;
  function sl(): ZodErrorMap;
  function sv(): ZodErrorMap;
  function ta(): ZodErrorMap;
  function th(): ZodErrorMap;
  function tr(): ZodErrorMap;
  function ua(): ZodErrorMap;
  function uk(): ZodErrorMap;
  function ur(): ZodErrorMap;
  function uz(): ZodErrorMap;
  function vi(): ZodErrorMap;
  function yo(): ZodErrorMap;
  function zhCN(): ZodErrorMap;
  function zhTW(): ZodErrorMap;
}

type ZodErrorMap = (issue: ZodIssueOptionalMessage, ctx: ErrorMapCtx) => { message: string };

interface ErrorMapCtx {
  defaultError: string;
  data: any;
}

type ZodIssueOptionalMessage = Omit<ZodIssue, 'message'> & { message?: string };
```

[Localization](./localization.md)

### Configuration and Utilities

Global configuration, utility functions, type utilities, regex patterns, and other helper functions.

```typescript { .api }
function config(options?: ConfigOptions): void;

function clone<T extends ZodTypeAny>(schema: T): T;

interface ConfigOptions {
  customError?: ZodErrorMap;
  localeError?: ZodErrorMap;
  jitless?: boolean;
}

// Type utilities
type infer<T extends ZodType<any, any>> = T['_output'];
type output<T extends ZodType<any, any>> = T['_output'];
type input<T extends ZodType<any, any>> = T['_input'];

// Symbols
const $output: unique symbol;
const $input: unique symbol;
const $brand: unique symbol;

// Constants
const NEVER: never;
const TimePrecision: {
  millisecond: 3;
  second: 0;
};

// Registries
const globalRegistry: {
  add<T extends ZodTypeAny>(schema: T, metadata: any): void;
  get<T extends ZodTypeAny>(schema: T): any | undefined;
  has<T extends ZodTypeAny>(schema: T): boolean;
  remove<T extends ZodTypeAny>(schema: T): void;
  clear(): void;
};

function registry<Meta = any, Schema extends ZodTypeAny = ZodTypeAny>(): Registry<Meta, Schema>;

interface Registry<Meta, Schema extends ZodTypeAny> {
  add(schema: Schema, metadata: Meta): void;
  get(schema: Schema): Meta | undefined;
  has(schema: Schema): boolean;
  remove(schema: Schema): void;
  clear(): void;
}

// Regex patterns namespace
namespace regexes {
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
  const email: RegExp;
  const ipv4: RegExp;
  const ipv6: RegExp;
  const base64: RegExp;
  const base64url: RegExp;
  const hostname: RegExp;
  const hex: RegExp;
  // ... and more regex patterns

  function uuid(version?: 4 | 6 | 7): RegExp;
  function mac(delimiter?: string): RegExp;
  function time(args: TimeArgs): RegExp;
  function datetime(args: DateTimeArgs): RegExp;
}

// Utility namespace
namespace util {
  function isObject(value: unknown): value is object;
  function isPlainObject(value: unknown): value is Record<string, unknown>;
  function clone<T>(value: T): T;
  function shallowClone<T>(value: T): T;
  function objectClone<T extends object>(value: T): T;
  function getParsedType(data: unknown): ZodParsedType;

  type JSONType = string | number | boolean | null | JSONObject | JSONArray;
  interface JSONObject { [key: string]: JSONType }
  interface JSONArray extends Array<JSONType> {}

  type Primitive = string | number | boolean | null | undefined | symbol | bigint;
  type SafeParseSuccess<Output> = { success: true; data: Output };
  type SafeParseError<Input> = { success: false; error: ZodError<Input> };
  type SafeParseReturnType<Input, Output> =
    | SafeParseSuccess<Output>
    | SafeParseError<Input>;
}
```

[Configuration and Utilities](./config-utilities.md)

## Types

```typescript { .api }
// Base schema type
type ZodTypeAny = ZodType<any, any, any>;

// Schema classes
class ZodString extends ZodType<string, ZodStringDef, string> {}
class ZodNumber extends ZodType<number, ZodNumberDef, number> {}
class ZodBigInt extends ZodType<bigint, ZodBigIntDef, bigint> {}
class ZodBoolean extends ZodType<boolean, ZodBooleanDef, boolean> {}
class ZodDate extends ZodType<Date, ZodDateDef, Date> {}
class ZodSymbol extends ZodType<symbol, ZodSymbolDef, symbol> {}
class ZodUndefined extends ZodType<undefined, ZodUndefinedDef, undefined> {}
class ZodNull extends ZodType<null, ZodNullDef, null> {}
class ZodAny extends ZodType<any, ZodAnyDef, any> {}
class ZodUnknown extends ZodType<unknown, ZodUnknownDef, unknown> {}
class ZodNever extends ZodType<never, ZodNeverDef, never> {}
class ZodVoid extends ZodType<void, ZodVoidDef, undefined> {}
class ZodNaN extends ZodType<number, ZodNaNDef, number> {}
class ZodArray<T extends ZodTypeAny> extends ZodType<
  T['_output'][],
  ZodArrayDef<T>,
  T['_input'][]
> {}
class ZodObject<T extends ZodRawShape> extends ZodType<
  ObjectOutputType<T>,
  ZodObjectDef<T>,
  ObjectInputType<T>
> {}
class ZodUnion<T extends [ZodTypeAny, ...ZodTypeAny[]]> extends ZodType<
  T[number]['_output'],
  ZodUnionDef<T>,
  T[number]['_input']
> {}
class ZodOptional<T extends ZodTypeAny> extends ZodType<
  T['_output'] | undefined,
  ZodOptionalDef<T>,
  T['_input'] | undefined
> {}
class ZodNullable<T extends ZodTypeAny> extends ZodType<
  T['_output'] | null,
  ZodNullableDef<T>,
  T['_input'] | null
> {}
class ZodDefault<T extends ZodTypeAny> extends ZodType<
  T['_output'],
  ZodDefaultDef<T>,
  T['_input'] | undefined
> {}
class ZodLiteral<T extends Primitive> extends ZodType<T, ZodLiteralDef<T>, T> {}
class ZodEnum<T extends [string, ...string[]]> extends ZodType<
  T[number],
  ZodEnumDef<T>,
  T[number]
> {}
class ZodEffects<T extends ZodTypeAny, Output = T['_output']> extends ZodType<
  Output,
  ZodEffectsDef<T, Output>,
  T['_input']
> {}
class ZodPromise<T extends ZodTypeAny> extends ZodType<
  Promise<T['_output']>,
  ZodPromiseDef<T>,
  Promise<T['_input']>
> {}
// ... and more schema class types

// Error map type
type ErrorMapFunction = (issue: ZodIssueOptionalMessage, ctx: ErrorMapCtx) => {
  message: string;
};

interface ErrorMapCtx {
  defaultError: string;
  data: any;
}

// Issue data for addIssue in superRefine
type IssueData =
  | {
      code: 'invalid_type';
      expected: ZodParsedType;
      received: ZodParsedType;
      message?: string;
    }
  | {
      code: 'too_big';
      maximum: number | bigint;
      inclusive: boolean;
      type: 'array' | 'string' | 'number' | 'bigint' | 'set' | 'date';
      message?: string;
    }
  | {
      code: 'too_small';
      minimum: number | bigint;
      inclusive: boolean;
      type: 'array' | 'string' | 'number' | 'bigint' | 'set' | 'date';
      message?: string;
    }
  | {
      code: 'invalid_format';
      format: string;
      message?: string;
    }
  | {
      code: 'custom';
      message?: string;
      params?: Record<string, any>;
    };

type ZodParsedType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'null'
  | 'array'
  | 'object'
  | 'function'
  | 'date'
  | 'map'
  | 'set'
  | 'promise'
  | 'unknown'
  | 'never'
  | 'void'
  | 'nan';

// Shape and object helpers
type ZodRawShape = { [k: string]: ZodTypeAny };
type ObjectInputType<T extends ZodRawShape> = {
  [k in keyof T]: T[k]['_input'];
};
type ObjectOutputType<T extends ZodRawShape> = {
  [k in keyof T]: T[k]['_output'];
};
```
