import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function DropTowerIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Tower top spire */}
      <rect x="7" y="0" width="2" height="1" fill={colors.rides.accent} />
      <rect x="6" y="1" width="4" height="1" fill={colors.rides.primary} />

      {/* Main tower structure */}
      <rect x="5" y="2" width="1" height="12" fill={colors.metal} />
      <rect x="10" y="2" width="1" height="12" fill={colors.metal} />

      {/* Tower center/track */}
      <rect x="6" y="2" width="4" height="12" fill={colors.metalDark} />
      <rect x="7" y="2" width="2" height="12" fill={colors.gray} />

      {/* Cross beams */}
      <rect x="5" y="4" width="6" height="1" fill={colors.metal} />
      <rect x="5" y="7" width="6" height="1" fill={colors.metal} />
      <rect x="5" y="10" width="6" height="1" fill={colors.metal} />

      {/* Rider car (at top, about to drop) */}
      <rect x="6" y="2" width="4" height="2" fill={colors.rides.primary} />
      <rect x="6" y="3" width="1" height="1" fill={colors.black} />
      <rect x="9" y="3" width="1" height="1" fill={colors.black} />

      {/* Tower lights */}
      <rect x="4" y="1" width="1" height="1" fill={colors.rides.secondary} />
      <rect x="11" y="1" width="1" height="1" fill={colors.rides.secondary} />

      {/* Base platform */}
      <rect x="3" y="13" width="10" height="1" fill={colors.rides.dark} />
      <rect x="2" y="14" width="12" height="2" fill={colors.grayDark} />

      {/* Support beams */}
      <rect x="3" y="11" width="2" height="3" fill={colors.metalDark} />
      <rect x="11" y="11" width="2" height="3" fill={colors.metalDark} />
    </IconBase>
  )
}
