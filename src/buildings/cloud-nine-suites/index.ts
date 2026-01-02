import type { LodgingBuildingDef } from '../types'
export { CloudNineSuitesIcon as Icon } from './icon'

export const definition: LodgingBuildingDef = {
  id: 'cloud_nine_suites',
  name: 'Cloud Nine Suites',
  description: 'Ultra-premium spa and luxury amenities',
  category: 'lodging',
  costs: [{ statId: 'money', amount: 30000 }],
  effects: [
    { statId: 'money', perDay: -80 },
    { statId: 'beauty', perDay: 15 },
    { statId: 'comfort', perDay: 25 },
  ],
  requirements: [{ type: 'perk', id: 'lodging_3' }],
  capacityBonus: 200,
  lodgingTier: 3,
}
