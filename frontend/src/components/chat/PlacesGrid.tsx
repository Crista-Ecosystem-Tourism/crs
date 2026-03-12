import { useRef, useCallback, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { Place } from '@/types'
import { PlaceCard } from './PlaceCard'
import { useApp } from '@/context/AppContext'

interface PlacesGridProps {
  places: Place[]
  cityName?: string
}

export function PlacesGrid({ places: messagePlaces, cityName }: PlacesGridProps) {
  const { places: globalPlaces } = useApp()

  const places = useMemo(() => {
    if (globalPlaces.length === 0) return messagePlaces
    const globalMap = new Map(globalPlaces.map(p => [p.id, p]))
    return messagePlaces.map(mp => globalMap.get(mp.id) || mp)
  }, [messagePlaces, globalPlaces])

  const scrollRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false })

  if (!places || places.length === 0) return null

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth'
      })
    }
  }

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current
    if (!el || e.button !== 0) return
    drag.current = { active: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false }
    el.style.scrollBehavior = 'auto'
    el.style.cursor = 'grabbing'
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!drag.current.active) return
      const el = scrollRef.current
      if (!el) return
      const dx = e.clientX - drag.current.startX
      if (Math.abs(dx) > 3) drag.current.moved = true
      el.scrollLeft = drag.current.scrollLeft - dx
    }

    const onMouseUp = () => {
      if (!drag.current.active) return
      const el = scrollRef.current
      if (el) {
        el.style.scrollBehavior = 'smooth'
        el.style.cursor = ''
      }
      drag.current.active = false
      if (drag.current.moved) {
        requestAnimationFrame(() => { drag.current.moved = false })
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const selectedCount = places.filter(p => p.selected).length

  return (
    <div className="relative -ml-9 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pl-9 pr-2">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-text">Рекомендации</span>
          {cityName && (
            <span className="text-xs text-text-muted font-medium">{cityName}</span>
          )}
          <span className="text-[10px] text-text-muted bg-surface-light rounded-full px-2 py-0.5">
            {places.length} мест
          </span>
          {selectedCount > 0 && (
            <span className="text-[10px] text-primary bg-primary/10 rounded-full px-2 py-0.5 font-medium">
              {selectedCount} в маршруте
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll('left')}
            className="w-7 h-7 rounded-full bg-surface border border-border/50 hover:bg-surface-hover flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-7 h-7 rounded-full bg-surface border border-border/50 hover:bg-surface-hover flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Cards scroll with fade edges */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hidden pl-9 pr-4 pb-2 pt-0.5 select-none"
          style={{ scrollBehavior: 'smooth', cursor: 'grab' }}
          onMouseDown={onMouseDown}
        >
          {places.map((place, index) => (
            <PlaceCard
              key={place.id}
              place={place}
              index={index}
              dragRef={drag}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
