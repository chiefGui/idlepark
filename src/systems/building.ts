import type { BuildingDef, BuildingCategory, Cost, GameState } from '../engine/game-types'
import { Requirements } from '../engine/requirements'

export class Building {
  // === RIDES ===
  static readonly CAROUSEL: BuildingDef = {
    id: 'carousel',
    name: 'Carousel',
    emoji: '🎠',
    description: 'A classic ride that guests love',
    category: 'rides',
    costs: [{ statId: 'money', amount: 100 }],
    effects: [
      { statId: 'money', perDay: -5 },
      { statId: 'entertainment', perDay: 20 },
    ],
    requirements: [],
  }

  static readonly FERRIS_WHEEL: BuildingDef = {
    id: 'ferris_wheel',
    name: 'Ferris Wheel',
    emoji: '🎡',
    description: 'A scenic ride with great views',
    category: 'rides',
    costs: [{ statId: 'money', amount: 200 }],
    effects: [
      { statId: 'money', perDay: -8 },
      { statId: 'entertainment', perDay: 35 },
      { statId: 'appeal', perDay: 2 },
    ],
    requirements: [{ type: 'day', min: 5 }],
  }

  static readonly ROLLER_COASTER: BuildingDef = {
    id: 'roller_coaster',
    name: 'Roller Coaster',
    emoji: '🎢',
    description: 'The ultimate thrill ride',
    category: 'rides',
    costs: [{ statId: 'money', amount: 500 }],
    effects: [
      { statId: 'money', perDay: -15 },
      { statId: 'entertainment', perDay: 80 },
    ],
    requirements: [{ type: 'day', min: 10 }],
  }

  static readonly BUMPER_CARS: BuildingDef = {
    id: 'bumper_cars',
    name: 'Bumper Cars',
    emoji: '🚗',
    description: 'Crash into friends safely',
    category: 'rides',
    costs: [{ statId: 'money', amount: 180 }],
    effects: [
      { statId: 'money', perDay: -6 },
      { statId: 'entertainment', perDay: 30 },
    ],
    requirements: [{ type: 'building', id: 'carousel' }],
  }

  // === FOOD ===
  static readonly FOOD_STAND: BuildingDef = {
    id: 'food_stand',
    name: 'Food Stand',
    emoji: '🍔',
    description: 'Keeps guests fed and happy',
    category: 'food',
    costs: [{ statId: 'money', amount: 80 }],
    effects: [
      { statId: 'money', perDay: -3 },
      { statId: 'food', perDay: 15 },
    ],
    requirements: [],
  }

  static readonly ICE_CREAM: BuildingDef = {
    id: 'ice_cream',
    name: 'Ice Cream Shop',
    emoji: '🍦',
    description: 'Sweet treats for everyone',
    category: 'food',
    costs: [{ statId: 'money', amount: 120 }],
    effects: [
      { statId: 'money', perDay: -4 },
      { statId: 'food', perDay: 10 },
      { statId: 'satisfaction', perDay: 5 },
    ],
    requirements: [{ type: 'building', id: 'food_stand' }],
  }

  static readonly PIZZA_PARLOR: BuildingDef = {
    id: 'pizza_parlor',
    name: 'Pizza Parlor',
    emoji: '🍕',
    description: 'Everyone loves pizza',
    category: 'food',
    costs: [{ statId: 'money', amount: 150 }],
    effects: [
      { statId: 'money', perDay: -5 },
      { statId: 'food', perDay: 25 },
    ],
    requirements: [{ type: 'day', min: 7 }],
  }

  static readonly DRINK_STAND: BuildingDef = {
    id: 'drink_stand',
    name: 'Drink Stand',
    emoji: '🥤',
    description: 'Refreshing beverages',
    category: 'food',
    costs: [{ statId: 'money', amount: 60 }],
    effects: [
      { statId: 'money', perDay: -2 },
      { statId: 'food', perDay: 8 },
      { statId: 'comfort', perDay: 3 },
    ],
    requirements: [],
  }

  // === FACILITIES ===
  static readonly RESTROOM: BuildingDef = {
    id: 'restroom',
    name: 'Restroom',
    emoji: '🚻',
    description: 'Essential for guest comfort',
    category: 'facilities',
    costs: [{ statId: 'money', amount: 60 }],
    effects: [
      { statId: 'money', perDay: -2 },
      { statId: 'comfort', perDay: 25 },
    ],
    requirements: [],
  }

  static readonly FIRST_AID: BuildingDef = {
    id: 'first_aid',
    name: 'First Aid',
    emoji: '🏥',
    description: 'Medical care for guests',
    category: 'facilities',
    costs: [{ statId: 'money', amount: 100 }],
    effects: [
      { statId: 'money', perDay: -4 },
      { statId: 'comfort', perDay: 15 },
      { statId: 'satisfaction', perDay: 3 },
    ],
    requirements: [{ type: 'stat', statId: 'guests', min: 50 }],
  }

  static readonly INFO_BOOTH: BuildingDef = {
    id: 'info_booth',
    name: 'Info Booth',
    emoji: '📍',
    description: 'Helps guests navigate',
    category: 'facilities',
    costs: [{ statId: 'money', amount: 40 }],
    effects: [
      { statId: 'money', perDay: -1 },
      { statId: 'satisfaction', perDay: 5 },
    ],
    requirements: [],
  }

  // === DECOR ===
  static readonly TRASH_CAN: BuildingDef = {
    id: 'trash_can',
    name: 'Trash Can',
    emoji: '🗑️',
    description: 'Helps keep the park clean',
    category: 'decor',
    costs: [{ statId: 'money', amount: 20 }],
    effects: [
      { statId: 'cleanliness', perDay: 5 },
    ],
    requirements: [],
  }

  static readonly FOUNTAIN: BuildingDef = {
    id: 'fountain',
    name: 'Fountain',
    emoji: '⛲',
    description: 'A beautiful centerpiece',
    category: 'decor',
    costs: [{ statId: 'money', amount: 150 }],
    effects: [
      { statId: 'money', perDay: -3 },
      { statId: 'appeal', perDay: 5 },
      { statId: 'satisfaction', perDay: 2 },
    ],
    requirements: [{ type: 'day', min: 3 }],
  }

  static readonly GARDEN: BuildingDef = {
    id: 'garden',
    name: 'Garden',
    emoji: '🌷',
    description: 'Pretty flowers and greenery',
    category: 'decor',
    costs: [{ statId: 'money', amount: 80 }],
    effects: [
      { statId: 'money', perDay: -2 },
      { statId: 'appeal', perDay: 3 },
      { statId: 'cleanliness', perDay: 2 },
    ],
    requirements: [],
  }

  static readonly BENCH: BuildingDef = {
    id: 'bench',
    name: 'Bench',
    emoji: '🪑',
    description: 'A place to rest tired feet',
    category: 'decor',
    costs: [{ statId: 'money', amount: 25 }],
    effects: [
      { statId: 'comfort', perDay: 8 },
    ],
    requirements: [],
  }

  static readonly ALL: BuildingDef[] = [
    // Rides
    Building.CAROUSEL,
    Building.FERRIS_WHEEL,
    Building.ROLLER_COASTER,
    Building.BUMPER_CARS,
    // Food
    Building.FOOD_STAND,
    Building.ICE_CREAM,
    Building.PIZZA_PARLOR,
    Building.DRINK_STAND,
    // Facilities
    Building.RESTROOM,
    Building.FIRST_AID,
    Building.INFO_BOOTH,
    // Decor
    Building.TRASH_CAN,
    Building.FOUNTAIN,
    Building.GARDEN,
    Building.BENCH,
  ]

  static readonly CATEGORIES: { id: BuildingCategory; label: string; emoji: string }[] = [
    { id: 'rides', label: 'Rides', emoji: '🎢' },
    { id: 'food', label: 'Food', emoji: '🍔' },
    { id: 'facilities', label: 'Facilities', emoji: '🚻' },
    { id: 'decor', label: 'Decor', emoji: '🌷' },
  ]

  static getById(id: string): BuildingDef | undefined {
    return this.ALL.find(b => b.id === id)
  }

  static getByCategory(category: BuildingCategory): BuildingDef[] {
    return this.ALL.filter(b => b.category === category)
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
