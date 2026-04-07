# Hooks

React hooks provide a way to use state and other React features in function components. The @types/react package includes complete type definitions for all React hooks, ensuring type safety for state management, effects, performance optimization, and advanced patterns.

## Capabilities

### useState

State management hook that returns stateful value and setter function.

```typescript { .api }
/**
 * State hook for managing component state
 * @template S The type of the state value
 */
function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];

/**
 * State setter function type
 */
type Dispatch<A> = (value: A) => void;

/**
 * State action type for setState
 */
type SetStateAction<S> = S | ((prevState: S) => S);
```

**Usage Examples:**

```typescript
import React, { useState } from "react";

// Basic state with explicit type
const [count, setCount] = useState<number>(0);

// State with inferred type
const [name, setName] = useState("John"); // string
const [isVisible, setIsVisible] = useState(true); // boolean

// State with function initializer
const [expensiveValue, setExpensiveValue] = useState(() => {
  return computeExpensiveValue();
});

// State with undefined initial value
const [user, setUser] = useState<User | undefined>();

// Complex state object
interface FormState {
  email: string;
  password: string;
  errors: string[];
}

const [formState, setFormState] = useState<FormState>({
  email: '',
  password: '',
  errors: []
});

// Functional updates
const incrementCount = () => setCount(prev => prev + 1);
const updateForm = (field: keyof FormState, value: any) => {
  setFormState(prev => ({ ...prev, [field]: value }));
};
```

### useEffect

Effect hook for performing side effects in function components.

```typescript { .api }
/**
 * Effect hook for side effects
 * @param effect Function that contains imperative, possibly effectful code
 * @param deps Optional dependency array to control when effect runs
 */
function useEffect(effect: EffectCallback, deps?: DependencyList): void;

/**
 * Effect callback function type
 */
type EffectCallback = () => (void | Destructor);

/**
 * Effect cleanup function type  
 */
type Destructor = () => void | { [UNDEFINED_VOID_ONLY]: never };

/**
 * Dependency array type for effects
 */
type DependencyList = ReadonlyArray<any>;
```

**Usage Examples:**

```typescript
import React, { useEffect, useState } from "react";

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect with cleanup
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal
        });
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch user:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Cleanup function
    return () => {
      controller.abort();
    };
  }, [userId]); // Dependency array

  // Effect without cleanup
  useEffect(() => {
    document.title = user ? `Profile - ${user.name}` : 'Profile';
  }, [user]);

  // Effect that runs only once
  useEffect(() => {
    console.log('Component mounted');
  }, []); // Empty dependency array

  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}
```

### useContext

Context hook for consuming React context values.

```typescript { .api }
/**
 * Context hook for consuming context values
 * @template T The type of the context value
 * @param context The context object created by createContext
 * @returns The current context value
 */
function useContext<T>(context: Context<T>): T;
```

**Usage Examples:**

```typescript
import React, { createContext, useContext, useState } from "react";

// Create typed context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Consumer component using useContext
const ThemedButton: React.FC = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('ThemedButton must be used within ThemeProvider');
  }

  const { theme, toggleTheme } = context;
  
  return (
    <button 
      onClick={toggleTheme}
      className={`btn btn-${theme}`}
    >
      Current theme: {theme}
    </button>
  );
};

// Custom hook for better error handling
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### useReducer

Reducer hook for complex state management with dispatch pattern.

```typescript { .api }
/**
 * Reducer hook for complex state management
 * @template R The reducer function type
 */
function useReducer<R extends ReducerWithoutAction<any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => ReducerStateWithoutAction<R>
): [ReducerStateWithoutAction<R>, DispatchWithoutAction];

function useReducer<R extends ReducerWithoutAction<any>>(
  reducer: R,
  initializerArg: ReducerStateWithoutAction<R>,
  initializer?: undefined
): [ReducerStateWithoutAction<R>, DispatchWithoutAction];

function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I & ReducerState<R>,
  initializer: (arg: I & ReducerState<R>) => ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>];

function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>];

function useReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
  initializer?: undefined
): [ReducerState<R>, Dispatch<ReducerAction<R>>];

/**
 * Reducer function type
 */
type Reducer<S, A> = (prevState: S, action: A) => S;

/**
 * Reducer without action type
 */
type ReducerWithoutAction<S> = (prevState: S) => S;

/**
 * Extract state type from reducer
 */
type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;

/**
 * Extract action type from reducer
 */
type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;

/**
 * Dispatch without action
 */
type DispatchWithoutAction = () => void;
```

**Usage Examples:**

```typescript
import React, { useReducer } from "react";

// Define state and action types
interface CounterState {
  count: number;
  error: string | null;
}

type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number }
  | { type: 'error'; payload: string };

// Reducer function
const counterReducer: React.Reducer<CounterState, CounterAction> = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1, error: null };
    case 'decrement':
      return { ...state, count: state.count - 1, error: null };
    case 'reset':
      return { ...state, count: action.payload, error: null };
    case 'error':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Component using useReducer
const Counter: React.FC = () => {
  const [state, dispatch] = useReducer(counterReducer, { 
    count: 0, 
    error: null 
  });

  const handleIncrement = () => dispatch({ type: 'increment' });
  const handleDecrement = () => dispatch({ type: 'decrement' });
  const handleReset = () => dispatch({ type: 'reset', payload: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
      <button onClick={handleIncrement}>+</button>
      <button onClick={handleDecrement}>-</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

// With initializer function
const initializeCounter = (initialValue: number): CounterState => ({
  count: initialValue,
  error: null
});

const CounterWithInitializer: React.FC<{ initialCount: number }> = ({ initialCount }) => {
  const [state, dispatch] = useReducer(counterReducer, initialCount, initializeCounter);
  
  // Component implementation...
  return <div>Count: {state.count}</div>;
};
```

### useRef

Ref hook for accessing DOM elements and storing mutable values.

```typescript { .api }
/**
 * Ref hook that returns a mutable ref object
 * @template T The type of the ref value
 */
function useRef<T>(initialValue: T): MutableRefObject<T>;
function useRef<T>(initialValue: T | null): RefObject<T>;
function useRef<T = undefined>(): MutableRefObject<T | undefined>;

/**
 * Mutable ref object type
 */
interface MutableRefObject<T> {
  current: T;
}

/**
 * Immutable ref object type
 */
interface RefObject<T> {
  readonly current: T | null;
}
```

**Usage Examples:**

```typescript
import React, { useRef, useEffect } from "react";

function FocusInput() {
  // DOM element ref
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" />;
}

function Timer() {
  // Mutable value ref (doesn't cause re-renders)
  const intervalRef = useRef<number | null>(null);
  const [count, setCount] = useState(0);

  const startTimer = () => {
    if (intervalRef.current) return; // Already running
    
    intervalRef.current = window.setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}

// Storing previous value
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

// Generic ref with undefined
function useOptionalRef<T>() {
  return useRef<T | undefined>();
}
```

### useLayoutEffect

Synchronous effect hook that runs before browser paint.

```typescript { .api }
/**
 * Layout effect hook that runs synchronously after all DOM mutations
 * @param effect Function that contains imperative, possibly effectful code
 * @param deps Optional dependency array to control when effect runs
 */
function useLayoutEffect(effect: EffectCallback, deps?: DependencyList): void;
```

**Usage Examples:**

```typescript
import React, { useLayoutEffect, useRef, useState } from "react";

function MeasureComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // useLayoutEffect runs synchronously before browser paint
  // Perfect for DOM measurements that affect layout
  useLayoutEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  });

  return (
    <div>
      <div ref={ref} style={{ padding: '20px', border: '1px solid black' }}>
        This content will be measured
      </div>
      <p>Measured height: {height}px</p>
    </div>
  );
}

function AutoScrollToBottom({ messages }: { messages: string[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change, before paint
  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ height: '300px', overflowY: 'scroll' }}>
      {messages.map((message, index) => (
        <div key={index}>{message}</div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
```

### Performance Hooks

Hooks for optimizing component performance.

```typescript { .api }
/**
 * Memoized callback hook
 * @template T The callback function type
 * @param callback The callback function to memoize
 * @param deps Dependency array
 * @returns Memoized callback
 */
function useCallback<T extends Function>(callback: T, deps: DependencyList): T;

/**
 * Memoized value hook
 * @template T The value type
 * @param factory Function that returns the value to memoize
 * @param deps Dependency array
 * @returns Memoized value
 */
function useMemo<T>(factory: () => T, deps: DependencyList): T;
```

**Usage Examples:**

```typescript
import React, { useCallback, useMemo, useState } from "react";

interface Item {
  id: number;
  name: string;
  price: number;
}

function ExpensiveList({ items, filter }: { items: Item[]; filter: string }) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Memoized expensive calculation
  const filteredAndSortedItems = useMemo(() => {
    console.log('Recalculating filtered items...');
    
    return items
      .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        return multiplier * (a.price - b.price);
      });
  }, [items, filter, sortOrder]);

  // Memoized callback to prevent child re-renders
  const handleItemClick = useCallback((itemId: number) => {
    console.log('Item clicked:', itemId);
    // Handle item click logic
  }, []); // No dependencies means callback never changes

  const handleSort = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  return (
    <div>
      <button onClick={handleSort}>
        Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
      </button>
      {filteredAndSortedItems.map(item => (
        <ItemComponent 
          key={item.id} 
          item={item} 
          onClick={handleItemClick}
        />
      ))}
    </div>
  );
}

// Child component that benefits from memoized callback
const ItemComponent = React.memo<{
  item: Item;
  onClick: (id: number) => void;
}>(({ item, onClick }) => {
  return (
    <div onClick={() => onClick(item.id)}>
      {item.name} - ${item.price}
    </div>
  );
});
```

### Advanced Hooks

Advanced hooks for specialized use cases.

```typescript { .api }
/**
 * Imperative handle hook for customizing ref exposure
 * @template T The ref type
 * @template R The handle type
 */
function useImperativeHandle<T, R extends T>(
  ref: Ref<T>,
  init: () => R,
  deps?: DependencyList
): void;

/**
 * Debug value hook for React DevTools
 * @template T The debug value type
 */
function useDebugValue<T>(value: T, format?: (value: T) => any): void;

/**
 * Unique ID hook
 * @returns A unique ID string
 */
function useId(): string;

/**
 * Insertion effect hook for CSS-in-JS libraries
 */
function useInsertionEffect(effect: EffectCallback, deps?: DependencyList): void;
```

**Usage Examples:**

```typescript
import React, { useImperativeHandle, useRef, forwardRef, useDebugValue, useId } from "react";

// useImperativeHandle example
interface CustomInputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

const CustomInput = forwardRef<CustomInputHandle, { placeholder?: string }>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => setValue(''),
    getValue: () => value
  }), [value]);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={props.placeholder}
    />
  );
});

// useId example
function FormField({ label }: { label: string }) {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" />
    </div>
  );
}

// useDebugValue example
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Shows in React DevTools
  useDebugValue(isOnline ? 'Online' : 'Offline');
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}
```

### Modern Hooks (React 18+)

Modern hooks introduced in React 18 and later versions.

```typescript { .api }
/**
 * External store subscription hook
 * @template Snapshot The snapshot type
 */
function useSyncExternalStore<Snapshot>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot?: () => Snapshot
): Snapshot;

/**
 * Deferred value hook for performance optimization
 * @template T The value type
 */
function useDeferredValue<T>(value: T, initialValue?: T): T;

/**
 * Transition hook for non-blocking updates
 * @returns Tuple of [isPending, startTransition]
 */
function useTransition(): [boolean, TransitionStartFunction];

/**
 * Transition start function type
 */
type TransitionStartFunction = (callback: () => void) => void;

/**
 * Start transition without hook
 */
function startTransition(scope: () => void): void;
```

**Usage Examples:**

```typescript
import React, { useSyncExternalStore, useDeferredValue, useTransition, useState } from "react";

// useSyncExternalStore example
function useWindowWidth() {
  return useSyncExternalStore(
    // Subscribe function
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    // Get snapshot function
    () => window.innerWidth,
    // Server snapshot (for SSR)
    () => 1024
  );
}

// useDeferredValue example
function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  
  // Expensive search that uses deferred value
  const results = useMemo(() => {
    return performExpensiveSearch(deferredQuery);
  }, [deferredQuery]);
  
  return (
    <div>
      {/* Show immediate feedback for current query */}
      <p>Searching for: {query}</p>
      
      {/* Results update less frequently */}
      <div>
        {results.map(result => (
          <div key={result.id}>{result.title}</div>
        ))}
      </div>
    </div>
  );
}

// useTransition example
function TabContainer() {
  const [activeTab, setActiveTab] = useState('home');
  const [isPending, startTransition] = useTransition();
  
  const handleTabClick = (tab: string) => {
    startTransition(() => {
      // This state update is non-blocking
      setActiveTab(tab);
    });
  };
  
  return (
    <div>
      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        <button onClick={() => handleTabClick('home')}>Home</button>
        <button onClick={() => handleTabClick('profile')}>Profile</button>
        <button onClick={() => handleTabClick('settings')}>Settings</button>
      </div>
      
      {isPending && <div>Loading...</div>}
      <TabContent tab={activeTab} />
    </div>
  );
}
```

### Action and Optimistic State Hooks (React 19+)

Advanced hooks for managing optimistic updates and form actions.

```typescript { .api }
/**
 * Hook for managing optimistic state updates
 * @template State The state type
 * @template Action The action type for updates
 */
function useOptimistic<State, Action>(
  state: State,
  updateFn: (currentState: State, optimisticValue: Action) => State
): [State, (action: Action) => void];

/**
 * Hook for managing action state with pending status
 * @template State The state type  
 * @template Payload The action payload type
 */
function useActionState<State, Payload>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string
): [Awaited<State>, (payload: Payload) => void, boolean];

/**
 * Hook for consuming promises and other async resources
 * @template T The resource value type
 */
function use<T>(usable: Usable<T>): T;

/**
 * Usable resource type (Promise or Context)
 */
type Usable<T> = Promise<T> | Context<T>;
```

**Usage Examples:**

```typescript
import React, { useOptimistic, useActionState, use } from "react";

// useOptimistic example
function OptimisticCounter({ count }: { count: number }) {
  const [optimisticCount, addOptimistic] = useOptimistic(
    count,
    (currentCount, amount: number) => currentCount + amount
  );

  async function incrementAction() {
    // Show optimistic update immediately
    addOptimistic(1);
    
    // Perform actual update
    await updateCount(count + 1);
  }

  return (
    <div>
      <p>Count: {optimisticCount}</p>
      <button onClick={incrementAction}>Increment</button>
    </div>
  );
}

// useActionState example
function ContactForm() {
  const [state, submitAction, isPending] = useActionState(async (prev, formData: FormData) => {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    
    try {
      await submitContact({ name, email });
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Failed to submit' };
    }
  }, { success: false, error: null });

  return (
    <form action={submitAction}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
      {state.success && <p style={{ color: 'green' }}>Success!</p>}
    </form>
  );
}

// use hook example
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  // Suspends component until promise resolves
  const user = use(userPromise);
  
  return <div>Welcome, {user.name}!</div>;
}

// use with context
function ThemeAwareComponent() {
  // Alternative to useContext
  const theme = use(ThemeContext);
  
  return <div className={`theme-${theme}`}>Themed content</div>;
}
```