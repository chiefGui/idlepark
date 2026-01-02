import { useGameStore } from '../../store/game-store'
import { Format } from '../../utils/format'
import { Bank } from '../../systems/bank'
import { Guest } from '../../systems/guest'
import { Building } from '../../systems/building'
import { Slot } from '../../systems/slot'
import { Landmark, TrendingUp, TrendingDown, Clock, Wallet, PiggyBank } from 'lucide-react'

export function FinancialContent() {
  const state = useGameStore()
  const stats = state.stats
  const bankLoan = state.bankLoan
  const rates = state.rates
  const dailyRecords = state.dailyRecords

  // Calculate daily income breakdown
  const totalGuests = state.guestBreakdown.happy + state.guestBreakdown.neutral + state.guestBreakdown.unhappy
  const ticketIncome = Guest.calculateIncomeWithEntertainment(
    totalGuests,
    state.ticketPrice,
    stats.entertainment
  )

  // Calculate upkeep
  const occupiedSlots = Slot.getOccupied(state)
  const dailyUpkeep = occupiedSlots.reduce((sum, slot) => {
    const building = Building.getById(slot.buildingId!)
    return sum + (building?.costs.find(c => c.statId === 'money')?.amount ?? 0) * 0.02
  }, 0)

  // Loan repayment
  const dailyLoanPayment = bankLoan?.dailyPayment ?? 0

  // Daily totals
  const dailyIncome = ticketIncome
  const dailyExpenses = dailyUpkeep + dailyLoanPayment
  const dailyNet = dailyIncome - dailyExpenses

  // Runway calculation (days until broke if losing money)
  const runway = dailyNet < 0 ? Math.floor(stats.money / Math.abs(dailyNet)) : null

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="text-sm text-[var(--color-text-muted)] mb-1">Balance</div>
        <div className="text-3xl font-bold">{Format.money(stats.money)}</div>
        <div className={`text-sm mt-1 flex items-center gap-1 ${
          rates.money >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
        }`}>
          {rates.money >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {rates.money >= 0 ? '+' : ''}{Format.money(rates.money)}/day
        </div>
      </div>

      {/* Runway Warning */}
      {runway !== null && runway < 30 && (
        <div className="p-3 rounded-xl bg-[var(--color-negative)]/10 border border-[var(--color-negative)]/30">
          <div className="flex items-center gap-2 text-[var(--color-negative)]">
            <Clock size={16} />
            <span className="text-sm font-medium">
              {runway <= 0 ? 'Out of money!' : `${runway} days until broke`}
            </span>
          </div>
        </div>
      )}

      {/* Active Loan */}
      {bankLoan && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Landmark size={16} className="text-amber-400" />
            <span className="text-sm text-amber-200">Active Loan</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xl font-bold text-amber-100">
                {Format.money(bankLoan.remainingAmount)}
              </div>
              <div className="text-sm text-amber-200/70">
                {Format.money(dailyLoanPayment)}/day
              </div>
            </div>
            <div className="text-sm text-amber-200/70">
              {Bank.getLoanDaysRemaining(state)} days left
            </div>
          </div>
        </div>
      )}

      {/* Daily Breakdown */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
        <div className="text-sm text-[var(--color-text-muted)]">Daily Breakdown</div>

        {/* Income */}
        <div className="flex justify-between items-center">
          <span className="text-sm">Ticket Sales</span>
          <span className="text-sm text-[var(--color-positive)]">+{Format.money(ticketIncome)}</span>
        </div>

        {/* Expenses */}
        {dailyUpkeep > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm">Upkeep</span>
            <span className="text-sm text-[var(--color-negative)]">-{Format.money(dailyUpkeep)}</span>
          </div>
        )}

        {dailyLoanPayment > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm">Loan Payment</span>
            <span className="text-sm text-[var(--color-negative)]">-{Format.money(dailyLoanPayment)}</span>
          </div>
        )}

        {/* Net */}
        <div className="pt-2 border-t border-[var(--color-border)] flex justify-between items-center">
          <span className="text-sm font-medium">Net</span>
          <span className={`text-sm font-bold ${
            dailyNet >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
          }`}>
            {dailyNet >= 0 ? '+' : ''}{Format.money(dailyNet)}/day
          </span>
        </div>
      </div>

      {/* Profit History Chart */}
      {dailyRecords.length >= 2 && (
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-text-muted)] mb-3">Profit History (14 days)</div>
          <ProfitChart records={dailyRecords.slice(-14)} />
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={14} className="text-[var(--color-text-muted)]" />
            <span className="text-xs text-[var(--color-text-muted)]">Ticket Price</span>
          </div>
          <div className="font-semibold">{Format.money(state.ticketPrice)}</div>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-1">
            <PiggyBank size={14} className="text-[var(--color-text-muted)]" />
            <span className="text-xs text-[var(--color-text-muted)]">Per Guest</span>
          </div>
          <div className="font-semibold">{Format.money(totalGuests > 0 ? ticketIncome / totalGuests : 0)}</div>
        </div>
      </div>
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
  const vPadding = 4

  const zeroY = height - vPadding - ((0 - min) / range) * (height - vPadding * 2)

  const points = records.map((r, i) => {
    const x = (i / (records.length - 1)) * width
    const y = height - vPadding - ((r.moneyEarned - min) / range) * (height - vPadding * 2)
    return { x, y, value: r.moneyEarned }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const fillPath = `${linePath} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`

  const lastValue = records[records.length - 1].moneyEarned
  const isPositive = lastValue >= 0

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id="profitGradientFinances" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isPositive ? 'var(--color-positive)' : 'var(--color-negative)'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isPositive ? 'var(--color-positive)' : 'var(--color-negative)'} stopOpacity="0" />
        </linearGradient>
      </defs>

      <line
        x1={0}
        y1={zeroY}
        x2={width}
        y2={zeroY}
        stroke="var(--color-border)"
        strokeWidth="1"
        strokeDasharray="2,2"
      />

      <path d={fillPath} fill="url(#profitGradientFinances)" />

      <path
        d={linePath}
        fill="none"
        stroke={isPositive ? 'var(--color-positive)' : 'var(--color-negative)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

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
