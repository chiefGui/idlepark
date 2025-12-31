import mitt from 'mitt'
import type { FeedEntry } from './game-types'

export type MoneyPopupReason = 'building' | 'perk' | 'milestone' | 'demolish'

export type GameEventMap = {
  'tick': { deltaDay: number }
  'day:changed': { day: number }
  'building:built': { buildingId: string; slotIndex: number }
  'building:demolished': { buildingId: string; slotIndex: number }
  'slot:unlocked': { slotIndex: number }
  'perk:purchased': { perkId: string }
  'milestone:achieved': { milestoneId: string }
  'guests:departed': { count: number }
  'bankruptcy': { day: number }
  'feed:new': { entry: FeedEntry }
  'game:reset': undefined
  'game:loaded': undefined
  'happening:started': { happeningId: string }
  'happening:ended': { happeningId: string }
  'money:changed': { amount: number; reason: MoneyPopupReason }
}

const emitter = mitt<GameEventMap>()

export class GameEvents {
  static on<K extends keyof GameEventMap>(
    type: K,
    handler: (event: GameEventMap[K]) => void
  ) {
    emitter.on(type, handler)
    return () => emitter.off(type, handler)
  }

  static off<K extends keyof GameEventMap>(
    type: K,
    handler: (event: GameEventMap[K]) => void
  ) {
    emitter.off(type, handler)
  }

  static emit<K extends keyof GameEventMap>(type: K, event: GameEventMap[K]) {
    emitter.emit(type, event)
  }

  static clear() {
    emitter.all.clear()
  }
}
