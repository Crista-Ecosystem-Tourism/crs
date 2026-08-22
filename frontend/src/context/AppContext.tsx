import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { ChatMessage, Place, User, AuthState, SubscriptionPlan, ModalType, SavedRoute, SessionState, BackendRouteMetadata, BackendPreferences, SuggestedReplyGroup, MainView } from '@/types'
import { welcomeMessage, generateAIResponse, createUserMessage } from '@/mocks/chat'
import { getPlacesByCity, getCityCenter, getCityName, parisPlaces, georgiaPlaces, baliPlaces, altaiPlaces, kyotoPlaces, spbPlaces, kenyaPlaces } from '@/mocks/places'
import { delay, generateId } from '@/lib/utils'
import { isMockMode, checkHealth, createSession, sendMessage as apiSendMessage, loadSession, clearSession, listSessions, getHistory, updateSessionTitle, attachSession } from '@/api/chatApi'
import { mapMessageOutToChatMessage, mapHistoryToMessages, computeMapCenter, computeMapZoom } from '@/api/mappers'
import { ApiError } from '@/api/chatApi'
import { login as apiLogin, register as apiRegister, getMe, logout as apiLogout, getToken } from '@/api/authApi'
import { buildGraph } from '@/api/graphApi'
import {
  savePlaceRatings as apiSavePlaceRatings,
  loadPlaceRatings as apiLoadPlaceRatings,
  savePlacesSnapshot as apiSavePlacesSnapshot,
  loadPlacesSnapshot as apiLoadPlacesSnapshot,
  saveGraphGeoJSON as apiSaveGraphGeoJSON,
  loadGraphGeoJSON as apiLoadGraphGeoJSON,
  createSavedRoute as apiCreateSavedRoute,
  listSavedRoutes as apiListSavedRoutes,
  getSavedRoute as apiGetSavedRoute,
} from '@/api/travelDataApi'
import type { PlaceRatingEntry } from '@/types'

type Theme = 'light' | 'dark'

// Chat history item
export interface ChatHistoryItem {
  id: string
  title: string
  destination: string
  messages: ChatMessage[]
  places: Place[]
  createdAt: string
  /** Секрет анонимной сессии (до attach после входа); для сессий только с сервера может быть пусто */
  sessionSecret?: string
}

// Trip data for suggestions
interface TripData {
  id: string
  title: string
  cityName: string
  places: Place[]
  userQuery: string
  aiResponse: string
}

const tripDataMap: Record<string, TripData> = {
  'paris-weekend': {
    id: 'paris-weekend',
    title: 'Париж на выходные',
    cityName: 'Париж',
    places: parisPlaces,
    userQuery: 'Хочу провести романтический уикенд в Париже',
    aiResponse: `Прекрасный выбор! 💕 **Париж** — город любви и романтики!

Я подобрал для вас **${parisPlaces.length} лучших мест** для романтического уикенда. Эйфелева башня на закате, прогулка по Монмартру, ужин с видом на Сену — всё это ждёт вас:`,
  },
  'georgia-food': {
    id: 'georgia-food',
    title: 'Гастротур по Грузии',
    cityName: 'Грузия',
    places: georgiaPlaces,
    userQuery: 'Планирую гастрономический тур по Грузии',
    aiResponse: `Отличный выбор! 🍷 **Грузия** — рай для гурманов!

Хинкали, хачапури, вино из квеври — вас ждёт невероятное гастрономическое приключение. Вот **${georgiaPlaces.length} мест**, которые обязательно стоит посетить:`,
  },
  'bali-beaches': {
    id: 'bali-beaches',
    title: 'Пляжи Бали',
    cityName: 'Бали',
    places: baliPlaces,
    userQuery: 'Ищу идеальный пляжный отдых на Бали',
    aiResponse: `Великолепно! 🌴 **Бали** — остров богов и райских пляжей!

Лазурные воды, закаты в beach-клубах, храмы на скалах — вот **${baliPlaces.length} мест**, которые сделают ваш отдых незабываемым:`,
  },
  'altai-trekking': {
    id: 'altai-trekking',
    title: 'Горы Алтая',
    cityName: 'Алтай',
    places: altaiPlaces,
    userQuery: 'Хочу отправиться в треккинг по горам Алтая',
    aiResponse: `Потрясающе! ⛰️ **Алтай** — сердце Сибири и место силы!

Снежные вершины, бирюзовые озёра, марсианские пейзажи — вас ждёт настоящее приключение. Вот **${altaiPlaces.length} мест** для вашего треккинга:`,
  },
  'kyoto-culture': {
    id: 'kyoto-culture',
    title: 'Культура Киото',
    cityName: 'Киото',
    places: kyotoPlaces,
    userQuery: 'Интересует культурная программа в Киото',
    aiResponse: `Прекрасный выбор! 🎎 **Киото** — душа Японии и хранитель традиций!

Храмы, гейши, бамбуковые рощи — здесь время течёт иначе. Вот **${kyotoPlaces.length} мест** для погружения в японскую культуру:`,
  },
  'europe-tour': {
    id: 'europe-tour',
    title: 'Тур по Европе',
    cityName: 'Париж',
    places: parisPlaces,
    userQuery: 'Планирую путешествие по Европе на 2 недели',
    aiResponse: `Отличный план! 🇪🇺 Начнём ваш **тур по Европе** с Парижа!

Для двух недель я рекомендую маршрут: Париж → Амстердам → Берлин → Прага. Вот **${parisPlaces.length} мест** для старта в Париже:`,
  },
  'spb-excursions': {
    id: 'spb-excursions',
    title: 'Санкт-Петербург',
    cityName: 'Санкт-Петербург',
    places: spbPlaces,
    userQuery: 'Хочу организовать экскурсии по Санкт-Петербургу',
    aiResponse: `Великолепно! 🏛️ **Санкт-Петербург** — культурная столица России!

Эрмитаж, белые ночи, разводные мосты — город поразит вас своей красотой. Вот **${spbPlaces.length} мест**, которые обязательно стоит увидеть:`,
  },
  'kenya-safari': {
    id: 'kenya-safari',
    title: 'Сафари в Кении',
    cityName: 'Кения',
    places: kenyaPlaces,
    userQuery: 'Мечтаю о сафари в Кении',
    aiResponse: `Невероятно! 🦁 **Кения** — родина настоящего африканского сафари!

Львы, слоны, Великая миграция — вас ждёт приключение всей жизни. Вот **${kenyaPlaces.length} мест** для вашего сафари:`,
  },
}

interface AppContextType {
  // Theme
  theme: Theme
  toggleTheme: () => void

  // User & Auth
  user: User | null
  authState: AuthState
  loginWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  authLoading: boolean
  authError: string | null
  subscribe: (plan: SubscriptionPlan) => void

  // Chat
  messages: ChatMessage[]
  isTyping: boolean
  sendMessage: (content: string) => Promise<void>

  // Chat History
  chatHistory: ChatHistoryItem[]
  currentChatId: string | null
  loadChat: (chatId: string) => void
  newChat: () => void
  loadTripChat: (tripId: string) => void
  
  // Map
  places: Place[]
  selectedPlace: Place | null
  setSelectedPlace: (place: Place | null) => void
  mapCenter: [number, number]
  mapZoom: number
  togglePlaceSelection: (placeId: string) => void
  scorePlaceSelection: (placeId: string, score: number) => void
  ratePlace: (placeId: string, rating: number) => void
  graphGeoJSON: Record<string, unknown> | null
  buildingGraph: boolean
  buildPlaceGraph: () => Promise<void>

  // Routes
  savedRoutes: SavedRoute[]
  saveCurrentRoute: (name: string) => void
  loadSavedRoute: (routeId: string) => Promise<void>
  
  // Modals
  activeModal: ModalType
  openModal: (modal: ModalType) => void
  closeModal: () => void
  selectedPlan: SubscriptionPlan | null
  setSelectedPlan: (plan: SubscriptionPlan | null) => void

  // Mobile tab
  mobileActiveTab: 'chat' | 'map'
  setMobileActiveTab: (tab: 'chat' | 'map') => void

  // Navigation
  goHome: () => void
  mainView: MainView
  setMainView: (view: MainView) => void
  
  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void

  // Backend
  backendAvailable: boolean
  apiError: string | null
  clearApiError: () => void
  routeGeoJSON: Record<string, unknown> | null
  routeMetadata: BackendRouteMetadata | null
  preferences: BackendPreferences | null
  suggestedReplies: SuggestedReplyGroup[] | null
}

const AppContext = createContext<AppContextType | undefined>(undefined)

function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') return stored
    if (document.documentElement.classList.contains('dark')) {
      return 'dark'
    }
  }
  return 'dark'
}

// Create mock chat history with places
function createMockChatHistory(): ChatHistoryItem[] {
  const cities = [
    { name: 'Краснодар', title: 'Краснодар на выходные', days: 3 },
    { name: 'Москва', title: 'Неделя в Москве', days: 7 },
    { name: 'Санкт-Петербург', title: 'Питер весной', days: 5 },
    { name: 'Сочи', title: 'Сочи летом', days: 4 },
    { name: 'Казань', title: 'Казань 3 дня', days: 3 },
  ]

  return cities.map((city, index) => {
    const places = getPlacesByCity(city.name)
    const cityName = getCityName(city.name)
    
    const userMessage: ChatMessage = {
      id: `user-hist-${index}`,
      role: 'user',
      content: `Планирую ${city.name} на ${city.days} дня`,
      createdAt: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
    }
    
    const aiMessage: ChatMessage = {
      id: `ai-hist-${index}`,
      role: 'assistant',
      content: `Отличный выбор! 🎉 **${cityName}** — прекрасное место для путешествия!\n\nЯ подобрал для вас **${places.length} интересных мест** на ${city.days} дня. Вот самые популярные:`,
      createdAt: new Date(Date.now() - (index + 1) * 86400000 + 1000).toISOString(),
      places,
      cityName,
    }

    return {
      id: `chat-${index + 1}`,
      title: city.title,
      destination: cityName,
      messages: [welcomeMessage, userMessage, aiMessage],
      places,
      createdAt: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
    }
  })
}

// В мок-режиме (без бэкенда) сразу показываем демо-пользователя, чтобы профиль,
// паспорт путешественника и Crista Wrapped были доступны без формы логина.
const mockUser: User = {
  id: 'mock-user',
  name: 'Александра Крист',
  email: 'demo@crista.online',
  authState: 'subscribed',
  subscription: 'premium',
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Theme
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  
  // User
  const [user, setUser] = useState<User | null>(() => isMockMode() ? mockUser : null)
  const [authState, setAuthState] = useState<AuthState>(() => isMockMode() ? 'subscribed' : 'guest')
  
  // Chat History — mock history only when using mocks
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(() =>
    isMockMode() ? createMockChatHistory() : []
  )
  const [currentChatId, setCurrentChatId] = useState<string | null>(null) // Start with null for Home view
  
  // Get current chat data

  const currentChat = chatHistory.find(c => c.id === currentChatId)
  
  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>(currentChat?.messages || [welcomeMessage])
  const [isTyping, setIsTyping] = useState(false)
  
  // Map
  const [places, setPlaces] = useState<Place[]>(currentChat?.places || [])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
    if (currentChat?.destination) {
      return getCityCenter(currentChat.destination)
    }
    return [45.0355, 38.9753]
  })
  const [mapZoom, setMapZoom] = useState(12)
  
  // Routes
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([])
  
  // Modals
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  
  // Mobile tab
  const [mobileActiveTab, setMobileActiveTab] = useState<'chat' | 'map'>('chat')

  // Sidebar
  // На мобильных это выдвижное меню: открытым по умолчанию оно закрывает контент.
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Main view (when no chat is open)
  const [mainView, setMainView] = useState<MainView>('home')

  // Auth
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [hasShownAuthPrompt, setHasShownAuthPrompt] = useState(false)

  // Backend integration
  const [backendAvailable, setBackendAvailable] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [routeGeoJSON, setRouteGeoJSON] = useState<Record<string, unknown> | null>(null)
  const [routeMetadata, setRouteMetadata] = useState<BackendRouteMetadata | null>(null)
  const [preferences, setPreferences] = useState<BackendPreferences | null>(null)
  const [suggestedReplies, setSuggestedReplies] = useState<SuggestedReplyGroup[] | null>(null)
  const [graphGeoJSON, setGraphGeoJSON] = useState<Record<string, unknown> | null>(null)
  const [buildingGraph, setBuildingGraph] = useState(false)
  const sessionRef = useRef<SessionState | null>(loadSession())
  const ratingsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRatingsRef = useRef<Record<string, PlaceRatingEntry> | null>(null)

  // Flush pending ratings to backend immediately
  const flushPendingRatings = useCallback(() => {
    if (ratingsTimerRef.current) {
      clearTimeout(ratingsTimerRef.current)
      ratingsTimerRef.current = null
    }
    const ratings = pendingRatingsRef.current
    const sid = sessionRef.current?.sessionId
    if (ratings && sid && !isMockMode()) {
      apiSavePlaceRatings(sid, ratings, sessionRef.current?.sessionSecret).catch(() => {})
      pendingRatingsRef.current = null
    }
  }, [])

  // Debounced save of place ratings + places snapshot (500ms)
  const scheduleSaveRatings = useCallback((updatedPlaces: Place[]) => {
    if (isMockMode() || !sessionRef.current) return
    const ratings: Record<string, PlaceRatingEntry> = {}
    for (const p of updatedPlaces) {
      if (p.userRating || p.score || p.selected) {
        ratings[p.id] = {
          rating: p.userRating ?? null,
          score: p.score ?? null,
          selected: p.selected ?? false,
        }
      }
    }
    pendingRatingsRef.current = ratings
    if (ratingsTimerRef.current) clearTimeout(ratingsTimerRef.current)
    ratingsTimerRef.current = setTimeout(() => {
      flushPendingRatings()
      // Also update places snapshot so stars/scores are visible after reload
      const sid = sessionRef.current?.sessionId
      if (sid) {
        apiSavePlacesSnapshot(
          sid,
          updatedPlaces as unknown as Record<string, unknown>[],
          sessionRef.current?.sessionSecret,
        ).catch(() => {})
      }
    }, 500)
  }, [flushPendingRatings])

  // Helper: preload session history into chatHistory cache (does NOT open the chat)
  const preloadSessionHistory = useCallback(async (sessionId: string, sessionSecret: string) => {
    try {
      const [historyOut, savedPlaces] = await Promise.all([
        getHistory(sessionId, sessionSecret, 'full'),
        apiLoadPlacesSnapshot(sessionId, sessionSecret).catch(() => null),
      ])
      const msgs = mapHistoryToMessages(historyOut.messages, sessionId)
      if (msgs.length > 0 || savedPlaces) {
        const restoredPlaces: Place[] = savedPlaces
          ? (savedPlaces as unknown as Place[])
          : []
        // Attach places to last assistant message so PlacesGrid renders
        const allMsgs = [welcomeMessage, ...msgs]
        if (restoredPlaces.length > 0) {
          for (let i = allMsgs.length - 1; i >= 0; i--) {
            if (allMsgs[i].role === 'assistant' && !allMsgs[i].places?.length) {
              allMsgs[i] = { ...allMsgs[i], places: restoredPlaces }
              break
            }
          }
        }
        setChatHistory(prev => prev.map(c =>
          c.id === sessionId
            ? { ...c, messages: allMsgs, places: restoredPlaces }
            : c
        ))
        sessionRef.current = { sessionId, sessionSecret }
      }
    } catch {
      // Session expired or invalid — ignore
    }
  }, [])

  // Health check + restore auth + restore chat on mount
  useEffect(() => {
    if (isMockMode()) {
      setBackendAvailable(false)
      return
    }

    const init = async () => {
      const ok = await checkHealth()
      setBackendAvailable(ok)
      if (!ok) return

      const savedSession = sessionRef.current

      // Restore user session from stored token
      if (getToken()) {
        try {
          const authUser = await getMe()
          setUser({
            id: authUser.id,
            name: authUser.name || '',
            email: authUser.email,
            authState: 'registered',
          })
          setAuthState('registered')

          const sessions = await listSessions()
          if (sessions && sessions.length > 0) {
            setChatHistory(sessions.map(s => ({
              id: s.id,
              title: s.title || 'Без названия',
              destination: '',
              messages: [],
              places: [],
              createdAt: s.updated_at || new Date().toISOString(),
            })))

            // Restore last active session (first in list = most recent)
            const lastSession = savedSession && sessions.some(s => s.id === savedSession.sessionId)
              ? savedSession
              : { sessionId: sessions[0].id, sessionSecret: '' }
            await preloadSessionHistory(lastSession.sessionId, lastSession.sessionSecret)
          }
          // Load saved routes
          try {
            const routes = await apiListSavedRoutes()
            setSavedRoutes(routes.map(r => ({
              id: r.id,
              name: r.name,
              destination: r.destination,
              days: 0,
              places: [],
              createdAt: r.created_at || new Date().toISOString(),
            })))
          } catch { /* ignore */ }
        } catch {
          // Token invalid/expired — stay as guest
        }
      } else if (savedSession) {
        // Anonymous user — restore session from sessionStorage
        await preloadSessionHistory(savedSession.sessionId, savedSession.sessionSecret)
      }
    }

    init()
  }, [preloadSessionHistory])

  // Flush pending ratings on page unload
  useEffect(() => {
    const handleBeforeUnload = () => flushPendingRatings()
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [flushPendingRatings])

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('theme', theme)
    } catch { /* ignore */ }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  // Auth functions
  const loadUserSessions = useCallback(async () => {
    try {
      const sessions = await listSessions()
      setChatHistory(sessions.map(s => ({
        id: s.id,
        title: s.title || 'Без названия',
        destination: '',
        messages: [],
        places: [],
        createdAt: s.updated_at || new Date().toISOString(),
      })))
    } catch { /* ignore — user may have no sessions */ }
    // Load saved routes
    try {
      const routes = await apiListSavedRoutes()
      setSavedRoutes(routes.map(r => ({
        id: r.id,
        name: r.name,
        destination: r.destination,
        days: 0,
        places: [],
        createdAt: r.created_at || new Date().toISOString(),
      })))
    } catch { /* ignore */ }
  }, [])

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const { user: authUser } = await apiLogin(email, password)
      setUser({
        id: authUser.id,
        name: authUser.name || '',
        email: authUser.email,
        authState: 'registered',
      })
      setAuthState('registered')
      setActiveModal(null)
      if (sessionRef.current?.sessionId && sessionRef.current?.sessionSecret) {
        try {
          await attachSession(sessionRef.current.sessionId, sessionRef.current.sessionSecret)
        } catch { /* сессия уже привязана или гость без чата */ }
      }
      await loadUserSessions()
    } catch (error) {
      const msg = error instanceof ApiError ? error.detail : 'Ошибка входа'
      setAuthError(msg)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }, [loadUserSessions])

  const registerWithEmail = useCallback(async (email: string, password: string, name: string) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const { user: authUser } = await apiRegister(email, password, name)
      setUser({
        id: authUser.id,
        name: authUser.name || '',
        email: authUser.email,
        authState: 'registered',
      })
      setAuthState('registered')
      setActiveModal(null)
      if (sessionRef.current?.sessionId && sessionRef.current?.sessionSecret) {
        try {
          await attachSession(sessionRef.current.sessionId, sessionRef.current.sessionSecret)
        } catch { /* нет анонимной сессии или уже привязана */ }
      }
    } catch (error) {
      const msg = error instanceof ApiError ? error.detail : 'Ошибка регистрации'
      setAuthError(msg)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    apiLogout()
    setUser(null)
    setAuthState('guest')
    setCurrentChatId(null)
    setAuthError(null)
  }, [])

  // Navigation - go to home screen
  const goHome = useCallback(() => {
    setCurrentChatId(null)
    setMainView('home')
  }, [])

  const subscribe = useCallback((plan: SubscriptionPlan) => {
    if (user) {
      setUser({ ...user, authState: 'subscribed', subscription: plan })
      setAuthState('subscribed')
    }
    setActiveModal(null)
  }, [user])

  // Clear API error
  const clearApiError = useCallback(() => {
    setApiError(null)
  }, [])

  // Ensure we have an active session
  const ensureSession = useCallback(async (): Promise<SessionState> => {
    if (sessionRef.current) return sessionRef.current
    const session = await createSession()
    sessionRef.current = session
    return session
  }, [])

  // Load chat from history — fetches messages from backend if needed
  const loadChat = useCallback(async (chatId: string) => {
    setCurrentChatId(chatId)
    setSelectedPlace(null)
    setRouteGeoJSON(null)
    setRouteMetadata(null)
    setPreferences(null)
    setSuggestedReplies(null)

    const chat = chatHistory.find(c => c.id === chatId)

    // If messages already loaded locally — still fetch ratings/graph from backend
    if (chat && chat.messages.length > 0) {
      setMessages(chat.messages)
      const cachedSecret =
        chat.sessionSecret
        ?? (sessionRef.current?.sessionId === chatId ? sessionRef.current.sessionSecret : '')
        ?? ''
      sessionRef.current = { sessionId: chatId, sessionSecret: cachedSecret }

      // Load ratings + graph from backend to merge into cached places
      if (!isMockMode() && backendAvailable && chat.places.length > 0) {
        try {
          const [savedRatings, savedGraph] = await Promise.all([
            apiLoadPlaceRatings(chatId, cachedSecret),
            apiLoadGraphGeoJSON(chatId, cachedSecret),
          ])
          let merged = chat.places
          if (savedRatings) {
            merged = chat.places.map(p => {
              const entry = savedRatings[p.id]
              if (entry) {
                return {
                  ...p,
                  userRating: entry.rating ?? undefined,
                  score: entry.score ?? undefined,
                  selected: entry.selected ?? undefined,
                }
              }
              return p
            })
          }
          setPlaces(merged)
          setMapCenter(computeMapCenter(merged))
          setMapZoom(computeMapZoom(merged))
          if (savedGraph) setGraphGeoJSON(savedGraph)
          // Update cache
          setChatHistory(prev => prev.map(c =>
            c.id === chatId ? { ...c, places: merged } : c
          ))
        } catch {
          setPlaces(chat.places)
          if (chat.places.length > 0) {
            setMapCenter(computeMapCenter(chat.places))
            setMapZoom(computeMapZoom(chat.places))
          }
        }
      } else {
        setPlaces(chat.places)
        if (chat.places.length > 0) {
          setMapCenter(computeMapCenter(chat.places))
          setMapZoom(computeMapZoom(chat.places))
        }
      }
      return
    }

    // Load from backend
    if (!isMockMode() && backendAvailable) {
      try {
        const secret = sessionRef.current?.sessionId === chatId
          ? sessionRef.current.sessionSecret
          : ''
        const historyOut = await getHistory(chatId, secret, 'full')
        const restoredMessages = mapHistoryToMessages(historyOut.messages, chatId)
        const loadedMessages = restoredMessages.length > 0
          ? [welcomeMessage, ...restoredMessages]
          : [welcomeMessage]
        setMessages(loadedMessages)
        sessionRef.current = { sessionId: chatId, sessionSecret: secret }

        // Load persisted places, ratings and graph
        let restoredPlaces: Place[] = []
        try {
          const [savedPlaces, savedRatings, savedGraph] = await Promise.all([
            apiLoadPlacesSnapshot(chatId, secret),
            apiLoadPlaceRatings(chatId, secret),
            apiLoadGraphGeoJSON(chatId, secret),
          ])
          // Use saved places snapshot as the source of truth
          const basePlaces: Place[] = savedPlaces
            ? (savedPlaces as unknown as Place[])
            : loadedMessages.flatMap(m => m.places ?? [])
          // Merge ratings into places
          if (savedRatings && basePlaces.length > 0) {
            restoredPlaces = basePlaces.map(p => {
              const entry = savedRatings[p.id]
              if (entry) {
                return {
                  ...p,
                  userRating: entry.rating ?? undefined,
                  score: entry.score ?? undefined,
                  selected: entry.selected ?? undefined,
                }
              }
              return p
            })
          } else {
            restoredPlaces = basePlaces
          }
          if (savedGraph) setGraphGeoJSON(savedGraph)
        } catch {
          restoredPlaces = loadedMessages.flatMap(m => m.places ?? [])
        }

        // Attach places to the last assistant message so PlacesGrid renders
        if (restoredPlaces.length > 0) {
          for (let i = loadedMessages.length - 1; i >= 0; i--) {
            if (loadedMessages[i].role === 'assistant' && !loadedMessages[i].places?.length) {
              loadedMessages[i] = { ...loadedMessages[i], places: restoredPlaces }
              break
            }
          }
          setMessages([...loadedMessages])
        }

        setPlaces(restoredPlaces)
        if (restoredPlaces.length > 0) {
          setMapCenter(computeMapCenter(restoredPlaces))
          setMapZoom(computeMapZoom(restoredPlaces))
        }

        // Update chatHistory entry with loaded messages
        setChatHistory(prev => prev.map(c =>
          c.id === chatId ? { ...c, messages: loadedMessages, places: restoredPlaces } : c
        ))
      } catch {
        setMessages([welcomeMessage])
        setPlaces([])
        sessionRef.current = { sessionId: chatId, sessionSecret: '' }
      }
    } else if (chat) {
      setMessages(chat.messages.length > 0 ? chat.messages : [welcomeMessage])
      setPlaces(chat.places)
    }
  }, [chatHistory, backendAvailable])

  // Create new chat
  const newChat = useCallback(async () => {
    setMessages([welcomeMessage])
    setPlaces([])
    setSelectedPlace(null)
    setMapCenter([55.7558, 37.6173]) // Default to Moscow
    setMapZoom(10)
    setRouteGeoJSON(null)
    setRouteMetadata(null)
    setPreferences(null)
    setSuggestedReplies(null)
    setApiError(null)

    // Create session on backend immediately to get correct ID
    if (!isMockMode() && backendAvailable) {
      try {
        const session = await createSession()
        sessionRef.current = session
        setCurrentChatId(session.sessionId)
        return
      } catch {
        // Backend unavailable — fall through to local ID
      }
    }

    // Fallback: local ID for mock/offline mode
    const newId = `chat-${generateId()}`
    setCurrentChatId(newId)
    sessionRef.current = null
    clearSession()
  }, [backendAvailable])

  // Chat functions
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMsg = createUserMessage(content)
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)
    setApiError(null)
    setSuggestedReplies(null)

    const useMocks = isMockMode() || !backendAvailable

    try {
      let aiResponse: ChatMessage
      let newPlaces: Place[] = []

      if (useMocks) {
        // Mock path
        await delay(1500 + Math.random() * 1000)
        const mockResult = generateAIResponse(content)
        aiResponse = mockResult.message
        newPlaces = mockResult.places
      } else {
        // Real API path
        const session = await ensureSession()

        // Sync currentChatId with backend session ID if they differ
        if (currentChatId !== session.sessionId) {
          const oldId = currentChatId
          setCurrentChatId(session.sessionId)
          setChatHistory(prev => prev.map(c =>
            c.id === oldId
              ? { ...c, id: session.sessionId, sessionSecret: session.sessionSecret || c.sessionSecret }
              : c
          ))
        }

        const response = await apiSendMessage(
          session.sessionId,
          content,
          session.sessionSecret
        )

        const mapped = mapMessageOutToChatMessage(response)
        aiResponse = mapped.chatMessage
        newPlaces = mapped.places

        // Save preferences if present
        if (mapped.preferences) setPreferences(mapped.preferences)

        // Update suggested replies
        setSuggestedReplies(mapped.suggestedReplies)

        // Save route data if present
        if (response.route_geojson) setRouteGeoJSON(response.route_geojson)
        if (response.route_metadata) setRouteMetadata(response.route_metadata)
      }

      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)

      // Update session title from first user message if no title yet
      if (!useMocks && sessionRef.current && newPlaces.length === 0) {
        const truncated = content.length > 60 ? content.slice(0, 60) + '…' : content
        setChatHistory(prev => {
          const sid = sessionRef.current?.sessionId
          const entry = prev.find(c => c.id === sid || c.id === currentChatId)
          if (entry && (!entry.title || entry.title === 'Без названия')) {
            updateSessionTitle(sid!, truncated).catch(() => {})
            return prev.map(c =>
              c.id === (sid || currentChatId)
                ? { ...c, title: truncated }
                : c
            )
          }
          return prev
        })
      }

      if (newPlaces.length > 0) {
        setPlaces(newPlaces)

        // Persist places snapshot to backend
        if (!useMocks && sessionRef.current) {
          apiSavePlacesSnapshot(
            sessionRef.current.sessionId,
            newPlaces as unknown as Record<string, unknown>[],
            sessionRef.current.sessionSecret,
          ).catch(() => {})
        }

        if (useMocks) {
          const center = getCityCenter(content)
          setMapCenter(center)
          setMapZoom(13)
        } else {
          setMapCenter(computeMapCenter(newPlaces))
          setMapZoom(computeMapZoom(newPlaces))
        }

        // Update chat history
        const cityName = useMocks ? getCityName(content) : (newPlaces[0]?.address?.split(',')[0] || 'Путешествие')
        const chatTitle = `${cityName} ${new Date().toLocaleDateString('ru')}`
        if (currentChatId) {
          setChatHistory(prev => {
            const existingIndex = prev.findIndex(c => c.id === currentChatId)
            if (existingIndex >= 0) {
              const updated = [...prev]
              const needsTitle = !updated[existingIndex].title || updated[existingIndex].title === 'Без названия'
              updated[existingIndex] = {
                ...updated[existingIndex],
                title: needsTitle ? chatTitle : updated[existingIndex].title,
                destination: cityName,
                messages: [...updated[existingIndex].messages, userMsg, aiResponse],
                places: newPlaces,
                sessionSecret: sessionRef.current?.sessionSecret ?? updated[existingIndex].sessionSecret,
              }
              // Update title on backend
              if (needsTitle && !useMocks && sessionRef.current) {
                updateSessionTitle(sessionRef.current.sessionId, chatTitle).catch(() => {})
              }
              return updated
            }
            // New chat entry
            if (!useMocks && sessionRef.current) {
              updateSessionTitle(sessionRef.current.sessionId, chatTitle).catch(() => {})
            }
            return [
              {
                id: currentChatId,
                title: chatTitle,
                destination: cityName,
                messages: [welcomeMessage, userMsg, aiResponse],
                places: newPlaces,
                createdAt: new Date().toISOString(),
                sessionSecret: sessionRef.current?.sessionSecret,
              },
              ...prev,
            ]
          })
        }

        if (authState === 'guest' && !hasShownAuthPrompt) {
          setTimeout(() => {
            setActiveModal('auth')
            setHasShownAuthPrompt(true)
          }, 2000)
        }
      }
    } catch (error) {
      setIsTyping(false)

      let errorMessage: string
      if (error instanceof ApiError) {
        if (error.status === 403) {
          // Session invalid — reset and retry will create new one
          sessionRef.current = null
          clearSession()
          errorMessage = 'Сессия истекла. Пожалуйста, отправьте сообщение ещё раз.'
        } else if (error.status >= 500) {
          errorMessage = 'Сервер временно недоступен. Попробуйте позже.'
        } else {
          errorMessage = error.detail
        }
      } else {
        // Network error — fall back to mocks on next call
        setBackendAvailable(false)
        errorMessage = 'Не удалось подключиться к серверу. Переключаемся на офлайн-режим.'
      }

      setApiError(errorMessage)
      const systemMsg: ChatMessage = {
        id: `system-${Date.now()}`,
        role: 'system',
        content: errorMessage,
        createdAt: new Date().toISOString(),
      }
      setMessages(prev => [...prev, systemMsg])
    }
  }, [authState, hasShownAuthPrompt, currentChatId, backendAvailable, ensureSession])

  // Load a pre-made trip chat from suggestions
  const loadTripChat = useCallback((tripId: string) => {
    const tripData = tripDataMap[tripId]
    if (!tripData) return

    const useMocks = isMockMode() || !backendAvailable

    if (!useMocks) {
      // When backend is available, start a new chat and send the query via API
      const newId = `trip-${tripId}-${generateId()}`
      setCurrentChatId(newId)
      setMessages([welcomeMessage])
      setPlaces([])
      setSelectedPlace(null)
      setRouteGeoJSON(null)
      setRouteMetadata(null)
      setPreferences(null)
      setSuggestedReplies(null)
      setApiError(null)
      sessionRef.current = null
      clearSession()
      // Send the trip query through the real API pipeline
      setTimeout(() => sendMessage(tripData.userQuery), 100)
      return
    }

    const newId = `trip-${tripId}-${generateId()}`

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: tripData.userQuery,
      createdAt: new Date().toISOString(),
    }

    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: tripData.aiResponse,
      createdAt: new Date().toISOString(),
      places: tripData.places,
      cityName: tripData.cityName,
    }

    setCurrentChatId(newId)
    setMessages([welcomeMessage, userMessage, aiMessage])
    setPlaces(tripData.places)
    setSelectedPlace(null)
    setMapCenter(getCityCenter(tripData.cityName))
    setMapZoom(13)

    // Add to chat history
    setChatHistory(prev => [
      {
        id: newId,
        title: tripData.title,
        destination: tripData.cityName,
        messages: [welcomeMessage, userMessage, aiMessage],
        places: tripData.places,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }, [backendAvailable, sendMessage])

  // Toggle place selection
  const togglePlaceSelection = useCallback((placeId: string) => {
    setPlaces(prev => {
      const updated = prev.map(p =>
        p.id === placeId ? { ...p, selected: !p.selected } : p
      )
      scheduleSaveRatings(updated)
      return updated
    })
  }, [scheduleSaveRatings])

  // Score place for паутинка (1-5 points); 0 = unpin
  const scorePlaceSelection = useCallback((placeId: string, score: number) => {
    setPlaces(prev => {
      const updated = prev.map(p =>
        p.id === placeId
          ? { ...p, selected: score > 0, score: score > 0 ? score : undefined }
          : p
      )
      scheduleSaveRatings(updated)
      return updated
    })
  }, [scheduleSaveRatings])

  // Rate a place (1-5 stars, 0 = clear)
  const ratePlace = useCallback((placeId: string, rating: number) => {
    setPlaces(prev => {
      const updated = prev.map(p =>
        p.id === placeId ? { ...p, userRating: rating || undefined } : p
      )
      scheduleSaveRatings(updated)
      return updated
    })
  }, [scheduleSaveRatings])

  // Build place graph ("паутинка") from rated places
  const buildPlaceGraph = useCallback(async () => {
    const ratedPlaces = places.filter(p => p.userRating && p.userRating > 0)
    if (ratedPlaces.length < 2) return
    setBuildingGraph(true)
    try {
      const result = await buildGraph(ratedPlaces)
      setGraphGeoJSON(result.geojson)
      // Persist graph to backend
      const sid = sessionRef.current?.sessionId
      if (sid && !isMockMode() && result.geojson) {
        apiSaveGraphGeoJSON(sid, result.geojson, sessionRef.current?.sessionSecret).catch(() => {})
      }
    } catch (e) {
      console.error('Graph build error:', e)
      setApiError('Ошибка построения паутинки')
    } finally {
      setBuildingGraph(false)
    }
  }, [places])

  // Save route
  const saveCurrentRoute = useCallback(async (name: string) => {
    const selectedPlaces = places.filter(p => p.selected)
    if (selectedPlaces.length === 0) return

    const destination = selectedPlaces[0]?.address?.split(',')[0] || 'Путешествие'

    // Try to save via API
    if (!isMockMode() && backendAvailable) {
      try {
        const result = await apiCreateSavedRoute({
          name,
          destination,
          session_id: sessionRef.current?.sessionId ?? null,
          places: selectedPlaces as unknown as Record<string, unknown>[],
          graph_geojson: graphGeoJSON,
        })
        const newRoute: SavedRoute = {
          id: result.id,
          name: result.name,
          destination: result.destination,
          days: selectedPlaces.length,
          places: selectedPlaces,
          createdAt: result.created_at || new Date().toISOString(),
        }
        setSavedRoutes(prev => [...prev, newRoute])
        setActiveModal(null)
        return
      } catch {
        // Fall through to local save
      }
    }

    // Local fallback
    const newRoute: SavedRoute = {
      id: `route-${Date.now()}`,
      name,
      destination,
      days: selectedPlaces.length,
      places: selectedPlaces,
      createdAt: new Date().toISOString(),
    }
    setSavedRoutes(prev => [...prev, newRoute])
    setActiveModal(null)
  }, [places, backendAvailable, graphGeoJSON])

  // Load a saved route and display its places on the map
  const loadSavedRoute = useCallback(async (routeId: string) => {
    try {
      const route = await apiGetSavedRoute(routeId)
      const routePlaces = (route.places || []) as unknown as Place[]
      if (routePlaces.length > 0) {
        setPlaces(routePlaces)
        setMapCenter(computeMapCenter(routePlaces))
        setMapZoom(computeMapZoom(routePlaces))
      }
      if (route.graph_geojson) {
        setGraphGeoJSON(route.graph_geojson)
      }
      // Switch to a chat-like view to show the map
      setCurrentChatId(`route-${routeId}`)
      setMessages([{
        id: `route-msg-${routeId}`,
        role: 'assistant',
        content: `Маршрут **${route.name}** — ${route.destination}. ${routePlaces.length} мест.`,
        createdAt: route.created_at || new Date().toISOString(),
        places: routePlaces,
      }])
      setSelectedPlace(null)
      setRouteGeoJSON(null)
      setRouteMetadata(null)
    } catch {
      setApiError('Не удалось загрузить маршрут')
    }
  }, [])

  // Sync selectedPlace with places array when places change (ratings, selection, etc.)
  useEffect(() => {
    if (selectedPlace) {
      const updated = places.find(p => p.id === selectedPlace.id)
      if (updated && (
        updated.userRating !== selectedPlace.userRating ||
        updated.score !== selectedPlace.score ||
        updated.selected !== selectedPlace.selected
      )) {
        setSelectedPlace(updated)
      }
    }
  }, [places, selectedPlace])

  // Wrapped setSelectedPlace: auto-switch to map on mobile when selecting a place
  const handleSetSelectedPlace = useCallback((place: Place | null) => {
    // If selecting a place, use the latest version from places array
    if (place) {
      const latest = places.find(p => p.id === place.id)
      setSelectedPlace(latest || place)
      setMobileActiveTab('map')
    } else {
      setSelectedPlace(null)
    }
  }, [places])

  // Modal functions
  const openModal = useCallback((modal: ModalType) => {
    setActiveModal(modal)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
    setSelectedPlan(null)
  }, [])

  const value: AppContextType = {
    theme,
    toggleTheme,
    user,
    authState,
    loginWithEmail,
    registerWithEmail,
    logout,
    authLoading,
    authError,
    subscribe,
    messages,
    isTyping,
    sendMessage,
    chatHistory,
    currentChatId,
    loadChat,
    newChat,
    loadTripChat,
    places,
    selectedPlace,
    setSelectedPlace: handleSetSelectedPlace,
    mapCenter,
    mapZoom,
    togglePlaceSelection,
    scorePlaceSelection,
    ratePlace,
    graphGeoJSON,
    buildingGraph,
    buildPlaceGraph,
    savedRoutes,
    saveCurrentRoute,
    loadSavedRoute,
    activeModal,
    openModal,
    closeModal,
    selectedPlan,
    setSelectedPlan,
    mobileActiveTab,
    setMobileActiveTab,
    goHome,
    mainView,
    setMainView,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    backendAvailable,
    apiError,
    clearApiError,
    routeGeoJSON,
    routeMetadata,
    preferences,
    suggestedReplies,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
