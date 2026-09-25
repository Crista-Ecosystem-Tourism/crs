import { ApiError } from './chatApi'
import { getAuthHeaders } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export type Friend = {
  id: string
  name: string | null
  friends_since: string
}

export type FriendInvite = {
  invite_id: string
  invite_code: string
  expires_at: string
}

export type TeamMember = {
  id: string
  name: string | null
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

export type SocialTeam = {
  id: string
  name: string
  role: TeamMember['role']
  created_at: string
  members: TeamMember[]
}

export type SharedQuestCatalogItem = {
  id: string
  city_id: string
  city_name: string
  title: string
}

export type SharedTeamQuest = {
  id: string
  quest_id: string
  quest_title: string
  status: 'active' | 'complete'
  participant_count: number
  completed_count: number
  ready_to_claim: boolean
  created_at: string
  completed_at: string | null
  participants: Array<{ id: string; name: string | null; completed: boolean }>
}

export type WeeklyLeagueMember = {
  user_id: string
  name: string | null
  rank: number
  place: number
  weekly_xp: number
  projected_rank: number
  projected_movement: 'promoted' | 'held' | 'relegated'
  is_self: boolean
}

export type WeeklyLeagueResult = {
  season_id: string
  weekly_xp: number
  place: number
  rank_before: number
  rank_after: number
  movement: 'promoted' | 'held' | 'relegated'
  closed_at: string
}

export type WeeklyLeague = {
  joined: boolean
  season_id: string
  starts_at: string
  ends_at: string
  rank?: number
  participant_count?: number
  previous_result?: WeeklyLeagueResult | null
  members: WeeklyLeagueMember[]
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try { detail = (await response.json()).detail || detail } catch { /* proxy or HTML response */ }
    throw new ApiError(response.status, detail)
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

export async function listFriends(): Promise<Friend[]> {
  return parse<Friend[]>(await fetch(`${API_BASE_URL}/social/friends`, { headers: getAuthHeaders() }))
}

export async function getWeeklyLeague(): Promise<WeeklyLeague> {
  return parse(await fetch(`${API_BASE_URL}/social/league`, { headers: getAuthHeaders() }))
}

export async function joinWeeklyLeague(): Promise<WeeklyLeague> {
  return parse(await fetch(`${API_BASE_URL}/social/league/join`, {
    method: 'POST',
    headers: getAuthHeaders(),
  }))
}

export async function createFriendInvite(): Promise<FriendInvite> {
  return parse<FriendInvite>(await fetch(`${API_BASE_URL}/social/invites`, {
    method: 'POST',
    headers: getAuthHeaders(),
  }))
}

export async function acceptFriendInvite(inviteCode: string): Promise<{ friend_id: string; created: boolean }> {
  return parse(await fetch(`${API_BASE_URL}/social/invites/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ invite_code: inviteCode }),
  }))
}

export async function revokeFriendInvite(inviteId: string): Promise<void> {
  await parse<void>(await fetch(`${API_BASE_URL}/social/invites/${encodeURIComponent(inviteId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }))
}

export async function removeFriend(friendId: string): Promise<void> {
  await parse<void>(await fetch(`${API_BASE_URL}/social/friends/${encodeURIComponent(friendId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }))
}

export async function listTeams(): Promise<SocialTeam[]> {
  return parse<SocialTeam[]>(await fetch(`${API_BASE_URL}/social/teams`, { headers: getAuthHeaders() }))
}

export async function createTeam(name: string): Promise<SocialTeam> {
  return parse<SocialTeam>(await fetch(`${API_BASE_URL}/social/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ name }),
  }))
}

export async function addTeamMember(teamId: string, friendId: string): Promise<{ created: boolean }> {
  return parse(await fetch(`${API_BASE_URL}/social/teams/${encodeURIComponent(teamId)}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ friend_id: friendId }),
  }))
}

export async function changeTeamRole(teamId: string, memberId: string, role: 'admin' | 'member'): Promise<{ changed: boolean }> {
  return parse(await fetch(`${API_BASE_URL}/social/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(memberId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ role }),
  }))
}

export async function removeTeamMember(teamId: string, memberId: string): Promise<void> {
  await parse<void>(await fetch(`${API_BASE_URL}/social/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(memberId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }))
}

export async function listSharedQuestCatalog(language: 'ru' | 'en' = 'ru'): Promise<SharedQuestCatalogItem[]> {
  const params = new URLSearchParams({ language })
  return parse<SharedQuestCatalogItem[]>(await fetch(`${API_BASE_URL}/social/team-quest-catalog?${params}`, { headers: getAuthHeaders() }))
}

export async function listSharedTeamQuests(teamId: string, language: 'ru' | 'en' = 'ru'): Promise<SharedTeamQuest[]> {
  const params = new URLSearchParams({ language })
  return parse<SharedTeamQuest[]>(await fetch(`${API_BASE_URL}/social/teams/${encodeURIComponent(teamId)}/quests?${params}`, { headers: getAuthHeaders() }))
}

export async function createSharedTeamQuest(teamId: string, questId: string): Promise<SharedTeamQuest> {
  return parse<SharedTeamQuest>(await fetch(`${API_BASE_URL}/social/teams/${encodeURIComponent(teamId)}/quests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ quest_id: questId }),
  }))
}

export async function claimSharedTeamQuest(teamId: string, sharedQuestId: string, language: 'ru' | 'en' = 'ru'): Promise<SharedTeamQuest & { xp_awarded: number; rewards_credited: number }> {
  const params = new URLSearchParams({ language })
  return parse(await fetch(`${API_BASE_URL}/social/teams/${encodeURIComponent(teamId)}/quests/${encodeURIComponent(sharedQuestId)}/claim?${params}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  }))
}
