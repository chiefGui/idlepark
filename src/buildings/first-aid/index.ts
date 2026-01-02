import type { BuildingDef } from '../types'
export { FirstAidIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'first_aid',
  name: 'First Aid',
  description: 'Medical care for guests',
  category: 'facilities',
  costs: [{ statId: 'money', amount: 100 }],
  effects: [
    { statId: 'money', perDay: -4 },
    { statId: 'comfort', perDay: 20 },
    { statId: 'appeal', perDay: 3 },
    { statId: 'cleanliness', perDay: 5 },
  ],
  requirements: [],
}
