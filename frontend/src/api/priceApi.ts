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

export type PriceWatch = {
  id: string
  subject_key: string
  threshold_minor: number
  currency: string
  active: boolean
}

export type PriceBudgetPlan = {
  status: 'feasible' | 'compromise' | 'infeasible' | 'unknown'
  budget_minor: number
  currency: string
  total_minor?: number
  remaining_minor?: number
  missing?: string[]
  currency_mismatch?: string[]
  included?: string[]
  excluded?: string[]
  unavailable?: string[]
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

export async function listPriceWatches(): Promise<PriceWatch[]> {
  return parse<PriceWatch[]>(await fetch(`${API_BASE_URL}/prices/watches`, {
    headers: getAuthHeaders(),
  }))
}

export async function savePriceWatch(payload: Pick<PriceWatch, 'subject_key' | 'threshold_minor' | 'currency'>): Promise<PriceWatch> {
  return parse<PriceWatch>(await fetch(`${API_BASE_URL}/prices/watches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  }))
}

export async function unsubscribePriceWatch(watchId: string): Promise<void> {
  await parse<void>(await fetch(`${API_BASE_URL}/prices/watches/${encodeURIComponent(watchId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }))
}

export async function planPriceBudget(payload: {
  budget_minor: number
  currency: string
  required_subject_keys: string[]
  optional_subject_keys: string[]
}): Promise<PriceBudgetPlan> {
  return parse<PriceBudgetPlan>(await fetch(`${API_BASE_URL}/prices/budget-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  }))
}
