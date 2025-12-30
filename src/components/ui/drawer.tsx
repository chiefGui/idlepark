import { useState, createContext, useContext, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

type DrawerContextType = {
  isOpen: boolean
  activeTab: string
  open: (tab?: string) => void
  close: () => void
  setTab: (tab: string) => void
}

const DrawerContext = createContext<DrawerContextType | null>(null)

export function useDrawer() {
  const context = useContext(DrawerContext)
  if (!context) throw new Error('useDrawer must be used within DrawerProvider')
  return context
}

type DrawerProviderProps = {
  children: ReactNode
}

export function DrawerProvider({ children }: DrawerProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('milestones')

  const open = (tab?: string) => {
    if (tab) setActiveTab(tab)
    setIsOpen(true)
  }

  const close = () => setIsOpen(false)
  const setTab = (tab: string) => setActiveTab(tab)

  return (
    <DrawerContext.Provider value={{ isOpen, activeTab, open, close, setTab }}>
      {children}
    </DrawerContext.Provider>
  )
}

type DrawerProps = {
  children: ReactNode
}

export function Drawer({ children }: DrawerProps) {
  const { isOpen, close } = useDrawer()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 z-40"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-[var(--color-bg)] z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <span className="text-lg font-semibold">Menu</span>
              <button
                onClick={close}
                className="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
