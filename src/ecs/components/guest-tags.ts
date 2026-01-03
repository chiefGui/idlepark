/**
 * Guest Tag Components
 *
 * Tags are pure data describing guest characteristics.
 * Each tag has a percentage (0-100) indicating what portion of guests have it.
 */

// =============================================================================
// BEHAVIOR TAGS
// =============================================================================

/** Behavior tags - what guests do/want */
export type BehaviorTag = 'bigSpenders' | 'largeGroups' | 'influencers' | 'thrillSeekers'

export const BEHAVIOR_TAGS: readonly BehaviorTag[] = [
  'bigSpenders',
  'largeGroups',
  'influencers',
  'thrillSeekers',
] as const

/** Behavior tag distribution (percentages, sum to 100) */
export type BehaviorTagMix = Record<BehaviorTag, number>

/** Tag metadata for display */
export type TagMeta = {
  name: string
  emoji: string
  color: string
  bonus: string      // What they're good at (concrete language)
  penalty: string    // The tradeoff (concrete language)
}

export const BEHAVIOR_TAG_META: Record<BehaviorTag, TagMeta> = {
  bigSpenders: {
    name: 'Big Spenders',
    emoji: '💎',
    color: '#a855f7',  // Purple
    bonus: '+25% tickets',
    penalty: '-10% arrivals',
  },
  largeGroups: {
    name: 'Large Groups',
    emoji: '👨‍👩‍👧‍👦',
    color: '#3b82f6',  // Blue
    bonus: '+30% arrivals',
    penalty: '-15% per-guest income',
  },
  influencers: {
    name: 'Influencers',
    emoji: '📱',
    color: '#ec4899',  // Pink
    bonus: '+20% arrivals',
    penalty: '+10% departure rate',
  },
  thrillSeekers: {
    name: 'Thrill Seekers',
    emoji: '🎢',
    color: '#ef4444',  // Red
    bonus: '+15% ride appeal',
    penalty: '-20% shop income',
  },
}

// =============================================================================
// MOOD TAGS
// =============================================================================

/** Mood tags - how guests feel */
export type MoodTag = 'happy' | 'unhappy'

export const MOOD_TAGS: readonly MoodTag[] = ['happy', 'unhappy'] as const

/** Mood distribution (percentages, remainder is neutral) */
export type MoodTagMix = Record<MoodTag, number>

export const MOOD_TAG_META: Record<MoodTag, TagMeta> = {
  happy: {
    name: 'Happy',
    emoji: '😊',
    color: '#22c55e',  // Green
    bonus: '+15% income',
    penalty: '',  // No penalty for happy guests
  },
  unhappy: {
    name: 'Unhappy',
    emoji: '😠',
    color: '#ef4444',  // Red
    bonus: '',  // No bonus for unhappy guests
    penalty: '-20% income, +50% departures',
  },
}

// =============================================================================
// COMBINED GUEST STATE
// =============================================================================

/**
 * Complete guest component state.
 * This is the "component" that systems operate on.
 */
export type GuestComponents = {
  behavior: BehaviorTagMix
  mood: MoodTagMix
}

/**
 * Create initial/default behavior tag distribution.
 * Even split across all tags.
 */
export function createDefaultBehaviorMix(): BehaviorTagMix {
  return {
    bigSpenders: 25,
    largeGroups: 25,
    influencers: 25,
    thrillSeekers: 25,
  }
}

/**
 * Create initial mood distribution (all neutral = no happy/unhappy).
 */
export function createDefaultMoodMix(): MoodTagMix {
  return {
    happy: 0,
    unhappy: 0,
  }
}

// =============================================================================
// COMPONENT REGISTRY EXTENSION
// =============================================================================

// Extend the global component registry
declare module '../types' {
  interface ComponentRegistry {
    guestBehavior: BehaviorTagMix
    guestMood: MoodTagMix
  }
}
