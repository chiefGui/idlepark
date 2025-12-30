import type { BuildingDef, Cost, GameState } from '../engine/game-types'
import { Requirements } from '../engine/requirements'

export class Building {
  static readonly CAROUSEL: BuildingDef = {
    id: 'carousel',
    name: 'Carousel',
    emoji: '🎠',
    description: 'A classic ride that guests love',
    costs: [{ statId: 'money', amount: 100 }],
    effects: [
      { statId: 'money', perDay: -5 },
      { statId: 'entertainment', perDay: 20 },
    ],
    requirements: [],
  }

  static readonly FOOD_STAND: BuildingDef = {
    id: 'food_stand',
    name: 'Food Stand',
    emoji: '🍔',
    description: 'Keeps guests fed and happy',
    costs: [{ statId: 'money', amount: 80 }],
    effects: [
      { statId: 'money', perDay: -3 },
      { statId: 'food', perDay: 15 },
    ],
    requirements: [],
  }

  static readonly RESTROOM: BuildingDef = {
    id: 'restroom',
    name: 'Restroom',
    emoji: '🚻',
    description: 'Essential for guest comfort',
    costs: [{ statId: 'money', amount: 60 }],
    effects: [
      { statId: 'money', perDay: -2 },
      { statId: 'comfort', perDay: 25 },
    ],
    requirements: [],
  }

  static readonly TRASH_CAN: BuildingDef = {
    id: 'trash_can',
    name: 'Trash Can',
    emoji: '🗑️',
    description: 'Helps keep the park clean',
    costs: [{ statId: 'money', amount: 20 }],
    effects: [
      { statId: 'cleanliness', perDay: 5 },
    ],
    requirements: [],
  }

  static readonly ROLLER_COASTER: BuildingDef = {
    id: 'roller_coaster',
    name: 'Roller Coaster',
    emoji: '🎢',
    description: 'The ultimate thrill ride',
    costs: [{ statId: 'money', amount: 500 }],
    effects: [
      { statId: 'money', perDay: -15 },
      { statId: 'entertainment', perDay: 80 },
    ],
    requirements: [{ type: 'day', min: 10 }],
  }

  static readonly ICE_CREAM: BuildingDef = {
    id: 'ice_cream',
    name: 'Ice Cream Shop',
    emoji: '🍦',
    description: 'Sweet treats for everyone',
    costs: [{ statId: 'money', amount: 120 }],
    effects: [
      { statId: 'money', perDay: -4 },
      { statId: 'food', perDay: 10 },
      { statId: 'satisfaction', perDay: 5 },
    ],
    requirements: [{ type: 'building', id: 'food_stand' }],
  }

  static readonly ALL: BuildingDef[] = [
    Building.CAROUSEL,
    Building.FOOD_STAND,
    Building.RESTROOM,
    Building.TRASH_CAN,
    Building.ROLLER_COASTER,
    Building.ICE_CREAM,
  ]

  static getById(id: string): BuildingDef | undefined {
    return this.ALL.find(b => b.id === id)
  }

  static canAfford(building: BuildingDef, state: GameState): boolean {
    return building.costs.every(cost => state.stats[cost.statId] >= cost.amount)
  }

  static isUnlocked(building: BuildingDef, state: GameState): boolean {
    return Requirements.checkAll(building.requirements, state)
  }

  static getAvailable(state: GameState): BuildingDef[] {
    return this.ALL.filter(b => this.isUnlocked(b, state))
  }

  static getTotalCost(building: BuildingDef): Cost[] {
    return building.costs
  }
}
