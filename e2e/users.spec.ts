import { expect, test } from '@playwright/test'

test.describe('users page', () => {
  test('displays seeded users', async ({ page }) => {
    await page.goto('/users')

    // Wait for tRPC data to load
    await expect(page.getByText('Alice', { exact: true })).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText('Bob', { exact: true })).toBeVisible()
  })

  test('shows user emails', async ({ page }) => {
    await page.goto('/users')
    await expect(page.locator('text=alice@example.com')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('text=bob@example.com')).toBeVisible()
  })

  test('shows published posts for users', async ({ page }) => {
    await page.goto('/users')
    await expect(page.locator('text=Getting Started with Bun')).toBeVisible({
      timeout: 10000,
    })
  })
})
