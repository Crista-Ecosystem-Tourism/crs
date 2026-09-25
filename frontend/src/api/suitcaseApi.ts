import type { SuitcaseExpense, SuitcaseGoal, SuitcaseTrip } from '@/types/suitcase'
import { ApiError } from '@/api/chatApi'
import { getAuthHeaders } from '@/api/authApi'

const SUITCASE_API_BASE_URL =
  import.meta.env.VITE_SUITCASE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const body = await response.json() as { detail?: string; message?: string }
      detail = typeof body.detail === 'string' ? body.detail : body.message ?? detail
    } catch {
      /* ignore */
    }
    throw new ApiError(response.status, detail)
  }
  return response.json() as Promise<T>
}

// --- API shapes (snake_case) ---

export type ApiSuitcaseTripRow = {
  id: string
  country: string
  city: string
  start_date: string
  end_date: string
  image?: string | null
  mood?: string | null
  route_json?: string | null
  impressions?: string | null
  photos?: string[] | null
  is_archived: boolean
  created_at?: string | null
  updated_at?: string | null
}

export type ApiSuitcaseExpenseRow = {
  id: string
  trip_id: string
  amount: number
  category: string
  title: string
  date: string
  currency?: string | null
}

export type ApiSuitcaseGoalRow = {
  id: string
  title: string
  current: number
  total: number
  color: string
}

export type ApiSuitcaseWorkspace = {
  trips: ApiSuitcaseTripRow[]
  expenses: ApiSuitcaseExpenseRow[]
  goals: ApiSuitcaseGoalRow[]
}

export type MiniSitePoint = {
  latitude: number
  longitude: number
  name?: string
  note?: string
  photos?: string[]
}

export type MiniSiteGameStamp = {
  key: string
  title: string
  earned_at: string
  fact: string
  source_label: string | null
  source_url: string | null
}

export type TripMiniSiteSnapshot = {
  title: string
  city: string
  country: string
  start_date: string
  end_date: string
  cover: string | null
  summary: string
  photos: string[]
  points: MiniSitePoint[]
  game_stamps?: MiniSiteGameStamp[]
  stats: { days: number; places_visited: number; distance_km: number }
}

export type TripMiniSiteState = {
  published: boolean
  draft_ready?: boolean
  slug: string | null
  visibility: 'public' | 'link' | null
  consented_at: string | null
  completed_at?: string | null
  draft_snapshot?: TripMiniSiteSnapshot | null
  preview_snapshot?: TripMiniSiteSnapshot | null
  published_snapshot?: TripMiniSiteSnapshot | null
}

export type PublicTripMiniSite = {
  visibility: 'public' | 'link'
  snapshot: TripMiniSiteSnapshot
}

export function mapTripFromApi(r: ApiSuitcaseTripRow): SuitcaseTrip {
  return {
    id: r.id,
    country: r.country,
    city: r.city,
    startDate: r.start_date,
    endDate: r.end_date,
    image: r.image ?? undefined,
    mood: r.mood ?? undefined,
    routeJson: r.route_json ?? undefined,
    impressions: r.impressions ?? undefined,
    photos: r.photos ?? undefined,
    isArchived: r.is_archived,
    createdAt: r.created_at ?? '',
  }
}

export function mapExpenseFromApi(r: ApiSuitcaseExpenseRow): SuitcaseExpense {
  return {
    id: r.id,
    tripId: r.trip_id,
    amount: r.amount,
    category: r.category,
    title: r.title,
    date: r.date,
    currency: r.currency ?? undefined,
  }
}

export function mapGoalFromApi(r: ApiSuitcaseGoalRow): SuitcaseGoal {
  return {
    id: r.id,
    title: r.title,
    current: r.current,
    total: r.total,
    color: r.color,
  }
}

function tripPatchToApi(patch: Partial<SuitcaseTrip>): Record<string, unknown> {
  const o: Record<string, unknown> = {}
  if (patch.country !== undefined) o.country = patch.country
  if (patch.city !== undefined) o.city = patch.city
  if (patch.startDate !== undefined) o.start_date = patch.startDate
  if (patch.endDate !== undefined) o.end_date = patch.endDate
  if (patch.image !== undefined) o.image = patch.image
  if (patch.mood !== undefined) o.mood = patch.mood
  if (patch.routeJson !== undefined) o.route_json = patch.routeJson
  if (patch.impressions !== undefined) o.impressions = patch.impressions
  if (patch.photos !== undefined) o.photos = patch.photos
  if (patch.isArchived !== undefined) o.is_archived = patch.isArchived
  return o
}

export async function fetchSuitcaseWorkspace(): Promise<ApiSuitcaseWorkspace> {
  const response = await fetch(`${SUITCASE_API_BASE_URL}/suitcase/workspace`, {
    headers: { Accept: 'application/json', ...getAuthHeaders() },
  })
  return parseResponse<ApiSuitcaseWorkspace>(response)
}

export async function createSuitcaseTrip(payload: Omit<SuitcaseTrip, 'id' | 'createdAt'>): Promise<ApiSuitcaseTripRow> {
  const body = {
    country: payload.country,
    city: payload.city,
    start_date: payload.startDate,
    end_date: payload.endDate,
    image: payload.image,
    mood: payload.mood,
    route_json: payload.routeJson,
    impressions: payload.impressions,
    photos: payload.photos,
    is_archived: payload.isArchived ?? false,
  }
  const response = await fetch(`${SUITCASE_API_BASE_URL}/suitcase/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  })
  return parseResponse<ApiSuitcaseTripRow>(response)
}

export async function patchSuitcaseTrip(tripId: string, patch: Partial<SuitcaseTrip>): Promise<ApiSuitcaseTripRow> {
  const response = await fetch(`${SUITCASE_API_BASE_URL}/suitcase/trips/${encodeURIComponent(tripId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(tripPatchToApi(patch)),
  })
  return parseResponse<ApiSuitcaseTripRow>(response)
}

export async function deleteSuitcaseTrip(tripId: string): Promise<void> {
  const response = await fetch(`${SUITCASE_API_BASE_URL}/suitcase/trips/${encodeURIComponent(tripId)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json', ...getAuthHeaders() },
  })
  await parseResponse<{ ok: boolean }>(response)
}

export async function getTripMiniSite(tripId: string): Promise<TripMiniSiteState> {
  const response = await fetch(`${SUITCASE_API_BASE_URL}/suitcase/trips/${encodeURIComponent(tripId)}/mini-site`, {
    headers: { Accept: 'application/json', ...getAuthHeaders() },
  })
  return parseResponse<TripMiniSiteState>(response)
}

export async function completeTripForMiniSite(tripId: string, gameStampTicket?: string): Promise<TripMiniSiteState> {
  const response = await fetch(`${SUITCASE_API_BASE_URL}/suitcase/trips/${encodeURIComponent(tripId)}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeaders() },
    ...(gameStampTicket ? { body: JSON.stringify({ game_stamp_ticket: gameStampTicket }) } : {}),
  })
  return parseResponse<TripMiniSiteState>(response)
}

export async function publishTripMiniSite(
  tripId: string,
  visibility: 'public' | 'link',
  gameStampTicket?: string,
): Promise<TripMiniSiteState> {
  const response = await fetch(`${SUITCASE_API_BASE_URL}/suitcase/trips/${encodeURIComponent(tripId)}/mini-site`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ visibility, consent_to_publish: true, ...(gameStampTicket ? { game_stamp_ticket: gameStampTicket } : {}) }),
  })
  return parseResponse<TripMiniSiteState>(response)
}

export async function revokeTripMiniSite(tripId: string): Promise<void> {
  const response = await fetch(`${SUITCASE_API_BASE_URL}/suitcase/trips/${encodeURIComponent(tripId)}/mini-site`, {
    method: 'DELETE',
    headers: { Accept: 'application/json', ...getAuthHeaders() },
  })
  await parseResponse<{ ok: boolean }>(response)
}

export async function fetchPublicTripMiniSite(slug: string): Promise<PublicTripMiniSite> {
  const response = await fetch(`${SUITCASE_API_BASE_URL}/t/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
  })
  return parseResponse<PublicTripMiniSite>(response)
}

export async function createSuitcaseExpense(
  tripId: string,
  payload: Omit<SuitcaseExpense, 'id'>
): Promise<ApiSuitcaseExpenseRow> {
  const response = await fetch(
    `${SUITCASE_API_BASE_URL}/suitcase/trips/${encodeURIComponent(tripId)}/expenses`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        amount: payload.amount,
        category: payload.category,
        title: payload.title,
        date: payload.date,
        currency: payload.currency,
      }),
    }
  )
  return parseResponse<ApiSuitcaseExpenseRow>(response)
}

export async function deleteSuitcaseExpense(expenseId: string): Promise<void> {
  const response = await fetch(`${SUITCASE_API_BASE_URL}/suitcase/expenses/${encodeURIComponent(expenseId)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json', ...getAuthHeaders() },
  })
  await parseResponse<{ ok: boolean }>(response)
}

export async function patchSuitcaseGoal(goalId: string, patch: { current?: number; title?: string; total?: number; color?: string }): Promise<ApiSuitcaseGoalRow> {
  const response = await fetch(`${SUITCASE_API_BASE_URL}/suitcase/goals/${encodeURIComponent(goalId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(patch),
  })
  return parseResponse<ApiSuitcaseGoalRow>(response)
}

export async function createSuitcaseGoal(payload: Omit<SuitcaseGoal, 'id'>): Promise<ApiSuitcaseGoalRow> {
  const response = await fetch(`${SUITCASE_API_BASE_URL}/suitcase/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      title: payload.title,
      current: payload.current,
      total: payload.total,
      color: payload.color,
    }),
  })
  return parseResponse<ApiSuitcaseGoalRow>(response)
}
