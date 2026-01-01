/**
 * Calendar utility for converting game days to real-world dates.
 * The park opens on January 1st, 2026 - Day 1 = Jan 1, 2026.
 */

import type { Season } from '../engine/game-types'

export type CalendarDate = {
  /** Game day (1-indexed) */
  day: number
  /** Day of month (1-31) */
  dayOfMonth: number
  /** Month (1-12) */
  month: number
  /** Full year (e.g., 2026) */
  year: number
  /** Day of week (0 = Sunday, 6 = Saturday) */
  dayOfWeek: number
  /** Current season */
  season: Season
  /** Whether this is a weekend (Saturday or Sunday) */
  isWeekend: boolean
  /** The underlying Date object */
  date: Date
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Calendar system for the game.
 * Day 1 = January 1st, 2026.
 */
export class Calendar {
  /** The park's opening date - Day 1 */
  static readonly START_DATE = new Date(2026, 0, 1) // Jan 1, 2026

  /**
   * Convert a game day to a CalendarDate object.
   * Day 1 = January 1st, 2026.
   */
  static fromDay(gameDay: number): CalendarDate {
    // Day 1 should be Jan 1, 2026, so we add (gameDay - 1) days
    const date = new Date(this.START_DATE)
    date.setDate(date.getDate() + Math.floor(gameDay) - 1)

    const month = date.getMonth() + 1 // 1-indexed
    const dayOfWeek = date.getDay()

    return {
      day: Math.floor(gameDay),
      dayOfMonth: date.getDate(),
      month,
      year: date.getFullYear(),
      dayOfWeek,
      season: this.getSeason(month),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      date,
    }
  }

  /**
   * Get the season for a given month (1-12).
   */
  static getSeason(month: number): Season {
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'fall'
    return 'winter'
  }

  /**
   * Get the season for a game day.
   */
  static getSeasonForDay(gameDay: number): Season {
    return this.fromDay(gameDay).season
  }

  // ─────────────────────────────────────────────────────────────
  // Formatting
  // ─────────────────────────────────────────────────────────────

  /**
   * Format as compact date: "Jan 1, 2026"
   */
  static formatCompact(gameDay: number): string {
    const cal = this.fromDay(gameDay)
    return `${MONTH_NAMES_SHORT[cal.month - 1]} ${cal.dayOfMonth}, ${cal.year}`
  }

  /**
   * Format as full date: "January 1st, 2026"
   */
  static formatFull(gameDay: number): string {
    const cal = this.fromDay(gameDay)
    const ordinal = this.getOrdinal(cal.dayOfMonth)
    return `${MONTH_NAMES[cal.month - 1]} ${cal.dayOfMonth}${ordinal}, ${cal.year}`
  }

  /**
   * Format as short date: "Jan 1"
   */
  static formatShort(gameDay: number): string {
    const cal = this.fromDay(gameDay)
    return `${MONTH_NAMES_SHORT[cal.month - 1]} ${cal.dayOfMonth}`
  }

  /**
   * Format with day of week: "Monday, Jan 1"
   */
  static formatWithWeekday(gameDay: number): string {
    const cal = this.fromDay(gameDay)
    return `${DAY_NAMES[cal.dayOfWeek]}, ${MONTH_NAMES_SHORT[cal.month - 1]} ${cal.dayOfMonth}`
  }

  /**
   * Format with short weekday: "Mon, Jan 1"
   */
  static formatWithShortWeekday(gameDay: number): string {
    const cal = this.fromDay(gameDay)
    return `${DAY_NAMES_SHORT[cal.dayOfWeek]}, ${MONTH_NAMES_SHORT[cal.month - 1]} ${cal.dayOfMonth}`
  }

  /**
   * Get just the month and year: "January 2026"
   */
  static formatMonthYear(gameDay: number): string {
    const cal = this.fromDay(gameDay)
    return `${MONTH_NAMES[cal.month - 1]} ${cal.year}`
  }

  /**
   * Get just the month (short): "Jan"
   */
  static getMonthShort(gameDay: number): string {
    const cal = this.fromDay(gameDay)
    return MONTH_NAMES_SHORT[cal.month - 1]
  }

  /**
   * Get just the month (full): "January"
   */
  static getMonthFull(gameDay: number): string {
    const cal = this.fromDay(gameDay)
    return MONTH_NAMES[cal.month - 1]
  }

  /**
   * Get the day of week: "Monday"
   */
  static getDayOfWeek(gameDay: number): string {
    const cal = this.fromDay(gameDay)
    return DAY_NAMES[cal.dayOfWeek]
  }

  /**
   * Get the day of week (short): "Mon"
   */
  static getDayOfWeekShort(gameDay: number): string {
    const cal = this.fromDay(gameDay)
    return DAY_NAMES_SHORT[cal.dayOfWeek]
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  /**
   * Get ordinal suffix for a day (1st, 2nd, 3rd, 4th, etc.)
   */
  static getOrdinal(day: number): string {
    if (day > 3 && day < 21) return 'th'
    switch (day % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  /**
   * Check if a game day is a weekend.
   */
  static isWeekend(gameDay: number): boolean {
    return this.fromDay(gameDay).isWeekend
  }

  /**
   * Get the year for a game day.
   */
  static getYear(gameDay: number): number {
    return this.fromDay(gameDay).year
  }

  /**
   * Get the month (1-12) for a game day.
   */
  static getMonth(gameDay: number): number {
    return this.fromDay(gameDay).month
  }

  /**
   * Get the day of month (1-31) for a game day.
   */
  static getDayOfMonth(gameDay: number): number {
    return this.fromDay(gameDay).dayOfMonth
  }

  /**
   * Calculate the game day for a specific date.
   * Returns 1 for Jan 1, 2026.
   */
  static toGameDay(year: number, month: number, dayOfMonth: number): number {
    const target = new Date(year, month - 1, dayOfMonth)
    const diffTime = target.getTime() - this.START_DATE.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
  }

  /**
   * Get the first day of the current month.
   */
  static getFirstDayOfMonth(gameDay: number): number {
    const cal = this.fromDay(gameDay)
    return this.toGameDay(cal.year, cal.month, 1)
  }

  /**
   * Get the number of days in the current month.
   */
  static getDaysInMonth(gameDay: number): number {
    const cal = this.fromDay(gameDay)
    return new Date(cal.year, cal.month, 0).getDate()
  }

  /**
   * Check if two game days are in the same month.
   */
  static isSameMonth(day1: number, day2: number): boolean {
    const cal1 = this.fromDay(day1)
    const cal2 = this.fromDay(day2)
    return cal1.year === cal2.year && cal1.month === cal2.month
  }

  /**
   * Check if two game days are in the same year.
   */
  static isSameYear(day1: number, day2: number): boolean {
    return this.getYear(day1) === this.getYear(day2)
  }

  // ─────────────────────────────────────────────────────────────
  // Season helpers
  // ─────────────────────────────────────────────────────────────

  /**
   * Get season emoji.
   */
  static getSeasonEmoji(season: Season): string {
    switch (season) {
      case 'spring': return '🌸'
      case 'summer': return '☀️'
      case 'fall': return '🍂'
      case 'winter': return '❄️'
    }
  }

  /**
   * Get season display name.
   */
  static getSeasonName(season: Season): string {
    return season.charAt(0).toUpperCase() + season.slice(1)
  }

  /**
   * Get season emoji for a game day.
   */
  static getSeasonEmojiForDay(gameDay: number): string {
    return this.getSeasonEmoji(this.getSeasonForDay(gameDay))
  }
}
