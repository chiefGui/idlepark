import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function ParkviewInnIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Sign on top */}
      <rect x="5" y="0" width="6" height="2" fill={colors.lodging.primary} />
      <rect x="6" y="0" width="4" height="1" fill={colors.food.secondary} />

      {/* Roof */}
      <rect x="1" y="2" width="14" height="1" fill={colors.lodging.accent} />
      <rect x="2" y="3" width="12" height="1" fill={colors.lodging.primary} />

      {/* Main building */}
      <rect x="2" y="4" width="12" height="9" fill={colors.lodging.light} />
      <rect x="2" y="4" width="1" height="9" fill={colors.lodging.primary} />
      <rect x="13" y="4" width="1" height="9" fill={colors.lodging.primary} />

      {/* Windows - row 1 */}
      <rect x="3" y="5" width="2" height="2" fill={colors.water} />
      <rect x="6" y="5" width="2" height="2" fill={colors.water} />
      <rect x="9" y="5" width="2" height="2" fill={colors.water} />

      {/* Windows - row 2 */}
      <rect x="3" y="8" width="2" height="2" fill={colors.water} />
      <rect x="9" y="8" width="2" height="2" fill={colors.water} />

      {/* Main entrance */}
      <rect x="5" y="8" width="4" height="5" fill={colors.lodging.primary} />
      <rect x="6" y="9" width="2" height="3" fill={colors.lodging.secondary} />
      <rect x="8" y="10" width="1" height="1" fill={colors.metal} />

      {/* Canopy over entrance */}
      <rect x="4" y="8" width="6" height="1" fill={colors.lodging.accent} />

      {/* Ground floor */}
      <rect x="1" y="12" width="14" height="1" fill={colors.gray} />

      {/* Ground */}
      <rect x="0" y="13" width="16" height="3" fill={colors.grayDark} />

      {/* Bushes */}
      <rect x="0" y="11" width="2" height="2" fill={colors.decor.primary} />
      <rect x="12" y="11" width="3" height="2" fill={colors.decor.primary} />
    </IconBase>
  )
}
