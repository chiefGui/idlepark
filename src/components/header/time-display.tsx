import { motion } from 'framer-motion'
import { Calendar, AlertTriangle } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { GameTypes } from '../../engine/game-types'
import { Format } from '../../utils/format'

export function TimeDisplay() {
  const currentDay = useGameStore((s) => s.currentDay)
  const consecutiveNegativeDays = useGameStore((s) => s.consecutiveNegativeDays)
  const money = useGameStore((s) => s.stats.money)

  const isInDanger = money < 0

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-[var(--color-accent)]" />
        <span className="font-semibold">Day {Math.floor(currentDay)}</span>
      </div>

      {isInDanger && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-negative)]/20"
        >
          <AlertTriangle size={16} className="text-[var(--color-negative)]" />
          <span className="text-sm text-[var(--color-negative)]">
            Bankruptcy in {Format.days(GameTypes.BANKRUPTCY_THRESHOLD_DAYS - consecutiveNegativeDays, false)}
          </span>
        </motion.div>
      )}
    </div>
  )
}
