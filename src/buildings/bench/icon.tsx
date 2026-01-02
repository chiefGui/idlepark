import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function BenchIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Backrest */}
      <rect x="1" y="4" width="14" height="1" fill={colors.lodging.wood} />
      <rect x="1" y="5" width="14" height="2" fill={colors.lodging.woodDark} />
      <rect x="2" y="5" width="12" height="1" fill={colors.lodging.wood} />

      {/* Seat */}
      <rect x="1" y="8" width="14" height="2" fill={colors.lodging.wood} />
      <rect x="2" y="8" width="12" height="1" fill={colors.lodging.woodDark} />

      {/* Armrests */}
      <rect x="0" y="6" width="2" height="4" fill={colors.metalDark} />
      <rect x="14" y="6" width="2" height="4" fill={colors.metalDark} />
      <rect x="0" y="7" width="2" height="2" fill={colors.metal} />
      <rect x="14" y="7" width="2" height="2" fill={colors.metal} />

      {/* Legs */}
      <rect x="2" y="10" width="2" height="3" fill={colors.metalDark} />
      <rect x="12" y="10" width="2" height="3" fill={colors.metalDark} />
      <rect x="2" y="10" width="1" height="2" fill={colors.metal} />
      <rect x="12" y="10" width="1" height="2" fill={colors.metal} />

      {/* Feet/base */}
      <rect x="1" y="13" width="4" height="1" fill={colors.metalDark} />
      <rect x="11" y="13" width="4" height="1" fill={colors.metalDark} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
