import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock } from 'lucide-react'
import { Building } from '../../systems/building'
import { useGameStore } from '../../store/game-store'
import { Requirements } from '../../engine/requirements'
import { Button } from '../ui/button'

type BuildingSelectorProps = {
  slotIndex: number
  onClose: () => void
}

export function BuildingSelector({ slotIndex, onClose }: BuildingSelectorProps) {
  const state = useGameStore()
  const buildAtSlot = useGameStore((s) => s.actions.buildAtSlot)

  const availableBuildings = Building.getAvailable(state)
  const lockedBuildings = Building.ALL.filter((b) => !Building.isUnlocked(b, state))

  const handleBuild = (buildingId: string) => {
    const success = buildAtSlot(buildingId, slotIndex)
    if (success) onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="
            bg-[var(--color-bg)] border-t border-[var(--color-border)]
            rounded-t-2xl sm:rounded-xl w-full sm:max-w-md max-h-[85vh] overflow-hidden
            flex flex-col
          "
        >
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-semibold">Select Building</h2>
            <button
              onClick={onClose}
              className="p-2 active:bg-[var(--color-surface)] rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {availableBuildings.length > 0 && (
              <div className="space-y-2">
                {availableBuildings.map((building) => {
                  const canAfford = Building.canAfford(building, state)
                  const cost = building.costs[0]

                  return (
                    <motion.div
                      key={building.id}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        p-4 rounded-xl border border-[var(--color-border)]
                        ${canAfford ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-surface)]/50 opacity-60'}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{building.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{building.name}</div>
                          <div className="text-xs text-[var(--color-text-muted)] mb-2">
                            {building.description}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs mb-3">
                            {building.effects.map((effect, i) => (
                              <span
                                key={i}
                                className={`px-2 py-0.5 rounded-full ${
                                  effect.perDay >= 0
                                    ? 'bg-[var(--color-positive)]/20 text-[var(--color-positive)]'
                                    : 'bg-[var(--color-negative)]/20 text-[var(--color-negative)]'
                                }`}
                              >
                                {effect.perDay >= 0 ? '+' : ''}{effect.perDay} {effect.statId}
                              </span>
                            ))}
                          </div>
                          <Button
                            variant={canAfford ? 'primary' : 'secondary'}
                            disabled={!canAfford}
                            onClick={() => handleBuild(building.id)}
                            className="w-full"
                          >
                            {canAfford ? `Build for $${cost?.amount ?? 0}` : `Need $${cost?.amount ?? 0}`}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {lockedBuildings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                  Locked
                </h3>
                <div className="space-y-2">
                  {lockedBuildings.map((building) => {
                    const unmetReqs = Requirements.getUnmetRequirements(building.requirements, state)

                    return (
                      <div
                        key={building.id}
                        className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 opacity-50"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl grayscale">{building.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{building.name}</span>
                              <Lock size={14} className="text-[var(--color-text-muted)]" />
                            </div>
                            <div className="text-xs text-[var(--color-text-muted)] mb-2">
                              {building.description}
                            </div>
                            <div className="text-xs text-[var(--color-warning)]">
                              Unlock: {unmetReqs.map((r) => Requirements.formatRequirement(r)).join(', ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
