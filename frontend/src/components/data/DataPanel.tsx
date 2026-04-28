import { ArrowLeft, BookOpen } from 'lucide-react'

interface DataPanelProps {
  onBack: () => void
}

export function DataPanel({ onBack }: DataPanelProps) {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="flex-shrink-0 p-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <h1 className="text-xl font-bold text-text">CristaWiki</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-3">CristaWiki</h2>
          <p className="text-text-secondary leading-relaxed">
            Раздел в разработке — здесь появится база знаний о путешествиях.
          </p>
        </div>
      </div>
    </div>
  )
}
