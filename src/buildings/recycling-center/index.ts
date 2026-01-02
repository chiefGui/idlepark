import type { BuildingDef } from '../types'
export { RecyclingCenterIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'recycling_center',
  name: 'Recycling Center',
  description: 'Eco-friendly waste management that guests love',
  category: 'facilities',
  costs: [{ statId: 'money', amount: 800 }],
  effects: [
    { statId: 'money', perDay: -15 },
    { statId: 'cleanliness', perDay: 50 },
    { statId: 'appeal', perDay: 8 },
  ],
  requirements: [{ type: 'perk', id: 'spotless_park' }],
}
