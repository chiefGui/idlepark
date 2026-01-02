import type { BuildingDef } from '../types'
export { TrashCanIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'trash_can',
  name: 'Trash Can',
  description: 'Helps keep the park clean',
  category: 'facilities',
  costs: [{ statId: 'money', amount: 20 }],
  effects: [
    { statId: 'money', perDay: -1 },
    { statId: 'cleanliness', perDay: 5 },
  ],
  requirements: [],
}
