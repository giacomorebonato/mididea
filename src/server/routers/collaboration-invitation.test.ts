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

const mockSession = {
  user: { id: 'user-1', email: 'user1@example.com' },
  session: { id: 's1' },
}
const mockSession2 = {
  user: { id: 'user-2', email: 'user2@example.com' },
  session: { id: 's2' },
}

describe('collaborationRouter.invite', () => {
  test('creates invitation when valid', async () => {
    const invitation = {
      id: 'inv-1',
      compositionId: 'comp-1',
      inviterId: 'user-1',
      inviteeEmail: 'user2@example.com',
      token: 'sometoken',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
    const c = caller({
      prisma: {
        composition: {
          findUnique: async () => ({
            id: 'comp-1',
            authorId: 'user-1',
          }),
        },
        user: {
          findUnique: async () => ({
            id: 'user-2',
            email: 'user2@example.com',
          }),
        },
        collaborator: {
          findUnique: async () => null,
        },
        invitation: {
          findFirst: async () => null,
          create: async () => invitation,
        },
      },
      session: mockSession,
    })
    const result = await c.invite({
      compositionId: 'comp-1',
      email: 'user2@example.com',
    })
    expect(result.status).toBe('pending')
    expect(result.inviteeEmail).toBe('user2@example.com')
  })

  test('rejects if user already has pending invitation', async () => {
    const c = caller({
      prisma: {
        composition: {
          findUnique: async () => ({
            id: 'comp-1',
            authorId: 'user-1',
          }),
        },
        user: {
          findUnique: async () => ({
            id: 'user-2',
            email: 'user2@example.com',
          }),
        },
        collaborator: {
          findUnique: async () => null,
        },
        invitation: {
          findFirst: async () => ({
            id: 'inv-existing',
            status: 'pending',
          }),
        },
      },
      session: mockSession,
    })
    try {
      await c.invite({
        compositionId: 'comp-1',
        email: 'user2@example.com',
      })
      expect.unreachable('Should have thrown')
    } catch (e: unknown) {
      expect((e as { code?: string }).code).toBe('CONFLICT')
    }
  })
})

describe('collaborationRouter.acceptInvitation', () => {
  test('accepts valid invitation', async () => {
    const invitation = {
      id: 'inv-1',
      compositionId: 'comp-1',
      inviterId: 'user-1',
      inviteeEmail: 'user2@example.com',
      token: 'valid-token',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
    const c = caller({
      prisma: {
        invitation: {
          findUnique: async () => invitation,
          update: async () => ({ ...invitation, status: 'accepted' }),
        },
        collaborator: {
          create: async () => ({
            compositionId: 'comp-1',
            userId: 'user-2',
          }),
        },
        $transaction: async (ops: Promise<unknown>[]) => {
          for (const op of ops) await op
        },
      },
      session: mockSession2,
    })
    const result = await c.acceptInvitation({ token: 'valid-token' })
    expect(result.ok).toBe(true)
    expect(result.compositionId).toBe('comp-1')
  })

  test('rejects expired invitation', async () => {
    const invitation = {
      id: 'inv-expired',
      compositionId: 'comp-1',
      inviterId: 'user-1',
      inviteeEmail: 'user2@example.com',
      token: 'expired-token',
      status: 'pending',
      expiresAt: new Date(Date.now() - 1000),
    }
    const c = caller({
      prisma: {
        invitation: {
          findUnique: async () => invitation,
          update: async () => ({ ...invitation, status: 'expired' }),
        },
      },
      session: mockSession2,
    })
    try {
      await c.acceptInvitation({ token: 'expired-token' })
      expect.unreachable('Should have thrown')
    } catch (e: unknown) {
      expect((e as { code?: string }).code).toBe('BAD_REQUEST')
    }
  })

  test('rejects if invitation is for different user', async () => {
    const invitation = {
      id: 'inv-1',
      compositionId: 'comp-1',
      inviterId: 'user-1',
      inviteeEmail: 'other@example.com',
      token: 'valid-token',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
    const c = caller({
      prisma: {
        invitation: {
          findUnique: async () => invitation,
        },
      },
      session: mockSession2,
    })
    try {
      await c.acceptInvitation({ token: 'valid-token' })
      expect.unreachable('Should have thrown')
    } catch (e: unknown) {
      expect((e as { code?: string }).code).toBe('FORBIDDEN')
    }
  })
})

describe('collaborationRouter.declineInvitation', () => {
  test('declines valid invitation', async () => {
    const invitation = {
      id: 'inv-1',
      compositionId: 'comp-1',
      inviterId: 'user-1',
      inviteeEmail: 'user2@example.com',
      token: 'valid-token',
      status: 'pending',
    }
    const c = caller({
      prisma: {
        invitation: {
          findUnique: async () => invitation,
          update: async () => ({ ...invitation, status: 'declined' }),
        },
      },
      session: mockSession2,
    })
    const result = await c.declineInvitation({ token: 'valid-token' })
    expect(result.ok).toBe(true)
  })

  test('rejects if invitation not pending', async () => {
    const c = caller({
      prisma: {
        invitation: {
          findUnique: async () => null,
        },
      },
      session: mockSession2,
    })
    try {
      await c.declineInvitation({ token: 'nonexistent' })
      expect.unreachable('Should have thrown')
    } catch (e: unknown) {
      expect((e as { code?: string }).code).toBe('NOT_FOUND')
    }
  })
})

describe('collaborationRouter.pendingInvitations', () => {
  test('returns invitations for current user email', async () => {
    const invitations = [
      {
        id: 'inv-1',
        inviteeEmail: 'user2@example.com',
        status: 'pending',
        composition: { id: 'comp-1', title: 'Song' },
        inviter: { id: 'user-1', name: 'User One' },
      },
    ]
    const c = caller({
      prisma: {
        invitation: {
          findMany: async () => invitations,
        },
      },
      session: mockSession2,
    })
    const result = await c.pendingInvitations()
    expect(result).toHaveLength(1)
    expect(result[0]!.inviteeEmail).toBe('user2@example.com')
  })
})

describe('collaborationRouter.sentInvitations', () => {
  test('returns sent invitations for composition owned by user', async () => {
    const invitations = [
      {
        id: 'inv-1',
        compositionId: 'comp-1',
        inviter: { id: 'user-1', name: 'User One', email: 'user1@example.com' },
      },
    ]
    const c = caller({
      prisma: {
        composition: {
          findUnique: async () => ({
            id: 'comp-1',
            authorId: 'user-1',
          }),
        },
        invitation: {
          findMany: async () => invitations,
        },
      },
      session: mockSession,
    })
    const result = await c.sentInvitations({ compositionId: 'comp-1' })
    expect(result).toHaveLength(1)
  })

  test('rejects if user does not own composition', async () => {
    const c = caller({
      prisma: {
        composition: {
          findUnique: async () => ({
            id: 'comp-1',
            authorId: 'user-999',
          }),
        },
      },
      session: mockSession,
    })
    try {
      await c.sentInvitations({ compositionId: 'comp-1' })
      expect.unreachable('Should have thrown')
    } catch (e: unknown) {
      expect((e as { code?: string }).code).toBe('NOT_FOUND')
    }
  })
})
