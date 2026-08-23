import { expect, test } from '@playwright/test'

test('homepage exposes the factual sandbox flow without horizontal overflow', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Pix no Brasil. Liquidação na sua carteira.' })).toBeVisible()
  await expect(page.getByText(/mockusdt não é usdt/i)).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
  expect(errors).toEqual([])
})

test('localized navigation preserves language', async ({ page }) => {
  await page.goto('/es')
  const menuButton = page.getByRole('button', { name: 'Abrir menú' })
  if (await menuButton.isVisible()) {
    await menuButton.click()
    await page.getByRole('dialog').getByRole('navigation').getByRole('link', { name: 'Seguridad' }).click()
  } else {
    await page.getByRole('navigation').getByRole('link', { name: 'Seguridad' }).click()
  }
  await expect(page).toHaveURL(/\/es\/security$/)
})
