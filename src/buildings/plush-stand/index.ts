import type { ShopBuildingDef } from '../types'
export { PlushStandIcon as Icon } from './icon'

export const definition: ShopBuildingDef = {
  id: 'plush_stand',
  name: 'Plush Stand',
  description: 'Cuddly memories to take home',
  category: 'shops',
  costs: [{ statId: 'money', amount: 300 }],
  effects: [{ statId: 'money', perDay: -4 }],
  requirements: [{ type: 'perk', id: 'shops_1' }],
  incomePerGuest: 0.10,
  guestCap: 200,
}
