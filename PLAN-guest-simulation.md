# Guest Simulation System - Implementation Plan

## Overview

Replace the aggregate guest model (`{ happy, neutral, unhappy }`) with individual guest simulation using TypedArrays for performance. The system must be **non-breaking**, **clean**, **DRY**, and **decoupled**.

## Architecture Principles

1. **Non-Breaking**: New system runs alongside old, controlled by feature flag
2. **Clean**: Separate module with clear responsibilities
3. **DRY**: Reuse existing types, constants, and patterns
4. **Decoupled**: Bridge layer converts between systems

## File Structure

```
src/systems/guest-simulation/
├── index.ts                 # Public API - single entry point
├── types.ts                 # Type definitions
├── constants.ts             # Simulation constants
├── pool.ts                  # GuestPool - TypedArray data structure
├── simulation.ts            # Core simulation tick logic
├── building-selector.ts     # Weighted building selection
├── bridge.ts                # Converts to/from current GameState
└── __tests__/               # Unit tests
    ├── pool.test.ts
    ├── simulation.test.ts
    └── bridge.test.ts
```

## Phase 1: Core Data Structure

### 1.1 Types (`types.ts`)

```typescript
// Guest states (fits in Uint8)
export const GUEST_STATE = {
  INACTIVE: 0,    // Slot is empty
  ARRIVING: 1,    // Just entered park
  WALKING: 2,     // Moving between buildings
  VISITING: 3,    // At a building
  LEAVING: 4,     // Exiting park
} as const

// Guest moods (fits in Uint8)
export const GUEST_MOOD = {
  UNHAPPY: 0,
  NEUTRAL: 1,
  HAPPY: 2,
} as const

// Guest types - matches existing GuestType
export const GUEST_TYPE_ID = {
  THRILLS: 0,
  FAMILY: 1,
  RELAXATION: 2,
  SOCIAL: 3,
} as const

export type GuestPool = {
  capacity: number      // Max allocated slots
  count: number         // Active guests

  // Parallel arrays (Struct of Arrays)
  state: Uint8Array
  location: Int8Array   // -1 = not at building, 0-23 = slot index
  mood: Uint8Array
  guestType: Uint8Array
  timer: Float32Array   // Time until next state change (in days)
  spent: Float32Array   // Money spent this visit

  // Free list for O(1) add/remove
  freeList: Uint16Array
  freeCount: number
}

export type SimulationState = {
  pool: GuestPool

  // Per-building visitor counts (derived each tick)
  buildingVisitors: Int16Array      // Total visitors per slot
  buildingVisitorsByMood: {
    happy: Int16Array
    neutral: Int16Array
    unhappy: Int16Array
  }

  // Attraction weights (recalculated when buildings change)
  attractionWeights: Float32Array
  attractionWeightsDirty: boolean
}

export type SimulationConfig = {
  // Timing (in days)
  arrivalDelay: number        // Time before guest picks first building
  walkingDuration: number     // Time to walk between buildings
  minVisitDuration: number    // Minimum time at building
  maxVisitDuration: number    // Maximum time at building

  // Behavior
  leaveChanceWhenUnhappy: number  // Probability unhappy guest leaves
  moodTransitionRate: number      // How fast mood changes
}
```

### 1.2 Pool (`pool.ts`)

```typescript
export function createPool(capacity: number): GuestPool

export function addGuest(
  pool: GuestPool,
  guestType: number,
  initialMood?: number
): number  // Returns guest index or -1 if full

export function removeGuest(pool: GuestPool, index: number): void

export function getActiveCount(pool: GuestPool): number

export function getGuestsByMood(pool: GuestPool): { happy: number, neutral: number, unhappy: number }

export function getGuestsByLocation(pool: GuestPool, slotIndex: number): number

// Batch operations for efficiency
export function addGuestsBatch(pool: GuestPool, count: number, guestTypes: Uint8Array): number[]

export function removeGuestsBatch(pool: GuestPool, indices: number[]): void
```

## Phase 2: Simulation Logic

### 2.1 Building Selector (`building-selector.ts`)

```typescript
export function calculateAttractionWeights(
  slots: SlotState[],
  guestTypeMix: GuestTypeMix,
  currentVisitors: Int16Array,
  buildingCaps: Int16Array
): Float32Array

export function selectBuilding(
  guestType: number,
  weights: Float32Array,
  visitors: Int16Array,
  caps: Int16Array,
  currentLocation: number  // Avoid same building
): number  // Returns slot index or -1
```

### 2.2 Core Simulation (`simulation.ts`)

```typescript
export function createSimulation(capacity: number, config?: Partial<SimulationConfig>): SimulationState

export function tickSimulation(
  sim: SimulationState,
  deltaDay: number,
  buildings: BuildingContext,
  appeal: number
): SimulationTickResult

export type BuildingContext = {
  slots: SlotState[]
  buildingDefs: Map<string, BuildingDef>
  guestTypeMix: GuestTypeMix
}

export type SimulationTickResult = {
  // For bridge layer
  guestBreakdown: { happy: number, neutral: number, unhappy: number }
  buildingVisitors: Int16Array

  // Events to emit
  departures: {
    natural: number
    unhappy: number
  }

  // Income from shop visits
  shopRevenue: number
}
```

### 2.3 Simulation Tick Logic (inside `simulation.ts`)

```typescript
function tickSimulation(sim, deltaDay, buildings, appeal) {
  const pool = sim.pool
  const result = { departures: { natural: 0, unhappy: 0 }, shopRevenue: 0 }

  // Reset building visitor counts
  sim.buildingVisitors.fill(0)
  sim.buildingVisitorsByMood.happy.fill(0)
  sim.buildingVisitorsByMood.neutral.fill(0)
  sim.buildingVisitorsByMood.unhappy.fill(0)

  // Recalculate weights if needed
  if (sim.attractionWeightsDirty) {
    sim.attractionWeights = calculateAttractionWeights(...)
    sim.attractionWeightsDirty = false
  }

  // Process all guests
  for (let i = 0; i < pool.capacity; i++) {
    if (pool.state[i] === GUEST_STATE.INACTIVE) continue

    // Decrement timer
    pool.timer[i] -= deltaDay

    // Update mood based on appeal
    updateMood(pool, i, appeal, deltaDay)

    // Process state transitions when timer expires
    if (pool.timer[i] <= 0) {
      processStateTransition(pool, i, sim, buildings, result)
    }

    // Count visitors at buildings
    if (pool.state[i] === GUEST_STATE.VISITING && pool.location[i] >= 0) {
      const loc = pool.location[i]
      sim.buildingVisitors[loc]++

      // Track by mood
      switch (pool.mood[i]) {
        case GUEST_MOOD.HAPPY: sim.buildingVisitorsByMood.happy[loc]++; break
        case GUEST_MOOD.NEUTRAL: sim.buildingVisitorsByMood.neutral[loc]++; break
        case GUEST_MOOD.UNHAPPY: sim.buildingVisitorsByMood.unhappy[loc]++; break
      }
    }
  }

  // Calculate shop revenue from actual visitors
  result.shopRevenue = calculateShopRevenue(sim.buildingVisitors, buildings)

  // Derive guest breakdown
  result.guestBreakdown = getGuestsByMood(pool)
  result.buildingVisitors = sim.buildingVisitors

  return result
}
```

## Phase 3: Bridge Layer

### 3.1 Bridge (`bridge.ts`)

Converts between simulation and current GameState:

```typescript
// Initialize simulation from current game state
export function initializeFromGameState(
  state: GameState,
  capacity: number
): SimulationState

// Sync arrivals from existing system into simulation
export function syncArrivals(
  sim: SimulationState,
  arrivalsToAdd: number,
  guestTypeMix: GuestTypeMix
): void

// Sync departures (remove guests to match expected count)
export function syncDepartures(
  sim: SimulationState,
  targetCount: number
): { natural: number, unhappy: number }

// Get breakdown compatible with current system
export function getGuestBreakdown(sim: SimulationState): GuestBreakdown

// Get visitor count for a specific building
export function getBuildingVisitors(sim: SimulationState, slotIndex: number): number

// Get shop modifiers using real visitor counts (replaces Building.getShopModifiers)
export function getShopModifiersFromSimulation(
  sim: SimulationState,
  slots: SlotState[]
): Modifier[]
```

## Phase 4: Integration

### 4.1 GameState Extension

```typescript
// In game-types.ts - add optional simulation state
export type GameState = {
  // ... existing fields ...

  // New: Individual guest simulation (null = use aggregate model)
  guestSimulation: SimulationState | null
}
```

### 4.2 Store Integration

```typescript
// In game-store.ts tick() function

// OPTION A: Feature flag approach (cleanest)
if (state.guestSimulation) {
  // Use new simulation
  const simResult = tickSimulation(
    state.guestSimulation,
    deltaDay,
    { slots: state.slots, ... },
    currentAppeal
  )
  guestBreakdown = simResult.guestBreakdown
  shopRevenue = simResult.shopRevenue
} else {
  // Use existing aggregate model (unchanged)
  guestBreakdown = Guest.processArrivals(...)
  guestBreakdown = Guest.processTransitions(...)
  // ...
}
```

### 4.3 Modifier Collection Update

```typescript
// In collectModifiers() or tick()

// Replace shop modifiers with simulation-based ones
if (state.guestSimulation) {
  modifiers.push(...getShopModifiersFromSimulation(state.guestSimulation, state.slots))
} else {
  modifiers.push(...Building.getShopModifiers(state))
}
```

## Phase 5: Migration Path

### 5.1 Enable Simulation

```typescript
// New action in game-store
enableGuestSimulation: () => {
  const sim = initializeFromGameState(get(), GUEST_POOL_CAPACITY)
  set({ guestSimulation: sim })
}

disableGuestSimulation: () => {
  set({ guestSimulation: null })
}
```

### 5.2 Persistence

```typescript
// Simulation state should NOT be persisted
// On load, reinitialize from aggregate breakdown

const persistedState = loadFromStorage()
if (persistedState.guestSimulation) {
  // Reinitialize simulation from breakdown
  persistedState.guestSimulation = initializeFromGameState(persistedState, CAPACITY)
}
```

## Constants

```typescript
// In constants.ts
export const GUEST_POOL_CAPACITY = 60000  // Support up to 60k guests

export const DEFAULT_CONFIG: SimulationConfig = {
  arrivalDelay: 0.05,           // 1.5 seconds real-time
  walkingDuration: 0.03,        // ~1 second real-time
  minVisitDuration: 0.1,        // 3 seconds real-time
  maxVisitDuration: 0.3,        // 9 seconds real-time
  leaveChanceWhenUnhappy: 0.3,  // 30% chance to leave when unhappy
  moodTransitionRate: 0.15,     // Match existing TRANSITION_RATE
}
```

## Testing Strategy

1. **Unit Tests**
   - Pool operations (add, remove, batch)
   - State machine transitions
   - Building selection weights
   - Bridge conversions

2. **Integration Tests**
   - Simulation produces same income as aggregate model (within tolerance)
   - Guest counts remain stable over time
   - Building visitors match expected distribution

3. **Performance Tests**
   - Benchmark 50k guests at 60 FPS
   - Memory usage stays under 1MB

## Implementation Order

1. ✅ `types.ts` - Type definitions
2. ✅ `constants.ts` - Configuration
3. ✅ `pool.ts` - Core data structure
4. ✅ `building-selector.ts` - Building selection
5. ✅ `simulation.ts` - Main simulation logic
6. ✅ `bridge.ts` - GameState integration
7. ✅ `index.ts` - Public API
8. ✅ Integration in `game-store.ts`
9. ✅ Tests
10. ✅ Performance validation

## Non-Breaking Guarantee

- All existing code paths remain functional
- Simulation is opt-in via `guestSimulation` field
- If `guestSimulation` is null, everything works exactly as before
- Bridge layer ensures compatibility with existing UI components
- No changes to component props or store selectors needed

## Future Enhancements (Out of Scope)

- Individual guest names/stories (featured guests)
- Visual guest representation
- Queue visualization
- Guest path tracing
- Shop inventory system using real visitors
