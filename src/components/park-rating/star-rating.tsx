import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

type StarRatingProps = {
  stars: number  // 1-5, can be fractional
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
}

export function StarRating({ stars, size = 'md', showLabel = false, label }: StarRatingProps) {
  const sizeMap = {
    sm: 14,
    md: 18,
    lg: 24,
  }
  const iconSize = sizeMap[size]

  // Generate 5 stars with appropriate fill
  const starElements = Array.from({ length: 5 }, (_, i) => {
    const fillPercentage = Math.max(0, Math.min(1, stars - i))

    return (
      <motion.div
        key={i}
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
      >
        {/* Background star (empty) */}
        <Star
          size={iconSize}
          className="text-[var(--color-border)]"
          strokeWidth={1.5}
        />
        {/* Foreground star (filled) - with clip for partial fill */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${fillPercentage * 100}%` }}
        >
          <Star
            size={iconSize}
            className="text-amber-400 fill-amber-400"
            strokeWidth={1.5}
          />
        </div>
      </motion.div>
    )
  })

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {starElements}
      </div>
      {showLabel && (
        <span className={`ml-1.5 font-medium ${size === 'lg' ? 'text-lg' : size === 'md' ? 'text-sm' : 'text-xs'}`}>
          {label || stars.toFixed(1)}
        </span>
      )}
    </div>
  )
}
