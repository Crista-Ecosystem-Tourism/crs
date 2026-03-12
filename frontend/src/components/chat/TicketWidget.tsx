import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface TicketWidgetProps {
  origin: string       // IATA code (e.g. "SVO")
  destination: string  // IATA code (e.g. "AER")
  isOpen: boolean
  onClose: () => void
}

const WIDGET_CONFIG = {
  shmarker: '709788',
  trs: '506704',
  promo_id: '2811',
  campaign_id: '100',
  currency: 'rub',
  locale: 'ru',
  target_host: 'www.aviasales.ru/search',
  powered_by: 'true',
  with_fallback: 'false',
  non_direct_flights: 'true',
  min_lines: '5',
  border_radius: '8',
  color_button: '#7C3AED',       // primary violet
  color_background: '#1a1a2e',   // dark bg
  color_text: '#e0e0e0',         // light text
  color_border: '#2a2a4a',       // subtle border
}

function buildWidgetUrl(origin: string, destination: string): string {
  const params = new URLSearchParams({
    ...WIDGET_CONFIG,
    origin,
    destination,
  })
  return `https://tpwidg.com/content?${params.toString()}`
}

export function TicketWidget({ origin, destination, isOpen, onClose }: TicketWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    // Clean previous widget
    if (scriptRef.current) {
      scriptRef.current.remove()
      scriptRef.current = null
    }
    containerRef.current.innerHTML = ''

    // Create and inject script
    const script = document.createElement('script')
    script.src = buildWidgetUrl(origin, destination)
    script.async = true
    script.charset = 'utf-8'
    containerRef.current.appendChild(script)
    scriptRef.current = script

    return () => {
      if (scriptRef.current) {
        scriptRef.current.remove()
        scriptRef.current = null
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [isOpen, origin, destination])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] z-50 mx-auto max-w-[640px] flex flex-col rounded-2xl bg-surface border border-border/50 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
              <div>
                <h2 className="text-sm font-semibold text-text">Авиабилеты</h2>
                <p className="text-[11px] text-text-muted">{origin} → {destination}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover transition-colors text-text-muted hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Widget container */}
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto p-4"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
