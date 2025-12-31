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
  AlertTriangle,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Slot } from '../../systems/slot'
import { Building } from '../../systems/building'
import { Format } from '../../utils/format'

type BuildingPerformance = {
  buildingId: string
  name: string
  emoji: string
  count: number
  totalUpkeep: number
  totalEntertainment: number
  totalFood: number
  totalComfort: number
  efficiency: number // value generated per $ upkeep
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

  // Calculate building performance metrics
  const buildingPerformance = useMemo(() => {
    const perfMap = new Map<string, BuildingPerformance>()

    for (const slot of occupiedSlots) {
      if (!slot.buildingId) continue
      const building = Building.getById(slot.buildingId)
      if (!building) continue

      const existing = perfMap.get(slot.buildingId)
      const upkeep = Math.abs(
        building.effects.find((e) => e.statId === 'money' && e.perDay < 0)?.perDay ?? 0
      )
      const entertainment =
        building.effects.find((e) => e.statId === 'entertainment')?.perDay ?? 0
      const food = building.effects.find((e) => e.statId === 'food')?.perDay ?? 0
      const comfort = building.effects.find((e) => e.statId === 'comfort')?.perDay ?? 0

      if (existing) {
        existing.count++
        existing.totalUpkeep += upkeep
        existing.totalEntertainment += entertainment
        existing.totalFood += food
        existing.totalComfort += comfort
      } else {
        perfMap.set(slot.buildingId, {
          buildingId: slot.buildingId,
          name: building.name,
          emoji: building.emoji,
          count: 1,
          totalUpkeep: upkeep,
          totalEntertainment: entertainment,
          totalFood: food,
          totalComfort: comfort,
          efficiency: 0,
        })
      }
    }

    // Calculate efficiency (value per $ spent)
    for (const perf of perfMap.values()) {
      const totalValue = perf.totalEntertainment + perf.totalFood + perf.totalComfort
      perf.efficiency = perf.totalUpkeep > 0 ? totalValue / perf.totalUpkeep : totalValue
    }

    return Array.from(perfMap.values()).sort((a, b) => b.efficiency - a.efficiency)
  }, [occupiedSlots])

  const bestPerformer = buildingPerformance[0]
  const worstPerformer = buildingPerformance[buildingPerformance.length - 1]

  // Calculate best/worst days from records
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

  // Calculate total upkeep
  const totalUpkeep = occupiedSlots.reduce((total, slot) => {
    if (slot.buildingId) {
      const building = Building.getById(slot.buildingId)
      if (building) {
        const upkeep = building.effects.find((e) => e.statId === 'money' && e.perDay < 0)
        return total + Math.abs(upkeep?.perDay ?? 0)
      }
    }
    return total
  }, 0)

  // Calculate ROI
  const netProfit = financials.totalEarned - financials.totalUpkeepPaid
  const roi =
    financials.totalInvested > 0
      ? ((netProfit / financials.totalInvested) * 100).toFixed(1)
      : '0'

  // Insights
  const insights = useMemo(() => {
    const items: { type: 'warning' | 'success' | 'info'; message: string }[] = []

    if (moneyRate < 0) {
      items.push({
        type: 'warning',
        message: `Losing $${Math.abs(moneyRate).toFixed(1)}/day. Build more revenue-generating attractions or reduce costs.`,
      })
    }

    if (state.stats.entertainment < state.stats.guests * 0.5 && state.stats.guests > 0) {
      items.push({
        type: 'warning',
        message: 'Not enough entertainment for your guests. Build more rides!',
      })
    }

    if (state.stats.cleanliness < 40) {
      items.push({
        type: 'warning',
        message: 'Park cleanliness is low. Add trash cans or get the Cleaning Crew perk.',
      })
    }

    if (worstPerformer && worstPerformer.efficiency < 2 && worstPerformer.totalUpkeep > 0) {
      items.push({
        type: 'info',
        message: `${worstPerformer.emoji} ${worstPerformer.name} has low efficiency. Consider replacing it.`,
      })
    }

    if (moneyRate > 50) {
      items.push({
        type: 'success',
        message: 'Excellent income! Consider expanding your park.',
      })
    }

    if (parseFloat(roi) > 100) {
      items.push({
        type: 'success',
        message: `Great ROI of ${roi}%! Your investments are paying off.`,
      })
    }

    return items
  }, [moneyRate, state.stats, worstPerformer, roi])

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Financial Overview
        </h3>
        <div className="grid gap-3">
          <AnalyticCard
            icon={DollarSign}
            label="Net Income"
            value={`${moneyRate >= 0 ? '+' : ''}${Format.money(moneyRate)}/day`}
            trend={moneyRate > 0 ? 'up' : moneyRate < 0 ? 'down' : 'neutral'}
          />
          <div className="grid grid-cols-2 gap-3">
            <AnalyticCard
              icon={PiggyBank}
              label="Total Invested"
              value={Format.money(financials.totalInvested)}
              trend="neutral"
              compact
            />
            <AnalyticCard
              icon={Wallet}
              label="Total Earned"
              value={Format.money(financials.totalEarned)}
              trend="up"
              color="var(--color-positive)"
              compact
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AnalyticCard
              icon={TrendingDown}
              label="Upkeep Paid"
              value={Format.money(financials.totalUpkeepPaid)}
              trend="down"
              color="var(--color-negative)"
              compact
            />
            <AnalyticCard
              icon={BarChart3}
              label="ROI"
              value={`${roi}%`}
              trend={parseFloat(roi) > 0 ? 'up' : parseFloat(roi) < 0 ? 'down' : 'neutral'}
              compact
            />
          </div>
        </div>
      </div>

      {/* Peak Stats */}
      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Records
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <AnalyticCard
            icon={Trophy}
            label="Peak Money"
            value={Format.money(financials.peakMoney)}
            trend="up"
            color="#fbbf24"
            compact
          />
          <AnalyticCard
            icon={Users}
            label="Peak Guests"
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

      {/* Park Stats */}
      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Current Stats
        </h3>
        <div className="grid gap-3">
          <AnalyticCard
            icon={Users}
            label="Guest Growth"
            value={`${guestRate >= 0 ? '+' : ''}${guestRate.toFixed(1)}/day`}
            trend={guestRate > 0 ? 'up' : guestRate < 0 ? 'down' : 'neutral'}
          />
          <div className="grid grid-cols-2 gap-3">
            <AnalyticCard
              icon={Clock}
              label="Days Survived"
              value={`${Math.floor(state.currentDay)} days`}
              trend="neutral"
              compact
            />
            <AnalyticCard
              icon={TrendingDown}
              label="Daily Upkeep"
              value={`${Format.money(totalUpkeep)}/day`}
              trend="down"
              color="var(--color-negative)"
              compact
            />
          </div>
        </div>
      </div>

      {/* Building Performance */}
      {buildingPerformance.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Building Performance
          </h3>
          <div className="space-y-2">
            {bestPerformer && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/20">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[var(--color-positive)]" />
                  <span className="text-xl">{bestPerformer.emoji}</span>
                  <div>
                    <div className="font-medium">{bestPerformer.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Best Performer</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[var(--color-positive)]">
                    {bestPerformer.efficiency.toFixed(1)} eff
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">x{bestPerformer.count}</div>
                </div>
              </div>
            )}
            {worstPerformer && worstPerformer !== bestPerformer && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{worstPerformer.emoji}</span>
                  <div>
                    <div className="font-medium">{worstPerformer.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Lowest Efficiency</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[var(--color-text-muted)]">
                    {worstPerformer.efficiency.toFixed(1)} eff
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">x{worstPerformer.count}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Insights
          </h3>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-xl border ${
                  insight.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : insight.type === 'success'
                      ? 'bg-[var(--color-positive)]/10 border-[var(--color-positive)]/20'
                      : 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={16}
                    className={
                      insight.type === 'warning'
                        ? 'text-amber-500 mt-0.5'
                        : insight.type === 'success'
                          ? 'text-[var(--color-positive)] mt-0.5'
                          : 'text-[var(--color-accent)] mt-0.5'
                    }
                  />
                  <span className="text-sm">{insight.message}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Buildings List */}
      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Buildings ({occupiedSlots.length}/{unlockedSlots.length} slots)
        </h3>
        <div className="space-y-2">
          {buildingPerformance.map((perf) => (
            <div
              key={perf.buildingId}
              className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{perf.emoji}</span>
                <span className="font-medium">{perf.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-negative)]">
                  -{Format.money(perf.totalUpkeep)}/day
                </span>
                <span className="text-[var(--color-text-muted)]">x{perf.count}</span>
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
