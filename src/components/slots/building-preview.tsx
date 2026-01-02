import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, TrendingDown, Sparkles, Users, ShoppingBag } from 'lucide-react'
import type { BuildingDef } from '../../engine/game-types'
import { Building } from '../../systems/building'
import { Button } from '../ui/button'
import { Format } from '../../utils/format'

type BuildingPreviewProps = {
  building: BuildingDef | null
  canAfford: boolean
  isOwned: boolean
  onClose: () => void
  onBuild: () => void
}

/**
 * Full-detail preview sheet shown when tapping a building card.
 * Shows all effects organized by type so users can make informed decisions.
 */
export function BuildingPreview({ building, canAfford, isOwned, onClose, onBuild }: BuildingPreviewProps) {
  if (!building) return null

  const cost = building.costs[0]?.amount ?? 0
  const allEffects = Building.getDisplayEffects(building)

  // Separate effects by type
  const upkeepEffect = allEffects.find(e => e.statId === 'money' && !e.isPositive)
  const benefits = allEffects.filter(e => e.statId !== 'money' && e.isPositive)
  const drawbacks = allEffects.filter(e => e.statId !== 'money' && !e.isPositive)
  const incomeEffect = allEffects.find(e => e.statId === 'income')
  const capacityEffect = allEffects.find(e => e.statId === 'capacity')

  const handleBuild = () => {
    onBuild()
    onClose()
  }

  return (
    <AnimatePresence>
      {building && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 right-0 bottom-0 z-[60]"
          >
            <div className="bg-[var(--color-bg)] border-t border-[var(--color-border)] rounded-t-2xl overflow-hidden max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)]">
                <span className="text-4xl">{building.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg">{building.name}</div>
                  <div className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                    {building.description}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 active:bg-[var(--color-surface)] rounded-lg transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* Cost & Upkeep Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <div className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                      Build Cost
                    </div>
                    <div className={`text-xl font-bold ${canAfford ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}`}>
                      {Format.money(cost)}
                    </div>
                  </div>
                  {upkeepEffect && (
                    <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                      <div className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <TrendingDown size={10} />
                        Daily Upkeep
                      </div>
                      <div className="text-xl font-bold text-[var(--color-warning)]">
                        {Format.money(Math.abs(upkeepEffect.value))}/day
                      </div>
                    </div>
                  )}
                </div>

                {/* Capacity (Lodging) */}
                {capacityEffect && (
                  <div className="p-3 rounded-xl bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/30">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-[var(--color-positive)]" />
                      <div>
                        <div className="text-sm font-medium">Guest Capacity</div>
                        <div className="text-lg font-bold text-[var(--color-positive)]">
                          +{capacityEffect.value} guests
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Income (Shops) */}
                {incomeEffect && incomeEffect.perGuest != null && incomeEffect.guestCap != null && (
                  <div className="p-3 rounded-xl bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/30">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={18} className="text-[var(--color-positive)]" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Shop Income</div>
                        <div className="text-lg font-bold text-[var(--color-positive)]">
                          {Format.shopIncome(incomeEffect.perGuest)}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          Up to {incomeEffect.guestCap} guests • Max {Format.money(incomeEffect.value)}/day
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {benefits.length > 0 && (
                  <div>
                    <div className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Sparkles size={10} />
                      Benefits
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {benefits.map((effect, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-positive)]/15 text-[var(--color-positive)]"
                        >
                          {Format.effect(effect.value, effect.statId)}/day
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drawbacks */}
                {drawbacks.length > 0 && (
                  <div>
                    <div className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Zap size={10} />
                      Trade-offs
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {drawbacks.map((effect, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-negative)]/15 text-[var(--color-negative)]"
                        >
                          {Format.effect(effect.value, effect.statId)}/day
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Build Button */}
              <div className="p-4 border-t border-[var(--color-border)]">
                {isOwned ? (
                  <div className="text-center text-sm text-[var(--color-text-muted)] py-2">
                    ✓ Already built in your park
                  </div>
                ) : (
                  <Button
                    variant={canAfford ? 'primary' : 'secondary'}
                    onClick={handleBuild}
                    disabled={!canAfford}
                    className="w-full"
                  >
                    {canAfford ? `Build for ${Format.money(cost)}` : `Need ${Format.money(cost)}`}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
