import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState } from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import { GameEvents } from '../engine/events'
import { Effects } from '../engine/effects'
import { Modifiers, type Modifier, type ComputedRates } from '../engine/modifiers'
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
  unlockSlot: (slotIndex: number) => boolean
  setTicketPrice: (price: number) => void
  reset: () => void
  calculateOfflineProgress: (lastTime: number) => void
}

type GameStoreState = GameState & {
  rates: ComputedRates
  actions: GameActions
}

const collectModifiers = (state: GameState): Modifier[] => {
  const modifiers: Modifier[] = []

  // Collect from buildings
  for (const slot of state.slots) {
    if (slot.buildingId) {
      modifiers.push(...Building.getModifiers(slot.buildingId, slot.index))
    }
  }

  // Collect from perks
  for (const perkId of state.ownedPerks) {
    modifiers.push(...Perk.getModifiers(perkId))
  }

  // Collect from guests (dynamic, depends on current state)
  modifiers.push(...Guest.getModifiers(state))

  return modifiers
}

const computeRates = (state: GameState): ComputedRates => {
  const modifiers = collectModifiers(state)
  return Modifiers.computeAllRates(modifiers)
}

const emptyRates = (): ComputedRates => ({
  money: 0,
  guests: 0,
  entertainment: 0,
  food: 0,
  comfort: 0,
  cleanliness: 0,
  appeal: 0,
  satisfaction: 0,
})

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      ...GameTypes.createInitialState(),
      rates: emptyRates(),

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
          let rewardMoney = 0
          for (const milestone of newMilestones) {
            const achievedDay = Milestone.estimateAchievedDay(
              milestone,
              state.currentDay,
              state.stats,
              state.rates,
              newDay
            )
            timeline = Timeline.addEntry(timeline, milestone.id, achievedDay)
            rewardMoney += milestone.reward
            GameEvents.emit('milestone:achieved', { milestoneId: milestone.id })
          }

          const finalStats = { ...newStats, money: newStats.money + rewardMoney }

          set({
            stats: finalStats,
            currentDay: newDay,
            lastTickTime: Date.now(),
            consecutiveNegativeDays,
            gameOver,
            timeline,
            rates: computeRates({ ...updatedState, timeline, stats: finalStats }),
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
          const newState = { ...state, stats: newStats, ownedPerks: newOwnedPerks }

          set({
            stats: newStats,
            ownedPerks: newOwnedPerks,
            rates: computeRates(newState),
          })

          GameEvents.emit('perk:purchased', { perkId })
          return true
        },

        unlockSlot: (slotIndex: number) => {
          const state = get()
          const slot = state.slots[slotIndex]

          if (!slot || !slot.locked) return false
          if (!Slot.canUnlock(slotIndex, state)) return false

          const cost = GameTypes.SLOT_UNLOCK_COSTS[slotIndex] ?? 0
          if (state.stats.money < cost) return false

          const newStats = { ...state.stats, money: state.stats.money - cost }
          const newSlots = Slot.unlock(state.slots, slotIndex)
          const newState = { ...state, stats: newStats, slots: newSlots }

          set({
            stats: newStats,
            slots: newSlots,
            rates: computeRates(newState),
          })

          GameEvents.emit('slot:unlocked', { slotIndex })
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
            rates: emptyRates(),
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

          const moneyRate = rates.money
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
