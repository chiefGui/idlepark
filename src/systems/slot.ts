import type { SlotState, GameState } from '../engine/game-types'
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

  static getSlotPerksOwned(state: GameState): number {
    return Perk.ALL.filter(
      (p) => Perk.isSlotPerk(p) && state.ownedPerks.includes(p.id)
    ).length
  }

  static getUnlockedBeyondInitial(state: GameState): number {
    const initialUnlocked = 3
    return state.slots.filter((s) => !s.locked).length - initialUnlocked
  }

  static canUnlock(slotIndex: number, state: GameState): boolean {
    const slot = state.slots[slotIndex]
    if (!slot || !slot.locked) return false

    const perksOwned = this.getSlotPerksOwned(state)
    const alreadyUnlocked = this.getUnlockedBeyondInitial(state)

    return perksOwned > alreadyUnlocked
  }

  static getNextUnlockableSlot(state: GameState): SlotState | null {
    const canUnlockAny =
      this.getSlotPerksOwned(state) > this.getUnlockedBeyondInitial(state)
    if (!canUnlockAny) return null

    return state.slots.find((s) => s.locked) ?? null
  }

  static unlock(slots: SlotState[], slotIndex: number): SlotState[] {
    return slots.map((s) =>
      s.index === slotIndex ? { ...s, locked: false } : s
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
