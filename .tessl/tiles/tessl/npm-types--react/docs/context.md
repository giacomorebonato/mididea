# Context

React's Context API provides a way to share data between components without passing props through every level of the component tree. The @types/react package includes complete type definitions for creating, providing, and consuming context with full type safety.

## Capabilities

### Context Interface

Core context interface that defines the structure of a React context.

```typescript { .api }
/**
 * React context object that holds a value and provides it to child components
 * @template T The type of the context value
 */
interface Context<T> {
  Provider: Provider<T>;
  Consumer: Consumer<T>;
  displayName?: string;
  $$typeof: symbol;
}
```

**Usage Examples:**

```typescript
import React, { createContext } from "react";

// Define the shape of your context
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context with type
const UserContext = createContext<UserContextType | undefined>(undefined);

// Set display name for debugging
UserContext.displayName = 'UserContext';

// Access context properties
console.log('Context display name:', UserContext.displayName);
console.log('Has provider:', !!UserContext.Provider);
console.log('Has consumer:', !!UserContext.Consumer);
```

### createContext Function

Function for creating new context objects with optional default values.

```typescript { .api }
/**
 * Creates a new React context with the given default value
 * @template T The type of the context value
 * @param defaultValue The default value for the context
 * @returns A new context object
 */
function createContext<T>(defaultValue: T): Context<T>;
```

**Usage Examples:**

```typescript
import React, { createContext, useState } from "react";

// Simple context with primitive default value
const ThemeContext = createContext<'light' | 'dark'>('light');

// Context with object default value
interface AppSettings {
  language: string;
  timezone: string;
  notifications: boolean;
}

const defaultSettings: AppSettings = {
  language: 'en',
  timezone: 'UTC',
  notifications: true
};

const SettingsContext = createContext<AppSettings>(defaultSettings);

// Context with function default values
interface CounterContextType {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const defaultCounterContext: CounterContextType = {
  count: 0,
  increment: () => console.warn('increment called outside provider'),
  decrement: () => console.warn('decrement called outside provider'),
  reset: () => console.warn('reset called outside provider')
};

const CounterContext = createContext<CounterContextType>(defaultCounterContext);

// Context with undefined default (requires null checking)
const OptionalUserContext = createContext<User | undefined>(undefined);

// Context with null default
const NullableDataContext = createContext<string | null>(null);
```

### Provider Component

Provider component for supplying context values to child components.

```typescript { .api }
/**
 * Context provider component that supplies values to consuming components
 * @template T The type of the context value
 */
interface Provider<T> {
  (props: ProviderProps<T>): ReactElement | null;
  propTypes?: any;
  contextType?: Context<any>;
  displayName?: string;
}

/**
 * Props for the Provider component
 * @template T The type of the context value
 */
interface ProviderProps<T> {
  value: T;
  children?: ReactNode;
}
```

**Usage Examples:**

```typescript
import React, { useState, ReactNode } from "react";

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
}

function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const contextValue = {
    theme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// User authentication provider
function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const contextValue: UserContextType = {
    user,
    login,
    logout,
    isAuthenticated: user !== null
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Nested providers
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

// Dynamic provider values
function DynamicProvider({ initialCount = 0, children }: { 
  initialCount?: number; 
  children: ReactNode; 
}) {
  const [count, setCount] = useState(initialCount);

  // Value changes on every render, but that's okay for demonstration
  const value = {
    count,
    increment: () => setCount(prev => prev + 1),
    decrement: () => setCount(prev => prev - 1),
    reset: () => setCount(initialCount)
  };

  return (
    <CounterContext.Provider value={value}>
      {children}
    </CounterContext.Provider>
  );
}
```

### Consumer Component (Legacy)

Legacy consumer component for consuming context values (prefer useContext hook).

```typescript { .api }
/**
 * Legacy context consumer component (prefer useContext hook)
 * @template T The type of the context value
 */
interface Consumer<T> {
  (props: ConsumerProps<T>): ReactElement | null;
  propTypes?: any;
  contextType?: Context<any>;
  displayName?: string;
}

/**
 * Props for the Consumer component
 * @template T The type of the context value
 */
interface ConsumerProps<T> {
  children: (value: T) => ReactNode;
}
```

**Usage Examples:**

```typescript
import React from "react";

// Legacy consumer pattern (not recommended)
function LegacyThemeButton() {
  return (
    <ThemeContext.Consumer>
      {({ theme, toggleTheme }) => (
        <button 
          onClick={toggleTheme}
          style={{ 
            backgroundColor: theme === 'light' ? '#fff' : '#333',
            color: theme === 'light' ? '#333' : '#fff'
          }}
        >
          Toggle Theme (Current: {theme})
        </button>
      )}
    </ThemeContext.Consumer>
  );
}

// Multiple consumers (nested)
function LegacyUserProfile() {
  return (
    <UserContext.Consumer>
      {(userContext) => (
        <ThemeContext.Consumer>
          {({ theme }) => {
            if (!userContext?.user) {
              return <div>Please log in</div>;
            }

            return (
              <div style={{ color: theme === 'light' ? '#333' : '#fff' }}>
                <h2>{userContext.user.name}</h2>
                <p>{userContext.user.email}</p>
                <button onClick={userContext.logout}>Logout</button>
              </div>
            );
          }}
        </ThemeContext.Consumer>
      )}
    </UserContext.Consumer>
  );
}

// Consumer with conditional rendering
function ConditionalConsumer() {
  return (
    <UserContext.Consumer>
      {(userContext) => {
        if (!userContext) {
          throw new Error('UserContext must be used within UserProvider');
        }

        return userContext.isAuthenticated ? (
          <div>Welcome, {userContext.user?.name}!</div>
        ) : (
          <div>Please log in</div>
        );
      }}
    </UserContext.Consumer>
  );
}
```

### Custom Context Hooks

Custom hooks for consuming context with better error handling and type safety.

```typescript { .api }
/**
 * Custom hook pattern for consuming context with error handling
 * @template T The type of the context value
 * @param context The context to consume
 * @param errorMessage Optional error message for missing provider
 * @returns The context value
 */
function useContextWithError<T>(
  context: Context<T | undefined>, 
  errorMessage?: string
): T {
  const value = useContext(context);
  if (value === undefined) {
    throw new Error(errorMessage || 'Context must be used within a Provider');
  }
  return value;
}
```

**Usage Examples:**

```typescript
import React, { useContext } from "react";

// Custom hook for theme context
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Custom hook for user context
function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Custom hook for settings context
function useSettings() {
  const settings = useContext(SettingsContext);
  // No error checking needed since we provided a default value
  return settings;
}

// Generic custom hook
function useRequiredContext<T>(context: React.Context<T | undefined>): T {
  const value = useContext(context);
  if (value === undefined) {
    throw new Error(`Context ${context.displayName || 'Unknown'} must be used within a Provider`);
  }
  return value;
}

// Using custom hooks in components
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className={`btn btn-${theme}`}
    >
      Current theme: {theme}
    </button>
  );
}

function UserProfile() {
  const { user, logout, isAuthenticated } = useUser();
  
  if (!isAuthenticated || !user) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function SettingsPanel() {
  const settings = useSettings();
  
  return (
    <div>
      <p>Language: {settings.language}</p>
      <p>Timezone: {settings.timezone}</p>
      <p>Notifications: {settings.notifications ? 'On' : 'Off'}</p>
    </div>
  );
}
```

### Multiple Context Patterns

Patterns for working with multiple contexts and complex context hierarchies.

```typescript { .api }
/**
 * Combined context provider for multiple contexts
 */
interface CombinedProviderProps {
  children: ReactNode;
}

/**
 * Context composition pattern
 */
function createContextComposer<T extends Record<string, any>>(
  contexts: T
): Context<T>;
```

**Usage Examples:**

```typescript
import React, { createContext, useContext, ReactNode } from "react";

// Multiple related contexts
const UIContext = createContext<{
  sidebarOpen: boolean;
  toggleSidebar: () => void;
} | undefined>(undefined);

const NotificationContext = createContext<{
  notifications: string[];
  addNotification: (message: string) => void;
  removeNotification: (index: number) => void;
} | undefined>(undefined);

// Combined provider
function AppUIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  
  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
  };
  
  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <UIContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
        {children}
      </NotificationContext.Provider>
    </UIContext.Provider>
  );
}

// Context composer utility
function createCombinedProvider<T extends Record<string, React.Context<any>>>(
  contexts: T
) {
  return function CombinedProvider({ children, ...values }: { 
    children: ReactNode;
    [K in keyof T]: React.ComponentProps<T[K]['Provider']>['value'];
  }) {
    return Object.entries(contexts).reduce(
      (acc, [key, Context]) => (
        <Context.Provider value={values[key as keyof typeof values]}>
          {acc}
        </Context.Provider>
      ),
      children as ReactNode
    );
  };
}

// HOC for consuming multiple contexts
function withMultipleContexts<P extends object>(
  Component: React.ComponentType<P>,
  contextHooks: Record<string, () => any>
) {
  return function WrappedComponent(props: P) {
    const contextValues = Object.entries(contextHooks).reduce(
      (acc, [key, hook]) => ({ ...acc, [key]: hook() }),
      {} as Record<string, any>
    );

    return <Component {...props} {...contextValues} />;
  };
}

// Usage example
const EnhancedComponent = withMultipleContexts(
  ({ theme, user, ...props }: { theme: any; user: any } & ComponentProps) => {
    return <div>Component with theme: {theme.theme} and user: {user.user?.name}</div>;
  },
  {
    theme: useTheme,
    user: useUser
  }
);

// Context-aware error boundary
interface ContextErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ContextErrorBoundary extends Component<
  { children: ReactNode }, 
  ContextErrorBoundaryState
> {
  state: ContextErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ContextErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Context Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Context Error</h2>
          <p>{this.state.error?.message}</p>
          <p>Make sure all contexts are properly provided.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Context Performance Optimization

Patterns for optimizing context performance and preventing unnecessary re-renders.

```typescript { .api }
/**
 * Split context pattern for performance optimization
 */
interface SplitContextValue<T> {
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
}

/**
 * Memoized context provider pattern
 */
function createMemoizedProvider<T>(
  context: Context<T>,
  useValue: () => T
): React.ComponentType<{ children: ReactNode }>;
```

**Usage Examples:**

```typescript
import React, { createContext, useMemo, memo, useCallback } from "react";

// Split contexts to prevent unnecessary re-renders
const UserStateContext = createContext<User | null>(null);
const UserActionsContext = createContext<{
  login: (user: User) => void;
  logout: () => void;
} | undefined>(undefined);

function OptimizedUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Memoize actions to prevent recreation on every render
  const actions = useMemo(() => ({
    login: (userData: User) => setUser(userData),
    logout: () => setUser(null)
  }), []);

  return (
    <UserStateContext.Provider value={user}>
      <UserActionsContext.Provider value={actions}>
        {children}
      </UserActionsContext.Provider>
    </UserStateContext.Provider>
  );
}

// Separate hooks for state and actions
function useUserState() {
  return useContext(UserStateContext);
}

function useUserActions() {
  const actions = useContext(UserActionsContext);
  if (!actions) {
    throw new Error('useUserActions must be used within OptimizedUserProvider');
  }
  return actions;
}

// Memoized provider component
const MemoizedThemeProvider = memo<{ children: ReactNode }>(({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
});

// Selector pattern for large context values
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  settings: AppSettings;
  notifications: string[];
}

const AppStateContext = createContext<AppState | undefined>(undefined);

function useAppStateSelector<T>(selector: (state: AppState) => T): T {
  const state = useContext(AppStateContext);
  if (!state) {
    throw new Error('useAppStateSelector must be used within AppStateProvider');
  }
  return selector(state);
}

// Usage with selectors
function UserName() {
  const userName = useAppStateSelector(state => state.user?.name);
  return <span>{userName || 'Anonymous'}</span>;
}

function ThemeIndicator() {
  const theme = useAppStateSelector(state => state.theme);
  return <span>Current theme: {theme}</span>;
}

function NotificationCount() {
  const count = useAppStateSelector(state => state.notifications.length);
  return <span>Notifications: {count}</span>;
}
```