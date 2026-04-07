# Literals

Literal value validation for exact value matching with static types and primitive literal schemas.

## Capabilities

### Literal Schema

Creates a schema that validates an exact literal value with strong type inference.

```typescript { .api }
/**
 * Create a literal value validator
 * @param value - The exact primitive value to match
 * @returns Literal schema that only accepts the specified value
 */
function literal<T extends Primitive>(value: T): ZodLiteral<T>;

type Primitive = string | number | boolean | null | undefined | symbol | bigint;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// String literal
const Hello = z.literal('hello');
Hello.parse('hello'); // => "hello"
// Hello.parse('world'); // throws error

// Number literal
const FortyTwo = z.literal(42);
FortyTwo.parse(42); // => 42
// FortyTwo.parse(43); // throws error

// Boolean literal
const TrueOnly = z.literal(true);
TrueOnly.parse(true); // => true
// TrueOnly.parse(false); // throws error

// Null literal
const NullOnly = z.literal(null);
NullOnly.parse(null); // => null

// BigInt literal
const BigIntLiteral = z.literal(9007199254740991n);
BigIntLiteral.parse(9007199254740991n); // => 9007199254740991n

// Use in type inference
type HelloType = z.infer<typeof Hello>; // "hello"
type FortyTwoType = z.infer<typeof FortyTwo>; // 42
```

### Combining Literals with Unions

Literal schemas are commonly combined with unions to create enumeration-like types:

```typescript
import * as z from 'zod';

// Status enum using literals
const Status = z.union([
  z.literal('pending'),
  z.literal('active'),
  z.literal('completed'),
]);
type Status = z.infer<typeof Status>; // "pending" | "active" | "completed"
Status.parse('active'); // => "active"

// Better approach using z.enum() for string literals
const BetterStatus = z.enum(['pending', 'active', 'completed']);

// Mixed literal types
const MixedLiteral = z.union([
  z.literal('auto'),
  z.literal(0),
  z.literal(false),
]);
type MixedLiteral = z.infer<typeof MixedLiteral>; // "auto" | 0 | false
```

### Discriminated Unions with Literals

Literal schemas are essential for discriminated unions:

```typescript
import * as z from 'zod';

// Discriminated union using literal discriminators
const Shape = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('circle'),
    radius: z.number(),
  }),
  z.object({
    kind: z.literal('rectangle'),
    width: z.number(),
    height: z.number(),
  }),
]);

type Shape = z.infer<typeof Shape>;
// { kind: "circle"; radius: number } | { kind: "rectangle"; width: number; height: number }

Shape.parse({ kind: 'circle', radius: 5 });
Shape.parse({ kind: 'rectangle', width: 10, height: 20 });
```

### Null Literal

Creates a schema that only accepts null values.

```typescript { .api }
/**
 * Create a null literal validator
 * @returns Schema that only accepts null
 */
function null_(): ZodNull;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const NullSchema = z.null();
NullSchema.parse(null); // => null
// NullSchema.parse(undefined); // throws error

// Often used with nullable modifier
const NullableString = z.string().nullable();
type NullableString = z.infer<typeof NullableString>; // string | null
```

### Undefined Literal

Creates a schema that only accepts undefined values.

```typescript { .api }
/**
 * Create an undefined literal validator
 * @returns Schema that only accepts undefined
 */
function undefined_(): ZodUndefined;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UndefinedSchema = z.undefined();
UndefinedSchema.parse(undefined); // => undefined
// UndefinedSchema.parse(null); // throws error

// Often used with optional modifier
const OptionalString = z.string().optional();
type OptionalString = z.infer<typeof OptionalString>; // string | undefined
```

### Void Literal

Creates a schema that accepts undefined but with void type semantics.

```typescript { .api }
/**
 * Create a void literal validator (accepts undefined)
 * @returns Schema that accepts undefined with void type
 */
function void_(): ZodVoid;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const VoidSchema = z.void();
VoidSchema.parse(undefined); // => undefined (typed as void)

// Useful for function return types
const VoidFunction = z._function({
  args: z.tuple([z.string()]),
  returns: z.void(),
});
```

### Symbol Literals

Symbols can be used as literals but require specific symbol instances:

```typescript
import * as z from 'zod';

const mySymbol = Symbol('unique');
const SymbolLiteral = z.literal(mySymbol);
SymbolLiteral.parse(mySymbol); // => Symbol(unique)
// SymbolLiteral.parse(Symbol('unique')); // throws error (different symbol instance)
```

### Literal Inference Patterns

Common patterns for working with literal types:

```typescript
import * as z from 'zod';

// Action type pattern
const Action = z.object({
  type: z.literal('UPDATE_USER'),
  payload: z.object({
    userId: z.string(),
    name: z.string(),
  }),
});

// API response status pattern
const SuccessResponse = z.object({
  success: z.literal(true),
  data: z.any(),
});

const ErrorResponse = z.object({
  success: z.literal(false),
  error: z.string(),
});

const APIResponse = z.union([SuccessResponse, ErrorResponse]);

// Type guard using literal
function isSuccess(response: z.infer<typeof APIResponse>): response is z.infer<typeof SuccessResponse> {
  return response.success === true;
}
```

## Literal Schema Instance Methods

All literal schemas support common schema methods:

```typescript { .api }
interface ZodLiteral<T extends Primitive> {
  // Parsing
  parse(data: unknown): T;
  safeParse(data: unknown): SafeParseReturnType<unknown, T>;

  // Modifiers
  optional(): ZodOptional<ZodLiteral<T>>;
  nullable(): ZodNullable<ZodLiteral<T>>;
  default(value: T): ZodDefault<ZodLiteral<T>>;

  // Refinement and transformation
  refine(
    check: (data: T) => boolean | Promise<boolean>,
    params?: RefineParams
  ): ZodEffects<ZodLiteral<T>>;
  transform<NewOut>(
    transform: (data: T) => NewOut | Promise<NewOut>
  ): ZodEffects<ZodLiteral<T>, NewOut>;

  // Metadata
  describe(description: string): ZodLiteral<T>;
  meta(metadata: any): ZodLiteral<T>;
}
```

## Types

```typescript { .api }
type Primitive = string | number | boolean | null | undefined | symbol | bigint;

class ZodLiteral<T extends Primitive> {
  readonly _type: 'ZodLiteral';
  readonly value: T;
}

class ZodNull {
  readonly _type: 'ZodNull';
}

class ZodUndefined {
  readonly _type: 'ZodUndefined';
}

class ZodVoid {
  readonly _type: 'ZodVoid';
}

interface RefineParams {
  message?: string;
  path?: (string | number)[];
}

type SafeParseReturnType<Input, Output> =
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> };

class ZodError<T = any> extends Error {
  issues: ZodIssue[];
}
```
