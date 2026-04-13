import { expect, test } from '@playwright/test'
import {
  cookieValue,
  createComposition,
  signUpViaOtp,
  uniqueEmail,
} from './helpers'

test.describe('save composition', () => {
  test('guest sees Save button without count', async ({ page }) => {
    await page.goto('/')
    const btn = page.getByRole('button', { name: /^Save/ })
    await expect(btn).toBeVisible()
    await expect(btn).toHaveText('Save')
  })

  test('guest save prompts sign in', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Sign in to save')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
  })

  test('authenticated save shows dialog with title input', async ({
    page,
    request,
  }) => {
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
    const btn = page.getByRole('button', { name: /^Save/ })
    await expect(btn).toBeVisible({ timeout: 10000 })
    await expect(btn).toHaveText(/Save \(\d\/5\)/)
    await btn.click()
    await expect(page.getByText('Save Composition')).toBeVisible()
    await expect(page.getByLabel('Title')).toBeVisible()
  })

  test('shows limit message at 5 compositions', async ({ page, request }) => {
    const email = uniqueEmail()
    const { signedCookie } = await signUpViaOtp(request, email)

    for (let i = 0; i < 5; i++) {
      await createComposition(request, `Comp ${i}`, signedCookie)
    }

    await page.context().addCookies([
      {
        name: 'better-auth.session_token',
        value: cookieValue(signedCookie),
        domain: 'localhost',
        path: '/',
      },
    ])
    await page.goto('/')
    await page.getByRole('button', { name: /Save/ }).click()
    await expect(
      page.getByText(/reached the limit of 5 compositions/),
    ).toBeVisible()
  })
})
