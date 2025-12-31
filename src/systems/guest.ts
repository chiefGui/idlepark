import type { StatId, GameState } from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import type { Modifier } from '../engine/modifiers'

export type GuestDemand = {
  statId: StatId
  perGuest: number
}

export class Guest {
  static readonly BASE_ARRIVAL_RATE = 5
  static readonly BASE_MONEY_PER_GUEST = 2
  static readonly APPEAL_BASELINE = 50

  static readonly DEMANDS: GuestDemand[] = [
    { statId: 'entertainment', perGuest: 0.5 },
    { statId: 'food', perGuest: 0.3 },
    { statId: 'comfort', perGuest: 0.2 },
  ]

  static getTicketPriceMultiplier(ticketPrice: number): number {
    const basePrice = GameTypes.DEFAULT_TICKET_PRICE
    return ticketPrice / basePrice
  }

  static getArrivalPenalty(ticketPrice: number): number {
    const priceMultiplier = this.getTicketPriceMultiplier(ticketPrice)
    return Math.max(0.3, 2 - priceMultiplier)
  }

  static calculateArrivalRate(state: GameState): number {
    const appealFactor = state.stats.appeal / this.APPEAL_BASELINE
    const arrivalPenalty = this.getArrivalPenalty(state.ticketPrice)
    return this.BASE_ARRIVAL_RATE * appealFactor * arrivalPenalty
  }

  static calculateIncomeWithEntertainment(
    guestCount: number,
    ticketPrice: number,
    entertainment: number
  ): number {
    const priceMultiplier = this.getTicketPriceMultiplier(ticketPrice)
    // No rides/entertainment = guests don't pay much (they have nothing to do)
    const entertainmentFactor = Math.min(1, entertainment / 20)
    return guestCount * this.BASE_MONEY_PER_GUEST * priceMultiplier * entertainmentFactor
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

    const priceMultiplier = this.getTicketPriceMultiplier(state.ticketPrice)
    if (priceMultiplier > 1.5) {
      satisfaction -= (priceMultiplier - 1.5) * 20
    }

    return Math.max(0, Math.min(100, satisfaction))
  }

  static calculateAppeal(state: GameState): number {
    // Appeal is primarily driven by what the park offers (entertainment)
    // An empty park has very low appeal - why would anyone come?
    const entertainmentBase = Math.min(50, state.stats.entertainment / 2)
    const satisfactionBonus = (state.stats.satisfaction / 100) * 30
    const cleanlinessBonus = Math.max(-10, (state.stats.cleanliness - 50) / 5)

    return Math.max(0, Math.min(100,
      entertainmentBase + satisfactionBonus + cleanlinessBonus
    ))
  }

  static getModifiers(state: GameState): Modifier[] {
    const arrivalRate = this.calculateArrivalRate(state)
    const income = this.calculateIncomeWithEntertainment(
      state.stats.guests,
      state.ticketPrice,
      state.stats.entertainment
    )

    const source = { type: 'guest' as const }

    const modifiers: Modifier[] = [
      { source, stat: 'guests', flat: arrivalRate },
      { source, stat: 'money', flat: income },
    ]

    for (const demand of this.DEMANDS) {
      modifiers.push({
        source,
        stat: demand.statId,
        flat: -state.stats.guests * demand.perGuest,
      })
    }

    const cleanlinessDecay = -state.stats.guests * 0.1
    modifiers.push({ source, stat: 'cleanliness', flat: cleanlinessDecay })

    return modifiers
  }
}
