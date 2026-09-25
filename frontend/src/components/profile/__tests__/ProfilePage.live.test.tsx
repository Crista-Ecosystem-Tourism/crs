import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfilePage } from '../ProfilePage'

const { getPassportMock, fetchWorkspaceMock, setMainViewMock, appState } = vi.hoisted(() => ({
  getPassportMock: vi.fn(),
  fetchWorkspaceMock: vi.fn(),
  setMainViewMock: vi.fn(),
  appState: { language: 'ru' as 'ru' | 'en' },
}))

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }))
vi.mock('@/context/AppContext', () => ({
  useApp: () => ({
    user: { id: 'user-1', name: 'Traveler', email: 'traveler@example.test', subscription: 'registered' },
    openModal: vi.fn(),
    chatHistory: [],
    savedRoutes: [],
    setMainView: setMainViewMock,
    language: appState.language,
    setLanguage: vi.fn(),
  }),
}))
vi.mock('@/hooks/useGameProgress', () => ({
  useGameProgress: () => ({ countryProgress: () => 0, cityProgress: () => 0, stats: { doneQuests: 0 } }),
}))
vi.mock('@/api/chatApi', () => ({ isMockMode: () => false }))
vi.mock('@/api/gameApi', () => ({ getGamePassport: getPassportMock }))
vi.mock('@/api/suitcaseApi', () => ({
  fetchSuitcaseWorkspace: fetchWorkspaceMock,
  mapTripFromApi: (trip: { id: string; city: string; country: string; start_date: string; end_date: string; image?: string | null; is_archived: boolean }) => ({
    id: trip.id, city: trip.city, country: trip.country, startDate: trip.start_date,
    endDate: trip.end_date, image: trip.image ?? undefined, isArchived: trip.is_archived,
  }),
  mapGoalFromApi: (goal: { id: string; title: string; current: number; total: number; color: string }) => goal,
}))
vi.mock('@/components/layout/Sidebar', () => ({ Sidebar: () => null }))
vi.mock('@/components/layout/AppFrame', () => ({ AppFrame: ({ children }: { children: React.ReactNode }) => <>{children}</> }))
vi.mock('@/components/ui/Img', () => ({ Img: ({ alt }: { alt: string }) => <img alt={alt} /> }))

beforeEach(() => {
  appState.language = 'ru'
  getPassportMock.mockReset()
  fetchWorkspaceMock.mockReset()
  setMainViewMock.mockReset()
  getPassportMock.mockResolvedValue({
    profile: { xp: 240, energy: 4, streak: 3 },
    stamps: [{ key: 'moscow', title: 'Москва', earned_at: '2026-09-24' }],
    cities: [{ id: 'moscow', name: 'Москва', completed_quests: 3, required_quest_count: 10 }],
    routes: [],
  })
  fetchWorkspaceMock.mockResolvedValue({
    trips: [
      { id: 'trip-1', city: 'Киото', country: 'Япония', start_date: '2026-10-01', end_date: '2026-10-05', is_archived: false },
      { id: 'trip-2', city: 'Токио', country: 'Япония', start_date: '2026-09-01', end_date: '2026-09-03', is_archived: true },
    ],
    expenses: [],
    goals: [{ id: 'goal-1', title: 'Музеи', current: 2, total: 5, color: 'blue' }],
  })
})

describe('ProfilePage live data', () => {
  it('renders only server-owned passport and active Suitcase trips', async () => {
    render(<ProfilePage />)

    expect(await screen.findByText('Москва')).toBeTruthy()
    expect(await screen.findByText('Киото, Япония')).toBeTruthy()
    expect(screen.getByText('240')).toBeTruthy()
    expect(screen.getByText('3/10 квестов · 30%')).toBeTruthy()
    expect(screen.getByText('целей')).toBeTruthy()
    expect(screen.queryByText(/Токио/)).toBeNull()
    expect(screen.queryByText('Гастротур по Грузии')).toBeNull()
  })

  it('keeps game and Suitcase errors separate and retries each source independently', async () => {
    getPassportMock.mockRejectedValueOnce(new Error('passport unavailable'))
    fetchWorkspaceMock.mockRejectedValueOnce(new Error('suitcase unavailable'))
    render(<ProfilePage />)

    const retryButtons = await screen.findAllByRole('button', { name: 'Повторить' })
    expect(retryButtons).toHaveLength(2)
    expect(screen.getByText('Достижения временно недоступны вместе с игровым паспортом.')).toBeTruthy()
    getPassportMock.mockResolvedValueOnce({
      profile: { xp: 70, energy: 5, streak: 1 }, stamps: [], cities: [], routes: [],
    })
    fetchWorkspaceMock.mockResolvedValueOnce({ trips: [], expenses: [], goals: [] })
    fireEvent.click(retryButtons[0])

    expect(await screen.findByText('70')).toBeTruthy()
    expect(fetchWorkspaceMock).toHaveBeenCalledTimes(1)
  })

  it('renders the live passport in the selected English language', async () => {
    appState.language = 'en'
    render(<ProfilePage />)

    expect(await screen.findByRole('heading', { name: 'Profile' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Travel passport' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Achievements' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'My trips' })).toBeTruthy()
    expect(await screen.findByText('October 1, 2026 — October 5, 2026')).toBeTruthy()
  })
})
