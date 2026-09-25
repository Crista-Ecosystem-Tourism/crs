import { useEffect, useState } from 'react'
import { CheckCircle2, Lightbulb, LockKeyhole, MapPin } from 'lucide-react'
import { ApiError } from '@/api/chatApi'
import { answerCityQuest, getCityPath, getCityQuest, type CityPathState, type CityQuestState } from '@/api/gameApi'
import { GlassPanel } from '@/components/ui/glass'
import { useApp } from '@/context/AppContext'
import { getGameCopy } from '@/lib/gameCopy'
import { QuestTips } from './QuestTips'
import { QuestMedia } from './QuestMedia'

export function CityPilot({ cityId, signedIn, refreshKey, onCompleted }: { cityId: 'st-petersburg' | 'sochi'; signedIn: boolean; refreshKey: number; onCompleted: () => void }) {
  const { language, user } = useApp()
  const copy = getGameCopy(language)
  const [path, setPath] = useState<CityPathState | null>(null)
  const [quest, setQuest] = useState<CityQuestState | null>(null)
  const [tipsQuestId, setTipsQuestId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [answering, setAnswering] = useState(false)

  useEffect(() => {
    if (!signedIn) return
    getCityPath(cityId).then(setPath).catch(() => setPath(null))
  }, [cityId, refreshKey, signedIn])

  const open = async (questId: string) => {
    try { setQuest(await getCityQuest(cityId, questId, language)); setMessage(null) }
    catch (error) { setMessage(error instanceof ApiError ? error.message : copy.questUnavailable) }
  }
  const answer = async (answerKey: string) => {
    if (!quest || answering) return
    setAnswering(true)
    try {
      const result = await answerCityQuest(cityId, quest.quest.id, answerKey, language)
      setMessage(result.correct ? copy.correctXp(result.xp_awarded) : copy.tryAgain)
      if (result.completed) { setQuest(null); onCompleted() }
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : copy.saveAnswerFailed)
    } finally {
      setAnswering(false)
    }
  }
  if (!signedIn || !path) return null
  return <GlassPanel variant="flat" className="p-5">
    <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.pilotLabel}</p>
    <h2 className="mt-1 font-display text-xl font-semibold text-text">{copy.cityPilotNames[cityId]}</h2>
    <ol className="mt-4 space-y-2">
      {path.nodes.map((node) => {
        const name = copy.pilotNodeNames[node.id] ?? node.id
        return <li key={node.id} className="flex gap-2">
          <button type="button" disabled={!node.unlocked || node.completed} onClick={() => void open(node.id)} className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-white/10 bg-panel-2/60 px-4 py-3 text-left disabled:opacity-60">
            {node.completed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : node.unlocked ? <MapPin className="h-5 w-5 text-accent-soft" /> : <LockKeyhole className="h-5 w-5 text-text-muted" />}
            <span className="flex-1 font-sans text-sm text-text">{node.position}. {name}</span>
            <span className="font-sans text-xs text-text-muted">{node.completed ? copy.pilotNodeStates.completed : node.unlocked ? copy.pilotNodeStates.unlocked : copy.pilotNodeStates.locked}</span>
          </button>
          {node.unlocked && <button type="button" onClick={() => setTipsQuestId(tipsQuestId === node.id ? null : node.id)} aria-expanded={tipsQuestId === node.id} aria-label={`${language === 'en' ? 'Tips for' : 'Советы для'} ${name}`} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/10 px-2 text-xs text-text-secondary hover:bg-panel-2"><Lightbulb className="h-4 w-4" />{language === 'en' ? 'Tips' : 'Советы'}</button>}
        </li>
      })}
    </ol>
    {path.nodes.length > 0 && path.nodes.every((node) => node.completed) && <p className="mt-4 rounded-md bg-primary/10 p-3 font-sans text-sm text-text-secondary">{copy.pilotComplete}</p>}
    {quest && <section className="mt-5 rounded-md border border-primary/20 bg-primary/5 p-4">
      {quest.content_language !== language && <p className="mb-3 rounded bg-panel-2 px-3 py-2 font-sans text-xs text-text-muted">{language === 'en' ? copy.pilotContentLanguageNote : 'Сейчас показан доступный оригинал на русском языке.'}</p>}
      <h3 className="font-display text-lg font-semibold text-text">{quest.content.scene.title}</h3>
      <p className="mt-2 font-sans text-sm text-text-secondary">{quest.content.fact.text}</p>
      <a className="mt-2 inline-block font-sans text-xs text-primary hover:underline" href={quest.content.fact.source_url} target="_blank" rel="noreferrer">{copy.source}: {quest.content.fact.source_label ?? copy.openSource}</a>
      {quest.quest.kind === 'truth-myth' && <p className="mt-4 font-sans text-xs font-semibold uppercase tracking-wide text-accent-soft">{copy.truthOrMyth}</p>}
      {quest.quest.kind === 'timeline' && <p className="mt-4 font-sans text-xs font-semibold uppercase tracking-wide text-accent-soft">{copy.timeline}</p>}
      <p className="mt-4 font-sans text-sm font-semibold text-text">{quest.content.question.text}</p>
      <div className={quest.quest.kind === 'timeline' ? 'mt-3 flex items-stretch gap-2' : 'mt-2 grid gap-2 sm:grid-cols-3'}>{quest.content.question.options.map((option) => <button key={option.id} type="button" disabled={answering} onClick={() => void answer(option.id)} className={quest.quest.kind === 'timeline' ? 'relative flex-1 border-t-2 border-accent-soft bg-panel-2 px-2 pt-4 text-center font-sans text-sm text-text disabled:opacity-60 before:absolute before:left-1/2 before:top-[-6px] before:h-2 before:w-2 before:-translate-x-1/2 before:rounded-full before:bg-accent-soft' : 'rounded-md border border-white/10 bg-panel-2 px-3 py-2 text-left font-sans text-sm text-text disabled:opacity-60'}>{option.label}</button>)}</div>
    </section>}
    {tipsQuestId && <><QuestTips questId={tipsQuestId} signedIn={signedIn} isEditor={Boolean(user?.isEditor)} /><QuestMedia questId={tipsQuestId} /></>}
    {message && <p className="mt-3 font-sans text-sm text-text-secondary">{message}</p>}
  </GlassPanel>
}
