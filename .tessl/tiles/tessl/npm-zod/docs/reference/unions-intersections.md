# Unions and Intersections

Combine multiple schemas using union, discriminated union, exclusive union (xor), and intersection operations for flexible type composition.

## Capabilities

### Union Schema

Creates a schema that validates against one of multiple possible schemas.

```typescript { .api }
/**
 * Create a union schema that matches any of the provided schemas
 * @param schemas - Array of schemas (at least 2 required)
 * @returns Union schema that validates against any option
 */
function union<T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(
  schemas: T
): ZodUnion<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Simple union
const StringOrNumber = z.union([z.string(), z.number()]);
type StringOrNumber = z.infer<typeof StringOrNumber>; // string | number
StringOrNumber.parse('hello'); // => "hello"
StringOrNumber.parse(42); // => 42

// Multiple types
const MultiType = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);
type MultiType = z.infer<typeof MultiType>; // string | number | boolean | null

// Complex union
const Result = z.union([
  z.object({ success: z.literal(true), data: z.any() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

// Access union options
const options = StringOrNumber.options; // [ZodString, ZodNumber]
```

### Union Alternative Syntax

Unions can also be created using the `.or()` method:

```typescript
import * as z from 'zod';

const StringOrNumber = z.string().or(z.number());
const StringOrNumberOrBoolean = z.string().or(z.number()).or(z.boolean());

// Equivalent to:
const Same = z.union([z.string(), z.number(), z.boolean()]);
```

### Discriminated Union Schema

Creates a union optimized for discriminated union types with a shared discriminator key for better performance and error messages.

```typescript { .api }
/**
 * Create a discriminated union schema with shared discriminator
 * @param discriminator - The discriminator key name
 * @param options - Array of object schemas with literal discriminator values
 * @returns Discriminated union schema with optimized validation
 */
function discriminatedUnion<
  Discriminator extends string,
  Options extends ZodDiscriminatedUnionOption<Discriminator>[]
>(
  discriminator: Discriminator,
  options: Options
): ZodDiscriminatedUnion<Discriminator, Options>;

type ZodDiscriminatedUnionOption<Discriminator extends string> = ZodObject<
  { [K in Discriminator]: ZodLiteral<any> } & ZodRawShape
>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Shape discriminated by 'kind'
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
  z.object({
    kind: z.literal('triangle'),
    base: z.number(),
    height: z.number(),
  }),
]);

type Shape = z.infer<typeof Shape>;
// { kind: "circle"; radius: number } |
// { kind: "rectangle"; width: number; height: number } |
// { kind: "triangle"; base: number; height: number }

Shape.parse({ kind: 'circle', radius: 5 }); // => valid
Shape.parse({ kind: 'rectangle', width: 10, height: 20 }); // => valid

// API response pattern
const APIResponse = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('success'),
    data: z.any(),
    timestamp: z.string(),
  }),
  z.object({
    status: z.literal('error'),
    error: z.string(),
    code: z.number(),
  }),
  z.object({
    status: z.literal('pending'),
    requestId: z.string(),
  }),
]);

// Event pattern
const Event = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('click'),
    x: z.number(),
    y: z.number(),
  }),
  z.object({
    type: z.literal('keypress'),
    key: z.string(),
  }),
]);
```

### Exclusive Union (XOR) Schema

Creates a schema that validates against exactly one of the provided schemas (mutual exclusion).

```typescript { .api }
/**
 * Create an exclusive union that matches exactly one schema
 * @param schemas - Array of schemas (at least 2 required)
 * @returns XOR schema that validates against exactly one option
 */
function xor<T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(
  schemas: T
): ZodXor<T>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Exclusive choice between authentication methods
const AuthMethod = z.xor([
  z.object({ username: z.string(), password: z.string() }),
  z.object({ token: z.string() }),
  z.object({ apiKey: z.string() }),
]);

// Valid: exactly one method
AuthMethod.parse({ username: 'user', password: 'pass' }); // => valid
AuthMethod.parse({ token: 'abc123' }); // => valid

// Invalid: multiple methods
// AuthMethod.parse({ username: 'user', password: 'pass', token: 'abc' }); // throws error

// Invalid: no methods
// AuthMethod.parse({}); // throws error

// Configuration with mutually exclusive options
const Config = z.xor([
  z.object({ mode: z.literal('development'), debugLevel: z.number() }),
  z.object({ mode: z.literal('production'), optimizationLevel: z.number() }),
]);
```

### Intersection Schema

Creates a schema that validates against both of two schemas (AND operation).

```typescript { .api }
/**
 * Create an intersection schema that validates against both schemas
 * @param left - First schema
 * @param right - Second schema
 * @returns Intersection schema requiring both to validate
 */
function intersection<A extends ZodTypeAny, B extends ZodTypeAny>(
  left: A,
  right: B
): ZodIntersection<A, B>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Merge object types
const HasId = z.object({ id: z.string() });
const HasTimestamps = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

const Entity = z.intersection(HasId, HasTimestamps);
type Entity = z.infer<typeof Entity>;
// { id: string; createdAt: Date; updatedAt: Date }

Entity.parse({
  id: '123',
  createdAt: new Date(),
  updatedAt: new Date(),
}); // => valid

// Combine constraints
const PositiveNumber = z.number().positive();
const Integer = z.number().int();
const PositiveInteger = z.intersection(PositiveNumber, Integer);

// Using .and() method (alternative syntax)
const SameAsAbove = HasId.and(HasTimestamps);

// Multiple intersections
const User = z.object({ name: z.string() });
const Timestamps = z.object({ createdAt: z.date(), updatedAt: z.date() });
const Versioned = z.object({ version: z.number() });

const VersionedUser = User.and(Timestamps).and(Versioned);
type VersionedUser = z.infer<typeof VersionedUser>;
// { name: string; createdAt: Date; updatedAt: Date; version: number }
```

### Intersection Alternative Syntax

Intersections can be created using the `.and()` method:

```typescript
import * as z from 'zod';

const Person = z.object({ name: z.string() });
const Employee = z.object({ employeeId: z.string() });

const PersonEmployee = Person.and(Employee);

// Equivalent to:
const Same = z.intersection(Person, Employee);
```

### Union with Literal Types

Common pattern for creating discriminated unions using literal types:

```typescript
import * as z from 'zod';

// Status enum using union of literals
const Status = z.union([
  z.literal('pending'),
  z.literal('active'),
  z.literal('completed'),
  z.literal('cancelled'),
]);

// Better alternative: use z.enum()
const BetterStatus = z.enum(['pending', 'active', 'completed', 'cancelled']);

// Complex discriminated type
const Action = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('CREATE'),
    payload: z.object({ name: z.string() }),
  }),
  z.object({
    type: z.literal('UPDATE'),
    payload: z.object({ id: z.string(), name: z.string() }),
  }),
  z.object({
    type: z.literal('DELETE'),
    payload: z.object({ id: z.string() }),
  }),
]);
```

### Nested Unions and Intersections

Complex compositions combining unions and intersections:

```typescript
import * as z from 'zod';

// Union of intersections
const BaseEntity = z.object({ id: z.string() });
const Timestamps = z.object({ createdAt: z.date(), updatedAt: z.date() });

const User = z.intersection(
  BaseEntity,
  z.object({ type: z.literal('user'), name: z.string() })
);

const Admin = z.intersection(
  BaseEntity,
  z.object({ type: z.literal('admin'), name: z.string(), permissions: z.array(z.string()) })
);

const Account = z.union([User, Admin]).and(Timestamps);

// Intersection of unions (less common)
const StringOrNumber = z.union([z.string(), z.number()]);
const NumberOrBoolean = z.union([z.number(), z.boolean()]);
const OnlyNumber = z.intersection(StringOrNumber, NumberOrBoolean);
// This effectively results in z.number() since it's the only common type
```

### Type Guards with Unions

Using parsed unions with TypeScript type guards:

```typescript
import * as z from 'zod';

const Response = z.union([
  z.object({ success: z.literal(true), data: z.any() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

type Response = z.infer<typeof Response>;

function handleResponse(response: Response) {
  if (response.success) {
    // TypeScript knows this is the success case
    console.log(response.data);
  } else {
    // TypeScript knows this is the error case
    console.error(response.error);
  }
}

// With discriminated union
const Shape = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('circle'), radius: z.number() }),
  z.object({ kind: z.literal('rectangle'), width: z.number(), height: z.number() }),
]);

type Shape = z.infer<typeof Shape>;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
  }
}
```

## Union Schema Methods

Union schemas provide access to their options:

```typescript { .api }
interface ZodUnion<T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]> {
  readonly options: T;

  parse(data: unknown): T[number]['_output'];
  safeParse(data: unknown): SafeParseReturnType<unknown, T[number]['_output']>;

  // Can use .or() to add more options
  or<U extends ZodTypeAny>(schema: U): ZodUnion<[...T, U]>;
}
```

## Intersection Schema Methods

Intersection schemas can be further intersected:

```typescript { .api }
interface ZodIntersection<A extends ZodTypeAny, B extends ZodTypeAny> {
  readonly left: A;
  readonly right: B;

  parse(data: unknown): A['_output'] & B['_output'];
  safeParse(data: unknown): SafeParseReturnType<unknown, A['_output'] & B['_output']>;

  // Can use .and() to add more intersections
  and<U extends ZodTypeAny>(schema: U): ZodIntersection<ZodIntersection<A, B>, U>;
}
```

## Types

```typescript { .api }
type ZodTypeAny = ZodType<any, any, any>;
type ZodRawShape = { [k: string]: ZodTypeAny };

class ZodUnion<T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]> {
  readonly _type: 'ZodUnion';
  readonly options: T;
}

class ZodDiscriminatedUnion<
  Discriminator extends string,
  Options extends ZodDiscriminatedUnionOption<Discriminator>[]
> {
  readonly _type: 'ZodDiscriminatedUnion';
  readonly discriminator: Discriminator;
  readonly options: Options;
}

class ZodXor<T extends [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]> {
  readonly _type: 'ZodXor';
  readonly options: T;
}

class ZodIntersection<A extends ZodTypeAny, B extends ZodTypeAny> {
  readonly _type: 'ZodIntersection';
  readonly left: A;
  readonly right: B;
}

type SafeParseReturnType<Input, Output> =
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> };

class ZodError<T = any> extends Error {
  issues: ZodIssue[];
}
```
