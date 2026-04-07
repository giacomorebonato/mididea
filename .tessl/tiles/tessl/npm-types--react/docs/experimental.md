# Experimental Features

React includes experimental and canary features that provide early access to upcoming functionality. The @types/react package includes type definitions for experimental APIs, canary builds, and future React features, enabling developers to test cutting-edge functionality with full type safety.

## Capabilities

### Canary Hooks

Hooks available in React's canary release channel with experimental status.

```typescript { .api }
/**
 * Cache refresh hook for invalidating cached functions (canary feature)
 * @returns Function to refresh cache
 */
function unstable_useCacheRefresh(): () => void;

/**
 * Cache function for memoizing expensive operations across renders and components
 * @template Args Function argument types
 * @template Return Function return type
 * @param fn Function to cache
 * @returns Cached version of the function
 */
function cache<CachedFunction extends (...args: any[]) => any>(
  fn: CachedFunction
): CachedFunction;
```

**Usage Examples:**

```typescript
import React from "react";
// Note: These imports would be from 'react/canary' in actual usage
// import { unstable_useCacheRefresh, cache } from 'react/canary';

// Cache expensive computations
const expensiveCalculation = cache((input: number): number => {
  console.log('Performing expensive calculation for:', input);
  // Simulate expensive operation
  return input * input * Math.random();
});

const fetchUserData = cache(async (userId: string) => {
  console.log('Fetching user data for:', userId);
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

function CanaryHooksDemo() {
  const refreshCache = unstable_useCacheRefresh();
  const [userId, setUserId] = React.useState('user-1');
  const [inputValue, setInputValue] = React.useState(10);

  // Cached computation will only run when input changes
  const result = expensiveCalculation(inputValue);

  const handleRefreshCache = () => {
    refreshCache(); // Invalidates all cached functions
    console.log('Cache refreshed');
  };

  return (
    <div>
      <h3>Canary Cache Features</h3>
      
      <div>
        <label>
          Input Value: 
          <input 
            type="number" 
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
          />
        </label>
        <p>Cached Result: {result}</p>
      </div>

      <div>
        <label>
          User ID: 
          <input 
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </label>
        {/* In real usage, you'd handle the async cached function */}
      </div>

      <button onClick={handleRefreshCache}>
        Refresh Cache
      </button>
    </div>
  );
}
```

### Experimental Hooks

Hooks that are in experimental phase and may change before stable release.

```typescript { .api }
/**
 * Effect event hook for stable event handlers that don't trigger effect re-runs
 * @template T Event handler function type
 * @param event Event handler function
 * @returns Stable event handler
 */
function experimental_useEffectEvent<T extends Function>(event: T): T;

/**
 * Optimistic updates hook for immediate UI feedback
 * @template State State type
 * @template Action Action type
 * @param state Current state
 * @param updateFn Function to apply optimistic updates
 * @returns Tuple of [optimisticState, addOptimistic]
 */
function useOptimistic<State>(
  state: State
): [State, (action: State | ((pendingState: State) => State)) => void];

function useOptimistic<State, Action>(
  state: State,
  updateFn: (currentState: State, optimisticValue: Action) => State
): [State, (action: Action) => void];

/**
 * Action state hook for handling form actions
 * @template State State type
 * @template Payload Action payload type
 */
function useActionState<State>(
  action: (state: Awaited<State>) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string
): [state: Awaited<State>, dispatch: () => void, isPending: boolean];

function useActionState<State, Payload>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string
): [state: Awaited<State>, dispatch: (payload: Payload) => void, isPending: boolean];

/**
 * Use hook for consuming promises or context
 * @template T Value type
 * @param usable Promise or context to consume
 * @returns Resolved value or context value
 */
function use<T>(usable: Usable<T>): T;

/**
 * Usable type union for use() hook
 */
type Usable<T> = Promise<T> | Context<T>;
```

**Usage Examples:**

```typescript
import React, { useState, useEffect } from "react";
// Note: These would be imported from 'react/experimental' in actual usage

// Simulated experimental hooks for demonstration
function ExperimentalHooksDemo() {
  const [posts, setPosts] = useState<Array<{ id: string; title: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // useOptimistic example - optimistic post creation
  const [optimisticPosts, addOptimisticPost] = React.useMemo(() => {
    // Simulated useOptimistic implementation
    const [optimisticState, setOptimisticState] = useState(posts);
    
    const addOptimistic = (newPost: { id: string; title: string; content: string }) => {
      setOptimisticState(current => [...current, { ...newPost, id: `temp-${Date.now()}` }]);
    };

    return [optimisticState, addOptimistic];
  }, [posts]);

  // experimental_useEffectEvent example - stable event handler
  const handlePostCreated = React.useCallback((post: any) => {
    console.log('Post created:', post);
    // This would be experimental_useEffectEvent in actual usage
  }, []);

  const createPost = async (title: string, content: string) => {
    const newPost = { id: '', title, content };
    
    // Add optimistic update
    addOptimisticPost(newPost);
    
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const createdPost = { ...newPost, id: Date.now().toString() };
      setPosts(prev => [...prev, createdPost]);
      handlePostCreated(createdPost);
      
    } catch (error) {
      console.error('Failed to create post:', error);
      // Revert optimistic update
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>Experimental Hooks Demo</h3>
      
      <div>
        <h4>Posts ({optimisticPosts.length})</h4>
        {isLoading && <p>Creating post...</p>}
        
        {optimisticPosts.map(post => (
          <div key={post.id} style={{ 
            border: '1px solid #ccc', 
            margin: '0.5rem 0', 
            padding: '0.5rem',
            opacity: post.id.startsWith('temp-') ? 0.7 : 1
          }}>
            <h5>{post.title}</h5>
            <p>{post.content}</p>
            {post.id.startsWith('temp-') && <small>(Pending...)</small>}
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => createPost('New Post', 'This is a new post')}
        disabled={isLoading}
      >
        Create Post (Optimistic)
      </button>
    </div>
  );
}

// useActionState example
interface FormState {
  success: boolean;
  message: string;
  errors: Record<string, string>;
}

async function submitContactForm(
  prevState: FormState, 
  formData: FormData
): Promise<FormState> {
  // Simulate form submission
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  const errors: Record<string, string> = {};
  if (!name) errors.name = 'Name is required';
  if (!email) errors.email = 'Email is required';
  if (email && !email.includes('@')) errors.email = 'Invalid email';
  
  if (Object.keys(errors).length > 0) {
    return { success: false, message: 'Please fix the errors', errors };
  }
  
  return { success: true, message: 'Form submitted successfully!', errors: {} };
}

function ActionStateDemo() {
  // Simulated useActionState
  const [formState, setFormState] = useState<FormState>({ 
    success: false, 
    message: '', 
    errors: {} 
  });
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    const result = await submitContactForm(formState, formData);
    setFormState(result);
    setIsPending(false);
  };

  return (
    <div>
      <h3>Action State Demo</h3>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleSubmit(formData);
      }}>
        <div>
          <label>
            Name:
            <input name="name" type="text" />
            {formState.errors.name && (
              <span style={{ color: 'red' }}>{formState.errors.name}</span>
            )}
          </label>
        </div>
        
        <div>
          <label>
            Email:
            <input name="email" type="email" />
            {formState.errors.email && (
              <span style={{ color: 'red' }}>{formState.errors.email}</span>
            )}
          </label>
        </div>
        
        <button type="submit" disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      
      {formState.message && (
        <p style={{ color: formState.success ? 'green' : 'red' }}>
          {formState.message}
        </p>
      )}
    </div>
  );
}

// use() hook example with promises
function UseHookDemo() {
  const [userId, setUserId] = useState('1');
  
  // In actual usage, you would use the use() hook here
  // const userData = use(fetchUser(userId));
  
  // Simulated implementation
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUserData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading user data...</div>;

  return (
    <div>
      <h3>Use Hook Demo</h3>
      <select value={userId} onChange={(e) => setUserId(e.target.value)}>
        <option value="1">User 1</option>
        <option value="2">User 2</option>
        <option value="3">User 3</option>
      </select>
      
      {userData && (
        <div>
          <h4>{userData.name}</h4>
          <p>{userData.email}</p>
        </div>
      )}
    </div>
  );
}
```

### Experimental Components

React components that are in experimental phase.

```typescript { .api }
/**
 * Experimental Suspense List for coordinating multiple Suspense components
 */
interface SuspenseListProps {
  children: ReactNode;
  revealOrder?: 'forwards' | 'backwards' | 'together';
  tail?: 'collapsed' | 'hidden';
}

declare const unstable_SuspenseList: ExoticComponent<SuspenseListProps>;

/**
 * Enhanced Suspense with experimental features
 */
interface ExperimentalSuspenseProps extends SuspenseProps {
  unstable_expectedLoadTime?: number;
}

/**
 * Experimental View Transition component
 */
interface ViewTransitionProps {
  children: ReactNode;
  name?: string;
}

declare const experimental_ViewTransition: ExoticComponent<ViewTransitionProps>;
```

**Usage Examples:**

```typescript
import React, { Suspense, lazy } from "react";

// Lazy loaded components for Suspense demo
const LazyComponent1 = lazy(() => 
  new Promise(resolve => 
    setTimeout(() => resolve({
      default: () => <div>Component 1 Loaded</div>
    }), 1000)
  )
);

const LazyComponent2 = lazy(() => 
  new Promise(resolve => 
    setTimeout(() => resolve({
      default: () => <div>Component 2 Loaded</div>
    }), 1500)
  )
);

const LazyComponent3 = lazy(() => 
  new Promise(resolve => 
    setTimeout(() => resolve({
      default: () => <div>Component 3 Loaded</div>
    }), 2000)
  )
);

function ExperimentalComponentsDemo() {
  const [showComponents, setShowComponents] = useState(false);

  return (
    <div>
      <h3>Experimental Components Demo</h3>
      
      <button onClick={() => setShowComponents(!showComponents)}>
        {showComponents ? 'Hide' : 'Show'} Lazy Components
      </button>

      {showComponents && (
        <div>
          <h4>SuspenseList with reveal order</h4>
          
          {/* Simulated SuspenseList - would use unstable_SuspenseList in actual usage */}
          <div style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
            <p>Revealing components in order...</p>
            
            <Suspense fallback={<div>Loading Component 1...</div>}>
              <LazyComponent1 />
            </Suspense>
            
            <Suspense fallback={<div>Loading Component 2...</div>}>
              <LazyComponent2 />
            </Suspense>
            
            <Suspense fallback={<div>Loading Component 3...</div>}>
              <LazyComponent3 />
            </Suspense>
          </div>

          <h4>Enhanced Suspense with load time hint</h4>
          <Suspense 
            fallback={
              <div>
                <div>Loading with expected time hint...</div>
                <div style={{ fontSize: '0.8em', color: '#666' }}>
                  Expected load time: ~2 seconds
                </div>
              </div>
            }
          >
            <LazyComponent3 />
          </Suspense>
        </div>
      )}
    </div>
  );
}

// View Transitions example
function ViewTransitionDemo() {
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setCurrentView('detail');
  };

  const handleBackClick = () => {
    setCurrentView('list');
    setSelectedItem(null);
  };

  return (
    <div>
      <h3>View Transition Demo</h3>
      
      {/* In actual usage, this would wrap content with experimental_ViewTransition */}
      <div style={{ minHeight: '200px', border: '1px solid #ccc', padding: '1rem' }}>
        {currentView === 'list' ? (
          <div>
            <h4>Item List</h4>
            {items.map(item => (
              <div
                key={item}
                onClick={() => handleItemClick(item)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  margin: '0.25rem 0',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                {item}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={handleBackClick} style={{ marginBottom: '1rem' }}>
              ← Back to List
            </button>
            <h4>{selectedItem} Details</h4>
            <p>This is the detail view for {selectedItem}</p>
            <p>In a real app with View Transitions, this would have smooth animated transitions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Experimental APIs

Advanced experimental APIs for framework and library authors.

```typescript { .api }
/**
 * Taint API for marking sensitive data
 * @param message Error message when tainted value is used
 * @param lifetime Object that controls the lifetime of the taint
 * @param value Value to taint
 */
function experimental_taintUniqueValue(
  message: string | undefined,
  lifetime: object,
  value: string | bigint
): void;

/**
 * Taint object reference
 * @param message Error message when tainted object is used
 * @param object Object to taint
 */
function experimental_taintObjectReference(
  message: string | undefined,
  object: object
): void;

/**
 * Experimental transition types
 */
function unstable_addTransitionType(type: string): void;

/**
 * Gesture-based transitions
 */
function unstable_startGestureTransition(
  provider: GestureProvider,
  scope: () => void,
  options?: GestureOptions
): () => void;

/**
 * Gesture provider interface
 */
interface GestureProvider {
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
  onGestureCancel?: () => void;
}

/**
 * Gesture options
 */
interface GestureOptions {
  priority?: 'normal' | 'high';
  timeout?: number;
}
```

**Usage Examples:**

```typescript
import React from "react";

// Taint API usage example
function TaintAPIDemo() {
  // Simulated sensitive data handling
  const [apiKey, setApiKey] = useState('');
  const [userData, setUserData] = useState<any>(null);

  // In real usage, you would use experimental_taintUniqueValue
  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    
    // Taint the API key to prevent accidental exposure
    // experimental_taintUniqueValue(
    //   'API key should not be serialized or logged',
    //   { apiKeyLifetime: true },
    //   value
    // );
  };

  const handleUserDataReceived = (data: any) => {
    setUserData(data);
    
    // Taint sensitive user data
    if (data.ssn || data.creditCard) {
      // experimental_taintObjectReference(
      //   'User sensitive data should not be serialized',
      //   data
      // );
    }
  };

  return (
    <div>
      <h3>Taint API Demo</h3>
      <p>This demonstrates how sensitive data can be protected from accidental exposure.</p>
      
      <div>
        <label>
          API Key (will be tainted):
          <input
            type="password"
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="Enter API key"
          />
        </label>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => handleUserDataReceived({
          name: 'John Doe',
          email: 'john@example.com',
          ssn: '123-45-6789' // This would be tainted
        })}>
          Load User Data (with SSN - will be tainted)
        </button>
      </div>
      
      {userData && (
        <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f0f0f0' }}>
          <p>User: {userData.name}</p>
          <p>Email: {userData.email}</p>
          <p>SSN: [PROTECTED] (tainted data)</p>
        </div>
      )}
    </div>
  );
}

// Gesture transitions demo
function GestureTransitionsDemo() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const slides = ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4'];

  const handleGestureNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Simulated gesture transition
    // In real usage: unstable_startGestureTransition(gestureProvider, ...)
    setTimeout(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 300);
  };

  const handleGesturePrev = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Simulated gesture transition
    setTimeout(() => {
      setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div>
      <h3>Gesture Transitions Demo</h3>
      
      <div style={{
        width: '300px',
        height: '200px',
        border: '2px solid #333',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        position: 'relative',
        opacity: isTransitioning ? 0.7 : 1,
        transition: 'opacity 0.3s ease'
      }}>
        <h2>{slides[currentSlide]}</h2>
        
        {isTransitioning && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '0.8em',
            color: '#666'
          }}>
            Transitioning...
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button onClick={handleGesturePrev} disabled={isTransitioning}>
          Previous
        </button>
        <span>{currentSlide + 1} / {slides.length}</span>
        <button onClick={handleGestureNext} disabled={isTransitioning}>
          Next
        </button>
      </div>
      
      <p style={{ fontSize: '0.9em', color: '#666', marginTop: '1rem' }}>
        In production, these transitions would be driven by actual gesture events
        and provide smooth, hardware-accelerated animations.
      </p>
    </div>
  );
}
```

### Fragment Refs (Experimental)

Experimental support for refs on React fragments.

```typescript { .api }
/**
 * Experimental fragment instance for ref support
 */
interface FragmentInstance {
  nodes: ReadonlyArray<Node>;
}

/**
 * Enhanced fragment props with experimental ref support
 */
interface ExperimentalFragmentProps {
  children?: ReactNode;
  ref?: Ref<FragmentInstance>;
}
```

**Usage Examples:**

```typescript
import React, { useRef, Fragment } from "react";

function FragmentRefsDemo() {
  // In experimental usage, fragments could have refs
  const fragmentRef = useRef<any>(null); // Would be FragmentInstance in actual usage

  const handleAccessFragmentNodes = () => {
    // In actual experimental usage:
    // if (fragmentRef.current) {
    //   console.log('Fragment nodes:', fragmentRef.current.nodes);
    //   fragmentRef.current.nodes.forEach(node => {
    //     if (node instanceof Element) {
    //       node.style.backgroundColor = 'yellow';
    //     }
    //   });
    // }
    
    console.log('Fragment ref access (simulated)');
  };

  return (
    <div>
      <h3>Fragment Refs Demo</h3>
      <p>Experimental feature allowing refs on React fragments.</p>
      
      {/* In actual usage with experimental features: */}
      {/* <Fragment ref={fragmentRef}> */}
      <Fragment>
        <span>Fragment Child 1</span>
        <span>Fragment Child 2</span>
        <span>Fragment Child 3</span>
      </Fragment>
      
      <button onClick={handleAccessFragmentNodes}>
        Access Fragment Nodes (Experimental)
      </button>
      
      <div style={{ marginTop: '1rem', fontSize: '0.9em', color: '#666' }}>
        <p>
          <strong>Note:</strong> Fragment refs are experimental and allow access to all DOM nodes
          within a fragment, which can be useful for advanced animations and measurements.
        </p>
      </div>
    </div>
  );
}

// Combined experimental features demo
function ExperimentalFeaturesDemo() {
  return (
    <div>
      <h2>React Experimental Features</h2>
      <p>
        These features are experimental and may change or be removed in future versions.
        Use them carefully and only in development or canary builds.
      </p>
      
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        <ExperimentalHooksDemo />
        <ActionStateDemo />
        <UseHookDemo />
        <ExperimentalComponentsDemo />
        <ViewTransitionDemo />
        <TaintAPIDemo />
        <GestureTransitionsDemo />
        <FragmentRefsDemo />
      </div>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '4px'
      }}>
        <h4>⚠️ Important Notes:</h4>
        <ul>
          <li>Experimental features are subject to change without notice</li>
          <li>They may have different APIs in the final release</li>
          <li>Some features may be removed entirely</li>
          <li>Use only for testing and feedback, not in production</li>
          <li>Requires React canary or experimental builds</li>
        </ul>
      </div>
    </div>
  );
}

export default ExperimentalFeaturesDemo;
```

### Usage in Applications

Guidelines for using experimental features safely in applications.

```typescript { .api }
/**
 * Environment detection for experimental features
 */
declare const __EXPERIMENTAL__: boolean;

/**
 * Feature flag type for experimental APIs
 */
type ExperimentalFeatureFlag = {
  readonly [K in keyof ExperimentalFeatures]: boolean;
};

/**
 * Experimental features configuration
 */
interface ExperimentalFeatures {
  useEffectEvent: boolean;
  useOptimistic: boolean;
  suspenseList: boolean;
  taintAPI: boolean;
  fragmentRefs: boolean;
}
```

**Usage Examples:**

```typescript
import React from "react";

// Safe wrapper for experimental features
function createExperimentalWrapper<T extends (...args: any[]) => any>(
  experimentalFn: T,
  fallbackFn: T,
  featureName: string
): T {
  return ((...args: Parameters<T>) => {
    if (process.env.NODE_ENV === 'development' && typeof experimentalFn === 'function') {
      try {
        return experimentalFn(...args);
      } catch (error) {
        console.warn(`Experimental feature "${featureName}" failed, falling back:`, error);
        return fallbackFn(...args);
      }
    }
    return fallbackFn(...args);
  }) as T;
}

// Feature detection utility
function hasExperimentalFeature(feature: keyof ExperimentalFeatures): boolean {
  // In real usage, this would check React's internal feature flags
  return process.env.NODE_ENV === 'development' && process.env.REACT_EXPERIMENTAL === 'true';
}

// Progressive enhancement with experimental features
function ProgressiveExperimentalComponent() {
  const canUseOptimistic = hasExperimentalFeature('useOptimistic');
  const canUseSuspenseList = hasExperimentalFeature('suspenseList');
  
  const [todos, setTodos] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);

  // Conditional experimental feature usage
  const addTodo = React.useCallback((text: string) => {
    if (canUseOptimistic) {
      // Use experimental optimistic updates
      console.log('Using experimental optimistic updates');
      // addOptimisticTodo(text);
    } else {
      // Fallback to standard state update
      console.log('Using standard state updates');
      const newTodo = { id: Date.now().toString(), text, completed: false };
      setTodos(prev => [...prev, newTodo]);
    }
  }, [canUseOptimistic]);

  return (
    <div>
      <h3>Progressive Experimental Enhancement</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Available Experimental Features:</strong>
        <ul>
          <li>useOptimistic: {canUseOptimistic ? '✅' : '❌'}</li>
          <li>SuspenseList: {canUseSuspenseList ? '✅' : '❌'}</li>
        </ul>
      </div>

      <div>
        <input 
          type="text" 
          placeholder="Add todo" 
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addTodo(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        {todos.map(todo => (
          <div key={todo.id} style={{ padding: '0.25rem 0' }}>
            <input 
              type="checkbox" 
              checked={todo.completed}
              onChange={(e) => {
                setTodos(prev => prev.map(t => 
                  t.id === todo.id ? { ...t, completed: e.target.checked } : t
                ));
              }}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```