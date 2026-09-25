import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MoscowSandbox } from '../MoscowSandbox'

const { getMoscowSandboxMock, getWikiArticleVersionMock, useAppMock } = vi.hoisted(() => ({
  getMoscowSandboxMock: vi.fn(),
  getWikiArticleVersionMock: vi.fn(),
  useAppMock: vi.fn(),
}))

vi.mock('@/api/gameApi', () => ({
  getMoscowSandbox: getMoscowSandboxMock,
  answerMoscowMatching: vi.fn(),
  answerMoscowTimeline: vi.fn(),
  answerMoscowTruthMyth: vi.fn(),
  answerMoscowWordBlocks: vi.fn(),
  answerMoscowPriceSlider: vi.fn(),
  answerMoscowPhotoScanner: vi.fn(),
  restoreMoscowEnergy: vi.fn(),
}))
vi.mock('@/context/AppContext', () => ({ useApp: useAppMock }))

vi.mock('@/api/wikiApi', () => ({
  getWikiArticleVersion: getWikiArticleVersionMock,
  getWikiArticle: vi.fn(),
}))

describe('MoscowSandbox lesson Wiki references', () => {
  beforeEach(() => {
    getMoscowSandboxMock.mockReset()
    getWikiArticleVersionMock.mockReset()
    useAppMock.mockReset()
    useAppMock.mockReturnValue({ language: 'ru' })
    getMoscowSandboxMock.mockResolvedValue({
      city: { id: 'moscow', name: 'Москва' },
      profile: { xp: 100, energy: 5, streak: 1 },
      city_stamp: { key: 'moscow-city-explorer', title: 'Штамп Москвы', earned_at: '2026-09-24' },
      lessons: [{
        id: 'red-square', position: 1, title: 'Красная площадь',
        fact: { text: 'Факт', source_url: 'https://example.test/fact', source_label: 'Первоисточник' },
        question: { id: 'q1', text: 'Вопрос?', options: [{ id: 'a', label: 'Ответ' }] },
        explanation: 'Объяснение',
        wiki_reference: { slug: 'moscow', version_id: 'wiki-moscow-v1' },
      }],
      drill: { title: 'Правда или миф', intro: 'Инструкция на русском', statements: [{ id: 's1', text: 'Русское утверждение' }] }, matching: null, timeline: null, word_blocks: null,
      price_slider: null, story: null, photo_scanner: null,
      wiki_reference: { slug: 'moscow', version_id: 'wiki-moscow-v1' },
      practice_recovery: { available: false, used_today: false, amount: 1 },
    })
    getWikiArticleVersionMock.mockResolvedValue({
      version_id: 'wiki-moscow-v1', slug: 'moscow', title: 'Москва',
      body: { summary: 'Контекст Москвы.' }, sources: [], license: 'CC BY 4.0', published_at: null,
    })
  })

  it('links a lesson to the same published city-version shown in the Wiki card', async () => {
    render(<MoscowSandbox signedIn refreshKey={0} />)
    const lesson = await screen.findByText(/1\. Красная площадь/)
    expect(lesson).toBeTruthy()
    const referenceLink = screen.getByRole('link', { name: /Общий контекст города · Wiki wiki-moscow-v1/ })
    expect(referenceLink.getAttribute('href')).toBe('#moscow-wiki-article')
    expect(await screen.findByText('Контекст Москвы.')).toBeTruthy()
  })

  it('localizes sandbox controls and discloses the Russian Wiki while content falls back', async () => {
    useAppMock.mockReturnValue({ language: 'en' })
    render(<MoscowSandbox signedIn refreshKey={0} />)

    expect(await screen.findByText('Moscow sandbox')).toBeTruthy()
    expect(screen.getByText(/The Moscow Wiki article is currently in Russian/)).toBeTruthy()
    expect(screen.getByRole('region', { name: 'True or myth exercise' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '← Myth' })).toBeTruthy()
    expect(screen.getByText('Русское утверждение')).toBeTruthy()
    expect(getMoscowSandboxMock).toHaveBeenCalledWith('en')
  })

  it('shows English story and lesson review while disclosing the Russian Wiki', async () => {
    useAppMock.mockReturnValue({ language: 'en' })
    getMoscowSandboxMock.mockResolvedValueOnce({
      city: { id: 'moscow', name: 'Moscow' },
      content_language: 'en', lesson_content_language: 'en',
      activity_content_language: 'en', wiki_content_language: 'ru',
      profile: { xp: 100, energy: 5, streak: 1 },
      city_stamp: { key: 'moscow-city-explorer', title: 'Штамп Москвы', earned_at: '2026-09-24' },
      lessons: [{
      id: 'moscow-red-square', position: 1, title: 'Red Square',
        fact: { text: 'In older Russian, krasny meant beautiful.', source_url: 'https://example.test/fact', source_label: 'Moscow City Government' },
        question: { id: 'red-square-name', text: 'What did krasny mean?', options: [{ id: 'beautiful', label: 'Beautiful' }] },
        explanation: 'In older Russian, krasny meant beautiful.',
        wiki_reference: { slug: 'moscow', version_id: 'wiki-moscow-v1' },
      }],
      drill: { title: 'True or Myth', intro: 'English instruction', statements: [{ id: 's1', text: 'An English statement' }] },
      matching: null, timeline: null, word_blocks: null, price_slider: null,
      story: {
        title: 'Story: Red Square', eyebrow: 'Story · 1 of 1', image_url: '/story.png',
        image_alt: 'Illustration of Red Square', media_credit: 'Original Crista illustration',
        fact: 'A unique English story-card fact.', source_label: 'Moscow City Government',
        source_url: 'https://example.test/story', note: 'Check the primary source.',
      },
      photo_scanner: null, wiki_reference: { slug: 'moscow', version_id: 'wiki-moscow-v1' },
      practice_recovery: { available: false, used_today: false, amount: 1 },
    })

    render(<MoscowSandbox signedIn refreshKey={0} />)

    expect(await screen.findByText('Story: Red Square')).toBeTruthy()
    expect(screen.getByText('A unique English story-card fact.')).toBeTruthy()
    expect(screen.getByText(/The Moscow Wiki article is currently in Russian/)).toBeTruthy()
    expect(screen.getByText('English instruction')).toBeTruthy()
    expect(getMoscowSandboxMock).toHaveBeenCalledWith('en')
  })

  it('renders the published English Moscow Wiki edition and its translated sections', async () => {
    useAppMock.mockReturnValue({ language: 'en' })
    getMoscowSandboxMock.mockResolvedValueOnce({
      city: { id: 'moscow', name: 'Moscow' },
      content_language: 'en', lesson_content_language: 'en',
      activity_content_language: 'en', wiki_content_language: 'en',
      profile: { xp: 100, energy: 5, streak: 1 },
      city_stamp: { key: 'moscow-city-explorer', title: 'Moscow stamp', earned_at: '2026-09-24' },
      lessons: [], drill: null, matching: null, timeline: null, word_blocks: null,
      price_slider: null, story: null, photo_scanner: null,
      wiki_reference: { slug: 'moscow-en', version_id: 'wiki-moscow-en-v1' },
      practice_recovery: { available: false, used_today: false, amount: 1 },
    })
    getWikiArticleVersionMock.mockResolvedValueOnce({
      version_id: 'wiki-moscow-en-v1', slug: 'moscow-en', title: 'Moscow',
      body: {
        summary: 'Moscow’s English overview.',
        sections: [{ title: 'The Kremlin and Red Square', text: 'The historic heart of the city.' }],
      },
      sources: [{ label: 'Official website of the Moscow Kremlin', url: 'https://www.kreml.ru/' }],
      license: 'CC BY 4.0', published_at: null,
    })

    render(<MoscowSandbox signedIn refreshKey={0} />)

    expect(await screen.findByText('Moscow’s English overview.')).toBeTruthy()
    expect(screen.getByText('The Kremlin and Red Square')).toBeTruthy()
    expect(screen.getByText('The historic heart of the city.')).toBeTruthy()
    expect(screen.queryByText(/Moscow Wiki article is currently in Russian/)).toBeNull()
    expect(screen.getByRole('link', { name: /Official website of the Moscow Kremlin/ }).getAttribute('href'))
      .toBe('https://www.kreml.ru/')
  })
})
