import { useCallback, useEffect, useState } from 'react'
import { Flag, MessageSquareText, ShieldCheck } from 'lucide-react'
import {
  createTipDraft,
  decideTip,
  deleteTipDraft,
  getMyTips,
  getPublishedTips,
  getTipAudit,
  getTipReports,
  getTipReviewQueue,
  reportTip,
  resolveTipReport,
  submitTip,
  updateTipDraft,
  type GameTip,
  type TipAuditEntry,
  type TipReport,
  type TipReportReason,
} from '@/api/tipApi'
import { Button } from '@/components/ui/button'
import { GlassPanel } from '@/components/ui/glass'
import { useApp } from '@/context/AppContext'

const reportReasons: TipReportReason[] = ['inaccurate', 'unsafe', 'spam', 'copyright', 'other']

export function QuestTips({ questId, signedIn, isEditor }: { questId: string; signedIn: boolean; isEditor: boolean }) {
  const { language } = useApp()
  const en = language === 'en'
  const [published, setPublished] = useState<GameTip[]>([])
  const [mine, setMine] = useState<GameTip[]>([])
  const [review, setReview] = useState<GameTip[]>([])
  const [reports, setReports] = useState<TipReport[]>([])
  const [audit, setAudit] = useState<TipAuditEntry[]>([])
  const [newText, setNewText] = useState('')
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [reportingId, setReportingId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState<TipReportReason>('inaccurate')
  const [reportDetails, setReportDetails] = useState('')
  const [moderationNote, setModerationNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const [publicItems, ownItems, reviewItems, reportItems, auditItems] = await Promise.all([
        getPublishedTips(questId),
        signedIn ? getMyTips() : Promise.resolve([]),
        isEditor ? getTipReviewQueue() : Promise.resolve([]),
        isEditor ? getTipReports() : Promise.resolve([]),
        isEditor ? getTipAudit() : Promise.resolve([]),
      ])
      setPublished(publicItems)
      setMine(ownItems)
      setReview(reviewItems)
      setReports(reportItems)
      setAudit(auditItems)
    } catch {
      setError(en ? 'Could not load tips right now.' : 'Не удалось загрузить заметки.')
    }
  }, [en, isEditor, questId, signedIn])

  useEffect(() => { void refresh() }, [refresh])

  const run = async (action: () => Promise<unknown>, success: string) => {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await action()
      await refresh()
      setNotice(success)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : (en ? 'The action failed.' : 'Не удалось выполнить действие.'))
    } finally {
      setBusy(false)
    }
  }

  const saveNewDraft = async () => {
    const body = newText.trim()
    if (body.length < 10 || body.length > 1200) return
    await run(async () => { await createTipDraft(questId, body); setNewText('') }, en ? 'Draft saved.' : 'Черновик сохранён.')
  }

  const saveAndSubmit = async (tip: GameTip) => {
    const body = edits[tip.id] ?? tip.body
    await run(async () => {
      await updateTipDraft(tip.id, body)
      await submitTip(tip.id)
      setEdits((current) => { const next = { ...current }; delete next[tip.id]; return next })
    }, en ? 'Tip sent to the review queue.' : 'Заметка отправлена на проверку.')
  }

  const sendReport = async (tipId: string) => {
    await run(async () => {
      await reportTip(tipId, reportReason, reportDetails.trim())
      setReportingId(null)
      setReportDetails('')
    }, en ? 'Report sent to moderators.' : 'Жалоба отправлена модераторам.')
  }

  const decide = (tipId: string, decision: 'publish' | 'reject' | 'hide') =>
    run(() => decideTip(tipId, decision, moderationNote.trim()), decision === 'publish'
      ? (en ? 'Tip published.' : 'Заметка опубликована.')
      : (en ? 'Moderation decision recorded.' : 'Решение модератора сохранено.'))

  const resolve = (reportId: string, resolution: 'dismiss' | 'hide_tip') =>
    run(() => resolveTipReport(reportId, resolution, moderationNote.trim()), en ? 'Report resolved.' : 'Жалоба обработана.')

  const ownDrafts = mine.filter((tip) => tip.quest_id === questId && tip.status === 'draft')
  const labels: Record<TipReportReason, string> = en
    ? { inaccurate: 'Inaccurate', unsafe: 'Unsafe', spam: 'Spam', copyright: 'Copyright', other: 'Other' }
    : { inaccurate: 'Неточно', unsafe: 'Небезопасно', spam: 'Спам', copyright: 'Авторские права', other: 'Другое' }

  return (
    <section className="mt-5 border-t border-hairline pt-4" aria-label={en ? 'Traveler tips for this location' : 'Заметки путешественников об этой точке'}>
      <h4 className="flex items-center gap-2 font-sans text-sm font-semibold text-text"><MessageSquareText className="h-4 w-4" />{en ? 'Traveler tips' : 'Советы путешественников'}</h4>
      {error && <p role="alert" className="mt-2 text-xs text-error">{error}</p>}
      {notice && <p role="status" className="mt-2 text-xs text-text-secondary">{notice}</p>}
      {published.length === 0 && !error && <p className="mt-2 text-xs text-text-muted">{en ? 'No published tips yet.' : 'Опубликованных заметок пока нет.'}</p>}
      <div className="mt-3 space-y-2">
        {published.map((tip) => (
          <article key={tip.id} className="rounded-md border border-hairline bg-panel-2/50 p-3">
            <p className="whitespace-pre-wrap text-sm text-text-secondary">{tip.body}</p>
            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-text-muted">
              <span>{tip.author_name || (en ? 'Crista traveler' : 'Путешественник Crista')}</span>
              {signedIn && !mine.some((ownTip) => ownTip.id === tip.id) && <button type="button" className="inline-flex items-center gap-1 hover:text-text" onClick={() => setReportingId(reportingId === tip.id ? null : tip.id)}><Flag className="h-3 w-3" />{en ? 'Report' : 'Пожаловаться'}</button>}
            </div>
            {reportingId === tip.id && <div className="mt-3 grid gap-2">
              <label className="text-xs text-text-secondary">{en ? 'Reason' : 'Причина'}
                <select aria-label={en ? 'Report reason' : 'Причина жалобы'} value={reportReason} onChange={(event) => setReportReason(event.target.value as TipReportReason)} className="mt-1 block h-9 w-full rounded border border-hairline bg-panel px-2 text-text">
                  {reportReasons.map((reason) => <option key={reason} value={reason}>{labels[reason]}</option>)}
                </select>
              </label>
              <textarea aria-label={en ? 'Report details' : 'Подробности жалобы'} maxLength={500} value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} className="rounded border border-hairline bg-panel p-2 text-xs text-text" placeholder={en ? 'Optional details' : 'Подробности (необязательно)'} />
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => void sendReport(tip.id)}>{en ? 'Send report' : 'Отправить жалобу'}</Button>
            </div>}
          </article>
        ))}
      </div>

      {signedIn && <div className="mt-4 space-y-2">
        <label className="block text-xs text-text-secondary" htmlFor={`tip-new-${questId}`}>{en ? 'Share a practical tip' : 'Поделитесь полезным советом'}</label>
        <textarea id={`tip-new-${questId}`} maxLength={1200} minLength={10} value={newText} onChange={(event) => setNewText(event.target.value)} className="block min-h-20 w-full rounded border border-hairline bg-panel p-2 text-sm text-text" placeholder={en ? 'A concise, useful note for this location…' : 'Короткая полезная заметка об этой точке…'} />
        <p className="text-right text-[11px] text-text-muted">{newText.trim().length}/1200</p>
        <Button size="sm" variant="secondary" disabled={busy || newText.trim().length < 10} onClick={() => void saveNewDraft()}>{en ? 'Save draft' : 'Сохранить черновик'}</Button>
      </div>}

      {ownDrafts.length > 0 && <div className="mt-4 space-y-2" aria-label={en ? 'Your drafts' : 'Ваши черновики'}>
        <h5 className="text-xs font-semibold text-text-secondary">{en ? 'Your drafts' : 'Ваши черновики'}</h5>
        {ownDrafts.map((tip) => <div key={tip.id} className="space-y-2 rounded-md border border-hairline p-3">
          <textarea aria-label={`${en ? 'Edit draft' : 'Правка черновика'} ${tip.id}`} maxLength={1200} value={edits[tip.id] ?? tip.body} onChange={(event) => setEdits((current) => ({ ...current, [tip.id]: event.target.value }))} className="block min-h-16 w-full rounded border border-hairline bg-panel p-2 text-xs text-text" />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" disabled={busy || (edits[tip.id] ?? tip.body).trim().length < 10} onClick={() => void run(() => updateTipDraft(tip.id, edits[tip.id] ?? tip.body), en ? 'Draft updated.' : 'Черновик обновлён.')}>{en ? 'Save' : 'Сохранить'}</Button>
            <Button size="sm" disabled={busy} onClick={() => void saveAndSubmit(tip)}>{en ? 'Submit for review' : 'Отправить на проверку'}</Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void run(() => deleteTipDraft(tip.id), en ? 'Draft deleted.' : 'Черновик удалён.')}>{en ? 'Delete' : 'Удалить'}</Button>
          </div>
        </div>)}
      </div>}

      {isEditor && <div className="mt-5 space-y-3 border-t border-hairline pt-4">
        <h5 className="flex items-center gap-2 text-xs font-semibold text-text-secondary"><ShieldCheck className="h-4 w-4" />{en ? 'Moderator workspace' : 'Рабочее место модератора'}</h5>
        <textarea aria-label={en ? 'Moderator decision note' : 'Комментарий модератора'} maxLength={500} value={moderationNote} onChange={(event) => setModerationNote(event.target.value)} className="block min-h-14 w-full rounded border border-hairline bg-panel p-2 text-xs text-text" placeholder={en ? 'Optional note recorded in the audit log' : 'Комментарий (будет записан в журнал действий)'} />
        <GlassPanel className="space-y-2 p-3" aria-label={en ? 'Tip review queue' : 'Очередь проверки заметок'}>
          <p className="text-xs font-semibold text-text">{en ? `Review queue (${review.length})` : `На проверке (${review.length})`}</p>
          {review.map((tip) => <article key={tip.id} className="rounded border border-hairline p-2"><p className="text-xs text-text-secondary">{tip.body}</p><p className="mt-1 text-[11px] text-text-muted">{tip.author_name}</p><div className="mt-2 flex gap-2"><Button size="sm" disabled={busy} onClick={() => void decide(tip.id, 'publish')}>{en ? 'Publish' : 'Опубликовать'}</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => void decide(tip.id, 'reject')}>{en ? 'Reject' : 'Отклонить'}</Button></div></article>)}
        </GlassPanel>
        <GlassPanel className="space-y-2 p-3" aria-label={en ? 'Pending reports' : 'Новые жалобы'}>
          <p className="text-xs font-semibold text-text">{en ? `Reports (${reports.length})` : `Жалобы (${reports.length})`}</p>
          {reports.map((report) => <article key={report.id} className="rounded border border-hairline p-2"><p className="text-xs text-text-secondary">{report.tip_body}</p><p className="mt-1 text-[11px] text-text-muted">{labels[report.reason]} · {report.reporter_name}{report.details ? ` · ${report.details}` : ''}</p><div className="mt-2 flex gap-2"><Button size="sm" disabled={busy} onClick={() => void resolve(report.id, 'hide_tip')}>{en ? 'Hide tip' : 'Скрыть заметку'}</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => void resolve(report.id, 'dismiss')}>{en ? 'Dismiss' : 'Отклонить жалобу'}</Button></div></article>)}
        </GlassPanel>
        <GlassPanel className="p-3" aria-label={en ? 'Moderation audit log' : 'Журнал модерации'}>
          <p className="text-xs font-semibold text-text">{en ? 'Recent audit events' : 'Последние действия'}</p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-[11px] text-text-muted">{audit.slice(0, 10).map((entry) => <li key={entry.id}>{new Date(entry.created_at).toLocaleString()} · {entry.actor_name || (en ? 'Deleted account' : 'Удалённый аккаунт')} · {entry.action}{typeof entry.details.note === 'string' && entry.details.note ? ` — ${entry.details.note}` : ''}</li>)}</ul>
        </GlassPanel>
      </div>}
    </section>
  )
}
