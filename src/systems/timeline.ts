import type { TimelineEntry, GameState } from '../engine/game-types'
import { Milestone } from './milestone'

type FlavorText = {
  title: string
  description: string
}

const MILESTONE_FLAVOR: Record<string, FlavorText> = {
  first_building: {
    title: 'The adventure begins!',
    description: 'Our very first attraction opens its doors. Dreams are made of spinning horses.',
  },
  guests_10: {
    title: 'Word is spreading',
    description: 'Ten guests! The park is starting to buzz with excitement.',
  },
  guests_50: {
    title: 'Quite the crowd',
    description: 'Fifty visitors exploring our little corner of joy.',
  },
  guests_100: {
    title: 'A real destination',
    description: 'One hundred guests! We did it. This is no longer just a park—it\'s a phenomenon.',
  },
  day_10: {
    title: 'Still standing',
    description: 'Ten days of operation. The foundation is set.',
  },
  day_30: {
    title: 'A month of magic',
    description: 'Thirty days of laughter, thrills, and cotton candy.',
  },
  money_1000: {
    title: 'The vault grows',
    description: 'A thousand dollars saved. The future looks bright.',
  },
}

export class Timeline {
  static getFlavorText(milestoneId: string): FlavorText {
    return (
      MILESTONE_FLAVOR[milestoneId] ?? {
        title: 'A new achievement',
        description: 'Another milestone in our park\'s story.',
      }
    )
  }

  static getEntries(state: GameState): TimelineEntry[] {
    return [...state.timeline].sort((a, b) => b.day - a.day)
  }

  static getEntriesPaginated(
    state: GameState,
    page: number,
    pageSize: number = 5
  ): { entries: TimelineEntry[]; hasMore: boolean } {
    const sorted = this.getEntries(state)
    const start = 0
    const end = (page + 1) * pageSize
    const entries = sorted.slice(start, end)
    const hasMore = end < sorted.length

    return { entries, hasMore }
  }

  static getMilestoneForEntry(entry: TimelineEntry) {
    return Milestone.getById(entry.milestoneId)
  }

  static hasAchievedMilestone(milestoneId: string, state: GameState): boolean {
    return state.timeline.some((e) => e.milestoneId === milestoneId)
  }

  static addEntry(
    timeline: TimelineEntry[],
    milestoneId: string,
    day: number
  ): TimelineEntry[] {
    return [...timeline, { milestoneId, day: Math.floor(day) }]
  }
}
