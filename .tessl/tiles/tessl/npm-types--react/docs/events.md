# Events

React's event system provides synthetic events that wrap native DOM events with a consistent interface across different browsers. The @types/react package includes comprehensive type definitions for all synthetic events and event handlers, ensuring type safety for event handling in React applications.

## Capabilities

### SyntheticEvent Base

Base interface for all React synthetic events.

```typescript { .api }
/**
 * Base synthetic event interface that wraps native DOM events
 * @template T The target element type
 * @template E The native event type
 */
interface SyntheticEvent<T = Element, E = Event> extends BaseSyntheticEvent<E, EventTarget & T, EventTarget> {}

/**
 * Base synthetic event with generic types
 */
interface BaseSyntheticEvent<E = object, C = any, T = any> {
  nativeEvent: E;
  currentTarget: C;
  target: T;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  timeStamp: number;
  type: string;
  
  preventDefault(): void;
  isDefaultPrevented(): boolean;
  stopPropagation(): void;
  isPropagationStopped(): boolean;
  persist(): void;
}
```

**Usage Examples:**

```typescript
import React from "react";

// Generic event handler
const handleGenericEvent = (event: React.SyntheticEvent) => {
  console.log('Event type:', event.type);
  console.log('Current target:', event.currentTarget);
  console.log('Target:', event.target);
  
  // Prevent default behavior
  event.preventDefault();
  
  // Stop event propagation
  event.stopPropagation();
};

// Typed event handler
const handleButtonEvent = (event: React.SyntheticEvent<HTMLButtonElement>) => {
  // event.currentTarget is typed as HTMLButtonElement
  console.log('Button text:', event.currentTarget.textContent);
  
  // Access native event
  console.log('Native event:', event.nativeEvent);
};

function EventDemo() {
  return (
    <div onClick={handleGenericEvent}>
      <button onClick={handleButtonEvent}>Click me</button>
    </div>
  );
}
```

### Mouse Events

Mouse event types for handling mouse interactions.

```typescript { .api }
/**
 * Mouse event interface
 * @template T The target element type
 */
interface MouseEvent<T = Element> extends SyntheticEvent<T, NativeMouseEvent> {
  altKey: boolean;
  button: number;
  buttons: number;
  clientX: number;
  clientY: number;
  ctrlKey: boolean;
  metaKey: boolean;
  movementX: number;
  movementY: number;
  pageX: number;
  pageY: number;
  relatedTarget: EventTarget | null;
  screenX: number;
  screenY: number;
  shiftKey: boolean;
  
  getModifierState(key: string): boolean;
}

/**
 * Mouse event handler type
 */
type MouseEventHandler<T = Element> = EventHandler<MouseEvent<T>>;

/**
 * Generic event handler type
 */
type EventHandler<E extends SyntheticEvent<any>> = (event: E) => void;
```

**Usage Examples:**

```typescript
import React from "react";

function MouseEventDemo() {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    console.log('Button clicked:', event.button); // 0 = left, 1 = middle, 2 = right
    console.log('Position:', event.clientX, event.clientY);
    console.log('Modifiers:', {
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey
    });
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log('Mouse position relative to element:', x, y);
  };

  const handleContextMenu: React.MouseEventHandler = (event) => {
    event.preventDefault(); // Prevent default context menu
    console.log('Right click detected');
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onContextMenu={handleContextMenu}
      style={{ width: 300, height: 200, border: '1px solid black' }}
    >
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}

// Drag and drop example
function DragDemo() {
  const handleDragStart: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.dataTransfer.setData('text/plain', 'dragged-item');
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault(); // Allow drop
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain');
    console.log('Dropped data:', data);
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div 
        draggable 
        onDragStart={handleDragStart}
        style={{ padding: '10px', backgroundColor: 'lightblue' }}
      >
        Drag me
      </div>
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ padding: '10px', border: '2px dashed gray', minHeight: '50px' }}
      >
        Drop here
      </div>
    </div>
  );
}
```

### Keyboard Events

Keyboard event types for handling keyboard interactions.

```typescript { .api }
/**
 * Keyboard event interface
 * @template T The target element type
 */
interface KeyboardEvent<T = Element> extends SyntheticEvent<T, NativeKeyboardEvent> {
  altKey: boolean;
  charCode: number;
  ctrlKey: boolean;
  key: string;
  keyCode: number;
  locale: string;
  location: number;
  metaKey: boolean;
  repeat: boolean;
  shiftKey: boolean;
  which: number;
  
  getModifierState(key: string): boolean;
}

/**
 * Keyboard event handler type
 */
type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { useState } from "react";

function KeyboardDemo() {
  const [keyInfo, setKeyInfo] = useState('');

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    setKeyInfo(`Key: ${event.key}, Code: ${event.code}`);
    
    // Handle special keys
    if (event.key === 'Enter') {
      console.log('Enter pressed');
    } else if (event.key === 'Escape') {
      event.currentTarget.blur();
    } else if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      console.log('Ctrl+S pressed');
    }
  };

  const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    console.log('Key released:', event.key);
  };

  return (
    <div>
      <input 
        type="text" 
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        placeholder="Type something..."
      />
      <p>Last key info: {keyInfo}</p>
    </div>
  );
}

// Custom hook for keyboard shortcuts
function useKeyboardShortcut(
  key: string, 
  callback: () => void, 
  modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean }
) {
  React.useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== key) return;
      
      const ctrlMatch = !modifiers?.ctrl || event.ctrlKey;
      const shiftMatch = !modifiers?.shift || event.shiftKey;
      const altMatch = !modifiers?.alt || event.altKey;
      const metaMatch = !modifiers?.meta || event.metaKey;
      
      if (ctrlMatch && shiftMatch && altMatch && metaMatch) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, modifiers]);
}
```

### Form Events

Form event types for handling form interactions.

```typescript { .api }
/**
 * Form event interface
 * @template T The target element type
 */
interface FormEvent<T = Element> extends SyntheticEvent<T> {}

/**
 * Change event interface
 * @template T The target element type
 */
interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & T;
}

/**
 * Form event handler type
 */
type FormEventHandler<T = Element> = EventHandler<FormEvent<T>>;

/**
 * Change event handler type
 */
type ChangeEventHandler<T = Element> = EventHandler<ChangeEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { useState } from "react";

interface FormData {
  name: string;
  email: string;
  age: number;
  agree: boolean;
}

function FormDemo() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    age: 0,
    agree: false
  });

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name, value, type, checked } = event.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    setFormData(prev => ({ ...prev, category: event.target.value }));
  };

  const handleTextareaChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setFormData(prev => ({ ...prev, description: event.target.value }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleReset: React.FormEventHandler<HTMLFormElement> = (event) => {
    setFormData({ name: '', email: '', age: 0, agree: false });
  };

  return (
    <form onSubmit={handleSubmit} onReset={handleReset}>
      <div>
        <label>
          Name:
          <input 
            type="text" 
            name="name" 
            value={formData.name}
            onChange={handleInputChange}
          />
        </label>
      </div>
      
      <div>
        <label>
          Email:
          <input 
            type="email" 
            name="email" 
            value={formData.email}
            onChange={handleInputChange}
          />
        </label>
      </div>
      
      <div>
        <label>
          Age:
          <input 
            type="number" 
            name="age" 
            value={formData.age}
            onChange={handleInputChange}
          />
        </label>
      </div>
      
      <div>
        <label>
          <input 
            type="checkbox" 
            name="agree" 
            checked={formData.agree}
            onChange={handleInputChange}
          />
          I agree to the terms
        </label>
      </div>
      
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </form>
  );
}
```

### Focus Events

Focus event types for handling focus and blur interactions.

```typescript { .api }
/**
 * Focus event interface
 * @template T The target element type
 */
interface FocusEvent<T = Element> extends SyntheticEvent<T, NativeFocusEvent> {
  relatedTarget: EventTarget | null;
  target: EventTarget & T;
}

/**
 * Focus event handler type
 */
type FocusEventHandler<T = Element> = EventHandler<FocusEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { useState } from "react";

function FocusDemo() {
  const [focusedElement, setFocusedElement] = useState<string>('');

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
    setFocusedElement(event.currentTarget.name);
    console.log('Focused:', event.currentTarget.name);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    console.log('Blurred:', event.currentTarget.name);
    
    // Validate on blur
    if (event.currentTarget.name === 'email' && event.currentTarget.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(event.currentTarget.value)) {
        console.log('Invalid email format');
      }
    }
  };

  return (
    <div>
      <p>Currently focused: {focusedElement}</p>
      
      <div>
        <input 
          name="firstName"
          placeholder="First Name"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
      
      <div>
        <input 
          name="email"
          type="email"
          placeholder="Email"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
      
      <div>
        <input 
          name="password"
          type="password"
          placeholder="Password"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
}
```

### Touch Events

Touch event types for handling touch interactions on mobile devices.

```typescript { .api }
/**
 * Touch event interface
 * @template T The target element type
 */
interface TouchEvent<T = Element> extends SyntheticEvent<T, NativeTouchEvent> {
  altKey: boolean;
  changedTouches: TouchList;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  targetTouches: TouchList;
  touches: TouchList;
  
  getModifierState(key: string): boolean;
}

/**
 * Touch event handler type
 */
type TouchEventHandler<T = Element> = EventHandler<TouchEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { useState, useRef } from "react";

interface Position {
  x: number;
  y: number;
}

function TouchDemo() {
  const [touchStart, setTouchStart] = useState<Position | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<Position | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      
      setTouchStart({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    }
  };

  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    
    if (event.touches.length > 0 && touchStart) {
      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      
      setTouchCurrent({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    }
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    
    if (touchStart && touchCurrent) {
      const deltaX = touchCurrent.x - touchStart.x;
      const deltaY = touchCurrent.y - touchStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      console.log('Swipe distance:', distance);
      
      if (distance > 50) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          console.log(deltaX > 0 ? 'Swipe right' : 'Swipe left');
        } else {
          console.log(deltaY > 0 ? 'Swipe down' : 'Swipe up');
        }
      }
    }
    
    setTouchStart(null);
    setTouchCurrent(null);
  };

  return (
    <div 
      ref={elementRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: 300,
        height: 200,
        border: '1px solid black',
        backgroundColor: 'lightgray',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      Touch and swipe me!
    </div>
  );
}
```

### UI Events

General UI event types for scroll, resize, and other UI interactions.

```typescript { .api }
/**
 * UI event interface
 * @template T The target element type
 */
interface UIEvent<T = Element> extends SyntheticEvent<T, NativeUIEvent> {
  detail: number;
  view: AbstractView;
}

/**
 * Wheel event interface
 * @template T The target element type
 */
interface WheelEvent<T = Element> extends MouseEvent<T, NativeWheelEvent> {
  deltaMode: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
}

/**
 * UI event handler type
 */
type UIEventHandler<T = Element> = EventHandler<UIEvent<T>>;

/**
 * Wheel event handler type
 */
type WheelEventHandler<T = Element> = EventHandler<WheelEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { useState, useRef } from "react";

function UIEventDemo() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [wheelDelta, setWheelDelta] = useState(0);

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
    const scrollTop = event.currentTarget.scrollTop;
    setScrollPosition(scrollTop);
  };

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    setWheelDelta(event.deltaY);
    console.log('Wheel event:', {
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaZ: event.deltaZ,
      deltaMode: event.deltaMode
    });
  };

  return (
    <div>
      <p>Scroll position: {scrollPosition}px</p>
      <p>Wheel delta: {wheelDelta}</p>
      
      <div 
        onScroll={handleScroll}
        onWheel={handleWheel}
        style={{
          height: 200,
          overflowY: 'scroll',
          border: '1px solid black',
          padding: '10px'
        }}
      >
        <div style={{ height: 1000 }}>
          <h3>Scrollable Content</h3>
          <p>Scroll me to see scroll events!</p>
          <p>Use mouse wheel to see wheel events!</p>
          {Array.from({ length: 50 }, (_, i) => (
            <p key={i}>Line {i + 1}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Animation and Transition Events

Event types for CSS animations and transitions.

```typescript { .api }
/**
 * Animation event interface
 * @template T The target element type
 */
interface AnimationEvent<T = Element> extends SyntheticEvent<T, NativeAnimationEvent> {
  animationName: string;
  elapsedTime: number;
  pseudoElement: string;
}

/**
 * Transition event interface
 * @template T The target element type
 */
interface TransitionEvent<T = Element> extends SyntheticEvent<T, NativeTransitionEvent> {
  elapsedTime: number;
  propertyName: string;
  pseudoElement: string;
}

/**
 * Animation event handler type
 */
type AnimationEventHandler<T = Element> = EventHandler<AnimationEvent<T>>;

/**
 * Transition event handler type
 */
type TransitionEventHandler<T = Element> = EventHandler<TransitionEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { useState } from "react";

function AnimationDemo() {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAnimationStart: React.AnimationEventHandler<HTMLDivElement> = (event) => {
    console.log('Animation started:', event.animationName);
    setIsAnimating(true);
  };

  const handleAnimationEnd: React.AnimationEventHandler<HTMLDivElement> = (event) => {
    console.log('Animation ended:', event.animationName, 'Duration:', event.elapsedTime);
    setIsAnimating(false);
  };

  const handleTransitionStart: React.TransitionEventHandler<HTMLDivElement> = (event) => {
    console.log('Transition started on property:', event.propertyName);
  };

  const handleTransitionEnd: React.TransitionEventHandler<HTMLDivElement> = (event) => {
    console.log('Transition ended on property:', event.propertyName, 'Duration:', event.elapsedTime);
  };

  return (
    <div>
      <button onClick={() => setIsAnimating(!isAnimating)}>
        Toggle Animation
      </button>
      
      <div 
        onAnimationStart={handleAnimationStart}
        onAnimationEnd={handleAnimationEnd}
        onTransitionStart={handleTransitionStart}
        onTransitionEnd={handleTransitionEnd}
        style={{
          width: 100,
          height: 100,
          backgroundColor: isAnimating ? 'red' : 'blue',
          transition: 'background-color 0.5s ease',
          animation: isAnimating ? 'spin 2s linear infinite' : 'none',
          marginTop: '20px'
        }}
      />
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
```

### Toggle Events

Event types for HTML details/summary toggle interactions.

```typescript { .api }
/**
 * Toggle event interface for details/summary elements
 * @template T The target element type
 */
interface ToggleEvent<T = Element> extends SyntheticEvent<T, NativeToggleEvent> {
  newState: string;
  oldState: string;
}

/**
 * Toggle event handler type
 */
type ToggleEventHandler<T = Element> = EventHandler<ToggleEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { useState } from "react";

function ToggleDemo() {
  const [toggleState, setToggleState] = useState<string>('closed');

  const handleToggle: React.ToggleEventHandler<HTMLDetailsElement> = (event) => {
    console.log('Toggle event:', {
      oldState: event.oldState,
      newState: event.newState
    });
    setToggleState(event.newState);
  };

  return (
    <div>
      <p>Current state: {toggleState}</p>
      
      <details onToggle={handleToggle}>
        <summary>Click to toggle</summary>
        <p>This content is collapsible using the details/summary elements.</p>
        <p>The toggle event fires when the details element opens or closes.</p>
      </details>
    </div>
  );
}
```