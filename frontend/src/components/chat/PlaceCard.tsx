import { MutableRefObject } from 'react'
import { Star, Heart } from 'lucide-react'
import { Place } from '@/types'
import { useApp } from '@/context/AppContext'
import { StarRating } from '@/components/ui/StarRating'

interface PlaceCardProps {
  place: Place
  index: number
  dragRef?: MutableRefObject<{ active: boolean; moved: boolean }>
}

const typeEmoji: Record<Place['type'], string> = {
  attraction: '🏛️',
  restaurant: '🍽️',
  hotel: '🏨',
  nature: '🌳',
  culture: '🎭',
  entertainment: '🎪',
}

export function PlaceCard({ place, dragRef }: PlaceCardProps) {
  const { togglePlaceSelection, setSelectedPlace, ratePlace } = useApp()
  const emoji = typeEmoji[place.type]

  const handleCardClick = () => {
    if (dragRef?.current.moved) return
    setSelectedPlace(place)
  }

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    togglePlaceSelection(place.id)
  }

  return (
    <div className="relative flex-shrink-0 w-[180px]">
      <div
        onClick={handleCardClick}
        className={`
          rounded-2xl overflow-hidden cursor-pointer
          bg-surface
          shadow-md shadow-black/[0.08] dark:shadow-black/30
          hover:shadow-lg hover:shadow-black/[0.12] dark:hover:shadow-black/40
          hover:-translate-y-0.5
          transition-all duration-200
          ${place.selected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
        `}
      >
        {/* Image */}
        <div className="relative h-[110px]">
          {place.imageUrl ? (
            <img
              src={place.imageUrl}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 flex items-center justify-center">
              <span className="text-4xl drop-shadow-sm">{emoji}</span>
            </div>
          )}

          {/* Rating badge */}
          {place.rating && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium">
              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
              {place.rating}
            </div>
          )}

          {/* Heart button */}
          <button
            onClick={handleHeartClick}
            className={`
              absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-200 backdrop-blur-sm
              ${place.selected
                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                : 'bg-black/30 text-white/90 hover:bg-black/50 hover:scale-110'
              }
            `}
          >
            <Heart className={`w-4 h-4 ${place.selected ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-2.5">
          <h4 className="font-semibold text-xs text-text line-clamp-1 mb-0.5">{place.name}</h4>
          <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">{place.description}</p>
          <div className="mt-1.5 flex items-center justify-between">
            <StarRating
              value={place.userRating || 0}
              onChange={(r) => ratePlace(place.id, r)}
              size="sm"
            />
            {place.priceRange && (
              <span className="text-[10px] font-medium text-primary">{place.priceRange}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
