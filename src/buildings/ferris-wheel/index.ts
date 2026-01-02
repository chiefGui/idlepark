import type { BuildingDef } from '../types'
export { FerrisWheelIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'ferris_wheel',
  name: 'Ferris Wheel',
  description: 'A scenic ride with great views',
  category: 'rides',
  costs: [{ statId: 'money', amount: 350 }],
  effects: [
    { statId: 'money', perDay: -12 },
    { statId: 'entertainment', perDay: 45 },
    { statId: 'appeal', perDay: 4 },
  ],
  requirements: [],
}
