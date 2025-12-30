import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, Effect, TimelineEntry } from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import { GameEvents } from '../engine/events'
import { Effects, type AggregatedRates } from '../engine/effects'
import { Building } from '../systems/building'
import { Slot } from '../systems/slot'
import { Guest } from '../systems/guest'
import { Perk } from '../systems/perk'
import { Milestone } from '../systems/milestone'
import { Timeline } from '../systems/timeline'

type GameActions = {
  tick: (deltaDay: number) => void
  buildAtSlot: (buildingId: string, slotIndex: number) => boolean
  demolishSlot: (slotIndex: number) => boolean
  purchasePerk: (perkId: string) => boolean
  setTicketPrice: (price: number) => void
  reset: () => void
  calculateOfflineProgress: (lastTime: number) => void
}

type GameStoreState = GameState & {
  rates: AggregatedRates
  actions: GameActions
}

const computeRates = (state: GameState): AggregatedRates => {
  const effects: Effect[] = []

  for (const slot of state.slots) {
    if (slot.buildingId) {
      const building = Building.getById(slot.buildingId)
      if (building) {
        effects.push(...building.effects)
      }
    }
  }

  for (const perkId of state.ownedPerks) {
    const perk = Perk.getById(perkId)
    if (perk) {
      effects.push(...perk.effects)
    }
  }

  effects.push(...Guest.getEffects(state))

  return Effects.aggregate(effects)
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      ...GameTypes.createInitialState(),
      rates: Effects.aggregate([]),

      actions: {
        tick: (deltaDay: number) => {
          const state = get()
          if (state.gameOver) return

          let newStats = Effects.applyRates(state.stats, state.rates, deltaDay)
          const tempState = { ...state, stats: newStats }

          newStats = {
            ...newStats,
            satisfaction: Guest.calculateSatisfaction(tempState),
            appeal: Guest.calculateAppeal(tempState),
          }

          newStats = Effects.clampStats(newStats)

          const newDay = state.currentDay + deltaDay
          let consecutiveNegativeDays = state.consecutiveNegativeDays
          let gameOver: boolean = state.gameOver

          if (newStats.money < 0) {
            consecutiveNegativeDays += deltaDay
            if (consecutiveNegativeDays >= GameTypes.BANKRUPTCY_THRESHOLD_DAYS) {
              gameOver = true
              GameEvents.emit('bankruptcy', { day: Math.floor(newDay) })
            }
          } else {
            consecutiveNegativeDays = 0
          }

          const updatedState: GameState = {
            ...state,
            stats: newStats,
            currentDay: newDay,
            lastTickTime: Date.now(),
            consecutiveNegativeDays,
            gameOver,
          }

          const newMilestones = Milestone.getNewlyAchieved(updatedState)
          let timeline = state.timeline
          for (const milestone of newMilestones) {
            timeline = Timeline.addEntry(timeline, milestone.id, newDay)
            GameEvents.emit('milestone:achieved', { milestoneId: milestone.id })
          }

          set({
            stats: newStats,
            currentDay: newDay,
            lastTickTime: Date.now(),
            consecutiveNegativeDays,
            gameOver,
            timeline,
            rates: computeRates({ ...updatedState, timeline }),
          })

          GameEvents.emit('tick', { deltaDay })
        },

        buildAtSlot: (buildingId: string, slotIndex: number) => {
          const state = get()
          const building = Building.getById(buildingId)

          if (!building) return false
          if (!Building.canAfford(building, state)) return false
          if (!Building.isUnlocked(building, state)) return false

          const slot = state.slots[slotIndex]
          if (!slot || slot.locked || slot.buildingId) return false

          const newStats = { ...state.stats }
          for (const cost of building.costs) {
            newStats[cost.statId] -= cost.amount
          }

          const newSlots = Slot.build(state.slots, slotIndex, buildingId)
          const newState = { ...state, stats: newStats, slots: newSlots }

          set({
            stats: newStats,
            slots: newSlots,
            rates: computeRates(newState),
          })

          GameEvents.emit('building:built', { buildingId, slotIndex })
          return true
        },

        demolishSlot: (slotIndex: number) => {
          const state = get()
          const slot = state.slots[slotIndex]

          if (!slot || !slot.buildingId) return false

          const buildingId = slot.buildingId
          const building = Building.getById(buildingId)
          const refundAmount = building
            ? Math.floor((building.costs[0]?.amount ?? 0) * 0.5)
            : 0

          const newStats = { ...state.stats }
          newStats.money += refundAmount

          const newSlots = Slot.demolish(state.slots, slotIndex)
          const newState = { ...state, stats: newStats, slots: newSlots }

          set({
            stats: newStats,
            slots: newSlots,
            rates: computeRates(newState),
          })

          GameEvents.emit('building:demolished', { buildingId, slotIndex })
          return true
        },

        purchasePerk: (perkId: string) => {
          const state = get()
          const perk = Perk.getById(perkId)

          if (!perk) return false
          if (Perk.isOwned(perk, state)) return false
          if (!Perk.canAfford(perk, state)) return false
          if (!Perk.isUnlocked(perk, state)) return false

          const newStats = { ...state.stats }
          for (const cost of perk.costs) {
            newStats[cost.statId] -= cost.amount
          }

          const newOwnedPerks = [...state.ownedPerks, perkId]
          let newSlots = state.slots

          if (Perk.isSlotPerk(perk)) {
            newSlots = Slot.unlockNext(state.slots)
          }

          const newState = { ...state, stats: newStats, ownedPerks: newOwnedPerks, slots: newSlots }

          set({
            stats: newStats,
            ownedPerks: newOwnedPerks,
            slots: newSlots,
            rates: computeRates(newState),
          })

          GameEvents.emit('perk:purchased', { perkId })
          return true
        },

        setTicketPrice: (price: number) => {
          const state = get()
          const clampedPrice = Math.max(
            GameTypes.MIN_TICKET_PRICE,
            Math.min(GameTypes.MAX_TICKET_PRICE, price)
          )
          const newState = { ...state, ticketPrice: clampedPrice }

          set({
            ticketPrice: clampedPrice,
            rates: computeRates(newState),
          })
        },

        reset: () => {
          const initial = GameTypes.createInitialState()
          set({
            ...initial,
            rates: Effects.aggregate([]),
          })
          GameEvents.emit('game:reset', undefined)
        },

        calculateOfflineProgress: (lastTime: number) => {
          const now = Date.now()
          const elapsed = now - lastTime
          const daysElapsed = elapsed / GameTypes.DAY_LENGTH_MS

          if (daysElapsed <= 0) return

          const state = get()
          const rates = computeRates(state)

          const moneyRate = Effects.getFinalRate('money', rates)
          let daysToSimulate = daysElapsed

          if (moneyRate < 0 && state.stats.money > 0) {
            const daysUntilBankrupt =
              state.stats.money / Math.abs(moneyRate) +
              GameTypes.BANKRUPTCY_THRESHOLD_DAYS

            daysToSimulate = Math.min(daysElapsed, daysUntilBankrupt)
          }

          get().actions.tick(daysToSimulate)
        },
      },
    }),
    {
      name: 'idlepark-save',
      version: 1,
      partialize: (state) => ({
        stats: state.stats,
        slots: state.slots,
        ownedPerks: state.ownedPerks,
        timeline: state.timeline,
        currentDay: state.currentDay,
        lastTickTime: state.lastTickTime,
        consecutiveNegativeDays: state.consecutiveNegativeDays,
        gameOver: state.gameOver,
        ticketPrice: state.ticketPrice,
      }),
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>
        if (version === 0) {
          const oldMilestones = (state.achievedMilestones ?? []) as string[]
          const timeline: TimelineEntry[] = oldMilestones.map((id) => ({
            milestoneId: id,
            day: 1,
          }))
          delete state.achievedMilestones
          state.timeline = timeline
        }
        return state as GameState
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.rates = computeRates(state)
          state.actions.calculateOfflineProgress(state.lastTickTime)
          GameEvents.emit('game:loaded', undefined)
        }
      },
    }
  )
)

export class GameStore {
  static use = useGameStore
  static get = useGameStore.getState
  static set = useGameStore.setState
}
