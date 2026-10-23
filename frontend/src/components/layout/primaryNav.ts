import { useMemo } from 'react'
import { BookOpen, Globe2, Luggage, MessageSquare, type LucideIcon } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getNavigationCopy } from '@/lib/settingsCopy'

/** The four fixed GDD tabs: bottom tab bar on mobile, header tabs on desktop. */
export const primaryNavItems: ReadonlyArray<{ id: PrimaryNavId; icon: LucideIcon }> = [
  { id: 'game', icon: Globe2 },
  { id: 'data', icon: BookOpen },
  { id: 'chats', icon: MessageSquare },
  { id: 'suitcase', icon: Luggage },
]

export type PrimaryNavId = 'game' | 'data' | 'chats' | 'suitcase'

export function usePrimaryNav() {
  const { language, mainView, currentChatId, goHome, setMainView, setSidebarOpen } = useApp()
  const copy = getNavigationCopy(language)

  const labels: Record<PrimaryNavId, string> = {
    game: copy.explore,
    data: copy.wiki,
    chats: copy.routes,
    suitcase: copy.passport,
  }

  const activeId = useMemo<PrimaryNavId>(() => {
    if (currentChatId) return 'chats'
    if (mainView === 'home' || mainView === 'game') return 'game'
    if (mainView === 'data') return 'data'
    if (mainView === 'suitcase') return 'suitcase'
    return 'chats'
  }, [currentChatId, mainView])

  const open = (id: PrimaryNavId) => {
    setSidebarOpen(false)
    goHome()
    setMainView(id === 'chats' ? 'chatList' : id)
  }

  return { labels, activeId, open }
}
