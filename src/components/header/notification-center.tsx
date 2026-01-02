import * as Ariakit from '@ariakit/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronRight, Star, AlertTriangle } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Notifications, type Notification, type NotificationAction } from '../../systems/notifications'
import { useDrawerNavigation } from '../ui/drawer-hooks'
import type { DrawerScreen } from '../ui/drawer-context'

const ACTION_TO_SCREEN: Record<NotificationAction, DrawerScreen> = {
  perks: 'perks',
  feed: 'feed',
}

export function NotificationCenter() {
  const popover = Ariakit.usePopoverStore({ placement: 'bottom-start' })
  const isOpen = popover.useState('open')
  const state = useGameStore()
  const navigateTo = useDrawerNavigation()

  const notifications = Notifications.getActive(state)
  const count = notifications.length
  const hasWarnings = notifications.some((n) => n.severity === 'warning')

  const handleAction = (notification: Notification) => {
    if (notification.action) {
      const screen = ACTION_TO_SCREEN[notification.action]
      navigateTo(screen)
      popover.hide()
    }
  }

  return (
    <Ariakit.PopoverProvider store={popover}>
      <Ariakit.PopoverDisclosure
        render={
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="relative p-2 hover:bg-[var(--color-surface-hover)] rounded-xl transition-colors"
          />
        }
      >
        <Bell size={20} className={count > 0 ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'} />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
            style={{ backgroundColor: hasWarnings ? 'var(--color-warning)' : 'var(--color-accent)' }}
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        )}
      </Ariakit.PopoverDisclosure>

      <AnimatePresence>
        {isOpen && (
          <Ariakit.Popover
            portal
            gutter={8}
            unmountOnHide
            render={
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="w-72 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xl overflow-hidden z-50 outline-none"
              />
            }
          >
            <div className="px-3 py-2 border-b border-[var(--color-border)]">
              <Ariakit.PopoverHeading className="text-sm font-semibold">
                Notifications
              </Ariakit.PopoverHeading>
            </div>

            <div className="max-h-80 overflow-auto">
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onAction={() => handleAction(notification)}
                  />
                ))
              )}
            </div>
          </Ariakit.Popover>
        )}
      </AnimatePresence>
    </Ariakit.PopoverProvider>
  )
}

function NotificationItem({
  notification,
  onAction,
}: {
  notification: Notification
  onAction: () => void
}) {
  const isWarning = notification.severity === 'warning'
  const color = isWarning ? 'var(--color-warning)' : 'var(--color-accent)'

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onAction}
      className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-[var(--color-surface-hover)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}
      >
        {isWarning ? (
          <AlertTriangle size={12} style={{ color }} />
        ) : (
          <Star size={12} style={{ color }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{notification.message}</p>
        {notification.actionLabel && (
          <span className="text-xs font-medium" style={{ color }}>
            {notification.actionLabel}
          </span>
        )}
      </div>
      {notification.action && (
        <ChevronRight size={16} className="text-[var(--color-text-muted)] flex-shrink-0" />
      )}
    </motion.button>
  )
}
