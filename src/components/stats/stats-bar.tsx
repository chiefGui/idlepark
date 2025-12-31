import { useState, useMemo } from 'react'
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

type StatConfig = {
  icon: typeof DollarSign
  label: string
  color: string
  format: (value: number) => string
  formatRate: (value: number) => string
  description: string
  tip: string
}

const STAT_CONFIG: Record<StatId, StatConfig> = {
  money: {
    icon: DollarSign,
    label: 'Money',
    color: '#22c55e',
    format: Format.money,
    formatRate: Format.rate,
    description: 'Your park\'s funds. Earned from guests, spent on buildings and upkeep.',
    tip: 'Keep it positive! 7 days in the red means bankruptcy.',
  },
  guests: {
    icon: Users,
    label: 'Guests',
    color: '#6366f1',
    format: Format.guests,
    formatRate: Format.rate,
    description: 'Visitors in your park. More guests = more income, but also more demand.',
    tip: 'Guests arrive based on your park\'s appeal.',
  },
  entertainment: {
    icon: Sparkles,
    label: 'Fun',
    color: '#f472b6',
    format: (v) => Format.millify(v, 1),
    formatRate: Format.rate,
    description: 'How much fun your park provides. Guests consume entertainment.',
    tip: 'Build rides like Carousel or Roller Coaster to increase.',
  },
  food: {
    icon: UtensilsCrossed,
    label: 'Food',
    color: '#fb923c',
    format: (v) => Format.millify(v, 1),
    formatRate: Format.rate,
    description: 'Food availability. Hungry guests are unhappy guests!',
    tip: 'Build Food Stands or Ice Cream Shops.',
  },
  comfort: {
    icon: Sofa,
    label: 'Comfort',
    color: '#a78bfa',
    format: (v) => Format.millify(v, 1),
    formatRate: Format.rate,
    description: 'Guest comfort level. Includes restrooms and seating.',
    tip: 'Restrooms are essential for guest comfort.',
  },
  cleanliness: {
    icon: Sparkle,
    label: 'Clean',
    color: '#22d3ee',
    format: Format.percent,
    formatRate: Format.rate,
    description: 'How clean your park is. Degrades as more guests visit.',
    tip: 'Place Trash Cans or buy the Cleaning Crew perk.',
  },
  appeal: {
    icon: Star,
    label: 'Appeal',
    color: '#fbbf24',
    format: Format.percent,
    formatRate: Format.rate,
    description: 'How attractive your park is. Higher appeal = more guests.',
    tip: 'Improve satisfaction and add entertainment to boost appeal.',
  },
  satisfaction: {
    icon: Heart,
    label: 'Happy',
    color: '#f87171',
    format: Format.percent,
    formatRate: Format.rate,
    description: 'How happy your guests are. Based on meeting their needs.',
    tip: 'Balance entertainment, food, comfort, and cleanliness.',
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
  const currentDay = useGameStore((s) => s.currentDay)
  const stats = useGameStore((s) => s.stats)
  const rates = useGameStore((s) => s.rates)
  const [selectedStat, setSelectedStat] = useState<StatId | null>(null)

  const dayInt = Math.floor(currentDay)

  const displayStats = useMemo(() => {
    return DISPLAY_ORDER.map((statId) => ({
      statId,
      value: stats[statId],
      rate: rates[statId],
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayInt])

  const selectedConfig = selectedStat ? STAT_CONFIG[selectedStat] : null
  const selectedValue = selectedStat ? stats[selectedStat] : 0
  const selectedRate = selectedStat ? rates[selectedStat] : 0

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-3 min-w-max">
          {displayStats.map(({ statId, value, rate }) => {
            const config = STAT_CONFIG[statId]
            const Icon = config.icon
            const showRate = ['money', 'guests'].includes(statId) && rate !== 0

            return (
              <motion.button
                key={statId}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStat(statId)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] min-w-fit active:bg-[var(--color-surface-hover)] transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${config.color}20` }}
                >
                  <Icon size={14} style={{ color: config.color }} />
                </div>
                <div className="flex flex-col text-left">
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
                        {config.formatRate(rate)}
                      </span>
                    )}
                  </div>
                </div>
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
        {selectedConfig && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg)]">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${selectedConfig.color}20` }}
              >
                <selectedConfig.icon size={24} style={{ color: selectedConfig.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold">{selectedConfig.format(selectedValue)}</div>
                {selectedRate !== 0 && (
                  <div
                    className="text-sm"
                    style={{ color: selectedRate > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
                  >
                    {selectedConfig.formatRate(selectedRate)}/day
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-[var(--color-text-muted)]">
              {selectedConfig.description}
            </p>

            <div className="p-3 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
              <div className="text-xs font-medium text-[var(--color-accent)] uppercase tracking-wider mb-1">
                Tip
              </div>
              <p className="text-sm">{selectedConfig.tip}</p>
            </div>
          </div>
        )}
      </InfoModal>
    </>
  )
}
