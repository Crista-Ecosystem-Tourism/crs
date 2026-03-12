import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Users, Compass, Clock, Map, Pencil, X, PlaneTakeoff, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SuggestedReplyGroup } from '@/types'

interface QuickReplyChipsProps {
  groups: SuggestedReplyGroup[]
  selections: Record<string, string>
  onSelectionsChange: (selections: Record<string, string>) => void
  onBuildItinerary: () => void
  allPreferencesFilled: boolean
}

const iconMap: Record<string, React.ReactNode> = {
  wallet: <Wallet className="w-3.5 h-3.5" />,
  users: <Users className="w-3.5 h-3.5" />,
  compass: <Compass className="w-3.5 h-3.5" />,
  clock: <Clock className="w-3.5 h-3.5" />,
  plane: <PlaneTakeoff className="w-3.5 h-3.5" />,
}

export function QuickReplyChips({ groups, selections, onSelectionsChange, onBuildItinerary, allPreferencesFilled }: QuickReplyChipsProps) {
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({})
  const [showCustom, setShowCustom] = useState<Record<string, boolean>>({})
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (Object.keys(selections).length === 0) {
      setCustomInputs({})
      setShowCustom({})
    }
  }, [selections])

  const handleSelect = (category: string, value: string) => {
    const next = { ...selections }
    if (next[category] === value) {
      delete next[category]
    } else {
      next[category] = value
    }
    onSelectionsChange(next)
    setShowCustom(prev => ({ ...prev, [category]: false }))
    setCustomInputs(prev => {
      const updated = { ...prev }
      delete updated[category]
      return updated
    })
  }

  const handleCustomToggle = (category: string) => {
    setShowCustom(prev => ({ ...prev, [category]: !prev[category] }))
    if (!showCustom[category]) {
      const next = { ...selections }
      delete next[category]
      onSelectionsChange(next)
    }
  }

  const handleCustomChange = (category: string, value: string) => {
    setCustomInputs(prev => ({ ...prev, [category]: value }))
    const next = { ...selections }
    if (value.trim()) {
      next[category] = value.trim()
    } else {
      delete next[category]
    }
    onSelectionsChange(next)
  }

  const selectedCount = Object.keys(selections).length
  const selectedLabels = groups
    .filter(g => selections[g.category])
    .map(g => {
      const opt = g.options.find(o => o.value === selections[g.category])
      return opt ? opt.label : selections[g.category]
    })

  return (
    <div className="px-1 pb-2">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all',
          isExpanded
            ? 'bg-primary/10 border border-primary/20'
            : 'bg-surface-hover/50 border border-border/30 hover:bg-surface-hover'
        )}
      >
        <SlidersHorizontal className={cn('w-3.5 h-3.5 flex-shrink-0', isExpanded ? 'text-primary' : 'text-text-muted')} />
        <div className="flex-1 min-w-0">
          {selectedCount > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedLabels.map((label, i) => (
                <span key={i} className="text-[11px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-text-muted">Уточните параметры поездки</span>
          )}
        </div>
        <ChevronDown className={cn(
          'w-3.5 h-3.5 flex-shrink-0 text-text-muted transition-transform duration-200',
          isExpanded && 'rotate-180'
        )} />
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2.5 max-h-[40vh] overflow-y-auto">
              {groups.map((group) => (
                <div key={group.category} className="space-y-1">
                  {/* Group label */}
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
                    <span className="text-primary">{iconMap[group.icon] || iconMap.compass}</span>
                    {group.label}
                  </div>

                  {/* Option chips */}
                  <div className="flex flex-wrap gap-1">
                    {group.options.map((opt) => {
                      const isSelected = selections[group.category] === opt.value && !showCustom[group.category]
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleSelect(group.category, opt.value)}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-left border transition-all duration-150',
                            isSelected
                              ? 'bg-primary/15 border-primary/40 text-primary shadow-sm shadow-primary/10'
                              : 'bg-surface-hover/50 border-border/30 text-text hover:bg-surface-hover hover:border-border/50'
                          )}
                        >
                          <span className="text-[11px] font-medium leading-tight">{opt.label}</span>
                          <span className={cn('text-[9px] leading-tight block', isSelected ? 'text-primary/70' : 'text-text-muted')}>
                            {opt.description}
                          </span>
                        </button>
                      )
                    })}

                    {group.allow_custom && (
                      <button
                        onClick={() => handleCustomToggle(group.category)}
                        className={cn(
                          'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border transition-all duration-150',
                          showCustom[group.category]
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-surface-hover/30 border-dashed border-border/40 text-text-muted hover:text-text hover:border-border/60'
                        )}
                      >
                        {showCustom[group.category] ? <X className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                        Своё
                      </button>
                    )}
                  </div>

                  {/* Custom input */}
                  <AnimatePresence>
                    {showCustom[group.category] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <input
                          type="text"
                          value={customInputs[group.category] || ''}
                          onChange={(e) => handleCustomChange(group.category, e.target.value)}
                          placeholder={`Введите ${group.label.toLowerCase()}...`}
                          className="w-full px-2.5 py-1 rounded-lg text-[11px] bg-surface border border-border/40 text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Build itinerary button */}
              {allPreferencesFilled && (
                <div className="flex items-center gap-2 pt-1">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={onBuildItinerary}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 transition-all shadow-sm"
                  >
                    <Map className="w-3 h-3" />
                    Составить маршрут
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
