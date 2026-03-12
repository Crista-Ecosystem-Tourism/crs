import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, Map, MapPin } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { formatRelativeDate } from '@/lib/utils'

interface SavedRoutesPanelProps {
  onBack: () => void
}

export function SavedRoutesPanel({ onBack }: SavedRoutesPanelProps) {
  const { savedRoutes, loadSavedRoute } = useApp()
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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
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

        {/* Search */}
        {savedRoutes.length > 0 && (
          <div className="relative">
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

      {/* Routes List */}
      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length > 0 ? (
          <div className="space-y-1.5">
            {filtered.map((route, i) => (
              <motion.button
                key={route.id}
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
                      <h3 className="text-sm font-semibold truncate text-text">
                        {route.name}
                      </h3>
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
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Search className="w-10 h-10 text-text-muted/30 mb-3" />
            <p className="text-sm text-text-secondary">Ничего не найдено</p>
            <p className="text-xs text-text-muted mt-1">Попробуйте другой запрос</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
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
