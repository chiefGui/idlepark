import type { LodgingBuildingDef } from '../types'
export { ParkviewInnIcon as Icon } from './icon'

export const definition: LodgingBuildingDef = {
  id: 'parkview_inn',
  name: 'Parkview Inn',
  description: 'Comfortable family hotel with on-site dining',
  category: 'lodging',
  costs: [{ statId: 'money', amount: 8000 }],
  effects: [
    { statId: 'money', perDay: -30 },
    { statId: 'beauty', perDay: 2 },
    { statId: 'food', perDay: 12 },
  ],
  requirements: [{ type: 'perk', id: 'lodging_2' }],
  capacityBonus: 150,
  lodgingTier: 2,
}
