import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMiniSiteStampTicket } from '@/api/gameApi'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('auth_token', 'game-test-token')
  mockFetch.mockReset()
})

describe('game passport mini-site stamp ticket', () => {
  it('requests a signed ticket for the selected stamp keys using account auth', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ ticket: 'signed-ticket', stamps: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    await expect(createMiniSiteStampTicket(['moscow-starter'])).resolves.toEqual({ ticket: 'signed-ticket', stamps: [] })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/game\/passport\/mini-site-ticket$/),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer game-test-token' },
        body: JSON.stringify({ stamp_keys: ['moscow-starter'] }),
      }),
    )
  })
})
