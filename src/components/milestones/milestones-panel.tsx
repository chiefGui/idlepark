import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Panel } from '../ui/panel'
import { Milestone } from '../../systems/milestone'
import { useGameStore } from '../../store/game-store'
import { Format } from '../../utils/format'

export function MilestonesPanel() {
  const state = useGameStore()

  return (
    <Panel title="Milestones">
      <div className="grid gap-2">
        {Milestone.ALL.map((milestone) => {
          const isAchieved = Milestone.isAchieved(milestone, state)
          const progress = Milestone.getProgress(milestone, state)

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`
                p-3 rounded-lg border border-[var(--color-border)]
                ${isAchieved ? 'bg-[var(--color-positive)]/10 border-[var(--color-positive)]/30' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{milestone.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{milestone.name}</span>
                    {isAchieved && (
                      <Check size={14} className="text-[var(--color-positive)]" />
                    )}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {milestone.description}
                  </div>
                </div>
                {!isAchieved && (
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {Format.percent(progress * 100)}
                  </div>
                )}
              </div>
              {!isAchieved && (
                <div className="mt-2 h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    className="h-full bg-[var(--color-accent)]"
                  />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </Panel>
  )
}
