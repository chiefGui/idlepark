import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Users, Sparkles, Sofa, ChevronDown } from 'lucide-react'
import type { StatId } from '../../engine/game-types'
import { useGameStore } from '../../store/game-store'
import { Guest } from '../../systems/guest'
import { ParkRating } from '../../systems/park-rating'
import { Format } from '../../utils/format'
import { STAT_CONFIG } from '../../constants/stats'
import { InfoModal } from '../ui/info-modal'
import { StatDetail } from './stat-detail'
import { MoneyPopup } from '../ui/money-popup'
import { StarRating } from '../park-rating/star-rating'
import { useDrawerNavigation } from '../ui/drawer-hooks'

export function StatsBar() {
  const state = useGameStore()
  const stats = state.stats
  const rates = state.rates
  const [selectedStat, setSelectedStat] = useState<StatId | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const navigateTo = useDrawerNavigation()

  const selectedConfig = selectedStat ? STAT_CONFIG[selectedStat] : null

  // Calculate guest arrival rate
  const guestArrivalRate = Guest.calculateArrivalRate(state)

  // Guest capacity
  const guestCapacity = Guest.getCapacity(state)
  const capacityPercent = (stats.guests / guestCapacity) * 100

  // Park rating (simplified)
  const rating = ParkRating.calculateRating(state)
  const unifiedStats = ParkRating.calculateUnifiedStats(state)
  const phase = ParkRating.getPhase(state.currentDay)
  const showComfort = phase !== 'discovery'

  const statusColors = {
    great: 'bg-emerald-500',
    good: 'bg-blue-500',
    low: 'bg-amber-500',
    critical: 'bg-red-500',
  }

  return (
    <>
      <div className="px-4 py-2 space-y-2">
        {/* Primary: Money & Guests */}
        <div className="grid grid-cols-2 gap-2">
          {/* Money */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStat('money')}
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] active:bg-[var(--color-surface-hover)] transition-colors"
          >
            <MoneyPopup />
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${STAT_CONFIG.money.color}20` }}
            >
              <DollarSign size={18} style={{ color: STAT_CONFIG.money.color }} />
            </div>
            <div className="flex flex-col min-w-0 text-left flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--color-text-muted)] leading-none">
                  {STAT_CONFIG.money.label}
                </span>
                {rates.money !== 0 && (
                  <span
                    className="text-[10px] leading-none font-medium"
                    style={{ color: rates.money > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
                  >
                    {Format.rate(rates.money)}/day
                  </span>
                )}
              </div>
              <span className="text-base font-bold leading-tight">
                {Format.money(stats.money)}
              </span>
            </div>
          </motion.button>

          {/* Guests */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStat('guests')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] active:bg-[var(--color-surface-hover)] transition-colors"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${STAT_CONFIG.guests.color}20` }}
            >
              <Users size={18} style={{ color: STAT_CONFIG.guests.color }} />
            </div>
            <div className="flex flex-col min-w-0 text-left flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--color-text-muted)] leading-none">
                  {STAT_CONFIG.guests.label}
                </span>
                {guestArrivalRate > 0 && (
                  <span
                    className="text-[10px] leading-none font-medium"
                    style={{ color: 'var(--color-positive)' }}
                  >
                    {Format.rate(guestArrivalRate)}/day
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold leading-tight">
                  {Format.guests(stats.guests)}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  / {guestCapacity}
                </span>
              </div>
              {/* Capacity progress bar */}
              <div className="mt-1 h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (stats.guests / guestCapacity) * 100)}%`,
                    backgroundColor: capacityPercent >= 100
                      ? 'var(--color-negative)'
                      : capacityPercent >= 80
                      ? 'var(--color-warning)'
                      : STAT_CONFIG.guests.color,
                  }}
                />
              </div>
            </div>
          </motion.button>
        </div>

        {/* Simplified Park Rating */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDetails(true)}
          className="w-full p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] active:bg-[var(--color-surface-hover)] transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <StarRating stars={rating.stars} size="md" />
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {rating.label}
              </span>
            </div>
            <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
          </div>

          {/* Fun & Comfort bars */}
          <div className="space-y-1.5">
            {/* Fun - Always visible */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-16">
                <Sparkles size={12} className="text-pink-500" />
                <span className="text-[10px] font-medium text-[var(--color-text-muted)]">Fun</span>
              </div>
              <div className="flex-1 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${statusColors[rating.funStatus]} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, unifiedStats.fun)}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                />
              </div>
              <span className="text-[10px] font-medium text-[var(--color-text-muted)] w-8 text-right">
                {unifiedStats.fun}%
              </span>
            </div>

            {/* Comfort - Unlocks at Day 8 */}
            {showComfort && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-1 w-16">
                  <Sofa size={12} className="text-blue-500" />
                  <span className="text-[10px] font-medium text-[var(--color-text-muted)]">Comfort</span>
                </div>
                <div className="flex-1 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${statusColors[rating.comfortStatus]} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, unifiedStats.comfort)}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                  />
                </div>
                <span className="text-[10px] font-medium text-[var(--color-text-muted)] w-8 text-right">
                  {unifiedStats.comfort}%
                </span>
              </motion.div>
            )}
          </div>
        </motion.button>
      </div>

      {/* Stat Detail Modal */}
      <InfoModal
        isOpen={!!selectedStat}
        onClose={() => setSelectedStat(null)}
        title={selectedConfig?.label ?? ''}
      >
        {selectedStat && (
          <StatDetail
            statId={selectedStat}
            onNavigateToFinances={() => {
              setSelectedStat(null)
              navigateTo('finances')
            }}
          />
        )}
      </InfoModal>

      {/* Park Rating Details Modal */}
      <InfoModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Park Rating"
      >
        <ParkRatingDetails />
      </InfoModal>
    </>
  )
}

/**
 * Detailed park rating breakdown shown in modal
 */
function ParkRatingDetails() {
  const state = useGameStore()
  const rating = ParkRating.calculateRating(state)
  const unifiedStats = ParkRating.calculateUnifiedStats(state)
  const guestBonuses = ParkRating.getActiveGuestTypeBonuses(state.guestTypeMix)
  const phase = ParkRating.getPhase(state.currentDay)

  const statusLabels = {
    great: 'Great!',
    good: 'Good',
    low: 'Needs work',
    critical: 'Critical!',
  }

  const statusColors = {
    great: 'text-emerald-500',
    good: 'text-blue-500',
    low: 'text-amber-500',
    critical: 'text-red-500',
  }

  const activeBonuses = Object.values(guestBonuses)

  return (
    <div className="space-y-4">
      {/* Star Rating */}
      <div className="text-center">
        <StarRating stars={rating.stars} size="lg" showLabel label={rating.label} />
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Day {state.currentDay} • {phase.charAt(0).toUpperCase() + phase.slice(1)} Phase
        </p>
      </div>

      {/* Stats Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-2)]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-pink-500" />
            <span className="font-medium">Fun</span>
          </div>
          <div className="text-right">
            <span className="font-bold">{unifiedStats.fun}%</span>
            <span className={`ml-2 text-sm ${statusColors[rating.funStatus]}`}>
              {statusLabels[rating.funStatus]}
            </span>
          </div>
        </div>

        {phase !== 'discovery' && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-2)]">
            <div className="flex items-center gap-2">
              <Sofa size={16} className="text-blue-500" />
              <span className="font-medium">Comfort</span>
            </div>
            <div className="text-right">
              <span className="font-bold">{unifiedStats.comfort}%</span>
              <span className={`ml-2 text-sm ${statusColors[rating.comfortStatus]}`}>
                {statusLabels[rating.comfortStatus]}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-2)]">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-purple-500" />
            <span className="font-medium">Capacity</span>
          </div>
          <div className="text-right">
            <span className="font-bold">{unifiedStats.currentGuests}</span>
            <span className="text-[var(--color-text-muted)]"> / {unifiedStats.capacity}</span>
          </div>
        </div>
      </div>

      {/* Guest Type Bonuses */}
      {activeBonuses.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-[var(--color-text-secondary)]">
            Active Guest Bonuses
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {activeBonuses.map((bonus) => (
              <div
                key={bonus.type}
                className="p-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-1.5">
                  <span>{bonus.emoji}</span>
                  <span className="text-xs font-medium">{bonus.name}</span>
                </div>
                <p className="text-[10px] text-emerald-500 mt-0.5">{bonus.bonus}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase Info */}
      <div className="text-center text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
        {phase === 'discovery' && 'Focus on building rides to attract guests!'}
        {phase === 'comfort' && 'Keep guests happy with food and rest areas.'}
        {phase === 'growth' && 'Expand capacity with lodging to grow bigger!'}
        {phase === 'mastery' && 'Optimize pricing and run marketing campaigns.'}
      </div>
    </div>
  )
}
