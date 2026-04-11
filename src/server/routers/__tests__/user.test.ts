import { describe, expect, test } from 'bun:test'
import { userRouter } from '../user'

function caller(ctx: unknown) {
  return (
    userRouter as unknown as { createCaller: (c: unknown) => unknown }
  ).createCaller(ctx) as ReturnType<typeof userRouter.createCaller>
}

describe('userRouter', () => {
  test('list returns users', async () => {
    const users: any[] = [{ id: 'u1', name: 'Alice' }]
    const c = caller({
      prisma: { user: { findMany: async () => users as any } },
      session: null,
    })
    const result = await c.list()
    expect(result).toEqual(users)
  })

  test('byId returns user', async () => {
    const user: any = { id: 'u1', name: 'Alice' }
    const c = caller({
      prisma: { user: { findUniqueOrThrow: async () => user as any } },
      session: null,
    })
    const result = await c.byId({ id: 'u1' })
    expect(result.id).toBe('u1')
  })

  test('byId throws when not found', async () => {
    const c = caller({
      prisma: {
        user: {
          findUniqueOrThrow: async () => {
            throw new Error('Not found')
          },
        },
      },
      session: null,
    })
    expect(c.byId({ id: 'nope' })).rejects.toThrow()
  })

  test('create a new user', async () => {
    const created: any = { id: 'u2', email: 'new@test.com', name: 'New User' }
    const c = caller({
      prisma: { user: { create: async () => created } as any },
      session: null,
    })
    const result = await c.create({ email: 'new@test.com', name: 'New User' })
    expect(result.id).toBe('u2')
  })
})
