import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Check, ChevronRight } from 'lucide-react'
import { Building } from '../../systems/building'
import { useGameStore } from '../../store/game-store'
import { Requirements } from '../../engine/requirements'
import { Format } from '../../utils/format'
import { BuildingPreview } from './building-preview'
import type { BuildingCategory, BuildingDef } from '../../engine/game-types'

type BuildingSelectorProps = {
  slotIndex: number
  onClose: () => void
  initialCategory?: BuildingCategory
}

export function BuildingSelector({ slotIndex, onClose, initialCategory }: BuildingSelectorProps) {
  const state = useGameStore()
  const buildAtSlot = useGameStore((s) => s.actions.buildAtSlot)
  const [activeCategory, setActiveCategory] = useState<BuildingCategory>(initialCategory ?? 'rides')
  const [previewBuilding, setPreviewBuilding] = useState<BuildingDef | null>(null)

  // Check what's already built
  const ownedBuildingIds = useMemo(() => {
    return new Set(state.slots.filter(s => s.buildingId).map(s => s.buildingId!))
  }, [state.slots])

  const categoryBuildings = useMemo(() => {
    return Building.getByCategory(activeCategory).map((building) => ({
      building,
      isUnlocked: Building.isUnlocked(building, state),
      canAfford: Building.canAfford(building, state),
      isOwned: ownedBuildingIds.has(building.id),
      unmetReqs: Requirements.getUnmetRequirements(building.requirements, state),
    }))
  }, [activeCategory, state, ownedBuildingIds])

  const unlockedBuildings = categoryBuildings.filter((b) => b.isUnlocked)
  const lockedBuildings = categoryBuildings.filter((b) => !b.isUnlocked)

  const handleBuild = (buildingId: string) => {
    const success = buildAtSlot(buildingId, slotIndex)
    if (success) onClose()
  }

  // Get preview state
  const previewData = useMemo(() => {
    if (!previewBuilding) return null
    const data = categoryBuildings.find(b => b.building.id === previewBuilding.id)
    return data ?? null
  }, [previewBuilding, categoryBuildings])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="
            bg-[var(--color-bg)] border-t border-[var(--color-border)]
            rounded-t-2xl sm:rounded-xl w-full sm:max-w-md max-h-[85vh] overflow-hidden
            flex flex-col
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-semibold">Build</h2>
            <button
              onClick={onClose}
              className="p-2 active:bg-[var(--color-surface)] rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 p-2 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
            {Building.CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all
                  ${activeCategory === cat.id
                    ? 'bg-[var(--color-bg)] shadow-sm'
                    : 'text-[var(--color-text-muted)] active:bg-[var(--color-bg)]/50'
                  }
                `}
              >
                <span className="text-base">{cat.emoji}</span>
                <div className="mt-0.5">{cat.label}</div>
              </button>
            ))}
          </div>

          {/* Building Grid */}
          <div className="flex-1 overflow-auto p-3">
            {unlockedBuildings.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {unlockedBuildings.map(({ building, canAfford, isOwned }) => (
                  <BuildingCard
                    key={building.id}
                    building={building}
                    canAfford={canAfford}
                    isOwned={isOwned}
                    onTap={() => setPreviewBuilding(building)}
                  />
                ))}
              </div>
            )}

            {lockedBuildings.length > 0 && (
              <>
                {unlockedBuildings.length > 0 && (
                  <div className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-1">
                    Locked
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {lockedBuildings.map(({ building, unmetReqs }) => (
                    <LockedBuildingCard
                      key={building.id}
                      building={building}
                      unlockReason={unmetReqs[0] ? Requirements.formatRequirement(unmetReqs[0]) : ''}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Building Preview Sheet */}
      <BuildingPreview
        building={previewBuilding}
        canAfford={previewData?.canAfford ?? false}
        isOwned={previewData?.isOwned ?? false}
        onClose={() => setPreviewBuilding(null)}
        onBuild={() => previewBuilding && handleBuild(previewBuilding.id)}
      />
    </AnimatePresence>
  )
}

type BuildingCardProps = {
  building: BuildingDef
  canAfford: boolean
  isOwned: boolean
  onTap: () => void
}

/**
 * Get the primary highlight for a building - the most important thing to show.
 */
function getPrimaryHighlight(building: BuildingDef): { label: string; value: string; type: 'positive' | 'warning' } {
  // Lodging: show capacity
  if (Building.isLodging(building)) {
    return {
      label: 'capacity',
      value: `+${building.capacityBonus}`,
      type: 'positive',
    }
  }

  // Shops: show income per guest
  if (Building.isShop(building)) {
    return {
      label: '$/guest',
      value: `$${building.incomePerGuest.toFixed(2)}`,
      type: 'positive',
    }
  }

  // Others: find the biggest positive non-money effect
  const effects = Building.getDisplayEffects(building)
  const benefits = effects
    .filter(e => e.statId !== 'money' && e.isPositive)
    .sort((a, b) => b.value - a.value)

  if (benefits.length > 0) {
    const best = benefits[0]
    return {
      label: Format.statLabel(best.statId),
      value: `+${best.value}`,
      type: 'positive',
    }
  }

  return { label: '', value: '', type: 'positive' }
}

function BuildingCard({ building, canAfford, isOwned, onTap }: BuildingCardProps) {
  const cost = building.costs[0]?.amount ?? 0
  const upkeep = Building.getUpkeep(building)
  const highlight = getPrimaryHighlight(building)

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onTap}
      className={`
        relative p-3 rounded-xl border text-left transition-all
        ${canAfford
          ? 'bg-[var(--color-surface)] border-[var(--color-border)] active:bg-[var(--color-surface-hover)]'
          : 'bg-[var(--color-surface)]/50 border-[var(--color-border)]/50'
        }
      `}
    >
      {/* Owned badge */}
      {isOwned && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 rounded-full bg-[var(--color-positive)]/20 flex items-center justify-center">
            <Check size={12} className="text-[var(--color-positive)]" />
          </div>
        </div>
      )}

      {/* Emoji + Name row */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-2xl ${!canAfford ? 'opacity-50' : ''}`}>{building.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-medium text-sm truncate ${!canAfford ? 'text-[var(--color-text-muted)]' : ''}`}>
            {building.name}
          </div>
        </div>
      </div>

      {/* Primary highlight badge */}
      {highlight.value && (
        <div className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold mb-2
          ${highlight.type === 'positive'
            ? 'bg-[var(--color-positive)]/15 text-[var(--color-positive)]'
            : 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]'
          }
          ${!canAfford ? 'opacity-60' : ''}
        `}>
          <span>{highlight.value}</span>
          <span className="opacity-70">{highlight.label}</span>
        </div>
      )}

      {/* Cost row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${canAfford ? 'text-[var(--color-positive)]' : 'text-[var(--color-text-muted)]'}`}>
            {Format.money(cost)}
          </span>
          {upkeep > 0 && (
            <span className="text-[var(--color-text-muted)]">
              −${upkeep}/d
            </span>
          )}
        </div>
        <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
      </div>
    </motion.button>
  )
}

type LockedBuildingCardProps = {
  building: BuildingDef
  unlockReason: string
}

function LockedBuildingCard({ building, unlockReason }: LockedBuildingCardProps) {
  return (
    <div className="relative p-3 rounded-xl border border-[var(--color-border)]/30 bg-[var(--color-surface)]/20">
      {/* Locked badge */}
      <div className="absolute top-2 right-2">
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--color-text-muted)]/20 text-[10px] text-[var(--color-text-muted)]">
          <Lock size={10} />
        </div>
      </div>

      {/* Emoji + Name */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl grayscale opacity-40">{building.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate text-[var(--color-text-muted)]/60">
            {building.name}
          </div>
        </div>
      </div>

      {/* Unlock requirement */}
      <div className="text-[10px] text-[var(--color-warning)] mt-2 truncate">
        {unlockReason}
      </div>
    </div>
  )
}
