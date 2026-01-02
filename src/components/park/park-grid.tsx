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
const GRID_COLS = 6
const GRID_ROWS = 4
const TILE_SIZE = 56
const TILE_GAP = 6

// Category colors for glow/tint effects
const categoryColors: Record<BuildingCategory, { glow: string; tint: string; border: string; shadow: string }> = {
  rides: {
    glow: 'rgba(229, 75, 75, 0.5)',
    tint: 'rgba(229, 75, 75, 0.12)',
    border: colors.rides.primary,
    shadow: 'rgba(139, 38, 53, 0.6)',
  },
  food: {
    glow: 'rgba(244, 162, 54, 0.5)',
    tint: 'rgba(244, 162, 54, 0.12)',
    border: colors.food.primary,
    shadow: 'rgba(93, 58, 26, 0.6)',
  },
  facilities: {
    glow: 'rgba(74, 144, 164, 0.5)',
    tint: 'rgba(74, 144, 164, 0.12)',
    border: colors.facilities.primary,
    shadow: 'rgba(30, 61, 71, 0.6)',
  },
  decor: {
    glow: 'rgba(106, 176, 76, 0.5)',
    tint: 'rgba(106, 176, 76, 0.12)',
    border: colors.decor.primary,
    shadow: 'rgba(27, 67, 50, 0.6)',
  },
  lodging: {
    glow: 'rgba(155, 93, 229, 0.5)',
    tint: 'rgba(155, 93, 229, 0.12)',
    border: colors.lodging.primary,
    shadow: 'rgba(60, 42, 82, 0.6)',
  },
  shops: {
    glow: 'rgba(247, 37, 133, 0.5)',
    tint: 'rgba(247, 37, 133, 0.12)',
    border: colors.shops.primary,
    shadow: 'rgba(86, 11, 173, 0.6)',
  },
}

type TileProps = {
  slot: SlotState
  index: number
  onClick: () => void
}

function IsometricTile({ slot, index, onClick }: TileProps) {
  const building = slot.buildingId ? Building.getById(slot.buildingId) : null
  const isLocked = slot.locked
  const isEmpty = !building && !isLocked

  const categoryStyle = building ? categoryColors[building.category] : null

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      whileHover={!isLocked ? { scale: 1.08, zIndex: 10 } : undefined}
      whileTap={!isLocked ? { scale: 0.95 } : undefined}
      onClick={onClick}
      disabled={isLocked}
      className="relative"
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
      }}
    >
      {/* 3D depth shadow layer (bottom) */}
      <div
        className="absolute transition-all duration-200"
        style={{
          width: '100%',
          height: '100%',
          transform: 'rotate(45deg) scale(0.707) translateY(3px)',
          transformOrigin: 'center',
          borderRadius: '3px',
          backgroundColor: building
            ? categoryStyle?.shadow
            : isLocked
            ? 'rgba(0,0,0,0.2)'
            : 'rgba(0,0,0,0.15)',
          opacity: isLocked ? 0.3 : 0.8,
        }}
      />

      {/* Main isometric tile surface */}
      <div
        className="absolute transition-all duration-200"
        style={{
          width: '100%',
          height: '100%',
          transform: 'rotate(45deg) scale(0.707)',
          transformOrigin: 'center',
          borderRadius: '3px',
          backgroundColor: isLocked
            ? 'var(--color-surface)'
            : isEmpty
            ? 'var(--color-surface)'
            : categoryStyle?.tint,
          border: building
            ? `2px solid ${categoryStyle?.border}`
            : isLocked
            ? '1px solid var(--color-border)'
            : '2px dashed var(--color-text-muted)',
          boxShadow: building
            ? `0 0 16px ${categoryStyle?.glow}, inset 0 2px 8px rgba(255,255,255,0.1)`
            : isEmpty
            ? 'inset 0 2px 4px rgba(255,255,255,0.05)'
            : 'none',
          opacity: isLocked ? 0.35 : 1,
        }}
      />

      {/* Inner highlight (top-left light) */}
      {building && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: '100%',
            height: '100%',
            transform: 'rotate(45deg) scale(0.707)',
            transformOrigin: 'center',
            borderRadius: '3px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
          }}
        />
      )}

      {/* Content (not rotated) */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {building ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <BuildingIcon buildingId={building.id} size={30} />
          </motion.div>
        ) : isLocked ? (
          <Lock size={12} className="text-[var(--color-text-muted)] opacity-40" />
        ) : (
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Plus size={18} className="text-[var(--color-text-muted)]" />
          </motion.div>
        )}
      </div>
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

  // Sort: occupied slots first (maintains build order), then empty, then locked
  const sortedSlots = useMemo(() => {
    const occupied = slots.filter(s => s.buildingId !== null)
    const empty = slots.filter(s => !s.locked && s.buildingId === null)
    const locked = slots.filter(s => s.locked)
    return [...occupied, ...empty, ...locked]
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

  const gridWidth = GRID_COLS * (TILE_SIZE + TILE_GAP) - TILE_GAP

  // Count buildings by category for legend
  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<BuildingCategory, number>> = {}
    for (const slot of slots) {
      if (!slot.buildingId) continue
      const b = Building.getById(slot.buildingId)
      if (b) {
        counts[b.category] = (counts[b.category] || 0) + 1
      }
    }
    return counts
  }, [slots])

  return (
    <>
      <div className="flex flex-col items-center px-2 pb-4">
        {/* Park ground with subtle pattern */}
        <div
          className="relative p-3 rounded-2xl overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, var(--color-surface) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, var(--color-surface) 0%, transparent 50%),
              var(--color-bg)
            `,
            border: '1px solid var(--color-border)',
            boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.2), 0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(var(--color-text) 1px, transparent 1px),
                linear-gradient(90deg, var(--color-text) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Grid container */}
          <div
            className="grid relative z-10"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, ${TILE_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, ${TILE_SIZE}px)`,
              gap: TILE_GAP,
              width: gridWidth,
            }}
          >
            {sortedSlots.slice(0, GRID_COLS * GRID_ROWS).map((slot, i) => (
              <IsometricTile
                key={slot.index}
                slot={slot}
                index={i}
                onClick={() => handleTileClick(slot)}
              />
            ))}
          </div>
        </div>

        {/* Legend - only show if there are buildings */}
        {Object.keys(categoryCounts).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2"
          >
            {Building.CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id]
              if (!count) return null

              return (
                <div key={cat.id} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{
                      backgroundColor: categoryColors[cat.id].border,
                      boxShadow: `0 0 8px ${categoryColors[cat.id].glow}`,
                    }}
                  />
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    {cat.label} <span className="opacity-60">({count})</span>
                  </span>
                </div>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* Building Selector Modal */}
      <AnimatePresence>
        {buildSlotIndex !== null && (
          <BuildingSelector
            slotIndex={buildSlotIndex}
            onClose={() => setBuildSlotIndex(null)}
          />
        )}
      </AnimatePresence>

      {/* Building Details Modal */}
      <BuildingDetails
        building={selectedBuilding ?? null}
        onClose={() => setDetailsSlotIndex(null)}
        onDemolish={handleDemolish}
      />
    </>
  )
}
