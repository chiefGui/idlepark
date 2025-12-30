import { useGameLoop } from '../hooks/use-game-loop'
import { Header } from './header/header'
import { StatsPanel } from './stats/stats-panel'
import { SlotsPanel } from './slots/slots-panel'
import { PerksPanel } from './perks/perks-panel'
import { MilestonesPanel } from './milestones/milestones-panel'

export function Game() {
  useGameLoop()

  return (
    <div className="h-full flex flex-col">
      <Header />

      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <SlotsPanel />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PerksPanel />
              <MilestonesPanel />
            </div>
          </div>

          <div className="space-y-4">
            <StatsPanel />
          </div>
        </div>
      </main>
    </div>
  )
}
