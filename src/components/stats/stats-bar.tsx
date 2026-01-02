import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Users } from 'lucide-react'
import type { StatId } from '../../engine/game-types'
import { useGameStore } from '../../store/game-store'
import { Guest } from '../../systems/guest'
import { Format } from '../../utils/format'
import { STAT_CONFIG, SECONDARY_STATS } from '../../constants/stats'
import { InfoModal } from '../ui/info-modal'
import { StatDetail } from './stat-detail'
import { MoneyPopup } from '../ui/money-popup'
import { useDrawerNavigation } from '../ui/drawer-hooks'

export function StatsBar() {
  const state = useGameStore()
  const stats = state.stats
  const rates = state.rates
  const [selectedStat, setSelectedStat] = useState<StatId | null>(null)
  const navigateTo = useDrawerNavigation()

  const selectedConfig = selectedStat ? STAT_CONFIG[selectedStat] : null

  // Calculate guest arrival rate (not in rates.guests)
  const guestArrivalRate = Guest.calculateArrivalRate(state)

  // Guest capacity
  const guestCapacity = Guest.getCapacity(state)
  const capacityPercent = (stats.guests / guestCapacity) * 100

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

        {/* Secondary: Other stats - colored chips */}
        <div className="grid grid-cols-6 gap-1.5">
          {SECONDARY_STATS.map((statId) => {
            const config = STAT_CONFIG[statId]
            const Icon = config.icon
            const value = stats[statId]

            return (
              <motion.button
                key={statId}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStat(statId)}
                className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl active:opacity-80 transition-opacity"
                style={{ backgroundColor: `${config.color}18` }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${config.color}30` }}
                >
                  <Icon size={16} style={{ color: config.color }} />
                </div>
                <span
                  className="text-xs font-bold leading-none"
                  style={{ color: config.color }}
                >
                  {config.format(value)}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

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
    </>
  )
}
