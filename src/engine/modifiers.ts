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
  // Metadata for UI display
  label?: string     // Human-readable name (e.g., "Carousel", "Summer Festival")
  emoji?: string     // Display emoji (e.g., "🎠", "🎪")
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

  /**
   * Get all sources affecting a stat with their contributions.
   * Groups by label for UI display. Returns sorted by contribution (positive first, then by amount).
   */
  static getSourcesForStat(
    modifiers: Modifier[],
    stat: StatId
  ): SourceContribution[] {
    const relevant = modifiers.filter((m) => m.stat === stat)
    const grouped = new Map<string, { emoji: string; flat: number; increased: number; more: number; count: number }>()

    for (const mod of relevant) {
      const key = mod.label ?? this.getDefaultLabel(mod.source)
      const emoji = mod.emoji ?? this.getDefaultEmoji(mod.source)

      const existing = grouped.get(key)
      if (existing) {
        existing.flat += mod.flat ?? 0
        if (mod.increased) existing.increased += mod.increased
        if (mod.more) existing.more *= mod.more
        existing.count++
      } else {
        grouped.set(key, {
          emoji,
          flat: mod.flat ?? 0,
          increased: mod.increased ?? 0,
          more: mod.more ?? 1,
          count: 1,
        })
      }
    }

    const sources: SourceContribution[] = []
    for (const [label, data] of grouped) {
      sources.push({
        label,
        emoji: data.emoji,
        flat: data.flat,
        increased: data.increased,
        more: data.more,
        count: data.count > 1 ? data.count : undefined,
      })
    }

    // Sort: positive flat first, then by magnitude
    return sources.sort((a, b) => {
      if (a.flat >= 0 && b.flat < 0) return -1
      if (a.flat < 0 && b.flat >= 0) return 1
      return Math.abs(b.flat) - Math.abs(a.flat)
    })
  }

  private static getDefaultLabel(source: ModifierSource): string {
    switch (source.type) {
      case 'building': return source.buildingId
      case 'perk': return source.perkId
      case 'guest': return 'Guests'
      case 'happening': return source.happeningId
      case 'service': return 'Service'
      case 'marketing': return 'Marketing'
    }
  }

  private static getDefaultEmoji(source: ModifierSource): string {
    switch (source.type) {
      case 'building': return '🏗️'
      case 'perk': return '⚡'
      case 'guest': return '👥'
      case 'happening': return '📅'
      case 'service': return '✨'
      case 'marketing': return '📣'
    }
  }
}

export type SourceContribution = {
  label: string
  emoji: string
  flat: number
  increased: number
  more: number
  count?: number
}
