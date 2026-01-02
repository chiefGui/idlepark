import type { ShopBuildingDef } from '../types'
export { GiftShopIcon as Icon } from './icon'

export const definition: ShopBuildingDef = {
  id: 'gift_shop',
  name: 'Gift Shop',
  description: 'Everyone wants a souvenir',
  category: 'shops',
  costs: [{ statId: 'money', amount: 500 }],
  effects: [{ statId: 'money', perDay: -8 }],
  requirements: [{ type: 'perk', id: 'shops_1' }],
  incomePerGuest: 0.15,
  guestCap: 150,
}
