# Real-World Scenarios

Comprehensive examples showing Zod in practical use cases.

## Form Validation

### User Registration Form

```typescript
import * as z from 'zod';

const RegistrationSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (val) => /[A-Z]/.test(val),
      'Password must contain at least one uppercase letter'
    )
    .refine(
      (val) => /[0-9]/.test(val),
      'Password must contain at least one number'
    ),
  
  confirmPassword: z.string(),
  age: z.number().int().min(18, 'Must be 18 or older').max(120),
  acceptTerms: z.boolean().refine((val) => val === true, 'Must accept terms'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

// Usage
function validateRegistration(formData: unknown) {
  const result = RegistrationSchema.safeParse(formData);
  
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
```

### Multi-Step Form

```typescript
const Step1Schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});

const Step2Schema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().regex(/^\d{5}$/),
  country: z.string().min(1),
});

const Step3Schema = z.object({
  paymentMethod: z.enum(['credit', 'debit', 'paypal']),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
}).refine(
  (data) => {
    if (data.paymentMethod !== 'paypal') {
      return data.cardNumber && data.expiryDate;
    }
    return true;
  },
  {
    message: 'Card details required for credit/debit payments',
    path: ['cardNumber'],
  }
);
```

## API Request/Response Validation

### REST API Request Validation

```typescript
const CreateUserRequest = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['user', 'admin', 'moderator']).default('user'),
  metadata: z.record(z.string(), z.any()).optional(),
});

const UpdateUserRequest = CreateUserRequest.partial();

// Express.js middleware
function validateRequest(schema: z.ZodTypeAny) {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.format(),
      });
    }
    
    req.validated = result.data;
    next();
  };
}

// Usage
app.post('/users', validateRequest(CreateUserRequest), (req, res) => {
  // req.validated is typed and validated
  const user = createUser(req.validated);
  res.json(user);
});
```

### API Response Validation

```typescript
const UserResponse = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const UsersListResponse = z.object({
  users: z.array(UserResponse),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

// Validate API responses
async function fetchUsers(): Promise<z.infer<typeof UsersListResponse>> {
  const response = await fetch('/api/users');
  const data = await response.json();
  return UsersListResponse.parse(data); // Validates and types the response
}
```

### GraphQL Input Validation

```typescript
const CreatePostInput = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).max(10),
  published: z.boolean().default(false),
  authorId: z.string().uuid(),
});

const UpdatePostInput = CreatePostInput.partial().extend({
  id: z.string().uuid(),
});
```

## Environment Variables

### Application Configuration

```typescript
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  API_KEY: z.string().min(1),
  DEBUG: z.coerce.boolean().default(false),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  MAX_CONNECTIONS: z.coerce.number().int().positive().default(10),
});

// Load and validate environment
const env = EnvSchema.parse(process.env);

// Now env is fully typed and validated
console.log(env.PORT); // number, guaranteed to be 1-65535
```

### Feature Flags

```typescript
const FeatureFlagsSchema = z.object({
  enableNewUI: z.coerce.boolean().default(false),
  enableBetaFeatures: z.coerce.boolean().default(false),
  maxUploadSize: z.coerce.number().int().positive().default(10485760), // 10MB
  rateLimitPerMinute: z.coerce.number().int().positive().default(100),
});

const flags = FeatureFlagsSchema.parse(process.env);
```

## Database Models

### User Model with Relationships

```typescript
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['user', 'admin']).default('user'),
  createdAt: z.date(),
  updatedAt: z.date(),
  profile: z.object({
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
    location: z.string().optional(),
  }).optional(),
});

const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  authorId: z.string().uuid(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type inference
type User = z.infer<typeof UserSchema>;
type Post = z.infer<typeof PostSchema>;
```

## URL Query Parameters

### Search and Pagination

```typescript
const SearchQuerySchema = z.object({
  q: z.string().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'date', 'relevance']).default('relevance'),
  order: z.enum(['asc', 'desc']).default('desc'),
  filters: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
});

// Parse URL search params
function parseSearchParams(searchParams: URLSearchParams) {
  const params = Object.fromEntries(searchParams.entries());
  return SearchQuerySchema.parse(params);
}

// Usage
const params = parseSearchParams(new URL(req.url).searchParams);
// params is typed: { q?: string, page: number, limit: number, ... }
```

## File Upload Validation

### Image Upload

```typescript
const ImageUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be an image (JPEG, PNG, or WebP)'
    ),
  alt: z.string().max(200).optional(),
  category: z.string().optional(),
});

// With multiple files
const MultipleImageUploadSchema = z.object({
  images: z.array(ImageUploadSchema.shape.file)
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  albumName: z.string().min(1).max(100),
});
```

## Webhook Payloads

### Stripe Webhook

```typescript
const StripeEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.string(), z.any()),
  }),
  created: z.number(),
});

const PaymentIntentSucceededSchema = StripeEventSchema.extend({
  type: z.literal('payment_intent.succeeded'),
  data: z.object({
    object: z.object({
      id: z.string(),
      amount: z.number().int().positive(),
      currency: z.string().length(3),
      customer: z.string().optional(),
      metadata: z.record(z.string(), z.string()).optional(),
    }),
  }),
});

// Validate webhook payload
function handleStripeWebhook(payload: unknown) {
  const event = StripeEventSchema.parse(payload);
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentEvent = PaymentIntentSucceededSchema.parse(payload);
    // Handle payment success
    processPayment(paymentEvent.data.object);
  }
}
```

## Configuration Files

### JSON Configuration

```typescript
const AppConfigSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  api: z.object({
    baseUrl: z.string().url(),
    timeout: z.number().int().positive().default(5000),
    retries: z.number().int().min(0).max(5).default(3),
  }),
  features: z.object({
    enableCache: z.boolean().default(true),
    enableLogging: z.boolean().default(true),
    cacheTTL: z.number().int().positive().default(3600),
  }),
  database: z.object({
    host: z.string(),
    port: z.number().int().min(1).max(65535),
    name: z.string().min(1),
    ssl: z.boolean().default(false),
  }),
});

// Load and validate config
function loadConfig(path: string) {
  const configFile = require(path);
  return AppConfigSchema.parse(configFile);
}
```

## Data Transformation

### API Response Normalization

```typescript
// External API returns snake_case
const ExternalUserSchema = z.object({
  user_id: z.string(),
  full_name: z.string(),
  email_address: z.string().email(),
  created_at: z.string(),
});

// Transform to camelCase
const UserSchema = ExternalUserSchema.transform((data) => ({
  userId: data.user_id,
  fullName: data.full_name,
  email: data.email_address,
  createdAt: new Date(data.created_at),
}));

// Usage
const externalData = await fetchExternalAPI();
const normalizedUser = UserSchema.parse(externalData);
// { userId: string, fullName: string, email: string, createdAt: Date }
```

### Form Data Processing

```typescript
const FormInputSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  birthYear: z.string(),
  interests: z.string(), // Comma-separated
});

const ProcessedFormSchema = FormInputSchema.transform((data) => ({
  fullName: `${data.firstName} ${data.lastName}`,
  age: new Date().getFullYear() - parseInt(data.birthYear, 10),
  interests: data.interests.split(',').map(s => s.trim()).filter(Boolean),
}));
```

## State Management

### Redux Action Validation

```typescript
const ActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('USER_LOGIN'),
    payload: z.object({
      userId: z.string().uuid(),
      token: z.string(),
    }),
  }),
  z.object({
    type: z.literal('USER_LOGOUT'),
  }),
  z.object({
    type: z.literal('UPDATE_PROFILE'),
    payload: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
    }),
  }),
]);

// Redux middleware
function validateAction(action: unknown) {
  return ActionSchema.parse(action);
}
```

## CSV Data Processing

### CSV Row Validation

```typescript
const CsvRowSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.coerce.string().trim().min(1),
  email: z.coerce.string().email(),
  age: z.coerce.number().int().min(0).max(120),
  active: z.coerce.boolean(),
  createdAt: z.coerce.date(),
});

// Process CSV file
async function processCSV(file: File) {
  const text = await file.text();
  const lines = text.split('\n');
  const headers = lines[0].split(',');
  
  const rows = lines.slice(1)
    .map(line => {
      const values = line.split(',');
      const row = Object.fromEntries(
        headers.map((h, i) => [h.trim(), values[i]?.trim()])
      );
      return CsvRowSchema.parse(row);
    });
  
  return rows;
}
```

