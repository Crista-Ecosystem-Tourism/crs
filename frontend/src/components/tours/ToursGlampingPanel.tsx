import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Временные фоны; можно заменить на свои */
const IMG_TOURS =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80'
const IMG_GLAMPING =
  'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1600&q=80'

type SplitHalfProps = {
  title: string
  subtitle: string
  cta: string
  imageUrl: string
  overlayClass: string
  className?: string
}

function SplitHalf({ title, subtitle, cta, imageUrl, overlayClass, className }: SplitHalfProps) {
  return (
    <div
      className={cn(
        'relative flex-1 min-h-[42vh] md:min-h-0 overflow-hidden group',
        className,
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out will-change-transform group-hover:scale-110 motion-reduce:transform-none"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className={cn('absolute inset-0 pointer-events-none', overlayClass)} />
      <div className="relative z-10 flex h-full min-h-[42vh] md:min-h-0 flex-col items-center justify-center px-8 py-10 text-center">
        <h2 className="font-serif text-3xl md:text-[2.2rem] font-bold text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] tracking-tight">
          {title}
        </h2>
        <p className="mt-4 max-w-sm text-sm md:text-[0.9375rem] text-white/90 leading-snug drop-shadow-md">
          {subtitle}
        </p>
        <span className="mt-8 inline-flex items-center rounded border border-white/85 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/95 transition-colors group-hover:bg-white/15">
          {cta}
        </span>
      </div>
    </div>
  )
}

type ToursGlampingPanelProps = {
  onBack: () => void
}

export function ToursGlampingPanel({ onBack }: ToursGlampingPanelProps) {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex-shrink-0 p-4 pb-3 border-b border-border bg-background/95 z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <h1 className="text-xl font-bold text-text tracking-tight">Туры и глемпинг</h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col md:flex-row min-h-0">
        <SplitHalf
          title="Туры"
          subtitle="Готовые маршруты с гидом, трансфером и поддержкой Crista."
          cta="Скоро"
          imageUrl={IMG_TOURS}
          overlayClass="bg-gradient-to-br from-teal-900/55 via-slate-900/35 to-black/65"
        />
        <SplitHalf
          title="Глемпинг"
          subtitle="Комфорт среди природы: палатки люкс, домики с панорамными окнами."
          cta="Скоро"
          imageUrl={IMG_GLAMPING}
          overlayClass="bg-gradient-to-br from-purple-950/55 via-rose-950/30 to-black/65"
          className="border-t border-white/10 md:border-t-0 md:border-l md:border-white/10"
        />
      </div>
    </div>
  )
}
