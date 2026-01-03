import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, DailyRecord, FinancialStats, FeedEntry, MarketingCampaignId, FastPassTier, BankLoanPackageId } from '../engine/game-types'
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
import { Service } from '../systems/service'
import { Marketing } from '../systems/marketing'
import { Bank } from '../systems/bank'
import { Season } from '../systems/season'
import { Wish } from '../systems/wish'
import { calculateGuestTypeMix } from '../systems/guest-types'
import type { SimulationState } from '../systems/guest-simulation'
import {
  createSimulation,
  tickSimulation,
  addGuests,
  getShopModifiersFromSimulation,
  notifyBuildingsChanged,
  getGuestBreakdownFromSim,
  getTotalGuestsFromSim,
} from '../systems/guest-simulation'

const MAX_DAILY_RECORDS = 30

type GameActions = {
  tick: (deltaDay: number) => void
  buildAtSlot: (buildingId: string, slotIndex: number) => boolean
  demolishSlot: (slotIndex: number) => boolean
  purchasePerk: (perkId: string) => boolean
  setTicketPrice: (price: number) => void
  setFastPassTier: (tier: FastPassTier) => void
  startCampaign: (campaignId: MarketingCampaignId) => boolean
  takeLoan: (packageId: BankLoanPackageId) => boolean
  addFeedEntry: (entry: FeedEntry) => void
  markFeedRead: () => void
  reset: () => void
  calculateOfflineProgress: (lastTime: number) => void
}

type GameStoreState = GameState & {
  rates: ComputedRates
  modifiers: Modifier[]
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

  // Collect shop income from simulation visitor counts
  modifiers.push(...getShopModifiersFromSimulation(state.guestSimulation as SimulationState, state.slots))

  // Collect from perks
  for (const perkId of state.ownedPerks) {
    modifiers.push(...Perk.getModifiers(perkId))
  }

  // Collect from guests (dynamic, depends on current state)
  modifiers.push(...Guest.getModifiers(state))

  // Collect from services (dynamic, depends on current state)
  modifiers.push(...Service.getModifiers(state))

  // Collect from active happening
  if (state.currentHappening) {
    modifiers.push(...Happening.getModifiers(state.currentHappening.happeningId))
  }

  // Collect from active marketing campaign
  modifiers.push(...Marketing.getModifiers(state))

  // Collect from current season
  modifiers.push(...Season.getModifiers(state.currentDay))

  return modifiers
}

const computeRatesAndModifiers = (state: GameState): { rates: ComputedRates; modifiers: Modifier[] } => {
  const modifiers = collectModifiers(state)
  const rates = Modifiers.computeAllRates(modifiers)
  return { rates, modifiers }
}

const emptyRates = (): ComputedRates => ({
  money: 0,
  guests: 0,
  entertainment: 0,
  food: 0,
  comfort: 0,
  cleanliness: 0,
  beauty: 0,
  appeal: 0,
})

// Create initial simulation state
const createInitialSimulation = (): SimulationState => {
  return createSimulation()
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      ...GameTypes.createInitialState(),
      guestSimulation: createInitialSimulation(),
      rates: emptyRates(),
      modifiers: [],

      actions: {
        tick: (deltaDay: number) => {
          const state = get()
          if (state.gameOver) return

          const prevDayInt = Math.floor(state.currentDay)
          const newDay = state.currentDay + deltaDay
          const newDayInt = Math.floor(newDay)
          const crossedDayBoundary = newDayInt > prevDayInt

          const guestSimulation = state.guestSimulation as SimulationState

          // Process arrivals into simulation
          const arrivalRate = Guest.calculateArrivalRate(state)
          const capacity = Guest.getCapacity(state)
          const currentTotal = getTotalGuestsFromSim(guestSimulation)
          const availableSpace = Math.max(0, capacity - currentTotal)
          const potentialArrivals = arrivalRate * deltaDay
          const actualArrivals = Math.min(potentialArrivals, availableSpace)

          if (actualArrivals > 0) {
            addGuests(guestSimulation, actualArrivals, state.guestTypeMix)
          }

          // Run simulation tick
          const simResult = tickSimulation(guestSimulation, deltaDay, {
            slots: state.slots,
            buildingDefs: new Map(),
            guestTypeMix: state.guestTypeMix,
            appeal: state.stats.appeal,
          })

          const guestBreakdown = simResult.guestBreakdown
          const naturalDeparted = simResult.departures.natural
          const unhappyDeparted = simResult.departures.unhappy
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

          // Calculate service income boost
          const serviceBoost = guestIncome * (Service.getTotalIncomeBoostPercent(state) / 100)

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
          for (const milestone of newMilestones) {
            const achievedDay = Milestone.estimateAchievedDay(
              milestone,
              state.currentDay,
              state.stats,
              state.rates,
              newDay
            )
            timeline = Timeline.addEntry(timeline, milestone.id, achievedDay)
            GameEvents.emit('milestone:achieved', { milestoneId: milestone.id })
          }

          const finalStats = newStats

          // Update financials (mutable - loan repayment will update later)
          let financials: FinancialStats = {
            ...state.financials,
            totalEarned: state.financials.totalEarned + guestIncome + serviceBoost,
            totalUpkeepPaid: state.financials.totalUpkeepPaid + buildingUpkeep,
            peakMoney: Math.max(state.financials.peakMoney, finalStats.money),
            peakGuests: Math.max(state.financials.peakGuests, totalGuests),
          }

          // Update daily records when crossing day boundaries
          let dailyRecords = state.dailyRecords
          let guestTypeMix = state.guestTypeMix

          if (crossedDayBoundary) {
            const dayRecord: DailyRecord = {
              day: prevDayInt,
              moneyEarned: guestIncome + serviceBoost - buildingUpkeep,
              peakGuests: Math.max(GameTypes.getTotalGuests(state.guestBreakdown), totalGuests),
              peakAppeal: Math.max(state.stats.appeal, finalStats.appeal),
            }
            dailyRecords = [...dailyRecords, dayRecord].slice(-MAX_DAILY_RECORDS)

            // Recalculate guest type mix (once per day, not per tick)
            guestTypeMix = calculateGuestTypeMix(state)

            // Emit events for guest departures
            if (unhappyDeparted > 0) {
              GameEvents.emit('guests:departed', { count: unhappyDeparted })
            }
            if (naturalDeparted > 0) {
              GameEvents.emit('guests:departed_natural', { count: naturalDeparted })
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
            const stateForHappening = { ...updatedState, currentDay: newDay, lastHappeningType }
            const nextHappening = Happening.selectNext(stateForHappening)
            currentHappening = Happening.start(stateForHappening, nextHappening.id)
            timeline = [...timeline, {
              type: 'happening_started' as const,
              happeningId: nextHappening.id,
              day: Math.floor(newDay),
            }]
            GameEvents.emit('happening:started', { happeningId: nextHappening.id })
          }

          // Process marketing campaigns
          let marketing = state.marketing
          if (Marketing.shouldEndCampaign({ ...state, currentDay: newDay, marketing })) {
            marketing = Marketing.endCampaign({ ...state, currentDay: newDay })
            GameEvents.emit('marketing:ended', { campaignId: state.marketing?.activeCampaign?.campaignId })
          }

          // Process bank loan repayment at day boundary
          let bankLoan = state.bankLoan
          let lastLoanRepaidDay = state.lastLoanRepaidDay
          if (crossedDayBoundary && bankLoan) {
            const loanPackageId = bankLoan.packageId
            const repaymentResult = Bank.processDailyRepayment({ ...state, bankLoan })
            finalStats.money -= repaymentResult.amountPaid
            // Track loan repayments in financials
            financials = {
              ...financials,
              totalLoanRepaid: financials.totalLoanRepaid + repaymentResult.amountPaid,
            }
            if (repaymentResult.newState.bankLoan !== undefined) {
              bankLoan = repaymentResult.newState.bankLoan
            }
            if (repaymentResult.newState.lastLoanRepaidDay !== undefined) {
              lastLoanRepaidDay = repaymentResult.newState.lastLoanRepaidDay
              GameEvents.emit('bank:loan_repaid', { packageId: loanPackageId })
            }
          }

          // Process wishes
          let wishes = Wish.cleanupExpired(state.wishes, newDay)
          let wishBoost = state.wishBoost
          let lastWishDay = state.lastWishDay
          let feedEntries = state.feedEntries
          let unreadFeedCount = state.unreadFeedCount

          // Clean up expired boost
          if (wishBoost && wishBoost.expiresDay <= newDay) {
            wishBoost = null
          }

          // Try to generate new wish
          const wishState = { ...updatedState, currentDay: newDay, wishes, lastWishDay }
          if (Wish.shouldGenerateWish(wishState)) {
            const generated = Wish.generateWish(wishState)
            if (generated) {
              wishes = [...wishes, generated.wish]
              feedEntries = Feed.addEntry(feedEntries, generated.feedEntry)
              unreadFeedCount++
              lastWishDay = newDay
              GameEvents.emit('feed:new', { entry: generated.feedEntry })
            }
          }

          const computed = computeRatesAndModifiers({ ...updatedState, timeline, stats: finalStats, dailyRecords, financials, guestBreakdown, guestTypeMix, currentHappening, nextHappeningDay, lastHappeningType, marketing, bankLoan, lastLoanRepaidDay, wishes, wishBoost, lastWishDay, guestSimulation })
          set({
            stats: finalStats,
            guestBreakdown,
            guestTypeMix,
            guestSimulation,
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
            marketing,
            bankLoan,
            lastLoanRepaidDay,
            wishes,
            wishBoost,
            lastWishDay,
            feedEntries,
            unreadFeedCount,
            rates: computed.rates,
            modifiers: computed.modifiers,
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

          // Check if this fulfills a wish
          const fulfilledWish = Wish.checkFulfillment(state, buildingId)
          let wishes = state.wishes
          let wishBoost = state.wishBoost
          let feedEntries = state.feedEntries
          let unreadFeedCount = state.unreadFeedCount

          if (fulfilledWish) {
            wishes = Wish.removeFulfilled(wishes, buildingId)
            wishBoost = Wish.createBoost(state)
            const celebrationEntry = Wish.generateFulfillmentEntry(state, buildingId)
            feedEntries = Feed.addEntry(feedEntries, celebrationEntry)
            unreadFeedCount++
            GameEvents.emit('feed:new', { entry: celebrationEntry })
            GameEvents.emit('wish:fulfilled', { buildingId, boost: wishBoost })
          }

          const newState = { ...state, stats: newStats, slots: newSlots, financials, wishes, wishBoost, feedEntries, unreadFeedCount }

          // Recalculate guest type mix when buildings change
          const guestTypeMix = calculateGuestTypeMix(newState)

          // Notify simulation of building changes
          notifyBuildingsChanged(state.guestSimulation as SimulationState, newSlots)

          const computed = computeRatesAndModifiers(newState)
          set({
            stats: newStats,
            slots: newSlots,
            financials,
            wishes,
            wishBoost,
            feedEntries,
            unreadFeedCount,
            guestTypeMix,
            rates: computed.rates,
            modifiers: computed.modifiers,
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

          // Recalculate guest type mix when buildings change
          const guestTypeMix = calculateGuestTypeMix(newState)

          // Notify simulation of building changes
          notifyBuildingsChanged(state.guestSimulation as SimulationState, newSlots)

          const computed = computeRatesAndModifiers(newState)
          set({
            stats: newStats,
            slots: newSlots,
            guestTypeMix,
            rates: computed.rates,
            modifiers: computed.modifiers,
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

          // If this is a service perk, initialize the service
          let newServices = state.services
          if (Perk.isServicePerk(perk)) {
            const serviceDef = Service.getById(perk.serviceId)
            if (serviceDef) {
              newServices = [...state.services, {
                serviceId: perk.serviceId,
              }]
            }
          }

          const newState = { ...state, stats: newStats, ownedPerks: newOwnedPerks, slots: newSlots, services: newServices, financials }

          const computed = computeRatesAndModifiers(newState)
          set({
            stats: newStats,
            ownedPerks: newOwnedPerks,
            slots: newSlots,
            services: newServices,
            financials,
            rates: computed.rates,
            modifiers: computed.modifiers,
          })

          GameEvents.emit('perk:purchased', { perkId })
          if (investmentAmount > 0) {
            GameEvents.emit('money:changed', { amount: -investmentAmount, reason: 'perk' })
          }
          return true
        },

        setTicketPrice: (price: number) => {
          const state = get()
          const maxPrice = Perk.getMaxTicketPrice(state)
          const clampedPrice = Math.max(
            GameTypes.MIN_TICKET_PRICE,
            Math.min(maxPrice, price)
          )
          const newState = { ...state, ticketPrice: clampedPrice }

          const computed = computeRatesAndModifiers(newState)
          set({
            ticketPrice: clampedPrice,
            rates: computed.rates,
            modifiers: computed.modifiers,
          })
        },

        setFastPassTier: (tier: FastPassTier) => {
          const state = get()
          const newState = { ...state, fastPassTier: tier }
          const computed = computeRatesAndModifiers(newState)

          set({
            fastPassTier: tier,
            rates: computed.rates,
            modifiers: computed.modifiers,
          })
        },

        startCampaign: (campaignId: MarketingCampaignId) => {
          const state = get()
          const campaign = Marketing.getById(campaignId)

          if (!campaign) return false

          const { canBuy } = Marketing.canPurchase(campaign, state)
          if (!canBuy) return false

          const newStats = { ...state.stats }
          newStats.money -= campaign.cost

          const marketing = Marketing.startCampaign(campaign, state)
          const financials = {
            ...state.financials,
            totalInvested: state.financials.totalInvested + campaign.cost,
          }

          const newState = { ...state, stats: newStats, marketing, financials }

          const computed = computeRatesAndModifiers(newState)
          set({
            stats: newStats,
            marketing,
            financials,
            rates: computed.rates,
            modifiers: computed.modifiers,
          })

          GameEvents.emit('marketing:started', { campaignId })
          GameEvents.emit('money:changed', { amount: -campaign.cost, reason: 'marketing' })
          return true
        },

        takeLoan: (packageId: BankLoanPackageId) => {
          const state = get()
          const pkg = Bank.getById(packageId)

          if (!pkg) return false

          const { canBuy } = Bank.canTakeLoan(pkg, state)
          if (!canBuy) return false

          const loanAmount = Bank.getLoanAmount(pkg, state)
          const newStats = { ...state.stats }
          newStats.money += loanAmount

          const bankLoan = {
            packageId,
            remainingAmount: Bank.getTotalRepayment(pkg, state),
            dailyPayment: Bank.getDailyPayment(pkg, state),
            startDay: state.currentDay,
          }

          const financials = {
            ...state.financials,
            totalBorrowed: state.financials.totalBorrowed + loanAmount,
            peakMoney: Math.max(state.financials.peakMoney, newStats.money),
          }

          const newState = { ...state, stats: newStats, bankLoan, financials }

          const computed = computeRatesAndModifiers(newState)
          set({
            stats: newStats,
            bankLoan,
            financials,
            rates: computed.rates,
            modifiers: computed.modifiers,
          })

          GameEvents.emit('bank:loan_taken', { packageId, amount: loanAmount })
          GameEvents.emit('money:changed', { amount: loanAmount, reason: 'loan' })
          return true
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
            guestSimulation: createInitialSimulation(),
            rates: emptyRates(),
            modifiers: [],
          })
          GameEvents.emit('game:reset', undefined)
        },

        calculateOfflineProgress: (lastTime: number) => {
          const now = Date.now()
          const elapsed = now - lastTime
          const daysElapsed = elapsed / GameTypes.DAY_LENGTH_MS

          if (daysElapsed <= 0) return

          const state = get()
          const { rates } = computeRatesAndModifiers(state)

          const moneyRate = rates.money
          let daysToSimulate = daysElapsed

          // Cap offline progression to 60 days (~30 min real time)
          const MAX_OFFLINE_DAYS = 60
          daysToSimulate = Math.min(daysToSimulate, MAX_OFFLINE_DAYS)

          if (moneyRate < 0 && state.stats.money > 0) {
            const daysUntilBankrupt =
              state.stats.money / Math.abs(moneyRate) +
              GameTypes.BANKRUPTCY_THRESHOLD_DAYS

            daysToSimulate = Math.min(daysToSimulate, daysUntilBankrupt)
          }

          // Process day by day so happenings, daily records, etc. work correctly
          const fullDays = Math.floor(daysToSimulate)
          const remainder = daysToSimulate - fullDays

          for (let i = 0; i < fullDays; i++) {
            get().actions.tick(1)
          }

          if (remainder > 0) {
            get().actions.tick(remainder)
          }
        },
      },
    }),
    {
      name: 'idlepark-save',
      partialize: (state) => ({
        stats: state.stats,
        slots: state.slots,
        ownedPerks: state.ownedPerks,
        services: state.services,
        marketing: state.marketing,
        timeline: state.timeline,
        dailyRecords: state.dailyRecords,
        financials: state.financials,
        guestBreakdown: state.guestBreakdown,
        guestTypeMix: state.guestTypeMix,
        feedEntries: state.feedEntries,
        unreadFeedCount: state.unreadFeedCount,
        currentDay: state.currentDay,
        lastTickTime: state.lastTickTime,
        consecutiveNegativeDays: state.consecutiveNegativeDays,
        gameOver: state.gameOver,
        ticketPrice: state.ticketPrice,
        fastPassTier: state.fastPassTier,
        bankLoan: state.bankLoan,
        lastLoanRepaidDay: state.lastLoanRepaidDay,
        currentHappening: state.currentHappening,
        nextHappeningDay: state.nextHappeningDay,
        lastHappeningType: state.lastHappeningType,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure guestTypeMix exists for older saves
          if (!state.guestTypeMix) {
            state.guestTypeMix = calculateGuestTypeMix(state)
          }
          // Initialize fresh simulation from saved breakdown
          state.guestSimulation = createInitialSimulation()
          // Populate simulation with guests matching saved breakdown
          const totalGuests = GameTypes.getTotalGuests(state.guestBreakdown)
          if (totalGuests > 0) {
            addGuests(state.guestSimulation as SimulationState, totalGuests, state.guestTypeMix)
          }
          const computed = computeRatesAndModifiers(state)
          state.rates = computed.rates
          state.modifiers = computed.modifiers
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
