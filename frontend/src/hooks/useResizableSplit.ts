import { useState, useCallback, useEffect, useRef } from 'react'

interface UseResizableSplitOptions {
  minLeftPx?: number
  minRightPx?: number
  defaultRatio?: number
  storageKey?: string
}

export function useResizableSplit({
  minLeftPx = 320,
  minRightPx = 300,
  defaultRatio = 0.4,
  storageKey = 'split-ratio',
}: UseResizableSplitOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [ratio, setRatio] = useState<number>(() => {
    if (typeof window === 'undefined') return defaultRatio
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const parsed = parseFloat(stored)
      if (!isNaN(parsed) && parsed > 0 && parsed < 1) return parsed
    }
    return defaultRatio
  })

  // Clamp ratio to respect min widths
  const clampRatio = useCallback(
    (r: number): number => {
      const container = containerRef.current
      if (!container) return r
      const w = container.offsetWidth
      if (w === 0) return r
      const minLeft = minLeftPx / w
      const maxLeft = 1 - minRightPx / w
      return Math.min(Math.max(r, minLeft), maxLeft)
    },
    [minLeftPx, minRightPx],
  )

  // Re-clamp on window resize
  useEffect(() => {
    const onResize = () => setRatio((prev) => clampRatio(prev))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clampRatio])

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(ratio))
    } catch {
      /* ignore */
    }
  }, [ratio, storageKey])

  // Drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      setIsDragging(true)

      const startX = 'touches' in e ? e.touches[0].clientX : e.clientX

      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      const onMove = (ev: MouseEvent | TouchEvent) => {
        const clientX =
          'touches' in ev
            ? (ev as TouchEvent).touches[0]?.clientX ?? startX
            : (ev as MouseEvent).clientX
        const newRatio = (clientX - rect.left) / rect.width
        setRatio(clampRatio(newRatio))
      }

      const onUp = () => {
        setIsDragging(false)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        document.removeEventListener('touchmove', onMove)
        document.removeEventListener('touchend', onUp)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
      document.addEventListener('touchmove', onMove)
      document.addEventListener('touchend', onUp)
    },
    [clampRatio],
  )

  const handleDoubleClick = useCallback(() => {
    setRatio(clampRatio(defaultRatio))
  }, [clampRatio, defaultRatio])

  return { ratio, isDragging, handleMouseDown, handleDoubleClick, containerRef }
}
