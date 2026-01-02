import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

type InfoModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  emoji?: string
  children: ReactNode
}

export function InfoModal({ isOpen, onClose, title, emoji, children }: InfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto max-h-[85vh] flex flex-col"
          >
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-full">
              <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)] flex-shrink-0">
                {emoji && <span className="text-2xl">{emoji}</span>}
                <span className="flex-1 font-semibold">{title}</span>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 active:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
