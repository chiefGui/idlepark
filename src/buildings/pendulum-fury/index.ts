import type { BuildingDef } from '../types'
export { PendulumFuryIcon as Icon } from './icon'

export const definition: BuildingDef = {
  id: 'pendulum_fury',
  name: 'Pendulum Fury',
  description: 'Swing to the edge of the sky',
  category: 'rides',
  costs: [{ statId: 'money', amount: 2500 }],
  effects: [
    { statId: 'money', perDay: -20 },
    { statId: 'entertainment', perDay: 75 },
    { statId: 'comfort', perDay: -8 },
  ],
  requirements: [{ type: 'perk', id: 'thrill_seekers' }],
}
