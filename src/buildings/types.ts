import type { BuildingCategory, Cost, Effect, Requirement, StatId } from '../engine/game-types'
import type { ComponentType, SVGProps } from 'react'

export type BuildingIconProps = SVGProps<SVGSVGElement> & {
  size?: number
}

export type BuildingIcon = ComponentType<BuildingIconProps>

export type BuildingDef = {
  id: string
  name: string
  description: string
  category: BuildingCategory
  costs: Cost[]
  effects: Effect[]
  requirements: Requirement[]
}

export type LodgingBuildingDef = BuildingDef & {
  capacityBonus: number
  lodgingTier: 1 | 2 | 3
}

export type ShopBuildingDef = BuildingDef & {
  incomePerGuest: number
  guestCap: number
}

export type BuildingModule = {
  definition: BuildingDef | LodgingBuildingDef | ShopBuildingDef
  Icon: BuildingIcon
}

export type DisplayEffect = {
  statId: StatId | 'capacity' | 'income'
  value: number
  isPositive: boolean
  perGuest?: number
  guestCap?: number
}
