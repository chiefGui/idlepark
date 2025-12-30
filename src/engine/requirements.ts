import type { Requirement, GameState } from './game-types'

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
        return state.achievedMilestones.includes(req.id)
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
      case 'stat':
        if (req.min !== undefined) return `${req.statId} >= ${req.min}`
        if (req.max !== undefined) return `${req.statId} <= ${req.max}`
        return req.statId
      case 'day':
        return `Day ${req.min}`
      case 'milestone':
        return `Milestone: ${req.id}`
      case 'perk':
        return `Perk: ${req.id}`
      case 'building':
        return `Building: ${req.id}${req.count ? ` x${req.count}` : ''}`
    }
  }
}
