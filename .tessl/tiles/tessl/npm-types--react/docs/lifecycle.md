# Lifecycle

React class component lifecycle methods provide hooks into the component's mounting, updating, and unmounting phases. The @types/react package includes comprehensive type definitions for all lifecycle methods, enabling type-safe class component development with proper error handling and state management.

## Capabilities

### Component Lifecycle Interface

Core interface defining all available lifecycle methods for React class components.

```typescript { .api }
/**
 * Interface defining component lifecycle methods
 * @template P Props type
 * @template S State type
 * @template SS Snapshot type for getSnapshotBeforeUpdate
 */
interface ComponentLifecycle<P, S, SS = any> {
  /**
   * Called immediately after component is mounted
   */
  componentDidMount?(): void;

  /**
   * Called to determine if component should re-render
   * @param nextProps Next props
   * @param nextState Next state  
   * @param nextContext Next context
   * @returns Whether component should update
   */
  shouldComponentUpdate?(
    nextProps: Readonly<P>, 
    nextState: Readonly<S>, 
    nextContext: any
  ): boolean;

  /**
   * Called immediately before component is unmounted and destroyed
   */
  componentWillUnmount?(): void;

  /**
   * Called immediately after updating occurs
   * @param prevProps Previous props
   * @param prevState Previous state
   * @param snapshot Snapshot value returned by getSnapshotBeforeUpdate
   */
  componentDidUpdate?(
    prevProps: Readonly<P>, 
    prevState: Readonly<S>, 
    snapshot?: SS
  ): void;

  /**
   * Called when an error is thrown by a descendant component
   * @param error The error that was thrown
   * @param errorInfo Information about the component stack
   */
  componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
}
```

**Usage Examples:**

```typescript
import React, { Component } from "react";

interface Props {
  userId: string;
  onUserLoad?: (user: User) => void;
}

interface State {
  user: User | null;
  loading: boolean;
  error: string | null;
}

class UserProfile extends Component<Props, State> implements ComponentLifecycle<Props, State> {
  private abortController: AbortController | null = null;

  state: State = {
    user: null,
    loading: false,
    error: null
  };

  async componentDidMount() {
    console.log('UserProfile mounted');
    await this.fetchUser();
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    // Only update if userId changes or state changes
    return (
      this.props.userId !== nextProps.userId ||
      this.state.user !== nextState.user ||
      this.state.loading !== nextState.loading ||
      this.state.error !== nextState.error
    );
  }

  async componentDidUpdate(prevProps: Props) {
    // Fetch new user if userId changed
    if (this.props.userId !== prevProps.userId) {
      await this.fetchUser();
    }
  }

  componentWillUnmount() {
    console.log('UserProfile unmounting');
    // Cancel ongoing requests
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('UserProfile caught an error:', error, errorInfo);
    this.setState({ error: error.message, loading: false });
  }

  private async fetchUser() {
    this.abortController = new AbortController();
    
    try {
      this.setState({ loading: true, error: null });
      
      const response = await fetch(`/api/users/${this.props.userId}`, {
        signal: this.abortController.signal
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      
      const user = await response.json();
      this.setState({ user, loading: false });
      this.props.onUserLoad?.(user);
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.setState({ error: error.message, loading: false });
      }
    }
  }

  render() {
    const { loading, user, error } = this.state;

    if (error) {
      return <div className="error">Error: {error}</div>;
    }

    if (loading) {
      return <div className="loading">Loading user...</div>;
    }

    if (!user) {
      return <div>No user found</div>;
    }

    return (
      <div className="user-profile">
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    );
  }
}
```

### Static Lifecycle Methods

Static lifecycle methods that are called on the component class rather than instances.

```typescript { .api }
/**
 * Interface for static lifecycle methods
 * @template P Props type
 * @template S State type
 */
interface StaticLifecycle<P, S> {
  /**
   * Static method to derive state from props
   * @param props Next props
   * @param state Current state
   * @returns Partial state to merge or null
   */
  getDerivedStateFromProps?(props: P, state: S): Partial<S> | null;

  /**
   * Static method to derive state from error
   * @param error The error that was thrown
   * @returns Partial state to merge or null
   */
  getDerivedStateFromError?(error: any): Partial<S> | null;
}

/**
 * Type for getDerivedStateFromProps function
 */
type GetDerivedStateFromProps<P, S> = (props: P, state: S) => Partial<S> | null;

/**
 * Type for getDerivedStateFromError function
 */
type GetDerivedStateFromError<P, S> = (error: any) => Partial<S> | null;
```

**Usage Examples:**

```typescript
import React, { Component } from "react";

interface Props {
  count: number;
  resetTrigger: number;
}

interface State {
  internalCount: number;
  previousResetTrigger: number;
}

class CounterWithDerivedState extends Component<Props, State> {
  state: State = {
    internalCount: this.props.count,
    previousResetTrigger: this.props.resetTrigger
  };

  // Static method to sync internal state with props
  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    // Reset internal count if resetTrigger changed
    if (props.resetTrigger !== state.previousResetTrigger) {
      return {
        internalCount: props.count,
        previousResetTrigger: props.resetTrigger
      };
    }

    // If count prop changed but reset didn't trigger, update internal count
    if (props.count !== state.internalCount && props.resetTrigger === state.previousResetTrigger) {
      return {
        internalCount: props.count
      };
    }

    // No state update needed
    return null;
  }

  render() {
    return (
      <div>
        <p>Internal Count: {this.state.internalCount}</p>
        <p>Props Count: {this.props.count}</p>
        <button onClick={() => this.setState({ internalCount: this.state.internalCount + 1 })}>
          Increment Internal
        </button>
      </div>
    );
  }
}

// Error boundary with getDerivedStateFromError
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  // Static method to update state when error occurs
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false, error: undefined })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### New Lifecycle Methods

Modern lifecycle methods introduced in React 16+.

```typescript { .api }
/**
 * Interface for new lifecycle methods
 * @template P Props type
 * @template S State type
 * @template SS Snapshot type
 */
interface NewLifecycle<P, S, SS> {
  /**
   * Called right before DOM mutations
   * @param prevProps Previous props
   * @param prevState Previous state
   * @returns Snapshot value passed to componentDidUpdate
   */
  getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;

  /**
   * Called after render but before DOM mutations (React 16.3+)
   * @param prevProps Previous props
   * @param prevState Previous state
   * @param snapshot Snapshot from getSnapshotBeforeUpdate
   */
  componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
}
```

**Usage Examples:**

```typescript
import React, { Component, createRef } from "react";

interface Props {
  messages: string[];
}

interface State {
  autoScroll: boolean;
}

class ChatWindow extends Component<Props, State> {
  private messagesEndRef = createRef<HTMLDivElement>();
  private containerRef = createRef<HTMLDivElement>();

  state: State = { autoScroll: true };

  getSnapshotBeforeUpdate(prevProps: Props): boolean | null {
    // Check if user was scrolled to bottom before new messages
    const container = this.containerRef.current;
    if (container && prevProps.messages.length < this.props.messages.length) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      return scrollTop + clientHeight === scrollHeight;
    }
    return null;
  }

  componentDidUpdate(prevProps: Props, prevState: State, wasScrolledToBottom: boolean | null) {
    // Auto-scroll if user was at bottom or if autoScroll is enabled
    if (wasScrolledToBottom || this.state.autoScroll) {
      this.messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  render() {
    return (
      <div>
        <label>
          <input
            type="checkbox"
            checked={this.state.autoScroll}
            onChange={(e) => this.setState({ autoScroll: e.target.checked })}
          />
          Auto-scroll
        </label>
        
        <div 
          ref={this.containerRef}
          style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc' }}
        >
          {this.props.messages.map((message, index) => (
            <div key={index} style={{ padding: '5px' }}>
              {message}
            </div>
          ))}
          <div ref={this.messagesEndRef} />
        </div>
      </div>
    );
  }
}

// List component that preserves scroll position
interface ListItem {
  id: string;
  content: string;
}

interface ListProps {
  items: ListItem[];
}

interface ScrollSnapshot {
  scrollTop: number;
  itemCount: number;
}

class PreserveScrollList extends Component<ListProps> {
  private listRef = createRef<HTMLDivElement>();

  getSnapshotBeforeUpdate(prevProps: ListProps): ScrollSnapshot | null {
    const list = this.listRef.current;
    if (list && prevProps.items.length !== this.props.items.length) {
      return {
        scrollTop: list.scrollTop,
        itemCount: prevProps.items.length
      };
    }
    return null;
  }

  componentDidUpdate(prevProps: ListProps, prevState: any, snapshot: ScrollSnapshot | null) {
    const list = this.listRef.current;
    
    if (list && snapshot) {
      // If items were added at the beginning, maintain visual position
      if (this.props.items.length > snapshot.itemCount) {
        const itemsAdded = this.props.items.length - snapshot.itemCount;
        const estimatedItemHeight = 50; // Estimate or calculate actual height
        list.scrollTop = snapshot.scrollTop + (itemsAdded * estimatedItemHeight);
      }
    }
  }

  render() {
    return (
      <div ref={this.listRef} style={{ height: '400px', overflowY: 'scroll' }}>
        {this.props.items.map(item => (
          <div key={item.id} style={{ height: '50px', borderBottom: '1px solid #eee' }}>
            {item.content}
          </div>
        ))}
      </div>
    );
  }
}
```

### Error Information Interface

Interface for error information provided to error handling lifecycle methods.

```typescript { .api }
/**
 * Information about component stack when error occurred
 */
interface ErrorInfo {
  /**
   * Component stack trace as string
   */
  componentStack: string;

  /**
   * Error boundary stack trace (if available)
   */
  errorBoundary?: Component<any, any> | null;

  /**
   * Name of error boundary component (if available)
   */
  errorBoundaryName?: string;

  /**
   * Stack trace of the error boundary that caught this error (if available)
   */
  errorBoundaryStack?: string;

  /**
   * Event handlers stack trace (if available)
   */
  eventHandlers?: string;
}
```

**Usage Examples:**

```typescript
import React, { Component } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class DetailedErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; errorInfo: React.ErrorInfo }> },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Store detailed error information
    this.setState({ errorInfo });

    // Log detailed error information
    console.group('React Error Boundary');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    
    if (errorInfo.errorBoundary) {
      console.error('Error Boundary:', errorInfo.errorBoundaryName);
      console.error('Error Boundary Stack:', errorInfo.errorBoundaryStack);
    }
    
    if (errorInfo.eventHandlers) {
      console.error('Event Handlers:', errorInfo.eventHandlers);
    }
    
    console.groupEnd();

    // Report to error tracking service
    this.reportError(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: React.ErrorInfo) {
    // Send to error tracking service like Sentry, Bugsnag, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Example: Send to logging service
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport)
    }).catch(reportErr => {
      console.error('Failed to report error:', reportErr);
    });
  }

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // Use custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} errorInfo={this.state.errorInfo} />;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <h2>Oops! Something went wrong</h2>
          <details>
            <summary>Error Details</summary>
            <h3>Error Message:</h3>
            <pre>{this.state.error.message}</pre>
            
            <h3>Error Stack:</h3>
            <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
              {this.state.error.stack}
            </pre>
            
            <h3>Component Stack:</h3>
            <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
              {this.state.errorInfo.componentStack}
            </pre>
          </details>
          
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom error fallback component
const CustomErrorFallback: React.FC<{ error: Error; errorInfo: React.ErrorInfo }> = ({ error, errorInfo }) => (
  <div style={{ padding: '20px', border: '2px solid red', borderRadius: '8px' }}>
    <h2>Application Error</h2>
    <p>We're sorry, but something went wrong. The development team has been notified.</p>
    
    {process.env.NODE_ENV === 'development' && (
      <details>
        <summary>Technical Details (Development Only)</summary>
        <pre style={{ fontSize: '12px', backgroundColor: '#f5f5f5', padding: '10px' }}>
          {error.stack}
        </pre>
      </details>
    )}
    
    <button onClick={() => window.location.reload()}>
      Reload Page
    </button>
  </div>
);

// Usage
function App() {
  return (
    <DetailedErrorBoundary fallback={CustomErrorFallback}>
      <Header />
      <MainContent />
      <Footer />
    </DetailedErrorBoundary>
  );
}
```

### Lifecycle Hook Equivalents

Mapping between class lifecycle methods and their hook equivalents.

```typescript { .api }
/**
 * Hook equivalents for class lifecycle methods
 */

// componentDidMount -> useEffect(() => {}, [])
// componentDidUpdate -> useEffect(() => {})
// componentWillUnmount -> useEffect(() => { return () => {} }, [])
// shouldComponentUpdate -> React.memo() or useMemo()
// getDerivedStateFromProps -> useState with useEffect
// getSnapshotBeforeUpdate -> useLayoutEffect with refs
// componentDidCatch -> Error Boundary (no hook equivalent)
```

**Usage Examples:**

```typescript
import React, { useEffect, useLayoutEffect, useState, useRef, memo } from "react";

// Class component lifecycle methods
class ClassLifecycleExample extends Component<Props, State> {
  componentDidMount() {
    console.log('Mounted');
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.userId !== this.props.userId) {
      console.log('User ID changed');
    }
  }

  componentWillUnmount() {
    console.log('Unmounting');
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return nextProps.userId !== this.props.userId;
  }

  render() {
    return <div>Class Component</div>;
  }
}

// Hook equivalent
const HookLifecycleExample = memo<Props>(({ userId }) => {
  const [mounted, setMounted] = useState(false);
  const prevUserId = useRef<string>();

  // componentDidMount
  useEffect(() => {
    console.log('Mounted');
    setMounted(true);
    
    // componentWillUnmount (cleanup)
    return () => {
      console.log('Unmounting');
    };
  }, []);

  // componentDidUpdate (only when userId changes)
  useEffect(() => {
    if (mounted && prevUserId.current !== undefined && prevUserId.current !== userId) {
      console.log('User ID changed');
    }
    prevUserId.current = userId;
  }, [userId, mounted]);

  return <div>Hook Component</div>;
}); // memo() provides shouldComponentUpdate behavior

// Complex lifecycle pattern with hooks
function useLifecycleLogger(componentName: string) {
  const mountedRef = useRef(false);
  const renderCountRef = useRef(0);

  renderCountRef.current += 1;

  useEffect(() => {
    if (!mountedRef.current) {
      console.log(`${componentName} mounted (render #${renderCountRef.current})`);
      mountedRef.current = true;
    } else {
      console.log(`${componentName} updated (render #${renderCountRef.current})`);
    }

    return () => {
      console.log(`${componentName} unmounting`);
    };
  });

  return renderCountRef.current;
}

// Usage of custom lifecycle hook
function ComponentWithLifecycleLogging({ name }: { name: string }) {
  const renderCount = useLifecycleLogger('ComponentWithLifecycleLogging');

  return (
    <div>
      <h3>{name}</h3>
      <p>Render count: {renderCount}</p>
    </div>
  );
}
```