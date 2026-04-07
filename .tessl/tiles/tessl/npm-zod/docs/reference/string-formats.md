# String Formats

Specialized string validators for common formats including emails, URLs, UUIDs, IP addresses, and many identifier types with built-in validation patterns.

## Capabilities

### Email Validation

Creates a string schema that validates email addresses using configurable validation patterns.

```typescript { .api }
/**
 * Create an email validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with email validation
 */
function email(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Email = z.email();
Email.parse('alice@example.com'); // => "alice@example.com"

// With custom error message
const EmailWithMessage = z.email({ invalid_type_error: 'Invalid email address' });
```

### URL Validation

Creates a string schema that validates URL format.

```typescript { .api }
/**
 * Create a URL validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with URL validation
 */
function url(params?: StringParams): ZodString;

/**
 * Create an HTTP/HTTPS URL validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with HTTP(S) URL validation
 */
function httpUrl(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const URL = z.url();
URL.parse('https://example.com'); // => "https://example.com"

const HttpURL = z.httpUrl();
HttpURL.parse('https://example.com/path'); // => "https://example.com/path"
```

### UUID Validation

Creates string schemas that validate UUIDs with optional version-specific validation.

```typescript { .api }
/**
 * Create a UUID validator schema (any version)
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with UUID validation
 */
function uuid(params?: StringParams): ZodString;

/**
 * Create a UUID v4 validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with UUID v4 validation
 */
function uuidv4(params?: StringParams): ZodString;

/**
 * Create a UUID v6 validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with UUID v6 validation
 */
function uuidv6(params?: StringParams): ZodString;

/**
 * Create a UUID v7 validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with UUID v7 validation
 */
function uuidv7(params?: StringParams): ZodString;

/**
 * Create a GUID validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with GUID validation
 */
function guid(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UUID = z.uuid();
UUID.parse('550e8400-e29b-41d4-a716-446655440000'); // => valid UUID

const UUIDv4 = z.uuidv4();
UUIDv4.parse('123e4567-e89b-12d3-a456-426614174000'); // => valid UUID v4

const GUID = z.guid();
GUID.parse('{550e8400-e29b-41d4-a716-446655440000}'); // => valid GUID
```

### CUID Validation

Creates string schemas for CUID (Collision-resistant Unique IDentifier) validation.

```typescript { .api }
/**
 * Create a CUID validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with CUID validation
 */
function cuid(params?: StringParams): ZodString;

/**
 * Create a CUID2 validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with CUID2 validation
 */
function cuid2(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const CUID = z.cuid();
CUID.parse('cjld2cjxh0000qzrmn831i7rn'); // => valid CUID

const CUID2 = z.cuid2();
CUID2.parse('ckopqwooh000001la8b5m9r51'); // => valid CUID2
```

### ULID Validation

Creates a string schema that validates ULID (Universally Unique Lexicographically Sortable Identifier) format.

```typescript { .api }
/**
 * Create a ULID validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with ULID validation
 */
function ulid(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const ULID = z.ulid();
ULID.parse('01ARZ3NDEKTSV4RRFFQ69G5FAV'); // => valid ULID
```

### XID Validation

Creates a string schema that validates XID (globally unique ID) format.

```typescript { .api }
/**
 * Create an XID validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with XID validation
 */
function xid(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const XID = z.xid();
XID.parse('9m4e2mr0ui3e8a215n4g'); // => valid XID
```

### KSUID Validation

Creates a string schema that validates KSUID (K-Sortable Unique IDentifier) format.

```typescript { .api }
/**
 * Create a KSUID validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with KSUID validation
 */
function ksuid(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const KSUID = z.ksuid();
KSUID.parse('0o5Fs0EELR0fUjHjbCnEtdUwQe3'); // => valid KSUID
```

### NanoID Validation

Creates a string schema that validates NanoID format.

```typescript { .api }
/**
 * Create a NanoID validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with NanoID validation
 */
function nanoid(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const NanoID = z.nanoid();
NanoID.parse('V1StGXR8_Z5jdHi6B-myT'); // => valid NanoID
```

### Emoji Validation

Creates a string schema that validates single emoji characters.

```typescript { .api }
/**
 * Create an emoji validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with emoji validation
 */
function emoji(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Emoji = z.emoji();
Emoji.parse('😀'); // => "😀"
Emoji.parse('👍'); // => "👍"
```

### IP Address Validation

Creates string schemas that validate IPv4 and IPv6 addresses.

```typescript { .api }
/**
 * Create an IPv4 address validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with IPv4 validation
 */
function ipv4(params?: StringParams): ZodString;

/**
 * Create an IPv6 address validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with IPv6 validation
 */
function ipv6(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const IPv4 = z.ipv4();
IPv4.parse('192.168.1.1'); // => "192.168.1.1"

const IPv6 = z.ipv6();
IPv6.parse('2001:0db8:85a3:0000:0000:8a2e:0370:7334'); // => valid IPv6
IPv6.parse('::1'); // => "::1" (loopback)
```

### MAC Address Validation

Creates a string schema that validates MAC address format.

```typescript { .api }
/**
 * Create a MAC address validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with MAC address validation
 */
function mac(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const MAC = z.mac();
MAC.parse('00:1B:44:11:3A:B7'); // => "00:1B:44:11:3A:B7"
MAC.parse('00-1B-44-11-3A-B7'); // => "00-1B-44-11-3A-B7"
```

### CIDR Notation Validation

Creates string schemas that validate CIDR (Classless Inter-Domain Routing) notation for IPv4 and IPv6.

```typescript { .api }
/**
 * Create a CIDR v4 notation validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with CIDR v4 validation
 */
function cidrv4(params?: StringParams): ZodString;

/**
 * Create a CIDR v6 notation validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with CIDR v6 validation
 */
function cidrv6(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const CIDRv4 = z.cidrv4();
CIDRv4.parse('192.168.1.0/24'); // => "192.168.1.0/24"

const CIDRv6 = z.cidrv6();
CIDRv6.parse('2001:db8::/32'); // => "2001:db8::/32"
```

### Base64 Validation

Creates string schemas that validate Base64 and Base64URL encoded strings.

```typescript { .api }
/**
 * Create a Base64 validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with Base64 validation
 */
function base64(params?: StringParams): ZodString;

/**
 * Create a Base64URL validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with Base64URL validation
 */
function base64url(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Base64 = z.base64();
Base64.parse('SGVsbG8gV29ybGQ='); // => "SGVsbG8gV29ybGQ="

const Base64URL = z.base64url();
Base64URL.parse('SGVsbG8gV29ybGQ'); // => "SGVsbG8gV29ybGQ" (no padding)
```

### E.164 Phone Number Validation

Creates a string schema that validates E.164 international phone number format.

```typescript { .api }
/**
 * Create an E.164 phone number validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with E.164 validation
 */
function e164(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const PhoneNumber = z.e164();
PhoneNumber.parse('+14155552671'); // => "+14155552671"
PhoneNumber.parse('+442071838750'); // => "+442071838750"
```

### JWT Token Validation

Creates a string schema that validates JWT (JSON Web Token) format.

```typescript { .api }
/**
 * Create a JWT validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with JWT validation
 */
function jwt(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const JWT = z.jwt();
JWT.parse('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U');
```

### Hostname Validation

Creates a string schema that validates hostname format according to DNS standards.

```typescript { .api }
/**
 * Create a hostname validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with hostname validation
 */
function hostname(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Hostname = z.hostname();
Hostname.parse('example.com'); // => "example.com"
Hostname.parse('subdomain.example.com'); // => "subdomain.example.com"
Hostname.parse('localhost'); // => "localhost"
```

### Hexadecimal Validation

Creates a string schema that validates hexadecimal strings.

```typescript { .api }
/**
 * Create a hexadecimal string validator schema
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with hexadecimal validation
 */
function hex(params?: StringParams): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const Hex = z.hex();
Hex.parse('deadbeef'); // => "deadbeef"
Hex.parse('0xABCD'); // => "0xABCD"
Hex.parse('123456789ABCDEF'); // => "123456789ABCDEF"
```

### Hash Validation

Creates a string schema that validates cryptographic hash strings for specific algorithms and encodings.

```typescript { .api }
/**
 * Create a hash validator schema for a specific algorithm and encoding
 * @param alg - Hash algorithm (md5, sha1, sha256, sha384, sha512, etc.)
 * @param params - Optional configuration with encoding format and error handling
 * @returns String schema with hash validation
 */
function hash<
  Alg extends 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512',
  Enc extends 'hex' | 'base64' | 'base64url' = 'hex'
>(
  alg: Alg,
  params?: { enc?: Enc } & StringParams
): ZodCustomStringFormat<`${Alg}_${Enc}`>;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Default encoding is 'hex'
const MD5Hex = z.hash('md5');
MD5Hex.parse('5d41402abc4b2a76b9719d911017c592'); // => valid MD5 hex

const SHA256Hex = z.hash('sha256');
SHA256Hex.parse('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'); // => valid SHA256 hex

// Specify encoding in params object
const SHA256Base64 = z.hash('sha256', { enc: 'base64' });
SHA256Base64.parse('47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='); // => valid SHA256 base64

const SHA512Base64URL = z.hash('sha512', { enc: 'base64url' });
SHA512Base64URL.parse('z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg_SpIdNs6c5H0NE8XYXysP-DGNKHfuwvY7kxvUdBeoGlODJ6-SfaPg'); // => valid SHA512 base64url
```

### Custom String Format

Creates a custom string format validator with a user-defined validation function.

```typescript { .api }
/**
 * Create a custom string format validator
 * @param format - Format name/identifier
 * @param validator - Validation function that returns true if valid
 * @param params - Optional configuration for error handling and metadata
 * @returns String schema with custom format validation
 */
function stringFormat<Format extends string>(
  format: Format,
  validator: (value: string) => boolean,
  params?: StringParams
): ZodString;
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Custom credit card format
const CreditCard = z.stringFormat(
  'credit-card',
  (value) => /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(value)
);
CreditCard.parse('1234-5678-9012-3456'); // => "1234-5678-9012-3456"

// Custom username format
const Username = z.stringFormat(
  'username',
  (value) => /^[a-z0-9_]{3,16}$/.test(value)
);
Username.parse('john_doe'); // => "john_doe"
```

## Types

```typescript { .api }
interface StringParams {
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

interface ZodIssueOptionalMessage {
  code: string;
  path: (string | number)[];
  message?: string;
}

class ZodString {
  parse(data: unknown): string;
  safeParse(data: unknown): SafeParseReturnType<unknown, string>;

  // All string schemas support chaining with additional constraints
  min(length: number, message?: string): ZodString;
  max(length: number, message?: string): ZodString;
  length(length: number, message?: string): ZodString;
  regex(pattern: RegExp, message?: string): ZodString;
  trim(): ZodString;
  toLowerCase(): ZodString;
  toUpperCase(): ZodString;

  // Common modifiers
  optional(): ZodOptional<ZodString>;
  nullable(): ZodNullable<ZodString>;
  default(value: string): ZodDefault<ZodString>;
}

type SafeParseReturnType<Input, Output> =
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> };
```
