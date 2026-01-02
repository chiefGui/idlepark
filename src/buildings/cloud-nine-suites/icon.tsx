import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function CloudNineSuitesIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Clouds in background */}
      <rect x="1" y="1" width="3" height="1" fill={colors.white} />
      <rect x="0" y="2" width="4" height="1" fill={colors.white} />
      <rect x="11" y="0" width="4" height="1" fill={colors.white} />
      <rect x="12" y="1" width="3" height="1" fill={colors.white} />

      {/* Luxury tower building */}
      <rect x="4" y="2" width="8" height="1" fill={colors.lodging.primary} />
      <rect x="4" y="3" width="8" height="10" fill={colors.lodging.light} />
      <rect x="4" y="3" width="1" height="10" fill={colors.lodging.secondary} />
      <rect x="11" y="3" width="1" height="10" fill={colors.lodging.secondary} />

      {/* Penthouse top */}
      <rect x="5" y="2" width="6" height="1" fill={colors.lodging.accent} />

      {/* Windows - luxury floor pattern */}
      <rect x="5" y="4" width="2" height="2" fill={colors.water} />
      <rect x="9" y="4" width="2" height="2" fill={colors.water} />
      <rect x="5" y="7" width="2" height="2" fill={colors.water} />
      <rect x="9" y="7" width="2" height="2" fill={colors.water} />

      {/* Gold accents */}
      <rect x="7" y="4" width="2" height="1" fill={colors.food.secondary} />
      <rect x="7" y="7" width="2" height="1" fill={colors.food.secondary} />

      {/* Grand entrance */}
      <rect x="6" y="10" width="4" height="3" fill={colors.lodging.primary} />
      <rect x="7" y="10" width="2" height="3" fill={colors.food.secondary} />
      <rect x="7" y="11" width="2" height="2" fill={colors.lodging.accent} />

      {/* Columns */}
      <rect x="5" y="10" width="1" height="3" fill={colors.white} />
      <rect x="10" y="10" width="1" height="3" fill={colors.white} />

      {/* Fountain in front */}
      <rect x="1" y="11" width="3" height="2" fill={colors.gray} />
      <rect x="2" y="10" width="1" height="1" fill={colors.water} />
      <rect x="2" y="11" width="1" height="1" fill={colors.water} />

      {/* Ground/plaza */}
      <rect x="0" y="13" width="16" height="3" fill={colors.gray} />
      <rect x="3" y="13" width="10" height="1" fill={colors.grayLight} />
    </IconBase>
  )
}
