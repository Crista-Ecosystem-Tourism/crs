import { describe, expect, it } from 'vitest'
import { getGameCopy, getQuestCopy } from '../gameCopy'
import { gameCountries } from '../../mocks/game'

describe('game interface translations', () => {
  it('formats English game screen labels and dynamic progress', () => {
    const copy = getGameCopy('en')

    expect(copy.worldCoverage).toBe('World coverage')
    expect(copy.openCountriesCount(3)).toBe('3 of 195 countries')
    expect(copy.lessonProgress(2, 5, 40)).toBe('Lesson 2 of 5, 40% complete')
    expect(copy.categoryNames.food).toBe('Food')
    expect(copy.unopenedCountry('Japan')).toContain('Japan')
    expect(copy.passportOwner).toBe('Holder')
    expect(copy.firstStampHint).toContain('Complete every quest')
  })

  it('keeps Russian text and inflects city counts', () => {
    const copy = getGameCopy('ru')

    expect(copy.worldCoverage).toBe('Охват мира')
    expect(copy.cityCount(1)).toBe('1 город')
    expect(copy.cityCount(3)).toBe('3 города')
    expect(copy.cityCount(12)).toBe('12 городов')
    expect(copy.categoryNames.food).toBe('Кухня')
    expect(copy.passportOwner).toBe('Владелец')
  })

  it('provides English titles and hints for every seeded quest while preserving Russian source copy', () => {
    const quests = gameCountries.flatMap((country) => country.cities.flatMap((city) => city.quests))
    expect(quests.length).toBeGreaterThan(0)
    for (const quest of quests) {
      const english = getQuestCopy(quest, 'en')
      expect(english.title, quest.id).not.toBe(quest.title)
      expect(english.hint, quest.id).not.toBe(quest.hint)
      expect(getQuestCopy(quest, 'ru')).toEqual({ title: quest.title, hint: quest.hint })
    }
  })
})
