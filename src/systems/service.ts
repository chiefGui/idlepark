import type { ServiceId, ServiceConfig, ServiceState, GameState, MilestoneDef, FeedEventType } from '../engine/game-types'
import type { Modifier } from '../engine/modifiers'
import { Guest } from './guest'

// === SERVICE TYPES ===

export type ServiceDef = {
  id: ServiceId
  name: string
  emoji: string
  description: string
  perkId: string // Perk required to unlock this service
  minPrice: number
  maxPrice: number
  defaultPrice: number
  // How service stats scale with price/adoption
  baseAdoption: number // Base adoption rate at default price (0-1)
  capacityPerAdopter: number // Extra capacity per adopting guest
}

export type ServiceStats = {
  adoptionRate: number // 0-1, what % of guests adopt
  adopters: number // Actual number of adopters
  incomePerDay: number // Revenue from service
  capacityBonus: number // Extra guest capacity provided
}

// === SERVICE CLASS ===

export class Service {
  // Fast Pass: Skip the lines, pay a premium
  static readonly FAST_PASS: ServiceDef = {
    id: 'fast_pass',
    name: 'Fast Pass',
    emoji: '⚡',
    description: 'Let guests skip queues for a fee',
    perkId: 'fast_pass_unlock',
    minPrice: 5,
    maxPrice: 25,
    defaultPrice: 10,
    baseAdoption: 0.3, // 30% at default price
    capacityPerAdopter: 0.5, // Each adopter adds 0.5 effective capacity
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
   * Get default config for a service
   */
  static getDefaultConfig(service: ServiceDef): ServiceConfig {
    return {
      price: service.defaultPrice,
    }
  }

  /**
   * Calculate adoption rate based on price and park appeal
   * Higher prices = lower adoption
   * Higher appeal = higher adoption (guests trust the park more)
   */
  static calculateAdoptionRate(
    service: ServiceDef,
    config: ServiceConfig,
    state: GameState
  ): number {
    // Price effect: linear scaling from 1.5x at min price to 0.5x at max price
    const priceRange = service.maxPrice - service.minPrice
    const pricePosition = (config.price - service.minPrice) / priceRange
    const priceEffect = 1.5 - pricePosition // 1.5 at min, 0.5 at max

    // Appeal effect: scales from 0.5 at 0 appeal to 1.5 at 100 appeal
    const appeal = state.stats.appeal
    const appealEffect = 0.5 + (appeal / 100)

    const adoption = service.baseAdoption * priceEffect * appealEffect

    return Math.max(0, Math.min(1, adoption))
  }

  /**
   * Calculate all stats for a service
   */
  static calculateStats(
    service: ServiceDef,
    config: ServiceConfig,
    state: GameState
  ): ServiceStats {
    const adoptionRate = this.calculateAdoptionRate(service, config, state)
    const totalGuests = Guest.getTotalGuests(state)
    const adopters = Math.floor(totalGuests * adoptionRate)
    const incomePerDay = adopters * config.price
    const capacityBonus = Math.floor(adopters * service.capacityPerAdopter)

    return {
      adoptionRate,
      adopters,
      incomePerDay,
      capacityBonus,
    }
  }

  /**
   * Get total capacity bonus from all active services
   */
  static getTotalCapacityBonus(state: GameState): number {
    if (!state.services) return 0

    let total = 0
    for (const serviceState of state.services) {
      const service = this.getById(serviceState.serviceId)
      if (service && this.isUnlocked(service, state)) {
        const stats = this.calculateStats(service, serviceState.config, state)
        total += stats.capacityBonus
      }
    }
    return total
  }

  /**
   * Get total income per day from all active services
   */
  static getTotalIncomePerDay(state: GameState): number {
    if (!state.services) return 0

    let total = 0
    for (const serviceState of state.services) {
      const service = this.getById(serviceState.serviceId)
      if (service && this.isUnlocked(service, state)) {
        const stats = this.calculateStats(service, serviceState.config, state)
        total += stats.incomePerDay
      }
    }
    return total
  }

  /**
   * Get service state by ID, or create default if not exists
   */
  static getServiceState(
    serviceId: ServiceId,
    state: GameState
  ): ServiceState | null {
    const service = this.getById(serviceId)
    if (!service || !this.isUnlocked(service, state)) return null

    const existing = state.services?.find(s => s.serviceId === serviceId)
    if (existing) return existing

    return {
      serviceId,
      config: this.getDefaultConfig(service),
    }
  }

  /**
   * Get modifiers for all active services (for rate calculation)
   */
  static getModifiers(state: GameState): Modifier[] {
    const incomePerDay = this.getTotalIncomePerDay(state)
    if (incomePerDay <= 0) return []

    return [{
      source: { type: 'service' as const },
      stat: 'money',
      flat: incomePerDay,
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
