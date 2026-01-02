import { useGameStore } from '../../store/game-store'
import { Format } from '../../utils/format'
import { Bank } from '../../systems/bank'
import { Guest } from '../../systems/guest'
import { Building } from '../../systems/building'
import { Slot } from '../../systems/slot'
import { Landmark, TrendingUp, TrendingDown, Clock } from 'lucide-react'

export function FinancialContent() {
  const state = useGameStore()
  const stats = state.stats
  const bankLoan = state.bankLoan
  const rates = state.rates

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
    </div>
  )
}
