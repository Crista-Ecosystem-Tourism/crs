import { ApiError } from './chatApi'
import { getAuthHeaders } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export type GameProfile = {
  xp: number
  energy: number
}

export type OnboardingContent = {
  id: string
  country: { id: string; name: string; city: string }
  chris: { name: string; intro: string }
  scene: { title: string; mode: string }
  fact: { text: string; source_url: string }
  question: {
    id: string
    text: string
    options: Array<{ id: string; label: string }>
  }
  reward: { xp: number; stamp_title: string }
}

export type OnboardingState = {
  content: OnboardingContent
  profile: GameProfile
  completed: boolean
  starter_stamp: { key: string; title: string; earned_at: string } | null
}

export type OnboardingAnswer = {
  correct: boolean
  xp_awarded: number
  profile: GameProfile
  completed: boolean
  starter_stamp: { key: string; title: string; earned_at: string } | null
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const body = await response.json()
      detail = body.detail || detail
    } catch {
      // A non-JSON proxy response should still be reported to the user.
    }
    throw new ApiError(response.status, detail)
  }
  return response.json() as Promise<T>
}

export async function getOnboarding(): Promise<OnboardingState> {
  return parse<OnboardingState>(await fetch(`${API_BASE_URL}/game/onboarding`, {
    headers: getAuthHeaders(),
  }))
}

export async function answerRedSquare(answerKey: string): Promise<OnboardingAnswer> {
  return parse<OnboardingAnswer>(await fetch(`${API_BASE_URL}/game/onboarding/red-square/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ answer_key: answerKey }),
  }))
}
