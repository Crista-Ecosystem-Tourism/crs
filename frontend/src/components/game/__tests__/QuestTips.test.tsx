import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QuestTips } from '../QuestTips'

const api = vi.hoisted(() => ({
  createTipDraft: vi.fn(), decideTip: vi.fn(), deleteTipDraft: vi.fn(), getMyTips: vi.fn(),
  getPublishedTips: vi.fn(), getTipAudit: vi.fn(), getTipReports: vi.fn(), getTipReviewQueue: vi.fn(),
  reportTip: vi.fn(), resolveTipReport: vi.fn(), submitTip: vi.fn(), updateTipDraft: vi.fn(),
}))

vi.mock('@/api/tipApi', () => api)
vi.mock('@/context/AppContext', () => ({ useApp: () => ({ language: 'en' }) }))

const publishedTip = {
  id: 'tip-1', quest_id: 'quest-1', author_name: 'Traveler', body: 'Bring water and comfortable shoes.',
  status: 'published', created_at: '2026-09-25T10:00:00Z', updated_at: '2026-09-25T10:00:00Z', submitted_at: null,
}

describe('QuestTips', () => {
  beforeEach(() => {
    Object.values(api).forEach((mock) => mock.mockReset())
    api.createTipDraft.mockResolvedValue({ id: 'tip-draft' })
    api.decideTip.mockResolvedValue({ status: 'published' })
    api.deleteTipDraft.mockResolvedValue(undefined)
    api.getMyTips.mockResolvedValue([])
    api.getPublishedTips.mockResolvedValue([publishedTip])
    api.getTipAudit.mockResolvedValue([])
    api.getTipReports.mockResolvedValue([])
    api.getTipReviewQueue.mockResolvedValue([])
    api.reportTip.mockResolvedValue({ id: 'report-1', status: 'pending' })
    api.resolveTipReport.mockResolvedValue({ id: 'report-1', status: 'resolved' })
    api.submitTip.mockResolvedValue({ id: 'tip-draft', status: 'review' })
    api.updateTipDraft.mockResolvedValue({ id: 'tip-draft', status: 'draft' })
  })

  it('shows approved tips publicly without exposing author controls to guests', async () => {
    render(<QuestTips questId="quest-1" signedIn={false} isEditor={false} />)
    expect(await screen.findByText(publishedTip.body)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Report' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Save draft' })).toBeNull()
  })

  it('lets an authenticated traveler save a draft and send it to review', async () => {
    const user = userEvent.setup()
    api.getMyTips
      .mockResolvedValueOnce([{ ...publishedTip, status: 'draft', id: 'draft-1', body: 'Take the northern path in the morning.' }])
      .mockResolvedValue([])
    render(<QuestTips questId="quest-1" signedIn isEditor={false} />)
    await user.click(await screen.findByRole('button', { name: 'Submit for review' }))
    expect(api.updateTipDraft).toHaveBeenCalledWith('draft-1', 'Take the northern path in the morning.')
    expect(api.submitTip).toHaveBeenCalledWith('draft-1')
  })

  it('lets editors publish a queued note and records a moderation result', async () => {
    const user = userEvent.setup()
    api.getTipReviewQueue.mockResolvedValueOnce([{ ...publishedTip, id: 'review-1', status: 'review', author_name: 'Writer' }]).mockResolvedValue([])
    render(<QuestTips questId="quest-1" signedIn isEditor />)
    await user.click(await screen.findByRole('button', { name: 'Publish' }))
    expect(api.decideTip).toHaveBeenCalledWith('review-1', 'publish', '')
    expect(await screen.findByText('Tip published.')).toBeTruthy()
  })
})
