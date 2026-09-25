import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/chatApi'
import {
  completeTripForMiniSite,
  createSuitcaseExpense,
  createSuitcaseGoal,
  fetchPublicTripMiniSite,
  fetchSuitcaseWorkspace,
  getTripMiniSite,
  mapExpenseFromApi,
  mapGoalFromApi,
  mapTripFromApi,
  patchSuitcaseGoal,
  publishTripMiniSite,
  revokeTripMiniSite,
} from '@/api/suitcaseApi'

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
  localStorage.setItem('auth_token', 'suitcase-test-token')
  mockFetch.mockReset()
})

describe('fetchSuitcaseWorkspace', () => {
  it('requests the workspace with the saved bearer token', async () => {
    const workspace = { trips: [], expenses: [], goals: [] }
    mockFetch.mockResolvedValueOnce(jsonResponse(workspace))

    await expect(fetchSuitcaseWorkspace()).resolves.toEqual(workspace)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/suitcase\/workspace$/),
      expect.objectContaining({
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer suitcase-test-token',
        },
      }),
    )
  })

  it('preserves server error status and detail as ApiError', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ detail: 'workspace unavailable' }, 503))

    const request = fetchSuitcaseWorkspace()
    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({
      status: 503,
      detail: 'workspace unavailable',
    })
  })
})

describe('Suitcase API row mappers', () => {
  it('maps trip, expense, and goal fields from snake_case and handles nullable trip fields', () => {
    expect(mapTripFromApi({
      id: 'trip-1',
      country: 'Russia',
      city: 'Moscow',
      start_date: '2026-09-01',
      end_date: '2026-09-05',
      image: null,
      mood: 'curious',
      route_json: '{"type":"FeatureCollection"}',
      impressions: 'Great trip',
      photos: ['photo.jpg'],
      is_archived: true,
      created_at: null,
    })).toEqual({
      id: 'trip-1',
      country: 'Russia',
      city: 'Moscow',
      startDate: '2026-09-01',
      endDate: '2026-09-05',
      image: undefined,
      mood: 'curious',
      routeJson: '{"type":"FeatureCollection"}',
      impressions: 'Great trip',
      photos: ['photo.jpg'],
      isArchived: true,
      createdAt: '',
    })

    expect(mapExpenseFromApi({
      id: 'expense-1',
      trip_id: 'trip-1',
      amount: 24.5,
      category: 'food',
      title: 'Lunch',
      date: '2026-09-02',
      currency: null,
    })).toEqual({
      id: 'expense-1',
      tripId: 'trip-1',
      amount: 24.5,
      category: 'food',
      title: 'Lunch',
      date: '2026-09-02',
      currency: undefined,
    })

    expect(mapGoalFromApi({
      id: 'goal-1',
      title: 'Visit 5 cities',
      current: 2,
      total: 5,
      color: 'blue',
    })).toEqual({
      id: 'goal-1',
      title: 'Visit 5 cities',
      current: 2,
      total: 5,
      color: 'blue',
    })
  })
})

describe('Suitcase goal and expense mutations', () => {
  it('creates a goal with the authenticated JSON contract', async () => {
    const payload = { title: 'Visit 8 museums', current: 0, total: 8, color: '#336699' }
    const goal = { id: 'goal-2', ...payload }
    mockFetch.mockResolvedValueOnce(jsonResponse(goal))

    await expect(createSuitcaseGoal(payload)).resolves.toEqual(goal)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/suitcase\/goals$/),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer suitcase-test-token',
        },
        body: JSON.stringify(payload),
      }),
    )
  })

  it('patches only the requested goal progress and maps server failures', async () => {
    const updated = { id: 'goal/with space', title: 'Visit museums', current: 3, total: 8, color: '#336699' }
    mockFetch.mockResolvedValueOnce(jsonResponse(updated))

    await expect(patchSuitcaseGoal(updated.id, { current: 3 })).resolves.toEqual(updated)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/suitcase\/goals\/goal%2Fwith%20space$/),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ current: 3 }),
      }),
    )

    mockFetch.mockResolvedValueOnce(jsonResponse({ detail: 'goal unavailable' }, 503))
    await expect(patchSuitcaseGoal('goal-1', { current: 1 })).rejects.toMatchObject({
      status: 503,
      detail: 'goal unavailable',
    })
  })

  it('creates an expense under its trip with no client-owned trip field in the body', async () => {
    const payload = {
      tripId: 'trip-4',
      title: 'Museum ticket',
      amount: 12,
      category: 'culture',
      date: '2026-09-24',
      currency: 'EUR',
    }
    const expense = {
      id: 'expense-2',
      trip_id: payload.tripId,
      title: payload.title,
      amount: payload.amount,
      category: payload.category,
      date: payload.date,
      currency: payload.currency,
    }
    mockFetch.mockResolvedValueOnce(jsonResponse(expense))

    await expect(createSuitcaseExpense('trip-4', payload)).resolves.toEqual(expense)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/suitcase\/trips\/trip-4\/expenses$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          amount: 12,
          category: 'culture',
          title: 'Museum ticket',
          date: '2026-09-24',
          currency: 'EUR',
        }),
      }),
    )
  })
})

describe('trip mini-site consent and access', () => {
  it('prepares a private draft through the authenticated completion endpoint', async () => {
    const draft = { published: false, draft_ready: true, completed_at: '2026-09-25T12:00:00Z', slug: null, visibility: null, consented_at: null, draft_snapshot: { title: 'Rome' } }
    mockFetch.mockResolvedValueOnce(jsonResponse(draft))
    await expect(completeTripForMiniSite('trip/2', 'signed-ticket')).resolves.toEqual(draft)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/suitcase\/trips\/trip%2F2\/complete$/),
      expect.objectContaining({ method: 'POST', headers: expect.objectContaining({ Authorization: 'Bearer suitcase-test-token' }), body: JSON.stringify({ game_stamp_ticket: 'signed-ticket' }) }),
    )
  })

  it('reads and publishes an owner mini-site only with an explicit consent payload', async () => {
    const state = { published: true, slug: 'unpredictable-token', visibility: 'link', consented_at: '2026-09-25T12:00:00Z' }
    mockFetch.mockResolvedValueOnce(jsonResponse({ published: false, slug: null, visibility: null, consented_at: null }))
      .mockResolvedValueOnce(jsonResponse(state))

    await expect(getTripMiniSite('trip/1')).resolves.toMatchObject({ published: false })
    await expect(publishTripMiniSite('trip/1', 'link', 'signed-ticket')).resolves.toEqual(state)

    expect(mockFetch).toHaveBeenNthCalledWith(2,
      expect.stringMatching(/\/suitcase\/trips\/trip%2F1\/mini-site$/),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer suitcase-test-token' }),
        body: JSON.stringify({ visibility: 'link', consent_to_publish: true, game_stamp_ticket: 'signed-ticket' }),
      }),
    )
  })

  it('revokes access and loads the public snapshot without auth headers', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(jsonResponse({ visibility: 'link', snapshot: { title: 'Moscow' } }))

    await expect(revokeTripMiniSite('trip-1')).resolves.toBeUndefined()
    await expect(fetchPublicTripMiniSite('secret slug')).resolves.toMatchObject({
      visibility: 'link', snapshot: { title: 'Moscow' },
    })
    expect(mockFetch).toHaveBeenNthCalledWith(1, expect.stringMatching(/\/suitcase\/trips\/trip-1\/mini-site$/), expect.objectContaining({ method: 'DELETE' }))
    expect(mockFetch).toHaveBeenNthCalledWith(2, expect.stringMatching(/\/t\/secret%20slug$/), { headers: { Accept: 'application/json' } })
  })
})
