import type { SuggestedReplyGroup } from '@/types'

/** Format chip selections into a readable string like "Бюджет: средний, Компания: пара" */
export function formatChipSelections(
  selections: Record<string, string>,
  groups: SuggestedReplyGroup[]
): string {
  const parts: string[] = []
  for (const group of groups) {
    const val = selections[group.category]
    if (val) parts.push(`${group.label}: ${val}`)
  }
  return parts.join(', ')
}

/** Merge chip text and user text into one message */
export function mergeMessage(chipText: string, userText: string): string {
  if (chipText && userText) return `${chipText}\n${userText}`
  return chipText || userText
}
