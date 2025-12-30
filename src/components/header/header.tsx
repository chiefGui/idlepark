import { RotateCcw } from 'lucide-react'
import { TimeDisplay } from './time-display'
import { useGameStore } from '../../store/game-store'
import { Button } from '../ui/button'

export function Header() {
  const reset = useGameStore((s) => s.actions.reset)
  const gameOver = useGameStore((s) => s.gameOver)

  return (
    <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎢</span>
        <h1 className="text-xl font-bold">Idle Park</h1>
      </div>

      <TimeDisplay />

      <div className="flex items-center gap-2">
        {gameOver && (
          <span className="text-[var(--color-negative)] font-medium mr-2">
            BANKRUPT
          </span>
        )}
        <Button
          variant="secondary"
          onClick={() => {
            if (confirm('Are you sure you want to reset your progress?')) {
              reset()
            }
          }}
          className="flex items-center gap-2"
        >
          <RotateCcw size={16} />
          Reset
        </Button>
      </div>
    </header>
  )
}
