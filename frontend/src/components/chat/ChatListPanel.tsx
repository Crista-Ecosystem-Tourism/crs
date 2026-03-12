import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, MessageSquare, ArrowLeft } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { formatRelativeDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ChatListPanelProps {
  onBack: () => void
}

export function ChatListPanel({ onBack }: ChatListPanelProps) {
  const { chatHistory, currentChatId, loadChat, newChat } = useApp()
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? chatHistory.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase())
      )
    : chatHistory

  const getLastMessage = (chat: typeof chatHistory[0]): string => {
    if (!chat.messages || chat.messages.length === 0) {
      // Show destination or title as fallback when messages not loaded yet
      return chat.destination || chat.title || 'Нажмите, чтобы загрузить'
    }
    const last = chat.messages[chat.messages.length - 1]
    if (!last.content) return chat.title || 'Нет сообщений'
    return last.content.length > 80
      ? last.content.slice(0, 80) + '...'
      : last.content
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-text-secondary" />
            </button>
            <h1 className="text-xl font-bold text-text">Чаты</h1>
            <span className="text-xs text-text-muted bg-surface-light rounded-full px-2 py-0.5">
              {chatHistory.length}
            </span>
          </div>
          <button
            onClick={() => newChat()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Новый чат
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Поиск по чатам..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-surface-light text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length > 0 ? (
          <div className="space-y-1.5">
            {filtered.map((chat, i) => (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => loadChat(chat.id)}
                className={cn(
                  'w-full text-left p-3.5 rounded-xl transition-all group',
                  currentChatId === chat.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-surface-light border border-transparent'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                    currentChatId === chat.id
                      ? 'bg-primary/20 text-primary'
                      : 'bg-surface-hover text-text-muted group-hover:bg-surface-hover'
                  )}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={cn(
                        'text-sm font-semibold truncate',
                        currentChatId === chat.id ? 'text-primary' : 'text-text'
                      )}>
                        {chat.title}
                      </h3>
                      <span className="text-[11px] text-text-muted whitespace-nowrap flex-shrink-0">
                        {formatRelativeDate(chat.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {getLastMessage(chat)}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : search.trim() ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Search className="w-10 h-10 text-text-muted/30 mb-3" />
            <p className="text-sm text-text-secondary">Ничего не найдено</p>
            <p className="text-xs text-text-muted mt-1">Попробуйте другой запрос</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageSquare className="w-10 h-10 text-text-muted/30 mb-3" />
            <p className="text-sm text-text-secondary">Чатов пока нет</p>
            <p className="text-xs text-text-muted mt-1">Создайте первый чат, чтобы начать</p>
            <button
              onClick={() => newChat()}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Новый чат
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
