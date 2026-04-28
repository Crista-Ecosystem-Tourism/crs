/** Курсы для отображения «всего в ₽» в чемодане (публичный API, как в мобильном приложении). */

export const SUITCASE_POPULAR_CURRENCIES = [
  { code: 'RUB', symbol: '₽' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
] as const

export function getCurrencySymbol(code: string): string {
  return SUITCASE_POPULAR_CURRENCIES.find((c) => c.code === code)?.symbol ?? code
}

export async function fetchExchangeRatesToRub(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/RUB')
    const data = (await response.json()) as { rates: Record<string, number> }
    return { RUB: 1, ...data.rates }
  } catch {
    return {
      RUB: 1,
      USD: 0.011,
      EUR: 0.01,
      GBP: 0.0085,
    }
  }
}

/** amount в валюте `currencyCode`, вернуть эквивалент в RUB */
export function convertToRub(
  amount: number,
  currencyCode: string,
  ratesRubBase: Record<string, number>
): number {
  if (!Number.isFinite(amount)) return 0
  const code = currencyCode || 'RUB'
  if (code === 'RUB') return amount
  const rate = ratesRubBase[code]
  if (!rate || rate === 0) return amount
  return amount / rate
}
