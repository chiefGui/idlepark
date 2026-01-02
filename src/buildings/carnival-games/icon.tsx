import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function CarnivalGamesIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Tent top - striped carnival style */}
      <rect x="4" y="0" width="8" height="1" fill={colors.shops.primary} />
      <rect x="3" y="1" width="10" height="1" fill={colors.food.secondary} />
      <rect x="2" y="2" width="12" height="1" fill={colors.shops.primary} />
      <rect x="1" y="3" width="14" height="1" fill={colors.food.secondary} />
      <rect x="1" y="4" width="14" height="1" fill={colors.shops.primary} />

      {/* Booth body */}
      <rect x="2" y="5" width="12" height="7" fill={colors.shops.light} />

      {/* Counter */}
      <rect x="2" y="5" width="12" height="1" fill={colors.shops.accent} />

      {/* Game targets - bottles/cans */}
      <rect x="3" y="6" width="2" height="3" fill={colors.facilities.primary} />
      <rect x="4" y="5" width="1" height="1" fill={colors.facilities.primary} />
      <rect x="6" y="6" width="2" height="3" fill={colors.rides.primary} />
      <rect x="7" y="5" width="1" height="1" fill={colors.rides.primary} />
      <rect x="9" y="6" width="2" height="3" fill={colors.decor.primary} />
      <rect x="10" y="5" width="1" height="1" fill={colors.decor.primary} />

      {/* Prize plushies hanging */}
      <rect x="3" y="10" width="2" height="2" fill={colors.food.secondary} />
      <rect x="3" y="9" width="1" height="1" fill={colors.food.secondary} />
      <rect x="7" y="10" width="2" height="2" fill={colors.shops.secondary} />
      <rect x="7" y="9" width="1" height="1" fill={colors.shops.secondary} />
      <rect x="11" y="10" width="2" height="2" fill={colors.facilities.secondary} />
      <rect x="11" y="9" width="1" height="1" fill={colors.facilities.secondary} />

      {/* Poles */}
      <rect x="1" y="4" width="1" height="9" fill={colors.lodging.wood} />
      <rect x="14" y="4" width="1" height="9" fill={colors.lodging.wood} />

      {/* Base */}
      <rect x="0" y="12" width="16" height="2" fill={colors.grayDark} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
