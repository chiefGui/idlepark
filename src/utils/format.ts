export class Format {
  static millify(value: number, decimals = 1): string {
    const absValue = Math.abs(value)
    const sign = value < 0 ? '-' : ''

    if (absValue >= 1_000_000_000) {
      return `${sign}${(absValue / 1_000_000_000).toFixed(decimals)}B`
    }
    if (absValue >= 1_000_000) {
      return `${sign}${(absValue / 1_000_000).toFixed(decimals)}M`
    }
    if (absValue >= 1_000) {
      return `${sign}${(absValue / 1_000).toFixed(decimals)}k`
    }
    return `${sign}${absValue.toFixed(decimals)}`
  }

  static money(value: number): string {
    const absValue = Math.abs(value)
    const sign = value < 0 ? '-' : ''

    if (absValue >= 1_000_000) {
      return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`
    }
    if (absValue >= 10_000) {
      return `${sign}$${(absValue / 1_000).toFixed(1)}k`
    }
    if (absValue >= 1_000) {
      return `${sign}$${(absValue / 1_000).toFixed(2)}k`
    }
    return `${sign}$${Math.floor(absValue)}`
  }

  static guests(value: number): string {
    const absValue = Math.abs(value)

    if (absValue >= 1_000_000) {
      return `${(absValue / 1_000_000).toFixed(1)}M`
    }
    if (absValue >= 1_000) {
      return `${(absValue / 1_000).toFixed(1)}k`
    }
    return Math.floor(absValue).toString()
  }

  static percent(value: number): string {
    return `${Math.floor(value)}%`
  }

  static rate(value: number): string {
    if (value === 0) return '0'
    const sign = value > 0 ? '+' : ''
    const absValue = Math.abs(value)

    if (absValue >= 1_000) {
      return `${sign}${(value / 1_000).toFixed(1)}k`
    }
    if (absValue >= 100) {
      return `${sign}${Math.floor(value)}`
    }
    return `${sign}${value.toFixed(1)}`
  }
}
