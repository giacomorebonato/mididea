# Refinements and Transformations

Add custom validation logic and transform parsed values with refine, superRefine, transform, check, preprocess, and custom schema creation.

## Capabilities

### Refine

Adds custom validation logic to a schema with boolean checks.

```typescript { .api }
/**
 * Add custom validation to a schema
 * @param schema - Base schema to refine
 * @param refinement - Validation function returning boolean
 * @param params - Optional error message and path
 * @returns Schema with additional validation
 */
function refine<T extends ZodTypeAny>(
  schema: T,
  refinement: RefinementFunction<T>,
  params?: RefineParams
): ZodEffects<T>;

type RefinementFunction<T extends ZodTypeAny> = (
  data: z.output<T>
) => boolean | Promise<boolean>;

interface RefineParams {
  message?: string;
  path?: (string | number)[];
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic refinement
const PositiveNumber = z.number().refine(
  (val) => val > 0,
  { message: 'Number must be positive' }
);

// String refinement
const StrongPassword = z.string().refine(
  (val) => val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val),
  { message: 'Password must be at least 8 characters with uppercase and number' }
);

// Object refinement
const DateRange = z.object({
  start: z.date(),
  end: z.date(),
}).refine(
  (data) => data.end > data.start,
  { message: 'End date must be after start date', path: ['end'] }
);

// Multiple refinements
const ComplexString = z.string()
  .min(5)
  .refine((val) => !val.includes(' '), 'No spaces allowed')
  .refine((val) => /^[a-z]+$/.test(val), 'Only lowercase letters allowed');

// Async refinement
const UniqueUsername = z.string().refine(
  async (username) => {
    const exists = await checkUsernameExists(username);
    return !exists;
  },
  { message: 'Username already taken' }
);

declare function checkUsernameExists(username: string): Promise<boolean>;
```

### Super Refine

Advanced refinement with context for adding multiple issues.

```typescript { .api }
/**
 * Add advanced validation with issue context
 * @param schema - Base schema to refine
 * @param refinement - Validation function with context
 * @returns Schema with advanced validation
 */
function superRefine<T extends ZodTypeAny>(
  schema: T,
  refinement: SuperRefinementFunction<T>
): ZodEffects<T>;

type SuperRefinementFunction<T extends ZodTypeAny> = (
  data: z.output<T>,
  ctx: RefinementCtx
) => void | Promise<void>;

interface RefinementCtx {
  addIssue(issue: IssueData): void;
  path: (string | number)[];
}

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
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Add multiple custom issues
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
  if (!/[0-9]/.test(password)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Password must contain number',
    });
  }
});

// Object validation with path-specific errors
const FormSchema = z.object({
  email: z.string(),
  confirmEmail: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  if (data.email !== data.confirmEmail) {
    ctx.addIssue({
      code: 'custom',
      message: 'Emails do not match',
      path: ['confirmEmail'],
    });
  }
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });
  }
});

// Async super refinement
const SignupSchema = z.object({
  username: z.string(),
  email: z.string().email(),
}).superRefine(async (data, ctx) => {
  const usernameExists = await checkUsername(data.username);
  if (usernameExists) {
    ctx.addIssue({
      code: 'custom',
      message: 'Username already taken',
      path: ['username'],
    });
  }

  const emailExists = await checkEmail(data.email);
  if (emailExists) {
    ctx.addIssue({
      code: 'custom',
      message: 'Email already registered',
      path: ['email'],
    });
  }
});

declare function checkUsername(username: string): Promise<boolean>;
declare function checkEmail(email: string): Promise<boolean>;
```

### Transform

Transforms the parsed value to a different type or value.

```typescript { .api }
/**
 * Transform the parsed value
 * @param schema - Base schema
 * @param transform - Transformation function
 * @returns Schema with transformation applied
 */
function transform<T extends ZodTypeAny, Output>(
  schema: T,
  transform: TransformFunction<T, Output>
): ZodEffects<T, Output>;

type TransformFunction<T extends ZodTypeAny, Output> = (
  data: z.output<T>
) => Output | Promise<Output>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic transformation
const StringToNumber = z.string().transform((val) => parseInt(val, 10));
type StringToNumber = z.infer<typeof StringToNumber>; // number
StringToNumber.parse('42'); // => 42

// String manipulation
const TrimmedString = z.string().transform((val) => val.trim());
const UppercaseString = z.string().transform((val) => val.toUpperCase());

// Object transformation
const UserInput = z.object({
  firstName: z.string(),
  lastName: z.string(),
  birthYear: z.string(),
}).transform((data) => ({
  fullName: `${data.firstName} ${data.lastName}`,
  age: new Date().getFullYear() - parseInt(data.birthYear, 10),
}));

type User = z.infer<typeof UserInput>;
// { fullName: string; age: number }

// Date parsing
const DateFromString = z.string().transform((str) => new Date(str));
const TimestampFromDate = z.date().transform((date) => date.getTime());

// Array transformation
const CommaSeparated = z.string().transform((str) => str.split(','));
type CommaSeparated = z.infer<typeof CommaSeparated>; // string[]

// Chaining transforms
const ProcessedString = z.string()
  .transform((s) => s.trim())
  .transform((s) => s.toLowerCase())
  .transform((s) => s.split(' '));

// Async transformation
const EnrichedUser = z.object({
  userId: z.string(),
}).transform(async (data) => {
  const userData = await fetchUserData(data.userId);
  return { ...data, ...userData };
});

declare function fetchUserData(userId: string): Promise<{ name: string; email: string }>;
```

### Preprocess

Preprocesses input before validation (transforms input, not output).

```typescript { .api }
/**
 * Preprocess input before validation
 * @param preprocessor - Function to preprocess input
 * @param schema - Schema to validate preprocessed input
 * @returns Schema with preprocessing
 */
function preprocess<T extends ZodTypeAny>(
  preprocessor: (arg: unknown) => unknown,
  schema: T
): ZodEffects<ZodUnknown, z.output<T>>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Trim before validation
const TrimmedString = z.preprocess(
  (val) => typeof val === 'string' ? val.trim() : val,
  z.string().min(1)
);
TrimmedString.parse('  hello  '); // => "hello"

// Parse string to number
const NumberFromString = z.preprocess(
  (val) => typeof val === 'string' ? parseFloat(val) : val,
  z.number()
);
NumberFromString.parse('42.5'); // => 42.5

// Convert empty string to undefined
const OptionalField = z.preprocess(
  (val) => val === '' ? undefined : val,
  z.string().optional()
);

// Date parsing
const DateField = z.preprocess(
  (arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    return arg;
  },
  z.date()
);

// Array coercion
const ArrayField = z.preprocess(
  (val) => Array.isArray(val) ? val : [val],
  z.array(z.string())
);
ArrayField.parse('single'); // => ["single"]
ArrayField.parse(['multiple', 'items']); // => ["multiple", "items"]

// JSON parsing
const JsonField = z.preprocess(
  (val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  },
  z.object({ name: z.string() })
);
```

### Custom Schema

Creates a custom schema with user-defined validation logic.

```typescript { .api }
/**
 * Create a custom schema with validation function
 * @param validator - Custom validation function
 * @param params - Optional configuration
 * @returns Custom schema
 */
function custom<T = any>(
  validator: CustomValidator<T>,
  params?: CustomParams
): ZodCustom<T>;

type CustomValidator<T> = (data: unknown) => data is T;

interface CustomParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Custom type guard
interface Point {
  x: number;
  y: number;
}

const PointSchema = z.custom<Point>(
  (data): data is Point => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'x' in data &&
      'y' in data &&
      typeof (data as any).x === 'number' &&
      typeof (data as any).y === 'number'
    );
  },
  { invalid_type_error: 'Invalid point object' }
);

PointSchema.parse({ x: 10, y: 20 }); // => { x: 10, y: 20 }

// Custom validation for File
const ImageFile = z.custom<File>(
  (data): data is File => {
    return data instanceof File && data.type.startsWith('image/');
  },
  { invalid_type_error: 'Must be an image file' }
);

// Custom branded type
type Email = string & { __brand: 'Email' };

const EmailSchema = z.custom<Email>(
  (data): data is Email => {
    return typeof data === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data);
  }
);

// Custom with complex validation
interface CreditCard {
  number: string;
  cvv: string;
  expiry: string;
}

const CreditCardSchema = z.custom<CreditCard>(
  (data): data is CreditCard => {
    if (typeof data !== 'object' || data === null) return false;
    const card = data as any;
    return (
      typeof card.number === 'string' &&
      /^\d{16}$/.test(card.number) &&
      typeof card.cvv === 'string' &&
      /^\d{3,4}$/.test(card.cvv) &&
      typeof card.expiry === 'string' &&
      /^\d{2}\/\d{2}$/.test(card.expiry)
    );
  }
);
```

### Instance Of

Validates that a value is an instance of a specific class.

```typescript { .api }
/**
 * Create schema that validates instanceof check
 * @param cls - Class constructor to check against
 * @param params - Optional configuration
 * @returns Custom schema for instanceof validation
 */
function instanceof<T extends typeof Class>(
  cls: T,
  params?: ZodInstanceOfParams
): ZodCustom<InstanceType<T>, InstanceType<T>>;

interface ZodInstanceOfParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

declare const Class: abstract new (...args: any[]) => any;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Validate Date instances
const DateSchema = z.instanceof(Date);
DateSchema.parse(new Date()); // => Date object
DateSchema.parse('2024-01-01'); // => ZodError: Expected Date instance

// Validate custom class instances
class User {
  constructor(public name: string) {}
}

const UserSchema = z.instanceof(User);
UserSchema.parse(new User('Alice')); // => User { name: 'Alice' }
UserSchema.parse({ name: 'Bob' }); // => ZodError: Expected User instance

// With error message
const ErrorSchema = z.instanceof(Error, {
  invalid_type_error: 'Must be an Error instance'
});

// Built-in classes
const MapSchema = z.instanceof(Map);
const SetSchema = z.instanceof(Set);
const RegExpSchema = z.instanceof(RegExp);
```

### Check

Creates a validation check that can be added to schemas.

```typescript { .api }
/**
 * Create a validation check
 * @param fn - Check function returning boolean
 * @param message - Optional error message
 * @returns Check function
 */
function check<T>(
  fn: (data: T) => boolean,
  message?: string
): (data: T) => boolean;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Create reusable checks
const isEven = z.check((n: number) => n % 2 === 0, 'Must be even');
const isPositive = z.check((n: number) => n > 0, 'Must be positive');

// Apply checks using refine
const EvenPositiveNumber = z.number()
  .refine(isPositive)
  .refine(isEven);

// String checks
const noSpaces = z.check((s: string) => !s.includes(' '), 'No spaces allowed');
const alphanumeric = z.check(
  (s: string) => /^[a-zA-Z0-9]+$/.test(s),
  'Only alphanumeric characters'
);

const Username = z.string()
  .min(3)
  .refine(noSpaces)
  .refine(alphanumeric);
```

### Combining Refinements and Transformations

Refinements and transformations can be combined:

```typescript
import * as z from 'zod';

// Validate then transform
const ProcessedAge = z.number()
  .int()
  .min(0)
  .max(120)
  .refine((age) => age >= 18, 'Must be 18 or older')
  .transform((age) => ({ age, isAdult: true }));

// Transform then validate
const ParsedDate = z.string()
  .transform((str) => new Date(str))
  .refine((date) => !isNaN(date.getTime()), 'Invalid date');

// Multiple steps
const ComplexValidation = z.string()
  .min(3)
  .transform((s) => s.trim().toLowerCase())
  .refine((s) => s.length >= 3, 'Still too short after trimming')
  .transform((s) => ({ username: s, normalized: true }));

// Async chain
const AsyncChain = z.string()
  .refine(async (val) => await checkFormat(val), 'Invalid format')
  .transform(async (val) => await enrichData(val))
  .refine(async (data) => await validateEnriched(data), 'Validation failed');

declare function checkFormat(val: string): Promise<boolean>;
declare function enrichData(val: string): Promise<{ data: string }>;
declare function validateEnriched(data: { data: string }): Promise<boolean>;
```

## Types

```typescript { .api }
type ZodTypeAny = ZodType<any, any, any>;

class ZodEffects<Input extends ZodTypeAny, Output = Input['_output']> {
  readonly _type: 'ZodEffects';
  readonly innerType: Input;
}

type RefinementFunction<T extends ZodTypeAny> = (
  data: z.output<T>
) => boolean | Promise<boolean>;

type SuperRefinementFunction<T extends ZodTypeAny> = (
  data: z.output<T>,
  ctx: RefinementCtx
) => void | Promise<void>;

type TransformFunction<T extends ZodTypeAny, Output> = (
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
  path: (string | number)[];
}

type ErrorMapFunction = (
  issue: ZodIssueOptionalMessage,
  ctx: ErrorMapCtx
) => { message: string };

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
