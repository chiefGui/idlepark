import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function PinewoodCabinsIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Chimney */}
      <rect x="10" y="0" width="2" height="3" fill={colors.gray} />
      <rect x="10" y="0" width="1" height="1" fill={colors.grayDark} />

      {/* Roof */}
      <rect x="5" y="2" width="6" height="1" fill={colors.lodging.woodDark} />
      <rect x="3" y="3" width="10" height="1" fill={colors.lodging.woodDark} />
      <rect x="2" y="4" width="12" height="1" fill={colors.lodging.wood} />
      <rect x="1" y="5" width="14" height="1" fill={colors.lodging.wood} />

      {/* Log cabin body */}
      <rect x="2" y="6" width="12" height="7" fill={colors.lodging.wood} />
      <rect x="2" y="7" width="12" height="1" fill={colors.lodging.woodDark} />
      <rect x="2" y="9" width="12" height="1" fill={colors.lodging.woodDark} />
      <rect x="2" y="11" width="12" height="1" fill={colors.lodging.woodDark} />

      {/* Window */}
      <rect x="3" y="7" width="3" height="3" fill={colors.food.light} />
      <rect x="4" y="8" width="1" height="1" fill={colors.water} />
      <rect x="3" y="8" width="1" height="1" fill={colors.lodging.woodDark} />
      <rect x="5" y="8" width="1" height="1" fill={colors.lodging.woodDark} />

      {/* Door */}
      <rect x="9" y="7" width="4" height="6" fill={colors.lodging.woodDark} />
      <rect x="10" y="8" width="2" height="4" fill={colors.lodging.wood} />
      <rect x="11" y="10" width="1" height="1" fill={colors.metal} />

      {/* Porch/deck */}
      <rect x="8" y="12" width="6" height="1" fill={colors.lodging.wood} />

      {/* Tree beside cabin */}
      <rect x="0" y="4" width="2" height="2" fill={colors.decor.primary} />
      <rect x="0" y="6" width="2" height="3" fill={colors.decor.secondary} />
      <rect x="0" y="9" width="1" height="4" fill={colors.lodging.woodDark} />

      {/* Ground */}
      <rect x="0" y="13" width="16" height="3" fill={colors.decor.secondary} />
    </IconBase>
  )
}
