import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type PanelProps = {
  title?: string
  children: ReactNode
  className?: string
}

export function Panel({ title, children, className = '' }: PanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 ${className}`}
    >
      {title && (
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          {title}
        </h2>
      )}
      {children}
    </motion.div>
  )
}
