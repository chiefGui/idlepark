import type { HappeningDef, HappeningType, GameState, HappeningState } from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import type { Modifier } from '../engine/modifiers'

// === HAPPENING DEFINITIONS ===

const HAPPENINGS: HappeningDef[] = [
  // === POSITIVE HAPPENINGS ===
  {
    id: 'summer_festival',
    name: 'Summer Festival',
    emoji: '🎪',
    description: 'A vibrant festival draws crowds from across the region!',
    type: 'positive',
    modifiers: [
      { stat: 'guests', increased: 40 }, // +40% guest arrival
    ],
  },
  {
    id: 'viral_review',
    name: 'Viral Review',
    emoji: '⭐',
    description: 'A glowing review goes viral on social media!',
    type: 'positive',
    modifiers: [
      { stat: 'satisfaction', flat: 15 }, // +15 flat satisfaction
    ],
  },
  {
    id: 'corporate_sponsorship',
    name: 'Corporate Sponsorship',
    emoji: '💼',
    description: 'A major corporation sponsors your park!',
    type: 'positive',
    modifiers: [
      { stat: 'money', increased: 30 }, // +30% income
    ],
  },

  // === NEGATIVE HAPPENINGS ===
  {
    id: 'heat_wave',
    name: 'Heat Wave',
    emoji: '🌡️',
    description: 'Scorching temperatures increase demand for refreshments.',
    type: 'negative',
    modifiers: [
      { stat: 'food', more: 1.5 }, // 50% more food consumption (negative because food rate is usually negative from guests)
    ],
  },
  {
    id: 'nearby_construction',
    name: 'Nearby Construction',
    emoji: '🚧',
    description: 'Construction noise and traffic deter some visitors.',
    type: 'negative',
    modifiers: [
      { stat: 'appeal', flat: -15 }, // -15 appeal
    ],
  },
  {
    id: 'economic_downturn',
    name: 'Economic Downturn',
    emoji: '📉',
    description: 'Tough economic times mean tighter wallets.',
    type: 'negative',
    modifiers: [
      { stat: 'money', more: 0.75 }, // -25% income
    ],
  },
]

// === FLAVOR TEXT FOR TIMELINE ===

type HappeningFlavorText = {
  started: { title: string; description: string }
  ended: { title: string; description: string }
}

const HAPPENING_FLAVOR: Record<string, HappeningFlavorText> = {
  summer_festival: {
    started: {
      title: 'The festival begins!',
      description: 'Music fills the air as the Summer Festival kicks off. Visitors are pouring in!',
    },
    ended: {
      title: 'Festival winds down',
      description: 'The Summer Festival has ended, but the memories will last forever.',
    },
  },
  viral_review: {
    started: {
      title: 'Going viral!',
      description: 'A rave review is spreading like wildfire across social media. Everyone\'s talking about us!',
    },
    ended: {
      title: 'Back to normal',
      description: 'The viral buzz has faded, but we\'ve made some new fans along the way.',
    },
  },
  corporate_sponsorship: {
    started: {
      title: 'Sponsorship secured!',
      description: 'A major corporation has partnered with the park. The extra funding is rolling in!',
    },
    ended: {
      title: 'Sponsorship concludes',
      description: 'The sponsorship deal has ended. Time to stand on our own again.',
    },
  },
  heat_wave: {
    started: {
      title: 'Heat wave hits!',
      description: 'Temperatures are soaring! Guests are demanding more refreshments than ever.',
    },
    ended: {
      title: 'Cool relief',
      description: 'The heat wave has finally broken. Everyone can breathe a little easier.',
    },
  },
  nearby_construction: {
    started: {
      title: 'Construction chaos',
      description: 'Road work and building noise nearby are making the park harder to reach and enjoy.',
    },
    ended: {
      title: 'Peace restored',
      description: 'The construction has finished. The park\'s charm is shining through again.',
    },
  },
  economic_downturn: {
    started: {
      title: 'Economic troubles',
      description: 'A downturn in the economy means visitors are spending less. Tough times ahead.',
    },
    ended: {
      title: 'Economy recovering',
      description: 'The economic situation is improving. Wallets are opening up again!',
    },
  },
}

// === HAPPENING CLASS ===

export class Happening {
  static getAll(): HappeningDef[] {
    return HAPPENINGS
  }

  static getById(id: string): HappeningDef | undefined {
    return HAPPENINGS.find((h) => h.id === id)
  }

  static getByType(type: HappeningType): HappeningDef[] {
    return HAPPENINGS.filter((h) => h.type === type)
  }

  static getFlavorText(happeningId: string, event: 'started' | 'ended'): { title: string; description: string } {
    const flavor = HAPPENING_FLAVOR[happeningId]
    if (!flavor) {
      return {
        title: event === 'started' ? 'Something is happening!' : 'Things return to normal',
        description: 'An event has occurred at the park.',
      }
    }
    return flavor[event]
  }

  /**
   * Get modifiers for an active happening
   */
  static getModifiers(happeningId: string): Modifier[] {
    const happening = this.getById(happeningId)
    if (!happening) return []

    return happening.modifiers.map((mod) => ({
      source: { type: 'happening' as const, happeningId },
      stat: mod.stat,
      flat: mod.flat,
      increased: mod.increased,
      more: mod.more,
    }))
  }

  /**
   * Check if a happening is currently active
   */
  static isActive(state: GameState): boolean {
    return state.currentHappening !== null
  }

  /**
   * Get the current active happening definition
   */
  static getCurrent(state: GameState): HappeningDef | null {
    if (!state.currentHappening) return null
    return this.getById(state.currentHappening.happeningId) ?? null
  }

  /**
   * Get remaining days for the current happening
   */
  static getRemainingDays(state: GameState): number {
    if (!state.currentHappening) return 0
    return Math.max(0, Math.ceil(state.currentHappening.endDay - state.currentDay))
  }

  /**
   * Select a random happening, avoiding the same type as the last one
   */
  static selectNext(lastType: HappeningType | null): HappeningDef {
    // Determine which type to pick (alternate if we have a last type)
    let targetType: HappeningType
    if (lastType === null) {
      // First happening - random choice
      targetType = Math.random() < 0.5 ? 'positive' : 'negative'
    } else {
      // Alternate: if last was positive, pick negative and vice versa
      targetType = lastType === 'positive' ? 'negative' : 'positive'
    }

    const candidates = this.getByType(targetType)
    const randomIndex = Math.floor(Math.random() * candidates.length)
    return candidates[randomIndex]
  }

  /**
   * Calculate the next happening day (random within interval)
   */
  static calculateNextDay(currentDay: number): number {
    const interval = GameTypes.HAPPENING_INTERVAL_MIN +
      Math.random() * (GameTypes.HAPPENING_INTERVAL_MAX - GameTypes.HAPPENING_INTERVAL_MIN)
    return Math.floor(currentDay + interval)
  }

  /**
   * Start a new happening
   */
  static start(state: GameState, happeningId: string): HappeningState {
    return {
      happeningId,
      startDay: Math.floor(state.currentDay),
      endDay: Math.floor(state.currentDay) + GameTypes.HAPPENING_DURATION,
    }
  }

  /**
   * Check if a happening should end
   */
  static shouldEnd(state: GameState): boolean {
    if (!state.currentHappening) return false
    return state.currentDay >= state.currentHappening.endDay
  }

  /**
   * Check if a new happening should start
   */
  static shouldStart(state: GameState): boolean {
    if (state.currentHappening) return false
    return state.currentDay >= state.nextHappeningDay
  }
}
