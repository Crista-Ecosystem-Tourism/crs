import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MoscowPath } from '../MoscowPath'

const { getMoscowPathMock, useAppMock } = vi.hoisted(() => ({
  getMoscowPathMock: vi.fn(),
  useAppMock: vi.fn(),
}))

vi.mock('@/api/gameApi', () => ({ getMoscowPath: getMoscowPathMock }))
vi.mock('@/context/AppContext', () => ({ useApp: useAppMock }))

describe('MoscowPath localization', () => {
  beforeEach(() => {
    getMoscowPathMock.mockReset()
    useAppMock.mockReset()
    getMoscowPathMock.mockResolvedValue({
      city: { id: 'moscow', name: 'Москва', tier: 1, required_quest_count: 10, completion_stamp: null },
      profile: { xp: 50, energy: 4, streak: 2 },
      daily: { timezone: 'Europe/Moscow', streak: 2, completed_quests: 1, goal: 2, goal_reached: false },
      nodes: [{
        id: 'moscow-red-square', kind: 'quiz', position: 1, completed: false, unlocked: true,
        prerequisite_quest_id: null, district: { id: 'moscow-kremlin', name: 'Кремль', position: 1 },
      }],
      boss: { title: 'Финальный круг Москвы', question_count: 3, unlocked: false, completed: false, sandbox_unlocked: false },
    })
  })

  it('renders the localized route, progress, stop labels, and locked boss in English', async () => {
    useAppMock.mockReturnValue({ language: 'en' })
    render(<MoscowPath signedIn refreshKey={0} onSelect={() => undefined} onSelectBoss={() => undefined} />)

    expect(await screen.findByText('Moscow')).toBeTruthy()
    expect(screen.getByText('Moscow Kremlin')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Red Square/ })).toBeTruthy()
    expect(screen.getByText('Start above')).toBeTruthy()
    expect(screen.getByText('Route tier 1: 0/10 stops. Today: 1/2.')).toBeTruthy()
    expect(screen.getByText('Unlocks after all route stops')).toBeTruthy()
    expect(screen.getByRole('list', { name: 'Moscow route stops' })).toBeTruthy()
  })

  it('keeps the route labels in Russian when Russian is selected', async () => {
    useAppMock.mockReturnValue({ language: 'ru' })
    render(<MoscowPath signedIn refreshKey={0} onSelect={() => undefined} onSelectBoss={() => undefined} />)

    expect(await screen.findByText('Маршрут города')).toBeTruthy()
    expect(screen.getByText('Москва')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Красная площадь/ })).toBeTruthy()
    expect(screen.getByText('Начните выше')).toBeTruthy()
  })
})
