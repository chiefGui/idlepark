import { motion } from 'framer-motion'
import { Zap, Users, DollarSign, TrendingUp, Lock, ChevronLeft, Clock, Sparkles, Check } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Service } from '../../systems/service'
import { Marketing, type CampaignDef } from '../../systems/marketing'
import { Perk } from '../../systems/perk'
import { Format } from '../../utils/format'
import { GameTypes } from '../../engine/game-types'
import type { DrawerScreen } from '../ui/drawer'

type ServicesContentProps = {
  onNavigate: (screen: DrawerScreen) => void
}

export function ServicesContent({ onNavigate }: ServicesContentProps) {
  const state = useGameStore((s) => s)

  // Service menu items - map service IDs to drawer screens
  const serviceItems = [
    {
      service: Service.FAST_PASS,
      screen: 'service_fast_pass' as DrawerScreen,
    },
  ]

  // Marketing item
  const isMarketingUnlocked = Marketing.isUnlocked(state)
  const marketingPerk = Perk.getById(Marketing.PERK_ID)

  return (
    <div className="space-y-2">
      {/* Regular services */}
      {serviceItems.map(({ service, screen }) => {
        const isUnlocked = Service.isUnlocked(service, state)
        const perk = Perk.getById(service.perkId)

        return (
          <motion.button
            key={service.id}
            whileTap={isUnlocked ? { scale: 0.98 } : undefined}
            onClick={() => isUnlocked && onNavigate(screen)}
            disabled={!isUnlocked}
            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors text-left ${
              isUnlocked
                ? 'bg-[var(--color-surface)] active:bg-[var(--color-surface-hover)]'
                : 'bg-[var(--color-surface)]/50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${
              isUnlocked ? 'bg-amber-500/20' : 'bg-[var(--color-text-muted)]/10'
            }`}>
              <span className={`text-xl ${!isUnlocked && 'grayscale'}`}>{service.emoji}</span>
              {!isUnlocked && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
                  <Lock size={10} className="text-[var(--color-text-muted)]" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium">{service.name}</div>
              <div className="text-sm text-[var(--color-text-muted)]">
                {isUnlocked ? service.description : `Unlock via ${perk?.name ?? 'perk'}`}
              </div>
            </div>
            {isUnlocked ? (
              <ChevronLeft size={20} className="rotate-180 text-[var(--color-text-muted)]" />
            ) : (
              <div className="text-xs text-[var(--color-warning)] bg-[var(--color-warning)]/10 px-2 py-1 rounded-full">
                Locked
              </div>
            )}
          </motion.button>
        )
      })}

      {/* Marketing */}
      <motion.button
        whileTap={isMarketingUnlocked ? { scale: 0.98 } : undefined}
        onClick={() => isMarketingUnlocked && onNavigate('service_marketing')}
        disabled={!isMarketingUnlocked}
        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors text-left ${
          isMarketingUnlocked
            ? 'bg-[var(--color-surface)] active:bg-[var(--color-surface-hover)]'
            : 'bg-[var(--color-surface)]/50 opacity-60 cursor-not-allowed'
        }`}
      >
        <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${
          isMarketingUnlocked ? 'bg-purple-500/20' : 'bg-[var(--color-text-muted)]/10'
        }`}>
          <span className={`text-xl ${!isMarketingUnlocked && 'grayscale'}`}>📣</span>
          {!isMarketingUnlocked && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
              <Lock size={10} className="text-[var(--color-text-muted)]" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium">Marketing</div>
          <div className="text-sm text-[var(--color-text-muted)]">
            {isMarketingUnlocked ? 'Run campaigns to attract guests' : `Unlock via ${marketingPerk?.name ?? 'perk'}`}
          </div>
        </div>
        {isMarketingUnlocked ? (
          <ChevronLeft size={20} className="rotate-180 text-[var(--color-text-muted)]" />
        ) : (
          <div className="text-xs text-[var(--color-warning)] bg-[var(--color-warning)]/10 px-2 py-1 rounded-full">
            Locked
          </div>
        )}
      </motion.button>

      {/* Hint for locked services */}
      <div className="p-3 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mt-4">
        <p className="text-xs text-[var(--color-text-muted)]">
          Unlock services by purchasing their perks in the Perks menu.
        </p>
      </div>
    </div>
  )
}

// Fast Pass info UI
export function FastPassContent() {
  const state = useGameStore((s) => s)
  const serviceDef = Service.FAST_PASS
  const stats = Service.getStats(serviceDef)

  // Calculate current bonus income
  const baseIncome = state.rates.money
  const bonusIncome = baseIncome * (stats.incomeBoostPercent / 100)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Zap size={24} className="text-amber-500" />
        </div>
        <div className="flex-1">
          <div className="text-lg font-medium">{serviceDef.name}</div>
          <div className="text-sm text-[var(--color-text-muted)]">
            {serviceDef.description}
          </div>
        </div>
      </div>

      {/* Bonuses */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-[var(--color-positive)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Income Boost</span>
          </div>
          <div className="text-2xl font-bold text-[var(--color-positive)]">
            +{stats.incomeBoostPercent}%
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            +{Format.money(bonusIncome)}/day currently
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-amber-500" />
            <span className="text-sm text-[var(--color-text-muted)]">Capacity</span>
          </div>
          <div className="text-2xl font-bold text-amber-500">
            +{stats.capacityBonus}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            extra guests
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <p className="text-xs text-amber-200/80">
          Fast Pass is always active once unlocked. Bigger parks benefit more from the percentage boost!
        </p>
      </div>
    </div>
  )
}

// Marketing campaigns UI
export function MarketingContent() {
  const state = useGameStore((s) => s)
  const startCampaign = state.actions.startCampaign

  const activeCampaign = Marketing.getActiveCampaign(state)
  const daysRemaining = Marketing.getDaysRemaining(state)
  const cooldownRemaining = Marketing.getCooldownRemaining(state)
  const isCooldownActive = cooldownRemaining > 0 && !activeCampaign

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <span className="text-2xl">📣</span>
        </div>
        <div className="flex-1">
          <div className="text-lg font-medium">Marketing</div>
          <div className="text-sm text-[var(--color-text-muted)]">
            Run campaigns to attract more guests
          </div>
        </div>
      </div>

      {/* Active Campaign Banner */}
      {activeCampaign && (
        <div className="p-4 rounded-xl bg-purple-500/20 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
              <span className="text-xl">{activeCampaign.emoji}</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-purple-200">{activeCampaign.name}</div>
              <div className="text-sm text-purple-300/70">Active campaign</div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-purple-200">
                <Clock size={14} />
                <span className="font-bold">{Math.ceil(daysRemaining)}</span>
              </div>
              <div className="text-xs text-purple-300/70">days left</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-purple-500/20 text-center">
              <div className="text-xs text-purple-300/70">Guest Boost</div>
              <div className="font-bold text-purple-200">+{Math.round(activeCampaign.effects.guestArrivalBonus * 100)}%</div>
            </div>
            {activeCampaign.effects.appealBonus > 0 && (
              <div className="p-2 rounded-lg bg-purple-500/20 text-center">
                <div className="text-xs text-purple-300/70">Appeal Boost</div>
                <div className="font-bold text-purple-200">+{activeCampaign.effects.appealBonus}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cooldown Banner */}
      {isCooldownActive && (
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-[var(--color-text-muted)]" />
            <div className="flex-1">
              <div className="font-medium">Cooldown Active</div>
              <div className="text-sm text-[var(--color-text-muted)]">
                Wait {Math.ceil(cooldownRemaining)} more day{cooldownRemaining !== 1 ? 's' : ''} before next campaign
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Cards */}
      <div className="space-y-2">
        {Marketing.ALL.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            state={state}
            onPurchase={() => startCampaign(campaign.id)}
          />
        ))}
      </div>

      {/* Info */}
      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <p className="text-xs text-purple-200/80">
          Marketing campaigns temporarily boost guest arrival rate and appeal.
          Only one campaign can run at a time, with a {GameTypes.MARKETING_COOLDOWN_DAYS}-day cooldown between campaigns.
        </p>
      </div>
    </div>
  )
}

// Individual campaign card
function CampaignCard({
  campaign,
  state,
  onPurchase,
}: {
  campaign: CampaignDef
  state: ReturnType<typeof useGameStore.getState>
  onPurchase: () => void
}) {
  const { canBuy, reason } = Marketing.canPurchase(campaign, state)
  const isActive = state.marketing?.activeCampaign?.campaignId === campaign.id

  return (
    <motion.div
      whileTap={canBuy ? { scale: 0.98 } : undefined}
      className={`p-4 rounded-xl border transition-colors ${
        isActive
          ? 'bg-purple-500/20 border-purple-500/30'
          : canBuy
          ? 'bg-[var(--color-surface)] border-[var(--color-border)] active:bg-[var(--color-surface-hover)]'
          : 'bg-[var(--color-surface)]/50 border-[var(--color-border)] opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isActive ? 'bg-purple-500/30' : 'bg-[var(--color-accent)]/10'
        }`}>
          <span className="text-xl">{campaign.emoji}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{campaign.name}</span>
            {isActive && (
              <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> Active
              </span>
            )}
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">{campaign.description}</div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-[var(--color-text-muted)]" />
              {campaign.duration} days
            </span>
            <span className="flex items-center gap-1 text-[var(--color-positive)]">
              <Users size={12} />
              +{Math.round(campaign.effects.guestArrivalBonus * 100)}%
            </span>
            {campaign.effects.appealBonus > 0 && (
              <span className="flex items-center gap-1 text-amber-500">
                <TrendingUp size={12} />
                +{campaign.effects.appealBonus}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          {isActive ? (
            <div className="flex items-center gap-1 text-purple-200">
              <Check size={16} />
            </div>
          ) : (
            <>
              <button
                onClick={onPurchase}
                disabled={!canBuy}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  canBuy
                    ? 'bg-purple-500 text-white active:bg-purple-600'
                    : 'bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)] cursor-not-allowed'
                }`}
              >
                {Format.money(campaign.cost)}
              </button>
              {!canBuy && reason && (
                <div className="text-xs text-[var(--color-text-muted)] mt-1">{reason}</div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
