import { expect, test } from '@playwright/test'

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
