import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { GameEvents } from '../../engine/events'
import { Happening } from '../../systems/happening'

const TOAST_DURATION = 6000

export function HappeningToast() {
  const [happening, setHappening] = useState<ReturnType<typeof Happening.getById> | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const dismiss = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => setHappening(null), 300)
  }, [])

  useEffect(() => {
    const unsubscribe = GameEvents.on('happening:started', ({ happeningId }) => {
      const def = Happening.getById(happeningId)
      if (def) {
        setHappening(def)
        setIsVisible(true)

        const timer = setTimeout(() => {
          dismiss()
        }, TOAST_DURATION)

        return () => clearTimeout(timer)
      }
    })

    return unsubscribe
  }, [dismiss])

  if (!happening) return null

  const isPositive = happening.type === 'positive'
  const bgColor = isPositive ? 'var(--color-positive)' : 'var(--color-negative)'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div
            className="rounded-xl shadow-xl border overflow-hidden"
            style={{
              backgroundColor: `color-mix(in srgb, ${bgColor} 10%, var(--color-surface))`,
              borderColor: `color-mix(in srgb, ${bgColor} 30%, var(--color-border))`,
            }}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${bgColor} 20%, transparent)` }}
                >
                  {happening.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: bgColor }}
                    >
                      {isPositive ? 'Good News!' : 'Happening'}
                    </span>
                    <button
                      onClick={dismiss}
                      className="p-1 -mt-1 -mr-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <h3 className="font-bold text-lg mt-0.5">{happening.name}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {happening.description}
                  </p>
                  <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                    Lasts 5 days
                  </div>
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
              className="h-1 origin-left"
              style={{ backgroundColor: bgColor }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
