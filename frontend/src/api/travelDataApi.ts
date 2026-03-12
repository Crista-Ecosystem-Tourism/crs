import type { PlaceRatingEntry, SavedRouteListItem } from '@/types'
import { getAuthHeaders } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const body = await response.json()
      detail = body.detail || body.message || detail
    } catch { /* ignore */ }
    throw new Error(detail)
  }
  return response.json() as Promise<T>
}

// --- Place ratings ---

export async function savePlaceRatings(
  sessionId: string,
  ratings: Record<string, PlaceRatingEntry>,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/place-ratings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ ratings }),
  })
  await handleResponse(response)
}

export async function loadPlaceRatings(
  sessionId: string,
): Promise<Record<string, PlaceRatingEntry> | null> {
  const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/place-ratings`, {
    headers: { ...getAuthHeaders() },
  })
  const data = await handleResponse<{ session_id: string; ratings: Record<string, PlaceRatingEntry> | null }>(response)
  return data.ratings
}

// --- Places snapshot ---

export async function savePlacesSnapshot(
  sessionId: string,
  places: Record<string, unknown>[],
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/places`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ places }),
  })
  await handleResponse(response)
}

export async function loadPlacesSnapshot(
  sessionId: string,
): Promise<Record<string, unknown>[] | null> {
  const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/places`, {
    headers: { ...getAuthHeaders() },
  })
  const data = await handleResponse<{ session_id: string; places: Record<string, unknown>[] | null }>(response)
  return data.places
}

// --- Graph GeoJSON ---

export async function saveGraphGeoJSON(
  sessionId: string,
  geojson: Record<string, unknown>,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/graph`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ geojson }),
  })
  await handleResponse(response)
}

export async function loadGraphGeoJSON(
  sessionId: string,
): Promise<Record<string, unknown> | null> {
  const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/graph`, {
    headers: { ...getAuthHeaders() },
  })
  const data = await handleResponse<{ session_id: string; geojson: Record<string, unknown> | null }>(response)
  return data.geojson
}

// --- Saved routes ---

export interface CreateSavedRoutePayload {
  name: string
  destination: string
  session_id?: string | null
  places: Record<string, unknown>[]
  graph_geojson?: Record<string, unknown> | null
}

export async function createSavedRoute(
  payload: CreateSavedRoutePayload,
): Promise<SavedRouteListItem> {
  const response = await fetch(`${API_BASE_URL}/routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  })
  return handleResponse<SavedRouteListItem>(response)
}

export async function listSavedRoutes(): Promise<SavedRouteListItem[]> {
  const response = await fetch(`${API_BASE_URL}/routes`, {
    headers: { ...getAuthHeaders() },
  })
  return handleResponse<SavedRouteListItem[]>(response)
}

export interface SavedRouteDetail {
  id: string
  name: string
  destination: string
  session_id?: string | null
  places: Record<string, unknown>[]
  graph_geojson?: Record<string, unknown> | null
  created_at?: string | null
  updated_at?: string | null
}

export async function getSavedRoute(routeId: string): Promise<SavedRouteDetail> {
  const response = await fetch(`${API_BASE_URL}/routes/${routeId}`, {
    headers: { ...getAuthHeaders() },
  })
  return handleResponse<SavedRouteDetail>(response)
}

export async function deleteSavedRoute(routeId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/routes/${routeId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  })
  await handleResponse(response)
}
