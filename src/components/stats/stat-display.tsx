import { motion } from 'framer-motion'
import type { StatId } from '../../engine/game-types'
import { useGameStore } from '../../store/game-store'
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

type StatConfig = {
  icon: typeof DollarSign
  label: string
  color: string
  showRate: boolean
  format: (value: number) => string
}

const STAT_CONFIG: Record<StatId, StatConfig> = {
  money: {
    icon: DollarSign,
    label: 'Money',
    color: 'var(--color-positive)',
    showRate: true,
    format: (v) => `$${Math.floor(v).toLocaleString()}`,
  },
  guests: {
    icon: Users,
    label: 'Guests',
    color: 'var(--color-accent)',
    showRate: true,
    format: (v) => Math.floor(v).toLocaleString(),
  },
  entertainment: {
    icon: Sparkles,
    label: 'Entertainment',
    color: '#f472b6',
    showRate: true,
    format: (v) => v.toFixed(1),
  },
  food: {
    icon: UtensilsCrossed,
    label: 'Food',
    color: '#fb923c',
    showRate: true,
    format: (v) => v.toFixed(1),
  },
  comfort: {
    icon: Sofa,
    label: 'Comfort',
    color: '#a78bfa',
    showRate: true,
    format: (v) => v.toFixed(1),
  },
  cleanliness: {
    icon: Sparkle,
    label: 'Cleanliness',
    color: '#22d3ee',
    showRate: true,
    format: (v) => `${Math.floor(v)}%`,
  },
  appeal: {
    icon: Star,
    label: 'Appeal',
    color: '#fbbf24',
    showRate: false,
    format: (v) => `${Math.floor(v)}%`,
  },
  satisfaction: {
    icon: Heart,
    label: 'Satisfaction',
    color: '#f87171',
    showRate: false,
    format: (v) => `${Math.floor(v)}%`,
  },
}

type StatDisplayProps = {
  statId: StatId
}

export function StatDisplay({ statId }: StatDisplayProps) {
  const value = useGameStore((s) => s.stats[statId])
  const rates = useGameStore((s) => s.rates)

  const config = STAT_CONFIG[statId]
  const Icon = config.icon
  const rate = rates[statId]

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <Icon size={16} style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[var(--color-text-muted)]">{config.label}</div>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold">{config.format(value)}</span>
          {config.showRate && rate !== 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs ${rate > 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}`}
            >
              {rate > 0 ? '+' : ''}{rate.toFixed(1)}/day
            </motion.span>
          )}
        </div>
      </div>
    </div>
  )
}
