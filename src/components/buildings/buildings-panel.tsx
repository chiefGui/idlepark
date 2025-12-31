import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus } from 'lucide-react'
import type { BuildingCategory, SlotState } from '../../engine/game-types'
import { useGameStore } from '../../store/game-store'
import { Building } from '../../systems/building'
import { Slot } from '../../systems/slot'
import { Perk } from '../../systems/perk'
import { Format } from '../../utils/format'
import { BuildingSelector } from '../slots/building-selector'
import { BuildingDetails } from '../slots/building-details'

export function BuildingsPanel() {
  const slots = useGameStore((s) => s.slots)
  const ownedPerks = useGameStore((s) => s.ownedPerks)
  const demolishSlot = useGameStore((s) => s.actions.demolishSlot)
  const [expandedCategories, setExpandedCategories] = useState<Set<BuildingCategory>>(
    new Set(['rides', 'food', 'facilities', 'decor'])
  )
  const [buildCategory, setBuildCategory] = useState<BuildingCategory | null>(null)
  const [detailsSlotIndex, setDetailsSlotIndex] = useState<number | null>(null)

  const selectedSlot = detailsSlotIndex !== null ? slots[detailsSlotIndex] : null
  const selectedBuilding = selectedSlot?.buildingId
    ? Building.getById(selectedSlot.buildingId)
    : null

  const toggleCategory = (category: BuildingCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const handleDemolish = () => {
    if (detailsSlotIndex !== null) {
      demolishSlot(detailsSlotIndex)
    }
  }

  // Park capacity info
  const state = useGameStore()
  const emptySlots = Slot.getEmpty(state)
  const totalUnlocked = Slot.getUnlocked(state).length
  const nextExpansion = Perk.getNextExpansionPerk(state)

  return (
    <>
      <div className="space-y-3 px-4 pb-4">
        {/* Slot capacity bar */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Park Capacity</span>
            <span className="text-sm text-[var(--color-text-muted)]">
              {totalUnlocked - emptySlots.length}/{totalUnlocked} slots used
            </span>
          </div>
          <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent)] rounded-full transition-all"
              style={{ width: `${((totalUnlocked - emptySlots.length) / totalUnlocked) * 100}%` }}
            />
          </div>
          {emptySlots.length === 0 && nextExpansion && (
            <div className="mt-2 text-xs text-[var(--color-text-muted)]">
              Park full! Buy <span className="text-[var(--color-accent)] font-medium">{nextExpansion.name}</span> in Perks for more slots ({Format.money(nextExpansion.costs[0]?.amount ?? 0)})
            </div>
          )}
        </div>

        {Building.CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            slots={slots}
            ownedPerks={ownedPerks}
            isExpanded={expandedCategories.has(cat.id)}
            onToggle={() => toggleCategory(cat.id)}
            onBuild={() => setBuildCategory(cat.id)}
            onSelectBuilding={setDetailsSlotIndex}
          />
        ))}
      </div>

      <AnimatePresence>
        {buildCategory !== null && (
          <BuildingSelector
            slotIndex={Slot.getFirstEmptyIndex({ slots } as any) ?? -1}
            onClose={() => setBuildCategory(null)}
            initialCategory={buildCategory}
          />
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

type CategorySectionProps = {
  category: { id: BuildingCategory; label: string; emoji: string; hint: string }
  slots: SlotState[]
  ownedPerks: string[]
  isExpanded: boolean
  onToggle: () => void
  onBuild: () => void
  onSelectBuilding: (slotIndex: number) => void
}

function CategorySection({
  category,
  slots,
  ownedPerks,
  isExpanded,
  onToggle,
  onBuild,
  onSelectBuilding,
}: CategorySectionProps) {
  const buildingsInCategory = useMemo(() => {
    return slots
      .filter((slot) => {
        if (!slot.buildingId) return false
        const building = Building.getById(slot.buildingId)
        return building?.category === category.id
      })
      .map((slot) => ({
        slot,
        building: Building.getById(slot.buildingId!)!,
      }))
  }, [slots, category.id])

  const emptySlots = Slot.getEmpty({ slots, ownedPerks } as any)
  const hasEmptySlot = emptySlots.length > 0

  return (
    <motion.div
      layout
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden"
    >
      {/* Header */}
      <motion.button
        layout="position"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 active:bg-[var(--color-surface-hover)] transition-colors"
      >
        <span className="text-2xl">{category.emoji}</span>
        <div className="flex-1 text-left">
          <div className="font-semibold">{category.label}</div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {buildingsInCategory.length === 0
              ? category.hint
              : `${buildingsInCategory.length} built`}
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={20} className="text-[var(--color-text-muted)]" />
        </motion.div>
      </motion.button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3 pb-3 pt-1">
              <div className="grid grid-cols-4 gap-2">
                {/* Built buildings */}
                {buildingsInCategory.map(({ slot, building }) => (
                  <motion.button
                    key={slot.index}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectBuilding(slot.index)}
                    className="aspect-square rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] flex flex-col items-center justify-center gap-1 active:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <span className="text-2xl">{building.emoji}</span>
                    <span className="text-[10px] font-medium text-center px-1 leading-tight truncate w-full">
                      {building.name}
                    </span>
                  </motion.button>
                ))}

                {/* Add button - only show if there's an empty slot */}
                {hasEmptySlot && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onBuild}
                    className="aspect-square rounded-xl border-2 border-dashed border-[var(--color-accent)] bg-[var(--color-accent)]/10 flex flex-col items-center justify-center gap-1 active:bg-[var(--color-accent)]/20 transition-colors"
                  >
                    <Plus size={24} className="text-[var(--color-accent)]" />
                    <span className="text-[10px] font-medium text-[var(--color-accent)]">Add</span>
                  </motion.button>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
