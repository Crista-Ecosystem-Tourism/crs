import { Lock, ArrowLeft } from 'lucide-react'
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
import { isMockMode } from '@/api/chatApi'

export function PaymentModal() {
  const { activeModal, closeModal, openModal, selectedPlan, subscribe } = useApp()
  
  const isOpen = activeModal === 'payment'
  const plan = subscriptionPlans.find(p => p.id === selectedPlan)
  const demoMode = isMockMode()

  const activateDemoAccess = () => {
    if (!demoMode) return
    if (selectedPlan) {
      subscribe(selectedPlan)
    }
  }

  const handleBack = () => {
    openModal('subscription')
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon-sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <DialogTitle>Оплата</DialogTitle>
          </div>
          <DialogDescription>
            Тариф «{plan?.name}» — {plan?.priceLabel}
          </DialogDescription>
        </DialogHeader>

        {demoMode ? <>
        <div className="space-y-3 py-4">
          <p className="rounded-lg border border-primary/25 bg-primary/10 p-4 text-sm leading-relaxed text-text-secondary">
            Демонстрационный режим: платёж не создаётся и деньги не списываются. Доступ включается только в этом браузере.
          </p>
          <p className="text-xs leading-relaxed text-text-muted">
            Не вводите данные карты или СБП: для настоящей оплаты Crista откроет страницу сертифицированного платёжного провайдера.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted py-2">
          <Lock className="w-3 h-3" />
          <span>Платёжные данные в демо-режиме не запрашиваются</span>
        </div>

        <Button 
          className="w-full h-12" 
          onClick={activateDemoAccess}
        >
          Активировать демо-доступ
        </Button>
        </> : (
          <div className="space-y-4 py-4">
            <p className="rounded-lg border border-hairline bg-surface-light p-4 text-sm leading-relaxed text-text-secondary">
              Онлайн-оплата ещё не подключена. Crista не принимает и не сохраняет данные карты до интеграции с сертифицированным платёжным провайдером.
            </p>
            <Button className="w-full" onClick={handleBack}>Вернуться к тарифам</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
