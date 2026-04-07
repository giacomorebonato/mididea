# ISO Date and Time

Validators for ISO 8601 formatted datetime, date, time, and duration strings with precision and timezone configuration.

## Capabilities

### ISO Datetime

Creates a string schema that validates ISO 8601 datetime format with configurable precision and timezone handling.

```typescript { .api }
/**
 * Create an ISO 8601 datetime string validator
 * @param params - Optional configuration for precision and timezone
 * @returns String schema with ISO datetime validation
 */
namespace iso {
  function datetime(params?: ISODateTimeParams): ZodISODateTime;
}

interface ISODateTimeParams extends StringParams {
  precision?: number;
  offset?: boolean;
  local?: boolean;
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

// Basic ISO datetime
const DateTime = z.iso.datetime();
DateTime.parse('2024-01-15T10:30:00.000Z'); // => valid
DateTime.parse('2024-01-15T10:30:00Z'); // => valid
DateTime.parse('2024-01-15T10:30:00+05:30'); // => valid

// With millisecond precision
const PreciseDateTime = z.iso.datetime({ precision: 3 });
PreciseDateTime.parse('2024-01-15T10:30:00.123Z'); // => valid

// Require timezone offset
const WithOffset = z.iso.datetime({ offset: true });
WithOffset.parse('2024-01-15T10:30:00+00:00'); // => valid
// WithOffset.parse('2024-01-15T10:30:00'); // throws (no offset)

// Local datetime (no timezone)
const LocalDateTime = z.iso.datetime({ local: true });
LocalDateTime.parse('2024-01-15T10:30:00'); // => valid
// LocalDateTime.parse('2024-01-15T10:30:00Z'); // throws (has timezone)

// Combined options
const CustomDateTime = z.iso.datetime({
  precision: 6,
  offset: true,
  invalid_type_error: 'Must be a valid ISO datetime',
});

// In object schemas
const Event = z.object({
  id: z.string(),
  name: z.string(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
});

// Transform to Date
const DateTimeToDate = z.iso.datetime().transform((str) => new Date(str));
```

### String Schema datetime Method

ISO datetime validation is also available as a method on string schemas:

```typescript
import * as z from 'zod';

const DateTime = z.string().datetime();
const PreciseDateTime = z.string().datetime({ precision: 3 });
const WithOffset = z.string().datetime({ offset: true });
```

### ISO Date

Creates a string schema that validates ISO 8601 date format (YYYY-MM-DD).

```typescript { .api }
/**
 * Create an ISO 8601 date string validator
 * @param params - Optional configuration for error handling
 * @returns String schema with ISO date validation
 */
namespace iso {
  function date(params?: ISODateParams): ZodISODate;
}

interface ISODateParams extends StringParams {}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic ISO date
const Date = z.iso.date();
Date.parse('2024-01-15'); // => valid
Date.parse('2024-12-31'); // => valid
Date.parse('1999-01-01'); // => valid

// Date.parse('2024-1-5'); // throws (must be zero-padded)
// Date.parse('2024/01/15'); // throws (wrong format)

// In object schemas
const DateRange = z.object({
  start: z.iso.date(),
  end: z.iso.date(),
});

DateRange.parse({
  start: '2024-01-01',
  end: '2024-12-31',
}); // => valid

// Transform to Date object
const DateToObject = z.iso.date().transform((str) => new Date(str));

// Validation with refinement
const FutureDate = z.iso.date().refine((dateStr) => {
  const date = new Date(dateStr);
  return date > new Date();
}, 'Date must be in the future');

// Birth date
const BirthDate = z.iso.date().refine((dateStr) => {
  const date = new Date(dateStr);
  const age = new Date().getFullYear() - date.getFullYear();
  return age >= 18 && age <= 120;
}, 'Invalid birth date');
```

### String Schema date Method

ISO date validation is also available as a method on string schemas:

```typescript
import * as z from 'zod';

const Date = z.string().date();
const BirthDate = z.string().date().refine((d) => new Date(d) < new Date());
```

### ISO Time

Creates a string schema that validates ISO 8601 time format (HH:mm:ss).

```typescript { .api }
/**
 * Create an ISO 8601 time string validator
 * @param params - Optional configuration for precision
 * @returns String schema with ISO time validation
 */
namespace iso {
  function time(params?: ISOTimeParams): ZodISOTime;
}

interface ISOTimeParams extends StringParams {
  precision?: number;
}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic ISO time
const Time = z.iso.time();
Time.parse('10:30:00'); // => valid
Time.parse('23:59:59'); // => valid
Time.parse('00:00:00'); // => valid

// With millisecond precision
const PreciseTime = z.iso.time({ precision: 3 });
PreciseTime.parse('10:30:00.123'); // => valid
PreciseTime.parse('14:25:30.000'); // => valid

// With microsecond precision
const MicroTime = z.iso.time({ precision: 6 });
MicroTime.parse('10:30:00.123456'); // => valid

// In object schemas
const Schedule = z.object({
  openTime: z.iso.time(),
  closeTime: z.iso.time(),
});

Schedule.parse({
  openTime: '09:00:00',
  closeTime: '17:00:00',
}); // => valid

// Business hours validation
const BusinessHours = z.object({
  open: z.iso.time(),
  close: z.iso.time(),
}).refine((data) => {
  const open = parseTime(data.open);
  const close = parseTime(data.close);
  return close > open;
}, 'Close time must be after open time');

function parseTime(timeStr: string): number {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// Time with timezone
const TimeWithZone = z.string().time({ precision: 3 }).regex(/[+-]\d{2}:\d{2}$/);
```

### String Schema time Method

ISO time validation is also available as a method on string schemas:

```typescript
import * as z from 'zod';

const Time = z.string().time();
const PreciseTime = z.string().time({ precision: 3 });
```

### ISO Duration

Creates a string schema that validates ISO 8601 duration format (P[n]Y[n]M[n]DT[n]H[n]M[n]S).

```typescript { .api }
/**
 * Create an ISO 8601 duration string validator
 * @param params - Optional configuration for error handling
 * @returns String schema with ISO duration validation
 */
namespace iso {
  function duration(params?: ISODurationParams): ZodISODuration;
}

interface ISODurationParams extends StringParams {}
```

**Usage Examples:**

```typescript
import * as z from 'zod';

// Basic ISO duration
const Duration = z.iso.duration();
Duration.parse('P1Y'); // => valid (1 year)
Duration.parse('P3Y6M4D'); // => valid (3 years, 6 months, 4 days)
Duration.parse('PT12H30M5S'); // => valid (12 hours, 30 minutes, 5 seconds)
Duration.parse('P1DT12H'); // => valid (1 day and 12 hours)
Duration.parse('PT0.5S'); // => valid (0.5 seconds)

// Common durations
Duration.parse('PT1H'); // 1 hour
Duration.parse('PT30M'); // 30 minutes
Duration.parse('P7D'); // 7 days
Duration.parse('P1W'); // 1 week
Duration.parse('P1M'); // 1 month
Duration.parse('P1Y'); // 1 year

// In object schemas
const Video = z.object({
  title: z.string(),
  duration: z.iso.duration(),
});

Video.parse({
  title: 'Tutorial',
  duration: 'PT15M30S', // 15 minutes 30 seconds
}); // => valid

// Subscription period
const Subscription = z.object({
  plan: z.enum(['monthly', 'yearly']),
  billingPeriod: z.iso.duration(),
});

Subscription.parse({
  plan: 'monthly',
  billingPeriod: 'P1M',
}); // => valid

// Transform to milliseconds
const DurationToMs = z.iso.duration().transform((dur) => {
  // Parse duration and convert to milliseconds
  return parseDurationToMs(dur);
});

function parseDurationToMs(duration: string): number {
  // Implementation would parse ISO 8601 duration
  return 0;
}

// Time interval
const TimeInterval = z.object({
  start: z.iso.datetime(),
  duration: z.iso.duration(),
});
```

### String Schema duration Method

ISO duration validation is also available as a method on string schemas:

```typescript
import * as z from 'zod';

const Duration = z.string().duration();
const VideoDuration = z.string().duration().refine((d) => {
  const ms = parseDurationToMs(d);
  return ms <= 3600000; // Max 1 hour
}, 'Video too long');

function parseDurationToMs(duration: string): number {
  return 0; // Implementation
}
```

### Combined Usage Patterns

Common patterns for using ISO datetime schemas together:

```typescript
import * as z from 'zod';

// Event with date and time
const Event = z.object({
  title: z.string(),
  date: z.iso.date(),
  startTime: z.iso.time(),
  endTime: z.iso.time(),
  duration: z.iso.duration(),
});

// API timestamp fields
const ApiRecord = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
});

// Schedule with recurrence
const RecurringEvent = z.object({
  title: z.string(),
  startDate: z.iso.date(),
  startTime: z.iso.time(),
  duration: z.iso.duration(),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    interval: z.number().int().positive(),
  }),
});

// Date range query
const DateRangeQuery = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
}).refine((data) => data.to >= data.from, {
  message: 'End date must be after start date',
  path: ['to'],
});

// Transform ISO strings to Date objects
const TimestampedRecord = z.object({
  id: z.string(),
  timestamp: z.iso.datetime().transform((s) => new Date(s)),
  date: z.iso.date().transform((s) => new Date(s)),
});

type TimestampedRecord = z.infer<typeof TimestampedRecord>;
// { id: string; timestamp: Date; date: Date }
```

## Types

```typescript { .api }
class ZodISODateTime {
  readonly _type: 'ZodISODateTime';
  readonly precision?: number;
  readonly offset?: boolean;
  readonly local?: boolean;

  parse(data: unknown): string;
  safeParse(data: unknown): SafeParseReturnType<unknown, string>;
}

class ZodISODate {
  readonly _type: 'ZodISODate';

  parse(data: unknown): string;
  safeParse(data: unknown): SafeParseReturnType<unknown, string>;
}

class ZodISOTime {
  readonly _type: 'ZodISOTime';
  readonly precision?: number;

  parse(data: unknown): string;
  safeParse(data: unknown): SafeParseReturnType<unknown, string>;
}

class ZodISODuration {
  readonly _type: 'ZodISODuration';

  parse(data: unknown): string;
  safeParse(data: unknown): SafeParseReturnType<unknown, string>;
}

type ErrorMapFunction = (
  issue: ZodIssueOptionalMessage,
  ctx: ErrorMapCtx
) => { message: string };

interface ErrorMapCtx {
  defaultError: string;
  data: any;
}

type SafeParseReturnType<Input, Output> =
  | { success: true; data: Output }
  | { success: false; error: ZodError<Input> };

class ZodError<T = any> extends Error {
  issues: ZodIssue[];
}
```
