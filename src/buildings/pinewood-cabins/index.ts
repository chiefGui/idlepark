import type { LodgingBuildingDef } from '../types'
export { PinewoodCabinsIcon as Icon } from './icon'

export const definition: LodgingBuildingDef = {
  id: 'pinewood_cabins',
  name: 'Pinewood Cabins',
  description: 'Charming woodland retreats',
  category: 'lodging',
  costs: [{ statId: 'money', amount: 5000 }],
  effects: [
    { statId: 'money', perDay: -20 },
    { statId: 'beauty', perDay: 3 },
    { statId: 'comfort', perDay: 10 },
  ],
  requirements: [{ type: 'perk', id: 'lodging_2' }],
  capacityBonus: 100,
  lodgingTier: 2,
}
