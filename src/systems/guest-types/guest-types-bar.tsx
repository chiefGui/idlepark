import { motion } from 'framer-motion'
import type { GuestTypeMix } from '../../engine/game-types'
import { GUEST_TYPES, GUEST_TYPE_META } from '../../engine/game-types'

type GuestTypesBarProps = {
  mix: GuestTypeMix
}

export function GuestTypesBar({ mix }: GuestTypesBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden bg-[var(--color-bg)]">
        {GUEST_TYPES.map((type, index) => (
          <motion.div
            key={type}
            style={{
              width: `${mix[type]}%`,
              backgroundColor: GUEST_TYPE_META[type].color,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${mix[type]}%` }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
        {GUEST_TYPES.map((type) => (
          <span key={type} className="flex items-center gap-1">
            <span>{GUEST_TYPE_META[type].emoji}</span>
            <span>{mix[type]}%</span>
          </span>
        ))}
      </div>
    </div>
  )
}
