import { motion } from 'framer-motion'
import type { StatId } from '../../engine/game-types'
import { useGameStore } from '../../store/game-store'
import { STAT_CONFIG } from '../../constants/stats'
import { Format } from '../../utils/format'

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
          {rate !== 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs ${rate > 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}`}
            >
              {Format.ratePerDay(rate)}
            </motion.span>
          )}
        </div>
      </div>
    </div>
  )
}
