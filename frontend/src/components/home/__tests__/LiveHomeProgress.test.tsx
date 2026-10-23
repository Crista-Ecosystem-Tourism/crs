import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GamePassport } from '@/api/gameApi'
import { LiveHomeColumn, LiveHomeStats } from '../LiveHomeProgress'

const appState = vi.hoisted(() => ({
  language: 'ru' as 'ru' | 'en',
  user: { id: 'user-1' } as { id: string } | null,
  setMainView: vi.fn(),
  openModal: vi.fn(),
  goals: [] as Array<{ id: string; title: string; current: number; total: number; color: string }>,
}))

vi.mock('@/context/AppContext', () => ({
  useApp: () => ({
    language: appState.language,
    user: appState.user,
    setMainView: appState.setMainView,
    openModal: appState.openModal,
  }),
}))

vi.mock('@/hooks/useSuitcaseWorkspace', () => ({
  useSuitcaseWorkspace: () => ({ goals: appState.goals }),
}))

const passport: GamePassport = {
  profile: { xp: 125, energy: 4, streak: 3 },
  daily: { timezone: 'Europe/Moscow', streak: 3, completed_quests: 1, goal: 2, goal_reached: false },
  stamps: [{ key: 'moscow-starter', title: 'Moscow', earned_at: '2026-10-20T10:00:00Z' }],
  cities: [
    { id: 'moscow', name: 'Москва', completed_quests: 10, required_quest_count: 10 },
    { id: 'spb', name: 'Санкт-Петербург', completed_quests: 2, required_quest_count: 5 },
  ],
  routes: [],
}

describe('LiveHomeProgress', () => {
  beforeEach(() => {
    appState.language = 'ru'
    appState.user = { id: 'user-1' }
    appState.goals = []
    vi.clearAllMocks()
  })

  it('asks a signed-out user to sign in instead of showing demo progress', () => {
    render(<LiveHomeColumn state={{ status: 'idle' }} onRetry={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }))
    expect(appState.openModal).toHaveBeenCalledWith('auth')
  })

  it('offers a retry when the passport cannot be loaded', () => {
    const onRetry = vi.fn()
    render(<LiveHomeColumn state={{ status: 'error' }} onRetry={onRetry} />)
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('focuses the first unfinished city and shows server streak, goal and energy', () => {
    render(<LiveHomeColumn state={{ status: 'ready', passport }} onRetry={vi.fn()} />)
    expect(screen.getByText('Санкт-Петербург')).toBeTruthy()
    expect(screen.getByText('Пройдено 2 из 5 точек')).toBeTruthy()
    expect(screen.getByText('Цель дня: 1 из 2 уроков')).toBeTruthy()
    expect(screen.getByText(/3 дня/)).toBeTruthy()
    expect(screen.getByText(/Энергия 4\/5/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Продолжить в Игре/ }))
    expect(appState.setMainView).toHaveBeenCalledWith('game')
  })

  it('shows the first Suitcase savings goal when one exists', () => {
    appState.goals = [{ id: 'g1', title: 'Байкал', current: 30000, total: 90000, color: '#000' }]
    render(<LiveHomeColumn state={{ status: 'ready', passport }} onRetry={vi.fn()} />)
    expect(screen.getByText('Копилка: Байкал')).toBeTruthy()
  })

  it('renders server stats in English', () => {
    appState.language = 'en'
    render(<LiveHomeStats passport={passport} />)
    expect(screen.getByText('125')).toBeTruthy()
    expect(screen.getByText('3 days')).toBeTruthy()
    expect(screen.getByText('Passport stamps')).toBeTruthy()
  })
})
