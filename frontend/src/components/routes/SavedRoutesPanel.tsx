import { useState } from 'react'
import { Search, ArrowLeft, Map, MapPin, Sparkles, ChevronRight } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { GlassPanel, Chip, IconButton } from '@/components/ui/glass'
import { formatRelativeDate } from '@/lib/utils'

interface SavedRoutesPanelProps {
  onBack: () => void
}

function InspirationCard({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-lg border border-hairline-2 bg-gradient-to-br from-primary/20 via-accent/15 to-transparent p-4 text-left transition duration-base ease-standard hover:-translate-y-0.5 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-5"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-ink-950/35 ring-1 ring-white/15 transition-colors group-hover:bg-primary/15">
          <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-1 flex items-start justify-between gap-2">
            <span className="font-display text-xl font-semibold leading-tight text-text">
              Вдохновение
            </span>
            <ChevronRight
              className="h-5 w-5 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
          <span className="block font-sans text-sm leading-snug text-text-secondary">
            Рекомендации под ваш стиль поездки
          </span>
        </span>
      </div>
    </button>
  )
}

export function SavedRoutesPanel({ onBack }: SavedRoutesPanelProps) {
  const { savedRoutes, loadSavedRoute, setMainView } = useApp()
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? savedRoutes.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.destination.toLowerCase().includes(search.toLowerCase())
      )
    : savedRoutes

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-5 pt-6 sm:px-6">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-4 flex items-center gap-3">
            <IconButton label="Назад" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
              <ArrowLeft />
            </IconButton>
            <h1 className="font-display text-2xl font-semibold text-text">Мои маршруты</h1>
            <Chip size="sm" className="tabular">{savedRoutes.length}</Chip>
          </div>

          <InspirationCard onOpen={() => setMainView('inspiration')} />

          {savedRoutes.length > 0 && (
            <div className="relative mt-4">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <label htmlFor="routes-search" className="sr-only">Поиск по маршрутам</label>
              <input
                id="routes-search"
                type="text"
                placeholder="Поиск по маршрутам"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-md border border-hairline bg-panel pl-10 pr-4 font-sans text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-2 focus:ring-accent"
              />
            </div>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        <div className="mx-auto max-w-[900px]">
          {filtered.length > 0 ? (
            <div className="space-y-2">
              {filtered.map((route) => (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => loadSavedRoute(route.id)}
                  className="group w-full rounded-lg border border-hairline bg-panel p-3.5 text-left transition duration-base ease-standard hover:border-hairline-2 hover:bg-panel-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-panel-2 text-text-muted transition-colors group-hover:bg-primary/15 group-hover:text-primary">
                      <Map className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="mb-1 flex items-center justify-between gap-2">
                        <span className="truncate font-sans text-sm font-semibold text-text">
                          {route.name}
                        </span>
                        <span className="shrink-0 whitespace-nowrap font-sans text-[11px] text-text-muted">
                          {formatRelativeDate(route.createdAt)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 font-sans text-xs text-text-secondary">
                        <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{route.destination}</span>
                        {route.places.length > 0 && (
                          <span className="shrink-0 tabular text-text-muted">
                            {route.places.length} мест
                          </span>
                        )}
                      </span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <GlassPanel className="flex flex-col items-center justify-center px-8 py-12 text-center">
              {search.trim() ? (
                <>
                  <Search className="mb-3 h-9 w-9 text-text-muted" aria-hidden="true" />
                  <p className="font-sans text-sm text-text-secondary">
                    По запросу «{search}» ничего не нашлось
                  </p>
                  <button
                    onClick={() => setSearch('')}
                    className="mt-2 font-sans text-sm text-link transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Показать все маршруты
                  </button>
                </>
              ) : (
                <>
                  <Map className="mb-3 h-9 w-9 text-text-muted" aria-hidden="true" />
                  <p className="font-sans text-sm text-text-secondary">Маршрутов пока нет</p>
                  <p className="mt-1 font-sans text-xs text-text-muted">
                    Сохраните маршрут из чата, чтобы он появился здесь
                  </p>
                </>
              )}
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  )
}
