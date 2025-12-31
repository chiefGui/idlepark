import { useEffect, useRef } from 'react'
import { GameEvents } from '../engine/events'
import { Feed } from '../systems/feed'
import { useGameStore } from '../store/game-store'

export function useFeedEvents() {
  const addFeedEntry = useGameStore((s) => s.actions.addFeedEntry)
  const previousStatsRef = useRef<{
    satisfaction: number
    guests: number
    money: number
  } | null>(null)

  useEffect(() => {
    // Building built
    const unsubBuilt = GameEvents.on('building:built', ({ buildingId }) => {
      const state = useGameStore.getState()
      const entry = Feed.createEntry('building_built', state.currentDay, { buildingId })
      addFeedEntry(entry)
    })

    // Building demolished
    const unsubDemolished = GameEvents.on('building:demolished', ({ buildingId }) => {
      const state = useGameStore.getState()
      const entry = Feed.createEntry('building_demolished', state.currentDay, { buildingId })
      addFeedEntry(entry)
    })

    // Milestone achieved
    const unsubMilestone = GameEvents.on('milestone:achieved', ({ milestoneId }) => {
      const state = useGameStore.getState()
      const entry = Feed.createEntry('milestone_achieved', state.currentDay, { milestoneId })
      addFeedEntry(entry)
    })

    // Perk purchased
    const unsubPerk = GameEvents.on('perk:purchased', ({ perkId }) => {
      const state = useGameStore.getState()
      const entry = Feed.createEntry('perk_purchased', state.currentDay, { perkId })
      addFeedEntry(entry)
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

      // Check guest threshold
      const guestThreshold = Feed.checkGuestThreshold(stats.guests, prev.guests)
      if (guestThreshold) {
        const entry = Feed.createEntry('guest_threshold', state.currentDay, {
          guestCount: guestThreshold,
        })
        addFeedEntry(entry)
      }

      // Check satisfaction changes
      const satisfactionEvent = Feed.getSatisfactionEvent(stats.satisfaction, prev.satisfaction)
      if (satisfactionEvent) {
        const entry = Feed.createEntry(satisfactionEvent, state.currentDay)
        addFeedEntry(entry)
      }

      // Check price-based events (only if we have guests)
      if (stats.guests >= 10) {
        const priceEvent = Feed.getPriceEvent(ticketPrice)
        if (priceEvent) {
          const entry = Feed.createEntry(priceEvent, state.currentDay, {
            ticketPrice,
          })
          addFeedEntry(entry)
        }
      }

      // Check for financial events
      if (rates.money > 50 && prev.money < 0 && stats.money > 0) {
        // Turnaround story
        const entry = Feed.createEntry('financial_success', state.currentDay)
        addFeedEntry(entry)
      } else if (stats.money < 0 && prev.money >= 0) {
        // Just went into debt
        const entry = Feed.createEntry('financial_warning', state.currentDay)
        addFeedEntry(entry)
      }

      // Check for ambient tweets (random)
      if (Feed.shouldGenerateAmbient(stats.guests)) {
        const entry = Feed.createEntry('ambient', state.currentDay)
        addFeedEntry(entry)
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
      unsubTick()
      unsubReset()
    }
  }, [addFeedEntry])
}
