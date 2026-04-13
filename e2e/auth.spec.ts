import { expect, test } from '@playwright/test'
import { cookieValue, fetchOtp, signUpViaOtp, uniqueEmail } from './helpers'

test.describe('auth flow (OTP)', () => {
  const testEmail = uniqueEmail()

  test('can send OTP', async ({ request }) => {
    const res = await request.post(
      '/api/auth/email-otp/send-verification-otp',
      {
        data: { email: testEmail, type: 'sign-in' },
      },
    )
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data.success).toBe(true)

    const otp = await fetchOtp(request, testEmail)
    expect(otp).toHaveLength(6)
  })

  test('can sign in with OTP', async ({ request }) => {
    const otp = await fetchOtp(request, testEmail)
    const res = await request.post('/api/auth/sign-in/email-otp', {
      data: { email: testEmail, otp },
    })
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data.user.email).toBe(testEmail)
    expect(data.token).toBeDefined()
  })

  test('rejects wrong OTP', async ({ request }) => {
    await request.post('/api/auth/email-otp/send-verification-otp', {
      data: { email: uniqueEmail(), type: 'sign-in' },
    })
    const res = await request.post('/api/auth/sign-in/email-otp', {
      data: { email: uniqueEmail(), otp: '000000' },
    })
    expect(res.ok()).toBeFalsy()
  })

  test('sign in UI flow shows code form after email', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await page.getByLabel('Email').fill(uniqueEmail())
    await page.getByRole('button', { name: 'Send code' }).click()
    await expect(
      page.getByRole('heading', { name: 'Enter code' }),
    ).toBeVisible()
    await expect(page.getByLabel('Verification code')).toBeVisible()
  })

  test('sign out clears session', async ({ page, request }) => {
    const email = uniqueEmail()
    const { signedCookie } = await signUpViaOtp(request, email)

    await page.context().addCookies([
      {
        name: 'better-auth.session_token',
        value: cookieValue(signedCookie),
        domain: 'localhost',
        path: '/',
      },
    ])
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible({
      timeout: 10000,
    })
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })
})
