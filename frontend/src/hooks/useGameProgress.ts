import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  gameCountries,
  countryTotalPoints,
  findCountry,
  preClosedQuestIds,
  type GameCountry,
  type QuestCategory,
} from '@/mocks/game'

const STORAGE_KEY = 'crista-quest-progress'
const QUIZ_KEY = 'crista-quiz-progress'

function readStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

/**
 * Прогресс по квестам. Хранится в localStorage: раздел Игра должен помнить
 * закрытые точки между переходами и перезагрузкой.
 */
export function useGameProgress() {
  const [stored, setStored] = useState<Set<string>>(() => new Set(readStored()))

  /**
   * Поездка, совершённая до Crista, засчитана всегда: это не пользовательский
   * прогресс, а факт биографии. Раньше она подставлялась только при пустом
   * хранилище, и у тех, кто уже пользовался приложением, страна не закрывалась.
   */
  const doneIds = useMemo(
    () => new Set([...stored, ...preClosedQuestIds]),
    [stored]
  )

  // Ответы на ежедневные вопросы хранятся отдельно от точек квестов
  const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(QUIZ_KEY)
      const parsed = raw ? JSON.parse(raw) : {}
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(QUIZ_KEY, JSON.stringify(quizAnswers))
    } catch {
      // приватный режим
    }
  }, [quizAnswers])

  const answerQuiz = useCallback((questionId: string, correct: boolean) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: correct }))
  }, [])

  const resetQuiz = useCallback((iso: string) => {
    setQuizAnswers((prev) => {
      const next = { ...prev }
      Object.keys(next)
        .filter((id) => id.startsWith(`${iso.toLowerCase()}-`))
        .forEach((id) => delete next[id])
      return next
    })
  }, [])

  const answeredQuizIds = useMemo(() => new Set(Object.keys(quizAnswers)), [quizAnswers])

  /** Стрик считаем как число верных ответов подряд с конца */
  const quizStreak = useMemo(
    () => Object.values(quizAnswers).filter(Boolean).length,
    [quizAnswers]
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...stored]))
    } catch {
      // приватный режим браузера: прогресс живёт только в этой сессии
    }
  }, [stored])

  const toggleQuest = useCallback((questId: string) => {
    // Точки прошлой поездки не переключаются: они уже часть биографии
    if (preClosedQuestIds.includes(questId)) return
    setStored((prev) => {
      const next = new Set(prev)
      if (next.has(questId)) next.delete(questId)
      else next.add(questId)
      return next
    })
  }, [])

  const isDone = useCallback((questId: string) => doneIds.has(questId), [doneIds])

  /** Процент закрытия страны по набранным очкам, а не по числу точек */
  const countryProgress = useCallback(
    (iso: string): number => {
      const country = findCountry(iso)
      if (!country) return 0
      const total = countryTotalPoints(country)
      if (total === 0) return 0
      const earned = country.cities.reduce(
        (sum, city) =>
          sum + city.quests.reduce((s, q) => (doneIds.has(q.id) ? s + q.points : s), 0),
        0
      )
      return Math.round((earned / total) * 100)
    },
    [doneIds]
  )

  const cityProgress = useCallback(
    (country: GameCountry, cityId: string): number => {
      const city = country.cities.find((c) => c.id === cityId)
      if (!city || city.quests.length === 0) return 0
      const done = city.quests.filter((q) => doneIds.has(q.id)).length
      return Math.round((done / city.quests.length) * 100)
    },
    [doneIds]
  )

  /** Прогресс по категориям в пределах страны */
  const categoryProgress = useCallback(
    (iso: string): Record<QuestCategory, number> => {
      const country = findCountry(iso)
      const empty: Record<QuestCategory, number> = { sights: 0, food: 0, traditions: 0 }
      if (!country) return empty

      const totals: Record<QuestCategory, { done: number; all: number }> = {
        sights: { done: 0, all: 0 },
        food: { done: 0, all: 0 },
        traditions: { done: 0, all: 0 },
      }

      country.cities.forEach((city) =>
        city.quests.forEach((q) => {
          totals[q.category].all += q.points
          if (doneIds.has(q.id)) totals[q.category].done += q.points
        })
      )

      return {
        sights: totals.sights.all ? Math.round((totals.sights.done / totals.sights.all) * 100) : 0,
        food: totals.food.all ? Math.round((totals.food.done / totals.food.all) * 100) : 0,
        traditions: totals.traditions.all
          ? Math.round((totals.traditions.done / totals.traditions.all) * 100)
          : 0,
      }
    },
    [doneIds]
  )

  /** Очки сезонного пропуска: копятся со всего игрового слоя */
  const passPoints = useMemo(() => {
    const quests = gameCountries.reduce(
      (sum, c) =>
        sum +
        c.cities.reduce(
          (s, city) => s + city.quests.reduce((q, quest) => (doneIds.has(quest.id) ? q + quest.points : q), 0),
          0
        ),
      0
    )
    // Верный ответ дня весит меньше точки квеста, но капает каждый день
    const quiz = Object.values(quizAnswers).filter(Boolean).length * 10
    const cities = gameCountries.reduce(
      (sum, c) =>
        sum +
        c.cities.filter((city) => city.quests.length > 0 && city.quests.every((q) => doneIds.has(q.id))).length * 25,
      0
    )
    return quests + quiz + cities
  }, [doneIds, quizAnswers])

  const stats = useMemo(() => {
    const opened = gameCountries.filter((c) => c.opened)
    const closedFully = opened.filter((c) => countryProgress(c.iso) === 100).length
    const totalQuests = gameCountries.reduce(
      (sum, c) => sum + c.cities.reduce((s, city) => s + city.quests.length, 0),
      0
    )
    return {
      openedCountries: opened.length,
      closedCountries: closedFully,
      doneQuests: doneIds.size,
      totalQuests,
    }
  }, [doneIds, countryProgress])

  // Сброс возвращает к исходному состоянию, а не в ноль: поездка до Crista остаётся
  // Сброс чистит только собственный прогресс, поездка до Crista остаётся
  const resetProgress = useCallback(() => setStored(new Set()), [])

  return {
    isDone,
    toggleQuest,
    countryProgress,
    cityProgress,
    categoryProgress,
    stats,
    resetProgress,
    answeredQuizIds,
    answerQuiz,
    resetQuiz,
    quizStreak,
    passPoints,
  }
}
