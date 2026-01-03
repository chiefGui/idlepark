/**
 * Guest Simulation Types
 *
 * High-performance individual guest simulation using TypedArrays.
 * Designed to handle 50k+ guests at 60 FPS.
 */

import type { GuestBreakdown, GuestTypeMix, SlotState, BuildingDef } from '../../engine/game-types'

// ============================================================================
// Guest State Constants (fit in Uint8)
// ============================================================================

export const GUEST_STATE = {
  INACTIVE: 0,   // Slot is empty/available
  ARRIVING: 1,   // Just entered park, picking first destination
  WALKING: 2,    // Moving between buildings
  VISITING: 3,   // Currently at a building
  LEAVING: 4,    // Exiting the park
} as const

export type GuestState = (typeof GUEST_STATE)[keyof typeof GUEST_STATE]

// ============================================================================
// Guest Mood Constants (fit in Uint8)
// ============================================================================

export const GUEST_MOOD = {
  UNHAPPY: 0,
  NEUTRAL: 1,
  HAPPY: 2,
} as const

export type GuestMoodId = (typeof GUEST_MOOD)[keyof typeof GUEST_MOOD]

// ============================================================================
// Guest Type IDs (maps to existing GuestType, fits in Uint8)
// ============================================================================

export const GUEST_TYPE_ID = {
  THRILLS: 0,
  FAMILY: 1,
  RELAXATION: 2,
  SOCIAL: 3,
} as const

export type GuestTypeId = (typeof GUEST_TYPE_ID)[keyof typeof GUEST_TYPE_ID]

// ============================================================================
// Guest Pool - Core Data Structure
// ============================================================================

/**
 * GuestPool uses Struct of Arrays (SoA) pattern with TypedArrays
 * for maximum performance. Each array index represents one guest.
 *
 * Memory layout (per guest):
 * - state:     1 byte (Uint8)
 * - location:  1 byte (Int8)
 * - mood:      1 byte (Uint8)
 * - guestType: 1 byte (Uint8)
 * - timer:     4 bytes (Float32)
 * - spent:     4 bytes (Float32)
 * Total: 12 bytes per guest = 600KB for 50k guests
 */
export type GuestPool = {
  /** Maximum number of guests this pool can hold */
  capacity: number

  /** Number of currently active guests */
  count: number

  // === Parallel Arrays (Struct of Arrays pattern) ===

  /** Guest state: INACTIVE, ARRIVING, WALKING, VISITING, LEAVING */
  state: Uint8Array

  /** Current location: -1 = not at building, 0-23 = slot index */
  location: Int8Array

  /** Guest mood: UNHAPPY, NEUTRAL, HAPPY */
  mood: Uint8Array

  /** Guest type preference: THRILLS, FAMILY, RELAXATION, SOCIAL */
  guestType: Uint8Array

  /** Time remaining in current state (in days) */
  timer: Float32Array

  /** Total money spent during visit */
  spent: Float32Array

  // === Free List for O(1) Add/Remove ===

  /** Stack of free indices for reuse */
  freeList: Uint16Array

  /** Number of free slots available */
  freeCount: number
}

// ============================================================================
// Simulation State
// ============================================================================

/**
 * Complete simulation state including guest pool and derived data.
 */
export type SimulationState = {
  /** The guest pool containing all individual guests */
  pool: GuestPool

  // === Per-Building Visitor Tracking ===

  /** Total visitors at each building slot (index = slot index) */
  buildingVisitors: Int16Array

  /** Visitors by mood at each building */
  buildingVisitorsByMood: {
    happy: Int16Array
    neutral: Int16Array
    unhappy: Int16Array
  }

  // === Building Attraction Weights ===

  /** Attraction weight per building (recalculated when buildings change) */
  attractionWeights: Float32Array

  /** Flag indicating weights need recalculation */
  attractionWeightsDirty: boolean

  // === Building Metadata Cache ===

  /** Cached building capacities per slot */
  buildingCaps: Int16Array

  /** Cached building income per guest (for shops) */
  buildingIncomePerGuest: Float32Array

  /** Cached building is-shop flags */
  buildingIsShop: Uint8Array
}

// ============================================================================
// Simulation Configuration
// ============================================================================

/**
 * Configuration for simulation timing and behavior.
 * All durations are in days (1 day = 30 seconds real-time).
 */
export type SimulationConfig = {
  // === Timing (in days) ===

  /** Delay before new guest picks first building */
  arrivalDelay: number

  /** Time to walk between buildings */
  walkingDuration: number

  /** Minimum time spent at a building */
  minVisitDuration: number

  /** Maximum time spent at a building */
  maxVisitDuration: number

  /** Time to walk out when leaving */
  leavingDuration: number

  // === Behavior Probabilities ===

  /** Probability an unhappy guest decides to leave after visiting */
  leaveChanceWhenUnhappy: number

  /** Probability a neutral guest decides to leave after visiting */
  leaveChanceWhenNeutral: number

  /** Probability a happy guest decides to leave after visiting */
  leaveChanceWhenHappy: number

  /** Rate at which mood changes toward target (per day) */
  moodTransitionRate: number

  // === Capacity ===

  /** Maximum buildings a guest will visit before leaving */
  maxVisitsBeforeLeaving: number
}

// ============================================================================
// Simulation Tick Result
// ============================================================================

/**
 * Result of a simulation tick, used by bridge layer.
 */
export type SimulationTickResult = {
  /** Aggregated guest breakdown (for compatibility with current system) */
  guestBreakdown: GuestBreakdown

  /** Total visitors at each building */
  buildingVisitors: Int16Array

  /** Departure counts for events */
  departures: {
    natural: number   // Happy/neutral guests leaving satisfied
    unhappy: number   // Guests leaving due to unhappiness
  }

  /** Total shop revenue from actual visitors */
  shopRevenue: number
}

// ============================================================================
// Building Context (passed to simulation each tick)
// ============================================================================

/**
 * Context about buildings passed to simulation each tick.
 */
export type BuildingContext = {
  /** Current slot states */
  slots: SlotState[]

  /** Map of building ID to definition */
  buildingDefs: Map<string, BuildingDef>

  /** Current guest type distribution */
  guestTypeMix: GuestTypeMix

  /** Current park appeal (affects mood) */
  appeal: number
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Batch arrival request.
 */
export type BatchArrival = {
  count: number
  guestTypes: Uint8Array
}

/**
 * Building info for selection algorithm.
 */
export type BuildingInfo = {
  slotIndex: number
  buildingId: string
  capacity: number
  currentVisitors: number
  attractionWeight: number
  audience: Record<string, number>
}
