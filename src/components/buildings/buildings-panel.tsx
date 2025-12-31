import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus, Lock } from 'lucide-react'
import type { BuildingCategory, SlotState, StatId } from '../../engine/game-types'
import { useGameStore } from '../../store/game-store'
import { Building } from '../../systems/building'
import { Slot } from '../../systems/slot'
import { Perk } from '../../systems/perk'
import { GameTypes } from '../../engine/game-types'
import { BuildingSelector } from '../slots/building-selector'
import { BuildingDetails } from '../slots/building-details'

type CategoryStats = {
  produces: { statId: StatId; amount: number }[]
  consumes: { statId: StatId; amount: number }[]
}

function getCategoryStats(category: BuildingCategory, slots: SlotState[]): CategoryStats {
  const produces: Map<StatId, number> = new Map()
  const consumes: Map<StatId, number> = new Map()

  for (const slot of slots) {
    if (!slot.buildingId) continue
    const building = Building.getById(slot.buildingId)
    if (!building || building.category !== category) continue

    for (const effect of building.effects) {
      if (effect.perDay > 0) {
        produces.set(effect.statId, (produces.get(effect.statId) ?? 0) + effect.perDay)
      } else if (effect.perDay < 0) {
        consumes.set(effect.statId, (consumes.get(effect.statId) ?? 0) + Math.abs(effect.perDay))
      }
    }
  }

  return {
    produces: Array.from(produces.entries()).map(([statId, amount]) => ({ statId, amount })),
    consumes: Array.from(consumes.entries()).map(([statId, amount]) => ({ statId, amount })),
  }
}

const STAT_LABELS: Record<StatId, string> = {
  money: '$',
  guests: 'guests',
  entertainment: 'fun',
  food: 'food',
  comfort: 'comfort',
  cleanliness: 'clean',
  appeal: 'appeal',
  satisfaction: 'happy',
}

export function BuildingsPanel() {
  const slots = useGameStore((s) => s.slots)
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
  const state = useGameStore()
  const unlockSlot = useGameStore((s) => s.actions.unlockSlot)

  const categoryStats = useMemo(
    () => getCategoryStats(category.id, slots),
    [category.id, slots]
  )

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

  const emptySlots = Slot.getEmpty({ slots } as any)
  const hasEmptySlot = emptySlots.length > 0

  // Check if there's a locked slot that can be unlocked
  const nextUnlockableSlot = Slot.getNextUnlockableSlot(state)
  const canUnlockSlot = nextUnlockableSlot !== null
  const unlockCost = nextUnlockableSlot
    ? GameTypes.SLOT_UNLOCK_COSTS[nextUnlockableSlot.index] ?? 0
    : 0
  const canAffordUnlock = state.stats.money >= unlockCost

  // Check for expansion perks
  const ownedExpansions = state.ownedPerks.filter((p) => p.startsWith('extra_slot')).length
  const nextExpansion = Perk.getById(`extra_slot_${ownedExpansions + 1}`)

  const totalUnlocked = Slot.getUnlocked({ slots } as any).length
  const totalSlots = slots.length

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
            {buildingsInCategory.length} built
          </div>
        </div>

        {/* Stat chips */}
        <div className="flex gap-1 mr-2">
          {categoryStats.produces.slice(0, 2).map(({ statId, amount }) => (
            <span
              key={statId}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-positive)]/15 text-[var(--color-positive)] font-medium"
            >
              +{Math.floor(amount)} {STAT_LABELS[statId]}
            </span>
          ))}
          {categoryStats.consumes
            .filter((c) => c.statId === 'money')
            .slice(0, 1)
            .map(({ statId, amount }) => (
              <span
                key={statId}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-negative)]/15 text-[var(--color-negative)] font-medium"
              >
                -{Math.floor(amount)}{STAT_LABELS[statId]}
              </span>
            ))}
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

                {/* Add button */}
                {hasEmptySlot ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onBuild}
                    className="aspect-square rounded-xl border-2 border-dashed border-[var(--color-accent)] bg-[var(--color-accent)]/10 flex flex-col items-center justify-center gap-1 active:bg-[var(--color-accent)]/20 transition-colors"
                  >
                    <Plus size={24} className="text-[var(--color-accent)]" />
                    <span className="text-[10px] font-medium text-[var(--color-accent)]">Add</span>
                  </motion.button>
                ) : canUnlockSlot ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => unlockSlot(nextUnlockableSlot!.index)}
                    disabled={!canAffordUnlock}
                    className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${
                      canAffordUnlock
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 active:bg-[var(--color-accent)]/20'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)]/50 opacity-60'
                    }`}
                  >
                    <Lock size={16} className={canAffordUnlock ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'} />
                    <span className={`text-[10px] font-medium ${canAffordUnlock ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
                      ${unlockCost}
                    </span>
                  </motion.button>
                ) : nextExpansion ? (
                  <div className="aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50 flex flex-col items-center justify-center gap-1 opacity-60 p-1">
                    <Lock size={16} className="text-[var(--color-text-muted)]" />
                    <span className="text-[8px] text-[var(--color-text-muted)] text-center leading-tight">
                      Buy Expansion perk
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Empty state */}
              {buildingsInCategory.length === 0 && !hasEmptySlot && !canUnlockSlot && (
                <div className="text-center py-4 text-sm text-[var(--color-text-muted)]">
                  No buildings yet
                </div>
              )}

              {/* Slot count */}
              <div className="mt-2 text-[10px] text-[var(--color-text-muted)] text-center">
                {totalUnlocked}/{totalSlots} slots unlocked
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
