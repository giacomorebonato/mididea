# Utilities

React provides powerful utility types that enable type-safe manipulation and extraction of component props, element types, and other React-specific type information. These utility types are essential for building reusable components, higher-order components, and type-safe abstractions.

## Capabilities

### ComponentProps

Utility type for extracting props from components or intrinsic elements.

```typescript { .api }
/**
 * Extract props type from a component or intrinsic element
 * @template T Component type or keyof JSX.IntrinsicElements
 */
type ComponentProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> =
  T extends JSXElementConstructor<infer P>
    ? P
    : T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : {};

/**
 * JSX element constructor type
 */
type JSXElementConstructor<P> = 
  | ((props: P) => ReactElement<any, any> | null)
  | (new (props: P) => Component<any, any>);
```

**Usage Examples:**

```typescript
import React from "react";

// Extract props from intrinsic elements
type DivProps = React.ComponentProps<'div'>;
type ButtonProps = React.ComponentProps<'button'>;
type InputProps = React.ComponentProps<'input'>;

// Extract props from custom components
interface CustomButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({ variant = 'primary', size = 'medium', children, onClick }) => (
  <button className={`btn btn-${variant} btn-${size}`} onClick={onClick}>
    {children}
  </button>
);

type ExtractedCustomButtonProps = React.ComponentProps<typeof CustomButton>;
// Result: CustomButtonProps

// Using extracted props in wrapper components
function ButtonWrapper(props: React.ComponentProps<typeof CustomButton>) {
  return (
    <div className="button-wrapper">
      <CustomButton {...props} />
    </div>
  );
}

// Extract props from HTML elements for component composition
interface ExtendedInputProps extends React.ComponentProps<'input'> {
  label?: string;
  error?: string;
}

const LabeledInput: React.FC<ExtendedInputProps> = ({ label, error, ...inputProps }) => (
  <div className="input-group">
    {label && <label>{label}</label>}
    <input {...inputProps} />
    {error && <div className="error">{error}</div>}
  </div>
);

// Generic component that accepts any element props
function GenericWrapper<T extends keyof JSX.IntrinsicElements>(
  { as, children, ...props }: { as: T; children: React.ReactNode } & React.ComponentProps<T>
) {
  return React.createElement(as, props, children);
}

// Usage with type safety
function ComponentPropsDemo() {
  return (
    <div>
      <GenericWrapper as="div" className="container">
        <span>Content</span>
      </GenericWrapper>
      
      <GenericWrapper as="button" onClick={() => alert('clicked')} disabled={false}>
        Click me
      </GenericWrapper>
      
      <LabeledInput 
        label="Username" 
        type="text" 
        placeholder="Enter username"
        required
      />
    </div>
  );
}
```

### ComponentPropsWithRef and ComponentPropsWithoutRef

Utility types for handling ref inclusion or exclusion in component props.

```typescript { .api }
/**
 * Extract props from component including ref
 * @template T Component type
 */
type ComponentPropsWithRef<T extends ElementType> = 
  T extends new (props: infer P) => Component<any, any>
    ? PropsWithoutRef<P> & RefAttributes<InstanceType<T>>
    : ComponentProps<T>;

/**
 * Extract props from component excluding ref
 * @template T Component type
 */
type ComponentPropsWithoutRef<T extends ElementType> = PropsWithoutRef<ComponentProps<T>>;

/**
 * Remove ref from props type
 * @template P Props type
 */
type PropsWithoutRef<P> = P extends any ? ('ref' extends keyof P ? Pick<P, Exclude<keyof P, 'ref'>> : P) : P;

/**
 * Element type union
 */
type ElementType<P = any> = 
  | {[K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K] ? K : never}[keyof JSX.IntrinsicElements]
  | ComponentType<P>;
```

**Usage Examples:**

```typescript
import React, { forwardRef, useRef } from "react";

// Component that needs ref support
interface InputProps {
  label: string;
  placeholder?: string;
}

const FancyInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, placeholder }, ref) => (
    <div>
      <label>{label}</label>
      <input ref={ref} placeholder={placeholder} className="fancy-input" />
    </div>
  )
);

// Extract props with ref
type FancyInputPropsWithRef = React.ComponentPropsWithRef<typeof FancyInput>;
// Result: InputProps & RefAttributes<HTMLInputElement>

// Extract props without ref
type FancyInputPropsWithoutRef = React.ComponentPropsWithoutRef<typeof FancyInput>;
// Result: InputProps

// HOC that preserves ref forwarding
function withValidation<T extends React.ElementType>(
  Component: T
) {
  return forwardRef<
    React.ComponentRef<T>,
    React.ComponentPropsWithoutRef<T> & { validate?: boolean }
  >(({ validate = false, ...props }, ref) => {
    // Add validation logic here
    if (validate) {
      console.log('Validating props:', props);
    }
    
    return React.createElement(Component, { ...props, ref } as any);
  });
}

// Usage preserving ref capability
const ValidatedFancyInput = withValidation(FancyInput);

function RefHandlingDemo() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <ValidatedFancyInput
        ref={inputRef}
        label="Validated Input"
        placeholder="Type here..."
        validate={true}
      />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
}

// Polymorphic component with proper ref handling
interface PolymorphicProps<T extends React.ElementType> {
  as?: T;
  children: React.ReactNode;
}

type PolymorphicComponentProps<T extends React.ElementType> = 
  PolymorphicProps<T> & 
  Omit<React.ComponentPropsWithoutRef<T>, keyof PolymorphicProps<T>>;

function PolymorphicComponent<T extends React.ElementType = 'div'>(
  { as, children, ...props }: PolymorphicComponentProps<T>
) {
  const Component = as || 'div';
  return React.createElement(Component, props, children);
}

// Usage with different elements
function PolymorphicDemo() {
  return (
    <div>
      <PolymorphicComponent as="h1" className="title">
        Heading
      </PolymorphicComponent>
      
      <PolymorphicComponent as="button" onClick={() => alert('clicked')}>
        Button
      </PolymorphicComponent>
      
      <PolymorphicComponent className="default-div">
        Default Div
      </PolymorphicComponent>
    </div>
  );
}
```

### PropsWithChildren

Utility type for adding children prop to component props.

```typescript { .api }
/**
 * Add children prop to props type
 * @template P Props type
 */
type PropsWithChildren<P = unknown> = P & { children?: ReactNode };
```

**Usage Examples:**

```typescript
import React from "react";

// Basic usage with empty props
const SimpleContainer: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="container">{children}</div>
);

// Usage with existing props interface
interface CardProps {
  title: string;
  variant?: 'default' | 'highlighted';
}

const Card: React.FC<React.PropsWithChildren<CardProps>> = ({ 
  title, 
  variant = 'default', 
  children 
}) => (
  <div className={`card card-${variant}`}>
    <h3 className="card-title">{title}</h3>
    <div className="card-content">
      {children}
    </div>
  </div>
);

// Generic container with typed props
interface ContainerProps {
  padding?: 'small' | 'medium' | 'large';
  background?: string;
}

function Container({ 
  padding = 'medium', 
  background = 'transparent', 
  children 
}: React.PropsWithChildren<ContainerProps>) {
  const paddingValue = {
    small: '0.5rem',
    medium: '1rem',
    large: '2rem'
  }[padding];

  return (
    <div style={{ padding: paddingValue, background }}>
      {children}
    </div>
  );
}

// HOC using PropsWithChildren
function withContainer<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<React.PropsWithChildren<P & { containerClass?: string }>> {
  return ({ containerClass = 'wrapper', children, ...props }) => (
    <div className={containerClass}>
      <Component {...props as P} />
      {children}
    </div>
  );
}

// Usage examples
function PropsWithChildrenDemo() {
  return (
    <div>
      <SimpleContainer>
        <p>Simple content</p>
      </SimpleContainer>

      <Card title="Example Card" variant="highlighted">
        <p>Card content goes here</p>
        <button>Action</button>
      </Card>

      <Container padding="large" background="#f0f0f0">
        <h2>Container Title</h2>
        <p>Container content with custom padding and background</p>
      </Container>
    </div>
  );
}

// Conditional children rendering
interface OptionalChildrenProps {
  showChildren?: boolean;
}

const ConditionalContainer: React.FC<React.PropsWithChildren<OptionalChildrenProps>> = ({ 
  showChildren = true, 
  children 
}) => (
  <div className="conditional-container">
    <h3>Container Header</h3>
    {showChildren && (
      <div className="children-section">
        {children}
      </div>
    )}
  </div>
);
```

### ComponentRef

Utility type for extracting ref type from components.

```typescript { .api }
/**
 * Extract ref type from component
 * @template T Component type
 */
type ComponentRef<T extends ElementType> = 
  T extends NamedExoticComponent<ComponentPropsWithoutRef<T> & RefAttributes<infer Method>>
    ? Method
    : ComponentPropsWithRef<T> extends RefAttributes<infer Method>
    ? Method
    : never;
```

**Usage Examples:**

```typescript
import React, { useRef, useImperativeHandle, forwardRef } from "react";

// Custom component with imperative handle
interface CounterHandle {
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  getValue: () => number;
}

interface CounterProps {
  initialValue?: number;
  onValueChange?: (value: number) => void;
}

const Counter = forwardRef<CounterHandle, CounterProps>(
  ({ initialValue = 0, onValueChange }, ref) => {
    const [count, setCount] = React.useState(initialValue);

    useImperativeHandle(ref, () => ({
      increment: () => {
        setCount(prev => {
          const newValue = prev + 1;
          onValueChange?.(newValue);
          return newValue;
        });
      },
      decrement: () => {
        setCount(prev => {
          const newValue = prev - 1;
          onValueChange?.(newValue);
          return newValue;
        });
      },
      reset: () => {
        setCount(initialValue);
        onValueChange?.(initialValue);
      },
      getValue: () => count
    }), [count, initialValue, onValueChange]);

    return (
      <div className="counter">
        <span>Count: {count}</span>
      </div>
    );
  }
);

// Extract ref type
type CounterRef = React.ComponentRef<typeof Counter>;
// Result: CounterHandle

// Function that works with counter refs
function useCounterControl(counterRef: React.RefObject<CounterRef>) {
  const incrementCounter = () => {
    counterRef.current?.increment();
  };

  const decrementCounter = () => {
    counterRef.current?.decrement();
  };

  const resetCounter = () => {
    counterRef.current?.reset();
  };

  const getCurrentValue = () => {
    return counterRef.current?.getValue() ?? 0;
  };

  return {
    incrementCounter,
    decrementCounter,
    resetCounter,
    getCurrentValue
  };
}

// Component using extracted ref type
function CounterDemo() {
  const counterRef = useRef<CounterRef>(null);
  const { incrementCounter, decrementCounter, resetCounter, getCurrentValue } = useCounterControl(counterRef);

  const handleGetValue = () => {
    alert(`Current value: ${getCurrentValue()}`);
  };

  return (
    <div>
      <Counter 
        ref={counterRef} 
        initialValue={10}
        onValueChange={(value) => console.log('Value changed:', value)}
      />
      
      <div style={{ marginTop: '1rem' }}>
        <button onClick={incrementCounter}>+</button>
        <button onClick={decrementCounter}>-</button>
        <button onClick={resetCounter}>Reset</button>
        <button onClick={handleGetValue}>Get Value</button>
      </div>
    </div>
  );
}

// Generic ref handler
function createRefHandler<T extends React.ElementType>(
  component: T
): (ref: React.ComponentRef<T> | null) => void {
  return (ref) => {
    if (ref) {
      console.log('Ref attached:', ref);
      // Handle ref attachment
    }
  };
}

// HTML element ref types
type DivRef = React.ComponentRef<'div'>; // HTMLDivElement
type ButtonRef = React.ComponentRef<'button'>; // HTMLButtonElement
type InputRef = React.ComponentRef<'input'>; // HTMLInputElement

function HTMLRefDemo() {
  const divRef = useRef<DivRef>(null);
  const buttonRef = useRef<ButtonRef>(null);
  const inputRef = useRef<InputRef>(null);

  const handleFocusInput = () => {
    inputRef.current?.focus();
  };

  const handleClickButton = () => {
    buttonRef.current?.click();
  };

  return (
    <div ref={divRef}>
      <input ref={inputRef} placeholder="Focus me" />
      <button ref={buttonRef} onClick={() => alert('Button clicked')}>
        Click me
      </button>
      <button onClick={handleFocusInput}>Focus Input</button>
      <button onClick={handleClickButton}>Trigger Button</button>
    </div>
  );
}
```

### Key Type

Type definition for React element keys.

```typescript { .api }
/**
 * Valid React element key types
 */
type Key = string | number | bigint;
```

**Usage Examples:**

```typescript
import React from "react";

interface Item {
  id: string | number;
  name: string;
  category: string;
}

const items: Item[] = [
  { id: '1', name: 'Apple', category: 'fruit' },
  { id: 2, name: 'Carrot', category: 'vegetable' },
  { id: 3n, name: 'Banana', category: 'fruit' }
];

function KeyTypesDemo() {
  // String keys
  const stringKeyElements = ['a', 'b', 'c'].map(letter => (
    <div key={letter}>Letter: {letter}</div>
  ));

  // Number keys
  const numberKeyElements = [1, 2, 3].map(num => (
    <div key={num}>Number: {num}</div>
  ));

  // BigInt keys
  const bigintKeyElements = [1n, 2n, 3n].map(bigint => (
    <div key={bigint}>BigInt: {bigint.toString()}</div>
  ));

  // Mixed type keys from data
  const itemElements = items.map(item => (
    <div key={item.id} className={`item-${item.category}`}>
      {item.name}
    </div>
  ));

  return (
    <div>
      <section>
        <h3>String Keys</h3>
        {stringKeyElements}
      </section>
      
      <section>
        <h3>Number Keys</h3>
        {numberKeyElements}
      </section>
      
      <section>
        <h3>BigInt Keys</h3>
        {bigintKeyElements}
      </section>
      
      <section>
        <h3>Mixed Type Keys</h3>
        {itemElements}
      </section>
    </div>
  );
}

// Function that generates keyed elements
function createKeyedElements<T>(
  items: T[],
  getKey: (item: T, index: number) => React.Key,
  renderItem: (item: T, index: number) => React.ReactNode
): React.ReactElement[] {
  return items.map((item, index) => 
    React.createElement('div', { key: getKey(item, index) }, renderItem(item, index))
  );
}

// Usage with different key strategies
function KeyedElementsDemo() {
  const users = [
    { uuid: 'user-1', name: 'Alice', age: 30 },
    { uuid: 'user-2', name: 'Bob', age: 25 },
    { uuid: 'user-3', name: 'Charlie', age: 35 }
  ];

  // Using UUID as key
  const userElements = createKeyedElements(
    users,
    (user) => user.uuid,
    (user) => `${user.name} (${user.age})`
  );

  return <div>{userElements}</div>;
}
```

### ElementType

Utility type for valid React element types.

```typescript { .api }
/**
 * Valid React element types
 * @template P Props constraint
 */
type ElementType<P = any> = 
  | {[K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K] ? K : never}[keyof JSX.IntrinsicElements]
  | ComponentType<P>;

/**
 * Component type union
 */
type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;
```

**Usage Examples:**

```typescript
import React from "react";

// Polymorphic component using ElementType
interface PolymorphicBoxProps<T extends React.ElementType = 'div'> {
  as?: T;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  children: React.ReactNode;
}

type PolymorphicBoxComponent = <T extends React.ElementType = 'div'>(
  props: PolymorphicBoxProps<T> & Omit<React.ComponentProps<T>, keyof PolymorphicBoxProps<T>>
) => React.ReactElement | null;

const PolymorphicBox: PolymorphicBoxComponent = ({ 
  as: Component = 'div', 
  variant = 'primary', 
  children, 
  ...props 
}) => {
  const className = `box box-${variant} ${props.className || ''}`.trim();
  
  return React.createElement(
    Component,
    { ...props, className },
    children
  );
};

// Usage with different element types
function PolymorphicBoxDemo() {
  return (
    <div>
      {/* Default div */}
      <PolymorphicBox variant="primary">
        Default box (div)
      </PolymorphicBox>

      {/* Button element */}
      <PolymorphicBox 
        as="button" 
        variant="success"
        onClick={() => alert('Button clicked')}
      >
        Box as Button
      </PolymorphicBox>

      {/* Anchor element */}
      <PolymorphicBox 
        as="a" 
        variant="secondary"
        href="https://example.com"
        target="_blank"
      >
        Box as Link
      </PolymorphicBox>

      {/* Heading element */}
      <PolymorphicBox as="h2" variant="danger">
        Box as Heading
      </PolymorphicBox>
    </div>
  );
}

// Generic component factory
function createStyledComponent<T extends React.ElementType>(
  elementType: T,
  baseStyles: React.CSSProperties
) {
  return function StyledComponent(
    props: React.ComponentProps<T> & { style?: React.CSSProperties }
  ) {
    const combinedStyles = { ...baseStyles, ...props.style };
    return React.createElement(elementType, { ...props, style: combinedStyles });
  };
}

// Create styled components
const StyledButton = createStyledComponent('button', {
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '0.5rem 1rem',
  cursor: 'pointer'
});

const StyledDiv = createStyledComponent('div', {
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '4px',
  padding: '1rem'
});

// Dynamic element type selection
interface DynamicElementProps {
  elementType: React.ElementType;
  children: React.ReactNode;
  [key: string]: any;
}

function DynamicElement({ elementType, children, ...props }: DynamicElementProps) {
  return React.createElement(elementType, props, children);
}

function ElementTypeDemo() {
  const [elementType, setElementType] = React.useState<React.ElementType>('div');

  return (
    <div>
      <div>
        <label>
          Select element type:
          <select 
            value={elementType as string} 
            onChange={(e) => setElementType(e.target.value)}
          >
            <option value="div">div</option>
            <option value="span">span</option>
            <option value="p">p</option>
            <option value="h1">h1</option>
            <option value="button">button</option>
          </select>
        </label>
      </div>

      <DynamicElement 
        elementType={elementType}
        style={{ margin: '1rem 0', padding: '0.5rem', backgroundColor: '#e9ecef' }}
      >
        This is a dynamic {elementType} element
      </DynamicElement>

      <StyledButton onClick={() => alert('Styled button clicked')}>
        Styled Button
      </StyledButton>

      <StyledDiv>
        Styled Div Content
      </StyledDiv>
    </div>
  );
}
```

### Advanced Utility Patterns

Complex utility type patterns for advanced React component typing.

```typescript { .api }
/**
 * Extract component instance type
 */
type ComponentInstance<T extends ComponentType<any>> = 
  T extends ComponentClass<any, any> 
    ? InstanceType<T> 
    : never;

/**
 * Make specific props optional
 */
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific props required
 */
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Override props type
 */
type OverrideProps<T, U> = Omit<T, keyof U> & U;

/**
 * Merge component props
 */
type MergeProps<T, U> = Omit<T, keyof U> & U;
```

**Usage Examples:**

```typescript
import React, { Component } from "react";

// Component instance extraction
class CounterClass extends Component<{ initialValue?: number }, { count: number }> {
  state = { count: this.props.initialValue || 0 };

  increment = () => this.setState({ count: this.state.count + 1 });
  decrement = () => this.setState({ count: this.state.count - 1 });
  getValue = () => this.state.count;

  render() {
    return <div>Count: {this.state.count}</div>;
  }
}

type CounterInstance = ComponentInstance<typeof CounterClass>;
// Result: CounterClass instance with methods

// Make specific props optional
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
}

type OptionalVariantButtonProps = PartialBy<ButtonProps, 'variant' | 'size'>;
// Result: { children: ReactNode; onClick: () => void; variant?: ...; size?: ... }

const FlexibleButton: React.FC<OptionalVariantButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium'
}) => (
  <button className={`btn btn-${variant} btn-${size}`} onClick={onClick}>
    {children}
  </button>
);

// Make specific props required
interface OptionalFormProps {
  onSubmit?: (data: any) => void;
  onReset?: () => void;
  children: React.ReactNode;
  title?: string;
}

type RequiredCallbackFormProps = RequiredBy<OptionalFormProps, 'onSubmit' | 'onReset'>;
// Result: Required onSubmit and onReset callbacks

const StrictForm: React.FC<RequiredCallbackFormProps> = ({ onSubmit, onReset, children, title }) => (
  <form onSubmit={(e) => { e.preventDefault(); onSubmit({}); }}>
    {title && <h2>{title}</h2>}
    {children}
    <button type="submit">Submit</button>
    <button type="button" onClick={onReset}>Reset</button>
  </form>
);

// Override props type
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size: 'small' | 'medium' | 'large';
}

interface CustomModalProps {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
}

type EnhancedModalProps = OverrideProps<BaseModalProps, CustomModalProps>;
// Result: BaseModalProps with overridden size type and added theme

const EnhancedModal: React.FC<EnhancedModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  size, 
  theme = 'light' 
}) => (
  <div className={`modal modal-${size} modal-${theme}`} style={{ display: isOpen ? 'block' : 'none' }}>
    <div className="modal-content">
      <button className="modal-close" onClick={onClose}>×</button>
      {children}
    </div>
  </div>
);

// Complex HOC with utility types
function withEnhancedProps<
  T extends React.ComponentType<any>,
  U extends object
>(
  Component: T,
  enhancedProps: U
): React.ComponentType<OverrideProps<React.ComponentProps<T>, U>> {
  return (props) => {
    const mergedProps = { ...enhancedProps, ...props };
    return React.createElement(Component, mergedProps);
  };
}

// Usage of advanced patterns
function AdvancedUtilitiesDemo() {
  return (
    <div>
      <FlexibleButton onClick={() => alert('Clicked')}>
        Default Button (variant and size optional)
      </FlexibleButton>

      <StrictForm 
        onSubmit={(data) => console.log('Submit:', data)}
        onReset={() => console.log('Reset')}
        title="Required Callbacks Form"
      >
        <input type="text" placeholder="Input field" />
      </StrictForm>

      <EnhancedModal 
        isOpen={true}
        onClose={() => console.log('Close')}
        size="lg"
        theme="dark"
      >
        <p>Enhanced modal content</p>
      </EnhancedModal>
    </div>
  );
}
```

### Component Reference Utilities

Utility types for extracting and working with component references and instances.

```typescript { .api }
/**
 * Extract the ref type from a component
 * @template T Component type
 */
type ComponentRef<T extends ElementType> = T extends NamedExoticComponent<ComponentPropsWithoutRef<T> & RefAttributes<infer Method>>
  ? Method
  : ComponentPropsWithRef<T> extends RefAttributes<infer Method>
  ? Method
  : never;

/**
 * Component props with ref included
 * @template T Component or element type
 */
type ComponentPropsWithRef<T extends ElementType> = T extends new (props: infer P) => Component<any, any>
  ? PropsWithoutRef<P> & RefAttributes<InstanceType<T>>
  : ComponentProps<T>;

/**
 * Component props without ref
 * @template T Component or element type
 */
type ComponentPropsWithoutRef<T extends ElementType> = ComponentProps<T> extends RefAttributes<any>
  ? PropsWithoutRef<ComponentProps<T>>
  : ComponentProps<T>;

/**
 * Props with ref property omitted
 * @template P Props type
 */
type PropsWithoutRef<P> = P extends any ? ('ref' extends keyof P ? Pick<P, Exclude<keyof P, 'ref'>> : P) : P;
```

**Usage Examples:**

```typescript
import React, { useRef, forwardRef } from "react";

// Component with imperative methods
const CustomInput = forwardRef<HTMLInputElement, { placeholder?: string }>((props, ref) => {
  return <input ref={ref} {...props} />;
});

// Extract ref type from component
type CustomInputRef = React.ComponentRef<typeof CustomInput>; // HTMLInputElement

// Extract props with ref
type CustomInputPropsWithRef = React.ComponentPropsWithRef<typeof CustomInput>;
// { placeholder?: string; ref?: Ref<HTMLInputElement> }

// Extract props without ref
type CustomInputPropsWithoutRef = React.ComponentPropsWithoutRef<typeof CustomInput>;
// { placeholder?: string }

// Component that uses ref utilities
function FormWithCustomInput() {
  const inputRef = useRef<React.ComponentRef<typeof CustomInput>>(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <CustomInput ref={inputRef} placeholder="Custom input" />
      <button onClick={handleFocus}>Focus Input</button>
    </div>
  );
}
```

### Additional Type Utilities

Additional utility types that are part of the React API surface.

```typescript { .api }
/**
 * Represents any React component instance or DOM element
 */
type ReactInstance = Component<any> | Element;

/**
 * Generic component state type
 */
type ComponentState = any;

/**
 * Boolean-like type for HTML attributes
 */
type Booleanish = boolean | "true" | "false";

/**
 * CORS attribute values
 */
type CrossOrigin = "anonymous" | "use-credentials" | "" | undefined;

/**
 * All possible React key types
 */
type Key = string | number | bigint;

/**
 * Transition function type for startTransition
 */
type TransitionFunction = () => void;
```

**Usage Examples:**

```typescript
import React from "react";

// Using Booleanish for HTML attributes
interface ToggleProps {
  checked: React.Booleanish;
  disabled?: React.Booleanish;
  children: React.ReactNode;
}

const Toggle: React.FC<ToggleProps> = ({ checked, disabled, children }) => (
  <label>
    <input 
      type="checkbox" 
      checked={checked === true || checked === "true"} 
      disabled={disabled === true || disabled === "true"} 
    />
    {children}
  </label>
);

// Using Key type for dynamic key generation
function generateReactKey(prefix: string, id: string | number | bigint): React.Key {
  return `${prefix}-${id}`;
}

function UtilityTypesDemo() {
  const items = [
    { id: 1n, name: 'Item 1' },
    { id: 2n, name: 'Item 2' },
    { id: 'string-id', name: 'Item 3' }
  ];

  return (
    <div>
      <Toggle checked="true">Accept Terms</Toggle>
      <Toggle checked={false} disabled="false">Newsletter</Toggle>
      
      <ul>
        {items.map(item => (
          <li key={generateReactKey('item', item.id)}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```