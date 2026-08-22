import { useState } from 'react'
import {
  ArrowLeft, Globe2, PiggyBank, Trophy,
  TrendingDown, MapPin, ChevronRight, BookOpenCheck, RotateCcw,
} from 'lucide-react'
import { GlassPanel, Chip, DisplayTitle, IconButton } from '@/components/ui/glass'
import { WorldMap } from './WorldMap'
import { CountryQuests } from './CountryQuests'
import { TravelPassport } from './TravelPassport'
import { DailyQuiz } from './DailyQuiz'
import { CountryPage } from './CountryPage'
import { useGameProgress } from '@/hooks/useGameProgress'
import { useApp } from '@/context/AppContext'
import { gameCountries, findCountry, questCategoryLabel } from '@/mocks/game'
import { cn } from '@/lib/utils'

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
  const [selectedIso, setSelectedIso] = useState<string>('RU')
  const [showPassport, setShowPassport] = useState(false)
  const [openCountry, setOpenCountry] = useState<string | null>(null)
  const { user } = useApp()

  const {
    isDone, toggleQuest, countryProgress, cityProgress, categoryProgress, stats, resetProgress,
    answeredQuizIds, answerQuiz, resetQuiz, quizStreak,
  } = useGameProgress()

  const country = findCountry(selectedIso) ?? gameCountries[0]
  const progress = countryProgress(country.iso)
  const categories = categoryProgress(country.iso)

  // Фокус, треки и копилка следуют за выбранной на карте страной
  const focus = country
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
        ownerName={user?.name ?? 'Путешественник'}
      />
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative z-10">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-5 pb-2 pt-6 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton label="Назад" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
              <ArrowLeft />
            </IconButton>
            <h1 className="truncate font-display text-2xl font-semibold text-text">Охват мира</h1>
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Chip size="sm">
              <Globe2 />
              <span className="tabular">{stats.openedCountries} из 195 стран</span>
            </Chip>
            <Chip size="sm" variant="active">
              <Trophy />
              <span className="tabular">{stats.doneQuests} из {stats.totalQuests} квестов</span>
            </Chip>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] space-y-8 px-5 pb-8 pt-4 sm:px-6">
        {/* Карта мира */}
        <section>
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-text">Карта мира</h2>
            <p className="hidden font-sans text-xs text-text-muted sm:block">
              Нажмите на открытую страну, чтобы попасть в её регионы и квесты
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
              Открыто, идёт прогресс
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-sm bg-violet-700" />
              Белые пятна
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
                  Фокус страны
                </span>
                <DisplayTitle as="h2" className="!text-3xl">{focus.name}</DisplayTitle>
                <span className="mt-0.5 block font-sans text-sm tabular text-text-secondary">
                  {focusProgress}% закрыто
                </span>
              </span>
            </div>
            {focusProgress === 100 ? (
              <Chip variant="active"><Trophy /> Фокус закрыт</Chip>
            ) : (
              <Chip variant="accent">До премиум-слоя {100 - focusProgress}%</Chip>
            )}
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <DailyQuiz
              countryIso={country.iso}
              countryName={country.name}
              answeredIds={answeredQuizIds}
              onAnswer={answerQuiz}
              onReset={() => resetQuiz(country.iso)}
              streak={quizStreak}
            />

            <GlassPanel variant="flat" className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-sans text-xs uppercase tracking-wide text-text-muted">
                  Еженедельный трек
                </span>
                <BookOpenCheck className="h-4 w-4 text-accent-soft" aria-hidden="true" />
              </div>
              {weekly ? (
                <>
                  <p className="mb-3 font-sans text-sm font-medium text-text">{weekly.title}</p>
                  <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-panel-2">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${weekly.percent}%` }} />
                  </div>
                  <p className="font-sans text-xs tabular text-text-muted">
                    Урок {weekly.lesson} из {weekly.totalLessons}, пройдено {weekly.percent}%
                  </p>
                </>
              ) : (
                <p className="font-sans text-sm text-text-muted">
                  Курс по стране появится после её открытия
                </p>
              )}
            </GlassPanel>
          </div>

          {/* Категории считаются из реальных квестов выбранной страны */}
          <p className="mb-2.5 font-sans text-xs text-text-muted">
            Категории по стране {country.name}
          </p>
          <div className="space-y-2.5">
            {(Object.keys(questCategoryLabel) as Array<keyof typeof questCategoryLabel>).map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-36 shrink-0 truncate font-sans text-xs text-text-secondary sm:w-44">
                  {questCategoryLabel[key]}
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
                  Копилка
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
                  из {savings.target.toLocaleString('ru')} ₽
                </span>
              </span>
              <span className="tabular text-text-muted">{savedPercent}%</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Chip variant={savings.priceTrend < 0 ? 'active' : 'default'} size="sm">
                <TrendingDown className={savings.priceTrend > 0 ? 'rotate-180' : undefined} />
                {savings.priceTrend < 0
                  ? `Билет подешевел на ${Math.abs(savings.priceTrend)}%`
                  : `Билет подорожал на ${savings.priceTrend}%`}
              </Chip>
              <span className="font-sans text-xs tabular text-text-muted">
                Рекомендуем откладывать {savings.weekly.toLocaleString('ru')} ₽ в неделю
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
                <span className="block font-sans text-sm font-semibold text-text">Тревел-паспорт</span>
                <span className="block font-sans text-xs tabular text-text-muted">
                  Закрыто стран: {stats.closedCountries}
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
            Сбросить прогресс
          </button>
        </div>

        <p className="flex items-start gap-2 px-1 font-sans text-xs leading-relaxed text-text-muted">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Пилотные города фазы 0: Москва, Санкт-Петербург и Сочи. Прогресс сохраняется в браузере.
        </p>
      </div>
    </div>
  )
}
