import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import { Perk } from '../../systems/perk'
import { useGameStore } from '../../store/game-store'
import { Requirements } from '../../engine/requirements'
import { Button } from '../ui/button'

export function PerksContent() {
  const state = useGameStore()
  const purchasePerk = useGameStore((s) => s.actions.purchasePerk)

  const owned = Perk.ALL.filter((p) => Perk.isOwned(p, state))
  const available = Perk.ALL.filter((p) => !Perk.isOwned(p, state) && Perk.isUnlocked(p, state))
  const locked = Perk.ALL.filter((p) => !Perk.isOwned(p, state) && !Perk.isUnlocked(p, state))

  return (
    <div className="space-y-6">
      {available.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Available
          </h3>
          <div className="space-y-2">
            {available.map((perk) => {
              const canAfford = Perk.canAfford(perk, state)
              const cost = perk.costs[0]

              return (
                <motion.div
                  key={perk.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{perk.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{perk.name}</div>
                      <div className="text-sm text-[var(--color-text-muted)] mb-3">
                        {perk.description}
                      </div>
                      <Button
                        variant={canAfford ? 'primary' : 'secondary'}
                        disabled={!canAfford}
                        onClick={() => purchasePerk(perk.id)}
                        className="w-full"
                      >
                        {canAfford ? `Buy for $${cost?.amount ?? 0}` : `Need $${cost?.amount ?? 0}`}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Locked
          </h3>
          <div className="space-y-2">
            {locked.map((perk) => {
              const unmetReqs = Requirements.getUnmetRequirements(perk.requirements, state)

              return (
                <motion.div
                  key={perk.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border)] opacity-60"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl grayscale">{perk.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{perk.name}</span>
                        <Lock size={14} className="text-[var(--color-text-muted)]" />
                      </div>
                      <div className="text-sm text-[var(--color-text-muted)] mb-2">
                        {perk.description}
                      </div>
                      <div className="text-xs text-[var(--color-warning)]">
                        Unlock: {unmetReqs.map((r) => Requirements.formatRequirement(r)).join(', ')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {owned.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Owned ({owned.length})
          </h3>
          <div className="space-y-2">
            {owned.map((perk) => (
              <motion.div
                key={perk.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{perk.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{perk.name}</div>
                    <div className="text-sm text-[var(--color-text-muted)]">
                      {perk.description}
                    </div>
                  </div>
                  <Check size={20} className="text-[var(--color-positive)]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
