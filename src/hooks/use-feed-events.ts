import { useEffect, useRef } from 'react'
import { GameEvents } from '../engine/events'
import { Feed } from '../systems/feed'
import { Guest } from '../systems/guest'
import { useGameStore } from '../store/game-store'

// Minimum time between feed entries (in ms)
const FEED_COOLDOWN = 5000

export function useFeedEvents() {
  const addFeedEntry = useGameStore((s) => s.actions.addFeedEntry)
  const previousStatsRef = useRef<{
    appeal: number
    guests: number
    money: number
    capacityPercent: number
  } | null>(null)
  const lastFeedTimeRef = useRef<number>(0)

  useEffect(() => {
    // Helper to add entry with cooldown check
    const addWithCooldown = (entry: ReturnType<typeof Feed.createEntry>, priority = false) => {
      const now = Date.now()
      // Priority events (player actions) bypass cooldown
      if (!priority && now - lastFeedTimeRef.current < FEED_COOLDOWN) {
        return false
      }
      lastFeedTimeRef.current = now
      addFeedEntry(entry)
      return true
    }

    // Building built - priority (player action)
    const unsubBuilt = GameEvents.on('building:built', ({ buildingId }) => {
      const state = useGameStore.getState()
      const entry = Feed.createEntry('building_built', state.currentDay, { buildingId })
      addWithCooldown(entry, true)
    })

    // Building demolished - priority (player action)
    const unsubDemolished = GameEvents.on('building:demolished', ({ buildingId }) => {
      const state = useGameStore.getState()
      const entry = Feed.createEntry('building_demolished', state.currentDay, { buildingId })
      addWithCooldown(entry, true)
    })

    // Milestone achieved - priority (important event)
    const unsubMilestone = GameEvents.on('milestone:achieved', ({ milestoneId }) => {
      const state = useGameStore.getState()
      const entry = Feed.createEntry('milestone_achieved', state.currentDay, { milestoneId })
      addWithCooldown(entry, true)
    })

    // Perk purchased - priority (player action)
    const unsubPerk = GameEvents.on('perk:purchased', ({ perkId }) => {
      const state = useGameStore.getState()
      const entry = Feed.createEntry('perk_purchased', state.currentDay, { perkId })
      addWithCooldown(entry, true)
    })

    // Guests departed - priority (important feedback)
    const unsubDeparted = GameEvents.on('guests:departed', ({ count }) => {
      if (count > 0) {
        const state = useGameStore.getState()
        const entry = Feed.createEntry('guest_departed', state.currentDay, { guestCount: count })
        addWithCooldown(entry, true)
      }
    })

    // Happening started - priority (important event)
    const unsubHappeningStarted = GameEvents.on('happening:started', ({ happeningId }) => {
      const state = useGameStore.getState()
      const entry = Feed.createEntry('happening_started', state.currentDay, { happeningId })
      addWithCooldown(entry, true)
    })

    // Happening ended - priority (important event)
    const unsubHappeningEnded = GameEvents.on('happening:ended', ({ happeningId }) => {
      const state = useGameStore.getState()
      const entry = Feed.createEntry('happening_ended', state.currentDay, { happeningId })
      addWithCooldown(entry, true)
    })

    // Tick-based events (appeal, guests, ambient, price, financial)
    const unsubTick = GameEvents.on('tick', () => {
      const state = useGameStore.getState()
      const { stats, ticketPrice, rates } = state

      // Calculate capacity percentage
      const capacity = Guest.getCapacity(state)
      const capacityPercent = capacity > 0 ? (stats.guests / capacity) * 100 : 0

      // Initialize previous stats on first tick
      if (!previousStatsRef.current) {
        previousStatsRef.current = {
          appeal: stats.appeal,
          guests: stats.guests,
          money: stats.money,
          capacityPercent,
        }
        return
      }

      const prev = previousStatsRef.current

      // Check guest threshold - priority (milestone-like)
      const guestThreshold = Feed.checkGuestThreshold(stats.guests, prev.guests)
      if (guestThreshold) {
        const entry = Feed.createEntry('guest_threshold', state.currentDay, {
          guestCount: guestThreshold,
        })
        addWithCooldown(entry, true)
      }

      // Check capacity thresholds - priority (important feedback)
      if (capacityPercent >= 100 && prev.capacityPercent < 100) {
        // Just hit full capacity
        const entry = Feed.createEntry('capacity_reached', state.currentDay)
        addWithCooldown(entry, true)
      } else if (capacityPercent >= 80 && prev.capacityPercent < 80) {
        // Just hit 80% capacity warning
        const entry = Feed.createEntry('capacity_warning', state.currentDay)
        addWithCooldown(entry, true)
      }

      // Check appeal changes - priority (important feedback)
      const appealEvent = Feed.getAppealEvent(stats.appeal, prev.appeal)
      if (appealEvent) {
        const entry = Feed.createEntry(appealEvent, state.currentDay)
        addWithCooldown(entry, true)
      }

      // Check price-based events (only if we have guests) - uses cooldown
      if (stats.guests >= 10) {
        const perceivedValue = Guest.calculatePerceivedValue(state)
        const priceEvent = Feed.getPriceEvent(perceivedValue)
        if (priceEvent) {
          const entry = Feed.createEntry(priceEvent, state.currentDay, {
            ticketPrice,
          })
          addWithCooldown(entry)
        }
      }

      // Check for financial events - priority (important feedback)
      if (rates.money > 50 && prev.money < 0 && stats.money > 0) {
        // Turnaround story
        const entry = Feed.createEntry('financial_success', state.currentDay)
        addWithCooldown(entry, true)
      } else if (stats.money < 0 && prev.money >= 0) {
        // Just went into debt
        const entry = Feed.createEntry('financial_warning', state.currentDay)
        addWithCooldown(entry, true)
      }

      // Check for ambient tweets (random) - uses cooldown
      if (Feed.shouldGenerateAmbient(stats.guests)) {
        const entry = Feed.createEntry('ambient', state.currentDay)
        addWithCooldown(entry)
      }

      // Update previous stats
      previousStatsRef.current = {
        appeal: stats.appeal,
        guests: stats.guests,
        money: stats.money,
        capacityPercent,
      }
    })

    // Game reset - clear previous stats
    const unsubReset = GameEvents.on('game:reset', () => {
      previousStatsRef.current = null
    })

    return () => {
      unsubBuilt()
      unsubDemolished()
      unsubMilestone()
      unsubPerk()
      unsubDeparted()
      unsubHappeningStarted()
      unsubHappeningEnded()
      unsubTick()
      unsubReset()
    }
  }, [addFeedEntry])
}
