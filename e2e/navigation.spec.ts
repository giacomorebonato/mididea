import { expect, test } from '@playwright/test'

test.describe('navigation', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Mino Starter')).toBeVisible()
  })

  test('can navigate to users page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Users')
    await expect(page).toHaveURL('/users')
    await expect(page.locator('h1')).toContainText('Users')
  })

  test('can navigate to about page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=About')
    await expect(page).toHaveURL('/about')
    await expect(page.locator('h1')).toContainText('About')
    await expect(page.locator('text=Tech Stack')).toBeVisible()
  })

  test('can navigate back to home', async ({ page }) => {
    await page.goto('/about')
    await page.click('text=Home')
    await expect(page).toHaveURL('/')
  })
})
