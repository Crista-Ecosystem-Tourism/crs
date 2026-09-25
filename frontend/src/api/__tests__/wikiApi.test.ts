import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getWikiArticle } from '../wikiApi'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
  mockFetch.mockResolvedValue(new Response('{}', { status: 200 }))
})

describe('Wiki article language API', () => {
  it('requests the selected article edition', async () => {
    await getWikiArticle('country-jp', 'en')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/wiki\/articles\/country-jp\?language=en$/),
    )
  })

  it('defaults to Russian for existing callers', async () => {
    await getWikiArticle('country-jp')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/wiki\/articles\/country-jp\?language=ru$/),
    )
  })
})
