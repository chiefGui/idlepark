import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Expand } from 'lucide-react'
import type { SlotState, BuildingCategory } from '../../engine/game-types'
import { useGameStore } from '../../store/game-store'
import { Building } from '../../systems/building'
import { Slot } from '../../systems/slot'
import { Perk } from '../../systems/perk'
import { BuildingIcon } from '../../buildings'
import { colors } from '../../buildings/icon-base'
import { BuildingSelector } from '../slots/building-selector'
import { BuildingDetails } from '../slots/building-details'
import { useDrawerNavigation } from '../ui/drawer-hooks'

// Category indicator colors
const categoryColor: Record<BuildingCategory, string> = {
  rides: colors.rides.primary,
  food: colors.food.primary,
  facilities: colors.facilities.primary,
  decor: colors.decor.primary,
  lodging: colors.lodging.primary,
  shops: colors.shops.primary,
}

type BuildingTileProps = {
  slot: SlotState
  onClick: () => void
}

function BuildingTile({ slot, onClick }: BuildingTileProps) {
  const building = Building.getById(slot.buildingId!)
  if (!building) return null

  const catColor = categoryColor[building.category]

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="aspect-square relative flex items-center justify-center rounded-xl border border-[var(--color-border)] active:opacity-80 overflow-hidden"
      style={{ backgroundColor: `${catColor}08` }}
    >
      <BuildingIcon buildingId={building.id} size={32} />
      {/* Bottom border accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: catColor }}
      />
    </motion.button>
  )
}

function AddTile({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="aspect-square flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 active:bg-[var(--color-accent)]/10 active:border-[var(--color-accent)]"
    >
      <Plus size={18} className="text-[var(--color-accent)]/60" />
    </motion.button>
  )
}

export function ParkGrid() {
  const state = useGameStore()
  const slots = state.slots
  const demolishSlot = useGameStore((s) => s.actions.demolishSlot)
  const navigateTo = useDrawerNavigation()

  const [buildSlotIndex, setBuildSlotIndex] = useState<number | null>(null)
  const [detailsSlotIndex, setDetailsSlotIndex] = useState<number | null>(null)
  const [showFullModal, setShowFullModal] = useState(false)

  const selectedSlot = detailsSlotIndex !== null ? slots[detailsSlotIndex] : null
  const selectedBuilding = selectedSlot?.buildingId
    ? Building.getById(selectedSlot.buildingId)
    : null

  // Only get slots with buildings
  const builtSlots = useMemo(() => {
    return slots.filter((s) => s.buildingId !== null)
  }, [slots])

  const hasEmptySlot = Slot.getEmpty(state).length > 0
  const nextExpansionPerk = Perk.getNextExpansionPerk(state)

  const handleAddClick = () => {
    if (hasEmptySlot) {
      const emptySlot = Slot.getEmpty(state)[0]
      setBuildSlotIndex(emptySlot.index)
    } else {
      setShowFullModal(true)
    }
  }

  const handleDemolish = () => {
    if (detailsSlotIndex !== null) {
      demolishSlot(detailsSlotIndex)
      setDetailsSlotIndex(null)
    }
  }

  const handleExpandPark = () => {
    setShowFullModal(false)
    navigateTo('perks')
  }

  return (
    <>
      {/* Match stats-bar: px-4, grid-cols-6 gap-1.5 */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-6 gap-1.5">
          {builtSlots.map((slot) => (
            <BuildingTile
              key={slot.index}
              slot={slot}
              onClick={() => setDetailsSlotIndex(slot.index)}
            />
          ))}
          {/* Always show one Add button */}
          <AddTile onClick={handleAddClick} />
        </div>
      </div>

      <AnimatePresence>
        {buildSlotIndex !== null && (
          <BuildingSelector slotIndex={buildSlotIndex} onClose={() => setBuildSlotIndex(null)} />
        )}
      </AnimatePresence>

      <BuildingDetails
        building={selectedBuilding ?? null}
        onClose={() => setDetailsSlotIndex(null)}
        onDemolish={handleDemolish}
      />

      {/* Park Full Modal */}
      <AnimatePresence>
        {showFullModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-surface)] rounded-2xl p-5 w-full max-w-xs text-center border border-[var(--color-border)]"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center mx-auto mb-3">
                <Expand size={24} className="text-[var(--color-accent)]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Park is Full</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                {nextExpansionPerk
                  ? `Get "${nextExpansionPerk.name}" to unlock more building slots.`
                  : "You've built in all available slots!"}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFullModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-bg)] text-sm font-medium active:bg-[var(--color-surface-hover)] transition-colors"
                >
                  Close
                </button>
                {nextExpansionPerk && (
                  <button
                    onClick={handleExpandPark}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium active:opacity-90 transition-opacity"
                  >
                    View Perks
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
