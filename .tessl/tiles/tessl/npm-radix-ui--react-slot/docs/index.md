# React Slot

React Slot provides a powerful slot pattern implementation for React, enabling prop merging and element composition with customizable rendering behavior. It allows developers to create flexible, reusable components where child elements can override or extend parent component behavior while maintaining proper ref forwarding and event handler composition.

## Package Information

- **Package Name**: @radix-ui/react-slot
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install @radix-ui/react-slot`

## Core Imports

```typescript
import { Slot, Slottable } from "@radix-ui/react-slot";
```

For CommonJS:

```javascript
const { Slot, Slottable } = require("@radix-ui/react-slot");
```

Additional imports:

```typescript
import { 
  Slot, 
  Slottable, 
  Root, 
  createSlot, 
  createSlottable,
  type SlotProps 
} from "@radix-ui/react-slot";
```

## Basic Usage

```typescript
import React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";

// Basic slot usage - merges props between parent and child
function MyButton({ asChild, ...props }) {
  const Comp = asChild ? Slot : "button";
  return <Comp {...props} />;
}

// Usage: renders an anchor with button's props
<MyButton asChild onClick={handleClick} className="btn">
  <a href="/link">Link Button</a>
</MyButton>

// Complex composition with Slottable
function IconButton({ children, icon, asChild, ...props }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp {...props}>
      {icon}
      <Slottable>{children}</Slottable>
    </Comp>
  );
}

// Usage: child content replaces Slottable, preserving icon
<IconButton asChild icon={<HomeIcon />} onClick={handleClick}>
  <a href="/home">Home</a>
</IconButton>
```

## Architecture

React Slot implements the slot pattern through several key components:

- **Slot Component**: Core component that merges props and renders child elements with intelligent prop composition
- **Slottable Component**: Marks content as replaceable within slot patterns, enabling complex composition scenarios
- **Prop Merging**: Intelligent merging of event handlers, styles, className, and refs between slot and child components
- **Ref Composition**: Cross-React-version compatible ref forwarding and composition using @radix-ui/react-compose-refs
- **Factory Functions**: Utilities for creating custom slot components with proper display names

## Capabilities

### Slot Component

Main component implementing the slot pattern for prop merging and element composition.

```typescript { .api }
interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

declare const Slot: React.ForwardRefExoticComponent<
  SlotProps & React.RefAttributes<HTMLElement>
>;
```

The Slot component:
- Merges props between itself and its child element
- Composes event handlers (child first, then slot)
- Merges styles and concatenates className attributes
- Forwards and composes refs across React versions
- Handles Slottable children with special composition logic

**Usage Example:**

```typescript
// Component using slot pattern
function Button({ asChild, children, ...props }) {
  const Comp = asChild ? Slot : "button";
  return <Comp {...props}>{children}</Comp>;
}

// Usage - child element receives merged props
<Button asChild onClick={handleClick} className="btn-primary">
  <a href="/link" className="link">Custom Link</a>
</Button>
// Renders: <a href="/link" onClick={handleClick} className="btn-primary link">Custom Link</a>
```

### Slottable Component

Component for marking content as slottable within slot composition patterns.

```typescript { .api }
interface SlottableProps {
  children: React.ReactNode;
}

declare const Slottable: React.FC<SlottableProps>;
```

The Slottable component:
- Marks content as replaceable in slot patterns
- Renders children as a transparent wrapper (React Fragment)
- Contains internal identifier for slot recognition
- Enables complex composition where some content is replaced and some is preserved

**Usage Example:**

```typescript
function IconButton({ children, icon, asChild, ...props }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp {...props}>
      {icon}
      <Slottable>{children}</Slottable>
    </Comp>
  );
}

// When used with asChild, only Slottable content is replaced
<IconButton asChild icon={<StarIcon />}>
  <a href="/favorite">Favorite</a>
</IconButton>
// Result: <a href="/favorite"><StarIcon />Favorite</a>
```

### Root Component

Alias for the Slot component, provided for semantic naming convenience.

```typescript { .api }
declare const Root: React.ForwardRefExoticComponent<
  SlotProps & React.RefAttributes<HTMLElement>
>;
```

Root is identical to Slot and can be used interchangeably for improved component naming in specific contexts.

### Factory Functions

Utilities for creating custom slot components with proper display names.

```typescript { .api }
/**
 * Creates a custom Slot component with specified display name
 * @param ownerName - Name used for component displayName
 * @returns ForwardRef Slot component
 */
function createSlot(ownerName: string): React.ForwardRefExoticComponent<
  SlotProps & React.RefAttributes<HTMLElement>
>;

/**
 * Creates a custom Slottable component with specified display name
 * @param ownerName - Name used for component displayName
 * @returns Slottable component with internal identifier for slot recognition
 */
function createSlottable(ownerName: string): React.FC<SlottableProps>;
```

These factory functions allow creating custom slot components with meaningful display names for debugging and development tools.

**Usage Example:**

```typescript
// Create custom slot components
const MySlot = createSlot("MyComponent");
const MySlottable = createSlottable("MyComponent");

// MySlot.displayName === "MyComponent.Slot"
// MySlottable.displayName === "MyComponent.Slottable"
```

## Prop Merging Behavior

React Slot implements intelligent prop merging with specific rules:

### Event Handlers
- Both slot and child handlers are called
- Child handler executes first, then slot handler
- Child handler's return value is preserved
- If only one handler exists, it's used directly

```typescript
// Both onClick handlers will be called
<Slot onClick={() => console.log("slot")}>
  <button onClick={() => console.log("child")}>Click</button>
</Slot>
// Output when clicked: "child", then "slot"
```

### Style Props
- Object styles are merged with child styles taking precedence
- `{ ...slotStyles, ...childStyles }`

```typescript
<Slot style={{ color: "red", fontSize: "16px" }}>
  <div style={{ fontSize: "18px", fontWeight: "bold" }}>Text</div>
</Slot>
// Result: { color: "red", fontSize: "18px", fontWeight: "bold" }
```

### ClassName
- Class names are concatenated with space separation
- Both slot and child classes are preserved

```typescript
<Slot className="btn btn-primary">
  <button className="custom-btn">Click</button>
</Slot>
// Result: className="btn btn-primary custom-btn"
```

### Other Props
- Child props override slot props for all other attributes
- Refs are composed using @radix-ui/react-compose-refs
- React Fragment children are handled without ref warnings in React 19+

## Error Handling

React Slot handles edge cases gracefully:

- Invalid React elements are ignored and return null
- Multiple children in Slottable content throws appropriate React warnings
- Multiple direct children without valid React elements return null
- React Fragment children are handled without ref warnings in React 19+
- Cross-React-version ref handling prevents warnings in development mode

## Types

```typescript { .api }
interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

interface SlottableProps {
  children: React.ReactNode;
}
```