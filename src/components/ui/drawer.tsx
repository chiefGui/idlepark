import { useState, createContext, useContext, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, Trophy, Zap, BarChart3, RotateCcw, Settings, BookOpen } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { MilestonesContent } from '../milestones/milestones-content'
import { PerksContent } from '../perks/perks-content'
import { AnalyticsContent } from '../analytics/analytics-content'
import { ParkSettingsContent } from '../park/park-settings-content'
import { TimelineContent } from '../timeline/timeline-content'
import { Drawer, type DrawerStore } from './primitives'

type DrawerScreen = 'menu' | 'milestones' | 'perks' | 'analytics' | 'park' | 'timeline'

const DrawerStoreContext = createContext<DrawerStore | null>(null)

export function useDrawer() {
  const store = useContext(DrawerStoreContext)
  if (!store) throw new Error('useDrawer must be used within DrawerProvider')
  return store
}

type DrawerProviderProps = {
  children: ReactNode
}

export function DrawerProvider({ children }: DrawerProviderProps) {
  const store = Drawer.useStore()

  return (
    <DrawerStoreContext.Provider value={store}>
      <Drawer.Root store={store}>
        {children}
        <MenuDrawer />
      </Drawer.Root>
    </DrawerStoreContext.Provider>
  )
}

const MENU_ITEMS = [
  { id: 'park' as const, label: 'Park Settings', icon: Settings, description: 'Manage ticket prices' },
  { id: 'timeline' as const, label: 'Timeline', icon: BookOpen, description: "Your park's story" },
  { id: 'milestones' as const, label: 'Milestones', icon: Trophy, description: 'Track your achievements' },
  { id: 'perks' as const, label: 'Perks', icon: Zap, description: 'Upgrade your park' },
  { id: 'analytics' as const, label: 'Analytics', icon: BarChart3, description: 'View park statistics' },
]

function MenuDrawer() {
  const store = useDrawer()
  const [screen, setScreen] = useState<DrawerScreen>('menu')
  const reset = useGameStore((s) => s.actions.reset)
  const open = store.useState('open')

  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => setScreen('menu'), 300)
      return () => clearTimeout(timeout)
    }
  }, [open])

  const handleBack = () => setScreen('menu')

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      reset()
      store.hide()
    }
  }

  const currentMenuItem = MENU_ITEMS.find((item) => item.id === screen)

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
          {screen === 'menu' ? 'Menu' : currentMenuItem?.label}
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
                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setScreen(item.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface)] active:bg-[var(--color-surface-hover)] transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center">
                      <Icon size={20} className="text-[var(--color-accent)]" />
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
              {screen === 'park' && <ParkSettingsContent />}
              {screen === 'timeline' && <TimelineContent />}
              {screen === 'milestones' && <MilestonesContent />}
              {screen === 'perks' && <PerksContent />}
              {screen === 'analytics' && <AnalyticsContent />}
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
