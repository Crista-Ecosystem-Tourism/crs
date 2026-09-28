import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowLeft, Bell, Globe2, PiggyBank, Trophy,
  TrendingDown, MapPin, ChevronRight, BookOpenCheck, RotateCcw,
} from 'lucide-react'
import { GlassPanel, Chip, DisplayTitle, IconButton } from '@/components/ui/glass'
import { WorldMap } from './WorldMap'
import { CountryQuests } from './CountryQuests'
import { TravelPassport } from './TravelPassport'
import { DailyQuiz } from './DailyQuiz'
import { CountryPage } from './CountryPage'
import { OnboardingFlow } from './OnboardingFlow'
import { MoscowQuest } from './MoscowQuest'
import { MoscowPath } from './MoscowPath'
import { MoscowBoss } from './MoscowBoss'
import { MoscowSandbox } from './MoscowSandbox'
import { CityPilot } from './CityPilot'
import { useGameProgress } from '@/hooks/useGameProgress'
import { useApp } from '@/context/AppContext'
import { ApiError, isMockMode } from '@/api/chatApi'
import { gameCountries, findCountry, gameCountryName, questCategoryLabel, weeklyTrackTitle } from '@/mocks/game'
import { cn } from '@/lib/utils'
import { getGameCopy } from '@/lib/gameCopy'
import { getGamePassport, type GamePassport } from '@/api/gameApi'
import { fetchSuitcaseWorkspace, mapGoalFromApi, mapTripFromApi } from '@/api/suitcaseApi'
import {
  listPriceWatchAlerts, listPriceWatches, savePriceWatch, unsubscribePriceWatch,
  type PriceWatch, type PriceWatchAlert,
} from '@/api/priceApi'
import type { SuitcaseGoal, SuitcaseTrip } from '@/types/suitcase'

type GamePanelProps = {
  onBack: () => void
}

const categoryTint: Record<string, string> = {
  sights: 'bg-teal-400',
  food: 'bg-[#E3C878]',
  traditions: 'bg-accent-soft',
}

function ProgressRing({ value, size = 60 }: { value: number; size?: number }) {
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" className="stroke-white/10" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        stroke="var(--brand-teal-500)"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (value / 100) * circumference}
      />
    </svg>
  )
}

export function GamePanel({ onBack }: GamePanelProps) {
  const { user } = useApp()

  // Completion in the old world map is deliberately a demo-only interaction.
  // Live users must never see client-local toggles presented as saved progress.
  if (!isMockMode()) {
    return <LiveGamePanel onBack={onBack} signedIn={Boolean(user)} />
  }

  return <DemoGamePanel onBack={onBack} userName={user?.name ?? null} />
}

function LiveGamePanel({ onBack, signedIn }: GamePanelProps & { signedIn: boolean }) {
  const [pathVersion, setPathVersion] = useState(0)
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null)
  const [bossSelected, setBossSelected] = useState(false)
  const [passport, setPassport] = useState<GamePassport | null>(null)
  const [passportLoading, setPassportLoading] = useState(false)
  const [passportError, setPassportError] = useState(false)
  const [passportRefreshVersion, setPassportRefreshVersion] = useState(0)
  const [suitcase, setSuitcase] = useState<{ trips: SuitcaseTrip[]; goals: SuitcaseGoal[] } | null>(null)
  const [suitcaseError, setSuitcaseError] = useState<string | null>(null)
  const [suitcaseLoading, setSuitcaseLoading] = useState(false)
  const [suitcaseRefreshVersion, setSuitcaseRefreshVersion] = useState(0)
  const [priceAlerts, setPriceAlerts] = useState<PriceWatchAlert[]>([])
  const [priceAlertsLoading, setPriceAlertsLoading] = useState(false)
  const [priceAlertsError, setPriceAlertsError] = useState(false)
  const [priceAlertsRefreshVersion, setPriceAlertsRefreshVersion] = useState(0)
  const [priceWatches, setPriceWatches] = useState<PriceWatch[]>([])
  const [priceWatchesLoading, setPriceWatchesLoading] = useState(false)
  const [priceWatchesError, setPriceWatchesError] = useState<string | null>(null)
  const [priceWatchSubject, setPriceWatchSubject] = useState('')
  const [priceWatchAmount, setPriceWatchAmount] = useState('')
  const [priceWatchCurrency, setPriceWatchCurrency] = useState('RUB')
  const [priceWatchBusy, setPriceWatchBusy] = useState(false)
  const [priceWatchError, setPriceWatchError] = useState<string | null>(null)
  const { setMainView, language } = useApp()
  const copy = getGameCopy(language)

  const refreshPath = () => setPathVersion((version) => version + 1)

  useEffect(() => {
    if (!signedIn) {
      setPassport(null)
      setPassportError(false)
      setPassportLoading(false)
      return
    }
    let current = true
    setPassportLoading(true)
    setPassportError(false)
    getGamePassport()
      .then((result) => { if (current) setPassport(result) })
      .catch(() => {
        if (!current) return
        setPassport(null)
        setPassportError(true)
      })
      .finally(() => { if (current) setPassportLoading(false) })
    return () => { current = false }
  }, [signedIn, pathVersion, passportRefreshVersion])

  useEffect(() => {
    if (!signedIn) {
      setSuitcase(null)
      setSuitcaseError(null)
      setSuitcaseLoading(false)
      return
    }
    let current = true
    setSuitcaseLoading(true)
    setSuitcaseError(null)
    fetchSuitcaseWorkspace()
      .then((workspace) => {
        if (current) setSuitcase({
          trips: workspace.trips.map(mapTripFromApi),
          goals: workspace.goals.map(mapGoalFromApi),
        })
      })
      .catch((error: unknown) => {
        if (!current) return
        setSuitcase(null)
        setSuitcaseError(error instanceof ApiError ? error.detail : copy.suitcaseLoadFailed)
      })
      .finally(() => { if (current) setSuitcaseLoading(false) })
    return () => { current = false }
  }, [signedIn, suitcaseRefreshVersion])

  useEffect(() => {
    if (!signedIn) {
      setPriceAlerts([])
      setPriceAlertsError(false)
      setPriceAlertsLoading(false)
      return
    }
    let current = true
    setPriceAlertsLoading(true)
    setPriceAlertsError(false)
    listPriceWatchAlerts()
      .then((alerts) => { if (current) setPriceAlerts(alerts) })
      .catch(() => {
        if (!current) return
        setPriceAlerts([])
        setPriceAlertsError(true)
      })
      .finally(() => { if (current) setPriceAlertsLoading(false) })
    return () => { current = false }
  }, [signedIn, priceAlertsRefreshVersion])

  useEffect(() => {
    if (!signedIn) {
      setPriceWatches([])
      setPriceWatchesLoading(false)
      setPriceWatchesError(null)
      return
    }
    let current = true
    setPriceWatchesLoading(true)
    setPriceWatchesError(null)
    listPriceWatches()
      .then((watches) => { if (current) setPriceWatches(watches) })
      .catch(() => { if (current) setPriceWatchesError(language === 'en' ? 'Price watches are temporarily unavailable.' : 'Подписки на цены временно недоступны.') })
      .finally(() => { if (current) setPriceWatchesLoading(false) })
    return () => { current = false }
  }, [language, priceAlertsRefreshVersion, signedIn])

  const activeSuitcaseTrips = suitcase?.trips.filter((trip) => !trip.isArchived) ?? []
  const activePriceWatches = priceWatches.filter((watch) => watch.active)

  const saveWatch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const subjectKey = priceWatchSubject.trim()
    const amountMinor = parsePriceMinor(priceWatchAmount)
    const currency = priceWatchCurrency.trim().toUpperCase()
    if (!subjectKey || amountMinor === null || !/^[A-Z]{3}$/.test(currency)) {
      setPriceWatchError(language === 'en' ? 'Enter an item, a non-negative amount, and a three-letter currency code.' : 'Укажите объект, неотрицательную сумму и трёхбуквенный код валюты.')
      return
    }
    setPriceWatchBusy(true)
    setPriceWatchError(null)
    try {
      await savePriceWatch({ subject_key: subjectKey, threshold_minor: amountMinor, currency })
      setPriceWatchSubject('')
      setPriceWatchAmount('')
      setPriceAlertsRefreshVersion((version) => version + 1)
    } catch (error) {
      setPriceWatchError(error instanceof ApiError ? error.detail : (language === 'en' ? 'Could not save the price watch.' : 'Не удалось сохранить подписку на цену.'))
    } finally {
      setPriceWatchBusy(false)
    }
  }

  const removeWatch = async (watchId: string) => {
    setPriceWatchBusy(true)
    setPriceWatchError(null)
    try {
      await unsubscribePriceWatch(watchId)
      setPriceAlertsRefreshVersion((version) => version + 1)
    } catch (error) {
      setPriceWatchError(error instanceof ApiError ? error.detail : (language === 'en' ? 'Could not stop the price watch.' : 'Не удалось отключить подписку на цену.'))
    } finally {
      setPriceWatchBusy(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-5 pb-2 pt-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <IconButton label={copy.back} variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
            <ArrowLeft />
          </IconButton>
          <h1 className="truncate font-display text-2xl font-semibold text-text">{copy.firstTrip}</h1>
        </div>
        <Chip size="sm" variant="active"><Globe2 /> {language === 'en' ? 'Russia · pilot' : copy.pilotTag}</Chip>
      </div>

      <div className="mx-auto w-full max-w-[1100px] space-y-5 px-5 pb-8 pt-4 sm:px-6">
        <OnboardingFlow signedIn={signedIn} onCompleted={refreshPath} />
        <MoscowPath
          signedIn={signedIn}
          refreshKey={pathVersion}
          onSelect={setSelectedQuestId}
          onSelectBoss={() => setBossSelected(true)}
        />
        {selectedQuestId && (
          <MoscowQuest
            signedIn={signedIn}
            refreshKey={pathVersion}
            questId={selectedQuestId}
            onCompleted={() => {
              setSelectedQuestId(null)
              refreshPath()
            }}
          />
        )}
        {bossSelected && (
          <MoscowBoss
            signedIn={signedIn}
            refreshKey={pathVersion}
            onCompleted={() => {
              refreshPath()
            }}
          />
        )}
        <MoscowSandbox signedIn={signedIn} refreshKey={pathVersion} />
        <CityPilot cityId="st-petersburg" signedIn={signedIn} refreshKey={pathVersion} onCompleted={refreshPath} />
        <CityPilot cityId="sochi" signedIn={signedIn} refreshKey={pathVersion} onCompleted={refreshPath} />
        {signedIn && passportLoading && <p role="status" className="font-sans text-sm text-text-secondary">{copy.passportLoading}</p>}
        {signedIn && passportError && <div role="status" className="flex flex-wrap items-center gap-2 font-sans text-sm text-text-secondary">
          <span>{copy.passportUnavailable}</span>
          <button type="button" onClick={() => setPassportRefreshVersion((version) => version + 1)} className="text-primary underline underline-offset-2">{copy.retryPassport}</button>
        </div>}
        {passport && !passportLoading && !passportError && <GlassPanel variant="flat" className="p-4 sm:p-5">
          <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.passportSource}</p>
          <p className="mt-1 font-display text-xl font-semibold text-text">{passport.profile.xp} XP · {copy.stamps(passport.stamps.length)}</p>
          <p className="mt-2 font-sans text-sm text-text-secondary">{passport.cities.map((city) => `${city.name}: ${city.completed_quests}/${city.required_quest_count}`).join(' · ')}</p>
          <p className="mt-2 font-sans text-sm text-text-secondary">{passport.routes.length ? copy.savedRoutes(passport.routes.map((route) => `${route.name} — ${route.destination}`).join(' · ')) : copy.noSavedRoutes}</p>
        </GlassPanel>}
        {signedIn && <GlassPanel variant="flat" className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.suitcaseSource}</p>
              {suitcaseLoading && <p className="mt-2 font-sans text-sm text-text-secondary">{copy.suitcaseLoading}</p>}
              {suitcaseError && <div role="status" className="mt-2 flex flex-wrap items-center gap-2 font-sans text-sm text-text-secondary">
                <span>{copy.suitcaseUnavailable(suitcaseError)}</span>
                <button type="button" onClick={() => setSuitcaseRefreshVersion((version) => version + 1)} className="text-primary underline underline-offset-2">{copy.retrySuitcase}</button>
              </div>}
              {!suitcaseLoading && !suitcaseError && suitcase && <>
                <p className="mt-1 font-display text-lg font-semibold text-text">
                  {copy.tripsAndGoals(activeSuitcaseTrips.length, suitcase.goals.length)}
                </p>
                <p className="mt-2 font-sans text-sm text-text-secondary">
                  {activeSuitcaseTrips.length
                    ? activeSuitcaseTrips.slice(0, 3).map((trip) => `${trip.city}, ${trip.country}`).join(' · ')
                    : copy.noTrips}
                </p>
                {suitcase.goals.length > 0 && <ul className="mt-2 space-y-1 font-sans text-sm text-text-secondary">
                  {suitcase.goals.slice(0, 3).map((goal) => (
                    <li key={goal.id}>{goal.title}: {goal.current} / {goal.total}</li>
                  ))}
                </ul>}
              </>}
            </div>
            <button type="button" onClick={() => setMainView('suitcase')} className="shrink-0 rounded-full border border-white/15 px-3 py-2 font-sans text-sm text-text hover:bg-white/5">
              {copy.openSuitcase}
            </button>
          </div>
        </GlassPanel>}
        {signedIn && <GlassPanel variant="flat" className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-sans text-xs uppercase tracking-wide text-text-muted">
                {language === 'en' ? 'Price watch' : 'Отслеживание цен'}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-text">
                {language === 'en' ? 'Offers at your target price' : 'Предложения по вашей цене'}
              </p>
            </div>
            <Bell className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          </div>
          <form onSubmit={saveWatch} className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_130px_76px_auto]">
            <label className="sr-only" htmlFor="price-watch-subject">{language === 'en' ? 'Item to track' : 'Что отслеживать'}</label>
            <input id="price-watch-subject" value={priceWatchSubject} onChange={(event) => setPriceWatchSubject(event.target.value)} maxLength={200} placeholder={language === 'en' ? 'Item to track' : 'Что отслеживать'} className="h-10 rounded-md border border-hairline bg-panel px-3 font-sans text-sm text-text placeholder:text-text-muted" />
            <label className="sr-only" htmlFor="price-watch-amount">{language === 'en' ? 'Target price' : 'Целевая цена'}</label>
            <input id="price-watch-amount" value={priceWatchAmount} onChange={(event) => setPriceWatchAmount(event.target.value)} inputMode="decimal" placeholder={language === 'en' ? 'Target price' : 'Целевая цена'} className="h-10 rounded-md border border-hairline bg-panel px-3 font-sans text-sm text-text placeholder:text-text-muted" />
            <label className="sr-only" htmlFor="price-watch-currency">{language === 'en' ? 'Currency' : 'Валюта'}</label>
            <input id="price-watch-currency" value={priceWatchCurrency} onChange={(event) => setPriceWatchCurrency(event.target.value.toUpperCase())} maxLength={3} className="h-10 rounded-md border border-hairline bg-panel px-3 font-sans text-sm uppercase text-text" />
            <button type="submit" disabled={priceWatchBusy} className="h-10 rounded-md bg-primary px-3 font-sans text-sm font-semibold text-white disabled:opacity-60">
              {priceWatchBusy ? (language === 'en' ? 'Saving…' : 'Сохраняем…') : (language === 'en' ? 'Track' : 'Следить')}
            </button>
          </form>
          {(priceWatchError || priceWatchesError) && <p role="alert" className="mt-2 font-sans text-xs text-error">{priceWatchError || priceWatchesError}</p>}
          {priceWatchesLoading && <p role="status" className="mt-3 font-sans text-sm text-text-secondary">{language === 'en' ? 'Loading price watches…' : 'Загружаем подписки на цены…'}</p>}
          {!priceWatchesLoading && activePriceWatches.length > 0 && <ul className="mt-3 flex flex-wrap gap-2">
            {activePriceWatches.map((watch) => (
              <li key={watch.id} className="flex items-center gap-2 rounded-full border border-hairline px-3 py-1.5 font-sans text-xs text-text-secondary">
                <span>{watch.subject_key} · {formatPriceAmount(watch.threshold_minor, watch.currency, language)}</span>
                <button type="button" onClick={() => void removeWatch(watch.id)} disabled={priceWatchBusy} className="text-link hover:text-primary disabled:opacity-60">
                  {language === 'en' ? 'Stop' : 'Отключить'}
                </button>
              </li>
            ))}
          </ul>}
          {priceAlertsLoading && <p role="status" className="mt-3 font-sans text-sm text-text-secondary">
            {language === 'en' ? 'Checking price alerts…' : 'Проверяем уведомления о ценах…'}
          </p>}
          {priceAlertsError && <div role="status" className="mt-3 flex flex-wrap items-center gap-2 font-sans text-sm text-text-secondary">
            <span>{language === 'en' ? 'Price alerts are temporarily unavailable.' : 'Уведомления о ценах временно недоступны.'}</span>
            <button type="button" onClick={() => setPriceAlertsRefreshVersion((version) => version + 1)} className="text-primary underline underline-offset-2">
              {language === 'en' ? 'Retry' : 'Повторить'}
            </button>
          </div>}
          {!priceAlertsLoading && !priceAlertsError && (priceAlerts.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {priceAlerts.slice(0, 3).map((alert) => (
                <li key={alert.id} className="rounded-md bg-panel-2 px-3 py-2 font-sans text-sm text-text-secondary">
                  <span className="font-medium text-text">{alert.subject_key}</span>
                  <span className="mx-1.5 text-text-muted">·</span>
                  <span className="font-semibold tabular text-text">{formatPriceAmount(alert.amount_minor, alert.currency, language)}</span>
                  <span className="mx-1.5 text-text-muted">·</span>
                  <span>{formatAlertDate(alert.created_at, language)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 font-sans text-sm text-text-secondary">
              {language === 'en' ? 'New offers will appear here when a tracked price reaches your target.' : 'Новые предложения появятся здесь, когда отслеживаемая цена достигнет вашей цели.'}
            </p>
          ))}
        </GlassPanel>}
        <GlassPanel variant="flat" className="p-4 sm:p-5">
          <p className="font-sans text-sm leading-6 text-text-secondary">
            {copy.liveModeNote}
          </p>
        </GlassPanel>
      </div>
    </div>
  )
}

function formatPriceAmount(amountMinor: number, currency: string, language: 'ru' | 'en') {
  return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'ru-RU', {
    style: 'currency',
    currency,
  }).format(amountMinor / 100)
}

function formatAlertDate(createdAt: string, language: 'ru' | 'en') {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return createdAt
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function parsePriceMinor(value: string): number | null {
  const match = value.trim().match(/^(0|[1-9]\d*)(?:[.,](\d{0,2}))?$/)
  if (!match) return null
  const whole = Number(match[1])
  const fractional = Number(`${match[2] ?? ''}00`.slice(0, 2))
  const amountMinor = whole * 100 + fractional
  return Number.isSafeInteger(amountMinor) ? amountMinor : null
}

function DemoGamePanel({ onBack, userName }: GamePanelProps & { userName: string | null }) {
  const { language } = useApp()
  const copy = getGameCopy(language)
  const [selectedIso, setSelectedIso] = useState<string>('RU')
  const [showPassport, setShowPassport] = useState(false)
  const [openCountry, setOpenCountry] = useState<string | null>(null)

  const {
    isDone, toggleQuest, countryProgress, cityProgress, categoryProgress, stats, resetProgress,
    answeredQuizIds, answerQuiz, resetQuiz, quizStreak,
  } = useGameProgress()

  const country = findCountry(selectedIso) ?? gameCountries[0]
  const progress = countryProgress(country.iso)
  const categories = categoryProgress(country.iso)

  // Фокус, треки и копилка следуют за выбранной на карте страной
  const focus = country
  const focusName = gameCountryName(focus, language)
  const focusProgress = progress
  const weekly = country.weekly
  const savings = country.savings
  const savedPercent = savings ? Math.round((savings.current / savings.target) * 100) : 0

  if (openCountry) {
    const oc = findCountry(openCountry) ?? country
    return (
      <CountryPage
        country={oc}
        onBack={() => setOpenCountry(null)}
        progress={countryProgress(oc.iso)}
        categories={categoryProgress(oc.iso)}
        isDone={isDone}
        onToggle={toggleQuest}
        cityProgress={cityProgress}
        answeredQuizIds={answeredQuizIds}
        onAnswerQuiz={answerQuiz}
        onResetQuiz={() => resetQuiz(oc.iso)}
        quizStreak={quizStreak}
      />
    )
  }

  if (showPassport) {
    return (
      <TravelPassport
        onBack={() => setShowPassport(false)}
        countryProgress={countryProgress}
        cityProgress={cityProgress}
        ownerName={userName ?? 'Путешественник'}
      />
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative z-10">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-5 pb-2 pt-6 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton label={copy.backToMap} variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
              <ArrowLeft />
            </IconButton>
            <h1 className="truncate font-display text-2xl font-semibold text-text">{copy.worldCoverage}</h1>
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Chip size="sm">
              <Globe2 />
              <span className="tabular">{copy.openCountriesCount(stats.openedCountries)}</span>
            </Chip>
            <Chip size="sm" variant="active">
              <Trophy />
              <span className="tabular">{copy.questsCount(stats.doneQuests, stats.totalQuests)}</span>
            </Chip>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] space-y-8 px-5 pb-8 pt-4 sm:px-6">
        {/* Карта мира */}
        <section>
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-text">{copy.worldMap}</h2>
            <p className="hidden font-sans text-xs text-text-muted sm:block">
              {copy.worldMapHint}
            </p>
          </div>

          <GlassPanel className="relative h-[420px] overflow-hidden p-0 sm:h-[480px]">
            {/* Атмосферное свечение под картой */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(107,91,255,0.16),transparent_70%)]" />
            <WorldMap
              progressByIso={countryProgress}
              selectedIso={selectedIso}
              onSelect={(iso) => {
                setSelectedIso(iso)
                setOpenCountry(iso)
              }}
            />
          </GlassPanel>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-xs text-text-muted">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-sm bg-primary/70" />
              {copy.openInProgress}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-sm bg-violet-700" />
              {copy.blankSpots}
            </span>
          </div>
        </section>

        {/* Квесты выбранной страны */}
        <section>
          <CountryQuests
            country={country}
            isDone={isDone}
            onToggle={toggleQuest}
            progress={progress}
            cityProgress={cityProgress}
          />
        </section>

        {/* Фокус страны */}
        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="relative flex items-center justify-center">
                <ProgressRing value={focusProgress} />
                <span className="absolute text-xl leading-none" aria-hidden="true">{focus.flag}</span>
              </span>
              <span>
                <span className="block font-sans text-xs uppercase tracking-wide text-text-muted">
                  {copy.countryFocus}
                </span>
                <DisplayTitle as="h2" className="!text-3xl">{focusName}</DisplayTitle>
                <span className="mt-0.5 block font-sans text-sm tabular text-text-secondary">
                  {copy.completedPercent(focusProgress)}
                </span>
              </span>
            </div>
            {focusProgress === 100 ? (
              <Chip variant="active"><Trophy /> {copy.focusComplete}</Chip>
            ) : (
              <Chip variant="accent">{copy.percentToPremium(100 - focusProgress)}</Chip>
            )}
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <DailyQuiz
              countryIso={country.iso}
              countryName={gameCountryName(country, language)}
              answeredIds={answeredQuizIds}
              onAnswer={answerQuiz}
              onReset={() => resetQuiz(country.iso)}
              streak={quizStreak}
            />

            <GlassPanel variant="flat" className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-sans text-xs uppercase tracking-wide text-text-muted">
                  {copy.weeklyTrack}
                </span>
                <BookOpenCheck className="h-4 w-4 text-accent-soft" aria-hidden="true" />
              </div>
              {weekly ? (
                <>
                  <p className="mb-3 font-sans text-sm font-medium text-text">{weeklyTrackTitle(weekly, language)}</p>
                  <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-panel-2">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${weekly.percent}%` }} />
                  </div>
                  <p className="font-sans text-xs tabular text-text-muted">
                    {copy.lessonProgress(weekly.lesson, weekly.totalLessons, weekly.percent)}
                  </p>
                </>
              ) : (
                <p className="font-sans text-sm text-text-muted">
                  {copy.courseLocked}
                </p>
              )}
            </GlassPanel>
          </div>

          {/* Категории считаются из реальных квестов выбранной страны */}
          <p className="mb-2.5 font-sans text-xs text-text-muted">
            {copy.categoryProgress(gameCountryName(country, language))}
          </p>
          <div className="space-y-2.5">
            {(Object.keys(questCategoryLabel) as Array<keyof typeof questCategoryLabel>).map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-36 shrink-0 truncate font-sans text-xs text-text-secondary sm:w-44">
                  {copy.categoryNames[key]}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel-2">
                  <div
                    className={cn('h-full rounded-full transition-[width] duration-slow ease-standard', categoryTint[key])}
                    style={{ width: `${categories[key]}%` }}
                  />
                </div>
                <span className="w-9 text-right font-sans text-xs font-semibold tabular text-text-muted">
                  {categories[key]}%
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Копилка выбранной страны */}
        {savings && (
          <GlassPanel className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                <PiggyBank className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-sans text-xs uppercase tracking-wide text-text-muted">
                  {copy.savings}
                </span>
                <span className="block font-display text-xl font-semibold text-text">
                  {savings.destination}
                </span>
              </span>
            </div>

            <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-panel-2">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-slow ease-standard"
                style={{ width: `${savedPercent}%` }}
              />
            </div>
            <div className="mb-4 flex items-center justify-between font-sans text-sm">
              <span className="font-semibold tabular text-text">
                {savings.current.toLocaleString('ru')} ₽{' '}
                <span className="font-normal text-text-muted">
                  {copy.amountOfTarget(savings.target.toLocaleString(language === 'en' ? 'en-US' : 'ru-RU'))} {language === 'en' ? 'RUB' : '₽'}
                </span>
              </span>
              <span className="tabular text-text-muted">{savedPercent}%</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Chip variant={savings.priceTrend < 0 ? 'active' : 'default'} size="sm">
                <TrendingDown className={savings.priceTrend > 0 ? 'rotate-180' : undefined} />
                {savings.priceTrend < 0
                  ? copy.ticketDown(Math.abs(savings.priceTrend))
                  : copy.ticketUp(savings.priceTrend)}
              </Chip>
              <span className="font-sans text-xs tabular text-text-muted">
                {copy.weeklySavings(savings.weekly.toLocaleString(language === 'en' ? 'en-US' : 'ru-RU'))}
              </span>
            </div>
          </GlassPanel>
        )}

        {/* Паспорт и сброс */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowPassport(true)}
            className="group flex flex-1 items-center justify-between gap-4 rounded-lg border border-hairline bg-panel p-4 text-left transition-colors hover:bg-panel-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
              <span>
                <span className="block font-sans text-sm font-semibold text-text">{copy.passport}</span>
                <span className="block font-sans text-xs tabular text-text-muted">
                  {copy.closedCountries(stats.closedCountries)}
                </span>
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>

          <button
            onClick={resetProgress}
            className="flex items-center gap-2 rounded-lg border border-hairline px-4 py-3 font-sans text-sm text-text-muted transition-colors hover:border-hairline-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {copy.resetProgress}
          </button>
        </div>

        <p className="flex items-start gap-2 px-1 font-sans text-xs leading-relaxed text-text-muted">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {copy.pilotCitiesNote}
        </p>
      </div>
    </div>
  )
}
