import { useCallback, useEffect, useState } from 'react'
import type { ArticleBlock } from '@/types/wiki'

export interface WikiPractical {
  label: string
  value: string
}

/** Правка статьи, внесённая пользователем. Пустые поля означают «не менял». */
export interface WikiDraft {
  countryId: string
  summary: string
  history: string
  cuisine: string
  traditions: string
  practical: WikiPractical[]
  /** Дополнительные блоки статьи: фото, видео, врезки */
  blocks: ArticleBlock[]
  /** Правки уходят в очередь модерации, а не в статью напрямую */
  status: 'pending' | 'published'
  updatedAt: string
  author: string
}

const STORAGE_KEY = 'crista-wiki-drafts'

function readStored(): Record<string, WikiDraft> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, WikiDraft>) : {}
  } catch {
    return {}
  }
}

/**
 * Пользовательские правки Wiki. Бэкенда нет, поэтому черновики живут
 * в localStorage и повторяют путь из продуктового документа:
 * правка отправляется на модерацию и до решения показывается автору.
 */
export function useWikiDrafts() {
  const [drafts, setDrafts] = useState<Record<string, WikiDraft>>(() => readStored())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
    } catch {
      // приватный режим: правки не переживут перезагрузку
    }
  }, [drafts])

  const getDraft = useCallback((countryId: string) => drafts[countryId], [drafts])

  const saveDraft = useCallback(
    (draft: Omit<WikiDraft, 'status' | 'updatedAt'>) => {
      setDrafts((prev) => ({
        ...prev,
        [draft.countryId]: {
          ...draft,
          status: 'pending',
          updatedAt: new Date().toISOString(),
        },
      }))
    },
    []
  )

  const discardDraft = useCallback((countryId: string) => {
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[countryId]
      return next
    })
  }, [])

  const pendingCount = Object.values(drafts).filter((d) => d.status === 'pending').length

  return { getDraft, saveDraft, discardDraft, pendingCount }
}
