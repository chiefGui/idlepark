import { motion } from 'framer-motion'
import { Ticket, Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { GameTypes } from '../../engine/game-types'
import { Guest } from '../../systems/guest'
import { Format } from '../../utils/format'

export function ParkSettingsContent() {
  const state = useGameStore((s) => s)
  const ticketPrice = state.ticketPrice
  const guests = state.stats.guests
  const setTicketPrice = state.actions.setTicketPrice

  const priceMultiplier = Guest.getTicketPriceMultiplier(ticketPrice)
  const arrivalMultiplier = Guest.getArrivalPenalty(state)

  const incomePerGuest = Guest.BASE_MONEY_PER_GUEST * priceMultiplier
  const potentialIncome = incomePerGuest * guests

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketPrice(Number(e.target.value))
  }

  const priceLevel = ticketPrice <= 8 ? 'low' : ticketPrice >= 18 ? 'high' : 'medium'

  return (
    <div className="space-y-4">
      {/* Ticket Price Control */}
      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center">
            <Ticket size={20} className="text-[var(--color-accent)]" />
          </div>
          <div className="flex-1">
            <div className="font-medium">Ticket Price</div>
            <div className="text-sm text-[var(--color-text-muted)]">
              Balance income vs guest attraction
            </div>
          </div>
          <div className="text-2xl font-bold">${ticketPrice}</div>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={GameTypes.MIN_TICKET_PRICE}
            max={GameTypes.MAX_TICKET_PRICE}
            value={ticketPrice}
            onChange={handleSliderChange}
            className="w-full h-2 rounded-full appearance-none cursor-pointer
              bg-gradient-to-r from-[var(--color-positive)] via-[var(--color-accent)] to-[var(--color-negative)]
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
            <span>${GameTypes.MIN_TICKET_PRICE}</span>
            <span className={`font-medium ${
              priceLevel === 'low' ? 'text-[var(--color-positive)]' :
              priceLevel === 'high' ? 'text-[var(--color-negative)]' :
              'text-[var(--color-accent)]'
            }`}>
              {priceLevel === 'low' ? 'Budget' : priceLevel === 'high' ? 'Premium' : 'Standard'}
            </span>
            <span>${GameTypes.MAX_TICKET_PRICE}</span>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          layout
          className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-[var(--color-positive)]" />
            <span className="text-xs text-[var(--color-text-muted)]">Income/Guest</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{Format.money(incomePerGuest)}</span>
            {priceMultiplier !== 1 && (
              <span className={`text-xs flex items-center gap-0.5 ${
                priceMultiplier > 1 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
              }`}>
                {priceMultiplier > 1 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Format.percent(Math.abs((priceMultiplier - 1) * 100))}
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          layout
          className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-[var(--color-accent)]" />
            <span className="text-xs text-[var(--color-text-muted)]">Guest Attraction</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{Format.percent(arrivalMultiplier * 100)}</span>
            {arrivalMultiplier !== 1 && (
              <span className={`text-xs flex items-center gap-0.5 ${
                arrivalMultiplier > 1 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
              }`}>
                {arrivalMultiplier > 1 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Format.percent(Math.abs((arrivalMultiplier - 1) * 100))}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Current Revenue */}
      <div className="p-3 rounded-xl bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/20">
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--color-text-muted)]">Estimated daily income</div>
          <div className="text-lg font-bold text-[var(--color-positive)]">
            {Format.money(potentialIncome)}/day
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="p-3 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
        <div className="text-xs font-medium text-[var(--color-accent)] uppercase tracking-wider mb-1">
          Tip
        </div>
        <p className="text-sm">
          {priceLevel === 'low'
            ? 'Low prices attract more guests but earn less per visitor. Great for building up your guest count!'
            : priceLevel === 'high'
            ? 'High prices maximize revenue but slow guest arrivals. Best when you have high appeal.'
            : 'Standard pricing balances guest attraction with revenue. A safe choice for steady growth.'}
        </p>
      </div>
    </div>
  )
}
