import type { StatId } from './game-types'

// === TYPES ===

export type ModifierSource =
  | { type: 'building'; slotIndex: number; buildingId: string }
  | { type: 'perk'; perkId: string }
  | { type: 'guest' }
  | { type: 'happening'; happeningId: string }
  | { type: 'service' }
  | { type: 'marketing' }

export type Modifier = {
  source: ModifierSource
  stat: StatId
  flat?: number      // +X per day (additive base)
  increased?: number // +X% (additive percentage)
  more?: number      // ×X (multiplicative)
}

export type ComputedRates = Record<StatId, number>

// === HELPERS ===

function sourceEquals(a: ModifierSource, b: ModifierSource): boolean {
  if (a.type !== b.type) return false
  switch (a.type) {
    case 'building':
      return b.type === 'building' && a.slotIndex === b.slotIndex
    case 'perk':
      return b.type === 'perk' && a.perkId === b.perkId
    case 'guest':
      return b.type === 'guest'
    case 'happening':
      return b.type === 'happening' && a.happeningId === b.happeningId
    case 'service':
      return b.type === 'service'
    case 'marketing':
      return b.type === 'marketing'
  }
}

function sourceMatchesType(source: ModifierSource, type: ModifierSource['type']): boolean {
  return source.type === type
}

// === CORE SYSTEM ===

export class Modifiers {
  /**
   * Calculate the final rate for a stat using PoE-style formula:
   * (base + Σflat) × (1 + Σincreased/100) × Πmore
   */
  static calculateRate(modifiers: Modifier[], stat: StatId): number {
    const relevant = modifiers.filter((m) => m.stat === stat)

    let flat = 0
    let increased = 0
    let more = 1

    for (const mod of relevant) {
      if (mod.flat) flat += mod.flat
      if (mod.increased) increased += mod.increased
      if (mod.more) more *= mod.more
    }

    // Base is 0, all contributions come from flat
    // Formula: (0 + flat) × (1 + increased/100) × more
    return flat * (1 + increased / 100) * more
  }

  /**
   * Calculate rates for all stats
   */
  static computeAllRates(modifiers: Modifier[]): ComputedRates {
    const stats: StatId[] = [
      'money',
      'guests',
      'entertainment',
      'food',
      'comfort',
      'cleanliness',
      'beauty',
      'appeal',
    ]

    const rates: ComputedRates = {} as ComputedRates
    for (const stat of stats) {
      rates[stat] = this.calculateRate(modifiers, stat)
    }
    return rates
  }

  /**
   * Filter modifiers by source type
   */
  static getByType(modifiers: Modifier[], type: ModifierSource['type']): Modifier[] {
    return modifiers.filter((m) => sourceMatchesType(m.source, type))
  }

  /**
   * Filter modifiers by exact source
   */
  static getBySource(modifiers: Modifier[], source: ModifierSource): Modifier[] {
    return modifiers.filter((m) => sourceEquals(m.source, source))
  }

  /**
   * Remove modifiers from a specific source
   */
  static removeBySource(modifiers: Modifier[], source: ModifierSource): Modifier[] {
    return modifiers.filter((m) => !sourceEquals(m.source, source))
  }

  /**
   * Remove all modifiers of a certain type
   */
  static removeByType(modifiers: Modifier[], type: ModifierSource['type']): Modifier[] {
    return modifiers.filter((m) => !sourceMatchesType(m.source, type))
  }

  /**
   * Add modifiers (simple concat, can add duplicates)
   */
  static add(modifiers: Modifier[], newMods: Modifier[]): Modifier[] {
    return [...modifiers, ...newMods]
  }

  /**
   * Replace modifiers from a source (remove old, add new)
   */
  static replaceBySource(
    modifiers: Modifier[],
    source: ModifierSource,
    newMods: Modifier[]
  ): Modifier[] {
    return [...this.removeBySource(modifiers, source), ...newMods]
  }

  /**
   * Get breakdown of a stat's rate by source type (for debugging/UI)
   */
  static getBreakdown(
    modifiers: Modifier[],
    stat: StatId
  ): { flat: number; increased: number; more: number; final: number } {
    const relevant = modifiers.filter((m) => m.stat === stat)

    let flat = 0
    let increased = 0
    let more = 1

    for (const mod of relevant) {
      if (mod.flat) flat += mod.flat
      if (mod.increased) increased += mod.increased
      if (mod.more) more *= mod.more
    }

    return {
      flat,
      increased,
      more,
      final: flat * (1 + increased / 100) * more,
    }
  }
}
