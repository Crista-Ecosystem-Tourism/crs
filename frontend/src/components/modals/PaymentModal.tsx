import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Smartphone, Lock, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/context/AppContext'
import { subscriptionPlans } from '@/mocks/subscriptions'
import { cn } from '@/lib/utils'

type PaymentMethod = 'card' | 'sbp'

export function PaymentModal() {
  const { activeModal, closeModal, openModal, selectedPlan, subscribe } = useApp()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const isOpen = activeModal === 'payment'
  const plan = subscriptionPlans.find(p => p.id === selectedPlan)

  const handlePayment = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    
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

        {/* Payment method tabs */}
        <div className="flex gap-2 p-1 bg-surface-light rounded-lg">
          <button
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors',
              paymentMethod === 'card' 
                ? 'bg-surface text-text shadow-sm' 
                : 'text-text-secondary hover:text-text'
            )}
            onClick={() => setPaymentMethod('card')}
          >
            <CreditCard className="w-4 h-4" />
            Карта
          </button>
          <button
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors',
              paymentMethod === 'sbp' 
                ? 'bg-surface text-text shadow-sm' 
                : 'text-text-secondary hover:text-text'
            )}
            onClick={() => setPaymentMethod('sbp')}
          >
            <Smartphone className="w-4 h-4" />
            СБП
          </button>
        </div>

        <motion.div
          key={paymentMethod}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="py-4 space-y-4"
        >
          {paymentMethod === 'card' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">Номер карты</label>
                <Input 
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">Срок</label>
                  <Input placeholder="MM/YY" maxLength={5} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">CVV</label>
                  <Input placeholder="•••" type="password" maxLength={3} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text">Имя на карте</label>
                <Input placeholder="IVAN IVANOV" />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-32 h-32 mx-auto mb-4 bg-surface-light rounded-2xl flex items-center justify-center">
                <div className="text-6xl">📱</div>
              </div>
              <p className="text-sm text-text-secondary mb-2">
                Отсканируйте QR-код в приложении вашего банка
              </p>
              <p className="text-xs text-text-muted">
                или нажмите "Оплатить" для перехода в приложение
              </p>
            </div>
          )}
        </motion.div>

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-text-muted py-2">
          <Lock className="w-3 h-3" />
          <span>Данные защищены по стандарту PCI DSS</span>
        </div>

        <Button 
          className="w-full h-12" 
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            `Оплатить ${plan?.priceLabel}`
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

