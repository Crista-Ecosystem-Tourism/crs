import { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  hasChipSelections?: boolean
  prefillText?: string | null
  onPrefillConsumed?: () => void
}

export function ChatInput({ onSend, disabled, hasChipSelections, prefillText, onPrefillConsumed }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset message when disabled state changes (e.g., modal opens)
  useEffect(() => {
    if (disabled) {
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [disabled]);

  // Prefill text from follow-up question click
  useEffect(() => {
    if (prefillText) {
      setMessage(prefillText)
      onPrefillConsumed?.()
      // Focus and resize textarea
      if (textareaRef.current) {
        textareaRef.current.focus()
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
          }
        }, 0)
      }
    }
  }, [prefillText, onPrefillConsumed])

  const canSend = (message.trim() || hasChipSelections) && !disabled

  const handleSend = () => {
    if (!canSend) return
    onSend(message.trim())
    setMessage('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
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

  const showSendButton = message.trim() || hasChipSelections

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Glow effect on focus */}
      <div className={cn(
        "absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-[20px] blur opacity-0 transition-opacity duration-500",
        isFocused && "opacity-30"
      )} />

      <div className={cn(
        'relative flex items-end gap-2 p-1.5 rounded-[18px] bg-surface/80 backdrop-blur-xl border border-hairline shadow-lg transition-all',
        isFocused && "bg-surface shadow-primary/5"
      )}>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-text-muted hover:text-text hover:bg-panel h-9 w-9 mb-0.5 ml-0.5 flex-shrink-0"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={hasChipSelections ? "Добавьте комментарий или нажмите отправить..." : "Сообщение..."}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent text-text placeholder:text-text-muted',
            'text-sm leading-relaxed outline-none min-h-[40px] max-h-[120px] py-2.5',
            'selection:bg-primary/30'
          )}
        />

        <div className="flex items-center gap-1 pb-0.5 pr-0.5">
          {!showSendButton && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-text-muted hover:text-text hover:bg-panel h-9 w-9"
            >
              <Mic className="w-4 h-4" />
            </Button>
          )}

          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="icon-sm"
            className={cn(
              "rounded-full h-9 w-9 transition-all duration-300 shadow-lg",
              showSendButton
                ? "bg-primary text-white hover:bg-primary-hover scale-100"
                : "bg-panel text-text-muted scale-90 opacity-0 w-0 p-0 overflow-hidden"
            )}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
