import { motion } from 'framer-motion'
import {
  DollarSign,
  Users,
  Sparkles,
  UtensilsCrossed,
  Sofa,
  Sparkle,
  Star,
  Heart,
} from 'lucide-react'
import type { StatId } from '../../engine/game-types'
import { useGameStore } from '../../store/game-store'
import { Effects } from '../../engine/effects'

type StatConfig = {
  icon: typeof DollarSign
  label: string
  color: string
  format: (value: number) => string
}

const STAT_CONFIG: Record<StatId, StatConfig> = {
  money: {
    icon: DollarSign,
    label: 'Money',
    color: '#22c55e',
    format: (v) => `$${Math.floor(v).toLocaleString()}`,
  },
  guests: {
    icon: Users,
    label: 'Guests',
    color: '#6366f1',
    format: (v) => Math.floor(v).toLocaleString(),
  },
  entertainment: {
    icon: Sparkles,
    label: 'Fun',
    color: '#f472b6',
    format: (v) => v.toFixed(1),
  },
  food: {
    icon: UtensilsCrossed,
    label: 'Food',
    color: '#fb923c',
    format: (v) => v.toFixed(1),
  },
  comfort: {
    icon: Sofa,
    label: 'Comfort',
    color: '#a78bfa',
    format: (v) => v.toFixed(1),
  },
  cleanliness: {
    icon: Sparkle,
    label: 'Clean',
    color: '#22d3ee',
    format: (v) => `${Math.floor(v)}%`,
  },
  appeal: {
    icon: Star,
    label: 'Appeal',
    color: '#fbbf24',
    format: (v) => `${Math.floor(v)}%`,
  },
  satisfaction: {
    icon: Heart,
    label: 'Happy',
    color: '#f87171',
    format: (v) => `${Math.floor(v)}%`,
  },
}

const DISPLAY_ORDER: StatId[] = [
  'money',
  'guests',
  'satisfaction',
  'appeal',
  'entertainment',
  'food',
  'comfort',
  'cleanliness',
]

export function StatsBar() {
  const stats = useGameStore((s) => s.stats)
  const rates = useGameStore((s) => s.rates)

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-4 py-3 min-w-max">
        {DISPLAY_ORDER.map((statId) => {
          const config = STAT_CONFIG[statId]
          const Icon = config.icon
          const value = stats[statId]
          const rate = Effects.getFinalRate(statId, rates)
          const showRate = ['money', 'guests'].includes(statId) && rate !== 0

          return (
            <motion.div
              key={statId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] min-w-fit"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Icon size={14} style={{ color: config.color }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[var(--color-text-muted)] leading-none">
                  {config.label}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold leading-tight">
                    {config.format(value)}
                  </span>
                  {showRate && (
                    <span
                      className="text-[10px] leading-none"
                      style={{ color: rate > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
                    >
                      {rate > 0 ? '+' : ''}{rate.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
