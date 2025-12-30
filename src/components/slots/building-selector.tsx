import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Check } from 'lucide-react'
import { Building } from '../../systems/building'
import { useGameStore } from '../../store/game-store'
import { Requirements } from '../../engine/requirements'
import { Format } from '../../utils/format'
import type { BuildingCategory, BuildingDef, StatId } from '../../engine/game-types'

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

type BuildingSelectorProps = {
  slotIndex: number
  onClose: () => void
}

export function BuildingSelector({ slotIndex, onClose }: BuildingSelectorProps) {
  const state = useGameStore()
  const buildAtSlot = useGameStore((s) => s.actions.buildAtSlot)
  const [activeCategory, setActiveCategory] = useState<BuildingCategory>('rides')

  const categoryBuildings = useMemo(() => {
    return Building.getByCategory(activeCategory).map((building) => ({
      building,
      isUnlocked: Building.isUnlocked(building, state),
      canAfford: Building.canAfford(building, state),
      unmetReqs: Requirements.getUnmetRequirements(building.requirements, state),
    }))
  }, [activeCategory, state])

  const unlockedBuildings = categoryBuildings.filter((b) => b.isUnlocked)
  const lockedBuildings = categoryBuildings.filter((b) => !b.isUnlocked)

  const handleBuild = (buildingId: string) => {
    const success = buildAtSlot(buildingId, slotIndex)
    if (success) onClose()
  }

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
                {unlockedBuildings.map(({ building, canAfford }) => (
                  <BuildingCard
                    key={building.id}
                    building={building}
                    canAfford={canAfford}
                    onBuild={() => handleBuild(building.id)}
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
    </AnimatePresence>
  )
}

type BuildingCardProps = {
  building: BuildingDef
  canAfford: boolean
  onBuild: () => void
}

function BuildingCard({ building, canAfford, onBuild }: BuildingCardProps) {
  const cost = building.costs[0]?.amount ?? 0

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onBuild}
      disabled={!canAfford}
      className={`
        relative p-3 rounded-xl border text-left transition-all
        ${canAfford
          ? 'bg-[var(--color-surface)] border-[var(--color-border)] active:bg-[var(--color-surface-hover)]'
          : 'bg-[var(--color-surface)]/50 border-[var(--color-border)]/50'
        }
      `}
    >
      {/* Emoji + Name row */}
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-2xl ${!canAfford ? 'opacity-50' : ''}`}>{building.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-medium text-sm truncate ${!canAfford ? 'text-[var(--color-text-muted)]' : ''}`}>
            {building.name}
          </div>
        </div>
      </div>

      {/* Effects chips - with labels */}
      <div className="flex flex-wrap gap-1 mb-2">
        {building.effects.filter(e => e.statId !== 'money').slice(0, 2).map((effect, i) => (
          <span
            key={i}
            className={`
              text-[10px] px-1.5 py-0.5 rounded-full font-medium
              ${effect.perDay >= 0
                ? 'bg-[var(--color-positive)]/15 text-[var(--color-positive)]'
                : 'bg-[var(--color-negative)]/15 text-[var(--color-negative)]'
              }
              ${!canAfford ? 'opacity-60' : ''}
            `}
          >
            {effect.perDay >= 0 ? '+' : ''}{effect.perDay} {STAT_LABELS[effect.statId]}
          </span>
        ))}
        {building.effects.filter(e => e.statId !== 'money').length > 2 && (
          <span className="text-[10px] px-1.5 py-0.5 text-[var(--color-text-muted)]">
            +{building.effects.filter(e => e.statId !== 'money').length - 2}
          </span>
        )}
      </div>

      {/* Price tag */}
      <div className={`
        flex items-center justify-between text-xs
        ${canAfford ? 'text-[var(--color-positive)]' : 'text-[var(--color-text-muted)]'}
      `}>
        <span className="font-semibold">{Format.money(cost)}</span>
        {canAfford && <Check size={14} />}
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
