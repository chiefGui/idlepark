import { useEffect, useRef } from 'react'
import type { FeedEventType } from '../engine/game-types'
import { GameEvents } from '../engine/events'
import { Feed, type TickStats } from '../systems/feed'
import { Guest } from '../systems/guest'
import { useGameStore } from '../store/game-store'

// Tiered cooldown system to prevent spam
const PRIORITY_COOLDOWN = 2000 // Minimum spacing even for priority events
const NORMAL_COOLDOWN = 5000 // Standard events
const LOW_PRIORITY_COOLDOWN = 20000 // Ambient, price feedback

// Events that use low-priority (longer) cooldown
const LOW_PRIORITY_EVENTS: FeedEventType[] = [
  'ambient',
  'price_complaint',
  'price_praise',
  'capacity_warning',
]

// Events that bypass cooldown entirely (critical alerts)
const CRITICAL_EVENTS: FeedEventType[] = [
  'financial_warning',
]

// Declarative config for priority events (player actions / important events)
type PriorityEventConfig = {
  event: string
  type: FeedEventType
  contextKey?: string
  condition?: (payload: { count: number }) => boolean
}

// Priority events with minimum spacing to prevent spam
// Happenings excluded - they have their own dedicated toast
const PRIORITY_EVENTS: PriorityEventConfig[] = [
  { event: 'building:built', type: 'building_built', contextKey: 'buildingId' },
  { event: 'building:demolished', type: 'building_demolished', contextKey: 'buildingId' },
  { event: 'milestone:achieved', type: 'milestone_achieved', contextKey: 'milestoneId' },
  { event: 'perk:purchased', type: 'perk_purchased', contextKey: 'perkId' },
  { event: 'guests:departed', type: 'guest_departed', contextKey: 'guestCount', condition: (p) => p.count > 0 },
]

export function useFeedEvents() {
  const addFeedEntry = useGameStore((s) => s.actions.addFeedEntry)
  const prevRef = useRef<TickStats | null>(null)
  // Track cooldowns separately for different tiers
  const lastPriorityTimeRef = useRef<number>(0)
  const lastNormalTimeRef = useRef<number>(0)
  const lastLowPriorityTimeRef = useRef<number>(0)
  const firedThresholdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Tiered cooldown system
    const addWithCooldown = (
      entry: ReturnType<typeof Feed.createEntry>,
      priority = false,
      eventType?: FeedEventType
    ) => {
      const now = Date.now()

      // Critical events bypass all cooldowns
      if (eventType && CRITICAL_EVENTS.includes(eventType)) {
        addFeedEntry(entry)
        return true
      }

      // Priority events (player actions) - still need minimum spacing
      if (priority) {
        if (now - lastPriorityTimeRef.current < PRIORITY_COOLDOWN) return false
        lastPriorityTimeRef.current = now
        addFeedEntry(entry)
        return true
      }

      // Low priority events (ambient, price feedback) - longer cooldown
      if (eventType && LOW_PRIORITY_EVENTS.includes(eventType)) {
        if (now - lastLowPriorityTimeRef.current < LOW_PRIORITY_COOLDOWN) return false
        lastLowPriorityTimeRef.current = now
        addFeedEntry(entry)
        return true
      }

      // Normal events - standard cooldown
      if (now - lastNormalTimeRef.current < NORMAL_COOLDOWN) return false
      lastNormalTimeRef.current = now
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
        addWithCooldown(entry, true, config.type)
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
          addWithCooldown(Feed.createEntry(type, state.currentDay, context), priority, type)
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
