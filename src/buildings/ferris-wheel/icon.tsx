import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function FerrisWheelIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Main wheel rim */}
      <rect x="4" y="1" width="8" height="1" fill={colors.rides.primary} />
      <rect x="2" y="2" width="2" height="1" fill={colors.rides.primary} />
      <rect x="12" y="2" width="2" height="1" fill={colors.rides.primary} />
      <rect x="1" y="3" width="1" height="2" fill={colors.rides.primary} />
      <rect x="14" y="3" width="1" height="2" fill={colors.rides.primary} />
      <rect x="1" y="5" width="1" height="4" fill={colors.rides.primary} />
      <rect x="14" y="5" width="1" height="4" fill={colors.rides.primary} />
      <rect x="1" y="9" width="1" height="2" fill={colors.rides.primary} />
      <rect x="14" y="9" width="1" height="2" fill={colors.rides.primary} />
      <rect x="2" y="11" width="2" height="1" fill={colors.rides.primary} />
      <rect x="12" y="11" width="2" height="1" fill={colors.rides.primary} />
      <rect x="4" y="12" width="8" height="1" fill={colors.rides.primary} />

      {/* Center hub */}
      <rect x="7" y="6" width="2" height="2" fill={colors.rides.accent} />

      {/* Spokes */}
      <rect x="7" y="2" width="2" height="4" fill={colors.metal} />
      <rect x="7" y="8" width="2" height="4" fill={colors.metal} />
      <rect x="2" y="6" width="5" height="2" fill={colors.metal} />
      <rect x="9" y="6" width="5" height="2" fill={colors.metal} />

      {/* Gondolas/cabins */}
      <rect x="7" y="0" width="2" height="2" fill={colors.rides.secondary} />
      <rect x="7" y="12" width="2" height="2" fill={colors.rides.secondary} />
      <rect x="0" y="6" width="2" height="2" fill={colors.rides.secondary} />
      <rect x="14" y="6" width="2" height="2" fill={colors.rides.secondary} />

      {/* Support structure */}
      <rect x="5" y="13" width="2" height="2" fill={colors.metalDark} />
      <rect x="9" y="13" width="2" height="2" fill={colors.metalDark} />
      <rect x="6" y="14" width="4" height="1" fill={colors.gray} />
    </IconBase>
  )
}
