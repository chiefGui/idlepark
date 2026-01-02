import { getBuildingIcon } from './index'
import type { BuildingIconProps } from './types'

type Props = BuildingIconProps & {
  buildingId: string
  fallback?: React.ReactNode
}

/**
 * Renders the pixel art icon for a building.
 * Falls back to a placeholder if the icon is not found.
 */
export function BuildingIcon({ buildingId, fallback, size = 32, ...props }: Props) {
  const Icon = getBuildingIcon(buildingId)

  if (!Icon) {
    if (fallback) {
      return <>{fallback}</>
    }
    // Default fallback - gray placeholder
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <rect x="2" y="2" width="12" height="12" fill="#9CA3AF" rx="2" />
        <text x="8" y="11" textAnchor="middle" fill="#fff" fontSize="8">?</text>
      </svg>
    )
  }

  return <Icon size={size} {...props} />
}
