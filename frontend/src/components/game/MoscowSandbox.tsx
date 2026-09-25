import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, BatteryCharging, BookOpenCheck, CheckCircle2, Compass, Link2, MoveHorizontal, Sparkles } from 'lucide-react'
import { ApiError } from '@/api/chatApi'
import {
  answerMoscowMatching,
  answerMoscowTimeline,
  answerMoscowTruthMyth,
  answerMoscowWordBlocks,
  answerMoscowPriceSlider,
  answerMoscowPhotoScanner,
  restoreMoscowEnergy,
  getMoscowSandbox,
  type MoscowSandboxState,
} from '@/api/gameApi'
import { getWikiArticle, getWikiArticleVersion, type WikiPublishedArticle } from '@/api/wikiApi'
import { Chip, GlassPanel } from '@/components/ui/glass'
import { useApp } from '@/context/AppContext'
import { getGameCopy } from '@/lib/gameCopy'

function useMoscowSandboxCopy() {
  const { language } = useApp()
  return { language, copy: getGameCopy(language).moscowSandbox }
}

/** Review content becomes available only after the server has issued the city stamp. */
export function MoscowSandbox({
  signedIn,
  refreshKey,
}: {
  signedIn: boolean
  refreshKey: number
}) {
  const { language, copy } = useMoscowSandboxCopy()
  const [state, setState] = useState<MoscowSandboxState | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refreshPracticeRecovery = () => {
    getMoscowSandbox(language).then((result) => setState(result)).catch(() => {
      // A completed exercise remains usable if the optional recovery refresh is interrupted.
    })
  }

  useEffect(() => {
    if (!signedIn) return
    let active = true
    getMoscowSandbox(language)
      .then((result) => {
        if (!active) return
        setState(result)
        setError(null)
      })
      .catch((requestError: unknown) => {
        if (!active) return
        if (requestError instanceof ApiError && requestError.status === 409) {
          setState(null)
          setError(null)
          return
        }
        setError(language === 'ru' && requestError instanceof ApiError ? requestError.message : copy.retry)
      })
    return () => { active = false }
  }, [refreshKey, signedIn, language])

  if (!signedIn) return null
  if (error) {
    return (
      <GlassPanel variant="flat" className="border-danger/30 p-4 font-sans text-sm text-text-secondary">
        {copy.unavailable(error)}
      </GlassPanel>
    )
  }
  if (!state) return null

  return (
    <GlassPanel variant="flat" className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.eyebrow}</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-text">{copy.title}</h2>
          <p className="mt-2 max-w-2xl font-sans text-sm leading-6 text-text-secondary">{copy.description}</p>
        </div>
        <Chip size="sm" variant="active"><CheckCircle2 /> {state.city_stamp.title}</Chip>
      </div>
      {language === 'en' && (state.activity_content_language !== 'en' || state.lesson_content_language !== 'en' || state.content_language !== 'en' || state.wiki_content_language === 'ru') && (
        <p className="mt-4 rounded bg-panel-2 px-3 py-2 font-sans text-xs text-text-muted">{copy.contentLanguageNote}</p>
      )}
      <MoscowWikiArticle reference={state.wiki_reference} />
      {state.story && <StoryCard story={state.story} />}
      {state.drill && <TruthMythDrill drill={state.drill} onCorrect={refreshPracticeRecovery} />}
      {state.matching && <MatchingDrill matching={state.matching} onCorrect={refreshPracticeRecovery} />}
      {state.timeline && <TimelineDrill timeline={state.timeline} onCorrect={refreshPracticeRecovery} />}
      {state.word_blocks && <WordBlocksDrill wordBlocks={state.word_blocks} onCorrect={refreshPracticeRecovery} />}
      {state.price_slider && <PriceSliderDrill priceSlider={state.price_slider} onCorrect={refreshPracticeRecovery} />}
      {state.photo_scanner && <PhotoScannerDrill photoScanner={state.photo_scanner} onCorrect={refreshPracticeRecovery} />}
      <PracticeRecovery initial={state.practice_recovery} />
      <div className="mt-5 space-y-3">
        {state.lessons.map((lesson) => (
          <details key={lesson.id} className="rounded-md border border-white/10 bg-panel-2/60 p-4">
            <summary className="flex cursor-pointer list-none items-center gap-3 font-sans text-sm font-medium text-text">
              <Compass className="h-4 w-4 text-primary" /> {lesson.position}. {lesson.title}
            </summary>
            <div className="mt-4 space-y-3 pl-7">
              <p className="font-sans text-sm leading-6 text-text-secondary">{lesson.fact.text}</p>
              <p className="font-sans text-sm leading-6 text-text-secondary">{lesson.explanation}</p>
              <p className="font-display text-base font-semibold text-text">{copy.lessonCheck}: {lesson.question.text}</p>
              <a className="inline-flex items-center gap-2 font-sans text-xs text-primary hover:underline" href={lesson.fact.source_url} target="_blank" rel="noreferrer">
                <BookOpenCheck className="h-4 w-4" /> {getGameCopy(language).source}: {lesson.fact.source_label ?? copy.sourceFallback}
              </a>
              {lesson.wiki_reference && (
                <a className="ml-4 inline-flex items-center gap-2 font-sans text-xs text-primary hover:underline" href="#moscow-wiki-article">
                  <BookOpenCheck className="h-4 w-4" /> {copy.cityContext(lesson.wiki_reference.version_id)}
                </a>
              )}
            </div>
          </details>
        ))}
      </div>
    </GlassPanel>
  )
}

function StoryCard({ story }: { story: NonNullable<MoscowSandboxState['story']> }) {
  const { language, copy } = useMoscowSandboxCopy()
  return (
    <section className="mt-5 overflow-hidden rounded-md border border-primary/20 bg-panel-2" aria-label={copy.storyAria}>
      <img src={story.image_url} alt={story.image_alt} className="aspect-video w-full object-cover" />
      <div className="p-4 sm:p-5">
        <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{story.eyebrow}</p>
        <h3 className="mt-1 font-display text-xl font-semibold text-text">{story.title}</h3>
        <p className="mt-3 font-sans text-sm leading-6 text-text-secondary">{story.fact}</p>
        <a href={story.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 font-sans text-xs font-semibold text-primary hover:underline">
          <BookOpenCheck className="h-4 w-4" /> {getGameCopy(language).source}: {story.source_label}
        </a>
        <p className="mt-3 font-sans text-xs text-text-muted">{story.note} {story.media_credit}</p>
      </div>
    </section>
  )
}

function PhotoScannerDrill({ photoScanner, onCorrect }: { photoScanner: NonNullable<MoscowSandboxState['photo_scanner']>; onCorrect: () => void }) {
  const { language, copy } = useMoscowSandboxCopy()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [answering, setAnswering] = useState(false)

  const selectHotspot = async (hotspotId: string) => {
    if (answering) return
    setAnswering(true)
    setFeedback(null)
    try {
      const result = await answerMoscowPhotoScanner(hotspotId, language)
      setFeedback(`${result.correct ? copy.accurate : copy.almost} ${result.explanation}`)
      if (result.correct) onCorrect()
    } catch (error) {
      setFeedback(language === 'ru' && error instanceof ApiError ? error.message : copy.answerSaveFailed)
    } finally {
      setAnswering(false)
    }
  }

  return (
    <section className="mt-5 rounded-md border border-primary/20 bg-primary/5 p-4 sm:p-5" aria-label={copy.photoAria}>
      <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.mechanic} · {copy.photoAria}</p>
      <h3 className="mt-1 font-display text-lg font-semibold text-text">{photoScanner.title}</h3>
      <p className="mt-2 font-sans text-sm leading-6 text-text-secondary">{photoScanner.intro}</p>
      <p className="mt-2 font-sans text-xs leading-5 text-text-muted">{copy.photoDisclaimer}</p>
      <p className="mt-4 font-display text-lg font-semibold text-text">{photoScanner.question}</p>
      <div className="relative mt-4 overflow-hidden rounded-md border border-white/10 bg-panel-2">
        <img src={photoScanner.image_url} alt={photoScanner.image_alt} className="aspect-[16/9] w-full object-cover" />
        {photoScanner.hotspots.map((hotspot, index) => (
          <button
            key={hotspot.id}
            type="button"
            aria-label={copy.hotspot(index + 1)}
            disabled={answering}
            onClick={() => void selectHotspot(hotspot.id)}
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, width: `${hotspot.width}%`, height: `${hotspot.height}%` }}
            className="absolute rounded border-2 border-transparent bg-transparent outline-none transition hover:border-primary/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white/90 disabled:cursor-wait"
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-xs text-text-muted">
        <a href={photoScanner.media_source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><BookOpenCheck className="h-3.5 w-3.5" /> {photoScanner.media_credit} · {photoScanner.license}</a>
        <span>{photoScanner.field_note}</span>
      </div>
      {feedback && <p className="mt-3 flex items-start gap-2 rounded-md border border-white/10 bg-panel-2/60 p-3 font-sans text-sm leading-6 text-text-secondary"><Sparkles className="mt-1 h-4 w-4 shrink-0 text-accent-soft" /> {feedback}</p>}
    </section>
  )
}

function MoscowWikiArticle({ reference }: { reference: MoscowSandboxState['wiki_reference'] }) {
  const { copy } = useMoscowSandboxCopy()
  const [article, setArticle] = useState<WikiPublishedArticle | null>(null)

  useEffect(() => {
    let active = true
    const request = reference ? getWikiArticleVersion(reference.version_id) : getWikiArticle('moscow')
    request.then((result) => {
      if (active) setArticle(result)
    }).catch(() => {
      // The sandbox must remain available when the optional reading card is offline.
    })
    return () => { active = false }
  }, [reference?.version_id])

  if (!article) return null
  const summary = typeof article.body.summary === 'string' ? article.body.summary : null
  return (
    <section id="moscow-wiki-article" className="mt-5 rounded-md border border-white/10 bg-panel-2/60 p-4 sm:p-5" aria-label={copy.wikiAria}>
      <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.wikiEyebrow(article.version_id)}</p>
      <h3 className="mt-1 font-display text-lg font-semibold text-text">{article.title}</h3>
      {summary && <p className="mt-2 font-sans text-sm leading-6 text-text-secondary">{summary}</p>}
      {Array.isArray(article.body.sections) && article.body.sections.map((section, index) => {
        if (!section || typeof section !== 'object') return null
        const item = section as { title?: unknown; text?: unknown }
        if (typeof item.title !== 'string' || typeof item.text !== 'string') return null
        return (
          <div key={`${item.title}-${index}`} className="mt-3">
            <h4 className="font-sans text-sm font-semibold text-text">{item.title}</h4>
            <p className="mt-1 font-sans text-sm leading-6 text-text-secondary">{item.text}</p>
          </div>
        )
      })}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {article.sources.map((source) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-sans text-xs text-primary hover:underline">
            <BookOpenCheck className="h-3.5 w-3.5" /> {source.label}
          </a>
        ))}
      </div>
      <p className="mt-3 font-sans text-xs text-text-muted">{copy.license(article.license)}</p>
    </section>
  )
}

function PracticeRecovery({ initial }: { initial: MoscowSandboxState['practice_recovery'] }) {
  const { language, copy } = useMoscowSandboxCopy()
  const [recovery, setRecovery] = useState(initial)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => setRecovery(initial), [initial])

  const restore = async () => {
    if (!recovery.available || loading) return
    setLoading(true)
    setMessage(null)
    try {
      const result = await restoreMoscowEnergy()
      setRecovery(result.practice_recovery)
      setMessage(copy.recoveryAwarded(initial.amount))
    } catch (error) {
      setMessage(language === 'ru' && error instanceof ApiError ? error.message : copy.recoveryFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-5 rounded-md border border-primary/20 bg-primary/5 p-4 sm:p-5" aria-label={copy.recoveryAria}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.recoveryEyebrow}</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-text">{copy.recoveryTitle}</h3>
          <p className="mt-2 font-sans text-sm leading-6 text-text-secondary">{copy.recoveryDescription}</p>
        </div>
        <button type="button" disabled={!recovery.available || loading} onClick={() => void restore()} className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-3 font-sans text-sm font-semibold text-text transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50">
          <BatteryCharging className="h-4 w-4" /> {recovery.used_today ? copy.recoveryDone : copy.recoveryButton}
        </button>
      </div>
      {message && <p className="mt-3 font-sans text-sm text-text-secondary">{message}</p>}
    </section>
  )
}

function PriceSliderDrill({ priceSlider, onCorrect }: { priceSlider: NonNullable<MoscowSandboxState['price_slider']>; onCorrect: () => void }) {
  const { language, copy } = useMoscowSandboxCopy()
  const [value, setValue] = useState(priceSlider.min)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [answering, setAnswering] = useState(false)

  const submit = async () => {
    if (answering) return
    setAnswering(true)
    setFeedback(null)
    try {
      const result = await answerMoscowPriceSlider(value, language)
      setFeedback(`${result.correct ? copy.priceClose : copy.priceTryAgain} ${result.explanation}`)
      if (result.correct) onCorrect()
    } catch (error) {
      setFeedback(language === 'ru' && error instanceof ApiError ? error.message : copy.answerSaveFailed)
    } finally {
      setAnswering(false)
    }
  }

  return (
    <section className="mt-5 rounded-md border border-primary/20 bg-primary/5 p-4 sm:p-5" aria-label={copy.priceAria}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.mechanic}</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-text">{priceSlider.title}</h3>
        </div>
        <Chip size="sm">{priceSlider.fact_date}</Chip>
      </div>
      <p className="mt-2 font-sans text-sm leading-6 text-text-secondary">{priceSlider.intro}</p>
      <p className="mt-4 font-display text-lg font-semibold text-text">{priceSlider.question}</p>
      <label className="mt-4 block font-sans text-sm text-text-secondary" htmlFor="moscow-price-slider">
        {copy.yourEstimate} <span className="font-semibold text-text">{value} {priceSlider.unit}</span>
      </label>
      <input
        id="moscow-price-slider"
        aria-label={copy.yourBid}
        type="range"
        min={priceSlider.min}
        max={priceSlider.max}
        step={priceSlider.step}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="mt-3 w-full accent-primary"
      />
      <div className="mt-1 flex justify-between font-sans text-xs text-text-muted"><span>{priceSlider.min}</span><span>{priceSlider.max} {priceSlider.unit}</span></div>
      <button type="button" disabled={answering} onClick={() => void submit()} className="mt-3 rounded-md border border-primary/40 bg-primary/10 px-4 py-3 font-sans text-sm font-semibold text-text transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50">
        {copy.checkPrice}
      </button>
      {feedback && <p className="mt-3 flex items-start gap-2 rounded-md border border-white/10 bg-panel-2/60 p-3 font-sans text-sm leading-6 text-text-secondary"><Sparkles className="mt-1 h-4 w-4 shrink-0 text-accent-soft" /> {feedback}</p>}
    </section>
  )
}

function WordBlocksDrill({ wordBlocks, onCorrect }: { wordBlocks: NonNullable<MoscowSandboxState['word_blocks']>; onCorrect: () => void }) {
  const { language, copy } = useMoscowSandboxCopy()
  const [blocks, setBlocks] = useState(wordBlocks.blocks)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [answering, setAnswering] = useState(false)

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= blocks.length) return
    setBlocks((current) => {
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setFeedback(null)
  }

  const submit = async () => {
    if (answering) return
    setAnswering(true)
    setFeedback(null)
    try {
      const result = await answerMoscowWordBlocks(blocks.map((block) => block.id), language)
      setFeedback(`${result.correct ? copy.phraseCorrect : copy.orderIncorrect} ${result.explanation}`)
      if (result.correct) onCorrect()
    } catch (error) {
      setFeedback(language === 'ru' && error instanceof ApiError ? error.message : copy.answerSaveFailed)
    } finally {
      setAnswering(false)
    }
  }

  return (
    <section className="mt-5 rounded-md border border-accent-soft/25 bg-accent-soft/5 p-4 sm:p-5" aria-label={copy.wordAria}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.mechanic}</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-text">{wordBlocks.title}</h3>
        </div>
        <Chip size="sm"><MoveHorizontal /> {copy.reorderWords}</Chip>
      </div>
      <p className="mt-2 font-sans text-sm leading-6 text-text-secondary">{wordBlocks.intro}</p>
      <ol className="mt-4 flex flex-wrap gap-2" aria-label={copy.wordsOrder}>
        {blocks.map((block, index) => (
          <li key={block.id} className="flex items-center gap-1 rounded-md border border-white/10 bg-panel-2 px-3 py-2">
            <span className="font-display text-base font-semibold text-text">{block.label}</span>
            <button type="button" aria-label={copy.moveWordUp(block.label)} disabled={index === 0 || answering} onClick={() => move(index, -1)} className="rounded p-1 text-text-secondary hover:text-primary disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
            <button type="button" aria-label={copy.moveWordDown(block.label)} disabled={index === blocks.length - 1 || answering} onClick={() => move(index, 1)} className="rounded p-1 text-text-secondary hover:text-primary disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
          </li>
        ))}
      </ol>
      <button type="button" disabled={answering} onClick={() => void submit()} className="mt-3 rounded-md border border-primary/40 bg-primary/10 px-4 py-3 font-sans text-sm font-semibold text-text transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50">
        {copy.checkPhrase}
      </button>
      {feedback && <p className="mt-3 flex items-start gap-2 rounded-md border border-white/10 bg-panel-2/60 p-3 font-sans text-sm leading-6 text-text-secondary"><Sparkles className="mt-1 h-4 w-4 shrink-0 text-accent-soft" /> {feedback}</p>}
    </section>
  )
}

function TimelineDrill({ timeline, onCorrect }: { timeline: NonNullable<MoscowSandboxState['timeline']>; onCorrect: () => void }) {
  const { language, copy } = useMoscowSandboxCopy()
  const [items, setItems] = useState(timeline.items)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [answering, setAnswering] = useState(false)

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    setItems((current) => {
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setFeedback(null)
  }

  const submit = async () => {
    if (answering) return
    setAnswering(true)
    setFeedback(null)
    try {
      const result = await answerMoscowTimeline(items.map((item) => item.id), language)
      const explanations = result.feedback.map((item) => `${item.correct ? copy.itemCorrect : copy.itemIncorrect}: ${item.explanation}`)
      setFeedback(`${result.correct ? copy.timelineCorrect : copy.orderIncorrect} ${explanations.join(' ')}`)
      if (result.correct) onCorrect()
    } catch (error) {
      setFeedback(language === 'ru' && error instanceof ApiError ? error.message : copy.answerSaveFailed)
    } finally {
      setAnswering(false)
    }
  }

  return (
    <section className="mt-5 rounded-md border border-primary/20 bg-primary/5 p-4 sm:p-5" aria-label={copy.timelineAria}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.mechanic}</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-text">{timeline.title}</h3>
        </div>
        <Chip size="sm"><MoveHorizontal /> {copy.reorder}</Chip>
      </div>
      <p className="mt-2 font-sans text-sm leading-6 text-text-secondary">{timeline.intro}</p>
      <ol className="mt-4 space-y-2" aria-label={copy.eventsOrder}>
        {items.map((item, index) => (
          <li key={item.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-white/10 bg-panel-2 p-3">
            <span className="font-sans text-sm text-text-muted">{index + 1}</span>
            <span className="font-sans text-sm font-medium text-text">{item.label}</span>
            <span className="flex gap-1">
              <button type="button" aria-label={copy.moveItemUp(item.label)} disabled={index === 0 || answering} onClick={() => move(index, -1)} className="rounded border border-white/10 p-2 text-text-secondary hover:border-primary disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" aria-label={copy.moveItemDown(item.label)} disabled={index === items.length - 1 || answering} onClick={() => move(index, 1)} className="rounded border border-white/10 p-2 text-text-secondary hover:border-primary disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
            </span>
          </li>
        ))}
      </ol>
      <button type="button" disabled={answering} onClick={() => void submit()} className="mt-3 rounded-md border border-primary/40 bg-primary/10 px-4 py-3 font-sans text-sm font-semibold text-text transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50">
        {copy.checkTimeline}
      </button>
      {feedback && <p className="mt-3 flex items-start gap-2 rounded-md border border-white/10 bg-panel-2/60 p-3 font-sans text-sm leading-6 text-text-secondary"><Sparkles className="mt-1 h-4 w-4 shrink-0 text-accent-soft" /> {feedback}</p>}
    </section>
  )
}

function MatchingDrill({ matching, onCorrect }: { matching: NonNullable<MoscowSandboxState['matching']>; onCorrect: () => void }) {
  const { language, copy } = useMoscowSandboxCopy()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<string | null>(null)
  const [answering, setAnswering] = useState(false)
  const ready = matching.pairs.every((pair) => answers[pair.id])

  const submit = async () => {
    if (!ready || answering) return
    setAnswering(true)
    setFeedback(null)
    try {
      const result = await answerMoscowMatching(matching.pairs.map((pair) => ({
        pair_id: pair.id,
        choice_id: answers[pair.id],
      })), language)
      const explanations = result.feedback.map((item) => `${item.correct ? copy.correct : copy.checkAgain}: ${item.explanation}`)
      setFeedback(`${result.correct ? copy.pairsCorrect : copy.pairsIncorrect} ${explanations.join(' ')}`)
      if (result.correct) onCorrect()
    } catch (error) {
      setFeedback(language === 'ru' && error instanceof ApiError ? error.message : copy.answerSaveFailed)
    } finally {
      setAnswering(false)
    }
  }

  return (
    <section className="mt-5 rounded-md border border-accent-soft/25 bg-accent-soft/5 p-4 sm:p-5" aria-label={copy.matchingAria}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.mechanic}</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-text">{matching.title}</h3>
        </div>
        <Chip size="sm"><Link2 /> {copy.matchingInput}</Chip>
      </div>
      <p className="mt-2 font-sans text-sm leading-6 text-text-secondary">{matching.intro}</p>
      <div className="mt-4 space-y-3">
        {matching.pairs.map((pair) => (
          <label key={pair.id} className="grid gap-2 rounded-md border border-white/10 bg-panel-2 p-4 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-center">
            <span className="font-display text-base font-semibold text-text">{pair.left}</span>
            <select
              aria-label={copy.yearFor(pair.left)}
              value={answers[pair.id] ?? ''}
              onChange={(event) => setAnswers((current) => ({ ...current, [pair.id]: event.target.value }))}
              className="rounded-md border border-white/10 bg-panel px-3 py-2 font-sans text-sm text-text outline-none transition focus:border-primary"
            >
              <option value="">{copy.chooseYear}</option>
              {matching.choices.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
            </select>
          </label>
        ))}
      </div>
      <button
        type="button"
        disabled={!ready || answering}
        onClick={() => void submit()}
        className="mt-3 rounded-md border border-primary/40 bg-primary/10 px-4 py-3 font-sans text-sm font-semibold text-text transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {copy.checkPairs}
      </button>
      {feedback && (
        <p className="mt-3 flex items-start gap-2 rounded-md border border-white/10 bg-panel-2/60 p-3 font-sans text-sm leading-6 text-text-secondary">
          <Sparkles className="mt-1 h-4 w-4 shrink-0 text-accent-soft" /> {feedback}
        </p>
      )}
    </section>
  )
}

function TruthMythDrill({ drill, onCorrect }: { drill: NonNullable<MoscowSandboxState['drill']>; onCorrect: () => void }) {
  const { language, copy } = useMoscowSandboxCopy()
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [answering, setAnswering] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const statement = drill.statements[index]

  if (!statement) return null

  const answer = async (answerKey: 'truth' | 'myth') => {
    if (answering) return
    setAnswering(true)
    setFeedback(null)
    try {
      const result = await answerMoscowTruthMyth(statement.id, answerKey, language)
      setFeedback(`${result.correct ? copy.correct : copy.almost} ${result.explanation}`)
      if (result.correct) onCorrect()
    } catch (error) {
      setFeedback(language === 'ru' && error instanceof ApiError ? error.message : copy.answerSaveFailed)
    } finally {
      setAnswering(false)
    }
  }

  const next = () => {
    setIndex((current) => (current + 1) % drill.statements.length)
    setFeedback(null)
  }

  const finishSwipe = (endX: number) => {
    if (touchStart === null || Math.abs(endX - touchStart) < 48) return
    void answer(endX > touchStart ? 'truth' : 'myth')
    setTouchStart(null)
  }

  return (
    <section className="mt-5 rounded-md border border-primary/20 bg-primary/5 p-4 sm:p-5" aria-label={copy.truthMythAria}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.mechanic}</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-text">{drill.title}</h3>
        </div>
        <Chip size="sm"><MoveHorizontal /> {copy.swipeButtons}</Chip>
      </div>
      <p className="mt-2 font-sans text-sm leading-6 text-text-secondary">{drill.intro}</p>
      <div
        className="mt-4 rounded-md border border-white/10 bg-panel-2 p-5"
        onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
        onTouchEnd={(event) => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}
      >
        <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{copy.statement(index + 1, drill.statements.length)}</p>
        <p className="mt-2 font-display text-xl font-semibold leading-8 text-text">{statement.text}</p>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={answering}
          onClick={() => void answer('myth')}
          className="rounded-md border border-white/10 bg-panel-2 px-4 py-3 font-sans text-sm font-medium text-text-secondary transition hover:border-danger/50 hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copy.myth}
        </button>
        <button
          type="button"
          disabled={answering}
          onClick={() => void answer('truth')}
          className="rounded-md border border-white/10 bg-panel-2 px-4 py-3 font-sans text-sm font-medium text-text-secondary transition hover:border-primary/50 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copy.truth}
        </button>
      </div>
      {feedback && (
        <div className="mt-3 rounded-md border border-white/10 bg-panel-2/60 p-3">
          <p className="flex items-start gap-2 font-sans text-sm leading-6 text-text-secondary"><Sparkles className="mt-1 h-4 w-4 shrink-0 text-accent-soft" /> {feedback}</p>
          <button type="button" onClick={next} className="mt-3 font-sans text-xs font-semibold text-primary hover:underline">
            {copy.nextStatement}
          </button>
        </div>
      )}
    </section>
  )
}
