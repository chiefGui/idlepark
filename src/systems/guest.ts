import type { StatId, GameState, Effect } from '../engine/game-types'

export type GuestDemand = {
  statId: StatId
  perGuest: number
}

export class Guest {
  static readonly BASE_ARRIVAL_RATE = 5
  static readonly MONEY_PER_GUEST = 2
  static readonly APPEAL_BASELINE = 50

  static readonly DEMANDS: GuestDemand[] = [
    { statId: 'entertainment', perGuest: 0.5 },
    { statId: 'food', perGuest: 0.3 },
    { statId: 'comfort', perGuest: 0.2 },
  ]

  static calculateArrivalRate(state: GameState): number {
    const appealFactor = state.stats.appeal / this.APPEAL_BASELINE
    return this.BASE_ARRIVAL_RATE * appealFactor
  }

  static calculateIncome(guestCount: number): number {
    return guestCount * this.MONEY_PER_GUEST
  }

  static calculateSatisfaction(state: GameState): number {
    let satisfaction = 100

    for (const demand of this.DEMANDS) {
      const supply = state.stats[demand.statId]
      const required = state.stats.guests * demand.perGuest

      if (required > 0) {
        const ratio = Math.min(1, supply / required)
        satisfaction *= ratio
      }
    }

    const cleanlinessBonus = (state.stats.cleanliness - 50) / 50
    satisfaction += cleanlinessBonus * 10

    return Math.max(0, Math.min(100, satisfaction))
  }

  static calculateAppeal(state: GameState): number {
    const satisfactionFactor = state.stats.satisfaction / 100
    const entertainmentBonus = Math.min(20, state.stats.entertainment / 10)
    const cleanlinessBonus = (state.stats.cleanliness - 50) / 5

    return Math.max(0, Math.min(100,
      30 + (satisfactionFactor * 40) + entertainmentBonus + cleanlinessBonus
    ))
  }

  static getEffects(state: GameState): Effect[] {
    const arrivalRate = this.calculateArrivalRate(state)
    const income = this.calculateIncome(state.stats.guests)

    const effects: Effect[] = [
      { statId: 'guests', perDay: arrivalRate },
      { statId: 'money', perDay: income },
    ]

    for (const demand of this.DEMANDS) {
      effects.push({
        statId: demand.statId,
        perDay: -state.stats.guests * demand.perGuest,
      })
    }

    const cleanlinessDecay = -state.stats.guests * 0.1
    effects.push({ statId: 'cleanliness', perDay: cleanlinessDecay })

    return effects
  }
}
