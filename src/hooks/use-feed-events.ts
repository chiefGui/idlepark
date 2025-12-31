import { useEffect, useRef } from 'react'
import type { FeedEventType } from '../engine/game-types'
import { GameEvents } from '../engine/events'
import { Feed, type TickStats } from '../systems/feed'
import { Guest } from '../systems/guest'
import { useGameStore } from '../store/game-store'

const FEED_COOLDOWN = 5000

// Declarative config for priority events (player actions / important events)
type PriorityEventConfig = {
  event: string
  type: FeedEventType
  contextKey?: string
  condition?: (payload: { count: number }) => boolean
}

const PRIORITY_EVENTS: PriorityEventConfig[] = [
  { event: 'building:built', type: 'building_built', contextKey: 'buildingId' },
  { event: 'building:demolished', type: 'building_demolished', contextKey: 'buildingId' },
  { event: 'milestone:achieved', type: 'milestone_achieved', contextKey: 'milestoneId' },
  { event: 'perk:purchased', type: 'perk_purchased', contextKey: 'perkId' },
  { event: 'happening:started', type: 'happening_started', contextKey: 'happeningId' },
  { event: 'happening:ended', type: 'happening_ended', contextKey: 'happeningId' },
  { event: 'guests:departed', type: 'guest_departed', contextKey: 'guestCount', condition: (p) => p.count > 0 },
]

export function useFeedEvents() {
  const addFeedEntry = useGameStore((s) => s.actions.addFeedEntry)
  const prevRef = useRef<TickStats | null>(null)
  const lastFeedTimeRef = useRef<number>(0)
  const firedThresholdsRef = useRef<Set<string>>(new Set())

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

    // Tick-based events - all handled by Feed.checkTickEvents
    unsubs.push(
      GameEvents.on('tick', () => {
        const state = useGameStore.getState()
        const { stats, ticketPrice, rates } = state

        const capacity = Guest.getCapacity(state)
        const current: TickStats = {
          guests: stats.guests,
          appeal: stats.appeal,
          money: stats.money,
          capacityPercent: capacity > 0 ? (stats.guests / capacity) * 100 : 0,
          perceivedValue: stats.guests >= 10 ? Guest.calculatePerceivedValue(state) : 1,
          moneyRate: rates.money,
          ticketPrice,
        }

        // Initialize on first tick
        if (!prevRef.current) {
          prevRef.current = current
          return
        }

        // Check all events and process them (firedThresholdsRef is mutated by checkTickEvents)
        const events = Feed.checkTickEvents(current, prevRef.current, firedThresholdsRef.current)
        for (const { type, context, priority } of events) {
          addWithCooldown(Feed.createEntry(type, state.currentDay, context), priority)
        }

        prevRef.current = current
      })
    )

    // Game reset
    unsubs.push(
      GameEvents.on('game:reset', () => {
        prevRef.current = null
        firedThresholdsRef.current.clear()
      })
    )

    return () => unsubs.forEach((fn) => fn())
  }, [addFeedEntry])
}
