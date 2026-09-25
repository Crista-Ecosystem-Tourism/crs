import { useState, useRef, type KeyboardEvent } from 'react'
import {
  ArrowRight,
  ArrowUp,
  CloudSun,
  Compass,
  Flame,
  MapPin,
  Mic,
  PiggyBank,
  Sparkles,
} from 'lucide-react'
import { GlassPanel, IconButton, Chip, StatTile, DisplayTitle } from '@/components/ui/glass'
import { Img } from '@/components/ui/Img'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { useGameProgress } from '@/hooks/useGameProgress'
import { getHomeCopy } from '@/lib/homeCopy'
import { BattlePass } from './BattlePass'
import { DailyQuiz } from '@/components/game/DailyQuiz'
import { gameCountries, gameCountryName, weeklyTrackTitle } from '@/mocks/game'

interface HomeHubProps {
  onSend: (message: string) => void
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=2000&q=80'

const suggestions = [
  { label: { ru: 'Санкт-Петербург за 3 дня', en: '3 days in St. Petersburg' }, tripId: 'spb-excursions' },
  { label: { ru: 'Гастротур по Грузии', en: 'Food tour of Georgia' }, tripId: 'georgia-food' },
  { label: { ru: 'Горы Алтая', en: 'Altai Mountains' }, tripId: 'altai-trekking' },
  { label: { ru: 'Культура Киото', en: 'Kyoto culture' }, tripId: 'kyoto-culture' },
  { label: { ru: 'Пляжи Бали', en: 'Beaches of Bali' }, tripId: 'bali-beaches' },
]

const destinations = [
  {
    id: 'venice',
    title: { ru: 'Венеция', en: 'Venice' },
    country: { ru: 'Италия', en: 'Italy' },
    tag: { ru: 'Культура', en: 'Culture' },
    imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
  },
  {
    id: 'rome',
    title: { ru: 'Рим', en: 'Rome' },
    country: { ru: 'Италия', en: 'Italy' },
    tag: { ru: 'История', en: 'History' },
    imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80',
  },
  {
    id: 'kyoto',
    title: { ru: 'Киото', en: 'Kyoto' },
    country: { ru: 'Япония', en: 'Japan' },
    tag: { ru: 'Традиции', en: 'Traditions' },
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
  },
  {
    id: 'cinque',
    title: { ru: 'Чинкве-Терре', en: 'Cinque Terre' },
    country: { ru: 'Италия', en: 'Italy' },
    tag: { ru: 'Побережье', en: 'Coast' },
    imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80',
  },
  {
    id: 'fuji',
    title: { ru: 'Фудзи', en: 'Mount Fuji' },
    country: { ru: 'Япония', en: 'Japan' },
    tag: { ru: 'Природа', en: 'Nature' },
    imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80',
  },
]

/* ---------------------------------------------------------------- Composer */

function Composer({ onSend }: { onSend: (message: string) => void }) {
  const { loadTripChat, language } = useApp()
  const copy = getHomeCopy(language)
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed) return
    onSend(trimmed)
    setMessage('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const autoGrow = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }

  return (
    <div>
      <GlassPanel variant="photo" radius="xl" className="p-2">
        <div className="flex items-end gap-2">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="h-[18px] w-[18px]" />
          </span>

          <label htmlFor="home-composer" className="sr-only">
            {copy.composerLabel}
          </label>
          <textarea
            id="home-composer"
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onInput={autoGrow}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={copy.composerPlaceholder}
            className="max-h-32 min-h-[44px] flex-1 resize-none overflow-hidden bg-transparent py-3 font-sans text-base leading-relaxed text-text outline-none placeholder:text-text-muted"
          />

          <div className="flex shrink-0 items-center gap-1.5 pb-0.5">
            <IconButton label={copy.voiceInput} variant="ghost" className="hidden sm:inline-flex">
              <Mic />
            </IconButton>
            <IconButton
              label={copy.buildRoute}
              variant="solid"
              onClick={handleSend}
              disabled={!message.trim()}
            >
              <ArrowUp />
            </IconButton>
          </div>
        </div>
      </GlassPanel>

      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <Chip
            key={s.tripId}
            interactive
            role="button"
            tabIndex={0}
            onClick={() => loadTripChat(s.tripId)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                loadTripChat(s.tripId)
              }
            }}
          >
            {s.label[language]}
          </Chip>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- ProgressRing */

function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" className="stroke-white/10" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        stroke="var(--color-accent)"
        strokeDasharray={c}
        strokeDashoffset={c - (value / 100) * c}
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ HomeHub */

export function HomeHub({ onSend }: HomeHubProps) {
  const { setMainView, user, openModal, language } = useApp()
  const copy = getHomeCopy(language)
  const { countryProgress, stats, passPoints, answeredQuizIds, answerQuiz, resetQuiz, quizStreak } =
    useGameProgress()

  // Фокус берём из игры: первая открытая страна, которую ещё не закрыли
  const focus =
    gameCountries.find((c) => c.opened && countryProgress(c.iso) < 100) ?? gameCountries[0]
  const focusName = gameCountryName(focus, language)
  const focusProgress = countryProgress(focus.iso)
  const savings = focus.savings
  const savedPercent = savings ? Math.round((savings.current / savings.target) * 100) : 0

  return (
    <div className="h-full overflow-y-auto scrollbar-hidden">
      <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-16 pt-10 sm:px-8 lg:pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          {/* Фотокарточка героя: кадр это объект, а не обои под текстом */}
          <div className="flex min-w-0 flex-col">
            <div className="relative overflow-hidden rounded-xl border border-hairline-2 shadow-lg">
              <Img
                src={HERO_IMAGE}
                alt={copy.heroImage}
                className="h-[380px] w-full object-cover sm:h-[440px]"
              />
              {/* Затемнение сжато к низу: верх кадра остаётся в полную силу,
                  а зона текста гарантированно тёмная на любом снимке */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgb(var(--scrim-rgb)) 0%, rgba(var(--scrim-rgb),0.9) 26%, rgba(var(--scrim-rgb),0.55) 46%, rgba(var(--scrim-rgb),0.12) 70%, transparent 100%)',
                }}
              />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <DisplayTitle size="lg" className="max-w-[14ch] !text-white">
                  {copy.heroTitle}
                </DisplayTitle>
                <p className="mt-3 max-w-[46ch] font-accent text-base leading-relaxed text-white/80 sm:text-lg">
                  {copy.heroDescription}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <Composer onSend={onSend} />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-5">
              <StatTile icon={<CloudSun />} value="12°C" label={copy.weather} />
              <StatTile
                icon={<Compass />}
                value={copy.countriesCount(stats.openedCountries)}
                label={copy.countriesOpened}
              />
              <StatTile
                icon={<Flame />}
                value={`${stats.doneQuests}`}
                label={copy.questsCompleted(stats.doneQuests, stats.totalQuests)}
              />
            </div>
          </div>

          {/* Правая колонка: личное состояние, вход в остальные разделы */}
          <div className="flex flex-col gap-4">
            <GlassPanel variant="photo" className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-sans text-xs uppercase tracking-wide text-text-muted">
                    {copy.countryFocus}
                  </p>
                  <p className="mt-1 flex items-center gap-2 truncate font-display text-2xl font-semibold text-text">
                    <span aria-hidden="true">{focus.flag}</span>
                    {focusName}
                  </p>
                </div>
                <div className="relative shrink-0">
                  <ProgressRing value={focusProgress} />
                  <span className="absolute inset-0 flex items-center justify-center font-sans text-xs font-semibold tabular text-text">
                    {focusProgress}%
                  </span>
                </div>
              </div>
              <p className="mt-3 font-sans text-sm leading-relaxed text-text-secondary">
                {focus.weekly
                  ? copy.weeklyLesson(weeklyTrackTitle(focus.weekly, language), focus.weekly.lesson, focus.weekly.totalLessons)
                  : copy.lockedWeekly}
              </p>
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => setMainView('game')}
              >
                {copy.continueGame}
                <ArrowRight />
              </Button>
            </GlassPanel>

            <GlassPanel variant="photo" className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-panel-2 text-primary">
                  <PiggyBank className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-semibold text-text">
                    {copy.savings(savings?.destination)}
                  </p>
                  <p className="font-sans text-xs tabular text-text-muted">
                    {savings
                      ? copy.savingsAmount(savings.current, savings.target)
                      : copy.chooseDestination}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-panel-2">
                <div className="h-full rounded-full bg-primary" style={{ width: `${savedPercent}%` }} />
              </div>
              <p className="mt-3 font-sans text-xs text-text-secondary">
                {savings && savings.priceTrend < 0
                  ? copy.priceDrop(Math.abs(savings.priceTrend))
                  : copy.watchingPrices}
              </p>
            </GlassPanel>

            {/* Вопрос дня по стране фокуса: изучение вместо витрины мест */}
            <GlassPanel variant="photo" className="p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-sans text-sm font-semibold text-text">
                  {copy.studying(focusName)}
                </p>
                <button
                  onClick={() => setMainView('game')}
                  className="shrink-0 font-sans text-xs text-link transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {copy.allQuestions}
                </button>
              </div>

              <DailyQuiz
                countryIso={focus.iso}
                countryName={focusName}
                answeredIds={answeredQuizIds}
                onAnswer={answerQuiz}
                onReset={() => resetQuiz(focus.iso)}
                streak={quizStreak}
              />
            </GlassPanel>
          </div>
        </div>

        {/* Пропуск путешественника: главный крючок удержания, сразу под героем */}
        <section className="mt-12">
          <BattlePass
            points={passPoints}
            isPremium={user?.subscription === 'premium'}
            onUpgrade={() => openModal('subscription')}
            language={language}
          />
        </section>

        {/* Открытия: горизонтальная лента, не сетка одинаковых карточек */}
        <section className="mt-14">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-[28px]">
              {copy.destinationsHeading}
            </h2>
            <button
              onClick={() => setMainView('inspiration')}
              className="shrink-0 font-sans text-sm text-link transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {copy.seeAll}
            </button>
          </div>

          <div className="-mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 scrollbar-hidden sm:-mx-8 sm:px-8">
            {destinations.map((d) => (
              <button
                key={d.id}
                onClick={() => onSend(copy.tripPrompt(d.title[language], d.country[language]))}
                className="group relative w-[240px] shrink-0 snap-start overflow-hidden rounded-lg text-left transition duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-[280px]"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <Img
                    src={d.imageUrl}
                    alt={`${d.title[language]}, ${d.country[language]}`}
                    className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <div className="absolute inset-0 photo-scrim" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-display text-2xl font-semibold leading-tight text-white">
                    {d.title[language]}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 font-sans text-xs text-white/70">
                    <MapPin className="h-3 w-3" />
                    {d.country[language]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
