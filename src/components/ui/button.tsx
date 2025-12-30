import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

type ButtonProps = {
  variant?: ButtonVariant
  children: ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white',
  secondary: 'bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-[var(--color-text)]',
  danger: 'bg-[var(--color-negative)]/20 hover:bg-[var(--color-negative)]/30 text-[var(--color-negative)]',
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}
