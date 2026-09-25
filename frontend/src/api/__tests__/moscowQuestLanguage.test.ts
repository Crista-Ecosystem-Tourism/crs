import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  answerMoscowBoss,
  answerMoscowMatching,
  answerMoscowPhotoScanner,
  answerMoscowPriceSlider,
  answerMoscowQuest,
  answerMoscowTimeline,
  answerMoscowTruthMyth,
  answerMoscowWordBlocks,
  getMoscowBoss,
  getMoscowQuest,
  getMoscowSandbox,
  getOnboarding,
} from '../gameApi'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
  localStorage.setItem('auth_token', 'moscow-language-test-token')
  mockFetch.mockResolvedValue(new Response('{}', { status: 200 }))
})

describe('Moscow quest language API', () => {
  it('requests the selected first-trip edition', async () => {
    await getOnboarding('en')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/game\/onboarding\?language=en$/),
      expect.objectContaining({ headers: expect.any(Object) }),
    )
  })

  it('requests the selected lesson edition', async () => {
    await getMoscowQuest('moscow-red-square', 'en')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/game\/paths\/moscow\/quests\/moscow-red-square\?language=en$/),
      expect.objectContaining({ headers: expect.any(Object) }),
    )
  })

  it('submits the answer against the selected edition', async () => {
    await answerMoscowQuest('moscow-red-square', 'beautiful', 'en')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/game\/paths\/moscow\/quests\/moscow-red-square\/answer\?language=en$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ answer_key: 'beautiful' }),
      }),
    )
  })

  it('requests the published boss edition in the selected language', async () => {
    await getMoscowBoss('en')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/game\/paths\/moscow\/boss\?language=en$/),
      expect.objectContaining({ headers: expect.any(Object) }),
    )
  })

  it('sends the selected boss language for localized feedback', async () => {
    await answerMoscowBoss([{ question_id: 'boss-q', answer_key: '1489' }], 'en')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/game\/paths\/moscow\/boss\/answer\?language=en$/),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('requests published sandbox story and lesson editions in the selected language', async () => {
    await getMoscowSandbox('en')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/game\/paths\/moscow\/sandbox\?language=en$/),
      expect.objectContaining({ headers: expect.any(Object) }),
    )
  })

  it('sends the selected locale for feedback from every sandbox exercise', async () => {
    for (let index = 0; index < 6; index += 1) {
      mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }))
    }
    await answerMoscowTruthMyth('statement', 'truth', 'en')
    await answerMoscowMatching([{ pair_id: 'pair', choice_id: 'choice' }], 'en')
    await answerMoscowTimeline(['a', 'b', 'c'], 'en')
    await answerMoscowWordBlocks(['a', 'b', 'c', 'd'], 'en')
    await answerMoscowPriceSlider(50, 'en')
    await answerMoscowPhotoScanner('hotspot', 'en')

    const urls = mockFetch.mock.calls.map(([url]) => String(url))
    expect(urls).toHaveLength(6)
    expect(urls.every((url) => url.endsWith('?language=en'))).toBe(true)
  })
})
