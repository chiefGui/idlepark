/**
 * Guest Simulation - Core Simulation Logic
 *
 * High-performance individual guest simulation.
 * Processes guest state machines and generates aggregated results.
 */

import type { SlotState, GuestTypeMix } from '../../engine/game-types'
import type {
  GuestPool,
  SimulationState,
  SimulationConfig,
  SimulationTickResult,
  BuildingContext,
  GuestTypeId,
} from './types'
import { GUEST_STATE, GUEST_MOOD } from './types'
import {
  GUEST_POOL_CAPACITY,
  TOTAL_SLOTS,
  DEFAULT_CONFIG,
  HAPPY_THRESHOLD,
  UNHAPPY_THRESHOLD,
  BATCH_SIZE,
  TIME_SLICING_THRESHOLD,
  SHOP_PURCHASE_PROBABILITY,
  MOOD_SPENDING_MULTIPLIER,
} from './constants'
import { createPool, removeGuest, getGuestsByMood } from './pool'
import {
  selectBuildingFast,
  extractBuildingCaps,
  extractShopIncomePerGuest,
  extractIsShopFlags,
  calculateAttractionWeights,
} from './building-selector'

// ============================================================================
// Simulation State Creation
// ============================================================================

/**
 * Create a new simulation state.
 *
 * @param capacity - Maximum guest capacity (default: 60000)
 * @param config - Optional configuration overrides
 * @returns Initialized simulation state
 */
export function createSimulation(
  capacity: number = GUEST_POOL_CAPACITY,
  config: Partial<SimulationConfig> = {}
): SimulationState {
  const pool = createPool(capacity)

  return {
    pool,

    // Per-building tracking
    buildingVisitors: new Int16Array(TOTAL_SLOTS),
    buildingVisitorsByMood: {
      happy: new Int16Array(TOTAL_SLOTS),
      neutral: new Int16Array(TOTAL_SLOTS),
      unhappy: new Int16Array(TOTAL_SLOTS),
    },

    // Attraction weights
    attractionWeights: new Float32Array(TOTAL_SLOTS),
    attractionWeightsDirty: true,

    // Building metadata cache
    buildingCaps: new Int16Array(TOTAL_SLOTS),
    buildingIncomePerGuest: new Float32Array(TOTAL_SLOTS),
    buildingIsShop: new Uint8Array(TOTAL_SLOTS),
  }
}

/**
 * Mark building metadata as needing refresh.
 * Call this when buildings are added/removed.
 */
export function markBuildingsDirty(sim: SimulationState): void {
  sim.attractionWeightsDirty = true
}

/**
 * Update cached building metadata.
 */
export function updateBuildingCache(sim: SimulationState, slots: SlotState[]): void {
  sim.buildingCaps = extractBuildingCaps(slots)
  sim.buildingIncomePerGuest = extractShopIncomePerGuest(slots)
  sim.buildingIsShop = extractIsShopFlags(slots)
}

// ============================================================================
// Configuration
// ============================================================================

// Merged config (default + overrides)
let activeConfig: SimulationConfig = { ...DEFAULT_CONFIG }

/**
 * Update simulation configuration.
 */
export function setConfig(config: Partial<SimulationConfig>): void {
  activeConfig = { ...DEFAULT_CONFIG, ...config }
}

/**
 * Get current configuration.
 */
export function getConfig(): SimulationConfig {
  return activeConfig
}

// ============================================================================
// Time-Slicing State
// ============================================================================

// Track batch offset for time-slicing
let batchOffset = 0

/**
 * Reset time-slicing state.
 */
export function resetBatchOffset(): void {
  batchOffset = 0
}

// ============================================================================
// Core Tick Function
// ============================================================================

/**
 * Process one simulation tick.
 *
 * @param sim - Simulation state
 * @param deltaDay - Time elapsed (in days)
 * @param context - Building and game context
 * @returns Tick result with aggregated data
 */
export function tickSimulation(
  sim: SimulationState,
  deltaDay: number,
  context: BuildingContext
): SimulationTickResult {
  const { pool } = sim
  const { slots, guestTypeMix, appeal } = context

  // Initialize result
  const result: SimulationTickResult = {
    guestBreakdown: { happy: 0, neutral: 0, unhappy: 0 },
    buildingVisitors: sim.buildingVisitors,
    departures: { natural: 0, unhappy: 0 },
    shopRevenue: 0,
  }

  // Update building cache if dirty
  if (sim.attractionWeightsDirty) {
    updateBuildingCache(sim, slots)
    sim.attractionWeights = calculateAttractionWeights(slots, guestTypeMix)
    sim.attractionWeightsDirty = false
  }

  // Reset building visitor counts
  sim.buildingVisitors.fill(0)
  sim.buildingVisitorsByMood.happy.fill(0)
  sim.buildingVisitorsByMood.neutral.fill(0)
  sim.buildingVisitorsByMood.unhappy.fill(0)

  // Determine tick range (time-slicing for large guest counts)
  const useTimeSlicing = pool.count > TIME_SLICING_THRESHOLD
  const startIdx = useTimeSlicing ? batchOffset : 0
  const endIdx = useTimeSlicing
    ? Math.min(startIdx + BATCH_SIZE, pool.capacity)
    : pool.capacity

  // Process guests
  for (let i = startIdx; i < endIdx; i++) {
    if (pool.state[i] === GUEST_STATE.INACTIVE) continue

    // Decrement timer
    pool.timer[i] -= deltaDay

    // Update mood based on appeal
    updateGuestMood(pool, i, appeal, deltaDay)

    // Process state transitions when timer expires
    if (pool.timer[i] <= 0) {
      processStateTransition(pool, i, sim, slots, guestTypeMix, result)
    }
  }

  // Update batch offset for next tick
  if (useTimeSlicing) {
    batchOffset = endIdx >= pool.capacity ? 0 : endIdx
  }

  // Count all visitors (not just processed batch) for accurate counts
  countBuildingVisitors(sim)

  // Derive guest breakdown from pool
  result.guestBreakdown = getGuestsByMood(pool)

  return result
}

// ============================================================================
// Guest State Machine
// ============================================================================

/**
 * Update guest mood based on current appeal.
 */
function updateGuestMood(
  pool: GuestPool,
  idx: number,
  appeal: number,
  deltaDay: number
): void {
  const currentMood = pool.mood[idx]

  // Determine target mood based on appeal
  let targetMood: number
  if (appeal >= HAPPY_THRESHOLD) {
    targetMood = GUEST_MOOD.HAPPY
  } else if (appeal < UNHAPPY_THRESHOLD) {
    targetMood = GUEST_MOOD.UNHAPPY
  } else {
    targetMood = GUEST_MOOD.NEUTRAL
  }

  // Already at target mood
  if (currentMood === targetMood) return

  // Transition toward target mood (one step at a time)
  const transitionChance = activeConfig.moodTransitionRate * deltaDay
  if (Math.random() < transitionChance) {
    if (targetMood > currentMood) {
      pool.mood[idx] = currentMood + 1
    } else if (targetMood < currentMood) {
      pool.mood[idx] = currentMood - 1
    }
  }
}

/**
 * Process state transition for a guest whose timer has expired.
 */
function processStateTransition(
  pool: GuestPool,
  idx: number,
  sim: SimulationState,
  slots: SlotState[],
  guestTypeMix: GuestTypeMix,
  result: SimulationTickResult
): void {
  const state = pool.state[idx]

  switch (state) {
    case GUEST_STATE.ARRIVING:
      // Pick first building to visit
      transitionToWalking(pool, idx, sim, slots)
      break

    case GUEST_STATE.WALKING:
      // Arrived at building
      transitionToVisiting(pool, idx, sim, result)
      break

    case GUEST_STATE.VISITING:
      // Done visiting - decide next action
      transitionFromVisiting(pool, idx, sim, slots, result)
      break

    case GUEST_STATE.LEAVING:
      // Remove guest
      finalizeLeaving(pool, idx, result)
      break
  }
}

/**
 * Transition guest to walking state (heading to a building).
 */
function transitionToWalking(
  pool: GuestPool,
  idx: number,
  sim: SimulationState,
  slots: SlotState[]
): void {
  const guestType = pool.guestType[idx] as GuestTypeId
  const currentLocation = pool.location[idx]

  // Select next building
  const nextBuilding = selectBuildingFast(
    guestType,
    slots,
    sim.buildingVisitors,
    sim.buildingCaps,
    currentLocation
  )

  if (nextBuilding < 0) {
    // No valid building - guest leaves
    pool.state[idx] = GUEST_STATE.LEAVING
    pool.timer[idx] = activeConfig.leavingDuration
    pool.location[idx] = -1
  } else {
    pool.state[idx] = GUEST_STATE.WALKING
    pool.location[idx] = nextBuilding
    pool.timer[idx] = activeConfig.walkingDuration
  }
}

/**
 * Transition guest to visiting state (at a building).
 */
function transitionToVisiting(
  pool: GuestPool,
  idx: number,
  sim: SimulationState,
  result: SimulationTickResult
): void {
  const location = pool.location[idx]

  // Check if building is now at capacity
  if (location >= 0 && sim.buildingCaps[location] > 0) {
    if (sim.buildingVisitors[location] >= sim.buildingCaps[location]) {
      // Building full - pick another
      pool.timer[idx] = activeConfig.walkingDuration
      return
    }
  }

  // Enter building
  pool.state[idx] = GUEST_STATE.VISITING
  pool.timer[idx] = activeConfig.minVisitDuration +
    Math.random() * (activeConfig.maxVisitDuration - activeConfig.minVisitDuration)

  // Increment visitor count
  if (location >= 0) {
    sim.buildingVisitors[location]++

    // Handle shop purchase
    if (sim.buildingIsShop[location] && Math.random() < SHOP_PURCHASE_PROBABILITY) {
      const mood = pool.mood[idx]
      const moodKey = mood === GUEST_MOOD.HAPPY ? 'happy' :
                      mood === GUEST_MOOD.UNHAPPY ? 'unhappy' : 'neutral'
      const moodMultiplier = MOOD_SPENDING_MULTIPLIER[moodKey]
      const income = sim.buildingIncomePerGuest[location] * moodMultiplier
      result.shopRevenue += income
      pool.spent[idx] += income
    }
  }
}

/**
 * Transition guest from visiting state.
 */
function transitionFromVisiting(
  pool: GuestPool,
  idx: number,
  sim: SimulationState,
  slots: SlotState[],
  result: SimulationTickResult
): void {
  const location = pool.location[idx]

  // Decrement visitor count at current building
  if (location >= 0 && sim.buildingVisitors[location] > 0) {
    sim.buildingVisitors[location]--
  }

  // Decide: leave or visit another building?
  const mood = pool.mood[idx]
  let leaveChance: number

  switch (mood) {
    case GUEST_MOOD.HAPPY:
      leaveChance = activeConfig.leaveChanceWhenHappy
      break
    case GUEST_MOOD.UNHAPPY:
      leaveChance = activeConfig.leaveChanceWhenUnhappy
      break
    default:
      leaveChance = activeConfig.leaveChanceWhenNeutral
  }

  if (Math.random() < leaveChance) {
    // Guest decides to leave
    pool.state[idx] = GUEST_STATE.LEAVING
    pool.location[idx] = -1
    pool.timer[idx] = activeConfig.leavingDuration
  } else {
    // Guest visits another building
    transitionToWalking(pool, idx, sim, slots)
  }
}

/**
 * Finalize guest leaving and update departure counts.
 */
function finalizeLeaving(
  pool: GuestPool,
  idx: number,
  result: SimulationTickResult
): void {
  const mood = pool.mood[idx]

  // Track departure type
  if (mood === GUEST_MOOD.UNHAPPY) {
    result.departures.unhappy++
  } else {
    result.departures.natural++
  }

  // Remove guest from pool
  removeGuest(pool, idx)
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Count visitors at each building (full pass).
 */
function countBuildingVisitors(sim: SimulationState): void {
  const { pool } = sim

  // Reset counts
  sim.buildingVisitors.fill(0)
  sim.buildingVisitorsByMood.happy.fill(0)
  sim.buildingVisitorsByMood.neutral.fill(0)
  sim.buildingVisitorsByMood.unhappy.fill(0)

  // Count all visiting guests
  for (let i = 0; i < pool.capacity; i++) {
    if (pool.state[i] !== GUEST_STATE.VISITING) continue

    const location = pool.location[i]
    if (location < 0 || location >= TOTAL_SLOTS) continue

    sim.buildingVisitors[location]++

    switch (pool.mood[i]) {
      case GUEST_MOOD.HAPPY:
        sim.buildingVisitorsByMood.happy[location]++
        break
      case GUEST_MOOD.NEUTRAL:
        sim.buildingVisitorsByMood.neutral[location]++
        break
      case GUEST_MOOD.UNHAPPY:
        sim.buildingVisitorsByMood.unhappy[location]++
        break
    }
  }
}

// ============================================================================
// Guest Addition (for arrivals)
// ============================================================================

/**
 * Add new guests to the simulation.
 *
 * @param sim - Simulation state
 * @param count - Number of guests to add
 * @param guestTypeMix - Distribution of guest types
 * @returns Number of guests actually added
 */
export function addGuests(
  sim: SimulationState,
  count: number,
  guestTypeMix: GuestTypeMix
): number {
  const { pool } = sim
  const toAdd = Math.min(count, pool.freeCount)

  if (toAdd <= 0) return 0

  // Pre-calculate cumulative probabilities for guest type selection
  const total = guestTypeMix.thrills + guestTypeMix.family + guestTypeMix.relaxation + guestTypeMix.social
  const thrillsProb = guestTypeMix.thrills / total
  const familyProb = thrillsProb + guestTypeMix.family / total
  const relaxationProb = familyProb + guestTypeMix.relaxation / total

  let added = 0
  for (let i = 0; i < toAdd; i++) {
    if (pool.freeCount === 0) break

    // Select guest type based on distribution
    const roll = Math.random()
    let guestType: number
    if (roll < thrillsProb) {
      guestType = 0 // THRILLS
    } else if (roll < familyProb) {
      guestType = 1 // FAMILY
    } else if (roll < relaxationProb) {
      guestType = 2 // RELAXATION
    } else {
      guestType = 3 // SOCIAL
    }

    // Add guest
    const idx = pool.freeList[--pool.freeCount]
    pool.state[idx] = GUEST_STATE.ARRIVING
    pool.location[idx] = -1
    pool.mood[idx] = GUEST_MOOD.NEUTRAL
    pool.guestType[idx] = guestType
    pool.timer[idx] = activeConfig.arrivalDelay
    pool.spent[idx] = 0
    pool.count++
    added++
  }

  return added
}

/**
 * Force remove guests (for matching aggregate departures).
 *
 * @param sim - Simulation state
 * @param count - Number of guests to remove
 * @param preferUnhappy - Prefer removing unhappy guests first
 * @returns Actual number removed
 */
export function forceRemoveGuests(
  sim: SimulationState,
  count: number,
  preferUnhappy: boolean = true
): number {
  const { pool } = sim
  let removed = 0
  const toRemove = Math.min(count, pool.count)

  if (toRemove <= 0) return 0

  if (preferUnhappy) {
    // First pass: remove unhappy guests
    for (let i = 0; i < pool.capacity && removed < toRemove; i++) {
      if (pool.state[i] !== GUEST_STATE.INACTIVE && pool.mood[i] === GUEST_MOOD.UNHAPPY) {
        removeGuest(pool, i)
        removed++
      }
    }

    // Second pass: remove neutral guests
    for (let i = 0; i < pool.capacity && removed < toRemove; i++) {
      if (pool.state[i] !== GUEST_STATE.INACTIVE && pool.mood[i] === GUEST_MOOD.NEUTRAL) {
        removeGuest(pool, i)
        removed++
      }
    }

    // Third pass: remove happy guests
    for (let i = 0; i < pool.capacity && removed < toRemove; i++) {
      if (pool.state[i] !== GUEST_STATE.INACTIVE && pool.mood[i] === GUEST_MOOD.HAPPY) {
        removeGuest(pool, i)
        removed++
      }
    }
  } else {
    // Remove any guests
    for (let i = 0; i < pool.capacity && removed < toRemove; i++) {
      if (pool.state[i] !== GUEST_STATE.INACTIVE) {
        removeGuest(pool, i)
        removed++
      }
    }
  }

  return removed
}
