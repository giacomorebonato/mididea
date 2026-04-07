# Elements

Element types define the structure and content that can be rendered in React applications. These types ensure type safety for React elements, nodes, and all renderable content including primitives, components, and special React constructs.

## Capabilities

### ReactElement

Core interface representing a React element created by JSX or createElement.

```typescript { .api }
/**
 * Represents a React element with specific props and type
 * @template P The props type for the element
 * @template T The type of the element (string for DOM elements, component constructor for components)
 */
interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
  type: T;
  props: P;
  key: string | null;
  ref: any;
  
  // Internal React properties
  $$typeof: symbol;
}

/**
 * Constructor type for JSX elements (components or intrinsic elements)
 */
type JSXElementConstructor<P> = 
  | ((props: P) => ReactElement<any, any> | null)
  | (new (props: P) => Component<any, any>);
```

**Usage Examples:**

```typescript
import React, { createElement } from "react";

// JSX creates ReactElement
const element: React.ReactElement = <div>Hello World</div>;

// createElement also creates ReactElement
const createdElement: React.ReactElement<{ name: string }> = createElement(
  'div', 
  { className: 'greeting' }, 
  'Hello World'
);

// Component element
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
);

const buttonElement: React.ReactElement<ButtonProps> = <Button onClick={() => {}}>Click</Button>;

// Accessing element properties
console.log(element.type); // 'div'
console.log(element.props); // { children: 'Hello World' }
console.log(element.key); // null
```

### ReactNode

Union type representing all possible renderable content in React.

```typescript { .api }
/**
 * Represents all types that can be rendered by React components
 * Includes elements, primitives, iterables, portals, and async content
 */
type ReactNode = 
  | ReactElement
  | string
  | number  
  | bigint
  | boolean
  | Iterable<ReactNode>
  | ReactPortal
  | null
  | undefined
  | Promise<AwaitedReactNode>;

/**
 * @internal Helper type for awaited ReactNode content
 */  
type AwaitedReactNode =
  | ReactElement
  | string
  | number
  | bigint
  | Iterable<ReactNode>
  | ReactPortal
  | boolean
  | null
  | undefined;
```

**Usage Examples:**

```typescript
import React from "react";

// All of these are valid ReactNode values
const stringNode: React.ReactNode = "Hello";
const numberNode: React.ReactNode = 42;
const booleanNode: React.ReactNode = true; // Renders nothing
const nullNode: React.ReactNode = null; // Renders nothing
const elementNode: React.ReactNode = <div>Element</div>;
const arrayNode: React.ReactNode = ["Hello", <span key="1">World</span>];

// Component accepting any renderable content
interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => (
  <div className="container">{children}</div>
);

// Usage with various node types
<Container>{stringNode}</Container>
<Container>{[elementNode, stringNode]}</Container>
<Container>
  <div>Complex</div>
  {numberNode}
  {booleanNode && <span>Conditional</span>}
</Container>

// Async content (React 19+)
const AsyncContent: React.FC = async () => {
  const data = await fetch('/api/data').then(r => r.text());
  return <div>{data}</div>;
};

const asyncNode: React.ReactNode = <AsyncContent />;
```

### ReactPortal

Special element type for rendering content outside the normal component tree.

```typescript { .api }
/**
 * Portal created by ReactDOM.createPortal for rendering outside component tree
 */
interface ReactPortal {
  $$typeof: symbol;
  key: string | null;
  children: ReactNode;
}
```

**Usage Examples:**

```typescript
import React from "react";
import { createPortal } from "react-dom";

// Portal renders children in a different DOM node
const Modal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const modalRoot = document.getElementById('modal-root');
  
  if (!modalRoot) return null;
  
  // createPortal returns a ReactPortal
  const portal: React.ReactPortal = createPortal(children, modalRoot);
  return portal;
};

// Usage
function App() {
  return (
    <div>
      <h1>Main App</h1>
      <Modal>
        <div>This renders in #modal-root, not here!</div>
      </Modal>
    </div>
  );
}
```

### Element Creation Functions

Functions for creating React elements programmatically.

```typescript { .api }
/**
 * Creates a React element of the given type with props and children
 */
function createElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
  type: keyof ReactHTML,
  props?: ClassAttributes<T> & P | null,
  ...children: ReactNode[]
): ReactElement<P, string>;

function createElement<P extends SVGAttributes<T>, T extends SVGElement>(
  type: keyof ReactSVG,
  props?: ClassAttributes<T> & P | null,
  ...children: ReactNode[]
): ReactElement<P, string>;

function createElement<P extends {}>(
  type: FunctionComponent<P>,
  props?: Attributes & P | null,
  ...children: ReactNode[]
): ReactElement<P, FunctionComponent<P>>;

function createElement<P extends {}>(
  type: ComponentClass<P>,
  props?: ClassAttributes<ComponentClass<P>> & P | null,
  ...children: ReactNode[]
): ReactElement<P, ComponentClass<P>>;

function createElement<P extends {}>(
  type: string,
  props?: P & Attributes | null,
  ...children: ReactNode[]
): ReactElement<P, string>;
```

**Usage Examples:**

```typescript
import React, { createElement } from "react";

// Creating DOM elements
const divElement = createElement('div', { className: 'container' }, 'Hello World');
const inputElement = createElement('input', { type: 'text', value: 'initial' });

// Creating component elements
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
);

const buttonElement = createElement(Button, { onClick: () => console.log('clicked') }, 'Click me');

// With multiple children
const containerElement = createElement(
  'div',
  { className: 'wrapper' },
  createElement('h1', null, 'Title'),
  createElement('p', null, 'Description'),
  buttonElement
);
```

### Element Cloning

Functions for cloning and modifying existing React elements.

```typescript { .api }
/**
 * Clones a React element and optionally overrides props and children
 */
function cloneElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
  element: ReactElement<P, string>,
  props?: P,
  ...children: ReactNode[]
): ReactElement<P, string>;

function cloneElement<P extends SVGAttributes<T>, T extends SVGElement>(
  element: ReactElement<P, string>,
  props?: P,
  ...children: ReactNode[]
): ReactElement<P, string>;

function cloneElement<P>(
  element: ReactElement<P>,
  props?: Partial<P> & Attributes,
  ...children: ReactNode[]
): ReactElement<P>;
```

**Usage Examples:**

```typescript
import React, { cloneElement } from "react";

const originalElement = <button onClick={() => console.log('original')}>Click</button>;

// Clone with modified props
const clonedWithNewClick = cloneElement(originalElement, {
  onClick: () => console.log('cloned'),
  className: 'cloned-button'
});

// Clone with new children
const clonedWithNewChildren = cloneElement(originalElement, null, 'New Text');

// Clone component element
interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => (
  <div className="card">
    <h3>{title}</h3>
    {children}
  </div>
);

const originalCard = <Card title="Original">Original content</Card>;
const clonedCard = cloneElement(originalCard, { title: "Cloned" }, "Cloned content");
```

### Element Validation

Functions for validating and checking React elements.

```typescript { .api }
/**
 * Type guard to check if a value is a valid React element
 * @param object The value to check
 * @returns Type predicate indicating if value is ReactElement
 */
function isValidElement<P>(object: {} | null | undefined): object is ReactElement<P>;
```

**Usage Examples:**

```typescript
import React, { isValidElement } from "react";

function renderContent(content: unknown): React.ReactNode {
  if (isValidElement(content)) {
    // TypeScript knows content is ReactElement here
    console.log('Element type:', content.type);
    console.log('Element props:', content.props);
    return content;
  }
  
  if (typeof content === 'string' || typeof content === 'number') {
    return content;
  }
  
  return null;
}

// Usage
const element = <div>Hello</div>;
const string = "Hello";
const number = 42;

renderContent(element); // Renders the element
renderContent(string);  // Renders the string
renderContent(number);  // Renders the number
renderContent({});      // Returns null

// In component props
interface FlexibleProps {
  content: React.ReactNode;
}

const FlexibleComponent: React.FC<FlexibleProps> = ({ content }) => {
  if (isValidElement(content)) {
    // Can safely access element properties
    const elementWithProps = React.cloneElement(content, {
      className: `${content.props.className || ''} flexible-element`
    });
    return <div>{elementWithProps}</div>;
  }
  
  return <div>{content}</div>;
};
```

### Fragment Types

Types for React Fragment elements that group multiple children.

```typescript { .api }
/**
 * React Fragment component for grouping elements without extra DOM nodes
 */
interface Fragment {
  (props: { children?: ReactNode }): ReactElement | null;
}

/**
 * Props for React Fragment
 */
interface FragmentProps {
  children?: ReactNode;
}

/**
 * Fragment element created by React.Fragment or <></>
 */
const Fragment: ExoticComponent<FragmentProps>;
```

**Usage Examples:**

```typescript
import React, { Fragment } from "react";

// Using React.Fragment
const fragmentElement1 = (
  <Fragment>
    <div>First</div>
    <div>Second</div>
  </Fragment>
);

// Using shorthand syntax
const fragmentElement2 = (
  <>
    <div>First</div>
    <div>Second</div>
  </>
);

// Fragment with key (only React.Fragment syntax supports keys)
const itemsWithKeys = items.map(item => (
  <Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.definition}</dd>
  </Fragment>
));

// Creating Fragment programmatically
const programmaticFragment = React.createElement(
  Fragment,
  null,
  React.createElement('span', null, 'First'),
  React.createElement('span', null, 'Second')
);
```

### Key Types

Types for React element keys used for reconciliation.

```typescript { .api }
/**
 * Valid types for React element keys
 */
type Key = string | number | bigint;

/**
 * Attributes that include a key
 */
interface Attributes {
  key?: Key | null;
}

/**
 * Class attributes that include key and ref
 */
interface ClassAttributes<T> extends Attributes {
  ref?: LegacyRef<T>;
}
```

**Usage Examples:**

```typescript
import React from "react";

interface Item {
  id: number;
  name: string;
}

const items: Item[] = [
  { id: 1, name: 'First' },
  { id: 2, name: 'Second' },
  { id: 3, name: 'Third' }
];

// Using keys in lists
const ItemList: React.FC<{ items: Item[] }> = ({ items }) => (
  <ul>
    {items.map(item => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
);

// Different key types
const stringKeyElement = <div key="string-key">Content</div>;
const numberKeyElement = <div key={123}>Content</div>;
const bigintKeyElement = <div key={123n}>Content</div>;

// Creating elements with keys programmatically
const elementsWithKeys = items.map(item => 
  React.createElement('li', { key: item.id }, item.name)
);
```

### Children Utilities

Utilities for working with ReactNode children.

```typescript { .api }
/**
 * Utilities for working with React children
 */
namespace Children {
  /**
   * Maps over children and returns an array
   */
  function map<T, C>(
    children: C | ReadonlyArray<C>,
    fn: (child: C, index: number) => T
  ): C extends null | undefined ? C : Array<Exclude<T, boolean | null | undefined>>;

  /**
   * Iterates over children without returning anything
   */
  function forEach<C>(
    children: C | ReadonlyArray<C>,
    fn: (child: C, index: number) => void
  ): void;

  /**
   * Counts the number of children
   */
  function count(children: any): number;

  /**
   * Returns the only child or throws if there are multiple
   */
  function only<C>(children: C): C extends any[] ? never : C;

  /**
   * Converts children to a flat array
   */
  function toArray(children: ReactNode | ReactNode[]): Array<Exclude<ReactNode, boolean | null | undefined>>;
}
```

**Usage Examples:**

```typescript
import React, { Children } from "react";

interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  // Map over children and add props
  const enhancedChildren = Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
        key: index,
        className: `${child.props.className || ''} enhanced`
      });
    }
    return child;
  });

  return <div className="container">{enhancedChildren}</div>;
};

// Count children
const CountDisplay: React.FC<ContainerProps> = ({ children }) => {
  const count = Children.count(children);
  return <div>This container has {count} children</div>;
};

// Only child validation
const SingleChildWrapper: React.FC<ContainerProps> = ({ children }) => {
  const onlyChild = Children.only(children); // Throws if multiple children
  return <div className="single-wrapper">{onlyChild}</div>;
};

// Convert to array for processing
const ListWrapper: React.FC<ContainerProps> = ({ children }) => {
  const childArray = Children.toArray(children);
  return (
    <ul>
      {childArray.map((child, index) => (
        <li key={index}>{child}</li>
      ))}
    </ul>
  );
};
```