import type { PerkDef, GameState } from '../engine/game-types'
import { Requirements } from '../engine/requirements'
import type { Modifier } from '../engine/modifiers'

export type ExpansionPerkDef = PerkDef & {
  slotsGranted: number
}

export class Perk {
  static readonly MARKETING_1: PerkDef = {
    id: 'marketing_1',
    name: 'Basic Marketing',
    emoji: '📢',
    description: 'Attract 20% more guests',
    costs: [{ statId: 'money', amount: 200 }],
    effects: [{ statId: 'guests', perDay: 0, multiplier: 1.2 }],
    requirements: [],
  }

  static readonly EFFICIENT_STAFF: PerkDef = {
    id: 'efficient_staff',
    name: 'Efficient Staff',
    emoji: '👷',
    description: 'Reduce building upkeep by 10%',
    costs: [{ statId: 'money', amount: 300 }],
    effects: [{ statId: 'money', perDay: 0, multiplier: 1.1 }],
    requirements: [{ type: 'day', min: 5 }],
  }

  static readonly CLEANLINESS_BOOST: PerkDef = {
    id: 'cleanliness_boost',
    name: 'Cleaning Crew',
    emoji: '🧹',
    description: 'Passive cleanliness improvement',
    costs: [{ statId: 'money', amount: 150 }],
    effects: [{ statId: 'cleanliness', perDay: 3 }],
    requirements: [{ type: 'day', min: 3 }],
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

  static readonly ALL: PerkDef[] = [
    Perk.MARKETING_1,
    Perk.EFFICIENT_STAFF,
    Perk.CLEANLINESS_BOOST,
    Perk.EXTRA_SLOT_1,
    Perk.EXTRA_SLOT_2,
    Perk.EXTRA_SLOT_3,
    Perk.EXTRA_SLOT_4,
    Perk.EXTRA_SLOT_5,
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

  static getModifiers(perkId: string): Modifier[] {
    const perk = this.getById(perkId)
    if (!perk) return []

    const source = { type: 'perk' as const, perkId }

    return perk.effects.map((effect) => ({
      source,
      stat: effect.statId,
      flat: effect.perDay || undefined,
      increased: effect.multiplier ? (effect.multiplier - 1) * 100 : undefined,
    }))
  }
}
