import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  savePlaceRatings,
  loadPlaceRatings,
  saveGraphGeoJSON,
  loadGraphGeoJSON,
  createSavedRoute,
  listSavedRoutes,
  deleteSavedRoute,
} from '../travelDataApi'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock authApi
vi.mock('../authApi', () => ({
  getAuthHeaders: () => ({ Authorization: 'Bearer test-token' }),
}))

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  }
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('savePlaceRatings', () => {
  it('sends PUT with correct URL and payload', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }))

    const ratings = { p1: { rating: 4, score: 3, selected: true } }
    await savePlaceRatings('sess-1', ratings)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat/sessions/sess-1/place-ratings'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ ratings }),
      }),
    )
  })
})

describe('loadPlaceRatings', () => {
  it('returns ratings from response', async () => {
    const ratings = { p1: { rating: 5, score: null, selected: false } }
    mockFetch.mockResolvedValueOnce(jsonResponse({ session_id: 's1', ratings }))

    const result = await loadPlaceRatings('s1')
    expect(result).toEqual(ratings)
  })

  it('returns null when no ratings', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ session_id: 's1', ratings: null }))

    const result = await loadPlaceRatings('s1')
    expect(result).toBeNull()
  })
})

describe('saveGraphGeoJSON', () => {
  it('sends PUT with geojson payload', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }))

    const geojson = { type: 'FeatureCollection', features: [] }
    await saveGraphGeoJSON('sess-1', geojson)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat/sessions/sess-1/graph'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ geojson }),
      }),
    )
  })
})

describe('loadGraphGeoJSON', () => {
  it('returns geojson from response', async () => {
    const geojson = { type: 'FeatureCollection', features: [{ type: 'Feature' }] }
    mockFetch.mockResolvedValueOnce(jsonResponse({ session_id: 's1', geojson }))

    const result = await loadGraphGeoJSON('s1')
    expect(result).toEqual(geojson)
  })
})

describe('createSavedRoute', () => {
  it('sends POST with route data', async () => {
    const created = { id: 'r1', name: 'My Route', destination: 'Moscow' }
    mockFetch.mockResolvedValueOnce(jsonResponse(created))

    const result = await createSavedRoute({
      name: 'My Route',
      destination: 'Moscow',
      places: [{ id: 'p1', name: 'Place 1' }],
    })

    expect(result.id).toBe('r1')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/routes'),
      expect.objectContaining({ method: 'POST' }),
    )
  })
})

describe('listSavedRoutes', () => {
  it('returns list of routes', async () => {
    const routes = [
      { id: 'r1', name: 'Route 1', destination: 'Moscow' },
      { id: 'r2', name: 'Route 2', destination: 'SPb' },
    ]
    mockFetch.mockResolvedValueOnce(jsonResponse(routes))

    const result = await listSavedRoutes()
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Route 1')
  })
})

describe('deleteSavedRoute', () => {
  it('sends DELETE with correct URL', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }))

    await deleteSavedRoute('r1')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/routes/r1'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})
