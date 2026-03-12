import { motion } from 'framer-motion'
import { MessageCircleQuestion } from 'lucide-react'

interface FollowUpQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
}

export function FollowUpQuestions({ questions, onQuestionClick }: FollowUpQuestionsProps) {
  if (questions.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5 mt-2 pl-9">
      {questions.map((question, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          onClick={() => onQuestionClick(question)}
          className="group flex items-start gap-2 px-3 py-2 rounded-xl
            bg-primary/5 border border-primary/15 hover:bg-primary/10 hover:border-primary/30
            text-left text-sm text-text transition-all cursor-pointer"
        >
          <MessageCircleQuestion className="w-4 h-4 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="leading-snug">{question}</span>
        </motion.button>
      ))}
    </div>
  )
}
