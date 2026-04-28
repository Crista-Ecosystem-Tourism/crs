import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, Map, MapPin, Sparkles, ChevronRight } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn, formatRelativeDate } from '@/lib/utils'

interface SavedRoutesPanelProps {
  onBack: () => void
}

function InspirationRoutesCard({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onOpen}
      className={cn(
        'w-full rounded-2xl text-left overflow-hidden transition-all duration-300',
        'border border-white/12 bg-gradient-to-br from-primary/20 via-accent/15 to-transparent',
        'shadow-lg shadow-black/20 hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5',
        'group relative',
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/25 to-transparent opacity-70 pointer-events-none" />
      <div className="relative flex items-center gap-4 p-4 sm:p-5">
        <div className="w-14 h-14 shrink-0 rounded-2xl bg-background/35 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/15 group-hover:bg-primary/15 transition-colors">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-bold text-text leading-tight">Вдохновение</h2>
            <ChevronRight className="w-5 h-5 text-text-muted shrink-0 transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-sm text-text-secondary leading-snug">
            Рекомендации под ваш стиль поездки — когда всё будет готово на стороне Crista.
          </p>
        </div>
      </div>
    </motion.button>
  )
}

export function SavedRoutesPanel({ onBack }: SavedRoutesPanelProps) {
  const { savedRoutes, loadSavedRoute, setMainView } = useApp()
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? savedRoutes.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.destination.toLowerCase().includes(search.toLowerCase())
      )
    : savedRoutes

  const handleRouteClick = (routeId: string) => {
    loadSavedRoute(routeId)
  }

  const openInspiration = () => setMainView('inspiration')

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-shrink-0 p-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-text-secondary" />
            </button>
            <h1 className="text-xl font-bold text-text">Мои маршруты</h1>
            <span className="text-xs text-text-muted bg-surface-light rounded-full px-2 py-0.5">
              {savedRoutes.length}
            </span>
          </div>
        </div>

        <InspirationRoutesCard onOpen={openInspiration} />

        {savedRoutes.length > 0 && (
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Поиск по маршрутам..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-surface-light text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        {filtered.length > 0 ? (
          <div className="space-y-1.5">
            {filtered.map((route, i) => (
              <motion.button
                key={route.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleRouteClick(route.id)}
                className="w-full text-left p-3.5 rounded-xl transition-all group hover:bg-surface-light border border-transparent cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-surface-hover text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Map className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold truncate text-text">{route.name}</h3>
                      <span className="text-[11px] text-text-muted whitespace-nowrap flex-shrink-0">
                        {formatRelativeDate(route.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <MapPin className="w-3 h-3" />
                      <span>{route.destination}</span>
                      {route.places.length > 0 && (
                        <span className="text-text-muted">
                          · {route.places.length} мест
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : search.trim() ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[140px] text-center px-8">
            <Search className="w-10 h-10 text-text-muted/30 mb-3" />
            <p className="text-sm text-text-secondary">Ничего не найдено</p>
            <p className="text-xs text-text-muted mt-1">Попробуйте другой запрос</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[140px] text-center px-8">
            <Map className="w-10 h-10 text-text-muted/30 mb-3" />
            <p className="text-sm text-text-secondary">Маршрутов пока нет</p>
            <p className="text-xs text-text-muted mt-1">
              Сохраните маршрут из чата, чтобы он появился здесь
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
