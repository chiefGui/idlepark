import { motion } from 'framer-motion'
import { Zap, Users, DollarSign, TrendingUp } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Service } from '../../systems/service'
import { Format } from '../../utils/format'

export function ServicesContent() {
  const state = useGameStore((s) => s)
  const unlockedServices = Service.getUnlocked(state)

  if (unlockedServices.length === 0) {
    return (
      <div className="p-6 text-center text-[var(--color-text-muted)]">
        <div className="text-4xl mb-3">🔒</div>
        <div className="text-sm">No services unlocked yet.</div>
        <div className="text-xs mt-1">Purchase service perks to unlock park services!</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {unlockedServices.map(service => (
        <ServiceCard key={service.id} serviceId={service.id} />
      ))}
    </div>
  )
}

function ServiceCard({ serviceId }: { serviceId: 'fast_pass' }) {
  const state = useGameStore((s) => s)
  const setServiceConfig = state.actions.setServiceConfig

  const serviceDef = Service.getById(serviceId)
  if (!serviceDef) return null

  const serviceState = state.services.find(s => s.serviceId === serviceId)
  const config = serviceState?.config ?? Service.getDefaultConfig(serviceDef)

  const stats = Service.calculateStats(serviceDef, config, state)
  const totalGuests = state.stats.guests

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServiceConfig(serviceId, { price: Number(e.target.value) })
  }

  const priceLevel = config.price <= serviceDef.minPrice + 5 ? 'low' :
                     config.price >= serviceDef.maxPrice - 5 ? 'high' : 'medium'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Zap size={20} className="text-amber-500" />
        </div>
        <div className="flex-1">
          <div className="font-medium">{serviceDef.name}</div>
          <div className="text-sm text-[var(--color-text-muted)]">
            {serviceDef.description}
          </div>
        </div>
      </div>

      {/* Price Slider */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--color-text-muted)]">Price</span>
          <span className="text-lg font-bold">${config.price}</span>
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
        <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
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
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="p-2 rounded-lg bg-[var(--color-background)]">
          <div className="flex items-center gap-1 mb-1">
            <Users size={12} className="text-[var(--color-accent)]" />
            <span className="text-[10px] text-[var(--color-text-muted)]">Adoption</span>
          </div>
          <div className="text-sm font-bold">
            {Format.percent(stats.adoptionRate * 100)}
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)]">
            {stats.adopters} of {Math.floor(totalGuests)}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-[var(--color-background)]">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign size={12} className="text-[var(--color-positive)]" />
            <span className="text-[10px] text-[var(--color-text-muted)]">Income</span>
          </div>
          <div className="text-sm font-bold text-[var(--color-positive)]">
            {Format.money(stats.incomePerDay)}
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)]">per day</div>
        </div>

        <div className="p-2 rounded-lg bg-[var(--color-background)]">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={12} className="text-amber-500" />
            <span className="text-[10px] text-[var(--color-text-muted)]">Capacity</span>
          </div>
          <div className="text-sm font-bold text-amber-500">
            +{stats.capacityBonus}
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)]">extra slots</div>
        </div>
      </div>

      {/* Tip */}
      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <p className="text-xs text-amber-200/80">
          {priceLevel === 'low'
            ? 'Low prices = more adopters but less revenue per guest'
            : priceLevel === 'high'
            ? 'High prices = fewer adopters but maximum revenue from VIPs'
            : 'Balanced pricing for steady adoption and income'}
        </p>
      </div>
    </motion.div>
  )
}
