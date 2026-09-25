import { describe, expect, it } from 'vitest'
import { quizContent, quizQuestions } from '../quiz'

describe('localized daily quiz content', () => {
  it('provides English question, options, and explanation for every seeded question', () => {
    for (const question of quizQuestions) {
      const english = quizContent(question, 'en')

      expect(english.question.length).toBeGreaterThan(0)
      expect(english.options).toHaveLength(question.options.length)
      expect(english.options.every((option) => option.length > 0)).toBe(true)
      expect(english.explanation.length).toBeGreaterThan(0)
      expect(question.correct).toBeGreaterThanOrEqual(0)
      expect(question.correct).toBeLessThan(english.options.length)
    }
  })

  it('keeps Russian content available and does not change the answer index', () => {
    const question = quizQuestions[0]

    expect(quizContent(question, 'ru')).toEqual({
      question: question.question,
      options: question.options,
      explanation: question.explanation,
    })
    expect(quizContent(question, 'en').options[question.correct]).toBe('11')
    expect(question.correct).toBe(1)
  })
})
