import type { ShopBuildingDef } from '../types'
export { ArcadeIcon as Icon } from './icon'

export const definition: ShopBuildingDef = {
  id: 'arcade',
  name: 'Arcade',
  description: 'Just one more game...',
  category: 'shops',
  costs: [{ statId: 'money', amount: 800 }],
  effects: [{ statId: 'money', perDay: -12 }],
  requirements: [{ type: 'perk', id: 'shops_1' }],
  incomePerGuest: 0.25,
  guestCap: 80,
}
