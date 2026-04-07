import { expect, test } from '@playwright/test'

test.describe('API endpoints', () => {
  test('health check returns ok', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.ok()).toBeTruthy()
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  test('tRPC user.list returns users', async ({ request }) => {
    const res = await request.get('/api/trpc/user.list')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data.result.data.json).toBeInstanceOf(Array)
  })

  test('auth endpoint is accessible', async ({ request }) => {
    const res = await request.get('/api/auth/ok')
    expect(res.ok()).toBeTruthy()
  })
})
