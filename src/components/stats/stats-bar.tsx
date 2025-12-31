import { useState } from 'react'
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
import { Format } from '../../utils/format'
import { InfoModal } from '../ui/info-modal'
import { StatDetail } from './stat-detail'

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
    format: Format.money,
  },
  guests: {
    icon: Users,
    label: 'Guests',
    color: '#6366f1',
    format: Format.guests,
  },
  entertainment: {
    icon: Sparkles,
    label: 'Fun',
    color: '#f472b6',
    format: (v) => Format.millify(v, 1),
  },
  food: {
    icon: UtensilsCrossed,
    label: 'Food',
    color: '#fb923c',
    format: (v) => Format.millify(v, 1),
  },
  comfort: {
    icon: Sofa,
    label: 'Comfort',
    color: '#a78bfa',
    format: (v) => Format.millify(v, 1),
  },
  cleanliness: {
    icon: Sparkle,
    label: 'Clean',
    color: '#22d3ee',
    format: Format.percent,
  },
  appeal: {
    icon: Star,
    label: 'Appeal',
    color: '#fbbf24',
    format: Format.percent,
  },
  satisfaction: {
    icon: Heart,
    label: 'Happy',
    color: '#f87171',
    format: Format.percent,
  },
}

// Row 1: Key metrics (outcomes)
// Row 2: Resources (inputs)
const ROW_1: StatId[] = ['money', 'guests', 'satisfaction', 'appeal']
const ROW_2: StatId[] = ['entertainment', 'food', 'comfort', 'cleanliness']

export function StatsBar() {
  const stats = useGameStore((s) => s.stats)
  const rates = useGameStore((s) => s.rates)
  const [selectedStat, setSelectedStat] = useState<StatId | null>(null)

  const selectedConfig = selectedStat ? STAT_CONFIG[selectedStat] : null

  const renderStat = (statId: StatId, showRate: boolean) => {
    const config = STAT_CONFIG[statId]
    const Icon = config.icon
    const value = stats[statId]
    const rate = rates[statId]

    return (
      <motion.button
        key={statId}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSelectedStat(statId)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] active:bg-[var(--color-surface-hover)] transition-colors min-w-0"
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon size={12} style={{ color: config.color }} />
        </div>
        <div className="flex flex-col min-w-0 text-left">
          <span className="text-[9px] text-[var(--color-text-muted)] leading-none truncate">
            {config.label}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xs font-semibold leading-tight truncate">
              {config.format(value)}
            </span>
            {showRate && rate !== 0 && (
              <span
                className="text-[9px] leading-none flex-shrink-0"
                style={{ color: rate > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
              >
                {rate > 0 ? '+' : ''}{rate.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </motion.button>
    )
  }

  return (
    <>
      <div className="px-3 py-2 space-y-1.5">
        {/* Row 1: Key metrics */}
        <div className="grid grid-cols-4 gap-1.5">
          {ROW_1.map((statId) => renderStat(statId, statId === 'money' || statId === 'guests'))}
        </div>
        {/* Row 2: Resources */}
        <div className="grid grid-cols-4 gap-1.5">
          {ROW_2.map((statId) => renderStat(statId, false))}
        </div>
      </div>

      <InfoModal
        isOpen={!!selectedStat}
        onClose={() => setSelectedStat(null)}
        title={selectedConfig?.label ?? ''}
      >
        {selectedStat && <StatDetail statId={selectedStat} />}
      </InfoModal>
    </>
  )
}
