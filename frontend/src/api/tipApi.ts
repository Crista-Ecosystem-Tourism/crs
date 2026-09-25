import { ApiError } from './chatApi'
import { getAuthHeaders } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export type TipStatus = 'draft' | 'review' | 'published' | 'rejected' | 'hidden'
export type TipReportReason = 'inaccurate' | 'unsafe' | 'spam' | 'copyright' | 'other'

export type GameTip = {
  id: string
  quest_id: string
  author_name: string | null
  body: string
  status: TipStatus
  created_at: string
  updated_at: string
  submitted_at: string | null
  decision_note?: string | null
}

export type TipReport = {
  id: string
  tip_id: string
  quest_id: string
  tip_body: string
  reason: TipReportReason
  details: string | null
  status: 'pending' | 'resolved' | 'dismissed'
  reporter_name: string
  created_at: string
}

export type TipAuditEntry = {
  id: string
  tip_id: string | null
  report_id: string | null
  actor_name: string | null
  action: string
  details: Record<string, unknown>
  created_at: string
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try { detail = (await response.json()).detail || detail } catch { /* proxy or HTML response */ }
    throw new ApiError(response.status, detail)
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

export async function getPublishedTips(questId: string): Promise<GameTip[]> {
  return parse(await fetch(`${API_BASE_URL}/tips/quest/${encodeURIComponent(questId)}`))
}

export async function getMyTips(): Promise<GameTip[]> {
  return parse(await fetch(`${API_BASE_URL}/tips/mine`, { headers: getAuthHeaders() }))
}

export async function createTipDraft(questId: string, text: string): Promise<GameTip> {
  return parse(await fetch(`${API_BASE_URL}/tips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ quest_id: questId, text }),
  }))
}

export async function updateTipDraft(tipId: string, text: string): Promise<GameTip> {
  return parse(await fetch(`${API_BASE_URL}/tips/${encodeURIComponent(tipId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ text }),
  }))
}

export async function deleteTipDraft(tipId: string): Promise<void> {
  return parse(await fetch(`${API_BASE_URL}/tips/${encodeURIComponent(tipId)}`, {
    method: 'DELETE', headers: getAuthHeaders(),
  }))
}

export async function submitTip(tipId: string): Promise<GameTip> {
  return parse(await fetch(`${API_BASE_URL}/tips/${encodeURIComponent(tipId)}/submit`, {
    method: 'POST', headers: getAuthHeaders(),
  }))
}

export async function reportTip(tipId: string, reason: TipReportReason, details: string): Promise<{ id: string; status: string }> {
  return parse(await fetch(`${API_BASE_URL}/tips/${encodeURIComponent(tipId)}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ reason, details }),
  }))
}

export async function getTipReviewQueue(): Promise<GameTip[]> {
  return parse(await fetch(`${API_BASE_URL}/tips/moderation/review`, { headers: getAuthHeaders() }))
}

export async function decideTip(tipId: string, decision: 'publish' | 'reject' | 'hide', note: string): Promise<GameTip> {
  return parse(await fetch(`${API_BASE_URL}/tips/moderation/${encodeURIComponent(tipId)}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ decision, note }),
  }))
}

export async function getTipReports(): Promise<TipReport[]> {
  return parse(await fetch(`${API_BASE_URL}/tips/moderation/reports`, { headers: getAuthHeaders() }))
}

export async function resolveTipReport(reportId: string, resolution: 'dismiss' | 'hide_tip', note: string): Promise<{ id: string; status: string }> {
  return parse(await fetch(`${API_BASE_URL}/tips/moderation/reports/${encodeURIComponent(reportId)}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ resolution, note }),
  }))
}

export async function getTipAudit(): Promise<TipAuditEntry[]> {
  return parse(await fetch(`${API_BASE_URL}/tips/moderation/audit`, { headers: getAuthHeaders() }))
}
