import { ArrowLeft, Sparkles, Compass } from 'lucide-react'

type InspirationPanelProps = {
  onBack: () => void
}

export function InspirationPanel({ onBack }: InspirationPanelProps) {
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
          <h1 className="text-xl font-bold text-text">Вдохновение</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-3">Скоро здесь будет больше</h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Мы автоматически будем предлагать маршруты на основе ваших предпочтений и истории путешествий.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
            <Compass className="w-4 h-4" />
            <span>Персональные рекомендации</span>
          </div>
        </div>
      </div>
    </div>
  )
}
