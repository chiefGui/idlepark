import type { BuildingDef } from '../types'
export { RollerCoasterIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'roller_coaster',
  name: 'Roller Coaster',
  description: 'The ultimate thrill ride',
  category: 'rides',
  costs: [{ statId: 'money', amount: 500 }],
  effects: [
    { statId: 'money', perDay: -15 },
    { statId: 'entertainment', perDay: 80 },
  ],
  requirements: [],
}
