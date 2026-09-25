import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteMedia, fetchMediaFile, fetchMediaPreview, getMyMedia, uploadQuestMedia } from '../mediaApi'

vi.mock('../authApi', () => ({ getAuthHeaders: () => ({ Authorization: 'Bearer test' }) }))

describe('mediaApi', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('posts multipart bytes with auth and the quest target without forcing a content-type boundary', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ id: 'media-1' }), { status: 201 }))
    const file = new File(['image'], 'photo.png', { type: 'image/png' })
    await uploadQuestMedia('quest / 1', file)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/media?quest_id=quest%20%2F%201'), expect.objectContaining({
      method: 'POST', headers: { Authorization: 'Bearer test' }, body: expect.any(FormData),
    }))
    expect((fetchMock.mock.calls[0][1]?.body as FormData).get('file')).toBe(file)
    expect((fetchMock.mock.calls[0][1]?.headers as Record<string, string>)['Content-Type']).toBeUndefined()
  })

  it('loads private previews with auth and deletes only by asset id', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('jpeg', { status: 200, headers: { 'Content-Type': 'image/jpeg' } }))
      .mockResolvedValueOnce(new Response('mp4', { status: 200, headers: { 'Content-Type': 'video/mp4' } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    const asset = { id: 'private-1', preview_url: '/media/private-1/preview', file_url: '/media/private-1/file' } as Parameters<typeof fetchMediaPreview>[0]
    expect(await (await fetchMediaPreview(asset)).text()).toBe('jpeg')
    expect(await (await fetchMediaFile(asset)).text()).toBe('mp4')
    await deleteMedia(asset.id)
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ Authorization: 'Bearer test' })
    expect(fetchMock.mock.calls[1][0]).toContain('/media/private-1/file')
    expect(fetchMock.mock.calls[2][0]).toContain('/media/private-1')
    expect(fetchMock.mock.calls[2][1]?.method).toBe('DELETE')
  })

  it('requests the caller-owned library', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('[]', { status: 200 }))
    await expect(getMyMedia()).resolves.toEqual([])
    expect(fetchMock.mock.calls[0][0]).toContain('/media/mine')
  })
})
