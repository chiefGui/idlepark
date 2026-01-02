import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function CampgroundIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Stars in sky */}
      <rect x="2" y="1" width="1" height="1" fill={colors.food.secondary} />
      <rect x="12" y="0" width="1" height="1" fill={colors.food.secondary} />
      <rect x="7" y="2" width="1" height="1" fill={colors.food.secondary} />

      {/* Tent 1 (main) */}
      <rect x="4" y="5" width="8" height="1" fill={colors.lodging.primary} />
      <rect x="3" y="6" width="10" height="1" fill={colors.lodging.primary} />
      <rect x="2" y="7" width="12" height="1" fill={colors.lodging.secondary} />
      <rect x="1" y="8" width="14" height="1" fill={colors.lodging.secondary} />
      <rect x="1" y="9" width="14" height="2" fill={colors.lodging.primary} />

      {/* Tent opening */}
      <rect x="6" y="8" width="4" height="3" fill={colors.lodging.accent} />
      <rect x="7" y="8" width="2" height="2" fill={colors.black} />

      {/* Tent pole top */}
      <rect x="7" y="3" width="2" height="2" fill={colors.lodging.wood} />
      <rect x="7" y="4" width="1" height="1" fill={colors.lodging.primary} />

      {/* Campfire */}
      <rect x="13" y="10" width="2" height="1" fill={colors.rides.primary} />
      <rect x="13" y="9" width="1" height="1" fill={colors.food.primary} />
      <rect x="14" y="8" width="1" height="1" fill={colors.food.secondary} />

      {/* Logs */}
      <rect x="12" y="11" width="3" height="1" fill={colors.lodging.woodDark} />

      {/* Ground */}
      <rect x="0" y="11" width="12" height="1" fill={colors.decor.primary} />
      <rect x="0" y="12" width="16" height="4" fill={colors.decor.secondary} />
    </IconBase>
  )
}
