import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function FirstAidIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Cross sign on top */}
      <rect x="6" y="0" width="4" height="3" fill={colors.white} />
      <rect x="7" y="0" width="2" height="3" fill={colors.rides.primary} />
      <rect x="6" y="1" width="4" height="1" fill={colors.rides.primary} />

      {/* Roof */}
      <rect x="2" y="3" width="12" height="1" fill={colors.rides.primary} />
      <rect x="1" y="4" width="14" height="1" fill={colors.white} />

      {/* Building body */}
      <rect x="2" y="5" width="12" height="8" fill={colors.white} />
      <rect x="2" y="5" width="1" height="8" fill={colors.rides.primary} />
      <rect x="13" y="5" width="1" height="8" fill={colors.rides.primary} />

      {/* Window with cross */}
      <rect x="4" y="6" width="8" height="5" fill={colors.facilities.light} />
      <rect x="7" y="6" width="2" height="5" fill={colors.rides.primary} />
      <rect x="4" y="8" width="8" height="1" fill={colors.rides.primary} />

      {/* Door */}
      <rect x="6" y="10" width="4" height="3" fill={colors.facilities.primary} />
      <rect x="9" y="11" width="1" height="1" fill={colors.metal} />

      {/* Base */}
      <rect x="1" y="13" width="14" height="1" fill={colors.grayDark} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
