import type { ServiceId, GameState, MilestoneDef, FeedEventType } from '../engine/game-types'
import type { Modifier } from '../engine/modifiers'
import { Guest } from './guest'

// === SERVICE TYPES ===

export type ServiceDef = {
  id: ServiceId
  name: string
  emoji: string
  description: string
  perkId: string // Perk required to unlock this service
  incomeBoostPercent: number // % boost to guest income
  capacityBonus: number // Flat capacity bonus when active
}

export type ServiceStats = {
  incomeBoostPercent: number // % boost to guest income
  capacityBonus: number // Extra guest capacity provided
}

// === SERVICE CLASS ===

export class Service {
  // Fast Pass: Skip the lines, pay a premium
  static readonly FAST_PASS: ServiceDef = {
    id: 'fast_pass',
    name: 'Fast Pass',
    emoji: '⚡',
    description: 'Boost guest income and park capacity',
    perkId: 'fast_pass_unlock',
    incomeBoostPercent: 25, // +25% guest income
    capacityBonus: 50, // +50 capacity
  }

  static readonly ALL: ServiceDef[] = [
    Service.FAST_PASS,
  ]

  static getById(id: ServiceId): ServiceDef | undefined {
    return this.ALL.find(s => s.id === id)
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
   * Get stats for a service (simple - just return the service's bonuses)
   */
  static getStats(service: ServiceDef): ServiceStats {
    return {
      incomeBoostPercent: service.incomeBoostPercent,
      capacityBonus: service.capacityBonus,
    }
  }

  /**
   * Get total capacity bonus from all unlocked services
   */
  static getTotalCapacityBonus(state: GameState): number {
    let total = 0
    for (const service of this.getUnlocked(state)) {
      total += service.capacityBonus
    }
    return total
  }

  /**
   * Get total income boost percent from all unlocked services
   */
  static getTotalIncomeBoostPercent(state: GameState): number {
    let total = 0
    for (const service of this.getUnlocked(state)) {
      total += service.incomeBoostPercent
    }
    return total
  }

  /**
   * Get modifiers for all active services (for rate calculation)
   * Applies income boost as percentage increase to guest income
   */
  static getModifiers(state: GameState): Modifier[] {
    const modifiers: Modifier[] = []

    for (const service of this.getUnlocked(state)) {
      // Calculate the bonus income from the percentage boost
      const baseGuestIncome = Guest.calculateIncomeWithEntertainment(
        state.stats.guests,
        state.ticketPrice,
        state.stats.entertainment
      )
      const bonusIncome = baseGuestIncome * (service.incomeBoostPercent / 100)

      if (bonusIncome > 0) {
        modifiers.push({
          source: { type: 'service' as const },
          stat: 'money',
          flat: bonusIncome,
          label: service.name,
          emoji: service.emoji,
        })
      }
    }

    return modifiers
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
