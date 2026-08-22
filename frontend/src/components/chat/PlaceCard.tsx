import { MutableRefObject } from 'react'
import {
  Heart,
  Landmark,
  UtensilsCrossed,
  BedDouble,
  Trees,
  Drama,
  PartyPopper,
  Star,
} from 'lucide-react'
import { Place } from '@/types'
import { useApp } from '@/context/AppContext'
import { StarRating } from '@/components/ui/StarRating'
import { Img } from '@/components/ui/Img'
import { cn } from '@/lib/utils'

interface PlaceCardProps {
  place: Place
  index: number
  dragRef?: MutableRefObject<{ active: boolean; moved: boolean }>
}

/** Иконки, не эмодзи: один набор, одна толщина штриха. */
const typeIcon: Record<Place['type'], typeof Landmark> = {
  attraction: Landmark,
  restaurant: UtensilsCrossed,
  hotel: BedDouble,
  nature: Trees,
  culture: Drama,
  entertainment: PartyPopper,
}

const typeLabel: Record<Place['type'], string> = {
  attraction: 'Достопримечательность',
  restaurant: 'Еда',
  hotel: 'Ночлег',
  nature: 'Природа',
  culture: 'Культура',
  entertainment: 'Развлечение',
}

export function PlaceCard({ place, dragRef }: PlaceCardProps) {
  const { togglePlaceSelection, setSelectedPlace, ratePlace } = useApp()
  const TypeIcon = typeIcon[place.type]

  const handleCardClick = () => {
    if (dragRef?.current.moved) return
    setSelectedPlace(place)
  }

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    togglePlaceSelection(place.id)
  }

  return (
    <div className="relative w-[200px] shrink-0">
      <div
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleCardClick()
          }
        }}
        role="button"
        tabIndex={0}
        className={cn(
          'group cursor-pointer overflow-hidden rounded-lg border border-hairline bg-panel',
          'transition duration-base ease-standard hover:border-hairline-2 hover:bg-panel-2',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          place.selected && 'border-primary/50 bg-primary/[0.08]'
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {place.imageUrl ? (
            <Img
              src={place.imageUrl}
              alt={place.name}
              className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700 to-ink-850 text-text-muted">
              <TypeIcon className="h-7 w-7" aria-hidden="true" />
            </span>
          )}

          {place.rating && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-ink-950/70 px-2 py-0.5 font-sans text-[11px] font-medium text-white backdrop-blur-sm">
              <Star className="h-3 w-3 fill-primary text-primary" aria-hidden="true" />
              <span className="tabular">{place.rating}</span>
            </span>
          )}

          <button
            onClick={handleHeartClick}
            aria-label={place.selected ? `Убрать ${place.name} из маршрута` : `Добавить ${place.name} в маршрут`}
            aria-pressed={place.selected}
            className={cn(
              'absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full',
              'transition duration-base ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              place.selected
                ? 'bg-primary text-ink-950'
                : 'bg-ink-950/50 text-white backdrop-blur-sm hover:bg-ink-950/75'
            )}
          >
            <Heart className={cn('h-4 w-4', place.selected && 'fill-current')} aria-hidden="true" />
          </button>
        </div>

        <div className="p-3">
          <p className="flex items-center gap-1.5 font-sans text-[11px] text-text-muted">
            <TypeIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{typeLabel[place.type]}</span>
          </p>
          <h4 className="mt-1 line-clamp-1 font-display text-lg font-semibold leading-tight text-text">
            {place.name}
          </h4>
          <p className="mt-1 line-clamp-2 font-sans text-xs leading-relaxed text-text-secondary">
            {place.description}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <StarRating
              value={place.userRating || 0}
              onChange={(r) => ratePlace(place.id, r)}
              size="sm"
            />
            {place.priceRange && (
              <span className="shrink-0 font-sans text-[11px] font-medium text-primary">
                {place.priceRange}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
