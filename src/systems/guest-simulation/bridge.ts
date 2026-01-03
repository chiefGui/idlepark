/**
 * Bridge - Integration Layer between Simulation and GameState
 *
 * This module provides the interface between the individual guest
 * simulation and the existing aggregate-based GameState. It ensures
 * the new simulation can be used without breaking existing code.
 */

import type { GameState, GuestBreakdown, GuestTypeMix, SlotState } from '../../engine/game-types'
import { GameTypes } from '../../engine/game-types'
import type { Modifier } from '../../engine/modifiers'
import type { SimulationState, SimulationTickResult, BuildingContext } from './types'
import { GUEST_STATE, GUEST_MOOD } from './types'
import { GUEST_POOL_CAPACITY, TOTAL_SLOTS } from './constants'
import { getGuestsByMood, getActiveCount } from './pool'
import {
  createSimulation,
  tickSimulation,
  addGuests,
  forceRemoveGuests,
  markBuildingsDirty,
  updateBuildingCache,
} from './simulation'
import { Building } from '../building'

// ============================================================================
// Simulation Initialization
// ============================================================================

/**
 * Initialize simulation from existing GameState.
 * Creates guests to match the current breakdown.
 *
 * @param state - Current game state
 * @param capacity - Pool capacity (default: 60000)
 * @returns Initialized simulation state
 */
export function initializeFromGameState(
  state: GameState,
  capacity: number = GUEST_POOL_CAPACITY
): SimulationState {
  const sim = createSimulation(capacity)

  // Update building cache
  updateBuildingCache(sim, state.slots)
  markBuildingsDirty(sim)

  // Add guests to match current breakdown
  const totalGuests = GameTypes.getTotalGuests(state.guestBreakdown)
  if (totalGuests > 0) {
    addGuests(sim, Math.floor(totalGuests), state.guestTypeMix)

    // Adjust moods to match breakdown
    adjustMoodsToMatch(sim, state.guestBreakdown)
  }

  return sim
}

/**
 * Adjust guest moods to approximately match a target breakdown.
 */
function adjustMoodsToMatch(sim: SimulationState, target: GuestBreakdown): void {
  const { pool } = sim
  const total = target.happy + target.neutral + target.unhappy

  if (total === 0) return

  const happyRatio = target.happy / total
  const neutralRatio = target.neutral / total

  // Assign moods based on ratios
  let assigned = 0
  for (let i = 0; i < pool.capacity && assigned < pool.count; i++) {
    if (pool.state[i] === GUEST_STATE.INACTIVE) continue

    const roll = assigned / pool.count
    if (roll < happyRatio) {
      pool.mood[i] = GUEST_MOOD.HAPPY
    } else if (roll < happyRatio + neutralRatio) {
      pool.mood[i] = GUEST_MOOD.NEUTRAL
    } else {
      pool.mood[i] = GUEST_MOOD.UNHAPPY
    }
    assigned++
  }
}

// ============================================================================
// Tick Bridge
// ============================================================================

/**
 * Bridge function for tick processing.
 * Runs simulation and returns results compatible with existing system.
 *
 * @param sim - Simulation state
 * @param deltaDay - Time elapsed (in days)
 * @param state - Current game state (for context)
 * @returns Simulation tick result
 */
export function tickWithSimulation(
  sim: SimulationState,
  deltaDay: number,
  state: GameState
): SimulationTickResult {
  // Build context
  const context: BuildingContext = {
    slots: state.slots,
    buildingDefs: getBuildingDefsMap(state.slots),
    guestTypeMix: state.guestTypeMix,
    appeal: state.stats.appeal,
  }

  // Run simulation
  return tickSimulation(sim, deltaDay, context)
}

/**
 * Build a map of building IDs to definitions.
 */
function getBuildingDefsMap(slots: SlotState[]): Map<string, any> {
  const map = new Map()
  for (const slot of slots) {
    if (slot.buildingId) {
      const def = Building.getById(slot.buildingId)
      if (def) {
        map.set(slot.buildingId, def)
      }
    }
  }
  return map
}

// ============================================================================
// Arrival Synchronization
// ============================================================================

/**
 * Sync arrivals from aggregate calculation into simulation.
 * Called when the aggregate system calculates new arrivals.
 *
 * @param sim - Simulation state
 * @param arrivalsToAdd - Number of guests arriving
 * @param guestTypeMix - Current guest type distribution
 * @returns Number of guests actually added
 */
export function syncArrivals(
  sim: SimulationState,
  arrivalsToAdd: number,
  guestTypeMix: GuestTypeMix
): number {
  if (arrivalsToAdd <= 0) return 0
  return addGuests(sim, Math.floor(arrivalsToAdd), guestTypeMix)
}

// ============================================================================
// Departure Synchronization
// ============================================================================

/**
 * Sync departures to match aggregate system.
 * Removes guests if simulation has more than expected.
 *
 * @param sim - Simulation state
 * @param targetCount - Expected total guest count
 * @returns Number of guests removed and their types
 */
export function syncDepartures(
  sim: SimulationState,
  targetCount: number
): { natural: number; unhappy: number } {
  const currentCount = getActiveCount(sim.pool)
  const excess = currentCount - targetCount

  if (excess <= 0) {
    return { natural: 0, unhappy: 0 }
  }

  // Remove excess guests (prefer unhappy)
  const removed = forceRemoveGuests(sim, excess, true)

  // Estimate split (we removed unhappy first)
  const unhappyRemoved = Math.floor(removed * 0.6)
  const naturalRemoved = removed - unhappyRemoved

  return {
    natural: naturalRemoved,
    unhappy: unhappyRemoved,
  }
}

// ============================================================================
// State Queries
// ============================================================================

/**
 * Get guest breakdown from simulation.
 * Compatible with existing GuestBreakdown type.
 */
export function getGuestBreakdownFromSim(sim: SimulationState): GuestBreakdown {
  return getGuestsByMood(sim.pool)
}

/**
 * Get total guest count from simulation.
 */
export function getTotalGuestsFromSim(sim: SimulationState): number {
  return getActiveCount(sim.pool)
}

/**
 * Get visitor count for a specific building.
 */
export function getBuildingVisitors(sim: SimulationState, slotIndex: number): number {
  if (slotIndex < 0 || slotIndex >= TOTAL_SLOTS) return 0
  return sim.buildingVisitors[slotIndex]
}

/**
 * Get visitor breakdown by mood for a specific building.
 */
export function getBuildingVisitorsByMood(
  sim: SimulationState,
  slotIndex: number
): { happy: number; neutral: number; unhappy: number } {
  if (slotIndex < 0 || slotIndex >= TOTAL_SLOTS) {
    return { happy: 0, neutral: 0, unhappy: 0 }
  }

  return {
    happy: sim.buildingVisitorsByMood.happy[slotIndex],
    neutral: sim.buildingVisitorsByMood.neutral[slotIndex],
    unhappy: sim.buildingVisitorsByMood.unhappy[slotIndex],
  }
}

// ============================================================================
// Modifier Bridge
// ============================================================================

/**
 * Get shop modifiers using real visitor counts from simulation.
 * Replaces Building.getShopModifiers() when simulation is active.
 *
 * @param sim - Simulation state
 * @param slots - Current slot states
 * @returns Array of modifiers for shop income
 */
export function getShopModifiersFromSimulation(
  sim: SimulationState,
  slots: SlotState[]
): Modifier[] {
  const modifiers: Modifier[] = []

  for (const slot of slots) {
    if (!slot.buildingId) continue

    const building = Building.getById(slot.buildingId)
    if (!building || !Building.isShop(building)) continue

    // Use actual visitor count instead of min(guests, guestCap)
    const visitors = sim.buildingVisitors[slot.index]
    const income = visitors * building.incomePerGuest

    modifiers.push({
      source: { type: 'building', slotIndex: slot.index, buildingId: slot.buildingId },
      stat: 'money',
      flat: income,
    })
  }

  return modifiers
}

// ============================================================================
// Building Change Notification
// ============================================================================

/**
 * Notify simulation that buildings have changed.
 * Call this when a building is added, removed, or upgraded.
 */
export function notifyBuildingsChanged(sim: SimulationState, slots: SlotState[]): void {
  updateBuildingCache(sim, slots)
  markBuildingsDirty(sim)
}

// ============================================================================
// Capacity Check
// ============================================================================

/**
 * Check if simulation has room for more guests.
 */
export function hasSimulationCapacity(sim: SimulationState, count: number = 1): boolean {
  return sim.pool.freeCount >= count
}

/**
 * Get remaining capacity in simulation.
 */
export function getSimulationRemainingCapacity(sim: SimulationState): number {
  return sim.pool.freeCount
}

// ============================================================================
// Debug/Analytics
// ============================================================================

/**
 * Get simulation statistics for debugging/analytics.
 */
export function getSimulationStats(sim: SimulationState): {
  totalGuests: number
  capacity: number
  utilization: number
  breakdown: GuestBreakdown
  buildingOccupancy: { slotIndex: number; visitors: number; capacity: number }[]
} {
  const breakdown = getGuestsByMood(sim.pool)
  const totalGuests = breakdown.happy + breakdown.neutral + breakdown.unhappy

  const buildingOccupancy: { slotIndex: number; visitors: number; capacity: number }[] = []
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    if (sim.buildingCaps[i] > 0) {
      buildingOccupancy.push({
        slotIndex: i,
        visitors: sim.buildingVisitors[i],
        capacity: sim.buildingCaps[i],
      })
    }
  }

  return {
    totalGuests,
    capacity: sim.pool.capacity,
    utilization: (totalGuests / sim.pool.capacity) * 100,
    breakdown,
    buildingOccupancy,
  }
}
