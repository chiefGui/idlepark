import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, AlertTriangle, AlertCircle, Sparkles, ChevronRight } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { ParkRating, type AdvisorTip } from '../../systems/park-rating'

type AdvisorTipCardProps = {
  tip: AdvisorTip
  onAction?: (actionType: AdvisorTip['actionType']) => void
  compact?: boolean
}

function AdvisorTipCard({ tip, onAction, compact = false }: AdvisorTipCardProps) {
  const priorityConfig = {
    critical: {
      icon: AlertCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-500',
      textColor: 'text-red-600 dark:text-red-400',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    suggestion: {
      icon: Lightbulb,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    praise: {
      icon: Sparkles,
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
  }

  const config = priorityConfig[tip.priority]
  const Icon = config.icon

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} border ${config.borderColor}`}
      >
        <Icon size={14} className={config.iconColor} />
        <span className={`text-xs font-medium ${config.textColor}`}>
          {tip.message}
        </span>
        {tip.action && onAction && (
          <button
            onClick={() => onAction(tip.actionType)}
            className={`ml-1 flex items-center gap-0.5 text-xs font-semibold ${config.iconColor} hover:underline`}
          >
            {tip.action}
            <ChevronRight size={12} />
          </button>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-3 rounded-xl ${config.bgColor} border ${config.borderColor}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <Icon size={20} className={config.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${config.textColor}`}>
            {tip.message}
          </p>
          {tip.action && onAction && (
            <button
              onClick={() => onAction(tip.actionType)}
              className={`mt-2 flex items-center gap-1 text-sm font-semibold ${config.iconColor} hover:underline`}
            >
              {tip.action}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

type AdvisorProps = {
  onAction?: (actionType: AdvisorTip['actionType']) => void
  compact?: boolean
}

export function Advisor({ onAction, compact = false }: AdvisorProps) {
  const state = useGameStore((s) => s)
  const tip = ParkRating.getAdvisorTip(state)

  return (
    <AnimatePresence mode="wait">
      {tip && (
        <AdvisorTipCard
          key={tip.message}
          tip={tip}
          onAction={onAction}
          compact={compact}
        />
      )}
    </AnimatePresence>
  )
}

/**
 * Full advisor panel showing all tips
 */
export function AdvisorPanel({ onAction }: { onAction?: (actionType: AdvisorTip['actionType']) => void }) {
  const state = useGameStore((s) => s)
  const tips = ParkRating.getAllAdvisorTips(state)

  if (tips.length === 0) {
    return (
      <div className="text-center py-6 text-[var(--color-text-muted)]">
        <Sparkles className="mx-auto mb-2 text-emerald-500" size={24} />
        <p className="text-sm">Everything looks great!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tips.map((tip, index) => (
        <AdvisorTipCard
          key={`${tip.priority}-${index}`}
          tip={tip}
          onAction={onAction}
        />
      ))}
    </div>
  )
}
