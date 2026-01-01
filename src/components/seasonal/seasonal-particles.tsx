import { useMemo } from 'react'
import { useGameStore } from '../../store/game-store'
import { Calendar, type Season } from '../../utils/calendar'

const PARTICLE_COUNT = 8

const SEASON_CONFIG: Record<Season, { emoji: string; className: string } | null> = {
  winter: { emoji: '❄️', className: 'animate-snowfall' },
  spring: { emoji: '🌸', className: 'animate-petalfall' },
  fall: { emoji: '🍂', className: 'animate-leaffall' },
  summer: null, // No particles in summer - already vibrant
}

export function SeasonalParticles() {
  const currentDay = useGameStore((s) => s.currentDay)
  const season = Calendar.getSeasonForDay(currentDay)
  const config = SEASON_CONFIG[season]

  const particles = useMemo(() => {
    if (!config) return null

    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      // Distribute particles across the screen width
      const left = 5 + (i * 90) / PARTICLE_COUNT + Math.random() * 8
      // Stagger animation delays for natural feel
      const delay = i * 1.5 + Math.random() * 2
      // Vary duration slightly for organic movement
      const duration = 12 + Math.random() * 8

      return (
        <span
          key={i}
          className={`seasonal-particle ${config.className}`}
          style={{
            left: `${left}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        >
          {config.emoji}
        </span>
      )
    })
  }, [config])

  if (!config) return null

  return (
    <div className="seasonal-particles" aria-hidden="true">
      {particles}
    </div>
  )
}
