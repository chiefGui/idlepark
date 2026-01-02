import type { BuildingDef } from '../types'
export { CleaningCartIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'cleaning_cart',
  name: 'Cleaning Cart',
  description: 'Mobile supplies for on-the-go tidying',
  category: 'facilities',
  costs: [{ statId: 'money', amount: 120 }],
  effects: [
    { statId: 'money', perDay: -3 },
    { statId: 'cleanliness', perDay: 15 },
  ],
  requirements: [{ type: 'perk', id: 'spotless_park' }],
}
