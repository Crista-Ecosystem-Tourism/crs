import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SavedRoutesPanel } from '../SavedRoutesPanel'

const appState = vi.hoisted(() => ({
  loadSavedRoute: vi.fn(),
  refreshSavedRoutes: vi.fn(),
  setMainView: vi.fn(),
  savedRoutesLoading: false,
  savedRoutesLoadError: false,
  savedRoutes: [{
    id: 'route-1',
    name: 'Прогулка по Риму',
    destination: 'Рим',
    days: 1,
    places: [{ id: 'place-1', name: 'Колизей' }],
    createdAt: '2026-09-24T10:00:00Z',
  }],
}))

vi.mock('@/context/AppContext', () => ({
  useApp: () => ({
    savedRoutes: appState.savedRoutes,
    loadSavedRoute: appState.loadSavedRoute,
    refreshSavedRoutes: appState.refreshSavedRoutes,
    savedRoutesLoading: appState.savedRoutesLoading,
    savedRoutesLoadError: appState.savedRoutesLoadError,
    setMainView: appState.setMainView,
  }),
}))

describe('SavedRoutesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    appState.savedRoutesLoading = false
    appState.savedRoutesLoadError = false
    appState.savedRoutes = [{
      id: 'route-1',
      name: 'Прогулка по Риму',
      destination: 'Рим',
      days: 1,
      places: [{ id: 'place-1', name: 'Колизей' }],
      createdAt: '2026-09-24T10:00:00Z',
    }]
  })

  it('shows a retry when a saved route cannot be loaded', async () => {
    appState.loadSavedRoute
      .mockRejectedValueOnce(new Error('backend unavailable'))
      .mockResolvedValueOnce(undefined)

    render(<SavedRoutesPanel onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Прогулка по Риму/ }))

    expect(await screen.findByRole('alert')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))

    await waitFor(() => expect(appState.loadSavedRoute).toHaveBeenCalledTimes(2))
    expect(appState.loadSavedRoute).toHaveBeenNthCalledWith(2, 'route-1')
  })

  it('does not present an empty route list as success after a list request fails', async () => {
    appState.savedRoutes = []
    appState.savedRoutesLoadError = true
    appState.refreshSavedRoutes.mockRejectedValueOnce(new Error('backend unavailable'))

    render(<SavedRoutesPanel onBack={vi.fn()} />)

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Не удалось загрузить список маршрутов')
    fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }))
    await waitFor(() => expect(appState.refreshSavedRoutes).toHaveBeenCalledTimes(1))
  })
})
