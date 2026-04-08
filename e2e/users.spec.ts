import { expect, test } from '@playwright/test'

test.describe('creations page', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto('/creations')
    await expect(page).toHaveURL('/creations')
  })

  test('shows sign in button when not authenticated', async ({ page }) => {
    await page.goto('/creations')
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })
})
