import type { BuildingDef } from '../types'
export { IceCreamIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'ice_cream',
  name: 'Ice Cream Shop',
  description: 'Sweet treats for everyone',
  category: 'food',
  costs: [{ statId: 'money', amount: 120 }],
  effects: [
    { statId: 'money', perDay: -4 },
    { statId: 'food', perDay: 15 },
    { statId: 'appeal', perDay: 5 },
  ],
  requirements: [],
}
