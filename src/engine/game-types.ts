export type StatId =
  | 'money'
  | 'guests'
  | 'entertainment'
  | 'food'
  | 'comfort'
  | 'cleanliness'
  | 'appeal'
  | 'satisfaction'

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
  achievedMilestones: string[]
  currentDay: number
  lastTickTime: number
  consecutiveNegativeDays: number
  gameOver: boolean
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

  static createInitialStats(): Record<StatId, number> {
    return {
      money: this.STARTING_MONEY,
      guests: 0,
      entertainment: 0,
      food: 0,
      comfort: 0,
      cleanliness: 100,
      appeal: 50,
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
      achievedMilestones: [],
      currentDay: 1,
      lastTickTime: Date.now(),
      consecutiveNegativeDays: 0,
      gameOver: false as boolean,
    }
  }
}
