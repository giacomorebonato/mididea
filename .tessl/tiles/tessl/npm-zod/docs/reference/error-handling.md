# Error Handling

Comprehensive error handling with ZodError class, issue types, and error formatting utilities for detailed validation feedback.

## Capabilities

### ZodError Class

Main error class containing validation issues with detailed information about what went wrong.

```typescript { .api }
/**
 * Zod validation error class
 */
class ZodError<T = any> extends Error {
  readonly issues: ZodIssue[];

  /**
   * Check if error has no issues
   */
  get isEmpty(): boolean;

  /**
   * Format error as nested object structure
   */
  format(): FormattedError<T>;

  /**
   * Flatten error to field-level errors
   */
  flatten<U = string>(): FlattenedError<T, U>;

  /**
   * Get string representation of error
   */
  toString(): string;

  /**
   * Create a new ZodError
   * @param issues - Array of validation issues
   */
  static create(issues: ZodIssue[]): ZodError;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UserSchema = z.object({
  name: z.string().min(3),
  age: z.number().int().min(18),
  email: z.string().email(),
});

try {
  UserSchema.parse({
    name: 'AB',
    age: 15,
    email: 'invalid-email',
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    // Access issues
    console.log(error.issues);
    // [
    //   {
    //     code: 'too_small',
    //     minimum: 3,
    //     path: ['name'],
    //     message: 'String must contain at least 3 character(s)',
    //   },
    //   {
    //     code: 'too_small',
    //     minimum: 18,
    //     path: ['age'],
    //     message: 'Number must be greater than or equal to 18',
    //   },
    //   {
    //     code: 'invalid_format',
    //     path: ['email'],
    //     message: 'Invalid email',
    //   }
    // ]

    // Check if empty
    console.log(error.isEmpty); // false

    // Format as nested structure
    const formatted = error.format();
    console.log(formatted.name?._errors); // ["String must contain at least 3 character(s)"]

    // Flatten to field errors
    const flattened = error.flatten();
    console.log(flattened.fieldErrors.name); // ["String must contain at least 3 character(s)"]

    // String representation
    console.log(error.toString());
  }
}
```

### Issue Types

All possible validation issue types with their specific properties.

```typescript { .api }
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

interface ZodInvalidTypeIssue extends ZodIssueBase {
  code: 'invalid_type';
  expected: ZodParsedType;
  received: ZodParsedType;
}

interface ZodTooBigIssue extends ZodIssueBase {
  code: 'too_big';
  maximum: number | bigint;
  inclusive: boolean;
  type: 'array' | 'string' | 'number' | 'bigint' | 'set' | 'date';
}

interface ZodTooSmallIssue extends ZodIssueBase {
  code: 'too_small';
  minimum: number | bigint;
  inclusive: boolean;
  type: 'array' | 'string' | 'number' | 'bigint' | 'set' | 'date';
}

interface ZodInvalidFormatIssue extends ZodIssueBase {
  code: 'invalid_format';
  format: string;
}

interface ZodNotMultipleOfIssue extends ZodIssueBase {
  code: 'not_multiple_of';
  multipleOf: number | bigint;
}

interface ZodUnrecognizedKeysIssue extends ZodIssueBase {
  code: 'unrecognized_keys';
  keys: string[];
}

interface ZodInvalidUnionIssue extends ZodIssueBase {
  code: 'invalid_union';
  unionErrors: ZodError[];
}

interface ZodInvalidKeyIssue extends ZodIssueBase {
  code: 'invalid_key';
}

interface ZodInvalidElementIssue extends ZodIssueBase {
  code: 'invalid_element';
}

interface ZodInvalidValueIssue extends ZodIssueBase {
  code: 'invalid_value';
}

interface ZodCustomIssue extends ZodIssueBase {
  code: 'custom';
  params?: Record<string, any>;
}

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
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const schema = z.number().min(10);

try {
  schema.parse(5);
} catch (error) {
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];

    if (issue.code === 'too_small') {
      console.log(`Minimum value: ${issue.minimum}`);
      console.log(`Type: ${issue.type}`);
      console.log(`Inclusive: ${issue.inclusive}`);
    }
  }
}
```

### Format Error

Formats error as nested object structure mirroring the data shape.

```typescript { .api }
/**
 * Format error as nested object structure
 * @param error - ZodError to format
 * @returns Formatted error structure
 */
function formatError<T>(error: ZodError<T>): FormattedError<T>;

interface FormattedError<T> {
  _errors: string[];
  [key: string]: FormattedError<any> | string[];
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UserSchema = z.object({
  name: z.string().min(3),
  address: z.object({
    street: z.string(),
    city: z.string(),
  }),
});

const result = UserSchema.safeParse({
  name: 'AB',
  address: { street: '', city: 'NYC' },
});

if (!result.success) {
  const formatted = z.formatError(result.error);
  // or: const formatted = result.error.format();

  console.log(formatted);
  // {
  //   _errors: [],
  //   name: { _errors: ['String must contain at least 3 character(s)'] },
  //   address: {
  //     _errors: [],
  //     street: { _errors: ['Required'] }
  //   }
  // }

  // Access specific field errors
  console.log(formatted.name?._errors); // ["String must contain at least 3 character(s)"]
  console.log(formatted.address?.street?._errors); // ["Required"]
}
```

### Flatten Error

Flattens error to field-level errors, useful for form validation.

```typescript { .api }
/**
 * Flatten error to field-level errors
 * @param error - ZodError to flatten
 * @returns Flattened error with form and field errors
 */
function flattenError<T>(error: ZodError<T>): FlattenedError<T>;

interface FlattenedError<T, U = string> {
  formErrors: U[];
  fieldErrors: { [P in keyof T]?: U[] };
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const FormSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  age: z.number().min(18),
});

const result = FormSchema.safeParse({
  name: 'AB',
  email: 'invalid',
  age: 15,
});

if (!result.success) {
  const flattened = z.flattenError(result.error);
  // or: const flattened = result.error.flatten();

  console.log(flattened);
  // {
  //   formErrors: [],
  //   fieldErrors: {
  //     name: ['String must contain at least 3 character(s)'],
  //     email: ['Invalid email'],
  //     age: ['Number must be greater than or equal to 18']
  //   }
  // }

  // Use in form error display
  const nameErrors = flattened.fieldErrors.name || [];
  const emailErrors = flattened.fieldErrors.email || [];
}
```

### Treeify Error

Converts error to tree structure with nested errors and children.

```typescript { .api }
/**
 * Convert error to tree structure
 * @param error - ZodError to treeify
 * @returns Tree-structured error
 */
function treeifyError<T>(error: ZodError<T>): TreeError<T>;

interface TreeError<T> {
  errors: string[];
  children: { [key: string]: TreeError<any> };
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Schema = z.object({
  user: z.object({
    profile: z.object({
      name: z.string().min(3),
    }),
  }),
});

const result = Schema.safeParse({
  user: { profile: { name: 'AB' } },
});

if (!result.success) {
  const tree = z.treeifyError(result.error);

  console.log(tree);
  // {
  //   errors: [],
  //   children: {
  //     user: {
  //       errors: [],
  //       children: {
  //         profile: {
  //           errors: [],
  //           children: {
  //             name: {
  //               errors: ['String must contain at least 3 character(s)'],
  //               children: {}
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
}
```

### Prettify Error

Converts error to human-readable string format.

```typescript { .api }
/**
 * Convert error to human-readable string
 * @param error - ZodError to prettify
 * @returns Formatted error string
 */
function prettifyError<T>(error: ZodError<T>): string;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

const result = Schema.safeParse({
  name: 'AB',
  email: 'invalid',
});

if (!result.success) {
  const pretty = z.prettifyError(result.error);

  console.log(pretty);
  // Validation error:
  //   - name: String must contain at least 3 character(s)
  //   - email: Invalid email
}
```

### Custom Error Messages

Customize error messages at schema definition or globally.

```typescript
import * as z from 'zod';

// Per-field custom messages
const Schema = z.object({
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string',
  }).min(3, 'Name must be at least 3 characters'),

  age: z.number({
    required_error: 'Age is required',
    invalid_type_error: 'Age must be a number',
  }).min(18, 'Must be 18 or older'),
});

// Refinement with custom message
const Password = z.string().refine(
  (val) => val.length >= 8 && /[A-Z]/.test(val),
  {
    message: 'Password must be at least 8 characters with uppercase letter',
    path: [], // optional path for nested errors
  }
);

// superRefine with custom issue
const EmailConfirm = z.object({
  email: z.string().email(),
  confirmEmail: z.string().email(),
}).superRefine((data, ctx) => {
  if (data.email !== data.confirmEmail) {
    ctx.addIssue({
      code: 'custom',
      message: 'Emails do not match',
      path: ['confirmEmail'],
    });
  }
});
```

### Error Handling Patterns

Common patterns for handling validation errors:

```typescript
import * as z from 'zod';

// 1. Try-catch pattern
try {
  const data = schema.parse(input);
  // Use data
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation error
    console.error(error.issues);
  }
}

// 2. Safe parse pattern (preferred)
const result = schema.safeParse(input);
if (result.success) {
  // Use result.data
} else {
  // Handle result.error
  console.error(result.error.issues);
}

// 3. Form validation pattern
function validateForm(formData: unknown) {
  const result = formSchema.safeParse(formData);

  if (!result.success) {
    const flattened = result.error.flatten();
    return {
      success: false,
      errors: flattened.fieldErrors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

// 4. API error response pattern
function handleApiRequest(data: unknown) {
  const result = apiSchema.safeParse(data);

  if (!result.success) {
    return {
      status: 400,
      body: {
        error: 'Validation failed',
        details: result.error.format(),
      },
    };
  }

  return {
    status: 200,
    body: processData(result.data),
  };
}

declare function processData(data: any): any;
```

## Types

```typescript { .api }
class ZodError<T = any> extends Error {
  readonly issues: ZodIssue[];
  get isEmpty(): boolean;
  format(): FormattedError<T>;
  flatten<U = string>(): FlattenedError<T, U>;
  toString(): string;
  static create(issues: ZodIssue[]): ZodError;
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

function formatError<T>(error: ZodError<T>): FormattedError<T>;
function flattenError<T>(error: ZodError<T>): FlattenedError<T>;
function treeifyError<T>(error: ZodError<T>): TreeError<T>;
function prettifyError<T>(error: ZodError<T>): string;
```
