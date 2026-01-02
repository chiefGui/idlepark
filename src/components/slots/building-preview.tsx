import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { BuildingDef } from '../../engine/game-types'
import { Building } from '../../systems/building'
import { BuildingIcon } from '../../buildings'
import { Button } from '../ui/button'
import { Format } from '../../utils/format'

type BuildingPreviewProps = {
  building: BuildingDef | null
  canAfford: boolean
  ownedCount: number
  onClose: () => void
  onBuild: () => void
}

/**
 * Confirmation sheet for building. Card already shows all stats,
 * so this just provides description and build confirmation.
 */
export function BuildingPreview({ building, canAfford, ownedCount, onClose, onBuild }: BuildingPreviewProps) {
  if (!building) return null

  const cost = building.costs[0]?.amount ?? 0
  const upkeep = Building.getUpkeep(building)

  const handleBuild = () => {
    onBuild()
    onClose()
  }

  return (
    <AnimatePresence>
      {building && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 right-0 bottom-0 z-[60]"
          >
            <div className="bg-[var(--color-bg)] border-t border-[var(--color-border)] rounded-t-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)]">
                <BuildingIcon buildingId={building.id} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{building.name}</span>
                    {ownedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs font-semibold">
                        ×{ownedCount} owned
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                    {building.description}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 active:bg-[var(--color-surface)] rounded-lg transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cost summary */}
              <div className="p-4 flex items-center justify-between border-b border-[var(--color-border)]">
                <div>
                  <div className="text-sm text-[var(--color-text-muted)]">Build cost</div>
                  <div className={`text-xl font-bold ${canAfford ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}`}>
                    {Format.money(cost)}
                  </div>
                </div>
                {upkeep > 0 && (
                  <div className="text-right">
                    <div className="text-sm text-[var(--color-text-muted)]">Daily upkeep</div>
                    <div className="text-lg font-semibold text-[var(--color-warning)]">
                      −{Format.money(upkeep)}/day
                    </div>
                  </div>
                )}
              </div>

              {/* Build Button */}
              <div className="p-4">
                <Button
                  variant={canAfford ? 'primary' : 'secondary'}
                  onClick={handleBuild}
                  disabled={!canAfford}
                  className="w-full"
                >
                  {canAfford ? `Build ${building.name}` : `Need ${Format.money(cost)}`}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
