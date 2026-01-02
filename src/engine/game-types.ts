export type StatId =
  | 'money'
  | 'guests'
  | 'entertainment'
  | 'food'
  | 'comfort'
  | 'cleanliness'
  | 'beauty'
  | 'appeal'

export type Season = 'spring' | 'summer' | 'fall' | 'winter'

// === GUEST TYPES ===
export type GuestType = 'thrills' | 'family' | 'relaxation' | 'social'

export const GUEST_TYPES = ['thrills', 'family', 'relaxation', 'social'] as const

export const GUEST_TYPE_META: Record<GuestType, { name: string; emoji: string; color: string }> = {
  thrills: { name: 'Thrill Seekers', emoji: '🎢', color: '#ef4444' },
  family: { name: 'Families', emoji: '👨‍👩‍👧', color: '#3b82f6' },
  relaxation: { name: 'Relaxers', emoji: '🌿', color: '#22c55e' },
  social: { name: 'Social', emoji: '📸', color: '#a855f7' },
}

export type GuestTypeMix = Record<GuestType, number>

export type Audience = Partial<Record<GuestType, number>>

export type BuildingCategory = 'rides' | 'food' | 'facilities' | 'decor' | 'lodging' | 'shops'

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
  audience?: Audience
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

export type MilestoneTimelineEntry = {
  type: 'milestone'
  milestoneId: string
  day: number
}

export type TimelineEntry = MilestoneTimelineEntry | HappeningTimelineEntry

export type FeedEventType =
  | 'building_built'
  | 'building_demolished'
  | 'milestone_achieved'
  | 'perk_purchased'
  | 'guest_threshold'
  | 'guest_departed'          // Unhappy guests leaving due to dissatisfaction
  | 'guest_departed_natural'  // Satisfied guests going home after their visit
  | 'appeal_high'
  | 'appeal_low'
  | 'price_complaint'
  | 'price_praise'
  | 'financial_success'
  | 'financial_warning'
  | 'ambient'
  | 'happening_started'
  | 'happening_ended'
  | 'capacity_reached'
  | 'capacity_warning'
  | 'wish'
  | 'wish_fulfilled'

// === HAPPENINGS ===

export type HappeningType = 'positive' | 'negative'

/** Stat modifier effect - modifies a game stat */
export type StatEffect = {
  type: 'stat'
  stat: StatId
  flat?: number
  increased?: number
  more?: number
}

/** Building cost modifier - affects cost to build */
export type BuildingCostEffect = {
  type: 'buildingCost'
  category?: BuildingCategory  // If omitted, applies to all
  multiplier: number           // 0.75 = 25% discount, 1.25 = 25% more expensive
}

/** Arrival rate modifier - affects guest arrival */
export type ArrivalEffect = {
  type: 'arrival'
  multiplier: number  // 1.5 = +50% arrivals
}

/** Ticket income modifier - affects money from tickets */
export type TicketIncomeEffect = {
  type: 'ticketIncome'
  multiplier: number  // 1.2 = +20% ticket income
}

/** Union of all happening effects */
export type HappeningEffect = StatEffect | BuildingCostEffect | ArrivalEffect | TicketIncomeEffect

export type HappeningDef = {
  id: string
  name: string
  emoji: string
  description: string
  type: HappeningType
  season?: Season | Season[]  // If set, only occurs in these seasons
  effects: HappeningEffect[]
}

export type HappeningState = {
  happeningId: string
  startDay: number
  endDay: number
} | null

export type HappeningTimelineEntry = {
  type: 'happening_started' | 'happening_ended'
  happeningId: string
  day: number
}

export type FeedEntry = {
  id: string
  type: FeedEventType
  handle: string
  avatarSeed: string
  message: string
  day: number
  timestamp: number
  likes: number
  retweets: number
  replies: number
  /** For wish entries, the building they're wishing for */
  wishBuildingId?: string
}

// === WISHES ===

export type WishState = {
  buildingId: string
  createdDay: number
  expiresDay: number
  feedEntryId: string  // Reference to the feed entry
}

export type WishBoostState = {
  type: 'arrivals' | 'income' | 'appeal'
  multiplier: number
  expiresDay: number
} | null

export type SlotState = {
  index: number
  buildingId: string | null
  locked: boolean
}

export type DailyRecord = {
  day: number
  moneyEarned: number
  peakGuests: number
  peakAppeal: number
}

export type FinancialStats = {
  totalInvested: number      // Sum of all building/perk costs
  totalEarned: number        // Cumulative income from guests
  totalUpkeepPaid: number    // Cumulative upkeep costs
  totalBorrowed: number      // Total loan amounts received
  totalLoanRepaid: number    // Total loan payments made (principal + interest)
  peakMoney: number          // Highest money ever reached
  peakGuests: number         // Most guests ever
}

export type GuestMood = 'happy' | 'neutral' | 'unhappy'

export type GuestBreakdown = {
  happy: number
  neutral: number
  unhappy: number
}

// === SERVICES ===

export type ServiceId = 'fast_pass'

export type FastPassTier = 'budget' | 'standard' | 'premium' | 'vip'

export type ServiceState = {
  serviceId: ServiceId
}

// === MARKETING ===

export type MarketingCampaignId = 'flyers' | 'social' | 'tv'

export type MarketingState = {
  activeCampaign: {
    campaignId: MarketingCampaignId
    startDay: number
    endDay: number
  } | null
  lastCampaignEndDay: number // For cooldown tracking
}

// === BANK ===

export type BankLoanPackageId = 'starter' | 'small' | 'medium' | 'large' | 'major' | 'mega'

export type BankLoanState = {
  packageId: BankLoanPackageId
  remainingAmount: number  // Total amount still owed
  dailyPayment: number     // Daily repayment amount
  startDay: number         // When loan was taken
} | null

export type GameState = {
  stats: Record<StatId, number>
  slots: SlotState[]
  ownedPerks: string[]
  services: ServiceState[]
  marketing: MarketingState
  timeline: TimelineEntry[]
  dailyRecords: DailyRecord[]
  financials: FinancialStats
  guestBreakdown: GuestBreakdown
  guestTypeMix: GuestTypeMix
  feedEntries: FeedEntry[]
  unreadFeedCount: number
  currentDay: number
  lastTickTime: number
  consecutiveNegativeDays: number
  gameOver: boolean
  ticketPrice: number
  fastPassTier: FastPassTier
  // Bank
  bankLoan: BankLoanState
  lastLoanRepaidDay: number  // For 90-day cooldown
  // Happenings
  currentHappening: HappeningState
  nextHappeningDay: number
  lastHappeningType: HappeningType | null
  // Wishes
  wishes: WishState[]
  wishBoost: WishBoostState
  lastWishDay: number
}

export class GameTypes {
  static readonly STAT_IDS: StatId[] = [
    'money',
    'guests',
    'entertainment',
    'food',
    'comfort',
    'cleanliness',
    'beauty',
    'appeal',
  ]

  static readonly TOTAL_SLOTS = 24
  static readonly INITIAL_UNLOCKED_SLOTS = 4
  static readonly DAY_LENGTH_MS = 30000
  static readonly BANKRUPTCY_THRESHOLD_DAYS = 7
  static readonly STARTING_MONEY = 500
  static readonly DEFAULT_TICKET_PRICE = 10
  static readonly MIN_TICKET_PRICE = 5
  static readonly MAX_TICKET_PRICE = 25
  static readonly MAX_FEED_ENTRIES = 10

  // Guest Capacity
  static readonly INITIAL_GUEST_CAPACITY = 100

  // Happenings
  static readonly FIRST_HAPPENING_DAY = 15
  static readonly HAPPENING_INTERVAL_MIN = 20
  static readonly HAPPENING_INTERVAL_MAX = 30
  static readonly HAPPENING_DURATION = 5

  // Marketing
  static readonly MARKETING_COOLDOWN_DAYS = 5

  // Bank
  static readonly BANK_COOLDOWN_DAYS = 180

  // Wishes
  static readonly WISH_DURATION_DAYS = 10      // How long a wish stays active
  static readonly WISH_COOLDOWN_DAYS = 5       // Min days between new wishes
  static readonly WISH_BOOST_DURATION = 3      // Boost lasts 3 days
  static readonly WISH_BOOST_MULTIPLIER = 1.25 // +25% boost
  static readonly MAX_ACTIVE_WISHES = 3        // Max wishes at once

  static createInitialStats(): Record<StatId, number> {
    return {
      money: this.STARTING_MONEY,
      guests: 0,
      entertainment: 0,
      food: 0,
      comfort: 0,
      cleanliness: 100,
      beauty: 0,
      appeal: 0,
    }
  }

  static createInitialSlots(): SlotState[] {
    return Array.from({ length: this.TOTAL_SLOTS }, (_, i) => ({
      index: i,
      buildingId: null,
      locked: i >= this.INITIAL_UNLOCKED_SLOTS,
    }))
  }

  static createInitialFinancials(): FinancialStats {
    return {
      totalInvested: 0,
      totalEarned: 0,
      totalUpkeepPaid: 0,
      totalBorrowed: 0,
      totalLoanRepaid: 0,
      peakMoney: this.STARTING_MONEY,
      peakGuests: 0,
    }
  }

  static createInitialGuestBreakdown(): GuestBreakdown {
    return { happy: 0, neutral: 0, unhappy: 0 }
  }

  static createInitialGuestTypeMix(): GuestTypeMix {
    return { thrills: 25, family: 25, relaxation: 25, social: 25 }
  }

  static getTotalGuests(breakdown: GuestBreakdown): number {
    return breakdown.happy + breakdown.neutral + breakdown.unhappy
  }

  static createInitialMarketing(): MarketingState {
    return {
      activeCampaign: null,
      lastCampaignEndDay: 0,
    }
  }

  static createInitialState(): GameState {
    return {
      stats: this.createInitialStats(),
      slots: this.createInitialSlots(),
      ownedPerks: [],
      services: [],
      marketing: this.createInitialMarketing(),
      timeline: [],
      dailyRecords: [],
      financials: this.createInitialFinancials(),
      guestBreakdown: this.createInitialGuestBreakdown(),
      guestTypeMix: this.createInitialGuestTypeMix(),
      feedEntries: [],
      unreadFeedCount: 0,
      currentDay: 1,
      lastTickTime: Date.now(),
      consecutiveNegativeDays: 0,
      gameOver: false as boolean,
      ticketPrice: this.DEFAULT_TICKET_PRICE,
      fastPassTier: 'standard',
      // Bank
      bankLoan: null,
      lastLoanRepaidDay: 0,
      // Happenings
      currentHappening: null,
      nextHappeningDay: this.FIRST_HAPPENING_DAY,
      lastHappeningType: null,
      // Wishes
      wishes: [],
      wishBoost: null,
      lastWishDay: 0,
    }
  }
}
