import type { BuildingDef } from '../types'
export { InfoBoothIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'info_booth',
  name: 'Info Booth',
  description: 'Helps guests navigate',
  category: 'facilities',
  costs: [{ statId: 'money', amount: 40 }],
  effects: [
    { statId: 'money', perDay: -1 },
    { statId: 'appeal', perDay: 5 },
  ],
  requirements: [],
}
