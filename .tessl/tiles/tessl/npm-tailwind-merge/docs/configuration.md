# Configuration

Advanced configuration system for extending or customizing tailwind-merge behavior with custom class groups, theme scales, and conflict resolution rules.

## Capabilities

### extendTailwindMerge

Function to create merge function with custom config that extends the default config. Use this if you use the default Tailwind config and just modified it in some places.

```typescript { .api }
/**
 * Create merge function with custom config which extends the default config
 * @param configExtension - Configuration extension object
 * @param createConfig - Additional config transformation functions
 * @returns Custom tailwind merge function
 */
function extendTailwindMerge<
  AdditionalClassGroupIds extends string = never,
  AdditionalThemeGroupIds extends string = never,
>(
  configExtension: ConfigExtension<
    DefaultClassGroupIds | AdditionalClassGroupIds,
    DefaultThemeGroupIds | AdditionalThemeGroupIds
  >,
  ...createConfig: CreateConfigSubsequent[]
): TailwindMerge;

/**
 * Create merge function using only config transformation functions
 */
function extendTailwindMerge<
  AdditionalClassGroupIds extends string = never,
  AdditionalThemeGroupIds extends string = never,
>(...createConfig: CreateConfigSubsequent[]): TailwindMerge;
```

**Usage Examples:**

```typescript
import { extendTailwindMerge, validators } from "tailwind-merge";

// Basic extension with custom class groups
type AdditionalClassGroupIds = 'aspect-w' | 'aspect-h' | 'aspect-reset';

const customTwMerge = extendTailwindMerge<AdditionalClassGroupIds>({
  // Override cache size (0 disables caching)
  cacheSize: 100,
  // Custom prefix from Tailwind config
  prefix: 'tw-',
  // Custom separator from Tailwind config  
  separator: '_',
  
  extend: {
    // Add custom class groups
    classGroups: {
      'aspect-w': [{ 'aspect-w': [(value) => Boolean(value) && !isNaN(value)] }],
      'aspect-h': [{ 'aspect-h': [(value) => Boolean(value) && !isNaN(value)] }],
      'aspect-reset': ['aspect-none'],
      // Use built-in validators
      'prose-size': [{ prose: ['base', validators.isTshirtSize] }],
    },
    // Define conflicts between class groups
    conflictingClassGroups: {
      'aspect-reset': ['aspect-w', 'aspect-h'],
    },
    // Extend theme scales
    theme: {
      spacing: ['sm', 'md', 'lg'],
    },
  },
  
  override: {
    // Override existing class groups completely
    classGroups: {
      shadow: [{ shadow: ['100', '200', '300', '400', '500'] }],
    },
    // Override theme scales
    theme: {
      colors: ['black', 'white', 'yellow-500'],
    },
  },
});

// Using custom merge function
customTwMerge('aspect-w-16 aspect-h-9', 'aspect-none');
// → 'aspect-none' (conflict resolved)
```

### createTailwindMerge

Function to create merge function with completely custom config. Use this instead of `extendTailwindMerge` if you don't need the default config or want more control.

```typescript { .api }
/**
 * Create merge function with completely custom config
 * @param createConfigFirst - Function returning the base config
 * @param createConfigRest - Additional config transformation functions
 * @returns Custom tailwind merge function
 */
function createTailwindMerge(
  createConfigFirst: () => AnyConfig,
  ...createConfigRest: CreateConfigSubsequent[]
): TailwindMerge;
```

**Usage Examples:**

```typescript
import { createTailwindMerge, getDefaultConfig } from "tailwind-merge";

// Create custom merge function from scratch
const customTwMerge = createTailwindMerge(() => ({
  cacheSize: 0,
  separator: ':',
  theme: {},
  classGroups: {
    foo: ['foo', 'foo-2', { 'bar-baz': ['', '1', '2'] }],
    bar: [{ qux: ['auto', (value) => Number(value) >= 1000] }],
    baz: ['baz-sm', 'baz-md', 'baz-lg'],
  },
  conflictingClassGroups: {
    foo: ['bar'],
  },
  conflictingClassGroupModifiers: {
    baz: ['bar'],
  },
}));

// Extend from default config
const extendedTwMerge = createTailwindMerge(
  getDefaultConfig,
  (config) => ({
    ...config,
    classGroups: {
      ...config.classGroups,
      mySpecialClassGroup: [{ special: ['1', '2'] }],
    },
  })
);
```

### getDefaultConfig

Function which returns the default config used by tailwind-merge.

```typescript { .api }
/**
 * Get the default configuration used by tailwind-merge
 * @returns Default configuration object
 */
function getDefaultConfig(): Config<DefaultClassGroupIds, DefaultThemeGroupIds>;
```

**Usage Examples:**

```typescript
import { getDefaultConfig } from "tailwind-merge";

const defaultConfig = getDefaultConfig();
console.log(defaultConfig.classGroups); // All default class groups
console.log(defaultConfig.theme); // Default theme scales
console.log(defaultConfig.conflictingClassGroups); // Default conflict rules
```

### mergeConfigs

Helper function to merge multiple tailwind-merge configurations safely.

```typescript { .api }
/**
 * Merge multiple tailwind-merge configurations
 * @param baseConfig - Base configuration to merge into (will be mutated)
 * @param configExtension - Configuration extension to merge
 * @returns Merged configuration
 */
function mergeConfigs<ClassGroupIds extends string, ThemeGroupIds extends string = never>(
  baseConfig: AnyConfig,
  configExtension: ConfigExtension<ClassGroupIds, ThemeGroupIds>
): AnyConfig;
```

**Usage Examples:**

```typescript
import { createTailwindMerge, getDefaultConfig, mergeConfigs } from "tailwind-merge";

const customTwMerge = createTailwindMerge(
  getDefaultConfig,
  (config) => mergeConfigs<'shadow' | 'animate' | 'prose'>(config, {
    override: {
      classGroups: {
        // Override existing class group
        shadow: [{ shadow: ['100', '200', '300', '400', '500'] }],
      },
    },
    extend: {
      classGroups: {
        // Add to existing class group
        animate: ['animate-shimmer'],
        // Add new class group
        prose: [{ prose: ['', validators.isTshirtSize] }],
      },
    },
  })
);
```

### fromTheme

Function to retrieve values from a theme scale, to be used in class group definitions.

```typescript { .api }
/**
 * Create theme getter function for accessing theme scale values
 * @param key - Theme scale key to access
 * @returns Theme getter function with isThemeGetter property
 */
function fromTheme<
  AdditionalThemeGroupIds extends string = never,
  DefaultThemeGroupIdsInner extends string = DefaultThemeGroupIds,
>(key: NoInfer<DefaultThemeGroupIdsInner | AdditionalThemeGroupIds>): ThemeGetter;

interface ThemeGetter {
  (theme: ThemeObject<AnyThemeGroupIds>): ClassGroup<AnyClassGroupIds>;
  isThemeGetter: true;
}
```

**Usage Examples:**

```typescript
import { extendTailwindMerge, fromTheme } from "tailwind-merge";

type AdditionalThemeGroupIds = 'my-scale';

const customTwMerge = extendTailwindMerge<string, AdditionalThemeGroupIds>({
  extend: {
    theme: {
      'my-scale': ['foo', 'bar'],
    },
    classGroups: {
      'my-group': [{
        'my-group': [
          fromTheme<AdditionalThemeGroupIds>('my-scale'),
          fromTheme('spacing'), // Built-in theme scale
        ],
      }],
    },
  },
});
```

## Configuration Types

```typescript { .api }
interface Config<ClassGroupIds extends string, ThemeGroupIds extends string>
  extends ConfigStaticPart, ConfigGroupsPart<ClassGroupIds, ThemeGroupIds> {}

interface ConfigStaticPart {
  /** Integer indicating size of LRU cache used for memoizing results */
  cacheSize: number;
  /** Prefix added to Tailwind-generated classes */
  prefix?: string;
  /** Custom separator for modifiers in Tailwind classes */
  separator: string;
  /** Experimental function to customize parsing of individual classes */
  experimentalParseClassName?(param: ExperimentalParseClassNameParam): ExperimentalParsedClassName;
}

interface ConfigExtension<ClassGroupIds extends string, ThemeGroupIds extends string>
  extends Partial<ConfigStaticPart> {
  /** Configuration properties to override completely */
  override?: PartialPartial<ConfigGroupsPart<ClassGroupIds, ThemeGroupIds>>;
  /** Configuration properties to extend/merge */
  extend?: PartialPartial<ConfigGroupsPart<ClassGroupIds, ThemeGroupIds>>;
}

type AnyConfig = Config<string, string>;
type CreateConfigSubsequent = (config: AnyConfig) => AnyConfig;
```