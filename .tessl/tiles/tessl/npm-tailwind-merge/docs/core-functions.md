# Core Functions

Core functionality for merging and joining Tailwind CSS classes with intelligent conflict resolution and conditional handling.

## Capabilities

### twMerge

Main function to merge Tailwind CSS classes without style conflicts. Uses the default configuration and intelligent conflict resolution.

```typescript { .api }
/**
 * Default function to merge Tailwind CSS classes without style conflicts
 * @param classLists - Class name values to merge
 * @returns Merged class string with conflicts resolved
 */
function twMerge(...classLists: ClassNameValue[]): string;
```

**Usage Examples:**

```typescript
import { twMerge } from "tailwind-merge";

// Basic conflict resolution - later classes override earlier ones
twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]');
// → 'hover:bg-dark-red p-3 bg-[#B91C1C]'

// Handle conditional classes
const isActive = true;
const size = 'large';
twMerge(
  'px-4 py-2 rounded-md',
  isActive && 'bg-blue-500 text-white',
  !isActive && 'bg-gray-200 text-gray-700',
  size === 'large' && 'px-6 py-3 text-lg'
);

// Complex merging with multiple conflicts
twMerge('text-sm text-red-500 hover:text-blue-500', 'text-lg hover:text-green-500');
// → 'text-lg hover:text-green-500'

// Handle arrays and nested values
twMerge('p-4', ['m-2', null, false, ['text-center', undefined]]);
// → 'p-4 m-2 text-center'
```

### twJoin

Function to join className strings conditionally without resolving conflicts. Similar to clsx but optimized for Tailwind classes.

```typescript { .api }
/**
 * Join className strings conditionally without resolving conflicts
 * @param classLists - Class name values to join
 * @returns Joined class string without conflict resolution
 */
function twJoin(...classLists: ClassNameValue[]): string;
```

**Usage Examples:**

```typescript
import { twJoin } from "tailwind-merge";

// Basic joining without conflict resolution
twJoin('px-2 py-1 bg-red', 'p-3 bg-blue');
// → 'px-2 py-1 bg-red p-3 bg-blue' (no conflicts resolved)

// Conditional joining
const hasBackground = true;
const hasLargeText = false;
const hasLargeSpacing = true;

twJoin(
  'border border-red-500',
  hasBackground && 'bg-red-100',
  hasLargeText && 'text-lg',
  hasLargeSpacing && ['p-2', hasLargeText ? 'leading-8' : 'leading-7']
);
// → 'border border-red-500 bg-red-100 p-2 leading-7'

// Handle falsy values
twJoin('base-class', null, undefined, false, 0, '', 'actual-class');
// → 'base-class actual-class'
```

### Performance Characteristics

- **twMerge**: Uses LRU caching for repeated class combinations, optimized for conflict resolution
- **twJoin**: Faster than twMerge when no conflict resolution needed, smaller bundle impact
- Both functions handle nested arrays and conditional values efficiently
- twMerge lazy-initializes configuration on first use for optimal startup performance

### When to Use Each Function

**Use `twMerge` when:**
- You need intelligent conflict resolution between Tailwind classes
- Working with component libraries where class conflicts are common
- Building dynamic UIs with conditional styling that may conflict
- Performance is important and you benefit from caching repeated combinations

**Use `twJoin` when:**
- You only need conditional class joining without conflict resolution
- Bundle size is critical (twJoin is smaller)
- You're certain no conflicting classes will be passed
- You need clsx-like functionality specifically for Tailwind classes

## Types

```typescript { .api }
type ClassNameValue = ClassNameArray | string | null | undefined | 0 | 0n | false;
type ClassNameArray = ClassNameValue[];
type TailwindMerge = (...classLists: ClassNameValue[]) => string;
```