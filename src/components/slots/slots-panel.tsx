import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Panel } from '../ui/panel'
import { SlotCard } from './slot-card'
import { BuildingSelector } from './building-selector'
import { useGameStore } from '../../store/game-store'

export function SlotsPanel() {
  const slots = useGameStore((s) => s.slots)
  const demolishSlot = useGameStore((s) => s.actions.demolishSlot)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)

  const unlockedCount = slots.filter((s) => !s.locked).length
  const totalCount = slots.length

  return (
    <>
      <Panel title={`Building Slots (${unlockedCount}/${totalCount})`}>
        <div className="grid grid-cols-4 gap-3">
          {slots.map((slot) => (
            <SlotCard
              key={slot.index}
              slot={slot}
              onBuild={() => setSelectedSlot(slot.index)}
              onDemolish={() => demolishSlot(slot.index)}
            />
          ))}
        </div>
      </Panel>

      <AnimatePresence>
        {selectedSlot !== null && (
          <BuildingSelector
            slotIndex={selectedSlot}
            onClose={() => setSelectedSlot(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
