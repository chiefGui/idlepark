import type { Effect, StatId } from './game-types'

export type AggregatedRates = Record<StatId, { base: number; multiplier: number }>

export class Effects {
  static aggregate(effects: Effect[]): AggregatedRates {
    const rates: AggregatedRates = {
      money: { base: 0, multiplier: 1 },
      guests: { base: 0, multiplier: 1 },
      entertainment: { base: 0, multiplier: 1 },
      food: { base: 0, multiplier: 1 },
      comfort: { base: 0, multiplier: 1 },
      cleanliness: { base: 0, multiplier: 1 },
      appeal: { base: 0, multiplier: 1 },
      satisfaction: { base: 0, multiplier: 1 },
    }

    for (const effect of effects) {
      rates[effect.statId].base += effect.perDay
      if (effect.multiplier) {
        rates[effect.statId].multiplier *= effect.multiplier
      }
    }

    return rates
  }

  static getFinalRate(statId: StatId, rates: AggregatedRates): number {
    const { base, multiplier } = rates[statId]
    return base * multiplier
  }

  static applyRates(
    stats: Record<StatId, number>,
    rates: AggregatedRates,
    deltaDay: number
  ): Record<StatId, number> {
    const newStats = { ...stats }

    for (const statId of Object.keys(rates) as StatId[]) {
      const rate = this.getFinalRate(statId, rates)
      newStats[statId] = stats[statId] + rate * deltaDay
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
      appeal: Math.max(0, Math.min(100, stats.appeal)),
      satisfaction: Math.max(0, Math.min(100, stats.satisfaction)),
    }
  }
}
