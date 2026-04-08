import { expect, test } from '@playwright/test'

test.describe('navigation', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Mididea')).toBeVisible()
  })

  test('can navigate to creations page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Creations' }).click()
    await expect(page).toHaveURL('/creations')
  })

  test('can navigate back to sequencer from creations', async ({ page }) => {
    await page.goto('/creations')
    await page.getByRole('link', { name: 'Mididea' }).click()
    await expect(page).toHaveURL('/')
  })
})
