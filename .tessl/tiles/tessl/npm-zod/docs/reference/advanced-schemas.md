# Advanced Schemas

Specialized schemas for functions, promises, lazy evaluation, template literals, files, and JSON data with comprehensive type safety.

## Capabilities

### Function Schema

Creates a schema that validates function signatures with typed parameters and return values.

```typescript { .api }
/**
 * Create a function schema validator
 * @param params - Optional function parameters and return type
 * @returns Function schema with typed signature
 */
function _function<
  Args extends ZodTuple<any, any> = ZodTuple<[], null>,
  Returns extends ZodTypeAny = ZodUnknown
>(params?: FunctionParams<Args, Returns>): ZodFunction<Args, Returns>;

interface FunctionParams<Args, Returns> {
  args?: Args;
  returns?: Returns;
  errorMap?: ErrorMapFunction;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic function schema
const FunctionSchema = z._function();
FunctionSchema.parse(() => {}); // => valid
FunctionSchema.parse((x: number) => x * 2); // => valid

// Function with typed arguments
const AddFunction = z._function({
  args: z.tuple([z.number(), z.number()]),
  returns: z.number(),
});

// Implement a validated function
const add = AddFunction.implement((a, b) => {
  return a + b; // TypeScript knows a and b are numbers
});

add(5, 3); // => 8
// add('5', 3); // TypeScript error

// Validate an existing function
const multiply = (a: number, b: number) => a * b;
AddFunction.validate(multiply); // => validated function

// Multiple arguments
const GreetFunction = z._function({
  args: z.tuple([z.string(), z.number()]),
  returns: z.string(),
});

const greet = GreetFunction.implement((name, age) => {
  return `Hello ${name}, you are ${age} years old`;
});

// Optional arguments with rest
const VarArgsFunction = z._function({
  args: z.tuple([z.string()], z.number()),
  returns: z.string(),
});

const format = VarArgsFunction.implement((template, ...values) => {
  return template + values.join(',');
});

// Async function
const AsyncFunction = z._function({
  args: z.tuple([z.string()]),
  returns: z.promise(z.object({ data: z.string() })),
});

const fetchData = AsyncFunction.implement(async (url) => {
  const response = await fetch(url);
  const data = await response.text();
  return { data };
});
```

### Function Schema Methods

Function schemas provide methods for implementation and validation:

```typescript { .api }
interface ZodFunction<Args extends ZodTuple<any, any>, Returns extends ZodTypeAny> {
  readonly args: Args;
  readonly returns: Returns;

  /**
   * Implement a function with validated parameters and return type
   */
  implement<F extends (...args: any[]) => any>(
    fn: F
  ): (...args: Parameters<F>) => ReturnType<F>;

  /**
   * Validate an existing function
   */
  validate<F extends (...args: any[]) => any>(fn: F): F;

  /**
   * Get the parameters schema
   */
  parameters(): Args;

  /**
   * Get the return type schema
   */
  returnType(): Returns;

  parse(data: unknown): (...args: Args['_output']) => Returns['_output'];
  safeParse(data: unknown): SafeParseReturnType<unknown, (...args: Args['_output']) => Returns['_output']>;
}
```

### Promise Schema

Creates a schema that validates promises with typed resolution values.

```typescript { .api }
/**
 * Create a promise schema validator
 * @param schema - Schema for the promise resolution value
 * @returns Promise schema
 */
function promise<T extends ZodTypeAny>(schema: T): ZodPromise<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic promise
const StringPromise = z.promise(z.string());
type StringPromise = z.infer<typeof StringPromise>; // Promise<string>

await StringPromise.parse(Promise.resolve('hello')); // => "hello"

// Promise of object
const UserPromise = z.promise(
  z.object({
    id: z.string(),
    name: z.string(),
  })
);

type UserPromise = z.infer<typeof UserPromise>;
// Promise<{ id: string; name: string }>

// Async function return type
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

const FetchUserSchema = z._function({
  args: z.tuple([z.string()]),
  returns: UserPromise,
});

// Nested promises
const NestedPromise = z.promise(z.promise(z.number()));

// Promise array
const PromiseArray = z.array(z.promise(z.string()));
```

### Lazy Schema

Creates a schema with lazy evaluation for recursive or circular structures.

```typescript { .api }
/**
 * Create a lazy schema for recursive structures
 * @param getter - Function that returns the schema
 * @returns Lazy schema
 */
function lazy<T extends ZodTypeAny>(getter: () => T): ZodLazy<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Recursive data structure
interface Category {
  name: string;
  subcategories: Category[];
}

const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(CategorySchema),
  })
);

CategorySchema.parse({
  name: 'Electronics',
  subcategories: [
    {
      name: 'Computers',
      subcategories: [
        { name: 'Laptops', subcategories: [] },
        { name: 'Desktops', subcategories: [] },
      ],
    },
  ],
});

// Linked list
interface LinkedListNode {
  value: number;
  next: LinkedListNode | null;
}

const LinkedListSchema: z.ZodType<LinkedListNode> = z.lazy(() =>
  z.object({
    value: z.number(),
    next: z.union([LinkedListSchema, z.null()]),
  })
);

// Tree structure
interface TreeNode {
  value: string;
  children: TreeNode[];
}

const TreeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    value: z.string(),
    children: z.array(TreeSchema),
  })
);

// JSON schema (recursive)
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ])
);
```

### Template Literal Schema

Creates a schema that validates template literal types with typed parts.

```typescript { .api }
/**
 * Create a template literal schema
 * @param parts - Array of literal, string, or number schemas
 * @returns Template literal schema
 */
function templateLiteral<
  T extends [ZodTemplateLiteralPart, ...ZodTemplateLiteralPart[]]
>(parts: T): ZodTemplateLiteral<T>;

type ZodTemplateLiteralPart = ZodLiteral<string> | ZodString | ZodNumber;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// URL pattern
const UrlPattern = z.templateLiteral([
  z.literal('https://'),
  z.string(),
  z.literal('.com'),
]);

type UrlPattern = z.infer<typeof UrlPattern>; // `https://${string}.com`
UrlPattern.parse('https://example.com'); // => valid
UrlPattern.parse('https://test.com'); // => valid

// ID pattern
const IdPattern = z.templateLiteral([
  z.literal('user_'),
  z.number(),
]);

type IdPattern = z.infer<typeof IdPattern>; // `user_${number}`
IdPattern.parse('user_123'); // => valid

// Complex pattern
const PathPattern = z.templateLiteral([
  z.literal('/api/'),
  z.string(),
  z.literal('/'),
  z.number(),
]);

type PathPattern = z.infer<typeof PathPattern>; // `/api/${string}/${number}`
PathPattern.parse('/api/users/42'); // => valid

// Version string
const VersionPattern = z.templateLiteral([
  z.literal('v'),
  z.number(),
  z.literal('.'),
  z.number(),
  z.literal('.'),
  z.number(),
]);

type VersionPattern = z.infer<typeof VersionPattern>; // `v${number}.${number}.${number}`
VersionPattern.parse('v1.2.3'); // => valid
```

### File Schema

Creates a schema that validates File objects with size and type constraints.

```typescript { .api }
/**
 * Create a File object validator
 * @param params - Optional configuration for error handling and metadata
 * @returns File schema with chainable validation methods
 */
function file(params?: FileParams): ZodFile;

interface FileParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic file schema
const FileSchema = z.file();
FileSchema.parse(new File(['content'], 'test.txt')); // => valid

// File with MIME type
const ImageFile = z.file().mimeType('image/jpeg');
const AnyImage = z.file().mimeType(/^image\//);

// File with size constraints
const SmallFile = z.file().maxSize(1024 * 1024); // 1MB max
const LargeFile = z.file().minSize(1024).maxSize(10 * 1024 * 1024); // 1KB-10MB

// Combined constraints
const ProfilePicture = z.file()
  .mimeType(/^image\/(jpeg|png|webp)$/)
  .maxSize(5 * 1024 * 1024) // 5MB
  .refine((file) => file.name.length < 100, 'Filename too long');

// Multiple file types
const DocumentFile = z.file().mimeType(/^(application\/pdf|application\/msword)/);

// Form file upload
const UploadSchema = z.object({
  file: z.file().maxSize(10 * 1024 * 1024),
  name: z.string(),
  description: z.string().optional(),
});
```

### File Schema Methods

File schemas support MIME type and size validation:

```typescript { .api }
interface ZodFile {
  /**
   * Validate MIME type
   */
  mimeType(type: string | RegExp): ZodFile;

  /**
   * Maximum file size in bytes
   */
  maxSize(bytes: number, message?: string): ZodFile;

  /**
   * Minimum file size in bytes
   */
  minSize(bytes: number, message?: string): ZodFile;

  parse(data: unknown): File;
  safeParse(data: unknown): SafeParseReturnType<unknown, File>;
}
```

### JSON Schema

Creates a schema that validates JSON-compatible data structures.

```typescript { .api }
/**
 * Create a JSON data validator
 * @param params - Optional configuration for error handling and metadata
 * @returns JSON schema for JSON-compatible types
 */
function json(params?: JsonParams): ZodJson;

interface JsonParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic JSON validation
const JsonSchema = z.json();
JsonSchema.parse({ name: 'Alice', age: 30 }); // => valid
JsonSchema.parse([1, 2, 3]); // => valid
JsonSchema.parse('string'); // => valid
JsonSchema.parse(42); // => valid
JsonSchema.parse(true); // => valid
JsonSchema.parse(null); // => valid

// JSON schema rejects non-JSON types
// JsonSchema.parse(undefined); // throws
// JsonSchema.parse(Symbol('test')); // throws
// JsonSchema.parse(() => {}); // throws
// JsonSchema.parse(new Date()); // throws

// Typed JSON
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

// Config file schema
const ConfigSchema = z.json().pipe(
  z.object({
    version: z.string(),
    settings: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  })
);

// API response
const ApiResponseSchema = z.json().pipe(
  z.object({
    status: z.number(),
    data: z.any(),
  })
);

// Parse JSON string
const JsonStringSchema = z.string().pipe(
  z.string().transform((s) => JSON.parse(s)),
  z.json()
);
```

## Types

```typescript { .api }
type ZodTypeAny = ZodType<any, any, any>;

class ZodFunction<
  Args extends ZodTuple<any, any> = ZodTuple<[], null>,
  Returns extends ZodTypeAny = ZodUnknown
> {
  readonly _type: 'ZodFunction';
  readonly args: Args;
  readonly returns: Returns;
}

class ZodPromise<T extends ZodTypeAny> {
  readonly _type: 'ZodPromise';
  readonly schema: T;
}

class ZodLazy<T extends ZodTypeAny> {
  readonly _type: 'ZodLazy';
  readonly getter: () => T;
}

class ZodTemplateLiteral<T extends [ZodTemplateLiteralPart, ...ZodTemplateLiteralPart[]]> {
  readonly _type: 'ZodTemplateLiteral';
  readonly parts: T;
}

class ZodFile {
  readonly _type: 'ZodFile';
}

class ZodJson {
  readonly _type: 'ZodJson';
}

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
