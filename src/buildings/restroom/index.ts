import type { BuildingDef } from '../types'
export { RestroomIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'restroom',
  name: 'Restroom',
  description: 'Essential for guest comfort',
  category: 'facilities',
  costs: [{ statId: 'money', amount: 60 }],
  effects: [
    { statId: 'money', perDay: -2 },
    { statId: 'comfort', perDay: 25 },
  ],
  requirements: [],
}
