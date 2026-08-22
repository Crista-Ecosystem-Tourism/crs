import { useState, KeyboardEvent, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Sparkles, Mic, Plane, UtensilsCrossed, Palmtree, Mountain, Building2, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

interface HomeInputProps {
  onSend: (message: string) => void
}

const placeholders = [
  'Куда отправимся сегодня?',
  'Расскажи о своей мечте...',
  'Какое приключение планируешь?',
  'Опиши идеальное путешествие...',
]

const suggestions = [
  { label: 'Париж на выходные', icon: Building2, tripId: 'paris-weekend' },
  { label: 'Гастротур по Грузии', icon: UtensilsCrossed, tripId: 'georgia-food' },
  { label: 'Пляжи Бали', icon: Palmtree, tripId: 'bali-beaches' },
  { label: 'Горы Алтая', icon: Mountain, tripId: 'altai-trekking' },
  { label: 'Культура Киото', icon: Building2, tripId: 'kyoto-culture' },
  { label: 'Тур по Европе', icon: Map, tripId: 'europe-tour' },
  { label: 'Санкт-Петербург', icon: Building2, tripId: 'spb-excursions' },
  { label: 'Сафари в Кении', icon: Plane, tripId: 'kenya-safari' },
]

export function HomeInput({ onSend }: HomeInputProps) {
  const { sidebarCollapsed, loadTripChat } = useApp()
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Typewriter effect for placeholder
  useEffect(() => {
    if (isFocused || message) return

    const targetText = placeholders[placeholderIndex]

    if (isTyping) {
      if (displayedPlaceholder.length < targetText.length) {
        const timeout = setTimeout(() => {
          setDisplayedPlaceholder(targetText.slice(0, displayedPlaceholder.length + 1))
        }, 50)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => setIsTyping(false), 2000)
        return () => clearTimeout(timeout)
      }
    } else {
      if (displayedPlaceholder.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedPlaceholder(displayedPlaceholder.slice(0, -1))
        }, 30)
        return () => clearTimeout(timeout)
      } else {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
        setIsTyping(true)
      }
    }
  }, [isFocused, message, placeholderIndex, displayedPlaceholder, isTyping])

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', damping: 20 }}
      className={cn(
        "fixed bottom-4 sm:bottom-6 md:bottom-8 left-0 right-0 z-50 flex flex-col pointer-events-none transition-all duration-200",
        sidebarCollapsed ? "lg:left-[64px]" : "lg:left-[240px]"
      )}
    >
      <div className="flex justify-center px-3 sm:px-4">
        <div className={cn(
          "w-full max-w-2xl pointer-events-auto transition-all duration-500 ease-out",
          isFocused ? "scale-[1.01] sm:scale-[1.02]" : "scale-100"
        )}>
          <div className="relative group">
            {/* Glow effect */}
            <div className={cn(
              "absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-700",
              isFocused && "opacity-30 blur-2xl"
            )} />

            {/* Inner glow */}
            <div className={cn(
              "absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/20 to-transparent opacity-0 transition-opacity duration-300",
              isFocused && "opacity-100"
            )} />

            <div className="relative flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-gradient-to-b from-white/80 to-white/60 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.25)]">
              <div className="pl-2 sm:pl-3 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onInput={handleInput}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  rows={1}
                  className={cn(
                    'w-full resize-none bg-transparent text-gray-900',
                    'text-base sm:text-lg leading-relaxed outline-none min-h-[24px] sm:min-h-[28px] max-h-[100px] sm:max-h-[120px] py-2 sm:py-2.5',
                    'selection:bg-primary/30 transition-all duration-300'
                  )}
                />
                {!message && (
                  <div className="absolute inset-0 flex items-center pointer-events-none py-2 sm:py-2.5">
                    <span className="text-base sm:text-lg text-gray-400">
                      {displayedPlaceholder}
                      <span className="animate-pulse">|</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 pr-1 sm:pr-1.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-text-muted hover:text-text hover:bg-panel0 rounded-full hidden sm:flex w-8 h-8"
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className={cn(
                    "flex items-center justify-center rounded-full w-9 h-9 sm:w-10 sm:h-10 transition-all duration-300",
                    message.trim()
                      ? "bg-primary text-white shadow-md hover:shadow-lg hover:bg-primary/90"
                      : "bg-gray-200/50 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions - Infinite Scroll - Full Width of Content Area */}
      {!message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full mt-3 sm:mt-4 pointer-events-auto"
        >
          <div className="relative w-full overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2 sm:gap-3"
            >
              <motion.div
                animate={{ x: [0, -1200] }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="flex gap-2 sm:gap-3 flex-shrink-0"
              >
                {suggestions.map((item, idx) => (
                  <motion.button
                    key={`${item.label}-${idx}`}
                    onClick={() => loadTripChat(item.tripId)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-2xl bg-gradient-to-b from-white/75 to-white/55 border border-white/60 text-xs sm:text-sm text-gray-900 font-semibold hover:from-white/90 hover:to-white/75 hover:border-white/80 hover:shadow-2xl transition-all duration-300 cursor-pointer shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] whitespace-nowrap flex-shrink-0 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/80 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                  >
                    <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                      <item.icon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
              {/* Duplicate for infinite scroll */}
              <motion.div
                animate={{ x: [0, -1200] }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="flex gap-2 sm:gap-3 flex-shrink-0"
              >
                {suggestions.map((item, idx) => (
                  <motion.button
                    key={`${item.label}-dup-${idx}`}
                    onClick={() => loadTripChat(item.tripId)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-2xl bg-gradient-to-b from-white/75 to-white/55 border border-white/60 text-xs sm:text-sm text-gray-900 font-semibold hover:from-white/90 hover:to-white/75 hover:border-white/80 hover:shadow-2xl transition-all duration-300 cursor-pointer shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] whitespace-nowrap flex-shrink-0 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/80 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                  >
                    <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                      <item.icon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-12 sm:w-24 md:w-32 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 sm:w-24 md:w-32 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

