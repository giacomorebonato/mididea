import { describe, expect, test } from 'bun:test'
import { postRouter } from '../post'

function caller(ctx: unknown) {
  return (
    postRouter as unknown as { createCaller: (c: unknown) => unknown }
  ).createCaller(ctx) as ReturnType<typeof postRouter.createCaller>
}

describe('postRouter', () => {
  test('list returns published posts with authors', async () => {
    const posts: any[] = [
      {
        id: 'p1',
        title: 'Hello',
        published: true,
        author: { id: 'u1', name: 'Alice' },
      },
    ]
    const c = caller({
      prisma: { post: { findMany: async () => posts as any } },
      session: null,
    })
    const result = await c.list()
    expect(result).toEqual(posts)
  })

  test('create a new post', async () => {
    const created: any = { id: 'p2', title: 'New Post', content: 'Hello world' }
    const c = caller({
      prisma: { post: { create: async () => created } as any },
      session: null,
    })
    const result = await c.create({
      title: 'New Post',
      content: 'Hello world',
      authorId: 'u1',
    })
    expect(result.id).toBe('p2')
  })

  test('publish a post', async () => {
    const updated = { id: 'p1', published: true }
    const c = caller({
      prisma: { post: { update: async () => updated } },
      session: null,
    })
    const result = await c.publish({ id: 'p1' })
    expect(result.published).toBe(true)
  })
})
