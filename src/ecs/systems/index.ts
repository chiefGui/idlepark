/**
 * ECS Systems
 *
 * All systems are pure functions that take components and return modifiers.
 * Systems contain all behavior - components are just data.
 */

export { incomeSystem, incomeSystemAsModifiers, type IncomeModifiers } from './income'
export { arrivalSystem, arrivalSystemAsModifiers, type ArrivalModifiers } from './arrival'
export { departureSystem, departureSystemAsModifiers, type DepartureModifiers } from './departure'
export { appealSystem, appealSystemAsModifiers, type AppealModifiers } from './appeal'

import type { Modifier } from '../types'
import type { GuestComponents } from '../components/guest-tags'
import { incomeSystem, type IncomeModifiers } from './income'
import { arrivalSystem, type ArrivalModifiers } from './arrival'
import { departureSystem, type DepartureModifiers } from './departure'
import { appealSystem, type AppealModifiers } from './appeal'

/**
 * Combined result of all guest systems.
 */
export type GuestSystemsResult = {
  income: IncomeModifiers
  arrival: ArrivalModifiers
  departure: DepartureModifiers
  appeal: AppealModifiers
}

/**
 * Run all guest systems and return combined result.
 * This is the main entry point for the guest ECS.
 */
export function runGuestSystems(components: GuestComponents): GuestSystemsResult {
  return {
    income: incomeSystem(components),
    arrival: arrivalSystem(components),
    departure: departureSystem(components),
    appeal: appealSystem(components),
  }
}

/**
 * Get all modifiers from all guest systems.
 */
export function getAllGuestModifiers(components: GuestComponents): Modifier[] {
  const result = runGuestSystems(components)
  const modifiers: Modifier[] = []

  // Income modifiers
  if (result.income.ticket !== 1) {
    modifiers.push({ stat: 'ticketIncome', more: result.income.ticket, label: 'Guest mix' })
  }
  if (result.income.perGuest !== 1) {
    modifiers.push({ stat: 'perGuestIncome', more: result.income.perGuest, label: 'Guest mix' })
  }
  if (result.income.shop !== 1) {
    modifiers.push({ stat: 'shopIncome', more: result.income.shop, label: 'Guest mix' })
  }

  // Arrival modifier
  if (result.arrival.rate !== 1) {
    modifiers.push({ stat: 'arrivalRate', more: result.arrival.rate, label: 'Guest mix' })
  }

  // Departure modifier
  if (result.departure.rate !== 1) {
    modifiers.push({ stat: 'departureRate', more: result.departure.rate, label: 'Guest mix' })
  }

  // Appeal modifiers
  if (result.appeal.rideMultiplier !== 1) {
    modifiers.push({ stat: 'rideAppeal', more: result.appeal.rideMultiplier, label: 'Thrill seekers' })
  }
  if (result.appeal.flatBonus !== 0) {
    modifiers.push({ stat: 'appeal', flat: result.appeal.flatBonus, label: 'Guest mood' })
  }

  return modifiers
}
