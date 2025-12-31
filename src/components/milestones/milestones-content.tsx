import { motion } from 'framer-motion'
import { Check, Coins } from 'lucide-react'
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
          <div className="space-y-2">
            {pending.map((milestone) => {
              const progress = Milestone.getProgress(milestone, state)

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{milestone.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{milestone.name}</div>
                      <div className="text-sm text-[var(--color-text-muted)] mb-2">
                        {milestone.description}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-[var(--color-accent)]">
                          {Requirements.formatRequirement(milestone.condition)}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-[var(--color-positive)]">
                          <Coins size={12} />
                          <span>+${milestone.reward}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text-muted)]">
                      {Math.floor(progress * 100)}%
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-[var(--color-accent)] rounded-full"
                    />
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
          <div className="space-y-2">
            {achieved.map((milestone) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{milestone.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{milestone.name}</div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm text-[var(--color-text-muted)]">
                        {milestone.description}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-[var(--color-positive)]">
                        <Coins size={12} />
                        <span>+${milestone.reward}</span>
                      </div>
                    </div>
                  </div>
                  <Check size={20} className="text-[var(--color-positive)]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
