import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

export const TypingIndicator = forwardRef<HTMLDivElement>(function TypingIndicator(_props, ref) {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-2"
    >
      <div className="w-7 h-7 rounded-full bg-surface-light flex items-center justify-center flex-shrink-0">
        <Bot className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="bg-surface-light px-3 py-2 rounded-2xl rounded-tl-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-text-muted"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
})
