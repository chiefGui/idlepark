import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function CleaningCartIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Mop/broom handles sticking up */}
      <rect x="3" y="0" width="1" height="6" fill={colors.lodging.wood} />
      <rect x="5" y="1" width="1" height="5" fill={colors.lodging.wood} />
      <rect x="2" y="0" width="2" height="2" fill={colors.gray} />
      <rect x="5" y="0" width="2" height="2" fill={colors.facilities.secondary} />

      {/* Cart body */}
      <rect x="1" y="6" width="12" height="6" fill={colors.facilities.primary} />
      <rect x="2" y="6" width="10" height="5" fill={colors.facilities.secondary} />

      {/* Bucket section */}
      <rect x="2" y="7" width="4" height="4" fill={colors.facilities.dark} />
      <rect x="3" y="8" width="2" height="2" fill={colors.water} />

      {/* Supplies section */}
      <rect x="7" y="7" width="4" height="4" fill={colors.facilities.light} />
      <rect x="8" y="8" width="1" height="2" fill={colors.food.secondary} />
      <rect x="9" y="8" width="1" height="2" fill={colors.decor.primary} />

      {/* Handle */}
      <rect x="12" y="4" width="2" height="8" fill={colors.metal} />
      <rect x="12" y="3" width="3" height="2" fill={colors.metalDark} />

      {/* Wheels */}
      <rect x="2" y="12" width="2" height="2" fill={colors.black} />
      <rect x="10" y="12" width="2" height="2" fill={colors.black} />
      <rect x="3" y="12" width="1" height="1" fill={colors.gray} />
      <rect x="11" y="12" width="1" height="1" fill={colors.gray} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
