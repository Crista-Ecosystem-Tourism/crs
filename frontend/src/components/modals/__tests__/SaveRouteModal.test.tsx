import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SaveRouteModal } from '../SaveRouteModal'

const appState = vi.hoisted(() => ({
  closeModal: vi.fn(),
  saveCurrentRoute: vi.fn(),
}))

vi.mock('@/context/AppContext', () => ({
  useApp: () => ({
    activeModal: 'save-route',
    closeModal: appState.closeModal,
    saveCurrentRoute: appState.saveCurrentRoute,
    routePlacesToSave: [{ id: 'place-1', name: 'Красная площадь' }],
  }),
}))

describe('SaveRouteModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps the route name and exposes a retry after server persistence fails', async () => {
    appState.saveCurrentRoute
      .mockRejectedValueOnce(new Error('database unavailable'))
      .mockResolvedValueOnce(undefined)

    render(<SaveRouteModal />)

    const input = screen.getByPlaceholderText('Название маршрута')
    fireEvent.change(input, { target: { value: 'Маршрут по центру' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Не удалось сохранить маршрут на сервере')
    expect(screen.getByDisplayValue('Маршрут по центру')).toBeTruthy()
    expect(appState.closeModal).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    await waitFor(() => expect(appState.saveCurrentRoute).toHaveBeenCalledTimes(2))
    expect(appState.saveCurrentRoute).toHaveBeenNthCalledWith(2, 'Маршрут по центру')
  })
})
