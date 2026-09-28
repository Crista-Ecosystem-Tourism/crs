import { ApiError } from './chatApi'
import { getAuthHeaders } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export type PriceWatchAlert = {
  id: string
  subject_key: string
  amount_minor: number
  currency: string
  created_at: string
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try { detail = (await response.json()).detail || detail } catch { /* proxy or HTML response */ }
    throw new ApiError(response.status, detail)
  }
  return response.json() as Promise<T>
}

export async function listPriceWatchAlerts(): Promise<PriceWatchAlert[]> {
  return parse<PriceWatchAlert[]>(await fetch(`${API_BASE_URL}/prices/alerts`, {
    headers: getAuthHeaders(),
  }))
}
