import { afterAll, describe, expect, test } from 'bun:test'
import { createTestDb } from '../test-setup'
import { appRouter } from './_app'

const { prisma, cleanup } = createTestDb('test-user')

function createCaller() {
  return appRouter.createCaller({ prisma, session: null })
}

afterAll(cleanup)

describe('user router', () => {
  test('list returns empty initially', async () => {
    const caller = createCaller()
    const users = await caller.user.list()
    expect(users).toEqual([])
  })

  test('create adds a user', async () => {
    const caller = createCaller()
    const user = await caller.user.create({
      email: 'test@example.com',
      name: 'Test User',
    })
    expect(user.email).toBe('test@example.com')
    expect(user.name).toBe('Test User')
    expect(user.id).toBeDefined()
  })

  test('list returns created users', async () => {
    const caller = createCaller()
    const users = await caller.user.list()
    expect(users.length).toBeGreaterThanOrEqual(1)
    expect(users[0]?.email).toBe('test@example.com')
  })

  test('byId returns the user', async () => {
    const caller = createCaller()
    const users = await caller.user.list()
    const user = await caller.user.byId({ id: users[0]!.id })
    expect(user.email).toBe('test@example.com')
  })

  test('create rejects invalid email', async () => {
    const caller = createCaller()
    expect(caller.user.create({ email: 'not-an-email' })).rejects.toThrow()
  })

  test('create rejects duplicate email', async () => {
    const caller = createCaller()
    expect(caller.user.create({ email: 'test@example.com' })).rejects.toThrow()
  })
})
