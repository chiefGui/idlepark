import { motion } from 'framer-motion'
import { Zap, Users, DollarSign, TrendingUp, Lock, ChevronLeft } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Service } from '../../systems/service'
import { Perk } from '../../systems/perk'
import { Format } from '../../utils/format'
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

  return (
    <div className="space-y-2">
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

      {/* Hint for locked services */}
      <div className="p-3 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mt-4">
        <p className="text-xs text-[var(--color-text-muted)]">
          Unlock services by purchasing their perks in the Perks menu.
        </p>
      </div>
    </div>
  )
}

// Fast Pass configuration UI
export function FastPassContent() {
  const state = useGameStore((s) => s)
  const setServiceConfig = state.actions.setServiceConfig

  const serviceDef = Service.FAST_PASS
  const serviceState = state.services.find(s => s.serviceId === 'fast_pass')
  const config = serviceState?.config ?? Service.getDefaultConfig(serviceDef)

  const stats = Service.calculateStats(serviceDef, config, state)
  const totalGuests = state.stats.guests

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServiceConfig('fast_pass', { price: Number(e.target.value) })
  }

  const priceLevel = config.price <= serviceDef.minPrice + 5 ? 'low' :
                     config.price >= serviceDef.maxPrice - 5 ? 'high' : 'medium'

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

      {/* Price Slider */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">Price per guest</span>
          <span className="text-2xl font-bold">${config.price}</span>
        </div>
        <input
          type="range"
          min={serviceDef.minPrice}
          max={serviceDef.maxPrice}
          value={config.price}
          onChange={handlePriceChange}
          className="w-full h-2 rounded-full appearance-none cursor-pointer
            bg-gradient-to-r from-[var(--color-positive)] via-amber-500 to-[var(--color-negative)]
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[var(--color-border)]
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:active:scale-110
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:h-6
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-[var(--color-border)]
          "
        />
        <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-2">
          <span>${serviceDef.minPrice}</span>
          <span className={`font-medium ${
            priceLevel === 'low' ? 'text-[var(--color-positive)]' :
            priceLevel === 'high' ? 'text-[var(--color-negative)]' :
            'text-amber-500'
          }`}>
            {priceLevel === 'low' ? 'Budget' : priceLevel === 'high' ? 'Premium' : 'Standard'}
          </span>
          <span>${serviceDef.maxPrice}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 mb-1">
            <Users size={14} className="text-[var(--color-accent)]" />
            <span className="text-xs text-[var(--color-text-muted)]">Adoption</span>
          </div>
          <div className="text-lg font-bold">
            {Format.percent(stats.adoptionRate * 100)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {stats.adopters} of {Math.floor(totalGuests)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign size={14} className="text-[var(--color-positive)]" />
            <span className="text-xs text-[var(--color-text-muted)]">Income</span>
          </div>
          <div className="text-lg font-bold text-[var(--color-positive)]">
            {Format.money(stats.incomePerDay)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">per day</div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={14} className="text-amber-500" />
            <span className="text-xs text-[var(--color-text-muted)]">Capacity</span>
          </div>
          <div className="text-lg font-bold text-amber-500">
            +{stats.capacityBonus}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">extra slots</div>
        </div>
      </div>

      {/* Tip */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <p className="text-xs text-amber-200/80">
          {priceLevel === 'low'
            ? 'Low prices attract more adopters but generate less revenue per guest.'
            : priceLevel === 'high'
            ? 'Premium prices maximize revenue from VIPs but fewer guests will adopt.'
            : 'Balanced pricing for steady adoption and reliable income.'}
        </p>
      </div>
    </div>
  )
}
