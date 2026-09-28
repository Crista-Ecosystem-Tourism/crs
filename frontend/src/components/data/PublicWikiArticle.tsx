import { useEffect, useMemo, useState } from 'react'
import { BookOpenCheck, Globe } from 'lucide-react'
import { ApiError } from '@/api/chatApi'
import { getWikiArticle, type WikiPublishedArticle } from '@/api/wikiApi'

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

function articleText(body: Record<string, unknown>): string[] {
  return Object.values(body)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim())
}

export function PublicWikiArticle({ slug }: { slug: string }) {
  const [article, setArticle] = useState<WikiPublishedArticle | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const language = typeof navigator !== 'undefined' && navigator.language.startsWith('en') ? 'en' : 'ru'
  const paragraphs = useMemo(() => article ? articleText(article.body) : [], [article])

  useEffect(() => {
    let active = true
    setArticle(null)
    setError('')
    setLoading(true)
    getWikiArticle(slug, language)
      .then((result) => { if (active) setArticle(result) })
      .catch((reason: unknown) => {
        if (!active) return
        const status = reason instanceof ApiError
          ? reason.status
          : (typeof reason === 'object' && reason !== null && 'status' in reason ? reason.status : undefined)
        setError(status === 404 ? 'Эта статья не опубликована или больше недоступна.' : 'Не удалось загрузить статью.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [language, slug])

  useEffect(() => {
    if (!article) return
    const previousTitle = document.title
    const title = `${article.title} — Crista Wiki`
    const description = (paragraphs[0] || `Опубликованная статья Crista Wiki: ${article.title}.`).replace(/\s+/g, ' ').slice(0, 240)
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
  }, [article, paragraphs])

  if (loading) return <main className="min-h-screen bg-background p-8 text-center text-text-secondary">Загружаю статью…</main>
  if (error || !article) return <main className="min-h-screen bg-background p-8 text-center text-text-secondary"><h1 className="text-xl font-semibold text-text">Crista Wiki</h1><p className="mt-3">{error || 'Страница недоступна.'}</p></main>

  return <main className="min-h-screen bg-background px-4 py-8 text-text sm:px-8">
    <article className="mx-auto max-w-3xl space-y-7">
      <header>
        <p className="flex items-center gap-2 text-sm text-text-secondary"><Globe className="h-4 w-4" />Crista Wiki · опубликованная версия</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-5xl">{article.title}</h1>
        {article.content_language === 'en' && <p className="mt-3 text-sm text-text-secondary">English edition</p>}
      </header>

      {paragraphs.length > 0 && <section className="space-y-4" aria-label="Содержание статьи">
        {paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`} className="max-w-[68ch] font-sans leading-7 text-text-secondary">{paragraph}</p>)}
      </section>}

      <section aria-label="Источники статьи" className="rounded-2xl border border-border bg-surface-light p-4">
        <h2 className="font-semibold">Источники и права</h2>
        <p className="mt-1 text-xs text-text-muted">Лицензия статьи: {article.license}</p>
        <ul className="mt-4 space-y-3">{article.sources.map((source, index) => <li key={`${source.url}-${index}`}>
          <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"><BookOpenCheck className="h-4 w-4" />{source.label}</a>
          {(source.source_kind || source.rights_basis) && <p className="mt-1 text-xs text-text-muted">{source.source_kind || 'source'} · {source.rights_basis || 'rights pending'}</p>}
          {source.rights_url && <a href={source.rights_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-primary hover:underline">Условия использования источника</a>}
        </li>)}</ul>
      </section>

      <footer className="border-t border-border pt-4 text-xs text-text-muted">Версия {article.version_id}{article.published_at ? ` · опубликовано ${new Date(article.published_at).toLocaleDateString('ru-RU')}` : ''}</footer>
    </article>
  </main>
}
