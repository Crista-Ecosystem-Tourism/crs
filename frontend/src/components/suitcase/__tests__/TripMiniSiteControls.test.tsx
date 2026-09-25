import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { completeTripForMiniSite, getTripMiniSite, publishTripMiniSite, revokeTripMiniSite } from '@/api/suitcaseApi'
import { createMiniSiteStampTicket, getGamePassport } from '@/api/gameApi'
import { TripMiniSiteControls } from '../TripMiniSiteControls'

vi.mock('@/api/suitcaseApi', () => ({
  completeTripForMiniSite: vi.fn(),
  getTripMiniSite: vi.fn(),
  publishTripMiniSite: vi.fn(),
  revokeTripMiniSite: vi.fn(),
}))
vi.mock('@/api/gameApi', () => ({
  createMiniSiteStampTicket: vi.fn(),
  getGamePassport: vi.fn(),
}))

const getSite = vi.mocked(getTripMiniSite)
const complete = vi.mocked(completeTripForMiniSite)
const publish = vi.mocked(publishTripMiniSite)
const revoke = vi.mocked(revokeTripMiniSite)
const getPassport = vi.mocked(getGamePassport)
const stampTicket = vi.mocked(createMiniSiteStampTicket)
const sampleSnapshot = {
  title: 'Rome, Italy', city: 'Rome', country: 'Italy', start_date: '2026-09-20', end_date: '2026-09-25',
  cover: 'https://photos.example/cover.jpg', summary: 'A quiet week',
  photos: ['https://photos.example/piazza.jpg'],
  points: [{ latitude: 41.9, longitude: 12.5, name: 'Piazza Navona', note: 'Visit at sunset', photos: ['https://photos.example/fountain.jpg'] }],
  stats: { days: 5, places_visited: 1, distance_km: 2.3 },
}

beforeEach(() => {
  getSite.mockReset().mockResolvedValue({ published: false, slug: null, visibility: null, consented_at: null })
  getPassport.mockReset().mockResolvedValue({ profile: { xp: 0, energy: 5, streak: 0 }, stamps: [], cities: [], routes: [] })
  stampTicket.mockReset().mockResolvedValue({ ticket: 'signed-ticket' })
  complete.mockReset().mockResolvedValue({ published: false, draft_ready: true, slug: null, visibility: null, consented_at: null, completed_at: '2026-09-25T12:00:00Z', draft_snapshot: sampleSnapshot, preview_snapshot: sampleSnapshot })
  publish.mockReset().mockResolvedValue({ published: true, slug: 'secret-123', visibility: 'link', consented_at: '2026-09-25T12:00:00Z' })
  revoke.mockReset().mockResolvedValue()
  vi.stubGlobal('confirm', vi.fn(() => true))
})

describe('TripMiniSiteControls', () => {
  it('creates a private draft on completion without publishing it', async () => {
    render(<TripMiniSiteControls tripId="trip-draft" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Завершить поездку и подготовить черновик' }))
    expect(await screen.findByText('Черновик виден только вам. Публичной страницы пока нет.')).toBeTruthy()
    expect(complete).toHaveBeenCalledWith('trip-draft', undefined)
    expect(publish).not.toHaveBeenCalled()
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false)
  })

  it('previews every exported data field and does not auto-fetch external photos', async () => {
    getSite.mockResolvedValueOnce({
      published: false,
      slug: null,
      visibility: null,
      consented_at: null,
      draft_snapshot: sampleSnapshot,
      preview_snapshot: sampleSnapshot,
    })
    render(<TripMiniSiteControls tripId="trip-preview" />)

    expect(await screen.findByText('Rome, Italy')).toBeTruthy()
    expect(screen.getByText('A quiet week')).toBeTruthy()
    expect(screen.getByText('Piazza Navona · 41.9, 12.5')).toBeTruthy()
    expect(screen.getByText('Visit at sunset')).toBeTruthy()
    expect(screen.getByText('Статистика: 5 дн. · 1 мест · 2,3 км')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'https://photos.example/cover.jpg' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'https://photos.example/fountain.jpg' })).toBeTruthy()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('keeps the current link live until the owner reviews and consents to a refreshed snapshot', async () => {
    const publishedStamp = { key: 'moscow-starter', title: 'Moscow explorer', earned_at: '2026-09-20T10:00:00Z', fact: 'A verified fact.', source_label: 'Source', source_url: 'https://source.example/fact' }
    getPassport.mockResolvedValueOnce({
      profile: { xp: 20, energy: 5, streak: 1 },
      stamps: [{ key: publishedStamp.key, title: publishedStamp.title, earned_at: publishedStamp.earned_at }],
      cities: [], routes: [],
    })
    getSite.mockResolvedValueOnce({
      published: true,
      slug: 'old-link-123456789012345678901234',
      visibility: 'public',
      consented_at: '2026-09-25T12:00:00Z',
      preview_snapshot: sampleSnapshot,
      published_snapshot: { ...sampleSnapshot, game_stamps: [publishedStamp] },
    })
    complete.mockResolvedValueOnce({
      published: true,
      slug: 'old-link-123456789012345678901234',
      visibility: 'public',
      consented_at: '2026-09-25T12:00:00Z',
      preview_snapshot: { ...sampleSnapshot, game_stamps: [publishedStamp] },
    })
    publish.mockResolvedValueOnce({ published: true, slug: 'new-link-123456789012345678901234', visibility: 'public', consented_at: '2026-09-26T12:00:00Z' })
    render(<TripMiniSiteControls tripId="trip-refresh" />)

    const oldUrl = await screen.findByRole('link', { name: /old-link-1234567890/ })
    fireEvent.click(screen.getByRole('button', { name: 'Обновить snapshot и ссылку' }))
    expect(await screen.findByText('Старая ссылка пока продолжает работать. После подтверждения она заменится новой.')).toBeTruthy()
    expect(screen.getByRole('link', { name: /old-link-1234567890/ })).toBe(oldUrl)
    expect((screen.getByLabelText(/Moscow explorer/) as HTMLInputElement).checked).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Обновить предпросмотр' }))
    expect(await screen.findByText('A verified fact.')).toBeTruthy()
    expect(complete).toHaveBeenCalledWith('trip-refresh', 'signed-ticket')
    expect(screen.getByRole('button', { name: 'Обновить после согласия' }).hasAttribute('disabled')).toBe(true)

    fireEvent.click(screen.getByLabelText(/согласен\(на\) опубликовать показанные данные/i))
    fireEvent.click(screen.getByRole('button', { name: 'Обновить после согласия' }))
    expect(await screen.findByRole('link', { name: /new-link-1234567890/ })).toBeTruthy()
    expect(publish).toHaveBeenCalledWith('trip-refresh', 'public', 'signed-ticket')
  })

  it('requires explicit consent before publishing and displays the returned URL', async () => {
    render(<TripMiniSiteControls tripId="trip-1" />)
    const publishButton = await screen.findByRole('button', { name: 'Опубликовать snapshot' })
    expect(publishButton.hasAttribute('disabled')).toBe(true)
    fireEvent.click(publishButton)
    expect(publish).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(publishButton)
    await screen.findByRole('link', { name: /\/t\/secret-123$/ })
    expect(publish).toHaveBeenCalledWith('trip-1', 'link', undefined)
  })

  it('requires the selected game-stamp preview to be refreshed before consent', async () => {
    getPassport.mockResolvedValueOnce({
      profile: { xp: 20, energy: 5, streak: 1 },
      stamps: [{ key: 'moscow-starter', title: 'Moscow explorer', earned_at: '2026-09-20T10:00:00Z' }],
      cities: [], routes: [],
    })
    complete.mockResolvedValueOnce({
      published: false, draft_ready: true, slug: null, visibility: null, consented_at: null,
      completed_at: '2026-09-25T12:00:00Z',
      preview_snapshot: { ...sampleSnapshot, game_stamps: [{ key: 'moscow-starter', title: 'Moscow explorer', earned_at: '2026-09-20T10:00:00Z', fact: 'A verified fact.', source_label: 'Source', source_url: 'https://source.example/fact' }] },
    })
    render(<TripMiniSiteControls tripId="trip-stamps" />)

    fireEvent.click(await screen.findByLabelText(/Moscow explorer/))
    expect(screen.getByRole('button', { name: 'Опубликовать snapshot' }).hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Обновить предпросмотр' }))
    expect(await screen.findByText('A verified fact.')).toBeTruthy()
    expect(complete).toHaveBeenCalledWith('trip-stamps', 'signed-ticket')
    expect(stampTicket).toHaveBeenCalledWith(['moscow-starter'])
  })

  it('revokes the active public link after owner confirmation', async () => {
    getSite.mockResolvedValueOnce({ published: true, slug: 'active-slug', visibility: 'public', consented_at: '2026-09-25T12:00:00Z' })
    render(<TripMiniSiteControls tripId="trip-2" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Отозвать публикацию' }))
    await waitFor(() => expect(revoke).toHaveBeenCalledWith('trip-2'))
    expect((await screen.findByRole('button', { name: 'Опубликовать snapshot' })).hasAttribute('disabled')).toBe(true)
  })
})
