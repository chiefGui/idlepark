import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Smile, Meh, Frown } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Guest } from '../../systems/guest'
import { GuestTypesBar } from '../../systems/guest-types'
import { Format } from '../../utils/format'
import { FinancialContent } from './financial-content'

type AnalyticsTab = 'overview' | 'finances'

export function AnalyticsContent() {
  const [tab, setTab] = useState<AnalyticsTab>('overview')

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 rounded-lg bg-[var(--color-bg)]">
        <button
          onClick={() => setTab('overview')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            tab === 'overview'
              ? 'bg-[var(--color-surface)] text-[var(--color-text)]'
              : 'text-[var(--color-text-muted)]'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setTab('finances')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            tab === 'finances'
              ? 'bg-[var(--color-surface)] text-[var(--color-text)]'
              : 'text-[var(--color-text-muted)]'
          }`}
        >
          Finances
        </button>
      </div>

      {tab === 'overview' ? <OverviewContent /> : <FinancialContent />}
    </div>
  )
}

function OverviewContent() {
  const dailyRecords = useGameStore((s) => s.dailyRecords)
  const rates = useGameStore((s) => s.rates)
  const guestBreakdown = useGameStore((s) => s.guestBreakdown)
  const guestTypeMix = useGameStore((s) => s.guestTypeMix)
  const stats = useGameStore((s) => s.stats)
  const state = useGameStore()

  const totalGuests = guestBreakdown.happy + guestBreakdown.neutral + guestBreakdown.unhappy
  const capacity = Guest.getCapacity(state)

  // Health score (0-100) based on key metrics
  const healthScore = useMemo(() => {
    let score = 50 // Start neutral

    // Money rate impact (-20 to +20)
    if (rates.money > 0) {
      score += Math.min(20, rates.money / 5)
    } else {
      score += Math.max(-20, rates.money / 2)
    }

    // Guest happiness impact (-20 to +20)
    if (totalGuests > 0) {
      const happyRatio = guestBreakdown.happy / totalGuests
      const unhappyRatio = guestBreakdown.unhappy / totalGuests
      score += (happyRatio - unhappyRatio) * 20
    }

    // Cleanliness impact (-10 to +10)
    if (stats.cleanliness < 40) {
      score -= 10
    } else if (stats.cleanliness > 80) {
      score += 10
    }

    return Math.round(Math.max(0, Math.min(100, score)))
  }, [rates.money, guestBreakdown, totalGuests, stats.cleanliness])

  const ratingLabel = healthScore >= 70 ? 'Thriving' : healthScore >= 40 ? 'Stable' : 'Struggling'
  const ratingColor = healthScore >= 70 ? 'var(--color-positive)' : healthScore >= 40 ? 'var(--color-accent)' : 'var(--color-negative)'

  return (
    <div className="space-y-6">
      {/* Park Rating */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[var(--color-text-muted)]">Park Rating</span>
          <span className="text-sm font-medium" style={{ color: ratingColor }}>{ratingLabel}</span>
        </div>
        <div className="flex items-end gap-4">
          <div className="text-4xl font-bold" style={{ color: ratingColor }}>{healthScore}</div>
          <div className="flex-1">
            <div className="h-3 rounded-full bg-[var(--color-bg)] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: ratingColor }}
                initial={{ width: 0 }}
                animate={{ width: `${healthScore}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Profit */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-[var(--color-text-muted)]">Daily Profit</span>
          <TrendIndicator value={rates.money} />
        </div>
        <div className="text-2xl font-bold" style={{
          color: rates.money > 0 ? 'var(--color-positive)' : rates.money < 0 ? 'var(--color-negative)' : 'inherit'
        }}>
          {rates.money >= 0 ? '+' : ''}{Format.money(rates.money)}/day
        </div>
      </div>

      {/* Profit History Chart */}
      {dailyRecords.length >= 2 && (
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-text-muted)] mb-3">Profit History</div>
          <ProfitChart records={dailyRecords.slice(-14)} />
        </div>
      )}

      {/* Guest Breakdown */}
      {totalGuests > 0 && (
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--color-text-muted)]">Guest Mood</span>
            <span className="text-sm text-[var(--color-text-muted)]">{Math.round(totalGuests)} / {capacity}</span>
          </div>
          <GuestMoodBar breakdown={guestBreakdown} total={totalGuests} />
          <div className="flex justify-between mt-3 text-xs">
            <div className="flex items-center gap-1">
              <Smile size={14} className="text-[var(--color-positive)]" />
              <span>{Math.round(guestBreakdown.happy)} happy</span>
            </div>
            <div className="flex items-center gap-1">
              <Meh size={14} className="text-[var(--color-accent)]" />
              <span>{Math.round(guestBreakdown.neutral)} neutral</span>
            </div>
            <div className="flex items-center gap-1">
              <Frown size={14} className="text-[var(--color-negative)]" />
              <span>{Math.round(guestBreakdown.unhappy)} unhappy</span>
            </div>
          </div>
        </div>
      )}

      {/* Guest Types */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="text-sm text-[var(--color-text-muted)] mb-3">Guest Types</div>
        <GuestTypesBar mix={guestTypeMix} />
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Guests Arriving"
          value={`${Format.rate(rates.guests)}/day`}
          trend={rates.guests > 0 ? 'up' : rates.guests < 0 ? 'down' : 'neutral'}
        />
        <StatCard
          label="Appeal"
          value={Format.number(stats.appeal)}
          trend={stats.appeal > 50 ? 'up' : stats.appeal < 20 ? 'down' : 'neutral'}
        />
        <StatCard
          label="Cleanliness"
          value={`${Format.percent(stats.cleanliness)}`}
          trend={stats.cleanliness > 60 ? 'up' : stats.cleanliness < 40 ? 'down' : 'neutral'}
        />
        <StatCard
          label="Fun Level"
          value={Format.number(stats.entertainment)}
          trend={stats.entertainment > totalGuests * 0.5 ? 'up' : 'neutral'}
        />
      </div>

      {/* Insights */}
      <Insights
        dailyRecords={dailyRecords}
        totalGuests={totalGuests}
        capacity={capacity}
        appeal={stats.appeal}
      />
    </div>
  )
}

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return <TrendingUp size={16} className="text-[var(--color-positive)]" />
  }
  if (value < 0) {
    return <TrendingDown size={16} className="text-[var(--color-negative)]" />
  }
  return <Minus size={16} className="text-[var(--color-text-muted)]" />
}

type StatCardProps = {
  label: string
  value: string
  trend: 'up' | 'down' | 'neutral'
}

function StatCard({ label, value, trend }: StatCardProps) {
  const color = trend === 'up' ? 'var(--color-positive)' : trend === 'down' ? 'var(--color-negative)' : 'inherit'

  return (
    <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
      <div className="text-xs text-[var(--color-text-muted)] mb-1">{label}</div>
      <div className="font-semibold" style={{ color }}>{value}</div>
    </div>
  )
}

type ProfitChartProps = {
  records: { day: number; moneyEarned: number }[]
}

function ProfitChart({ records }: ProfitChartProps) {
  if (records.length < 2) return null

  const values = records.map((r) => r.moneyEarned)
  const max = Math.max(...values, 0)
  const min = Math.min(...values, 0)
  const range = max - min || 1

  const width = 100
  const height = 48
  const vPadding = 4 // Vertical only for dot visibility

  // Calculate zero line position
  const zeroY = height - vPadding - ((0 - min) / range) * (height - vPadding * 2)

  // Build path - edge to edge horizontally
  const points = records.map((r, i) => {
    const x = (i / (records.length - 1)) * width
    const y = height - vPadding - ((r.moneyEarned - min) / range) * (height - vPadding * 2)
    return { x, y, value: r.moneyEarned }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // Gradient fill path
  const fillPath = `${linePath} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`

  const lastValue = records[records.length - 1].moneyEarned
  const isPositive = lastValue >= 0

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isPositive ? 'var(--color-positive)' : 'var(--color-negative)'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isPositive ? 'var(--color-positive)' : 'var(--color-negative)'} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Zero line */}
      <line
        x1={0}
        y1={zeroY}
        x2={width}
        y2={zeroY}
        stroke="var(--color-border)"
        strokeWidth="1"
        strokeDasharray="2,2"
      />

      {/* Fill */}
      <path d={fillPath} fill="url(#profitGradient)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={isPositive ? 'var(--color-positive)' : 'var(--color-negative)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* End point */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="3"
        fill={isPositive ? 'var(--color-positive)' : 'var(--color-negative)'}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

type GuestMoodBarProps = {
  breakdown: { happy: number; neutral: number; unhappy: number }
  total: number
}

function GuestMoodBar({ breakdown, total }: GuestMoodBarProps) {
  if (total === 0) return null

  const happyPct = (breakdown.happy / total) * 100
  const neutralPct = (breakdown.neutral / total) * 100
  const unhappyPct = (breakdown.unhappy / total) * 100

  return (
    <div className="h-4 rounded-full overflow-hidden flex bg-[var(--color-bg)]">
      {happyPct > 0 && (
        <motion.div
          className="h-full bg-[var(--color-positive)]"
          initial={{ width: 0 }}
          animate={{ width: `${happyPct}%` }}
          transition={{ duration: 0.3 }}
        />
      )}
      {neutralPct > 0 && (
        <motion.div
          className="h-full bg-[var(--color-accent)]"
          initial={{ width: 0 }}
          animate={{ width: `${neutralPct}%` }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />
      )}
      {unhappyPct > 0 && (
        <motion.div
          className="h-full bg-[var(--color-negative)]"
          initial={{ width: 0 }}
          animate={{ width: `${unhappyPct}%` }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />
      )}
    </div>
  )
}

type InsightsProps = {
  dailyRecords: { day: number; moneyEarned: number; peakGuests: number; peakAppeal: number }[]
  totalGuests: number
  capacity: number
  appeal: number
}

function Insights({ dailyRecords, totalGuests, capacity, appeal }: InsightsProps) {
  const insights: { type: 'up' | 'down' | 'neutral'; text: string }[] = []

  // Need at least 2 days of data for comparisons
  if (dailyRecords.length >= 2) {
    const today = dailyRecords[dailyRecords.length - 1]
    const yesterday = dailyRecords[dailyRecords.length - 2]

    // Profit trend
    const profitChange = today.moneyEarned - yesterday.moneyEarned
    if (profitChange !== 0) {
      const sign = profitChange > 0 ? '+' : ''
      insights.push({
        type: profitChange > 0 ? 'up' : 'down',
        text: `${sign}${Format.money(profitChange)} vs yesterday`
      })
    }

    // Guest trend
    const guestChange = today.peakGuests - yesterday.peakGuests
    if (guestChange !== 0) {
      const sign = guestChange > 0 ? '+' : ''
      insights.push({
        type: guestChange > 0 ? 'up' : 'down',
        text: `${sign}${Math.round(guestChange)} peak guests vs yesterday`
      })
    }

    // 7-day trend if enough data
    if (dailyRecords.length >= 7) {
      const last7 = dailyRecords.slice(-7)
      const avgProfit = last7.reduce((sum, r) => sum + r.moneyEarned, 0) / 7
      insights.push({
        type: avgProfit > 0 ? 'up' : avgProfit < 0 ? 'down' : 'neutral',
        text: `${Format.money(avgProfit)}/day avg (7d)`
      })
    }
  }

  // Capacity utilization
  if (capacity > 0) {
    const utilization = Math.round((totalGuests / capacity) * 100)
    insights.push({
      type: utilization >= 90 ? 'up' : utilization < 50 ? 'down' : 'neutral',
      text: `${utilization}% capacity used (${Math.round(totalGuests)}/${capacity})`
    })
  }

  // Current appeal
  insights.push({
    type: appeal >= 50 ? 'up' : appeal < 30 ? 'down' : 'neutral',
    text: `Appeal: ${Math.round(appeal)}`
  })

  return (
    <div className="space-y-2">
      <div className="text-sm text-[var(--color-text-muted)]">Trends</div>
      {insights.slice(0, 4).map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="p-3 rounded-xl text-sm flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)]"
        >
          {insight.type === 'up' && <TrendingUp size={14} className="text-[var(--color-positive)] flex-shrink-0" />}
          {insight.type === 'down' && <TrendingDown size={14} className="text-[var(--color-negative)] flex-shrink-0" />}
          {insight.type === 'neutral' && <Minus size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />}
          <span>{insight.text}</span>
        </motion.div>
      ))}
    </div>
  )
}
