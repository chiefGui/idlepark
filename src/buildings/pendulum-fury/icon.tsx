import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function PendulumFuryIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Support structure - A-frame */}
      <rect x="2" y="1" width="2" height="1" fill={colors.metalDark} />
      <rect x="12" y="1" width="2" height="1" fill={colors.metalDark} />
      <rect x="3" y="2" width="1" height="3" fill={colors.metalDark} />
      <rect x="12" y="2" width="1" height="3" fill={colors.metalDark} />
      <rect x="4" y="5" width="1" height="3" fill={colors.metalDark} />
      <rect x="11" y="5" width="1" height="3" fill={colors.metalDark} />
      <rect x="5" y="8" width="1" height="3" fill={colors.metalDark} />
      <rect x="10" y="8" width="1" height="3" fill={colors.metalDark} />
      <rect x="6" y="11" width="1" height="3" fill={colors.metalDark} />
      <rect x="9" y="11" width="1" height="3" fill={colors.metalDark} />

      {/* Top pivot bar */}
      <rect x="5" y="0" width="6" height="2" fill={colors.metal} />
      <rect x="7" y="0" width="2" height="1" fill={colors.rides.accent} />

      {/* Pendulum arm (at an angle, swinging) */}
      <rect x="7" y="2" width="2" height="2" fill={colors.gray} />
      <rect x="6" y="4" width="2" height="2" fill={colors.gray} />
      <rect x="5" y="6" width="2" height="2" fill={colors.gray} />
      <rect x="4" y="8" width="2" height="2" fill={colors.gray} />

      {/* Gondola/rider section at bottom */}
      <rect x="2" y="9" width="6" height="3" fill={colors.rides.primary} />
      <rect x="1" y="10" width="1" height="2" fill={colors.rides.primary} />
      <rect x="8" y="10" width="1" height="2" fill={colors.rides.primary} />
      <rect x="3" y="9" width="1" height="1" fill={colors.rides.secondary} />
      <rect x="5" y="9" width="1" height="1" fill={colors.rides.secondary} />
      <rect x="7" y="9" width="1" height="1" fill={colors.rides.secondary} />

      {/* Rider silhouettes */}
      <rect x="3" y="10" width="1" height="1" fill={colors.black} />
      <rect x="5" y="10" width="1" height="1" fill={colors.black} />

      {/* Ground/platform */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
      <rect x="6" y="13" width="4" height="1" fill={colors.gray} />
    </IconBase>
  )
}
