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

  // Normalize to percentages that sum to exactly 100
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  const rawPercentages = GUEST_TYPES.map((type) => ({
    type,
    value: (weights[type] / total) * 100,
  }))

  // Round while ensuring sum is exactly 100
  const floored = rawPercentages.map((p) => ({
    type: p.type,
    value: Math.floor(p.value),
    remainder: p.value - Math.floor(p.value),
  }))

  let sum = floored.reduce((a, b) => a + b.value, 0)
  const sorted = [...floored].sort((a, b) => b.remainder - a.remainder)

  // Distribute remaining points to highest remainders
  for (let i = 0; sum < 100 && i < sorted.length; i++) {
    sorted[i].value++
    sum++
  }

  return Object.fromEntries(floored.map((p) => [p.type, p.value])) as GuestTypeMix
}
