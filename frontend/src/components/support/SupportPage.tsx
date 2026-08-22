import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Mail, MessageCircle, Send, CheckCircle, Headphones, BookOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/layout/Sidebar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQ_ITEMS = [
  {
    id: '1',
    question: 'Как создать маршрут?',
    answer: 'Чтобы создать маршрут, начните новый чат и опишите свои пожелания. AI-ассистент предложит вам оптимальный маршрут с учётом ваших интересов, бюджета и времени.',
    category: 'features'
  },
  {
    id: '2',
    question: 'Как отменить подписку?',
    answer: 'Перейдите в раздел "Профиль" → "Управлять подпиской" → "Отменить подписку". Подписка останется активной до конца оплаченного периода.',
    category: 'billing'
  },
  {
    id: '3',
    question: 'Как сохранить место в избранное?',
    answer: 'Нажмите на иконку сердечка рядом с местом на карте или в карточке места. Сохранённые места доступны в разделе "Сохранённое" в боковом меню.',
    category: 'features'
  },
  {
    id: '4',
    question: 'Можно ли использовать офлайн?',
    answer: 'Да, сохранённые маршруты доступны офлайн. Для этого откройте маршрут и нажмите "Сохранить для офлайн". Карты и основная информация будут доступны без интернета.',
    category: 'features'
  },
  {
    id: '5',
    question: 'Как изменить валюту отображения цен?',
    answer: 'Перейдите в "Настройки" → "Внешний вид" → "Валюта" и выберите предпочитаемую валюту. Цены будут автоматически конвертированы.',
    category: 'account'
  },
  {
    id: '6',
    question: 'Как изменить данные аккаунта?',
    answer: 'Откройте "Настройки" → "Аккаунт" и нажмите на поле, которое хотите изменить. Вы можете обновить имя, email и пароль.',
    category: 'account'
  },
  {
    id: '7',
    question: 'Какие способы оплаты доступны?',
    answer: 'Мы принимаем банковские карты Visa, Mastercard, МИР, а также оплату через Apple Pay и Google Pay.',
    category: 'billing'
  },
]

const CATEGORIES = [
  { value: 'all', label: 'Все' },
  { value: 'account', label: 'Аккаунт' },
  { value: 'billing', label: 'Оплата' },
  { value: 'features', label: 'Функции' },
]

const CONTACT_TOPICS = [
  { value: 'general', label: 'Общий вопрос' },
  { value: 'bug', label: 'Сообщить об ошибке' },
  { value: 'feature', label: 'Предложить улучшение' },
  { value: 'billing', label: 'Вопрос по оплате' },
  { value: 'account', label: 'Проблема с аккаунтом' },
]

const MAX_MESSAGE_LENGTH = 1000

// Highlight search matches in text
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>

  const parts = text.split(new RegExp(`(${query})`, 'gi'))

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary/30 text-text rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

export function SupportPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const filteredFAQ = useMemo(() => {
    return FAQ_ITEMS.filter(item => {
      const matchesCategory = category === 'all' || item.category === category
      const matchesSearch = searchQuery.trim() === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic || !message.trim()) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setSubmitted(true)
    setTopic('')
    setMessage('')

    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="h-screen w-screen overflow-hidden text-text font-sans selection:bg-primary/30">
      {/* Global Background Gradient */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-60 pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/20 via-background to-background opacity-60 pointer-events-none" />

      <div className="flex h-full relative z-10">
        <Sidebar />

        <main className="flex-1 relative h-full min-w-0 overflow-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-hairline bg-header backdrop-blur-md">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-surface-hover transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-text" />
              </button>
              <h1 className="text-lg font-semibold text-text">Поддержка</h1>
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent p-6 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white blur-3xl"></div>
            </div>

            <div className="relative">
              <h2 className="text-xl font-bold mb-2">Чем можем помочь?</h2>
              <p className="text-white/80 text-sm mb-4">Выберите удобный способ связи или найдите ответ в FAQ</p>

              {/* Quick Action Buttons */}
              <div className="flex gap-3">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://t.me/crista_support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-colors"
                >
                  <Headphones className="w-4 h-4" />
                  <span className="text-sm font-medium">Чат с поддержкой</span>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="mailto:support@crista.online"
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">Email</span>
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm text-text-muted">Статус системы:</span>
            </div>
            <span className="text-sm font-medium text-emerald-500">Все системы работают</span>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              placeholder="Поиск по FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-surface border-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  category === cat.value
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text hover:border-primary/30'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <BookOpen className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">
              Частые вопросы
            </h3>
            <span className="text-xs text-text-muted">({filteredFAQ.length})</span>
          </div>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQ.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="border-b border-border last:border-b-0">
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-surface-hover transition-colors">
                    <HighlightText text={item.question} query={searchQuery} />
                  </AccordionTrigger>
                  <AccordionContent className="px-4 text-text-secondary">
                    <HighlightText text={item.answer} query={searchQuery} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFAQ.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-text-muted" />
                </div>
                <p className="text-text-muted">
                  Ничего не найдено по запросу "{searchQuery}"
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setCategory('all') }}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3 px-1">
            Написать нам
          </h3>
          <div className="bg-surface rounded-2xl border border-border p-4">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <p className="text-lg font-medium text-text mb-1">Сообщение отправлено!</p>
                <p className="text-sm text-text-muted">Мы ответим в ближайшее время</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Тема сообщения
                  </label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger className="w-full h-12 rounded-xl">
                      <SelectValue placeholder="Выберите тему..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_TOPICS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-text">
                      Сообщение
                    </label>
                    <span className={`text-xs ${message.length > MAX_MESSAGE_LENGTH * 0.9 ? 'text-warning' : 'text-text-muted'}`}>
                      {message.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                    placeholder="Опишите вашу проблему или вопрос..."
                    rows={4}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-surface-light text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl gap-2"
                  disabled={!topic || !message.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Отправить
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Contact Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3 px-1">
            Другие способы связи
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.a
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="mailto:support@crista.online"
              className="flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Email</p>
                <p className="text-xs text-text-muted">support@crista.online</p>
              </div>
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="https://t.me/crista_support"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border hover:border-[#229ED9]/30 hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-[#229ED9]/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#229ED9]" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Telegram</p>
                <p className="text-xs text-text-muted">@crista_support</p>
              </div>
            </motion.a>
          </div>
        </motion.div>

        {/* Help Center Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <BookOpen className="w-4 h-4" />
            Открыть полный справочный центр
          </a>
        </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
