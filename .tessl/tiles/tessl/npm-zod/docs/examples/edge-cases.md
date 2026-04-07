# Edge Cases and Advanced Scenarios

Advanced patterns, corner cases, and complex scenarios with Zod.

## Recursive Schemas

### Tree Structure

```typescript
interface TreeNode {
  value: string;
  children: TreeNode[];
}

const TreeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    value: z.string(),
    children: z.array(TreeNodeSchema),
  })
);

// Usage
const tree = TreeNodeSchema.parse({
  value: 'root',
  children: [
    {
      value: 'child1',
      children: [
        { value: 'grandchild1', children: [] },
      ],
    },
    {
      value: 'child2',
      children: [],
    },
  ],
});
```

### Linked List

```typescript
interface LinkedListNode {
  value: number;
  next: LinkedListNode | null;
}

const LinkedListNodeSchema: z.ZodType<LinkedListNode> = z.lazy(() =>
  z.object({
    value: z.number(),
    next: z.union([LinkedListNodeSchema, z.null()]),
  })
);
```

### Category Hierarchy

```typescript
interface Category {
  name: string;
  subcategories: Category[];
}

const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(CategorySchema),
  })
);
```

## Async Validation

### Async Refinements

```typescript
const UniqueUsernameSchema = z.string().refine(
  async (username) => {
    const exists = await checkUsernameExists(username);
    return !exists;
  },
  { message: 'Username already taken' }
);

// Must use parseAsync or safeParseAsync
const result = await UniqueUsernameSchema.safeParseAsync('newuser');
```

### Multiple Async Checks

```typescript
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
```

### Async Transformations

```typescript
const EnrichedUserSchema = z.object({
  userId: z.string(),
}).transform(async (data) => {
  const userData = await fetchUserData(data.userId);
  return { ...data, ...userData };
});
```

## Complex Transformations

### Multi-Step Transformation Chain

```typescript
const ProcessedStringSchema = z.string()
  .trim()
  .transform((s) => s.toLowerCase())
  .transform((s) => s.replace(/\s+/g, '-'))
  .refine((s) => s.length >= 3, 'Too short after processing')
  .transform((s) => ({ slug: s, normalized: true }));
```

### Conditional Transformations

```typescript
const FlexibleDateSchema = z.union([
  z.string().transform((s) => new Date(s)),
  z.number().transform((n) => new Date(n)),
  z.date(),
]).refine((date) => !isNaN(date.getTime()), 'Invalid date');
```

### Transform with Validation

```typescript
const ParsedDateSchema = z.string()
  .transform((str) => new Date(str))
  .refine((date) => !isNaN(date.getTime()), 'Invalid date')
  .refine((date) => date > new Date(), 'Date must be in the future');
```

## Discriminated Unions

### API Response Types

```typescript
const APIResponseSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('success'),
    data: z.any(),
    timestamp: z.string(),
  }),
  z.object({
    status: z.literal('error'),
    error: z.string(),
    code: z.number(),
    timestamp: z.string(),
  }),
  z.object({
    status: z.literal('pending'),
    requestId: z.string(),
    estimatedTime: z.number().optional(),
  }),
]);

// TypeScript narrows automatically
function handleResponse(response: z.infer<typeof APIResponseSchema>) {
  switch (response.status) {
    case 'success':
      console.log(response.data); // TypeScript knows data exists
      break;
    case 'error':
      console.error(response.error, response.code); // TypeScript knows error and code exist
      break;
    case 'pending':
      console.log(response.requestId); // TypeScript knows requestId exists
      break;
  }
}
```

### Event System

```typescript
const EventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('click'),
    x: z.number(),
    y: z.number(),
    button: z.enum(['left', 'right', 'middle']).default('left'),
  }),
  z.object({
    type: z.literal('keypress'),
    key: z.string(),
    ctrl: z.boolean().default(false),
    shift: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('scroll'),
    deltaX: z.number(),
    deltaY: z.number(),
  }),
]);
```

## Exclusive Unions (XOR)

### Authentication Methods

```typescript
const AuthMethodSchema = z.xor([
  z.object({
    username: z.string(),
    password: z.string(),
  }),
  z.object({
    token: z.string(),
  }),
  z.object({
    apiKey: z.string(),
    apiSecret: z.string(),
  }),
]);

// Valid: exactly one method
AuthMethodSchema.parse({ username: 'user', password: 'pass' }); // ✓
AuthMethodSchema.parse({ token: 'abc123' }); // ✓

// Invalid: multiple or no methods
// AuthMethodSchema.parse({ username: 'user', token: 'abc' }); // ✗
// AuthMethodSchema.parse({}); // ✗
```

## Bidirectional Codecs

### Date Serialization

```typescript
const DateCodec = z.codec(
  // Encode: Date -> string (for storage/API)
  z.date().transform((date) => date.toISOString()),
  // Decode: string -> Date (from storage/API)
  z.string().transform((str) => new Date(str))
);

// Decode from API
const date = DateCodec.decode('2024-01-15T10:30:00.000Z'); // Date object

// Encode for API
const isoString = DateCodec.encode(new Date('2024-01-15')); // ISO string
```

### API Format Conversion

```typescript
const ApiUserCodec = z.codec(
  // Encode: domain model -> API format
  z.object({
    userId: z.string(),
    fullName: z.string(),
    createdAt: z.date(),
  }).transform((data) => ({
    user_id: data.userId,
    full_name: data.fullName,
    created_at: data.createdAt.getTime(),
  })),
  // Decode: API format -> domain model
  z.object({
    user_id: z.string(),
    full_name: z.string(),
    created_at: z.number(),
  }).transform((data) => ({
    userId: data.user_id,
    fullName: data.full_name,
    createdAt: new Date(data.created_at),
  }))
);
```

## Template Literals

### URL Patterns

```typescript
const UrlPatternSchema = z.templateLiteral([
  z.literal('https://'),
  z.string(),
  z.literal('.com'),
]);

type UrlPattern = z.infer<typeof UrlPatternSchema>; // `https://${string}.com`
UrlPatternSchema.parse('https://example.com'); // ✓
```

### ID Patterns

```typescript
const IdPatternSchema = z.templateLiteral([
  z.literal('user_'),
  z.number(),
]);

type IdPattern = z.infer<typeof IdPatternSchema>; // `user_${number}`
IdPatternSchema.parse('user_123'); // ✓
```

## Custom Validators

### Type Guards

```typescript
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
```

### Instance Validation

```typescript
class User {
  constructor(public name: string) {}
}

const UserSchema = z.instanceof(User);
UserSchema.parse(new User('Alice')); // ✓
// UserSchema.parse({ name: 'Bob' }); // ✗
```

## Preprocessing

### Flexible Input Handling

```typescript
// Accept string or number, normalize to number
const NumberFromStringSchema = z.preprocess(
  (val) => typeof val === 'string' ? parseFloat(val) : val,
  z.number()
);

NumberFromStringSchema.parse('42.5'); // 42.5
NumberFromStringSchema.parse(42.5); // 42.5
```

### Empty String to Undefined

```typescript
const OptionalFieldSchema = z.preprocess(
  (val) => val === '' ? undefined : val,
  z.string().optional()
);

OptionalFieldSchema.parse(''); // undefined
OptionalFieldSchema.parse('hello'); // 'hello'
```

### Array Coercion

```typescript
const ArrayFieldSchema = z.preprocess(
  (val) => Array.isArray(val) ? val : [val],
  z.array(z.string())
);

ArrayFieldSchema.parse('single'); // ['single']
ArrayFieldSchema.parse(['multiple', 'items']); // ['multiple', 'items']
```

## Error Recovery

### Catch with Fallback

```typescript
const SafeNumberSchema = z.number().catch(0);
SafeNumberSchema.parse(42); // 42
SafeNumberSchema.parse('invalid'); // 0 (no throw)

// With error inspection
const SafeStringSchema = z.string().catch((error) => {
  console.error('Parse error:', error.message);
  return 'fallback';
});
```

### Config with Defaults

```typescript
const ConfigSchema = z.object({
  port: z.number().catch(3000),
  host: z.string().catch('localhost'),
  debug: z.boolean().catch(false),
});

// Parsing bad config returns defaults
ConfigSchema.parse({ port: 'invalid', host: 123 });
// => { port: 3000, host: 'localhost', debug: false }
```

## Prefault vs Default

### Prefault (Input Default)

```typescript
// Prefault applies before transformation
const SchemaWithPrefault = z.string()
  .transform((s) => s.toUpperCase())
  .prefault('hello');

SchemaWithPrefault.parse(undefined); // "HELLO" (prefault value transformed)
SchemaWithPrefault.parse('world'); // "WORLD"
```

### Default (Output Default)

```typescript
// Default applies after transformation
const SchemaWithDefault = z.string()
  .transform((s) => s.length)
  .default(0);

SchemaWithDefault.parse(undefined); // 0 (no transformation)
SchemaWithDefault.parse('hello'); // 5
```

## Branded Types

### Type-Safe IDs

```typescript
const UserIdSchema = z.string().uuid().brand<'UserId'>();
const OrderIdSchema = z.string().uuid().brand<'OrderId'>();

type UserId = z.infer<typeof UserIdSchema>; // string & { [z.$brand]: "UserId" }
type OrderId = z.infer<typeof OrderIdSchema>; // string & { [z.$brand]: "OrderId" }

// Runtime they're both strings, but TypeScript treats them as different types
const userId: UserId = UserIdSchema.parse('550e8400-e29b-41d4-a716-446655440000');
const orderId: OrderId = OrderIdSchema.parse('123e4567-e89b-12d3-a456-426614174000');

// Type error: can't assign one to the other
// const x: UserId = orderId; // TypeScript error
```

### Domain Modeling

```typescript
const EmailSchema = z.string().email().brand<'Email'>();
const URLSchema = z.string().url().brand<'URL'>();
const UUIDSchema = z.string().uuid().brand<'UUID'>();

// Function only accepts branded types
function sendEmail(to: z.infer<typeof EmailSchema>, subject: string) {
  // Implementation
}

const email = EmailSchema.parse('user@example.com');
sendEmail(email, 'Hello'); // OK
// sendEmail('user@example.com', 'Hello'); // TypeScript error
```

## Complex Object Manipulation

### Deep Partial

```typescript
const UserSchema = z.object({
  name: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
  }),
  tags: z.array(z.string()),
});

// Make all fields optional recursively
const PartialUserSchema = UserSchema.deepPartial();
// { name?: string; address?: { street?: string; city?: string }; tags?: string[] }
```

### Pick and Omit

```typescript
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(['user', 'admin']),
});

// Pick specific fields
const PublicUserSchema = UserSchema.pick({ id: true, name: true, email: true });

// Omit sensitive fields
const SafeUserSchema = UserSchema.omit({ password: true });
```

### Merge and Extend

```typescript
const BaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
});

const UserSchema = BaseSchema.extend({
  name: z.string(),
  email: z.string().email(),
});

const AdminSchema = BaseSchema.merge(z.object({
  name: z.string(),
  permissions: z.array(z.string()),
}));
```

## Promise Validation

### Async Function Return Types

```typescript
const AsyncUserSchema = z.promise(
  z.object({
    id: z.string(),
    name: z.string(),
  })
);

type AsyncUser = z.infer<typeof AsyncUserSchema>; // Promise<{ id: string; name: string }>

async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

const user = await AsyncUserSchema.parse(fetchUser('123'));
```

## Function Schemas

### Validated Function Signatures

```typescript
const AddFunctionSchema = z._function({
  args: z.tuple([z.number(), z.number()]),
  returns: z.number(),
});

// Implement a validated function
const add = AddFunctionSchema.implement((a, b) => {
  return a + b; // TypeScript knows a and b are numbers
});

add(5, 3); // 8
// add('5', 3); // TypeScript error
```

### Async Function Schema

```typescript
const AsyncFunctionSchema = z._function({
  args: z.tuple([z.string()]),
  returns: z.promise(z.object({ data: z.string() })),
});

const fetchData = AsyncFunctionSchema.implement(async (url) => {
  const response = await fetch(url);
  const data = await response.text();
  return { data };
});
```

