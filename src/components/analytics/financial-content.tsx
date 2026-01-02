import { useGameStore } from '../../store/game-store'
import { Format } from '../../utils/format'
import { Bank } from '../../systems/bank'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Receipt, Landmark, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

export function FinancialContent() {
  const stats = useGameStore((s) => s.stats)
  const financials = useGameStore((s) => s.financials)
  const bankLoan = useGameStore((s) => s.bankLoan)
  const rates = useGameStore((s) => s.rates)

  // Calculate net worth (current money + value of investments - outstanding debt)
  const outstandingDebt = bankLoan?.remainingAmount ?? 0
  const netWorth = stats.money - outstandingDebt

  // Interest paid = total repaid - principal borrowed (capped at what's been repaid)
  const interestPaid = Math.max(0, financials.totalLoanRepaid -
    Math.min(financials.totalBorrowed, financials.totalLoanRepaid))

  // Total costs = invested + upkeep + loan repayments
  const totalCosts = financials.totalInvested + financials.totalUpkeepPaid + financials.totalLoanRepaid

  // Net profit = earned + borrowed - costs
  const netProfit = financials.totalEarned + financials.totalBorrowed - totalCosts

  return (
    <div className="space-y-4">
      {/* Current Balance */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-2">
          <Wallet size={16} className="text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Current Balance</span>
        </div>
        <div className="text-3xl font-bold">{Format.money(stats.money)}</div>
        <div className="text-sm text-[var(--color-text-muted)] mt-1">
          {rates.money >= 0 ? '+' : ''}{Format.money(rates.money)}/day
        </div>
      </div>

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
                {Format.money(bankLoan.remainingAmount)} owed
              </div>
              <div className="text-sm text-amber-200/70">
                {Format.money(bankLoan.dailyPayment)}/day repayment
              </div>
            </div>
            <div className="text-right text-sm text-amber-200/70">
              {Bank.getLoanDaysRemaining({ bankLoan })} days left
            </div>
          </div>
        </div>
      )}

      {/* Income Section */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-[var(--color-text-muted)] px-1">Income</div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <FinancialRow
            icon={<TrendingUp size={14} className="text-[var(--color-positive)]" />}
            label="Guest Revenue"
            value={Format.money(financials.totalEarned)}
            positive
          />
          {financials.totalBorrowed > 0 && (
            <FinancialRow
              icon={<Landmark size={14} className="text-amber-400" />}
              label="Loans Received"
              value={Format.money(financials.totalBorrowed)}
              positive
            />
          )}
        </div>
      </div>

      {/* Expenses Section */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-[var(--color-text-muted)] px-1">Expenses</div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <FinancialRow
            icon={<PiggyBank size={14} className="text-blue-400" />}
            label="Buildings & Perks"
            value={Format.money(financials.totalInvested)}
          />
          <FinancialRow
            icon={<Receipt size={14} className="text-orange-400" />}
            label="Upkeep Costs"
            value={Format.money(financials.totalUpkeepPaid)}
          />
          {financials.totalLoanRepaid > 0 && (
            <FinancialRow
              icon={<TrendingDown size={14} className="text-amber-400" />}
              label="Loan Repayments"
              value={Format.money(financials.totalLoanRepaid)}
              subtext={interestPaid > 0 ? `(${Format.money(interestPaid)} interest)` : undefined}
            />
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-[var(--color-text-muted)] px-1">Summary</div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <FinancialRow
            icon={netProfit >= 0
              ? <ArrowUpCircle size={14} className="text-[var(--color-positive)]" />
              : <ArrowDownCircle size={14} className="text-[var(--color-negative)]" />
            }
            label="Net Profit"
            value={(netProfit >= 0 ? '+' : '') + Format.money(netProfit)}
            positive={netProfit >= 0}
            negative={netProfit < 0}
            bold
          />
          <FinancialRow
            icon={<Wallet size={14} className="text-[var(--color-accent)]" />}
            label="Net Worth"
            value={Format.money(netWorth)}
            subtext={outstandingDebt > 0 ? `(${Format.money(outstandingDebt)} debt)` : undefined}
            positive={netWorth >= 0}
            negative={netWorth < 0}
            bold
          />
        </div>
      </div>

      {/* Records */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-[var(--color-text-muted)] px-1">Records</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="text-xs text-[var(--color-text-muted)]">Peak Balance</div>
            <div className="font-semibold text-[var(--color-positive)]">
              {Format.money(financials.peakMoney)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="text-xs text-[var(--color-text-muted)]">Peak Guests</div>
            <div className="font-semibold">
              {Math.round(financials.peakGuests)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type FinancialRowProps = {
  icon: React.ReactNode
  label: string
  value: string
  subtext?: string
  positive?: boolean
  negative?: boolean
  bold?: boolean
}

function FinancialRow({ icon, label, value, subtext, positive, negative, bold }: FinancialRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-right">
        <span className={`text-sm ${bold ? 'font-semibold' : ''} ${
          positive ? 'text-[var(--color-positive)]' :
          negative ? 'text-[var(--color-negative)]' : ''
        }`}>
          {value}
        </span>
        {subtext && (
          <div className="text-xs text-[var(--color-text-muted)]">{subtext}</div>
        )}
      </div>
    </div>
  )
}
