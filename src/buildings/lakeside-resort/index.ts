import type { LodgingBuildingDef } from '../types'
export { LakesideResortIcon as Icon } from './icon'

export const definition: LodgingBuildingDef = {
  id: 'lakeside_resort',
  name: 'Lakeside Resort',
  description: 'Luxurious waterfront with activities',
  category: 'lodging',
  costs: [{ statId: 'money', amount: 20000 }],
  effects: [
    { statId: 'money', perDay: -60 },
    { statId: 'beauty', perDay: 8 },
    { statId: 'entertainment', perDay: 20 },
  ],
  requirements: [{ type: 'perk', id: 'lodging_3' }],
  capacityBonus: 250,
  lodgingTier: 3,
}
