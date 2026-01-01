import type { StatId, GameState, GuestBreakdown, GuestMood } from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import type { Modifier } from '../engine/modifiers'
import { Building } from './building'
import { Service } from './service'

export type GuestDemand = {
  statId: StatId
  perGuest: number
}

export type SupplyConsequence = {
  statId: StatId
  threshold: number  // Supply ratio below this triggers the consequence
  appealCap: number  // Maximum appeal when triggered
}

export class Guest {
  // Base rates
  static readonly BASE_ARRIVAL_RATE = 5
  static readonly BASE_MONEY_PER_GUEST = 2
  static readonly APPEAL_BASELINE = 50

  // Mood thresholds (based on appeal)
  static readonly HAPPY_THRESHOLD = 60
  static readonly UNHAPPY_THRESHOLD = 30

  // Tier transition rate (% of guests that can shift per tick) - arcade-y = fast
  static readonly TRANSITION_RATE = 0.15

  // Unhappy departure rate (% that leave at end of day)
  static readonly UNHAPPY_DEPARTURE_RATE = 0.5

  // Natural turnover - guests leave after their "visit" regardless of mood
  // This creates healthy churn and prevents permanent capacity lock
  static readonly NATURAL_DEPARTURE_RATE = 0.1 // Base 10% of guests leave per day
  static readonly HAPPY_DEPARTURE_MODIFIER = 0.5 // Happy guests leave 50% slower
  static readonly UNHAPPY_DEPARTURE_MODIFIER = 1.5 // Unhappy guests leave 50% faster

  // Appeal modifiers by mood (feedback loop)
  static readonly HAPPY_APPEAL_BONUS = 5
  static readonly UNHAPPY_APPEAL_PENALTY = -10

  static readonly DEMANDS: GuestDemand[] = [
    { statId: 'entertainment', perGuest: 0.5 },
    { statId: 'food', perGuest: 0.3 },
    { statId: 'comfort', perGuest: 0.2 },
  ]

  // Consequences for undersupply - when supply ratio falls below threshold,
  // appeal is capped. Multiple entries per stat = tiered consequences.
  static readonly SUPPLY_CONSEQUENCES: SupplyConsequence[] = [
    // Entertainment is critical - theme parks need rides!
    { statId: 'entertainment', threshold: 0.5, appealCap: 40 },  // Below 50% = cap at 40
    { statId: 'entertainment', threshold: 0.25, appealCap: 20 }, // Below 25% = cap at 20 (crisis)
    { statId: 'food', threshold: 0.3, appealCap: 25 },
    { statId: 'comfort', threshold: 0.2, appealCap: 35 },
  ]

  static getTicketPriceMultiplier(ticketPrice: number): number {
    const basePrice = GameTypes.DEFAULT_TICKET_PRICE
    return ticketPrice / basePrice
  }

  /**
   * Calculate perceived value - how fair is the price for this park's quality?
   * Returns a ratio: >1 = good value, <1 = overpriced
   */
  static calculatePerceivedValue(state: GameState): number {
    const basePrice = GameTypes.DEFAULT_TICKET_PRICE

    // Park quality based on what guests experience (0-100 scale)
    const entertainment = Math.min(100, state.stats.entertainment)
    const cleanliness = Math.min(100, state.stats.cleanliness)
    const appeal = Math.min(100, state.stats.appeal)
    const parkQuality = (entertainment + cleanliness + appeal) / 3

    // What price does this quality "deserve"?
    // Quality 50 = base price is fair, quality 100 = 2x base price is fair
    const fairPrice = basePrice * (parkQuality / 50)

    // Avoid division by zero
    if (state.ticketPrice <= 0) return 2

    return fairPrice / state.ticketPrice
  }

  static getArrivalPenalty(state: GameState): number {
    const perceivedValue = this.calculatePerceivedValue(state)

    // Good value (>1) = more arrivals, bad value (<1) = fewer arrivals
    // Clamp between 0.3 and 1.5
    return Math.max(0.3, Math.min(1.5, perceivedValue))
  }

  static getTotalGuests(state: GameState): number {
    return GameTypes.getTotalGuests(state.guestBreakdown)
  }

  /**
   * Get current guest capacity.
   * Initial capacity + bonuses from lodging buildings + service bonuses.
   */
  static getCapacity(state: GameState): number {
    const baseCapacity = GameTypes.INITIAL_GUEST_CAPACITY
    const lodgingBonus = Building.getTotalCapacityBonus(state)
    const serviceBonus = Service.getTotalCapacityBonus(state)
    return baseCapacity + lodgingBonus + serviceBonus
  }

  /**
   * Check if park is at capacity (no more arrivals allowed).
   */
  static isAtCapacity(state: GameState): boolean {
    return this.getTotalGuests(state) >= this.getCapacity(state)
  }

  /**
   * Get supply ratio for a specific demand stat.
   * Returns 0-1 where 1 = fully meeting demand, 0 = no supply.
   */
  static getSupplyRatio(statId: StatId, state: GameState): number {
    const demand = this.DEMANDS.find(d => d.statId === statId)
    if (!demand) return 1

    const totalGuests = this.getTotalGuests(state)
    const required = totalGuests * demand.perGuest
    if (required <= 0) return 1

    const supply = state.stats[statId]
    return Math.min(1, supply / required)
  }

  /**
   * Get all supply consequences currently active.
   * Returns consequences where supply ratio is below threshold.
   */
  static getActiveConsequences(state: GameState): SupplyConsequence[] {
    return this.SUPPLY_CONSEQUENCES.filter(consequence => {
      const ratio = this.getSupplyRatio(consequence.statId, state)
      return ratio < consequence.threshold
    })
  }

  static calculateArrivalRate(state: GameState): number {
    // Hard cap: no arrivals when at capacity
    if (this.isAtCapacity(state)) {
      return 0
    }

    const appealFactor = state.stats.appeal / this.APPEAL_BASELINE
    const valueFactor = this.getArrivalPenalty(state)
    return this.BASE_ARRIVAL_RATE * appealFactor * valueFactor
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

  /**
   * Calculate supply/demand ratio - how well is the park meeting guest needs?
   * Returns 0-100 score used internally for appeal calculation.
   */
  static calculateSupplyDemandScore(state: GameState): number {
    const totalGuests = this.getTotalGuests(state)
    let score = 100

    for (const demand of this.DEMANDS) {
      const supply = state.stats[demand.statId]
      const required = totalGuests * demand.perGuest

      if (required > 0) {
        const ratio = Math.min(1, supply / required)
        score *= ratio
      }
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Get mood based on current appeal level.
   * High appeal = guests are happy, low appeal = guests are unhappy.
   */
  static getMoodFromAppeal(appeal: number): GuestMood {
    if (appeal >= this.HAPPY_THRESHOLD) return 'happy'
    if (appeal < this.UNHAPPY_THRESHOLD) return 'unhappy'
    return 'neutral'
  }

  /**
   * Calculate appeal - the single metric for park quality.
   * Combines: entertainment, beauty, cleanliness, supply/demand balance, price fairness, and guest mood.
   */
  static calculateAppeal(state: GameState): number {
    if (state.stats.entertainment <= 0) return 0

    // Variety multiplier - more unique rides = more effective entertainment
    const varietyMultiplier = Building.getVarietyMultiplier(state)
    const effectiveEntertainment = state.stats.entertainment * varietyMultiplier

    // Base from entertainment (max 40 points)
    const entertainmentBase = Math.min(40, effectiveEntertainment / 2.5)

    // Beauty bonus (max 15 points)
    // Beauty makes the park more attractive and inviting
    const beauty = state.stats.beauty
    const beautyBonus = (beauty / 100) * 15

    // Supply/demand balance bonus (max 25 points)
    const supplyDemandScore = this.calculateSupplyDemandScore(state)
    const supplyDemandBonus = (supplyDemandScore / 100) * 25

    // Cleanliness bonus/penalty - asymmetric: dirty hurts more than clean helps
    // 100% = +10, 50% = 0, 25% = -25, 0% = -45
    const cleanliness = state.stats.cleanliness
    let cleanlinessBonus = 0
    if (cleanliness >= 50) {
      // Clean parks get small bonus (max +10)
      cleanlinessBonus = ((cleanliness - 50) / 50) * 10
    } else {
      // Dirty parks get escalating penalty (max -45)
      // Uses quadratic scaling for arcade feel - gets worse fast below 25%
      const dirtiness = (50 - cleanliness) / 50 // 0 at 50%, 1 at 0%
      cleanlinessBonus = -(dirtiness * dirtiness * 25 + dirtiness * 20)
    }

    // Price fairness bonus/penalty (max ±10 points)
    const perceivedValue = this.calculatePerceivedValue(state)
    let priceBonus = 0
    if (perceivedValue < 1) {
      // Overpriced - penalty
      priceBonus = (perceivedValue - 1) * 20 // up to -10 at 0.5 value
    } else if (perceivedValue > 1.2) {
      // Great value - bonus
      priceBonus = Math.min(10, (perceivedValue - 1.2) * 15)
    }

    // Mood-based feedback loop (max ±10 points)
    const { happy, unhappy } = state.guestBreakdown
    const totalGuests = this.getTotalGuests(state)
    let moodBonus = 0
    if (totalGuests > 0) {
      const happyRatio = happy / totalGuests
      const unhappyRatio = unhappy / totalGuests
      moodBonus = happyRatio * this.HAPPY_APPEAL_BONUS + unhappyRatio * this.UNHAPPY_APPEAL_PENALTY
    }

    let appeal = entertainmentBase + beautyBonus + supplyDemandBonus + cleanlinessBonus + priceBonus + moodBonus

    // Apply supply consequence caps - critical undersupply limits max appeal
    const activeConsequences = this.getActiveConsequences(state)
    for (const consequence of activeConsequences) {
      appeal = Math.min(appeal, consequence.appealCap)
    }

    // Critical cleanliness cap - filthy parks guarantee unhappy guests
    // Below 20% cleanliness caps appeal at 25 (below UNHAPPY_THRESHOLD of 30)
    if (cleanliness < 20) {
      appeal = Math.min(appeal, 25)
    }

    return Math.max(0, Math.min(100, appeal))
  }

  /**
   * Get breakdown of appeal components for UI display.
   * Shows what's contributing to appeal and any active caps.
   */
  static getAppealBreakdown(state: GameState): {
    components: { label: string; value: number; max: number }[]
    caps: { reason: string; cap: number }[]
    total: number
  } {
    const components: { label: string; value: number; max: number }[] = []
    const caps: { reason: string; cap: number }[] = []

    if (state.stats.entertainment <= 0) {
      return { components: [{ label: 'Rides', value: 0, max: 40 }], caps: [], total: 0 }
    }

    // Entertainment (max 40)
    const varietyMultiplier = Building.getVarietyMultiplier(state)
    const effectiveEntertainment = state.stats.entertainment * varietyMultiplier
    const entertainmentBase = Math.min(40, effectiveEntertainment / 2.5)
    components.push({ label: 'Rides', value: Math.round(entertainmentBase), max: 40 })

    // Beauty (max 15)
    const beautyBonus = (state.stats.beauty / 100) * 15
    components.push({ label: 'Beauty', value: Math.round(beautyBonus), max: 15 })

    // Supply/demand (max 25)
    const supplyDemandScore = this.calculateSupplyDemandScore(state)
    const supplyDemandBonus = (supplyDemandScore / 100) * 25
    components.push({ label: 'Guest Needs', value: Math.round(supplyDemandBonus), max: 25 })

    // Cleanliness (-45 to +10)
    const cleanliness = state.stats.cleanliness
    let cleanlinessBonus = 0
    if (cleanliness >= 50) {
      cleanlinessBonus = ((cleanliness - 50) / 50) * 10
    } else {
      const dirtiness = (50 - cleanliness) / 50
      cleanlinessBonus = -(dirtiness * dirtiness * 25 + dirtiness * 20)
    }
    components.push({ label: 'Cleanliness', value: Math.round(cleanlinessBonus), max: 10 })

    // Price fairness (-10 to +10)
    const perceivedValue = this.calculatePerceivedValue(state)
    let priceBonus = 0
    if (perceivedValue < 1) {
      priceBonus = (perceivedValue - 1) * 20
    } else if (perceivedValue > 1.2) {
      priceBonus = Math.min(10, (perceivedValue - 1.2) * 15)
    }
    if (Math.round(priceBonus) !== 0) {
      components.push({ label: 'Pricing', value: Math.round(priceBonus), max: 10 })
    }

    // Mood feedback (-10 to +5)
    const totalGuests = this.getTotalGuests(state)
    if (totalGuests > 0) {
      const { happy, unhappy } = state.guestBreakdown
      const happyRatio = happy / totalGuests
      const unhappyRatio = unhappy / totalGuests
      const moodBonus = happyRatio * this.HAPPY_APPEAL_BONUS + unhappyRatio * this.UNHAPPY_APPEAL_PENALTY
      if (Math.round(moodBonus) !== 0) {
        components.push({ label: 'Guest Mood', value: Math.round(moodBonus), max: 5 })
      }
    }

    // Check for caps
    const activeConsequences = this.getActiveConsequences(state)
    for (const consequence of activeConsequences) {
      const statLabel = consequence.statId === 'entertainment' ? 'rides' :
                        consequence.statId === 'food' ? 'food' : 'comfort'
      caps.push({ reason: `Low ${statLabel}`, cap: consequence.appealCap })
    }
    if (cleanliness < 20) {
      caps.push({ reason: 'Filthy park', cap: 25 })
    }

    const total = state.stats.appeal
    return { components, caps, total }
  }

  /**
   * Process tier transitions based on current appeal.
   * Returns new breakdown after transitions.
   */
  static processTransitions(
    breakdown: GuestBreakdown,
    appeal: number,
    deltaDay: number
  ): GuestBreakdown {
    const targetMood = this.getMoodFromAppeal(appeal)
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
   * Respects capacity limit.
   */
  static processArrivals(
    breakdown: GuestBreakdown,
    arrivalRate: number,
    deltaDay: number,
    capacity: number
  ): GuestBreakdown {
    const currentGuests = GameTypes.getTotalGuests(breakdown)
    const availableSpace = Math.max(0, capacity - currentGuests)
    const potentialArrivals = arrivalRate * deltaDay
    const actualArrivals = Math.min(potentialArrivals, availableSpace)

    return {
      ...breakdown,
      neutral: breakdown.neutral + actualArrivals,
    }
  }

  /**
   * Process guest departures at end of day.
   * Includes both natural turnover (all guests) and extra unhappy departures.
   * Returns guests that left.
   */
  static processDepartures(breakdown: GuestBreakdown): {
    newBreakdown: GuestBreakdown
    departed: number
  } {
    // Natural turnover - even happy guests eventually go home
    const happyDeparting = Math.floor(
      breakdown.happy * this.NATURAL_DEPARTURE_RATE * this.HAPPY_DEPARTURE_MODIFIER
    )
    const neutralDeparting = Math.floor(
      breakdown.neutral * this.NATURAL_DEPARTURE_RATE
    )
    // Unhappy get both natural turnover AND the extra unhappy departure rate
    const unhappyNatural = Math.floor(
      breakdown.unhappy * this.NATURAL_DEPARTURE_RATE * this.UNHAPPY_DEPARTURE_MODIFIER
    )
    const unhappyExtra = Math.floor(
      (breakdown.unhappy - unhappyNatural) * this.UNHAPPY_DEPARTURE_RATE
    )
    const unhappyDeparting = unhappyNatural + unhappyExtra

    const departed = happyDeparting + neutralDeparting + unhappyDeparting

    return {
      newBreakdown: {
        happy: Math.max(0, breakdown.happy - happyDeparting),
        neutral: Math.max(0, breakdown.neutral - neutralDeparting),
        unhappy: Math.max(0, breakdown.unhappy - unhappyDeparting),
      },
      departed,
    }
  }

  /**
   * @deprecated Use processDepartures instead
   */
  static processUnhappyDepartures(breakdown: GuestBreakdown): {
    newBreakdown: GuestBreakdown
    departed: number
  } {
    return this.processDepartures(breakdown)
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
      { source, stat: 'money', flat: income, label: 'Ticket sales', emoji: '🎟️' },
    ]

    // Demand labels for different consumption types
    const demandLabels: Record<string, { label: string; emoji: string }> = {
      entertainment: { label: 'Guest fun', emoji: '🎢' },
      food: { label: 'Guest hunger', emoji: '🍽️' },
      comfort: { label: 'Guest needs', emoji: '🛋️' },
    }

    for (const demand of this.DEMANDS) {
      const meta = demandLabels[demand.statId] ?? { label: 'Guest consumption', emoji: '👥' }
      modifiers.push({
        source,
        stat: demand.statId,
        flat: -totalGuests * demand.perGuest,
        label: meta.label,
        emoji: meta.emoji,
      })
    }

    const cleanlinessDecay = -totalGuests * 0.1
    modifiers.push({ source, stat: 'cleanliness', flat: cleanlinessDecay, label: 'Guest mess', emoji: '🗑️' })

    // Beauty decay - crowds cause wear and tear (slower than cleanliness)
    const beautyDecay = -totalGuests * 0.03
    modifiers.push({ source, stat: 'beauty', flat: beautyDecay, label: 'Crowd wear', emoji: '👣' })

    return modifiers
  }
}
