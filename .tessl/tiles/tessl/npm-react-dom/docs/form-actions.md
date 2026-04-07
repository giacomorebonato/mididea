# Form Actions

React hooks and utilities for progressive enhancement and Server Actions integration, providing seamless form handling with and without JavaScript.

## Capabilities

### useFormState

Hook for managing form state with Server Actions, enabling progressive enhancement where forms work without JavaScript but enhance when JavaScript is available.

```javascript { .api }
/**
 * Hook for managing form state with Server Actions
 * @param action - Function to handle form submission (receives previous state and payload)
 * @param initialState - Initial state value
 * @param permalink - Optional URL to navigate to after submission
 * @returns Tuple of [current state, dispatch function, isPending boolean]
 */
function useFormState<S, P = FormData>(
  action: (prevState: Awaited<S>, payload: P) => S,
  initialState: Awaited<S>,
  permalink?: string
): [state: Awaited<S>, dispatch: (payload: P) => void, isPending: boolean];
```

**Usage Examples:**

```javascript
import { useFormState } from 'react-dom';

// Basic form with state
function ContactForm() {
  async function submitForm(prevState, formData) {
    const email = formData.get('email');
    const message = formData.get('message');

    try {
      await sendEmail(email, message);
      return { success: true, message: 'Email sent!' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  const [state, formAction, isPending] = useFormState(submitForm, {
    success: false,
    message: ''
  });

  return (
    <form action={formAction}>
      <input type="email" name="email" required />
      <textarea name="message" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Sending...' : 'Send'}
      </button>

      {state.success && <p className="success">{state.message}</p>}
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}

// Server Action (in server component or server module)
'use server';

export async function createPost(prevState, formData) {
  const title = formData.get('title');
  const content = formData.get('content');

  // Validation
  if (!title || title.length < 3) {
    return {
      error: 'Title must be at least 3 characters',
      fields: { title, content }
    };
  }

  try {
    const post = await db.posts.create({
      data: { title, content }
    });

    return {
      success: true,
      postId: post.id
    };
  } catch (error) {
    return {
      error: 'Failed to create post',
      fields: { title, content }
    };
  }
}

// Client component using Server Action
'use client';
import { useFormState } from 'react-dom';
import { createPost } from './actions';

function CreatePostForm() {
  const [state, formAction, isPending] = useFormState(createPost, {
    success: false,
    error: null
  });

  return (
    <form action={formAction}>
      <input
        type="text"
        name="title"
        defaultValue={state.fields?.title}
        required
        disabled={isPending}
      />
      <textarea
        name="content"
        defaultValue={state.fields?.content}
        required
        disabled={isPending}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Post'}
      </button>

      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p>Post created! ID: {state.postId}</p>}
    </form>
  );
}

// With permalink (redirects after successful submission)
function LoginForm() {
  async function login(prevState, formData) {
    const username = formData.get('username');
    const password = formData.get('password');

    const user = await authenticateUser(username, password);

    if (user) {
      return { success: true, user };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  }

  const [state, formAction, isPending] = useFormState(
    login,
    { success: false },
    '/dashboard'  // Navigate here on success
  );

  return (
    <form action={formAction}>
      <input type="text" name="username" required disabled={isPending} />
      <input type="password" name="password" required disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Log In'}
      </button>

      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}

// Multi-step form
function MultiStepForm() {
  async function handleStep(prevState, formData) {
    const newData = Object.fromEntries(formData);

    if (prevState.step === 1) {
      // Validate step 1
      if (!newData.email) {
        return { ...prevState, error: 'Email required' };
      }
      return {
        step: 2,
        data: { ...prevState.data, ...newData }
      };
    }

    if (prevState.step === 2) {
      // Final submission
      await submitForm({ ...prevState.data, ...newData });
      return { step: 3, success: true };
    }

    return prevState;
  }

  const [state, formAction] = useFormState(handleStep, {
    step: 1,
    data: {},
    error: null
  });

  if (state.step === 1) {
    return (
      <form action={formAction}>
        <input type="email" name="email" required />
        <button type="submit">Next</button>
        {state.error && <p>{state.error}</p>}
      </form>
    );
  }

  if (state.step === 2) {
    return (
      <form action={formAction}>
        <input type="text" name="name" required />
        <button type="submit">Submit</button>
      </form>
    );
  }

  return <p>Thank you! Form submitted.</p>;
}
```

**Key Features:**

- **Progressive Enhancement**: Works without JavaScript (falls back to form submission)
- **Server Actions**: Integrates seamlessly with Server Components
- **State Persistence**: Previous state is passed to action function
- **Automatic Serialization**: State is automatically serialized for client/server transfer
- **Permalink Support**: Optional navigation after successful submission

**State Flow:**

1. User submits form
2. React calls action with (previousState, formData)
3. Action returns new state (sync or async)
4. Component re-renders with new state
5. Form can show validation errors, success messages, etc.

### useFormStatus

Hook to read the status of the parent form, providing information about pending submission state.

```javascript { .api }
/**
 * Hook to read the status of the parent <form>
 * Must be called from a component rendered inside a <form>
 * @returns Object with form status information
 */
// Return type varies based on pending state
type FormStatusNotPending = {
  pending: false;
  data: null;
  method: null;
  action: null;
};

type FormStatusPending = {
  pending: true;
  /** The FormData being submitted */
  data: FormData;
  /** The form's HTTP method */
  method: string;
  /** The action being called (can be a string URL or function) */
  action: string | ((formData: FormData) => void | Promise<void>) | null;
};

type FormStatus = FormStatusPending | FormStatusNotPending;

function useFormStatus(): FormStatus;
```

**Usage Examples:**

```javascript
import { useFormStatus } from 'react-dom';

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

function MyForm() {
  return (
    <form action={submitAction}>
      <input type="text" name="name" />
      <SubmitButton />
    </form>
  );
}

// Loading spinner while form submits
function LoadingSpinner() {
  const { pending } = useFormStatus();

  if (!pending) return null;

  return (
    <div className="spinner">
      <div className="spinner-icon" />
      <p>Saving...</p>
    </div>
  );
}

function CommentForm() {
  return (
    <form action={postComment}>
      <textarea name="comment" />
      <button type="submit">Post Comment</button>
      <LoadingSpinner />
    </form>
  );
}

// Disable form fields while submitting
function FormField({ name, label }) {
  const { pending } = useFormStatus();

  return (
    <label>
      {label}
      <input
        type="text"
        name={name}
        disabled={pending}
      />
    </label>
  );
}

function ContactForm() {
  return (
    <form action={sendMessage}>
      <FormField name="email" label="Email" />
      <FormField name="message" label="Message" />
      <button type="submit">Send</button>
    </form>
  );
}

// Show what's being submitted
function FormDebug() {
  const { pending, data, action, method } = useFormStatus();

  if (!pending) return null;

  return (
    <div className="debug">
      <p>Method: {method}</p>
      <p>Action: {action?.name}</p>
      <p>Data: {data ? Array.from(data.entries()).map(([k, v]) => `${k}=${v}`).join(', ') : 'none'}</p>
    </div>
  );
}

// Optimistic UI update
function TodoItem({ todo }) {
  const { pending, data } = useFormStatus();

  // Check if this specific todo is being deleted
  const isDeleting = pending && data?.get('todoId') === todo.id;

  return (
    <div className={isDeleting ? 'deleting' : ''}>
      <span>{todo.text}</span>
      <form action={deleteTodo}>
        <input type="hidden" name="todoId" value={todo.id} />
        <button type="submit" disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </form>
    </div>
  );
}

// Progressive enhancement indicator
function ProgressiveForm() {
  function FormContent() {
    const { pending } = useFormStatus();

    return (
      <>
        <input type="text" name="query" />
        <button type="submit">
          {pending ? '🔄 Searching...' : '🔍 Search'}
        </button>
        {pending && <p className="note">JavaScript is enabled - Enhanced UX</p>}
      </>
    );
  }

  return (
    <form action="/search" method="GET">
      <FormContent />
    </form>
  );
}
```

**Important Notes:**

- **Must be inside <form>**: `useFormStatus` must be called from a component rendered inside a `<form>` element
- **Not in form component itself**: Call it from a child component, not the component that renders the `<form>`
- **Only parent form**: Only reads status of the parent `<form>`, not any child forms

**Common Pattern:**

```javascript
// ❌ Wrong - won't work
function MyForm() {
  const { pending } = useFormStatus(); // Won't see form status

  return (
    <form action={action}>
      <button disabled={pending}>Submit</button>
    </form>
  );
}

// ✅ Correct - call in child component
function SubmitButton() {
  const { pending } = useFormStatus(); // Works!

  return <button disabled={pending}>Submit</button>;
}

function MyForm() {
  return (
    <form action={action}>
      <SubmitButton />
    </form>
  );
}
```

### requestFormReset

Programmatically reset a form element to its initial state.

```javascript { .api }
/**
 * Programmatically reset a form
 * @param form - The HTML form element to reset
 */
function requestFormReset(form: HTMLFormElement): void;
```

**Usage Examples:**

```javascript
import { requestFormReset } from 'react-dom';
import { useRef } from 'react';

// Reset form after successful submission
function ContactForm() {
  const formRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    await sendMessage(formData);

    // Reset form
    requestFormReset(formRef.current);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input type="email" name="email" />
      <textarea name="message" />
      <button type="submit">Send</button>
    </form>
  );
}

// Reset with useFormState
function CreatePostForm() {
  const formRef = useRef(null);

  async function createPost(prevState, formData) {
    const result = await savePost(formData);

    if (result.success) {
      // Reset form after successful creation
      requestFormReset(formRef.current);
      return { success: true, postId: result.id };
    }

    return { success: false, error: result.error };
  }

  const [state, formAction] = useFormState(createPost, { success: false });

  return (
    <form ref={formRef} action={formAction}>
      <input type="text" name="title" />
      <textarea name="content" />
      <button type="submit">Create</button>

      {state.success && <p>Post created!</p>}
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}

// Conditional reset
function EditForm({ item }) {
  const formRef = useRef(null);

  function handleCancel() {
    // Reset to initial values
    requestFormReset(formRef.current);
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Save logic...

    // Reset after save
    requestFormReset(formRef.current);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input type="text" name="name" defaultValue={item.name} />
      <input type="text" name="description" defaultValue={item.description} />

      <button type="submit">Save</button>
      <button type="button" onClick={handleCancel}>Cancel</button>
    </form>
  );
}

// Reset multiple forms
function MultiFormPage() {
  const form1Ref = useRef(null);
  const form2Ref = useRef(null);

  function resetAll() {
    requestFormReset(form1Ref.current);
    requestFormReset(form2Ref.current);
  }

  return (
    <div>
      <form ref={form1Ref}>
        {/* Form 1 fields */}
      </form>

      <form ref={form2Ref}>
        {/* Form 2 fields */}
      </form>

      <button onClick={resetAll}>Reset All</button>
    </div>
  );
}
```

**What Reset Does:**

- Clears all input values to their defaults (initial values or empty)
- Resets checkboxes/radio buttons to default state
- Clears file inputs
- Resets select elements to default option
- Triggers 'reset' event on the form

**Notes:**

- Same as calling `form.reset()` but integrated with React's update cycle
- Does not affect uncontrolled component state
- Respects `defaultValue` props on inputs

## Server Actions Integration

### Basic Server Action

```javascript
// app/actions.js
'use server';

export async function submitForm(formData) {
  const name = formData.get('name');
  const email = formData.get('email');

  await db.users.create({ name, email });

  return { success: true };
}

// app/form.jsx
'use client';
import { submitForm } from './actions';

function MyForm() {
  return (
    <form action={submitForm}>
      <input type="text" name="name" required />
      <input type="email" name="email" required />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save'}
    </button>
  );
}
```

### Server Action with State

```javascript
// app/actions.js
'use server';

export async function updateProfile(prevState, formData) {
  const name = formData.get('name');

  // Validation
  if (name.length < 2) {
    return {
      error: 'Name must be at least 2 characters'
    };
  }

  try {
    await db.users.update({ name });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update profile' };
  }
}

// app/profile-form.jsx
'use client';
import { useFormState } from 'react-dom';
import { updateProfile } from './actions';

function ProfileForm() {
  const [state, formAction] = useFormState(updateProfile, {
    error: null
  });

  return (
    <form action={formAction}>
      <input type="text" name="name" required />
      <button type="submit">Update</button>

      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">Profile updated!</p>}
    </form>
  );
}
```

### Optimistic Updates

```javascript
'use client';
import { useOptimistic } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

function TodoList({ todos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );

  async function addTodo(prevState, formData) {
    const text = formData.get('text');

    // Optimistically add todo
    addOptimisticTodo({ id: Date.now(), text });

    // Actually create todo
    const todo = await createTodo(text);

    return { success: true, todo };
  }

  const [state, formAction] = useFormState(addTodo, {});

  return (
    <div>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} className={todo.pending ? 'pending' : ''}>
            {todo.text}
          </li>
        ))}
      </ul>

      <form action={formAction}>
        <input type="text" name="text" required />
        <AddButton />
      </form>
    </div>
  );
}

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add Todo'}
    </button>
  );
}
```

## Progressive Enhancement

### Works Without JavaScript

```javascript
// This form works even if JavaScript fails to load
function ContactForm() {
  return (
    <form action="/api/contact" method="POST">
      <input type="email" name="email" required />
      <textarea name="message" required />
      <button type="submit">Send</button>
    </form>
  );
}

// Enhanced with JavaScript
'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { sendContact } from './actions';

function ContactForm() {
  const [state, formAction] = useFormState(sendContact, {});

  return (
    <form action={formAction}>
      <input type="email" name="email" required />
      <textarea name="message" required />
      <SubmitButton />

      {/* Only shown with JavaScript */}
      {state.success && <p>Message sent!</p>}
      {state.error && <p>{state.error}</p>}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Sending...' : 'Send'}
    </button>
  );
}
```

## Best Practices

1. **Validation**: Validate on both client and server
2. **Error Handling**: Always return errors in state for user feedback
3. **Loading States**: Use `useFormStatus` to show pending states
4. **Accessibility**: Keep forms accessible (proper labels, ARIA attributes)
5. **Reset After Success**: Use `requestFormReset` to clear form after successful submission
6. **Idempotency**: Make actions idempotent (safe to retry)
7. **Optimistic Updates**: Use with `useOptimistic` for better UX
8. **Progressive Enhancement**: Ensure forms work without JavaScript
9. **Type Safety**: Use TypeScript for action parameters and return types
10. **Security**: Validate and sanitize all inputs on the server

## Common Patterns

### Search Form

```javascript
function SearchForm() {
  async function search(prevState, formData) {
    const query = formData.get('query');
    const results = await searchDatabase(query);

    return { results, query };
  }

  const [state, formAction] = useFormState(search, { results: [] });

  return (
    <div>
      <form action={formAction}>
        <input type="text" name="query" required />
        <SearchButton />
      </form>

      {state.results.length > 0 && (
        <ul>
          {state.results.map(result => (
            <li key={result.id}>{result.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchButton() {
  const { pending } = useFormStatus();
  return <button type="submit">{pending ? 'Searching...' : 'Search'}</button>;
}
```

### File Upload

```javascript
function UploadForm() {
  async function upload(prevState, formData) {
    const file = formData.get('file');

    if (!file || file.size === 0) {
      return { error: 'Please select a file' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { error: 'File too large (max 5MB)' };
    }

    const url = await uploadToS3(file);

    return { success: true, url };
  }

  const [state, formAction] = useFormState(upload, {});

  return (
    <form action={formAction}>
      <input type="file" name="file" accept="image/*" required />
      <UploadButton />

      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p>Uploaded! URL: {state.url}</p>}
    </form>
  );
}

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Uploading...' : 'Upload'}
    </button>
  );
}
```

### Multi-Field Validation

```javascript
function RegistrationForm() {
  async function register(prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    const errors = {};

    if (!email.includes('@')) {
      errors.email = 'Invalid email';
    }

    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      return { errors, fields: { email } };
    }

    await createUser(email, password);

    return { success: true };
  }

  const [state, formAction] = useFormState(register, {});

  return (
    <form action={formAction}>
      <input
        type="email"
        name="email"
        defaultValue={state.fields?.email}
        required
      />
      {state.errors?.email && <p className="error">{state.errors.email}</p>}

      <input type="password" name="password" required />
      {state.errors?.password && <p className="error">{state.errors.password}</p>}

      <input type="password" name="confirmPassword" required />
      {state.errors?.confirmPassword && (
        <p className="error">{state.errors.confirmPassword}</p>
      )}

      <SubmitButton />

      {state.success && <p>Registration successful!</p>}
    </form>
  );
}
```

## Type Safety (TypeScript)

```typescript
import { useFormState, useFormStatus } from 'react-dom';

interface FormState {
  success?: boolean;
  error?: string;
  data?: any;
}

async function myAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Implementation
  return { success: true };
}

function MyForm() {
  const [state, formAction] = useFormState<FormState>(
    myAction,
    { success: false }
  );

  return <form action={formAction}>{/* ... */}</form>;
}
```
