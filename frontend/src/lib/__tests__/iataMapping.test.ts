import { describe, it, expect } from 'vitest'
import { getIATACode, hasIATACode, getPopularOriginCities } from '../iataMapping'

describe('getIATACode', () => {
  it('returns IATA for exact city name', () => {
    expect(getIATACode('Сочи')).toBe('AER')
    expect(getIATACode('Москва')).toBe('SVO')
    expect(getIATACode('Санкт-Петербург')).toBe('LED')
    expect(getIATACode('Краснодар')).toBe('KRR')
    expect(getIATACode('Казань')).toBe('KZN')
  })

  it('is case-insensitive', () => {
    expect(getIATACode('сочи')).toBe('AER')
    expect(getIATACode('МОСКВА')).toBe('SVO')
    expect(getIATACode('Санкт-Петербург')).toBe('LED')
  })

  it('resolves aliases', () => {
    expect(getIATACode('Питер')).toBe('LED')
    expect(getIATACode('СПб')).toBe('LED')
    expect(getIATACode('Мск')).toBe('SVO')
    expect(getIATACode('Нижний')).toBe('GOJ')
    expect(getIATACode('Ростов')).toBe('ROV')
    expect(getIATACode('Владик')).toBe('VVO')
    expect(getIATACode('Минводы')).toBe('MRV')
  })

  it('returns null for unknown city', () => {
    expect(getIATACode('НеизвестныйГород')).toBeNull()
    expect(getIATACode('Деревня Пупкино')).toBeNull()
  })

  it('returns null for empty/falsy input', () => {
    expect(getIATACode('')).toBeNull()
    expect(getIATACode(null as unknown as string)).toBeNull()
    expect(getIATACode(undefined as unknown as string)).toBeNull()
  })

  it('trims whitespace', () => {
    expect(getIATACode('  Сочи  ')).toBe('AER')
    expect(getIATACode(' Питер ')).toBe('LED')
  })

  it('maps suburbs to nearest airport', () => {
    expect(getIATACode('Адлер')).toBe('AER')
    expect(getIATACode('Красная Поляна')).toBe('AER')
    expect(getIATACode('Петергоф')).toBe('LED')
    expect(getIATACode('Кронштадт')).toBe('LED')
  })

  it('handles international cities', () => {
    expect(getIATACode('Касабланка')).toBe('CMN')
    expect(getIATACode('Манчестер')).toBe('MAN')
    expect(getIATACode('Бангкок')).toBe('BKK')
    expect(getIATACode('Дубай')).toBe('DXB')
    expect(getIATACode('Анталья')).toBe('AYT')
  })
})

describe('hasIATACode', () => {
  it('returns true for known cities', () => {
    expect(hasIATACode('Сочи')).toBe(true)
    expect(hasIATACode('Питер')).toBe(true)
  })

  it('returns false for unknown cities', () => {
    expect(hasIATACode('Бобруйск')).toBe(false)
    expect(hasIATACode('')).toBe(false)
  })
})

describe('getPopularOriginCities', () => {
  it('returns non-empty array', () => {
    const cities = getPopularOriginCities()
    expect(cities.length).toBeGreaterThan(10)
  })

  it('each entry has name and iata', () => {
    for (const city of getPopularOriginCities()) {
      expect(city.name).toBeTruthy()
      expect(city.iata).toMatch(/^[A-Z]{3}$/)
    }
  })

  it('starts with Moscow and SPb', () => {
    const cities = getPopularOriginCities()
    expect(cities[0].name).toBe('Москва')
    expect(cities[1].name).toBe('Санкт-Петербург')
  })
})
