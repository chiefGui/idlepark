import { useEffect, useRef } from 'react'
import type { FeedEventType } from '../engine/game-types'
import { GameEvents } from '../engine/events'
import { Feed } from '../systems/feed'
import { Guest } from '../systems/guest'
import { useGameStore } from '../store/game-store'

const FEED_COOLDOWN = 5000

// Declarative config for priority events (player actions / important events)
const PRIORITY_EVENTS = [
  { event: 'building:built', type: 'building_built', contextKey: 'buildingId' },
  { event: 'building:demolished', type: 'building_demolished', contextKey: 'buildingId' },
  { event: 'milestone:achieved', type: 'milestone_achieved', contextKey: 'milestoneId' },
  { event: 'perk:purchased', type: 'perk_purchased', contextKey: 'perkId' },
  { event: 'happening:started', type: 'happening_started', contextKey: 'happeningId' },
  { event: 'happening:ended', type: 'happening_ended', contextKey: 'happeningId' },
  { event: 'guests:departed', type: 'guest_departed', contextKey: 'guestCount', condition: (p: { count: number }) => p.count > 0 },
] as const satisfies ReadonlyArray<{
  event: string
  type: FeedEventType
  contextKey?: string
  condition?: (payload: { count: number }) => boolean
}>

type PrevStats = {
  appeal: number
  guests: number
  money: number
  capacityPercent: number
}

export function useFeedEvents() {
  const addFeedEntry = useGameStore((s) => s.actions.addFeedEntry)
  const prevRef = useRef<PrevStats | null>(null)
  const lastFeedTimeRef = useRef<number>(0)

  useEffect(() => {
    const addWithCooldown = (entry: ReturnType<typeof Feed.createEntry>, priority = false) => {
      const now = Date.now()
      if (!priority && now - lastFeedTimeRef.current < FEED_COOLDOWN) return false
      lastFeedTimeRef.current = now
      addFeedEntry(entry)
      return true
    }

    const unsubs: (() => void)[] = []

    // Subscribe to all priority events declaratively
    for (const config of PRIORITY_EVENTS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsub = GameEvents.on(config.event as any, (payload: any) => {
        if (config.condition && !config.condition(payload)) return
        const state = useGameStore.getState()
        const context = config.contextKey
          ? { [config.contextKey]: payload[config.contextKey] ?? payload.count }
          : undefined
        const entry = Feed.createEntry(config.type, state.currentDay, context)
        addWithCooldown(entry, true)
      })
      unsubs.push(unsub)
    }

    // Tick-based threshold events
    unsubs.push(
      GameEvents.on('tick', () => {
        const state = useGameStore.getState()
        const { stats, ticketPrice, rates } = state

        const capacity = Guest.getCapacity(state)
        const capacityPercent = capacity > 0 ? (stats.guests / capacity) * 100 : 0

        // Initialize on first tick
        if (!prevRef.current) {
          prevRef.current = {
            appeal: stats.appeal,
            guests: stats.guests,
            money: stats.money,
            capacityPercent,
          }
          return
        }

        const prev = prevRef.current

        // Check all thresholds
        const guestThreshold = Feed.checkGuestThreshold(stats.guests, prev.guests)
        if (guestThreshold) {
          addWithCooldown(Feed.createEntry('guest_threshold', state.currentDay, { guestCount: guestThreshold }), true)
        }

        const capacityEvent = Feed.checkCapacityThreshold(capacityPercent, prev.capacityPercent)
        if (capacityEvent) {
          addWithCooldown(Feed.createEntry(capacityEvent, state.currentDay), true)
        }

        const appealEvent = Feed.checkAppealThreshold(stats.appeal, prev.appeal)
        if (appealEvent) {
          addWithCooldown(Feed.createEntry(appealEvent, state.currentDay), true)
        }

        const financialEvent = Feed.checkFinancialThreshold(stats.money, prev.money, rates.money)
        if (financialEvent) {
          addWithCooldown(Feed.createEntry(financialEvent, state.currentDay), true)
        }

        // Price events (random chance, uses cooldown)
        if (stats.guests >= 10) {
          const priceEvent = Feed.getPriceEvent(Guest.calculatePerceivedValue(state))
          if (priceEvent) {
            addWithCooldown(Feed.createEntry(priceEvent, state.currentDay, { ticketPrice }))
          }
        }

        // Ambient tweets (random chance, uses cooldown)
        if (Feed.shouldGenerateAmbient(stats.guests)) {
          addWithCooldown(Feed.createEntry('ambient', state.currentDay))
        }

        // Update previous stats
        prevRef.current = {
          appeal: stats.appeal,
          guests: stats.guests,
          money: stats.money,
          capacityPercent,
        }
      })
    )

    // Game reset
    unsubs.push(
      GameEvents.on('game:reset', () => {
        prevRef.current = null
      })
    )

    return () => unsubs.forEach((fn) => fn())
  }, [addFeedEntry])
}
