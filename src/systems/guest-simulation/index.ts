/**
 * Guest Simulation Module
 *
 * High-performance individual guest simulation using TypedArrays.
 * Designed for 50k+ guests at 60 FPS with minimal memory footprint.
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
} from './constants'

// ============================================================================
// Pool Operations
// ============================================================================

export {
  createPool,
  addGuest,
  removeGuest,
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
  // State queries
  getGuestBreakdownFromSim,
  getTotalGuestsFromSim,
  getBuildingVisitors,
  getBuildingVisitorsByMood,

  // Modifiers
  getShopModifiersFromSimulation,

  // Building changes
  notifyBuildingsChanged,

  // Debug
  getSimulationStats,
} from './bridge'
