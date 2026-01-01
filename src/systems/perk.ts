import type { PerkDef, GameState, ServiceId } from '../engine/game-types'
import { Requirements } from '../engine/requirements'
import type { Modifier } from '../engine/modifiers'

export type ExpansionPerkDef = PerkDef & {
  slotsGranted: number
}

export type LodgingPerkDef = PerkDef & {
  lodgingTier: 1 | 2 | 3
}

export type ServicePerkDef = PerkDef & {
  serviceId: ServiceId
}

export class Perk {
  static readonly SPOTLESS_PARK: PerkDef = {
    id: 'spotless_park',
    name: 'Squeaky Clean Squad',
    emoji: '🧹',
    description: 'Unlocks Cleaning Cart, Janitor Quarters, and Recycling Center',
    costs: [{ statId: 'money', amount: 400 }],
    effects: [],
    requirements: [{ type: 'day', min: 5 }],
  }

  // Park Expansion perks - these grant building slots
  static readonly EXTRA_SLOT_1: ExpansionPerkDef = {
    id: 'extra_slot_1',
    name: 'Park Expansion I',
    emoji: '🏗️',
    description: 'Unlock 2 additional building slots',
    costs: [{ statId: 'money', amount: 500 }],
    effects: [],
    requirements: [],
    slotsGranted: 2,
  }

  static readonly EXTRA_SLOT_2: ExpansionPerkDef = {
    id: 'extra_slot_2',
    name: 'Park Expansion II',
    emoji: '🏗️',
    description: 'Unlock 2 additional building slots',
    costs: [{ statId: 'money', amount: 2000 }],
    effects: [],
    requirements: [{ type: 'perk', id: 'extra_slot_1' }],
    slotsGranted: 2,
  }

  static readonly EXTRA_SLOT_3: ExpansionPerkDef = {
    id: 'extra_slot_3',
    name: 'Park Expansion III',
    emoji: '🏗️',
    description: 'Unlock 4 additional building slots',
    costs: [{ statId: 'money', amount: 8000 }],
    effects: [],
    requirements: [{ type: 'perk', id: 'extra_slot_2' }],
    slotsGranted: 4,
  }

  static readonly EXTRA_SLOT_4: ExpansionPerkDef = {
    id: 'extra_slot_4',
    name: 'Park Expansion IV',
    emoji: '🏗️',
    description: 'Unlock 4 additional building slots',
    costs: [{ statId: 'money', amount: 25000 }],
    effects: [],
    requirements: [{ type: 'perk', id: 'extra_slot_3' }],
    slotsGranted: 4,
  }

  static readonly EXTRA_SLOT_5: ExpansionPerkDef = {
    id: 'extra_slot_5',
    name: 'Park Expansion V',
    emoji: '🏗️',
    description: 'Unlock 8 additional building slots',
    costs: [{ statId: 'money', amount: 100000 }],
    effects: [],
    requirements: [{ type: 'perk', id: 'extra_slot_4' }],
    slotsGranted: 8,
  }

  static readonly EXPANSION_PERKS: ExpansionPerkDef[] = [
    Perk.EXTRA_SLOT_1,
    Perk.EXTRA_SLOT_2,
    Perk.EXTRA_SLOT_3,
    Perk.EXTRA_SLOT_4,
    Perk.EXTRA_SLOT_5,
  ]

  // Lodging perks - unlock lodging buildings
  static readonly LODGING_1: LodgingPerkDef = {
    id: 'lodging_1',
    name: 'Lodging I',
    emoji: '🛏️',
    description: 'Unlocks Campground and Starlight Motel',
    costs: [{ statId: 'money', amount: 3000 }],
    effects: [],
    requirements: [{ type: 'milestone', id: 'guests_40' }],
    lodgingTier: 1,
  }

  static readonly LODGING_2: LodgingPerkDef = {
    id: 'lodging_2',
    name: 'Lodging II',
    emoji: '🛏️',
    description: 'Unlocks Pinewood Cabins and Parkview Inn',
    costs: [{ statId: 'money', amount: 12000 }],
    effects: [],
    requirements: [{ type: 'perk', id: 'lodging_1' }],
    lodgingTier: 2,
  }

  static readonly LODGING_3: LodgingPerkDef = {
    id: 'lodging_3',
    name: 'Lodging III',
    emoji: '🛏️',
    description: 'Unlocks Lakeside Resort and Cloud Nine Suites',
    costs: [{ statId: 'money', amount: 35000 }],
    effects: [],
    requirements: [{ type: 'perk', id: 'lodging_2' }],
    lodgingTier: 3,
  }

  static readonly LODGING_PERKS: LodgingPerkDef[] = [
    Perk.LODGING_1,
    Perk.LODGING_2,
    Perk.LODGING_3,
  ]

  // Service perks - unlock park services
  static readonly FAST_PASS_UNLOCK: ServicePerkDef = {
    id: 'fast_pass_unlock',
    name: 'Fast Pass',
    emoji: '⚡',
    description: 'Adjustable pricing: trade capacity for income',
    costs: [{ statId: 'money', amount: 2500 }],
    effects: [],
    requirements: [{ type: 'milestone', id: 'guests_30' }],
    serviceId: 'fast_pass',
  }

  static readonly SERVICE_PERKS: ServicePerkDef[] = [
    Perk.FAST_PASS_UNLOCK,
  ]

  // Marketing perk - unlocks marketing campaigns
  static readonly MARKETING_OFFICE: PerkDef = {
    id: 'marketing_office',
    name: 'Marketing Office',
    emoji: '📣',
    description: 'Run marketing campaigns to attract more guests',
    costs: [{ statId: 'money', amount: 2500 }],
    effects: [],
    requirements: [{ type: 'milestone', id: 'guests_75' }],
  }

  // Ride unlock perks
  static readonly THRILL_SEEKERS: PerkDef = {
    id: 'thrill_seekers',
    name: 'Thrill Seekers',
    emoji: '💥',
    description: 'Unlocks Drop Tower, Pendulum Fury, and Rapids Run',
    costs: [{ statId: 'money', amount: 5000 }],
    effects: [],
    requirements: [{ type: 'milestone', id: 'guests_50' }],
  }

  // Shop unlock perk
  static readonly SHOPS_1: PerkDef = {
    id: 'shops_1',
    name: 'Shops I',
    emoji: '💰',
    description: 'Unlocks Gift Shop, Carnival Games, Plush Stand, and Arcade',
    costs: [{ statId: 'money', amount: 2000 }],
    effects: [],
    requirements: [{ type: 'milestone', id: 'guests_75' }],
  }

  // Premium pricing perk - unlocks higher ticket prices
  static readonly DESTINATION_PARK: PerkDef = {
    id: 'destination_park',
    name: 'Destination Park',
    emoji: '🏰',
    description: 'Your park becomes a renowned destination—guests expect premium prices',
    costs: [{ statId: 'money', amount: 15000 }],
    effects: [],
    requirements: [{ type: 'day', min: 75 }],
  }

  static readonly ALL: PerkDef[] = [
    Perk.SPOTLESS_PARK,
    Perk.EXTRA_SLOT_1,
    Perk.EXTRA_SLOT_2,
    Perk.EXTRA_SLOT_3,
    Perk.EXTRA_SLOT_4,
    Perk.EXTRA_SLOT_5,
    Perk.LODGING_1,
    Perk.LODGING_2,
    Perk.LODGING_3,
    Perk.FAST_PASS_UNLOCK,
    Perk.MARKETING_OFFICE,
    Perk.THRILL_SEEKERS,
    Perk.SHOPS_1,
    Perk.DESTINATION_PARK,
  ]

  static getById(id: string): PerkDef | undefined {
    return this.ALL.find(p => p.id === id)
  }

  static canAfford(perk: PerkDef, state: GameState): boolean {
    return perk.costs.every(cost => state.stats[cost.statId] >= cost.amount)
  }

  static isUnlocked(perk: PerkDef, state: GameState): boolean {
    return Requirements.checkAll(perk.requirements, state)
  }

  static isOwned(perk: PerkDef, state: GameState): boolean {
    return state.ownedPerks.includes(perk.id)
  }

  static getAvailable(state: GameState): PerkDef[] {
    return this.ALL.filter(p => this.isUnlocked(p, state) && !this.isOwned(p, state))
  }

  static isSlotPerk(perk: PerkDef): boolean {
    return perk.id.startsWith('extra_slot')
  }

  static getTotalSlotsFromPerks(state: GameState): number {
    return this.EXPANSION_PERKS
      .filter(p => state.ownedPerks.includes(p.id))
      .reduce((sum, p) => sum + p.slotsGranted, 0)
  }

  static getNextExpansionPerk(state: GameState): ExpansionPerkDef | null {
    return this.EXPANSION_PERKS.find(p => !state.ownedPerks.includes(p.id)) ?? null
  }

  static getMaxLodgingTier(state: GameState): 0 | 1 | 2 | 3 {
    if (state.ownedPerks.includes('lodging_3')) return 3
    if (state.ownedPerks.includes('lodging_2')) return 2
    if (state.ownedPerks.includes('lodging_1')) return 1
    return 0
  }

  static getNextLodgingPerk(state: GameState): LodgingPerkDef | null {
    return this.LODGING_PERKS.find(p => !state.ownedPerks.includes(p.id)) ?? null
  }

  static isServicePerk(perk: PerkDef): perk is ServicePerkDef {
    return 'serviceId' in perk
  }

  static getModifiers(perkId: string): Modifier[] {
    const perk = this.getById(perkId)
    if (!perk) return []

    const source = { type: 'perk' as const, perkId }

    return perk.effects.map((effect) => ({
      source,
      stat: effect.statId,
      flat: effect.perDay || undefined,
      increased: effect.multiplier ? (effect.multiplier - 1) * 100 : undefined,
      label: perk.name,
      emoji: perk.emoji,
    }))
  }

  // Premium pricing helpers
  static getMaxTicketPrice(state: GameState): number {
    if (state.ownedPerks.includes('destination_park')) return 50
    return 25
  }

  static getPerceivedValueBonus(state: GameState): number {
    if (state.ownedPerks.includes('destination_park')) return 0.5
    return 0
  }
}
