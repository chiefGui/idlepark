import type { BuildingDef } from '../types'
export { JanitorQuartersIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'janitor_quarters',
  name: 'Janitor Quarters',
  description: 'Home base for your dedicated cleaning crew',
  category: 'facilities',
  costs: [{ statId: 'money', amount: 350 }],
  effects: [
    { statId: 'money', perDay: -8 },
    { statId: 'cleanliness', perDay: 30 },
    { statId: 'comfort', perDay: 5 },
  ],
  requirements: [{ type: 'perk', id: 'spotless_park' }],
}
