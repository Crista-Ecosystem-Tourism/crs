import { MessageSquare, Map } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

type ViewKey = 'chat' | 'map'

const views: { key: ViewKey; label: { ru: string; en: string }; icon: typeof MessageSquare }[] = [
  { key: 'chat', label: { ru: 'Чат', en: 'Chat' }, icon: MessageSquare },
  { key: 'map', label: { ru: 'Карта', en: 'Map' }, icon: Map },
]

/** Chat/map toggle inside a mobile itinerary; app-level navigation lives in PrimaryTabBar. */
export function MobileChatMapSwitch() {
  const { mobileActiveTab, setMobileActiveTab, language } = useApp()

  return (
    <div className="shrink-0 px-3 pb-2 pt-1">
      <div role="tablist" className="flex rounded-full border border-hairline bg-panel p-1">
        {views.map((view) => {
          const active = mobileActiveTab === view.key
          return (
            <button
              key={view.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMobileActiveTab(view.key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 font-sans text-xs font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                active ? 'bg-panel-2 text-text' : 'text-text-muted',
              )}
            >
              <view.icon className="h-4 w-4" aria-hidden="true" />
              {view.label[language]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
