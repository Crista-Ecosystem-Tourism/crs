import { ArrowLeft, BookOpen, Brain, Users, Globe, Pen, Sparkles } from 'lucide-react'

interface DataPanelProps {
  onBack: () => void
}

export function DataPanel({ onBack }: DataPanelProps) {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 p-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <h1 className="text-xl font-bold text-text">Данные и статьи</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-2xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-3">Живая нейронка</h2>
          <p className="text-text-secondary leading-relaxed">
            Мы создаём нейросеть, которая учится на <strong>реальных впечатлениях</strong> путешественников,
            а не на сухих описаниях из справочников.
          </p>
        </div>

        {/* How it works */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-xl bg-surface-light/50 border border-border/30">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Pen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text mb-1">Вы пишете о своих путешествиях</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Статьи, заметки, впечатления — делитесь тем, что понравилось, что разочаровало, что удивило.
                Ваше портфолио путешествий становится частью базы знаний.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-surface-light/50 border border-border/30">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text mb-1">Нейросеть учится на ваших ощущениях</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Мы анализируем не просто факты, а эмоции, предпочтения и личный опыт.
                Система понимает, что вам нравится на глубоком уровне.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-surface-light/50 border border-border/30">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text mb-1">Персональные рекомендации</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Чем больше вы делитесь, тем точнее подбор. Не шаблонный «топ-10»,
                а именно то, что зацепит лично вас — на основе живого опыта таких же людей.
              </p>
            </div>
          </div>
        </div>

        {/* Current data */}
        <div className="p-4 rounded-xl bg-surface border border-border mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-text">Доступные направления</h3>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
              Сочи — 1500+ мест
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
              Санкт-Петербург — 400+ мест
            </span>
          </div>
          <p className="text-xs text-text-muted mt-3">
            Новые направления добавляются по мере поступления данных от путешественников
          </p>
        </div>

        {/* Coming soon */}
        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-text">Модуль статей — в разработке</h3>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            Скоро вы сможете писать статьи о своих путешествиях, загружать фото
            и формировать портфолио, на котором будет учиться наша нейросеть.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <Users className="w-3.5 h-3.5" />
            <span>Люди пишут. Мы анализируем. Нейронка подбирает лично для вас.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
