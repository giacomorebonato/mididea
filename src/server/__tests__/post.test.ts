import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { appRouter } from '../routers/_app'
import { createTestDb } from './setup'

const { prisma, cleanup } = createTestDb('test-post')

function createCaller() {
  return appRouter.createCaller({ prisma, session: null })
}

let userId: string

beforeAll(async () => {
  const user = await prisma.user.create({
    data: { email: 'author@example.com', name: 'Author' },
  })
  userId = user.id
})

afterAll(cleanup)

describe('post router', () => {
  test('list returns empty initially', async () => {
    const caller = createCaller()
    const posts = await caller.post.list()
    expect(posts).toEqual([])
  })

  test('create adds a post (unpublished by default)', async () => {
    const caller = createCaller()
    const post = await caller.post.create({
      title: 'Test Post',
      content: 'Hello world',
      authorId: userId,
    })
    expect(post.title).toBe('Test Post')
    expect(post.published).toBe(false)
  })

  test('list does not return unpublished posts', async () => {
    const caller = createCaller()
    const posts = await caller.post.list()
    expect(posts).toEqual([])
  })

  test('publish makes a post visible', async () => {
    const caller = createCaller()

    const user = await caller.user.byId({ id: userId })
    const postId = user.posts[0]!.id

    const published = await caller.post.publish({ id: postId })
    expect(published.published).toBe(true)

    const posts = await caller.post.list()
    expect(posts.length).toBe(1)
    expect(posts[0]!.title).toBe('Test Post')
    expect(posts[0]!.author.name).toBe('Author')
  })

  test('create rejects empty title', async () => {
    const caller = createCaller()
    expect(
      caller.post.create({ title: '', authorId: userId }),
    ).rejects.toThrow()
  })
})
