import { useMemo } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb, Smile, Meh, Frown } from 'lucide-react'
import type { StatId, GameState } from '../../engine/game-types'
import { useGameStore } from '../../store/game-store'
import { Building } from '../../systems/building'
import { Perk } from '../../systems/perk'
import { Guest } from '../../systems/guest'
import { Slot } from '../../systems/slot'
import { Format } from '../../utils/format'
import { STAT_CONFIG } from '../../constants/stats'

type SourceContribution = {
  emoji: string
  name: string
  amount: number
  count?: number
}

type StatDetailProps = {
  statId: StatId
}

function getStatSources(statId: StatId, state: GameState, ticketPrice: number): SourceContribution[] {
  const sources: SourceContribution[] = []
  const buildingContributions = new Map<string, { amount: number; count: number }>()

  for (const slot of Slot.getOccupied(state)) {
    if (!slot.buildingId) continue
    const building = Building.getById(slot.buildingId)
    if (!building) continue

    for (const effect of building.effects) {
      if (effect.statId === statId) {
        const existing = buildingContributions.get(slot.buildingId)
        if (existing) {
          existing.amount += effect.perDay
          existing.count++
        } else {
          buildingContributions.set(slot.buildingId, { amount: effect.perDay, count: 1 })
        }
      }
    }
  }

  for (const [buildingId, data] of buildingContributions) {
    const building = Building.getById(buildingId)
    if (building) {
      sources.push({ emoji: building.emoji, name: building.name, amount: data.amount, count: data.count })
    }
  }

  for (const perkId of state.ownedPerks) {
    const perk = Perk.getById(perkId)
    if (!perk) continue
    for (const effect of perk.effects) {
      if (effect.statId === statId && effect.perDay) {
        sources.push({ emoji: perk.emoji, name: perk.name, amount: effect.perDay })
      }
    }
  }

  if (statId === 'money' && state.stats.guests > 0) {
    const income = Guest.calculateIncomeWithEntertainment(state.stats.guests, ticketPrice, state.stats.entertainment)
    if (income > 0) sources.push({ emoji: '🎟️', name: 'Ticket sales', amount: income })
  }

  if (statId === 'guests') {
    const arrivalRate = Guest.calculateArrivalRate(state)
    if (arrivalRate > 0) sources.push({ emoji: '🚶', name: 'New arrivals', amount: arrivalRate })
  }

  if (['entertainment', 'food', 'comfort'].includes(statId)) {
    const demand = Guest.DEMANDS.find((d) => d.statId === statId)
    if (demand && state.stats.guests > 0) {
      sources.push({ emoji: '👥', name: 'Guest consumption', amount: -state.stats.guests * demand.perGuest })
    }
  }

  if (statId === 'cleanliness' && state.stats.guests > 0) {
    sources.push({ emoji: '👥', name: 'Guest mess', amount: -state.stats.guests * 0.1 })
  }

  return sources.sort((a, b) => {
    if (a.amount >= 0 && b.amount < 0) return -1
    if (a.amount < 0 && b.amount >= 0) return 1
    return b.amount - a.amount
  })
}

function getWarning(statId: StatId, state: GameState): string | null {
  const breakdown = state.guestBreakdown ?? { happy: 0, neutral: 0, unhappy: 0 }

  if (statId === 'money' && state.stats.money < 0) {
    return "You're in debt! 7 days to recover or it's game over."
  }
  if (statId === 'guests' && Math.floor(breakdown.unhappy) >= 1) {
    const count = Math.floor(breakdown.unhappy)
    return `${count} unhappy guest${count >= 2 ? 's' : ''} may leave at day's end.`
  }
  if (statId === 'appeal' && state.stats.appeal < 40) {
    return "Low appeal means guests may become unhappy. Improve their experience!"
  }
  if (statId === 'appeal' && state.stats.appeal < 20 && state.stats.guests < 5) {
    return "Low appeal means fewer visitors. Build more attractions!"
  }
  return null
}

function getTip(statId: StatId, state: GameState): string | null {
  const availableBuildings = Building.getAvailable(state)
  const breakdown = state.guestBreakdown ?? { happy: 0, neutral: 0, unhappy: 0 }
  const unhappyRatio = state.stats.guests > 0 ? breakdown.unhappy / state.stats.guests : 0

  switch (statId) {
    case 'guests':
      if (unhappyRatio > 0.3) return 'Too many unhappy guests! Improve entertainment, food, or comfort.'
      if (state.stats.appeal < 30) return 'Build more attractions to increase appeal and draw visitors.'
      break
    case 'entertainment':
      if (state.stats.entertainment < state.stats.guests * 0.5) {
        const rides = availableBuildings.filter((b) => b.category === 'rides' && Building.canAfford(b, state))
        if (rides[0]) return `Build a ${rides[0].emoji} ${rides[0].name} for more entertainment.`
      }
      break
    case 'food':
      if (state.stats.food < state.stats.guests * 0.3) {
        const food = availableBuildings.filter((b) => b.category === 'food' && Building.canAfford(b, state))
        if (food[0]) return `Build a ${food[0].emoji} ${food[0].name} to feed hungry guests.`
      }
      break
    case 'cleanliness':
      if (state.stats.cleanliness < 60 && !Slot.getOccupied(state).some((s) => s.buildingId === 'trash_can')) {
        return 'Add a 🗑️ Trash Can to help keep the park clean.'
      }
      break
  }
  return null
}

export function StatDetail({ statId }: StatDetailProps) {
  const stats = useGameStore((s) => s.stats)
  const rates = useGameStore((s) => s.rates)
  const slots = useGameStore((s) => s.slots)
  const ownedPerks = useGameStore((s) => s.ownedPerks)
  const ticketPrice = useGameStore((s) => s.ticketPrice)
  const guestBreakdown = useGameStore((s) => s.guestBreakdown)

  const config = STAT_CONFIG[statId]
  const value = stats[statId]
  const rate = rates[statId]
  const state: GameState = { slots, ownedPerks, stats, ticketPrice, guestBreakdown } as GameState

  const sources = useMemo(() => getStatSources(statId, state, ticketPrice), [statId, state, ticketPrice])
  const warning = getWarning(statId, state)
  const tip = getTip(statId, state)

  const isGuestStat = statId === 'guests'

  return (
    <div className="space-y-3">
      {/* Warning - top priority */}
      {warning && (
        <div className="p-3 rounded-xl bg-[var(--color-negative)]/10 border border-[var(--color-negative)]/20">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-[var(--color-negative)] flex-shrink-0" />
            <span className="text-sm">{warning}</span>
          </div>
        </div>
      )}

      {/* Hero: Value + Rate (or Guest Breakdown for guests) */}
      {isGuestStat ? (
        <div className="p-4 rounded-xl bg-[var(--color-bg)]">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-3 rounded-lg bg-[#22c55e]/10">
              <Smile size={20} className="text-[#22c55e] mb-1" />
              <div className="text-xl font-bold">{Math.floor(guestBreakdown.happy)}</div>
              <div className="text-[10px] text-[var(--color-text-muted)]">Happy</div>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-[#fbbf24]/10">
              <Meh size={20} className="text-[#fbbf24] mb-1" />
              <div className="text-xl font-bold">{Math.floor(guestBreakdown.neutral)}</div>
              <div className="text-[10px] text-[var(--color-text-muted)]">Neutral</div>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-[#f87171]/10">
              <Frown size={20} className="text-[#f87171] mb-1" />
              <div className="text-xl font-bold">{Math.floor(guestBreakdown.unhappy)}</div>
              <div className="text-[10px] text-[var(--color-text-muted)]">Unhappy</div>
            </div>
          </div>
          {rate !== 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-center gap-1 text-sm"
              style={{ color: rate > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
              {rate > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Format.ratePerDay(rate)}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[var(--color-bg)] flex items-center justify-between">
          <div className="text-3xl font-bold">{config.format(value)}</div>
          {rate !== 0 && (
            <div className="flex items-center gap-1 text-sm"
              style={{ color: rate > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
              {rate > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Format.ratePerDay(rate)}</span>
            </div>
          )}
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div className="space-y-1">
          {sources.map((source, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--color-bg)]">
              <div className="flex items-center gap-2">
                <span className="text-base">{source.emoji}</span>
                <span className="text-sm">{source.name}</span>
                {source.count && source.count > 1 && (
                  <span className="text-xs text-[var(--color-text-muted)]">×{source.count}</span>
                )}
              </div>
              <span className="text-sm font-medium"
                style={{ color: source.amount > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                {Format.ratePerDay(source.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {sources.length === 0 && !isGuestStat && (
        <div className="p-4 rounded-xl bg-[var(--color-bg)] text-center text-sm text-[var(--color-text-muted)]">
          Nothing affecting this stat yet
        </div>
      )}

      {/* Tip - subtle, only when relevant */}
      {tip && !warning && (
        <div className="flex items-start gap-2 px-1 text-xs text-[var(--color-text-muted)]">
          <Lightbulb size={12} className="mt-0.5 flex-shrink-0 opacity-60" />
          <span>{tip}</span>
        </div>
      )}
    </div>
  )
}
