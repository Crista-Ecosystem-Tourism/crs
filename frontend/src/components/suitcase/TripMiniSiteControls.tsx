import { useEffect, useState } from 'react'
import { ApiError } from '@/api/chatApi'
import { createMiniSiteStampTicket, getGamePassport, type GamePassport } from '@/api/gameApi'
import {
  completeTripForMiniSite,
  getTripMiniSite,
  publishTripMiniSite,
  revokeTripMiniSite,
  type TripMiniSiteState,
} from '@/api/suitcaseApi'

export function TripMiniSiteControls({ tripId }: { tripId: string }) {
  const [site, setSite] = useState<TripMiniSiteState | null>(null)
  const [visibility, setVisibility] = useState<'public' | 'link'>('link')
  const [consent, setConsent] = useState(false)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [passport, setPassport] = useState<GamePassport | null>(null)
  const [selectedStamps, setSelectedStamps] = useState<string[]>([])
  const [previewStampKeys, setPreviewStampKeys] = useState<string[]>([])
  const [passportError, setPassportError] = useState('')

  useEffect(() => {
    let active = true
    setSite(null)
    setError('')
    setVisibility('link')
    setConsent(false)
    setEditing(false)
    setPassport(null)
    setSelectedStamps([])
    setPreviewStampKeys([])
    setPassportError('')
    getTripMiniSite(tripId)
      .then((current) => {
        if (active) {
          setSite(current)
          if (current.visibility) setVisibility(current.visibility)
          const preview = current.preview_snapshot ?? current.draft_snapshot
          const previewKeys = (preview?.game_stamps ?? []).map((stamp) => stamp.key)
          const chosenSnapshot = current.published ? current.published_snapshot : preview
          setSelectedStamps((chosenSnapshot?.game_stamps ?? []).map((stamp) => stamp.key))
          setPreviewStampKeys(previewKeys)
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof ApiError ? reason.detail : 'Не удалось загрузить настройки публикации')
      })
    getGamePassport()
      .then((result) => { if (active) setPassport(result) })
      .catch((reason: unknown) => {
        if (active) setPassportError(reason instanceof ApiError ? reason.detail : 'Не удалось загрузить игровые отметки')
      })
    return () => { active = false }
  }, [tripId])

  const publish = async () => {
    if (!consent || !sameStampSelection) return
    setBusy(true)
    setError('')
    try {
      const ticket = selectedStamps.length ? (await createMiniSiteStampTicket(selectedStamps)).ticket : undefined
      setSite(await publishTripMiniSite(tripId, visibility, ticket))
      setConsent(false)
      setEditing(false)
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.detail : 'Не удалось опубликовать страницу')
    } finally { setBusy(false) }
  }

  const complete = async () => {
    setBusy(true)
    setError('')
    try {
      const ticket = selectedStamps.length ? (await createMiniSiteStampTicket(selectedStamps)).ticket : undefined
      setSite(await completeTripForMiniSite(tripId, ticket))
      setPreviewStampKeys([...selectedStamps].sort())
    }
    catch (reason) {
      setError(reason instanceof ApiError ? reason.detail : 'Не удалось подготовить черновик поездки')
    } finally { setBusy(false) }
  }

  const sameStampSelection = selectedStamps.length === previewStampKeys.length
    && [...selectedStamps].sort().every((key, index) => key === [...previewStampKeys].sort()[index])

  const revoke = async () => {
    if (!window.confirm('Отозвать публикацию? Ссылка сразу перестанет открываться.')) return
    setBusy(true)
    setError('')
    try {
      await revokeTripMiniSite(tripId)
      setSite((current) => current ? {
        ...current,
        published: false,
        draft_ready: false,
        slug: null,
        visibility: null,
        consented_at: null,
      } : null)
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.detail : 'Не удалось отозвать публикацию')
    } finally { setBusy(false) }
  }

  const url = site?.published && site.slug ? `${window.location.origin}/t/${encodeURIComponent(site.slug)}` : null
  const copy = async () => {
    if (!url) return
    try { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
    catch { setError('Не удалось скопировать ссылку') }
  }

  return <section aria-label="Мини-сайт поездки" className="rounded-2xl border border-border bg-surface-light p-4 space-y-3">
    <div>
      <h2 className="text-sm font-semibold text-text">Мини-сайт поездки</h2>
      <p className="mt-1 text-xs leading-relaxed text-text-muted">
        Публикация создаёт отдельный snapshot. Он включает город и даты, заметки, координаты и названия точек,
        фотографии по HTTPS, выбранные игровые отметки и счётчики дней/мест/дистанции. Расходы и данные аккаунта не публикуются.
        Повторная публикация обновит snapshot и заменит прежнюю ссылку.
      </p>
    </div>

    {url && <div className="space-y-2">
      <p className="text-xs text-text-secondary">Доступ: {site?.visibility === 'public' ? 'публичная страница' : 'только по секретной ссылке'}</p>
      <div className="flex gap-2">
        <a className="min-w-0 flex-1 truncate self-center text-xs text-primary underline" href={url}>{url}</a>
        <button type="button" onClick={() => void copy()} className="rounded-lg border border-border px-3 py-2 text-xs text-text">{copied ? 'Скопировано' : 'Копировать'}</button>
      </div>
      {!editing && <button type="button" disabled={busy} onClick={() => { setConsent(false); setEditing(true) }} className="rounded-lg border border-border px-3 py-2 text-xs text-text disabled:opacity-50">
        Обновить snapshot и ссылку
      </button>}
      <button type="button" disabled={busy} onClick={() => void revoke()} className="rounded-lg px-3 py-2 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50">
        {busy ? 'Сохраняю…' : 'Отозвать публикацию'}
      </button>
    </div>}
    {(!url || editing) && <>
      {site?.preview_snapshot && <DraftSnapshotPreview snapshot={site.preview_snapshot} persisted={Boolean(site.draft_ready)} />}
      {!site?.completed_at && !url ? <div className="space-y-2 rounded-lg bg-surface p-3">
        <p className="text-xs text-text-secondary">Завершение подготовит приватный черновик. Само по себе оно не создаёт публичную страницу.</p>
        <button type="button" disabled={busy} onClick={() => void complete()} className="rounded-lg border border-border px-3 py-2 text-xs text-text disabled:opacity-50">
          {busy ? 'Готовлю черновик…' : 'Завершить поездку и подготовить черновик'}
        </button>
      </div> : null}
      <fieldset className="space-y-2 rounded-lg border border-border bg-surface p-3" disabled={busy}>
        <legend className="px-1 text-xs font-medium text-text">Игровые отметки (необязательно)</legend>
        {passportError && <p role="status" className="text-xs text-text-muted">{passportError}. Отметки можно не добавлять.</p>}
        {!passport && !passportError && <p className="text-xs text-text-muted">Загружаю паспорт…</p>}
        {passport?.stamps.length === 0 && <p className="text-xs text-text-muted">В паспорте пока нет отметок.</p>}
        {(passport?.stamps.length ?? 0) > 20 && <p className="text-xs text-text-muted">Можно выбрать до 20 отметок.</p>}
        {passport?.stamps.map((stamp) => <label key={stamp.key} className="flex items-start gap-2 text-xs text-text-secondary">
          <input type="checkbox" checked={selectedStamps.includes(stamp.key)} disabled={!selectedStamps.includes(stamp.key) && selectedStamps.length >= 20} onChange={(event) => setSelectedStamps((current) => event.target.checked ? [...current, stamp.key] : current.filter((key) => key !== stamp.key))} />
          <span>{stamp.title} · {new Date(stamp.earned_at).toLocaleDateString('ru-RU')}</span>
        </label>)}
        <p className="text-xs leading-relaxed text-text-muted">Выбранные отметки, игровые факты и ссылки на источники попадут в предпросмотр; они станут доступными посетителям только после отдельного согласия на публикацию.</p>
      </fieldset>
      {!sameStampSelection && <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-text-secondary">
        <p>Состав отметок изменён — сначала обновите предпросмотр, чтобы проверить факты и источники.</p>
        <button type="button" disabled={busy} onClick={() => void complete()} className="mt-2 rounded-lg border border-border px-3 py-2 text-text disabled:opacity-50">Обновить предпросмотр</button>
      </div>}
      {url && editing && <p className="rounded-lg bg-surface p-3 text-xs text-text-secondary">Старая ссылка пока продолжает работать. После подтверждения она заменится новой.</p>}
      <label className="flex items-start gap-2 text-xs text-text-secondary">
        <input type="radio" name={`trip-visibility-${tripId}`} checked={visibility === 'link'} onChange={() => setVisibility('link')} />
        Доступ только по непредсказуемой ссылке
      </label>
      <label className="flex items-start gap-2 text-xs text-text-secondary">
        <input type="radio" name={`trip-visibility-${tripId}`} checked={visibility === 'public'} onChange={() => setVisibility('public')} />
        Публично: страницу смогут открыть все, у кого есть URL; поисковики могут её индексировать
      </label>
      <label className="flex items-start gap-2 rounded-lg bg-surface p-3 text-xs leading-relaxed text-text-secondary">
        <input type="checkbox" checked={consent} disabled={!sameStampSelection} onChange={(event) => setConsent(event.target.checked)} />
        Я проверил(а) предпросмотр выше и согласен(на) опубликовать показанные данные. Внешние HTTPS-фото останутся на исходных сайтах.
      </label>
      <button type="button" disabled={busy || !consent || !sameStampSelection} onClick={() => void publish()} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
        {busy ? 'Сохраняю…' : url ? 'Обновить после согласия' : 'Опубликовать snapshot'}
      </button>
      {url && editing && <button type="button" disabled={busy} onClick={() => { setEditing(false); setConsent(false) }} className="ml-2 rounded-lg border border-border px-3 py-2 text-xs text-text disabled:opacity-50">
        Отмена
      </button>}
    </>}
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </section>
}

function DraftSnapshotPreview({
  snapshot,
  persisted,
}: {
  snapshot: NonNullable<TripMiniSiteState['preview_snapshot']>
  persisted: boolean
}) {
  const photos = [...new Set([snapshot.cover, ...snapshot.photos, ...snapshot.points.flatMap((point) => point.photos ?? [])].filter((url): url is string => Boolean(url)))]
  return <details open className="rounded-lg border border-border bg-surface p-3 text-xs text-text-secondary">
    <summary className="cursor-pointer font-medium text-text">
      {persisted ? 'Приватный черновик — предпросмотр данных' : 'Предпросмотр данных перед публикацией'}
    </summary>
    <div aria-label="Предпросмотр мини-сайта" className="mt-3 space-y-3">
      <div>
        <h3 className="font-semibold text-text">{snapshot.title}</h3>
        <p>{snapshot.start_date} — {snapshot.end_date}</p>
        {snapshot.summary && <p className="mt-1 whitespace-pre-wrap">{snapshot.summary}</p>}
      </div>
      <p>Статистика: {snapshot.stats.days} дн. · {snapshot.stats.places_visited} мест · {snapshot.stats.distance_km.toLocaleString('ru-RU')} км</p>
      <div>
        <h4 className="font-medium text-text">Точки маршрута ({snapshot.points.length})</h4>
        {snapshot.points.length ? <ol className="mt-1 list-decimal space-y-2 pl-5">
          {snapshot.points.map((point, index) => <li key={`${point.latitude},${point.longitude},${index}`}>
            <p>{point.name || 'Точка маршрута'} · {point.latitude}, {point.longitude}</p>
            {point.note && <p className="whitespace-pre-wrap">{point.note}</p>}
          </li>)}
        </ol> : <p>Точек маршрута нет.</p>}
      </div>
      {(snapshot.game_stamps?.length ?? 0) > 0 && <div>
        <h4 className="font-medium text-text">Игровые отметки ({snapshot.game_stamps?.length})</h4>
        <ul className="mt-1 space-y-2">{snapshot.game_stamps?.map((stamp) => <li key={stamp.key}>
          <p>{stamp.title} · {new Date(stamp.earned_at).toLocaleDateString('ru-RU')}</p>
          <p className="whitespace-pre-wrap">{stamp.fact}</p>
          {stamp.source_url && <a href={stamp.source_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{stamp.source_label || 'Источник'}</a>}
        </li>)}</ul>
      </div>}
      <div>
        <h4 className="font-medium text-text">Фото ({photos.length})</h4>
        {photos.length ? <ul className="mt-1 space-y-1">
          {photos.map((url) => <li key={url} className="break-all">
            <a href={url} target="_blank" rel="noreferrer" className="text-primary underline">{url}</a>
          </li>)}
        </ul> : <p>Фото нет.</p>}
        <p className="mt-1">Ссылки открываются только по нажатию; предпросмотр не загружает изображения с внешних сайтов.</p>
      </div>
      {persisted && <p className="font-medium text-text">Черновик виден только вам. Публичной страницы пока нет.</p>}
    </div>
  </details>
}
