import { expect, test } from '@playwright/test'

test('new player completes the live Moscow path and city boss', async ({ page }) => {
  test.setTimeout(120_000)
  const email = `moscow-e2e-${Date.now()}@example.test`
  await page.goto('/signup')
  await page.locator('#name').fill('Moscow E2E')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill('MoscowE2e123')
  await page.getByRole('button', { name: 'Создать аккаунт' }).click()

  await page.getByRole('button', { name: 'Изучение мира' }).click()

  await expect(page.getByRole('heading', { name: 'Первое путешествие' })).toBeVisible()
  await expect(page.getByText('Китай-город и Зарядье')).toBeVisible()
  await expect(page.getByText('ВДНХ', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Выбрать Россию' }).click()
  await page.getByRole('button', { name: 'Узнать историю места' }).click()
  await page.getByRole('button', { name: 'Пройти мини-квест' }).click()
  await page.getByRole('button', { name: 'Цвет' }).click()
  await expect(page.getByText('Почти! Одна энергия потрачена — попробуй ещё раз.')).toBeVisible()
  await page.getByRole('button', { name: 'Красивый' }).click()
  await expect(page.getByText('Верно! +50 XP')).toBeVisible()

  await page.getByRole('button', { name: /Спасская башня/ }).click()
  await expect(page.getByRole('heading', { name: 'Спасская башня' })).toBeVisible()
  await page.getByRole('button', { name: '1491' }).click()
  await expect(page.getByRole('button', { name: /Спасская башня.*Пройдено/ })).toBeVisible()

  await page.getByRole('button', { name: /Царь-колокол/ }).click()
  await expect(page.getByRole('heading', { name: 'Царь-колокол' })).toBeVisible()
  await page.getByRole('button', { name: '1735' }).click()
  await expect(page.getByRole('button', { name: /Царь-колокол.*Пройдено/ })).toBeVisible()

  const remainingQuests = [
    ['Благовещенский собор', '1489'],
    ['ГУМ', '1893'],
    ['Парк «Зарядье»', '2017'],
    ['Третьяковская галерея', '1856'],
    ['Большой театр', '1825'],
    ['Московское метро', '1935'],
    ['ВДНХ', '1939'],
  ]
  for (const [title, answer] of remainingQuests) {
    await page.getByRole('button', { name: new RegExp(title) }).click()
    await expect(page.getByRole('heading', { name: title })).toBeVisible()
    await page.getByRole('button', { name: answer, exact: true }).click()
    await expect(page.getByRole('button', { name: new RegExp(`${title}.*Пройдено`) })).toBeVisible()
  }

  await page.getByRole('button', { name: /Финальный круг Москвы.*3 вопроса/ }).click()
  await expect(page.getByRole('heading', { name: 'Финальный круг Москвы' })).toBeVisible()
  await page.locator('section').filter({ hasText: 'В каком году освятили Благовещенский собор?' })
    .getByRole('button', { name: '1489', exact: true }).click()
  await page.locator('section').filter({ hasText: 'В каком году открылись Верхние торговые ряды' })
    .getByRole('button', { name: '1893', exact: true }).click()
  await page.locator('section').filter({ hasText: 'В каком году открылась первая выставка на территории ВДНХ?' })
    .getByRole('button', { name: '1939', exact: true }).click()
  await page.getByRole('button', { name: 'Проверить три ответа' }).click()
  await expect(page.getByText('Городской штамп получен. Москва открыта для свободного исследования.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Песочница Москвы' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Сцена: Красная площадь' })).toBeVisible()
  await expect(page.getByText('Crista Wiki · версия фактов wiki-moscow-v1')).toBeVisible()
  await page.getByRole('button', { name: 'Правда →' }).click()
  await expect(page.getByText('Верно. Верно: ландшафтный парк у стен Кремля открылся в 2017 году.')).toBeVisible()
  await page.getByLabel('Год для Благовещенский собор').selectOption('year-1489')
  await page.getByLabel('Год для Верхние торговые ряды').selectOption('year-1893')
  await page.getByLabel('Год для Первая выставка ВДНХ').selectOption('year-1939')
  await page.getByRole('button', { name: 'Проверить пары' }).click()
  await expect(page.getByText('Все пары собраны.')).toBeVisible()
  await page.getByRole('button', { name: 'Поднять Открылись Верхние торговые ряды' }).click()
  await page.getByRole('button', { name: 'Проверить хронологию' }).click()
  await expect(page.getByText('Хронология собрана.')).toBeVisible()
  await page.getByRole('button', { name: 'Поднять слово Москва' }).click()
  await page.getByRole('button', { name: 'Поднять слово Москва' }).click()
  await page.getByRole('button', { name: 'Поднять слово —' }).click()
  await page.getByRole('button', { name: 'Поднять слово —' }).click()
  await page.getByRole('button', { name: 'Проверить фразу' }).click()
  await expect(page.getByText('Фраза собрана.')).toBeVisible()
  await page.getByLabel('Ваша ставка').fill('50')
  await page.getByRole('button', { name: 'Проверить цену' }).click()
  await expect(page.getByText('Близко к ответу.')).toBeVisible()
  await page.getByRole('button', { name: 'Отметить область 1 на фотографии' }).click()
  await expect(page.getByText('Точно!')).toBeVisible()
  await page.getByRole('button', { name: 'Восстановить +1' }).click()
  await expect(page.getByText('+1 энергия за повторение.')).toBeVisible()
})
