import type { BuildingDef } from '../types'
export { BenchIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'bench',
  name: 'Bench',
  description: 'A place to rest tired feet',
  category: 'decor',
  costs: [{ statId: 'money', amount: 25 }],
  effects: [
    { statId: 'money', perDay: -1 },
    { statId: 'beauty', perDay: 2 },
    { statId: 'comfort', perDay: 8 },
  ],
  requirements: [],
}
