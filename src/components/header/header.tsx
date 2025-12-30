import { motion } from 'framer-motion'
import { Menu, AlertTriangle } from 'lucide-react'
import { DayProgress } from './day-progress'
import { useDrawer } from '../ui/drawer'
import { useGameStore } from '../../store/game-store'
import { GameTypes } from '../../engine/game-types'

export function Header() {
  const { open } = useDrawer()
  const gameOver = useGameStore((s) => s.gameOver)
  const money = useGameStore((s) => s.stats.money)
  const consecutiveNegativeDays = useGameStore((s) => s.consecutiveNegativeDays)

  const isInDanger = money < 0

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => open()}
        className="p-2 -ml-2 hover:bg-[var(--color-surface-hover)] rounded-xl transition-colors"
      >
        <Menu size={24} />
      </motion.button>

      <div className="flex items-center gap-3">
        {gameOver ? (
          <motion.span
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 rounded-lg bg-[var(--color-negative)]/20 text-[var(--color-negative)] font-bold text-sm"
          >
            BANKRUPT
          </motion.span>
        ) : isInDanger ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--color-negative)]/20"
          >
            <AlertTriangle size={14} className="text-[var(--color-negative)]" />
            <span className="text-xs font-medium text-[var(--color-negative)]">
              {Math.ceil(GameTypes.BANKRUPTCY_THRESHOLD_DAYS - consecutiveNegativeDays)}d
            </span>
          </motion.div>
        ) : null}
      </div>

      <DayProgress />
    </header>
  )
}
