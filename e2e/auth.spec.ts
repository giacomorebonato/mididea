import { expect, test } from '@playwright/test'

test.describe('auth flow', () => {
  const testEmail = `e2e-${Date.now()}@test.com`

  test('can sign up via API', async ({ request }) => {
    const res = await request.post('/api/auth/sign-up/email', {
      data: {
        email: testEmail,
        password: 'password123456',
        name: 'E2E Test User',
      },
    })
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data.user.email).toBe(testEmail)
    expect(data.token).toBeDefined()
  })

  test('can sign in via API', async ({ request }) => {
    const res = await request.post('/api/auth/sign-in/email', {
      data: {
        email: testEmail,
        password: 'password123456',
      },
    })
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data.user.email).toBe(testEmail)
  })

  test('rejects wrong password', async ({ request }) => {
    const res = await request.post('/api/auth/sign-in/email', {
      data: {
        email: testEmail,
        password: 'wrong-password',
      },
    })
    // better-auth returns 200 with error in body, or 401
    const data = await res.json()
    // Should not contain a valid token/session
    expect(data.user?.email).not.toBe(testEmail)
  })
})
