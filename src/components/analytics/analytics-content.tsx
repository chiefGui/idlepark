import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, Clock } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Effects } from '../../engine/effects'
import { Slot } from '../../systems/slot'
import { Building } from '../../systems/building'

export function AnalyticsContent() {
  const state = useGameStore()
  const rates = useGameStore((s) => s.rates)

  const moneyRate = Effects.getFinalRate('money', rates)
  const guestRate = Effects.getFinalRate('guests', rates)

  const occupiedSlots = Slot.getOccupied(state)
  const unlockedSlots = Slot.getUnlocked(state)

  const buildingCounts = occupiedSlots.reduce((acc, slot) => {
    if (slot.buildingId) {
      acc[slot.buildingId] = (acc[slot.buildingId] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const totalUpkeep = occupiedSlots.reduce((total, slot) => {
    if (slot.buildingId) {
      const building = Building.getById(slot.buildingId)
      if (building) {
        const upkeep = building.effects.find((e) => e.statId === 'money' && e.perDay < 0)
        return total + (upkeep?.perDay ?? 0)
      }
    }
    return total
  }, 0)

  const grossIncome = moneyRate - totalUpkeep

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Financial Overview
        </h3>
        <div className="grid gap-3">
          <AnalyticCard
            icon={DollarSign}
            label="Net Income"
            value={`${moneyRate >= 0 ? '+' : ''}$${moneyRate.toFixed(1)}/day`}
            trend={moneyRate > 0 ? 'up' : moneyRate < 0 ? 'down' : 'neutral'}
          />
          <AnalyticCard
            icon={TrendingUp}
            label="Gross Income"
            value={`+$${grossIncome.toFixed(1)}/day`}
            trend="up"
            color="var(--color-positive)"
          />
          <AnalyticCard
            icon={TrendingDown}
            label="Upkeep Costs"
            value={`$${totalUpkeep.toFixed(1)}/day`}
            trend="down"
            color="var(--color-negative)"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Park Stats
        </h3>
        <div className="grid gap-3">
          <AnalyticCard
            icon={Users}
            label="Guest Growth"
            value={`${guestRate >= 0 ? '+' : ''}${guestRate.toFixed(1)}/day`}
            trend={guestRate > 0 ? 'up' : guestRate < 0 ? 'down' : 'neutral'}
          />
          <AnalyticCard
            icon={Clock}
            label="Days Survived"
            value={`${Math.floor(state.currentDay)} days`}
            trend="neutral"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Buildings ({occupiedSlots.length}/{unlockedSlots.length} slots)
        </h3>
        <div className="space-y-2">
          {Object.entries(buildingCounts).map(([buildingId, count]) => {
            const building = Building.getById(buildingId)
            if (!building) return null

            return (
              <div
                key={buildingId}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{building.emoji}</span>
                  <span className="font-medium">{building.name}</span>
                </div>
                <span className="text-[var(--color-text-muted)]">x{count}</span>
              </div>
            )
          })}
          {occupiedSlots.length === 0 && (
            <div className="text-center py-6 text-[var(--color-text-muted)]">
              No buildings yet
            </div>
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
}

function AnalyticCard({ icon: Icon, label, value, trend, color }: AnalyticCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = color ?? (trend === 'up' ? 'var(--color-positive)' : trend === 'down' ? 'var(--color-negative)' : 'var(--color-text-muted)')

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
        <div className="font-semibold" style={{ color: trendColor }}>{value}</div>
      </div>
      <TrendIcon size={18} style={{ color: trendColor }} />
    </motion.div>
  )
}
