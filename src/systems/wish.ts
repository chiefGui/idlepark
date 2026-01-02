import type { GameState, WishState, WishBoostState, FeedEntry } from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import { Building } from './building'
import { Requirements } from '../engine/requirements'
import { Feed } from './feed'

export class Wish {
  /**
   * Get all active wishes
   */
  static getActive(state: GameState): WishState[] {
    return state.wishes.filter((w) => w.expiresDay > state.currentDay)
  }

  /**
   * Get buildings that can be wished for (not owned, requirements met)
   */
  static getWishableBuildings(state: GameState): string[] {
    const ownedBuildingIds = new Set(
      state.slots.filter((s) => s.buildingId).map((s) => s.buildingId!)
    )
    const activeWishIds = new Set(state.wishes.map((w) => w.buildingId))

    return Building.ALL.filter((b) => {
      // Not already owned
      if (ownedBuildingIds.has(b.id)) return false
      // Not already wished for
      if (activeWishIds.has(b.id)) return false
      // Requirements met (so player CAN build it)
      if (!Requirements.checkAll(b.requirements, state)) return false
      return true
    }).map((b) => b.id)
  }

  /**
   * Check if we should generate a new wish
   */
  static shouldGenerateWish(state: GameState): boolean {
    // Need at least 10 guests before wishes start
    if (state.stats.guests < 10) return false
    // Cooldown check
    if (state.currentDay - state.lastWishDay < GameTypes.WISH_COOLDOWN_DAYS) return false
    // Max wishes check
    if (this.getActive(state).length >= GameTypes.MAX_ACTIVE_WISHES) return false
    // Need wishable buildings
    if (this.getWishableBuildings(state).length === 0) return false
    // Random chance per tick (low probability)
    return Math.random() < 0.002
  }

  /**
   * Generate a new wish and its feed entry
   */
  static generateWish(state: GameState): { wish: WishState; feedEntry: FeedEntry } | null {
    const wishableIds = this.getWishableBuildings(state)
    if (wishableIds.length === 0) return null

    const buildingId = wishableIds[Math.floor(Math.random() * wishableIds.length)]
    const building = Building.getById(buildingId)
    if (!building) return null

    const feedEntry = Feed.createEntry('wish', state.currentDay, {
      buildingId,
    })
    // Add the wishBuildingId to the feed entry
    feedEntry.wishBuildingId = buildingId

    const wish: WishState = {
      buildingId,
      createdDay: state.currentDay,
      expiresDay: state.currentDay + GameTypes.WISH_DURATION_DAYS,
      feedEntryId: feedEntry.id,
    }

    return { wish, feedEntry }
  }

  /**
   * Check if a building fulfills any active wish
   */
  static checkFulfillment(state: GameState, buildingId: string): WishState | null {
    return state.wishes.find(
      (w) => w.buildingId === buildingId && w.expiresDay > state.currentDay
    ) || null
  }

  /**
   * Generate a fulfillment celebration feed entry
   */
  static generateFulfillmentEntry(state: GameState, buildingId: string): FeedEntry {
    return Feed.createEntry('wish_fulfilled', state.currentDay, { buildingId })
  }

  /**
   * Create a boost for fulfilling a wish
   */
  static createBoost(state: GameState): WishBoostState {
    const boostTypes: Array<'arrivals' | 'income' | 'appeal'> = ['arrivals', 'income', 'appeal']
    const type = boostTypes[Math.floor(Math.random() * boostTypes.length)]

    return {
      type,
      multiplier: GameTypes.WISH_BOOST_MULTIPLIER,
      expiresDay: state.currentDay + GameTypes.WISH_BOOST_DURATION,
    }
  }

  /**
   * Get current active boost multiplier for arrivals
   */
  static getArrivalsMultiplier(state: GameState): number {
    if (!state.wishBoost) return 1
    if (state.wishBoost.expiresDay <= state.currentDay) return 1
    if (state.wishBoost.type !== 'arrivals') return 1
    return state.wishBoost.multiplier
  }

  /**
   * Get current active boost multiplier for ticket income
   */
  static getIncomeMultiplier(state: GameState): number {
    if (!state.wishBoost) return 1
    if (state.wishBoost.expiresDay <= state.currentDay) return 1
    if (state.wishBoost.type !== 'income') return 1
    return state.wishBoost.multiplier
  }

  /**
   * Get current active boost for appeal
   */
  static getAppealBonus(state: GameState): number {
    if (!state.wishBoost) return 0
    if (state.wishBoost.expiresDay <= state.currentDay) return 0
    if (state.wishBoost.type !== 'appeal') return 0
    // +25% translates to flat bonus based on current appeal
    return Math.round(state.stats.appeal * (state.wishBoost.multiplier - 1))
  }

  /**
   * Clean up expired wishes
   */
  static cleanupExpired(wishes: WishState[], currentDay: number): WishState[] {
    return wishes.filter((w) => w.expiresDay > currentDay)
  }

  /**
   * Remove a fulfilled wish
   */
  static removeFulfilled(wishes: WishState[], buildingId: string): WishState[] {
    return wishes.filter((w) => w.buildingId !== buildingId)
  }

  /**
   * Get boost description for UI
   */
  static getBoostDescription(boost: WishBoostState): string {
    if (!boost) return ''
    const percent = Math.round((boost.multiplier - 1) * 100)
    switch (boost.type) {
      case 'arrivals':
        return `+${percent}% guest arrivals`
      case 'income':
        return `+${percent}% ticket income`
      case 'appeal':
        return `+${percent}% appeal`
    }
  }
}
