import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function RecyclingCenterIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Recycling symbol on roof */}
      <rect x="5" y="0" width="6" height="3" fill={colors.decor.primary} />
      <rect x="6" y="0" width="1" height="1" fill={colors.white} />
      <rect x="9" y="0" width="1" height="1" fill={colors.white} />
      <rect x="7" y="1" width="2" height="1" fill={colors.white} />
      <rect x="6" y="2" width="1" height="1" fill={colors.white} />
      <rect x="9" y="2" width="1" height="1" fill={colors.white} />

      {/* Roof */}
      <rect x="1" y="3" width="14" height="1" fill={colors.decor.primary} />
      <rect x="2" y="4" width="12" height="1" fill={colors.decor.secondary} />

      {/* Building body */}
      <rect x="2" y="5" width="12" height="8" fill={colors.decor.light} />
      <rect x="2" y="5" width="1" height="8" fill={colors.decor.primary} />
      <rect x="13" y="5" width="1" height="8" fill={colors.decor.primary} />

      {/* Sorting bins */}
      <rect x="3" y="7" width="3" height="5" fill={colors.facilities.primary} />
      <rect x="4" y="8" width="1" height="3" fill={colors.facilities.secondary} />
      <rect x="6" y="7" width="3" height="5" fill={colors.decor.primary} />
      <rect x="7" y="8" width="1" height="3" fill={colors.decor.secondary} />
      <rect x="9" y="7" width="3" height="5" fill={colors.food.primary} />
      <rect x="10" y="8" width="1" height="3" fill={colors.food.secondary} />

      {/* Conveyor/loading area */}
      <rect x="3" y="6" width="9" height="1" fill={colors.metalDark} />

      {/* Base */}
      <rect x="1" y="13" width="14" height="1" fill={colors.grayDark} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
