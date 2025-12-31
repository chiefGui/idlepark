import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Users,
  Clock,
  Wallet,
  PiggyBank,
  Trophy,
  Lightbulb,
  Sparkles,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Slot } from '../../systems/slot'
import { Building } from '../../systems/building'
import { Format } from '../../utils/format'

type BuildingStats = {
  buildingId: string
  name: string
  emoji: string
  count: number
  costPerDay: number
  valuePerDay: number
}

export function AnalyticsContent() {
  const state = useGameStore()
  const rates = useGameStore((s) => s.rates)
  const financials = useGameStore((s) => s.financials)
  const dailyRecords = useGameStore((s) => s.dailyRecords)

  const moneyRate = rates.money
  const guestRate = rates.guests

  const occupiedSlots = Slot.getOccupied(state)
  const unlockedSlots = Slot.getUnlocked(state)

  // Calculate building stats
  const buildingStats = useMemo(() => {
    const statsMap = new Map<string, BuildingStats>()

    for (const slot of occupiedSlots) {
      if (!slot.buildingId) continue
      const building = Building.getById(slot.buildingId)
      if (!building) continue

      const existing = statsMap.get(slot.buildingId)
      const cost = Building.getUpkeep(building)
      const value = Building.getValue(building)

      if (existing) {
        existing.count++
        existing.costPerDay += cost
        existing.valuePerDay += value
      } else {
        statsMap.set(slot.buildingId, {
          buildingId: slot.buildingId,
          name: building.name,
          emoji: building.emoji,
          count: 1,
          costPerDay: cost,
          valuePerDay: value,
        })
      }
    }

    // Sort by value-to-cost ratio (best first)
    return Array.from(statsMap.values()).sort((a, b) => {
      const ratioA = a.costPerDay > 0 ? a.valuePerDay / a.costPerDay : a.valuePerDay
      const ratioB = b.costPerDay > 0 ? b.valuePerDay / b.costPerDay : b.valuePerDay
      return ratioB - ratioA
    })
  }, [occupiedSlots])

  const topBuilding = buildingStats[0]
  const weakBuilding = buildingStats.length > 1 ? buildingStats[buildingStats.length - 1] : null

  // Find best/worst days
  const bestDay = useMemo(() => {
    if (dailyRecords.length === 0) return null
    return dailyRecords.reduce((best, record) =>
      record.moneyEarned > best.moneyEarned ? record : best
    )
  }, [dailyRecords])

  const worstDay = useMemo(() => {
    if (dailyRecords.length === 0) return null
    return dailyRecords.reduce((worst, record) =>
      record.moneyEarned < worst.moneyEarned ? record : worst
    )
  }, [dailyRecords])

  // Total daily costs
  const dailyCosts = occupiedSlots.reduce((total, slot) => {
    if (slot.buildingId) {
      const building = Building.getById(slot.buildingId)
      if (building) {
        const cost = building.effects.find((e) => e.statId === 'money' && e.perDay < 0)
        return total + Math.abs(cost?.perDay ?? 0)
      }
    }
    return total
  }, 0)

  // Tips based on game state
  const tips = useMemo(() => {
    const items: { type: 'warning' | 'success' | 'tip'; message: string }[] = []

    if (moneyRate < 0) {
      items.push({
        type: 'warning',
        message: `You're losing $${Math.abs(moneyRate).toFixed(0)} each day. Try building more rides or removing costly buildings.`,
      })
    }

    if (state.stats.entertainment < state.stats.guests * 0.5 && state.stats.guests > 0) {
      items.push({
        type: 'tip',
        message: 'Your guests want more fun! Add some rides to keep them happy.',
      })
    }

    if (state.stats.cleanliness < 40) {
      items.push({
        type: 'warning',
        message: 'Your park is getting dirty. Add trash cans to clean things up!',
      })
    }

    if (weakBuilding && weakBuilding.costPerDay > 0) {
      const ratio = weakBuilding.valuePerDay / weakBuilding.costPerDay
      if (ratio < 2) {
        items.push({
          type: 'tip',
          message: `${weakBuilding.emoji} ${weakBuilding.name} costs a lot for what it gives. Maybe swap it for something better?`,
        })
      }
    }

    if (moneyRate > 50) {
      items.push({
        type: 'success',
        message: "You're making great money! Time to expand your park.",
      })
    }

    const profit = financials.totalEarned - financials.totalUpkeepPaid
    if (financials.totalInvested > 0 && profit > financials.totalInvested) {
      items.push({
        type: 'success',
        message: "You've already made back more than you spent. Nice work!",
      })
    }

    return items
  }, [moneyRate, state.stats, weakBuilding, financials])

  return (
    <div className="space-y-6">
      {/* Money */}
      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Money
        </h3>
        <div className="grid gap-3">
          <AnalyticCard
            icon={DollarSign}
            label="Daily Profit"
            value={`${moneyRate >= 0 ? '+' : ''}${Format.money(moneyRate)}/day`}
            trend={moneyRate > 0 ? 'up' : moneyRate < 0 ? 'down' : 'neutral'}
          />
          <div className="grid grid-cols-2 gap-3">
            <AnalyticCard
              icon={PiggyBank}
              label="Spent"
              value={Format.money(financials.totalInvested)}
              trend="neutral"
              compact
            />
            <AnalyticCard
              icon={Wallet}
              label="Earned"
              value={Format.money(financials.totalEarned)}
              trend="up"
              color="var(--color-positive)"
              compact
            />
          </div>
        </div>
      </div>

      {/* Your Best */}
      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Your Best
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <AnalyticCard
            icon={Trophy}
            label="Most Money"
            value={Format.money(financials.peakMoney)}
            trend="up"
            color="#fbbf24"
            compact
          />
          <AnalyticCard
            icon={Users}
            label="Most Guests"
            value={financials.peakGuests.toString()}
            trend="up"
            color="#6366f1"
            compact
          />
          {bestDay && (
            <AnalyticCard
              icon={TrendingUp}
              label={`Best Day (${bestDay.day})`}
              value={`${bestDay.moneyEarned >= 0 ? '+' : ''}${Format.money(bestDay.moneyEarned)}`}
              trend="up"
              color="var(--color-positive)"
              compact
            />
          )}
          {worstDay && (
            <AnalyticCard
              icon={TrendingDown}
              label={`Worst Day (${worstDay.day})`}
              value={`${worstDay.moneyEarned >= 0 ? '+' : ''}${Format.money(worstDay.moneyEarned)}`}
              trend="down"
              color="var(--color-negative)"
              compact
            />
          )}
        </div>
      </div>

      {/* Right Now */}
      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Right Now
        </h3>
        <div className="grid gap-3">
          <AnalyticCard
            icon={Users}
            label="New Guests"
            value={`${guestRate >= 0 ? '+' : ''}${guestRate.toFixed(1)}/day`}
            trend={guestRate > 0 ? 'up' : guestRate < 0 ? 'down' : 'neutral'}
          />
          <div className="grid grid-cols-2 gap-3">
            <AnalyticCard
              icon={Clock}
              label="Day"
              value={`${Math.floor(state.currentDay)}`}
              trend="neutral"
              compact
            />
            <AnalyticCard
              icon={TrendingDown}
              label="Daily Costs"
              value={`${Format.money(dailyCosts)}/day`}
              trend="down"
              color="var(--color-negative)"
              compact
            />
          </div>
        </div>
      </div>

      {/* Your Buildings */}
      {buildingStats.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Your Buildings
          </h3>
          <div className="space-y-2">
            {topBuilding && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/20">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[var(--color-positive)]" />
                  <span className="text-xl">{topBuilding.emoji}</span>
                  <div>
                    <div className="font-medium">{topBuilding.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Top performer</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-muted)]">x{topBuilding.count}</div>
                </div>
              </div>
            )}
            {weakBuilding && weakBuilding !== topBuilding && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{weakBuilding.emoji}</span>
                  <div>
                    <div className="font-medium">{weakBuilding.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Could be better</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--color-text-muted)]">x{weakBuilding.count}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Tips
          </h3>
          <div className="space-y-2">
            {tips.map((tip, i) => {
              const Icon =
                tip.type === 'warning'
                  ? AlertCircle
                  : tip.type === 'success'
                    ? ThumbsUp
                    : Lightbulb
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-3 rounded-xl border ${
                    tip.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : tip.type === 'success'
                        ? 'bg-[var(--color-positive)]/10 border-[var(--color-positive)]/20'
                        : 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon
                      size={16}
                      className={`mt-0.5 ${
                        tip.type === 'warning'
                          ? 'text-amber-500'
                          : tip.type === 'success'
                            ? 'text-[var(--color-positive)]'
                            : 'text-[var(--color-accent)]'
                      }`}
                    />
                    <span className="text-sm">{tip.message}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* All Buildings */}
      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          All Buildings ({occupiedSlots.length}/{unlockedSlots.length})
        </h3>
        <div className="space-y-2">
          {buildingStats.map((b) => (
            <div
              key={b.buildingId}
              className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{b.emoji}</span>
                <span className="font-medium">{b.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-negative)]">
                  -{Format.money(b.costPerDay)}/day
                </span>
                <span className="text-[var(--color-text-muted)]">x{b.count}</span>
              </div>
            </div>
          ))}
          {occupiedSlots.length === 0 && (
            <div className="text-center py-6 text-[var(--color-text-muted)]">No buildings yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

type AnalyticCardProps = {
  icon: typeof DollarSign
  label: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  color?: string
  compact?: boolean
}

function AnalyticCard({ icon: Icon, label, value, trend, color, compact }: AnalyticCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor =
    color ??
    (trend === 'up'
      ? 'var(--color-positive)'
      : trend === 'down'
        ? 'var(--color-negative)'
        : 'var(--color-text-muted)')

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${trendColor}20` }}
        >
          <Icon size={16} style={{ color: trendColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-[var(--color-text-muted)] truncate">{label}</div>
          <div className="font-semibold text-sm" style={{ color: trendColor }}>
            {value}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${trendColor}20` }}
      >
        <Icon size={20} style={{ color: trendColor }} />
      </div>
      <div className="flex-1">
        <div className="text-sm text-[var(--color-text-muted)]">{label}</div>
        <div className="font-semibold" style={{ color: trendColor }}>
          {value}
        </div>
      </div>
      <TrendIcon size={18} style={{ color: trendColor }} />
    </motion.div>
  )
}
