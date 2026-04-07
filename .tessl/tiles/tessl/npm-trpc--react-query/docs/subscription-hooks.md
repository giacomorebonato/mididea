# Subscription Hooks

React hooks for real-time data subscriptions with automatic connection management, error handling, and reconnection logic. These hooks are automatically generated for each subscription procedure in your tRPC router.

## Capabilities

### useSubscription

Primary hook for establishing real-time subscriptions to tRPC subscription procedures.

```typescript { .api }
/**
 * Hook for subscribing to real-time data streams from tRPC subscription procedures
 * @param input - Input parameters for the subscription procedure
 * @param opts - Subscription configuration options
 * @returns Subscription result with current data and connection state
 */
procedure.useSubscription(
  input: TInput,
  opts?: UseTRPCSubscriptionOptions<TOutput, TError>
): TRPCSubscriptionResult<TOutput, TError>;

// Overload with skip token support
procedure.useSubscription(
  input: TInput | SkipToken,
  opts?: Omit<UseTRPCSubscriptionOptions<TOutput, TError>, 'enabled'>
): TRPCSubscriptionResult<TOutput, TError>;

interface UseTRPCSubscriptionOptions<TOutput, TError> {
  /** Whether the subscription is enabled */
  enabled?: boolean;
  
  /** Callback fired when subscription receives data */
  onData?: (data: TOutput) => void;
  
  /** Callback fired when subscription starts */
  onStarted?: () => void;
  
  /** Callback fired on subscription errors */
  onError?: (error: TError) => void;
  
  /** Callback fired when subscription stops */
  onStopped?: () => void;
  
  /** tRPC-specific request options */
  trpc?: TRPCReactRequestOptions;
}

interface TRPCSubscriptionResult<TData, TError> {
  /** Current subscription data */
  data: TData | undefined;
  
  /** Subscription error if any */
  error: TError | null;
  
  /** Current subscription status */
  status: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'stopped' | 'error';
  
  /** tRPC-specific hook metadata */
  trpc: TRPCHookResult;
}

type TRPCSubscriptionConnectingResult<TData, TError> = TRPCSubscriptionResult<TData, TError> & {
  status: 'connecting';
};

type TRPCSubscriptionIdleResult<TData, TError> = TRPCSubscriptionResult<TData, TError> & {
  status: 'idle';
};
```

**Usage Examples:**

```typescript
import { trpc } from "./utils/trpc";

function LiveNotifications({ userId }: { userId: number }) {
  const { data, error, status } = trpc.notifications.subscribe.useSubscription(
    { userId },
    {
      onData: (notification) => {
        console.log("New notification:", notification);
        // Show toast notification
        showNotification(notification.message);
      },
      onError: (error) => {
        console.error("Subscription error:", error);
      },
      onStarted: () => {
        console.log("Subscription started");
      },
      onStopped: () => {
        console.log("Subscription stopped");
      },
    }
  );

  return (
    <div>
      <div>Status: {status}</div>
      {error && <div>Error: {error.message}</div>}
      {data && (
        <div>
          <h3>Latest Notification</h3>
          <p>{data.message}</p>
          <small>{new Date(data.timestamp).toLocaleString()}</small>
        </div>
      )}
    </div>
  );
}
```

### Connection Status Management

Monitor and handle different subscription connection states.

```typescript
function ConnectionStatusExample({ roomId }: { roomId: string }) {
  const subscription = trpc.chat.subscribe.useSubscription(
    { roomId },
    {
      onData: (message) => {
        console.log("New message:", message);
      },
    }
  );

  const renderConnectionStatus = () => {
    switch (subscription.status) {
      case 'idle':
        return <div className="status idle">Not connected</div>;
      case 'connecting':
        return <div className="status connecting">Connecting...</div>;
      case 'connected':
        return <div className="status connected">Connected</div>;
      case 'reconnecting':
        return <div className="status reconnecting">Reconnecting...</div>;
      case 'error':
        return <div className="status error">Connection error</div>;
      case 'stopped':
        return <div className="status stopped">Disconnected</div>;
      default:
        return null;
    }
  };

  return (
    <div>
      {renderConnectionStatus()}
      {subscription.error && (
        <div>Error: {subscription.error.message}</div>
      )}
      {subscription.data && (
        <div>Latest message: {subscription.data.content}</div>
      )}
    </div>
  );
}
```

### Conditional Subscriptions

Control when subscriptions are active using the enabled option or skip token.

```typescript
function ConditionalSubscription({ userId, isOnline }: { userId: number; isOnline: boolean }) {
  // Using enabled option
  const onlineStatus = trpc.user.onlineStatus.useSubscription(
    { userId },
    {
      enabled: isOnline,
      onData: (status) => {
        console.log("User status changed:", status);
      },
    }
  );

  // Using skip token
  const notifications = trpc.notifications.subscribe.useSubscription(
    isOnline ? { userId } : skipToken,
    {
      onData: (notification) => {
        showNotification(notification.message);
      },
    }
  );

  return (
    <div>
      <p>Online: {isOnline ? "Yes" : "No"}</p>
      <p>Subscription status: {onlineStatus.status}</p>
    </div>
  );
}
```

### Real-time Chat Implementation

Complete example of a real-time chat using subscriptions.

```typescript
function ChatRoom({ roomId, userId }: { roomId: string; userId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  
  // Subscribe to new messages
  const messageSubscription = trpc.chat.messages.useSubscription(
    { roomId },
    {
      onData: (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      },
      onError: (error) => {
        console.error("Message subscription error:", error);
      },
    }
  );

  // Subscribe to typing indicators
  const typingSubscription = trpc.chat.typing.useSubscription(
    { roomId },
    {
      onData: (typingData) => {
        console.log("Typing:", typingData);
      },
    }
  );

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setInputValue("");
    },
  });

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage.mutate({
        roomId,
        userId,
        content: inputValue,
      });
    }
  };

  return (
    <div className="chat-room">
      <div className="connection-status">
        Messages: {messageSubscription.status}
        {messageSubscription.error && (
          <span>Error: {messageSubscription.error.message}</span>
        )}
      </div>
      
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <strong>{message.user.name}:</strong> {message.content}
            <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
        />
        <button 
          onClick={handleSendMessage}
          disabled={sendMessage.isPending}
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

### Live Data Updates

Use subscriptions to keep displayed data synchronized with real-time changes.

```typescript
function LiveUserList() {
  const [users, setUsers] = useState<User[]>([]);
  
  // Initial data fetch
  const { data: initialUsers } = trpc.users.list.useQuery();
  
  // Subscribe to user updates
  const userUpdates = trpc.users.updates.useSubscription(
    {},
    {
      onData: (update) => {
        setUsers((prevUsers) => {
          switch (update.type) {
            case 'user_added':
              return [...prevUsers, update.user];
            case 'user_updated':
              return prevUsers.map((user) =>
                user.id === update.user.id ? update.user : user
              );
            case 'user_removed':
              return prevUsers.filter((user) => user.id !== update.userId);
            default:
              return prevUsers;
          }
        });
      },
    }
  );

  // Initialize users when query data is available
  useEffect(() => {
    if (initialUsers) {
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  return (
    <div>
      <h2>Live User List ({userUpdates.status})</h2>
      {userUpdates.error && (
        <div>Subscription error: {userUpdates.error.message}</div>
      )}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Subscription Error Handling

Implement robust error handling and recovery for subscriptions.

```typescript
function RobustSubscription({ channelId }: { channelId: string }) {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  const subscription = trpc.channel.subscribe.useSubscription(
    { channelId },
    {
      enabled: retryCount < maxRetries,
      onData: (data) => {
        // Reset retry count on successful data reception
        setRetryCount(0);
        console.log("Received data:", data);
      },
      onError: (error) => {
        console.error("Subscription error:", error);
        
        // Implement exponential backoff retry
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, Math.pow(2, retryCount) * 1000);
        }
      },
      onStopped: () => {
        console.log("Subscription stopped");
      },
    }
  );

  const handleManualRetry = () => {
    setRetryCount(0);
  };

  return (
    <div>
      <div>Status: {subscription.status}</div>
      {subscription.error && (
        <div>
          <p>Error: {subscription.error.message}</p>
          {retryCount >= maxRetries ? (
            <button onClick={handleManualRetry}>
              Retry Connection
            </button>
          ) : (
            <p>Retrying... ({retryCount}/{maxRetries})</p>
          )}
        </div>
      )}
      {subscription.data && (
        <div>Latest data: {JSON.stringify(subscription.data)}</div>
      )}
    </div>
  );
}
```

## Common Patterns

### Subscription Cleanup

Subscriptions are automatically cleaned up when components unmount, but you can also control them manually:

```typescript
function SubscriptionWithCleanup() {
  const [isSubscribed, setIsSubscribed] = useState(true);
  
  const subscription = trpc.events.subscribe.useSubscription(
    { channel: "global" },
    {
      enabled: isSubscribed,
    }
  );

  return (
    <div>
      <button onClick={() => setIsSubscribed(!isSubscribed)}>
        {isSubscribed ? "Unsubscribe" : "Subscribe"}
      </button>
      <p>Status: {subscription.status}</p>
    </div>
  );
}
```

### Multiple Subscriptions

Handle multiple related subscriptions in a single component:

```typescript
function MultipleSubscriptions({ userId }: { userId: number }) {
  const notifications = trpc.notifications.subscribe.useSubscription(
    { userId },
    { onData: (data) => console.log("Notification:", data) }
  );
  
  const messages = trpc.messages.subscribe.useSubscription(
    { userId },
    { onData: (data) => console.log("Message:", data) }
  );
  
  const presence = trpc.presence.subscribe.useSubscription(
    { userId },
    { onData: (data) => console.log("Presence:", data) }
  );

  const allConnected = [notifications, messages, presence].every(
    (sub) => sub.status === 'connected'
  );

  return (
    <div>
      <p>All subscriptions connected: {allConnected ? "Yes" : "No"}</p>
    </div>
  );
}
```

### Subscription with Authentication

Handle authentication in subscription connections:

```typescript
function AuthenticatedSubscription({ token }: { token: string }) {
  const subscription = trpc.private.updates.useSubscription(
    { channel: "user-updates" },
    {
      trpc: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          // Handle authentication error
          redirectToLogin();
        }
      },
    }
  );

  return (
    <div>
      {subscription.data && <div>Update: {subscription.data.message}</div>}
    </div>
  );
}
```