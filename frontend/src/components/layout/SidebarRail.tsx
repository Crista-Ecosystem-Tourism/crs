import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RailButtonProps {
  icon: LucideIcon
  label: string
  active?: boolean
  onClick: () => void
  /** Визуально отделяет служебные действия от разделов. */
  muted?: boolean
}

/**
 * Кнопка левого рельса: круглая, без подписи, с подсказкой по наведению.
 * Активный раздел заливается тёмным тилом (6.2:1 с белой иконкой).
 */
export function RailButton({ icon: Icon, label, active, onClick, muted }: RailButtonProps) {
  return (
    <div className="group relative flex justify-center">
      <button
        onClick={onClick}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full transition duration-base ease-standard',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950',
          active
            ? 'bg-teal-700 text-white shadow-md'
            : muted
              ? 'text-text-muted hover:bg-panel-2 hover:text-text'
              : 'text-text-secondary hover:bg-panel-2 hover:text-text'
        )}
      >
        <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.2 : 1.8} />
      </button>

      {/* Подсказка: рельс без подписей не должен быть ребусом */}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap',
          // Тёмная плашка в обеих темах: подсказка не должна зависеть от фона под ней
          'rounded-md border border-hairline bg-ink-850 px-2.5 py-1.5 font-sans text-xs text-white shadow-lg',
          'opacity-0 transition-opacity duration-fast group-hover:opacity-100 group-focus-within:opacity-100'
        )}
      >
        {label}
      </span>
    </div>
  )
}
