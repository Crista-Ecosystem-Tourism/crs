import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Heart, MapPin, Play, Trophy, UserPlus, Copy, RotateCw, UserRoundX } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { GlassPanel, Chip, IconButton } from '@/components/ui/glass'
import { Img } from '@/components/ui/Img'
import { useApp } from '@/context/AppContext'
import { isLoggedIn } from '@/api/authApi'
import {
  acceptFriendInvite,
  addTeamMember,
  claimSharedTeamQuest,
  changeTeamRole,
  createSharedTeamQuest,
  createFriendInvite,
  createTeam,
  getWeeklyLeague,
  joinWeeklyLeague,
  listFriends,
  listSharedQuestCatalog,
  listSharedTeamQuests,
  listTeams,
  removeFriend,
  removeTeamMember,
  type Friend,
  type SharedQuestCatalogItem,
  type SharedTeamQuest,
  type SocialTeam,
  type WeeklyLeague,
} from '@/api/socialApi'

type CommunityPanelProps = {
  onBack: () => void
}

const starRoutes = [
  {
    id: '1',
    title: 'Тбилиси за 3 дня',
    author: 'Орёл и Решка',
    kind: 'Медиа',
    cover: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80',
    likes: 4210,
    points: 9,
  },
  {
    id: '2',
    title: 'Секретные точки Сочи',
    author: 'Гордей',
    kind: 'Блогер',
    cover: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800&q=80',
    likes: 1870,
    points: 6,
  },
  {
    id: '3',
    title: 'Гастротур по Москве',
    author: 'Птушкин',
    kind: 'Блогер',
    cover: 'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800&q=80',
    likes: 2540,
    points: 7,
  },
  {
    id: '4',
    title: 'Выходные в Питере',
    author: 'Аня Ковалёва, подруга',
    kind: 'Друг',
    cover: 'https://images.unsplash.com/photo-1556610961-2fecc5927173?w=800&q=80',
    likes: 96,
    points: 5,
  },
]

function LeagueSection({ language }: { language: 'ru' | 'en' }) {
  const en = language === 'en'
  const signedIn = isLoggedIn()
  const [league, setLeague] = useState<WeeklyLeague | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!signedIn) return
    setLoading(true)
    setError(null)
    try {
      setLeague(await getWeeklyLeague())
    } catch {
      setError(en ? 'Could not load the weekly league.' : 'Не удалось загрузить недельную лигу.')
    } finally {
      setLoading(false)
    }
  }, [en, signedIn])

  useEffect(() => { void refresh() }, [refresh])

  const join = async () => {
    setBusy(true)
    setError(null)
    try {
      setLeague(await joinWeeklyLeague())
    } catch {
      setError(en ? 'Could not join the weekly league.' : 'Не удалось вступить в недельную лигу.')
    } finally {
      setBusy(false)
    }
  }

  if (!signedIn) return <p className="rounded-lg border border-hairline p-4 text-sm text-text-secondary">
    {en ? 'Sign in to join the weekly league.' : 'Войдите, чтобы вступить в недельную лигу.'}
  </p>

  return <section aria-label={en ? 'Weekly league' : 'Недельная лига'} className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-semibold text-text">{en ? 'Weekly league' : 'Недельная лига'}</h2>
        {league && <p className="mt-1 text-xs text-text-muted">{league.season_id} · {en ? 'UTC week' : 'неделя UTC'}</p>}
      </div>
      <Button variant="ghost" size="sm" disabled={loading || busy} onClick={() => void refresh()}>
        <RotateCw className="mr-2 h-4 w-4" aria-hidden="true" />{en ? 'Refresh' : 'Обновить'}
      </Button>
    </div>
    {error && <p role="alert" className="text-sm text-error">{error}</p>}
    {loading && !league && <p role="status" className="text-sm text-text-muted">{en ? 'Loading league…' : 'Загружаю лигу…'}</p>}
    {league?.previous_result && <GlassPanel className="space-y-1">
      <p className="text-sm font-semibold text-text">{en ? 'Previous league result' : 'Итог прошлой недели'}</p>
      <p className="text-xs text-text-muted">{league.previous_result.season_id} · #{league.previous_result.place} · {league.previous_result.weekly_xp} XP</p>
      <p className="text-sm text-text-secondary">
        {league.previous_result.movement === 'promoted'
          ? (en ? `Promoted from rank ${league.previous_result.rank_before} to rank ${league.previous_result.rank_after}` : `Повышение: ранг ${league.previous_result.rank_before} → ${league.previous_result.rank_after}`)
          : league.previous_result.movement === 'relegated'
            ? (en ? `Moved from rank ${league.previous_result.rank_before} to rank ${league.previous_result.rank_after}` : `Понижение: ранг ${league.previous_result.rank_before} → ${league.previous_result.rank_after}`)
            : (en ? `Kept rank ${league.previous_result.rank_after}` : `Ранг ${league.previous_result.rank_after} сохранён`)}
      </p>
    </GlassPanel>}
    {league && !league.joined && <GlassPanel className="space-y-3">
      <p className="text-sm text-text-secondary">{en ? 'Join to count server-verified XP earned this week. Your score is visible to you and accepted friends.' : 'Вступите, чтобы учитывать серверный XP за эту неделю. Ваш результат виден вам и принятым друзьям.'}</p>
      <Button disabled={busy} onClick={() => void join()}>{busy ? (en ? 'Joining…' : 'Вступаю…') : (en ? 'Join weekly league' : 'Вступить в недельную лигу')}</Button>
    </GlassPanel>}
    {league?.joined && <>
      <p className="text-sm text-text-secondary">
        {en ? `Rank ${league.rank} of 10 · ${league.participant_count} participants` : `Ранг ${league.rank} из 10 · участников: ${league.participant_count}`}
      </p>
      <GlassPanel className="divide-y divide-hairline overflow-hidden p-0">
        {league.members.map((member) => <div key={member.user_id} className={`flex items-center gap-3 px-4 py-3 ${member.is_self ? 'bg-primary/[0.07]' : ''}`}>
          <span className="w-12 shrink-0 text-sm font-semibold tabular text-text-secondary">#{member.place}</span>
          <div className="min-w-0 flex-1">
            <p className={`truncate text-sm font-semibold ${member.is_self ? 'text-primary' : 'text-text'}`}>
              {member.name || (member.is_self ? (en ? 'You' : 'Вы') : (en ? 'Friend' : 'Друг'))}
            </p>
            <p className="text-xs text-text-muted">
              {member.projected_movement === 'promoted'
                ? (en ? `Promoted to rank ${member.projected_rank}` : `Переход на ранг ${member.projected_rank}`)
                : member.projected_movement === 'relegated'
                  ? (en ? `Would move to rank ${member.projected_rank}` : `Переход на ранг ${member.projected_rank}`)
                  : (en ? `Holds rank ${member.rank}` : `Сохранение ранга ${member.rank}`)}
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular text-text">{member.weekly_xp} XP</span>
        </div>)}
        {league.members.length === 0 && <p className="p-4 text-sm text-text-muted">{en ? 'No league members yet.' : 'Пока участников нет.'}</p>}
      </GlassPanel>
    </>}
  </section>
}

function FriendsSection({ language, userId }: { language: 'ru' | 'en'; userId?: string }) {
  const en = language === 'en'
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const signedIn = isLoggedIn()

  const refreshFriends = useCallback(async () => {
    if (!signedIn) return
    setLoading(true)
    setError(null)
    try {
      setFriends(await listFriends())
    } catch {
      setError(en ? 'Could not load your friends.' : 'Не удалось загрузить список друзей.')
    } finally {
      setLoading(false)
    }
  }, [en, signedIn])

  useEffect(() => {
    const code = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('friend-invite')
    setInviteCode(code)
    void refreshFriends()
  }, [refreshFriends])

  const createInvite = async () => {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const invite = await createFriendInvite()
      const url = new URL(window.location.href)
      url.hash = new URLSearchParams({ 'friend-invite': invite.invite_code }).toString()
      setInviteLink(url.toString())
      setNotice(en ? 'Invite link created. It expires in 7 days.' : 'Ссылка-приглашение создана и действует 7 дней.')
    } catch {
      setError(en ? 'Could not create an invite. Try again later.' : 'Не удалось создать приглашение. Попробуйте позже.')
    } finally {
      setBusy(false)
    }
  }

  const acceptInvite = async () => {
    if (!inviteCode) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await acceptFriendInvite(inviteCode)
      setInviteCode(null)
      setInviteLink(null)
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
      setNotice(en ? 'Friend added.' : 'Друг добавлен.')
      await refreshFriends()
    } catch {
      setError(en ? 'This invite is invalid, expired, or already used.' : 'Приглашение недействительно, истекло или уже использовано.')
    } finally {
      setBusy(false)
    }
  }

  const copyInvite = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setNotice(en ? 'Invite link copied.' : 'Ссылка скопирована.')
    } catch {
      setNotice(en ? 'Copy the link from the field above.' : 'Скопируйте ссылку из поля выше.')
    }
  }

  const onRemoveFriend = async (friend: Friend) => {
    setBusy(true)
    setError(null)
    try {
      await removeFriend(friend.id)
      setFriends((items) => items.filter((item) => item.id !== friend.id))
      setNotice(en ? 'Friend removed.' : 'Друг удалён.')
    } catch {
      setError(en ? 'Could not remove this friend.' : 'Не удалось удалить друга.')
    } finally {
      setBusy(false)
    }
  }

  if (!signedIn) {
    return <GlassPanel className="p-5 text-sm text-text-secondary">{en ? 'Sign in to manage friends and invitations.' : 'Войдите, чтобы управлять друзьями и приглашениями.'}</GlassPanel>
  }

  return (
    <div className="space-y-3">
      {inviteCode && (
        <GlassPanel className="space-y-3 border-primary/25 p-4">
          <p className="font-sans text-sm text-text">{en ? 'You have a friend invitation.' : 'Вас пригласили в друзья.'}</p>
          <Button size="sm" onClick={() => void acceptInvite()} disabled={busy}>
            <UserPlus />{en ? 'Accept invitation' : 'Принять приглашение'}
          </Button>
        </GlassPanel>
      )}

      <GlassPanel className="space-y-3 p-4">
        <div>
          <h2 className="font-sans text-sm font-semibold text-text">{en ? 'Invite a friend' : 'Пригласить друга'}</h2>
          <p className="mt-1 font-sans text-xs text-text-muted">{en ? 'Invite links expire after 7 days and can be used once.' : 'Ссылка действует 7 дней и принимается только один раз.'}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => void createInvite()} disabled={busy}>
          <UserPlus />{busy ? (en ? 'Please wait…' : 'Подождите…') : (en ? 'Create invite link' : 'Создать ссылку-приглашение')}
        </Button>
        {inviteLink && <div className="flex flex-col gap-2 sm:flex-row">
          <input aria-label={en ? 'Friend invite link' : 'Ссылка-приглашение'} readOnly value={inviteLink} className="h-10 min-w-0 flex-1 rounded-md border border-hairline bg-panel px-3 font-sans text-xs text-text" />
          <Button size="sm" variant="ghost" onClick={() => void copyInvite()}><Copy />{en ? 'Copy' : 'Скопировать'}</Button>
        </div>}
      </GlassPanel>

      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-sm font-semibold text-text">{en ? 'Your friends' : 'Ваши друзья'}</h2>
        <Button size="sm" variant="ghost" onClick={() => void refreshFriends()} disabled={loading}><RotateCw />{en ? 'Refresh' : 'Обновить'}</Button>
      </div>
      {loading && <p role="status" className="text-sm text-text-muted">{en ? 'Loading friends…' : 'Загружаем друзей…'}</p>}
      {error && <div className="flex items-center justify-between gap-3"><p role="alert" className="text-sm text-error">{error}</p><Button size="sm" variant="ghost" onClick={() => void refreshFriends()}>{en ? 'Retry' : 'Повторить'}</Button></div>}
      {!loading && !error && friends.length === 0 && <GlassPanel className="p-5 text-sm text-text-muted">{en ? 'No friends yet. Create a link to invite someone.' : 'Пока друзей нет. Создайте ссылку, чтобы пригласить знакомого.'}</GlassPanel>}
      {friends.map((friend) => (
        <GlassPanel key={friend.id} className="flex items-center gap-3 p-4">
          <Avatar className="h-10 w-10 border border-hairline"><AvatarFallback className="bg-panel-2 text-sm text-text-secondary">{(friend.name || 'C').slice(0, 2)}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-sm font-semibold text-text">{friend.name || (en ? 'Crista traveler' : 'Путешественник Crista')}</p>
            <p className="font-sans text-xs text-text-muted">{en ? 'Friend since' : 'В друзьях с'} {new Date(friend.friends_since).toLocaleDateString(en ? 'en' : 'ru')}</p>
          </div>
          <IconButton label={en ? `Remove ${friend.name || 'friend'}` : `Удалить ${friend.name || 'друга'}`} variant="ghost" size="sm" disabled={busy} onClick={() => void onRemoveFriend(friend)}><UserRoundX /></IconButton>
        </GlassPanel>
      ))}
      {notice && <p role="status" className="text-sm text-text-secondary">{notice}</p>}
      <TeamSection language={language} friends={friends} userId={userId} />
    </div>
  )
}

function TeamSection({ language, friends, userId }: { language: 'ru' | 'en'; friends: Friend[]; userId?: string }) {
  const en = language === 'en'
  const [teams, setTeams] = useState<SocialTeam[]>([])
  const [questCatalog, setQuestCatalog] = useState<SharedQuestCatalogItem[]>([])
  const [sharedQuests, setSharedQuests] = useState<Record<string, SharedTeamQuest[]>>({})
  const [selectedQuests, setSelectedQuests] = useState<Record<string, string>>({})
  const [teamName, setTeamName] = useState('')
  const [selectedFriends, setSelectedFriends] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questError, setQuestError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const refreshTeams = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const nextTeams = await listTeams()
      setTeams(nextTeams)
      try {
        const [catalog, questLists] = await Promise.all([
          listSharedQuestCatalog(language),
          Promise.all(nextTeams.map((team) => listSharedTeamQuests(team.id, language))),
        ])
        setQuestCatalog(catalog)
        setSharedQuests(Object.fromEntries(nextTeams.map((team, index) => [team.id, questLists[index]])))
        setQuestError(null)
      } catch {
        setQuestError(en ? 'Could not load shared quests.' : 'Не удалось загрузить совместные квесты.')
      }
    } catch {
      setError(en ? 'Could not load teams.' : 'Не удалось загрузить команды.')
    } finally {
      setLoading(false)
    }
  }, [en])

  useEffect(() => { void refreshTeams() }, [refreshTeams])

  const onCreateTeam = async (event: FormEvent) => {
    event.preventDefault()
    const name = teamName.trim()
    if (!name || busy) return
    setBusy(true)
    setError(null)
    try {
      const team = await createTeam(name)
      setTeams((items) => [team, ...items])
      setTeamName('')
      setNotice(en ? 'Team created.' : 'Команда создана.')
    } catch {
      setError(en ? 'Could not create the team.' : 'Не удалось создать команду.')
    } finally {
      setBusy(false)
    }
  }

  const onAddFriend = async (team: SocialTeam) => {
    const friendId = selectedFriends[team.id]
    if (!friendId || busy) return
    setBusy(true)
    setError(null)
    try {
      await addTeamMember(team.id, friendId)
      await refreshTeams()
      setSelectedFriends((items) => ({ ...items, [team.id]: '' }))
      setNotice(en ? 'Friend added to the team.' : 'Друг добавлен в команду.')
    } catch {
      setError(en ? 'Could not add this friend to the team.' : 'Не удалось добавить друга в команду.')
    } finally {
      setBusy(false)
    }
  }

  const onChangeRole = async (team: SocialTeam, memberId: string, role: 'admin' | 'member') => {
    setBusy(true)
    setError(null)
    try {
      await changeTeamRole(team.id, memberId, role)
      await refreshTeams()
      setNotice(en ? 'Team role updated.' : 'Роль участника обновлена.')
    } catch {
      setError(en ? 'Could not update this role.' : 'Не удалось изменить роль.')
    } finally {
      setBusy(false)
    }
  }

  const onRemoveMember = async (team: SocialTeam, memberId: string) => {
    setBusy(true)
    setError(null)
    try {
      await removeTeamMember(team.id, memberId)
      await refreshTeams()
      setNotice(en ? 'Team membership updated.' : 'Состав команды обновлён.')
    } catch {
      setError(en ? 'Could not update team membership.' : 'Не удалось изменить состав команды.')
    } finally {
      setBusy(false)
    }
  }

  const onCreateSharedQuest = async (team: SocialTeam) => {
    const questId = selectedQuests[team.id]
    if (!questId || busy) return
    setBusy(true)
    setError(null)
    try {
      await createSharedTeamQuest(team.id, questId)
      setSelectedQuests((items) => ({ ...items, [team.id]: '' }))
      await refreshTeams()
      setNotice(en ? 'Shared quest started. Existing published completions count; its bonus can be earned once per person and quest.' : 'Совместный квест начат. Засчитываются уже опубликованные прохождения; бонус выдаётся каждому человеку только один раз за квест.')
    } catch {
      setError(en ? 'Could not start this shared quest.' : 'Не удалось запустить совместный квест.')
    } finally {
      setBusy(false)
    }
  }

  const onCheckSharedQuest = async (team: SocialTeam, quest: SharedTeamQuest) => {
    setBusy(true)
    setError(null)
    try {
      const result = await claimSharedTeamQuest(team.id, quest.id, language)
      await refreshTeams()
      setNotice(result.status === 'complete'
        ? result.rewards_credited > 0
          ? (en ? `Shared quest completed; one-time bonuses credited to ${result.rewards_credited} participants.` : `Совместный квест завершён; разовые бонусы начислены участникам: ${result.rewards_credited}.`)
          : (en ? 'Shared quest completed; no duplicate bonuses were issued.' : 'Совместный квест завершён; повторные бонусы не начислялись.')
        : (en ? `${result.completed_count}/${result.participant_count} members completed it.` : `Выполнили ${result.completed_count} из ${result.participant_count}.`))
    } catch {
      setError(en ? 'Could not refresh this shared quest.' : 'Не удалось обновить совместный квест.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-3 border-t border-hairline pt-4" aria-labelledby="teams-heading">
      <h2 id="teams-heading" className="font-sans text-sm font-semibold text-text">{en ? 'Teams' : 'Команды'}</h2>
      <form onSubmit={(event) => void onCreateTeam(event)} className="flex gap-2">
        <input
          aria-label={en ? 'Team name' : 'Название команды'}
          maxLength={80}
          value={teamName}
          onChange={(event) => setTeamName(event.target.value)}
          placeholder={en ? 'Team name' : 'Название команды'}
          className="h-10 min-w-0 flex-1 rounded-md border border-hairline bg-panel px-3 font-sans text-sm text-text"
        />
        <Button type="submit" size="sm" disabled={busy || !teamName.trim()}><UserPlus />{en ? 'Create team' : 'Создать команду'}</Button>
      </form>
      {loading && <p role="status" className="text-sm text-text-muted">{en ? 'Loading teams…' : 'Загружаем команды…'}</p>}
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      {!loading && !error && teams.length === 0 && <p className="text-xs text-text-muted">{en ? 'Create a team, then add people from your friends list.' : 'Создайте команду и добавьте в неё друзей.'}</p>}
      {teams.map((team) => {
        const currentMemberIds = new Set(team.members.map((member) => member.id))
        const availableFriends = friends.filter((friend) => !currentMemberIds.has(friend.id))
        return (
          <GlassPanel key={team.id} className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-sans text-sm font-semibold text-text">{team.name}</h3>
              <Chip size="sm">{team.role === 'owner' ? (en ? 'Owner' : 'Владелец') : team.role === 'admin' ? (en ? 'Admin' : 'Админ') : (en ? 'Member' : 'Участник')}</Chip>
            </div>
            <ul className="space-y-2">
              {team.members.map((member) => (
                <li key={member.id} className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="min-w-0 flex-1 truncate">{member.name || (en ? 'Crista traveler' : 'Путешественник Crista')}</span>
                  {team.role === 'owner' && member.role !== 'owner' && (
                    <select
                      aria-label={`${en ? 'Role for' : 'Роль для'} ${member.name || member.id}`}
                      value={member.role}
                      disabled={busy}
                      onChange={(event) => void onChangeRole(team, member.id, event.target.value as 'admin' | 'member')}
                      className="h-8 rounded border border-hairline bg-panel px-2 text-xs text-text"
                    >
                      <option value="member">{en ? 'Member' : 'Участник'}</option>
                      <option value="admin">{en ? 'Admin' : 'Админ'}</option>
                    </select>
                  )}
                  {(team.role === 'owner' && member.role !== 'owner') || (team.role === 'admin' && member.role === 'member') || (member.id === userId && member.role !== 'owner') ? (
                    <IconButton label={en ? `Remove ${member.name || 'member'}` : `Удалить ${member.name || 'участника'}`} variant="ghost" size="sm" disabled={busy} onClick={() => void onRemoveMember(team, member.id)}><UserRoundX /></IconButton>
                  ) : null}
                </li>
              ))}
            </ul>
            {(team.role === 'owner' || team.role === 'admin') && availableFriends.length > 0 && (
              <div className="flex gap-2">
                <select
                  aria-label={`${en ? 'Add friend to' : 'Добавить друга в'} ${team.name}`}
                  value={selectedFriends[team.id] || ''}
                  onChange={(event) => setSelectedFriends((items) => ({ ...items, [team.id]: event.target.value }))}
                  className="h-9 min-w-0 flex-1 rounded border border-hairline bg-panel px-2 text-xs text-text"
                >
                  <option value="">{en ? 'Choose a friend' : 'Выберите друга'}</option>
                  {availableFriends.map((friend) => <option key={friend.id} value={friend.id}>{friend.name || friend.id}</option>)}
                </select>
                <Button size="sm" variant="secondary" disabled={busy || !selectedFriends[team.id]} onClick={() => void onAddFriend(team)}>{en ? 'Add' : 'Добавить'}</Button>
              </div>
            )}
            <div className="space-y-2 border-t border-hairline pt-3">
              <h4 className="font-sans text-xs font-semibold text-text-secondary">{en ? 'Shared quests' : 'Совместные квесты'}</h4>
              {questError && <p role="alert" className="text-xs text-error">{questError}</p>}
              {(team.role === 'owner' || team.role === 'admin') && questCatalog.length > 0 && (
                <div className="flex gap-2">
                  <select
                    aria-label={`${en ? 'Quest for' : 'Квест для'} ${team.name}`}
                    value={selectedQuests[team.id] || ''}
                    onChange={(event) => setSelectedQuests((items) => ({ ...items, [team.id]: event.target.value }))}
                    className="h-9 min-w-0 flex-1 rounded border border-hairline bg-panel px-2 text-xs text-text"
                  >
                    <option value="">{en ? 'Choose a published quest' : 'Выберите опубликованный квест'}</option>
                    {questCatalog.filter((item) => !(sharedQuests[team.id] || []).some((shared) => shared.quest_id === item.id)).map((item) => (
                      <option key={item.id} value={item.id}>{item.city_name} · {item.title}</option>
                    ))}
                  </select>
                  <Button size="sm" variant="secondary" disabled={busy || team.members.length < 2 || !selectedQuests[team.id]} onClick={() => void onCreateSharedQuest(team)}>{en ? 'Start' : 'Начать'}</Button>
                </div>
              )}
              {team.members.length < 2 && <p className="text-xs text-text-muted">{en ? 'Add a friend before starting a shared quest.' : 'Добавьте друга, чтобы начать совместный квест.'}</p>}
              {(sharedQuests[team.id] || []).map((quest) => (
                <div key={quest.id} className="rounded-md border border-hairline p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-xs font-medium text-text">{quest.quest_title}</span>
                    <span className="shrink-0 text-xs text-text-muted">{quest.completed_count}/{quest.participant_count}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-text-secondary">
                      {quest.status === 'complete' ? (en ? 'Completed · bonus protected' : 'Завершён · защита от повторной награды') : quest.ready_to_claim ? (en ? 'Ready to settle' : 'Готов к завершению') : (en ? 'In progress' : 'В процессе')}
                    </span>
                    {quest.status === 'active' && <Button size="sm" variant="ghost" disabled={busy} onClick={() => void onCheckSharedQuest(team, quest)}>{en ? 'Check progress' : 'Проверить прогресс'}</Button>}
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        )
      })}
      {notice && <p role="status" className="text-sm text-text-secondary">{notice}</p>}
    </section>
  )
}

export function CommunityPanel({ onBack }: CommunityPanelProps) {
  const { language, user } = useApp()
  const en = language === 'en'
  return (
    <div className="h-full overflow-y-auto">
      <div className="relative z-10">
        <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-5 pb-2 pt-6 sm:px-6">
          <IconButton label={en ? 'Back' : 'Назад'} variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
            <ArrowLeft />
          </IconButton>
          <h1 className="font-display text-2xl font-semibold text-text">{en ? 'Community' : 'Сообщество'}</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-5 pb-8 pt-4 sm:px-6">
        <Tabs defaultValue="routes" className="w-full">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-md border border-hairline bg-panel p-1 sm:w-fit">
            <TabsTrigger value="routes" className="rounded-sm px-4 py-2">Маршруты звёзд и друзей</TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-sm px-4 py-2">Лидерборд</TabsTrigger>
          <TabsTrigger value="friends" className="rounded-sm px-4 py-2">{en ? 'Friends' : 'Друзья'}</TabsTrigger>
          </TabsList>

          {/* Маршруты */}
          <TabsContent value="routes" className="mt-6 outline-none">
            <div className="grid gap-4 sm:grid-cols-2">
              {starRoutes.map((route) => (
                <article
                  key={route.id}
                  className="group overflow-hidden rounded-lg border border-hairline bg-panel transition duration-base ease-standard hover:border-hairline-2 hover:bg-panel-2"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Img
                      src={route.cover}
                      alt={route.title}
                      className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
                    />
                    <div className="photo-scrim absolute inset-0" />
                    <button
                      aria-label={`Открыть маршрут «${route.title}»`}
                      className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-ink-950 opacity-0 transition-opacity duration-base group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Chip size="sm">{route.kind}</Chip>
                      <span className="truncate font-sans text-xs text-text-muted">{route.author}</span>
                    </div>
                    <h3 className="mb-2 font-display text-xl font-semibold leading-tight text-text">
                      {route.title}
                    </h3>
                    <div className="flex items-center justify-between font-sans text-xs text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        <span className="tabular">{route.likes.toLocaleString('ru')}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="tabular">{route.points} точек</span>
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>

          {/* Лидерборд */}
          <TabsContent value="leaderboard" className="mt-6 outline-none">
            <LeagueSection language={language} />
          </TabsContent>

          {/* Друзья */}
          <TabsContent value="friends" className="mt-6 outline-none">
            <FriendsSection language={language} userId={user?.id} />
          </TabsContent>
        </Tabs>

        <p className="mt-6 flex items-start gap-2 rounded-lg border border-dashed border-hairline-2 p-4 font-sans text-xs leading-relaxed text-text-muted">
          <Trophy className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Публикуйте собственные маршруты как шаблоны. Они попадают в общую ленту наравне с маршрутами звёзд.
        </p>
      </div>
    </div>
  )
}
