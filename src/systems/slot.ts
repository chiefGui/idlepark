import type { SlotState, GameState } from '../engine/game-types'

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

  static unlockNext(slots: SlotState[]): SlotState[] {
    const firstLocked = slots.find(s => s.locked)
    if (!firstLocked) return slots

    return slots.map(s =>
      s.index === firstLocked.index ? { ...s, locked: false } : s
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
