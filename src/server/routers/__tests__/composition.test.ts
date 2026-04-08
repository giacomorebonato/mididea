import { describe, expect, test } from 'bun:test'
import { compositionRouter } from '../composition'

const C = compositionRouter as unknown as {
  createCaller: (ctx: unknown) => unknown
}

function caller(ctx: unknown) {
  return C.createCaller(ctx) as ReturnType<
    typeof compositionRouter.createCaller
  >
}

const mockSession = { user: { id: 'user-1' }, session: { id: 's1' } }

describe('compositionRouter.list', () => {
  test('returns items with no cursor', async () => {
    const items: any[] = [{ id: '1', title: 'Comp 1' }]
    const c = caller({
      prisma: { composition: { findMany: async () => items as any } },
      session: null,
    })
    const result = await c.list({})
    expect(result.items).toEqual(items)
    expect(result.nextCursor).toBeUndefined()
  })

  test('returns nextCursor when more items exist', async () => {
    const items: any[] = Array.from({ length: 4 }, (_, i) => ({
      id: String(i + 1),
    }))
    const c = caller({
      prisma: { composition: { findMany: async () => items as any } },
      session: null,
    })
    const result = await c.list({ limit: 3 })
    expect(result.items).toHaveLength(3)
    expect(result.nextCursor).toBe('4')
  })
})

describe('compositionRouter.byId', () => {
  test('returns composition by id', async () => {
    const c = caller({
      prisma: {
        composition: {
          findUnique: async () => ({ id: 'c1', title: 'Song' }) as any,
        },
      },
      session: null,
    })
    const result = await c.byId({ id: 'c1' })
    expect(result?.id).toBe('c1')
  })

  test('returns null when not found', async () => {
    const c = caller({
      prisma: { composition: { findUnique: async () => null } },
      session: null,
    })
    expect(await c.byId({ id: 'nope' })).toBeNull()
  })
})

describe('compositionRouter.mine', () => {
  test('returns current user compositions', async () => {
    const comps: any[] = [{ id: 'c1', authorId: 'user-1' }]
    const c = caller({
      prisma: { composition: { findMany: async () => comps } },
      session: mockSession,
    })
    const result = await c.mine()
    expect(result).toHaveLength(1)
  })
})

describe('compositionRouter.create', () => {
  test('creates under the limit', async () => {
    const created: any = { id: 'new', title: 'New' }
    const c = caller({
      prisma: {
        composition: { count: async () => 2, create: async () => created },
      },
      session: mockSession,
    })
    expect((await c.create({ title: 'New', data: '{}' })).id).toBe('new')
  })

  test('rejects at max limit', async () => {
    const c = caller({
      prisma: { composition: { count: async () => 5 } },
      session: mockSession,
    })
    try {
      await c.create({ title: 'Overflow', data: '{}' })
      expect.unreachable('Should have thrown')
    } catch (e: unknown) {
      expect((e as { message?: string }).message).toContain('up to 5')
    }
  })
})

describe('compositionRouter.update', () => {
  test('updates own composition', async () => {
    const c = caller({
      prisma: {
        composition: {
          findUnique: async () => ({ id: 'c1', authorId: 'user-1' }) as any,
          update: async () => ({ id: 'c1', title: 'Updated' }) as any,
        },
      },
      session: mockSession,
    })
    expect((await c.update({ id: 'c1', title: 'Updated' })).id).toBe('c1')
  })

  test('rejects update of another users composition', async () => {
    const c = caller({
      prisma: {
        composition: {
          findUnique: async () => ({ id: 'c1', authorId: 'user-2' }) as any,
        },
      },
      session: mockSession,
    })
    try {
      await c.update({ id: 'c1', title: 'Hacked' })
      expect.unreachable('Should have thrown')
    } catch (e: unknown) {
      expect((e as { code?: string }).code).toBe('NOT_FOUND')
    }
  })
})

describe('compositionRouter.delete', () => {
  test('deletes own composition', async () => {
    const c = caller({
      prisma: {
        composition: {
          findUnique: async () => ({ id: 'c1', authorId: 'user-1' }) as any,
          delete: async () => ({ id: 'c1' }) as any,
        },
      },
      session: mockSession,
    })
    expect((await c.delete({ id: 'c1' })).id).toBe('c1')
  })

  test('rejects delete of another users composition', async () => {
    const c = caller({
      prisma: {
        composition: {
          findUnique: async () => ({ id: 'c1', authorId: 'user-2' }),
        },
      },
      session: mockSession,
    })
    try {
      await c.delete({ id: 'c1' })
      expect.unreachable('Should have thrown')
    } catch (e: unknown) {
      expect((e as { code?: string }).code).toBe('NOT_FOUND')
    }
  })
})

describe('compositionRouter.toggleLike', () => {
  test('adds a like when none exists', async () => {
    const c = caller({
      prisma: {
        like: {
          findUnique: async () => null,
          create: async () => ({ id: 'l1' }),
        },
        composition: { update: async () => ({ likeCount: 1 }) },
        $transaction: async (ops: Promise<unknown>[]) => {
          for (const op of ops) await op
        },
      },
      session: mockSession,
    })
    expect((await c.toggleLike({ compositionId: 'c1' })).liked).toBe(true)
  })

  test('removes a like when one exists', async () => {
    const c = caller({
      prisma: {
        like: {
          findUnique: async () => ({ id: 'l1' }) as any,
          delete: async () => ({ id: 'l1' }) as any,
        },
        composition: { update: async () => ({ likeCount: 0 }) },
        $transaction: async (ops: Promise<unknown>[]) => {
          for (const op of ops) await op
        },
      },
      session: mockSession,
    })
    expect((await c.toggleLike({ compositionId: 'c1' })).liked).toBe(false)
  })
})

describe('compositionRouter.myLikes', () => {
  test('returns liked composition IDs', async () => {
    const c = caller({
      prisma: {
        like: {
          findMany: async () => [
            { compositionId: 'c1' },
            { compositionId: 'c3' },
          ],
        },
      },
      session: mockSession,
    })
    expect(await c.myLikes({ compositionIds: ['c1', 'c2', 'c3'] })).toEqual([
      'c1',
      'c3',
    ])
  })
})
