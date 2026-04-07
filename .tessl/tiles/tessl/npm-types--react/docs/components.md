# Components

Component type definitions provide the foundation for building React applications with TypeScript. These types enable full type safety for both function and class components, including props validation, state management, and component lifecycle.

## Capabilities

### FunctionComponent

Type definition for React function components with optional generic props type.

```typescript { .api }
/**
 * Represents a React function component that can accept props and return renderable content
 * @template P The props type for the component
 */
interface FunctionComponent<P = {}> {
  (props: P): ReactNode | Promise<ReactNode>;
  displayName?: string;
  defaultProps?: Partial<P>;
  propTypes?: WeakValidationMap<P>;
}

// Type alias for backward compatibility
type FC<P = {}> = FunctionComponent<P>;
```

**Usage Examples:**

```typescript
import React from "react";

// Function component with typed props
interface UserProps {
  name: string;
  age?: number;
}

const User: React.FunctionComponent<UserProps> = ({ name, age }) => {
  return <div>{name} {age && `(${age})`}</div>;
};

// With displayName for debugging
const Button: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick}>Click me</button>
);
Button.displayName = 'Button';

// Async function component (React 19+)
const AsyncUser: React.FC<{ userId: string }> = async ({ userId }) => {
  const user = await fetchUser(userId);
  return <div>{user.name}</div>;
};
```

### ComponentClass

Type definition for React class component constructors.

```typescript { .api }
/**
 * Represents a React class component constructor
 * @template P The props type for the component
 * @template S The state type for the component
 */
interface ComponentClass<P = {}, S = ComponentState> extends StaticLifecycle<P, S> {
  new (props: P, context?: any): Component<P, S>;
  displayName?: string;
  defaultProps?: Partial<P>;
  contextType?: Context<any>;
  propTypes?: WeakValidationMap<P>;
  childContextTypes?: ValidationMap<any>;
  getDefaultProps?(): Partial<P>;
}
```

**Usage Examples:**

```typescript
import React, { Component } from "react";

interface Props {
  initialCount: number;
}

interface State {
  count: number;
}

class Counter extends Component<Props, State> {
  static displayName = 'Counter';
  static defaultProps: Partial<Props> = {
    initialCount: 0
  };

  constructor(props: Props) {
    super(props);
    this.state = { count: props.initialCount };
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}

// Assigning to ComponentClass type
const CounterClass: React.ComponentClass<Props, State> = Counter;
```

### ComponentType

Union type representing any React component (function or class).

```typescript { .api }
/**
 * Represents any user-defined React component, either function or class
 * @template P The props type for the component
 */
type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;
```

**Usage Examples:**

```typescript
import React from "react";

// Generic component wrapper
function withLoading<P>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P & { isLoading?: boolean }> {
  return (props) => {
    const { isLoading, ...otherProps } = props as any;
    if (isLoading) return <div>Loading...</div>;
    return <WrappedComponent {...otherProps as P} />;
  };
}

// HOC that accepts any component type
function memo<P>(component: React.ComponentType<P>): React.ComponentType<P> {
  // Implementation would wrap component with memoization
  return component;
}
```

### Component Base Class

The base class for all React class components.

```typescript { .api }
/**
 * Base class for React class components
 * @template P The props type
 * @template S The state type  
 * @template SS The snapshot type for getSnapshotBeforeUpdate
 */
abstract class Component<P = {}, S = {}, SS = any> implements ComponentLifecycle<P, S> {
  readonly props: Readonly<P>;
  state: Readonly<S>;
  context: unknown;
  refs: { [key: string]: ReactInstance };

  constructor(props: P, context?: any);

  setState<K extends keyof S>(
    state: ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null) | Pick<S, K> | S | null,
    callback?: () => void
  ): void;

  forceUpdate(callback?: () => void): void;

  abstract render(): ReactNode;

  // Lifecycle methods
  componentDidMount?(): void;
  componentWillUnmount?(): void;
  componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
  shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
  componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
  getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;

  // Static lifecycle methods
  static getDerivedStateFromProps?<P, S>(props: P, state: S): Partial<S> | null;
  static getDerivedStateFromError?<P, S>(error: any): Partial<S> | null;
}
```

**Usage Examples:**

```typescript
import React, { Component } from "react";

interface Props {
  name: string;
}

interface State {
  count: number;
  hasError: boolean;
}

class MyComponent extends Component<Props, State> {
  state: State = {
    count: 0,
    hasError: false
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidMount() {
    console.log('Component mounted');
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.name !== this.props.name) {
      console.log('Name changed');
    }
  }

  componentWillUnmount() {
    console.log('Component will unmount');
  }

  handleIncrement = () => {
    this.setState(prevState => ({ count: prevState.count + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>;
    }

    return (
      <div>
        <h1>Hello {this.props.name}</h1>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleIncrement}>Increment</button>
      </div>
    );
  }
}
```

### PureComponent

React class component with built-in shallow comparison for shouldComponentUpdate.

```typescript { .api }
/**
 * React component that implements shouldComponentUpdate with shallow prop and state comparison
 * @template P The props type
 * @template S The state type
 * @template SS The snapshot type
 */
class PureComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {
  shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
}
```

**Usage Examples:**

```typescript
import React, { PureComponent } from "react";

interface Props {
  name: string;
  count: number;
}

class OptimizedComponent extends PureComponent<Props> {
  render() {
    console.log('Render called'); // Only called when props actually change
    return <div>{this.props.name}: {this.props.count}</div>;
  }
}

// Will only re-render when name or count changes
<OptimizedComponent name="John" count={5} />
```

### Exotic Component Types

Special component types for React's higher-order components and advanced patterns.

```typescript { .api }
/**
 * Base type for exotic components (components created by React.memo, React.forwardRef, etc.)
 */
interface ExoticComponent<P = {}> {
  (props: P): ReactElement | null;
  readonly $$typeof: symbol;
}

/**
 * Component created by React.memo with display name
 */
interface NamedExoticComponent<P = {}> extends ExoticComponent<P> {
  displayName?: string;
}

/**
 * Component created by React.memo
 */
interface MemoExoticComponent<T extends ComponentType<any>> extends NamedExoticComponent<ComponentProps<T>> {
  readonly type: T;
}

/**
 * Component created by React.forwardRef
 */
interface ForwardRefExoticComponent<P> extends NamedExoticComponent<P> {
  defaultProps?: Partial<P>;
  propTypes?: WeakValidationMap<P>;
}

/**
 * Component created by React.lazy
 */
interface LazyExoticComponent<T extends ComponentType<any>> extends ExoticComponent<ComponentProps<T>> {
  readonly _result: T;
}
```

**Usage Examples:**

```typescript
import React, { memo, forwardRef, lazy } from "react";

// Memoized component
const MemoButton = memo<{ onClick: () => void }>(({ onClick }) => (
  <button onClick={onClick}>Click me</button>
));

// Forward ref component
const FancyButton = forwardRef<HTMLButtonElement, { children: React.ReactNode }>(
  (props, ref) => <button ref={ref} className="fancy">{props.children}</button>
);

// Lazy loaded component
const LazyComponent = lazy(() => import('./MyComponent'));

// Type assertions for exotic components
const memoComponent: React.MemoExoticComponent<typeof Button> = MemoButton;
const forwardRefComponent: React.ForwardRefExoticComponent<{ children: React.ReactNode }> = FancyButton;
```

### Component Instance Types

Types representing instances of React components.

```typescript { .api }
/**
 * Instance of a React component (class component instance)
 */
type ComponentState = any;

/**
 * Any React component instance
 */
type ReactInstance = Component<any> | Element;

/**
 * Props for components that support refs
 */
interface RefAttributes<T> extends Attributes {
  ref?: Ref<T>;
}

/**
 * Base attributes for all React elements
 */
interface Attributes {
  key?: Key | null;
}
```

**Usage Examples:**

```typescript
import React, { Component, createRef } from "react";

class MyComponent extends Component {
  getValue() {
    return "component value";
  }
  
  render() {
    return <div>My Component</div>;
  }
}

// Creating refs to component instances
const componentRef = createRef<MyComponent>();
const elementRef = createRef<HTMLDivElement>();

function ParentComponent() {
  const handleClick = () => {
    // Access component instance methods
    if (componentRef.current) {
      console.log(componentRef.current.getValue());
    }
    
    // Access DOM element properties
    if (elementRef.current) {
      console.log(elementRef.current.innerText);
    }
  };

  return (
    <div>
      <MyComponent ref={componentRef} />
      <div ref={elementRef}>Some text</div>
      <button onClick={handleClick}>Access Refs</button>
    </div>
  );
}
```

### Validation Types

Types for prop and context validation (legacy).

```typescript { .api }
/**
 * Validation function for props
 */
interface Validator<T> {
  (props: object, propName: string, componentName: string, location: string, propFullName: string): Error | null;
}

/**
 * Validation map for props where validation is optional
 */
interface WeakValidationMap<T> {
  [K in keyof T]?: null extends T[K]
    ? Validator<T[K] | null | undefined>
    : undefined extends T[K]
    ? Validator<T[K] | null | undefined>
    : Validator<T[K]>;
}

/**
 * Validation map for props where validation is required
 */
interface ValidationMap<T> {
  [K in keyof T]: Validator<T[K]>;
}
```

**Usage Examples:**

```typescript
import React, { Component } from "react";
import PropTypes from 'prop-types';

interface Props {
  name: string;
  age?: number;
}

class UserComponent extends Component<Props> {
  static propTypes: React.WeakValidationMap<Props> = {
    name: PropTypes.string.isRequired,
    age: PropTypes.number
  };

  render() {
    return <div>{this.props.name}</div>;
  }
}
```