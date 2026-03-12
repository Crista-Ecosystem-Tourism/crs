import { MessageSquare, Map, Home } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

type TabKey = 'chat' | 'map' | 'home'

const tabs: { key: TabKey; label: string; icon: typeof MessageSquare }[] = [
  { key: 'chat', label: 'Чат', icon: MessageSquare },
  { key: 'home', label: 'Главная', icon: Home },
  { key: 'map', label: 'Карта', icon: Map },
]

export function MobileTabBar() {
  const { mobileActiveTab, setMobileActiveTab, goHome } = useApp()

  const handleTab = (key: TabKey) => {
    if (key === 'home') {
      goHome()
    } else {
      setMobileActiveTab(key)
    }
  }

  return (
    <div className="flex-shrink-0 border-t border-border bg-surface/95 backdrop-blur-sm">
      <div className="flex items-center justify-around px-2 py-1.5 safe-area-pb">
        {tabs.map((tab) => {
          const isActive = tab.key !== 'home' && mobileActiveTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => handleTab(tab.key)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors min-w-[60px]',
                isActive
                  ? 'text-primary'
                  : 'text-text-muted active:bg-surface-hover'
              )}
            >
              <tab.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
