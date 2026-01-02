import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function FoodStandIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Awning/canopy - striped */}
      <rect x="1" y="1" width="14" height="1" fill={colors.food.primary} />
      <rect x="1" y="2" width="2" height="1" fill={colors.food.secondary} />
      <rect x="3" y="2" width="2" height="1" fill={colors.food.primary} />
      <rect x="5" y="2" width="2" height="1" fill={colors.food.secondary} />
      <rect x="7" y="2" width="2" height="1" fill={colors.food.primary} />
      <rect x="9" y="2" width="2" height="1" fill={colors.food.secondary} />
      <rect x="11" y="2" width="2" height="1" fill={colors.food.primary} />
      <rect x="13" y="2" width="2" height="1" fill={colors.food.secondary} />
      <rect x="2" y="3" width="12" height="1" fill={colors.food.dark} />

      {/* Stand body */}
      <rect x="2" y="4" width="12" height="8" fill={colors.food.light} />
      <rect x="2" y="4" width="1" height="8" fill={colors.food.accent} />
      <rect x="13" y="4" width="1" height="8" fill={colors.food.accent} />

      {/* Counter/window */}
      <rect x="3" y="5" width="10" height="4" fill={colors.food.dark} />
      <rect x="4" y="6" width="8" height="2" fill={colors.black} />

      {/* Menu items displayed */}
      <rect x="5" y="6" width="2" height="2" fill={colors.food.primary} />
      <rect x="6" y="5" width="1" height="1" fill={colors.decor.primary} />
      <rect x="9" y="6" width="2" height="2" fill={colors.food.secondary} />

      {/* Counter shelf */}
      <rect x="3" y="9" width="10" height="1" fill={colors.food.accent} />

      {/* "FOOD" sign or burger icon on top */}
      <rect x="6" y="0" width="4" height="1" fill={colors.food.primary} />
      <rect x="7" y="0" width="2" height="1" fill={colors.food.secondary} />

      {/* Base/ground */}
      <rect x="1" y="12" width="14" height="2" fill={colors.grayDark} />
      <rect x="2" y="12" width="12" height="1" fill={colors.gray} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
