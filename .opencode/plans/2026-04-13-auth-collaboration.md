# Auth & Collaboration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace password auth with email OTP, enable unauthenticated save-via-auth-prompt, and add email-based collaboration invitations with confirmation.

**Architecture:** Extend existing better-auth with `emailOtp` plugin (no new tables for auth). Add `Invitation` Prisma model for collaboration flow. Modify frontend components to chain auth → save and show invitation status.

**Tech Stack:** better-auth emailOtp plugin, Prisma, tRPC, React, TanStack Router

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/server/auth.ts` | Add emailOtp plugin |
| Modify | `src/client/auth.ts` | Add emailOtp client plugin |
| Modify | `src/client/components/auth-button.tsx` | OTP flow UI, onSuccess callback |
| Modify | `src/client/components/save-composition-dialog.tsx` | Show for unauthenticated, chain auth |
| Modify | `prisma/schema.prisma` | Add Invitation model + relations |
| Modify | `src/server/routers/collaboration.ts` | Update invite, add 4 new endpoints |
| Modify | `src/client/components/collaborator-dialog.tsx` | Show invitation statuses |
| Modify | `src/client/pages/creations-page.tsx` | Show pending invitations banner |
| Modify | `src/client/pages/composition-page.tsx` | Handle invite deep links |
| Create | `src/client/components/auth-inline.tsx` | Inline OTP form for modals |
| Create | `src/client/components/invitation-banner.tsx` | Accept/decline invitations UI |
| Create | `src/server/routers/__tests__/auth-email-otp.test.ts` | Auth plugin test |
| Create | `src/server/routers/__tests__/invitation.test.ts` | Invitation model smoke test |
| Create | `src/server/routers/__tests__/collaboration-invitation.test.ts` | Invitation endpoint tests |

---

### Task 1: Add emailOtp plugin to server auth

**Files:**
- Modify: `src/server/auth.ts`

- [ ] **Step 1: Write the failing test**

Create `src/server/routers/__tests__/auth-email-otp.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'

describe('emailOtp plugin', () => {
  test('auth config includes emailOtp plugin', async () => {
    const { auth } = await import('../auth')
    const options = auth.options
    expect(options.plugins).toBeDefined()
    expect(Array.isArray(options.plugins)).toBe(true)
    const pluginIds = (options.plugins as any[]).map((p: any) => p.id)
    expect(pluginIds).toContain('email-otp')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/server/routers/__tests__/auth-email-otp.test.ts`
Expected: FAIL — plugins array is empty or undefined

- [ ] **Step 3: Implement**

Replace `src/server/auth.ts` with:

```ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { emailOtp } from 'better-auth/plugins'
import { prisma } from '../db'
import { env } from '../env'

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    emailOtp({
      sendEmail: async ({ email, otp }) => {
        console.log(`[DEV] OTP for ${email}: ${otp}`)
      },
      otpLength: 6,
      expiresIn: 300,
    }),
  ],
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/server/routers/__tests__/auth-email-otp.test.ts`
Expected: PASS

- [ ] **Step 5: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/server/auth.ts src/server/routers/__tests__/auth-email-otp.test.ts
git commit -m "feat: add emailOtp plugin to better-auth"
```

---

### Task 2: Add emailOtp plugin to client auth

**Files:**
- Modify: `src/client/auth.ts`

- [ ] **Step 1: Update client auth config**

Replace `src/client/auth.ts` with:

```ts
import { createAuthClient } from 'better-auth/react'
import { emailOtp } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [emailOtp()],
})
```

- [ ] **Step 2: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/client/auth.ts
git commit -m "feat: add emailOtp client plugin"
```

---

### Task 3: Replace auth-button with OTP flow

**Files:**
- Modify: `src/client/components/auth-button.tsx`

- [ ] **Step 1: Implement OTP auth button with onSuccess callback**

Replace `src/client/components/auth-button.tsx` with:

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '../auth'

interface AuthButtonProps {
  onSuccess?: () => void
}

export function AuthButton({ onSuccess }: AuthButtonProps) {
  const session = authClient.useSession()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  if (session.data?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {session.data.user.name ?? session.data.user.email}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            authClient.signOut().then(() => window.location.reload())
          }
        >
          Sign out
        </Button>
      </div>
    )
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      })
      if (result.error) {
        setError(result.error.message ?? 'Failed to send code')
        return
      }
      setCodeSent(true)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      })
      if (result.error) {
        setError(result.error.message ?? 'Invalid code')
        return
      }
      setOpen(false)
      setEmail('')
      setOtp('')
      setCodeSent(false)
      if (onSuccess) {
        onSuccess()
      } else {
        window.location.reload()
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Sign in
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          {!codeSent ? (
            <form
              onSubmit={handleSendCode}
              className="bg-card border rounded-xl p-6 w-full max-w-sm space-y-4"
            >
              <h2 className="text-lg font-semibold">Sign in</h2>
              <p className="text-sm text-muted-foreground">
                Enter your email to receive a sign-in code.
              </p>

              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={loading || !email.trim()}>
                  {loading ? 'Sending...' : 'Send code'}
                </Button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleVerify}
              className="bg-card border rounded-xl p-6 w-full max-w-sm space-y-4"
            >
              <h2 className="text-lg font-semibold">Enter code</h2>
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to {email}
              </p>

              <div className="space-y-2">
                <Label htmlFor="auth-otp">Code</Label>
                <Input
                  id="auth-otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={loading || otp.length < 6}>
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCodeSent(false)
                    setOtp('')
                    setError('')
                  }}
                >
                  Use a different email
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/client/components/auth-button.tsx
git commit -m "feat: replace password auth with email OTP flow"
```

---

### Task 4: Enable unauthenticated save via auth prompt

**Files:**
- Create: `src/client/components/auth-inline.tsx`
- Modify: `src/client/components/save-composition-dialog.tsx`

- [ ] **Step 1: Create inline auth component**

Create `src/client/components/auth-inline.tsx`:

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '../auth'

interface AuthInlineProps {
  onSuccess: () => void
}

export function AuthInline({ onSuccess }: AuthInlineProps) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const handleSendCode = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      })
      if (result.error) {
        setError(result.error.message ?? 'Failed to send code')
        return
      }
      setCodeSent(true)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await authClient.emailOtp.verifyEmail({ email, otp })
      if (result.error) {
        setError(result.error.message ?? 'Invalid code')
        return
      }
      onSuccess()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!codeSent) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="inline-email">Email</Label>
          <Input
            id="inline-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          className="w-full"
          onClick={handleSendCode}
          disabled={loading || !email.trim()}
        >
          {loading ? 'Sending...' : 'Send code'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Code sent to {email}</p>
      <div className="space-y-2">
        <Label htmlFor="inline-otp">Code</Label>
        <Input
          id="inline-otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          maxLength={6}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        className="w-full"
        onClick={handleVerify}
        disabled={loading || otp.length < 6}
      >
        {loading ? 'Verifying...' : 'Verify'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Update SaveCompositionDialog**

Replace `src/client/components/save-composition-dialog.tsx` with:

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '../auth'
import { AuthInline } from './auth-inline'
import type { SequencerState } from '../sequencer/types'
import { trpc } from '../trpc'

const TRANSIENT_KEYS = ['isPlaying', 'currentStep', 'activeXyPad'] as const

function stripTransient(state: SequencerState): Record<string, unknown> {
  const copy: Record<string, unknown> = { ...state }
  for (const key of TRANSIENT_KEYS) {
    delete copy[key]
  }
  return copy
}

interface SaveCompositionDialogProps {
  state: SequencerState
}

export function SaveCompositionDialog({ state }: SaveCompositionDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [needsAuth, setNeedsAuth] = useState(false)

  const session = authClient.useSession()
  const userId = session.data?.user?.id
  const utils = trpc.useUtils()

  const { data: myCompositions } = trpc.composition.mine.useQuery(undefined, {
    enabled: !!userId,
  })

  const save = trpc.composition.create.useMutation({
    onSuccess: () => {
      setOpen(false)
      setTitle('')
      setError('')
      utils.composition.mine.invalidate()
      utils.composition.list.invalidate()
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleClick = () => {
    if (!userId) {
      setNeedsAuth(true)
      return
    }
    setOpen(true)
  }

  if (needsAuth && !userId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-card border rounded-xl p-6 w-full max-w-sm space-y-4">
          <h2 className="text-lg font-semibold">Sign in to save</h2>
          <p className="text-sm text-muted-foreground">
            Create an account or sign in to save your composition.
          </p>
          <AuthInline
            onSuccess={() => {
              setNeedsAuth(false)
              setOpen(true)
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setNeedsAuth(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  const count = myCompositions?.length ?? 0

  return (
    <>
      <Button variant="secondary" size="sm" onClick={handleClick}>
        Save{userId ? ` (${count}/5)` : ''}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-card border rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Save Composition</h2>

            {count >= 5 ? (
              <p className="text-sm text-destructive">
                You've reached the limit of 5 compositions. Delete one from the
                Creations page first.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="comp-title">Title</Label>
                  <Input
                    id="comp-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My awesome beat"
                    maxLength={100}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!title.trim() || save.isPending}
                    onClick={() =>
                      save.mutate({
                        title: title.trim(),
                        data: JSON.stringify(stripTransient(state)),
                      })
                    }
                  >
                    {save.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 3: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/client/components/save-composition-dialog.tsx src/client/components/auth-inline.tsx
git commit -m "feat: unauthenticated save via auth prompt"
```

---

### Task 5: Add Invitation model to Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add Invitation model and relations**

In `prisma/schema.prisma`, add after the `Like` model:

```prisma
model Invitation {
  id            String       @id @default(cuid())
  composition   Composition  @relation(fields: [compositionId], references: [id], onDelete: Cascade)
  compositionId String
  inviter       User         @relation("SentInvitations", fields: [inviterId], references: [id], onDelete: Cascade)
  inviterId     String
  inviteeEmail  String
  token         String       @unique
  status        String       @default("pending")
  expiresAt     DateTime
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([token])
  @@index([inviteeEmail, status])
}
```

Add to `Composition` model (after `collaborators Collaborator[]`):
```prisma
  invitations Invitation[]
```

Add to `User` model (before `createdAt`):
```prisma
  sentInvitations Invitation[] @relation("SentInvitations")
```

- [ ] **Step 2: Generate and push schema**

Run: `bunx prisma db push && bunx prisma generate`

- [ ] **Step 3: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add Invitation model for collaboration invites"
```

---

### Task 6: Update collaboration router — invite + new endpoints

**Files:**
- Modify: `src/server/routers/collaboration.ts`
- Create: `src/server/routers/__tests__/collaboration-invitation.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/server/routers/__tests__/collaboration-invitation.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'
import { collaborationRouter } from '../collaboration'

const C = collaborationRouter as unknown as {
  createCaller: (ctx: unknown) => unknown
}

function caller(ctx: unknown) {
  return C.createCaller(ctx) as ReturnType<
    typeof collaborationRouter.createCaller
  >
}

const mockSession = { user: { id: 'user-1' }, session: { id: 's1' } }
const mockSession2 = { user: { id: 'user-2', email: 'user2@example.com' }, session: { id: 's2' } }

describe('collaborationRouter.invite (invitation flow)', () => {
  test('creates invitation when valid', async () => {
    const invitation = {
      id: 'inv-1',
      compositionId: 'comp-1',
      inviterId: 'user-1',
      inviteeEmail: 'user2@example.com',
      token: 'tok-123',
      status: 'pending',
      expiresAt: new Date(Date.now() + 86400000 * 7),
    }
    const c = caller({
      prisma: {
        composition: {
          findUnique: async () => ({ id: 'comp-1', authorId: 'user-1' }) as any,
        },
        user: {
          findUnique: async () => ({ id: 'user-2', email: 'user2@example.com' }) as any,
        },
        collaborator: {
          findUnique: async () => null,
        },
        invitation: {
          create: async () => invitation as any,
          findFirst: async () => null,
        },
      },
      session: mockSession,
    })
    const result = await c.invite({ compositionId: 'comp-1', email: 'user2@example.com' })
    expect(result.token).toBe('tok-123')
  })

  test('rejects if user already has pending invitation', async () => {
    const c = caller({
      prisma: {
        composition: {
          findUnique: async () => ({ id: 'comp-1', authorId: 'user-1' }) as any,
        },
        user: {
          findUnique: async () => ({ id: 'user-2', email: 'user2@example.com' }) as any,
        },
        collaborator: {
          findUnique: async () => null,
        },
        invitation: {
          findFirst: async () => ({ id: 'inv-1', status: 'pending' }) as any,
          create: async () => ({}) as any,
        },
      },
      session: mockSession,
    })
    try {
      await c.invite({ compositionId: 'comp-1', email: 'user2@example.com' })
      expect.unreachable('Should have thrown')
    } catch (e: unknown) {
      expect((e as { message?: string }).message).toContain('pending invitation')
    }
  })
})

describe('collaborationRouter.acceptInvitation', () => {
  test('accepts valid invitation', async () => {
    const c = caller({
      prisma: {
        invitation: {
          findUnique: async () => ({
            id: 'inv-1',
            compositionId: 'comp-1',
            inviteeEmail: 'user2@example.com',
            status: 'pending',
            expiresAt: new Date(Date.now() + 86400000),
          }) as any,
          update: async () => ({ status: 'accepted' }) as any,
        },
        collaborator: {
          create: async () => ({ id: 'collab-1' }) as any,
        },
        $transaction: async (ops: Promise<unknown>[]) => {
          for (const op of ops) await op
        },
      },
      session: mockSession2,
    })
    const result = await c.acceptInvitation({ token: 'tok-123' })
    expect(result.ok).toBe(true)
  })

  test('rejects expired invitation', async () => {
    const c = caller({
      prisma: {
        invitation: {
          findUnique: async () => ({
            id: 'inv-1',
            status: 'pending',
            inviteeEmail: 'user2@example.com',
            expiresAt: new Date(Date.now() - 1000),
          }) as any,
          update: async () => ({}) as any,
        },
        collaborator: { create: async () => ({}) as any },
        $transaction: async (ops: Promise<unknown>[]) => {
          for (const op of ops) await op
        },
      },
      session: mockSession2,
    })
    try {
      await c.acceptInvitation({ token: 'expired' })
      expect.unreachable('Should have thrown')
    } catch (e: unknown) {
      expect((e as { code?: string }).code).toBe('BAD_REQUEST')
    }
  })
})

describe('collaborationRouter.declineInvitation', () => {
  test('declines valid invitation', async () => {
    const c = caller({
      prisma: {
        invitation: {
          findUnique: async () => ({
            id: 'inv-1',
            status: 'pending',
            inviteeEmail: 'user2@example.com',
            expiresAt: new Date(Date.now() + 86400000),
          }) as any,
          update: async () => ({ status: 'declined' }) as any,
        },
      },
      session: mockSession2,
    })
    const result = await c.declineInvitation({ token: 'tok-123' })
    expect(result.ok).toBe(true)
  })
})

describe('collaborationRouter.pendingInvitations', () => {
  test('returns invitations for current users email', async () => {
    const invitations = [
      { id: 'inv-1', inviteeEmail: 'user2@example.com', status: 'pending' },
    ]
    const c = caller({
      prisma: {
        invitation: {
          findMany: async () => invitations as any,
        },
      },
      session: { user: { id: 'user-2', email: 'user2@example.com' }, session: { id: 's2' } },
    })
    const result = await c.pendingInvitations()
    expect(result).toHaveLength(1)
  })
})

describe('collaborationRouter.sentInvitations', () => {
  test('returns sent invitations for a composition', async () => {
    const invitations = [
      { id: 'inv-1', inviteeEmail: 'user2@example.com', status: 'pending' },
    ]
    const c = caller({
      prisma: {
        composition: {
          findUnique: async () => ({ id: 'comp-1', authorId: 'user-1' }) as any,
        },
        invitation: {
          findMany: async () => invitations as any,
        },
      },
      session: mockSession,
    })
    const result = await c.sentInvitations({ compositionId: 'comp-1' })
    expect(result).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/server/routers/__tests__/collaboration-invitation.test.ts`
Expected: FAIL — procedures don't exist yet

- [ ] **Step 3: Implement collaboration router changes**

Add at top of `src/server/routers/collaboration.ts`:
```ts
import { randomBytes } from 'crypto'
```

Replace the `invite` mutation with:

```ts
  invite: protectedProcedure
    .input(
      z.object({
        compositionId: z.string(),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const composition = await ctx.prisma.composition.findUnique({
        where: { id: input.compositionId },
      })

      if (!composition || composition.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No user found with that email.',
        })
      }

      if (user.id === ctx.session.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot invite yourself.',
        })
      }

      const existingCollab = await ctx.prisma.collaborator.findUnique({
        where: {
          compositionId_userId: {
            compositionId: input.compositionId,
            userId: user.id,
          },
        },
      })

      if (existingCollab) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This user is already a collaborator.',
        })
      }

      const existingInvitation = await ctx.prisma.invitation.findFirst({
        where: {
          compositionId: input.compositionId,
          inviteeEmail: input.email,
          status: 'pending',
          expiresAt: { gt: new Date() },
        },
      })

      if (existingInvitation) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'There is already a pending invitation for this user.',
        })
      }

      const token = randomBytes(32).toString('hex')

      const invitation = await ctx.prisma.invitation.create({
        data: {
          compositionId: input.compositionId,
          inviterId: ctx.session.user.id,
          inviteeEmail: input.email,
          token,
          status: 'pending',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })

      // TODO: send email with invitation link containing token
      console.log(
        `[DEV] Invitation link: /composition/${input.compositionId}?invite=${token}`,
      )

      return invitation
    }),
```

Add these new procedures before `pushChange`:

```ts
  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.invitation.findUnique({
        where: { token: input.token },
      })

      if (!invitation || invitation.status !== 'pending') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found or already processed.',
        })
      }

      if (invitation.expiresAt < new Date()) {
        await ctx.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'expired' },
        })
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invitation has expired.',
        })
      }

      if (invitation.inviteeEmail !== ctx.session.user.email) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This invitation is not for you.',
        })
      }

      await ctx.prisma.$transaction([
        ctx.prisma.collaborator.create({
          data: {
            compositionId: invitation.compositionId,
            userId: ctx.session.user.id,
          },
        }),
        ctx.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'accepted' },
        }),
      ])

      return { ok: true, compositionId: invitation.compositionId }
    }),

  declineInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.invitation.findUnique({
        where: { token: input.token },
      })

      if (!invitation || invitation.status !== 'pending') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found or already processed.',
        })
      }

      if (invitation.inviteeEmail !== ctx.session.user.email) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This invitation is not for you.',
        })
      }

      await ctx.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'declined' },
      })

      return { ok: true }
    }),

  pendingInvitations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.invitation.findMany({
      where: {
        inviteeEmail: ctx.session.user.email,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
      include: {
        composition: {
          select: { id: true, title: true },
        },
        inviter: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  sentInvitations: protectedProcedure
    .input(z.object({ compositionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const composition = await ctx.prisma.composition.findUnique({
        where: { id: input.compositionId },
      })

      if (!composition || composition.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return ctx.prisma.invitation.findMany({
        where: { compositionId: input.compositionId },
        include: {
          inviter: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }),
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/server/routers/__tests__/collaboration-invitation.test.ts`
Expected: All PASS

- [ ] **Step 5: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/server/routers/collaboration.ts src/server/routers/__tests__/collaboration-invitation.test.ts
git commit -m "feat: invitation-based collaboration flow"
```

---

### Task 7: Update CollaboratorDialog to show invitation status

**Files:**
- Modify: `src/client/components/collaborator-dialog.tsx`

- [ ] **Step 1: Update CollaboratorDialog**

Replace `src/client/components/collaborator-dialog.tsx` with:

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { trpc } from '../trpc'

interface CollaboratorDialogProps {
  compositionId: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600',
  accepted: 'text-green-600',
  declined: 'text-red-600',
  expired: 'text-muted-foreground',
}

export function CollaboratorDialog({ compositionId }: CollaboratorDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const utils = trpc.useUtils()

  const { data: collaborators = [], isLoading } =
    trpc.collaboration.list.useQuery({ compositionId }, { enabled: open })

  const { data: invitations = [], isLoading: invitationsLoading } =
    trpc.collaboration.sentInvitations.useQuery(
      { compositionId },
      { enabled: open },
    )

  const invite = trpc.collaboration.invite.useMutation({
    onSuccess: () => {
      setEmail('')
      setError('')
      utils.collaboration.list.invalidate({ compositionId })
      utils.collaboration.sentInvitations.invalidate({ compositionId })
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const remove = trpc.collaboration.remove.useMutation({
    onSuccess: () => {
      utils.collaboration.list.invalidate({ compositionId })
    },
  })

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Collaborators
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-card border rounded-xl p-6 w-full max-w-sm space-y-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">Manage Collaborators</h2>

            <div className="space-y-2">
              <Label htmlFor="collab-email">Invite by email</Label>
              <div className="flex gap-2">
                <Input
                  id="collab-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && email.trim()) {
                      invite.mutate({ compositionId, email: email.trim() })
                    }
                  }}
                />
                <Button
                  size="sm"
                  disabled={!email.trim() || invite.isPending}
                  onClick={() =>
                    invite.mutate({ compositionId, email: email.trim() })
                  }
                >
                  {invite.isPending ? '...' : 'Invite'}
                </Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Collaborators
              </h3>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : collaborators.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No collaborators yet.
                </p>
              ) : (
                collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {c.user.name ?? c.user.email}
                      </p>
                      {c.user.name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {c.user.email}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive shrink-0"
                      disabled={remove.isPending}
                      onClick={() =>
                        remove.mutate({ compositionId, userId: c.user.id })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>

            {invitations.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Pending Invitations
                </h3>
                {invitationsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                  invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {inv.inviteeEmail}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium ${STATUS_COLORS[inv.status] ?? ''}`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/client/components/collaborator-dialog.tsx
git commit -m "feat: show invitation statuses in collaborator dialog"
```

---

### Task 8: Add InvitationBanner to creations page

**Files:**
- Create: `src/client/components/invitation-banner.tsx`
- Modify: `src/client/pages/creations-page.tsx`

- [ ] **Step 1: Create InvitationBanner component**

Create `src/client/components/invitation-banner.tsx`:

```tsx
import { Button } from '@/components/ui/button'
import { authClient } from '../auth'
import { trpc } from '../trpc'

export function InvitationBanner() {
  const session = authClient.useSession()
  const userId = session.data?.user?.id

  const utils = trpc.useUtils()

  const { data: invitations = [] } =
    trpc.collaboration.pendingInvitations.useQuery(undefined, {
      enabled: !!userId,
    })

  const accept = trpc.collaboration.acceptInvitation.useMutation({
    onSuccess: (data) => {
      utils.collaboration.pendingInvitations.invalidate()
      if (data?.compositionId) {
        window.location.href = `/composition/${data.compositionId}`
      }
    },
  })

  const decline = trpc.collaboration.declineInvitation.useMutation({
    onSuccess: () => {
      utils.collaboration.pendingInvitations.invalidate()
    },
  })

  if (!userId || invitations.length === 0) return null

  return (
    <div className="space-y-2">
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="flex items-center justify-between gap-3 rounded-lg border bg-muted/50 p-3"
        >
          <div className="min-w-0">
            <p className="text-sm">
              <span className="font-medium">
                {inv.inviter.name ?? 'Someone'}
              </span>{' '}
              invited you to collaborate on{' '}
              <span className="font-medium">{inv.composition.title}</span>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => accept.mutate({ token: inv.token })}
              disabled={accept.isPending}
            >
              Accept
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => decline.mutate({ token: inv.token })}
              disabled={decline.isPending}
            >
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add InvitationBanner to CreationsPage**

In `src/client/pages/creations-page.tsx`, add import:

```ts
import { InvitationBanner } from '../components/invitation-banner'
```

Insert `<InvitationBanner />` after the `<h1>` tag, between it and the compositions grid:

```tsx
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Creations</h1>

      <InvitationBanner />
```

- [ ] **Step 3: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/client/components/invitation-banner.tsx src/client/pages/creations-page.tsx
git commit -m "feat: invitation banner on creations page"
```

---

### Task 9: Handle invitation deep links in CompositionPage

**Files:**
- Modify: `src/client/pages/composition-page.tsx`

- [ ] **Step 1: Add invite token handling**

In `src/client/pages/composition-page.tsx`, add after `const { compositionId } = useParams(...)`:

```ts
  const utils = trpc.useUtils()
```

Note: there is already a `const utils` not present — check if there's already one. If not, you may need to add `const utils = trpc.useUtils()` at the component level. However, looking at the file, there is no `utils` at the top — it's not using mutations directly. We need to add it.

Add this useEffect near the other useEffects (around line 65, after the `loadedRef` effect):

```ts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const inviteToken = params.get('invite')
    const declineToken = params.get('decline')
    if (inviteToken || declineToken) {
      const doAction = async () => {
        if (inviteToken) {
          await fetch('/api/trpc/collaboration.acceptInvitation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ json: { token: inviteToken } }),
          })
          window.history.replaceState({}, '', window.location.pathname)
          window.location.reload()
        } else if (declineToken) {
          await fetch('/api/trpc/collaboration.declineInvitation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ json: { token: declineToken } }),
          })
          window.history.replaceState({}, '', '/creations')
          window.location.href = '/creations'
        }
      }
      doAction()
    }
  }, [])
```

This uses raw fetch because the page doesn't have tRPC utils set up for mutations. The tRPC fetch handler on the server handles the cookie-based session.

- [ ] **Step 2: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/client/pages/composition-page.tsx
git commit -m "feat: handle invitation deep links in composition page"
```

---

### Task 10: Run full test suite and verify

- [ ] **Step 1: Run all unit tests**

Run: `bun test src/`
Expected: All tests pass

- [ ] **Step 2: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run lint**

Run: `bunx biome check --write .`

- [ ] **Step 4: Start dev server and manually verify**

Run: `bun --hot src/index.ts`

Verify:
1. Click "Sign in" → enter email → check console for OTP → enter OTP → signed in
2. As unauthenticated user → click "Save" → auth prompt → sign in → save dialog opens
3. As owner → click "Collaborators" → invite by email → invitation appears with "pending" status
4. Sign in as invitee → /creations → see invitation banner → accept → redirected to composition

- [ ] **Step 5: Final commit if any lint fixes**

```bash
git add -A
git commit -m "chore: lint fixes after auth + collaboration changes"
```
