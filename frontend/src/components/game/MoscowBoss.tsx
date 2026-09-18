import { useEffect, useState } from 'react'
import { Award, BatteryMedium, CheckCircle2, Crown, Flame, Sparkles } from 'lucide-react'
import { ApiError } from '@/api/chatApi'
import {
  answerMoscowBoss,
  getMoscowBoss,
  type MoscowBossState,
} from '@/api/gameApi'
import { Chip, GlassPanel } from '@/components/ui/glass'

type ViewState = 'loading' | 'ready' | 'answering' | 'locked' | 'error'

/** The city stamp is issued by the API only after one complete three-question answer. */
export function MoscowBoss({
  signedIn,
  refreshKey,
  onCompleted,
}: {
  signedIn: boolean
  refreshKey: number
  onCompleted?: () => void
}) {
  const [state, setState] = useState<MoscowBossState | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [view, setView] = useState<ViewState>('loading')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!signedIn) return
    let active = true
    setView('loading')
    getMoscowBoss()
      .then((result) => {
        if (!active) return
        setState(result)
        setAnswers({})
        setView('ready')
      })
      .catch((error: unknown) => {
        if (!active) return
        if (error instanceof ApiError && error.status === 409) {
          setView('locked')
          return
        }
        setMessage(error instanceof ApiError ? error.message : 'Не удалось загрузить финальный круг Москвы')
        setView('error')
      })
    return () => { active = false }
  }, [refreshKey, signedIn])

  const submit = async () => {
    if (!state || view === 'answering' || state.completed) return
    setView('answering')
    setMessage(null)
    try {
      const result = await answerMoscowBoss(
        state.content.questions.map((question) => ({
          question_id: question.id,
          answer_key: answers[question.id] ?? '',
        })),
      )
      setState((previous) => previous ? {
        ...previous,
        profile: result.profile,
        daily: result.daily,
        completed: result.completed,
        city_stamp: result.city_stamp,
        sandbox_unlocked: result.sandbox_unlocked,
      } : previous)
      if (result.completed) onCompleted?.()
      setMessage(result.correct
        ? 'Городской штамп получен. Москва открыта для свободного исследования.'
        : `Есть неточности: ${result.incorrect_answers}. Энергия списана только за неверные ответы.`)
      setView('ready')
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : 'Ответы не сохранились. Попробуйте ещё раз.')
      setView('ready')
    }
  }

  if (!signedIn || view === 'loading') return null
  if (view === 'locked') return null
  if (view === 'error' || !state) {
    return (
      <GlassPanel variant="flat" className="border-danger/30 p-4 font-sans text-sm text-text-secondary">
        Финальный круг Москвы пока недоступен: {message ?? 'попробуйте обновить страницу'}.
      </GlassPanel>
    )
  }

  const complete = Object.keys(answers).length === state.content.questions.length
  return (
    <GlassPanel className="overflow-hidden border-amber-300/20 p-0">
      <div className="bg-[linear-gradient(120deg,rgba(227,200,120,0.16),rgba(11,125,127,0.12))] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Chip variant="active"><Crown /> Москва · финальный круг</Chip>
          <div className="flex items-center gap-2">
            <Chip size="sm"><Award /> {state.profile.xp} XP</Chip>
            <Chip size="sm"><BatteryMedium /> {state.profile.energy}/5</Chip>
            <Chip size="sm"><Flame /> {state.daily.streak} дн.</Chip>
          </div>
        </div>
        <p className="mt-4 font-sans text-sm text-text-secondary">{state.content.chris.name} · проводник</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-text">{state.content.scene.title}</h2>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-6 text-text-secondary">{state.content.chris.intro}</p>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        {state.completed ? (
          <div className="flex items-start gap-3 rounded-md bg-primary/10 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="font-sans text-sm text-text-secondary">
              {state.city_stamp?.title ?? 'Городской штамп'} уже в паспорте. Sandbox Москвы открыт.
            </p>
          </div>
        ) : (
          <>
            {state.content.questions.map((question, index) => (
              <section key={question.id} className="rounded-md bg-panel-2/70 p-4">
                <p className="font-sans text-xs uppercase tracking-wide text-text-muted">Вопрос {index + 1}</p>
                <p className="mt-2 font-display text-lg font-semibold text-text">{question.text}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {question.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={view === 'answering' || state.profile.energy === 0}
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                      className={`rounded-md border px-4 py-3 text-left font-sans text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${answers[question.id] === option.id ? 'border-amber-200/60 bg-amber-200/10 text-text' : 'border-white/10 bg-panel-2 text-text-secondary hover:border-primary/50 hover:bg-primary/10'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>
            ))}
            <button
              type="button"
              disabled={!complete || view === 'answering' || state.profile.energy === 0}
              onClick={() => void submit()}
              className="rounded-md bg-primary px-5 py-3 font-sans text-sm font-semibold text-white transition hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Проверить три ответа
            </button>
            {state.profile.energy === 0 && <p className="font-sans text-xs text-warning">Энергия закончилась — она восстановится завтра.</p>}
          </>
        )}
        {state.content.sources?.length ? (
          <p className="font-sans text-xs text-text-muted">
            Источники: {state.content.sources.map((source, index) => (
              <span key={source.url}>{index ? ' · ' : ''}<a className="text-primary hover:underline" href={source.url} target="_blank" rel="noreferrer">{source.label}</a></span>
            ))}
          </p>
        ) : null}
        {message && <p className="flex items-center gap-2 font-sans text-sm text-text-secondary"><Sparkles className="h-4 w-4 text-accent-soft" /> {message}</p>}
      </div>
    </GlassPanel>
  )
}
