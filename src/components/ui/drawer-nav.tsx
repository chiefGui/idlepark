import { motion } from 'framer-motion'
import { Trophy, Zap, BarChart3, RotateCcw } from 'lucide-react'
import { useDrawer } from './drawer'
import { useGameStore } from '../../store/game-store'

const TABS = [
  { id: 'milestones', label: 'Milestones', icon: Trophy },
  { id: 'perks', label: 'Perks', icon: Zap },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
] as const

export function DrawerNav() {
  const { activeTab, setTab, close } = useDrawer()
  const reset = useGameStore((s) => s.actions.reset)

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      reset()
      close()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 p-2">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1
                transition-colors text-left
                ${isActive
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'hover:bg-[var(--color-surface)]'}
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{tab.label}</span>
            </motion.button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[var(--color-border)]">
        <button
          onClick={handleReset}
          className="
            w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
            bg-[var(--color-negative)]/10 text-[var(--color-negative)]
            hover:bg-[var(--color-negative)]/20 transition-colors
          "
        >
          <RotateCcw size={18} />
          <span className="font-medium">Reset Game</span>
        </button>
      </div>
    </div>
  )
}
