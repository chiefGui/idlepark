/**
 * Bridge - Integration Layer between Simulation and GameState
 *
 * Provides helper functions to integrate the simulation with the game store.
 */

import type { GuestBreakdown, GuestTypeMix, SlotState } from '../../engine/game-types'
import type { Modifier } from '../../engine/modifiers'
import type { SimulationState } from './types'
import { TOTAL_SLOTS } from './constants'
import { getGuestsByMood, getActiveCount } from './pool'
import { updateBuildingCache, markBuildingsDirty } from './simulation'
import { Building } from '../building'

// ============================================================================
// State Queries
// ============================================================================

/**
 * Get guest breakdown from simulation.
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

    // Use actual visitor count
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
 */
export function notifyBuildingsChanged(sim: SimulationState, slots: SlotState[]): void {
  updateBuildingCache(sim, slots)
  markBuildingsDirty(sim)
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
