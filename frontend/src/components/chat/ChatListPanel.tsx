import { useState } from 'react'
import { Plus, Search, MessageSquare, ArrowLeft, MapPin } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { GlassPanel, Chip, IconButton } from '@/components/ui/glass'
import { Button } from '@/components/ui/button'
import { formatRelativeDate, cn } from '@/lib/utils'

interface ChatListPanelProps {
  onBack: () => void
}

/** Превью чата не должно показывать сырую разметку из ответа модели */
function stripMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function ChatListPanel({ onBack }: ChatListPanelProps) {
  const { chatHistory, currentChatId, loadChat, newChat } = useApp()
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? chatHistory.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    : chatHistory

  const getLastMessage = (chat: (typeof chatHistory)[0]): string => {
    if (!chat.messages || chat.messages.length === 0) {
      return chat.destination || chat.title || 'Нажмите, чтобы загрузить'
    }
    const last = chat.messages[chat.messages.length - 1]
    if (!last.content) return chat.title || 'Нет сообщений'
    const clean = stripMarkdown(last.content)
    return clean.length > 90 ? `${clean.slice(0, 90)}...` : clean
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-5 pt-6 sm:px-6">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <IconButton label="Назад" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
                <ArrowLeft />
              </IconButton>
              <h1 className="font-display text-2xl font-semibold text-text">Чаты</h1>
              <Chip size="sm" className="tabular">{chatHistory.length}</Chip>
            </div>
            <Button size="sm" onClick={() => newChat()}>
              <Plus />
              Новый чат
            </Button>
          </div>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <label htmlFor="chat-search" className="sr-only">Поиск по чатам</label>
            <input
              id="chat-search"
              type="text"
              placeholder="Поиск по чатам"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-md border border-hairline bg-panel pl-10 pr-4 font-sans text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        <div className="mx-auto max-w-[900px]">
          {filtered.length > 0 ? (
            <div className="space-y-2">
              {filtered.map((chat) => {
                const active = currentChatId === chat.id
                return (
                  <button
                    key={chat.id}
                    onClick={() => loadChat(chat.id)}
                    className={cn(
                      'group w-full rounded-lg border p-4 text-left transition duration-base ease-standard',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      active
                        ? 'border-primary/40 bg-primary/[0.09]'
                        : 'border-hairline bg-panel hover:border-hairline-2 hover:bg-panel-2'
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        className={cn(
                          'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors',
                          active
                            ? 'bg-primary/20 text-primary'
                            : 'bg-panel-2 text-text-muted group-hover:text-text-secondary'
                        )}
                      >
                        <MessageSquare className="h-5 w-5" aria-hidden="true" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="mb-1 flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              'truncate font-display text-lg font-semibold leading-tight',
                              active ? 'text-primary' : 'text-text'
                            )}
                          >
                            {chat.title}
                          </span>
                          <span className="shrink-0 whitespace-nowrap font-sans text-[11px] text-text-muted">
                            {formatRelativeDate(chat.createdAt)}
                          </span>
                        </span>

                        {chat.destination && (
                          <span className="mb-1 flex items-center gap-1.5 font-sans text-xs text-text-muted">
                            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                            <span className="truncate">{chat.destination}</span>
                          </span>
                        )}

                        <span className="line-clamp-2 font-sans text-xs leading-relaxed text-text-secondary">
                          {getLastMessage(chat)}
                        </span>
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <GlassPanel className="flex flex-col items-center justify-center px-8 py-14 text-center">
              {search.trim() ? (
                <>
                  <Search className="mb-3 h-9 w-9 text-text-muted" aria-hidden="true" />
                  <p className="font-sans text-sm text-text-secondary">
                    По запросу «{search}» ничего не нашлось
                  </p>
                  <button
                    onClick={() => setSearch('')}
                    className="mt-2 font-sans text-sm text-link transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Показать все чаты
                  </button>
                </>
              ) : (
                <>
                  <MessageSquare className="mb-3 h-9 w-9 text-text-muted" aria-hidden="true" />
                  <p className="font-sans text-sm text-text-secondary">Чатов пока нет</p>
                  <p className="mt-1 font-sans text-xs text-text-muted">
                    Опишите поездку, и Crista соберёт маршрут
                  </p>
                  <Button className="mt-4" onClick={() => newChat()}>
                    <Plus />
                    Новый чат
                  </Button>
                </>
              )}
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  )
}
