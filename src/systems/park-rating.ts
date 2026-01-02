/**
 * Park Rating System - The simplified core of IdlePark
 *
 * This system replaces the complex appeal calculation with a simple,
 * intuitive star rating (1-5 stars) based on just TWO things:
 *
 * 1. FUN - Do you have enough entertainment for your guests?
 * 2. COMFORT - Are guests' basic needs met (food, rest, cleanliness)?
 *
 * Guest Types provide passive bonuses:
 * - Thrill Seekers: +income from rides
 * - Families: +capacity (they bring kids)
 * - Relaxers: -departure rate (they stay longer)
 * - Social: +fame/arrivals (word of mouth)
 */

import type { GameState, GuestType, GuestTypeMix } from '../engine/game-types'
import { GameTypes, GUEST_TYPES, GUEST_TYPE_META } from '../engine/game-types'
import { Building } from './building'
import { Service } from './service'

// === PROGRESSIVE UNLOCK PHASES ===
export type GamePhase = 'discovery' | 'comfort' | 'growth' | 'mastery'

export const PHASE_THRESHOLDS = {
  discovery: 1,   // Days 1-7: Just build rides, watch guests come
  comfort: 8,     // Days 8-20: Comfort matters now
  growth: 21,     // Days 21-40: Capacity/scaling unlocks
  mastery: 41,    // Days 41+: Full optimization available
} as const

// === UNIFIED STATS ===
export type UnifiedStats = {
  fun: number           // Entertainment adequacy (0-100)
  comfort: number       // Combined food+rest+cleanliness adequacy (0-100)
  capacity: number      // Max guests
  currentGuests: number // Current guest count
}

// === PARK RATING RESULT ===
export type ParkRatingResult = {
  stars: number         // 1-5 (can be fractional like 4.2)
  label: string         // "Amazing!", "Great", "Good", "Needs Work", "Poor"
  funStatus: 'great' | 'good' | 'low' | 'critical'
  comfortStatus: 'great' | 'good' | 'low' | 'critical'
}

// === GUEST TYPE BONUSES ===
export type GuestTypeBonus = {
  type: GuestType
  name: string
  emoji: string
  bonus: string         // Human-readable bonus description
  value: number         // The actual multiplier/bonus value
}

// === ADVISOR TIPS ===
export type AdvisorTip = {
  priority: 'critical' | 'warning' | 'suggestion' | 'praise'
  message: string
  action?: string       // Optional action button text
  actionType?: 'build_rides' | 'build_food' | 'build_lodging' | 'adjust_price'
}

export class ParkRating {
  // === THRESHOLDS ===
  static readonly FUN_PER_GUEST = 0.5        // Each guest needs 0.5 entertainment
  static readonly COMFORT_PER_GUEST = 0.3    // Each guest needs 0.3 comfort (combined)

  // Star rating thresholds (percentage of needs met)
  static readonly STAR_THRESHOLDS = {
    5: 90,   // 90%+ needs met = 5 stars
    4: 70,   // 70%+ = 4 stars
    3: 50,   // 50%+ = 3 stars
    2: 30,   // 30%+ = 2 stars
    1: 0,    // Below 30% = 1 star
  }

  // Guest type bonus multipliers (percentage bonuses)
  static readonly GUEST_TYPE_BONUSES: Record<GuestType, { stat: string; multiplier: number; description: string }> = {
    thrills: { stat: 'income', multiplier: 0.15, description: '+15% ride income' },
    family: { stat: 'capacity', multiplier: 0.10, description: '+10% capacity' },
    relaxation: { stat: 'retention', multiplier: 0.20, description: '-20% departures' },
    social: { stat: 'fame', multiplier: 0.15, description: '+15% guest arrivals' },
  }

  /**
   * Get current game phase based on day
   */
  static getPhase(day: number): GamePhase {
    if (day >= PHASE_THRESHOLDS.mastery) return 'mastery'
    if (day >= PHASE_THRESHOLDS.growth) return 'growth'
    if (day >= PHASE_THRESHOLDS.comfort) return 'comfort'
    return 'discovery'
  }

  /**
   * Check if a feature is unlocked based on current phase
   */
  static isUnlocked(feature: 'comfort' | 'capacity' | 'pricing' | 'marketing' | 'bank', day: number): boolean {
    const phase = this.getPhase(day)
    switch (feature) {
      case 'comfort':
        return phase !== 'discovery'
      case 'capacity':
        return phase === 'growth' || phase === 'mastery'
      case 'pricing':
      case 'marketing':
      case 'bank':
        return phase === 'mastery'
      default:
        return true
    }
  }

  /**
   * Calculate unified stats from game state
   */
  static calculateUnifiedStats(state: GameState): UnifiedStats {
    const totalGuests = GameTypes.getTotalGuests(state.guestBreakdown)
    const guestTypeBonuses = this.getActiveGuestTypeBonuses(state.guestTypeMix)

    // Calculate capacity with family bonus
    const baseCapacity = GameTypes.INITIAL_GUEST_CAPACITY
    const lodgingBonus = Building.getTotalCapacityBonus(state)
    const serviceBonus = Service.getTotalCapacityBonus(state)
    const familyBonus = guestTypeBonuses.family?.value ?? 0
    const capacity = Math.floor((baseCapacity + lodgingBonus + serviceBonus) * (1 + familyBonus))

    // Fun = entertainment adequacy (0-100)
    const funNeeded = Math.max(1, totalGuests * this.FUN_PER_GUEST)
    const funSupply = state.stats.entertainment
    const fun = Math.min(100, (funSupply / funNeeded) * 100)

    // Comfort = combined (food + comfort + cleanliness) adequacy (0-100)
    const comfortNeeded = Math.max(1, totalGuests * this.COMFORT_PER_GUEST)
    // Combine food, comfort (rest areas), and cleanliness into one metric
    const comfortSupply = (state.stats.food + state.stats.comfort + state.stats.cleanliness) / 3
    const comfort = Math.min(100, (comfortSupply / comfortNeeded) * 100)

    return {
      fun: Math.round(fun),
      comfort: Math.round(comfort),
      capacity,
      currentGuests: totalGuests,
    }
  }

  /**
   * Calculate park star rating (1-5)
   */
  static calculateRating(state: GameState): ParkRatingResult {
    const stats = this.calculateUnifiedStats(state)

    // If no guests, rating is based on potential
    if (stats.currentGuests === 0) {
      const hasFun = state.stats.entertainment > 0
      return {
        stars: hasFun ? 3 : 1,
        label: hasFun ? 'Ready for guests!' : 'Build some rides!',
        funStatus: hasFun ? 'good' : 'critical',
        comfortStatus: 'good',
      }
    }

    // Calculate overall score (weighted average: fun matters slightly more)
    const overallScore = (stats.fun * 0.6 + stats.comfort * 0.4)

    // Determine star rating
    let stars: number
    let label: string
    if (overallScore >= this.STAR_THRESHOLDS[5]) {
      stars = 5
      label = 'Amazing!'
    } else if (overallScore >= this.STAR_THRESHOLDS[4]) {
      stars = 4 + (overallScore - this.STAR_THRESHOLDS[4]) / (this.STAR_THRESHOLDS[5] - this.STAR_THRESHOLDS[4])
      label = 'Great'
    } else if (overallScore >= this.STAR_THRESHOLDS[3]) {
      stars = 3 + (overallScore - this.STAR_THRESHOLDS[3]) / (this.STAR_THRESHOLDS[4] - this.STAR_THRESHOLDS[3])
      label = 'Good'
    } else if (overallScore >= this.STAR_THRESHOLDS[2]) {
      stars = 2 + (overallScore - this.STAR_THRESHOLDS[2]) / (this.STAR_THRESHOLDS[3] - this.STAR_THRESHOLDS[2])
      label = 'Needs Work'
    } else {
      stars = 1 + (overallScore / this.STAR_THRESHOLDS[2])
      label = 'Poor'
    }

    // Determine status for each metric
    const getStatus = (value: number): 'great' | 'good' | 'low' | 'critical' => {
      if (value >= 80) return 'great'
      if (value >= 50) return 'good'
      if (value >= 25) return 'low'
      return 'critical'
    }

    return {
      stars: Math.round(stars * 10) / 10, // Round to 1 decimal
      label,
      funStatus: getStatus(stats.fun),
      comfortStatus: getStatus(stats.comfort),
    }
  }

  /**
   * Get active guest type bonuses based on current mix
   */
  static getActiveGuestTypeBonuses(mix: GuestTypeMix): Partial<Record<GuestType, GuestTypeBonus>> {
    const result: Partial<Record<GuestType, GuestTypeBonus>> = {}
    const threshold = 25 // Need at least 25% of a type to get bonus

    for (const type of GUEST_TYPES) {
      const percentage = mix[type]
      if (percentage >= threshold) {
        const bonusInfo = this.GUEST_TYPE_BONUSES[type]
        // Scale bonus based on how dominant the type is (25% = base, 100% = 2x)
        const scaledMultiplier = bonusInfo.multiplier * (percentage / 50)
        result[type] = {
          type,
          name: GUEST_TYPE_META[type].name,
          emoji: GUEST_TYPE_META[type].emoji,
          bonus: bonusInfo.description,
          value: Math.min(scaledMultiplier, bonusInfo.multiplier * 2), // Cap at 2x base
        }
      }
    }

    return result
  }

  /**
   * Calculate fame factor for guest arrivals (replaces complex appeal formula)
   * Includes guest type bonuses
   */
  static calculateFameFactor(state: GameState): number {
    const entertainment = state.stats.entertainment

    // Base fame from entertainment (logarithmic so early rides matter most)
    const entertainmentFactor = entertainment > 0
      ? 1 + Math.log10(1 + entertainment / 10) * 0.5
      : 0.5

    // Variety bonus
    const varietyMultiplier = Building.getVarietyMultiplier(state)
    const varietyBonus = 1 + (varietyMultiplier - 1) * 0.3

    // Social guest type bonus (word of mouth)
    const guestBonuses = this.getActiveGuestTypeBonuses(state.guestTypeMix)
    const socialBonus = 1 + (guestBonuses.social?.value ?? 0)

    // Combine and cap
    const rawFame = entertainmentFactor * varietyBonus * socialBonus
    return Math.max(0.5, Math.min(5, rawFame))
  }

  /**
   * Calculate guest retention modifier (affects departure rate)
   * Relaxers stay longer!
   */
  static getRetentionModifier(state: GameState): number {
    const guestBonuses = this.getActiveGuestTypeBonuses(state.guestTypeMix)
    const relaxationBonus = guestBonuses.relaxation?.value ?? 0
    // Higher retention = lower departures (return value < 1 means fewer departures)
    return Math.max(0.5, 1 - relaxationBonus)
  }

  /**
   * Calculate income modifier from guest types
   * Thrill seekers spend more!
   */
  static getIncomeModifier(state: GameState): number {
    const guestBonuses = this.getActiveGuestTypeBonuses(state.guestTypeMix)
    const thrillBonus = guestBonuses.thrills?.value ?? 0
    return 1 + thrillBonus
  }

  /**
   * Get advisor tip based on current game state
   * Returns the most important tip for the player
   */
  static getAdvisorTip(state: GameState): AdvisorTip | null {
    const stats = this.calculateUnifiedStats(state)
    const rating = this.calculateRating(state)
    const phase = this.getPhase(state.currentDay)

    // Priority 1: No entertainment at all
    if (state.stats.entertainment === 0) {
      return {
        priority: 'critical',
        message: 'Build your first ride to attract guests!',
        action: 'Build',
        actionType: 'build_rides',
      }
    }

    // Priority 2: No guests but have entertainment
    if (stats.currentGuests === 0 && state.stats.entertainment > 0) {
      return {
        priority: 'warning',
        message: 'Guests will start arriving soon. Keep building!',
      }
    }

    // Priority 3: Fun is critically low
    if (rating.funStatus === 'critical' && stats.currentGuests > 0) {
      return {
        priority: 'critical',
        message: 'Guests are bored! Build more rides.',
        action: 'Build Rides',
        actionType: 'build_rides',
      }
    }

    // Priority 4: Comfort is critically low (only show if unlocked)
    if (phase !== 'discovery' && rating.comfortStatus === 'critical' && stats.currentGuests > 0) {
      return {
        priority: 'critical',
        message: 'Guests are uncomfortable! Add food stalls or rest areas.',
        action: 'Build Support',
        actionType: 'build_food',
      }
    }

    // Priority 5: At capacity
    if (stats.currentGuests >= stats.capacity * 0.95) {
      if (phase === 'growth' || phase === 'mastery') {
        return {
          priority: 'warning',
          message: 'Park is full! Build lodging to welcome more guests.',
          action: 'Build Lodging',
          actionType: 'build_lodging',
        }
      } else {
        return {
          priority: 'suggestion',
          message: 'Park is popular! Keep it up.',
        }
      }
    }

    // Priority 6: Fun is low
    if (rating.funStatus === 'low') {
      return {
        priority: 'warning',
        message: 'Guests want more entertainment. Add variety!',
        action: 'Build Rides',
        actionType: 'build_rides',
      }
    }

    // Priority 7: Comfort is low (only show if unlocked)
    if (phase !== 'discovery' && rating.comfortStatus === 'low') {
      return {
        priority: 'warning',
        message: 'Guests need more food and rest areas.',
        action: 'Build Support',
        actionType: 'build_food',
      }
    }

    // Priority 8: Everything is great!
    if (rating.stars >= 4.5) {
      return {
        priority: 'praise',
        message: 'Your park is amazing! Guests love it here.',
      }
    }

    // Priority 9: Doing well
    if (rating.stars >= 3.5) {
      return {
        priority: 'suggestion',
        message: 'Park is doing well. Keep expanding!',
      }
    }

    // Default: no tip needed
    return null
  }

  /**
   * Get all advisor tips (for a full advice panel)
   */
  static getAllAdvisorTips(state: GameState): AdvisorTip[] {
    const tips: AdvisorTip[] = []
    const stats = this.calculateUnifiedStats(state)
    const rating = this.calculateRating(state)
    const phase = this.getPhase(state.currentDay)

    // Fun-related tips
    if (state.stats.entertainment === 0) {
      tips.push({
        priority: 'critical',
        message: 'Build your first ride to attract guests!',
        action: 'Build',
        actionType: 'build_rides',
      })
    } else if (rating.funStatus === 'critical') {
      tips.push({
        priority: 'critical',
        message: 'Guests are bored! Build more rides.',
        action: 'Build Rides',
        actionType: 'build_rides',
      })
    } else if (rating.funStatus === 'low') {
      tips.push({
        priority: 'warning',
        message: 'Add more variety to your rides.',
        action: 'Build Rides',
        actionType: 'build_rides',
      })
    }

    // Comfort-related tips (only in comfort+ phases)
    if (phase !== 'discovery') {
      if (rating.comfortStatus === 'critical' && stats.currentGuests > 0) {
        tips.push({
          priority: 'critical',
          message: 'Guests are hungry and tired! Add food and rest areas.',
          action: 'Build Support',
          actionType: 'build_food',
        })
      } else if (rating.comfortStatus === 'low') {
        tips.push({
          priority: 'warning',
          message: 'More food stalls would keep guests happy.',
          action: 'Build Support',
          actionType: 'build_food',
        })
      }
    }

    // Capacity tips (only in growth+ phases)
    if (phase === 'growth' || phase === 'mastery') {
      if (stats.currentGuests >= stats.capacity * 0.95) {
        tips.push({
          priority: 'warning',
          message: 'Park is at capacity! Build lodging to grow.',
          action: 'Build Lodging',
          actionType: 'build_lodging',
        })
      } else if (stats.currentGuests >= stats.capacity * 0.8) {
        tips.push({
          priority: 'suggestion',
          message: 'Getting crowded! Consider more lodging soon.',
          action: 'Build Lodging',
          actionType: 'build_lodging',
        })
      }
    }

    // Positive feedback
    if (rating.stars >= 4.5) {
      tips.push({
        priority: 'praise',
        message: 'Guests absolutely love your park!',
      })
    }

    return tips
  }
}
