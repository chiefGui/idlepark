import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function InfoBoothIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* "i" sign on top */}
      <rect x="6" y="0" width="4" height="4" fill={colors.facilities.primary} />
      <rect x="7" y="1" width="2" height="1" fill={colors.white} />
      <rect x="7" y="2" width="2" height="2" fill={colors.white} />

      {/* Umbrella/canopy roof */}
      <rect x="1" y="4" width="14" height="1" fill={colors.facilities.secondary} />
      <rect x="2" y="5" width="12" height="1" fill={colors.facilities.primary} />
      <rect x="3" y="6" width="10" height="1" fill={colors.facilities.accent} />

      {/* Booth body - octagonal kiosk style */}
      <rect x="4" y="7" width="8" height="6" fill={colors.facilities.light} />
      <rect x="3" y="8" width="1" height="4" fill={colors.facilities.light} />
      <rect x="12" y="8" width="1" height="4" fill={colors.facilities.light} />

      {/* Windows */}
      <rect x="5" y="8" width="2" height="3" fill={colors.facilities.primary} />
      <rect x="9" y="8" width="2" height="3" fill={colors.facilities.primary} />

      {/* Counter */}
      <rect x="4" y="11" width="8" height="1" fill={colors.facilities.accent} />

      {/* Maps/brochures visible */}
      <rect x="6" y="8" width="1" height="2" fill={colors.food.secondary} />
      <rect x="7" y="8" width="1" height="2" fill={colors.decor.primary} />
      <rect x="8" y="8" width="1" height="2" fill={colors.rides.secondary} />

      {/* Base */}
      <rect x="3" y="12" width="10" height="1" fill={colors.grayDark} />

      {/* Ground */}
      <rect x="0" y="13" width="16" height="3" fill={colors.grayDark} />
    </IconBase>
  )
}
