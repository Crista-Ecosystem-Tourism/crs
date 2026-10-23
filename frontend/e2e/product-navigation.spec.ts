import { expect, test } from '@playwright/test'

// Keep the smoke suite hermetic: a slow third-party font host must not hold up page load.
test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort())
})

test('desktop rail opens all four product sections', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Изучение мира' }).click()
  await expect(page.getByRole('heading', { name: 'Охват мира' })).toBeVisible()

  await page.getByRole('button', { name: 'Crista Wiki' }).click()
  await expect(page.getByRole('heading', { name: 'Crista Wiki' })).toBeVisible()

  await page.getByRole('button', { name: 'AI-маршруты' }).click()
  await expect(page.getByRole('heading', { name: 'Чаты' })).toBeVisible()

  await page.getByRole('button', { name: 'Паспорт' }).click()
  await expect(page.getByText('Не удалось загрузить чемодан')).toBeVisible()
})

test('mobile uses a four-tab bottom bar instead of a sliding menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const tabs = page.getByRole('navigation', { name: 'Основные разделы' })
  await expect(tabs.getByRole('button')).toHaveCount(4)
  await expect(page.getByRole('button', { name: 'Открыть меню' })).toHaveCount(0)

  await tabs.getByRole('button', { name: 'Crista Wiki' }).click()
  await expect(page.getByRole('heading', { name: 'Crista Wiki' })).toBeVisible()
  await expect(tabs.getByRole('button', { name: 'Crista Wiki' })).toHaveAttribute('aria-current', 'page')

  await tabs.getByRole('button', { name: 'Паспорт' }).click()
  // Settings moved from the sliding menu to the bottom of the Passport tab.
  await expect(page.getByRole('button', { name: 'Переключить на английский' })).toBeVisible()
})
