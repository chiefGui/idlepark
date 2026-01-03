/**
 * Tag Calculator
 *
 * Derives guest behavior tags from game state (buildings, etc.).
 * This bridges the game's building system with the ECS.
 */

import type { GameState } from '../../engine/game-types'
import type { BehaviorTagMix, MoodTagMix, GuestComponents } from './guest-tags'
import { BEHAVIOR_TAGS } from './guest-tags'
import { Building } from '../../systems/building'

/**
 * Building audience type for the new tag system.
 * Buildings define which tags they attract.
 */
export type BuildingTagAudience = Partial<Record<typeof BEHAVIOR_TAGS[number], number>>

/**
 * Calculate behavior tag distribution from owned buildings.
 * Each building's audience weights contribute to the overall mix.
 *
 * Performance: O(slots) = O(24 max), runs once per day boundary.
 */
export function calculateBehaviorTagMix(state: GameState): BehaviorTagMix {
  // Start with base weights for even distribution
  const weights: Record<typeof BEHAVIOR_TAGS[number], number> = {
    bigSpenders: 1,
    largeGroups: 1,
    influencers: 1,
    thrillSeekers: 1,
  }

  // Sum weights from all owned buildings
  for (const slot of state.slots) {
    if (slot.buildingId) {
      const building = Building.getById(slot.buildingId)
      if (building) {
        // Use new tagAudience if available, otherwise map from legacy audience
        const tagAudience = getTagAudience(building)
        for (const [tag, weight] of Object.entries(tagAudience)) {
          weights[tag as typeof BEHAVIOR_TAGS[number]] += weight
        }
      }
    }
  }

  // Normalize to percentages that sum to exactly 100
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  const rawPercentages = BEHAVIOR_TAGS.map((tag) => ({
    tag,
    value: (weights[tag] / total) * 100,
  }))

  // Round while ensuring sum is exactly 100
  const floored = rawPercentages.map((p) => ({
    tag: p.tag,
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

  return Object.fromEntries(floored.map((p) => [p.tag, p.value])) as BehaviorTagMix
}

/**
 * Calculate mood tag distribution from guest breakdown.
 * Maps the current happy/neutral/unhappy counts to percentages.
 */
export function calculateMoodTagMix(state: GameState): MoodTagMix {
  const { happy, neutral, unhappy } = state.guestBreakdown
  const total = happy + neutral + unhappy

  if (total === 0) {
    return { happy: 0, unhappy: 0 }
  }

  return {
    happy: Math.round((happy / total) * 100),
    unhappy: Math.round((unhappy / total) * 100),
  }
}

/**
 * Get complete guest components from game state.
 * This is the main entry point for the ECS integration.
 */
export function getGuestComponents(state: GameState): GuestComponents {
  return {
    behavior: calculateBehaviorTagMix(state),
    mood: calculateMoodTagMix(state),
  }
}

/**
 * Map legacy building audience to new tag system.
 * Used for backwards compatibility until all buildings are updated.
 *
 * Mapping:
 * - thrills → thrillSeekers
 * - family → largeGroups
 * - relaxation → bigSpenders (relaxers have money to spend)
 */
function getTagAudience(building: { audience?: Record<string, number> }): BuildingTagAudience {
  if (!building.audience) return {}

  const tagAudience: BuildingTagAudience = {}

  for (const [key, value] of Object.entries(building.audience)) {
    switch (key) {
      case 'thrills':
        tagAudience.thrillSeekers = (tagAudience.thrillSeekers ?? 0) + value
        break
      case 'family':
        tagAudience.largeGroups = (tagAudience.largeGroups ?? 0) + value
        break
      case 'relaxation':
        tagAudience.bigSpenders = (tagAudience.bigSpenders ?? 0) + value
        break
      // New tags can be added directly
      case 'bigSpenders':
      case 'largeGroups':
      case 'influencers':
      case 'thrillSeekers':
        tagAudience[key] = (tagAudience[key] ?? 0) + value
        break
    }
  }

  return tagAudience
}
