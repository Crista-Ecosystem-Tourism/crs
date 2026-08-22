import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Crown, Sparkles, Zap, ShieldCheck, Gem } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { subscriptionPlans } from '@/mocks/subscriptions'
import { PlanDetails, SubscriptionPlan } from '@/types'
import { cn } from '@/lib/utils'

function PlanCard({ plan, isSelected, onSelect, isAnnual }: {
  plan: PlanDetails
  isSelected: boolean
  onSelect: () => void
  isAnnual: boolean
}) {
  const icons: Record<SubscriptionPlan, any> = {
    basic: Zap,
    pro: ShieldCheck,
    premium: Gem,
  }
  const Icon = icons[plan.id]
  const isPremium = plan.id === 'premium'

  // Calculate annual price (approx 20% discount)
  const monthlyPrice = plan.price
  const annualPrice = Math.round(monthlyPrice * 0.8)
  const displayPrice = isAnnual ? annualPrice : monthlyPrice
  const periodLabel = isAnnual ? 'в месяц / год' : '/ мес'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, shadow: '0 20px 40px rgba(0,0,0,0.06)' }}
      className={cn(
        'relative p-6 rounded-[28px] border-2 cursor-pointer transition-all duration-300 flex flex-col h-full',
        isSelected
          ? 'border-[#1a1a1a] bg-white shadow-2xl'
          : 'border-black/[0.06] bg-panel0 hover:border-black/20 hover:bg-white shadow-sm',
        isPremium && isSelected && 'ring-4 ring-amber-400/20'
      )}
      onClick={onSelect}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-6 px-4 py-1 bg-[#1a1a1a] text-white text-[0.65rem] font-black uppercase tracking-[0.15em] rounded-full shadow-lg z-10">
          Популярный
        </div>
      )}

      {isPremium && (
        <div className="absolute top-4 right-6">
          <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
        </div>
      )}

      <div className="mb-6">
        <div className={cn(
          'w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110',
          isPremium ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
            plan.id === 'pro' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' :
              'bg-gray-100 text-gray-500'
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[1.1rem] font-bold text-[#1a1a1a] tracking-tight text-left">{plan.name}</h3>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-[#1a1a1a] tracking-tighter">{displayPrice.toLocaleString('ru')} ₽</span>
            <span className="text-[0.75rem] font-bold text-[#888888]">{periodLabel}</span>
          </div>
          {isAnnual && (
            <p className="text-[0.65rem] font-bold text-emerald-600 mt-1 uppercase tracking-wider">Экономия 20%</p>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className={cn(
              "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
              isSelected ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
            )}>
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span className={cn(
              "text-[0.85rem] font-medium leading-tight text-left",
              isSelected ? "text-[#1a1a1a]" : "text-[#888888]"
            )}>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {isSelected ? (
          <div className="flex items-center justify-center gap-2 py-2 text-[0.75rem] font-bold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
            <Check className="w-3.5 h-3.5" />
            Выбрано
          </div>
        ) : (
          <div className="py-2 text-[0.75rem] font-bold text-[#aaaaaa] text-center uppercase tracking-widest">
            Выбрать
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function SubscriptionModal() {
  const { activeModal, closeModal, openModal, selectedPlan, setSelectedPlan } = useApp()
  const [isAnnual, setIsAnnual] = useState(false)
  const isOpen = activeModal === 'subscription'

  // Pre-select "pro" plan if nothing is selected
  useEffect(() => {
    if (isOpen && !selectedPlan) {
      setSelectedPlan('pro')
    }
  }, [isOpen, selectedPlan, setSelectedPlan])

  const handleContinue = () => {
    if (selectedPlan) {
      openModal('payment')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-5xl p-0 overflow-hidden rounded-[32px] border-none shadow-2xl bg-transparent scale-modal">
        <div className="relative bg-[#fafafa] p-8 md:p-12 max-h-[90vh] overflow-y-auto scrollbar-hide">
          {/* Background Mesh */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,_#f0f4ff_0%,_transparent_50%),radial-gradient(circle_at_100%_100%,_#fdf2f8_0%,_transparent_50%)] opacity-60" />

          <DialogHeader className="mb-10 relative">
            <div className="mx-auto w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center mb-6 border border-black/[0.03]">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <DialogTitle className="text-center text-3xl font-black tracking-tight text-[#1a1a1a] mb-3">
              Кристальный выбор
            </DialogTitle>
            <DialogDescription className="text-center text-[1rem] font-medium text-[#888888] max-w-md mx-auto leading-relaxed">
              Выберите подходящий тариф и откройте доступ ко всем возможностям AI-путешествий
            </DialogDescription>
          </DialogHeader>

          {/* Billing Toggle UX */}
          <div className="flex justify-center mb-10">
            <div className="bg-white p-1 rounded-2xl border border-black/[0.05] shadow-sm flex items-center">
              <button
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[0.85rem] font-bold transition-all",
                  !isAnnual ? "bg-[#1a1a1a] text-white shadow-lg" : "text-[#888888] hover:text-black"
                )}
              >
                Ежемесячно
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[0.85rem] font-bold transition-all flex items-center gap-2",
                  isAnnual ? "bg-[#1a1a1a] text-white shadow-lg" : "text-[#888888] hover:text-black"
                )}
              >
                Ежегодно
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[0.6rem] rounded-full uppercase tracking-tighter">
                  -20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <AnimatePresence mode="wait">
              {subscriptionPlans.map((plan, index) => (
                <motion.div
                  key={`${plan.id}-${isAnnual}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="h-full"
                >
                  <PlanCard
                    plan={plan}
                    isSelected={selectedPlan === plan.id}
                    onSelect={() => setSelectedPlan(plan.id)}
                    isAnnual={isAnnual}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-12 bg-white/40 p-6 rounded-[32px] border border-white/50 backdrop-blur-sm">
            <Button
              variant="outline"
              onClick={closeModal}
              className="flex-1 h-16 rounded-2xl border-black/[0.1] text-[#666666] font-bold hover:bg-black/5 hover:text-black transition-all bg-white shadow-sm"
            >
              Вернуться позже
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedPlan}
              className={cn(
                "flex-1 h-16 rounded-2xl font-bold text-lg shadow-2xl transition-all active:scale-95",
                selectedPlan
                  ? "bg-[#1a1a1a] text-white hover:bg-black shadow-primary/20"
                  : "bg-gray-100 text-gray-400 opacity-50"
              )}
            >
              Оформить подписку
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-[0.65rem] font-black text-[#cccccc] uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Безопасная оплата
            </span>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Мгновенный доступ
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
