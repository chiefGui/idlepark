import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function RollerCoasterIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Track - curved hill shape */}
      <rect x="0" y="10" width="2" height="1" fill={colors.rides.dark} />
      <rect x="2" y="9" width="1" height="1" fill={colors.rides.dark} />
      <rect x="3" y="8" width="1" height="1" fill={colors.rides.dark} />
      <rect x="4" y="7" width="1" height="1" fill={colors.rides.dark} />
      <rect x="5" y="5" width="1" height="2" fill={colors.rides.dark} />
      <rect x="6" y="3" width="1" height="2" fill={colors.rides.dark} />
      <rect x="7" y="2" width="2" height="1" fill={colors.rides.dark} />
      <rect x="9" y="3" width="1" height="2" fill={colors.rides.dark} />
      <rect x="10" y="5" width="1" height="2" fill={colors.rides.dark} />
      <rect x="11" y="7" width="1" height="1" fill={colors.rides.dark} />
      <rect x="12" y="8" width="1" height="1" fill={colors.rides.dark} />
      <rect x="13" y="9" width="1" height="1" fill={colors.rides.dark} />
      <rect x="14" y="10" width="2" height="1" fill={colors.rides.dark} />

      {/* Track rails (lighter) */}
      <rect x="0" y="9" width="2" height="1" fill={colors.rides.primary} />
      <rect x="2" y="8" width="1" height="1" fill={colors.rides.primary} />
      <rect x="3" y="7" width="1" height="1" fill={colors.rides.primary} />
      <rect x="4" y="6" width="1" height="1" fill={colors.rides.primary} />
      <rect x="5" y="4" width="1" height="2" fill={colors.rides.primary} />
      <rect x="6" y="2" width="1" height="2" fill={colors.rides.primary} />
      <rect x="7" y="1" width="2" height="1" fill={colors.rides.primary} />
      <rect x="9" y="2" width="1" height="2" fill={colors.rides.primary} />
      <rect x="10" y="4" width="1" height="2" fill={colors.rides.primary} />
      <rect x="11" y="6" width="1" height="1" fill={colors.rides.primary} />
      <rect x="12" y="7" width="1" height="1" fill={colors.rides.primary} />
      <rect x="13" y="8" width="1" height="1" fill={colors.rides.primary} />
      <rect x="14" y="9" width="2" height="1" fill={colors.rides.primary} />

      {/* Support pillars */}
      <rect x="3" y="9" width="1" height="5" fill={colors.metalDark} />
      <rect x="7" y="3" width="1" height="11" fill={colors.metalDark} />
      <rect x="12" y="9" width="1" height="5" fill={colors.metalDark} />

      {/* Coaster cart on top */}
      <rect x="6" y="0" width="4" height="2" fill={colors.rides.secondary} />
      <rect x="6" y="0" width="1" height="1" fill={colors.rides.accent} />
      <rect x="9" y="0" width="1" height="1" fill={colors.rides.accent} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
