import type { StatId } from '../engine/game-types'

/**
 * Short labels for stats - used in compact displays like effect chips.
 */
const STAT_LABELS: Record<StatId | 'capacity', string> = {
  money: '$',
  guests: 'guests',
  entertainment: 'fun',
  food: 'food',
  comfort: 'comfort',
  cleanliness: 'clean',
  beauty: 'beauty',
  appeal: 'appeal',
  capacity: 'capacity',
}

/**
 * Centralized formatting utilities for consistent display across the app.
 * All methods return clean, integer-based values (no decimals).
 */
export class Format {
  /**
   * Format any number with millification (1k, 1M, 1B)
   * No decimals - always rounds to nearest integer
   */
  static number(value: number): string {
    const absValue = Math.abs(value)
    const sign = value < 0 ? '-' : ''

    if (absValue >= 1_000_000_000) {
      return `${sign}${Math.round(absValue / 1_000_000_000)}B`
    }
    if (absValue >= 1_000_000) {
      return `${sign}${Math.round(absValue / 1_000_000)}M`
    }
    if (absValue >= 1_000) {
      return `${sign}${Math.round(absValue / 1_000)}k`
    }
    return `${sign}${Math.round(absValue)}`
  }

  /**
   * Format money values: $5, $1k, $2M
   */
  static money(value: number): string {
    const absValue = Math.abs(value)
    const sign = value < 0 ? '-' : ''

    if (absValue >= 1_000_000_000) {
      return `${sign}$${Math.round(absValue / 1_000_000_000)}B`
    }
    if (absValue >= 1_000_000) {
      return `${sign}$${Math.round(absValue / 1_000_000)}M`
    }
    if (absValue >= 1_000) {
      return `${sign}$${Math.round(absValue / 1_000)}k`
    }
    return `${sign}$${Math.round(absValue)}`
  }

  /**
   * Format guest counts: 5, 1k, 2M
   */
  static guests(value: number): string {
    return Format.number(Math.abs(value))
  }

  /**
   * Format percentages: 75%
   */
  static percent(value: number): string {
    return `${Math.round(value)}%`
  }

  /**
   * Format rates with sign: +5, -2, +1k
   * For displaying change rates (without /day suffix)
   */
  static rate(value: number): string {
    if (value === 0) return '0'
    const sign = value > 0 ? '+' : ''
    return `${sign}${Format.number(value)}`
  }

  /**
   * Format rates per day: +5/day, -2k/day
   */
  static ratePerDay(value: number): string {
    if (value === 0) return '0/day'
    return `${Format.rate(value)}/day`
  }

  /**
   * Format duration in days: 7d or 7 days
   */
  static days(value: number, abbreviated = true): string {
    const rounded = Math.ceil(value)
    return abbreviated ? `${rounded}d` : `${rounded} day${rounded !== 1 ? 's' : ''}`
  }

  // Legacy alias for backwards compatibility during migration
  static millify(value: number, _decimals = 0): string {
    return Format.number(value)
  }

  /**
   * Get short label for a stat ID.
   */
  static statLabel(statId: StatId | 'capacity'): string {
    return STAT_LABELS[statId] ?? statId
  }

  /**
   * Format an effect value with sign and label.
   * e.g., "+5 fun", "-2 $", "+20 capacity"
   */
  static effect(value: number, statId: StatId | 'capacity'): string {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value} ${Format.statLabel(statId)}`
  }
}
