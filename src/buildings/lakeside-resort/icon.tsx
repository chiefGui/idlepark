import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function LakesideResortIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Palm tree */}
      <rect x="0" y="2" width="3" height="2" fill={colors.decor.primary} />
      <rect x="0" y="1" width="2" height="1" fill={colors.decor.secondary} />
      <rect x="1" y="4" width="1" height="5" fill={colors.lodging.wood} />

      {/* Main resort building */}
      <rect x="3" y="1" width="12" height="1" fill={colors.lodging.primary} />
      <rect x="3" y="2" width="12" height="1" fill={colors.lodging.secondary} />
      <rect x="4" y="3" width="11" height="7" fill={colors.lodging.light} />

      {/* Windows/balconies - top floor */}
      <rect x="5" y="4" width="2" height="2" fill={colors.water} />
      <rect x="8" y="4" width="2" height="2" fill={colors.water} />
      <rect x="11" y="4" width="2" height="2" fill={colors.water} />

      {/* Windows/balconies - bottom floor */}
      <rect x="5" y="7" width="2" height="2" fill={colors.water} />
      <rect x="11" y="7" width="2" height="2" fill={colors.water} />

      {/* Lobby entrance */}
      <rect x="8" y="7" width="2" height="3" fill={colors.lodging.primary} />
      <rect x="8" y="8" width="2" height="2" fill={colors.lodging.secondary} />

      {/* Beach/sand */}
      <rect x="0" y="10" width="16" height="2" fill={colors.food.secondary} />
      <rect x="0" y="9" width="2" height="1" fill={colors.food.secondary} />

      {/* Water/lake */}
      <rect x="0" y="12" width="16" height="4" fill={colors.water} />
      <rect x="2" y="12" width="3" height="1" fill={colors.waterDark} />
      <rect x="8" y="13" width="4" height="1" fill={colors.waterDark} />

      {/* Beach umbrella */}
      <rect x="2" y="9" width="3" height="1" fill={colors.rides.primary} />
      <rect x="3" y="10" width="1" height="2" fill={colors.lodging.wood} />
    </IconBase>
  )
}
