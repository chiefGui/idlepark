/**
 * Guest Pool - High-Performance Guest Data Structure
 *
 * Uses TypedArrays with Struct of Arrays (SoA) pattern for
 * cache-friendly iteration and zero GC pressure.
 *
 * Operations:
 * - createPool: O(n) initialization
 * - addGuest: O(1) using free list
 * - removeGuest: O(1) using free list
 * - iteration: O(n) but cache-friendly
 */

import type { GuestPool } from './types'
import { GUEST_STATE, GUEST_MOOD } from './types'
import { DEFAULT_CONFIG } from './constants'

// ============================================================================
// Pool Creation
// ============================================================================

/**
 * Create a new guest pool with the specified capacity.
 *
 * @param capacity - Maximum number of guests
 * @returns Initialized guest pool
 */
export function createPool(capacity: number): GuestPool {
  // Pre-allocate free list with all indices (in reverse for LIFO behavior)
  const freeList = new Uint16Array(capacity)
  for (let i = 0; i < capacity; i++) {
    freeList[i] = capacity - 1 - i
  }

  return {
    capacity,
    count: 0,

    // Parallel arrays
    state: new Uint8Array(capacity),
    location: new Int8Array(capacity).fill(-1),
    mood: new Uint8Array(capacity),
    guestType: new Uint8Array(capacity),
    timer: new Float32Array(capacity),
    spent: new Float32Array(capacity),

    // Free list
    freeList,
    freeCount: capacity,
  }
}

// ============================================================================
// Guest Add/Remove Operations
// ============================================================================

/**
 * Add a new guest to the pool.
 *
 * @param pool - The guest pool
 * @param guestType - Guest type ID (0-3)
 * @param initialMood - Initial mood (default: NEUTRAL)
 * @returns Guest index, or -1 if pool is full
 */
export function addGuest(
  pool: GuestPool,
  guestType: number,
  initialMood: number = GUEST_MOOD.NEUTRAL
): number {
  if (pool.freeCount === 0) {
    return -1 // Pool is full
  }

  // Pop index from free list
  const idx = pool.freeList[--pool.freeCount]

  // Initialize guest data
  pool.state[idx] = GUEST_STATE.ARRIVING
  pool.location[idx] = -1
  pool.mood[idx] = initialMood
  pool.guestType[idx] = guestType
  pool.timer[idx] = DEFAULT_CONFIG.arrivalDelay
  pool.spent[idx] = 0

  pool.count++

  return idx
}

/**
 * Remove a guest from the pool.
 *
 * @param pool - The guest pool
 * @param idx - Guest index to remove
 */
export function removeGuest(pool: GuestPool, idx: number): void {
  if (idx < 0 || idx >= pool.capacity) return
  if (pool.state[idx] === GUEST_STATE.INACTIVE) return // Already removed

  // Mark as inactive
  pool.state[idx] = GUEST_STATE.INACTIVE
  pool.location[idx] = -1

  // Push index back to free list
  pool.freeList[pool.freeCount++] = idx

  pool.count--
}

// ============================================================================
// Batch Operations (for efficiency)
// ============================================================================

/**
 * Add multiple guests at once.
 *
 * @param pool - The guest pool
 * @param count - Number of guests to add
 * @param guestTypes - Array of guest types (must have at least `count` elements)
 * @returns Array of added guest indices
 */
export function addGuestsBatch(
  pool: GuestPool,
  count: number,
  guestTypes: Uint8Array
): number[] {
  const added: number[] = []
  const toAdd = Math.min(count, pool.freeCount)

  for (let i = 0; i < toAdd; i++) {
    const idx = addGuest(pool, guestTypes[i])
    if (idx >= 0) {
      added.push(idx)
    }
  }

  return added
}

/**
 * Remove multiple guests at once.
 *
 * @param pool - The guest pool
 * @param indices - Array of guest indices to remove
 */
export function removeGuestsBatch(pool: GuestPool, indices: number[]): void {
  for (const idx of indices) {
    removeGuest(pool, idx)
  }
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Get the number of active guests.
 */
export function getActiveCount(pool: GuestPool): number {
  return pool.count
}

/**
 * Get guests broken down by mood (compatible with GuestBreakdown).
 */
export function getGuestsByMood(pool: GuestPool): {
  happy: number
  neutral: number
  unhappy: number
} {
  let happy = 0
  let neutral = 0
  let unhappy = 0

  for (let i = 0; i < pool.capacity; i++) {
    if (pool.state[i] === GUEST_STATE.INACTIVE) continue

    switch (pool.mood[i]) {
      case GUEST_MOOD.HAPPY:
        happy++
        break
      case GUEST_MOOD.NEUTRAL:
        neutral++
        break
      case GUEST_MOOD.UNHAPPY:
        unhappy++
        break
    }
  }

  return { happy, neutral, unhappy }
}

/**
 * Get number of guests at a specific building.
 *
 * @param pool - The guest pool
 * @param slotIndex - Building slot index
 * @returns Number of guests currently visiting that building
 */
export function getGuestsAtBuilding(pool: GuestPool, slotIndex: number): number {
  let count = 0

  for (let i = 0; i < pool.capacity; i++) {
    if (pool.state[i] === GUEST_STATE.VISITING && pool.location[i] === slotIndex) {
      count++
    }
  }

  return count
}

/**
 * Get guests by type.
 */
export function getGuestsByType(pool: GuestPool): {
  thrills: number
  family: number
  relaxation: number
  social: number
} {
  let thrills = 0
  let family = 0
  let relaxation = 0
  let social = 0

  for (let i = 0; i < pool.capacity; i++) {
    if (pool.state[i] === GUEST_STATE.INACTIVE) continue

    switch (pool.guestType[i]) {
      case 0:
        thrills++
        break
      case 1:
        family++
        break
      case 2:
        relaxation++
        break
      case 3:
        social++
        break
    }
  }

  return { thrills, family, relaxation, social }
}

/**
 * Get total money spent by all guests.
 */
export function getTotalSpent(pool: GuestPool): number {
  let total = 0

  for (let i = 0; i < pool.capacity; i++) {
    if (pool.state[i] !== GUEST_STATE.INACTIVE) {
      total += pool.spent[i]
    }
  }

  return total
}

// ============================================================================
// Utility Operations
// ============================================================================

/**
 * Reset the pool to initial state (removes all guests).
 */
export function resetPool(pool: GuestPool): void {
  pool.count = 0
  pool.state.fill(GUEST_STATE.INACTIVE)
  pool.location.fill(-1)
  pool.mood.fill(0)
  pool.guestType.fill(0)
  pool.timer.fill(0)
  pool.spent.fill(0)

  // Rebuild free list
  for (let i = 0; i < pool.capacity; i++) {
    pool.freeList[i] = pool.capacity - 1 - i
  }
  pool.freeCount = pool.capacity
}

/**
 * Check if pool has capacity for more guests.
 */
export function hasCapacity(pool: GuestPool, count: number = 1): boolean {
  return pool.freeCount >= count
}

/**
 * Get pool utilization as a percentage (0-100).
 */
export function getUtilization(pool: GuestPool): number {
  return (pool.count / pool.capacity) * 100
}
