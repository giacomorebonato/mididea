# Coercion

Force type coercion during parsing for strings, numbers, booleans, bigints, and dates with automatic conversion from compatible types.

## Capabilities

### Coerce String

Creates a schema that coerces values to strings using JavaScript's string coercion rules.

```typescript { .api }
/**
 * Create a coercive string schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with automatic coercion
 */
namespace coerce {
  function string(params?: StringParams): ZodString;
}

interface StringParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const CoercedString = z.coerce.string();

// Coercion from various types
CoercedString.parse('hello'); // => "hello"
CoercedString.parse(123); // => "123"
CoercedString.parse(true); // => "true"
CoercedString.parse(false); // => "false"
CoercedString.parse(null); // => "null"
CoercedString.parse(undefined); // => "undefined"
CoercedString.parse([1, 2, 3]); // => "1,2,3"
CoercedString.parse({ x: 1 }); // => "[object Object]"

// With string methods
const TrimmedCoerced = z.coerce.string().trim().min(1);
TrimmedCoerced.parse('  hello  '); // => "hello"
TrimmedCoerced.parse(42); // => "42"

// Form data processing
const FormSchema = z.object({
  name: z.coerce.string().min(1),
  email: z.coerce.string().email(),
  age: z.coerce.string().transform((s) => parseInt(s, 10)),
});
```

### Coerce Number

Creates a schema that coerces values to numbers using JavaScript's number coercion rules.

```typescript { .api }
/**
 * Create a coercive number schema
 * @param params - Optional configuration for error handling and metadata
 * @returns Number schema with automatic coercion
 */
namespace coerce {
  function number(params?: NumberParams): ZodNumber;
}

interface NumberParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const CoercedNumber = z.coerce.number();

// Coercion from various types
CoercedNumber.parse(42); // => 42
CoercedNumber.parse('42'); // => 42
CoercedNumber.parse('3.14'); // => 3.14
CoercedNumber.parse(true); // => 1
CoercedNumber.parse(false); // => 0
CoercedNumber.parse(''); // => 0
CoercedNumber.parse('  123  '); // => 123

// Invalid coercions result in NaN (which can be validated)
// CoercedNumber.parse('not a number'); // NaN -> may fail validation

// With number methods
const PositiveInt = z.coerce.number().int().positive();
PositiveInt.parse('42'); // => 42
PositiveInt.parse(42); // => 42

// URL query parameters
const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
});

QuerySchema.parse({
  page: '2',
  limit: '50',
  sortBy: 'name',
}); // => { page: 2, limit: 50, sortBy: "name" }

// Form input
const AgeInput = z.coerce.number().int().min(0).max(120);
AgeInput.parse('25'); // => 25

// Price validation
const Price = z.coerce.number().positive().finite();
Price.parse('19.99'); // => 19.99
```

### Coerce Boolean

Creates a schema that coerces values to booleans using JavaScript's truthy/falsy rules and string parsing.

```typescript { .api }
/**
 * Create a coercive boolean schema
 * @param params - Optional configuration for error handling and metadata
 * @returns Boolean schema with automatic coercion
 */
namespace coerce {
  function boolean(params?: BooleanParams): ZodBoolean;
}

interface BooleanParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const CoercedBoolean = z.coerce.boolean();

// Coercion from various types
CoercedBoolean.parse(true); // => true
CoercedBoolean.parse(false); // => false
CoercedBoolean.parse('true'); // => true
CoercedBoolean.parse('false'); // => false
CoercedBoolean.parse('1'); // => true
CoercedBoolean.parse('0'); // => false
CoercedBoolean.parse(1); // => true
CoercedBoolean.parse(0); // => false
CoercedBoolean.parse('yes'); // => true
CoercedBoolean.parse('no'); // => false
CoercedBoolean.parse('on'); // => true
CoercedBoolean.parse('off'); // => false

// Empty string and non-empty string
CoercedBoolean.parse(''); // => false
CoercedBoolean.parse('hello'); // => true

// Checkbox values
const CheckboxSchema = z.object({
  agreedToTerms: z.coerce.boolean(),
  subscribeNewsletter: z.coerce.boolean(),
});

CheckboxSchema.parse({
  agreedToTerms: 'on',
  subscribeNewsletter: 'off',
}); // => { agreedToTerms: true, subscribeNewsletter: false }

// Feature flags
const FeatureFlags = z.object({
  enableFeatureX: z.coerce.boolean().default(false),
  enableFeatureY: z.coerce.boolean().default(false),
});

FeatureFlags.parse({
  enableFeatureX: '1',
  enableFeatureY: 'false',
}); // => { enableFeatureX: true, enableFeatureY: false }
```

### Coerce BigInt

Creates a schema that coerces values to bigints.

```typescript { .api }
/**
 * Create a coercive bigint schema
 * @param params - Optional configuration for error handling and metadata
 * @returns BigInt schema with automatic coercion
 */
namespace coerce {
  function bigint(params?: BigIntParams): ZodBigInt;
}

interface BigIntParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const CoercedBigInt = z.coerce.bigint();

// Coercion from various types
CoercedBigInt.parse(42n); // => 42n
CoercedBigInt.parse(42); // => 42n
CoercedBigInt.parse('42'); // => 42n
CoercedBigInt.parse('9007199254740991'); // => 9007199254740991n

// With bigint methods
const PositiveBigInt = z.coerce.bigint().positive();
PositiveBigInt.parse('123456789'); // => 123456789n

// Large numbers
const LargeId = z.coerce.bigint().min(0n);
LargeId.parse('18446744073709551615'); // => 18446744073709551615n

// Database ID
const DatabaseId = z.coerce.bigint();
DatabaseId.parse('1234567890123456789'); // => 1234567890123456789n
```

### Coerce Date

Creates a schema that coerces values to Date objects from strings, numbers, or existing dates.

```typescript { .api }
/**
 * Create a coercive date schema
 * @param params - Optional configuration for error handling and metadata
 * @returns Date schema with automatic coercion
 */
namespace coerce {
  function date(params?: DateParams): ZodDate;
}

interface DateParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const CoercedDate = z.coerce.date();

// Coercion from various types
CoercedDate.parse(new Date()); // => Date object
CoercedDate.parse('2024-01-15'); // => Date object
CoercedDate.parse('2024-01-15T10:30:00Z'); // => Date object
CoercedDate.parse(1705318200000); // => Date object (from timestamp)

// With date methods
const FutureDate = z.coerce.date().min(new Date());
FutureDate.parse('2030-01-01'); // => Date object

// API timestamp
const Timestamp = z.coerce.date();
Timestamp.parse('2024-01-15T10:30:00.000Z'); // => Date object
Timestamp.parse(1705318200000); // => Date object

// Form date input
const BirthDate = z.coerce.date().max(new Date());
BirthDate.parse('1990-01-15'); // => Date object

// Date range
const DateRange = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
}).refine((data) => data.end > data.start, {
  message: 'End date must be after start date',
  path: ['end'],
});

DateRange.parse({
  start: '2024-01-01',
  end: '2024-12-31',
}); // => { start: Date, end: Date }
```

### Common Use Cases

Coercion is particularly useful for form data, URL parameters, and API data:

```typescript
import * as z from 'zod';

// URL query parameters (all strings)
const QueryParams = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  ascending: z.coerce.boolean().default(true),
});

const params = new URLSearchParams('page=2&limit=50&ascending=false');
const parsed = QueryParams.parse(Object.fromEntries(params));
// => { page: 2, limit: 50, ascending: false }

// HTML form data
const FormData = z.object({
  name: z.coerce.string().trim().min(1),
  age: z.coerce.number().int().min(0).max(120),
  email: z.coerce.string().email(),
  subscribe: z.coerce.boolean(),
  birthDate: z.coerce.date(),
});

// CSV parsing
const CsvRow = z.object({
  id: z.coerce.number(),
  name: z.coerce.string(),
  price: z.coerce.number(),
  inStock: z.coerce.boolean(),
  createdAt: z.coerce.date(),
});

// Environment variables
const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DEBUG: z.coerce.boolean().default(false),
  DATABASE_URL: z.coerce.string().url(),
  MAX_CONNECTIONS: z.coerce.number().int().positive().default(10),
});

const env = EnvSchema.parse(process.env);

// API query string
const SearchParams = z.object({
  q: z.coerce.string().min(1),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(10).max(100).default(20),
  includeDeleted: z.coerce.boolean().default(false),
  since: z.coerce.date().optional(),
});
```

### Combining Coercion with Refinement

Coercion can be combined with validation and transformation:

```typescript
import * as z from 'zod';

// Coerce and validate
const PortNumber = z.coerce.number()
  .int('Must be an integer')
  .min(1, 'Port must be at least 1')
  .max(65535, 'Port must not exceed 65535');

// Coerce and transform
const UppercaseString = z.coerce.string()
  .trim()
  .transform((s) => s.toUpperCase());

// Complex coercion
const PhoneNumber = z.coerce.string()
  .regex(/^\d+$/, 'Must contain only digits')
  .refine((s) => s.length === 10, 'Must be 10 digits')
  .transform((s) => `(${s.slice(0, 3)}) ${s.slice(3, 6)}-${s.slice(6)}`);

PhoneNumber.parse('5551234567'); // => "(555) 123-4567"

// Sanitized input
const SanitizedInput = z.coerce.string()
  .trim()
  .transform((s) => s.replace(/[<>]/g, ''))
  .refine((s) => s.length > 0, 'Cannot be empty after sanitization');
```

## Types

```typescript { .api }
namespace coerce {
  function string(params?: StringParams): ZodString;
  function number(params?: NumberParams): ZodNumber;
  function boolean(params?: BooleanParams): ZodBoolean;
  function bigint(params?: BigIntParams): ZodBigInt;
  function date(params?: DateParams): ZodDate;
}

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

interface BooleanParams {
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

interface DateParams {
  errorMap?: ErrorMapFunction;
  invalid_type_error?: string;
  required_error?: string;
  description?: string;
}

type ErrorMapFunction = (
  issue: ZodIssueOptionalMessage,
  ctx: ErrorMapCtx
) => { message: string };

interface ErrorMapCtx {
  defaultError: string;
  data: any;
}
```
