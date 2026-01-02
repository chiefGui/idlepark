import { IconBase, colors, type IconBaseProps } from '../icon-base'

export function RestroomIcon(props: IconBaseProps) {
  return (
    <IconBase {...props}>
      {/* Roof */}
      <rect x="2" y="1" width="12" height="2" fill={colors.facilities.primary} />
      <rect x="1" y="3" width="14" height="1" fill={colors.facilities.accent} />

      {/* Building body */}
      <rect x="2" y="4" width="12" height="9" fill={colors.facilities.light} />

      {/* Left door - male symbol area */}
      <rect x="3" y="5" width="4" height="7" fill={colors.facilities.primary} />
      <rect x="4" y="6" width="2" height="5" fill={colors.white} />
      {/* Male figure */}
      <rect x="4" y="6" width="2" height="1" fill={colors.facilities.dark} />
      <rect x="4" y="7" width="2" height="2" fill={colors.facilities.dark} />
      <rect x="4" y="9" width="1" height="2" fill={colors.facilities.dark} />
      <rect x="5" y="9" width="1" height="2" fill={colors.facilities.dark} />

      {/* Right door - female symbol area */}
      <rect x="9" y="5" width="4" height="7" fill={colors.facilities.primary} />
      <rect x="10" y="6" width="2" height="5" fill={colors.white} />
      {/* Female figure */}
      <rect x="10" y="6" width="2" height="1" fill={colors.facilities.dark} />
      <rect x="10" y="7" width="2" height="2" fill={colors.facilities.dark} />
      <rect x="9" y="9" width="4" height="1" fill={colors.facilities.dark} />
      <rect x="10" y="10" width="1" height="1" fill={colors.facilities.dark} />
      <rect x="11" y="10" width="1" height="1" fill={colors.facilities.dark} />

      {/* Divider */}
      <rect x="7" y="4" width="2" height="9" fill={colors.facilities.accent} />

      {/* Base */}
      <rect x="1" y="13" width="14" height="1" fill={colors.grayDark} />

      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill={colors.grayDark} />
    </IconBase>
  )
}
