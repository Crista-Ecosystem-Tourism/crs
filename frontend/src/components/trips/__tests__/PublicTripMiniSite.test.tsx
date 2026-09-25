import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fetchPublicTripMiniSite } from '@/api/suitcaseApi'
import { PublicTripMiniSite } from '../PublicTripMiniSite'

vi.mock('@/api/suitcaseApi', () => ({ fetchPublicTripMiniSite: vi.fn() }))
vi.mock('@/components/suitcase/SuitcaseJourneyMap', () => ({
  SuitcaseJourneyMap: () => <div data-testid="public-trip-map" />,
}))

const fetchPage = vi.mocked(fetchPublicTripMiniSite)
const originalTitle = document.title

beforeEach(() => fetchPage.mockReset())
afterEach(() => {
  document.querySelector('meta[name="robots"]')?.remove()
  document.title = originalTitle
})

describe('PublicTripMiniSite', () => {
  it('renders only the consented snapshot and prevents indexing of link-only pages', async () => {
    fetchPage.mockResolvedValue({
      visibility: 'link',
      snapshot: {
        title: 'Moscow, Russia', city: 'Moscow', country: 'Russia', start_date: '2026-09-01', end_date: '2026-09-03',
        cover: null, summary: 'A city walk', photos: [],
        points: [{ latitude: 55.75, longitude: 37.61, name: 'Red Square', note: 'Arrived early' }],
        game_stamps: [{ key: 'red-square', title: 'Red Square explorer', earned_at: '2026-09-02T10:00:00Z', fact: 'The square was established in the 15th century.', source_label: 'History source', source_url: 'https://history.example.test/red-square' }],
        stats: { days: 3, places_visited: 1, distance_km: 0 },
      },
    })
    render(<PublicTripMiniSite slug="secret" />)
    expect(await screen.findByRole('heading', { name: 'Moscow, Russia' })).toBeTruthy()
    expect(screen.getByText('Red Square')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Игровые отметки' })).toBeTruthy()
    expect(screen.getByText('The square was established in the 15th century.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'History source' }).getAttribute('rel')).toBe('noopener noreferrer')
    expect(screen.getByTestId('public-trip-map')).toBeTruthy()
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow')
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()
    expect(document.title).toBe('Moscow, Russia — Crista')
    expect(screen.queryByText(/expense|расход/i)).toBeNull()
  })

  it('shows a revoked-page message when the public API returns 404', async () => {
    fetchPage.mockRejectedValueOnce({ status: 404 })
    render(<PublicTripMiniSite slug="revoked" />)
    expect(await screen.findByText(/владелец мог отозвать доступ/i)).toBeTruthy()
  })

  it('sets share metadata and a route canonical URL only for public pages', async () => {
    const originalCanonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null
    window.history.pushState({}, '', '/t/public-trip?utm_source=test#details')
    fetchPage.mockResolvedValueOnce({
      visibility: 'public',
      snapshot: {
        title: 'Lisbon weekend', city: 'Lisbon', country: 'Portugal', start_date: '2026-09-01', end_date: '2026-09-03',
        cover: 'https://images.example.test/lisbon.jpg', summary: 'A sunny city break', photos: [], points: [],
        stats: { days: 3, places_visited: 0, distance_km: 0 },
      },
    })

    const { unmount } = render(<PublicTripMiniSite slug="public-trip" />)
    expect(await screen.findByRole('heading', { name: 'Lisbon weekend' })).toBeTruthy()
    expect(document.title).toBe('Lisbon weekend — Crista')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('A sunny city break')
    const canonicalUrl = `${window.location.origin}/t/public-trip`
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(canonicalUrl)
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(canonicalUrl)
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://images.example.test/lisbon.jpg')
    expect(document.querySelector('meta[name="robots"]')).toBeNull()

    unmount()
    expect(document.title).toBe(originalTitle)
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null).toBe(originalCanonical)
  })
})
