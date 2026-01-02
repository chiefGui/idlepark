import type { Modifier } from '../engine/modifiers'
import type { Season as SeasonType } from '../engine/game-types'
import { Calendar } from '../utils/calendar'

type SeasonDef = {
  id: SeasonType
  name: string
  emoji: string
  buff: { label: string; stat: string; increased: number }
  penalty: { label: string; stat: string; increased: number }
}

const SEASONS: SeasonDef[] = [
  {
    id: 'spring',
    name: 'Spring',
    emoji: '🌸',
    buff: { label: 'Pleasant weather', stat: 'guests', increased: 20 },
    penalty: { label: 'Spring maintenance', stat: 'money', increased: -10 },
  },
  {
    id: 'summer',
    name: 'Summer',
    emoji: '☀️',
    buff: { label: 'Vacation season', stat: 'entertainment', increased: 25 },
    penalty: { label: 'Thirsty guests', stat: 'food', increased: -15 },
  },
  {
    id: 'fall',
    name: 'Fall',
    emoji: '🍂',
    buff: { label: 'Cozy spending', stat: 'money', increased: 15 },
    penalty: { label: 'Back to school', stat: 'guests', increased: -10 },
  },
  {
    id: 'winter',
    name: 'Winter',
    emoji: '❄️',
    buff: { label: 'Holiday shopping', stat: 'money', increased: 20 },
    penalty: { label: 'Cold weather', stat: 'guests', increased: -15 },
  },
]

export class Season {
  /**
   * Get the season definition for a given season ID.
   */
  static getDef(seasonId: SeasonType): SeasonDef {
    return SEASONS.find((s) => s.id === seasonId)!
  }

  /**
   * Get the current season for a game day.
   */
  static getCurrent(gameDay: number): SeasonDef {
    const seasonId = Calendar.getSeasonForDay(gameDay)
    return this.getDef(seasonId)
  }

  /**
   * Get modifiers for the current season.
   */
  static getModifiers(gameDay: number): Modifier[] {
    const season = this.getCurrent(gameDay)
    const source = { type: 'season' as const }

    return [
      {
        source,
        stat: season.buff.stat as Modifier['stat'],
        increased: season.buff.increased,
        label: season.buff.label,
        emoji: season.emoji,
      },
      {
        source,
        stat: season.penalty.stat as Modifier['stat'],
        increased: season.penalty.increased,
        label: season.penalty.label,
        emoji: season.emoji,
      },
    ]
  }

  /**
   * Get the buff and penalty for display in UI.
   */
  static getEffects(gameDay: number): { buff: SeasonDef['buff']; penalty: SeasonDef['penalty'] } {
    const season = this.getCurrent(gameDay)
    return { buff: season.buff, penalty: season.penalty }
  }
}
