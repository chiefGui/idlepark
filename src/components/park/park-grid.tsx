import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Lock } from 'lucide-react'
import type { SlotState, BuildingCategory } from '../../engine/game-types'
import { useGameStore } from '../../store/game-store'
import { Building } from '../../systems/building'
import { BuildingIcon } from '../../buildings'
import { colors } from '../../buildings/icon-base'
import { BuildingSelector } from '../slots/building-selector'
import { BuildingDetails } from '../slots/building-details'

// Category indicator colors
const categoryColor: Record<BuildingCategory, string> = {
  rides: colors.rides.primary,
  food: colors.food.primary,
  facilities: colors.facilities.primary,
  decor: colors.decor.primary,
  lodging: colors.lodging.primary,
  shops: colors.shops.primary,
}

type TileProps = {
  slot: SlotState
  onClick: () => void
}

function Tile({ slot, onClick }: TileProps) {
  const building = slot.buildingId ? Building.getById(slot.buildingId) : null
  const isLocked = slot.locked
  const isEmpty = !building && !isLocked

  if (isLocked) {
    return (
      <div className="aspect-square flex items-center justify-center rounded-xl border border-[var(--color-border)]/20 bg-[var(--color-surface)]/20">
        <Lock size={12} className="text-[var(--color-text-muted)]/30" />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="aspect-square flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)]/40 active:border-[var(--color-accent)]"
      >
        <Plus size={18} className="text-[var(--color-text-muted)]/50" />
      </motion.button>
    )
  }

  const catColor = categoryColor[building!.category]

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="aspect-square relative flex items-center justify-center rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] active:bg-[var(--color-surface-hover)]"
    >
      <BuildingIcon buildingId={building!.id} size={32} />
      <div
        className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: catColor }}
      />
    </motion.button>
  )
}

export function ParkGrid() {
  const slots = useGameStore((s) => s.slots)
  const demolishSlot = useGameStore((s) => s.actions.demolishSlot)

  const [buildSlotIndex, setBuildSlotIndex] = useState<number | null>(null)
  const [detailsSlotIndex, setDetailsSlotIndex] = useState<number | null>(null)

  const selectedSlot = detailsSlotIndex !== null ? slots[detailsSlotIndex] : null
  const selectedBuilding = selectedSlot?.buildingId
    ? Building.getById(selectedSlot.buildingId)
    : null

  // Sort: built first, then empty, then locked
  const sortedSlots = useMemo(() => {
    const built = slots.filter((s) => s.buildingId !== null)
    const empty = slots.filter((s) => !s.locked && s.buildingId === null)
    const locked = slots.filter((s) => s.locked)
    return [...built, ...empty, ...locked]
  }, [slots])

  const handleTileClick = (slot: SlotState) => {
    if (slot.locked) return
    if (slot.buildingId) {
      setDetailsSlotIndex(slot.index)
    } else {
      setBuildSlotIndex(slot.index)
    }
  }

  const handleDemolish = () => {
    if (detailsSlotIndex !== null) {
      demolishSlot(detailsSlotIndex)
      setDetailsSlotIndex(null)
    }
  }

  return (
    <>
      {/* Match stats-bar: px-4, grid-cols-6 gap-1.5 */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-6 gap-1.5">
          {sortedSlots.map((slot) => (
            <Tile key={slot.index} slot={slot} onClick={() => handleTileClick(slot)} />
          ))}
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
    </>
  )
}
