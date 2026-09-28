import { ApiError } from './chatApi'

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

export async function getPublishedStarRoutes(): Promise<PublishedStarRoute[]> {
  const response = await fetch(`${API_BASE_URL}/star-routes`)
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try { detail = (await response.json()).detail || detail } catch { /* proxy or HTML response */ }
    throw new ApiError(response.status, detail)
  }
  return response.json() as Promise<PublishedStarRoute[]>
}

export async function getPublishedStarRoute(routeId: string): Promise<PublishedStarRoute> {
  const response = await fetch(`${API_BASE_URL}/star-routes/${encodeURIComponent(routeId)}`)
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try { detail = (await response.json()).detail || detail } catch { /* proxy or HTML response */ }
    throw new ApiError(response.status, detail)
  }
  return response.json() as Promise<PublishedStarRoute>
}
