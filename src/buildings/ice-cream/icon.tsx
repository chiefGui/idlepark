import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function IceCreamIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Ice cream cone sign on top */}
      <rect x="6" y="0" width="4" height="1" fill="#FFB6C1" />
      <rect x="7" y="1" width="2" height="1" fill="#FFB6C1" />
      <rect x="6" y="0" width="1" height="1" fill="#87CEEB" />
      <rect x="9" y="0" width="1" height="1" fill={colors.food.secondary} />

      {/* Awning - pink/white stripes */}
      <rect x="1" y="2" width="14" height="1" fill="#FFB6C1" />
      <rect x="1" y="3" width="2" height="1" fill={colors.white} />
      <rect x="3" y="3" width="2" height="1" fill="#FFB6C1" />
      <rect x="5" y="3" width="2" height="1" fill={colors.white} />
      <rect x="7" y="3" width="2" height="1" fill="#FFB6C1" />
      <rect x="9" y="3" width="2" height="1" fill={colors.white} />
      <rect x="11" y="3" width="2" height="1" fill="#FFB6C1" />
      <rect x="13" y="3" width="2" height="1" fill={colors.white} />

      {/* Shop body */}
      <rect x="2" y="4" width="12" height="8" fill={colors.white} />
      <rect x="2" y="4" width="1" height="8" fill="#FFB6C1" />
      <rect x="13" y="4" width="1" height="8" fill="#FFB6C1" />

      {/* Window/counter */}
      <rect x="3" y="5" width="10" height="5" fill="#87CEEB" />
      <rect x="4" y="6" width="8" height="3" fill={colors.food.light} />

      {/* Ice cream display - three cones */}
      <rect x="4" y="6" width="2" height="2" fill="#FFB6C1" />
      <rect x="5" y="5" width="1" height="1" fill="#FF69B4" />
      <rect x="7" y="6" width="2" height="2" fill="#98FB98" />
      <rect x="8" y="5" width="1" height="1" fill="#32CD32" />
      <rect x="10" y="6" width="2" height="2" fill={colors.food.secondary} />
      <rect x="11" y="5" width="1" height="1" fill={colors.food.primary} />

      {/* Counter */}
      <rect x="3" y="10" width="10" height="1" fill={colors.food.accent} />

      {/* Base */}
      <rect x="1" y="12" width="14" height="2" fill={colors.grayDark} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
