import { useMemo, useState } from 'react'
import { useGameStore } from '../../store/game-store'
import { Format } from '../../utils/format'
import { Bank } from '../../systems/bank'
import { Guest } from '../../systems/guest'
import { Building } from '../../systems/building'
import { Slot } from '../../systems/slot'
import { Landmark, TrendingUp, TrendingDown, Clock, ChevronDown, ChevronUp } from 'lucide-react'

type BuildingFinancial = {
  id: string
  name: string
  emoji: string
  upkeep: number
  income: number
  count: number
}

export function FinancialContent() {
  const state = useGameStore()
  const stats = state.stats
  const bankLoan = state.bankLoan
  const rates = state.rates
  const [showDetails, setShowDetails] = useState(false)

  // Calculate daily income breakdown
  const totalGuests = state.guestBreakdown.happy + state.guestBreakdown.neutral + state.guestBreakdown.unhappy
  const ticketIncome = Guest.calculateIncomeWithEntertainment(
    totalGuests,
    state.ticketPrice,
    stats.entertainment
  )

  // Calculate per-building financials
  const buildingFinancials = useMemo(() => {
    const occupiedSlots = Slot.getOccupied(state)
    const byBuilding = new Map<string, BuildingFinancial>()

    for (const slot of occupiedSlots) {
      const building = Building.getById(slot.buildingId!)
      if (!building) continue

      const existing = byBuilding.get(building.id)
      const buildCost = building.costs.find(c => c.statId === 'money')?.amount ?? 0
      const upkeep = buildCost * 0.02

      // Check if it's a shop (generates income based on guests with cap)
      let shopIncome = 0
      if (Building.isShop(building)) {
        const effectiveGuests = Math.min(totalGuests, building.guestCap)
        shopIncome = effectiveGuests * building.incomePerGuest
      }

      if (existing) {
        existing.upkeep += upkeep
        existing.income += shopIncome
        existing.count++
      } else {
        byBuilding.set(building.id, {
          id: building.id,
          name: building.name,
          emoji: building.emoji,
          upkeep,
          income: shopIncome,
          count: 1,
        })
      }
    }

    // Sort by net impact (highest cost first)
    return Array.from(byBuilding.values())
      .sort((a, b) => (b.upkeep - b.income) - (a.upkeep - a.income))
  }, [state, totalGuests])

  // Calculate totals
  const totalUpkeep = buildingFinancials.reduce((sum, b) => sum + b.upkeep, 0)
  const totalShopIncome = buildingFinancials.reduce((sum, b) => sum + b.income, 0)
  const dailyLoanPayment = bankLoan?.dailyPayment ?? 0

  const dailyIncome = ticketIncome + totalShopIncome
  const dailyExpenses = totalUpkeep + dailyLoanPayment
  const dailyNet = dailyIncome - dailyExpenses

  // Runway calculation (days until broke if losing money)
  const runway = dailyNet < 0 ? Math.floor(stats.money / Math.abs(dailyNet)) : null

  // Buildings with significant costs (for breakdown)
  const costlyBuildings = buildingFinancials.filter(b => b.upkeep > 0)
  const profitBuildings = buildingFinancials.filter(b => b.income > 0)

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
        <div className="text-sm text-[var(--color-text-muted)]">Daily Summary</div>

        {/* Income */}
        <div className="flex justify-between items-center">
          <span className="text-sm">Tickets ({Math.floor(totalGuests)} guests)</span>
          <span className="text-sm text-[var(--color-positive)]">+{Format.money(ticketIncome)}</span>
        </div>

        {totalShopIncome > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm">Shops</span>
            <span className="text-sm text-[var(--color-positive)]">+{Format.money(totalShopIncome)}</span>
          </div>
        )}

        {/* Expenses */}
        {totalUpkeep > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm">Upkeep</span>
            <span className="text-sm text-[var(--color-negative)]">-{Format.money(totalUpkeep)}</span>
          </div>
        )}

        {dailyLoanPayment > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm">Loan</span>
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

      {/* Building Breakdown Toggle */}
      {costlyBuildings.length > 0 && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between active:bg-[var(--color-surface-hover)] transition-colors"
        >
          <span className="text-sm font-medium">Building Breakdown</span>
          {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      )}

      {/* Building Details */}
      {showDetails && costlyBuildings.length > 0 && (
        <div className="space-y-3">
          {/* Costs */}
          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
            <div className="text-xs text-[var(--color-text-muted)] mb-1">Upkeep by Building</div>
            {costlyBuildings.map((b) => (
              <div key={b.id} className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2">
                  <span>{b.emoji}</span>
                  <span className="text-sm">{b.name}</span>
                  {b.count > 1 && (
                    <span className="text-xs text-[var(--color-text-muted)]">x{b.count}</span>
                  )}
                </div>
                <span className="text-sm text-[var(--color-negative)]">
                  -{Format.money(b.upkeep)}/day
                </span>
              </div>
            ))}
          </div>

          {/* Shop Income */}
          {profitBuildings.length > 0 && (
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
              <div className="text-xs text-[var(--color-text-muted)] mb-1">Shop Income</div>
              {profitBuildings.map((b) => (
                <div key={b.id} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-2">
                    <span>{b.emoji}</span>
                    <span className="text-sm">{b.name}</span>
                    {b.count > 1 && (
                      <span className="text-xs text-[var(--color-text-muted)]">x{b.count}</span>
                    )}
                  </div>
                  <span className="text-sm text-[var(--color-positive)]">
                    +{Format.money(b.income)}/day
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
