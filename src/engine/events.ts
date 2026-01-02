import mitt from 'mitt'
import type { FeedEntry, BankLoanPackageId, WishBoostState } from './game-types'

export type MoneyPopupReason = 'building' | 'perk' | 'milestone' | 'demolish' | 'marketing' | 'loan'

export type GameEventMap = {
  'tick': { deltaDay: number }
  'day:changed': { day: number }
  'building:built': { buildingId: string; slotIndex: number }
  'building:demolished': { buildingId: string; slotIndex: number }
  'slot:unlocked': { slotIndex: number }
  'perk:purchased': { perkId: string }
  'milestone:achieved': { milestoneId: string }
  'guests:departed': { count: number }           // Unhappy guests leaving
  'guests:departed_natural': { count: number }  // Satisfied guests going home
  'bankruptcy': { day: number }
  'feed:new': { entry: FeedEntry }
  'game:reset': undefined
  'game:loaded': undefined
  'happening:started': { happeningId: string }
  'happening:ended': { happeningId: string }
  'marketing:started': { campaignId: string }
  'marketing:ended': { campaignId: string | undefined }
  'bank:loan_taken': { packageId: BankLoanPackageId; amount: number }
  'bank:loan_repaid': { packageId: BankLoanPackageId }
  'money:changed': { amount: number; reason: MoneyPopupReason }
  'wish:fulfilled': { buildingId: string; boost: WishBoostState }
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
