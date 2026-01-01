import type {
  HappeningDef,
  HappeningType,
  HappeningState,
  GameState,
  Season,
  BuildingCategory,
  StatEffect,
} from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import type { Modifier } from '../engine/modifiers'
import { Calendar } from '../utils/calendar'

// === HAPPENING DEFINITIONS ===

const HAPPENINGS: HappeningDef[] = [
  // === YEAR-ROUND HAPPENINGS ===
  {
    id: 'viral_review',
    name: 'Viral Review',
    emoji: '⭐',
    description: 'A glowing review goes viral on social media!',
    type: 'positive',
    effects: [
      { type: 'stat', stat: 'appeal', flat: 20 },
    ],
  },
  {
    id: 'corporate_sponsorship',
    name: 'Corporate Sponsorship',
    emoji: '💼',
    description: 'A major corporation sponsors your park!',
    type: 'positive',
    effects: [
      { type: 'ticketIncome', multiplier: 1.3 },
    ],
  },
  {
    id: 'nearby_construction',
    name: 'Nearby Construction',
    emoji: '🚧',
    description: 'Construction noise and traffic deter some visitors.',
    type: 'negative',
    effects: [
      { type: 'stat', stat: 'appeal', flat: -15 },
    ],
  },
  {
    id: 'economic_downturn',
    name: 'Economic Downturn',
    emoji: '📉',
    description: 'Tough economic times mean tighter wallets.',
    type: 'negative',
    effects: [
      { type: 'ticketIncome', multiplier: 0.75 },
    ],
  },

  // === SPRING HAPPENINGS ===
  {
    id: 'spring_bloom',
    name: 'Spring Bloom Festival',
    emoji: '🌸',
    description: 'Cherry blossoms draw visitors from far and wide!',
    type: 'positive',
    season: 'spring',
    effects: [
      { type: 'stat', stat: 'beauty', flat: 25 },
      { type: 'arrival', multiplier: 1.3 },
    ],
  },
  {
    id: 'spring_sale',
    name: 'Spring Construction Sale',
    emoji: '🏗️',
    description: 'Contractors offer seasonal discounts on new builds!',
    type: 'positive',
    season: 'spring',
    effects: [
      { type: 'buildingCost', multiplier: 0.75 },
    ],
  },
  {
    id: 'april_showers',
    name: 'April Showers',
    emoji: '🌧️',
    description: 'Persistent rain keeps some visitors away.',
    type: 'negative',
    season: 'spring',
    effects: [
      { type: 'arrival', multiplier: 0.7 },
      { type: 'stat', stat: 'cleanliness', flat: -10 },
    ],
  },

  // === SUMMER HAPPENINGS ===
  {
    id: 'summer_festival',
    name: 'Summer Festival',
    emoji: '🎪',
    description: 'A vibrant festival draws crowds from across the region!',
    type: 'positive',
    season: 'summer',
    effects: [
      { type: 'arrival', multiplier: 1.5 },
      { type: 'stat', stat: 'appeal', flat: 10 },
    ],
  },
  {
    id: 'summer_blockbuster',
    name: 'Blockbuster Season',
    emoji: '🎬',
    description: 'School\'s out and families are flocking to attractions!',
    type: 'positive',
    season: 'summer',
    effects: [
      { type: 'arrival', multiplier: 1.4 },
      { type: 'ticketIncome', multiplier: 1.15 },
    ],
  },
  {
    id: 'heat_wave',
    name: 'Heat Wave',
    emoji: '🌡️',
    description: 'Scorching temperatures increase demand for refreshments.',
    type: 'negative',
    season: 'summer',
    effects: [
      { type: 'stat', stat: 'food', more: 1.5 },
      { type: 'stat', stat: 'comfort', flat: -15 },
    ],
  },

  // === FALL HAPPENINGS ===
  {
    id: 'harvest_festival',
    name: 'Harvest Festival',
    emoji: '🎃',
    description: 'Autumn decorations and pumpkin spice everything!',
    type: 'positive',
    season: 'fall',
    effects: [
      { type: 'stat', stat: 'beauty', flat: 20 },
      { type: 'stat', stat: 'appeal', flat: 15 },
    ],
  },
  {
    id: 'spooky_season',
    name: 'Spooky Season',
    emoji: '👻',
    description: 'Halloween spirit brings thrill-seekers to the park!',
    type: 'positive',
    season: 'fall',
    effects: [
      { type: 'arrival', multiplier: 1.35 },
      { type: 'buildingCost', category: 'rides', multiplier: 0.85 },
    ],
  },
  {
    id: 'back_to_school',
    name: 'Back to School',
    emoji: '📚',
    description: 'Kids are back in class, fewer families visiting.',
    type: 'negative',
    season: 'fall',
    effects: [
      { type: 'arrival', multiplier: 0.75 },
    ],
  },

  // === WINTER HAPPENINGS ===
  {
    id: 'winter_wonderland',
    name: 'Winter Wonderland',
    emoji: '❄️',
    description: 'Snow transforms the park into a magical destination!',
    type: 'positive',
    season: 'winter',
    effects: [
      { type: 'stat', stat: 'beauty', flat: 30 },
      { type: 'stat', stat: 'appeal', flat: 20 },
    ],
  },
  {
    id: 'holiday_rush',
    name: 'Holiday Rush',
    emoji: '🎄',
    description: 'Families celebrate the season at your park!',
    type: 'positive',
    season: 'winter',
    effects: [
      { type: 'arrival', multiplier: 1.6 },
      { type: 'ticketIncome', multiplier: 1.25 },
    ],
  },
  {
    id: 'cold_snap',
    name: 'Cold Snap',
    emoji: '🥶',
    description: 'Bitter cold discourages outdoor activities.',
    type: 'negative',
    season: 'winter',
    effects: [
      { type: 'arrival', multiplier: 0.6 },
      { type: 'buildingCost', multiplier: 1.2 },
    ],
  },
  {
    id: 'blizzard',
    name: 'Blizzard',
    emoji: '🌨️',
    description: 'Heavy snowfall brings operations to a crawl.',
    type: 'negative',
    season: 'winter',
    effects: [
      { type: 'arrival', multiplier: 0.5 },
      { type: 'stat', stat: 'cleanliness', flat: -20 },
    ],
  },
]

// === FLAVOR TEXT FOR TIMELINE ===

type HappeningFlavorText = {
  started: { title: string; description: string }
  ended: { title: string; description: string }
}

const HAPPENING_FLAVOR: Record<string, HappeningFlavorText> = {
  viral_review: {
    started: { title: 'Going viral!', description: 'A rave review is spreading like wildfire!' },
    ended: { title: 'Back to normal', description: 'The viral buzz has faded, but we made new fans.' },
  },
  corporate_sponsorship: {
    started: { title: 'Sponsorship secured!', description: 'A major corporation has partnered with the park!' },
    ended: { title: 'Sponsorship concludes', description: 'The sponsorship deal has ended.' },
  },
  nearby_construction: {
    started: { title: 'Construction chaos', description: 'Road work nearby is deterring visitors.' },
    ended: { title: 'Peace restored', description: 'The construction has finished!' },
  },
  economic_downturn: {
    started: { title: 'Economic troubles', description: 'Visitors are spending less during tough times.' },
    ended: { title: 'Economy recovering', description: 'Wallets are opening up again!' },
  },
  spring_bloom: {
    started: { title: 'Blossoms everywhere!', description: 'The park is bursting with spring colors!' },
    ended: { title: 'Petals fade', description: 'The cherry blossoms have fallen, but memories remain.' },
  },
  spring_sale: {
    started: { title: 'Construction sale!', description: 'Great deals on new buildings!' },
    ended: { title: 'Sale ends', description: 'Prices return to normal.' },
  },
  april_showers: {
    started: { title: 'Rain, rain...', description: 'Grab your umbrellas, it\'s going to be wet!' },
    ended: { title: 'Skies clearing', description: 'The rain has finally stopped!' },
  },
  summer_festival: {
    started: { title: 'Festival begins!', description: 'Music fills the air as crowds pour in!' },
    ended: { title: 'Festival ends', description: 'The festival is over, but what a blast!' },
  },
  summer_blockbuster: {
    started: { title: 'Summer vacation!', description: 'Families are ready for fun!' },
    ended: { title: 'Summer winds down', description: 'Peak season is coming to a close.' },
  },
  heat_wave: {
    started: { title: 'Heat wave hits!', description: 'Temperatures soaring—keep guests cool!' },
    ended: { title: 'Cool relief', description: 'The heat wave has finally broken.' },
  },
  harvest_festival: {
    started: { title: 'Harvest time!', description: 'Pumpkins and fall vibes everywhere!' },
    ended: { title: 'Harvest concludes', description: 'The autumn decorations come down.' },
  },
  spooky_season: {
    started: { title: 'Boo!', description: 'Ghosts and ghouls have taken over!' },
    ended: { title: 'Spirits depart', description: 'Halloween is over... until next year!' },
  },
  back_to_school: {
    started: { title: 'School\'s in', description: 'Kids are hitting the books, not the rides.' },
    ended: { title: 'Weekend warriors', description: 'Families are finding time to visit again.' },
  },
  winter_wonderland: {
    started: { title: 'Let it snow!', description: 'The park is a winter paradise!' },
    ended: { title: 'Thaw begins', description: 'The magical snow is melting away.' },
  },
  holiday_rush: {
    started: { title: 'Happy holidays!', description: 'Families celebrating at the park!' },
    ended: { title: 'Holidays end', description: 'Back to regular operations.' },
  },
  cold_snap: {
    started: { title: 'Brrr!', description: 'Bundle up—it\'s freezing out there!' },
    ended: { title: 'Warming up', description: 'Temperatures are rising again.' },
  },
  blizzard: {
    started: { title: 'Blizzard warning!', description: 'Heavy snow is piling up!' },
    ended: { title: 'Storm passes', description: 'Time to dig out and clean up.' },
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

  /**
   * Get happenings available for a specific season.
   * Returns happenings that either have no season restriction OR match the given season.
   */
  static getAvailableForSeason(season: Season): HappeningDef[] {
    return HAPPENINGS.filter((h) => {
      if (!h.season) return true // Year-round
      if (Array.isArray(h.season)) return h.season.includes(season)
      return h.season === season
    })
  }

  /**
   * Get happenings available for current game state (season + type).
   */
  static getAvailable(state: GameState, type: HappeningType): HappeningDef[] {
    const season = Calendar.getSeasonForDay(state.currentDay)
    return this.getAvailableForSeason(season).filter((h) => h.type === type)
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

  // === EFFECT HELPERS ===

  /**
   * Get stat modifiers for the current happening (for the modifier system).
   */
  static getModifiers(happeningId: string): Modifier[] {
    const happening = this.getById(happeningId)
    if (!happening) return []

    const statEffects = happening.effects.filter((e): e is StatEffect => e.type === 'stat')

    return statEffects.map((effect) => ({
      source: { type: 'happening' as const, happeningId },
      stat: effect.stat,
      flat: effect.flat,
      increased: effect.increased,
      more: effect.more,
      label: happening.name,
      emoji: happening.emoji,
    }))
  }

  /**
   * Get the building cost multiplier from active happening.
   * Returns 1 if no effect, otherwise the multiplier.
   */
  static getBuildingCostMultiplier(state: GameState, category?: BuildingCategory): number {
    const happening = this.getCurrent(state)
    if (!happening) return 1

    for (const effect of happening.effects) {
      if (effect.type === 'buildingCost') {
        // Apply if no category specified OR categories match
        if (!effect.category || effect.category === category) {
          return effect.multiplier
        }
      }
    }
    return 1
  }

  /**
   * Get the arrival rate multiplier from active happening.
   * Returns 1 if no effect, otherwise the multiplier.
   */
  static getArrivalMultiplier(state: GameState): number {
    const happening = this.getCurrent(state)
    if (!happening) return 1

    for (const effect of happening.effects) {
      if (effect.type === 'arrival') {
        return effect.multiplier
      }
    }
    return 1
  }

  /**
   * Get the ticket income multiplier from active happening.
   * Returns 1 if no effect, otherwise the multiplier.
   */
  static getTicketIncomeMultiplier(state: GameState): number {
    const happening = this.getCurrent(state)
    if (!happening) return 1

    for (const effect of happening.effects) {
      if (effect.type === 'ticketIncome') {
        return effect.multiplier
      }
    }
    return 1
  }

  // === STATE HELPERS ===

  static isActive(state: GameState): boolean {
    return state.currentHappening !== null
  }

  static getCurrent(state: GameState): HappeningDef | null {
    if (!state.currentHappening) return null
    return this.getById(state.currentHappening.happeningId) ?? null
  }

  static getRemainingDays(state: GameState): number {
    if (!state.currentHappening) return 0
    return Math.max(0, Math.ceil(state.currentHappening.endDay - state.currentDay))
  }

  /**
   * Select a random happening, considering season and alternating types.
   */
  static selectNext(state: GameState): HappeningDef {
    const lastType = state.lastHappeningType

    // Alternate types
    let targetType: HappeningType
    if (lastType === null) {
      targetType = Math.random() < 0.5 ? 'positive' : 'negative'
    } else {
      targetType = lastType === 'positive' ? 'negative' : 'positive'
    }

    // Get season-appropriate candidates
    const candidates = this.getAvailable(state, targetType)

    // Fallback to year-round if no seasonal ones
    const pool = candidates.length > 0 ? candidates : this.getByType(targetType)
    const randomIndex = Math.floor(Math.random() * pool.length)
    return pool[randomIndex]
  }

  static calculateNextDay(currentDay: number): number {
    const interval = GameTypes.HAPPENING_INTERVAL_MIN +
      Math.random() * (GameTypes.HAPPENING_INTERVAL_MAX - GameTypes.HAPPENING_INTERVAL_MIN)
    return Math.floor(currentDay + interval)
  }

  static start(state: GameState, happeningId: string): HappeningState {
    return {
      happeningId,
      startDay: Math.floor(state.currentDay),
      endDay: Math.floor(state.currentDay) + GameTypes.HAPPENING_DURATION,
    }
  }

  static shouldEnd(state: GameState): boolean {
    if (!state.currentHappening) return false
    return state.currentDay >= state.currentHappening.endDay
  }

  static shouldStart(state: GameState): boolean {
    if (state.currentHappening) return false
    return state.currentDay >= state.nextHappeningDay
  }
}
