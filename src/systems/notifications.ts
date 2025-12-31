import type { GameState } from '../engine/game-types'
import { Slot } from './slot'
import { Perk } from './perk'
import { Guest } from './guest'

export type NotificationType =
  | 'park_full'
  | 'capacity_full'
  | 'low_cleanliness'
  | 'unhappy_guests'

export type NotificationAction = 'perks' | 'guests' | 'cleanliness'

export type Notification = {
  id: NotificationType
  message: string
  action?: NotificationAction
  actionLabel?: string
}

// Thresholds for smart notifications
const CLEANLINESS_THRESHOLD = 35
const UNHAPPY_GUEST_RATIO = 0.15 // 15% of guests
const UNHAPPY_GUEST_MIN = 3 // At least 3 guests to show notification

export class Notifications {
  /**
   * Compute active notifications from game state.
   * Only returns notifications that are currently relevant.
   */
  static getActive(state: GameState): Notification[] {
    const notifications: Notification[] = []

    // Park full - no empty slots
    const emptySlots = Slot.getEmpty(state)
    const nextExpansion = Perk.getNextExpansionPerk(state)
    if (emptySlots.length === 0 && nextExpansion) {
      notifications.push({
        id: 'park_full',
        message: `No room for buildings. Get ${nextExpansion.name} to expand.`,
        action: 'perks',
        actionLabel: 'View Perks',
      })
    }

    // Guest capacity full
    const capacity = Guest.getCapacity(state)
    if (state.stats.guests >= capacity) {
      notifications.push({
        id: 'capacity_full',
        message: 'Park at capacity! Build lodging to welcome more guests.',
        action: 'guests',
        actionLabel: 'View Details',
      })
    }

    // Low cleanliness - only if we have guests
    if (state.stats.cleanliness < CLEANLINESS_THRESHOLD && state.stats.guests >= 5) {
      notifications.push({
        id: 'low_cleanliness',
        message: 'Park is getting dirty! Guests are unhappy.',
        action: 'cleanliness',
        actionLabel: 'View Details',
      })
    }

    // Unhappy guests - smart threshold based on total guests
    const breakdown = state.guestBreakdown
    const totalGuests = state.stats.guests
    const unhappyCount = Math.floor(breakdown.unhappy)
    const unhappyRatio = totalGuests > 0 ? unhappyCount / totalGuests : 0

    if (unhappyCount >= UNHAPPY_GUEST_MIN && unhappyRatio >= UNHAPPY_GUEST_RATIO) {
      notifications.push({
        id: 'unhappy_guests',
        message: `${unhappyCount} guests are unhappy and may leave.`,
        action: 'guests',
        actionLabel: 'View Details',
      })
    }

    return notifications
  }

  /**
   * Check if there are any active notifications
   */
  static hasAny(state: GameState): boolean {
    return Notifications.getActive(state).length > 0
  }

  /**
   * Get count of active notifications
   */
  static getCount(state: GameState): number {
    return Notifications.getActive(state).length
  }
}
