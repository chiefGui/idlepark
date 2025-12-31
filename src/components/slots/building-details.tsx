import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, DollarSign } from 'lucide-react'
import type { BuildingDef } from '../../engine/game-types'
import { Building } from '../../systems/building'
import { Button } from '../ui/button'
import { Format } from '../../utils/format'

type BuildingDetailsProps = {
  building: BuildingDef | null
  onClose: () => void
  onDemolish: () => void
}

export function BuildingDetails({ building, onClose, onDemolish }: BuildingDetailsProps) {
  if (!building) return null

  const refundAmount = Math.floor((building.costs[0]?.amount ?? 0) * 0.5)

  const handleDemolish = () => {
    if (confirm(`Demolish ${building.name}? You'll receive ${Format.money(refundAmount)} back.`)) {
      onDemolish()
      onClose()
    }
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
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 right-0 bottom-0 z-50"
          >
            <div className="bg-[var(--color-bg)] border-t border-[var(--color-border)] rounded-t-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)]">
                <span className="text-3xl">{building.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold">{building.name}</div>
                  <div className="text-sm text-[var(--color-text-muted)]">{building.description}</div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 active:bg-[var(--color-surface)] rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                    Effects
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Building.getDisplayEffects(building).map((effect, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          effect.isPositive
                            ? 'bg-[var(--color-positive)]/20 text-[var(--color-positive)]'
                            : 'bg-[var(--color-negative)]/20 text-[var(--color-negative)]'
                        }`}
                      >
                        {Format.effect(effect.value, effect.statId)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={16} className="text-[var(--color-positive)]" />
                    <span className="text-[var(--color-text-muted)]">Demolish refund:</span>
                    <span className="font-semibold text-[var(--color-positive)]">{Format.money(refundAmount)}</span>
                    <span className="text-[var(--color-text-muted)]">(50% of cost)</span>
                  </div>
                </div>

                <Button
                  variant="danger"
                  onClick={handleDemolish}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Demolish Building
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
