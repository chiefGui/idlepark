import type { BuildingDef } from '../types'
export { FoodStandIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'food_stand',
  name: 'Food Stand',
  description: 'Keeps guests fed and happy',
  category: 'food',
  costs: [{ statId: 'money', amount: 80 }],
  effects: [
    { statId: 'money', perDay: -3 },
    { statId: 'food', perDay: 15 },
  ],
  requirements: [],
}
