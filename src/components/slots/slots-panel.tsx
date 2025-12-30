import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Panel } from '../ui/panel'
import { SlotCard } from './slot-card'
import { BuildingSelector } from './building-selector'
import { BuildingDetails } from './building-details'
import { useGameStore } from '../../store/game-store'
import { Building } from '../../systems/building'

export function SlotsPanel() {
  const slots = useGameStore((s) => s.slots)
  const demolishSlot = useGameStore((s) => s.actions.demolishSlot)
  const [buildSlotIndex, setBuildSlotIndex] = useState<number | null>(null)
  const [detailsSlotIndex, setDetailsSlotIndex] = useState<number | null>(null)

  const unlockedCount = slots.filter((s) => !s.locked).length
  const totalCount = slots.length

  const selectedSlot = detailsSlotIndex !== null ? slots[detailsSlotIndex] : null
  const selectedBuilding = selectedSlot?.buildingId
    ? Building.getById(selectedSlot.buildingId)
    : null

  const handleDemolish = () => {
    if (detailsSlotIndex !== null) {
      demolishSlot(detailsSlotIndex)
    }
  }

  return (
    <>
      <Panel title={`Building Slots (${unlockedCount}/${totalCount})`}>
        <div className="grid grid-cols-4 gap-3">
          {slots.map((slot) => (
            <SlotCard
              key={slot.index}
              slot={slot}
              onBuild={() => setBuildSlotIndex(slot.index)}
              onSelect={() => setDetailsSlotIndex(slot.index)}
            />
          ))}
        </div>
      </Panel>

      <AnimatePresence>
        {buildSlotIndex !== null && (
          <BuildingSelector
            slotIndex={buildSlotIndex}
            onClose={() => setBuildSlotIndex(null)}
          />
        )}
      </AnimatePresence>

      <BuildingDetails
        building={selectedBuilding ?? null}
        onClose={() => setDetailsSlotIndex(null)}
        onDemolish={handleDemolish}
      />
    </>
  )
}
