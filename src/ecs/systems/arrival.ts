/**
 * Arrival System
 *
 * Calculates arrival rate modifiers based on guest tags.
 * Pure function: tags → modifier
 */

import type { Modifier } from '../types'
import type { GuestComponents } from '../components/guest-tags'

/** Arrival system configuration */
const CONFIG = {
  // Large Groups: +30% arrivals at 100%
  largeGroups: {
    arrivalBonus: 0.30,
  },
  // Influencers: +20% arrivals at 100% (word of mouth)
  influencers: {
    arrivalBonus: 0.20,
  },
  // Big Spenders: -10% arrivals at 100% (they're picky)
  bigSpenders: {
    arrivalPenalty: 0.10,
  },
} as const

export type ArrivalModifiers = {
  rate: number  // Multiplier for arrival rate (1.0 = no change)
}

/**
 * Calculate arrival modifiers from guest components.
 * Returns multipliers that can be applied to base arrival rate.
 */
export function arrivalSystem(components: GuestComponents): ArrivalModifiers {
  const { behavior } = components

  const rateModifier =
    1 +
    (behavior.largeGroups / 100) * CONFIG.largeGroups.arrivalBonus +
    (behavior.influencers / 100) * CONFIG.influencers.arrivalBonus -
    (behavior.bigSpenders / 100) * CONFIG.bigSpenders.arrivalPenalty

  return {
    rate: Math.max(0.3, rateModifier), // Floor at 30%
  }
}

/**
 * Convert arrival modifiers to game modifiers for composition.
 */
export function arrivalSystemAsModifiers(components: GuestComponents): Modifier[] {
  const mods = arrivalSystem(components)
  const modifiers: Modifier[] = []

  if (mods.rate !== 1) {
    modifiers.push({
      stat: 'arrivalRate',
      more: mods.rate,
      label: 'Guest mix',
    })
  }

  return modifiers
}
