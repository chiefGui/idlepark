import type { PerkDef, GameState } from '../engine/game-types'
import { Requirements } from '../engine/requirements'

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

  static readonly EXTRA_SLOT_1: PerkDef = {
    id: 'extra_slot_1',
    name: 'Park Expansion I',
    emoji: '🏗️',
    description: 'Unlock one additional building slot',
    costs: [{ statId: 'money', amount: 250 }],
    effects: [],
    requirements: [],
  }

  static readonly EXTRA_SLOT_2: PerkDef = {
    id: 'extra_slot_2',
    name: 'Park Expansion II',
    emoji: '🏗️',
    description: 'Unlock one additional building slot',
    costs: [{ statId: 'money', amount: 500 }],
    effects: [],
    requirements: [{ type: 'perk', id: 'extra_slot_1' }],
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

  static readonly ALL: PerkDef[] = [
    Perk.MARKETING_1,
    Perk.EFFICIENT_STAFF,
    Perk.EXTRA_SLOT_1,
    Perk.EXTRA_SLOT_2,
    Perk.CLEANLINESS_BOOST,
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
}
