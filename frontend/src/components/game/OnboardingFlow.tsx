import { useEffect, useState } from 'react'
import { Award, BatteryMedium, CheckCircle2, Compass, Flame, LoaderCircle, MapPin, Sparkles } from 'lucide-react'
import { GlassPanel, Chip } from '@/components/ui/glass'
import { answerRedSquare, getOnboarding, type OnboardingState } from '@/api/gameApi'
import { isMockMode } from '@/api/chatApi'
import { ApiError } from '@/api/chatApi'

type ViewState = 'loading' | 'ready' | 'answering' | 'error'
type LessonStep = 'intro' | 'arrival' | 'fact' | 'question'

const lessonSteps: Array<{ id: LessonStep; label: string }> = [
  { id: 'intro', label: 'Встреча' },
  { id: 'arrival', label: 'Москва' },
  { id: 'fact', label: 'История' },
  { id: 'question', label: 'Квест' },
]

/** First GDD learning loop. Its progress and reward are owned by the API. */
export function OnboardingFlow({ signedIn, onCompleted }: { signedIn: boolean; onCompleted?: () => void }) {
  const [state, setState] = useState<OnboardingState | null>(null)
  const [view, setView] = useState<ViewState>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const [step, setStep] = useState<LessonStep>('intro')

  useEffect(() => {
    if (!signedIn || isMockMode()) return
    let active = true
    getOnboarding()
      .then((result) => {
        if (!active) return
        setState(result)
        if (result.completed) onCompleted?.()
        setView('ready')
      })
      .catch((error: unknown) => {
        if (!active) return
        setMessage(error instanceof ApiError ? error.message : 'Не удалось загрузить мини-квест')
        setView('error')
      })
    return () => { active = false }
  }, [signedIn])

  if (isMockMode()) return null

  if (!signedIn) {
    return (
      <GlassPanel className="border-primary/25 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Compass className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-xl font-semibold text-text">Первое путешествие ждёт</span>
            <span className="mt-1 block font-sans text-sm text-text-secondary">
              Войди в аккаунт, чтобы пройти Москву с Крисом и сохранить XP со штампом.
            </span>
          </span>
        </div>
      </GlassPanel>
    )
  }

  if (view === 'loading') {
    return (
      <GlassPanel className="flex items-center gap-3 p-5 text-sm text-text-secondary">
        <LoaderCircle className="h-5 w-5 animate-spin text-primary" /> Загружаем маршрут Криса…
      </GlassPanel>
    )
  }

  if (view === 'error' || !state) {
    return (
      <GlassPanel className="border-danger/30 p-5 font-sans text-sm text-text-secondary">
        Игровой маршрут пока недоступен: {message ?? 'попробуйте обновить страницу'}.
      </GlassPanel>
    )
  }

  const { content, daily, profile } = state
  const choose = async (answerKey: string) => {
    if (view === 'answering' || state.completed) return
    setView('answering')
    setMessage(null)
    try {
      const result = await answerRedSquare(answerKey)
      setState((previous) => previous ? {
        ...previous,
        profile: result.profile,
        daily: result.daily,
        completed: result.completed,
        starter_stamp: result.starter_stamp,
      } : previous)
      if (result.completed) onCompleted?.()
      setMessage(result.correct
        ? result.xp_awarded ? `Верно! +${result.xp_awarded} XP` : 'Верно — этот штамп уже в твоём паспорте.'
        : 'Почти! Одна энергия потрачена — попробуй ещё раз.')
      setView('ready')
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : 'Ответ не сохранился. Попробуйте ещё раз.')
      setView('ready')
    }
  }

  return (
    <GlassPanel className="overflow-hidden border-primary/25 p-0">
      <div className="bg-[radial-gradient(circle_at_85%_0%,rgba(107,91,255,0.28),transparent_42%),linear-gradient(130deg,rgba(11,125,127,0.2),transparent_68%)] p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Chip variant="active"><MapPin /> {content.country.name} · {content.country.city}</Chip>
          <div className="flex items-center gap-2">
            <Chip size="sm"><Award /> {profile.xp} XP</Chip>
            <Chip size="sm"><BatteryMedium /> {profile.energy}/5</Chip>
            <Chip size="sm"><Flame /> {daily.streak} дн.</Chip>
          </div>
        </div>
        <p className="font-sans text-sm text-text-secondary">{content.chris.name} · проводник</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-text sm:text-3xl">{content.scene.title}</h2>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-6 text-text-secondary">{content.chris.intro}</p>
        <p className="mt-3 font-sans text-xs text-text-muted">
          Цель на сегодня: {daily.completed_quests}/{daily.goal} точек{daily.goal_reached ? ' — выполнена' : ''}.
        </p>
        {!state.completed && (
          <ol className="mt-5 flex gap-2 overflow-x-auto" aria-label="Шаги первого путешествия">
            {lessonSteps.map((item, index) => {
              const activeIndex = lessonSteps.findIndex((candidate) => candidate.id === step)
              const isCurrent = item.id === step
              const isPast = index < activeIndex
              return (
                <li key={item.id} className="flex min-w-max items-center gap-2 font-sans text-xs">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full ${isCurrent || isPast ? 'bg-primary text-white' : 'bg-white/10 text-text-muted'}`}>
                    {isPast ? '✓' : index + 1}
                  </span>
                  <span className={isCurrent ? 'text-text' : 'text-text-muted'}>{item.label}</span>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {state.completed ? (
          <div className="flex items-start gap-3 rounded-md bg-primary/10 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span className="font-sans text-sm text-text-secondary">
              {state.starter_stamp?.title ?? 'Стартовый штамп'} уже в паспорте. Москва открыта для следующих квестов.
            </span>
          </div>
        ) : step === 'intro' ? (
          <div className="space-y-4">
            <p className="font-sans text-base leading-7 text-text-secondary">
              {content.chris.name} покажет, как за две минуты открыть новую часть мира. Начнём с России.
            </p>
            <button type="button" onClick={() => setStep('arrival')} className="rounded-md bg-primary px-4 py-3 font-sans text-sm font-semibold text-white transition hover:bg-primary/90">
              Выбрать Россию
            </button>
          </div>
        ) : step === 'arrival' ? (
          <div className="space-y-4">
            <div className="rounded-md bg-panel-2/70 p-4">
              <p className="font-display text-xl font-semibold text-text">Москва на горизонте</p>
              <p className="mt-2 font-sans text-sm leading-6 text-text-secondary">
                Первая остановка — {content.scene.title}. Здесь начинается путь, который сохранится в твоём паспорте.
              </p>
            </div>
            <button type="button" onClick={() => setStep('fact')} className="rounded-md bg-primary px-4 py-3 font-sans text-sm font-semibold text-white transition hover:bg-primary/90">
              Узнать историю места
            </button>
          </div>
        ) : step === 'fact' ? (
          <div className="space-y-4">
            <div className="rounded-md bg-panel-2/70 p-4">
              <p className="font-sans text-sm leading-6 text-text-secondary">{content.fact.text}</p>
              <a className="mt-2 inline-block font-sans text-xs text-primary hover:underline" href={content.fact.source_url} target="_blank" rel="noreferrer">
                Источник: {content.fact.source_label ?? 'Правительство Москвы'}
              </a>
            </div>
            <button type="button" onClick={() => setStep('question')} className="rounded-md bg-primary px-4 py-3 font-sans text-sm font-semibold text-white transition hover:bg-primary/90">
              Пройти мини-квест
            </button>
          </div>
        ) : (
          <>
            <p className="mt-5 font-display text-lg font-semibold text-text">{content.question.text}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {content.question.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={view === 'answering' || profile.energy === 0}
                  onClick={() => void choose(option.id)}
                  className="rounded-md border border-white/10 bg-panel-2 px-4 py-3 text-left font-sans text-sm text-text-secondary transition hover:border-primary/50 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {option.label}
                </button>
              ))}
            </div>
            {profile.energy === 0 && <p className="mt-3 font-sans text-xs text-warning">Энергия закончилась — она восстановится завтра.</p>}
          </>
        )}
        {message && (
          <p className="mt-4 flex items-center gap-2 font-sans text-sm text-text-secondary">
            <Sparkles className="h-4 w-4 text-accent-soft" /> {message}
          </p>
        )}
      </div>
    </GlassPanel>
  )
}
