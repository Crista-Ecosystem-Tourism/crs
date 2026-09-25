import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GamePanel } from '../GamePanel'

const { fetchWorkspaceMock, getPassportMock, setMainViewMock } = vi.hoisted(() => ({
  fetchWorkspaceMock: vi.fn(),
  getPassportMock: vi.fn(),
  setMainViewMock: vi.fn(),
}))

vi.mock('@/context/AppContext', () => ({
  useApp: () => ({ user: { id: 'user-1', name: 'Traveler' }, language: 'ru', setMainView: setMainViewMock }),
}))

vi.mock('@/api/chatApi', () => ({
  isMockMode: () => false,
  ApiError: class ApiError extends Error { detail = this.message },
}))

vi.mock('@/api/gameApi', () => ({ getGamePassport: getPassportMock }))

vi.mock('@/api/suitcaseApi', () => ({
  fetchSuitcaseWorkspace: fetchWorkspaceMock,
  mapTripFromApi: (trip: { id: string; city: string; country: string; is_archived: boolean }) => ({
    id: trip.id, city: trip.city, country: trip.country, isArchived: trip.is_archived,
  }),
  mapGoalFromApi: (goal: { id: string; title: string; current: number; total: number }) => goal,
}))

vi.mock('../WorldMap', () => ({ WorldMap: () => null }))
vi.mock('../CountryQuests', () => ({ CountryQuests: () => null }))
vi.mock('../TravelPassport', () => ({ TravelPassport: () => null }))
vi.mock('../DailyQuiz', () => ({ DailyQuiz: () => null }))
vi.mock('../CountryPage', () => ({ CountryPage: () => null }))
vi.mock('../OnboardingFlow', () => ({ OnboardingFlow: () => null }))
vi.mock('../MoscowQuest', () => ({ MoscowQuest: () => null }))
vi.mock('../MoscowPath', () => ({ MoscowPath: () => null }))
vi.mock('../MoscowBoss', () => ({ MoscowBoss: () => null }))
vi.mock('../MoscowSandbox', () => ({ MoscowSandbox: () => null }))
vi.mock('../CityPilot', () => ({ CityPilot: () => null }))

describe('LiveGamePanel Suitcase summary', () => {
  beforeEach(() => {
    fetchWorkspaceMock.mockReset()
    getPassportMock.mockReset()
    setMainViewMock.mockReset()
    fetchWorkspaceMock.mockResolvedValue({
      trips: [
        { id: 'trip-1', city: 'Киото', country: 'Япония', is_archived: false },
        { id: 'trip-2', city: 'Осака', country: 'Япония', is_archived: false },
        { id: 'trip-3', city: 'Токио', country: 'Япония', is_archived: true },
      ],
      goals: [{ id: 'goal-1', title: 'На музеи', current: 120, total: 300 }],
    })
    getPassportMock.mockResolvedValue({
      profile: { xp: 240, energy: 4, streak: 3 },
      stamps: [{ key: 'moscow-starter', title: 'Москва', earned_at: '2026-09-24' }],
      cities: [{ id: 'moscow', name: 'Москва', completed_quests: 3, required_quest_count: 10 }],
      routes: [{ id: 'route-1', name: 'Северный маршрут', destination: 'Санкт-Петербург', updated_at: null }],
    })
  })

  it('renders server-backed active trips and goals and links to the suitcase view', async () => {
    render(<GamePanel onBack={() => undefined} />)

    expect(await screen.findByText('2 активных поездок · 1 целей')).toBeTruthy()
    expect(screen.getByText('Киото, Япония · Осака, Япония')).toBeTruthy()
    expect(screen.queryByText(/Токио/)).toBeNull()
    expect(screen.getByText('На музеи: 120 / 300')).toBeTruthy()
    expect(screen.getByText('240 XP · 1 штампов')).toBeTruthy()
    expect(screen.getByText('Москва: 3/10')).toBeTruthy()
    expect(screen.getByText('Сохранённые маршруты: Северный маршрут — Санкт-Петербург')).toBeTruthy()
    expect(fetchWorkspaceMock).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Открыть чемодан' }))
    await waitFor(() => expect(setMainViewMock).toHaveBeenCalledWith('suitcase'))
  })

  it('shows a passport error without hiding independently loaded Suitcase data', async () => {
    getPassportMock.mockRejectedValue(new Error('passport API unavailable'))

    render(<GamePanel onBack={() => undefined} />)

    expect(await screen.findByText('Игровой паспорт временно недоступен.')).toBeTruthy()
    expect(await screen.findByText('2 активных поездок · 1 целей')).toBeTruthy()
  })

  it('shows a loading state while the server passport is pending', async () => {
    let resolvePassport!: (passport: unknown) => void
    getPassportMock.mockReturnValue(new Promise((resolve) => { resolvePassport = resolve }))

    render(<GamePanel onBack={() => undefined} />)

    expect(screen.getByText('Загружаем игровой паспорт…')).toBeTruthy()
    resolvePassport({ profile: { xp: 0, energy: 5, streak: 0 }, stamps: [], cities: [], routes: [] })
    expect(await screen.findByText('0 XP · 0 штампов')).toBeTruthy()
  })

  it('retries the passport independently and recovers from an API error', async () => {
    getPassportMock
      .mockRejectedValueOnce(new Error('temporary passport error'))
      .mockResolvedValueOnce({ profile: { xp: 70, energy: 5, streak: 1 }, stamps: [], cities: [], routes: [] })

    render(<GamePanel onBack={() => undefined} />)
    expect(await screen.findByText('Игровой паспорт временно недоступен.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку паспорта' }))

    expect(await screen.findByText('70 XP · 0 штампов')).toBeTruthy()
    expect(getPassportMock).toHaveBeenCalledTimes(2)
    expect(fetchWorkspaceMock).toHaveBeenCalledTimes(1)
  })

  it('retries Suitcase independently and recovers without refetching the passport', async () => {
    fetchWorkspaceMock
      .mockRejectedValueOnce(new Error('temporary Suitcase error'))
      .mockResolvedValueOnce({
        trips: [{ id: 'trip-4', city: 'Нара', country: 'Япония', is_archived: false }],
        goals: [],
      })

    render(<GamePanel onBack={() => undefined} />)
    expect(await screen.findByText(/Данные чемодана временно недоступны/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку чемодана' }))

    expect(await screen.findByText('1 активных поездок · 0 целей')).toBeTruthy()
    expect(screen.getByText('Нара, Япония')).toBeTruthy()
    expect(fetchWorkspaceMock).toHaveBeenCalledTimes(2)
    expect(getPassportMock).toHaveBeenCalledTimes(1)
  })
})
