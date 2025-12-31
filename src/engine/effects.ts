import type { StatId } from './game-types'
import type { ComputedRates } from './modifiers'

export class Effects {
  static applyRates(
    stats: Record<StatId, number>,
    rates: ComputedRates,
    deltaDay: number
  ): Record<StatId, number> {
    const newStats = { ...stats }

    for (const statId of Object.keys(rates) as StatId[]) {
      newStats[statId] = stats[statId] + rates[statId] * deltaDay
    }

    return newStats
  }

  static clampStats(stats: Record<StatId, number>): Record<StatId, number> {
    return {
      ...stats,
      guests: Math.max(0, Math.floor(stats.guests)),
      entertainment: Math.max(0, stats.entertainment),
      food: Math.max(0, stats.food),
      comfort: Math.max(0, stats.comfort),
      cleanliness: Math.max(0, Math.min(100, stats.cleanliness)),
      beauty: Math.max(0, Math.min(100, stats.beauty)),
      appeal: Math.max(0, Math.min(100, stats.appeal)),
    }
  }
}
