import { ApiError } from './chatApi'
import { getAuthHeaders } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export type CommerceEntitlement = {
  key: string
  starts_at: string
  ends_at: string | null
}

export type CommerceEntitlements = {
  checkout_available: boolean
  entitlements: CommerceEntitlement[]
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const body = await response.json() as { detail?: string; message?: string }
      detail = body.detail ?? body.message ?? detail
    } catch { /* keep the status detail */ }
    throw new ApiError(response.status, detail)
  }
  return response.json() as Promise<T>
}

export async function fetchCommerceEntitlements(): Promise<CommerceEntitlements> {
  return parse<CommerceEntitlements>(await fetch(`${API_BASE_URL}/commerce/entitlements`, {
    headers: { Accept: 'application/json', ...getAuthHeaders() },
  }))
}
