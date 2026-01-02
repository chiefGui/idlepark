import type { ShopBuildingDef } from '../types'
export { CarnivalGamesIcon as Icon } from './icon'

export const definition: ShopBuildingDef = {
  id: 'carnival_games',
  name: 'Carnival Games',
  description: 'Step right up and win a prize!',
  category: 'shops',
  costs: [{ statId: 'money', amount: 400 }],
  effects: [{ statId: 'money', perDay: -5 }],
  requirements: [{ type: 'perk', id: 'shops_1' }],
  incomePerGuest: 0.20,
  guestCap: 100,
}
