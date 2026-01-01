import type { BuildingDef, BuildingCategory, Cost, GameState, StatId } from '../engine/game-types'
import { Requirements } from '../engine/requirements'
import type { Modifier } from '../engine/modifiers'

export type LodgingBuildingDef = BuildingDef & {
  capacityBonus: number
  lodgingTier: 1 | 2 | 3
}

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
    costs: [{ statId: 'money', amount: 350 }],
    effects: [
      { statId: 'money', perDay: -12 },
      { statId: 'entertainment', perDay: 45 },
      { statId: 'appeal', perDay: 4 },
    ],
    requirements: [],
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
    requirements: [],
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
    requirements: [],
  }

  // === INTENSE RIDES ===
  static readonly DROP_TOWER: BuildingDef = {
    id: 'drop_tower',
    name: 'Drop Tower',
    emoji: '🗼',
    description: 'The ground rushes up to meet you',
    category: 'rides',
    costs: [{ statId: 'money', amount: 3000 }],
    effects: [
      { statId: 'money', perDay: -25 },
      { statId: 'entertainment', perDay: 100 },
      { statId: 'comfort', perDay: -5 },
      { statId: 'appeal', perDay: 5 },
    ],
    requirements: [{ type: 'perk', id: 'thrill_seekers' }],
  }

  static readonly PENDULUM_FURY: BuildingDef = {
    id: 'pendulum_fury',
    name: 'Pendulum Fury',
    emoji: '🎡',
    description: 'Swing to the edge of the sky',
    category: 'rides',
    costs: [{ statId: 'money', amount: 2500 }],
    effects: [
      { statId: 'money', perDay: -20 },
      { statId: 'entertainment', perDay: 75 },
      { statId: 'comfort', perDay: -8 },
    ],
    requirements: [{ type: 'perk', id: 'thrill_seekers' }],
  }

  static readonly RAPIDS_RUN: BuildingDef = {
    id: 'rapids_run',
    name: 'Rapids Run',
    emoji: '🌊',
    description: 'Hold on tight—you WILL get soaked',
    category: 'rides',
    costs: [{ statId: 'money', amount: 3500 }],
    effects: [
      { statId: 'money', perDay: -30 },
      { statId: 'entertainment', perDay: 90 },
      { statId: 'cleanliness', perDay: 10 },
      { statId: 'comfort', perDay: 5 },
    ],
    requirements: [{ type: 'perk', id: 'thrill_seekers' }],
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
      { statId: 'food', perDay: 15 },
      { statId: 'appeal', perDay: 5 },
    ],
    requirements: [],
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
    requirements: [],
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
      { statId: 'comfort', perDay: 20 },
      { statId: 'appeal', perDay: 3 },
      { statId: 'cleanliness', perDay: 5 },
    ],
    requirements: [],
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
      { statId: 'appeal', perDay: 5 },
    ],
    requirements: [],
  }

  static readonly TRASH_CAN: BuildingDef = {
    id: 'trash_can',
    name: 'Trash Can',
    emoji: '🗑️',
    description: 'Helps keep the park clean',
    category: 'facilities',
    costs: [{ statId: 'money', amount: 20 }],
    effects: [
      { statId: 'money', perDay: -1 },
      { statId: 'cleanliness', perDay: 5 },
    ],
    requirements: [],
  }

  static readonly CLEANING_CART: BuildingDef = {
    id: 'cleaning_cart',
    name: 'Cleaning Cart',
    emoji: '🛒',
    description: 'Mobile supplies for on-the-go tidying',
    category: 'facilities',
    costs: [{ statId: 'money', amount: 120 }],
    effects: [
      { statId: 'money', perDay: -3 },
      { statId: 'cleanliness', perDay: 15 },
    ],
    requirements: [{ type: 'perk', id: 'spotless_park' }],
  }

  static readonly JANITOR_QUARTERS: BuildingDef = {
    id: 'janitor_quarters',
    name: 'Janitor Quarters',
    emoji: '🏠',
    description: 'Home base for your dedicated cleaning crew',
    category: 'facilities',
    costs: [{ statId: 'money', amount: 350 }],
    effects: [
      { statId: 'money', perDay: -8 },
      { statId: 'cleanliness', perDay: 30 },
      { statId: 'comfort', perDay: 5 },
    ],
    requirements: [{ type: 'perk', id: 'spotless_park' }],
  }

  static readonly RECYCLING_CENTER: BuildingDef = {
    id: 'recycling_center',
    name: 'Recycling Center',
    emoji: '♻️',
    description: 'Eco-friendly waste management that guests love',
    category: 'facilities',
    costs: [{ statId: 'money', amount: 800 }],
    effects: [
      { statId: 'money', perDay: -15 },
      { statId: 'cleanliness', perDay: 50 },
      { statId: 'appeal', perDay: 8 },
    ],
    requirements: [{ type: 'perk', id: 'spotless_park' }],
  }

  // === DECOR ===
  static readonly FOUNTAIN: BuildingDef = {
    id: 'fountain',
    name: 'Fountain',
    emoji: '⛲',
    description: 'A beautiful centerpiece',
    category: 'decor',
    costs: [{ statId: 'money', amount: 150 }],
    effects: [
      { statId: 'money', perDay: -3 },
      { statId: 'beauty', perDay: 10 },
    ],
    requirements: [],
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
      { statId: 'beauty', perDay: 5 },
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
      { statId: 'money', perDay: -1 },
      { statId: 'beauty', perDay: 2 },
      { statId: 'comfort', perDay: 8 },
    ],
    requirements: [],
  }

  // === LODGING ===
  // Tier 1 - Basic (unlocked by Lodging I)
  static readonly CAMPGROUND: LodgingBuildingDef = {
    id: 'campground',
    name: 'Campground',
    emoji: '🏕️',
    description: 'Rustic tent sites under the stars',
    category: 'lodging',
    costs: [{ statId: 'money', amount: 1000 }],
    effects: [
      { statId: 'money', perDay: -5 },
      { statId: 'comfort', perDay: 5 },
    ],
    requirements: [{ type: 'perk', id: 'lodging_1' }],
    capacityBonus: 50,
    lodgingTier: 1,
  }

  static readonly STARLIGHT_MOTEL: LodgingBuildingDef = {
    id: 'starlight_motel',
    name: 'Starlight Motel',
    emoji: '🌙',
    description: 'Cozy roadside rooms with retro charm',
    category: 'lodging',
    costs: [{ statId: 'money', amount: 2000 }],
    effects: [
      { statId: 'money', perDay: -10 },
      { statId: 'entertainment', perDay: 8 },
    ],
    requirements: [{ type: 'perk', id: 'lodging_1' }],
    capacityBonus: 75,
    lodgingTier: 1,
  }

  // Tier 2 - Comfortable (unlocked by Lodging II)
  static readonly PINEWOOD_CABINS: LodgingBuildingDef = {
    id: 'pinewood_cabins',
    name: 'Pinewood Cabins',
    emoji: '🪵',
    description: 'Charming woodland retreats',
    category: 'lodging',
    costs: [{ statId: 'money', amount: 5000 }],
    effects: [
      { statId: 'money', perDay: -20 },
      { statId: 'beauty', perDay: 3 },
      { statId: 'comfort', perDay: 10 },
    ],
    requirements: [{ type: 'perk', id: 'lodging_2' }],
    capacityBonus: 100,
    lodgingTier: 2,
  }

  static readonly PARKVIEW_INN: LodgingBuildingDef = {
    id: 'parkview_inn',
    name: 'Parkview Inn',
    emoji: '🏨',
    description: 'Comfortable family hotel with on-site dining',
    category: 'lodging',
    costs: [{ statId: 'money', amount: 8000 }],
    effects: [
      { statId: 'money', perDay: -30 },
      { statId: 'beauty', perDay: 2 },
      { statId: 'food', perDay: 12 },
    ],
    requirements: [{ type: 'perk', id: 'lodging_2' }],
    capacityBonus: 150,
    lodgingTier: 2,
  }

  // Tier 3 - Premium (unlocked by Lodging III)
  static readonly LAKESIDE_RESORT: LodgingBuildingDef = {
    id: 'lakeside_resort',
    name: 'Lakeside Resort',
    emoji: '🏖️',
    description: 'Luxurious waterfront with activities',
    category: 'lodging',
    costs: [{ statId: 'money', amount: 20000 }],
    effects: [
      { statId: 'money', perDay: -60 },
      { statId: 'beauty', perDay: 8 },
      { statId: 'entertainment', perDay: 20 },
    ],
    requirements: [{ type: 'perk', id: 'lodging_3' }],
    capacityBonus: 250,
    lodgingTier: 3,
  }

  static readonly CLOUD_NINE_SUITES: LodgingBuildingDef = {
    id: 'cloud_nine_suites',
    name: 'Cloud Nine Suites',
    emoji: '☁️',
    description: 'Ultra-premium spa and luxury amenities',
    category: 'lodging',
    costs: [{ statId: 'money', amount: 30000 }],
    effects: [
      { statId: 'money', perDay: -80 },
      { statId: 'beauty', perDay: 15 },
      { statId: 'comfort', perDay: 25 },
    ],
    requirements: [{ type: 'perk', id: 'lodging_3' }],
    capacityBonus: 200,
    lodgingTier: 3,
  }

  static readonly LODGING_BUILDINGS: LodgingBuildingDef[] = [
    Building.CAMPGROUND,
    Building.STARLIGHT_MOTEL,
    Building.PINEWOOD_CABINS,
    Building.PARKVIEW_INN,
    Building.LAKESIDE_RESORT,
    Building.CLOUD_NINE_SUITES,
  ]

  static readonly ALL: BuildingDef[] = [
    // Rides
    Building.CAROUSEL,
    Building.FERRIS_WHEEL,
    Building.ROLLER_COASTER,
    Building.BUMPER_CARS,
    // Intense Rides
    Building.DROP_TOWER,
    Building.PENDULUM_FURY,
    Building.RAPIDS_RUN,
    // Food
    Building.FOOD_STAND,
    Building.ICE_CREAM,
    Building.PIZZA_PARLOR,
    Building.DRINK_STAND,
    // Facilities
    Building.RESTROOM,
    Building.FIRST_AID,
    Building.INFO_BOOTH,
    Building.TRASH_CAN,
    Building.CLEANING_CART,
    Building.JANITOR_QUARTERS,
    Building.RECYCLING_CENTER,
    // Decor
    Building.FOUNTAIN,
    Building.GARDEN,
    Building.BENCH,
    // Lodging
    Building.CAMPGROUND,
    Building.STARLIGHT_MOTEL,
    Building.PINEWOOD_CABINS,
    Building.PARKVIEW_INN,
    Building.LAKESIDE_RESORT,
    Building.CLOUD_NINE_SUITES,
  ]

  static readonly CATEGORIES: { id: BuildingCategory; label: string; emoji: string; hint: string }[] = [
    { id: 'rides', label: 'Rides', emoji: '🎢', hint: 'Fun' },
    { id: 'food', label: 'Food', emoji: '🍔', hint: 'Food & comfort' },
    { id: 'facilities', label: 'Facilities', emoji: '🚻', hint: 'Comfort & cleanliness' },
    { id: 'decor', label: 'Decor', emoji: '🌷', hint: 'Beauty & comfort' },
    { id: 'lodging', label: 'Lodging', emoji: '🏨', hint: 'Guest capacity' },
  ]

  static getById(id: string): BuildingDef | undefined {
    return this.ALL.find(b => b.id === id)
  }

  static getByCategory(category: BuildingCategory): BuildingDef[] {
    return this.ALL
      .filter(b => b.category === category)
      .sort((a, b) => (a.costs[0]?.amount ?? 0) - (b.costs[0]?.amount ?? 0))
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

  static getUpkeep(building: BuildingDef): number {
    const effect = building.effects.find(e => e.statId === 'money' && e.perDay < 0)
    return Math.abs(effect?.perDay ?? 0)
  }

  static getValue(building: BuildingDef): number {
    return building.effects.reduce((sum, e) => {
      if (['entertainment', 'food', 'comfort'].includes(e.statId)) {
        return sum + e.perDay
      }
      return sum
    }, 0)
  }

  static getModifiers(buildingId: string, slotIndex: number): Modifier[] {
    const building = this.getById(buildingId)
    if (!building) return []

    const source = { type: 'building' as const, slotIndex, buildingId }

    return building.effects.map((effect) => ({
      source,
      stat: effect.statId,
      flat: effect.perDay,
      increased: effect.multiplier ? (effect.multiplier - 1) * 100 : undefined,
      label: building.name,
      emoji: building.emoji,
    }))
  }

  static isLodging(building: BuildingDef): building is LodgingBuildingDef {
    return building.category === 'lodging'
  }

  static getCapacityBonus(buildingId: string): number {
    const building = this.LODGING_BUILDINGS.find(b => b.id === buildingId)
    return building?.capacityBonus ?? 0
  }

  static getTotalCapacityBonus(state: GameState): number {
    let total = 0
    for (const slot of state.slots) {
      if (slot.buildingId) {
        total += this.getCapacityBonus(slot.buildingId)
      }
    }
    return total
  }

  /**
   * Get all displayable effects for a building.
   * Includes stat effects + capacity bonus for lodging.
   * Returns unified format: { statId, value, isPositive }
   */
  static getDisplayEffects(building: BuildingDef): DisplayEffect[] {
    const effects: DisplayEffect[] = building.effects.map(e => ({
      statId: e.statId,
      value: e.perDay,
      isPositive: e.perDay >= 0,
    }))

    // Add capacity bonus for lodging buildings
    if (this.isLodging(building)) {
      effects.push({
        statId: 'capacity',
        value: building.capacityBonus,
        isPositive: true,
      })
    }

    return effects
  }

  /**
   * Count unique ride types in the park.
   * Returns { uniqueRides: number, totalRides: number }
   */
  static getRideStats(state: GameState): { uniqueRides: number; totalRides: number } {
    const rideIds = new Set<string>()
    let totalRides = 0

    for (const slot of state.slots) {
      if (slot.buildingId) {
        const building = this.getById(slot.buildingId)
        if (building?.category === 'rides') {
          rideIds.add(slot.buildingId)
          totalRides++
        }
      }
    }

    return { uniqueRides: rideIds.size, totalRides }
  }

  /**
   * Calculate variety multiplier for entertainment.
   * More unique rides = higher multiplier.
   * 1 ride = 1.0x, 2 rides = 1.15x, 3 rides = 1.25x, 4 rides = 1.35x
   */
  static getVarietyMultiplier(state: GameState): number {
    const { uniqueRides } = this.getRideStats(state)
    if (uniqueRides <= 1) return 1.0
    // Diminishing returns: each additional unique ride adds less
    // 2 = 1.15, 3 = 1.25, 4 = 1.35, 5 = 1.43, etc.
    return 1 + (Math.log2(uniqueRides) * 0.2)
  }
}

export type DisplayEffect = {
  statId: StatId | 'capacity'
  value: number
  isPositive: boolean
}
