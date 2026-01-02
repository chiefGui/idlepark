import { motion } from 'framer-motion'
import { Sparkles, Sofa, Users } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { ParkRating } from '../../systems/park-rating'
import { StarRating } from './star-rating'

type StatBarProps = {
  label: string
  emoji: React.ReactNode
  value: number
  status: 'great' | 'good' | 'low' | 'critical'
  showBar?: boolean
}

function StatBar({ label, emoji, value, status, showBar = true }: StatBarProps) {
  const statusColors = {
    great: 'bg-emerald-500',
    good: 'bg-blue-500',
    low: 'bg-amber-500',
    critical: 'bg-red-500',
  }

  const statusTextColors = {
    great: 'text-emerald-500',
    good: 'text-blue-500',
    low: 'text-amber-500',
    critical: 'text-red-500',
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 w-20">
        <span className="text-sm">{emoji}</span>
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</span>
      </div>
      {showBar ? (
        <div className="flex-1 h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${statusColors[status]} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, value)}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          />
        </div>
      ) : (
        <span className={`text-sm font-semibold ${statusTextColors[status]}`}>
          {value}%
        </span>
      )}
    </div>
  )
}

export function UnifiedStats() {
  const state = useGameStore((s) => s)
  const stats = ParkRating.calculateUnifiedStats(state)
  const rating = ParkRating.calculateRating(state)
  const phase = ParkRating.getPhase(state.currentDay)

  const showComfort = phase !== 'discovery'
  const showCapacity = phase === 'growth' || phase === 'mastery'

  return (
    <div className="space-y-3">
      {/* Star Rating - Always visible */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StarRating stars={rating.stars} size="md" />
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            {rating.label}
          </span>
        </div>
        <div className="text-sm text-[var(--color-text-muted)]">
          Day {state.currentDay}
        </div>
      </div>

      {/* Stats Bars */}
      <div className="space-y-2">
        {/* Fun - Always visible */}
        <StatBar
          label="Fun"
          emoji={<Sparkles size={14} className="text-pink-500" />}
          value={stats.fun}
          status={rating.funStatus}
        />

        {/* Comfort - Unlocks at Day 8 */}
        {showComfort && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <StatBar
              label="Comfort"
              emoji={<Sofa size={14} className="text-blue-500" />}
              value={stats.comfort}
              status={rating.comfortStatus}
            />
          </motion.div>
        )}

        {/* Capacity - Unlocks at Day 21 */}
        {showCapacity && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 w-20">
                <Users size={14} className="text-purple-500" />
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">Guests</span>
              </div>
              <div className="flex-1 h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stats.currentGuests / stats.capacity) * 100)}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                />
              </div>
              <span className="text-xs font-medium text-[var(--color-text-muted)] w-16 text-right">
                {stats.currentGuests}/{stats.capacity}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

/**
 * Compact version for the header/stats bar
 */
export function UnifiedStatsCompact() {
  const state = useGameStore((s) => s)
  const stats = ParkRating.calculateUnifiedStats(state)
  const rating = ParkRating.calculateRating(state)
  const phase = ParkRating.getPhase(state.currentDay)

  const showComfort = phase !== 'discovery'

  const statusEmoji = {
    great: '',
    good: '',
    low: '!',
    critical: '!!',
  }

  return (
    <div className="flex items-center gap-3">
      {/* Star Rating */}
      <div className="flex items-center gap-1">
        <StarRating stars={rating.stars} size="sm" />
      </div>

      {/* Fun indicator */}
      <div className="flex items-center gap-1">
        <Sparkles size={12} className="text-pink-500" />
        <span className="text-xs font-medium">
          {stats.fun}%{statusEmoji[rating.funStatus]}
        </span>
      </div>

      {/* Comfort indicator */}
      {showComfort && (
        <div className="flex items-center gap-1">
          <Sofa size={12} className="text-blue-500" />
          <span className="text-xs font-medium">
            {stats.comfort}%{statusEmoji[rating.comfortStatus]}
          </span>
        </div>
      )}

      {/* Guest count */}
      <div className="flex items-center gap-1">
        <Users size={12} className="text-purple-500" />
        <span className="text-xs font-medium">
          {stats.currentGuests}
        </span>
      </div>
    </div>
  )
}
