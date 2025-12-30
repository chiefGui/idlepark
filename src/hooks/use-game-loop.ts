import { useEffect, useRef } from 'react'
import { GameTypes } from '../engine/game-types'
import { useGameStore } from '../store/game-store'

export function useGameLoop() {
  const tick = useGameStore((s) => s.actions.tick)
  const gameOver = useGameStore((s) => s.gameOver)
  const lastTimeRef = useRef(performance.now())

  useEffect(() => {
    if (gameOver) return

    let animationId: number

    const loop = (currentTime: number) => {
      const elapsed = currentTime - lastTimeRef.current
      const deltaDay = elapsed / GameTypes.DAY_LENGTH_MS

      if (deltaDay > 0) {
        tick(deltaDay)
        lastTimeRef.current = currentTime
      }

      animationId = requestAnimationFrame(loop)
    }

    lastTimeRef.current = performance.now()
    animationId = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(animationId)
  }, [tick, gameOver])
}
