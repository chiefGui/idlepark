import type { BuildingDef } from '../types'
export { DropTowerIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'drop_tower',
  name: 'Drop Tower',
  description: 'The ground rushes up to meet you',
  category: 'rides',
  costs: [{ statId: 'money', amount: 3000 }],
  effects: [
    { statId: 'money', perDay: -25 },
    { statId: 'entertainment', perDay: 100 },
    { statId: 'comfort', perDay: -5 },
    { statId: 'appeal', perDay: 5 },
  ],
  requirements: [{ type: 'perk', id: 'thrill_seekers' }],
}
