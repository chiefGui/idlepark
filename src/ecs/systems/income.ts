/**
 * Income System
 *
 * Calculates income modifiers based on guest tags.
 * Pure function: tags → modifier
 */

import type { Modifier } from '../types'
import type { GuestComponents } from '../components/guest-tags'

/** Income system configuration */
const CONFIG = {
  // Big Spenders: +25% ticket income at 100%
  bigSpenders: {
    ticketBonus: 0.25,
  },
  // Large Groups: -15% per-guest income at 100%
  largeGroups: {
    perGuestPenalty: 0.15,
  },
  // Thrill Seekers: -20% shop income at 100%
  thrillSeekers: {
    shopPenalty: 0.20,
  },
  // Happy: +15% income at 100%
  happy: {
    incomeBonus: 0.15,
  },
  // Unhappy: -20% income at 100%
  unhappy: {
    incomePenalty: 0.20,
  },
} as const

export type IncomeModifiers = {
  ticket: number      // Multiplier for ticket income (1.0 = no change)
  perGuest: number    // Multiplier for per-guest income (1.0 = no change)
  shop: number        // Multiplier for shop income (1.0 = no change)
}

/**
 * Calculate income modifiers from guest components.
 * Returns multipliers that can be applied to base income values.
 */
export function incomeSystem(components: GuestComponents): IncomeModifiers {
  const { behavior, mood } = components

  // Ticket income: Big Spenders boost, Happy/Unhappy affect
  const ticketModifier =
    1 +
    (behavior.bigSpenders / 100) * CONFIG.bigSpenders.ticketBonus +
    (mood.happy / 100) * CONFIG.happy.incomeBonus -
    (mood.unhappy / 100) * CONFIG.unhappy.incomePenalty

  // Per-guest income: Large Groups reduce (group discounts)
  const perGuestModifier =
    1 -
    (behavior.largeGroups / 100) * CONFIG.largeGroups.perGuestPenalty

  // Shop income: Thrill Seekers reduce (they want rides, not merch)
  const shopModifier =
    1 -
    (behavior.thrillSeekers / 100) * CONFIG.thrillSeekers.shopPenalty

  return {
    ticket: Math.max(0.1, ticketModifier),     // Floor at 10%
    perGuest: Math.max(0.5, perGuestModifier), // Floor at 50%
    shop: Math.max(0.3, shopModifier),         // Floor at 30%
  }
}

/**
 * Convert income modifiers to game modifiers for composition.
 */
export function incomeSystemAsModifiers(components: GuestComponents): Modifier[] {
  const mods = incomeSystem(components)
  const modifiers: Modifier[] = []

  if (mods.ticket !== 1) {
    modifiers.push({
      stat: 'ticketIncome',
      more: mods.ticket,
      label: 'Guest mix',
    })
  }

  if (mods.perGuest !== 1) {
    modifiers.push({
      stat: 'perGuestIncome',
      more: mods.perGuest,
      label: 'Guest mix',
    })
  }

  if (mods.shop !== 1) {
    modifiers.push({
      stat: 'shopIncome',
      more: mods.shop,
      label: 'Guest mix',
    })
  }

  return modifiers
}
