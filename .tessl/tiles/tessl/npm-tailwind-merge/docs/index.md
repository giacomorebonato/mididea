# tailwind-merge

tailwind-merge is a utility function to efficiently merge Tailwind CSS classes in JavaScript without style conflicts. It provides intelligent conflict resolution that understands Tailwind's class precedence rules, allowing developers to programmatically combine CSS classes while ensuring the final result maintains proper styling without conflicting declarations.

## Package Information

- **Package Name**: tailwind-merge
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install tailwind-merge`

## Core Imports

```typescript
import { twMerge, twJoin, createTailwindMerge, extendTailwindMerge, getDefaultConfig, mergeConfigs, fromTheme } from "tailwind-merge";
```

For CommonJS:

```javascript
const { twMerge, twJoin, createTailwindMerge, extendTailwindMerge, getDefaultConfig, mergeConfigs, fromTheme } = require("tailwind-merge");
```

## Basic Usage

```typescript
import { twMerge } from "tailwind-merge";

// Basic merging with conflict resolution
const result = twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]');
// → 'hover:bg-dark-red p-3 bg-[#B91C1C]'

// Handle conditional classes
const buttonClasses = twMerge(
  'px-4 py-2 rounded-md font-medium',
  isLoading && 'opacity-50 cursor-not-allowed',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-900',
  size === 'sm' && 'px-2 py-1 text-sm',
  size === 'lg' && 'px-6 py-3 text-lg'
);
```

## Architecture

tailwind-merge is built around several key components:

- **Core Merger**: `twMerge` function that handles conflict resolution using the default Tailwind configuration
- **Class Joiner**: `twJoin` function for conditional class joining without conflict resolution
- **Configuration System**: Extensible configuration allowing customization of class groups and conflict rules  
- **Factory Functions**: `createTailwindMerge` and `extendTailwindMerge` for creating custom merge instances
- **Validation System**: Comprehensive validators for different types of Tailwind class values
- **Performance Optimization**: LRU caching and efficient parsing for high-frequency usage

## Capabilities

### Core Merging Functions

Primary functions for merging and joining Tailwind CSS classes with conflict resolution and conditional handling.

```typescript { .api }
function twMerge(...classLists: ClassNameValue[]): string;
function twJoin(...classLists: ClassNameValue[]): string;

type ClassNameValue = ClassNameArray | string | null | undefined | 0 | 0n | false;
type ClassNameArray = ClassNameValue[];
```

[Core Functions](./core-functions.md)

### Configuration and Customization

Advanced configuration system for extending or customizing tailwind-merge behavior with custom class groups, theme scales, and conflict resolution rules.

```typescript { .api }
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

function createTailwindMerge(
  createConfigFirst: () => AnyConfig,
  ...createConfigRest: CreateConfigSubsequent[]
): TailwindMerge;

function getDefaultConfig(): Config<DefaultClassGroupIds, DefaultThemeGroupIds>;
```

[Configuration](./configuration.md)

### Validation System

Comprehensive validation functions for different types of Tailwind class values, used in custom configurations and class group definitions.

```typescript { .api }
interface Validators {
  isLength(value: string): boolean;
  isArbitraryLength(value: string): boolean;
  isNumber(value: string): boolean;
  isInteger(value: string): boolean;
  isPercent(value: string): boolean;
  isArbitraryValue(value: string): boolean;
  isTshirtSize(value: string): boolean;
  isArbitrarySize(value: string): boolean;
  isArbitraryPosition(value: string): boolean;
  isArbitraryImage(value: string): boolean;
  isArbitraryNumber(value: string): boolean;
  isArbitraryShadow(value: string): boolean;
  isAny(): boolean;
}
```

[Validation System](./validation.md)

## Types

```typescript { .api }
interface Config<ClassGroupIds extends string, ThemeGroupIds extends string>
  extends ConfigStaticPart, ConfigGroupsPart<ClassGroupIds, ThemeGroupIds> {}

interface ConfigExtension<ClassGroupIds extends string, ThemeGroupIds extends string>
  extends Partial<ConfigStaticPart> {
  override?: PartialPartial<ConfigGroupsPart<ClassGroupIds, ThemeGroupIds>>;
  extend?: PartialPartial<ConfigGroupsPart<ClassGroupIds, ThemeGroupIds>>;
}

type ClassValidator = (classPart: string) => boolean;

type DefaultClassGroupIds = 'accent' | 'align-content' | 'align-items' | 'align-self' | 'animate' | 'appearance' | 'aspect' | 'auto-cols' | 'auto-rows' | 'backdrop-blur' | 'backdrop-brightness' | 'backdrop-contrast' | 'backdrop-filter' | 'backdrop-grayscale' | 'backdrop-hue-rotate' | 'backdrop-invert' | 'backdrop-opacity' | 'backdrop-saturate' | 'backdrop-sepia' | 'basis' | 'bg-attachment' | 'bg-blend' | 'bg-clip' | 'bg-color' | 'bg-image' | 'bg-opacity' | 'bg-origin' | 'bg-position' | 'bg-repeat' | 'bg-size' | 'blur' | 'border-collapse' | 'border-color-b' | 'border-color-e' | 'border-color-l' | 'border-color-r' | 'border-color-s' | 'border-color-t' | 'border-color-x' | 'border-color-y' | 'border-color' | 'border-opacity' | 'border-spacing-x' | 'border-spacing-y' | 'border-spacing' | 'border-style' | 'border-w-b' | 'border-w-e' | 'border-w-l' | 'border-w-r' | 'border-w-s' | 'border-w-t' | 'border-w-x' | 'border-w-y' | 'border-w' | 'bottom' | 'box-decoration' | 'box' | 'break-after' | 'break-before' | 'break-inside' | 'break' | 'brightness' | 'caption' | 'caret-color' | 'clear' | 'col-end' | 'col-start-end' | 'col-start' | 'columns' | 'container' | 'content' | 'contrast' | 'cursor' | 'delay' | 'display' | 'divide-color' | 'divide-opacity' | 'divide-style' | 'divide-x-reverse' | 'divide-x' | 'divide-y-reverse' | 'divide-y' | 'drop-shadow' | 'duration' | 'ease' | 'end' | 'fill' | 'filter' | 'flex-direction' | 'flex-wrap' | 'flex' | 'float' | 'font-family' | 'font-size' | 'font-smoothing' | 'font-style' | 'font-weight' | 'forced-color-adjust' | 'fvn-figure' | 'fvn-fraction' | 'fvn-normal' | 'fvn-ordinal' | 'fvn-slashed-zero' | 'fvn-spacing' | 'gap-x' | 'gap-y' | 'gap' | 'gradient-from-pos' | 'gradient-from' | 'gradient-to-pos' | 'gradient-to' | 'gradient-via-pos' | 'gradient-via' | 'grayscale' | 'grid-cols' | 'grid-flow' | 'grid-rows' | 'grow' | 'h' | 'hue-rotate' | 'hyphens' | 'indent' | 'inset-x' | 'inset-y' | 'inset' | 'invert' | 'isolation' | 'justify-content' | 'justify-items' | 'justify-self' | 'leading' | 'left' | 'line-clamp' | 'list-image' | 'list-style-position' | 'list-style-type' | 'm' | 'max-h' | 'max-w' | 'mb' | 'me' | 'min-h' | 'min-w' | 'mix-blend' | 'ml' | 'mr' | 'ms' | 'mt' | 'mx' | 'my' | 'object-fit' | 'object-position' | 'opacity' | 'order' | 'outline-color' | 'outline-offset' | 'outline-style' | 'outline-w' | 'overflow-x' | 'overflow-y' | 'overflow' | 'overscroll-x' | 'overscroll-y' | 'overscroll' | 'p' | 'pb' | 'pe' | 'pl' | 'place-content' | 'place-items' | 'place-self' | 'placeholder-color' | 'placeholder-opacity' | 'pointer-events' | 'position' | 'pr' | 'ps' | 'pt' | 'px' | 'py' | 'resize' | 'right' | 'ring-color' | 'ring-offset-color' | 'ring-offset-w' | 'ring-opacity' | 'ring-w-inset' | 'ring-w' | 'rotate' | 'rounded-b' | 'rounded-bl' | 'rounded-br' | 'rounded-e' | 'rounded-ee' | 'rounded-es' | 'rounded-l' | 'rounded-r' | 'rounded-s' | 'rounded-se' | 'rounded-ss' | 'rounded-t' | 'rounded-tl' | 'rounded-tr' | 'rounded' | 'row-end' | 'row-start-end' | 'row-start' | 'saturate' | 'scale-x' | 'scale-y' | 'scale' | 'scroll-behavior' | 'scroll-m' | 'scroll-mb' | 'scroll-me' | 'scroll-ml' | 'scroll-mr' | 'scroll-ms' | 'scroll-mt' | 'scroll-mx' | 'scroll-my' | 'scroll-p' | 'scroll-pb' | 'scroll-pe' | 'scroll-pl' | 'scroll-pr' | 'scroll-ps' | 'scroll-pt' | 'scroll-px' | 'scroll-py' | 'select' | 'sepia' | 'shadow-color' | 'shadow' | 'shrink' | 'size' | 'skew-x' | 'skew-y' | 'snap-align' | 'snap-stop' | 'snap-strictness' | 'snap-type' | 'space-x-reverse' | 'space-x' | 'space-y-reverse' | 'space-y' | 'sr' | 'start' | 'stroke-w' | 'stroke' | 'table-layout' | 'text-alignment' | 'text-color' | 'text-decoration-color' | 'text-decoration-style' | 'text-decoration-thickness' | 'text-decoration' | 'text-opacity' | 'text-overflow' | 'text-transform' | 'text-wrap' | 'top' | 'touch-pz' | 'touch-x' | 'touch-y' | 'touch' | 'tracking' | 'transform-origin' | 'transform' | 'transition' | 'translate-x' | 'translate-y' | 'underline-offset' | 'vertical-align' | 'visibility' | 'w' | 'whitespace' | 'will-change' | 'z';

type DefaultThemeGroupIds = 'blur' | 'borderColor' | 'borderRadius' | 'borderSpacing' | 'borderWidth' | 'brightness' | 'colors' | 'contrast' | 'gap' | 'gradientColorStopPositions' | 'gradientColorStops' | 'grayscale' | 'hueRotate' | 'inset' | 'invert' | 'margin' | 'opacity' | 'padding' | 'saturate' | 'scale' | 'sepia' | 'skew' | 'space' | 'spacing' | 'translate';

interface ExperimentalParseClassNameParam {
  className: string;
  parseClassName(className: string): ExperimentalParsedClassName;
}

interface ExperimentalParsedClassName {
  modifiers: string[];
  hasImportantModifier: boolean;
  baseClassName: string;
  maybePostfixModifierPosition: number | undefined;
}
```