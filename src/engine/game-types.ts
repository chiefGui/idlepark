export type StatId =
  | 'money'
  | 'guests'
  | 'entertainment'
  | 'food'
  | 'comfort'
  | 'cleanliness'
  | 'appeal'
  | 'satisfaction'

export type BuildingCategory = 'rides' | 'food' | 'facilities' | 'decor'

export type Effect = {
  statId: StatId
  perDay: number
  multiplier?: number
}

export type Cost = {
  statId: StatId
  amount: number
}

export type Requirement =
  | { type: 'stat'; statId: StatId; min?: number; max?: number }
  | { type: 'day'; min: number }
  | { type: 'milestone'; id: string }
  | { type: 'perk'; id: string }
  | { type: 'building'; id: string; count?: number }

export type BuildingDef = {
  id: string
  name: string
  emoji: string
  description: string
  category: BuildingCategory
  costs: Cost[]
  effects: Effect[]
  requirements: Requirement[]
}

export type PerkDef = {
  id: string
  name: string
  emoji: string
  description: string
  costs: Cost[]
  effects: Effect[]
  requirements: Requirement[]
}

export type MilestoneDef = {
  id: string
  name: string
  emoji: string
  description: string
  condition: Requirement
  reward: number
}

export type TimelineEntry = {
  milestoneId: string
  day: number
}

export type SlotState = {
  index: number
  buildingId: string | null
  locked: boolean
}

export type GameState = {
  stats: Record<StatId, number>
  slots: SlotState[]
  ownedPerks: string[]
  timeline: TimelineEntry[]
  currentDay: number
  lastTickTime: number
  consecutiveNegativeDays: number
  gameOver: boolean
  ticketPrice: number
}

export class GameTypes {
  static readonly STAT_IDS: StatId[] = [
    'money',
    'guests',
    'entertainment',
    'food',
    'comfort',
    'cleanliness',
    'appeal',
    'satisfaction',
  ]

  static readonly TOTAL_SLOTS = 8
  static readonly INITIAL_UNLOCKED_SLOTS = 3
  static readonly DAY_LENGTH_MS = 30000
  static readonly BANKRUPTCY_THRESHOLD_DAYS = 7
  static readonly STARTING_MONEY = 500
  static readonly DEFAULT_TICKET_PRICE = 10
  static readonly MIN_TICKET_PRICE = 5
  static readonly MAX_TICKET_PRICE = 25
  static readonly SLOT_UNLOCK_COSTS = [0, 0, 0, 100, 150, 200, 300, 500]

  static createInitialStats(): Record<StatId, number> {
    return {
      money: this.STARTING_MONEY,
      guests: 0,
      entertainment: 0,
      food: 0,
      comfort: 0,
      cleanliness: 100,
      appeal: 0,
      satisfaction: 100,
    }
  }

  static createInitialSlots(): SlotState[] {
    return Array.from({ length: this.TOTAL_SLOTS }, (_, i) => ({
      index: i,
      buildingId: null,
      locked: i >= this.INITIAL_UNLOCKED_SLOTS,
    }))
  }

  static createInitialState(): GameState {
    return {
      stats: this.createInitialStats(),
      slots: this.createInitialSlots(),
      ownedPerks: [],
      timeline: [],
      currentDay: 1,
      lastTickTime: Date.now(),
      consecutiveNegativeDays: 0,
      gameOver: false as boolean,
      ticketPrice: this.DEFAULT_TICKET_PRICE,
    }
  }
}
