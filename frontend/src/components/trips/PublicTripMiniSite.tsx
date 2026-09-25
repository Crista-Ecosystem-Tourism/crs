import { useEffect, useState } from 'react'
import { CalendarDays, MapPin, Route } from 'lucide-react'
import { ApiError } from '@/api/chatApi'
import { fetchPublicTripMiniSite, type PublicTripMiniSite } from '@/api/suitcaseApi'
import { SuitcaseJourneyMap, type JourneyMarker } from '@/components/suitcase/SuitcaseJourneyMap'

function setHeadAttribute(selector: string, tagName: 'meta' | 'link', key: 'content' | 'href', value: string | null, attributes: Record<string, string>) {
  const existing = document.head.querySelector<HTMLElement>(selector)
  const previousValue = existing?.getAttribute(key) ?? null
  const nextSibling = existing?.nextSibling ?? null

  if (value === null) {
    existing?.remove()
  } else {
    const element = existing ?? document.createElement(tagName)
    for (const [name, attributeValue] of Object.entries(attributes)) element.setAttribute(name, attributeValue)
    element.setAttribute(key, value)
    if (!existing) document.head.appendChild(element)
  }

  return () => {
    if (existing) {
      if (previousValue === null) existing.removeAttribute(key)
      else existing.setAttribute(key, previousValue)
      if (!existing.parentNode) document.head.insertBefore(existing, nextSibling?.parentNode === document.head ? nextSibling : null)
    } else {
      document.head.querySelector(selector)?.remove()
    }
  }
}

export function PublicTripMiniSite({ slug }: { slug: string }) {
  const [page, setPage] = useState<PublicTripMiniSite | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    setPage(null)
    setError('')
    fetchPublicTripMiniSite(slug)
      .then((result) => { if (active) setPage(result) })
      .catch((reason: unknown) => {
        if (!active) return
        const status = reason instanceof ApiError
          ? reason.status
          : (typeof reason === 'object' && reason !== null && 'status' in reason ? reason.status : undefined)
        setError(status === 404
          ? 'Эта страница не найдена: владелец мог отозвать доступ.'
          : 'Не удалось загрузить страницу поездки.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [slug])

  useEffect(() => {
    if (!page) return
    const previousTitle = document.title
    const title = `${page.snapshot.title} — Crista`
    const description = (page.snapshot.summary.trim() || `Маршрут поездки: ${page.snapshot.city}, ${page.snapshot.country}.`)
      .replace(/\s+/g, ' ')
      .slice(0, 240)
    const canonicalUrl = page.visibility === 'public'
      ? `${window.location.origin}${window.location.pathname}`
      : null
    document.title = title
    const restore = [
      setHeadAttribute('meta[name="description"]', 'meta', 'content', description, { name: 'description' }),
      setHeadAttribute('meta[name="robots"]', 'meta', 'content', page.visibility === 'link' ? 'noindex, nofollow' : null, { name: 'robots' }),
      setHeadAttribute('link[rel="canonical"]', 'link', 'href', canonicalUrl, { rel: 'canonical' }),
      setHeadAttribute('meta[property="og:title"]', 'meta', 'content', title, { property: 'og:title' }),
      setHeadAttribute('meta[property="og:description"]', 'meta', 'content', description, { property: 'og:description' }),
      setHeadAttribute('meta[property="og:url"]', 'meta', 'content', canonicalUrl, { property: 'og:url' }),
      setHeadAttribute('meta[property="og:image"]', 'meta', 'content', page.snapshot.cover, { property: 'og:image' }),
      setHeadAttribute('meta[name="twitter:title"]', 'meta', 'content', title, { name: 'twitter:title' }),
      setHeadAttribute('meta[name="twitter:description"]', 'meta', 'content', description, { name: 'twitter:description' }),
      setHeadAttribute('meta[name="twitter:image"]', 'meta', 'content', page.snapshot.cover, { name: 'twitter:image' }),
      setHeadAttribute('meta[name="twitter:card"]', 'meta', 'content', page.snapshot.cover ? 'summary_large_image' : 'summary', { name: 'twitter:card' }),
    ]
    return () => {
      document.title = previousTitle
      restore.reverse().forEach((restoreAttribute) => restoreAttribute())
    }
  }, [page])

  if (loading) return <main className="min-h-screen bg-background p-8 text-center text-text-secondary">Загружаю поездку…</main>
  if (error || !page) return <main className="min-h-screen bg-background p-8 text-center text-text-secondary"><h1 className="text-xl font-semibold text-text">Мини-сайт поездки</h1><p className="mt-3">{error || 'Страница недоступна.'}</p></main>

  const { snapshot } = page
  const markers: JourneyMarker[] = snapshot.points.map((point, index) => ({
    id: `${index}`,
    title: point.name || `Точка ${index + 1}`,
    subtitle: point.note || snapshot.city,
    lat: point.latitude,
    lng: point.longitude,
  }))
  const dates = `${snapshot.start_date.slice(0, 10)} — ${snapshot.end_date.slice(0, 10)}`

  return <main className="min-h-screen bg-background px-4 py-8 text-text sm:px-8">
    <article className="mx-auto max-w-4xl space-y-7">
      <header>
        {snapshot.cover && <img src={snapshot.cover} alt={snapshot.title} className="mb-6 max-h-[28rem] w-full rounded-2xl object-cover" />}
        <p className="flex items-center gap-2 text-sm text-text-secondary"><MapPin className="h-4 w-4" />{snapshot.city}, {snapshot.country}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-5xl">{snapshot.title}</h1>
        <p className="mt-3 text-sm text-text-secondary">{snapshot.summary}</p>
        <p className="mt-3 flex items-center gap-2 text-sm text-text-muted"><CalendarDays className="h-4 w-4" />{dates}</p>
      </header>

      <section aria-label="Статистика поездки" className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-surface-light p-4 text-center">
        <div><p className="font-semibold tabular-nums">{snapshot.stats.days}</p><p className="text-xs text-text-muted">дней</p></div>
        <div><p className="font-semibold tabular-nums">{snapshot.stats.places_visited}</p><p className="text-xs text-text-muted">мест</p></div>
        <div className="flex flex-col items-center"><p className="flex items-center gap-1 font-semibold tabular-nums"><Route className="h-4 w-4" />{snapshot.stats.distance_km} км</p><p className="text-xs text-text-muted">по прямой между точками</p></div>
      </section>

      {markers.length > 0 && <section aria-label="Карта поездки" className="space-y-3">
        <h2 className="text-xl font-semibold">Маршрут</h2>
        <SuitcaseJourneyMap markers={markers} className="h-80" />
        <ol className="space-y-2">{snapshot.points.map((point, index) => <li key={`${index}-${point.name || ''}`} className="rounded-xl border border-border bg-surface-light p-3">
          <p className="font-medium">{point.name || `Точка ${index + 1}`}</p>
          {point.note && <p className="mt-1 text-sm text-text-secondary">{point.note}</p>}
          {point.photos && point.photos.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2">{point.photos.map((photo, photoIndex) => <img key={`${photo}-${photoIndex}`} src={photo} alt={`${point.name || `Точка ${index + 1}`}, фото ${photoIndex + 1}`} loading="lazy" className="max-h-56 w-full rounded-lg object-cover" />)}</div>}
        </li>)}</ol>
      </section>}

      {snapshot.photos.length > 0 && <section className="space-y-3">
        <h2 className="text-xl font-semibold">Фотографии</h2>
        <div className="grid gap-3 sm:grid-cols-2">{snapshot.photos.map((photo, index) => <img key={`${photo}-${index}`} src={photo} alt={`Фото поездки ${index + 1}`} loading="lazy" className="max-h-96 w-full rounded-xl object-cover" />)}</div>
      </section>}
      {(snapshot.game_stamps?.length ?? 0) > 0 && <section aria-label="Игровые отметки" className="space-y-3">
        <h2 className="text-xl font-semibold">Игровые отметки</h2>
        <ul className="space-y-3">{snapshot.game_stamps?.map((stamp) => <li key={stamp.key} className="rounded-xl border border-border bg-surface-light p-4">
          <p className="font-medium">{stamp.title}</p>
          <p className="mt-1 text-xs text-text-muted">Получено {new Date(stamp.earned_at).toLocaleDateString('ru-RU')}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{stamp.fact}</p>
          {stamp.source_url && <a href={stamp.source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-primary underline">{stamp.source_label || 'Источник факта'}</a>}
        </li>)}</ul>
      </section>}
      <footer className="border-t border-border pt-4 text-xs text-text-muted">Опубликовано владельцем поездки через Crista.</footer>
    </article>
  </main>
}
