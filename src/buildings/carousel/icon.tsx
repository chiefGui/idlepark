import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function CarouselIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Roof/canopy - striped tent top */}
      <rect x="2" y="1" width="12" height="1" fill={colors.rides.primary} />
      <rect x="3" y="2" width="10" height="1" fill={colors.rides.secondary} />
      <rect x="4" y="3" width="8" height="1" fill={colors.rides.primary} />
      <rect x="5" y="4" width="6" height="1" fill={colors.rides.secondary} />
      <rect x="6" y="5" width="4" height="1" fill={colors.rides.accent} />

      {/* Center pole top ornament */}
      <rect x="7" y="0" width="2" height="1" fill={colors.rides.accent} />

      {/* Main platform */}
      <rect x="2" y="11" width="12" height="2" fill={colors.rides.dark} />
      <rect x="3" y="10" width="10" height="1" fill={colors.rides.primary} />

      {/* Center pole */}
      <rect x="7" y="6" width="2" height="4" fill={colors.metal} />

      {/* Horses (simplified) */}
      <rect x="3" y="7" width="2" height="3" fill={colors.white} />
      <rect x="3" y="6" width="1" height="1" fill={colors.white} />
      <rect x="11" y="7" width="2" height="3" fill={colors.rides.accent} />
      <rect x="12" y="6" width="1" height="1" fill={colors.rides.accent} />

      {/* Poles for horses */}
      <rect x="4" y="5" width="1" height="5" fill={colors.metalDark} />
      <rect x="11" y="5" width="1" height="5" fill={colors.metalDark} />

      {/* Base/ground */}
      <rect x="1" y="13" width="14" height="2" fill={colors.grayDark} />
      <rect x="4" y="14" width="8" height="1" fill={colors.gray} />
    </IconBase>
  )
}
