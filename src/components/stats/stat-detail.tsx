import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, Plus, AlertCircle, Lightbulb, Smile, Meh, Frown } from 'lucide-react'
import type { StatId, GameState } from '../../engine/game-types'
import { GameTypes } from '../../engine/game-types'
import { useGameStore } from '../../store/game-store'
import { Building } from '../../systems/building'
import { Perk } from '../../systems/perk'
import { Guest } from '../../systems/guest'
import { Slot } from '../../systems/slot'
import { Format } from '../../utils/format'

type StatConfig = {
  format: (value: number) => string
  formatRate: (value: number) => string
  color: string
}

const STAT_CONFIGS: Record<StatId, StatConfig> = {
  money: { format: Format.money, formatRate: Format.rate, color: '#22c55e' },
  guests: { format: Format.guests, formatRate: Format.rate, color: '#6366f1' },
  entertainment: { format: (v) => Format.millify(v, 1), formatRate: Format.rate, color: '#f472b6' },
  food: { format: (v) => Format.millify(v, 1), formatRate: Format.rate, color: '#fb923c' },
  comfort: { format: (v) => Format.millify(v, 1), formatRate: Format.rate, color: '#a78bfa' },
  cleanliness: { format: Format.percent, formatRate: Format.rate, color: '#22d3ee' },
  appeal: { format: Format.percent, formatRate: Format.rate, color: '#fbbf24' },
  satisfaction: { format: Format.percent, formatRate: Format.rate, color: '#f87171' },
}

type SourceContribution = {
  emoji: string
  name: string
  amount: number
  count?: number
}

type StatDetailProps = {
  statId: StatId
}

function getStatSources(statId: StatId, state: GameState, ticketPrice: number): SourceContribution[] {
  const sources: SourceContribution[] = []
  const buildingContributions = new Map<string, { amount: number; count: number }>()

  // Collect building contributions
  for (const slot of Slot.getOccupied(state)) {
    if (!slot.buildingId) continue
    const building = Building.getById(slot.buildingId)
    if (!building) continue

    for (const effect of building.effects) {
      if (effect.statId === statId) {
        const existing = buildingContributions.get(slot.buildingId)
        if (existing) {
          existing.amount += effect.perDay
          existing.count++
        } else {
          buildingContributions.set(slot.buildingId, {
            amount: effect.perDay,
            count: 1,
          })
        }
      }
    }
  }

  // Add building sources
  for (const [buildingId, data] of buildingContributions) {
    const building = Building.getById(buildingId)
    if (building) {
      sources.push({
        emoji: building.emoji,
        name: building.name,
        amount: data.amount,
        count: data.count,
      })
    }
  }

  // Collect perk contributions
  for (const perkId of state.ownedPerks) {
    const perk = Perk.getById(perkId)
    if (!perk) continue

    for (const effect of perk.effects) {
      if (effect.statId === statId && effect.perDay) {
        sources.push({
          emoji: perk.emoji,
          name: perk.name,
          amount: effect.perDay,
        })
      }
    }
  }

  // Money: add guest income
  if (statId === 'money' && state.stats.guests > 0) {
    const income = Guest.calculateIncomeWithEntertainment(
      state.stats.guests,
      ticketPrice,
      state.stats.entertainment
    )
    if (income > 0) {
      sources.push({
        emoji: '🎟️',
        name: 'Ticket sales',
        amount: income,
      })
    }
  }

  // Guests: add arrival rate
  if (statId === 'guests') {
    const tempState = { ...state, ticketPrice } as GameState & { ticketPrice: number }
    const arrivalRate = Guest.calculateArrivalRate(tempState)
    if (arrivalRate > 0) {
      sources.push({
        emoji: '🚶',
        name: 'New visitors',
        amount: arrivalRate,
      })
    }
  }

  // Guests consume entertainment, food, comfort
  if (['entertainment', 'food', 'comfort'].includes(statId)) {
    const demand = Guest.DEMANDS.find((d) => d.statId === statId)
    if (demand && state.stats.guests > 0) {
      const consumption = -state.stats.guests * demand.perGuest
      sources.push({
        emoji: '👥',
        name: 'Guest usage',
        amount: consumption,
      })
    }
  }

  // Cleanliness decay from guests
  if (statId === 'cleanliness' && state.stats.guests > 0) {
    const consumption = -state.stats.guests * 0.1
    sources.push({
      emoji: '👥',
      name: 'Guest mess',
      amount: consumption,
    })
  }

  // Sort: positive first (highest), then negative (lowest impact first)
  return sources.sort((a, b) => {
    if (a.amount >= 0 && b.amount < 0) return -1
    if (a.amount < 0 && b.amount >= 0) return 1
    return b.amount - a.amount
  })
}

function getStatImpact(statId: StatId): string {
  switch (statId) {
    case 'money':
      return "Your park's cash. You need this to build things and pay upkeep. If you're in the red for 7 days straight, it's game over."
    case 'guests':
      return 'People visiting your park right now. Guests can be Happy, Neutral, or Unhappy based on how well you meet their needs. Unhappy guests may leave at the end of each day!'
    case 'entertainment':
      return "How much fun your park provides. Guests 'use up' entertainment as they enjoy rides. If there's not enough fun to go around, they get bored."
    case 'food':
      return "Food available for your guests. Hungry guests are grumpy guests! Make sure you have enough food stands for your crowd."
    case 'comfort':
      return 'How comfortable your park is. Restrooms, benches, and shade keep guests happy on long visits.'
    case 'cleanliness':
      return "How tidy your park is. Guests make messes as they walk around. Dirty parks make guests unhappy and hurt your park's reputation."
    case 'appeal':
      return "How attractive your park looks from outside. Higher appeal means more people want to visit. It's based on your entertainment, guest happiness, and cleanliness."
    case 'satisfaction':
      return "How happy your guests are right now. This depends on having enough fun, food, comfort, and keeping the park clean. Happy guests attract more visitors!"
  }
}

function getStatSuggestions(statId: StatId, state: GameState, moneyRate: number): string[] {
  const suggestions: string[] = []
  const availableBuildings = Building.getAvailable(state)
  const availablePerks = Perk.getAvailable(state)

  switch (statId) {
    case 'money':
      if (moneyRate < 0) {
        suggestions.push('You\'re losing money! Try demolishing buildings with high upkeep, or build more rides to attract guests.')
      }
      if (state.stats.guests < 10) {
        suggestions.push('More guests means more income. Focus on building entertainment to boost appeal.')
      }
      break

    case 'guests': {
      const breakdown = state.guestBreakdown ?? { happy: 0, neutral: 0, unhappy: 0 }
      const unhappyRatio = state.stats.guests > 0 ? breakdown.unhappy / state.stats.guests : 0

      if (state.stats.appeal < 30) {
        suggestions.push('Your appeal is low. Build some rides to make your park more attractive!')
      }
      if (unhappyRatio > 0.3) {
        suggestions.push('Too many unhappy guests! Improve entertainment, food, or comfort before they leave.')
      }
      if (state.stats.entertainment < state.stats.guests * 0.5) {
        suggestions.push('Guests need more entertainment. Add more rides to keep them happy!')
      }
      break
    }

    case 'entertainment': {
      const rides = availableBuildings.filter((b) => b.category === 'rides')
      if (rides.length > 0) {
        const affordable = rides.filter((b) => Building.canAfford(b, state))
        if (affordable.length > 0) {
          suggestions.push(`You can build a ${affordable[0].emoji} ${affordable[0].name} for more fun!`)
        } else {
          suggestions.push(`Save up for a ${rides[0].emoji} ${rides[0].name} (costs ${Format.money(rides[0].costs[0]?.amount ?? 0)})`)
        }
      }
      const demand = state.stats.guests * 0.5
      if (state.stats.entertainment < demand) {
        suggestions.push(`Your ${Math.floor(state.stats.guests)} guests need ${Math.ceil(demand)} entertainment, but you only have ${Math.floor(state.stats.entertainment)}.`)
      }
      break
    }

    case 'food': {
      const foodBuildings = availableBuildings.filter((b) => b.category === 'food')
      if (foodBuildings.length > 0) {
        const affordable = foodBuildings.filter((b) => Building.canAfford(b, state))
        if (affordable.length > 0) {
          suggestions.push(`Build a ${affordable[0].emoji} ${affordable[0].name} to feed your guests!`)
        }
      }
      const demand = state.stats.guests * 0.3
      if (state.stats.food < demand) {
        suggestions.push(`Your guests are hungry! You need ${Math.ceil(demand)} food but only have ${Math.floor(state.stats.food)}.`)
      }
      break
    }

    case 'comfort': {
      const hasRestroom = Slot.getOccupied(state).some((s) => s.buildingId === 'restroom')
      if (!hasRestroom) {
        suggestions.push('Build a 🚻 Restroom! It\'s cheap and provides lots of comfort.')
      }
      const facilities = availableBuildings.filter((b) => b.category === 'facilities')
      if (facilities.length > 0) {
        const affordable = facilities.filter((b) => Building.canAfford(b, state))
        if (affordable.length > 0 && affordable[0].id !== 'restroom') {
          suggestions.push(`A ${affordable[0].emoji} ${affordable[0].name} would help with comfort.`)
        }
      }
      break
    }

    case 'cleanliness': {
      const hasTrashCan = Slot.getOccupied(state).some((s) => s.buildingId === 'trash_can')
      if (!hasTrashCan && state.stats.cleanliness < 60) {
        suggestions.push('Add a 🗑️ Trash Can to help keep your park clean!')
      }
      const hasCleaningCrew = state.ownedPerks.includes('cleanliness_boost')
      if (!hasCleaningCrew && availablePerks.some((p) => p.id === 'cleanliness_boost')) {
        suggestions.push('The 🧹 Cleaning Crew perk gives passive cleanliness without taking a building slot.')
      }
      if (state.stats.guests > 20 && state.stats.cleanliness < 50) {
        suggestions.push('With this many guests, you might need multiple trash cans.')
      }
      break
    }

    case 'appeal':
      if (state.stats.entertainment < 20) {
        suggestions.push('Appeal comes mainly from entertainment. Build more rides!')
      }
      if (state.stats.satisfaction < 70) {
        suggestions.push('Happy guests boost appeal. Make sure their needs are met.')
      }
      if (state.stats.cleanliness < 50) {
        suggestions.push('A dirty park hurts your reputation. Add some trash cans!')
      }
      break

    case 'satisfaction':
      if (state.stats.entertainment < state.stats.guests * 0.5) {
        suggestions.push('Guests want more fun! Add rides to keep them entertained.')
      }
      if (state.stats.food < state.stats.guests * 0.3) {
        suggestions.push('Hungry guests are unhappy. Build more food options.')
      }
      if (state.stats.comfort < state.stats.guests * 0.2) {
        suggestions.push('Guests need to rest. Add benches or restrooms.')
      }
      break
  }

  return suggestions.slice(0, 2) // Max 2 suggestions
}

export function StatDetail({ statId }: StatDetailProps) {
  const stats = useGameStore((s) => s.stats)
  const rates = useGameStore((s) => s.rates)
  const slots = useGameStore((s) => s.slots)
  const ownedPerks = useGameStore((s) => s.ownedPerks)
  const ticketPrice = useGameStore((s) => s.ticketPrice)
  const guestBreakdown = useGameStore((s) => s.guestBreakdown)
  const config = STAT_CONFIGS[statId]
  const value = stats[statId]
  const rate = rates[statId]

  // Create a minimal state for helper functions
  const state: GameState = { slots, ownedPerks, stats, ticketPrice, guestBreakdown } as GameState

  const sources = useMemo(() => getStatSources(statId, state, ticketPrice), [statId, state, ticketPrice])
  const impact = getStatImpact(statId)
  const suggestions = useMemo(() => getStatSuggestions(statId, state, rates.money), [statId, state, rates.money])

  const positiveTotal = sources.filter((s) => s.amount > 0).reduce((sum, s) => sum + s.amount, 0)
  const negativeTotal = sources.filter((s) => s.amount < 0).reduce((sum, s) => sum + s.amount, 0)

  const totalGuests = GameTypes.getTotalGuests(guestBreakdown)

  return (
    <div className="space-y-4">
      {/* Guest Breakdown - only show for guests stat */}
      {statId === 'guests' && totalGuests > 0 && (
        <div className="p-3 rounded-xl bg-[var(--color-bg)]">
          <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Guest Mood
          </div>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-[#22c55e]/10">
              <Smile size={18} className="text-[#22c55e]" />
              <div>
                <div className="text-sm font-semibold">{Math.floor(guestBreakdown.happy)}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">Happy</div>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-[#fbbf24]/10">
              <Meh size={18} className="text-[#fbbf24]" />
              <div>
                <div className="text-sm font-semibold">{Math.floor(guestBreakdown.neutral)}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">Neutral</div>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-[#f87171]/10">
              <Frown size={18} className="text-[#f87171]" />
              <div>
                <div className="text-sm font-semibold">{Math.floor(guestBreakdown.unhappy)}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">Unhappy</div>
              </div>
            </div>
          </div>
          {guestBreakdown.unhappy > 0 && (
            <div className="mt-2 text-xs text-[var(--color-text-muted)]">
              ⚠️ Unhappy guests may leave at the end of each day
            </div>
          )}
        </div>
      )}

      {/* Current Value */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg)]">
        <div className="flex-1">
          <div className="text-2xl font-bold">{config.format(value)}</div>
          {rate !== 0 && (
            <div
              className="text-sm flex items-center gap-1"
              style={{ color: rate > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
            >
              {rate > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {config.formatRate(rate)}/day
            </div>
          )}
        </div>
        {rate !== 0 && (
          <div className="text-right text-xs text-[var(--color-text-muted)]">
            <div className="flex items-center gap-1 text-[var(--color-positive)]">
              <Plus size={10} />
              {positiveTotal.toFixed(1)}/day
            </div>
            <div className="flex items-center gap-1 text-[var(--color-negative)]">
              <Minus size={10} />
              {Math.abs(negativeTotal).toFixed(1)}/day
            </div>
          </div>
        )}
      </div>

      {/* Impact - Why it matters */}
      <div>
        <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
          Why it matters
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">{impact}</p>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div>
          <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Where it comes from
          </div>
          <div className="space-y-1">
            {sources.map((source, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--color-bg)]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{source.emoji}</span>
                  <span className="text-sm">{source.name}</span>
                  {source.count && source.count > 1 && (
                    <span className="text-xs text-[var(--color-text-muted)]">×{source.count}</span>
                  )}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: source.amount > 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                  }}
                >
                  {source.amount > 0 ? '+' : ''}
                  {source.amount.toFixed(1)}/day
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for no sources */}
      {sources.length === 0 && (
        <div className="p-3 rounded-xl bg-[var(--color-bg)] text-center">
          <div className="text-sm text-[var(--color-text-muted)]">
            Nothing is affecting this stat yet
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((suggestion, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20"
            >
              <div className="flex items-start gap-2">
                <Lightbulb size={14} className="text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warning for critical states */}
      {statId === 'money' && value < 0 && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">
              You're in debt! You have 7 days to get back to positive money or it's game over.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
