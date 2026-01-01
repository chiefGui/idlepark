import { motion } from 'framer-motion'
import { Zap, Users, DollarSign, Lock, ChevronLeft } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Service } from '../../systems/service'
import { Marketing } from '../../systems/marketing'
import { Bank } from '../../systems/bank'
import { Perk } from '../../systems/perk'
import { Format } from '../../utils/format'
import type { DrawerScreen } from '../ui/drawer'

type ServicesContentProps = {
  onNavigate: (screen: DrawerScreen) => void
}

export function ServicesContent({ onNavigate }: ServicesContentProps) {
  const state = useGameStore((s) => s)

  // Bank unlock check
  const isBankUnlocked = Bank.isUnlocked(state)

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
      {/* Bank - first in the list */}
      <motion.button
        whileTap={isBankUnlocked ? { scale: 0.98 } : undefined}
        onClick={() => isBankUnlocked && onNavigate('service_bank')}
        disabled={!isBankUnlocked}
        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors text-left ${
          isBankUnlocked
            ? 'bg-[var(--color-surface)] active:bg-[var(--color-surface-hover)]'
            : 'bg-[var(--color-surface)]/50 opacity-60 cursor-not-allowed'
        }`}
      >
        <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${
          isBankUnlocked ? 'bg-emerald-500/20' : 'bg-[var(--color-text-muted)]/10'
        }`}>
          <span className={`text-xl ${!isBankUnlocked && 'grayscale'}`}>🏦</span>
          {!isBankUnlocked && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
              <Lock size={10} className="text-[var(--color-text-muted)]" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium">Bank</div>
          <div className="text-sm text-[var(--color-text-muted)]">
            {isBankUnlocked ? 'Borrow money to grow your park' : 'Reach 50 guests to unlock'}
          </div>
        </div>
        {isBankUnlocked ? (
          <ChevronLeft size={20} className="rotate-180 text-[var(--color-text-muted)]" />
        ) : (
          <div className="text-xs text-[var(--color-warning)] bg-[var(--color-warning)]/10 px-2 py-1 rounded-full">
            Locked
          </div>
        )}
      </motion.button>

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

// Fast Pass info UI with tier slider
export function FastPassContent() {
  const state = useGameStore((s) => s)
  const setFastPassTier = state.actions.setFastPassTier

  const currentTier = Service.getCurrentFastPassTier(state)
  const capacityBonus = Service.getTotalCapacityBonus(state)
  const fastPassPrice = Service.getFastPassPrice(state)

  // Map tier to slider index (0-3)
  const tierIndex = Service.FAST_PASS_TIERS.findIndex(t => t.id === state.fastPassTier)

  // Calculate current bonus income
  const baseIncome = state.rates.money
  const bonusIncome = baseIncome * (currentTier.incomeBoostPercent / 100)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = Number(e.target.value)
    const tier = Service.FAST_PASS_TIERS[index]
    if (tier) {
      setFastPassTier(tier.id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Zap size={24} className="text-amber-500" />
        </div>
        <div className="flex-1">
          <div className="text-lg font-medium">Fast Pass</div>
          <div className="text-sm text-[var(--color-text-muted)]">
            Balance capacity vs income
          </div>
        </div>
      </div>

      {/* Pricing Tier Slider */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-[var(--color-text-muted)]">Pricing Tier</div>
            <div className="text-2xl font-bold text-amber-400">{currentTier.name}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[var(--color-text-muted)]">Fast Pass Price</div>
            <div className="text-2xl font-bold">${fastPassPrice.toFixed(0)}</div>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={tierIndex}
            onChange={handleSliderChange}
            className="w-full h-2 rounded-full appearance-none cursor-pointer
              bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-7
              [&::-webkit-slider-thumb]:h-7
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-amber-400
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:active:scale-110
              [&::-moz-range-thumb]:w-7
              [&::-moz-range-thumb]:h-7
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:shadow-lg
              [&::-moz-range-thumb]:border-2
              [&::-moz-range-thumb]:border-amber-400
            "
          />
          <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
            {Service.FAST_PASS_TIERS.map((tier) => (
              <span
                key={tier.id}
                className={tier.id === currentTier.id ? 'text-amber-400 font-medium' : ''}
              >
                {tier.name}
              </span>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">
              Ticket ${state.ticketPrice} + {Math.round(currentTier.priceMultiplier * 100)}%
            </span>
            <span className="text-amber-400 font-medium">
              = ${fastPassPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-amber-500" />
            <span className="text-sm text-[var(--color-text-muted)]">Capacity</span>
          </div>
          <div className="text-2xl font-bold text-amber-500">
            +{currentTier.capacityBoostPercent}%
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            +{capacityBonus} guests
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-[var(--color-positive)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Income</span>
          </div>
          <div className="text-2xl font-bold text-[var(--color-positive)]">
            +{currentTier.incomeBoostPercent}%
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            +{Format.money(bonusIncome)}/day
          </div>
        </div>
      </div>

      {/* Trade-off hint */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <p className="text-xs text-amber-200/80">
          {tierIndex === 0
            ? 'Budget pricing maximizes guest capacity. Great for growing your park!'
            : tierIndex === 3
            ? 'VIP pricing maximizes income per guest. Best for established parks.'
            : 'Slide left for more guests, right for more income per guest.'}
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
    <div className="space-y-2">
      {/* Status bar */}
      {activeCampaign && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-500/20 text-sm">
          <span className="text-purple-200">{activeCampaign.emoji} {activeCampaign.name} running</span>
          <span className="text-purple-300">{Math.ceil(daysRemaining)} days left</span>
        </div>
      )}
      {isCooldownActive && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--color-surface)] text-sm text-[var(--color-text-muted)]">
          <span>Cooldown active</span>
          <span>{Math.ceil(cooldownRemaining)} days</span>
        </div>
      )}

      {/* Campaign List */}
      <div className="space-y-2">
        {Marketing.ALL.map((campaign) => {
          const { canBuy, reason } = Marketing.canPurchase(campaign, state)
          const isActive = state.marketing?.activeCampaign?.campaignId === campaign.id

          return (
            <div
              key={campaign.id}
              className={`p-3 rounded-xl ${
                isActive ? 'bg-purple-500/15 ring-1 ring-purple-500/30' : 'bg-[var(--color-surface)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{campaign.emoji} {campaign.name}</span>
                {isActive ? (
                  <span className="text-xs text-purple-400">Active</span>
                ) : (
                  <button
                    onClick={() => startCampaign(campaign.id)}
                    disabled={!canBuy}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      canBuy
                        ? 'bg-purple-500 text-white'
                        : 'bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]'
                    }`}
                  >
                    {reason || Format.money(campaign.cost)}
                  </button>
                )}
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">
                +{Math.round(campaign.effects.guestArrivalBonus * 100)}% more guests for {campaign.duration} days
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Bank loans UI
export function BankContent() {
  const state = useGameStore((s) => s)
  const takeLoan = state.actions.takeLoan

  const activeLoan = state.bankLoan
  const cooldownRemaining = Bank.getCooldownRemaining(state)
  const isCooldownActive = cooldownRemaining > 0 && !activeLoan

  const daysRemaining = activeLoan
    ? Math.ceil(activeLoan.remainingAmount / activeLoan.dailyPayment)
    : 0

  return (
    <div className="space-y-2">
      {/* Status bar */}
      {activeLoan && (
        <div className="px-3 py-2 rounded-lg bg-emerald-500/20 text-sm">
          <div className="flex items-center justify-between text-emerald-200">
            <span>Repaying {Bank.getById(activeLoan.packageId)?.name}</span>
            <span>{daysRemaining} days left</span>
          </div>
          <div className="flex items-center justify-between text-emerald-300/70 text-xs mt-1">
            <span>{Format.money(activeLoan.dailyPayment)} per day</span>
            <span>{Format.money(activeLoan.remainingAmount)} remaining</span>
          </div>
        </div>
      )}
      {isCooldownActive && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--color-surface)] text-sm text-[var(--color-text-muted)]">
          <span>Cooldown active</span>
          <span>{Math.ceil(cooldownRemaining)} days</span>
        </div>
      )}

      {/* Loan List */}
      <div className="space-y-2">
        {Bank.ALL.map((pkg) => {
          const { canBuy, reason } = Bank.canTakeLoan(pkg, state)
          const isActive = state.bankLoan?.packageId === pkg.id
          const totalRepayment = Bank.getTotalRepayment(pkg)

          return (
            <div
              key={pkg.id}
              className={`p-3 rounded-xl ${
                isActive ? 'bg-emerald-500/15 ring-1 ring-emerald-500/30' : 'bg-[var(--color-surface)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{pkg.emoji} Borrow {Format.money(pkg.amount)}</span>
                {isActive ? (
                  <span className="text-xs text-emerald-400">Active</span>
                ) : (
                  <button
                    onClick={() => takeLoan(pkg.id)}
                    disabled={!canBuy}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      canBuy
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]'
                    }`}
                  >
                    {reason || 'Borrow'}
                  </button>
                )}
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">
                Pay back {Format.money(totalRepayment)} over {pkg.duration} days
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
