import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function GardenIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Flowers - row 1 */}
      <rect x="2" y="3" width="2" height="2" fill="#FF69B4" />
      <rect x="2" y="2" width="1" height="1" fill="#FF69B4" />
      <rect x="3" y="2" width="1" height="1" fill="#FFB6C1" />
      <rect x="6" y="2" width="2" height="2" fill={colors.food.secondary} />
      <rect x="7" y="1" width="1" height="1" fill={colors.food.primary} />
      <rect x="10" y="3" width="2" height="2" fill="#E6E6FA" />
      <rect x="10" y="2" width="1" height="1" fill="#DDA0DD" />
      <rect x="11" y="2" width="1" height="1" fill="#E6E6FA" />

      {/* Stems */}
      <rect x="2" y="5" width="1" height="3" fill={colors.decor.primary} />
      <rect x="6" y="4" width="1" height="4" fill={colors.decor.primary} />
      <rect x="10" y="5" width="1" height="3" fill={colors.decor.primary} />

      {/* More flowers - row 2 */}
      <rect x="4" y="6" width="2" height="2" fill={colors.rides.secondary} />
      <rect x="4" y="5" width="1" height="1" fill={colors.rides.primary} />
      <rect x="12" y="5" width="2" height="2" fill="#87CEEB" />
      <rect x="13" y="4" width="1" height="1" fill={colors.water} />

      {/* More stems */}
      <rect x="4" y="8" width="1" height="2" fill={colors.decor.primary} />
      <rect x="12" y="7" width="1" height="3" fill={colors.decor.primary} />

      {/* Leaves/bushes base */}
      <rect x="1" y="9" width="14" height="2" fill={colors.decor.primary} />
      <rect x="2" y="8" width="3" height="1" fill={colors.decor.secondary} />
      <rect x="8" y="8" width="4" height="1" fill={colors.decor.secondary} />
      <rect x="1" y="10" width="14" height="1" fill={colors.decor.secondary} />

      {/* Flower bed border */}
      <rect x="0" y="11" width="16" height="2" fill={colors.lodging.wood} />
      <rect x="1" y="11" width="14" height="1" fill={colors.lodging.woodDark} />

      {/* Ground/path */}
      <rect x="0" y="13" width="16" height="3" fill={colors.grayDark} />
    </IconBase>
  )
}
