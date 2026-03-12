import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Map, MapPin, Crown, ChevronRight, ChevronLeft, Camera, Share2, Award, Compass, Star, Globe, Bell, HelpCircle, Lock } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/layout/Sidebar'
import { getInitials } from '@/lib/utils'

const MOCK_STATS = {
  chats: 12,
  routes: 5,
  places: 28
}

const MOCK_TRIPS = [
  { id: '1', name: 'Париж', emoji: '🗼', days: 5, date: 'Дек 2024', gradient: 'from-pink-500 to-rose-500' },
  { id: '2', name: 'Токио', emoji: '🗾', days: 7, date: 'Окт 2024', gradient: 'from-red-500 to-orange-500' },
  { id: '3', name: 'Барселона', emoji: '🏖️', days: 4, date: 'Авг 2024', gradient: 'from-amber-500 to-yellow-500' },
  { id: '4', name: 'Нью-Йорк', emoji: '🗽', days: 6, date: 'Июн 2024', gradient: 'from-blue-500 to-cyan-500' },
]

const ACHIEVEMENTS = [
  { id: '1', icon: Compass, label: 'Исследователь', description: '10+ маршрутов', color: 'text-emerald-500', bg: 'bg-emerald-500/10', unlocked: true },
  { id: '2', icon: Globe, label: 'Путешественник', description: '5+ стран', color: 'text-blue-500', bg: 'bg-blue-500/10', unlocked: true },
  { id: '3', icon: Star, label: 'Звезда', description: '50+ мест', color: 'text-yellow-500', bg: 'bg-yellow-500/10', unlocked: false },
  { id: '4', icon: Award, label: 'Мастер', description: '100+ чатов', color: 'text-purple-500', bg: 'bg-purple-500/10', unlocked: false },
]

const CARD_WIDTH = 260 // ширина карточки + gap

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, openModal } = useApp()
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return
    const scrollAmount = direction === 'left' ? -CARD_WIDTH : CARD_WIDTH
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Профиль ${user.name}`,
        text: `Посмотрите профиль ${user.name} в Crista Online`,
        url: window.location.href,
      })
    } catch {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-primary/10">
      {/* Premium Background Layer */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,_#f0f4ff_0%,_transparent_50%),radial-gradient(circle_at_100%_100%,_#fdf2f8_0%,_transparent_50%),radial-gradient(circle_at_100%_0%,_#f0fdf4_0%,_transparent_50%)] opacity-80" />

      <div className="flex h-full relative z-10">
        <Sidebar />

        <main className="flex-1 relative h-full min-w-0 overflow-auto">
          {/* Top Bar */}
          <div className="sticky top-0 z-30 bg-white/40 backdrop-blur-xl border-b border-black/[0.03]">
            <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-all text-[#666666] hover:text-black"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-[1.1rem] font-bold tracking-tight">Личный кабинет</h1>
              </div>
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white shadow-md border border-black/[0.1] hover:bg-black/5 transition-all group"
              >
                <Share2 className="w-4 h-4 text-[#444444] group-hover:text-black" />
              </button>
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-6 py-12">
            {/* Profile Intro Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[32px] bg-white border border-black/[0.08] p-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] mb-10"
            >
              {/* Glossy Overlay */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500" />
                  <Avatar className="w-32 h-32 border-4 border-white shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 text-3xl font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform border-4 border-white"
                    onClick={() => { }}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                    <h2 className="text-[2rem] font-bold tracking-tight leading-none text-[#1a1a1a]">{user.name}</h2>
                    {user.subscription === 'premium' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[0.7rem] font-bold uppercase tracking-wider">
                        <Crown className="w-3 h-3" /> Premium
                      </span>
                    )}
                  </div>
                  <p className="text-[1.rem] text-[#888888] mb-6 font-medium">{user.email}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Button
                      onClick={() => navigate('/settings')}
                      className="rounded-full bg-[#1a1a1a] text-white hover:bg-black h-11 px-8 font-bold"
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full border-[#d0d0d0] h-11 px-8 font-bold hover:bg-black/5 text-[#444444] hover:text-black"
                    >
                      Настройки
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              {[
                { label: 'Чатов', value: MOCK_STATS.chats, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Маршрутов', value: MOCK_STATS.routes, icon: Map, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { label: 'Мест', value: MOCK_STATS.places, icon: MapPin, color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ y: -4, shadow: '0 25px 50px rgba(0,0,0,0.06)' }}
                  className="bg-white rounded-[24px] p-6 border border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center group transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <p className="text-[1.75rem] font-bold text-[#1a1a1a] mb-1 leading-none">{stat.value}</p>
                  <p className="text-xs font-bold text-[#888888] uppercase tracking-widest">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Achievements Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10"
            >
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-[0.75rem] font-black text-[#666666] uppercase tracking-[0.2em]">Достижения</h3>
                <span className="text-[0.75rem] font-bold text-[#1a1a1a] bg-white px-3 py-1 rounded-full border border-black/[0.08] shadow-sm">2 из 4 разблокировано</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ACHIEVEMENTS.map((achievement) => {
                  const Icon = achievement.icon
                  return (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className={`relative overflow-hidden rounded-[24px] border p-5 flex flex-col items-center text-center transition-all ${achievement.unlocked
                        ? 'bg-white border-black/[0.08] shadow-sm'
                        : 'bg-white/40 border-black/[0.04] opacity-60 grayscale'
                        }`}
                    >
                      <div className={`w-14 h-14 rounded-full ${achievement.bg} flex items-center justify-center mb-4`}>
                        <Icon className={`w-7 h-7 ${achievement.color}`} />
                      </div>
                      <h4 className="text-[0.9rem] font-bold text-[#1a1a1a] mb-1">{achievement.label}</h4>
                      <p className="text-[0.7rem] font-medium text-[#888888] leading-tight px-2">{achievement.description}</p>
                      {!achievement.unlocked && (
                        <div className="absolute top-2 right-2">
                          <Star className="w-3 h-3 text-[#cccccc]" />
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Trips Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-10"
            >
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-[0.75rem] font-black text-[#888888] uppercase tracking-[0.2em]">Мои приключения</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => scroll('left')}
                      className="w-9 h-9 rounded-full bg-white border border-black/[0.08] shadow-sm flex items-center justify-center hover:bg-black/5 hover:border-black/15 transition-all active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#666666]" />
                    </button>
                    <button
                      onClick={() => scroll('right')}
                      className="w-9 h-9 rounded-full bg-white border border-black/[0.08] shadow-sm flex items-center justify-center hover:bg-black/5 hover:border-black/15 transition-all active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4 text-[#666666]" />
                    </button>
                  </div>
                  <button className="text-[0.75rem] font-bold text-blue-600 hover:text-blue-700">Смотреть все</button>
                </div>
              </div>
              <div
                ref={sliderRef}
                className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide scroll-smooth"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {MOCK_TRIPS.map((trip) => (
                  <motion.div
                    key={trip.id}
                    whileHover={{ y: -8 }}
                    className="flex-shrink-0 w-[240px] rounded-[28px] overflow-hidden bg-white border border-black/[0.08] shadow-sm group cursor-pointer transition-all hover:shadow-2xl hover:shadow-black/[0.06]"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className={`h-[140px] bg-gradient-to-br ${trip.gradient} flex items-center justify-center relative`}>
                      <span className="text-[4.5rem] drop-shadow-2xl transform transition-transform group-hover:scale-110 duration-500">{trip.emoji}</span>
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[0.65rem] font-bold uppercase tracking-wider">
                        {trip.days} дн.
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-[1.1rem] font-bold text-[#1a1a1a] mb-1">{trip.name}</h4>
                      <div className="flex items-center justify-between text-[#888888]">
                        <span className="text-[0.75rem] font-medium">{trip.date}</span>
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Account Settings List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-[28px] overflow-hidden border border-black/[0.08] shadow-sm divide-y divide-black/[0.04]"
            >
              {[
                { label: 'Безопасность и пароль', icon: Lock, onClick: () => navigate('/settings') },
                { label: 'Уведомления', icon: Bell, onClick: () => { } },
                { label: 'Подписка и оплата', icon: Crown, onClick: () => openModal('subscription') },
                { label: 'Помощь и поддержка', icon: HelpCircle, onClick: () => navigate('/support') },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between px-10 py-6 hover:bg-black/[0.01] transition-colors group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-[#aaaaaa] group-hover:text-black group-hover:bg-gray-100 transition-all">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[1rem] font-bold text-[#1a1a1a] tracking-tight">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#cccccc] group-hover:text-black group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
