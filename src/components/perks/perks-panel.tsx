import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import { Panel } from '../ui/panel'
import { Button } from '../ui/button'
import { Perk } from '../../systems/perk'
import { useGameStore } from '../../store/game-store'

export function PerksPanel() {
  const state = useGameStore()
  const purchasePerk = useGameStore((s) => s.actions.purchasePerk)

  return (
    <Panel title="Perks">
      <div className="grid gap-3">
        {Perk.ALL.map((perk) => {
          const isOwned = Perk.isOwned(perk, state)
          const isUnlocked = Perk.isUnlocked(perk, state)
          const canAfford = Perk.canAfford(perk, state)
          const cost = perk.costs[0]

          return (
            <motion.div
              key={perk.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`
                p-3 rounded-xl border border-[var(--color-border)]
                ${isOwned ? 'bg-[var(--color-positive)]/10 border-[var(--color-positive)]/30' : ''}
                ${!isUnlocked ? 'opacity-40' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{perk.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{perk.name}</span>
                    {isOwned && (
                      <Check size={14} className="text-[var(--color-positive)]" />
                    )}
                    {!isUnlocked && (
                      <Lock size={14} className="text-[var(--color-text-muted)]" />
                    )}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {perk.description}
                  </div>
                </div>
                {!isOwned && isUnlocked && (
                  <Button
                    variant="secondary"
                    disabled={!canAfford}
                    onClick={() => purchasePerk(perk.id)}
                    className="text-xs px-3 py-1.5"
                  >
                    ${cost?.amount ?? 0}
                  </Button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </Panel>
  )
}
