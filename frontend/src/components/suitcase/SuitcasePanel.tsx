import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Archive,
  Briefcase,
  ChevronRight,
  Globe,
  Loader2,
  Luggage,
  Map as MapIcon,
  Plane,
  Plus,
  Target,
  Trash2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { useSuitcaseWorkspace } from '@/hooks/useSuitcaseWorkspace'
import { geocodeCityCountry } from '@/lib/suitcaseGeocode'
import { cn, formatDate, getTripDuration } from '@/lib/utils'
import {
  convertToRub,
  fetchExchangeRatesToRub,
  getCurrencySymbol,
  SUITCASE_POPULAR_CURRENCIES,
} from '@/lib/suitcaseCurrencies'
import type { SuitcaseExpense, SuitcaseGoal, SuitcaseTrip } from '@/types/suitcase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SuitcaseJourneyMap, type JourneyMarker } from './SuitcaseJourneyMap'

const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Еда' },
  { value: 'lodging', label: 'Жильё' },
  { value: 'transport', label: 'Транспорт' },
  { value: 'entertainment', label: 'Развлечения' },
  { value: 'shopping', label: 'Шопинг' },
  { value: 'other', label: 'Другое' },
] as const

const MOODS = [
  { value: 'none', label: 'Без настроения' },
  { value: 'happy', label: 'Счастье' },
  { value: 'excited', label: 'Восторг' },
  { value: 'relaxed', label: 'Расслабление' },
  { value: 'adventure', label: 'Приключения' },
  { value: 'peaceful', label: 'Спокойствие' },
  { value: 'busy', label: 'Динамика' },
] as const

const POPULAR_DESTINATIONS = [
  { name: 'Париж', country: 'Франция', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
  { name: 'Рим', country: 'Италия', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400' },
  { name: 'Токио', country: 'Япония', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400' },
  { name: 'Нью-Йорк', country: 'США', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
] as const

type SuitcasePanelProps = {
  onBack: () => void
}

export function SuitcasePanel({ onBack }: Readonly<SuitcasePanelProps>) {
  const { user } = useApp()
  const enabled = !!user
  const store = useSuitcaseWorkspace(enabled)

  const [detailTripId, setDetailTripId] = useState<string | null>(null)
  const [tab, setTab] = useState('trips')
  const [coords, setCoords] = useState<Record<string, { lat: number; lng: number }>>({})

  if (!user) {
    return (
      <div className="flex flex-col h-full bg-background overflow-hidden">
        <header className="flex-shrink-0 p-4 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors"
              aria-label="Назад"
            >
              <ArrowLeft className="w-4 h-4 text-text-secondary" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Luggage className="w-5 h-5 text-emerald-500" />
              </div>
              <h1 className="text-lg font-bold text-text truncate">Мой чемодан</h1>
            </div>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <Luggage className="w-14 h-14 text-emerald-500/80 mb-4" />
          <h2 className="text-xl font-bold text-text mb-2">Войдите в Crista</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            Поездки и расходы хранятся в вашем аккаунте на нашем сервере (как чат и маршруты), без Google Firebase.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-center">
            <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
              <Link to="/login">Войти</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/signup">Регистрация</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const activeTrips = useMemo(() => store.trips.filter((t) => !t.isArchived), [store.trips])
  const archivedTrips = useMemo(() => store.trips.filter((t) => t.isArchived), [store.trips])

  useEffect(() => {
    let cancelled = false
    const ids = new Set(store.trips.map((t) => t.id))
    setCoords((prev) => {
      const next: Record<string, { lat: number; lng: number }> = {}
      for (const [id, c] of Object.entries(prev)) {
        if (ids.has(id)) next[id] = c
      }
      return next
    })

    const active = store.trips.filter((t) => !t.isArchived)
    void (async () => {
      const results = await Promise.all(
        active.map(async (t) => {
          const geo = await geocodeCityCountry(t.city, t.country)
          return geo ? { id: t.id, geo } : null
        })
      )
      if (cancelled) return
      setCoords((prev) => {
        const n = { ...prev }
        for (const r of results) {
          if (r) n[r.id] = r.geo
        }
        return n
      })
    })()

    return () => {
      cancelled = true
    }
  }, [store.trips])

  const journeyMarkers: JourneyMarker[] = useMemo(
    () =>
      activeTrips
        .filter((t) => coords[t.id])
        .map((t) => ({
          id: t.id,
          title: t.country,
          subtitle: `${t.city} · ${t.startDate}`,
          lat: coords[t.id].lat,
          lng: coords[t.id].lng,
        })),
    [activeTrips, coords]
  )

  const visitedCountries = useMemo(() => {
    const s = new Set<string>()
    for (const t of store.trips) {
      if (!t.isArchived) s.add(t.country.trim().toLowerCase())
    }
    return s
  }, [store.trips])

  const detailTrip = detailTripId ? store.trips.find((t) => t.id === detailTripId) ?? null : null

  if (detailTrip) {
    return (
      <TripDetail
        trip={detailTrip}
        expenses={store.expenses.filter((e) => e.tripId === detailTrip.id)}
        onBack={() => setDetailTripId(null)}
        onUpdate={async (patch) => {
          await store.updateTrip(detailTrip.id, patch)
        }}
        onDelete={async () => {
          if (window.confirm('Удалить поездку и все расходы?')) {
            await store.deleteTrip(detailTrip.id)
            setDetailTripId(null)
          }
        }}
        onAddExpense={store.addExpense}
        onDeleteExpense={store.deleteExpense}
      />
    )
  }

  if (store.loading && !store.hasLoadedOnce) {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm text-text-secondary">Загрузка чемодана…</p>
      </div>
    )
  }

  if (store.error && store.hasLoadedOnce && store.trips.length === 0 && store.goals.length === 0) {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center p-6 text-center gap-4">
        <p className="text-sm text-text-secondary">{store.error}</p>
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => void store.refresh()}>
          Повторить
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="flex-shrink-0 p-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors"
            aria-label="Назад"
          >
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <Luggage className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-text truncate">Мой чемодан</h1>
              <p className="text-[11px] text-text-muted truncate">
                Данные в аккаунте Crista (PostgreSQL), вход — email и пароль
              </p>
            </div>
          </div>
        </div>
      </header>

      {store.error ? (
        <div className="flex-shrink-0 mx-3 mt-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between gap-2">
          <span>{store.error}</span>
          <button
            type="button"
            className="text-primary font-medium whitespace-nowrap"
            onClick={() => void store.refresh()}
          >
            Обновить
          </button>
        </div>
      ) : null}

      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0">
        <div className="flex-shrink-0 px-3 pt-3 border-b border-border overflow-x-auto">
          <TabsList className="bg-surface-light/80 h-auto flex-wrap justify-start gap-1 p-1 w-full sm:w-auto">
            <TabsTrigger value="trips" className="gap-1.5 text-xs sm:text-sm">
              <Briefcase className="w-3.5 h-3.5" />
              Поездки
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-1.5 text-xs sm:text-sm">
              <MapIcon className="w-3.5 h-3.5" />
              Карта
            </TabsTrigger>
            <TabsTrigger value="world" className="gap-1.5 text-xs sm:text-sm">
              <Globe className="w-3.5 h-3.5" />
              Мир
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-1.5 text-xs sm:text-sm">
              <Target className="w-3.5 h-3.5" />
              Цели
            </TabsTrigger>
            <TabsTrigger value="archive" className="gap-1.5 text-xs sm:text-sm">
              <Archive className="w-3.5 h-3.5" />
              Архив
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="trips" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
          <TripsHomeTab
            activeTrips={activeTrips}
            journeyMarkers={journeyMarkers}
            onOpenTrip={setDetailTripId}
            onAddTrip={store.addTrip}
          />
        </TabsContent>

        <TabsContent value="map" className="flex-1 min-h-0 mt-0 p-4 data-[state=inactive]:hidden">
          <p className="text-sm text-text-secondary mb-3">Карта путешествий по активным поездкам</p>
          <div className="h-[min(70vh,560px)] min-h-[280px]">
            <SuitcaseJourneyMap markers={journeyMarkers} className="h-full" />
          </div>
        </TabsContent>

        <TabsContent value="world" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
          <WorldTab visitedCountries={visitedCountries} />
        </TabsContent>

        <TabsContent value="goals" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
          <GoalsTab goals={store.goals} setProgress={store.setGoalProgress} addGoal={store.addGoal} />
        </TabsContent>

        <TabsContent value="archive" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
          <ArchiveTab trips={archivedTrips} onOpen={setDetailTripId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TripsHomeTab({
  activeTrips,
  journeyMarkers,
  onOpenTrip,
  onAddTrip,
}: {
  activeTrips: SuitcaseTrip[]
  journeyMarkers: JourneyMarker[]
  onOpenTrip: (id: string) => void
  onAddTrip: (p: Omit<SuitcaseTrip, 'id' | 'createdAt'>) => Promise<void>
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const lastTrip = activeTrips[0] ?? null

  return (
    <ScrollArea className="h-full">
      <div className="p-4 pb-10 max-w-lg mx-auto w-full space-y-6">
        {lastTrip && (
          <section>
            <h2 className="text-lg font-bold text-text mb-2">Последняя поездка</h2>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenTrip(lastTrip.id)}
              className="w-full text-left rounded-2xl overflow-hidden border border-border bg-surface-light focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <div
                className={cn(
                  'h-40 relative flex flex-col justify-end p-4',
                  lastTrip.image ? 'bg-cover bg-center' : 'bg-surface'
                )}
                style={
                  lastTrip.image
                    ? { backgroundImage: `linear-gradient(to top,rgba(0,0,0,.65),transparent), url(${lastTrip.image})` }
                    : undefined
                }
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  ✈ Последняя
                </span>
                <span className={cn('text-2xl font-bold', lastTrip.image ? 'text-white' : 'text-text')}>
                  {lastTrip.city}
                </span>
                <span className={cn('text-sm', lastTrip.image ? 'text-white/85' : 'text-text-secondary')}>
                  {lastTrip.country}
                </span>
              </div>
            </motion.button>
          </section>
        )}

        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            Поездки
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
              {activeTrips.length}
            </span>
          </h2>
          <Button size="sm" className="gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Добавить
          </Button>
        </div>

        {activeTrips.length === 0 && (
          <div className="rounded-3xl border border-border bg-surface-light p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
              <Plane className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="font-bold text-text">Пока нет поездок</p>
            <p className="text-sm text-text-secondary">Добавьте первую поездку и начните считать расходы</p>
            <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => setDialogOpen(true)}>
              + Первая поездка
            </Button>
          </div>
        )}

        <ul className="space-y-2">
          {activeTrips.map((trip) => (
            <li key={trip.id}>
              <button
                type="button"
                onClick={() => onOpenTrip(trip.id)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-surface-light hover:bg-surface-hover transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text">{trip.country}</p>
                  <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                    <span className="text-emerald-500">●</span>
                    {trip.city} · {trip.startDate}
                  </p>
                  {trip.mood ? (
                    <p className="text-xs text-text-muted mt-1 italic">{trip.mood}</p>
                  ) : null}
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0" />
              </button>
            </li>
          ))}
        </ul>

        <section>
          <h2 className="text-lg font-bold text-text mb-2">Карта маршрутов</h2>
          <div className="h-52">
            <SuitcaseJourneyMap markers={journeyMarkers} className="h-full" />
          </div>
          {activeTrips.length > 0 && journeyMarkers.length === 0 && (
            <p className="text-xs text-text-muted mt-2">Подбираем координаты по городам…</p>
          )}
        </section>

        <NewTripDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={onAddTrip} />
      </div>
    </ScrollArea>
  )
}

function NewTripDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSubmit: (p: Omit<SuitcaseTrip, 'id' | 'createdAt'>) => Promise<void>
}) {
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [mood, setMood] = useState('none')
  const [image, setImage] = useState('')

  const reset = useCallback(() => {
    setCountry('')
    setCity('')
    setStartDate('')
    setEndDate('')
    setMood('none')
    setImage('')
  }, [])

  const handleSave = async () => {
    if (!country.trim() || !city.trim() || !startDate || !endDate) return
    await onSubmit({
      country: country.trim(),
      city: city.trim(),
      startDate,
      endDate,
      mood: mood === 'none' ? undefined : mood,
      image: image.trim() || undefined,
      isArchived: false,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новая поездка</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-text-secondary">Страна</label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 rounded-xl" placeholder="Италия" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary">Город</label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 rounded-xl" placeholder="Рим" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-text-secondary">Начало</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary">Конец</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary">Настроение</label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="mt-1 rounded-xl">
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                {MOODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary">Обложка (URL)</label>
            <Input value={image} onChange={(e) => setImage(e.target.value)} className="mt-1 rounded-xl" placeholder="https://…" />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => void handleSave()}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WorldTab({ visitedCountries }: { visitedCountries: Set<string> }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'visited' | 'planned'>('all')

  const cards = useMemo(() => {
    let list = [...POPULAR_DESTINATIONS]
    if (q.trim()) {
      const qq = q.trim().toLowerCase()
      list = list.filter((d) => d.name.toLowerCase().includes(qq) || d.country.toLowerCase().includes(qq))
    }
    if (filter === 'visited') {
      list = list.filter((d) => visitedCountries.has(d.country.trim().toLowerCase()))
    }
    if (filter === 'planned') {
      list = list.filter((d) => !visitedCountries.has(d.country.trim().toLowerCase()))
    }
    return list
  }, [q, filter, visitedCountries])

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
      <div className="p-4 space-y-4 max-w-lg mx-auto pb-10">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск направления…"
          className="rounded-xl"
        />
        <div className="flex gap-2 flex-wrap">
          {(
            [
              ['all', 'Все'],
              ['visited', 'Был'],
              ['planned', 'Планы'],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={filter === key ? 'default' : 'outline'}
              className={cn('rounded-full text-xs', filter === key && 'bg-emerald-600 hover:bg-emerald-700')}
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>
        <h2 className="text-lg font-bold text-text">Популярные направления</h2>
        <div className="grid gap-3">
          {cards.map((d) => (
            <div
              key={`${d.name}-${d.country}`}
              className="flex gap-3 p-3 rounded-2xl border border-border bg-surface-light overflow-hidden"
            >
              <div
                className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${d.image})` }}
              />
              <div className="min-w-0 flex-1 py-1">
                <p className="font-semibold text-text">{d.name}</p>
                <p className="text-xs text-text-secondary">{d.country}</p>
                {visitedCountries.has(d.country.trim().toLowerCase()) && (
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase text-emerald-600">Уже был</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}

function GoalsTab({
  goals,
  setProgress,
  addGoal,
}: {
  goals: SuitcaseGoal[]
  setProgress: (id: string, current: number) => Promise<void>
  addGoal: (g: Omit<SuitcaseGoal, 'id'>) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [total, setTotal] = useState('10')
  const [color, setColor] = useState('#007AFF')

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
      <div className="p-4 space-y-4 max-w-lg mx-auto pb-10">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-text">Цели</h2>
          <Button size="sm" variant="outline" className="rounded-xl gap-1" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" />
            Цель
          </Button>
        </div>
        <p className="text-sm text-text-secondary">
          Прогресс синхронизируется с сервером Crista вместе с аккаунтом.
        </p>
        <ul className="space-y-3">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.current / Math.max(g.total, 1)) * 100))
            return (
              <li key={g.id} className="rounded-2xl border border-border bg-surface-light p-4 space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="font-medium text-text">{g.title}</span>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {g.current} / {g.total}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-lg h-8 text-xs"
                    onClick={() => void setProgress(g.id, Math.max(0, g.current - 1))}
                  >
                    −
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-lg h-8 text-xs"
                    onClick={() => void setProgress(g.id, Math.min(g.total, g.current + 1))}
                  >
                    +
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая цель</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-text-secondary">Название</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-text-secondary">Цель (число)</label>
              <Input value={total} onChange={(e) => setTotal(e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-text-secondary">Цвет</label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-10 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                void (async () => {
                  const t = parseInt(total, 10)
                  if (!title.trim() || !Number.isFinite(t) || t < 1) return
                  await addGoal({ title: title.trim(), current: 0, total: t, color })
                  setTitle('')
                  setTotal('10')
                  setColor('#007AFF')
                  setOpen(false)
                })()
              }}
            >
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  )
}

function ArchiveTab({ trips, onOpen }: { trips: SuitcaseTrip[]; onOpen: (id: string) => void }) {
  if (!trips.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <Archive className="w-12 h-12 text-text-muted mb-3" />
        <p className="font-semibold text-text">Архив пуст</p>
        <p className="text-sm text-text-secondary mt-1">Архивные поездки появятся здесь из карточки поездки</p>
      </div>
    )
  }
  return (
    <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
      <ul className="p-4 space-y-2 max-w-lg mx-auto pb-10">
        {trips.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onOpen(t.id)}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-surface-light hover:bg-surface-hover text-left"
            >
              <div>
                <p className="font-semibold text-text">{t.city}</p>
                <p className="text-xs text-text-secondary">{t.country}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted" />
            </button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}

function TripDetail({
  trip,
  expenses,
  onBack,
  onUpdate,
  onDelete,
  onAddExpense,
  onDeleteExpense,
}: {
  trip: SuitcaseTrip
  expenses: SuitcaseExpense[]
  onBack: () => void
  onUpdate: (patch: Partial<SuitcaseTrip>) => Promise<void>
  onDelete: () => Promise<void>
  onAddExpense: (e: Omit<SuitcaseExpense, 'id'>) => Promise<void>
  onDeleteExpense: (id: string) => Promise<void>
}) {
  const [rates, setRates] = useState<Record<string, number>>({ RUB: 1 })
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [impressions, setImpressions] = useState(trip.impressions ?? '')

  useEffect(() => {
    setImpressions(trip.impressions ?? '')
  }, [trip.id, trip.impressions])

  useEffect(() => {
    void fetchExchangeRatesToRub().then(setRates)
  }, [])

  const totalRub = useMemo(() => {
    return expenses.reduce((s, e) => s + convertToRub(e.amount, e.currency ?? 'RUB', rates), 0)
  }, [expenses, rates])

  const days = useMemo(() => {
    try {
      return getTripDuration(trip.startDate, trip.endDate)
    } catch {
      return 0
    }
  }, [trip.startDate, trip.endDate])

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="flex-shrink-0 p-4 border-b border-border flex items-center gap-3">
        <button type="button" onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover">
          <ArrowLeft className="w-4 h-4 text-text-secondary" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-text truncate">{trip.city}</h1>
          <p className="text-xs text-text-secondary truncate">
            {trip.country} · {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
            {days > 0 ? ` · ${days} дн.` : ''}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl text-xs"
          onClick={() => void onUpdate({ isArchived: !trip.isArchived })}
        >
          {trip.isArchived ? 'Вернуть' : 'В архив'}
        </Button>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 max-w-lg mx-auto space-y-6 pb-24">
          <section className="rounded-2xl border border-border bg-surface-light p-4 space-y-2">
            <h2 className="text-sm font-semibold text-text">Впечатления</h2>
            <textarea
              value={impressions}
              onChange={(e) => setImpressions(e.target.value)}
              onBlur={() => void onUpdate({ impressions: impressions.trim() || undefined })}
              rows={4}
              placeholder="Заметки о поездке…"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Расходы</h2>
              <Button size="sm" className="rounded-xl h-8 gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => setExpenseOpen(true)}>
                <Plus className="w-3.5 h-3.5" />
                Добавить
              </Button>
            </div>
            <p className="text-xs text-text-muted">
              Всего ≈ {totalRub.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽ (по курсу обмена)
            </p>
            {expenses.length === 0 ? (
              <p className="text-sm text-text-secondary">Расходов пока нет</p>
            ) : (
              <ul className="space-y-2">
                {expenses.map((e) => (
                  <li key={e.id} className="flex items-start gap-2 p-3 rounded-xl border border-border bg-surface-light">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text text-sm">{e.title}</p>
                      <p className="text-[11px] text-text-muted">
                        {e.date} · {EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label ?? e.category}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-text whitespace-nowrap">
                      {e.amount.toLocaleString('ru-RU')} {getCurrencySymbol(e.currency ?? 'RUB')}
                    </span>
                    <button
                      type="button"
                      aria-label="Удалить расход"
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-text-muted hover:text-destructive"
                      onClick={() => {
                        if (window.confirm('Удалить расход?')) void onDeleteExpense(e.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Button variant="danger" className="w-full rounded-xl" onClick={() => void onDelete()}>
            Удалить поездку
          </Button>
        </div>
      </ScrollArea>

      <ExpenseDialog
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        tripId={trip.id}
        onSubmit={async (payload) => {
          await onAddExpense(payload)
        }}
      />
    </div>
  )
}

function ExpenseDialog({
  open,
  onOpenChange,
  tripId,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  tripId: string
  onSubmit: (e: Omit<SuitcaseExpense, 'id'>) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0].value)
  const [currency, setCurrency] = useState('RUB')

  const save = async () => {
    const n = parseFloat(amount.replace(',', '.'))
    if (!title.trim() || !Number.isFinite(n)) return
    await onSubmit({
      tripId,
      title: title.trim(),
      amount: n,
      date,
      category,
      currency,
    })
    setTitle('')
    setAmount('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый расход</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-secondary">Описание</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 rounded-xl" placeholder="Ужин" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-text-secondary">Сумма</label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 rounded-xl" inputMode="decimal" />
            </div>
            <div>
              <label className="text-xs text-text-secondary">Валюта</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUITCASE_POPULAR_CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs text-text-secondary">Дата</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div>
            <label className="text-xs text-text-secondary">Категория</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => void save()}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
