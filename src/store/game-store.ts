import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, DailyRecord, FinancialStats, FeedEntry } from '../engine/game-types'
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
import { Feed } from '../systems/feed'
import { Happening } from '../systems/happening'

const MAX_DAILY_RECORDS = 30

type GameActions = {
  tick: (deltaDay: number) => void
  buildAtSlot: (buildingId: string, slotIndex: number) => boolean
  demolishSlot: (slotIndex: number) => boolean
  purchasePerk: (perkId: string) => boolean
  setTicketPrice: (price: number) => void
  addFeedEntry: (entry: FeedEntry) => void
  markFeedRead: () => void
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

  // Collect from active happening
  if (state.currentHappening) {
    modifiers.push(...Happening.getModifiers(state.currentHappening.happeningId))
  }

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

          const prevDayInt = Math.floor(state.currentDay)
          const newDay = state.currentDay + deltaDay
          const newDayInt = Math.floor(newDay)
          const crossedDayBoundary = newDayInt > prevDayInt

          // Process guest tier system
          let guestBreakdown = state.guestBreakdown

          // 1. Process arrivals (new guests start as neutral)
          const arrivalRate = Guest.calculateArrivalRate(state)
          guestBreakdown = Guest.processArrivals(guestBreakdown, arrivalRate, deltaDay)

          // 2. Process tier transitions based on appeal
          const currentAppeal = Guest.calculateAppeal(state)
          guestBreakdown = Guest.processTransitions(guestBreakdown, currentAppeal, deltaDay)

          // 3. Process unhappy departures at day boundary
          let departedGuests = 0
          if (crossedDayBoundary) {
            const result = Guest.processUnhappyDepartures(guestBreakdown)
            guestBreakdown = result.newBreakdown
            departedGuests = result.departed
          }

          const totalGuests = GameTypes.getTotalGuests(guestBreakdown)

          // Calculate income and upkeep separately for tracking
          const guestIncome = Guest.calculateIncomeWithEntertainment(
            totalGuests,
            state.ticketPrice,
            state.stats.entertainment
          ) * deltaDay

          const buildingUpkeep = state.slots.reduce((total, slot) => {
            if (slot.buildingId) {
              const building = Building.getById(slot.buildingId)
              if (building) {
                const upkeep = building.effects.find(e => e.statId === 'money' && e.perDay < 0)
                return total + Math.abs(upkeep?.perDay ?? 0) * deltaDay
              }
            }
            return total
          }, 0)

          let newStats = Effects.applyRates(state.stats, state.rates, deltaDay)

          // Sync guests stat with breakdown total
          newStats.guests = totalGuests

          const tempState = { ...state, stats: newStats, guestBreakdown }

          newStats = {
            ...newStats,
            appeal: Guest.calculateAppeal(tempState),
          }

          newStats = Effects.clampStats(newStats)
          // Re-sync after clamp since clampStats floors guests
          newStats.guests = totalGuests

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
            guestBreakdown,
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
            if (milestone.reward > 0) {
              GameEvents.emit('money:changed', { amount: milestone.reward, reason: 'milestone' })
            }
          }

          const finalStats = { ...newStats, money: newStats.money + rewardMoney }

          // Update financials
          const financials: FinancialStats = {
            ...state.financials,
            totalEarned: state.financials.totalEarned + guestIncome + rewardMoney,
            totalUpkeepPaid: state.financials.totalUpkeepPaid + buildingUpkeep,
            peakMoney: Math.max(state.financials.peakMoney, finalStats.money),
            peakGuests: Math.max(state.financials.peakGuests, totalGuests),
          }

          // Update daily records when crossing day boundaries
          let dailyRecords = state.dailyRecords

          if (crossedDayBoundary) {
            const dayRecord: DailyRecord = {
              day: prevDayInt,
              moneyEarned: guestIncome + rewardMoney - buildingUpkeep,
              peakGuests: Math.max(GameTypes.getTotalGuests(state.guestBreakdown), totalGuests),
              peakAppeal: Math.max(state.stats.appeal, finalStats.appeal),
            }
            dailyRecords = [...dailyRecords, dayRecord].slice(-MAX_DAILY_RECORDS)

            // Emit event if guests departed
            if (departedGuests > 0) {
              GameEvents.emit('guests:departed', { count: departedGuests })
            }
          }

          // Process happenings
          let currentHappening = state.currentHappening
          let nextHappeningDay = state.nextHappeningDay
          let lastHappeningType = state.lastHappeningType

          // Check if current happening should end
          if (currentHappening && newDay >= currentHappening.endDay) {
            const endedHappening = Happening.getById(currentHappening.happeningId)
            if (endedHappening) {
              timeline = [...timeline, {
                type: 'happening_ended' as const,
                happeningId: currentHappening.happeningId,
                day: Math.floor(currentHappening.endDay),
              }]
              GameEvents.emit('happening:ended', { happeningId: currentHappening.happeningId })
              lastHappeningType = endedHappening.type
            }
            currentHappening = null
            nextHappeningDay = Happening.calculateNextDay(newDay)
          }

          // Check if a new happening should start
          if (!currentHappening && newDay >= nextHappeningDay) {
            const nextHappening = Happening.selectNext(lastHappeningType)
            currentHappening = Happening.start({ ...updatedState, currentDay: newDay }, nextHappening.id)
            timeline = [...timeline, {
              type: 'happening_started' as const,
              happeningId: nextHappening.id,
              day: Math.floor(newDay),
            }]
            GameEvents.emit('happening:started', { happeningId: nextHappening.id })
          }

          set({
            stats: finalStats,
            guestBreakdown,
            currentDay: newDay,
            lastTickTime: Date.now(),
            consecutiveNegativeDays,
            gameOver,
            timeline,
            dailyRecords,
            financials,
            currentHappening,
            nextHappeningDay,
            lastHappeningType,
            rates: computeRates({ ...updatedState, timeline, stats: finalStats, dailyRecords, financials, guestBreakdown, currentHappening, nextHappeningDay, lastHappeningType }),
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
          let investmentAmount = 0
          for (const cost of building.costs) {
            newStats[cost.statId] -= cost.amount
            if (cost.statId === 'money') {
              investmentAmount += cost.amount
            }
          }

          const newSlots = Slot.build(state.slots, slotIndex, buildingId)
          const financials = {
            ...state.financials,
            totalInvested: state.financials.totalInvested + investmentAmount,
          }
          const newState = { ...state, stats: newStats, slots: newSlots, financials }

          set({
            stats: newStats,
            slots: newSlots,
            financials,
            rates: computeRates(newState),
          })

          GameEvents.emit('building:built', { buildingId, slotIndex })
          if (investmentAmount > 0) {
            GameEvents.emit('money:changed', { amount: -investmentAmount, reason: 'building' })
          }
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
          if (refundAmount > 0) {
            GameEvents.emit('money:changed', { amount: refundAmount, reason: 'demolish' })
          }
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
          let investmentAmount = 0
          for (const cost of perk.costs) {
            newStats[cost.statId] -= cost.amount
            if (cost.statId === 'money') {
              investmentAmount += cost.amount
            }
          }

          const newOwnedPerks = [...state.ownedPerks, perkId]
          const financials = {
            ...state.financials,
            totalInvested: state.financials.totalInvested + investmentAmount,
          }

          // If this is an expansion perk, unlock the new slots
          let newSlots = state.slots
          if (Perk.isSlotPerk(perk)) {
            const tempState = { ...state, ownedPerks: newOwnedPerks }
            const slotsToUnlock = Slot.getSlotsToUnlock(tempState)
            if (slotsToUnlock.length > 0) {
              newSlots = Slot.unlockMultiple(state.slots, slotsToUnlock)
            }
          }

          const newState = { ...state, stats: newStats, ownedPerks: newOwnedPerks, slots: newSlots, financials }

          set({
            stats: newStats,
            ownedPerks: newOwnedPerks,
            slots: newSlots,
            financials,
            rates: computeRates(newState),
          })

          GameEvents.emit('perk:purchased', { perkId })
          if (investmentAmount > 0) {
            GameEvents.emit('money:changed', { amount: -investmentAmount, reason: 'perk' })
          }
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

        addFeedEntry: (entry: FeedEntry) => {
          const state = get()
          const feedEntries = Feed.addEntry(state.feedEntries, entry)
          set({
            feedEntries,
            unreadFeedCount: state.unreadFeedCount + 1,
          })
          GameEvents.emit('feed:new', { entry })
        },

        markFeedRead: () => {
          set({ unreadFeedCount: 0 })
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
        dailyRecords: state.dailyRecords,
        financials: state.financials,
        guestBreakdown: state.guestBreakdown,
        feedEntries: state.feedEntries,
        unreadFeedCount: state.unreadFeedCount,
        currentDay: state.currentDay,
        lastTickTime: state.lastTickTime,
        consecutiveNegativeDays: state.consecutiveNegativeDays,
        gameOver: state.gameOver,
        ticketPrice: state.ticketPrice,
        currentHappening: state.currentHappening,
        nextHappeningDay: state.nextHappeningDay,
        lastHappeningType: state.lastHappeningType,
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
