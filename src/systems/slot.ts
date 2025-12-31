import type { SlotState, GameState } from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import { Perk } from './perk'

export class Slot {
  static getEmpty(state: GameState): SlotState[] {
    return state.slots.filter(s => !s.locked && s.buildingId === null)
  }

  static getOccupied(state: GameState): SlotState[] {
    return state.slots.filter(s => s.buildingId !== null)
  }

  static getUnlocked(state: GameState): SlotState[] {
    return state.slots.filter(s => !s.locked)
  }

  static getLocked(state: GameState): SlotState[] {
    return state.slots.filter(s => s.locked)
  }

  static hasEmptySlot(state: GameState): boolean {
    return this.getEmpty(state).length > 0
  }

  static getFirstEmptyIndex(state: GameState): number | null {
    const empty = this.getEmpty(state)
    return empty.length > 0 ? empty[0].index : null
  }

  static canBuild(state: GameState): boolean {
    return this.hasEmptySlot(state)
  }

  /**
   * Calculate total unlocked slots based on initial + expansion perks
   */
  static getTotalUnlockedSlots(state: GameState): number {
    const fromPerks = Perk.getTotalSlotsFromPerks(state)
    return GameTypes.INITIAL_UNLOCKED_SLOTS + fromPerks
  }

  /**
   * Check if there are slots that should be unlocked based on owned perks
   * but aren't yet (for syncing state after perk purchase)
   */
  static getSlotsToUnlock(state: GameState): number[] {
    const shouldBeUnlocked = this.getTotalUnlockedSlots(state)
    const indicesToUnlock: number[] = []

    for (let i = 0; i < shouldBeUnlocked && i < state.slots.length; i++) {
      if (state.slots[i].locked) {
        indicesToUnlock.push(i)
      }
    }

    return indicesToUnlock
  }

  /**
   * Check if park is at max capacity (all unlockable slots are full)
   */
  static isParkFull(state: GameState): boolean {
    return !this.hasEmptySlot(state)
  }

  /**
   * Check if more slots can be unlocked via expansion perks
   */
  static canExpandPark(state: GameState): boolean {
    return Perk.getNextExpansionPerk(state) !== null
  }

  static unlock(slots: SlotState[], slotIndex: number): SlotState[] {
    return slots.map((s) =>
      s.index === slotIndex ? { ...s, locked: false } : s
    )
  }

  static unlockMultiple(slots: SlotState[], indices: number[]): SlotState[] {
    const indexSet = new Set(indices)
    return slots.map((s) =>
      indexSet.has(s.index) ? { ...s, locked: false } : s
    )
  }

  static build(slots: SlotState[], slotIndex: number, buildingId: string): SlotState[] {
    return slots.map(s =>
      s.index === slotIndex ? { ...s, buildingId } : s
    )
  }

  static demolish(slots: SlotState[], slotIndex: number): SlotState[] {
    return slots.map(s =>
      s.index === slotIndex ? { ...s, buildingId: null } : s
    )
  }
}
