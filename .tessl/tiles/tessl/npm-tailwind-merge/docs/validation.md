# Validation System

Comprehensive validation functions for different types of Tailwind class values, used in custom configurations and class group definitions.

## Capabilities

### Validators Module

Collection of validation functions used throughout tailwind-merge for validating different types of class values.

```typescript { .api }
/**
 * All validators available for use in custom configurations
 */
interface Validators {
  /** Validates length values (numbers, fractions, px, full, screen) */
  isLength(value: string): boolean;
  /** Validates arbitrary length values like [3%], [4px], [length:var(--my-var)] */
  isArbitraryLength(value: string): boolean;
  /** Validates numeric strings like '3', '1.5' */
  isNumber(value: string): boolean;
  /** Validates integer values like '3' */
  isInteger(value: string): boolean;
  /** Validates percentage values like '12.5%' */
  isPercent(value: string): boolean;
  /** Validates any arbitrary values enclosed in brackets [something] */
  isArbitraryValue(value: string): boolean;
  /** Validates T-shirt sizes like 'sm', 'xl', '2xl' */
  isTshirtSize(value: string): boolean;
  /** Validates arbitrary size values like [size:200px_100px] */
  isArbitrarySize(value: string): boolean;
  /** Validates arbitrary position values like [position:200px_100px] */
  isArbitraryPosition(value: string): boolean;
  /** Validates arbitrary image values like [url('/path.png')] */
  isArbitraryImage(value: string): boolean;
  /** Validates arbitrary number values like [number:var(--value)], [450] */
  isArbitraryNumber(value: string): boolean;
  /** Validates arbitrary shadow values like [0_35px_60px_-15px_rgba(0,0,0,0.3)] */
  isArbitraryShadow(value: string): boolean;
  /** Always returns true - catch-all validator (use carefully) */
  isAny(): boolean;
}
```

### Individual Validators

#### Length Validators

Validators for length-related values used in spacing, sizing, and positioning classes.

```typescript { .api }
/**
 * Validates length values including numbers, fractions, and special keywords
 * @param value - Value to validate
 * @returns True if value is a valid length
 */
function isLength(value: string): boolean;

/**
 * Validates arbitrary length values in bracket notation
 * @param value - Value to validate  
 * @returns True if value is a valid arbitrary length
 */
function isArbitraryLength(value: string): boolean;
```

**Usage Examples:**

```typescript
import { validators } from "tailwind-merge";

// isLength examples
validators.isLength('4'); // true - number
validators.isLength('1.5'); // true - decimal number
validators.isLength('3/4'); // true - fraction
validators.isLength('px'); // true - special keyword
validators.isLength('full'); // true - special keyword
validators.isLength('screen'); // true - special keyword
validators.isLength('invalid'); // false

// isArbitraryLength examples
validators.isArbitraryLength('[3%]'); // true
validators.isArbitraryLength('[4px]'); // true
validators.isArbitraryLength('[length:var(--my-var)]'); // true
validators.isArbitraryLength('[calc(100% - 2rem)]'); // true
validators.isArbitraryLength('4px'); // false - not in brackets
```

#### Numeric Validators

Validators for numeric values used in various contexts.

```typescript { .api }
/**
 * Validates numeric strings
 * @param value - Value to validate
 * @returns True if value is a valid number
 */
function isNumber(value: string): boolean;

/**
 * Validates integer values
 * @param value - Value to validate
 * @returns True if value is a valid integer
 */
function isInteger(value: string): boolean;

/**
 * Validates percentage values
 * @param value - Value to validate
 * @returns True if value is a valid percentage
 */
function isPercent(value: string): boolean;

/**
 * Validates arbitrary number values for font-weight and stroke-width
 * @param value - Value to validate
 * @returns True if value is a valid arbitrary number
 */
function isArbitraryNumber(value: string): boolean;
```

**Usage Examples:**

```typescript
import { validators } from "tailwind-merge";

// isNumber examples
validators.isNumber('3'); // true
validators.isNumber('1.5'); // true
validators.isNumber('0'); // true
validators.isNumber('abc'); // false

// isInteger examples  
validators.isInteger('3'); // true
validators.isInteger('1.5'); // false
validators.isInteger('0'); // true

// isPercent examples
validators.isPercent('12.5%'); // true
validators.isPercent('100%'); // true
validators.isPercent('12.5'); // false - no % sign

// isArbitraryNumber examples
validators.isArbitraryNumber('[number:var(--value)]'); // true
validators.isArbitraryNumber('[450]'); // true
validators.isArbitraryNumber('[number:calc(var(--weight) * 100)]'); // true
```

#### Size and Position Validators

Validators for size and position-related arbitrary values.

```typescript { .api }
/**
 * Validates T-shirt size values used in various utilities
 * @param value - Value to validate
 * @returns True if value is a valid T-shirt size
 */
function isTshirtSize(value: string): boolean;

/**
 * Validates arbitrary size values for background-size classes
 * @param value - Value to validate
 * @returns True if value is a valid arbitrary size
 */
function isArbitrarySize(value: string): boolean;

/**
 * Validates arbitrary position values for background-position classes
 * @param value - Value to validate
 * @returns True if value is a valid arbitrary position
 */
function isArbitraryPosition(value: string): boolean;
```

**Usage Examples:**

```typescript
import { validators } from "tailwind-merge";

// isTshirtSize examples
validators.isTshirtSize('sm'); // true
validators.isTshirtSize('xl'); // true
validators.isTshirtSize('2xl'); // true
validators.isTshirtSize('3.5xl'); // true
validators.isTshirtSize('large'); // false

// isArbitrarySize examples
validators.isArbitrarySize('[size:200px_100px]'); // true
validators.isArbitrarySize('[size:cover]'); // true
validators.isArbitrarySize('[size:50%_auto]'); // true

// isArbitraryPosition examples
validators.isArbitraryPosition('[position:200px_100px]'); // true
validators.isArbitraryPosition('[position:center_top]'); // true
validators.isArbitraryPosition('[position:50%_25%]'); // true
```

#### Media and Visual Validators

Validators for images, shadows, and other visual elements.

```typescript { .api }
/**
 * Validates arbitrary image values for background-image classes
 * @param value - Value to validate
 * @returns True if value is a valid arbitrary image
 */
function isArbitraryImage(value: string): boolean;

/**
 * Validates arbitrary shadow values matching shadow patterns
 * @param value - Value to validate
 * @returns True if value is a valid arbitrary shadow
 */
function isArbitraryShadow(value: string): boolean;
```

**Usage Examples:**

```typescript
import { validators } from "tailwind-merge";

// isArbitraryImage examples
validators.isArbitraryImage("[url('/path-to-image.png')]"); // true
validators.isArbitraryImage('[image:var(--bg-image)]'); // true
validators.isArbitraryImage('[linear-gradient(to_right,#000,#fff)]'); // true
validators.isArbitraryImage('[url(data:image/svg+xml;base64,...)]'); // true

// isArbitraryShadow examples
validators.isArbitraryShadow('[0_35px_60px_-15px_rgba(0,0,0,0.3)]'); // true
validators.isArbitraryShadow('[inset_0_2px_4px_rgba(0,0,0,0.1)]'); // true
validators.isArbitraryShadow('[0_0_0_1px_theme(colors.gray.300)]'); // true
```

#### Universal Validators

General-purpose validators for special cases.

```typescript { .api }
/**
 * Validates any arbitrary value enclosed in brackets
 * @param value - Value to validate
 * @returns True if value is enclosed in brackets
 */
function isArbitraryValue(value: string): boolean;

/**
 * Always returns true - use as catch-all validator
 * @returns Always true
 */
function isAny(): boolean;
```

**Usage Examples:**

```typescript
import { validators } from "tailwind-merge";

// isArbitraryValue examples
validators.isArbitraryValue('[anything]'); // true
validators.isArbitraryValue('[color:var(--custom)]'); // true
validators.isArbitraryValue('[length:100vh]'); // true
validators.isArbitraryValue('not-arbitrary'); // false

// isAny examples - use carefully!
validators.isAny(); // true (always)
validators.isAny('anything'); // true (always)

// Example: Using isAny in class group definition
const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Accept any value for custom color classes
      'custom-color': [{ 'custom': [validators.isAny] }],
    },
  },
});
```

### Using Validators in Custom Configurations

Validators are primarily used when defining custom class groups in tailwind-merge configurations.

**Usage Examples:**

```typescript
import { extendTailwindMerge, validators } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Use length validator for custom spacing
      'custom-spacing': [{ 'space': [validators.isLength] }],
      
      // Use T-shirt size validator for custom utilities
      'custom-size': [{ 'size': [validators.isTshirtSize] }],
      
      // Combine multiple validators
      'flexible-value': [{
        'flex-val': [
          validators.isNumber,
          validators.isArbitraryValue,
          validators.isTshirtSize
        ]
      }],
      
      // Custom validator function
      'even-numbers': [{
        'even': [(value) => validators.isInteger(value) && parseInt(value) % 2 === 0]
      }],
    },
  },
});
```

## Types

```typescript { .api }
type ClassValidator = (classPart: string) => boolean;
```