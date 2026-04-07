# Quick Start Guide

This guide will help you get started with Zod in minutes.

## Installation

```bash
npm install zod
```

## Basic Usage

### 1. Import Zod

```typescript
import * as z from 'zod';
// or
import { z } from 'zod';
```

### 2. Define a Schema

```typescript
const UserSchema = z.object({
  name: z.string(),
  age: z.number().int().positive(),
  email: z.string().email(),
});
```

### 3. Validate Data

```typescript
// Throws ZodError on invalid data
const user = UserSchema.parse({
  name: 'Alice',
  age: 30,
  email: 'alice@example.com',
});

// Returns result object (doesn't throw)
const result = UserSchema.safeParse({
  name: 'Bob',
  age: 25,
  email: 'bob@example.com',
});

if (result.success) {
  console.log(result.data); // Validated data
} else {
  console.error(result.error.issues); // Validation errors
}
```

### 4. Extract TypeScript Types

```typescript
type User = z.infer<typeof UserSchema>;
// { name: string; age: number; email: string }
```

## Common Patterns

### String Validation

```typescript
const UsernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');
```

### Number Validation

```typescript
const AgeSchema = z.number()
  .int('Age must be an integer')
  .min(0, 'Age cannot be negative')
  .max(120, 'Age cannot exceed 120');
```

### Optional Fields

```typescript
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  nickname: z.string().optional(), // Optional field
  middleName: z.string().nullable(), // Can be null
  bio: z.string().nullish(), // Can be null or undefined
});
```

### Default Values

```typescript
const ConfigSchema = z.object({
  port: z.number().default(3000),
  host: z.string().default('localhost'),
  debug: z.boolean().default(false),
});
```

### Arrays

```typescript
const TagsSchema = z.array(z.string())
  .min(1, 'At least one tag is required')
  .max(10, 'Maximum 10 tags allowed');
```

### Nested Objects

```typescript
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
});

const UserSchema = z.object({
  name: z.string(),
  address: AddressSchema,
});
```

### Enums

```typescript
const StatusSchema = z.enum(['pending', 'active', 'completed']);
// or
const StatusSchema = z.union([
  z.literal('pending'),
  z.literal('active'),
  z.literal('completed'),
]);
```

## Error Handling

### Try-Catch Pattern

```typescript
try {
  const data = schema.parse(input);
  // Use validated data
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
    console.error('Validation failed:', error.issues);
  }
}
```

### Safe Parse Pattern (Recommended)

```typescript
const result = schema.safeParse(input);

if (result.success) {
  // TypeScript knows result.data is valid
  console.log(result.data);
} else {
  // TypeScript knows result.error exists
  console.error(result.error.issues);
}
```

### Error Formatting

```typescript
const result = schema.safeParse(input);

if (!result.success) {
  // Format as nested object
  const formatted = result.error.format();
  // { name: { _errors: ['Required'] }, email: { _errors: ['Invalid email'] } }
  
  // Flatten to field errors
  const flattened = result.error.flatten();
  // { fieldErrors: { name: ['Required'], email: ['Invalid email'] }, formErrors: [] }
}
```

## Custom Validation

### Refine

```typescript
const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (val) => /[A-Z]/.test(val),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (val) => /[0-9]/.test(val),
    'Password must contain at least one number'
  );
```

### Super Refine (Multiple Issues)

```typescript
const PasswordSchema = z.string().superRefine((password, ctx) => {
  if (password.length < 8) {
    ctx.addIssue({
      code: 'too_small',
      minimum: 8,
      type: 'string',
      inclusive: true,
      message: 'Password must be at least 8 characters',
    });
  }
  if (!/[A-Z]/.test(password)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Password must contain uppercase letter',
    });
  }
});
```

### Transform

```typescript
const StringToNumber = z.string().transform((val) => parseInt(val, 10));

const TrimmedEmail = z.string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(z.string().email());
```

## Type Coercion

For form data and URL parameters that come as strings:

```typescript
const FormSchema = z.object({
  name: z.coerce.string(),
  age: z.coerce.number().int().min(0),
  isActive: z.coerce.boolean(),
  birthDate: z.coerce.date(),
});
```

## Next Steps

- See [Real-World Scenarios](../examples/real-world-scenarios.md) for comprehensive examples
- Check [Edge Cases](../examples/edge-cases.md) for advanced scenarios
- Explore the [API Reference](../reference/index.md) for complete documentation

