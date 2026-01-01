import type { MarketingCampaignId, MarketingState, GameState, MilestoneDef } from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import type { Modifier } from '../engine/modifiers'

// === CAMPAIGN TYPES ===

export type CampaignDef = {
  id: MarketingCampaignId
  name: string
  emoji: string
  description: string
  cost: number
  duration: number // days
  effects: {
    guestArrivalBonus: number // multiplier (0.3 = +30%)
    appealBonus: number // flat bonus
  }
}

// === MARKETING CLASS ===

export class Marketing {
  static readonly PERK_ID = 'marketing_office'

  // Campaign definitions
  static readonly FLYERS: CampaignDef = {
    id: 'flyers',
    name: 'Local Flyers',
    emoji: '📄',
    description: 'Distribute flyers around town',
    cost: 1000,
    duration: 3,
    effects: {
      guestArrivalBonus: 0.3, // +30%
      appealBonus: 0,
    },
  }

  static readonly SOCIAL: CampaignDef = {
    id: 'social',
    name: 'Social Media Blitz',
    emoji: '📱',
    description: 'Viral social media campaign',
    cost: 3500,
    duration: 5,
    effects: {
      guestArrivalBonus: 0.6, // +60%
      appealBonus: 5,
    },
  }

  static readonly TV: CampaignDef = {
    id: 'tv',
    name: 'TV Commercial',
    emoji: '📺',
    description: 'Prime time television ad',
    cost: 8000,
    duration: 7,
    effects: {
      guestArrivalBonus: 1.0, // +100%
      appealBonus: 15,
    },
  }

  static readonly ALL: CampaignDef[] = [
    Marketing.FLYERS,
    Marketing.SOCIAL,
    Marketing.TV,
  ]

  static getById(id: MarketingCampaignId): CampaignDef | undefined {
    return this.ALL.find(c => c.id === id)
  }

  /**
   * Check if marketing is unlocked (perk owned)
   */
  static isUnlocked(state: GameState): boolean {
    return state.ownedPerks.includes(this.PERK_ID)
  }

  /**
   * Check if a campaign is currently active
   */
  static hasActiveCampaign(state: GameState): boolean {
    return state.marketing?.activeCampaign !== null
  }

  /**
   * Get the active campaign definition, if any
   */
  static getActiveCampaign(state: GameState): CampaignDef | null {
    if (!state.marketing?.activeCampaign) return null
    return this.getById(state.marketing.activeCampaign.campaignId) ?? null
  }

  /**
   * Get days remaining on active campaign
   */
  static getDaysRemaining(state: GameState): number {
    if (!state.marketing?.activeCampaign) return 0
    return Math.max(0, state.marketing.activeCampaign.endDay - state.currentDay)
  }

  /**
   * Check if cooldown has passed since last campaign
   */
  static isCooldownComplete(state: GameState): boolean {
    if (!state.marketing) return true
    const daysSinceLastCampaign = state.currentDay - state.marketing.lastCampaignEndDay
    return daysSinceLastCampaign >= GameTypes.MARKETING_COOLDOWN_DAYS
  }

  /**
   * Get days remaining in cooldown
   */
  static getCooldownRemaining(state: GameState): number {
    if (!state.marketing) return 0
    const daysSinceLastCampaign = state.currentDay - state.marketing.lastCampaignEndDay
    return Math.max(0, GameTypes.MARKETING_COOLDOWN_DAYS - daysSinceLastCampaign)
  }

  /**
   * Check if a campaign can be purchased
   */
  static canPurchase(campaign: CampaignDef, state: GameState): { canBuy: boolean; reason?: string } {
    if (!this.isUnlocked(state)) {
      return { canBuy: false, reason: 'Marketing Office required' }
    }
    if (this.hasActiveCampaign(state)) {
      return { canBuy: false, reason: 'Campaign already active' }
    }
    if (!this.isCooldownComplete(state)) {
      const days = this.getCooldownRemaining(state)
      return { canBuy: false, reason: `Cooldown: ${days} day${days !== 1 ? 's' : ''} left` }
    }
    if (state.stats.money < campaign.cost) {
      return { canBuy: false, reason: 'Not enough money' }
    }
    return { canBuy: true }
  }

  /**
   * Start a campaign - returns new marketing state
   */
  static startCampaign(
    campaign: CampaignDef,
    state: GameState
  ): MarketingState {
    return {
      activeCampaign: {
        campaignId: campaign.id,
        startDay: state.currentDay,
        endDay: state.currentDay + campaign.duration,
      },
      lastCampaignEndDay: state.marketing?.lastCampaignEndDay ?? 0,
    }
  }

  /**
   * End the active campaign - returns new marketing state
   */
  static endCampaign(state: GameState): MarketingState {
    return {
      activeCampaign: null,
      lastCampaignEndDay: state.currentDay,
    }
  }

  /**
   * Check if active campaign has ended
   */
  static shouldEndCampaign(state: GameState): boolean {
    if (!state.marketing?.activeCampaign) return false
    return state.currentDay >= state.marketing.activeCampaign.endDay
  }

  /**
   * Get the arrival rate bonus multiplier from active campaign.
   * Returns 0 if no campaign, or the bonus (e.g., 0.3 for +30%)
   */
  static getArrivalBonus(state: GameState): number {
    const campaign = this.getActiveCampaign(state)
    return campaign?.effects.guestArrivalBonus ?? 0
  }

  /**
   * Get modifiers from active campaign
   */
  static getModifiers(state: GameState): Modifier[] {
    const campaign = this.getActiveCampaign(state)
    if (!campaign) return []

    const modifiers: Modifier[] = []

    // Guest arrival bonus (applied as increased modifier on guests stat)
    // Convert from decimal (0.3 = +30%) to percentage (30)
    if (campaign.effects.guestArrivalBonus > 0) {
      modifiers.push({
        source: { type: 'marketing' as const },
        stat: 'guests',
        increased: campaign.effects.guestArrivalBonus * 100,
        label: campaign.name,
        emoji: campaign.emoji,
      })
    }

    // Appeal bonus
    if (campaign.effects.appealBonus > 0) {
      modifiers.push({
        source: { type: 'marketing' as const },
        stat: 'appeal',
        flat: campaign.effects.appealBonus,
        label: campaign.name,
        emoji: campaign.emoji,
      })
    }

    return modifiers
  }

  // === MILESTONES ===

  static readonly MILESTONES: Record<string, MilestoneDef> = {
    MARKETING_UNLOCKED: {
      id: 'marketing_unlocked',
      name: 'Marketing Maven',
      emoji: '📣',
      description: 'Unlock Marketing campaigns',
      condition: { type: 'perk', id: Marketing.PERK_ID },
    },
  }
}
