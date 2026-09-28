import { useEffect, useState } from 'react'
import { MapPin, Route } from 'lucide-react'
import { ApiError } from '@/api/chatApi'
import { getPublishedStarRoute, type PublishedStarRoute } from '@/api/starRouteApi'

function timecode(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

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

export function PublicStarRoute({ routeId }: { routeId: string }) {
  const [route, setRoute] = useState<PublishedStarRoute | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setRoute(null)
    setError('')
    setLoading(true)
    getPublishedStarRoute(routeId)
      .then((result) => { if (active) setRoute(result) })
      .catch((reason: unknown) => {
        if (!active) return
        const status = reason instanceof ApiError
          ? reason.status
          : (typeof reason === 'object' && reason !== null && 'status' in reason ? reason.status : undefined)
        setError(status === 404 ? 'Этот редакционный маршрут не опубликован или больше недоступен.' : 'Не удалось загрузить маршрут.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [routeId])

  useEffect(() => {
    if (!route) return
    const previousTitle = document.title
    const title = `${route.title} — Crista`
    const points = route.pois.map((poi) => poi.name).join(', ')
    const description = `Маршрут по ${route.destination}: ${points}. Редакционно опубликованный маршрут Crista.`.slice(0, 240)
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`
    document.title = title
    const restore = [
      setHeadAttribute('meta[name="description"]', 'meta', 'content', description, { name: 'description' }),
      setHeadAttribute('meta[name="robots"]', 'meta', 'content', null, { name: 'robots' }),
      setHeadAttribute('link[rel="canonical"]', 'link', 'href', canonicalUrl, { rel: 'canonical' }),
      setHeadAttribute('meta[property="og:title"]', 'meta', 'content', title, { property: 'og:title' }),
      setHeadAttribute('meta[property="og:description"]', 'meta', 'content', description, { property: 'og:description' }),
      setHeadAttribute('meta[property="og:url"]', 'meta', 'content', canonicalUrl, { property: 'og:url' }),
      setHeadAttribute('meta[name="twitter:title"]', 'meta', 'content', title, { name: 'twitter:title' }),
      setHeadAttribute('meta[name="twitter:description"]', 'meta', 'content', description, { name: 'twitter:description' }),
      setHeadAttribute('meta[name="twitter:card"]', 'meta', 'content', 'summary', { name: 'twitter:card' }),
    ]
    return () => {
      document.title = previousTitle
      restore.reverse().forEach((restoreAttribute) => restoreAttribute())
    }
  }, [route])

  useEffect(() => {
    if (!error) return
    return setHeadAttribute('meta[name="robots"]', 'meta', 'content', 'noindex, nofollow', { name: 'robots' })
  }, [error])

  if (loading) return <main className="min-h-screen bg-background p-8 text-center text-text-secondary">Загружаю маршрут…</main>
  if (error || !route) return <main className="min-h-screen bg-background p-8 text-center text-text-secondary"><h1 className="text-xl font-semibold text-text">Звёздный маршрут</h1><p className="mt-3">{error || 'Страница недоступна.'}</p></main>

  return <main className="min-h-screen bg-background px-4 py-8 text-text sm:px-8">
    <article className="mx-auto max-w-3xl space-y-7">
      <header>
        <p className="flex items-center gap-2 text-sm text-text-secondary"><MapPin className="h-4 w-4" />{route.destination}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-5xl">{route.title}</h1>
        <p className="mt-4 text-sm text-text-secondary">Редакционно опубликованный маршрут по источнику с подтверждённым основанием прав.</p>
      </header>

      <section aria-label="Источник маршрута" className="rounded-2xl border border-border bg-surface-light p-4">
        <h2 className="font-semibold">Источник</h2>
        <a href={route.source_url} target="_blank" rel="noreferrer" className="mt-2 block text-sm text-primary hover:underline">{route.source_title}{route.source_author ? ` · ${route.source_author}` : ''}</a>
        <p className="mt-2 text-xs text-text-muted">Основание прав: {route.rights_basis}</p>
      </section>

      <section aria-label="Точки маршрута" className="space-y-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold"><Route className="h-5 w-5" />Точки маршрута</h2>
        <ol className="space-y-3">{route.pois.map((poi) => <li key={poi.segment_id} className="rounded-xl border border-border bg-surface-light p-4">
          <p className="font-semibold">{poi.position}. {poi.name}</p>
          <p className="mt-1 text-sm text-text-secondary">{poi.timecode.excerpt}</p>
          <a href={`${route.source_url}#t=${poi.timecode.start_seconds}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-primary hover:underline">
            {timecode(poi.timecode.start_seconds)}–{timecode(poi.timecode.end_seconds)} · открыть таймкод
          </a>
          <a href={poi.source_url} target="_blank" rel="noreferrer" className="ml-3 inline-block text-xs text-primary hover:underline">Источник POI</a>
        </li>)}</ol>
      </section>

      <footer className="border-t border-border pt-4 text-xs text-text-muted">Опубликовано редакцией Crista.</footer>
    </article>
  </main>
}
