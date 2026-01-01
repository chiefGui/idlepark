import { useState, createContext, useContext, useEffect, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, Zap, BarChart3, RotateCcw, Building2, BookOpen, MessageCircle, Sparkles } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { PerksContent } from '../perks/perks-content'
import { AnalyticsContent } from '../analytics/analytics-content'
import { ParkSettingsContent } from '../park/park-settings-content'
import { TimelineContent } from '../timeline/timeline-content'
import { FeedContent } from '../feed/feed-content'
import { ServicesContent, FastPassContent, MarketingContent, BankContent } from '../services/services-content'
import { StatDetail } from '../stats/stat-detail'
import { Drawer, type DrawerStore } from './primitives'

export type DrawerScreen = 'menu' | 'milestones' | 'perks' | 'analytics' | 'park' | 'timeline' | 'feed' | 'services' | 'service_bank' | 'service_fast_pass' | 'service_marketing' | 'guests' | 'cleanliness'

type DrawerContextValue = {
  store: DrawerStore
  screen: DrawerScreen
  setScreen: (screen: DrawerScreen) => void
  navigateTo: (screen: DrawerScreen) => void
}

const DrawerContext = createContext<DrawerContextValue | null>(null)

export function useDrawer() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('useDrawer must be used within DrawerProvider')
  return ctx.store
}

export function useDrawerNavigation() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('useDrawerNavigation must be used within DrawerProvider')
  return ctx.navigateTo
}

type DrawerProviderProps = {
  children: ReactNode
}

export function DrawerProvider({ children }: DrawerProviderProps) {
  const store = Drawer.useStore()
  const [screen, setScreen] = useState<DrawerScreen>('menu')

  const navigateTo = useCallback((targetScreen: DrawerScreen) => {
    setScreen(targetScreen)
    store.show()
  }, [store])

  // Reset to menu when drawer closes
  const open = store.useState('open')
  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => setScreen('menu'), 300)
      return () => clearTimeout(timeout)
    }
  }, [open])

  return (
    <DrawerContext.Provider value={{ store, screen, setScreen, navigateTo }}>
      <Drawer.Root store={store}>
        {children}
        <MenuDrawer />
      </Drawer.Root>
    </DrawerContext.Provider>
  )
}

type MenuItem = {
  id: DrawerScreen
  label: string
  icon: typeof Building2
  description: string
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'park', label: 'HQ', icon: Building2, description: 'Manage your park' },
  { id: 'perks', label: 'Perks', icon: Zap, description: 'Upgrade your park' },
  { id: 'services', label: 'Services', icon: Sparkles, description: 'Premium guest services' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'View park statistics' },
  { id: 'timeline', label: 'Timeline', icon: BookOpen, description: "Your park's story" },
  { id: 'feed', label: 'Feed', icon: MessageCircle, description: 'Guest chatter' },
]

// Screen titles for non-menu screens
const SCREEN_TITLES: Record<DrawerScreen, string> = {
  menu: 'Menu',
  park: 'HQ',
  perks: 'Perks',
  analytics: 'Analytics',
  milestones: 'Milestones',
  timeline: 'Timeline',
  feed: 'Feed',
  services: 'Services',
  service_bank: 'Bank',
  service_fast_pass: 'Fast Pass',
  service_marketing: 'Marketing',
  guests: 'Guests',
  cleanliness: 'Clean',
}

function MenuDrawer() {
  const ctx = useContext(DrawerContext)!
  const { store, screen, setScreen } = ctx
  const state = useGameStore((s) => s)
  const reset = state.actions.reset
  const unreadFeedCount = state.unreadFeedCount

  // Handle back navigation - services sub-screens go back to services
  const handleBack = () => {
    if (screen.startsWith('service_')) {
      setScreen('services')
    } else {
      setScreen('menu')
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      reset()
      store.hide()
    }
  }

  const currentMenuItem = MENU_ITEMS.find((item) => item.id === screen)
  const title = currentMenuItem?.label ?? SCREEN_TITLES[screen] ?? 'Menu'

  return (
    <Drawer.Content
      side="left"
      className="w-[85vw] max-w-sm bg-[var(--color-bg)] flex flex-col shadow-2xl"
    >
      <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)]">
        {screen !== 'menu' ? (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 active:bg-[var(--color-surface)] rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        ) : null}
        <Drawer.Title className="flex-1 text-lg font-semibold">
          {title}
        </Drawer.Title>
        <Drawer.Close className="p-2 -mr-2 active:bg-[var(--color-surface)] rounded-lg transition-colors">
          <X size={20} />
        </Drawer.Close>
      </div>

      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {screen === 'menu' ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-2"
            >
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon
                const showBadge = item.id === 'feed' && unreadFeedCount > 0
                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setScreen(item.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface)] active:bg-[var(--color-surface-hover)] transition-colors text-left"
                  >
                    <div className="relative w-10 h-10 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center">
                      <Icon size={20} className="text-[var(--color-accent)]" />
                      {showBadge && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold flex items-center justify-center">
                          {unreadFeedCount > 9 ? '9+' : unreadFeedCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-[var(--color-text-muted)]">{item.description}</div>
                    </div>
                    <ChevronLeft size={20} className="rotate-180 text-[var(--color-text-muted)]" />
                  </motion.button>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              key={screen}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4"
            >
              {screen === 'feed' && <FeedContent />}
              {screen === 'park' && <ParkSettingsContent />}
              {screen === 'timeline' && <TimelineContent />}
              {screen === 'perks' && <PerksContent />}
              {screen === 'analytics' && <AnalyticsContent />}
              {screen === 'services' && <ServicesContent onNavigate={setScreen} />}
              {screen === 'service_bank' && <BankContent />}
              {screen === 'service_fast_pass' && <FastPassContent />}
              {screen === 'service_marketing' && <MarketingContent />}
              {screen === 'guests' && <StatDetail statId="guests" />}
              {screen === 'cleanliness' && <StatDetail statId="cleanliness" />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {screen === 'menu' && (
        <div className="p-4 border-t border-[var(--color-border)]">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-negative)]/10 text-[var(--color-negative)] active:bg-[var(--color-negative)]/20 transition-colors"
          >
            <RotateCcw size={18} />
            <span className="font-medium">Reset Game</span>
          </button>
        </div>
      )}
    </Drawer.Content>
  )
}
