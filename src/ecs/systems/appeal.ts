/**
 * Appeal System
 *
 * Calculates appeal modifiers based on guest tags.
 * Pure function: tags → modifier
 */

import type { Modifier } from '../types'
import type { GuestComponents } from '../components/guest-tags'

/** Appeal system configuration */
const CONFIG = {
  // Thrill Seekers: +15% ride appeal at 100%
  thrillSeekers: {
    rideAppealBonus: 0.15,
  },
  // Happy guests: +5 appeal at 100%
  happy: {
    appealBonus: 5,
  },
  // Unhappy guests: -10 appeal at 100%
  unhappy: {
    appealPenalty: 10,
  },
} as const

export type AppealModifiers = {
  rideMultiplier: number  // Multiplier for ride appeal contribution
  flatBonus: number       // Flat appeal bonus/penalty from mood
}

/**
 * Calculate appeal modifiers from guest components.
 */
export function appealSystem(components: GuestComponents): AppealModifiers {
  const { behavior, mood } = components

  const rideMultiplier =
    1 + (behavior.thrillSeekers / 100) * CONFIG.thrillSeekers.rideAppealBonus

  const flatBonus =
    (mood.happy / 100) * CONFIG.happy.appealBonus -
    (mood.unhappy / 100) * CONFIG.unhappy.appealPenalty

  return {
    rideMultiplier: Math.max(0.5, rideMultiplier),
    flatBonus,
  }
}

/**
 * Convert appeal modifiers to game modifiers for composition.
 */
export function appealSystemAsModifiers(components: GuestComponents): Modifier[] {
  const mods = appealSystem(components)
  const modifiers: Modifier[] = []

  if (mods.rideMultiplier !== 1) {
    modifiers.push({
      stat: 'rideAppeal',
      more: mods.rideMultiplier,
      label: 'Thrill seekers',
    })
  }

  if (mods.flatBonus !== 0) {
    modifiers.push({
      stat: 'appeal',
      flat: mods.flatBonus,
      label: 'Guest mood',
    })
  }

  return modifiers
}
