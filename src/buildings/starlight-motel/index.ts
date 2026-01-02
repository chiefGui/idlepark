import type { LodgingBuildingDef } from '../types'
export { StarlightMotelIcon as Icon } from './icon'

export const definition: LodgingBuildingDef = {
  id: 'starlight_motel',
  name: 'Starlight Motel',
  description: 'Cozy roadside rooms with retro charm',
  category: 'lodging',
  costs: [{ statId: 'money', amount: 2000 }],
  effects: [
    { statId: 'money', perDay: -10 },
    { statId: 'entertainment', perDay: 8 },
  ],
  requirements: [{ type: 'perk', id: 'lodging_1' }],
  capacityBonus: 75,
  lodgingTier: 1,
}
