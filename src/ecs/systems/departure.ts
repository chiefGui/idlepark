/**
 * Departure System
 *
 * Calculates departure rate modifiers based on guest tags.
 * Pure function: tags → modifier
 */

import type { Modifier } from '../types'
import type { GuestComponents } from '../components/guest-tags'

/** Departure system configuration */
const CONFIG = {
  // Influencers: +10% departure rate at 100% (short attention span)
  influencers: {
    departurePenalty: 0.10,
  },
  // Unhappy: +50% departure rate at 100%
  unhappy: {
    departurePenalty: 0.50,
  },
  // Happy: -20% departure rate at 100%
  happy: {
    departureBonus: 0.20,
  },
} as const

export type DepartureModifiers = {
  rate: number  // Multiplier for departure rate (1.0 = no change, <1 = fewer departures)
}

/**
 * Calculate departure modifiers from guest components.
 * Returns multipliers that can be applied to base departure rate.
 */
export function departureSystem(components: GuestComponents): DepartureModifiers {
  const { behavior, mood } = components

  const rateModifier =
    1 +
    (behavior.influencers / 100) * CONFIG.influencers.departurePenalty +
    (mood.unhappy / 100) * CONFIG.unhappy.departurePenalty -
    (mood.happy / 100) * CONFIG.happy.departureBonus

  return {
    rate: Math.max(0.3, rateModifier), // Floor at 30%
  }
}

/**
 * Convert departure modifiers to game modifiers for composition.
 */
export function departureSystemAsModifiers(components: GuestComponents): Modifier[] {
  const mods = departureSystem(components)
  const modifiers: Modifier[] = []

  if (mods.rate !== 1) {
    modifiers.push({
      stat: 'departureRate',
      more: mods.rate,
      label: 'Guest mix',
    })
  }

  return modifiers
}
