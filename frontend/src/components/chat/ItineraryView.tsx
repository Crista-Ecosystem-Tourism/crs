import { useState, useCallback } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ItineraryDay } from '@/types'
import { ItinerarySlotCard } from './ItinerarySlotCard'

interface ItineraryViewProps {
  days: ItineraryDay[]
}

const SWIPE_THRESHOLD = 50

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

const transition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
}

export function ItineraryView({ days }: ItineraryViewProps) {
  const [[currentIndex, direction], setPage] = useState([0, 0])

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prev]) => {
        const next = prev + newDirection
        if (next < 0 || next >= days.length) return [prev, 0]
        return [next, newDirection]
      })
    },
    [days.length]
  )

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const { offset, velocity } = info
      if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
        if (offset.x > 0) {
          paginate(-1)
        } else {
          paginate(1)
        }
      }
    },
    [paginate]
  )

  if (days.length === 0) return null

  const day = days[currentIndex]

  return (
    <div className="w-full">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => paginate(-1)}
          disabled={currentIndex === 0}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-surface-light hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-text" />
        </button>

        <h3 className="text-sm font-semibold text-text text-center">
          День {day.day}: {day.title}
        </h3>

        <button
          onClick={() => paginate(1)}
          disabled={currentIndex === days.length - 1}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-surface-light hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-text" />
        </button>
      </div>

      {/* Day content with swipe */}
      <div className="overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="flex flex-col gap-2"
          >
            {day.slots.map((slot, i) => (
              <ItinerarySlotCard key={`${day.day}-${i}`} slot={slot} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      {days.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {days.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setPage([i, i > currentIndex ? 1 : -1])}
              className={`rounded-full transition-colors ${
                i === currentIndex
                  ? 'bg-primary w-2.5 h-2.5'
                  : 'bg-text-muted/30 w-2 h-2 hover:bg-text-muted/50'
              }`}
              animate={{ scale: i === currentIndex ? 1.2 : 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
