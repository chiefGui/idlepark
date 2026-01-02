import type { LodgingBuildingDef } from '../types'
export { CampgroundIcon as Icon } from './icon'

export const definition: LodgingBuildingDef = {
  id: 'campground',
  name: 'Campground',
  description: 'Rustic tent sites under the stars',
  category: 'lodging',
  costs: [{ statId: 'money', amount: 1000 }],
  effects: [
    { statId: 'money', perDay: -5 },
    { statId: 'comfort', perDay: 5 },
  ],
  requirements: [{ type: 'perk', id: 'lodging_1' }],
  capacityBonus: 50,
  lodgingTier: 1,
}
