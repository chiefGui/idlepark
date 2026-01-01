import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameEvents } from '../../engine/events'
import { Feed } from '../../systems/feed'
import type { FeedEntry } from '../../engine/game-types'

const TOAST_DURATION = 3500
const MAX_VISIBLE_TOASTS = 3

type ToastItem = {
  entry: FeedEntry
  id: string
  expiresAt: number
}

export function FeedToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    const unsubscribe = GameEvents.on('feed:new', ({ entry }) => {
      const id = entry.id
      const expiresAt = Date.now() + TOAST_DURATION

      setToasts((prev) => {
        const newToasts = [{ entry, id, expiresAt }, ...prev]
        if (newToasts.length > MAX_VISIBLE_TOASTS) {
          const removed = newToasts.slice(MAX_VISIBLE_TOASTS)
          removed.forEach((t) => {
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

      const timer = setTimeout(() => {
        dismiss(id)
      }, TOAST_DURATION)
      timersRef.current.set(id, timer)
    })

    return () => {
      unsubscribe()
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [dismiss])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 flex flex-col gap-1.5 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => {
          const avatarUrl = Feed.generateAvatarUrl(toast.entry.avatarSeed)

          return (
            <motion.button
              key={toast.id}
              layout
              initial={{ opacity: 0, x: -100, scale: 0.8 }}
              animate={{
                opacity: 1 - index * 0.15,
                x: 0,
                scale: 1 - index * 0.03,
              }}
              exit={{ opacity: 0, x: -100, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => dismiss(toast.id)}
              className="pointer-events-auto flex items-center gap-2 pl-1.5 pr-3 py-1.5 bg-[var(--color-surface)]/95 backdrop-blur-sm rounded-full shadow-lg border border-[var(--color-border)] text-left max-w-[90%] self-start"
            >
              <img
                src={avatarUrl}
                alt=""
                className="w-6 h-6 rounded-full bg-[var(--color-bg)] flex-shrink-0"
              />
              <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
                @{toast.entry.handle}
              </span>
              <span className="text-sm text-[var(--color-text)] truncate">
                {toast.entry.message}
              </span>
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
