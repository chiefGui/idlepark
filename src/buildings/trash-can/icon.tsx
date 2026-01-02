import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function TrashCanIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Lid top */}
      <rect x="4" y="2" width="8" height="1" fill={colors.facilities.accent} />
      <rect x="5" y="1" width="6" height="1" fill={colors.facilities.primary} />
      <rect x="6" y="0" width="4" height="1" fill={colors.facilities.accent} />

      {/* Swinging lid flap */}
      <rect x="6" y="3" width="4" height="1" fill={colors.facilities.dark} />

      {/* Main bin body */}
      <rect x="4" y="4" width="8" height="8" fill={colors.facilities.primary} />
      <rect x="5" y="4" width="6" height="8" fill={colors.facilities.secondary} />

      {/* Bin ridges/texture */}
      <rect x="4" y="5" width="8" height="1" fill={colors.facilities.accent} />
      <rect x="4" y="8" width="8" height="1" fill={colors.facilities.accent} />
      <rect x="4" y="11" width="8" height="1" fill={colors.facilities.accent} />

      {/* Recycling arrows or logo hint */}
      <rect x="6" y="6" width="4" height="2" fill={colors.decor.primary} />
      <rect x="7" y="6" width="2" height="1" fill={colors.white} />
      <rect x="7" y="7" width="1" height="1" fill={colors.white} />

      {/* Base ring */}
      <rect x="3" y="12" width="10" height="1" fill={colors.facilities.dark} />

      {/* Ground */}
      <rect x="0" y="13" width="16" height="3" fill={colors.grayDark} />
    </IconBase>
  )
}
