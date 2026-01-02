import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus, Expand } from 'lucide-react'
import type { BuildingCategory, SlotState } from '../../engine/game-types'
import { useGameStore } from '../../store/game-store'
import { Building } from '../../systems/building'
import { BuildingIcon } from '../../buildings'
import { Slot } from '../../systems/slot'
import { Perk } from '../../systems/perk'
import { BuildingSelector } from '../slots/building-selector'
import { BuildingDetails } from '../slots/building-details'
import { useDrawerNavigation } from '../ui/drawer-hooks'

export function BuildingsPanel() {
  const state = useGameStore()
  const slots = state.slots
  const demolishSlot = useGameStore((s) => s.actions.demolishSlot)
  const navigateTo = useDrawerNavigation()
  const [expandedCategories, setExpandedCategories] = useState<Set<BuildingCategory>>(
    new Set(['rides', 'food', 'facilities', 'decor'])
  )
  const [buildCategory, setBuildCategory] = useState<BuildingCategory | null>(null)
  const [detailsSlotIndex, setDetailsSlotIndex] = useState<number | null>(null)
  const [showFullModal, setShowFullModal] = useState(false)

  const selectedSlot = detailsSlotIndex !== null ? slots[detailsSlotIndex] : null
  const selectedBuilding = selectedSlot?.buildingId
    ? Building.getById(selectedSlot.buildingId)
    : null

  const hasEmptySlot = Slot.getEmpty(state).length > 0
  const nextExpansionPerk = Perk.getNextExpansionPerk(state)

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

  const handleBuildAttempt = (category: BuildingCategory) => {
    if (hasEmptySlot) {
      setBuildCategory(category)
    } else {
      setShowFullModal(true)
    }
  }

  const handleExpandPark = () => {
    setShowFullModal(false)
    navigateTo('perks')
  }

  return (
    <>
      <div className="space-y-3 px-4 pb-4">
        {Building.CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            slots={slots}
            isExpanded={expandedCategories.has(cat.id)}
            onToggle={() => toggleCategory(cat.id)}
            onBuild={() => handleBuildAttempt(cat.id)}
            onSelectBuilding={setDetailsSlotIndex}
          />
        ))}
      </div>

      <AnimatePresence>
        {buildCategory !== null && (
          <BuildingSelector
            slotIndex={Slot.getFirstEmptyIndex({ slots }) ?? -1}
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

type CategorySectionProps = {
  category: { id: BuildingCategory; label: string; emoji: string; hint: string }
  slots: SlotState[]
  isExpanded: boolean
  onToggle: () => void
  onBuild: () => void
  onSelectBuilding: (slotIndex: number) => void
}

function CategorySection({
  category,
  slots,
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
                    <BuildingIcon buildingId={building.id} size={32} />
                    <span className="text-[10px] font-medium text-center px-1 leading-tight truncate w-full">
                      {building.name}
                    </span>
                  </motion.button>
                ))}

                {/* Add button - always visible */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onBuild}
                  className="aspect-square rounded-xl border-2 border-dashed border-[var(--color-accent)] bg-[var(--color-accent)]/10 flex flex-col items-center justify-center gap-1 active:bg-[var(--color-accent)]/20 transition-colors"
                >
                  <Plus size={24} className="text-[var(--color-accent)]" />
                  <span className="text-[10px] font-medium text-[var(--color-accent)]">Add</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
