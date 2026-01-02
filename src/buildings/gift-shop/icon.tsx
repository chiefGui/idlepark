import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function GiftShopIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Gift box sign on top */}
      <rect x="5" y="0" width="6" height="3" fill={colors.shops.primary} />
      <rect x="7" y="0" width="2" height="3" fill={colors.shops.secondary} />
      <rect x="5" y="1" width="6" height="1" fill={colors.shops.secondary} />
      <rect x="6" y="0" width="1" height="1" fill={colors.food.secondary} />
      <rect x="9" y="0" width="1" height="1" fill={colors.food.secondary} />

      {/* Roof */}
      <rect x="1" y="3" width="14" height="1" fill={colors.shops.primary} />
      <rect x="2" y="4" width="12" height="1" fill={colors.shops.secondary} />

      {/* Shop body */}
      <rect x="2" y="5" width="12" height="8" fill={colors.shops.light} />
      <rect x="2" y="5" width="1" height="8" fill={colors.shops.primary} />
      <rect x="13" y="5" width="1" height="8" fill={colors.shops.primary} />

      {/* Display window */}
      <rect x="3" y="6" width="10" height="4" fill={colors.water} />

      {/* Items in window */}
      <rect x="4" y="7" width="2" height="2" fill={colors.shops.primary} />
      <rect x="5" y="7" width="1" height="1" fill={colors.food.secondary} />
      <rect x="7" y="7" width="2" height="3" fill={colors.lodging.primary} />
      <rect x="10" y="7" width="2" height="2" fill={colors.decor.primary} />

      {/* Door */}
      <rect x="6" y="10" width="4" height="3" fill={colors.shops.accent} />
      <rect x="7" y="11" width="2" height="2" fill={colors.shops.primary} />
      <rect x="9" y="12" width="1" height="1" fill={colors.metal} />

      {/* Base */}
      <rect x="1" y="13" width="14" height="1" fill={colors.grayDark} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
