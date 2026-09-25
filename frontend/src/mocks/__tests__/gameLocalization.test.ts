import { describe, expect, it } from 'vitest'
import { gameCountries, gameCityName, gameCountryName, weeklyTrackTitle } from '../game'

describe('localized game country data', () => {
  it('has English country and city names for every seeded country and city', () => {
    for (const country of gameCountries) {
      expect(country.nameEn.length).toBeGreaterThan(0)
      for (const city of country.cities) {
        expect(city.nameEn.length).toBeGreaterThan(0)
      }
    }
  })

  it('selects localized country, city, and weekly-track titles without changing source data', () => {
    const georgia = gameCountries.find((country) => country.iso === 'GE')!
    const tbilisi = georgia.cities[0]
    const weekly = georgia.weekly!

    expect(gameCountryName(georgia, 'en')).toBe('Georgia')
    expect(gameCountryName(georgia, 'ru')).toBe('Грузия')
    expect(gameCityName(tbilisi, 'en')).toBe('Tbilisi')
    expect(weeklyTrackTitle(weekly, 'en')).toBe('Online course: History of the Caucasus in 10 minutes')
    expect(weeklyTrackTitle(weekly, 'ru')).toBe(weekly.title)
  })

  it('has English equivalents for every available weekly track', () => {
    for (const country of gameCountries) {
      if (country.weekly) expect(country.weekly.titleEn.length).toBeGreaterThan(0)
    }
  })
})
