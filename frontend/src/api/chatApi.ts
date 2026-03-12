import type { BackendMessageOut, BackendHistoryOut, SessionState } from '@/types'
import { getAuthHeaders } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const SESSION_STORAGE_KEY = 'chat_session'

// --- Error class ---

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

// --- Mock mode check ---

export function isMockMode(): boolean {
  return import.meta.env.VITE_USE_MOCKS === 'true'
}

// --- Session persistence (sessionStorage) ---

export function saveSession(session: SessionState): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch { /* ignore */ }
}

export function loadSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SessionState
  } catch {
    return null
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
  } catch { /* ignore */ }
}

// --- Helper ---

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const body = await response.json()
      detail = body.detail || body.message || detail
    } catch { /* ignore */ }
    throw new ApiError(response.status, detail)
  }
  return response.json() as Promise<T>
}

// --- API functions ---

// --- Types ---

export interface SessionListItem {
  id: string
  title: string | null
  updated_at: string | null
}

/** List all chat sessions for authenticated user */
export async function listSessions(): Promise<SessionListItem[]> {
  const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
    headers: { ...getAuthHeaders() },
  })
  return handleResponse<SessionListItem[]>(response)
}

/** Health check with 3 second timeout */
export async function checkHealth(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) return false
    const data = await response.json()
    return data.ok === true
  } catch {
    return false
  }
}

/** Create a chat session (authenticated or anonymous) */
export async function createSession(title?: string): Promise<SessionState> {
  const auth = getAuthHeaders()
  const isAnonymous = !auth.Authorization

  const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ title: title || null, anonymous: isAnonymous }),
  })

  const data = await handleResponse<{ id: string; title?: string | null; secret?: string }>(response)

  const session: SessionState = {
    sessionId: data.id,
    sessionSecret: data.secret ?? '',
  }

  saveSession(session)
  return session
}

/** Send a message to the chat session */
export async function sendMessage(
  sessionId: string,
  message: string,
  sessionSecret: string,
  generateTextResponse?: boolean
): Promise<BackendMessageOut> {
  const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      message,
      session_secret: sessionSecret,
      generate_text_response: generateTextResponse ?? true,
    }),
  })

  return handleResponse<BackendMessageOut>(response)
}

/** Update session title */
export async function updateSessionTitle(
  sessionId: string,
  title: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ title }),
  })
  await handleResponse(response)
}

/** Get chat history */
export async function getHistory(
  sessionId: string,
  sessionSecret: string,
  view?: 'short' | 'full'
): Promise<BackendHistoryOut> {
  const params = new URLSearchParams()
  params.set('session_secret', sessionSecret)
  if (view) params.set('view', view)

  const response = await fetch(
    `${API_BASE_URL}/chat/sessions/${sessionId}/history?${params.toString()}`,
    { headers: { ...getAuthHeaders() } }
  )

  return handleResponse<BackendHistoryOut>(response)
}
