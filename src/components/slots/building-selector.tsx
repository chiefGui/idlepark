import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Building } from '../../systems/building'
import { useGameStore } from '../../store/game-store'
import { Button } from '../ui/button'

type BuildingSelectorProps = {
  slotIndex: number
  onClose: () => void
}

export function BuildingSelector({ slotIndex, onClose }: BuildingSelectorProps) {
  const state = useGameStore()
  const buildAtSlot = useGameStore((s) => s.actions.buildAtSlot)
  const availableBuildings = Building.getAvailable(state)

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
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="
            bg-[var(--color-surface)] border border-[var(--color-border)]
            rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-auto
          "
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Select Building</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-3">
            {availableBuildings.map((building) => {
              const canAfford = Building.canAfford(building, state)
              const cost = building.costs[0]

              return (
                <motion.div
                  key={building.id}
                  whileHover={{ scale: 1.01 }}
                  className={`
                    p-4 rounded-xl border border-[var(--color-border)]
                    ${canAfford ? 'bg-[var(--color-surface-hover)]' : 'opacity-50'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{building.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{building.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mb-2">
                        {building.description}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        {building.effects.map((effect, i) => (
                          <span
                            key={i}
                            className={effect.perDay >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}
                          >
                            {effect.perDay >= 0 ? '+' : ''}{effect.perDay} {effect.statId}/day
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--color-warning)]">
                          ${cost?.amount ?? 0}
                        </span>
                        <Button
                          variant="primary"
                          disabled={!canAfford}
                          onClick={() => handleBuild(building.id)}
                          className="text-xs px-3 py-1.5"
                        >
                          Build
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
