# JSON Schema Integration

Convert between Zod schemas and JSON Schema format for interoperability with other tools, documentation generation, and standards compliance.

## Capabilities

### To JSON Schema

Converts Zod schemas to JSON Schema Draft 7 format.

```typescript { .api }
/**
 * Convert Zod schema to JSON Schema
 * @param schema - Zod schema to convert
 * @param options - Optional conversion options
 * @returns JSON Schema object
 */
function toJSONSchema<T extends ZodTypeAny>(
  schema: T,
  options?: JSONSchemaOptions
): JSONSchema7;

interface JSONSchemaOptions {
  name?: string;
  $refStrategy?: 'root' | 'relative' | 'none';
  effectStrategy?: 'input' | 'output' | 'any';
  definitions?: Record<string, ZodTypeAny>;
  errorMessages?: boolean;
  markdownDescription?: boolean;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic conversion
const UserSchema = z.object({
  name: z.string(),
  age: z.number().int().min(0),
  email: z.string().email(),
});

const jsonSchema = z.toJSONSchema(UserSchema);
console.log(jsonSchema);
// {
//   type: "object",
//   properties: {
//     name: { type: "string" },
//     age: { type: "integer", minimum: 0 },
//     email: { type: "string", format: "email" }
//   },
//   required: ["name", "age", "email"]
// }

// With options
const jsonSchemaWithName = z.toJSONSchema(UserSchema, {
  name: 'User',
  errorMessages: true,
  markdownDescription: true,
});

// Complex schema
const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  tags: z.array(z.string()),
  metadata: z.record(z.string(), z.any()).optional(),
});

const productJson = z.toJSONSchema(ProductSchema, { name: 'Product' });

// With definitions for reusable schemas
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
});

const PersonSchema = z.object({
  name: z.string(),
  address: AddressSchema,
});

const jsonWithRefs = z.toJSONSchema(PersonSchema, {
  name: 'Person',
  $refStrategy: 'root',
  definitions: {
    Address: AddressSchema,
  },
});
```

### Schema Instance Method

JSON Schema generation is also available as an instance method on all schemas.

```typescript { .api }
/**
 * Get JSON Schema for this schema instance
 * @param options - Optional conversion options
 * @returns JSON Schema object
 */
interface ZodType {
  getJSONSchema(options?: JSONSchemaOptions): JSONSchema7;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const jsonSchema = UserSchema.getJSONSchema();
const jsonSchemaWithName = UserSchema.getJSONSchema({ name: 'User' });
```

### From JSON Schema

Converts JSON Schema to Zod schemas for runtime validation.

```typescript { .api }
/**
 * Convert JSON Schema to Zod schema
 * @param jsonSchema - JSON Schema object to convert
 * @param options - Optional conversion options
 * @returns Zod schema
 */
function fromJSONSchema(
  jsonSchema: JSONSchema7,
  options?: FromJSONSchemaOptions
): ZodTypeAny;

interface FromJSONSchemaOptions {
  errorMap?: ZodErrorMap;
}

type ZodErrorMap = (
  issue: ZodIssueOptionalMessage,
  ctx: ErrorMapCtx
) => { message: string };
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Convert JSON Schema to Zod
const jsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer', minimum: 18 },
    email: { type: 'string', format: 'email' },
  },
  required: ['name', 'email'],
};

const zodSchema = z.fromJSONSchema(jsonSchema);

// Use the schema
const user = zodSchema.parse({
  name: 'Alice',
  age: 30,
  email: 'alice@example.com',
});

// With custom error map
const zodSchemaWithErrors = z.fromJSONSchema(jsonSchema, {
  errorMap: (issue, ctx) => ({
    message: `Custom error: ${ctx.defaultError}`,
  }),
});

// Complex JSON Schema
const complexJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'number', minimum: 1 },
        },
        required: ['name', 'quantity'],
      },
    },
  },
};

const complexZodSchema = z.fromJSONSchema(complexJsonSchema);
```

### JSON Schema Generator

Advanced JSON Schema generation with reusable schema registry.

```typescript { .api }
/**
 * JSON Schema generator with schema registry
 */
class JSONSchemaGenerator {
  constructor(options?: JSONSchemaOptions);

  /**
   * Add a schema to the registry
   * @param name - Schema name for references
   * @param schema - Zod schema to register
   */
  addSchema(name: string, schema: ZodTypeAny): void;

  /**
   * Generate JSON Schema for a registered schema
   * @param name - Name of registered schema
   * @returns JSON Schema object with definitions
   */
  generate(name: string): JSONSchema7;

  /**
   * Get all definitions
   * @returns Record of schema definitions
   */
  getDefinitions(): Record<string, JSONSchema7>;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Create generator
const generator = new z.JSONSchemaGenerator({
  $refStrategy: 'root',
  errorMessages: true,
});

// Register schemas
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
});

const PersonSchema = z.object({
  name: z.string(),
  age: z.number().int().min(0),
  address: AddressSchema,
});

const CompanySchema = z.object({
  name: z.string(),
  employees: z.array(PersonSchema),
  headquarters: AddressSchema,
});

generator.addSchema('Address', AddressSchema);
generator.addSchema('Person', PersonSchema);
generator.addSchema('Company', CompanySchema);

// Generate JSON Schema with references
const companyJsonSchema = generator.generate('Company');
console.log(companyJsonSchema);
// {
//   type: "object",
//   properties: {
//     name: { type: "string" },
//     employees: {
//       type: "array",
//       items: { $ref: "#/definitions/Person" }
//     },
//     headquarters: { $ref: "#/definitions/Address" }
//   },
//   definitions: {
//     Address: { ... },
//     Person: { ... }
//   }
// }

// Get all definitions
const definitions = generator.getDefinitions();
```

### JSON Schema Type Mappings

How Zod schemas map to JSON Schema types:

```typescript
import * as z from 'zod';

// Primitives
z.string()        // => { type: "string" }
z.number()        // => { type: "number" }
z.boolean()       // => { type: "boolean" }
z.null()          // => { type: "null" }
z.undefined()     // => not included in JSON Schema

// String formats
z.string().email()    // => { type: "string", format: "email" }
z.string().uuid()     // => { type: "string", format: "uuid" }
z.string().url()      // => { type: "string", format: "uri" }
z.iso.datetime()      // => { type: "string", format: "date-time" }
z.iso.date()          // => { type: "string", format: "date" }

// Numbers
z.number().int()      // => { type: "integer" }
z.number().min(5)     // => { type: "number", minimum: 5 }
z.number().max(10)    // => { type: "number", maximum: 10 }

// Strings
z.string().min(3)     // => { type: "string", minLength: 3 }
z.string().max(10)    // => { type: "string", maxLength: 10 }
z.string().regex(/^[a-z]+$/) // => { type: "string", pattern: "^[a-z]+$" }

// Arrays
z.array(z.string())   // => { type: "array", items: { type: "string" } }
z.array(z.number()).min(1) // => { type: "array", items: { type: "number" }, minItems: 1 }

// Objects
z.object({ name: z.string() })
// => { type: "object", properties: { name: { type: "string" } }, required: ["name"] }

// Optional
z.string().optional()  // => property not in required array

// Nullable
z.string().nullable()  // => { type: ["string", "null"] }

// Union
z.union([z.string(), z.number()])  // => { anyOf: [{ type: "string" }, { type: "number" }] }

// Enum
z.enum(['a', 'b', 'c'])  // => { type: "string", enum: ["a", "b", "c"] }

// Literal
z.literal('hello')    // => { type: "string", const: "hello" }
z.literal(42)         // => { type: "number", const: 42 }

// Record
z.record(z.string(), z.number())
// => { type: "object", additionalProperties: { type: "number" } }

// Tuple
z.tuple([z.string(), z.number()])
// => { type: "array", items: [{ type: "string" }, { type: "number" }], minItems: 2, maxItems: 2 }

// Intersection
z.intersection(
  z.object({ a: z.string() }),
  z.object({ b: z.number() })
)  // => { allOf: [{ type: "object", ... }, { type: "object", ... }] }
```

### Use Cases

Common use cases for JSON Schema integration:

```typescript
import * as z from 'zod';

// 1. API documentation generation
const ApiRequestSchema = z.object({
  userId: z.string().uuid().describe('User identifier'),
  action: z.enum(['create', 'update', 'delete']).describe('Action to perform'),
  data: z.record(z.string(), z.any()).describe('Action payload'),
});

const apiDocs = z.toJSONSchema(ApiRequestSchema, {
  name: 'ApiRequest',
  markdownDescription: true,
});

// 2. OpenAPI integration
const openApiSchema = {
  openapi: '3.0.0',
  paths: {
    '/users': {
      post: {
        requestBody: {
          content: {
            'application/json': {
              schema: z.toJSONSchema(ApiRequestSchema),
            },
          },
        },
      },
    },
  },
};

// 3. Form validation with JSON Schema validators
const FormSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  age: z.number().int().min(18),
});

const formJsonSchema = z.toJSONSchema(FormSchema);
// Use with JSON Schema form validators (like react-jsonschema-form)

// 4. Schema migration from JSON Schema
const legacyJsonSchema = loadLegacyJsonSchema();
const zodSchema = z.fromJSONSchema(legacyJsonSchema);
// Now use Zod for runtime validation

declare function loadLegacyJsonSchema(): any;

// 5. Schema documentation
const DocumentedSchema = z.object({
  id: z.string().describe('Unique identifier'),
  name: z.string().min(1).describe('Display name'),
  metadata: z.record(z.string(), z.string()).describe('Additional metadata'),
});

const docs = z.toJSONSchema(DocumentedSchema, {
  name: 'Resource',
  markdownDescription: true,
});
```

## Types

```typescript { .api }
type ZodTypeAny = ZodType<any, any, any>;

interface JSONSchemaOptions {
  name?: string;
  $refStrategy?: 'root' | 'relative' | 'none';
  effectStrategy?: 'input' | 'output' | 'any';
  definitions?: Record<string, ZodTypeAny>;
  errorMessages?: boolean;
  markdownDescription?: boolean;
}

interface FromJSONSchemaOptions {
  errorMap?: ZodErrorMap;
}

type JSONSchema7 = {
  $schema?: string;
  $id?: string;
  $ref?: string;
  $comment?: string;
  title?: string;
  description?: string;
  type?: string | string[];
  enum?: any[];
  const?: any;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  items?: JSONSchema7 | JSONSchema7[];
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  contains?: JSONSchema7;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  properties?: { [key: string]: JSONSchema7 };
  patternProperties?: { [key: string]: JSONSchema7 };
  additionalProperties?: boolean | JSONSchema7;
  dependencies?: { [key: string]: JSONSchema7 | string[] };
  propertyNames?: JSONSchema7;
  if?: JSONSchema7;
  then?: JSONSchema7;
  else?: JSONSchema7;
  allOf?: JSONSchema7[];
  anyOf?: JSONSchema7[];
  oneOf?: JSONSchema7[];
  not?: JSONSchema7;
  format?: string;
  contentMediaType?: string;
  contentEncoding?: string;
  definitions?: { [key: string]: JSONSchema7 };
  [key: string]: any;
};

function toJSONSchema<T extends ZodTypeAny>(
  schema: T,
  options?: JSONSchemaOptions
): JSONSchema7;

function fromJSONSchema(
  jsonSchema: JSONSchema7,
  options?: FromJSONSchemaOptions
): ZodTypeAny;

class JSONSchemaGenerator {
  constructor(options?: JSONSchemaOptions);
  addSchema(name: string, schema: ZodTypeAny): void;
  generate(name: string): JSONSchema7;
  getDefinitions(): Record<string, JSONSchema7>;
}
```
