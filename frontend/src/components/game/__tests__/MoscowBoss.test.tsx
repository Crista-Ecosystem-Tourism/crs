import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MoscowBoss } from '../MoscowBoss'

const { getMoscowBossMock, useAppMock } = vi.hoisted(() => ({
  getMoscowBossMock: vi.fn(),
  useAppMock: vi.fn(),
}))

vi.mock('@/api/gameApi', () => ({ getMoscowBoss: getMoscowBossMock, answerMoscowBoss: vi.fn() }))
vi.mock('@/context/AppContext', () => ({ useApp: useAppMock }))

describe('MoscowBoss localization', () => {
  beforeEach(() => {
    getMoscowBossMock.mockReset()
    useAppMock.mockReset()
    getMoscowBossMock.mockResolvedValue({
      city: { id: 'moscow', name: 'Москва' },
      content: {
        chris: { name: 'Крис', intro: 'Русское вступление' }, scene: { title: 'Финал', mode: 'boss' },
        questions: [{ id: 'q1', text: 'Русский вопрос?', options: [{ id: 'a', label: 'Ответ' }] }],
        sources: [{ label: 'Источник', url: 'https://example.test' }],
      },
      profile: { xp: 100, energy: 3, streak: 2 },
      daily: { timezone: 'Europe/Moscow', streak: 2, completed_quests: 2, goal: 2, goal_reached: true },
      completed: false, city_stamp: null, sandbox_unlocked: false,
    })
  })

  it('localizes the boss interface and discloses Russian source content in English mode', async () => {
    useAppMock.mockReturnValue({ language: 'en' })
    render(<MoscowBoss signedIn refreshKey={0} />)

    expect(await screen.findByText('Moscow · final round')).toBeTruthy()
    expect(screen.getByText('Lesson text and questions are currently available only in Russian, the verified server edition.')).toBeTruthy()
    expect(screen.getByText('Русский вопрос?')).toBeTruthy()
    expect(screen.getByText('Question 1')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Check all three answers' })).toBeTruthy()
    expect(screen.getByText('Sources:')).toBeTruthy()
  })

  it('renders the published English boss without a fallback notice', async () => {
    useAppMock.mockReturnValue({ language: 'en' })
    getMoscowBossMock.mockResolvedValueOnce({
      city: { id: 'moscow', name: 'Moscow' },
      content_language: 'en',
      content: {
        chris: { name: 'Chris', intro: 'Bring three facts together into one story of Moscow.' },
        scene: { title: 'Moscow Final Round', mode: 'boss' },
        questions: [{ id: 'q1', text: 'When was the cathedral consecrated?', options: [{ id: '1489', label: '1489' }] }],
        sources: [{ label: 'Moscow Kremlin Museums', url: 'https://example.test' }],
      },
      profile: { xp: 100, energy: 3, streak: 2 },
      daily: { timezone: 'Europe/Moscow', streak: 2, completed_quests: 2, goal: 2, goal_reached: true },
      completed: false, city_stamp: null, sandbox_unlocked: false,
    })

    render(<MoscowBoss signedIn refreshKey={0} />)

    expect(await screen.findByText('Moscow Final Round')).toBeTruthy()
    expect(screen.getByText('When was the cathedral consecrated?')).toBeTruthy()
    expect(screen.queryByText('Lesson text and questions are currently available only in Russian, the verified server edition.')).toBeNull()
    expect(getMoscowBossMock).toHaveBeenCalledWith('en')
  })
})
