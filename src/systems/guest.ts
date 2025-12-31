import type { StatId, GameState, GuestBreakdown, GuestMood } from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import type { Modifier } from '../engine/modifiers'

export type GuestDemand = {
  statId: StatId
  perGuest: number
}

export class Guest {
  // Base rates
  static readonly BASE_ARRIVAL_RATE = 5
  static readonly BASE_MONEY_PER_GUEST = 2
  static readonly APPEAL_BASELINE = 50

  // Mood thresholds (satisfaction score)
  static readonly HAPPY_THRESHOLD = 70
  static readonly UNHAPPY_THRESHOLD = 40

  // Tier transition rate (% of guests that can shift per tick) - arcade-y = fast
  static readonly TRANSITION_RATE = 0.15

  // Unhappy departure rate (% that leave at end of day)
  static readonly UNHAPPY_DEPARTURE_RATE = 0.5

  // Appeal modifiers by mood
  static readonly HAPPY_APPEAL_BONUS = 5
  static readonly UNHAPPY_APPEAL_PENALTY = -10

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

  static getTotalGuests(state: GameState): number {
    return GameTypes.getTotalGuests(state.guestBreakdown)
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
    const entertainmentFactor = Math.min(1, entertainment / 20)
    return guestCount * this.BASE_MONEY_PER_GUEST * priceMultiplier * entertainmentFactor
  }

  static calculateSatisfaction(state: GameState): number {
    const totalGuests = this.getTotalGuests(state)
    let satisfaction = 100

    for (const demand of this.DEMANDS) {
      const supply = state.stats[demand.statId]
      const required = totalGuests * demand.perGuest

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

  static getMoodFromSatisfaction(satisfaction: number): GuestMood {
    if (satisfaction >= this.HAPPY_THRESHOLD) return 'happy'
    if (satisfaction < this.UNHAPPY_THRESHOLD) return 'unhappy'
    return 'neutral'
  }

  static calculateAppeal(state: GameState): number {
    if (state.stats.entertainment <= 0) return 0

    const entertainmentBase = Math.min(50, state.stats.entertainment / 2)
    const satisfactionBonus = (state.stats.satisfaction / 100) * 30
    const cleanlinessBonus = Math.max(-10, (state.stats.cleanliness - 50) / 5)

    // Mood-based appeal modifier
    const { happy, unhappy } = state.guestBreakdown
    const totalGuests = this.getTotalGuests(state)
    let moodBonus = 0
    if (totalGuests > 0) {
      const happyRatio = happy / totalGuests
      const unhappyRatio = unhappy / totalGuests
      moodBonus = happyRatio * this.HAPPY_APPEAL_BONUS + unhappyRatio * this.UNHAPPY_APPEAL_PENALTY
    }

    return Math.max(0, Math.min(100,
      entertainmentBase + satisfactionBonus + cleanlinessBonus + moodBonus
    ))
  }

  /**
   * Process tier transitions based on current satisfaction.
   * Returns new breakdown after transitions.
   */
  static processTransitions(
    breakdown: GuestBreakdown,
    satisfaction: number,
    deltaDay: number
  ): GuestBreakdown {
    const targetMood = this.getMoodFromSatisfaction(satisfaction)
    const transitionAmount = this.TRANSITION_RATE * deltaDay

    let { happy, neutral, unhappy } = breakdown

    if (targetMood === 'happy') {
      // Neutral → Happy, Unhappy → Neutral
      const neutralToHappy = Math.min(neutral, neutral * transitionAmount)
      const unhappyToNeutral = Math.min(unhappy, unhappy * transitionAmount)

      happy += neutralToHappy
      neutral = neutral - neutralToHappy + unhappyToNeutral
      unhappy -= unhappyToNeutral
    } else if (targetMood === 'unhappy') {
      // Neutral → Unhappy, Happy → Neutral
      const neutralToUnhappy = Math.min(neutral, neutral * transitionAmount)
      const happyToNeutral = Math.min(happy, happy * transitionAmount)

      unhappy += neutralToUnhappy
      neutral = neutral - neutralToUnhappy + happyToNeutral
      happy -= happyToNeutral
    } else {
      // Neutral: Happy → Neutral, Unhappy → Neutral (slower)
      const happyToNeutral = Math.min(happy, happy * transitionAmount * 0.5)
      const unhappyToNeutral = Math.min(unhappy, unhappy * transitionAmount * 0.5)

      neutral += happyToNeutral + unhappyToNeutral
      happy -= happyToNeutral
      unhappy -= unhappyToNeutral
    }

    return {
      happy: Math.max(0, happy),
      neutral: Math.max(0, neutral),
      unhappy: Math.max(0, unhappy),
    }
  }

  /**
   * Process new arrivals - all new guests start as neutral.
   */
  static processArrivals(
    breakdown: GuestBreakdown,
    arrivalRate: number,
    deltaDay: number
  ): GuestBreakdown {
    const newGuests = arrivalRate * deltaDay
    return {
      ...breakdown,
      neutral: breakdown.neutral + newGuests,
    }
  }

  /**
   * Process unhappy guest departures at end of day.
   * Returns guests that left.
   */
  static processUnhappyDepartures(breakdown: GuestBreakdown): {
    newBreakdown: GuestBreakdown
    departed: number
  } {
    const departed = Math.floor(breakdown.unhappy * this.UNHAPPY_DEPARTURE_RATE)
    return {
      newBreakdown: {
        ...breakdown,
        unhappy: breakdown.unhappy - departed,
      },
      departed,
    }
  }

  static getModifiers(state: GameState): Modifier[] {
    const totalGuests = this.getTotalGuests(state)
    const income = this.calculateIncomeWithEntertainment(
      totalGuests,
      state.ticketPrice,
      state.stats.entertainment
    )

    const source = { type: 'guest' as const }

    // Note: We don't add guest arrival modifier here anymore
    // Guest count is managed separately via guestBreakdown
    const modifiers: Modifier[] = [
      { source, stat: 'money', flat: income },
    ]

    for (const demand of this.DEMANDS) {
      modifiers.push({
        source,
        stat: demand.statId,
        flat: -totalGuests * demand.perGuest,
      })
    }

    const cleanlinessDecay = -totalGuests * 0.1
    modifiers.push({ source, stat: 'cleanliness', flat: cleanlinessDecay })

    return modifiers
  }
}
