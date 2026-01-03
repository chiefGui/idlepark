/**
 * Guest Simulation Constants
 *
 * Configuration values for the individual guest simulation.
 * Tuned for realistic park behavior while maintaining performance.
 */

import type { SimulationConfig } from './types'
import { GameTypes } from '../../engine/game-types'

// ============================================================================
// Pool Capacity
// ============================================================================

/**
 * Maximum guests the simulation can handle.
 * 60k guests × 12 bytes = 720KB - well within budget.
 */
export const GUEST_POOL_CAPACITY = 60000

/**
 * Number of building slots (matches GameTypes.TOTAL_SLOTS).
 */
export const TOTAL_SLOTS = GameTypes.TOTAL_SLOTS

// ============================================================================
// Time-Slicing Configuration
// ============================================================================

/**
 * Number of guests to process per frame when time-slicing.
 * At 60 FPS, 6000 guests/frame = full 60k processed in 10 frames (166ms).
 */
export const BATCH_SIZE = 6000

// ============================================================================
// Default Simulation Configuration
// ============================================================================

/**
 * Default configuration values.
 *
 * Timing notes (1 day = 30 seconds real-time):
 * - arrivalDelay: 0.033 days = ~1 second to pick first destination
 * - walkingDuration: 0.02 days = ~0.6 seconds between buildings
 * - visitDuration: 0.05-0.15 days = ~1.5-4.5 seconds at each building
 * - leavingDuration: 0.033 days = ~1 second to exit
 */
export const DEFAULT_CONFIG: SimulationConfig = {
  // Timing (in days)
  arrivalDelay: 0.033,
  walkingDuration: 0.02,
  minVisitDuration: 0.05,
  maxVisitDuration: 0.15,
  leavingDuration: 0.033,

  // Behavior probabilities
  leaveChanceWhenUnhappy: 0.25,   // 25% chance unhappy guest leaves after each visit
  leaveChanceWhenNeutral: 0.08,  // 8% chance neutral guest leaves (natural turnover)
  leaveChanceWhenHappy: 0.04,    // 4% chance happy guest leaves (they want to stay!)

  // Mood transition rate (matches existing Guest.TRANSITION_RATE)
  moodTransitionRate: 0.15,

  // Visit limit before guaranteed departure
  maxVisitsBeforeLeaving: 20,
}

// ============================================================================
// Mood Thresholds (from existing Guest system)
// ============================================================================

/**
 * Appeal threshold for guests to become happy.
 * Matches Guest.HAPPY_THRESHOLD.
 */
export const HAPPY_THRESHOLD = 60

/**
 * Appeal threshold below which guests become unhappy.
 * Matches Guest.UNHAPPY_THRESHOLD.
 */
export const UNHAPPY_THRESHOLD = 30

// ============================================================================
// Building Selection Constants
// ============================================================================

/**
 * Base attraction weight for buildings without specific audience.
 */
export const BASE_ATTRACTION_WEIGHT = 1.0

/**
 * Multiplier applied to attraction weight when building matches guest type.
 * Higher = stronger preference for matching buildings.
 */
export const GUEST_TYPE_AFFINITY_MULTIPLIER = 2.0

/**
 * Penalty applied to near-capacity buildings.
 * At 100% capacity: weight × 0 (no attraction).
 * At 50% capacity: weight × 0.5 (half attraction).
 */
export const CAPACITY_PENALTY_FACTOR = 1.0

/**
 * Bonus applied to the building the guest just left.
 * Negative = avoid revisiting the same building.
 */
export const SAME_BUILDING_PENALTY = 0.2

/**
 * Minimum attraction weight (prevents division by zero).
 */
export const MIN_ATTRACTION_WEIGHT = 0.01

// ============================================================================
// Shop Income Constants
// ============================================================================

/**
 * Probability a guest makes a purchase when visiting a shop.
 * Applied per shop visit, not per tick.
 */
export const SHOP_PURCHASE_PROBABILITY = 0.7

/**
 * Multiplier applied to purchase amount based on mood.
 */
export const MOOD_SPENDING_MULTIPLIER = {
  happy: 1.3,    // Happy guests spend 30% more
  neutral: 1.0,  // Neutral guests spend normal
  unhappy: 0.5,  // Unhappy guests spend 50% less
} as const

// ============================================================================
// Performance Thresholds
// ============================================================================

/**
 * Guest count above which time-slicing is enabled.
 * Below this, all guests are processed every frame.
 */
export const TIME_SLICING_THRESHOLD = 5000

/**
 * Maximum time (ms) to spend on guest simulation per frame.
 * If exceeded, remaining guests are deferred to next frame.
 */
export const MAX_TICK_MS = 8
