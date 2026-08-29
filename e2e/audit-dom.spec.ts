import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:4173'

const PAGES = ['/', '/es', '/en', '/docs', '/es/docs', '/en/docs', '/login', '/register']

for (const path of PAGES) {
  test(`sem violações axe em ${path}`, async ({ page }) => {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
}
