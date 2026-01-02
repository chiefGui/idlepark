import type { Requirement, GameState } from './game-types'
import { Perk } from '../systems/perk'
import { Building } from '../systems/building'
import { Milestone } from '../systems/milestone'
import { Format } from '../utils/format'

export class Requirements {
  static check(req: Requirement, state: GameState): boolean {
    switch (req.type) {
      case 'stat': {
        const value = state.stats[req.statId]
        if (req.min !== undefined && value < req.min) return false
        if (req.max !== undefined && value > req.max) return false
        return true
      }
      case 'day':
        return state.currentDay >= req.min
      case 'milestone':
        return state.timeline.some((e) => e.type === 'milestone' && e.milestoneId === req.id)
      case 'perk':
        return state.ownedPerks.includes(req.id)
      case 'building': {
        const count = state.slots.filter(s => s.buildingId === req.id).length
        return count >= (req.count ?? 1)
      }
    }
  }

  static checkAll(reqs: Requirement[], state: GameState): boolean {
    return reqs.every(req => this.check(req, state))
  }

  static getUnmetRequirements(reqs: Requirement[], state: GameState): Requirement[] {
    return reqs.filter(req => !this.check(req, state))
  }

  static formatRequirement(req: Requirement): string {
    switch (req.type) {
      case 'stat': {
        const label = STAT_LABELS[req.statId] ?? req.statId
        if (req.min !== undefined) return `${Format.number(req.min)}+ ${label}`
        if (req.max !== undefined) return `${label} under ${Format.number(req.max)}`
        return label
      }
      case 'day':
        return `Reach day ${req.min}`
      case 'milestone': {
        const milestone = Milestone.getById(req.id)
        return milestone?.name ?? req.id
      }
      case 'perk': {
        const perk = Perk.getById(req.id)
        return perk?.name ?? req.id
      }
      case 'building': {
        const building = Building.getById(req.id)
        const name = building?.name ?? req.id
        return req.count && req.count > 1 ? `${req.count}x ${name}` : name
      }
    }
  }
}

const STAT_LABELS: Record<string, string> = {
  money: 'money',
  guests: 'guests',
  entertainment: 'entertainment',
  food: 'food',
  comfort: 'comfort',
  cleanliness: 'cleanliness',
  beauty: 'beauty',
  appeal: 'appeal',
}
