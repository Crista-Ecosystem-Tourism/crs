import { describe, expect, it } from 'vitest'
import { getHomeCopy } from '../homeCopy'

describe('home and game interface translations', () => {
  it('provides English HomeHub labels and formats dynamic values', () => {
    const copy = getHomeCopy('en')

    expect(copy.heroTitle).toBe('Where shall we go?')
    expect(copy.countriesCount(3)).toBe('3 countries')
    expect(copy.countriesCount(1)).toBe('1 country')
    expect(copy.pointsToLevel(20, 60, 2)).toBe('20 of 60 points to level 2')
    expect(copy.quizProgress(2, 10)).toBe('2 of 10')
    expect(copy.levelsOutOf(6)).toBe('of 6')
    expect(copy.tripPrompt('Rome', 'Italy')).toBe('I want to travel to Rome, Italy')
    expect(copy.rewardKinds.stamp).toBe('Stamp')
  })

  it('preserves Russian interface copy and localized quiz feedback', () => {
    const copy = getHomeCopy('ru')

    expect(copy.heroTitle).toBe('Куда отправимся?')
    expect(copy.countriesCount(1)).toBe('1 страна')
    expect(copy.countriesCount(12)).toBe('12 стран')
    expect(copy.quizUnavailable('Япония')).toContain('Япония')
    expect(copy.correctAnswer(10)).toBe('Верно, плюс 10 очков')
    expect(copy.quizProgress(2, 10)).toBe('2 из 10')
    expect(copy.levelsOutOf(6)).toBe('из 6')
    expect(copy.rewardKinds.stamp).toBe('Штамп')
  })
})
