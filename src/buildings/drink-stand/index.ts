import type { BuildingDef } from '../types'
export { DrinkStandIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'drink_stand',
  name: 'Drink Stand',
  description: 'Refreshing beverages',
  category: 'food',
  costs: [{ statId: 'money', amount: 60 }],
  effects: [
    { statId: 'money', perDay: -2 },
    { statId: 'food', perDay: 8 },
    { statId: 'comfort', perDay: 3 },
  ],
  requirements: [],
}
