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

export type AffiliateOffer = {
  id: string
  partner: string
  title: string
  destination_url: string
  terms_url: string
  status: 'draft' | 'active' | 'archived'
  updated_at: string
}

export type CommerceProduct = {
  sku: string
  kind: 'subscription' | 'expedition' | 'energy_pack' | 'cosmetic'
  title: string
  description: string | null
  price_minor: number
  currency: string
  status: 'draft' | 'active' | 'archived'
  provider_product_ref: string | null
  updated_at: string
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

export async function getEditorAffiliateOffers(): Promise<AffiliateOffer[]> {
  return parse<AffiliateOffer[]>(await fetch(`${API_BASE_URL}/commerce/editor/affiliate-offers`, {
    headers: getAuthHeaders(),
  }))
}

export async function createAffiliateOffer(input: Omit<AffiliateOffer, 'id' | 'updated_at' | 'status'>): Promise<AffiliateOffer> {
  return parse<AffiliateOffer>(await fetch(`${API_BASE_URL}/commerce/editor/affiliate-offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ ...input, status: 'draft' }),
  }))
}

export async function updateAffiliateOffer(id: string, input: Omit<AffiliateOffer, 'id' | 'updated_at'>): Promise<AffiliateOffer> {
  return parse<AffiliateOffer>(await fetch(`${API_BASE_URL}/commerce/editor/affiliate-offers/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(input),
  }))
}

export async function getEditorCatalog(): Promise<CommerceProduct[]> {
  return parse<CommerceProduct[]>(await fetch(`${API_BASE_URL}/commerce/editor/catalog`, {
    headers: getAuthHeaders(),
  }))
}

export async function createCatalogProduct(input: Omit<CommerceProduct, 'status' | 'updated_at'>): Promise<CommerceProduct> {
  return parse<CommerceProduct>(await fetch(`${API_BASE_URL}/commerce/editor/catalog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(input),
  }))
}

export async function updateCatalogProduct(sku: string, input: Omit<CommerceProduct, 'sku' | 'kind' | 'updated_at'>): Promise<CommerceProduct> {
  return parse<CommerceProduct>(await fetch(`${API_BASE_URL}/commerce/editor/catalog/${encodeURIComponent(sku)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(input),
  }))
}
