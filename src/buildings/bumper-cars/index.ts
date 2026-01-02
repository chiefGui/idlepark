import type { BuildingDef } from '../types'
export { BumperCarsIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'bumper_cars',
  name: 'Bumper Cars',
  description: 'Crash into friends safely',
  category: 'rides',
  costs: [{ statId: 'money', amount: 180 }],
  effects: [
    { statId: 'money', perDay: -6 },
    { statId: 'entertainment', perDay: 30 },
  ],
  requirements: [],
}
