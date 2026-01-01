import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { GameEvents } from '../../engine/events'
import { Feed } from '../../systems/feed'
import type { FeedEntry } from '../../engine/game-types'

const TOAST_DURATION = 4000
const MAX_VISIBLE_TOASTS = 2

type ToastItem = {
  entry: FeedEntry
  id: string
  expiresAt: number
}

export function FeedToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    // Clear the timer for this toast
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    const unsubscribe = GameEvents.on('feed:new', ({ entry }) => {
      const id = entry.id
      const expiresAt = Date.now() + TOAST_DURATION

      setToasts(prev => {
        // Add new toast at the beginning
        const newToasts = [{ entry, id, expiresAt }, ...prev]

        // If we exceed max, remove the oldest ones
        if (newToasts.length > MAX_VISIBLE_TOASTS) {
          const removed = newToasts.slice(MAX_VISIBLE_TOASTS)
          // Clean up timers for removed toasts
          removed.forEach(t => {
            const timer = timersRef.current.get(t.id)
            if (timer) {
              clearTimeout(timer)
              timersRef.current.delete(t.id)
            }
          })
          return newToasts.slice(0, MAX_VISIBLE_TOASTS)
        }
        return newToasts
      })

      // Set auto-dismiss timer
      const timer = setTimeout(() => {
        dismiss(id)
      }, TOAST_DURATION)
      timersRef.current.set(id, timer)
    })

    return () => {
      unsubscribe()
      // Clean up all timers on unmount
      timersRef.current.forEach(timer => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [dismiss])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => {
          const avatarUrl = Feed.generateAvatarUrl(toast.entry.avatarSeed)
          const timeRemaining = Math.max(0, toast.expiresAt - Date.now())

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{
                opacity: index === 0 ? 1 : 0.85,
                y: 0,
                scale: index === 0 ? 1 : 0.95
              }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="pointer-events-auto"
            >
              <div className="bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] overflow-hidden">
                <div className="flex items-start gap-3 p-3">
                  <img
                    src={avatarUrl}
                    alt={toast.entry.handle}
                    className="w-10 h-10 rounded-full bg-[var(--color-bg)] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm truncate">
                        @{toast.entry.handle}
                      </span>
                      <span className="text-[var(--color-text-muted)] text-xs">
                        · just now
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mt-0.5">
                      {toast.entry.message}
                    </p>
                  </div>
                  <button
                    onClick={() => dismiss(toast.id)}
                    className="p-1 -mt-1 -mr-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                {/* Progress bar */}
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: timeRemaining / 1000, ease: 'linear' }}
                  className="h-0.5 bg-[var(--color-accent)] origin-left"
                />
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
