import type { BuildingDef } from '../types'
export { RapidsRunIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'rapids_run',
  name: 'Rapids Run',
  description: 'Hold on tight—you WILL get soaked',
  category: 'rides',
  costs: [{ statId: 'money', amount: 3500 }],
  effects: [
    { statId: 'money', perDay: -30 },
    { statId: 'entertainment', perDay: 90 },
    { statId: 'cleanliness', perDay: 10 },
    { statId: 'comfort', perDay: 5 },
  ],
  requirements: [{ type: 'perk', id: 'thrill_seekers' }],
}
