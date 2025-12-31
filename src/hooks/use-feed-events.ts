import { useEffect, useRef } from 'react'
import { GameEvents } from '../engine/events'
import { Feed } from '../systems/feed'
import { useGameStore } from '../store/game-store'

// Minimum time between feed entries (in ms)
const FEED_COOLDOWN = 5000

export function useFeedEvents() {
  const addFeedEntry = useGameStore((s) => s.actions.addFeedEntry)
  const previousStatsRef = useRef<{
    satisfaction: number
    guests: number
    money: number
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

    // Tick-based events (satisfaction, guests, ambient, price, financial)
    const unsubTick = GameEvents.on('tick', () => {
      const state = useGameStore.getState()
      const { stats, ticketPrice, rates } = state

      // Initialize previous stats on first tick
      if (!previousStatsRef.current) {
        previousStatsRef.current = {
          satisfaction: stats.satisfaction,
          guests: stats.guests,
          money: stats.money,
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

      // Check satisfaction changes - priority (important feedback)
      const satisfactionEvent = Feed.getSatisfactionEvent(stats.satisfaction, prev.satisfaction)
      if (satisfactionEvent) {
        const entry = Feed.createEntry(satisfactionEvent, state.currentDay)
        addWithCooldown(entry, true)
      }

      // Check price-based events (only if we have guests) - uses cooldown
      if (stats.guests >= 10) {
        const priceEvent = Feed.getPriceEvent(ticketPrice)
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
        satisfaction: stats.satisfaction,
        guests: stats.guests,
        money: stats.money,
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
      unsubTick()
      unsubReset()
    }
  }, [addFeedEntry])
}
