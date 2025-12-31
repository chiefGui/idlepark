import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameEvents, type MoneyPopupReason } from '../../engine/events'
import { Format } from '../../utils/format'

type PopupItem = {
  id: number
  amount: number
  reason: MoneyPopupReason
}

let popupId = 0

export function MoneyPopup() {
  const [popups, setPopups] = useState<PopupItem[]>([])

  const removePopup = useCallback((id: number) => {
    setPopups((prev) => prev.filter((p) => p.id !== id))
  }, [])

  useEffect(() => {
    const unsubscribe = GameEvents.on('money:changed', ({ amount, reason }) => {
      const id = ++popupId
      setPopups((prev) => [...prev, { id, amount, reason }])

      // Auto-remove after animation completes
      setTimeout(() => removePopup(id), 1500)
    })

    return unsubscribe
  }, [removePopup])

  return (
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none z-10">
      <AnimatePresence>
        {popups.map((popup, index) => {
          const isPositive = popup.amount > 0
          const displayAmount = isPositive
            ? `+${Format.money(popup.amount)}`
            : Format.money(popup.amount)

          return (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [10, -20 - index * 24, -30 - index * 24, -40 - index * 24],
                scale: [0.8, 1.1, 1, 0.9],
              }}
              transition={{
                duration: 1.4,
                times: [0, 0.15, 0.7, 1],
                ease: 'easeOut',
              }}
              className={`absolute whitespace-nowrap font-bold text-lg ${
                isPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
              }`}
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              {displayAmount}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
