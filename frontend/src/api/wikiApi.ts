import { ApiError } from './chatApi'
import { getAuthHeaders } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export type WikiSource = { label: string; url: string }

export type WikiPublishedArticle = {
  version_id: string
  slug: string
  title: string
  body: Record<string, unknown>
  sources: WikiSource[]
  license: string
  published_at: string | null
  content_language?: 'ru' | 'en'
}

export type WikiDraft = {
  id: string
  slug: string
  status: 'draft' | 'review' | 'published'
  title: string
  body: Record<string, unknown>
  sources: WikiSource[]
  license: string
  updated_at: string
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try { detail = (await response.json()).detail || detail } catch { /* proxy or HTML response */ }
    throw new ApiError(response.status, detail)
  }
  return response.json() as Promise<T>
}

export async function getWikiArticle(slug: string, language: 'ru' | 'en' = 'ru'): Promise<WikiPublishedArticle> {
  const params = new URLSearchParams({ language })
  return parse<WikiPublishedArticle>(await fetch(`${API_BASE_URL}/wiki/articles/${slug}?${params}`))
}

export async function getWikiArticleVersion(versionId: string): Promise<WikiPublishedArticle> {
  return parse<WikiPublishedArticle>(await fetch(`${API_BASE_URL}/wiki/versions/${versionId}`))
}

export async function getMyWikiDrafts(): Promise<WikiDraft[]> {
  return parse<WikiDraft[]>(await fetch(`${API_BASE_URL}/wiki/drafts/mine`, {
    headers: getAuthHeaders(),
  }))
}

export async function getWikiReviewQueue(): Promise<WikiDraft[]> {
  return parse<WikiDraft[]>(await fetch(`${API_BASE_URL}/wiki/review`, {
    headers: getAuthHeaders(),
  }))
}

export async function publishWikiDraft(versionId: string): Promise<WikiPublishedArticle> {
  return parse<WikiPublishedArticle>(await fetch(`${API_BASE_URL}/wiki/review/${versionId}/publish`, {
    method: 'POST',
    headers: getAuthHeaders(),
  }))
}

export async function createWikiDraft(input: {
  slug: string
  title: string
  body: Record<string, unknown>
  sources: WikiSource[]
  license: string
}): Promise<WikiDraft> {
  return parse<WikiDraft>(await fetch(`${API_BASE_URL}/wiki/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(input),
  }))
}

export async function submitWikiDraft(versionId: string): Promise<WikiDraft> {
  return parse<WikiDraft>(await fetch(`${API_BASE_URL}/wiki/drafts/${versionId}/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
  }))
}
