import type { SVGProps } from 'react'

export type IconBaseProps = SVGProps<SVGSVGElement> & {
  size?: number
}

/**
 * Base wrapper for all building icons.
 * Provides consistent sizing and crisp pixel rendering.
 */
export function IconBase({
  size = 32,
  children,
  className = '',
  ...props
}: IconBaseProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        imageRendering: 'pixelated',
        shapeRendering: 'crispEdges',
      }}
      {...props}
    >
      {children}
    </svg>
  )
}

// Color palette for visual consistency
export const colors = {
  // Rides - warm reds/oranges
  rides: {
    primary: '#E54B4B',
    secondary: '#F7A072',
    accent: '#FFD166',
    dark: '#8B2635',
    light: '#FFE4D6',
  },
  // Food - yellows/browns
  food: {
    primary: '#F4A236',
    secondary: '#FFCF56',
    accent: '#8B4513',
    dark: '#5D3A1A',
    light: '#FFF3D6',
  },
  // Facilities - blues/grays
  facilities: {
    primary: '#4A90A4',
    secondary: '#7EC8E3',
    accent: '#2C5F6E',
    dark: '#1E3D47',
    light: '#D6EEF5',
  },
  // Decor - greens
  decor: {
    primary: '#6AB04C',
    secondary: '#A8E6CF',
    accent: '#2D6A4F',
    dark: '#1B4332',
    light: '#D8F3DC',
  },
  // Lodging - purples/browns
  lodging: {
    primary: '#9B5DE5',
    secondary: '#C77DFF',
    accent: '#5A3E7A',
    dark: '#3C2A52',
    light: '#E8D4F8',
    wood: '#8B6914',
    woodDark: '#5D4508',
  },
  // Shops - pinks/magentas
  shops: {
    primary: '#F72585',
    secondary: '#FF85B3',
    accent: '#7209B7',
    dark: '#560BAD',
    light: '#FFD6E8',
  },
  // Common
  white: '#FFFFFF',
  black: '#1A1A2E',
  gray: '#6B7280',
  grayLight: '#9CA3AF',
  grayDark: '#374151',
  metal: '#9CA3AF',
  metalDark: '#6B7280',
  water: '#60A5FA',
  waterDark: '#3B82F6',
}
