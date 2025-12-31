import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Milestone } from '../../systems/milestone'
import { useGameStore } from '../../store/game-store'
import { Requirements } from '../../engine/requirements'

export function MilestonesContent() {
  const state = useGameStore()

  const achieved = Milestone.ALL.filter((m) => Milestone.isAchieved(m, state))
  const pending = Milestone.ALL.filter((m) => !Milestone.isAchieved(m, state))

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            In Progress
          </h3>
          <div className="space-y-3">
            {pending.map((milestone) => {
              const progress = Milestone.getProgress(milestone, state)

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-2xl flex-shrink-0">
                      {milestone.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{milestone.name}</div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        {milestone.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-[var(--color-accent)] rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text-muted)] w-12 text-right">
                      {Math.floor(progress * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-accent)]">
                      {Requirements.formatRequirement(milestone.condition)}
                    </span>
                    <span className="text-xs font-semibold text-[var(--color-positive)] bg-[var(--color-positive)]/10 px-2 py-0.5 rounded-full">
                      +${milestone.reward}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {achieved.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Completed ({achieved.length})
          </h3>
          <div className="space-y-3">
            {achieved.map((milestone) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/30"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-positive)]/20 flex items-center justify-center text-2xl">
                      {milestone.emoji}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-positive)] flex items-center justify-center">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{milestone.name}</div>
                    <div className="text-sm text-[var(--color-text-muted)]">
                      {milestone.description}
                    </div>
                    <span className="inline-block mt-1 text-xs font-semibold text-[var(--color-positive)] bg-[var(--color-positive)]/20 px-2 py-0.5 rounded-full">
                      +${milestone.reward}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
