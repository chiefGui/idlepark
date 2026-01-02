import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function BumperCarsIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Arena ceiling with lights */}
      <rect x="1" y="0" width="14" height="2" fill={colors.rides.dark} />
      <rect x="3" y="1" width="2" height="1" fill={colors.rides.accent} />
      <rect x="7" y="1" width="2" height="1" fill={colors.rides.accent} />
      <rect x="11" y="1" width="2" height="1" fill={colors.rides.accent} />

      {/* Power grid lines */}
      <rect x="2" y="2" width="1" height="4" fill={colors.metalDark} />
      <rect x="7" y="2" width="1" height="4" fill={colors.metalDark} />
      <rect x="13" y="2" width="1" height="4" fill={colors.metalDark} />

      {/* Bumper car 1 (left) - red */}
      <rect x="1" y="7" width="5" height="3" fill={colors.rides.primary} />
      <rect x="2" y="6" width="3" height="1" fill={colors.rides.primary} />
      <rect x="3" y="5" width="1" height="1" fill={colors.black} />
      <rect x="1" y="10" width="1" height="1" fill={colors.gray} />
      <rect x="5" y="10" width="1" height="1" fill={colors.gray} />
      <rect x="2" y="8" width="1" height="1" fill={colors.rides.accent} />

      {/* Bumper car 2 (right) - blue */}
      <rect x="10" y="8" width="5" height="3" fill={colors.facilities.primary} />
      <rect x="11" y="7" width="3" height="1" fill={colors.facilities.primary} />
      <rect x="12" y="6" width="1" height="1" fill={colors.black} />
      <rect x="10" y="11" width="1" height="1" fill={colors.gray} />
      <rect x="14" y="11" width="1" height="1" fill={colors.gray} />
      <rect x="13" y="9" width="1" height="1" fill={colors.rides.accent} />

      {/* Antenna poles */}
      <rect x="3" y="3" width="1" height="3" fill={colors.metal} />
      <rect x="12" y="4" width="1" height="3" fill={colors.metal} />

      {/* Floor/arena */}
      <rect x="0" y="12" width="16" height="2" fill={colors.grayDark} />
      <rect x="1" y="12" width="14" height="1" fill={colors.gray} />

      {/* Arena walls */}
      <rect x="0" y="5" width="1" height="7" fill={colors.rides.dark} />
      <rect x="15" y="5" width="1" height="7" fill={colors.rides.dark} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
