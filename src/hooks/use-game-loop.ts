import { useEffect, useRef } from 'react'
import { GameTypes } from '../engine/game-types'
import { useGameStore } from '../store/game-store'

export function useGameLoop() {
  const tick = useGameStore((s) => s.actions.tick)
  const gameOver = useGameStore((s) => s.gameOver)
  const lastTimeRef = useRef(0)

  useEffect(() => {
    if (gameOver) return

    let animationId: number
    lastTimeRef.current = performance.now()

    const loop = (currentTime: number) => {
      const elapsed = currentTime - lastTimeRef.current
      const deltaDay = elapsed / GameTypes.DAY_LENGTH_MS

      if (deltaDay > 0) {
        tick(deltaDay)
        lastTimeRef.current = currentTime
      }

      animationId = requestAnimationFrame(loop)
    }

    animationId = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(animationId)
  }, [tick, gameOver])
}
