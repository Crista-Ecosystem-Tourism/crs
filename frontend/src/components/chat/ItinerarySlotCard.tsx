import { Star } from 'lucide-react'
import type { ItinerarySlot, Place } from '@/types'
import { useApp } from '@/context/AppContext'

interface ItinerarySlotCardProps {
  slot: ItinerarySlot
}

const timeLabelEmoji: Record<string, string> = {
  'утро': '☀️',
  'обед': '🍽️',
  'день': '🌤️',
  'после обеда': '🌤️',
  'вечер': '🌅',
  'закат': '🌇',
  'ночь': '🌙',
}

function getTimeEmoji(label: string): string {
  const lower = label.toLowerCase()
  for (const [key, emoji] of Object.entries(timeLabelEmoji)) {
    if (lower.includes(key)) return emoji
  }
  return '📍'
}

const typeEmoji: Record<Place['type'], string> = {
  attraction: '🏛️',
  restaurant: '🍽️',
  hotel: '🏨',
  nature: '🌳',
  culture: '🎭',
  entertainment: '🎪',
}

export function ItinerarySlotCard({ slot }: ItinerarySlotCardProps) {
  const { setSelectedPlace } = useApp()
  const place = slot.place
  const placeType = place?.type ?? 'attraction'
  const placeEmoji = typeEmoji[placeType]

  const handleClick = () => {
    if (place) {
      setSelectedPlace(place)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`
        rounded-xl overflow-hidden
        bg-white dark:bg-surface-light border border-border/50
        hover:border-primary/30 hover:shadow-md
        transition-all duration-200
        ${place ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      {/* Time label */}
      <div className="px-3 pt-2.5 pb-1">
        <span className="text-xs font-medium text-text-muted">
          {getTimeEmoji(slot.time_label)} {slot.time_label}
        </span>
      </div>

      {/* Place info */}
      <div className="px-3 pb-2 flex items-start gap-2.5">
        {/* Emoji avatar */}
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-lg">{placeEmoji}</span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-medium text-sm text-text truncate">
              {slot.place_name}
            </h4>
            {place?.rating && (
              <span className="flex items-center gap-0.5 text-xs text-text-muted flex-shrink-0">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {place.rating}
              </span>
            )}
          </div>
          {place?.description && (
            <p className="text-[11px] text-text-secondary line-clamp-1 mt-0.5">
              {place.description}
            </p>
          )}
        </div>
      </div>

      {/* LLM note */}
      {slot.note && (
        <div className="px-3 pb-2.5 pt-0.5">
          <div className="text-[11px] text-text-secondary leading-relaxed bg-primary/5 dark:bg-primary/10 rounded-lg px-2.5 py-1.5">
            <span className="text-primary mr-1">💡</span>
            {slot.note}
          </div>
        </div>
      )}
    </div>
  )
}
