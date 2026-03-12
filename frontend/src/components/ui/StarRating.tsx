import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange: (rating: number) => void
  size?: 'sm' | 'md'
  disabled?: boolean
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
}

const gapMap = {
  sm: 'gap-0.5',
  md: 'gap-1',
}

export function StarRating({ value, onChange, size = 'sm', disabled }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  const display = hovered || value
  const iconClass = sizeMap[size]

  return (
    <div
      className={cn('inline-flex items-center', gapMap[size])}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => !disabled && setHovered(star)}
          onClick={(e) => {
            e.stopPropagation()
            if (disabled) return
            // Toggle off if clicking same value
            onChange(value === star ? 0 : star)
          }}
          className={cn(
            'transition-colors duration-100',
            disabled ? 'cursor-default' : 'cursor-pointer',
          )}
        >
          <Star
            className={cn(
              iconClass,
              'transition-colors duration-100',
              star <= display
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-text-muted/30 hover:text-amber-300/50'
            )}
          />
        </button>
      ))}
    </div>
  )
}
