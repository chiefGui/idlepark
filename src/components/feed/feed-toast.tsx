import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { GameEvents } from '../../engine/events'
import { Feed } from '../../systems/feed'
import type { FeedEntry } from '../../engine/game-types'

const TOAST_DURATION = 4000

export function FeedToast() {
  const [toast, setToast] = useState<FeedEntry | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const dismiss = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => setToast(null), 300)
  }, [])

  useEffect(() => {
    const unsubscribe = GameEvents.on('feed:new', ({ entry }) => {
      setToast(entry)
      setIsVisible(true)

      const timer = setTimeout(() => {
        dismiss()
      }, TOAST_DURATION)

      return () => clearTimeout(timer)
    })

    return unsubscribe
  }, [dismiss])

  if (!toast) return null

  const avatarUrl = Feed.generateAvatarUrl(toast.avatarSeed)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] overflow-hidden">
            <div className="flex items-start gap-3 p-3">
              <img
                src={avatarUrl}
                alt={toast.handle}
                className="w-10 h-10 rounded-full bg-[var(--color-bg)] flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm truncate">
                    @{toast.handle}
                  </span>
                  <span className="text-[var(--color-text-muted)] text-xs">
                    · just now
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mt-0.5">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={dismiss}
                className="p-1 -mt-1 -mr-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
              className="h-0.5 bg-[var(--color-accent)] origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
