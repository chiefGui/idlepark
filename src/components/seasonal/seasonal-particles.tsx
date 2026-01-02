import { useMemo } from 'react'
import { useGameStore } from '../../store/game-store'
import { Calendar } from '../../utils/calendar'
import type { Season } from '../../engine/game-types'
import { useGyroscope } from '../../hooks/use-gyroscope'

const PARTICLE_COUNT = 8

// Pre-computed stable pseudo-random values for particles (seeded by index)
const PARTICLE_DATA = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  left: 5 + (i * 90) / PARTICLE_COUNT + (((i * 7919) % 100) / 100) * 8,
  delay: i * 1.5 + (((i * 104729) % 100) / 100) * 2,
  duration: 12 + (((i * 15485863) % 100) / 100) * 8,
}))

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

    return PARTICLE_DATA.map((data, i) => (
      <span
        key={i}
        className={`seasonal-particle ${config.className}`}
        style={{
          left: `${data.left}%`,
          animationDelay: `${data.delay}s`,
          animationDuration: `${data.duration}s`,
        }}
      >
        {config.emoji}
      </span>
    ))
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
