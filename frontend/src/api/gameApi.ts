import { ApiError } from './chatApi'
import { getAuthHeaders } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export type GameProfile = {
  xp: number
  energy: number
  streak: number
}

export type GameDailyProgress = {
  timezone: 'Europe/Moscow'
  streak: number
  completed_quests: number
  goal: number
  goal_reached: boolean
}

export type GamePassport = {
  profile: GameProfile
  stamps: Array<{ key: string; title: string; earned_at: string }>
  cities: Array<{ id: string; name: string; completed_quests: number; required_quest_count: number }>
  routes: Array<{ id: string; name: string; destination: string; updated_at: string | null }>
}

export type OnboardingContent = {
  id: string
  country: { id: string; name: string; city: string }
  chris: { name: string; intro: string }
  scene: { title: string; mode: string }
  fact: { text: string; source_url: string; source_label?: string }
  question: {
    id: string
    text: string
    options: Array<{ id: string; label: string }>
  }
  reward: { xp: number; stamp_title: string }
}

export type OnboardingState = {
  content: OnboardingContent
  content_language?: 'ru' | 'en'
  profile: GameProfile
  daily: GameDailyProgress
  completed: boolean
  starter_stamp: { key: string; title: string; earned_at: string } | null
}

export type OnboardingAnswer = {
  correct: boolean
  xp_awarded: number
  profile: GameProfile
  daily: GameDailyProgress
  completed: boolean
  starter_stamp: { key: string; title: string; earned_at: string } | null
}

export type MoscowQuestState = {
  quest: {
    id: string
    kind: string
    position: number
    prerequisite_quest_id: string | null
  }
  content: OnboardingContent
  content_language?: 'ru' | 'en'
  profile: GameProfile
  daily: GameDailyProgress
  completed: boolean
  stamp: { key: string; title: string; earned_at: string } | null
}

export type MoscowQuestAnswer = {
  correct: boolean
  xp_awarded: number
  profile: GameProfile
  daily: GameDailyProgress
  completed: boolean
  stamp: { key: string; title: string; earned_at: string } | null
  explanation: string
}

/** Generic city paths use the same server-owned lesson contract as Moscow. */
export type CityPathState = MoscowPathState
export type CityQuestState = MoscowQuestState
export type CityQuestAnswer = MoscowQuestAnswer

export type MoscowPathState = {
  city: {
    id: string
    name: string
    tier: number
    required_quest_count: number
    completion_stamp: { key: string; title: string } | null
  }
  profile: GameProfile
  daily: GameDailyProgress
  nodes: Array<{
    id: string
    kind: string
    position: number
    completed: boolean
    unlocked: boolean
    prerequisite_quest_id: string | null
    district: { id: string; name: string; position: number } | null
  }>
  boss: {
    title: string
    question_count: number
    unlocked: boolean
    completed: boolean
    sandbox_unlocked: boolean
  } | null
}

export type MoscowBossState = {
  city: { id: string; name: string }
  content_language?: 'ru' | 'en'
  content: {
    chris: { name: string; intro: string }
    scene: { title: string; mode: string }
    questions: Array<{
      id: string
      text: string
      options: Array<{ id: string; label: string }>
      explanation?: string
    }>
    sources?: Array<{ label: string; url: string }>
  }
  profile: GameProfile
  daily: GameDailyProgress
  completed: boolean
  city_stamp: { key: string; title: string; earned_at: string } | null
  sandbox_unlocked: boolean
}

export type MoscowBossAnswer = {
  correct: boolean
  incorrect_answers: number
  profile: GameProfile
  daily: GameDailyProgress
  completed: boolean
  city_stamp: { key: string; title: string; earned_at: string } | null
  sandbox_unlocked: boolean
  feedback: Array<{ question_id: string; correct: boolean; explanation: string }>
}

export type MoscowSandboxState = {
  city: { id: string; name: string }
  content_language?: 'ru' | 'en'
  lesson_content_language?: 'ru' | 'en'
  activity_content_language?: 'ru' | 'en'
  wiki_content_language?: 'ru' | 'en' | null
  profile: GameProfile
  city_stamp: { key: string; title: string; earned_at: string }
  lessons: Array<{
    id: string
    position: number
    title: string
    fact: { text: string; source_url: string; source_label?: string }
    question: { id: string; text: string; options: Array<{ id: string; label: string }> }
    explanation: string
    wiki_reference: { slug: string; version_id: string } | null
  }>
  drill: {
    title: string
    intro: string
    statements: Array<{ id: string; text: string }>
  } | null
  matching: {
    title: string
    intro: string
    pairs: Array<{ id: string; left: string }>
    choices: Array<{ id: string; label: string }>
  } | null
  timeline: {
    title: string
    intro: string
    items: Array<{ id: string; label: string }>
  } | null
  word_blocks: {
    title: string
    intro: string
    blocks: Array<{ id: string; label: string }>
  } | null
  price_slider: {
    title: string
    intro: string
    question: string
    fact_date: string
    unit: string
    min: number
    max: number
    step: number
  } | null
  story: {
    title: string
    eyebrow: string
    image_url: string
    image_alt: string
    media_credit: string
    fact: string
    source_label: string
    source_url: string
    note: string
  } | null
  photo_scanner: {
    title: string
    intro: string
    question: string
    image_url: string
    image_alt: string
    media_credit: string
    media_source_url: string
    license: string
    field_note: string
    hotspots: Array<{ id: string; x: number; y: number; width: number; height: number }>
  } | null
  wiki_reference: { slug: string; version_id: string } | null
  practice_recovery: { available: boolean; used_today: boolean; amount: number }
}

export type TruthMythAnswer = {
  correct: boolean
  explanation: string
  profile: GameProfile
}

export type MoscowMatchingAnswer = {
  correct: boolean
  incorrect_pairs: string[]
  feedback: Array<{ pair_id: string; correct: boolean; explanation: string }>
  profile: GameProfile
}

export type MoscowTimelineAnswer = {
  correct: boolean
  expected_order: string[] | null
  feedback: Array<{ item_id: string; correct: boolean; explanation: string }>
  profile: GameProfile
}

export type MoscowWordBlocksAnswer = {
  correct: boolean
  explanation: string
  profile: GameProfile
}

export type MoscowPriceSliderAnswer = {
  correct: boolean
  explanation: string
  profile: GameProfile
}

export type MoscowPhotoScannerAnswer = {
  correct: boolean
  explanation: string
  profile: GameProfile
}

export type MoscowPracticeRecovery = {
  profile: GameProfile
  practice_recovery: { available: boolean; used_today: boolean; amount: number }
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

export async function getOnboarding(language: 'ru' | 'en' = 'ru'): Promise<OnboardingState> {
  const params = new URLSearchParams({ language })
  return parse<OnboardingState>(await fetch(`${API_BASE_URL}/game/onboarding?${params}`, {
    headers: getAuthHeaders(),
  }))
}

export async function getGamePassport(): Promise<GamePassport> {
  return parse<GamePassport>(await fetch(`${API_BASE_URL}/game/passport`, {
    headers: getAuthHeaders(),
  }))
}

export async function createMiniSiteStampTicket(stampKeys: string[]): Promise<{ ticket: string }> {
  return parse<{ ticket: string }>(await fetch(`${API_BASE_URL}/game/passport/mini-site-ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ stamp_keys: stampKeys }),
  }))
}

export async function answerRedSquare(answerKey: string): Promise<OnboardingAnswer> {
  return parse<OnboardingAnswer>(await fetch(`${API_BASE_URL}/game/onboarding/red-square/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ answer_key: answerKey }),
  }))
}

export async function getMoscowQuest(questId: string, language: 'ru' | 'en' = 'ru'): Promise<MoscowQuestState> {
  const params = new URLSearchParams({ language })
  return parse<MoscowQuestState>(await fetch(`${API_BASE_URL}/game/paths/moscow/quests/${questId}?${params}`, {
    headers: getAuthHeaders(),
  }))
}

export async function getMoscowPath(): Promise<MoscowPathState> {
  return parse<MoscowPathState>(await fetch(`${API_BASE_URL}/game/paths/moscow`, {
    headers: getAuthHeaders(),
  }))
}

export async function getCityPath(cityId: string): Promise<CityPathState> {
  return parse<CityPathState>(await fetch(`${API_BASE_URL}/game/paths/${cityId}`, {
    headers: getAuthHeaders(),
  }))
}

export async function getCityQuest(cityId: string, questId: string, language: 'ru' | 'en' = 'ru'): Promise<CityQuestState> {
  const params = new URLSearchParams({ language })
  return parse<CityQuestState>(await fetch(`${API_BASE_URL}/game/paths/${cityId}/quests/${questId}?${params}`, {
    headers: getAuthHeaders(),
  }))
}

export async function answerCityQuest(cityId: string, questId: string, answerKey: string, language: 'ru' | 'en' = 'ru'): Promise<CityQuestAnswer> {
  const params = new URLSearchParams({ language })
  return parse<CityQuestAnswer>(await fetch(`${API_BASE_URL}/game/paths/${cityId}/quests/${questId}/answer?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ answer_key: answerKey }),
  }))
}

export async function answerMoscowQuest(questId: string, answerKey: string, language: 'ru' | 'en' = 'ru'): Promise<MoscowQuestAnswer> {
  const params = new URLSearchParams({ language })
  return parse<MoscowQuestAnswer>(await fetch(`${API_BASE_URL}/game/paths/moscow/quests/${questId}/answer?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ answer_key: answerKey }),
  }))
}

export async function getMoscowBoss(language: 'ru' | 'en' = 'ru'): Promise<MoscowBossState> {
  const params = new URLSearchParams({ language })
  return parse<MoscowBossState>(await fetch(`${API_BASE_URL}/game/paths/moscow/boss?${params}`, {
    headers: getAuthHeaders(),
  }))
}

export async function getMoscowSandbox(language: 'ru' | 'en' = 'ru'): Promise<MoscowSandboxState> {
  const params = new URLSearchParams({ language })
  return parse<MoscowSandboxState>(await fetch(`${API_BASE_URL}/game/paths/moscow/sandbox?${params}`, {
    headers: getAuthHeaders(),
  }))
}

export async function answerMoscowTruthMyth(
  statementId: string,
  answerKey: 'truth' | 'myth',
  language: 'ru' | 'en' = 'ru',
): Promise<TruthMythAnswer> {
  const params = new URLSearchParams({ language })
  return parse<TruthMythAnswer>(await fetch(`${API_BASE_URL}/game/paths/moscow/sandbox/truth-myth/answer?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ statement_id: statementId, answer_key: answerKey }),
  }))
}

export async function answerMoscowMatching(
  answers: Array<{ pair_id: string; choice_id: string }>,
  language: 'ru' | 'en' = 'ru',
): Promise<MoscowMatchingAnswer> {
  const params = new URLSearchParams({ language })
  return parse<MoscowMatchingAnswer>(await fetch(`${API_BASE_URL}/game/paths/moscow/sandbox/matching/answer?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ answers }),
  }))
}

export async function answerMoscowTimeline(orderedIds: string[], language: 'ru' | 'en' = 'ru'): Promise<MoscowTimelineAnswer> {
  const params = new URLSearchParams({ language })
  return parse<MoscowTimelineAnswer>(await fetch(`${API_BASE_URL}/game/paths/moscow/sandbox/timeline/answer?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ ordered_ids: orderedIds }),
  }))
}

export async function answerMoscowWordBlocks(orderedIds: string[], language: 'ru' | 'en' = 'ru'): Promise<MoscowWordBlocksAnswer> {
  const params = new URLSearchParams({ language })
  return parse<MoscowWordBlocksAnswer>(await fetch(`${API_BASE_URL}/game/paths/moscow/sandbox/word-blocks/answer?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ ordered_ids: orderedIds }),
  }))
}

export async function answerMoscowPriceSlider(value: number, language: 'ru' | 'en' = 'ru'): Promise<MoscowPriceSliderAnswer> {
  const params = new URLSearchParams({ language })
  return parse<MoscowPriceSliderAnswer>(await fetch(`${API_BASE_URL}/game/paths/moscow/sandbox/price-slider/answer?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ value }),
  }))
}

export async function answerMoscowPhotoScanner(hotspotId: string, language: 'ru' | 'en' = 'ru'): Promise<MoscowPhotoScannerAnswer> {
  const params = new URLSearchParams({ language })
  return parse<MoscowPhotoScannerAnswer>(await fetch(`${API_BASE_URL}/game/paths/moscow/sandbox/photo-scanner/answer?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ hotspot_id: hotspotId }),
  }))
}

export async function restoreMoscowEnergy(): Promise<MoscowPracticeRecovery> {
  return parse<MoscowPracticeRecovery>(await fetch(`${API_BASE_URL}/game/paths/moscow/sandbox/restore-energy`, {
    method: 'POST',
    headers: getAuthHeaders(),
  }))
}

export async function answerMoscowBoss(
  answers: Array<{ question_id: string; answer_key: string }>,
  language: 'ru' | 'en' = 'ru',
): Promise<MoscowBossAnswer> {
  const params = new URLSearchParams({ language })
  return parse<MoscowBossAnswer>(await fetch(`${API_BASE_URL}/game/paths/moscow/boss/answer?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ answers }),
  }))
}
