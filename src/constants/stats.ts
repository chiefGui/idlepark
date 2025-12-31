import {
  DollarSign,
  Users,
  Sparkles,
  UtensilsCrossed,
  Sofa,
  Sparkle,
  Star,
  Heart,
} from 'lucide-react'
import type { StatId } from '../engine/game-types'
import { Format } from '../utils/format'

export type StatConfig = {
  icon: typeof DollarSign
  label: string
  color: string
  format: (value: number) => string
}

/**
 * Single source of truth for stat display configuration.
 * All components should use this for consistent labels, colors, and formatting.
 */
export const STAT_CONFIG: Record<StatId, StatConfig> = {
  money: {
    icon: DollarSign,
    label: 'Money',
    color: '#22c55e',
    format: Format.money,
  },
  guests: {
    icon: Users,
    label: 'Guests',
    color: '#6366f1',
    format: Format.guests,
  },
  entertainment: {
    icon: Sparkles,
    label: 'Fun',
    color: '#f472b6',
    format: Format.number,
  },
  food: {
    icon: UtensilsCrossed,
    label: 'Food',
    color: '#fb923c',
    format: Format.number,
  },
  comfort: {
    icon: Sofa,
    label: 'Comfort',
    color: '#a78bfa',
    format: Format.number,
  },
  cleanliness: {
    icon: Sparkle,
    label: 'Clean',
    color: '#22d3ee',
    format: Format.percent,
  },
  appeal: {
    icon: Star,
    label: 'Appeal',
    color: '#fbbf24',
    format: Format.percent,
  },
  satisfaction: {
    icon: Heart,
    label: 'Happy',
    color: '#f87171',
    format: Format.percent,
  },
}

/** Stats shown in the compact secondary bar */
export const SECONDARY_STATS: StatId[] = [
  'satisfaction',
  'appeal',
  'entertainment',
  'food',
  'comfort',
  'cleanliness',
]
