import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function DrinkStandIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Cup sign on top */}
      <rect x="6" y="0" width="4" height="3" fill={colors.rides.primary} />
      <rect x="7" y="0" width="2" height="1" fill={colors.water} />
      <rect x="7" y="1" width="2" height="1" fill={colors.white} />
      <rect x="5" y="1" width="1" height="1" fill={colors.rides.primary} />
      <rect x="10" y="1" width="1" height="1" fill={colors.rides.primary} />

      {/* Awning - blue theme */}
      <rect x="1" y="3" width="14" height="1" fill={colors.facilities.primary} />
      <rect x="1" y="4" width="2" height="1" fill={colors.white} />
      <rect x="3" y="4" width="2" height="1" fill={colors.facilities.primary} />
      <rect x="5" y="4" width="2" height="1" fill={colors.white} />
      <rect x="7" y="4" width="2" height="1" fill={colors.facilities.primary} />
      <rect x="9" y="4" width="2" height="1" fill={colors.white} />
      <rect x="11" y="4" width="2" height="1" fill={colors.facilities.primary} />
      <rect x="13" y="4" width="2" height="1" fill={colors.white} />

      {/* Stand body */}
      <rect x="2" y="5" width="12" height="7" fill={colors.facilities.light} />
      <rect x="2" y="5" width="1" height="7" fill={colors.facilities.accent} />
      <rect x="13" y="5" width="1" height="7" fill={colors.facilities.accent} />

      {/* Counter window */}
      <rect x="3" y="6" width="10" height="4" fill={colors.facilities.dark} />
      <rect x="4" y="7" width="8" height="2" fill={colors.black} />

      {/* Drink cups display */}
      <rect x="4" y="7" width="2" height="2" fill={colors.rides.primary} />
      <rect x="4" y="7" width="1" height="1" fill={colors.water} />
      <rect x="7" y="7" width="2" height="2" fill={colors.food.primary} />
      <rect x="7" y="7" width="1" height="1" fill={colors.food.secondary} />
      <rect x="10" y="7" width="2" height="2" fill={colors.decor.primary} />
      <rect x="10" y="7" width="1" height="1" fill={colors.decor.secondary} />

      {/* Counter */}
      <rect x="3" y="10" width="10" height="1" fill={colors.facilities.accent} />

      {/* Base */}
      <rect x="1" y="12" width="14" height="2" fill={colors.grayDark} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
