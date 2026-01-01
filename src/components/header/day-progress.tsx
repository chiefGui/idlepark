import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/game-store'
import { Calendar } from '../../utils/calendar'
import { Season } from '../../systems/season'

export function DayProgress() {
  const [isExpanded, setIsExpanded] = useState(false)
  const currentDay = useGameStore((s) => s.currentDay)
  const progress = currentDay % 1

  const calendar = Calendar.fromDay(currentDay)
  const seasonEmoji = Calendar.getSeasonEmoji(calendar.season)

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] transition-colors"
      >
        {/* Season Emoji */}
        <span className="text-sm">{seasonEmoji}</span>

        {/* Date Info */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">
            {Calendar.getMonthShort(currentDay)} {calendar.dayOfMonth}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {calendar.year}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-10 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden ml-1">
          <motion.div
            className="h-full bg-[var(--color-accent)] rounded-full"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </motion.button>

      {/* Expanded Details Modal */}
      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="fixed top-16 right-4 z-50 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl min-w-[200px]"
            >
              {/* Full Date */}
              <div className="text-center mb-3">
                <div className="text-2xl mb-1">{seasonEmoji}</div>
                <div className="text-lg font-bold">
                  {Calendar.formatFull(currentDay)}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  {Calendar.getDayOfWeek(currentDay)}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--color-border)] my-3" />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[var(--color-text-muted)] text-xs">Day</div>
                  <div className="font-medium">{Math.floor(currentDay)}</div>
                </div>
                <div>
                  <div className="text-[var(--color-text-muted)] text-xs">Season</div>
                  <div className="font-medium">{Calendar.getSeasonName(calendar.season)}</div>
                </div>
                <div>
                  <div className="text-[var(--color-text-muted)] text-xs">Week</div>
                  <div className="font-medium">{Math.ceil(currentDay / 7)}</div>
                </div>
                <div>
                  <div className="text-[var(--color-text-muted)] text-xs">Type</div>
                  <div className="font-medium">{calendar.isWeekend ? 'Weekend' : 'Weekday'}</div>
                </div>
              </div>

              {/* Season Effects */}
              <SeasonEffects currentDay={currentDay} />

              {/* Day Progress */}
              <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
                  <span>Day Progress</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--color-accent)] rounded-full"
                    initial={false}
                    animate={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

const STAT_LABELS: Record<string, string> = {
  money: 'income',
  guests: 'guests',
  entertainment: 'entertainment',
  food: 'food',
  comfort: 'comfort',
  cleanliness: 'cleanliness',
  beauty: 'beauty',
  appeal: 'appeal',
}

function SeasonEffects({ currentDay }: { currentDay: number }) {
  const { buff, penalty } = Season.getEffects(currentDay)

  const formatEffect = (increased: number, stat: string) => {
    const sign = increased > 0 ? '+' : ''
    return `${sign}${increased}% ${STAT_LABELS[stat] ?? stat}`
  }

  return (
    <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
      <div className="text-[var(--color-text-muted)] text-xs mb-2">Season Effects</div>
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-green-500">↑</span>
          <span>{buff.label}</span>
          <span className="text-green-500 ml-auto font-medium">
            {formatEffect(buff.increased, buff.stat)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-400">↓</span>
          <span>{penalty.label}</span>
          <span className="text-red-400 ml-auto font-medium">
            {formatEffect(penalty.increased, penalty.stat)}
          </span>
        </div>
      </div>
    </div>
  )
}
