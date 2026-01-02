import type { GameState, GuestType, BuildingDef } from '../../engine/game-types'
import { GUEST_TYPES } from '../../engine/game-types'
import { Building } from '../building'

export type GuestTypeAnalysis = {
  type: GuestType
  percentage: number
  guestCount: number
  /** Buildings attracting this type, sorted by weight (highest first) */
  attractors: { building: BuildingDef; weight: number }[]
}

/**
 * Analyze guest types with rich data about what's attracting each type.
 * Returns analysis for each guest type including estimated counts and attractors.
 */
export function analyzeGuestTypes(
  state: GameState,
  totalGuests: number
): GuestTypeAnalysis[] {
  const mix = state.guestTypeMix

  // Collect owned buildings and their audiences
  const ownedBuildings: BuildingDef[] = []
  for (const slot of state.slots) {
    if (slot.buildingId) {
      const building = Building.getById(slot.buildingId)
      if (building) {
        ownedBuildings.push(building)
      }
    }
  }

  return GUEST_TYPES.map((type) => {
    const percentage = mix[type]
    const guestCount = Math.round((totalGuests * percentage) / 100)

    // Find buildings attracting this type
    const attractors = ownedBuildings
      .filter((b) => b.audience && b.audience[type] && b.audience[type]! > 0)
      .map((b) => ({ building: b, weight: b.audience![type]! }))
      .sort((a, b) => b.weight - a.weight)

    return {
      type,
      percentage,
      guestCount,
      attractors,
    }
  })
}
