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

// Grid configuration
const GRID_COLS = 4
const TILE_SIZE = 76
const TILE_GAP = 8

// Category indicator colors (subtle)
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
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          backgroundColor: 'var(--color-surface)',
          opacity: 0.25,
        }}
      >
        <Lock size={14} className="text-[var(--color-text-muted)]" />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        className="flex items-center justify-center rounded-2xl border-2 border-dashed transition-colors active:border-[var(--color-accent)]"
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          borderColor: 'var(--color-border)',
          backgroundColor: 'transparent',
        }}
      >
        <Plus size={22} className="text-[var(--color-text-muted)]" />
      </motion.button>
    )
  }

  // Built tile - clean, icon-focused
  const catColor = categoryColor[building!.category]

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="relative flex items-center justify-center rounded-2xl bg-[var(--color-surface)] active:bg-[var(--color-surface-hover)]"
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
      }}
    >
      {/* Icon - the star */}
      <BuildingIcon buildingId={building!.id} size={44} />

      {/* Category indicator - small dot bottom right */}
      <div
        className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full"
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
      <div className="px-4 pb-6">
        <div
          className="grid justify-center mx-auto"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, ${TILE_SIZE}px)`,
            gap: TILE_GAP,
          }}
        >
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
