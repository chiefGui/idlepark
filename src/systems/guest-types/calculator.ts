import type { GameState, GuestType, GuestTypeMix } from '../../engine/game-types'
import { GUEST_TYPES } from '../../engine/game-types'
import { Building } from '../building'

/**
 * Calculate the guest type distribution based on owned buildings.
 * Each building's audience weights contribute to the overall mix.
 *
 * Performance: O(slots) = O(24 max), runs once per day boundary.
 */
export function calculateGuestTypeMix(state: GameState): GuestTypeMix {
  // Start with base weights so empty park has even distribution
  const weights: Record<GuestType, number> = {
    thrills: 1,
    family: 1,
    relaxation: 1,
    social: 1,
  }

  // Sum weights from all owned buildings
  for (const slot of state.slots) {
    if (slot.buildingId) {
      const building = Building.getById(slot.buildingId)
      if (building?.audience) {
        for (const [type, weight] of Object.entries(building.audience)) {
          weights[type as GuestType] += weight
        }
      }
    }
  }

  // Normalize to percentages
  const total = Object.values(weights).reduce((a, b) => a + b, 0)

  return GUEST_TYPES.reduce((mix, type) => {
    mix[type] = Math.round((weights[type] / total) * 100)
    return mix
  }, {} as GuestTypeMix)
}
