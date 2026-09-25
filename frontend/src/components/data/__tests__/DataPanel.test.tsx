import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DataPanel } from '../DataPanel'

const { getWikiArticleMock, useAppMock } = vi.hoisted(() => ({ getWikiArticleMock: vi.fn(), useAppMock: vi.fn() }))
const { ApiErrorMock } = vi.hoisted(() => ({ ApiErrorMock: class ApiError extends Error { status: number; detail: string; constructor(status: number, detail: string) { super(detail); this.status = status; this.detail = detail } } }))

vi.mock('@/api/chatApi', () => ({ ApiError: ApiErrorMock }))

vi.mock('@/api/wikiApi', () => ({
  getWikiArticle: getWikiArticleMock,
  getMyWikiDrafts: vi.fn(async () => []),
  getWikiReviewQueue: vi.fn(async () => []),
  createWikiDraft: vi.fn(),
  submitWikiDraft: vi.fn(),
  publishWikiDraft: vi.fn(),
}))

vi.mock('@/context/AppContext', () => ({
  useApp: useAppMock,
}))

vi.mock('../CountryCarousel', () => ({
  CountryCarousel: ({ items, onOpen }: {
    items: Array<{ id: string; name: string }>
    onOpen: (id: string) => void
  }) => <div>{items.map((item) => (
    <button key={item.id} type="button" onClick={() => onOpen(item.id)}>{item.name}</button>
  ))}</div>,
}))

const japanArticle = {
  version_id: 'wiki-country-jp-v1',
  slug: 'country-jp',
  title: 'Япония',
  body: {
    summary: 'Опубликованная серверная карточка Японии.',
    history: 'История из Wiki.',
    cuisine: 'Washoku из Wiki.',
    traditions: 'Обычаи из Wiki.',
    practical: [{ label: 'Валюта', value: 'Японская иена (JPY, ¥)' }],
  },
  sources: [{ label: 'Официальный источник', url: 'https://example.test/japan' }],
  license: 'CC BY 4.0',
  published_at: '2026-09-24T00:00:00Z',
}

const georgiaArticle = {
  ...japanArticle,
  version_id: 'wiki-country-ge-v1',
  slug: 'country-ge',
  title: 'Грузия',
  body: { ...japanArticle.body, summary: 'Опубликованная серверная карточка Грузии.' },
  sources: [{ label: 'ЮНЕСКО: квеври', url: 'https://ich.unesco.org/en/decisions/8.COM/8.13' }],
}

const russiaArticle = {
  ...japanArticle,
  version_id: 'wiki-country-ru-v1',
  slug: 'country-ru',
  title: 'Россия',
  body: { ...japanArticle.body, summary: 'Опубликованная серверная карточка России.' },
  sources: [{ label: 'МЧС России: 112', url: 'https://mchs.gov.ru/deyatelnost/bezopasnost-grazhdan/kak-pravilno-vyzvat-skoruyu_5' }],
}

describe('DataPanel country Wiki publication state', () => {
  beforeEach(() => {
    getWikiArticleMock.mockReset()
    getWikiArticleMock.mockRejectedValue(new Error('offline'))
    useAppMock.mockReset()
    useAppMock.mockReturnValue({ user: null, language: 'ru' })
  })

  it('shows version and sources for a published country article', async () => {
    getWikiArticleMock.mockImplementation(async (slug: string) => {
      if (slug === 'country-jp') return japanArticle
      throw new Error('not published')
    })

    render(<DataPanel onBack={() => undefined} />)
    fireEvent.click(screen.getByRole('button', { name: 'Япония' }))

    expect(await screen.findByText('Опубликованная серверная карточка Японии.')).toBeTruthy()
    expect(screen.getByText(/версия wiki-country-jp-v1/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Официальный источник/ }).getAttribute('href')).toBe('https://example.test/japan')
  })

  it('loads the published Georgia card using its country slug', async () => {
    getWikiArticleMock.mockImplementation(async (slug: string) => {
      if (slug === 'country-ge') return georgiaArticle
      throw new Error('not published')
    })

    render(<DataPanel onBack={() => undefined} />)
    fireEvent.click(screen.getByRole('button', { name: 'Грузия' }))

    expect(await screen.findByText('Опубликованная серверная карточка Грузии.')).toBeTruthy()
    expect(screen.getByText(/версия wiki-country-ge-v1/)).toBeTruthy()
  })

  it('loads the published Russia card using its country slug', async () => {
    getWikiArticleMock.mockImplementation(async (slug: string) => {
      if (slug === 'country-ru') return russiaArticle
      throw new Error('not published')
    })

    render(<DataPanel onBack={() => undefined} />)
    fireEvent.click(screen.getByRole('button', { name: 'Россия' }))

    expect(await screen.findByText('Опубликованная серверная карточка России.')).toBeTruthy()
    expect(screen.getByText(/версия wiki-country-ru-v1/)).toBeTruthy()
  })

  it('does not present the fallback country copy as a published article when Wiki is unavailable', async () => {
    render(<DataPanel onBack={() => undefined} />)
    fireEvent.click(screen.getByRole('button', { name: 'Япония' }))

    await waitFor(() => expect(screen.getByText(/Серверная Wiki недоступна/)).toBeTruthy())
    expect(screen.queryByText(/опубликованная серверная версия/)).toBeNull()
  })

  it('distinguishes an unpublished country article from a server outage', async () => {
    getWikiArticleMock.mockRejectedValue(new ApiErrorMock(404, 'Published article not found'))

    render(<DataPanel onBack={() => undefined} />)
    fireEvent.click(screen.getByRole('button', { name: 'Япония' }))

    expect(await screen.findByText(/Для этой страны ещё нет опубликованной серверной версии/)).toBeTruthy()
    expect(screen.queryByText(/Серверная Wiki недоступна/)).toBeNull()
  })

  it('does not fill missing sections of a published version with catalogue copy', async () => {
    getWikiArticleMock.mockResolvedValue({
      ...japanArticle,
      body: { summary: 'Краткое опубликованное описание.' },
    })

    render(<DataPanel onBack={() => undefined} />)
    fireEvent.click(screen.getByRole('button', { name: 'Япония' }))

    expect(await screen.findByText('Краткое опубликованное описание.')).toBeTruthy()
    expect(screen.getByText('В опубликованной версии этот раздел пока не заполнен.')).toBeTruthy()
    expect(screen.queryByText('Эпоха самураев и сёгунов, реставрация Мэйдзи, стремительная модернизация после Второй мировой войны.')).toBeNull()
    expect(screen.getByText('Практическая информация в опубликованной версии пока не указана.')).toBeTruthy()
  })

  it('requests and renders the English edition of a country article', async () => {
    useAppMock.mockReturnValue({ user: null, language: 'en' })
    getWikiArticleMock.mockImplementation(async (slug: string, language: string) => {
      if (slug === 'country-jp' && language === 'en') return {
        ...japanArticle,
        title: 'Japan',
        content_language: 'en',
        body: {
          ...japanArticle.body,
          summary: 'An English-published overview of Japan.',
          history: 'Japan’s English history section.',
        },
      }
      throw new Error('not published')
    })

    render(<DataPanel onBack={() => undefined} />)
    fireEvent.click(screen.getByRole('button', { name: 'Japan' }))

    expect(await screen.findByText('An English-published overview of Japan.')).toBeTruthy()
    expect(screen.getByText('Japan’s English history section.')).toBeTruthy()
    expect(getWikiArticleMock).toHaveBeenCalledWith('country-jp', 'en')
    expect(screen.queryByText(/English edition is not available yet/)).toBeNull()
  })

  it('localizes the English Wiki catalogue and unpublished status', async () => {
    useAppMock.mockReturnValue({ user: null, language: 'en' })
    getWikiArticleMock.mockRejectedValue(new ApiErrorMock(404, 'Published article not found'))

    render(<DataPanel onBack={() => undefined} />)
    expect(screen.getByText(/A guide to countries/)).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Search countries' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Japan' }))

    expect(await screen.findByText(/No server-published edition exists for this country yet/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Edit or add information' }).getAttribute('disabled')).not.toBeNull()
  })

  it('discloses a Russian country article when English content falls back', async () => {
    useAppMock.mockReturnValue({ user: null, language: 'en' })
    getWikiArticleMock.mockResolvedValue({ ...japanArticle, content_language: 'ru' })

    render(<DataPanel onBack={() => undefined} />)
    fireEvent.click(screen.getByRole('button', { name: 'Japan' }))

    expect(await screen.findByText(/English edition is not available yet/)).toBeTruthy()
    expect(screen.getByText('Опубликованная серверная карточка Японии.')).toBeTruthy()
  })
})
