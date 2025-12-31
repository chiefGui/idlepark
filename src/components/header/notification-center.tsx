import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronRight } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Notifications, type Notification, type NotificationAction } from '../../systems/notifications'
import { useDrawerNavigation, type DrawerScreen } from '../ui/drawer'

const ACTION_TO_SCREEN: Record<NotificationAction, DrawerScreen> = {
  perks: 'perks',
  guests: 'guests',
  cleanliness: 'cleanliness',
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const state = useGameStore()
  const navigateTo = useDrawerNavigation()

  const notifications = Notifications.getActive(state)
  const count = notifications.length

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleAction = (notification: Notification) => {
    if (notification.action) {
      const screen = ACTION_TO_SCREEN[notification.action]
      navigateTo(screen)
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[var(--color-surface-hover)] rounded-xl transition-colors"
      >
        <Bell size={20} className={count > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-muted)]'} />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-warning)] text-white text-[10px] font-bold flex items-center justify-center"
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-72 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xl overflow-hidden z-50"
          >
            <div className="px-3 py-2 border-b border-[var(--color-border)]">
              <span className="text-sm font-semibold">Notifications</span>
            </div>

            <div className="max-h-80 overflow-auto">
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.button
                    key={notification.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction(notification)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-[var(--color-surface-hover)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-[var(--color-warning)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{notification.message}</p>
                      {notification.actionLabel && (
                        <span className="text-xs text-[var(--color-accent)] font-medium">
                          {notification.actionLabel}
                        </span>
                      )}
                    </div>
                    {notification.action && (
                      <ChevronRight size={16} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
