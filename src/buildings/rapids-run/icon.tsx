import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function RapidsRunIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Water splash at top */}
      <rect x="5" y="0" width="1" height="1" fill={colors.water} />
      <rect x="8" y="0" width="1" height="1" fill={colors.water} />
      <rect x="10" y="0" width="1" height="1" fill={colors.water} />
      <rect x="4" y="1" width="2" height="1" fill={colors.water} />
      <rect x="9" y="1" width="2" height="1" fill={colors.water} />

      {/* Water channel - curved drop */}
      <rect x="1" y="6" width="3" height="2" fill={colors.waterDark} />
      <rect x="4" y="5" width="2" height="2" fill={colors.waterDark} />
      <rect x="6" y="4" width="2" height="2" fill={colors.waterDark} />
      <rect x="8" y="3" width="2" height="2" fill={colors.waterDark} />
      <rect x="10" y="2" width="3" height="2" fill={colors.waterDark} />
      <rect x="13" y="3" width="2" height="2" fill={colors.waterDark} />

      {/* Raft with riders */}
      <rect x="5" y="2" width="4" height="2" fill={colors.rides.secondary} />
      <rect x="6" y="1" width="2" height="1" fill={colors.black} />
      <rect x="5" y="3" width="1" height="1" fill={colors.rides.primary} />
      <rect x="8" y="3" width="1" height="1" fill={colors.rides.primary} />

      {/* Channel walls/structure */}
      <rect x="0" y="5" width="1" height="4" fill={colors.rides.dark} />
      <rect x="1" y="8" width="1" height="2" fill={colors.rides.dark} />
      <rect x="14" y="1" width="1" height="4" fill={colors.rides.dark} />

      {/* Pool at bottom */}
      <rect x="0" y="9" width="16" height="3" fill={colors.waterDark} />
      <rect x="1" y="10" width="14" height="2" fill={colors.water} />

      {/* Splash waves */}
      <rect x="2" y="9" width="2" height="1" fill={colors.white} />
      <rect x="6" y="9" width="1" height="1" fill={colors.white} />
      <rect x="10" y="10" width="2" height="1" fill={colors.white} />

      {/* Ground/deck */}
      <rect x="0" y="12" width="16" height="2" fill={colors.lodging.wood} />
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
