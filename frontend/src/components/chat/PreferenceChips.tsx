import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Users, Wallet, Compass, Clock, Activity, PlaneTakeoff } from 'lucide-react'
import type { BackendPreferences } from '@/types'

interface PreferenceChipsProps {
  preferences: BackendPreferences | null
}

interface ChipDef {
  key: string
  icon: React.ReactNode
  label: string
  value: string
}

const iconClass = 'w-3 h-3'

function buildChips(p: BackendPreferences): ChipDef[] {
  const chips: ChipDef[] = []

  if (p.origin_city) {
    chips.push({ key: 'origin', icon: <PlaneTakeoff className={iconClass} />, label: 'Откуда', value: p.origin_city })
  }
  if (p.city) {
    chips.push({ key: 'city', icon: <MapPin className={iconClass} />, label: 'Куда', value: p.city })
  }
  if (p.destination_type) {
    chips.push({ key: 'type', icon: <Compass className={iconClass} />, label: 'Тип', value: p.destination_type })
  }
  if (p.travel_companions) {
    chips.push({ key: 'companions', icon: <Users className={iconClass} />, label: 'Компания', value: p.travel_companions })
  }
  if (p.budget) {
    chips.push({ key: 'budget', icon: <Wallet className={iconClass} />, label: 'Бюджет', value: p.budget })
  }
  if (p.duration_days) {
    chips.push({ key: 'days', icon: <Clock className={iconClass} />, label: 'Дней', value: String(p.duration_days) })
  }
  if (p.activities && p.activities.length > 0) {
    chips.push({ key: 'activities', icon: <Activity className={iconClass} />, label: 'Активности', value: p.activities.join(', ') })
  }

  return chips
}

export function PreferenceChips({ preferences }: PreferenceChipsProps) {
  if (!preferences) return null

  const chips = buildChips(preferences)
  if (chips.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="flex flex-wrap gap-1.5 px-1 pb-2"
    >
      <AnimatePresence mode="popLayout">
        {chips.map((chip) => (
          <motion.span
            key={chip.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-primary/10 text-primary border border-primary/20"
          >
            {chip.icon}
            <span className="text-text-muted">{chip.label}:</span>
            <span className="font-medium">{chip.value}</span>
          </motion.span>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
