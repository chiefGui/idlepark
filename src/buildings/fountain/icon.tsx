import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function FountainIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Water spray top */}
      <rect x="7" y="0" width="2" height="1" fill={colors.water} />
      <rect x="6" y="1" width="4" height="1" fill={colors.water} />
      <rect x="5" y="2" width="2" height="1" fill={colors.water} />
      <rect x="9" y="2" width="2" height="1" fill={colors.water} />
      <rect x="4" y="3" width="2" height="1" fill={colors.water} />
      <rect x="10" y="3" width="2" height="1" fill={colors.water} />

      {/* Center spout/statue */}
      <rect x="7" y="2" width="2" height="4" fill={colors.gray} />
      <rect x="6" y="5" width="4" height="1" fill={colors.metal} />

      {/* Upper basin */}
      <rect x="4" y="6" width="8" height="2" fill={colors.gray} />
      <rect x="5" y="6" width="6" height="1" fill={colors.water} />
      <rect x="4" y="7" width="1" height="1" fill={colors.metalDark} />
      <rect x="11" y="7" width="1" height="1" fill={colors.metalDark} />

      {/* Water falling */}
      <rect x="3" y="8" width="1" height="2" fill={colors.water} />
      <rect x="12" y="8" width="1" height="2" fill={colors.water} />

      {/* Lower basin */}
      <rect x="2" y="10" width="12" height="2" fill={colors.gray} />
      <rect x="3" y="10" width="10" height="1" fill={colors.water} />
      <rect x="2" y="11" width="1" height="1" fill={colors.metalDark} />
      <rect x="13" y="11" width="1" height="1" fill={colors.metalDark} />

      {/* Pedestal */}
      <rect x="5" y="8" width="6" height="2" fill={colors.metalDark} />

      {/* Base */}
      <rect x="1" y="12" width="14" height="2" fill={colors.gray} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
