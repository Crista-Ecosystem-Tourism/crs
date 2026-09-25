import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/chatApi'
import { getPreferences, savePreferences } from '../authApi'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('auth_token', 'preferences-test-token')
  mockFetch.mockReset()
})

describe('account interface preferences API', () => {
  it('loads preferences with the account bearer token', async () => {
    const preferences = { theme: 'light', language: 'en' } as const
    mockFetch.mockResolvedValueOnce(jsonResponse(preferences))

    await expect(getPreferences()).resolves.toEqual(preferences)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/preferences$/),
      expect.objectContaining({ headers: { Authorization: 'Bearer preferences-test-token' } }),
    )
  })

  it('persists the supplied theme and language using the token captured for that account', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ theme: 'light', language: 'en' }))
    localStorage.setItem('auth_token', 'a-different-account-token')

    await savePreferences({ theme: 'light', language: 'en' }, 'preferences-test-token')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/preferences$/),
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer preferences-test-token',
        },
        body: JSON.stringify({ theme: 'light', language: 'en' }),
      }),
    )
  })

  it('preserves server errors when saving preferences fails', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ detail: 'account unavailable' }, 503))

    const request = savePreferences({ theme: 'dark', language: 'ru' })
    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({
      status: 503,
      detail: 'account unavailable',
    })
  })
})
