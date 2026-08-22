import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, MapPin } from 'lucide-react'
import { Img } from '@/components/ui/Img'
import { cn } from '@/lib/utils'

export interface CarouselItem {
  id: string
  name: string
  flag: string
  cover: string
  summary: string
  subtitle: string
}

interface CountryCarouselProps {
  items: CarouselItem[]
  onOpen: (id: string) => void
}

/**
 * Карусель стран по мотивам референса: центральная карточка в фокусе,
 * соседние отведены назад и подсвечены слабее. Глубина сделана на
 * CSS-трансформациях, без библиотек.
 */
export function CountryCarousel({ items, onOpen }: CountryCarouselProps) {
  const [index, setIndex] = useState(0)

  const count = items.length
  const go = (dir: -1 | 1) => setIndex((i) => (i + dir + count) % count)

  useEffect(() => {
    if (index > count - 1) setIndex(0)
  }, [count, index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (count === 0) return null
  const active = items[index]

  return (
    <div className="select-none">
      {/* Сцена */}
      <div
        className="relative flex h-[440px] items-center justify-center sm:h-[520px]"
        style={{ perspective: '1600px' }}
      >
        {items.map((item, i) => {
          // Кратчайшее расстояние по кругу
          let offset = i - index
          if (offset > count / 2) offset -= count
          if (offset < -count / 2) offset += count

          const isActive = offset === 0
          const abs = Math.abs(offset)
          if (abs > 2) return null

          const translateX = offset * 190
          const translateZ = -abs * 190
          const rotateY = offset * -26
          const opacity = isActive ? 1 : abs === 1 ? 0.55 : 0.25

          return (
            <button
              key={item.id}
              onClick={() => (isActive ? onOpen(item.id) : setIndex(i))}
              aria-label={isActive ? `Открыть статью ${item.name}` : `Показать ${item.name}`}
              aria-current={isActive}
              className={cn(
                'absolute h-[380px] w-[290px] overflow-hidden rounded-xl border text-left',
                'transition-all duration-[600ms] ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                isActive
                  ? 'z-20 border-hairline-3 shadow-lg'
                  : 'z-10 border-hairline-2 hover:border-hairline-3',
                'sm:h-[440px] sm:w-[340px]'
              )}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                opacity,
              }}
            >
              <Img src={item.cover} alt={item.name} className="h-full w-full object-cover" />
              <div className="photo-scrim absolute inset-0" />

              {isActive && (
                <span className="absolute left-1/2 top-4 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 rounded-full bg-ink-950/55 px-3 py-1.5 font-sans text-xs text-white backdrop-blur-sm">
                    <Maximize2 className="h-3 w-3" aria-hidden="true" />
                    Открыть
                  </span>
                </span>
              )}

              <span className="absolute inset-x-0 bottom-0 p-5">
                <span className="mb-1 flex items-center gap-2">
                  <span className="text-xl leading-none" aria-hidden="true">{item.flag}</span>
                  <span className="font-display text-3xl font-semibold leading-tight text-white">
                    {item.name}
                  </span>
                </span>
                {isActive ? (
                  <>
                    <span className="mb-2 flex items-center gap-1.5 font-sans text-xs text-white/70">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {item.subtitle}
                    </span>
                    <span className="line-clamp-3 font-sans text-sm leading-relaxed text-white/85">
                      {item.summary}
                    </span>
                  </>
                ) : (
                  <span className="font-sans text-xs text-white/60">{item.subtitle}</span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Нижняя пилюля навигации, как в референсе */}
      <div className="mt-2 flex justify-center">
        <div className="glass flex items-center gap-3 rounded-full py-2 pl-2 pr-3">
          <button
            onClick={() => go(-1)}
            aria-label="Предыдущая страна"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-panel-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="flex items-center gap-2.5">
            <Img
              src={active.cover}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
            <span className="min-w-[120px]">
              <span className="block font-display text-lg font-semibold leading-tight text-text">
                {active.name}
              </span>
              <span className="block font-sans text-[11px] text-text-muted">{active.subtitle}</span>
            </span>
          </span>

          <button
            onClick={() => go(1)}
            aria-label="Следующая страна"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-panel-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Индикатор позиции */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setIndex(i)}
            aria-label={`Перейти к ${item.name}`}
            aria-current={i === index}
            className={cn(
              'h-1.5 rounded-full transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              i === index ? 'w-6 bg-primary' : 'w-1.5 bg-white/25 hover:bg-white/40'
            )}
          />
        ))}
      </div>
    </div>
  )
}
