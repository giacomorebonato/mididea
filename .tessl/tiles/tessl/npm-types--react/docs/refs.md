# Refs

React's ref system provides a way to access DOM elements and component instances directly. The @types/react package includes comprehensive type definitions for refs, supporting both object refs and callback refs with full type safety for accessing DOM properties and component methods.

## Capabilities

### RefObject

Immutable ref object type for storing references to DOM elements or component instances.

```typescript { .api }
/**
 * Immutable ref object that holds a reference to a value
 * @template T The type of the referenced value
 */
interface RefObject<T> {
  readonly current: T | null;
}
```

**Usage Examples:**

```typescript
import React, { useRef, useEffect } from "react";

function FocusInput() {
  // Ref for DOM element
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="Type here..." />
      <button onClick={handleClear}>Clear</button>
    </div>
  );
}

// Generic ref for different element types
function MediaRefs() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayVideo = () => {
    videoRef.current?.play();
  };

  const handleDrawCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, 100, 100);
      }
    }
  };

  return (
    <div>
      <video ref={videoRef} src="video.mp4" controls />
      <canvas ref={canvasRef} width={200} height={200} />
      <audio ref={audioRef} src="audio.mp3" controls />
      
      <button onClick={handlePlayVideo}>Play Video</button>
      <button onClick={handleDrawCanvas}>Draw on Canvas</button>
    </div>
  );
}
```

### MutableRefObject

Mutable ref object type that can be modified directly.

```typescript { .api }
/**
 * Mutable ref object that holds a reference to a value
 * @template T The type of the referenced value
 */
interface MutableRefObject<T> {
  current: T;
}
```

**Usage Examples:**

```typescript
import React, { useRef, useEffect, useState } from "react";

function Timer() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  // Mutable ref for storing timer ID
  const timerRef = useRef<number | null>(null);
  
  // Mutable ref for storing latest callback
  const callbackRef = useRef<() => void>();

  useEffect(() => {
    callbackRef.current = () => {
      setCount(prev => prev + 1);
    };
  });

  const startTimer = () => {
    if (timerRef.current) return; // Already running
    
    timerRef.current = window.setInterval(() => {
      callbackRef.current?.();
    }, 1000);
    
    setIsRunning(true);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setCount(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div>
      <h3>Timer: {count} seconds</h3>
      <button onClick={startTimer} disabled={isRunning}>Start</button>
      <button onClick={stopTimer} disabled={!isRunning}>Stop</button>
      <button onClick={resetTimer}>Reset</button>
    </div>
  );
}

// Storing previous values
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

function ValueTracker({ value }: { value: number }) {
  const previousValue = usePrevious(value);
  
  return (
    <div>
      <p>Current value: {value}</p>
      <p>Previous value: {previousValue ?? 'None'}</p>
    </div>
  );
}
```

### RefCallback

Callback function type for refs that provides more control over ref assignment.

```typescript { .api }
/**
 * Callback function type for refs
 * @template T The type of the element or instance
 */
type RefCallback<T> = (instance: T | null) => void | (() => void);
```

**Usage Examples:**

```typescript
import React, { useState, useCallback } from "react";

function CallbackRefDemo() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Callback ref that measures element
  const measuredRef: React.RefCallback<HTMLDivElement> = useCallback((node) => {
    if (node !== null) {
      const resizeObserver = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      });
      
      resizeObserver.observe(node);
      
      // Return cleanup function
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div>
      <div 
        ref={measuredRef}
        style={{ 
          width: '50%', 
          height: '200px', 
          backgroundColor: 'lightblue',
          resize: 'both',
          overflow: 'auto'
        }}
      >
        Resize me!
      </div>
      <p>Width: {Math.round(dimensions.width)}px</p>
      <p>Height: {Math.round(dimensions.height)}px</p>
    </div>
  );
}

// Dynamic ref callback based on conditions
function ConditionalRef({ shouldTrack }: { shouldTrack: boolean }) {
  const [clickCount, setClickCount] = useState(0);
  
  const refCallback: React.RefCallback<HTMLButtonElement> = useCallback((node) => {
    if (node && shouldTrack) {
      const handleClick = () => setClickCount(prev => prev + 1);
      node.addEventListener('click', handleClick);
      
      return () => {
        node.removeEventListener('click', handleClick);
      };
    }
  }, [shouldTrack]);

  return (
    <div>
      <button ref={refCallback}>
        Click me {shouldTrack ? `(${clickCount} clicks)` : '(not tracking)'}
      </button>
    </div>
  );
}
```

### Ref Union Type

Generic ref type that accepts both object refs and callback refs.

```typescript { .api }
/**
 * Union type that accepts any valid ref type
 * @template T The type of the element or instance
 */
type Ref<T> = RefCallback<T> | RefObject<T | null> | null;

/**
 * Legacy ref type (deprecated)
 */
type LegacyRef<T> = string | Ref<T>;
```

**Usage Examples:**

```typescript
import React, { forwardRef, useRef } from "react";

// Component that accepts any ref type
interface FlexibleInputProps {
  placeholder?: string;
  myRef?: React.Ref<HTMLInputElement>;
}

function FlexibleInput({ placeholder, myRef }: FlexibleInputProps) {
  return <input ref={myRef} placeholder={placeholder} />;
}

// Usage with different ref types
function RefTypesDemo() {
  const objectRef = useRef<HTMLInputElement>(null);
  
  const callbackRef: React.RefCallback<HTMLInputElement> = (node) => {
    if (node) {
      console.log('Input attached:', node);
    }
  };

  return (
    <div>
      {/* Object ref */}
      <FlexibleInput myRef={objectRef} placeholder="Object ref" />
      
      {/* Callback ref */}
      <FlexibleInput myRef={callbackRef} placeholder="Callback ref" />
      
      {/* Null ref */}
      <FlexibleInput myRef={null} placeholder="No ref" />
    </div>
  );
}
```

### createRef Function

Function for creating ref objects (class component style).

```typescript { .api }
/**
 * Creates a ref object for class components or when you need a ref outside of a hook
 * @template T The type of the referenced value
 * @returns A new ref object
 */
function createRef<T>(): RefObject<T | null>;
```

**Usage Examples:**

```typescript
import React, { Component, createRef } from "react";

// Class component using createRef
class ClassComponentWithRef extends Component {
  private inputRef = createRef<HTMLInputElement>();
  private containerRef = createRef<HTMLDivElement>();

  componentDidMount() {
    // Focus input after mounting
    this.inputRef.current?.focus();
  }

  handleClearInput = () => {
    if (this.inputRef.current) {
      this.inputRef.current.value = '';
      this.inputRef.current.focus();
    }
  };

  handleScrollToTop = () => {
    this.containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  render() {
    return (
      <div ref={this.containerRef} style={{ height: '300px', overflow: 'auto' }}>
        <input ref={this.inputRef} type="text" placeholder="Type here..." />
        <button onClick={this.handleClearInput}>Clear Input</button>
        <button onClick={this.handleScrollToTop}>Scroll to Top</button>
        
        {/* Lots of content to make scrolling necessary */}
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i}>Content line {i + 1}</p>
        ))}
      </div>
    );
  }
}

// Creating refs outside components
const globalInputRef = createRef<HTMLInputElement>();

function GlobalRefExample() {
  const focusGlobalInput = () => {
    globalInputRef.current?.focus();
  };

  return (
    <div>
      <input ref={globalInputRef} placeholder="Global ref input" />
      <button onClick={focusGlobalInput}>Focus Global Input</button>
    </div>
  );
}
```

### forwardRef Function

Higher-order component for forwarding refs through component boundaries.

```typescript { .api }
/**
 * Creates a component that forwards refs to a child element
 * @template T The type of the element the ref will point to
 * @template P The props type for the component
 */
function forwardRef<T, P = {}>(
  render: ForwardRefRenderFunction<T, P>
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

/**
 * Render function type for forwardRef components
 */
interface ForwardRefRenderFunction<T, P = {}> {
  (props: P, ref: ForwardedRef<T>): ReactElement | null;
  displayName?: string;
  defaultProps?: never;
  propTypes?: never;
}

/**
 * Forwarded ref type
 */
type ForwardedRef<T> = ((instance: T | null) => void) | MutableRefObject<T | null> | null;

/**
 * Forward ref exotic component type
 */
interface ForwardRefExoticComponent<P> extends NamedExoticComponent<P> {
  defaultProps?: Partial<P>;
  propTypes?: WeakValidationMap<P>;
}
```

**Usage Examples:**

```typescript
import React, { forwardRef, useRef, useImperativeHandle } from "react";

// Basic forward ref component
interface InputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
}

const FancyInput = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, onChange }, ref) => {
    return (
      <input
        ref={ref}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ 
          padding: '10px', 
          border: '2px solid blue', 
          borderRadius: '4px' 
        }}
      />
    );
  }
);

FancyInput.displayName = 'FancyInput';

// Custom ref handle with useImperativeHandle
interface CustomInputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
}

const CustomInput = forwardRef<CustomInputHandle, InputProps>(
  (props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      },
      getValue: () => inputRef.current?.value ?? '',
      setValue: (value: string) => {
        if (inputRef.current) {
          inputRef.current.value = value;
        }
      }
    }), []);

    return <input ref={inputRef} {...props} />;
  }
);

// Using forwardRef components
function ForwardRefDemo() {
  const fancyInputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<CustomInputHandle>(null);

  const handleFocusFancy = () => {
    fancyInputRef.current?.focus();
  };

  const handleFocusCustom = () => {
    customInputRef.current?.focus();
  };

  const handleClearCustom = () => {
    customInputRef.current?.clear();
  };

  const handleGetValue = () => {
    const value = customInputRef.current?.getValue();
    alert(`Current value: ${value}`);
  };

  return (
    <div>
      <div>
        <FancyInput ref={fancyInputRef} placeholder="Fancy input" />
        <button onClick={handleFocusFancy}>Focus Fancy</button>
      </div>
      
      <div>
        <CustomInput ref={customInputRef} placeholder="Custom input" />
        <button onClick={handleFocusCustom}>Focus Custom</button>
        <button onClick={handleClearCustom}>Clear Custom</button>
        <button onClick={handleGetValue}>Get Value</button>
      </div>
    </div>
  );
}

// Forward ref with generic props
interface GenericComponentProps<T> {
  value: T;
  onChange: (value: T) => void;
}

const GenericForwardRef = forwardRef<
  HTMLInputElement, 
  GenericComponentProps<string>
>(({ value, onChange }, ref) => {
  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
});
```

### Ref Attributes

Attributes interface for components that support refs.

```typescript { .api }
/**
 * Attributes for components that support refs
 * @template T The type of the ref target
 */
interface RefAttributes<T> extends Attributes {
  ref?: Ref<T>;
}

/**
 * Base attributes interface
 */
interface Attributes {
  key?: Key | null;
}

/**
 * Class attributes that extend RefAttributes for class components
 */
interface ClassAttributes<T> extends RefAttributes<T> {}
```

**Usage Examples:**

```typescript
import React from "react";

// Component props that include ref support
interface ButtonProps extends React.RefAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

function CustomButton({ children, onClick, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button 
      {...props}
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}

// Using ref-enabled component
function ButtonDemo() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleFocusButton = () => {
    buttonRef.current?.focus();
  };

  return (
    <div>
      <CustomButton 
        ref={buttonRef}
        onClick={() => console.log('Button clicked')}
      >
        Custom Button
      </CustomButton>
      
      <button onClick={handleFocusButton}>Focus Custom Button</button>
    </div>
  );
}

// Component that accepts refs but strips them from DOM props
interface WrapperProps extends React.RefAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Wrapper = React.forwardRef<HTMLDivElement, WrapperProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={`wrapper ${className || ''}`} {...props}>
        {children}
      </div>
    );
  }
);
```