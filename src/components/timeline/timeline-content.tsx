import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Timeline } from '../../systems/timeline'

const PAGE_SIZE = 5

export function TimelineContent() {
  const state = useGameStore()
  const [page, setPage] = useState(0)

  const { entries, hasMore } = Timeline.getEntriesPaginated(state, page, PAGE_SIZE)

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4">
          <BookOpen size={28} className="text-[var(--color-text-muted)]" />
        </div>
        <h3 className="font-medium mb-1">Your story awaits</h3>
        <p className="text-sm text-[var(--color-text-muted)] max-w-[200px]">
          Achieve milestones to write the first chapter of your park's journey.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-[var(--color-border)]" />

        <AnimatePresence mode="popLayout">
          {entries.map((entry, index) => {
            const milestone = Timeline.getMilestoneForEntry(entry)
            const flavor = Timeline.getFlavorText(entry.milestoneId)

            if (!milestone) return null

            return (
              <motion.div
                key={entry.milestoneId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-4 pb-6 last:pb-0"
              >
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)] flex items-center justify-center text-lg">
                    {milestone.emoji}
                  </div>
                </div>

                <div className="flex-1 pt-1.5">
                  <div className="text-xs font-medium text-[var(--color-accent)] uppercase tracking-wider mb-1">
                    Day {entry.day}
                  </div>
                  <h4 className="font-semibold mb-1">{flavor.title}</h4>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {flavor.description}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-surface)] text-xs text-[var(--color-text-muted)]">
                    <span>{milestone.emoji}</span>
                    <span>{milestone.name}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {hasMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPage((p) => p + 1)}
          className="w-full py-3 rounded-xl bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text-muted)] active:bg-[var(--color-surface-hover)] transition-colors"
        >
          Load more
        </motion.button>
      )}
    </div>
  )
}
