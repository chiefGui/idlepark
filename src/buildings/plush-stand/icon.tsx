import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function PlushStandIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Awning */}
      <rect x="1" y="1" width="14" height="1" fill={colors.shops.primary} />
      <rect x="1" y="2" width="2" height="1" fill={colors.shops.secondary} />
      <rect x="3" y="2" width="2" height="1" fill={colors.shops.primary} />
      <rect x="5" y="2" width="2" height="1" fill={colors.shops.secondary} />
      <rect x="7" y="2" width="2" height="1" fill={colors.shops.primary} />
      <rect x="9" y="2" width="2" height="1" fill={colors.shops.secondary} />
      <rect x="11" y="2" width="2" height="1" fill={colors.shops.primary} />
      <rect x="13" y="2" width="2" height="1" fill={colors.shops.secondary} />

      {/* Stand body */}
      <rect x="2" y="3" width="12" height="9" fill={colors.shops.light} />
      <rect x="2" y="3" width="1" height="9" fill={colors.shops.primary} />
      <rect x="13" y="3" width="1" height="9" fill={colors.shops.primary} />

      {/* Plush display - teddy bears */}
      <rect x="3" y="4" width="3" height="3" fill={colors.food.primary} />
      <rect x="4" y="3" width="1" height="1" fill={colors.food.primary} />
      <rect x="4" y="5" width="1" height="1" fill={colors.black} />

      <rect x="7" y="4" width="3" height="3" fill={colors.shops.secondary} />
      <rect x="8" y="3" width="1" height="1" fill={colors.shops.secondary} />
      <rect x="8" y="5" width="1" height="1" fill={colors.black} />

      <rect x="11" y="4" width="2" height="3" fill={colors.facilities.secondary} />
      <rect x="11" y="3" width="1" height="1" fill={colors.facilities.secondary} />
      <rect x="11" y="5" width="1" height="1" fill={colors.black} />

      {/* More plushies - row 2 */}
      <rect x="4" y="8" width="2" height="2" fill={colors.decor.primary} />
      <rect x="4" y="7" width="1" height="1" fill={colors.decor.primary} />
      <rect x="8" y="8" width="2" height="2" fill={colors.rides.secondary} />
      <rect x="8" y="7" width="1" height="1" fill={colors.rides.secondary} />

      {/* Counter */}
      <rect x="2" y="10" width="12" height="1" fill={colors.shops.accent} />

      {/* Base */}
      <rect x="1" y="11" width="14" height="2" fill={colors.grayDark} />

      {/* Ground */}
      <rect x="0" y="13" width="16" height="3" fill={colors.grayDark} />
    </IconBase>
  )
}
