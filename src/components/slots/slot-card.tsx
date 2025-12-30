import { motion } from 'framer-motion'
import { Lock, Plus, Trash2 } from 'lucide-react'
import type { SlotState } from '../../engine/game-types'
import { Building } from '../../systems/building'

type SlotCardProps = {
  slot: SlotState
  onBuild: () => void
  onDemolish: () => void
}

export function SlotCard({ slot, onBuild, onDemolish }: SlotCardProps) {
  const building = slot.buildingId ? Building.getById(slot.buildingId) : null

  if (slot.locked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="
          aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)]
          flex flex-col items-center justify-center gap-2
          bg-[var(--color-surface)]/50 opacity-50
        "
      >
        <Lock size={24} className="text-[var(--color-text-muted)]" />
        <span className="text-xs text-[var(--color-text-muted)]">Locked</span>
      </motion.div>
    )
  }

  if (!building) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02, borderColor: 'var(--color-accent)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onBuild}
        className="
          aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)]
          flex flex-col items-center justify-center gap-2
          bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]
          transition-colors cursor-pointer
        "
      >
        <Plus size={24} className="text-[var(--color-text-muted)]" />
        <span className="text-xs text-[var(--color-text-muted)]">Build</span>
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="
        aspect-square rounded-xl border border-[var(--color-border)]
        flex flex-col items-center justify-center gap-1
        bg-[var(--color-surface)] relative group
      "
    >
      <span className="text-3xl">{building.emoji}</span>
      <span className="text-xs font-medium text-center px-2">{building.name}</span>

      <motion.button
        initial={{ opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        onClick={onDemolish}
        className="
          absolute top-2 right-2 p-1.5 rounded-lg
          bg-[var(--color-negative)]/20 text-[var(--color-negative)]
          opacity-0 group-hover:opacity-100 transition-opacity
        "
      >
        <Trash2 size={14} />
      </motion.button>
    </motion.div>
  )
}
