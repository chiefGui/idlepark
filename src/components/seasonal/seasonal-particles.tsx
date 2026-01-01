import { useMemo } from 'react'
import { useGameStore } from '../../store/game-store'
import { Calendar, type Season } from '../../utils/calendar'
import { useGyroscope } from '../../hooks/use-gyroscope'

const PARTICLE_COUNT = 8

const SEASON_CONFIG: Record<Season, { emoji: string; className: string } | null> = {
  winter: { emoji: '❄️', className: 'animate-snowfall' },
  spring: { emoji: '🌸', className: 'animate-petalfall' },
  fall: { emoji: '🍂', className: 'animate-leaffall' },
  summer: null, // No particles in summer
}

export function SeasonalParticles() {
  const currentDay = useGameStore((s) => s.currentDay)
  const season = Calendar.getSeasonForDay(currentDay)
  const config = SEASON_CONFIG[season]
  const gyro = useGyroscope()

  const particles = useMemo(() => {
    if (!config) return null

    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const left = 5 + (i * 90) / PARTICLE_COUNT + Math.random() * 8
      const delay = i * 1.5 + Math.random() * 2
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

  return (
    <>
      {/* Seasonal background gradient */}
      <div className={`seasonal-bg seasonal-bg-${season}`} aria-hidden="true" />

      {/* Particles with gyroscope parallax */}
      {config && (
        <div
          className="seasonal-particles"
          aria-hidden="true"
          style={{
            transform: `translate3d(${gyro.x}px, ${gyro.y}px, 0)`,
          }}
        >
          {particles}
        </div>
      )}
    </>
  )
}
