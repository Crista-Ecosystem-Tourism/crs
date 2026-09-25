import { ApiError } from './chatApi'
import { getAuthHeaders } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export type MediaAsset = {
  id: string
  quest_id: string
  content_type: 'image/jpeg' | 'video/mp4' | 'video/webm'
  byte_size: number
  width: number
  height: number
  duration_seconds: number | null
  created_at: string
  exif: 'stripped'
  visibility: 'private'
  preview_url: string
  file_url: string
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try { detail = (await response.json()).detail || detail } catch { /* proxy response */ }
    throw new ApiError(response.status, detail)
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

export async function getMyMedia(): Promise<MediaAsset[]> {
  return parse(await fetch(`${API_BASE_URL}/media/mine`, { headers: getAuthHeaders() }))
}

export async function uploadQuestMedia(questId: string, file: File): Promise<MediaAsset> {
  const body = new FormData()
  body.set('file', file)
  return parse(await fetch(`${API_BASE_URL}/media?quest_id=${encodeURIComponent(questId)}`, {
    method: 'POST', headers: getAuthHeaders(), body,
  }))
}

export async function fetchMediaPreview(asset: MediaAsset): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${asset.preview_url}`, { headers: getAuthHeaders() })
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try { detail = (await response.json()).detail || detail } catch { /* proxy response */ }
    throw new ApiError(response.status, detail)
  }
  return response.blob()
}

export async function fetchMediaFile(asset: MediaAsset): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${asset.file_url}`, { headers: getAuthHeaders() })
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try { detail = (await response.json()).detail || detail } catch { /* proxy response */ }
    throw new ApiError(response.status, detail)
  }
  return response.blob()
}

export async function deleteMedia(assetId: string): Promise<void> {
  return parse(await fetch(`${API_BASE_URL}/media/${encodeURIComponent(assetId)}`, {
    method: 'DELETE', headers: getAuthHeaders(),
  }))
}
