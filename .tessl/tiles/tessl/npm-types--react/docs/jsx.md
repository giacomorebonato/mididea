# JSX Types

JSX (JavaScript XML) allows you to write HTML-like syntax in React components. The @types/react package provides comprehensive type definitions for JSX elements, attributes, and the global JSX namespace, ensuring type safety when using JSX syntax with TypeScript.

## Capabilities

### JSX Namespace

Global JSX namespace that defines how TypeScript interprets JSX syntax.

```typescript { .api }
/**
 * Global JSX namespace defining JSX element types and behavior
 */
declare global {
  namespace JSX {
    /**
     * Base interface for all JSX elements
     */
    interface Element extends React.ReactElement<any, any> {}

    /**
     * Type for JSX element constructors (component types)
     */
    interface ElementClass extends React.Component<any, any> {
      render(): React.ReactNode;
    }

    /**
     * Property name used to get props type from element class
     */
    interface ElementAttributesProperty {
      props: {};
    }

    /**
     * Property name used to get children type from element class
     */
    interface ElementChildrenAttribute {
      children: {};
    }

    /**
     * Mapping of HTML/SVG tag names to their props
     */
    interface IntrinsicElements {
      // HTML elements
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
      a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
      
      // ... many more HTML elements
      
      // SVG elements
      svg: React.SVGProps<SVGSVGElement>;
      circle: React.SVGProps<SVGCircleElement>;
      path: React.SVGProps<SVGPathElement>;
      
      // ... many more SVG elements
    }

    /**
     * Attributes that can be applied to intrinsic elements
     */
    interface IntrinsicAttributes extends React.Attributes {}

    /**
     * Attributes for class-based components
     */
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
  }
}
```

**Usage Examples:**

```typescript
import React from "react";

// JSX elements are typed based on IntrinsicElements
function JSXElementsDemo() {
  // TypeScript knows these are valid JSX elements with correct props
  const divElement = <div className="container" id="main">Content</div>;
  const buttonElement = <button onClick={() => console.log('clicked')} disabled={false}>Click me</button>;
  const inputElement = <input type="text" value="hello" onChange={() => {}} />;
  const imgElement = <img src="/image.jpg" alt="Description" width={100} height={100} />;

  return (
    <div>
      {divElement}
      {buttonElement}
      {inputElement}
      {imgElement}
    </div>
  );
}

// Custom components also work with JSX
interface CustomComponentProps {
  title: string;
  children: React.ReactNode;
}

function CustomComponent({ title, children }: CustomComponentProps) {
  return (
    <div className="custom">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// TypeScript ensures props are correct
function CustomComponentUsage() {
  return (
    <CustomComponent title="My Title">
      <p>This is the content</p>
    </CustomComponent>
  );
}

// SVG elements are also typed
function SVGDemo() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="blue" />
      <path d="M 10 10 L 90 90" stroke="red" strokeWidth="2" />
    </svg>
  );
}
```

### JSX Element Types

Core types that define JSX elements and their behavior.

```typescript { .api }
/**
 * JSX Element interface extending ReactElement
 */
interface JSXElement extends React.ReactElement<any, any> {
  type: any;
  props: any;
  key: React.Key | null;
}

/**
 * JSX element constructor types
 */
type JSXElementConstructor<P> = 
  | ((props: P) => React.ReactElement<any, any> | null)
  | (new (props: P) => React.Component<any, any>);

/**
 * Valid JSX element type union
 */
type JSXElementType = 
  | keyof JSX.IntrinsicElements
  | JSXElementConstructor<any>;
```

**Usage Examples:**

```typescript
import React, { createElement } from "react";

// Working with JSX element types
function createElementExample() {
  // JSX is syntactic sugar for createElement
  const jsxElement = <div className="box">Hello</div>;
  
  // Equivalent createElement call
  const createdElement = createElement('div', { className: 'box' }, 'Hello');
  
  // Both are JSX.Element types
  const elements: JSX.Element[] = [jsxElement, createdElement];
  
  return elements;
}

// Generic component that accepts JSX element constructors
function withWrapper<P>(
  Component: JSXElementConstructor<P>
): React.FC<P & { wrapperClass?: string }> {
  return ({ wrapperClass = 'wrapper', ...props }) => (
    <div className={wrapperClass}>
      <Component {...props as P} />
    </div>
  );
}

// Usage with different component types
const Button: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
);

class ClassButton extends React.Component<{ onClick: () => void; children: React.ReactNode }> {
  render() {
    return <button onClick={this.props.onClick}>{this.props.children}</button>;
  }
}

// Wrapped components
const WrappedFunctionButton = withWrapper(Button);
const WrappedClassButton = withWrapper(ClassButton);

function ElementConstructorDemo() {
  return (
    <div>
      <WrappedFunctionButton onClick={() => {}} wrapperClass="function-wrapper">
        Function Button
      </WrappedFunctionButton>
      
      <WrappedClassButton onClick={() => {}} wrapperClass="class-wrapper">
        Class Button
      </WrappedClassButton>
    </div>
  );
}
```

### JSX Attributes and Props

Type definitions for JSX attributes and how they map to component props.

```typescript { .api }
/**
 * Base attributes that can be applied to any JSX element
 */
interface JSXIntrinsicAttributes extends React.Attributes {
  key?: React.Key | null;
}

/**
 * Attributes for class components
 */
interface JSXIntrinsicClassAttributes<T> extends React.ClassAttributes<T> {
  ref?: React.Ref<T>;
}

/**
 * Detailed HTML props for specific elements
 */
type DetailedHTMLProps<E extends React.HTMLAttributes<T>, T> = React.ClassAttributes<T> & E;

/**
 * SVG props for SVG elements
 */
interface SVGProps<T> extends React.SVGAttributes<T>, React.ClassAttributes<T> {}
```

**Usage Examples:**

```typescript
import React, { forwardRef, useRef } from "react";

// Component that uses intrinsic attributes
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

function StyledButton({ variant = 'primary', children, onClick, ...props }: ButtonProps & JSX.IntrinsicAttributes) {
  return (
    <button 
      className={`btn btn-${variant}`} 
      onClick={onClick}
      {...props} // This includes key and other intrinsic attributes
    >
      {children}
    </button>
  );
}

// Forward ref component with class attributes
const ForwardRefButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, onClick }, ref) => (
    <button 
      ref={ref}
      className={`btn btn-${variant}`} 
      onClick={onClick}
    >
      {children}
    </button>
  )
);

// Usage with JSX attributes
function AttributesDemo() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div>
      {/* Intrinsic attributes like key work automatically */}
      <StyledButton key="button1" variant="primary" onClick={() => console.log('clicked')}>
        Primary Button
      </StyledButton>

      {/* Class attributes like ref work with forwardRef components */}
      <ForwardRefButton 
        ref={buttonRef} 
        variant="secondary"
        onClick={() => buttonRef.current?.focus()}
      >
        Focus Me
      </ForwardRefButton>
    </div>
  );
}

// Working with detailed HTML props
function DetailedPropsDemo() {
  const handleDivClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    console.log('Div clicked:', event.currentTarget);
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    console.log('Input changed:', event.target.value);
  };

  return (
    <div>
      {/* All HTML div attributes are available and typed */}
      <div
        className="interactive-div"
        onClick={handleDivClick}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'lightblue'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
        tabIndex={0}
        role="button"
        aria-label="Interactive div"
        data-testid="interactive-div"
        style={{ padding: '10px', border: '1px solid black', cursor: 'pointer' }}
      >
        Click me!
      </div>

      {/* All HTML input attributes are available and typed */}
      <input
        type="text"
        placeholder="Enter text"
        onChange={handleInputChange}
        maxLength={50}
        required
        autoComplete="off"
        pattern="[A-Za-z]+"
        title="Only letters allowed"
      />
    </div>
  );
}
```

### JSX Children Handling

Types and patterns for handling children in JSX components.

```typescript { .api }
/**
 * JSX children attribute interface
 */
interface JSXElementChildrenAttribute {
  children: {};
}

/**
 * Valid children types in JSX
 */
type JSXChildren = 
  | React.ReactNode
  | React.ReactNode[]
  | ((props: any) => React.ReactNode);
```

**Usage Examples:**

```typescript
import React, { Children, isValidElement } from "react";

// Component that accepts various children types
interface ContainerProps {
  title?: string;
  children: React.ReactNode;
}

function Container({ title, children }: ContainerProps) {
  return (
    <div className="container">
      {title && <h2>{title}</h2>}
      <div className="container-content">
        {children}
      </div>
    </div>
  );
}

// Component that processes children
interface ListProps {
  children: React.ReactNode;
}

function ProcessedList({ children }: ListProps) {
  const processedChildren = Children.map(children, (child, index) => {
    if (isValidElement(child)) {
      // Clone element with additional props
      return React.cloneElement(child, {
        key: `processed-${index}`,
        className: `${child.props.className || ''} processed-item`
      });
    }
    
    // Wrap non-element children
    return <div key={`wrapped-${index}`} className="wrapped-item">{child}</div>;
  });

  return <ul className="processed-list">{processedChildren}</ul>;
}

// Component with function children (render prop pattern)
interface RenderPropComponentProps {
  data: string[];
  children: (items: string[], loading: boolean) => React.ReactNode;
}

function RenderPropComponent({ data, children }: RenderPropComponentProps) {
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="render-prop-component">
      {children(data, loading)}
    </div>
  );
}

// Usage examples
function ChildrenDemo() {
  return (
    <div>
      {/* Simple children */}
      <Container title="Simple Container">
        <p>This is some content</p>
        <button>Click me</button>
      </Container>

      {/* Multiple children types */}
      <Container title="Mixed Content">
        <div>Element child</div>
        Text child
        {42}
        {true && <span>Conditional child</span>}
        {null}
        {undefined}
      </Container>

      {/* Processed children */}
      <ProcessedList>
        <div>Item 1</div>
        <div className="special">Item 2</div>
        Plain text item
        <span>Item 4</span>
      </ProcessedList>

      {/* Function children (render prop) */}
      <RenderPropComponent data={['apple', 'banana', 'cherry']}>
        {(items, loading) => (
          <div>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <ul>
                {items.map(item => <li key={item}>{item}</li>)}
              </ul>
            )}
          </div>
        )}
      </RenderPropComponent>

      {/* Array of children */}
      <Container>
        {['a', 'b', 'c'].map(letter => (
          <div key={letter}>Letter: {letter}</div>
        ))}
      </Container>
    </div>
  );
}

// Component that validates children types
interface StrictListProps {
  children: React.ReactElement<{ value: string }>[];
}

function StrictList({ children }: StrictListProps) {
  return (
    <div className="strict-list">
      {Children.map(children, (child, index) => {
        if (!isValidElement(child) || typeof child.props.value !== 'string') {
          throw new Error(`Child at index ${index} must have a string 'value' prop`);
        }
        
        return (
          <div key={index} className="strict-list-item">
            {child.props.value}: {child}
          </div>
        );
      })}
    </div>
  );
}

// Usage with strict typing
function StrictListDemo() {
  return (
    <StrictList>
      <span value="first">First item</span>
      <div value="second">Second item</div>
      <p value="third">Third item</p>
    </StrictList>
  );
}
```

### JSX Fragment Types

Types for React fragments in JSX.

```typescript { .api }
/**
 * JSX Fragment type
 */
interface JSXFragment {
  key?: React.Key | null;
  children?: React.ReactNode;
}

/**
 * Fragment props interface
 */
interface FragmentProps {
  children?: React.ReactNode;
}
```

**Usage Examples:**

```typescript
import React, { Fragment } from "react";

// Different ways to use fragments
function FragmentDemo() {
  return (
    <div>
      {/* Long form fragment with key */}
      <Fragment key="fragment1">
        <h1>Title</h1>
        <p>Description</p>
      </Fragment>

      {/* Short form fragment (no key support) */}
      <>
        <h2>Another Title</h2>
        <p>Another description</p>
      </>

      {/* Fragment in array (needs key) */}
      {[1, 2, 3].map(num => (
        <Fragment key={num}>
          <dt>Item {num}</dt>
          <dd>Description for item {num}</dd>
        </Fragment>
      ))}

      {/* Conditional fragment */}
      {true && (
        <>
          <h3>Conditional Content</h3>
          <p>This is shown conditionally</p>
        </>
      )}
    </div>
  );
}

// Component that returns a fragment
function MultipleElements(): JSX.Element {
  return (
    <>
      <header>Header</header>
      <main>Main content</main>
      <footer>Footer</footer>
    </>
  );
}

// Function that creates fragments programmatically
function createFragmentElements(items: string[]): React.ReactElement {
  return React.createElement(
    Fragment,
    null,
    ...items.map((item, index) => 
      React.createElement('div', { key: index }, item)
    )
  );
}
```

### JSX Custom Element Types

Extending JSX to support custom elements or web components.

```typescript { .api }
/**
 * Extending JSX.IntrinsicElements for custom elements
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Custom web components
      'my-custom-element': {
        'custom-prop'?: string;
        'data-value'?: number;
        children?: React.ReactNode;
      };
      
      // Web Components with events
      'web-component': {
        onCustomEvent?: (event: CustomEvent) => void;
        prop1?: string;
        prop2?: number;
      };
    }
  }
}
```

**Usage Examples:**

```typescript
import React from "react";

// Using custom elements in JSX
function CustomElementsDemo() {
  const handleCustomEvent = (event: CustomEvent) => {
    console.log('Custom event received:', event.detail);
  };

  return (
    <div>
      {/* Custom web component */}
      <my-custom-element 
        custom-prop="hello" 
        data-value={42}
      >
        <span>Content inside custom element</span>
      </my-custom-element>

      {/* Web component with event handler */}
      <web-component
        prop1="value1"
        prop2={123}
        onCustomEvent={handleCustomEvent}
      />
    </div>
  );
}

// Type-safe wrapper for web components
interface WebComponentProps {
  prop1?: string;
  prop2?: number;
  onCustomEvent?: (event: CustomEvent) => void;
  children?: React.ReactNode;
}

function WebComponentWrapper({ children, ...props }: WebComponentProps) {
  return React.createElement('web-component', props, children);
}

// Using the wrapper
function WebComponentDemo() {
  return (
    <WebComponentWrapper 
      prop1="typed-value"
      prop2={456}
      onCustomEvent={(e) => console.log('Event:', e.detail)}
    >
      <p>This is content for the web component</p>
    </WebComponentWrapper>
  );
}

// HOC for web component integration
function withWebComponent<P extends object>(
  elementName: string,
  defaultProps?: Partial<P>
) {
  return function WebComponentHOC(props: P & { children?: React.ReactNode }) {
    const finalProps = { ...defaultProps, ...props };
    return React.createElement(elementName, finalProps);
  };
}

// Create typed web component
const TypedCustomElement = withWebComponent<{
  'custom-attr'?: string;
  value?: number;
}>('my-typed-element', { 'custom-attr': 'default' });

function TypedElementDemo() {
  return (
    <TypedCustomElement custom-attr="overridden" value={789}>
      <span>Typed custom element content</span>
    </TypedCustomElement>
  );
}
```