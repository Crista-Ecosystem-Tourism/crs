import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthModal } from '../AuthModal'

const appState = vi.hoisted(() => ({
  language: 'en' as 'ru' | 'en',
  closeModal: vi.fn(),
  loginWithEmail: vi.fn(),
  registerWithEmail: vi.fn(),
}))

vi.mock('@/context/AppContext', () => ({
  useApp: () => ({
    activeModal: 'auth',
    language: appState.language,
    closeModal: appState.closeModal,
    loginWithEmail: appState.loginWithEmail,
    registerWithEmail: appState.registerWithEmail,
    authLoading: false,
  }),
}))

describe('AuthModal translations', () => {
  beforeEach(() => {
    appState.language = 'en'
    vi.clearAllMocks()
  })

  it('shows English sign-in and registration UI and validation', () => {
    render(<AuthModal />)

    expect(screen.getByRole('heading', { name: 'Sign in to continue' })).toBeTruthy()
    expect(screen.getByPlaceholderText('Email')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByText('Enter your name')).toBeTruthy()
  })
})
