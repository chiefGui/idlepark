/**
 * Lightweight ECS (Entity-Component-System)
 *
 * A minimal, TypeScript-first ECS designed for:
 * - Pure functions, no classes
 * - Zero runtime overhead
 * - Full type inference
 * - Works for both individual entities and aggregate data
 *
 * Architecture:
 * - Components: Pure data (what things ARE)
 * - Systems: Pure functions (what things DO)
 * - Modifiers: Composable effects on game state
 *
 * Usage:
 * ```ts
 * import { runGuestSystems, type GuestComponents } from './ecs'
 *
 * const components: GuestComponents = {
 *   behavior: { bigSpenders: 30, largeGroups: 25, influencers: 20, thrillSeekers: 25 },
 *   mood: { happy: 60, unhappy: 10 }
 * }
 *
 * const result = runGuestSystems(components)
 * // result.income.ticket = 1.075 (+7.5% ticket income)
 * // result.arrival.rate = 1.13 (+13% arrivals)
 * // etc.
 * ```
 */

// Core types
export {
  type Entity,
  type ComponentSchema,
  type ComponentRegistry,
  type ComponentData,
  type System,
  type SystemWithContext,
  type QueryResult,
  type Modifier,
  applyModifiers,
  groupModifiers,
} from './types'

// Guest components
export {
  type BehaviorTag,
  type BehaviorTagMix,
  type MoodTag,
  type MoodTagMix,
  type GuestComponents,
  type TagMeta,
  BEHAVIOR_TAGS,
  BEHAVIOR_TAG_META,
  MOOD_TAGS,
  MOOD_TAG_META,
  createDefaultBehaviorMix,
  createDefaultMoodMix,
} from './components/guest-tags'

// Tag calculator (bridges game state to ECS)
export {
  type BuildingTagAudience,
  calculateBehaviorTagMix,
  calculateMoodTagMix,
  getGuestComponents,
} from './components/tag-calculator'

// Guest systems
export {
  incomeSystem,
  arrivalSystem,
  departureSystem,
  appealSystem,
  runGuestSystems,
  getAllGuestModifiers,
  type IncomeModifiers,
  type ArrivalModifiers,
  type DepartureModifiers,
  type AppealModifiers,
  type GuestSystemsResult,
} from './systems'
