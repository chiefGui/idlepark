import type { TimelineEntry, GameState, MilestoneTimelineEntry, HappeningTimelineEntry } from '../engine/game-types'
import { Milestone } from './milestone'
import { Happening } from './happening'

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
  // Lodging milestones
  first_lodging: {
    title: 'Home away from home',
    description: 'Guests can now stay overnight. The park never truly closes.',
  },
  guests_200: {
    title: 'Rising through the ranks',
    description: 'Two hundred guests! Our little park is becoming a true destination.',
  },
  guests_300: {
    title: 'The talk of the town',
    description: 'Three hundred souls seeking joy. We\'re making waves.',
  },
  guests_500: {
    title: 'Legendary status achieved',
    description: 'Five hundred guests! They\'ll write stories about this place.',
  },
  resort_mogul: {
    title: 'The complete resort experience',
    description: 'From tents to luxury suites—we offer it all. A hospitality empire.',
  },
}

export class Timeline {
  static getFlavorText(entry: TimelineEntry): FlavorText {
    if (entry.type === 'milestone') {
      return (
        MILESTONE_FLAVOR[entry.milestoneId] ?? {
          title: 'A new achievement',
          description: 'Another milestone in our park\'s story.',
        }
      )
    } else {
      const event = entry.type === 'happening_started' ? 'started' : 'ended'
      return Happening.getFlavorText(entry.happeningId, event)
    }
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

  static getMilestoneForEntry(entry: MilestoneTimelineEntry) {
    return Milestone.getById(entry.milestoneId)
  }

  static getHappeningForEntry(entry: HappeningTimelineEntry) {
    return Happening.getById(entry.happeningId)
  }

  static hasAchievedMilestone(milestoneId: string, state: GameState): boolean {
    return state.timeline.some((e) => e.type === 'milestone' && e.milestoneId === milestoneId)
  }

  static addMilestoneEntry(
    timeline: TimelineEntry[],
    milestoneId: string,
    day: number
  ): TimelineEntry[] {
    return [...timeline, { type: 'milestone' as const, milestoneId, day: Math.floor(day) }]
  }

  // Legacy support - maps to addMilestoneEntry
  static addEntry(
    timeline: TimelineEntry[],
    milestoneId: string,
    day: number
  ): TimelineEntry[] {
    return this.addMilestoneEntry(timeline, milestoneId, day)
  }

  static isMilestoneEntry(entry: TimelineEntry): entry is MilestoneTimelineEntry {
    return entry.type === 'milestone'
  }

  static isHappeningEntry(entry: TimelineEntry): entry is HappeningTimelineEntry {
    return entry.type === 'happening_started' || entry.type === 'happening_ended'
  }
}
