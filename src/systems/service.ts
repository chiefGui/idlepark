import type { ServiceId, GameState, MilestoneDef, FeedEventType, FastPassTier } from '../engine/game-types'
import type { Modifier } from '../engine/modifiers'
import { Guest } from './guest'
import { Building } from './building'
import { GameTypes } from '../engine/game-types'

// === SERVICE TYPES ===

export type ServiceDef = {
  id: ServiceId
  name: string
  emoji: string
  description: string
  perkId: string // Perk required to unlock this service
}

export type FastPassTierConfig = {
  id: FastPassTier
  name: string
  capacityBoostPercent: number  // % boost to base + lodging capacity
  incomeBoostPercent: number    // % boost to guest income
  priceMultiplier: number       // Fast Pass costs ticket × (1 + this)
}

export type ServiceStats = {
  incomeBoostPercent: number // % boost to guest income
  capacityBonus: number // Extra guest capacity provided
}

// === SERVICE CLASS ===

export class Service {
  // Fast Pass tier configurations
  // Trade-off: Lower price = more capacity, higher price = more income per guest
  static readonly FAST_PASS_TIERS: FastPassTierConfig[] = [
    { id: 'budget', name: 'Budget', capacityBoostPercent: 15, incomeBoostPercent: 8, priceMultiplier: 0.10 },
    { id: 'standard', name: 'Standard', capacityBoostPercent: 10, incomeBoostPercent: 15, priceMultiplier: 0.25 },
    { id: 'premium', name: 'Premium', capacityBoostPercent: 6, incomeBoostPercent: 25, priceMultiplier: 0.50 },
    { id: 'vip', name: 'VIP', capacityBoostPercent: 3, incomeBoostPercent: 40, priceMultiplier: 1.00 },
  ]

  // Fast Pass: Skip the lines, pay a premium
  static readonly FAST_PASS: ServiceDef = {
    id: 'fast_pass',
    name: 'Fast Pass',
    emoji: '⚡',
    description: 'Adjust pricing to balance guest capacity and income',
    perkId: 'fast_pass_unlock',
  }

  static readonly ALL: ServiceDef[] = [
    Service.FAST_PASS,
  ]

  static getById(id: ServiceId): ServiceDef | undefined {
    return this.ALL.find(s => s.id === id)
  }

  /**
   * Get Fast Pass tier configuration by ID
   */
  static getFastPassTier(tierId: FastPassTier): FastPassTierConfig {
    return this.FAST_PASS_TIERS.find(t => t.id === tierId) ?? this.FAST_PASS_TIERS[1] // Default to standard
  }

  /**
   * Get the current Fast Pass tier config from game state
   */
  static getCurrentFastPassTier(state: GameState): FastPassTierConfig {
    return this.getFastPassTier(state.fastPassTier)
  }

  /**
   * Calculate Fast Pass price based on ticket price and tier
   */
  static getFastPassPrice(state: GameState): number {
    if (!this.isFastPassUnlocked(state)) return 0
    const tier = this.getCurrentFastPassTier(state)
    return state.ticketPrice * (1 + tier.priceMultiplier)
  }

  /**
   * Check if Fast Pass is unlocked
   */
  static isFastPassUnlocked(state: GameState): boolean {
    return state.ownedPerks.includes(this.FAST_PASS.perkId)
  }

  /**
   * Check if a service is unlocked (perk owned)
   */
  static isUnlocked(service: ServiceDef, state: GameState): boolean {
    return state.ownedPerks.includes(service.perkId)
  }

  /**
   * Get all unlocked services
   */
  static getUnlocked(state: GameState): ServiceDef[] {
    return this.ALL.filter(s => this.isUnlocked(s, state))
  }

  /**
   * Check if any services are unlocked
   */
  static hasAnyUnlocked(state: GameState): boolean {
    return this.getUnlocked(state).length > 0
  }

  /**
   * Get capacity bonus from Fast Pass (percentage of base + lodging capacity)
   */
  static getTotalCapacityBonus(state: GameState): number {
    if (!this.isFastPassUnlocked(state)) return 0

    const tier = this.getCurrentFastPassTier(state)
    const baseCapacity = GameTypes.INITIAL_GUEST_CAPACITY
    const lodgingBonus = Building.getTotalCapacityBonus(state)
    const preServiceCapacity = baseCapacity + lodgingBonus

    return Math.floor(preServiceCapacity * (tier.capacityBoostPercent / 100))
  }

  /**
   * Get total income boost percent from Fast Pass tier
   */
  static getTotalIncomeBoostPercent(state: GameState): number {
    if (!this.isFastPassUnlocked(state)) return 0
    const tier = this.getCurrentFastPassTier(state)
    return tier.incomeBoostPercent
  }

  /**
   * Get modifiers for all active services (for rate calculation)
   * Applies income boost as percentage increase to guest income
   */
  static getModifiers(state: GameState): Modifier[] {
    const boostPercent = this.getTotalIncomeBoostPercent(state)
    if (boostPercent <= 0) return []

    // Calculate the bonus income from the percentage boost
    const baseGuestIncome = Guest.calculateIncomeWithEntertainment(
      state.stats.guests,
      state.ticketPrice,
      state.stats.entertainment
    )
    const bonusIncome = baseGuestIncome * (boostPercent / 100)

    return [{
      source: { type: 'service' as const },
      stat: 'money',
      flat: bonusIncome,
    }]
  }

  // === MILESTONES ===
  // Service-specific milestones - aggregated by milestone.ts

  static readonly MILESTONES: Record<string, MilestoneDef> = {
    FAST_PASS_UNLOCKED: {
      id: 'fast_pass_unlocked',
      name: 'Skip the Line',
      emoji: '⚡',
      description: 'Unlock Fast Pass service',
      condition: { type: 'perk', id: 'fast_pass_unlock' },
    },
  }

  // === FEED TEMPLATES ===
  // Service-specific feed messages - aggregated by feed.ts

  static readonly FEED_EVENTS: FeedEventType[] = [
    'service_purchased' as FeedEventType,
  ]

  static readonly FEED_MESSAGES: Record<string, string[]> = {
    fast_pass_popular: [
      "Worth every penny! Didn't wait in a single line 🎢",
      "Fast Pass = best decision of the day ⚡",
      "The express lane life chose me 💨",
      "Skipping lines like a VIP 👑",
    ],
    fast_pass_expensive: [
      "Fast Pass prices are getting steep... 💸",
      "Maybe next time I'll just wait in line 😅",
      "VIP treatment comes at a cost 😬",
    ],
  }
}
