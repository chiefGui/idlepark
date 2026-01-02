import type { BuildingDef } from '../types'
export { FountainIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'fountain',
  name: 'Fountain',
  description: 'A beautiful centerpiece',
  category: 'decor',
  costs: [{ statId: 'money', amount: 150 }],
  effects: [
    { statId: 'money', perDay: -3 },
    { statId: 'beauty', perDay: 10 },
  ],
  requirements: [],
}
