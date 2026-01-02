import { useMemo } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb, Smile, Meh, Frown } from 'lucide-react'
import type { StatId, GameState } from '../../engine/game-types'
import { Modifiers } from '../../engine/modifiers'
import { useGameStore } from '../../store/game-store'
import { Building } from '../../systems/building'
import { Guest } from '../../systems/guest'
import { Slot } from '../../systems/slot'
import { Format } from '../../utils/format'
import { STAT_CONFIG } from '../../constants/stats'
import { BuildingIcon } from '../../buildings'

type StatDetailProps = {
  statId: StatId
}

function getWarning(statId: StatId, state: GameState): string | null {
  const breakdown = state.guestBreakdown ?? { happy: 0, neutral: 0, unhappy: 0 }

  if (statId === 'money' && state.stats.money < 0) {
    return "You're in debt! 7 days to recover or it's game over."
  }
  if (statId === 'guests') {
    const capacity = Guest.getCapacity(state)
    if (state.stats.guests >= capacity) {
      return "Park is at capacity! No new guests can arrive. Build lodging to increase capacity."
    }
    if (Math.floor(breakdown.unhappy) >= 1) {
      const count = Math.floor(breakdown.unhappy)
      return `${count} unhappy guest${count >= 2 ? 's' : ''} may leave at day's end.`
    }
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
    case 'guests': {
      const capacity = Guest.getCapacity(state)
      const capacityPercent = (state.stats.guests / capacity) * 100
      if (capacityPercent >= 80 && capacityPercent < 100) {
        return 'Approaching capacity! Build lodging soon to accommodate more guests.'
      }
      if (unhappyRatio > 0.3) return 'Too many unhappy guests! Improve fun, food, or comfort.'
      if (state.stats.appeal < 30) return 'Build more attractions to increase appeal and draw visitors.'
      break
    }
    case 'entertainment':
      if (state.stats.entertainment < state.stats.guests * 0.5) {
        const rides = availableBuildings.filter((b) => b.category === 'rides' && Building.canAfford(b, state))
        if (rides[0]) return `Build a ${rides[0].name} for more fun.`
      }
      break
    case 'food':
      if (state.stats.food < state.stats.guests * 0.3) {
        const food = availableBuildings.filter((b) => b.category === 'food' && Building.canAfford(b, state))
        if (food[0]) return `Build a ${food[0].name} to feed hungry guests.`
      }
      break
    case 'cleanliness':
      if (state.stats.cleanliness < 60 && !Slot.getOccupied(state).some((s) => s.buildingId === 'trash_can')) {
        return 'Add a Trash Can to help keep the park clean.'
      }
      break
  }
  return null
}

export function StatDetail({ statId }: StatDetailProps) {
  const stats = useGameStore((s) => s.stats)
  const rates = useGameStore((s) => s.rates)
  const modifiers = useGameStore((s) => s.modifiers)
  const slots = useGameStore((s) => s.slots)
  const ownedPerks = useGameStore((s) => s.ownedPerks)
  const ticketPrice = useGameStore((s) => s.ticketPrice)
  const guestBreakdown = useGameStore((s) => s.guestBreakdown)

  const config = STAT_CONFIG[statId]
  const value = stats[statId]
  const rate = rates[statId]

  // Memoize state object to prevent dependency churn
  const state = useMemo<GameState>(
    () => ({ slots, ownedPerks, stats, ticketPrice, guestBreakdown } as GameState),
    [slots, ownedPerks, stats, ticketPrice, guestBreakdown]
  )

  // Get sources from the unified modifier system
  const sources = useMemo(() => {
    const rawSources = Modifiers.getSourcesForStat(modifiers, statId)

    // For guests stat, add arrival rate manually (since it's managed separately)
    if (statId === 'guests') {
      const arrivalRate = Guest.calculateArrivalRate(state)
      if (arrivalRate > 0) {
        rawSources.unshift({
          label: 'New arrivals',
          emoji: '🚶',
          flat: arrivalRate,
          increased: 0,
          more: 1,
        })
      }
    }

    return rawSources
  }, [modifiers, statId, state])

  const warning = getWarning(statId, state)
  const tip = getTip(statId, state)

  const isGuestStat = statId === 'guests'
  const isAppealStat = statId === 'appeal'
  const appealBreakdown = useMemo(
    () => (isAppealStat ? Guest.getAppealBreakdown(state) : null),
    [isAppealStat, state]
  )

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

      {/* Appeal breakdown - special view */}
      {isAppealStat && appealBreakdown && (
        <div className="p-4 rounded-xl bg-[var(--color-bg)] space-y-3">
          {/* Total appeal */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Total Appeal</span>
            <span className="text-2xl font-bold">{Math.round(appealBreakdown.total)}</span>
          </div>

          {/* Appeal caps warning */}
          {appealBreakdown.caps.length > 0 && (
            <div className="p-2 rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20">
              <div className="flex items-center gap-2 text-xs">
                <AlertCircle size={14} className="text-[var(--color-warning)]" />
                <span>
                  {appealBreakdown.caps[0].reason} caps appeal at {appealBreakdown.caps[0].cap}
                </span>
              </div>
            </div>
          )}

          {/* Component breakdown */}
          <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
            {appealBreakdown.components.map((comp, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-20 text-xs text-[var(--color-text-muted)]">{comp.label}</div>
                <div className="flex-1 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(0, (comp.value / comp.max) * 100)}%`,
                      backgroundColor:
                        comp.value < 0 ? 'var(--color-negative)' : STAT_CONFIG.appeal.color,
                    }}
                  />
                </div>
                <div
                  className="w-12 text-right text-xs font-medium"
                  style={{ color: comp.value >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
                >
                  {comp.value >= 0 ? '+' : ''}
                  {comp.value}
                </div>
              </div>
            ))}
          </div>

          {/* Active modifiers (happenings, marketing, etc.) */}
          {sources.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-[var(--color-border)]">
              <div className="text-xs text-[var(--color-text-muted)] mb-2">Active Effects</div>
              {sources.map((source, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    {source.buildingId ? (
                      <BuildingIcon buildingId={source.buildingId} size={16} />
                    ) : (
                      <span className="text-sm">{source.emoji}</span>
                    )}
                    <span className="text-xs">{source.label}</span>
                  </div>
                  <span className="text-xs font-medium"
                    style={{ color: source.flat > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                    {source.flat > 0 ? '+' : ''}{source.flat}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hero: Value + Rate (or Guest Breakdown for guests, or Appeal breakdown) */}
      {isAppealStat ? null : isGuestStat ? (
        <div className="p-4 rounded-xl bg-[var(--color-bg)] space-y-3">
          {/* Capacity bar */}
          {(() => {
            const capacity = Guest.getCapacity(state)
            const capacityPercent = Math.min(100, (stats.guests / capacity) * 100)
            return (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--color-text-muted)]">Capacity</span>
                  <span className="text-sm font-semibold">
                    {Math.floor(stats.guests)} / {capacity}
                  </span>
                </div>
                <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${capacityPercent}%`,
                      backgroundColor: capacityPercent >= 100
                        ? 'var(--color-negative)'
                        : capacityPercent >= 80
                        ? 'var(--color-warning)'
                        : STAT_CONFIG.guests.color,
                    }}
                  />
                </div>
              </div>
            )
          })()}

          {/* Mood breakdown */}
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
            <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-center gap-1 text-sm"
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

      {/* Supply/demand for consumption stats - show production vs consumption rates */}
      {['entertainment', 'food', 'comfort'].includes(statId) && stats.guests > 0 && (() => {
        const demand = Guest.DEMANDS.find((d) => d.statId === statId)
        const consumptionRate = demand ? stats.guests * demand.perGuest : 0

        // Calculate production rate from sources (positive contributions only)
        const productionRate = sources
          .filter(s => s.flat > 0)
          .reduce((sum, s) => sum + s.flat, 0)

        const ratio = consumptionRate > 0 ? productionRate / consumptionRate : 1
        const statusColor = ratio >= 1 ? 'var(--color-positive)' : ratio >= 0.5 ? 'var(--color-warning)' : 'var(--color-negative)'
        const statusLabel = ratio >= 1 ? 'Sustainable' : ratio >= 0.5 ? 'Depleting' : 'Critical'

        return (
          <div className="p-3 rounded-xl bg-[var(--color-bg)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--color-text-muted)]">Supply vs Demand</span>
              <span className="text-xs font-medium" style={{ color: statusColor }}>{statusLabel}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-[var(--color-border)] rounded-full overflow-hidden relative">
                {/* 100% marker */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--color-text-muted)]/40" />
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, ratio * 50)}%`,
                    backgroundColor: statusColor,
                  }}
                />
              </div>
              <div className="text-xs w-24 text-right">
                <span style={{ color: 'var(--color-positive)' }}>+{Format.number(Math.round(productionRate))}</span>
                <span className="text-[var(--color-text-muted)]"> / </span>
                <span style={{ color: 'var(--color-negative)' }}>-{Format.number(Math.round(consumptionRate))}</span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Sources - skip for Appeal since we show breakdown */}
      {sources.length > 0 && !isAppealStat && (
        <div className="space-y-1">
          {sources.map((source, i) => {
            // Show the primary contribution type
            const hasFlat = source.flat !== 0
            const hasIncreased = source.increased !== 0
            const hasMore = source.more !== 1

            return (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--color-bg)]">
                <div className="flex items-center gap-2">
                  {source.buildingId ? (
                    <BuildingIcon buildingId={source.buildingId} size={20} />
                  ) : (
                    <span className="text-base">{source.emoji}</span>
                  )}
                  <span className="text-sm">{source.label}</span>
                  {source.count && source.count > 1 && (
                    <span className="text-xs text-[var(--color-text-muted)]">×{source.count}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasFlat && (
                    <span className="text-sm font-medium"
                      style={{ color: source.flat > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                      {Format.ratePerDay(source.flat)}
                    </span>
                  )}
                  {hasIncreased && (
                    <span className="text-sm font-medium"
                      style={{ color: source.increased > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                      {source.increased > 0 ? '+' : ''}{source.increased.toFixed(0)}%
                    </span>
                  )}
                  {hasMore && (
                    <span className="text-sm font-medium"
                      style={{ color: source.more > 1 ? 'var(--color-negative)' : 'var(--color-positive)' }}>
                      ×{source.more.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {sources.length === 0 && !isGuestStat && !isAppealStat && (
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
