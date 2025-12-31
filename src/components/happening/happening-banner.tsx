import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Happening } from '../../systems/happening'

function formatModifierEffect(happening: ReturnType<typeof Happening.getById>): string {
  if (!happening) return ''

  const effects: string[] = []
  for (const mod of happening.modifiers) {
    if (mod.flat) {
      const sign = mod.flat > 0 ? '+' : ''
      effects.push(`${sign}${mod.flat} ${mod.stat}`)
    }
    if (mod.increased) {
      const sign = mod.increased > 0 ? '+' : ''
      effects.push(`${sign}${mod.increased}% ${mod.stat}`)
    }
    if (mod.more) {
      const percent = Math.round((mod.more - 1) * 100)
      const sign = percent > 0 ? '+' : ''
      effects.push(`${sign}${percent}% ${mod.stat}`)
    }
  }
  return effects.join(', ')
}

export function HappeningBanner() {
  const currentHappening = useGameStore((s) => s.currentHappening)
  const currentDay = useGameStore((s) => s.currentDay)
  const [isExpanded, setIsExpanded] = useState(false)

  if (!currentHappening) return null

  const happening = Happening.getById(currentHappening.happeningId)
  if (!happening) return null

  const remainingDays = Math.max(0, Math.ceil(currentHappening.endDay - currentDay))
  const isPositive = happening.type === 'positive'
  const bgColor = isPositive ? 'var(--color-positive)' : 'var(--color-negative)'
  const effect = formatModifierEffect(happening)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mx-4 mt-2"
      >
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          whileTap={{ scale: 0.99 }}
          className="w-full rounded-xl overflow-hidden text-left"
          style={{ backgroundColor: `color-mix(in srgb, ${bgColor} 15%, var(--color-surface))` }}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{happening.emoji}</span>
                <span className="font-semibold" style={{ color: bgColor }}>
                  {happening.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-muted)]">
                  {remainingDays} {remainingDays === 1 ? 'day' : 'days'} left
                </span>
                {isExpanded ? (
                  <ChevronUp size={16} className="text-[var(--color-text-muted)]" />
                ) : (
                  <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
                )}
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 mt-2 border-t border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-text-muted)] mb-2">
                      {happening.description}
                    </p>
                    <div
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${bgColor} 20%, transparent)`,
                        color: bgColor,
                      }}
                    >
                      Effect: {effect}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress bar showing time remaining */}
          <div className="h-1 bg-[var(--color-border)]">
            <motion.div
              className="h-full"
              style={{
                backgroundColor: bgColor,
                width: `${(remainingDays / 5) * 100}%`,
              }}
              initial={false}
              animate={{ width: `${(remainingDays / 5) * 100}%` }}
            />
          </div>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}
