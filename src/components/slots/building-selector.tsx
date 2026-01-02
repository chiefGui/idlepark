import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, ChevronRight, BedDouble, ShoppingBag } from 'lucide-react'
import { Building } from '../../systems/building'
import { useGameStore } from '../../store/game-store'
import { Requirements } from '../../engine/requirements'
import { Format } from '../../utils/format'
import { BuildingPreview } from './building-preview'
import { BuildingIcon } from '../../buildings'
import { STAT_CONFIG } from '../../constants/stats'
import type { BuildingCategory, BuildingDef, StatId } from '../../engine/game-types'

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

  // Count how many of each building type the player owns
  const buildingCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const slot of state.slots) {
      if (slot.buildingId) {
        counts.set(slot.buildingId, (counts.get(slot.buildingId) ?? 0) + 1)
      }
    }
    return counts
  }, [state.slots])

  const categoryBuildings = useMemo(() => {
    return Building.getByCategory(activeCategory).map((building) => ({
      building,
      isUnlocked: Building.isUnlocked(building, state),
      canAfford: Building.canAfford(building, state),
      ownedCount: buildingCounts.get(building.id) ?? 0,
      unmetReqs: Requirements.getUnmetRequirements(building.requirements, state),
    }))
  }, [activeCategory, state, buildingCounts])

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

          {/* Building List - Single column for better info display */}
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {unlockedBuildings.map(({ building, canAfford, ownedCount }) => (
              <BuildingCard
                key={building.id}
                building={building}
                canAfford={canAfford}
                ownedCount={ownedCount}
                onTap={() => setPreviewBuilding(building)}
              />
            ))}

            {lockedBuildings.length > 0 && (
              <>
                {unlockedBuildings.length > 0 && (
                  <div className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider pt-2 px-1">
                    Locked
                  </div>
                )}
                {lockedBuildings.map(({ building, unmetReqs }) => (
                  <LockedBuildingCard
                    key={building.id}
                    building={building}
                    unlockReason={unmetReqs[0] ? Requirements.formatRequirement(unmetReqs[0]) : ''}
                  />
                ))}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Building Preview Sheet */}
      <BuildingPreview
        building={previewBuilding}
        canAfford={previewData?.canAfford ?? false}
        ownedCount={previewData?.ownedCount ?? 0}
        onClose={() => setPreviewBuilding(null)}
        onBuild={() => previewBuilding && handleBuild(previewBuilding.id)}
      />
    </AnimatePresence>
  )
}

type BuildingCardProps = {
  building: BuildingDef
  canAfford: boolean
  ownedCount: number
  onTap: () => void
}

function BuildingCard({ building, canAfford, ownedCount, onTap }: BuildingCardProps) {
  const cost = building.costs[0]?.amount ?? 0
  const effects = Building.getDisplayEffects(building)

  // Separate benefits from costs
  const benefits = effects.filter(e => e.statId !== 'money' && e.isPositive)
  const costs = effects.filter(e => e.statId === 'money' && !e.isPositive)
  const upkeep = costs[0]?.value ? Math.abs(costs[0].value) : 0

  // Special handling for lodging and shops
  const isLodging = Building.isLodging(building)
  const isShop = Building.isShop(building)

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
      className={`
        w-full p-3 rounded-xl border text-left transition-all
        ${canAfford
          ? 'bg-[var(--color-surface)] border-[var(--color-border)] active:bg-[var(--color-surface-hover)]'
          : 'bg-[var(--color-surface)]/50 border-[var(--color-border)]/50'
        }
      `}
    >
      {/* Header: Icon + Name + Count */}
      <div className="flex items-center gap-3 mb-2">
        <div className={!canAfford ? 'opacity-50' : ''}>
          <BuildingIcon buildingId={building.id} size={36} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-medium truncate ${!canAfford ? 'text-[var(--color-text-muted)]' : ''}`}>
            {building.name}
          </div>
        </div>
        {ownedCount > 0 && (
          <div className="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs font-semibold">
            ×{ownedCount}
          </div>
        )}
      </div>

      {/* Stats Row - All benefits with icons */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {/* Lodging capacity */}
        {isLodging && (
          <StatBadge
            icon={<BedDouble size={12} />}
            value={`+${building.capacityBonus}`}
            label="cap"
            color="#6366f1"
            muted={!canAfford}
          />
        )}

        {/* Shop income */}
        {isShop && (
          <StatBadge
            icon={<ShoppingBag size={12} />}
            value={`$${building.incomePerGuest.toFixed(2)}`}
            label="/guest"
            color="#22c55e"
            muted={!canAfford}
          />
        )}

        {/* Regular stat benefits */}
        {benefits.filter(e => e.statId !== 'capacity' && e.statId !== 'income').map((effect, i) => {
          const config = STAT_CONFIG[effect.statId as StatId]
          if (!config) return null
          const Icon = config.icon
          return (
            <StatBadge
              key={i}
              icon={<Icon size={12} />}
              value={`+${effect.value}`}
              color={config.color}
              muted={!canAfford}
            />
          )
        })}

        {/* Negative effects (except money/upkeep) */}
        {effects.filter(e => e.statId !== 'money' && !e.isPositive).map((effect, i) => {
          const config = STAT_CONFIG[effect.statId as StatId]
          if (!config) return null
          const Icon = config.icon
          return (
            <StatBadge
              key={`neg-${i}`}
              icon={<Icon size={12} />}
              value={`${effect.value}`}
              color="var(--color-negative)"
              muted={!canAfford}
            />
          )
        })}
      </div>

      {/* Footer: Cost + Upkeep + Chevron */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className={`font-semibold ${canAfford ? 'text-[var(--color-positive)]' : 'text-[var(--color-text-muted)]'}`}>
            {Format.money(cost)}
          </span>
          {upkeep > 0 && (
            <span className="text-[var(--color-text-muted)] text-xs">
              −{Format.money(upkeep)}/day
            </span>
          )}
        </div>
        <ChevronRight size={16} className="text-[var(--color-text-muted)]" />
      </div>
    </motion.button>
  )
}

type StatBadgeProps = {
  icon: React.ReactNode
  value: string
  label?: string
  color: string
  muted?: boolean
}

function StatBadge({ icon, value, label, color, muted }: StatBadgeProps) {
  return (
    <div
      className={`
        inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium
        ${muted ? 'opacity-50' : ''}
      `}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        color: color
      }}
    >
      {icon}
      <span>{value}</span>
      {label && <span className="opacity-70">{label}</span>}
    </div>
  )
}

type LockedBuildingCardProps = {
  building: BuildingDef
  unlockReason: string
}

function LockedBuildingCard({ building, unlockReason }: LockedBuildingCardProps) {
  return (
    <div className="w-full p-3 rounded-xl border border-[var(--color-border)]/30 bg-[var(--color-surface)]/20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="grayscale opacity-40">
          <BuildingIcon buildingId={building.id} size={36} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate text-[var(--color-text-muted)]/60">
            {building.name}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[var(--color-warning)] mt-0.5">
            <Lock size={10} />
            <span>{unlockReason}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
