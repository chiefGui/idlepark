import type { BuildingDef } from '../types'
export { CarouselIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'carousel',
  name: 'Carousel',
  description: 'A classic ride that guests love',
  category: 'rides',
  costs: [{ statId: 'money', amount: 100 }],
  effects: [
    { statId: 'money', perDay: -5 },
    { statId: 'entertainment', perDay: 20 },
  ],
  requirements: [],
}
