import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function ArcadeIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Neon "ARCADE" sign */}
      <rect x="3" y="0" width="10" height="2" fill={colors.black} />
      <rect x="4" y="0" width="8" height="1" fill={colors.shops.primary} />
      <rect x="5" y="1" width="6" height="1" fill={colors.shops.secondary} />

      {/* Building body */}
      <rect x="1" y="2" width="14" height="11" fill={colors.black} />

      {/* Glowing entrance */}
      <rect x="2" y="2" width="12" height="1" fill={colors.shops.primary} />

      {/* Arcade cabinet 1 */}
      <rect x="2" y="4" width="4" height="6" fill={colors.shops.dark} />
      <rect x="3" y="5" width="2" height="3" fill={colors.facilities.primary} />
      <rect x="3" y="6" width="1" height="1" fill={colors.food.secondary} />
      <rect x="4" y="6" width="1" height="1" fill={colors.shops.primary} />
      <rect x="3" y="8" width="2" height="1" fill={colors.black} />

      {/* Arcade cabinet 2 */}
      <rect x="7" y="4" width="3" height="6" fill={colors.shops.dark} />
      <rect x="7" y="5" width="3" height="3" fill={colors.decor.primary} />
      <rect x="8" y="6" width="1" height="1" fill={colors.food.secondary} />
      <rect x="7" y="8" width="3" height="1" fill={colors.black} />

      {/* Arcade cabinet 3 */}
      <rect x="11" y="4" width="3" height="6" fill={colors.shops.dark} />
      <rect x="11" y="5" width="3" height="3" fill={colors.rides.primary} />
      <rect x="12" y="6" width="1" height="1" fill={colors.white} />
      <rect x="11" y="8" width="3" height="1" fill={colors.black} />

      {/* Floor with glow */}
      <rect x="1" y="10" width="14" height="1" fill={colors.shops.accent} />

      {/* Neon trim */}
      <rect x="1" y="3" width="1" height="10" fill={colors.shops.primary} />
      <rect x="14" y="3" width="1" height="10" fill={colors.shops.secondary} />

      {/* Entry */}
      <rect x="6" y="11" width="4" height="2" fill={colors.shops.dark} />
      <rect x="7" y="11" width="2" height="2" fill={colors.shops.accent} />

      {/* Ground */}
      <rect x="0" y="13" width="16" height="3" fill={colors.grayDark} />
    </IconBase>
  )
}
