import { cn } from '@/lib/utils'
import { primaryNavItems, usePrimaryNav } from './primaryNav'

/** Mobile and tablet navigation: four fixed tabs instead of a sliding menu (GDD §3.1). */
export function PrimaryTabBar({ className }: { className?: string }) {
  const { labels, activeId, open } = usePrimaryNav()

  return (
    <nav aria-label="Основные разделы" className={cn('shrink-0 border-t border-hairline bg-panel/95 backdrop-blur-md', className)}>
      <div className="flex items-stretch justify-around px-1 py-1 safe-area-pb">
        {primaryNavItems.map((item) => {
          const active = activeId === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => open(item.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                active ? 'text-primary' : 'text-text-muted active:bg-panel-2',
              )}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span className="max-w-full truncate font-sans text-[10px] font-medium">{labels[item.id]}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
