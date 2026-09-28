import { ApiError } from './chatApi'
import { getAuthHeaders } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export type StarRoutePoi = {
  position: number
  segment_id: string
  poi_id: string | null
  name: string
  latitude: number
  longitude: number
  source_url: string
  timecode: {
    start_seconds: number
    end_seconds: number
    excerpt: string
    extracted_place_name: string
  }
}

export type PublishedStarRoute = {
  id: string
  source_url: string
  source_title: string
  source_author: string | null
  rights_basis: 'owned' | 'licensed' | 'written_permission'
  title: string
  destination: string
  pois: StarRoutePoi[]
  route_geojson: Record<string, unknown>
  status: 'published'
  published_at: string
}

export type ReviewStarRoute = Omit<PublishedStarRoute, 'status' | 'published_at'> & { status: 'review'; published_at: null }
export type StarRouteTranscript = { id: string; title: string; source_url: string; author_name: string | null; rights_basis: 'owned' | 'licensed' | 'written_permission'; registered_at: string }
export type StarRouteSegment = { id: string; transcript_id: string; start_seconds: number; end_seconds: number; excerpt: string; extracted_place_name: string }
export type StarRoutePoiInput = { segment_id: string; poi_id?: string; name: string; latitude: number; longitude: number; source_url: string }

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try { detail = (await response.json()).detail || detail } catch { /* proxy or HTML response */ }
    throw new ApiError(response.status, detail)
  }
  return response.json() as Promise<T>
}

export async function getPublishedStarRoutes(): Promise<PublishedStarRoute[]> {
  return parse<PublishedStarRoute[]>(await fetch(`${API_BASE_URL}/star-routes`))
}

export async function getPublishedStarRoute(routeId: string): Promise<PublishedStarRoute> {
  return parse<PublishedStarRoute>(await fetch(`${API_BASE_URL}/star-routes/${encodeURIComponent(routeId)}`))
}

export async function getStarRouteReviewQueue(): Promise<ReviewStarRoute[]> {
  return parse<ReviewStarRoute[]>(await fetch(`${API_BASE_URL}/star-routes/review`, { headers: getAuthHeaders() }))
}

export async function publishStarRoute(routeId: string): Promise<PublishedStarRoute> {
  return parse<PublishedStarRoute>(await fetch(`${API_BASE_URL}/star-routes/review/${encodeURIComponent(routeId)}/publish`, { method: 'POST', headers: getAuthHeaders() }))
}

export async function registerStarRouteTranscript(payload: Pick<StarRouteTranscript, 'title' | 'source_url' | 'author_name' | 'rights_basis'>): Promise<StarRouteTranscript> {
  return parse<StarRouteTranscript>(await fetch(`${API_BASE_URL}/star-routes/transcripts`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(payload) }))
}

export async function addStarRouteSegment(transcriptId: string, payload: Omit<StarRouteSegment, 'id' | 'transcript_id'>): Promise<StarRouteSegment> {
  return parse<StarRouteSegment>(await fetch(`${API_BASE_URL}/star-routes/transcripts/${encodeURIComponent(transcriptId)}/segments`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(payload) }))
}

export async function createStarRouteCandidate(payload: { transcript_id: string; title: string; destination: string; pois: StarRoutePoiInput[] }): Promise<ReviewStarRoute> {
  return parse<ReviewStarRoute>(await fetch(`${API_BASE_URL}/star-routes/candidates`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(payload) }))
}
