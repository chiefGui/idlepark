import type { BuildingDef } from '../types'
export { GardenIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'garden',
  name: 'Garden',
  description: 'Pretty flowers and greenery',
  category: 'decor',
  costs: [{ statId: 'money', amount: 80 }],
  effects: [
    { statId: 'money', perDay: -2 },
    { statId: 'beauty', perDay: 5 },
    { statId: 'cleanliness', perDay: 2 },
  ],
  requirements: [],
}
