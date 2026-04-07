# Zod

TypeScript-first schema validation library with static type inference. Define schemas, validate data, and get type safety with zero dependencies.

## Quick Start

```typescript
import * as z from 'zod';

// Define a schema
const User = z.object({
  name: z.string(),
  age: z.number().int().positive(),
  email: z.string().email(),
});

// Parse and validate
const user = User.parse({ name: 'Alice', age: 30, email: 'alice@example.com' });

// Safe parsing (no throw)
const result = User.safeParse({ name: 'Bob', age: 25 });
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error.issues);
}

// Type inference
type User = z.infer<typeof User>;
```

## Core Concepts

- **Schemas**: Immutable validation rules created with factory functions (`z.string()`, `z.object()`, etc.)
- **Parsing**: Validate data with `parse()` (throws) or `safeParse()` (returns result)
- **Type Inference**: Extract TypeScript types from schemas using `z.infer<T>`
- **Method Chaining**: Chain validators and modifiers: `z.string().min(3).email()`
- **Transformations**: Transform validated data with `transform()` and `refine()`

## Quick Reference

### Primitive Schemas

```typescript { .api }
z.string()      // String validator
z.number()      // Number validator
z.boolean()     // Boolean validator
z.date()        // Date validator
z.bigint()      // BigInt validator
z.null()        // Null validator
z.undefined()   // Undefined validator
z.any()         // Accepts any value
z.unknown()     // Unknown type
z.never()       // Always fails
```

### Complex Schemas

```typescript { .api }
z.object({ ... })           // Object schema
z.array(schema)              // Array schema
z.tuple([...])              // Tuple schema
z.record(key, value)        // Record/dictionary
z.map(key, value)           // Map schema
z.set(value)                // Set schema
z.enum([...])               // Enum schema
z.union([...])              // Union schema
z.intersection(a, b)        // Intersection schema
```

### Common Modifiers

```typescript { .api }
.optional()      // Make optional
.nullable()      // Accept null
.nullish()       // Accept null or undefined
.default(value)  // Provide default
.catch(value)    // Catch errors
.readonly()      // Make readonly
.brand<T>()      // Add type brand
```

### Parsing Methods

```typescript { .api }
schema.parse(data)              // Parse (throws on error)
schema.safeParse(data)          // Safe parse (returns result)
schema.parseAsync(data)         // Async parse
schema.safeParseAsync(data)     // Async safe parse
```

### Type Utilities

```typescript { .api }
z.infer<typeof schema>          // Extract output type
z.output<typeof schema>         // Extract output type (alias)
z.input<typeof schema>          // Extract input type
```

## Common Patterns

### Form Validation

```typescript
const FormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().min(18),
});

const result = FormSchema.safeParse(formData);
```

### API Request Validation

```typescript
const ApiRequest = z.object({
  userId: z.string().uuid(),
  action: z.enum(['create', 'update', 'delete']),
  data: z.record(z.string(), z.any()),
});
```

### Environment Variables

```typescript
const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535),
  DATABASE_URL: z.string().url(),
  DEBUG: z.coerce.boolean().default(false),
});

const env = EnvSchema.parse(process.env);
```

### Error Handling

```typescript
try {
  const data = schema.parse(input);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
    console.error(error.issues);
    console.error(error.format());
    console.error(error.flatten());
  }
}
```

## Documentation Structure

### Guides

- **[Quick Start Guide](./guides/quick-start.md)** - Step-by-step getting started tutorial

### Examples

- **[Real-World Scenarios](./examples/real-world-scenarios.md)** - Comprehensive usage examples
- **[Edge Cases](./examples/edge-cases.md)** - Advanced scenarios and corner cases

### Reference

- **[API Reference](./reference/index.md)** - Complete API documentation
- **[Primitives](./reference/primitives.md)** - Primitive schema types
- **[Complex Schemas](./reference/complex-schemas.md)** - Objects, arrays, tuples, etc.
- **[Schema Methods](./reference/schema-methods.md)** - Common schema methods
- **[Refinements & Transformations](./reference/refinements-transformations.md)** - Custom validation and transforms
- **[Modifiers](./reference/modifiers.md)** - Optional, nullable, default, etc.
- **[Unions & Intersections](./reference/unions-intersections.md)** - Schema composition
- **[String Formats](./reference/string-formats.md)** - Email, URL, UUID validators
- **[Error Handling](./reference/error-handling.md)** - Error types and formatting
- **[Coercion](./reference/coercion.md)** - Type coercion
- **[ISO DateTime](./reference/iso-datetime.md)** - ISO 8601 validators
- **[JSON Schema](./reference/json-schema.md)** - JSON Schema integration
- **[Localization](./reference/localization.md)** - Multi-language error messages
- **[Configuration](./reference/config-utilities.md)** - Global config and utilities
- **[Advanced Schemas](./reference/advanced-schemas.md)** - Functions, promises, lazy, etc.
- **[Pipeline & Codec](./reference/pipeline-codec.md)** - Transformation pipelines
- **[Check Functions](./reference/check-functions.md)** - Standalone validation functions
- **[Number Types](./reference/number-types.md)** - Specialized number validators
- **[Literals](./reference/literals.md)** - Literal value schemas

## Installation

```bash
npm install zod
```

## Package Information

- **Package**: `zod`
- **Type**: npm
- **Language**: TypeScript
- **Version**: 4.3.5

