import { expect, test } from '@playwright/test'

test('country article shows its published version and source links', async ({ page }) => {
  await page.route('**/wiki/articles/**', async (route) => {
    const slug = new URL(route.request().url()).pathname.split('/').at(-1)
    if (slug !== 'country-jp') {
      await route.fulfill({ status: 404, json: { detail: 'Published article not found' } })
      return
    }

    await route.fulfill({
      status: 200,
      json: {
        version_id: 'wiki-country-jp-v1',
        slug: 'country-jp',
        title: 'Япония',
        body: {
          summary: 'Серверная версия статьи о Японии.',
          history: 'История статьи.',
          cuisine: 'Кухня статьи.',
          traditions: 'Традиции статьи.',
          practical: [{ label: 'Валюта', value: 'Японская иена (JPY, ¥)' }],
        },
        sources: [{ label: 'Официальный источник', url: 'https://example.test/japan' }],
        license: 'CC BY 4.0',
        published_at: '2026-09-24T00:00:00Z',
      },
    })
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'Crista Wiki' }).click()
  await page.getByRole('button', { name: 'Показать Япония' }).click()
  await page.getByRole('button', { name: 'Открыть статью Япония' }).click()

  await expect(page.getByText('Серверная версия статьи о Японии.')).toBeVisible()
  await expect(page.getByText(/версия wiki-country-jp-v1/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Официальный источник' })).toHaveAttribute('href', 'https://example.test/japan')
})

test('country article reports a missing publication separately from an API outage', async ({ page }) => {
  await page.route('**/wiki/articles/**', async (route) => {
    await route.fulfill({ status: 404, json: { detail: 'Published article not found' } })
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'Crista Wiki' }).click()
  await page.getByRole('button', { name: 'Показать Грузия' }).click()
  await page.getByRole('button', { name: 'Открыть статью Грузия' }).click()

  await expect(page.getByText(/Для этой страны ещё нет опубликованной серверной версии/)).toBeVisible()
  await expect(page.getByText(/Серверная Wiki недоступна/)).toHaveCount(0)
})
