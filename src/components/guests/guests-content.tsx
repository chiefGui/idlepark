import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, TrendingDown, Smile, Meh, Frown, AlertCircle, Home, Sparkles, Zap } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Guest } from '../../systems/guest'
import { analyzeGuestTypes, type GuestTypeAnalysis } from '../../systems/guest-types'
import { Format } from '../../utils/format'
import { GUEST_TYPE_META, GUEST_TYPES } from '../../engine/game-types'

export function GuestsContent() {
  const state = useGameStore()
  const stats = state.stats
  const rates = state.rates
  const guestBreakdown = state.guestBreakdown
  const guestTypeMix = state.guestTypeMix

  const totalGuests = guestBreakdown.happy + guestBreakdown.neutral + guestBreakdown.unhappy
  const capacity = Guest.getCapacity(state)
  const capacityPercent = capacity > 0 ? Math.round((totalGuests / capacity) * 100) : 0
  const arrivalRate = Guest.calculateArrivalRate(state)
  const appealBreakdown = Guest.getAppealBreakdown(state)

  // Analyze guest types with rich data
  const guestTypeAnalysis = useMemo(() =>
    analyzeGuestTypes(state, totalGuests),
    [state, totalGuests]
  )

  // Find dominant guest type
  const dominantType = useMemo(() => {
    if (!guestTypeMix) return null
    return GUEST_TYPES.reduce((max, type) =>
      guestTypeMix[type] > guestTypeMix[max] ? type : max
    )
  }, [guestTypeMix])

  // Calculate trait bonuses
  const traitBonuses = useMemo(() => Guest.getTraitBonuses(state), [state])

  return (
    <div className="space-y-4">
      {/* Guest Count Card */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[var(--color-accent)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Total Guests</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            {rates.guests >= 0 ? (
              <TrendingUp size={14} className="text-[var(--color-positive)]" />
            ) : (
              <TrendingDown size={14} className="text-[var(--color-negative)]" />
            )}
            <span className={rates.guests >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}>
              {rates.guests >= 0 ? '+' : ''}{Format.number(rates.guests)}/day
            </span>
          </div>
        </div>
        <div className="text-3xl font-bold">{Math.round(totalGuests)}</div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 rounded-full bg-[var(--color-bg)] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                backgroundColor: capacityPercent >= 90 ? 'var(--color-negative)' : capacityPercent >= 70 ? 'var(--color-accent)' : 'var(--color-positive)'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(capacityPercent, 100)}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">{capacityPercent}%</span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs text-[var(--color-text-muted)]">
          <Home size={12} />
          <span>{capacity} capacity</span>
        </div>
      </div>

      {/* Capacity Warning */}
      {capacityPercent >= 90 && (
        <div className="p-3 rounded-xl bg-[var(--color-negative)]/10 border border-[var(--color-negative)]/30">
          <div className="flex items-center gap-2 text-[var(--color-negative)]">
            <AlertCircle size={16} />
            <span className="text-sm font-medium">
              {capacityPercent >= 100 ? 'At capacity! Build lodging for more guests.' : 'Approaching capacity!'}
            </span>
          </div>
        </div>
      )}

      {/* Guest Mood */}
      {totalGuests > 0 && (
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-text-muted)] mb-3">Guest Mood</div>
          <GuestMoodBar breakdown={guestBreakdown} total={totalGuests} />
          <div className="grid grid-cols-3 gap-2 mt-3">
            <MoodStat icon={Smile} label="Happy" value={guestBreakdown.happy} total={totalGuests} color="var(--color-positive)" />
            <MoodStat icon={Meh} label="Neutral" value={guestBreakdown.neutral} total={totalGuests} color="var(--color-accent)" />
            <MoodStat icon={Frown} label="Unhappy" value={guestBreakdown.unhappy} total={totalGuests} color="var(--color-negative)" />
          </div>
          {guestBreakdown.unhappy >= 1 && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
              <span className="text-[var(--color-negative)]">{Math.floor(guestBreakdown.unhappy)}</span> unhappy guest{guestBreakdown.unhappy >= 2 ? 's' : ''} may leave at day's end
            </div>
          )}
        </div>
      )}

      {/* Guest Types */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="text-sm text-[var(--color-text-muted)] mb-3">Guest Types</div>

        {/* Visual distribution bar */}
        <GuestTypeMixBar analysis={guestTypeAnalysis} />

        {/* Detailed breakdown per type */}
        <div className="mt-3 space-y-2">
          {guestTypeAnalysis.map((analysis) => (
            <GuestTypeRow key={analysis.type} analysis={analysis} isDominant={analysis.type === dominantType} />
          ))}
        </div>
      </div>

      {/* Type Bonuses */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Type Bonuses</span>
        </div>
        <div className="space-y-2">
          <TraitBonusRow
            emoji="💰"
            label="Ticket income"
            value={`+${traitBonuses.ticketIncomeBonus.toFixed(1)}%`}
            source={`${guestTypeMix.thrills}% Thrill Seekers`}
            color={GUEST_TYPE_META.thrills.color}
          />
          <TraitBonusRow
            emoji="👥"
            label="Extra arrivals"
            value={`+${traitBonuses.arrivalBonus.toFixed(2)}/arrival`}
            source={`${guestTypeMix.family}% Families`}
            color={GUEST_TYPE_META.family.color}
          />
          <TraitBonusRow
            emoji="🏠"
            label="Departure rate"
            value={`-${traitBonuses.departureReduction.toFixed(1)}%`}
            source={`${guestTypeMix.relaxation}% Relaxers`}
            color={GUEST_TYPE_META.relaxation.color}
          />
        </div>
      </div>

      {/* Arrival Rate */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Arrival Rate</span>
        </div>
        <div className="text-2xl font-bold">
          +{Format.number(arrivalRate)}<span className="text-base font-normal text-[var(--color-text-muted)]">/day</span>
        </div>
        <div className="text-xs text-[var(--color-text-muted)] mt-1">
          Based on your park's appeal ({Math.round(stats.appeal)})
        </div>
      </div>

      {/* Appeal Breakdown */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="text-sm text-[var(--color-text-muted)] mb-3">Appeal Breakdown</div>
        <div className="space-y-2">
          {appealBreakdown.components.map((component) => (
            <AppealRow key={component.label} label={component.label} value={component.value} max={component.max} />
          ))}
          <div className="pt-2 border-t border-[var(--color-border)] flex justify-between items-center">
            <span className="text-sm font-medium">Total Appeal</span>
            <span className="font-bold">{Math.round(appealBreakdown.total)}</span>
          </div>
        </div>
      </div>

      {/* Supply vs Demand */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="text-sm text-[var(--color-text-muted)] mb-3">Supply vs Demand</div>
        <div className="grid grid-cols-2 gap-3">
          <SupplyRow label="Fun" statId="entertainment" state={state} />
          <SupplyRow label="Food" statId="food" state={state} />
          <SupplyRow label="Comfort" statId="comfort" state={state} />
          <SupplyRow label="Clean" statId="cleanliness" state={state} />
        </div>
      </div>
    </div>
  )
}

function GuestMoodBar({ breakdown, total }: { breakdown: { happy: number; neutral: number; unhappy: number }; total: number }) {
  if (total === 0) return null

  const happyPct = (breakdown.happy / total) * 100
  const neutralPct = (breakdown.neutral / total) * 100
  const unhappyPct = (breakdown.unhappy / total) * 100

  return (
    <div className="h-4 rounded-full overflow-hidden bg-[var(--color-bg)]">
      <div className="h-full flex">
        {happyPct > 0 && (
          <motion.div
            className="h-full bg-[var(--color-positive)]"
            style={{ width: `${happyPct}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        {neutralPct > 0 && (
          <motion.div
            className="h-full bg-[var(--color-accent)]"
            style={{ width: `${neutralPct}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        )}
        {unhappyPct > 0 && (
          <motion.div
            className="h-full bg-[var(--color-negative)]"
            style={{ width: `${unhappyPct}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          />
        )}
      </div>
    </div>
  )
}

function MoodStat({ icon: Icon, label, value, total, color }: {
  icon: typeof Smile;
  label: string;
  value: number;
  total: number;
  color: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="text-center" title={label}>
      <Icon size={16} className="mx-auto mb-1" style={{ color }} />
      <div className="font-semibold">{Math.round(value)}</div>
      <div className="text-xs text-[var(--color-text-muted)]">{pct}%</div>
    </div>
  )
}

function AppealRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="text-[var(--color-text-muted)]">{label}</span>
        <span className="font-medium">{Math.round(value)}<span className="text-[var(--color-text-muted)]">/{max}</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-bg)] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[var(--color-accent)]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}

function SupplyRow({ label, statId, state }: { label: string; statId: 'entertainment' | 'food' | 'comfort' | 'cleanliness'; state: Parameters<typeof Guest.getSupplyRatio>[1] }) {
  const ratio = Guest.getSupplyRatio(statId, state)
  const isGood = ratio >= 0.8
  const isBad = ratio < 0.5

  return (
    <div className="p-2 rounded-lg bg-[var(--color-bg)]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
        <span className={`text-xs font-medium ${isGood ? 'text-[var(--color-positive)]' : isBad ? 'text-[var(--color-negative)]' : 'text-[var(--color-accent)]'}`}>
          {Math.round(ratio * 100)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-surface)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            backgroundColor: isGood ? 'var(--color-positive)' : isBad ? 'var(--color-negative)' : 'var(--color-accent)'
          }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(ratio * 100, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}

function GuestTypeMixBar({ analysis }: { analysis: GuestTypeAnalysis[] }) {
  return (
    <div className="flex h-3 rounded-full overflow-hidden bg-[var(--color-bg)]">
      {analysis.map((a, index) => (
        <motion.div
          key={a.type}
          className="h-full"
          style={{ backgroundColor: GUEST_TYPE_META[a.type].color }}
          initial={{ width: 0 }}
          animate={{ width: `${a.percentage}%` }}
          transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

function GuestTypeRow({ analysis, isDominant }: { analysis: GuestTypeAnalysis; isDominant: boolean }) {
  const meta = GUEST_TYPE_META[analysis.type]
  const topAttractors = analysis.attractors.slice(0, 2)

  return (
    <div
      className="p-2 rounded-lg"
      style={{
        backgroundColor: isDominant ? `${meta.color}10` : 'var(--color-bg)',
        borderLeft: isDominant ? `3px solid ${meta.color}` : '3px solid transparent'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{meta.emoji}</span>
          <span className="text-sm font-medium" style={{ color: isDominant ? meta.color : undefined }}>
            {meta.name}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
          >
            {meta.trait.shortLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{analysis.guestCount}</span>
          <span className="text-xs text-[var(--color-text-muted)]">{analysis.percentage}%</span>
        </div>
      </div>

      {topAttractors.length > 0 && (
        <div className="mt-1 text-xs text-[var(--color-text-muted)] pl-6">
          {topAttractors.map((a) => a.building.emoji).join(' ')} {topAttractors.map((a) => a.building.name).join(', ')}
          {analysis.attractors.length > 2 && ` +${analysis.attractors.length - 2}`}
        </div>
      )}

      {topAttractors.length === 0 && (
        <div className="mt-1 text-xs text-[var(--color-text-muted)] pl-6 italic">
          No attractions yet
        </div>
      )}
    </div>
  )
}

function TraitBonusRow({ emoji, label, value, source, color }: {
  emoji: string
  label: string
  value: string
  source: string
  color: string
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg)]">
      <div className="flex items-center gap-2">
        <span>{emoji}</span>
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color }}>{value}</span>
        <span className="text-xs text-[var(--color-text-muted)]">({source})</span>
      </div>
    </div>
  )
}
