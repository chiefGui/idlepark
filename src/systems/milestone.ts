import type { MilestoneDef, GameState } from '../engine/game-types'
import { Requirements } from '../engine/requirements'
import { Timeline } from './timeline'

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

  static readonly ALL: MilestoneDef[] = [
    Milestone.FIRST_BUILDING,
    Milestone.GUESTS_10,
    Milestone.GUESTS_50,
    Milestone.GUESTS_100,
    Milestone.DAY_10,
    Milestone.DAY_30,
    Milestone.MONEY_1000,
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
}
