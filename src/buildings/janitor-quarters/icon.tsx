import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function JanitorQuartersIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Chimney */}
      <rect x="10" y="0" width="2" height="3" fill={colors.facilities.dark} />

      {/* Roof */}
      <rect x="3" y="2" width="10" height="1" fill={colors.facilities.primary} />
      <rect x="2" y="3" width="12" height="1" fill={colors.facilities.primary} />
      <rect x="1" y="4" width="14" height="1" fill={colors.facilities.accent} />

      {/* Building body */}
      <rect x="2" y="5" width="12" height="8" fill={colors.facilities.light} />

      {/* Windows */}
      <rect x="3" y="6" width="3" height="3" fill={colors.facilities.secondary} />
      <rect x="4" y="7" width="1" height="1" fill={colors.water} />
      <rect x="10" y="6" width="3" height="3" fill={colors.facilities.secondary} />
      <rect x="11" y="7" width="1" height="1" fill={colors.water} />

      {/* Door */}
      <rect x="6" y="7" width="4" height="6" fill={colors.facilities.primary} />
      <rect x="7" y="8" width="2" height="4" fill={colors.facilities.accent} />
      <rect x="9" y="10" width="1" height="1" fill={colors.metal} />

      {/* Broom leaning on side */}
      <rect x="14" y="6" width="1" height="7" fill={colors.lodging.wood} />
      <rect x="13" y="5" width="2" height="2" fill={colors.food.primary} />

      {/* Bucket by door */}
      <rect x="3" y="11" width="2" height="2" fill={colors.facilities.dark} />
      <rect x="3" y="11" width="2" height="1" fill={colors.water} />

      {/* Base */}
      <rect x="1" y="13" width="14" height="1" fill={colors.grayDark} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
