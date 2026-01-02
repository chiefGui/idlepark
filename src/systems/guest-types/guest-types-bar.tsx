import { motion } from 'framer-motion'
import type { GuestTypeMix, GuestType } from '../../engine/game-types'
import { GUEST_TYPES, GUEST_TYPE_META } from '../../engine/game-types'

type GuestTypesBarProps = {
  mix: GuestTypeMix | undefined
}

const DEFAULT_MIX: GuestTypeMix = { thrills: 34, family: 33, relaxation: 33 }

export function GuestTypesBar({ mix }: GuestTypesBarProps) {
  const safeMix = mix ?? DEFAULT_MIX

  // Find the dominant type for label emphasis
  const dominantType = GUEST_TYPES.reduce((max, type) =>
    safeMix[type] > safeMix[max] ? type : max
  )

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-[var(--color-bg)]">
        {GUEST_TYPES.map((type, index) => (
          <motion.div
            key={type}
            className="h-full"
            style={{ backgroundColor: GUEST_TYPE_META[type].color }}
            initial={{ width: 0 }}
            animate={{ width: `${safeMix[type]}%` }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Labels - responsive grid for mobile */}
      <div className="grid grid-cols-3 gap-1 text-xs text-[var(--color-text-muted)]">
        {GUEST_TYPES.map((type) => (
          <TypeLabel
            key={type}
            type={type}
            value={safeMix[type]}
            isDominant={type === dominantType && safeMix[type] > 30}
          />
        ))}
      </div>
    </div>
  )
}

function TypeLabel({
  type,
  value,
  isDominant,
}: {
  type: GuestType
  value: number
  isDominant: boolean
}) {
  const meta = GUEST_TYPE_META[type]

  return (
    <div
      className="flex flex-col items-center"
      style={{ color: isDominant ? meta.color : undefined }}
    >
      <span className="text-sm">{meta.emoji}</span>
      <span className="font-medium">{value}%</span>
    </div>
  )
}
