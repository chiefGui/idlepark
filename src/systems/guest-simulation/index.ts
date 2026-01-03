/**
 * Guest Simulation Module
 *
 * High-performance individual guest simulation using TypedArrays.
 * Designed for 50k+ guests at 60 FPS with minimal memory footprint.
 *
 * Usage:
 * 1. Initialize: createSimulation() or initializeFromGameState()
 * 2. Each tick: tickWithSimulation() or tickSimulation()
 * 3. Sync arrivals: syncArrivals()
 * 4. Notify building changes: notifyBuildingsChanged()
 *
 * The simulation runs alongside the existing aggregate system.
 * Use the bridge functions to integrate with GameState.
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  GuestPool,
  SimulationState,
  SimulationConfig,
  SimulationTickResult,
  BuildingContext,
  GuestTypeId,
  GuestState,
  GuestMoodId,
} from './types'

export {
  GUEST_STATE,
  GUEST_MOOD,
  GUEST_TYPE_ID,
} from './types'

// ============================================================================
// Constants Exports
// ============================================================================

export {
  GUEST_POOL_CAPACITY,
  TOTAL_SLOTS,
  BATCH_SIZE,
  DEFAULT_CONFIG,
  HAPPY_THRESHOLD,
  UNHAPPY_THRESHOLD,
  TIME_SLICING_THRESHOLD,
} from './constants'

// ============================================================================
// Pool Operations
// ============================================================================

export {
  createPool,
  addGuest,
  removeGuest,
  addGuestsBatch,
  removeGuestsBatch,
  getActiveCount,
  getGuestsByMood,
  getGuestsAtBuilding,
  getGuestsByType,
  getTotalSpent,
  resetPool,
  hasCapacity,
  getUtilization,
} from './pool'

// ============================================================================
// Simulation Operations
// ============================================================================

export {
  createSimulation,
  tickSimulation,
  addGuests,
  forceRemoveGuests,
  markBuildingsDirty,
  updateBuildingCache,
  setConfig,
  getConfig,
  resetBatchOffset,
} from './simulation'

// ============================================================================
// Building Selection
// ============================================================================

export {
  calculateAttractionWeights,
  selectBuilding,
  selectBuildingFast,
  extractBuildingCaps,
  extractShopIncomePerGuest,
  extractIsShopFlags,
} from './building-selector'

// ============================================================================
// Bridge (GameState Integration)
// ============================================================================

export {
  // Initialization
  initializeFromGameState,

  // Tick processing
  tickWithSimulation,

  // Synchronization
  syncArrivals,
  syncDepartures,

  // State queries
  getGuestBreakdownFromSim,
  getTotalGuestsFromSim,
  getBuildingVisitors,
  getBuildingVisitorsByMood,

  // Modifiers
  getShopModifiersFromSimulation,

  // Building changes
  notifyBuildingsChanged,

  // Capacity
  hasSimulationCapacity,
  getSimulationRemainingCapacity,

  // Debug
  getSimulationStats,
} from './bridge'
