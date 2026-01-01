import type { MilestoneDef, GameState } from '../engine/game-types'
import { Requirements } from '../engine/requirements'
import { Timeline } from './timeline'
import type { ComputedRates } from '../engine/modifiers'
import { Service } from './service'

export class Milestone {
  static readonly FIRST_BUILDING: MilestoneDef = {
    id: 'first_building',
    name: 'Grand Opening',
    emoji: '🎉',
    description: 'Build your first attraction',
    condition: { type: 'building', id: 'carousel' },
  }

  static readonly GUESTS_10: MilestoneDef = {
    id: 'guests_10',
    name: 'Getting Popular',
    emoji: '👥',
    description: 'Have 10 guests in your park',
    condition: { type: 'stat', statId: 'guests', min: 10 },
  }

  static readonly GUESTS_50: MilestoneDef = {
    id: 'guests_50',
    name: 'Crowd Pleaser',
    emoji: '🎊',
    description: 'Have 50 guests in your park',
    condition: { type: 'stat', statId: 'guests', min: 50 },
  }

  static readonly GUESTS_100: MilestoneDef = {
    id: 'guests_100',
    name: 'Theme Park Tycoon',
    emoji: '🏆',
    description: 'Have 100 guests in your park',
    condition: { type: 'stat', statId: 'guests', min: 100 },
  }

  static readonly DAY_10: MilestoneDef = {
    id: 'day_10',
    name: 'Established',
    emoji: '📅',
    description: 'Survive 10 days',
    condition: { type: 'day', min: 10 },
  }

  static readonly DAY_30: MilestoneDef = {
    id: 'day_30',
    name: 'Veteran',
    emoji: '🎖️',
    description: 'Survive 30 days',
    condition: { type: 'day', min: 30 },
  }

  static readonly MONEY_1000: MilestoneDef = {
    id: 'money_1000',
    name: 'Making Bank',
    emoji: '💰',
    description: 'Accumulate $1000',
    condition: { type: 'stat', statId: 'money', min: 1000 },
  }

  // Lodging milestones
  static readonly FIRST_LODGING: MilestoneDef = {
    id: 'first_lodging',
    name: 'Overnight Stays',
    emoji: '🏕️',
    description: 'Unlock your first lodging tier',
    condition: { type: 'perk', id: 'lodging_1' },
  }

  static readonly GUESTS_200: MilestoneDef = {
    id: 'guests_200',
    name: 'Rising Star',
    emoji: '🌟',
    description: 'Have 200 guests in your park',
    condition: { type: 'stat', statId: 'guests', min: 200 },
  }

  static readonly GUESTS_300: MilestoneDef = {
    id: 'guests_300',
    name: 'Park Sensation',
    emoji: '✨',
    description: 'Have 300 guests in your park',
    condition: { type: 'stat', statId: 'guests', min: 300 },
  }

  static readonly GUESTS_500: MilestoneDef = {
    id: 'guests_500',
    name: 'Legendary Park',
    emoji: '👑',
    description: 'Have 500 guests in your park',
    condition: { type: 'stat', statId: 'guests', min: 500 },
  }

  static readonly RESORT_MOGUL: MilestoneDef = {
    id: 'resort_mogul',
    name: 'Resort Mogul',
    emoji: '🏰',
    description: 'Unlock all lodging tiers',
    condition: { type: 'perk', id: 'lodging_3' },
  }

  // Beauty milestones
  static readonly BEAUTY_50: MilestoneDef = {
    id: 'beauty_50',
    name: 'Picture Perfect',
    emoji: '🌸',
    description: 'Reach 50% park beauty',
    condition: { type: 'stat', statId: 'beauty', min: 50 },
  }

  static readonly BEAUTY_80: MilestoneDef = {
    id: 'beauty_80',
    name: 'Garden Paradise',
    emoji: '🌺',
    description: 'Reach 80% park beauty',
    condition: { type: 'stat', statId: 'beauty', min: 80 },
  }

  static readonly ALL: MilestoneDef[] = [
    Milestone.FIRST_BUILDING,
    Milestone.GUESTS_10,
    Milestone.GUESTS_50,
    Milestone.GUESTS_100,
    Milestone.GUESTS_200,
    Milestone.GUESTS_300,
    Milestone.GUESTS_500,
    Milestone.DAY_10,
    Milestone.DAY_30,
    Milestone.MONEY_1000,
    Milestone.FIRST_LODGING,
    Milestone.RESORT_MOGUL,
    Milestone.BEAUTY_50,
    Milestone.BEAUTY_80,
    // Service milestones
    ...Object.values(Service.MILESTONES),
  ]

  static getById(id: string): MilestoneDef | undefined {
    return this.ALL.find(m => m.id === id)
  }

  static isAchieved(milestone: MilestoneDef, state: GameState): boolean {
    return Timeline.hasAchievedMilestone(milestone.id, state)
  }

  static checkCondition(milestone: MilestoneDef, state: GameState): boolean {
    return Requirements.check(milestone.condition, state)
  }

  static getNewlyAchieved(state: GameState): MilestoneDef[] {
    return this.ALL.filter(
      m => !this.isAchieved(m, state) && this.checkCondition(m, state)
    )
  }

  static getProgress(milestone: MilestoneDef, state: GameState): number {
    const { condition } = milestone

    switch (condition.type) {
      case 'stat':
        if (condition.min === undefined) return 1
        return Math.min(1, state.stats[condition.statId] / condition.min)
      case 'day':
        return Math.min(1, state.currentDay / condition.min)
      case 'building':
      case 'milestone':
      case 'perk':
        return Requirements.check(condition, state) ? 1 : 0
    }
  }

  static estimateAchievedDay(
    milestone: MilestoneDef,
    startDay: number,
    startStats: Record<string, number>,
    rates: ComputedRates,
    endDay: number
  ): number {
    const { condition } = milestone

    switch (condition.type) {
      case 'day':
        return Math.max(startDay, condition.min)
      case 'stat': {
        if (condition.min === undefined) return startDay
        const currentValue = startStats[condition.statId] ?? 0
        if (currentValue >= condition.min) return startDay
        const rate = rates[condition.statId] ?? 0
        if (rate <= 0) return endDay
        const daysNeeded = (condition.min - currentValue) / rate
        return Math.min(endDay, Math.floor(startDay + daysNeeded))
      }
      case 'building':
      case 'milestone':
      case 'perk':
        return endDay
    }
  }
}
