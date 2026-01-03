/**
 * Building Selector - Weighted Building Selection for Guests
 *
 * Determines which building a guest should visit next based on:
 * - Guest type preferences (thrills, family, relaxation, social)
 * - Building audience (which guest types it appeals to)
 * - Current capacity (avoid overcrowded buildings)
 * - Previous location (avoid revisiting same building)
 */

import type { SlotState, GuestTypeMix, Audience } from '../../engine/game-types'
import type { GuestTypeId } from './types'
import { GUEST_TYPE_ID } from './types'
import {
  BASE_ATTRACTION_WEIGHT,
  GUEST_TYPE_AFFINITY_MULTIPLIER,
  CAPACITY_PENALTY_FACTOR,
  SAME_BUILDING_PENALTY,
  MIN_ATTRACTION_WEIGHT,
  TOTAL_SLOTS,
} from './constants'
import { Building } from '../building'

// ============================================================================
// Types
// ============================================================================

type BuildingWeightInfo = {
  slotIndex: number
  buildingId: string
  weight: number
  capacity: number
  audience: Audience
}

// ============================================================================
// Weight Calculation
// ============================================================================

/**
 * Calculate attraction weights for all buildings.
 *
 * @param slots - Current slot states
 * @param guestTypeMix - Current distribution of guest types
 * @returns Float32Array of weights per slot (0 for empty/no building)
 */
export function calculateAttractionWeights(
  slots: SlotState[],
  guestTypeMix: GuestTypeMix
): Float32Array {
  const weights = new Float32Array(TOTAL_SLOTS)

  for (const slot of slots) {
    if (!slot.buildingId) {
      weights[slot.index] = 0
      continue
    }

    const building = Building.getById(slot.buildingId)
    if (!building) {
      weights[slot.index] = 0
      continue
    }

    // Base weight
    let weight = BASE_ATTRACTION_WEIGHT

    // Apply audience affinity
    // Buildings that match popular guest types get higher weight
    if (building.audience) {
      let affinityBonus = 0
      for (const [typeKey, typeWeight] of Object.entries(building.audience)) {
        const mixPercentage = guestTypeMix[typeKey as keyof GuestTypeMix] / 100
        affinityBonus += typeWeight * mixPercentage
      }
      weight *= 1 + affinityBonus * 0.5
    }

    weights[slot.index] = Math.max(MIN_ATTRACTION_WEIGHT, weight)
  }

  return weights
}

/**
 * Calculate weight for a specific guest type at a specific building.
 *
 * @param guestType - The guest's type ID
 * @param audience - Building's audience preferences
 * @returns Weight multiplier for this guest type
 */
export function calculateGuestTypeWeight(
  guestType: GuestTypeId,
  audience: Audience | undefined
): number {
  if (!audience) {
    return BASE_ATTRACTION_WEIGHT
  }

  // Map guest type ID to audience key
  const typeKey = getTypeKey(guestType)
  const audienceWeight = audience[typeKey] || 0

  // Higher audience weight = more attractive to this guest type
  return BASE_ATTRACTION_WEIGHT + audienceWeight * GUEST_TYPE_AFFINITY_MULTIPLIER
}

/**
 * Map guest type ID to GuestType key.
 */
function getTypeKey(guestType: GuestTypeId): keyof GuestTypeMix {
  switch (guestType) {
    case GUEST_TYPE_ID.THRILLS:
      return 'thrills'
    case GUEST_TYPE_ID.FAMILY:
      return 'family'
    case GUEST_TYPE_ID.RELAXATION:
      return 'relaxation'
    case GUEST_TYPE_ID.SOCIAL:
      return 'social'
    default:
      return 'family'
  }
}

// ============================================================================
// Building Selection
// ============================================================================

/**
 * Select a building for a guest to visit.
 *
 * Uses weighted random selection considering:
 * - Guest type preferences
 * - Building capacity
 * - Avoiding the same building
 *
 * @param guestType - Guest's type ID
 * @param baseWeights - Pre-calculated base weights per building
 * @param currentVisitors - Current visitor count per building
 * @param buildingCaps - Capacity per building
 * @param currentLocation - Guest's current/previous location (-1 if none)
 * @param slots - Current slot states
 * @returns Selected slot index, or -1 if no valid building
 */
export function selectBuilding(
  guestType: GuestTypeId,
  baseWeights: Float32Array,
  currentVisitors: Int16Array,
  buildingCaps: Int16Array,
  currentLocation: number,
  slots: SlotState[]
): number {
  // Build weighted list of valid buildings
  let totalWeight = 0
  const weights = new Float32Array(TOTAL_SLOTS)

  for (let i = 0; i < TOTAL_SLOTS; i++) {
    // Skip empty slots
    if (baseWeights[i] === 0) {
      weights[i] = 0
      continue
    }

    const slot = slots[i]
    if (!slot.buildingId) {
      weights[i] = 0
      continue
    }

    // Get building for guest type preference
    const building = Building.getById(slot.buildingId)
    if (!building) {
      weights[i] = 0
      continue
    }

    // Start with base weight adjusted for guest type
    let weight = calculateGuestTypeWeight(guestType, building.audience)

    // Apply capacity penalty
    const cap = buildingCaps[i]
    if (cap > 0) {
      const visitors = currentVisitors[i]
      if (visitors >= cap) {
        // Building is full - skip
        weights[i] = 0
        continue
      }
      // Linear penalty as building fills up
      const occupancy = visitors / cap
      weight *= 1 - occupancy * CAPACITY_PENALTY_FACTOR
    }

    // Penalty for same building (avoid immediate revisit)
    if (i === currentLocation) {
      weight *= SAME_BUILDING_PENALTY
    }

    weights[i] = Math.max(MIN_ATTRACTION_WEIGHT, weight)
    totalWeight += weights[i]
  }

  // No valid buildings
  if (totalWeight <= 0) {
    return -1
  }

  // Weighted random selection
  let roll = Math.random() * totalWeight
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    if (weights[i] <= 0) continue

    roll -= weights[i]
    if (roll <= 0) {
      return i
    }
  }

  // Fallback (shouldn't happen)
  return -1
}

/**
 * Select a building for a guest, with fast path for few buildings.
 * Optimized version that avoids allocation when possible.
 */
export function selectBuildingFast(
  guestType: GuestTypeId,
  slots: SlotState[],
  currentVisitors: Int16Array,
  buildingCaps: Int16Array,
  currentLocation: number
): number {
  // Count valid buildings and calculate weights inline
  let totalWeight = 0
  let validCount = 0

  // First pass: calculate total weight
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const slot = slots[i]
    if (!slot.buildingId) continue

    const building = Building.getById(slot.buildingId)
    if (!building) continue

    // Check capacity
    const cap = buildingCaps[i]
    if (cap > 0 && currentVisitors[i] >= cap) continue

    // Calculate weight
    let weight = calculateGuestTypeWeight(guestType, building.audience)

    // Capacity penalty
    if (cap > 0) {
      const occupancy = currentVisitors[i] / cap
      weight *= 1 - occupancy * CAPACITY_PENALTY_FACTOR
    }

    // Same building penalty
    if (i === currentLocation) {
      weight *= SAME_BUILDING_PENALTY
    }

    weight = Math.max(MIN_ATTRACTION_WEIGHT, weight)
    totalWeight += weight
    validCount++
  }

  // No valid buildings
  if (totalWeight <= 0 || validCount === 0) {
    return -1
  }

  // Second pass: weighted random selection
  let roll = Math.random() * totalWeight
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const slot = slots[i]
    if (!slot.buildingId) continue

    const building = Building.getById(slot.buildingId)
    if (!building) continue

    // Check capacity
    const cap = buildingCaps[i]
    if (cap > 0 && currentVisitors[i] >= cap) continue

    // Calculate weight (same as above)
    let weight = calculateGuestTypeWeight(guestType, building.audience)
    if (cap > 0) {
      const occupancy = currentVisitors[i] / cap
      weight *= 1 - occupancy * CAPACITY_PENALTY_FACTOR
    }
    if (i === currentLocation) {
      weight *= SAME_BUILDING_PENALTY
    }
    weight = Math.max(MIN_ATTRACTION_WEIGHT, weight)

    roll -= weight
    if (roll <= 0) {
      return i
    }
  }

  // Fallback
  return -1
}

// ============================================================================
// Building Metadata Extraction
// ============================================================================

/**
 * Extract building capacities for all slots.
 * For non-shop buildings, capacity is based on entertainment value.
 */
export function extractBuildingCaps(slots: SlotState[]): Int16Array {
  const caps = new Int16Array(TOTAL_SLOTS)

  for (const slot of slots) {
    if (!slot.buildingId) {
      caps[slot.index] = 0
      continue
    }

    const building = Building.getById(slot.buildingId)
    if (!building) {
      caps[slot.index] = 0
      continue
    }

    // Check if it's a shop (has guestCap)
    if (Building.isShop(building)) {
      caps[slot.index] = building.guestCap
    } else {
      // For rides/other buildings, estimate capacity from entertainment
      // Higher entertainment = can handle more guests
      const entertainment = building.effects.find(e => e.statId === 'entertainment')?.perDay ?? 0
      caps[slot.index] = Math.max(20, Math.floor(entertainment * 10))
    }
  }

  return caps
}

/**
 * Extract shop income per guest for all slots.
 */
export function extractShopIncomePerGuest(slots: SlotState[]): Float32Array {
  const income = new Float32Array(TOTAL_SLOTS)

  for (const slot of slots) {
    if (!slot.buildingId) {
      income[slot.index] = 0
      continue
    }

    const building = Building.getById(slot.buildingId)
    if (!building || !Building.isShop(building)) {
      income[slot.index] = 0
      continue
    }

    income[slot.index] = building.incomePerGuest
  }

  return income
}

/**
 * Extract is-shop flags for all slots.
 */
export function extractIsShopFlags(slots: SlotState[]): Uint8Array {
  const flags = new Uint8Array(TOTAL_SLOTS)

  for (const slot of slots) {
    if (!slot.buildingId) {
      flags[slot.index] = 0
      continue
    }

    const building = Building.getById(slot.buildingId)
    flags[slot.index] = building && Building.isShop(building) ? 1 : 0
  }

  return flags
}
