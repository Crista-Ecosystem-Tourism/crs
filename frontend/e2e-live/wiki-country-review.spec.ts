import { expect, test } from '@playwright/test'

test('signed-in author sends a country Wiki version to server review', async ({ page }) => {
  test.setTimeout(120_000)
  const email = `wiki-e2e-${Date.now()}@example.test`
  await page.goto('/signup')
  await page.locator('#name').fill('Wiki E2E')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill('WikiE2e123')
  await page.getByRole('button', { name: 'Создать аккаунт' }).click()

  await page.getByRole('button', { name: 'Crista Wiki' }).click()
  await page.getByRole('button', { name: 'Открыть статью Россия' }).click()
  await page.getByRole('button', { name: 'Редактировать или добавить информацию' }).click()
  await page.getByLabel('Название источника').fill('Тестовый редакционный источник')
  await page.getByLabel('Ссылка на источник').fill('https://example.test/wiki-source')
  await page.getByLabel('Лицензия').fill('CC BY 4.0')
  await page.getByRole('button', { name: 'Отправить на review' }).click()

  await expect(page.getByText('Правка отправлена в серверную очередь review.')).toBeVisible()
})
