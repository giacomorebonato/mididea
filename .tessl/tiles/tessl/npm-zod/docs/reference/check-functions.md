# Check Functions

Standalone validation and transformation functions that can be applied to schemas for adding constraints, transformations, and metadata without method chaining.

## Capabilities

### Numeric Comparisons

Functions for adding numeric comparison constraints to number and bigint schemas.

```typescript { .api }
/**
 * Add a less-than constraint
 * @param schema - Number or BigInt schema
 * @param value - Maximum value (exclusive)
 * @param params - Optional error message or parameters
 * @returns Schema with less-than constraint
 */
function lt<T extends ZodNumber | ZodBigInt>(
  schema: T,
  value: number | bigint,
  params?: string | RefinementParams
): T;

/**
 * Add a less-than-or-equal constraint
 * @param schema - Number or BigInt schema
 * @param value - Maximum value (inclusive)
 * @param params - Optional error message or parameters
 * @returns Schema with less-than-or-equal constraint
 */
function lte<T extends ZodNumber | ZodBigInt>(
  schema: T,
  value: number | bigint,
  params?: string | RefinementParams
): T;

/**
 * Add a greater-than constraint
 * @param schema - Number or BigInt schema
 * @param value - Minimum value (exclusive)
 * @param params - Optional error message or parameters
 * @returns Schema with greater-than constraint
 */
function gt<T extends ZodNumber | ZodBigInt>(
  schema: T,
  value: number | bigint,
  params?: string | RefinementParams
): T;

/**
 * Add a greater-than-or-equal constraint
 * @param schema - Number or BigInt schema
 * @param value - Minimum value (inclusive)
 * @param params - Optional error message or parameters
 * @returns Schema with greater-than-or-equal constraint
 */
function gte<T extends ZodNumber | ZodBigInt>(
  schema: T,
  value: number | bigint,
  params?: string | RefinementParams
): T;

/**
 * Add a positive number constraint (> 0)
 * @param schema - Number or BigInt schema
 * @param params - Optional error message or parameters
 * @returns Schema with positive constraint
 */
function positive<T extends ZodNumber | ZodBigInt>(
  schema: T,
  params?: string | RefinementParams
): T;

/**
 * Add a negative number constraint (< 0)
 * @param schema - Number or BigInt schema
 * @param params - Optional error message or parameters
 * @returns Schema with negative constraint
 */
function negative<T extends ZodNumber | ZodBigInt>(
  schema: T,
  params?: string | RefinementParams
): T;

/**
 * Add a non-positive constraint (<= 0)
 * @param schema - Number or BigInt schema
 * @param params - Optional error message or parameters
 * @returns Schema with non-positive constraint
 */
function nonpositive<T extends ZodNumber | ZodBigInt>(
  schema: T,
  params?: string | RefinementParams
): T;

/**
 * Add a non-negative constraint (>= 0)
 * @param schema - Number or BigInt schema
 * @param params - Optional error message or parameters
 * @returns Schema with non-negative constraint
 */
function nonnegative<T extends ZodNumber | ZodBigInt>(
  schema: T,
  params?: string | RefinementParams
): T;

/**
 * Add a multiple-of constraint
 * @param schema - Number or BigInt schema
 * @param value - Value that input must be a multiple of
 * @param params - Optional error message or parameters
 * @returns Schema with multiple-of constraint
 */
function multipleOf<T extends ZodNumber | ZodBigInt>(
  schema: T,
  value: number | bigint,
  params?: string | RefinementParams
): T;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Using standalone functions
const PositiveNumber = z.positive(z.number());
const Age = z.gte(z.number(), 0);
const Percentage = z.lte(z.gte(z.number(), 0), 100);

// With error messages
const Price = z.gt(z.number(), 0, 'Price must be positive');
const Quantity = z.multipleOf(z.int(), 5, 'Quantity must be multiple of 5');

// Method chaining is also supported
const AlternativePrice = z.number().gt(0);
```

### Size Constraints

Functions for adding size constraints to collections (arrays, sets, maps, strings).

```typescript { .api }
/**
 * Add a maximum size constraint
 * @param schema - Array, Set, Map, or String schema
 * @param size - Maximum size
 * @param params - Optional error message or parameters
 * @returns Schema with maximum size constraint
 */
function maxSize<T extends ZodArray | ZodSet | ZodMap>(
  schema: T,
  size: number,
  params?: string | RefinementParams
): T;

/**
 * Add a minimum size constraint
 * @param schema - Array, Set, Map, or String schema
 * @param size - Minimum size
 * @param params - Optional error message or parameters
 * @returns Schema with minimum size constraint
 */
function minSize<T extends ZodArray | ZodSet | ZodMap>(
  schema: T,
  size: number,
  params?: string | RefinementParams
): T;

/**
 * Add an exact size constraint
 * @param schema - Array, Set, Map, or String schema
 * @param size - Exact size required
 * @param params - Optional error message or parameters
 * @returns Schema with exact size constraint
 */
function size<T extends ZodArray | ZodSet | ZodMap>(
  schema: T,
  size: number,
  params?: string | RefinementParams
): T;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const SmallArray = z.maxSize(z.array(z.string()), 10);
const NonEmptySet = z.minSize(z.set(z.number()), 1);
const ExactSizeMap = z.size(z.map(z.string(), z.number()), 5);
```

### Length Constraints

Functions for adding length constraints to strings and arrays.

```typescript { .api }
/**
 * Add a maximum length constraint
 * @param schema - String or Array schema
 * @param length - Maximum length
 * @param params - Optional error message or parameters
 * @returns Schema with maximum length constraint
 */
function maxLength<T extends ZodString | ZodArray>(
  schema: T,
  length: number,
  params?: string | RefinementParams
): T;

/**
 * Add a minimum length constraint
 * @param schema - String or Array schema
 * @param length - Minimum length
 * @param params - Optional error message or parameters
 * @returns Schema with minimum length constraint
 */
function minLength<T extends ZodString | ZodArray>(
  schema: T,
  length: number,
  params?: string | RefinementParams
): T;

/**
 * Add an exact length constraint
 * @param schema - String or Array schema
 * @param length - Exact length required
 * @param params - Optional error message or parameters
 * @returns Schema with exact length constraint
 */
function length<T extends ZodString | ZodArray>(
  schema: T,
  length: number,
  params?: string | RefinementParams
): T;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Username = z.minLength(z.maxLength(z.string(), 20), 3);
const PIN = z.length(z.string(), 4);
const SmallList = z.maxLength(z.array(z.string()), 100);
```

### String Validation

Functions for string pattern matching and validation.

```typescript { .api }
/**
 * Add a regex pattern constraint
 * @param schema - String schema
 * @param pattern - Regular expression pattern
 * @param params - Optional error message or parameters
 * @returns Schema with regex constraint
 */
function regex<T extends ZodString>(
  schema: T,
  pattern: RegExp,
  params?: string | RefinementParams
): T;

/**
 * Add a lowercase constraint
 * @param schema - String schema
 * @param params - Optional error message or parameters
 * @returns Schema with lowercase validation
 */
function lowercase<T extends ZodString>(
  schema: T,
  params?: string | RefinementParams
): T;

/**
 * Add an uppercase constraint
 * @param schema - String schema
 * @param params - Optional error message or parameters
 * @returns Schema with uppercase validation
 */
function uppercase<T extends ZodString>(
  schema: T,
  params?: string | RefinementParams
): T;

/**
 * Add a substring inclusion constraint
 * @param schema - String schema
 * @param substring - Substring that must be present
 * @param params - Optional error message or parameters
 * @returns Schema with substring constraint
 */
function includes<T extends ZodString>(
  schema: T,
  substring: string,
  params?: string | RefinementParams
): T;

/**
 * Add a prefix constraint
 * @param schema - String schema
 * @param prefix - Prefix that string must start with
 * @param params - Optional error message or parameters
 * @returns Schema with prefix constraint
 */
function startsWith<T extends ZodString>(
  schema: T,
  prefix: string,
  params?: string | RefinementParams
): T;

/**
 * Add a suffix constraint
 * @param schema - String schema
 * @param suffix - Suffix that string must end with
 * @param params - Optional error message or parameters
 * @returns Schema with suffix constraint
 */
function endsWith<T extends ZodString>(
  schema: T,
  suffix: string,
  params?: string | RefinementParams
): T;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Slug = z.regex(z.string(), /^[a-z0-9-]+$/);
const LowercaseEmail = z.lowercase(z.string().email());
const UppercaseCode = z.uppercase(z.length(z.string(), 6));
const TwitterHandle = z.startsWith(z.string(), '@');
const ImageFile = z.endsWith(z.string(), '.png');
const SecureUrl = z.includes(z.string().url(), 'https://');
```

### String Transformations

Functions for transforming string values during parsing.

```typescript { .api }
/**
 * Normalize Unicode string
 * @param schema - String schema
 * @param form - Unicode normalization form (NFC, NFD, NFKC, NFKD)
 * @returns Schema with normalization transformation
 */
function normalize<T extends ZodString>(
  schema: T,
  form?: 'NFC' | 'NFD' | 'NFKC' | 'NFKD'
): T;

/**
 * Trim whitespace from string
 * @param schema - String schema
 * @returns Schema with trim transformation
 */
function trim<T extends ZodString>(schema: T): T;

/**
 * Convert string to lowercase
 * @param schema - String schema
 * @returns Schema with lowercase transformation
 */
function toLowerCase<T extends ZodString>(schema: T): T;

/**
 * Convert string to uppercase
 * @param schema - String schema
 * @returns Schema with uppercase transformation
 */
function toUpperCase<T extends ZodString>(schema: T): T;

/**
 * Convert string to URL-friendly slug
 * @param schema - String schema
 * @returns Schema with slugify transformation
 */
function slugify<T extends ZodString>(schema: T): T;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const CleanEmail = z.toLowerCase(z.trim(z.string().email()));
const Slug = z.slugify(z.string());
const NormalizedText = z.normalize(z.string(), 'NFC');
const ShoutingText = z.toUpperCase(z.string());

// Parsing applies transformations
CleanEmail.parse('  Alice@Example.com  '); // => "alice@example.com"
Slug.parse('Hello World!'); // => "hello-world"
```

### Other Validation Functions

Additional validation and transformation utilities.

```typescript { .api }
/**
 * Overwrite the parsed value with a constant
 * @param schema - Any schema
 * @param value - Value to overwrite with
 * @returns Schema that always outputs the specified value
 */
function overwrite<T extends ZodTypeAny, V>(
  schema: T,
  value: V
): ZodEffects<T, V>;

/**
 * Validate a specific property of an object during parsing
 * @param schema - Object schema
 * @param property - Property name to validate
 * @param propertySchema - Schema for the property
 * @returns Schema with property validation
 */
function property<T extends ZodObject, K extends string, V extends ZodTypeAny>(
  schema: T,
  property: K,
  propertySchema: V
): T;

/**
 * Add MIME type validation for file schemas
 * @param schema - File schema
 * @param mimeType - MIME type pattern or array of types
 * @param params - Optional error message or parameters
 * @returns Schema with MIME type constraint
 */
function mime<T extends ZodFile>(
  schema: T,
  mimeType: string | string[],
  params?: string | RefinementParams
): T;

/**
 * Create a custom check function for validation
 * @param fn - Custom check function that receives the parsed value
 * @returns Check object that can be applied to schemas
 */
function check<O = unknown>(fn: CheckFn<O>): $ZodCheck<O>;

type CheckFn<O> = (value: O, payload: ParsePayload) => void | Promise<void>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Overwrite
const AlwaysTrue = z.overwrite(z.boolean(), true);
AlwaysTrue.parse(false); // => true

// Property validation
const UserWithAge = z.property(
  z.object({ name: z.string() }),
  'age',
  z.number().positive()
);

// MIME type validation
const ImageFile = z.mime(z.file(), ['image/png', 'image/jpeg']);
const PDFFile = z.mime(z.file(), 'application/pdf');
```

## Types

```typescript { .api }
interface RefinementParams {
  message?: string;
  path?: (string | number)[];
}

type ZodTypeAny = ZodType<any, any, any>;
```
