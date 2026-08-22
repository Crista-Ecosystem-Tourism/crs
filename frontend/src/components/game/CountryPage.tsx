import { ArrowLeft, Trophy, MapPin } from 'lucide-react'
import { GlassPanel, Chip, IconButton } from '@/components/ui/glass'
import { CountryMap } from './CountryMap'
import { CountryQuests } from './CountryQuests'
import { DailyQuiz } from './DailyQuiz'
import { questCategoryLabel, type GameCountry, type QuestCategory } from '@/mocks/game'
import { cn } from '@/lib/utils'

interface CountryPageProps {
  country: GameCountry
  onBack: () => void
  progress: number
  categories: Record<QuestCategory, number>
  isDone: (id: string) => boolean
  onToggle: (id: string) => void
  cityProgress: (country: GameCountry, cityId: string) => number
  answeredQuizIds: Set<string>
  onAnswerQuiz: (id: string, correct: boolean) => void
  onResetQuiz: () => void
  quizStreak: number
}

const categoryTint: Record<QuestCategory, string> = {
  sights: 'bg-teal-400',
  food: 'bg-[#E3C878]',
  traditions: 'bg-accent-soft',
}

export function CountryPage({
  country,
  onBack,
  progress,
  categories,
  isDone,
  onToggle,
  cityProgress,
  answeredQuizIds,
  onAnswerQuiz,
  onResetQuiz,
  quizStreak,
}: CountryPageProps) {
  // Регион считается открытым, если в его городе закрыт хотя бы один квест
  const visitedRegions = country.cities
    .filter((city) => city.quests.some((q) => isDone(q.id)))
    .map((city) => city.region)

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative z-10">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-5 pb-2 pt-6 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton label="К карте мира" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
              <ArrowLeft />
            </IconButton>
            <span className="text-2xl leading-none" aria-hidden="true">{country.flag}</span>
            <h1 className="truncate font-display text-2xl font-semibold text-text">
              {country.name}
            </h1>
          </div>
          {progress === 100 ? (
            <Chip size="sm" variant="active">
              <Trophy />
              Закрыта
            </Chip>
          ) : (
            <Chip size="sm" className="tabular">{progress}% пройдено</Chip>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] space-y-8 px-5 pb-8 pt-4 sm:px-6">
        {/* Карта регионов страны */}
        <section>
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-text">Регионы</h2>
            <p className="hidden font-sans text-xs text-text-muted sm:block">
              Регион раскрывается, когда вы закрываете в нём первую точку
            </p>
          </div>

          <GlassPanel className="relative h-[380px] overflow-hidden p-0 sm:h-[440px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(107,91,255,0.14),transparent_70%)]" />
            <CountryMap country={country} visitedRegionNames={visitedRegions} />
          </GlassPanel>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-xs text-text-muted">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-sm bg-primary/70" />
              Вы здесь были
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-sm bg-violet-700" />
              Белое пятно
            </span>
          </div>
        </section>

        {/* Вопрос дня по стране */}
        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-text">Вопрос дня</h2>
          <DailyQuiz
            countryIso={country.iso}
            countryName={country.name}
            answeredIds={answeredQuizIds}
            onAnswer={onAnswerQuiz}
            onReset={onResetQuiz}
            streak={quizStreak}
          />
        </section>

        {/* Квесты */}
        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-text">Точки квестов</h2>
          <CountryQuests
            country={country}
            isDone={isDone}
            onToggle={onToggle}
            progress={progress}
            cityProgress={cityProgress}
          />
        </section>

        {/* Категории */}
        <GlassPanel className="p-5 sm:p-6">
          <h2 className="mb-4 font-display text-xl font-semibold text-text">
            Прогресс по категориям
          </h2>
          <div className="space-y-2.5">
            {(Object.keys(questCategoryLabel) as QuestCategory[]).map((key) => (
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

        <p className="flex items-start gap-2 px-1 font-sans text-xs leading-relaxed text-text-muted">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Города, где вы закрыли хотя бы одну точку, раскрывают свой регион на карте страны.
        </p>
      </div>
    </div>
  )
}
