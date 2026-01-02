import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function StarlightMotelIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Neon star sign */}
      <rect x="6" y="0" width="4" height="1" fill={colors.food.secondary} />
      <rect x="5" y="1" width="6" height="1" fill={colors.food.primary} />
      <rect x="7" y="0" width="2" height="2" fill={colors.food.secondary} />

      {/* Roof */}
      <rect x="1" y="2" width="14" height="1" fill={colors.lodging.primary} />
      <rect x="1" y="3" width="14" height="1" fill={colors.lodging.accent} />

      {/* Building body */}
      <rect x="1" y="4" width="14" height="9" fill={colors.lodging.light} />

      {/* Room doors */}
      <rect x="2" y="5" width="3" height="5" fill={colors.lodging.primary} />
      <rect x="3" y="6" width="1" height="3" fill={colors.lodging.secondary} />
      <rect x="4" y="7" width="1" height="1" fill={colors.metal} />

      <rect x="6" y="5" width="3" height="5" fill={colors.lodging.primary} />
      <rect x="7" y="6" width="1" height="3" fill={colors.lodging.secondary} />
      <rect x="8" y="7" width="1" height="1" fill={colors.metal} />

      <rect x="10" y="5" width="3" height="5" fill={colors.lodging.primary} />
      <rect x="11" y="6" width="1" height="3" fill={colors.lodging.secondary} />
      <rect x="12" y="7" width="1" height="1" fill={colors.metal} />

      {/* Room numbers */}
      <rect x="3" y="5" width="1" height="1" fill={colors.food.secondary} />
      <rect x="7" y="5" width="1" height="1" fill={colors.food.secondary} />
      <rect x="11" y="5" width="1" height="1" fill={colors.food.secondary} />

      {/* Walkway */}
      <rect x="1" y="10" width="14" height="1" fill={colors.gray} />

      {/* Parking area */}
      <rect x="1" y="11" width="14" height="2" fill={colors.grayDark} />
      <rect x="2" y="11" width="3" height="2" fill={colors.facilities.primary} />
      <rect x="9" y="11" width="3" height="2" fill={colors.rides.dark} />

      {/* Ground */}
      <rect x="0" y="13" width="16" height="3" fill={colors.grayDark} />
    </IconBase>
  )
}
