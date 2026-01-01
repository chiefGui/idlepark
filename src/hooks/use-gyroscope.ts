import { useState, useEffect, useCallback } from 'react'

type GyroscopeOffset = { x: number; y: number }

const MAX_OFFSET = 12 // Maximum pixels of parallax movement
const SMOOTHING = 0.15 // Lower = smoother but laggier

/**
 * Hook that returns parallax offset based on device orientation.
 * Returns { x: 0, y: 0 } on devices without gyroscope.
 */
export function useGyroscope(): GyroscopeOffset {
  const [offset, setOffset] = useState<GyroscopeOffset>({ x: 0, y: 0 })
  const [target, setTarget] = useState<GyroscopeOffset>({ x: 0, y: 0 })

  // Handle device orientation
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const gamma = event.gamma ?? 0 // Left/right tilt (-90 to 90)
    const beta = event.beta ?? 0 // Front/back tilt (-180 to 180)

    // Normalize to -1 to 1 range, clamp for usability
    const normalizedX = Math.max(-1, Math.min(1, gamma / 30))
    const normalizedY = Math.max(-1, Math.min(1, (beta - 45) / 30)) // Offset for natural holding angle

    setTarget({
      x: normalizedX * MAX_OFFSET,
      y: normalizedY * MAX_OFFSET,
    })
  }, [])

  // Smooth interpolation for buttery movement
  useEffect(() => {
    let animationId: number

    const animate = () => {
      setOffset((prev) => ({
        x: prev.x + (target.x - prev.x) * SMOOTHING,
        y: prev.y + (target.y - prev.y) * SMOOTHING,
      }))
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [target])

  // Setup orientation listener
  useEffect(() => {
    // Check if device orientation is supported
    if (typeof DeviceOrientationEvent === 'undefined') return

    // iOS 13+ requires permission
    const requestPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        'requestPermission' in DeviceOrientationEvent &&
        typeof (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission === 'function'
      ) {
        try {
          const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation)
          }
        } catch {
          // Permission denied or error, silently fail
        }
      } else {
        // Non-iOS or older iOS, just add listener
        window.addEventListener('deviceorientation', handleOrientation)
      }
    }

    requestPermission()

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [handleOrientation])

  return offset
}
