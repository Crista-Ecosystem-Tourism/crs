// Core domain types for Crista Online v2

// Map place with coordinates
export interface Place {
  id: string
  name: string
  description: string
  type: 'attraction' | 'restaurant' | 'hotel' | 'nature' | 'culture' | 'entertainment'
  coordinates: [number, number] // [lat, lng]
  imageUrl?: string
  rating?: number
  address?: string
  selected?: boolean
  userRating?: number
  score?: number // 1-5 баллов для паутинки мест
  priceRange?: string
  duration?: string
}

// Chat message
export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
  places?: Place[] // Places mentioned in this message
  cityName?: string
  itinerary?: ItineraryDay[]
  suggestedReplies?: SuggestedReplyGroup[]
  followUpQuestions?: string[]
}

// Itinerary types
export interface ItinerarySlot {
  time_label: string     // "Утро", "Обед", "Вечер" — свободный текст
  place_id: string       // ID места из search_results
  place_name: string     // Название места
  note: string           // Рекомендация от LLM
  place?: Place          // Resolved Place object (заполняется маппером)
}

export interface ItineraryDay {
  day: number
  title: string
  slots: ItinerarySlot[]
}

export interface BackendItinerary {
  days: ItineraryDay[]
  summary: string
}

// User state
export type AuthState = 'guest' | 'registered' | 'subscribed'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  authState: AuthState
  subscription?: SubscriptionPlan
}

// Subscription plans
export type SubscriptionPlan = 'basic' | 'pro' | 'premium'

export interface PlanDetails {
  id: SubscriptionPlan
  name: string
  price: number
  priceLabel: string
  features: string[]
  popular?: boolean
}

// Saved route
export interface SavedRoute {
  id: string
  name: string
  destination: string
  days: number
  places: Place[]
  createdAt: string
}

// Modal states
export type ModalType = 'auth' | 'subscription' | 'payment' | 'save-route' | null

// Quick reply chips
export interface SuggestedReplyOption {
  value: string
  label: string
  description: string
}

export interface SuggestedReplyGroup {
  category: string
  label: string
  icon: string
  options: SuggestedReplyOption[]
  allow_custom: boolean
}

// Place rating entry (for persistence)
export interface PlaceRatingEntry {
  rating?: number | null
  score?: number | null
  selected: boolean
}

// Saved route list item from API
export interface SavedRouteListItem {
  id: string
  name: string
  destination: string
  created_at?: string | null
  updated_at?: string | null
}

// === Backend API types ===

export interface BackendPlace {
  id?: string | null
  name?: string | null
  city?: string | null
  country?: string | null
  description?: string | null
  latitude?: number | null
  longitude?: number | null
  rating?: number | null
  review_count?: number | null
  subtype?: string | null
  activities?: string | null
  postalcode?: string | null
  page_content?: string | null
  [key: string]: unknown
}

export interface BackendSearchResult {
  query: string
  places: BackendPlace[]
  count: number
}

export interface BackendPreferences {
  city?: string | null
  origin_city?: string | null
  destination_type?: string | null
  budget?: string | null
  travel_companions?: string | null
  activities?: string[]
  duration_days?: number | null
}

export interface BackendRouteMetadata {
  graph_id: string
  build_time_seconds: number
  nodes_count: number
  edges_count: number
  alternatives_count: number
  metrics: Record<string, unknown>
}

export interface BackendMessageOut {
  message: string
  search_results?: BackendSearchResult[] | null
  conversation_complete: boolean
  has_search_results: boolean
  preferences?: BackendPreferences | null
  route_geojson?: Record<string, unknown> | null
  route_metadata?: BackendRouteMetadata | null
  itinerary?: BackendItinerary | null
  suggested_replies?: SuggestedReplyGroup[] | null
  follow_up_questions?: string[] | null
}

export interface BackendSessionOutAnon {
  id: string
  title?: string | null
  secret: string
}

// pydantic-ai ModelMessage format returned by history endpoint
export interface BackendMessagePart {
  part_kind: 'user-prompt' | 'text' | 'system-prompt' | 'tool-call' | 'tool-return' | string
  content?: string
  timestamp?: string
}

export interface BackendModelMessage {
  kind: 'request' | 'response' | 'retry-prompt' | string
  parts: BackendMessagePart[]
  timestamp?: string
}

export interface BackendHistoryOut {
  session_id: string
  messages: BackendModelMessage[]
}

export interface SessionState {
  sessionId: string
  sessionSecret: string
}

/** Экраны главной области без открытого чата */
export type MainView =
  | 'home'
  | 'chatList'
  | 'inspiration'
  | 'saved'
  | 'trips'
  | 'data'
  | 'suitcase'
  | 'community'
  | 'placeByPhoto'
  | 'toursGlamping'
  | 'game'
