import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function PizzaParlorIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Pizza slice sign on top */}
      <rect x="6" y="0" width="4" height="2" fill={colors.food.secondary} />
      <rect x="7" y="0" width="2" height="1" fill={colors.rides.primary} />
      <rect x="7" y="1" width="1" height="1" fill={colors.rides.primary} />

      {/* Awning - red/white Italian style */}
      <rect x="1" y="2" width="14" height="1" fill={colors.rides.primary} />
      <rect x="1" y="3" width="2" height="1" fill={colors.white} />
      <rect x="3" y="3" width="2" height="1" fill={colors.rides.primary} />
      <rect x="5" y="3" width="2" height="1" fill={colors.white} />
      <rect x="7" y="3" width="2" height="1" fill={colors.rides.primary} />
      <rect x="9" y="3" width="2" height="1" fill={colors.white} />
      <rect x="11" y="3" width="2" height="1" fill={colors.rides.primary} />
      <rect x="13" y="3" width="2" height="1" fill={colors.white} />

      {/* Building body */}
      <rect x="2" y="4" width="12" height="8" fill={colors.food.light} />
      <rect x="2" y="4" width="1" height="8" fill={colors.rides.dark} />
      <rect x="13" y="4" width="1" height="8" fill={colors.rides.dark} />

      {/* Window */}
      <rect x="3" y="5" width="10" height="5" fill={colors.food.dark} />
      <rect x="4" y="6" width="8" height="3" fill={colors.black} />

      {/* Pizza in oven glow */}
      <rect x="5" y="6" width="6" height="3" fill={colors.food.primary} />
      <rect x="6" y="7" width="4" height="1" fill={colors.food.secondary} />
      <rect x="7" y="7" width="1" height="1" fill={colors.rides.primary} />
      <rect x="9" y="7" width="1" height="1" fill={colors.rides.primary} />

      {/* Counter */}
      <rect x="3" y="10" width="10" height="1" fill={colors.food.accent} />

      {/* Base */}
      <rect x="1" y="12" width="14" height="2" fill={colors.grayDark} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
