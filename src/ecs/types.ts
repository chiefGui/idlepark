/**
 * Lightweight ECS (Entity-Component-System) core types.
 *
 * Design principles:
 * - Pure functions, no classes
 * - TypeScript-first with full type inference
 * - Zero runtime overhead - just types and functions
 * - Works for both individual entities and aggregate data
 */

// =============================================================================
// ENTITIES
// =============================================================================

/** Entity is just an identifier */
export type Entity = string | number

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * Component schema defines the shape of a component.
 * Components are pure data - no behavior.
 */
export type ComponentSchema = Record<string, unknown>

/**
 * Component registry maps component names to their schemas.
 * Extend this interface to register new components.
 */
export interface ComponentRegistry {}

/** Get component data type from registry */
export type ComponentData<K extends keyof ComponentRegistry> = ComponentRegistry[K]

// =============================================================================
// SYSTEMS
// =============================================================================

/**
 * System is a pure function that computes output from components.
 * Systems contain all behavior - components are just data.
 *
 * @template Input - Component data the system reads
 * @template Output - What the system produces
 */
export type System<Input, Output> = (input: Input) => Output

/**
 * System with context - for systems that need additional game state.
 */
export type SystemWithContext<Input, Context, Output> = (
  input: Input,
  context: Context
) => Output

// =============================================================================
// QUERIES
// =============================================================================

/**
 * Query result for systems that operate on multiple entities.
 * Maps entity IDs to their component data.
 */
export type QueryResult<T extends ComponentSchema> = Map<Entity, T>

// =============================================================================
// MODIFIERS
// =============================================================================

/**
 * Modifier produced by systems - describes an effect on the game.
 * Modifiers are composable and can be combined.
 */
export type Modifier = {
  /** What this modifier affects */
  stat: string
  /** Additive value (applied first) */
  flat?: number
  /** Percentage increase (applied second, additive with other increases) */
  increased?: number
  /** Multiplier (applied last, multiplicative with other multipliers) */
  more?: number
  /** Human-readable description */
  label?: string
}

/**
 * Combine multiple modifiers for the same stat.
 * Formula: (base + flat) * (1 + sum(increased)) * product(more)
 */
export function applyModifiers(base: number, modifiers: Modifier[]): number {
  let flat = 0
  let increased = 0
  let more = 1

  for (const mod of modifiers) {
    flat += mod.flat ?? 0
    increased += mod.increased ?? 0
    more *= mod.more ?? 1
  }

  return (base + flat) * (1 + increased) * more
}

/**
 * Group modifiers by stat for efficient application.
 */
export function groupModifiers(modifiers: Modifier[]): Map<string, Modifier[]> {
  const grouped = new Map<string, Modifier[]>()

  for (const mod of modifiers) {
    const existing = grouped.get(mod.stat)
    if (existing) {
      existing.push(mod)
    } else {
      grouped.set(mod.stat, [mod])
    }
  }

  return grouped
}
