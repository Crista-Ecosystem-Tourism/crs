import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AppHeader } from './AppHeader'

interface AppFrameProps {
  children: ReactNode
  className?: string
}

/**
 * Оконный режим по референсу: интерфейс это один стеклянный лист, лежащий
 * на сцене, а не заливка всего экрана. Сцена видна вокруг листа, поэтому
 * стекло действительно преломляет окружение.
 *
 * На узких экранах рамка снимается: там каждый пиксель нужен под контент.
 */
export function AppFrame({ children, className }: AppFrameProps) {
  return (
    <div className="h-full w-full p-0 lg:p-5 xl:p-7">
      <div
        className={cn(
          'app-frame relative flex h-full w-full flex-col overflow-hidden',
          'rounded-none lg:rounded-[30px]',
          className
        )}
      >
        {/* Блик по верхней кромке листа: край стекла должен читаться */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 z-40 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          aria-hidden="true"
        />
        <AppHeader />

        {/* Рельс и контент живут под общей шапкой */}
        <div className="flex min-h-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
