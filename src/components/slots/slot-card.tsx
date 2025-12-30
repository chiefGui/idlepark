import { motion } from 'framer-motion'
import { Lock, Plus, Unlock } from 'lucide-react'
import type { SlotState } from '../../engine/game-types'
import { GameTypes } from '../../engine/game-types'
import { Building } from '../../systems/building'
import { Perk } from '../../systems/perk'
import { Slot } from '../../systems/slot'
import { useGameStore } from '../../store/game-store'

type SlotCardProps = {
  slot: SlotState
  onBuild: () => void
  onSelect: () => void
}

export function SlotCard({ slot, onBuild, onSelect }: SlotCardProps) {
  const state = useGameStore()
  const unlockSlot = useGameStore((s) => s.actions.unlockSlot)
  const building = slot.buildingId ? Building.getById(slot.buildingId) : null

  if (slot.locked) {
    const canUnlock = Slot.canUnlock(slot.index, state)
    const unlockCost = GameTypes.SLOT_UNLOCK_COSTS[slot.index] ?? 0
    const canAfford = state.stats.money >= unlockCost

    if (canUnlock) {
      return (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => unlockSlot(slot.index)}
          disabled={!canAfford}
          className={`
            aspect-square rounded-xl border-2 border-dashed
            flex flex-col items-center justify-center gap-1 p-2
            transition-colors cursor-pointer
            ${
              canAfford
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 active:bg-[var(--color-accent)]/20'
                : 'border-[var(--color-border)] bg-[var(--color-surface)]/50 opacity-60'
            }
          `}
        >
          <Unlock size={20} className={canAfford ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'} />
          <span className="text-[10px] text-[var(--color-text-muted)] text-center leading-tight">
            ${unlockCost}
          </span>
        </motion.button>
      )
    }

    const ownedExpansions = state.ownedPerks.filter((p) => p.startsWith('extra_slot')).length
    const nextExpansion = Perk.getById(`extra_slot_${ownedExpansions + 1}`)
    const unlockHint = nextExpansion
      ? `Buy "${nextExpansion.name}" perk`
      : 'No more expansions'

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="
          aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)]
          flex flex-col items-center justify-center gap-1 p-2
          bg-[var(--color-surface)]/50 opacity-60
        "
      >
        <Lock size={20} className="text-[var(--color-text-muted)]" />
        <span className="text-[10px] text-[var(--color-text-muted)] text-center leading-tight">
          {unlockHint}
        </span>
      </motion.div>
    )
  }

  if (!building) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBuild}
        className="
          aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)]
          flex flex-col items-center justify-center gap-2
          bg-[var(--color-surface)] active:bg-[var(--color-surface-hover)]
          transition-colors cursor-pointer
        "
      >
        <Plus size={24} className="text-[var(--color-accent)]" />
        <span className="text-xs text-[var(--color-text-muted)]">Build</span>
      </motion.button>
    )
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className="
        aspect-square rounded-xl border border-[var(--color-border)]
        flex flex-col items-center justify-center gap-1
        bg-[var(--color-surface)] active:bg-[var(--color-surface-hover)]
        transition-colors cursor-pointer
      "
    >
      <span className="text-3xl">{building.emoji}</span>
      <span className="text-xs font-medium text-center px-2 leading-tight">{building.name}</span>
    </motion.button>
  )
}
