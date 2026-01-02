import type { BuildingDef } from '../types'
export { PizzaParlorIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'pizza_parlor',
  name: 'Pizza Parlor',
  description: 'Everyone loves pizza',
  category: 'food',
  costs: [{ statId: 'money', amount: 150 }],
  effects: [
    { statId: 'money', perDay: -5 },
    { statId: 'food', perDay: 25 },
  ],
  requirements: [],
}
