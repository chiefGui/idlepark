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

// Secondary stats (compact display)
const SECONDARY_STATS: StatId[] = ['satisfaction', 'appeal', 'entertainment', 'food', 'comfort', 'cleanliness']

export function StatsBar() {
  const stats = useGameStore((s) => s.stats)
  const rates = useGameStore((s) => s.rates)
  const [selectedStat, setSelectedStat] = useState<StatId | null>(null)

  const selectedConfig = selectedStat ? STAT_CONFIG[selectedStat] : null

  return (
    <>
      <div className="px-4 py-2 space-y-2">
        {/* Primary: Money & Guests */}
        <div className="grid grid-cols-2 gap-2">
          {/* Money */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStat('money')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] active:bg-[var(--color-surface-hover)] transition-colors"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${STAT_CONFIG.money.color}20` }}
            >
              <DollarSign size={18} style={{ color: STAT_CONFIG.money.color }} />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[10px] text-[var(--color-text-muted)] leading-none">
                Money
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold leading-tight">
                  {Format.money(stats.money)}
                </span>
                {rates.money !== 0 && (
                  <span
                    className="text-[10px] leading-none font-medium"
                    style={{ color: rates.money > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
                  >
                    {rates.money > 0 ? '+' : ''}{Format.rate(rates.money)}
                  </span>
                )}
              </div>
            </div>
          </motion.button>

          {/* Guests */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStat('guests')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] active:bg-[var(--color-surface-hover)] transition-colors"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${STAT_CONFIG.guests.color}20` }}
            >
              <Users size={18} style={{ color: STAT_CONFIG.guests.color }} />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[10px] text-[var(--color-text-muted)] leading-none">
                Guests
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold leading-tight">
                  {Format.guests(stats.guests)}
                </span>
                {rates.guests !== 0 && (
                  <span
                    className="text-[10px] leading-none font-medium"
                    style={{ color: rates.guests > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
                  >
                    {rates.guests > 0 ? '+' : ''}{Format.rate(rates.guests)}
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        </div>

        {/* Secondary: Other stats - compact */}
        <div className="grid grid-cols-6 gap-1.5">
          {SECONDARY_STATS.map((statId) => {
            const config = STAT_CONFIG[statId]
            const Icon = config.icon
            const value = stats[statId]

            return (
              <motion.button
                key={statId}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStat(statId)}
                className="flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] active:bg-[var(--color-surface-hover)] transition-colors"
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${config.color}20` }}
                >
                  <Icon size={12} style={{ color: config.color }} />
                </div>
                <span className="text-[10px] font-semibold leading-none">
                  {config.format(value)}
                </span>
              </motion.button>
            )
          })}
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
