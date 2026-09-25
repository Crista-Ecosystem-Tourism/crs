import { ApiError } from './chatApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const TOKEN_KEY = 'auth_token'

// --- Types ---

export interface AuthUser {
  id: string
  email: string
  name: string | null
  is_editor: boolean
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  language: 'ru' | 'en'
}

export interface AuthResponse {
  access_token: string
  user: AuthUser
}

// --- Token storage ---

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch { /* ignore */ }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch { /* ignore */ }
}

/** Returns Authorization header if token exists */
export function getAuthHeaders(): Record<string, string> {
  const token = getToken()
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

// --- Helper ---

async function handleAuthResponse<T>(response: Response): Promise<T> {
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

// --- API ---

/** Register a new user with email and password */
export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })

  const data = await handleAuthResponse<AuthResponse>(response)
  saveToken(data.access_token)
  return data
}

/** Login with email and password */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await handleAuthResponse<AuthResponse>(response)
  saveToken(data.access_token)
  return data
}

/** Get current user info (validates token) */
export async function getMe(): Promise<AuthUser> {
  const token = getToken()
  if (!token) throw new ApiError(401, 'No token')

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (response.status === 401) {
    clearToken()
    throw new ApiError(401, 'Token expired')
  }

  return handleAuthResponse<AuthUser>(response)
}

export async function getPreferences(): Promise<UserPreferences> {
  const response = await fetch(`${API_BASE_URL}/auth/preferences`, { headers: getAuthHeaders() })
  return handleAuthResponse<UserPreferences>(response)
}

export async function savePreferences(preferences: UserPreferences, token = getToken()): Promise<UserPreferences> {
  const response = await fetch(`${API_BASE_URL}/auth/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(preferences),
  })
  return handleAuthResponse<UserPreferences>(response)
}

/** Logout — clear local token */
export function logout(): void {
  clearToken()
}
